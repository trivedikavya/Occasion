import { z } from "zod";

/** ISO date string, e.g. "2026-12-14" (no time component). */
export const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected an ISO date string (YYYY-MM-DD)");

/** ISO datetime string, e.g. "2026-12-14T10:30:00.000Z". */
export const isoDateTimeString = z.string().datetime({ offset: true }).or(
  z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Invalid datetime")
);

export function newId(prefix: string): string {
  const uuid =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `${prefix}_${uuid}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}
