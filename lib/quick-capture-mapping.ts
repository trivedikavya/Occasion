import type { QuickCaptureResult } from "@/lib/schemas/ai";
import type { AssistantProposal } from "@/lib/schemas/ai";
import { addDays, toIsoDate, today } from "./dates";

/** Maps a Quick Capture extraction into the same AssistantProposal shapes used
 *  by the chat assistant and budget optimizer, so one ProposalReview component
 *  can render and apply all three. Flags are informational only and are not
 *  mapped — they're rendered separately as awareness banners. */
export function quickCaptureToProposals(result: QuickCaptureResult): AssistantProposal[] {
  const fallbackDue = addDays(toIsoDate(today()), 14);
  const proposals: AssistantProposal[] = [];

  for (const t of result.tasks) {
    proposals.push({
      type: "add_task",
      title: t.title,
      due: t.due ?? fallbackDue,
      category: t.category,
      owner: t.owner,
      notes: t.notes,
    });
  }

  for (const b of result.budgetUpdates) {
    proposals.push({
      type: "update_budget_item",
      category: b.category,
      planned: b.planned,
      actual: b.actual,
      reason: b.reason,
    });
  }

  for (const v of result.vendorNotes) {
    proposals.push({
      type: "add_vendor_note",
      vendorNameOrCategory: v.vendorNameOrCategory,
      note: v.note,
    });
  }

  return proposals;
}
