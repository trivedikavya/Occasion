import type { Event } from "@/types/event";
import type { Task } from "@/types/task";
import type { BudgetItem } from "@/types/budget";
import { isOverdue } from "./dates";

export interface BudgetTotals {
  planned: number;
  actual: number;
  total: number;
  remaining: number;
  pctUsed: number;
}

export function getBudgetTotals(event: Event): BudgetTotals {
  const planned = event.budgetItems.reduce((sum, b) => sum + b.planned, 0);
  const actual = event.budgetItems.reduce((sum, b) => sum + b.actual, 0);
  const total = event.totalBudget;
  const remaining = total - actual;
  const pctUsed = total > 0 ? Math.min((actual / total) * 100, 999) : 0;
  return { planned, actual, total, remaining, pctUsed };
}

export interface OverBudgetCategory extends BudgetItem {
  overBy: number;
}

export function getOverBudgetCategories(event: Event): OverBudgetCategory[] {
  return event.budgetItems
    .filter((b) => b.actual > b.planned)
    .map((b) => ({ ...b, overBy: b.actual - b.planned }));
}

export interface TaskProgress {
  total: number;
  done: number;
  doing: number;
  todo: number;
  pct: number;
}

export function getTaskProgress(event: Event): TaskProgress {
  const total = event.tasks.length;
  const done = event.tasks.filter((t) => t.status === "done").length;
  const doing = event.tasks.filter((t) => t.status === "doing").length;
  const todo = event.tasks.filter((t) => t.status === "todo").length;
  const pct = total > 0 ? (done / total) * 100 : 0;
  return { total, done, doing, todo, pct };
}

export function getOverdueTasks(event: Event): Task[] {
  return event.tasks.filter((t) => t.status !== "done" && isOverdue(t.due));
}

export function getUpcomingTasks(event: Event, limit = 5): Task[] {
  return event.tasks
    .filter((t) => t.status !== "done")
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, limit);
}

export function getVendorsAwaitingQuote(event: Event) {
  return event.vendors.filter(
    (v) => v.quote === null && (v.status === "contacted" || v.status === "shortlisted")
  );
}
