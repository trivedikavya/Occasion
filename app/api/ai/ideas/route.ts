import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { EventSchema } from "@/types/event";
import { StyleProfileSchema } from "@/types/styleProfile";
import { IdeaTypeSchema } from "@/types/idea";
import { IdeasResultSchema } from "@/lib/schemas/ai";
import { generateJson } from "@/lib/gemini";
import { mockIdeas } from "@/lib/gemini-mock";
import { buildIdeasSystemPrompt, buildIdeasUserPrompt } from "@/lib/prompts/ideas";
import { parseRequestBody, geminiErrorResponse } from "@/lib/api-utils";

export const runtime = "nodejs";

const RequestSchema = z.object({
  event: EventSchema,
  styleProfile: StyleProfileSchema,
  focus: z.array(IdeaTypeSchema).optional(),
});

export async function POST(req: NextRequest) {
  const parsed = await parseRequestBody(req, RequestSchema);
  if ("error" in parsed) return parsed.error;
  const { event, styleProfile, focus } = parsed.data;

  try {
    const result = await generateJson({
      systemPrompt: buildIdeasSystemPrompt(),
      userPrompt: buildIdeasUserPrompt(event, styleProfile, focus),
      schema: IdeasResultSchema,
      mock: () => mockIdeas(event, focus),
    });
    return NextResponse.json(result);
  } catch (err) {
    return geminiErrorResponse(err);
  }
}
