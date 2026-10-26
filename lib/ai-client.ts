import type { z } from "zod";
import type { Event } from "@/types/event";
import type { StyleProfile, DraftFormat } from "@/types/styleProfile";
import type { Vendor } from "@/types/vendor";
import type { IdeaType } from "@/types/idea";
import {
  QuickCaptureResultSchema,
  IdeasResultSchema,
  BudgetOptimizerResultSchema,
  VendorQuestionsResultSchema,
  VendorMessageResultSchema,
  DraftResultSchema,
  AssistantPayloadSchema,
  type QuickCaptureResult,
  type IdeasResult,
  type BudgetOptimizerResult,
  type VendorQuestionsResult,
  type VendorMessageResult,
  type DraftResult,
  type AssistantPayload,
} from "@/lib/schemas/ai";
import { PROPOSALS_SENTINEL } from "@/lib/assistant-protocol";

export class AiClientError extends Error {}

async function postJson<T>(url: string, body: unknown, schema: z.ZodType<T>): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new AiClientError("Couldn't reach the server. Check your connection and try again.");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new AiClientError(data?.error ?? `Request failed (${res.status}).`);
  }

  const data = await res.json().catch(() => null);
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AiClientError("Received an unexpected response from the server.");
  }
  return result.data;
}

export function requestQuickCapture(
  event: Event,
  styleProfile: StyleProfile,
  note: string
): Promise<QuickCaptureResult> {
  return postJson("/api/ai/quick-capture", { event, styleProfile, note }, QuickCaptureResultSchema);
}

export function requestIdeas(
  event: Event,
  styleProfile: StyleProfile,
  focus?: IdeaType[]
): Promise<IdeasResult> {
  return postJson("/api/ai/ideas", { event, styleProfile, focus }, IdeasResultSchema);
}

export function requestBudgetOptimizer(
  event: Event,
  styleProfile: StyleProfile
): Promise<BudgetOptimizerResult> {
  return postJson("/api/ai/budget-optimizer", { event, styleProfile }, BudgetOptimizerResultSchema);
}

export function requestVendorQuestions(event: Event, vendor: Vendor): Promise<VendorQuestionsResult> {
  return postJson("/api/ai/vendor-questions", { event, vendor }, VendorQuestionsResultSchema);
}

export function requestVendorWhatsapp(
  event: Event,
  vendor: Vendor,
  styleProfile: StyleProfile
): Promise<VendorMessageResult> {
  return postJson(
    "/api/ai/vendor-whatsapp",
    { event, vendor, styleProfile },
    VendorMessageResultSchema
  );
}

export function requestDraft(
  format: DraftFormat,
  styleProfile: StyleProfile,
  roughNote: string,
  event?: Event
): Promise<DraftResult> {
  return postJson("/api/ai/draft", { format, styleProfile, roughNote, event }, DraftResultSchema);
}

export interface AssistantHistoryTurn {
  role: "user" | "model";
  text: string;
}

/**
 * Streams the assistant's reply token-by-token via `onChunk`, then resolves
 * with the validated structured proposals once the stream finishes.
 */
export async function streamAssistant(
  payload: {
    event: Event;
    styleProfile: StyleProfile;
    message: string;
    history: AssistantHistoryTurn[];
  },
  onChunk: (text: string) => void
): Promise<AssistantPayload> {
  let res: Response;
  try {
    res = await fetch("/api/ai/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new AiClientError("Couldn't reach the server. Check your connection and try again.");
  }

  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => null);
    throw new AiClientError(data?.error ?? "Assistant request failed.");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const holdBack = PROPOSALS_SENTINEL.length - 1;
  let full = "";
  let emitted = 0;

  function flush(upto: number) {
    if (upto > emitted) {
      onChunk(full.slice(emitted, upto));
      emitted = upto;
    }
  }

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    full += decoder.decode(value, { stream: true });

    const idx = full.indexOf(PROPOSALS_SENTINEL);
    if (idx !== -1) {
      flush(idx);
    } else {
      flush(Math.max(emitted, full.length - holdBack));
    }
  }

  const idx = full.indexOf(PROPOSALS_SENTINEL);
  if (idx === -1) {
    flush(full.length);
    return { proposals: [] };
  }
  flush(idx);

  const jsonPart = full.slice(idx + PROPOSALS_SENTINEL.length).trim();
  try {
    const parsed = JSON.parse(jsonPart);
    const result = AssistantPayloadSchema.safeParse(parsed);
    return result.success ? result.data : { proposals: [] };
  } catch {
    return { proposals: [] };
  }
}
