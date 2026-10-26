import type { AssistantProposal } from "@/lib/schemas/ai";
import { TASK_CATEGORY_LABELS, TASK_STATUS_LABELS, VENDOR_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/dates";
import { formatINR } from "@/lib/utils";

export function describeProposal(proposal: AssistantProposal): { title: string; detail?: string } {
  switch (proposal.type) {
    case "add_task":
      return {
        title: `Add task: ${proposal.title}`,
        detail: `Due ${formatDate(proposal.due)} \u00b7 ${TASK_CATEGORY_LABELS[proposal.category]}${proposal.owner ? ` \u00b7 ${proposal.owner}` : ""}`,
      };
    case "update_task_status":
      return {
        title: `Move "${proposal.taskTitle}" to ${TASK_STATUS_LABELS[proposal.status]}`,
      };
    case "reallocate_budget":
      return {
        title: `Move ${formatINR(proposal.amount)} from ${proposal.fromCategory} to ${proposal.toCategory}`,
        detail: proposal.reason || undefined,
      };
    case "update_budget_item": {
      const parts: string[] = [];
      if (proposal.planned !== null) parts.push(`planned ${formatINR(proposal.planned)}`);
      if (proposal.actual !== null) parts.push(`actual ${formatINR(proposal.actual)}`);
      return {
        title: `Update ${proposal.category}: ${parts.join(", ") || "no change"}`,
        detail: proposal.reason || undefined,
      };
    }
    case "add_vendor":
      return {
        title: `Add vendor: ${proposal.name} (${proposal.category})`,
        detail: `Status: ${VENDOR_STATUS_LABELS[proposal.status]}`,
      };
    case "update_vendor_status":
      return {
        title: `Mark ${proposal.vendorName} as ${VENDOR_STATUS_LABELS[proposal.status]}`,
      };
    case "add_vendor_note":
      return {
        title: `Add note to ${proposal.vendorNameOrCategory}`,
        detail: proposal.note,
      };
    case "add_idea":
      return {
        title: `Save idea: ${proposal.title}`,
        detail: proposal.body,
      };
  }
}
