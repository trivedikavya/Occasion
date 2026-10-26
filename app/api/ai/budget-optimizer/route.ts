import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { EventSchema } from "@/types/event";
import { StyleProfileSchema } from "@/types/styleProfile";
import { BudgetOptimizerResultSchema } from "@/lib/schemas/ai";
import { generateJson } from "@/lib/gemini";
import { mockBudgetOptimizer } from "@/lib/gemini-mock";
import {
  buildBudgetOptimizerSystemPrompt,
  buildBudgetOptimizerUserPrompt,
} from "@/lib/prompts/budget-optimizer";
import { parseRequestBody, geminiErrorResponse } from "@/lib/api-utils";

export const runtime = "nodejs";

const RequestSchema = z.object({
  event: EventSchema,
  styleProfile: StyleProfileSchema,
});

export async function POST(req: NextRequest) {
  const parsed = await parseRequestBody(req, RequestSchema);
  if ("error" in parsed) return parsed.error;
  const { event, styleProfile } = parsed.data;

  try {
    const result = await generateJson({
      systemPrompt: buildBudgetOptimizerSystemPrompt(),
      userPrompt: buildBudgetOptimizerUserPrompt(event, styleProfile),
      schema: BudgetOptimizerResultSchema,
      mock: () => mockBudgetOptimizer(event),
    });
    return NextResponse.json(result);
  } catch (err) {
    return geminiErrorResponse(err);
  }
}
