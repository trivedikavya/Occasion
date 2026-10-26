/** Date utilities. All "day" math is done in whole calendar days, ignoring time-of-day. */

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function addDays(iso: string, days: number): string {
  const date = parseIsoDate(iso);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

/** Positive if `iso` is in the future, negative if in the past, 0 if today. */
export function daysUntil(iso: string): number {
  const target = parseIsoDate(iso);
  const t = today();
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((target.getTime() - t.getTime()) / msPerDay);
}

export function isOverdue(iso: string): boolean {
  return daysUntil(iso) < 0;
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatDate(iso: string): string {
  return DATE_FORMATTER.format(parseIsoDate(iso));
}

const DATE_FORMATTER_SHORT = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
});

export function formatDateShort(iso: string): string {
  return DATE_FORMATTER_SHORT.format(parseIsoDate(iso));
}

export function formatCountdown(iso: string): string {
  const days = daysUntil(iso);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days > 0) return `${days} days to go`;
  return `${Math.abs(days)} days ago`;
}
