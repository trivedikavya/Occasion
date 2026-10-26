import type { Event } from "@/types/event";
import type { Vendor } from "@/types/vendor";
import type { IdeaType } from "@/types/idea";
import type { DraftFormat } from "@/types/styleProfile";
import type {
  QuickCaptureResult,
  IdeasResult,
  BudgetOptimizerResult,
  VendorQuestionsResult,
  VendorMessageResult,
  DraftResult,
  AssistantPayload,
} from "@/lib/schemas/ai";
import { getVendorChecklist } from "./constants";
import { addDays, toIsoDate, today } from "./dates";
import { getBudgetTotals, getOverBudgetCategories } from "./selectors";
import { formatINR } from "./utils";

function titleFromNote(note: string): string {
  const firstSentence = note.split(/[.!\n]/)[0]?.trim() ?? note.trim();
  const words = firstSentence.split(/\s+/).slice(0, 8).join(" ");
  const capitalized = words.charAt(0).toUpperCase() + words.slice(1);
  return capitalized.length > 3 ? capitalized : "Follow up on this note";
}

export function mockQuickCapture(event: Event, note: string): QuickCaptureResult {
  const dueGuess = addDays(toIsoDate(today()), 14);
  const mentionsBudgetWord = /budget|cost|plate|lakh|thousand|k\b|rs\.?|rupee|₹/i.test(note);
  const firstCategory = event.budgetItems[0];

  return {
    tasks: [
      {
        title: titleFromNote(note),
        due: dueGuess,
        category: "other",
        owner: "",
        notes: "Extracted from quick capture (mock mode) — review before applying.",
      },
    ],
    budgetUpdates:
      mentionsBudgetWord && firstCategory
        ? [
            {
              category: firstCategory.category,
              planned: null,
              actual: Math.round(firstCategory.actual * 1.05),
              reason: "Note mentioned a cost update — mock estimate, please verify the real number.",
            },
          ]
        : [],
    vendorNotes:
      event.vendors.length > 0
        ? [
            {
              vendorNameOrCategory: event.vendors[0].name,
              note: "Mentioned in your latest quick capture note.",
            },
          ]
        : [],
    flags: [
      {
        message: "This is a mock-mode response — connect a GEMINI_API_KEY for real extraction.",
        severity: "info",
      },
    ],
  };
}

export function mockAssistantReply(event: Event, message: string): { reply: string; payload: AssistantPayload } {
  const lower = message.toLowerCase();
  const totals = getBudgetTotals(event);

  if (lower.includes("overdue")) {
    return {
      reply: `You've got a few things worth checking on overdue tasks — take a look at the Timeline board for the full list. (Mock mode: connect a GEMINI_API_KEY for a live answer grounded in your actual data.)`,
      payload: { proposals: [] },
    };
  }

  if (lower.includes("left") || lower.includes("remaining") || lower.includes("budget")) {
    return {
      reply: `You've got ${formatINR(totals.remaining)} left out of ${formatINR(totals.total)} total (${formatINR(totals.actual)} spent so far). (Mock mode response.)`,
      payload: { proposals: [] },
    };
  }

  if (lower.includes("move") && lower.includes("%")) {
    const categories = event.budgetItems;
    if (categories.length >= 2) {
      const amount = Math.round(categories[0].planned * 0.1);
      return {
        reply: `Sure — here's a proposal to move about 10% from ${categories[0].category} to ${categories[1].category}. Review and apply if it looks right. (Mock mode.)`,
        payload: {
          proposals: [
            {
              type: "reallocate_budget",
              fromCategory: categories[0].category,
              toCategory: categories[1].category,
              amount,
              reason: "Requested in chat (mock mode estimate).",
            },
          ],
        },
      };
    }
  }

  return {
    reply: `Got it — in mock mode I can't reason over this freely, but connect a GEMINI_API_KEY to get real answers grounded in ${event.name}'s tasks, budget and vendors.`,
    payload: { proposals: [] },
  };
}

const IDEA_BANK: Record<IdeaType, { title: string; body: string }[]> = {
  theme: [
    {
      title: "A single accent color done properly",
      body: "Pick one accent color and repeat it across decor, invitations and even the return gifts — it reads as intentional without needing a bigger budget than you have.",
    },
  ],
  decor: [
    {
      title: "Layer lighting instead of adding more flowers",
      body: "Warm string lights plus a few floor lanterns often make more visual impact per rupee than extra floral work, especially for an evening function.",
    },
  ],
  menu: [
    {
      title: "One live counter instead of a bigger spread",
      body: "A single well-run live counter (chaat, dessert, or a regional specialty) gives guests something to talk about without ballooning the catering budget.",
    },
  ],
  activities: [
    {
      title: "A 15-minute guest-led moment",
      body: "A short, simple interactive moment (a group photo wall, a quick game) gives the evening a natural high point without needing a paid entertainer.",
    },
  ],
  invitation: [
    {
      title: "Keep the RSVP instruction impossible to miss",
      body: "Put the RSVP deadline and contact in bold on its own line — vague invitations are the #1 reason headcounts are wrong closer to the date.",
    },
  ],
  "return-gifts": [
    {
      title: "Something consumable over something decorative",
      body: "Local snacks or a small treat travel better than trinkets and don't become clutter — guests actually use them.",
    },
  ],
};

export function mockIdeas(event: Event, focus?: IdeaType[]): IdeasResult {
  const types = focus && focus.length > 0 ? focus : (Object.keys(IDEA_BANK) as IdeaType[]);
  const ideas = types.flatMap((t) => IDEA_BANK[t].map((idea) => ({ type: t, ...idea })));
  return { ideas: ideas.slice(0, 8) };
}

export function mockBudgetOptimizer(event: Event): BudgetOptimizerResult {
  const overBudget = getOverBudgetCategories(event);
  if (overBudget.length === 0 || event.budgetItems.length < 2) {
    return { changes: [], summary: "Budget looks reasonably balanced — no changes suggested (mock mode)." };
  }
  const donor = [...event.budgetItems].sort((a, b) => b.planned - a.planned)[0];
  const target = overBudget[0];
  if (donor.category === target.category) {
    return { changes: [], summary: "No clear reallocation found in mock mode." };
  }
  const shift = Math.min(Math.round(target.overBy), Math.round(donor.planned * 0.1));
  return {
    changes: [
      {
        category: donor.category,
        currentPlanned: donor.planned,
        suggestedPlanned: donor.planned - shift,
        reason: `Largest planned category — trimming slightly covers the overage elsewhere without raising the total budget.`,
      },
      {
        category: target.category,
        currentPlanned: target.planned,
        suggestedPlanned: target.planned + shift,
        reason: `Already ${formatINR(target.overBy)} over its current plan — raising the plan matches reality.`,
      },
    ],
    summary: `Shifting ${formatINR(shift)} from ${donor.category} to ${target.category} keeps the total budget the same while fixing the overage (mock mode estimate).`,
  };
}

export function mockVendorQuestions(vendor: Vendor): VendorQuestionsResult {
  return { questions: getVendorChecklist(vendor.category).slice(0, 8) };
}

export function mockVendorQuoteMessage(event: Event, vendor: Vendor): VendorMessageResult {
  return {
    message: `Hi ${vendor.name}! Planning ${event.name} on ${event.date} for ${event.guestCount} guests in ${event.city || "our city"}. Could you share your availability and a quote for ${vendor.category}? Thanks!`,
  };
}

export function mockDraft(format: DraftFormat, roughNote: string): DraftResult {
  const trimmed = roughNote.trim();
  const polished =
    format === "whatsapp"
      ? trimmed.replace(/\s+/g, " ")
      : `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`;
  return {
    draft: `${polished}\n\n(Mock mode draft — connect a GEMINI_API_KEY for a version rewritten in your actual style.)`,
  };
}
