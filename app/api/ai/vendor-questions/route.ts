import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { EventSchema } from "@/types/event";
import { VendorSchema } from "@/types/vendor";
import { VendorQuestionsResultSchema } from "@/lib/schemas/ai";
import { generateJson } from "@/lib/gemini";
import { mockVendorQuestions } from "@/lib/gemini-mock";
import {
  buildVendorQuestionsSystemPrompt,
  buildVendorQuestionsUserPrompt,
} from "@/lib/prompts/vendor";
import { parseRequestBody, geminiErrorResponse } from "@/lib/api-utils";

export const runtime = "nodejs";

const RequestSchema = z.object({
  event: EventSchema,
  vendor: VendorSchema,
});

export async function POST(req: NextRequest) {
  const parsed = await parseRequestBody(req, RequestSchema);
  if ("error" in parsed) return parsed.error;
  const { event, vendor } = parsed.data;

  try {
    const result = await generateJson({
      systemPrompt: buildVendorQuestionsSystemPrompt(),
      userPrompt: buildVendorQuestionsUserPrompt(event, vendor),
      schema: VendorQuestionsResultSchema,
      mock: () => mockVendorQuestions(vendor),
    });
    return NextResponse.json(result);
  } catch (err) {
    return geminiErrorResponse(err);
  }
}
