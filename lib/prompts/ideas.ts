import type { Event } from "@/types/event";
import type { StyleProfile } from "@/types/styleProfile";
import type { IdeaType } from "@/types/idea";
import { BASE_SYSTEM_PROMPT, buildEventContextBlock, buildStyleProfileBlock } from "./context";

export function buildIdeasSystemPrompt(): string {
  return [
    BASE_SYSTEM_PROMPT,
    "",
    "Generate specific, personalized planning ideas for this event — not generic advice. Each idea should reference something concrete about this event (guest count, city, budget level, event type, season/ceremony) so it couldn't be copy-pasted onto a different event. Cover a mix of: theme, decor, menu, activities, invitation wording, and return gifts — unless the user asked to focus on specific categories.",
  ].join("\n");
}

export function buildIdeasUserPrompt(
  event: Event,
  styleProfile: StyleProfile,
  focus?: IdeaType[]
): string {
  return [
    buildEventContextBlock(event),
    "",
    buildStyleProfileBlock(styleProfile),
    "",
    focus && focus.length > 0
      ? `Focus only on these idea types: ${focus.join(", ")}.`
      : "Give a spread across theme, decor, menu, activities, invitation and return-gifts ideas.",
    "Generate 5 to 8 ideas. Each idea needs a short punchy title and a 2-4 sentence body explaining the idea and why it fits this specific event.",
  ].join("\n");
}
