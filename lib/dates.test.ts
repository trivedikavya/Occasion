import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  toIsoDate,
  parseIsoDate,
  today,
  addDays,
  daysUntil,
  isOverdue,
  formatDate,
  formatDateShort,
  formatCountdown,
} from "./dates";

describe("toIsoDate / parseIsoDate", () => {
  it("round-trips a date through ISO string form", () => {
    const date = new Date(2026, 1, 5); // Feb 5, 2026 (month is 0-indexed)
    expect(toIsoDate(date)).toBe("2026-02-05");
  });

  it("pads single-digit months and days", () => {
    expect(toIsoDate(new Date(2027, 0, 9))).toBe("2027-01-09");
  });

  it("parses an ISO string back into the same calendar date", () => {
    const parsed = parseIsoDate("2026-12-14");
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(11);
    expect(parsed.getDate()).toBe(14);
  });
});

describe("addDays", () => {
  it("adds positive days, rolling into the next month", () => {
    expect(addDays("2026-01-28", 5)).toBe("2026-02-02");
  });

  it("subtracts with a negative offset", () => {
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("returns the same date for a zero offset", () => {
    expect(addDays("2026-06-15", 0)).toBe("2026-06-15");
  });
});

describe("date math relative to a fixed 'today'", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 26)); // 26 Oct 2026
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("today() returns midnight of the current date", () => {
    const t = today();
    expect(toIsoDate(t)).toBe("2026-10-26");
    expect(t.getHours()).toBe(0);
  });

  it("daysUntil is positive for a future date", () => {
    expect(daysUntil("2026-11-05")).toBe(10);
  });

  it("daysUntil is negative for a past date", () => {
    expect(daysUntil("2026-10-20")).toBe(-6);
  });

  it("daysUntil is zero for today", () => {
    expect(daysUntil("2026-10-26")).toBe(0);
  });

  it("isOverdue is true only for dates strictly before today", () => {
    expect(isOverdue("2026-10-25")).toBe(true);
    expect(isOverdue("2026-10-26")).toBe(false);
    expect(isOverdue("2026-10-27")).toBe(false);
  });

  it("formatCountdown handles today/tomorrow/yesterday specially", () => {
    expect(formatCountdown("2026-10-26")).toBe("Today");
    expect(formatCountdown("2026-10-27")).toBe("Tomorrow");
    expect(formatCountdown("2026-10-25")).toBe("Yesterday");
  });

  it("formatCountdown falls back to 'N days to go' / 'N days ago'", () => {
    expect(formatCountdown("2026-11-10")).toBe("15 days to go");
    expect(formatCountdown("2026-10-10")).toBe("16 days ago");
  });
});

describe("formatDate / formatDateShort", () => {
  it("formats a date in the en-IN day/month/year style", () => {
    expect(formatDate("2026-12-14")).toMatch(/14 Dec 2026/);
  });

  it("formats a short date without the year", () => {
    expect(formatDateShort("2026-12-14")).toMatch(/14 Dec/);
    expect(formatDateShort("2026-12-14")).not.toMatch(/2026/);
  });
});
