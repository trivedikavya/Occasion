import type { Event } from "@/types/event";
import type { Vendor } from "@/types/vendor";
import { getVendorChecklist } from "./constants";
import { formatDate } from "./dates";
import { formatINR } from "./utils";

export function buildWhatsAppLink(contact: string, message: string): string {
  const digits = contact.replace(/[^\d]/g, "");
  const text = encodeURIComponent(message);
  return digits ? `https://wa.me/${digits}?text=${text}` : `https://wa.me/?text=${text}`;
}

export function buildQuoteRequestMessage(event: Event, vendor: Vendor): string {
  const budgetLine =
    event.budgetItems.find(
      (b) => b.category.toLowerCase() === vendor.category.toLowerCase()
    )?.planned ?? null;

  return [
    `Hi ${vendor.name}, this is regarding ${event.name}.`,
    `We're looking for ${vendor.category} on ${formatDate(event.date)} in ${event.city || "our city"}, for around ${event.guestCount} guests.`,
    budgetLine ? `Our budget for this is roughly ${formatINR(budgetLine)}.` : null,
    `Could you share your availability and a quote? Thanks!`,
  ]
    .filter(Boolean)
    .join(" ");
}

export function formatChecklistMessage(vendor: Vendor, questions: string[]): string {
  const lines = questions.map((q, i) => `${i + 1}. ${q}`);
  return [
    `Hi ${vendor.name}, a few quick questions for ${vendor.category.toLowerCase()}:`,
    "",
    ...lines,
    "",
    "Thanks!",
  ].join("\n");
}

export function buildChecklistMessage(vendor: Vendor): string {
  return formatChecklistMessage(vendor, getVendorChecklist(vendor.category));
}
