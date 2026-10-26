import type { Event } from "@/types/event";
import type { StyleProfile } from "@/types/styleProfile";
import { BASE_SYSTEM_PROMPT, buildEventContextBlock, buildStyleProfileBlock } from "./context";

export function buildBudgetOptimizerSystemPrompt(): string {
  return [
    BASE_SYSTEM_PROMPT,
    "",
    "Suggest a better allocation of the planned budget across existing categories, within the same total budget. Prioritize fixing over-budget categories first, then look for categories that are overfunded relative to what's typical for this event type and guest count. Every suggested change needs a one-line reason grounded in the actual numbers. Don't suggest a change for a category unless the new planned amount differs from the current one. If the budget already looks sensible, return an empty changes array and say so in the summary.",
  ].join("\n");
}

export function buildBudgetOptimizerUserPrompt(event: Event, styleProfile: StyleProfile): string {
  return [
    buildEventContextBlock(event),
    "",
    buildStyleProfileBlock(styleProfile),
    "",
    "Suggest reallocations across the existing budget categories above (don't invent new categories). Keep the sum of suggested planned amounts equal to the current sum of planned amounts — this is a reallocation, not a budget increase.",
  ].join("\n");
}
