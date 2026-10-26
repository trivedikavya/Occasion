import { z } from "zod";
import { isoDateTimeString, newId, nowIso } from "@/types/common";
import { AssistantProposalSchema, type AssistantProposal } from "@/lib/schemas/ai";

export const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  text: z.string(),
  proposals: z.array(AssistantProposalSchema).default([]),
  appliedAt: isoDateTimeString.nullable().default(null),
  createdAt: isoDateTimeString,
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

function key(eventId: string): string {
  return `occasion:v1:chat:${eventId}`;
}

export function loadChatHistory(eventId: string): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key(eventId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const result = z.array(ChatMessageSchema).safeParse(parsed);
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

export function saveChatHistory(eventId: string, messages: ChatMessage[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key(eventId), JSON.stringify(messages));
}

export function clearChatHistory(eventId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key(eventId));
}

export function newChatMessage(
  role: "user" | "assistant",
  text: string,
  proposals: AssistantProposal[] = []
): ChatMessage {
  return { id: newId("msg"), role, text, proposals, appliedAt: null, createdAt: nowIso() };
}
