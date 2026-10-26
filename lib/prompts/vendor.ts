import type { Event } from "@/types/event";
import type { Vendor } from "@/types/vendor";
import type { StyleProfile } from "@/types/styleProfile";
import {
  BASE_SYSTEM_PROMPT,
  buildEventContextBlock,
  buildFormatRuleBlock,
  buildStyleProfileBlock,
} from "./context";

export function buildVendorQuestionsSystemPrompt(): string {
  return [
    BASE_SYSTEM_PROMPT,
    "",
    "Generate a short, practical checklist of questions to ask this specific vendor before booking — grounded in the event's actual guest count, date, budget and city. Avoid generic filler questions; make each one specific enough that the answer would actually change a decision.",
  ].join("\n");
}

export function buildVendorQuestionsUserPrompt(event: Event, vendor: Vendor): string {
  return [
    buildEventContextBlock(event),
    "",
    `Vendor: ${vendor.name} (${vendor.category}), status: ${vendor.status}${vendor.quote !== null ? `, quoted ${vendor.quote}` : ""}.`,
    "Generate 5 to 8 questions to ask this vendor.",
  ].join("\n");
}

export function buildVendorQuoteMessageSystemPrompt(): string {
  return [
    BASE_SYSTEM_PROMPT,
    "",
    "Write a short WhatsApp message requesting a quote from this vendor. It should mention the event, date, city, guest count, and what's needed, and ask for availability and pricing. Keep it the length of a real WhatsApp message a busy person would actually send — a few short lines, not an email.",
  ].join("\n");
}

export function buildVendorQuoteMessageUserPrompt(
  event: Event,
  vendor: Vendor,
  styleProfile: StyleProfile
): string {
  return [
    buildEventContextBlock(event),
    "",
    buildStyleProfileBlock(styleProfile),
    buildFormatRuleBlock(styleProfile, "whatsapp"),
    "",
    `Vendor: ${vendor.name} (${vendor.category}).`,
    "Write the quote-request WhatsApp message.",
  ]
    .filter(Boolean)
    .join("\n");
}
