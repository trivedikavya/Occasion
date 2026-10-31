/**
 * Minimal, intentional logging wrapper. Occasion has no server-side logging
 * infrastructure (no Sentry/Datadog/etc.), so this still writes to the
 * console under the hood — but routing every warning/error through one named
 * module makes call sites read as deliberate diagnostics (with a clear scope
 * prefix) rather than stray debug output, and gives the app exactly one place
 * to upgrade to real log shipping later without touching callers.
 */

type LogLevel = "warn" | "error";

function write(level: LogLevel, scope: string, message: string, detail?: unknown): void {
  const prefix = `[${scope}]`;
  if (level === "warn") {
    if (detail !== undefined) console.warn(prefix, message, detail);
    else console.warn(prefix, message);
  } else {
    if (detail !== undefined) console.error(prefix, message, detail);
    else console.error(prefix, message);
  }
}

export const logger = {
  warn: (scope: string, message: string, detail?: unknown) => write("warn", scope, message, detail),
  error: (scope: string, message: string, detail?: unknown) => write("error", scope, message, detail),
};
