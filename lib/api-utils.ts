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

/* ---------------------------------------------------------------------- */
/* Lightweight per-IP rate limiting for the AI routes.                     */
/*                                                                          */
/* This is an in-memory sliding-window limiter: fine for a single-instance */
/* deployment (incl. local/demo use), but it resets on cold start and      */
/* doesn't share state across multiple server instances. Good enough to    */
/* stop casual abuse of a metered Gemini key without adding infra          */
/* (Redis/Upstash) that this project doesn't otherwise need.               */
/* ---------------------------------------------------------------------- */

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function pruneExpiredEntries(now: number): void {
  rateLimitStore.forEach((entry, key) => {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS * 2) {
      rateLimitStore.delete(key);
    }
  });
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function checkRateLimit(req: NextRequest): RateLimitResult {
  const now = Date.now();
  if (rateLimitStore.size > 500) pruneExpiredEntries(now);

  const ip = getClientIp(req);
  const entry = rateLimitStore.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterSeconds = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - entry.windowStart)) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function rateLimitResponse(retryAfterSeconds: number): NextResponse {
  return NextResponse.json(
    { error: "Too many AI requests from this connection. Please wait a moment and try again." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );
}
