import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { EventSchema } from "@/types/event";
import { StyleProfileSchema, DraftFormatSchema } from "@/types/styleProfile";
import { DraftResultSchema } from "@/lib/schemas/ai";
import { generateJson } from "@/lib/gemini";
import { mockDraft } from "@/lib/gemini-mock";
import { buildDraftSystemPrompt, buildDraftUserPrompt } from "@/lib/prompts/draft";
import { parseRequestBody, geminiErrorResponse, checkRateLimit, rateLimitResponse } from "@/lib/api-utils";

export const runtime = "nodejs";

const RequestSchema = z.object({
  format: DraftFormatSchema,
  styleProfile: StyleProfileSchema,
  roughNote: z.string().min(1, "Enter a rough note first.").max(3000),
  event: EventSchema.optional(),
});

export async function POST(req: NextRequest) {
  const rateLimit = checkRateLimit(req);
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfterSeconds);

  const parsed = await parseRequestBody(req, RequestSchema);
  if ("error" in parsed) return parsed.error;
  const { format, styleProfile, roughNote, event } = parsed.data;

  try {
    const result = await generateJson({
      systemPrompt: buildDraftSystemPrompt(format),
      userPrompt: buildDraftUserPrompt(format, styleProfile, roughNote, event),
      schema: DraftResultSchema,
      mock: () => mockDraft(format, roughNote),
    });
    return NextResponse.json(result);
  } catch (err) {
    return geminiErrorResponse(err);
  }
}
