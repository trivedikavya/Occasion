import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getBudgetTotals,
  getOverBudgetCategories,
  getTaskProgress,
  getOverdueTasks,
  getUpcomingTasks,
  getVendorsAwaitingQuote,
} from "./selectors";
import type { Event } from "@/types/event";
import type { Task } from "@/types/task";
import type { BudgetItem } from "@/types/budget";
import type { Vendor } from "@/types/vendor";

function mkTask(overrides: Partial<Task> = {}): Task {
  return {
    id: overrides.id ?? `task_${Math.random()}`,
    eventId: "event_1",
    title: "Sample task",
    due: "2026-11-01",
    status: "todo",
    category: "other",
    owner: "",
    notes: "",
    createdAt: "2026-10-26T00:00:00.000Z",
    updatedAt: "2026-10-26T00:00:00.000Z",
    ...overrides,
  };
}

function mkBudget(overrides: Partial<BudgetItem> = {}): BudgetItem {
  return {
    id: overrides.id ?? `budget_${Math.random()}`,
    eventId: "event_1",
    category: "Venue",
    planned: 0,
    actual: 0,
    ...overrides,
  };
}

function mkVendor(overrides: Partial<Vendor> = {}): Vendor {
  return {
    id: overrides.id ?? `vendor_${Math.random()}`,
    eventId: "event_1",
    category: "Catering",
    name: "Sample Vendor",
    contact: "",
    status: "shortlisted",
    quote: null,
    notes: "",
    ...overrides,
  };
}

function mkEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: "event_1",
    name: "Test Event",
    type: "wedding",
    date: "2027-01-01",
    city: "Jaipur",
    guestCount: 100,
    totalBudget: 100000,
    notes: "",
    createdAt: "2026-10-26T00:00:00.000Z",
    updatedAt: "2026-10-26T00:00:00.000Z",
    tasks: [],
    budgetItems: [],
    vendors: [],
    ideas: [],
    ...overrides,
  };
}

describe("getBudgetTotals", () => {
  it("sums planned and actual across all categories", () => {
    const event = mkEvent({
      totalBudget: 100000,
      budgetItems: [
        mkBudget({ planned: 40000, actual: 35000 }),
        mkBudget({ planned: 60000, actual: 20000 }),
      ],
    });
    const totals = getBudgetTotals(event);
    expect(totals.planned).toBe(100000);
    expect(totals.actual).toBe(55000);
    expect(totals.total).toBe(100000);
    expect(totals.remaining).toBe(45000);
    expect(totals.pctUsed).toBeCloseTo(55);
  });

  it("returns zero pctUsed when the event has no total budget", () => {
    const event = mkEvent({ totalBudget: 0, budgetItems: [mkBudget({ planned: 100, actual: 50 })] });
    expect(getBudgetTotals(event).pctUsed).toBe(0);
  });

  it("reports negative remaining when actual spend exceeds the total budget", () => {
    const event = mkEvent({ totalBudget: 50000, budgetItems: [mkBudget({ planned: 50000, actual: 70000 })] });
    const totals = getBudgetTotals(event);
    expect(totals.remaining).toBe(-20000);
  });
});

describe("getOverBudgetCategories", () => {
  it("only returns categories where actual exceeds planned", () => {
    const event = mkEvent({
      budgetItems: [
        mkBudget({ category: "Decor", planned: 250000, actual: 295000 }),
        mkBudget({ category: "Venue", planned: 450000, actual: 450000 }),
        mkBudget({ category: "Catering", planned: 600000, actual: 320000 }),
      ],
    });
    const over = getOverBudgetCategories(event);
    expect(over).toHaveLength(1);
    expect(over[0].category).toBe("Decor");
    expect(over[0].overBy).toBe(45000);
  });

  it("returns an empty array when nothing is over budget", () => {
    const event = mkEvent({ budgetItems: [mkBudget({ planned: 1000, actual: 500 })] });
    expect(getOverBudgetCategories(event)).toEqual([]);
  });
});

describe("getTaskProgress", () => {
  it("counts tasks by status and computes percent done", () => {
    const event = mkEvent({
      tasks: [
        mkTask({ status: "done" }),
        mkTask({ status: "done" }),
        mkTask({ status: "doing" }),
        mkTask({ status: "todo" }),
      ],
    });
    const progress = getTaskProgress(event);
    expect(progress).toEqual({ total: 4, done: 2, doing: 1, todo: 1, pct: 50 });
  });

  it("returns zero percent for an event with no tasks", () => {
    const progress = getTaskProgress(mkEvent({ tasks: [] }));
    expect(progress.pct).toBe(0);
    expect(progress.total).toBe(0);
  });
});

describe("getOverdueTasks / getUpcomingTasks", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 26)); // 26 Oct 2026
  });
  afterEach(() => vi.useRealTimers());

  it("flags only non-done tasks with a past due date as overdue", () => {
    const event = mkEvent({
      tasks: [
        mkTask({ id: "a", due: "2026-10-20", status: "todo" }),
        mkTask({ id: "b", due: "2026-10-20", status: "done" }),
        mkTask({ id: "c", due: "2026-11-01", status: "todo" }),
      ],
    });
    const overdue = getOverdueTasks(event);
    expect(overdue.map((t) => t.id)).toEqual(["a"]);
  });

  it("sorts upcoming (non-done) tasks by due date ascending and respects the limit", () => {
    const event = mkEvent({
      tasks: [
        mkTask({ id: "late", due: "2026-12-01", status: "todo" }),
        mkTask({ id: "soon", due: "2026-11-01", status: "todo" }),
        mkTask({ id: "already-done", due: "2026-10-01", status: "done" }),
        mkTask({ id: "mid", due: "2026-11-15", status: "doing" }),
      ],
    });
    const upcoming = getUpcomingTasks(event, 2);
    expect(upcoming.map((t) => t.id)).toEqual(["soon", "mid"]);
  });
});

describe("getVendorsAwaitingQuote", () => {
  it("includes shortlisted/contacted vendors with no quote", () => {
    const event = mkEvent({
      vendors: [
        mkVendor({ id: "a", status: "contacted", quote: null }),
        mkVendor({ id: "b", status: "shortlisted", quote: null }),
        mkVendor({ id: "c", status: "quoted", quote: 5000 }),
        mkVendor({ id: "d", status: "booked", quote: 0 }),
      ],
    });
    const awaiting = getVendorsAwaitingQuote(event);
    expect(awaiting.map((v) => v.id).sort()).toEqual(["a", "b"]);
  });

  it("does not flag a booked vendor with a zero (but non-null) quote", () => {
    const event = mkEvent({ vendors: [mkVendor({ status: "booked", quote: 0 })] });
    expect(getVendorsAwaitingQuote(event)).toEqual([]);
  });
});
