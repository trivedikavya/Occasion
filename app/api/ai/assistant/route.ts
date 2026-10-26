import { NextRequest } from "next/server";
import { z } from "zod";
import { EventSchema } from "@/types/event";
import { StyleProfileSchema } from "@/types/styleProfile";
import { AssistantPayloadSchema } from "@/lib/schemas/ai";
import { streamText, generateJson, GeminiError } from "@/lib/gemini";
import { mockAssistantReply } from "@/lib/gemini-mock";
import { buildAssistantSystemPrompt, PROPOSALS_MARKER } from "@/lib/prompts/assistant";
import { PROPOSALS_SENTINEL } from "@/lib/assistant-protocol";
import { parseRequestBody } from "@/lib/api-utils";

export const runtime = "nodejs";

const RequestSchema = z.object({
  event: EventSchema,
  styleProfile: StyleProfileSchema,
  message: z.string().min(1).max(4000),
  history: z
    .array(z.object({ role: z.enum(["user", "model"]), text: z.string() }))
    .max(40)
    .default([]),
});

function extractJson(text: string): unknown {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```(json)?/i, "")
      .replace(/```$/, "")
      .trim();
  }
  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const parsed = await parseRequestBody(req, RequestSchema);
  if ("error" in parsed) return parsed.error;
  const { event, styleProfile, message, history } = parsed.data;

  const systemPrompt = buildAssistantSystemPrompt(event, styleProfile);
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let full = "";
      let emitted = 0;
      let markerIndex = -1;

      function flush(upto: number) {
        if (upto > emitted) {
          controller.enqueue(encoder.encode(full.slice(emitted, upto)));
          emitted = upto;
        }
      }

      try {
        const source = streamText({ systemPrompt, history, userPrompt: message }, () => {
          const { reply, payload } = mockAssistantReply(event, message);
          return payload.proposals.length > 0
            ? `${reply}\n${PROPOSALS_MARKER}\n${JSON.stringify(payload)}`
            : reply;
        });

        for await (const chunk of source) {
          full += chunk;
          if (markerIndex === -1) {
            const searchFrom = Math.max(0, emitted - PROPOSALS_MARKER.length);
            const idx = full.indexOf(PROPOSALS_MARKER, searchFrom);
            if (idx !== -1) {
              markerIndex = idx;
              flush(idx);
            } else {
              const holdBack = PROPOSALS_MARKER.length - 1;
              flush(Math.max(emitted, full.length - holdBack));
            }
          }
        }

        if (markerIndex === -1) {
          flush(full.length);
        }

        let payload: { proposals: unknown[] } = { proposals: [] };
        if (markerIndex !== -1) {
          const tail = full.slice(markerIndex + PROPOSALS_MARKER.length).trim();
          const candidate = extractJson(tail);
          const validated = candidate ? AssistantPayloadSchema.safeParse(candidate) : null;
          if (validated?.success) {
            payload = validated.data;
          } else {
            try {
              payload = await generateJson({
                systemPrompt,
                userPrompt: `The user's last message was: "${message}". Based only on that message and the context already given in the system prompt, output the proposals JSON object. If nothing in that message implies a concrete change, return {"proposals": []}.`,
                schema: AssistantPayloadSchema,
                mock: () => mockAssistantReply(event, message).payload,
              });
            } catch {
              payload = { proposals: [] };
            }
          }
        }

        controller.enqueue(encoder.encode(`${PROPOSALS_SENTINEL}${JSON.stringify(payload)}`));
      } catch (err) {
        const errMessage =
          err instanceof GeminiError ? err.message : "Something went wrong talking to Gemini.";
        controller.enqueue(
          encoder.encode(`${PROPOSALS_SENTINEL}${JSON.stringify({ proposals: [], error: errMessage })}`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
