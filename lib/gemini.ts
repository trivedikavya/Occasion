import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const DEFAULT_MODEL = "gemini-2.5-flash";
const DEFAULT_TIMEOUT_MS = 25000;

function getModel(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
}

function getApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY?.trim() || undefined;
}

/** True when there's no key, or MOCK_AI is explicitly enabled — the whole app keeps working either way. */
export function isMockMode(): boolean {
  return process.env.MOCK_AI === "true" || !getApiKey();
}

export class GeminiError extends Error {
  constructor(
    message: string,
    public readonly code: "missing_key" | "timeout" | "invalid_json" | "schema_mismatch" | "network" | "unknown" = "unknown"
  ) {
    super(message);
    this.name = "GeminiError";
  }
}

let cachedClient: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new GeminiError(
      "No GEMINI_API_KEY is configured on the server.",
      "missing_key"
    );
  }
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({ apiKey });
  }
  return cachedClient;
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new GeminiError("Gemini took too long to respond. Please try again.", "timeout")),
      ms
    );
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}

/** Strips keys Gemini's structured-output schema subset doesn't understand. */
function toGeminiJsonSchema(schema: z.ZodType): unknown {
  const json = z.toJSONSchema(schema, {
    target: "draft-07",
    reused: "inline",
  }) as Record<string, unknown>;
  return Object.fromEntries(Object.entries(json).filter(([key]) => key !== "$schema"));
}

export interface GenerateJsonOptions<T> {
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodType<T>;
  timeoutMs?: number;
  /** Returned instead of calling Gemini when running in mock mode. */
  mock: () => T | Promise<T>;
}

/**
 * Calls Gemini in JSON mode, validates the response against `schema`, and retries
 * once (with a corrective note) if the model returns invalid JSON or a shape
 * mismatch. Falls back to `mock()` automatically when no API key is configured
 * or MOCK_AI=true, so the whole app works without a key.
 */
export async function generateJson<T>(opts: GenerateJsonOptions<T>): Promise<T> {
  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 350 + Math.random() * 250));
    return opts.mock();
  }

  const jsonSchema = toGeminiJsonSchema(opts.schema);
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  async function attempt(correctiveNote?: string): Promise<T> {
    const ai = getClient();
    const prompt = correctiveNote ? `${opts.userPrompt}\n\n${correctiveNote}` : opts.userPrompt;

    let response;
    try {
      response = await withTimeout(
        ai.models.generateContent({
          model: getModel(),
          contents: prompt,
          config: {
            systemInstruction: opts.systemPrompt,
            responseMimeType: "application/json",
            responseJsonSchema: jsonSchema,
          },
        }),
        timeoutMs
      );
    } catch (err) {
      if (err instanceof GeminiError) throw err;
      throw new GeminiError("Couldn't reach Gemini. Check your connection and try again.", "network");
    }

    const text = response.text;
    if (!text) {
      throw new GeminiError("Gemini returned an empty response.", "invalid_json");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new GeminiError("Gemini returned a response that wasn't valid JSON.", "invalid_json");
    }

    const result = opts.schema.safeParse(parsed);
    if (!result.success) {
      throw new GeminiError(
        "Gemini's response didn't match the expected structure.",
        "schema_mismatch"
      );
    }
    return result.data;
  }

  try {
    return await attempt();
  } catch (firstError) {
    console.warn("[gemini] first attempt failed, retrying once:", firstError);
    try {
      return await attempt(
        "Your previous response was invalid or didn't match the required JSON schema. Return ONLY valid JSON that strictly matches the schema — no markdown, no commentary."
      );
    } catch (secondError) {
      console.error("[gemini] retry also failed:", secondError);
      throw secondError instanceof GeminiError
        ? secondError
        : new GeminiError("Gemini request failed. Please try again.", "unknown");
    }
  }
}

export interface StreamTextOptions {
  systemPrompt: string;
  /** Prior turns, oldest first. */
  history?: { role: "user" | "model"; text: string }[];
  userPrompt: string;
  timeoutMs?: number;
}

/**
 * Streams plain text from Gemini chunk by chunk. In mock mode, simulates a
 * stream by yielding a canned response word by word so the UI behaves the same.
 */
export async function* streamText(
  opts: StreamTextOptions,
  mockFn: () => string | Promise<string>
): AsyncGenerator<string, void, unknown> {
  if (isMockMode()) {
    const full = await mockFn();
    const words = full.split(/(\s+)/);
    for (const word of words) {
      await new Promise((r) => setTimeout(r, 18));
      yield word;
    }
    return;
  }

  const ai = getClient();
  const contents = [
    ...(opts.history ?? []).map((turn) => ({
      role: turn.role,
      parts: [{ text: turn.text }],
    })),
    { role: "user" as const, parts: [{ text: opts.userPrompt }] },
  ];

  let stream;
  try {
    stream = await withTimeout(
      ai.models.generateContentStream({
        model: getModel(),
        contents,
        config: { systemInstruction: opts.systemPrompt },
      }),
      opts.timeoutMs ?? DEFAULT_TIMEOUT_MS
    );
  } catch (err) {
    if (err instanceof GeminiError) throw err;
    throw new GeminiError("Couldn't reach Gemini. Check your connection and try again.", "network");
  }

  try {
    for await (const chunk of stream) {
      if (chunk.text) yield chunk.text;
    }
  } catch {
    throw new GeminiError("The response stream was interrupted. Please try again.", "network");
  }
}

export function friendlyGeminiErrorMessage(err: unknown): string {
  if (err instanceof GeminiError) {
    switch (err.code) {
      case "missing_key":
        return "AI features aren't configured yet — add a GEMINI_API_KEY to use live Gemini, or set MOCK_AI=true.";
      case "timeout":
        return "That took too long. Please try again.";
      case "invalid_json":
      case "schema_mismatch":
        return "Gemini's response couldn't be understood. Please try again.";
      case "network":
        return "Couldn't reach Gemini. Check your connection and try again.";
      default:
        return err.message || "Something went wrong talking to Gemini.";
    }
  }
  return "Something went wrong talking to Gemini.";
}
