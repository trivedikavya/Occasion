import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { EventSchema } from "@/types/event";
import { StyleProfileSchema } from "@/types/styleProfile";
import { QuickCaptureResultSchema } from "@/lib/schemas/ai";
import { generateJson } from "@/lib/gemini";
import { mockQuickCapture } from "@/lib/gemini-mock";
import { buildQuickCaptureSystemPrompt, buildQuickCaptureUserPrompt } from "@/lib/prompts/quick-capture";
import { parseRequestBody, geminiErrorResponse, checkRateLimit, rateLimitResponse } from "@/lib/api-utils";

export const runtime = "nodejs";

const RequestSchema = z.object({
  event: EventSchema,
  styleProfile: StyleProfileSchema,
  note: z.string().min(1, "Note can't be empty.").max(5000),
});

export async function POST(req: NextRequest) {
  const rateLimit = checkRateLimit(req);
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfterSeconds);

  const parsed = await parseRequestBody(req, RequestSchema);
  if ("error" in parsed) return parsed.error;
  const { event, styleProfile, note } = parsed.data;

  try {
    const result = await generateJson({
      systemPrompt: buildQuickCaptureSystemPrompt(),
      userPrompt: buildQuickCaptureUserPrompt(event, styleProfile, note),
      schema: QuickCaptureResultSchema,
      mock: () => mockQuickCapture(event, note),
    });
    return NextResponse.json(result);
  } catch (err) {
    return geminiErrorResponse(err);
  }
}
