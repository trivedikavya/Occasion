import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { EventSchema } from "@/types/event";
import { VendorSchema } from "@/types/vendor";
import { StyleProfileSchema } from "@/types/styleProfile";
import { VendorMessageResultSchema } from "@/lib/schemas/ai";
import { generateJson } from "@/lib/gemini";
import { mockVendorQuoteMessage } from "@/lib/gemini-mock";
import {
  buildVendorQuoteMessageSystemPrompt,
  buildVendorQuoteMessageUserPrompt,
} from "@/lib/prompts/vendor";
import { parseRequestBody, geminiErrorResponse } from "@/lib/api-utils";

export const runtime = "nodejs";

const RequestSchema = z.object({
  event: EventSchema,
  vendor: VendorSchema,
  styleProfile: StyleProfileSchema,
});

export async function POST(req: NextRequest) {
  const parsed = await parseRequestBody(req, RequestSchema);
  if ("error" in parsed) return parsed.error;
  const { event, vendor, styleProfile } = parsed.data;

  try {
    const result = await generateJson({
      systemPrompt: buildVendorQuoteMessageSystemPrompt(),
      userPrompt: buildVendorQuoteMessageUserPrompt(event, vendor, styleProfile),
      schema: VendorMessageResultSchema,
      mock: () => mockVendorQuoteMessage(event, vendor),
    });
    return NextResponse.json(result);
  } catch (err) {
    return geminiErrorResponse(err);
  }
}
