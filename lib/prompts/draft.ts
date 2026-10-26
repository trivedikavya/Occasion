import type { Event } from "@/types/event";
import type { DraftFormat, StyleProfile } from "@/types/styleProfile";
import { DRAFT_FORMAT_LABELS } from "@/types/styleProfile";
import {
  BASE_SYSTEM_PROMPT,
  buildEventContextBlock,
  buildFormatRuleBlock,
  buildStyleProfileBlock,
} from "./context";

export function buildDraftSystemPrompt(format: DraftFormat): string {
  return [
    BASE_SYSTEM_PROMPT,
    "",
    `Rewrite the user's rough note into a polished ${DRAFT_FORMAT_LABELS[format]}, strictly in their style profile's voice. Keep their meaning and key facts intact — don't add information they didn't give you. Match the length and format conventions of a real ${DRAFT_FORMAT_LABELS[format]}.`,
  ].join("\n");
}

export function buildDraftUserPrompt(
  format: DraftFormat,
  styleProfile: StyleProfile,
  roughNote: string,
  event?: Event
): string {
  return [
    event ? buildEventContextBlock(event) : "",
    event ? "" : "",
    buildStyleProfileBlock(styleProfile),
    buildFormatRuleBlock(styleProfile, format),
    "",
    "ROUGH NOTE TO POLISH:",
    `"""${roughNote.trim()}"""`,
  ]
    .filter(Boolean)
    .join("\n");
}
