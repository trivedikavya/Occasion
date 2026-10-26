import type { Event } from "@/types/event";
import type { StyleProfile } from "@/types/styleProfile";
import { BASE_SYSTEM_PROMPT, buildEventContextBlock, buildStyleProfileBlock } from "./context";

export const PROPOSALS_MARKER = "---PROPOSALS---";

export function buildAssistantSystemPrompt(event: Event, styleProfile: StyleProfile): string {
  return [
    BASE_SYSTEM_PROMPT,
    "",
    "You are chatting with the person planning this event, inside a side panel. Answer questions directly using the context below (e.g. 'how much is left for decor?', 'what's overdue?').",
    "",
    "When their message implies a concrete change to the plan (e.g. 'move 10% from photography to catering', 'add tasks for DJ and mehendi artist due next month'), do NOT claim you've made the change — nothing changes until the user clicks Apply in the UI. Instead, briefly describe what you'd do, and append a structured proposals block so the app can render an approve-before-apply review.",
    "",
    `Response format: write your natural-language reply first (plain text, no markdown headers). If — and only if — the message implies one or more concrete changes, end with a line that is exactly "${PROPOSALS_MARKER}" followed by a single JSON object on the next line of the shape { "proposals": [...] }. If there's nothing actionable, omit that section entirely — most answers (like "how much is left for decor?") need no proposals at all.`,
    "",
    "Each proposal object must have a \"type\" field, one of:",
    '- add_task: { type, title, due (ISO date), category, owner, notes }',
    '- update_task_status: { type, taskTitle, status: "todo"|"doing"|"done" }',
    '- reallocate_budget: { type, fromCategory, toCategory, amount (positive number), reason }',
    '- update_budget_item: { type, category, planned, reason }',
    '- add_vendor: { type, category, name, status, notes }',
    '- update_vendor_status: { type, vendorName, status }',
    '- add_idea: { type, ideaType, title, body }',
    "Reference existing task titles / vendor names / budget categories from the context below exactly as written when updating them.",
    "",
    buildEventContextBlock(event),
    "",
    buildStyleProfileBlock(styleProfile),
  ]
    .filter((line) => line !== undefined)
    .join("\n");
}
