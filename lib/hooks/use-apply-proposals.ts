"use client";

import { useCallback } from "react";
import { useStore } from "@/components/providers/store-provider";
import type { Event } from "@/types/event";
import type { AssistantProposal } from "@/lib/schemas/ai";

function findByName<T extends { id: string }>(
  items: T[],
  name: string,
  getName: (item: T) => string
): T | undefined {
  const target = name.trim().toLowerCase();
  return (
    items.find((item) => getName(item).toLowerCase() === target) ??
    items.find((item) => getName(item).toLowerCase().includes(target) || target.includes(getName(item).toLowerCase()))
  );
}

/**
 * Applies a batch of already-approved AssistantProposal objects to the given
 * event. Matching against existing tasks/budget categories/vendors is
 * best-effort (case-insensitive, falls back to substring match) since the
 * proposal came from free-text AI output, not IDs.
 */
export function useApplyProposals(event: Event) {
  const {
    addTask,
    updateTask,
    addBudgetItem,
    updateBudgetItem,
    addVendor,
    updateVendor,
    addIdea,
  } = useStore();

  const applyOne = useCallback(
    (proposal: AssistantProposal) => {
      switch (proposal.type) {
        case "add_task": {
          addTask(event.id, {
            title: proposal.title,
            due: proposal.due,
            status: "todo",
            category: proposal.category,
            owner: proposal.owner,
            notes: proposal.notes,
          });
          return;
        }
        case "update_task_status": {
          const task = findByName(event.tasks, proposal.taskTitle, (t) => t.title);
          if (task) updateTask(event.id, task.id, { status: proposal.status });
          return;
        }
        case "reallocate_budget": {
          const from = findByName(event.budgetItems, proposal.fromCategory, (b) => b.category);
          let to = findByName(event.budgetItems, proposal.toCategory, (b) => b.category);
          if (from) {
            updateBudgetItem(event.id, from.id, { planned: Math.max(0, from.planned - proposal.amount) });
          }
          if (!to) {
            to = addBudgetItem(event.id, { category: proposal.toCategory, planned: 0, actual: 0 });
          }
          if (to) {
            updateBudgetItem(event.id, to.id, { planned: to.planned + proposal.amount });
          }
          return;
        }
        case "update_budget_item": {
          const existing = findByName(event.budgetItems, proposal.category, (b) => b.category);
          const patch: { planned?: number; actual?: number } = {};
          if (proposal.planned !== null) patch.planned = proposal.planned;
          if (proposal.actual !== null) patch.actual = proposal.actual;
          if (existing) {
            updateBudgetItem(event.id, existing.id, patch);
          } else {
            addBudgetItem(event.id, {
              category: proposal.category,
              planned: proposal.planned ?? 0,
              actual: proposal.actual ?? 0,
            });
          }
          return;
        }
        case "add_vendor": {
          addVendor(event.id, {
            category: proposal.category,
            name: proposal.name,
            contact: "",
            status: proposal.status,
            quote: null,
            notes: proposal.notes,
          });
          return;
        }
        case "update_vendor_status": {
          const vendor = findByName(event.vendors, proposal.vendorName, (v) => v.name);
          if (vendor) updateVendor(event.id, vendor.id, { status: proposal.status });
          return;
        }
        case "add_vendor_note": {
          const vendor =
            findByName(event.vendors, proposal.vendorNameOrCategory, (v) => v.name) ??
            findByName(event.vendors, proposal.vendorNameOrCategory, (v) => v.category);
          if (vendor) {
            updateVendor(event.id, vendor.id, {
              notes: vendor.notes ? `${vendor.notes}\n${proposal.note}` : proposal.note,
            });
          }
          return;
        }
        case "add_idea": {
          addIdea(event.id, {
            type: proposal.ideaType,
            title: proposal.title,
            body: proposal.body,
            pinned: false,
          });
          return;
        }
      }
    },
    [event, addTask, updateTask, addBudgetItem, updateBudgetItem, addVendor, updateVendor, addIdea]
  );

  const applyMany = useCallback(
    (proposals: AssistantProposal[]) => {
      proposals.forEach(applyOne);
    },
    [applyOne]
  );

  return { applyProposal: applyOne, applyProposals: applyMany };
}
