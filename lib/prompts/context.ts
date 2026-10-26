import type { Event } from "@/types/event";
import type { StyleProfile } from "@/types/styleProfile";
import { EVENT_TYPE_LABELS } from "@/types/event";
import { TASK_CATEGORY_LABELS } from "@/lib/constants";
import { formatDate, isOverdue } from "@/lib/dates";
import { formatINR } from "@/lib/utils";
import { getBudgetTotals, getOverBudgetCategories, getOverdueTasks } from "@/lib/selectors";

export const BASE_SYSTEM_PROMPT = `You are the planning assistant inside "Occasion", an app for planning Indian weddings, birthdays and community events (society festivals like a Garba/Navratri night).

Ground rules:
- All money is in Indian Rupees (INR). Always use the ₹ symbol and Indian digit grouping (e.g. ₹1,20,000), never $ or generic "dollars".
- Be fluent in Indian ceremony terms where relevant: mehendi, haldi, sangeet, pheras, reception, baraat, vidaai. Don't explain these terms, just use them naturally.
- For community events, be aware of real logistics: society/local permissions, sponsors, volunteers, security, food stalls, generator backup, entry passes.
- Be concise, concrete and practical — this is a working tool, not a chatbot that likes to chat. No filler, no "I'd be happy to help!" openers.
- Never invent vendor names, phone numbers or prices that weren't given to you in context.
- Only output the JSON requested by the schema. No markdown fences, no commentary outside the JSON.`;

export function buildStyleProfileBlock(profile: StyleProfile): string {
  const lines: string[] = ["STYLE PROFILE (match this voice in any user-facing text you write):"];
  if (profile.tone) lines.push(`Tone: ${profile.tone}`);
  if (profile.vocabulary.length) lines.push(`Words/phrases they like: ${profile.vocabulary.join(", ")}`);
  if (profile.avoidPhrases.length) lines.push(`Never use: ${profile.avoidPhrases.join(", ")}`);
  if (profile.samples.length) {
    lines.push("Writing samples to mimic:");
    profile.samples.forEach((s) => lines.push(`  - "${s}"`));
  }
  if (lines.length === 1) return "";
  return lines.join("\n");
}

export function buildFormatRuleBlock(profile: StyleProfile, format: keyof StyleProfile["formatRules"]): string {
  const rule = profile.formatRules[format];
  return rule ? `Rules for this format: ${rule}` : "";
}

export function buildEventContextBlock(event: Event): string {
  const budget = getBudgetTotals(event);
  const overBudget = getOverBudgetCategories(event);
  const overdue = getOverdueTasks(event);

  const taskLines = event.tasks
    .slice(0, 60)
    .map(
      (t) =>
        `  - [${t.status}] ${t.title} (due ${formatDate(t.due)}${isOverdue(t.due) && t.status !== "done" ? ", OVERDUE" : ""}, ${TASK_CATEGORY_LABELS[t.category]}${t.owner ? `, owner: ${t.owner}` : ""})`
    )
    .join("\n");

  const budgetLines = event.budgetItems
    .map(
      (b) =>
        `  - ${b.category}: planned ${formatINR(b.planned)}, actual ${formatINR(b.actual)}${b.actual > b.planned ? ` (OVER by ${formatINR(b.actual - b.planned)})` : ""}`
    )
    .join("\n");

  const vendorLines = event.vendors
    .map(
      (v) =>
        `  - [${v.category}] ${v.name} — ${v.status}${v.quote !== null ? `, quote ${formatINR(v.quote)}` : ", no quote yet"}${v.contact ? `, contact ${v.contact}` : ""}`
    )
    .join("\n");

  return [
    `EVENT: ${event.name} (${EVENT_TYPE_LABELS[event.type]})`,
    `Date: ${formatDate(event.date)} | City: ${event.city || "unspecified"} | Guests: ${event.guestCount}`,
    `Total budget: ${formatINR(event.totalBudget)} | Planned: ${formatINR(budget.planned)} | Actual spent: ${formatINR(budget.actual)} | Remaining: ${formatINR(budget.remaining)}`,
    overBudget.length
      ? `Over-budget categories: ${overBudget.map((b) => `${b.category} (+${formatINR(b.overBy)})`).join(", ")}`
      : "No categories are currently over budget.",
    overdue.length ? `Overdue tasks: ${overdue.map((t) => t.title).join(", ")}` : "No overdue tasks.",
    event.notes ? `Notes: ${event.notes}` : "",
    "",
    `TASKS (${event.tasks.length}):`,
    taskLines || "  (none yet)",
    "",
    `BUDGET CATEGORIES (${event.budgetItems.length}):`,
    budgetLines || "  (none yet)",
    "",
    `VENDORS (${event.vendors.length}):`,
    vendorLines || "  (none yet)",
  ]
    .filter((line) => line !== "")
    .join("\n");
}
