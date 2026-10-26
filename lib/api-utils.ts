import { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";
import { GeminiError, friendlyGeminiErrorMessage } from "@/lib/gemini";

export async function parseRequestBody<T>(
  req: NextRequest,
  schema: z.ZodType<T>
): Promise<{ data: T } | { error: NextResponse }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { error: NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }) };
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    return {
      error: NextResponse.json(
        { error: "Request didn't match the expected shape.", details: result.error.flatten() },
        { status: 400 }
      ),
    };
  }
  return { data: result.data };
}

export function geminiErrorResponse(err: unknown): NextResponse {
  const message = friendlyGeminiErrorMessage(err);
  const status = err instanceof GeminiError && err.code === "missing_key" ? 501 : 502;
  return NextResponse.json({ error: message }, { status });
}
