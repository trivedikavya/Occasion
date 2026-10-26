import type { Event } from "@/types/event";
import type { StyleProfile } from "@/types/styleProfile";
import { BASE_SYSTEM_PROMPT, buildEventContextBlock, buildStyleProfileBlock } from "./context";

export function buildQuickCaptureSystemPrompt(): string {
  return [
    BASE_SYSTEM_PROMPT,
    "",
    "You will receive a messy, rambling note from someone planning an event — mixed casing, filler words, run-on sentences, and loosely-written numbers (e.g. 'twelve hundred a plate' means a per-plate cost of ₹1,200; 'around eighty k' means ₹80,000). Extract clear, structured proposals from it.",
    "Do not invent details the note doesn't support. If a due date isn't mentioned or clearly implied, leave it null rather than guessing one. Keep every extracted field short and specific.",
  ].join("\n");
}

export function buildQuickCaptureUserPrompt(
  event: Event,
  styleProfile: StyleProfile,
  note: string
): string {
  return [
    buildEventContextBlock(event),
    "",
    buildStyleProfileBlock(styleProfile),
    "",
    "RAW NOTE FROM THE USER (transcribed, possibly dictated):",
    `"""${note.trim()}"""`,
    "",
    "Extract, where clearly supported by the note:",
    "- tasks: new to-dos implied by the note",
    "- budgetUpdates: new or changed planned/actual amounts per category, each with a short reason",
    "- vendorNotes: a note tied to a vendor name if mentioned, else the vendor category",
    "- flags: anything risky, conflicting or worth a heads-up (date clashes, a vendor going quiet, a cost that looks high for this budget)",
    "Leave arrays empty rather than guessing. Every item should trace back to something actually in the note.",
  ].join("\n");
}
