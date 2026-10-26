/** Combos not representing a real shortcut (modifier-only presses). */
const MODIFIER_KEYS = new Set(["control", "meta", "alt", "shift"]);

export function normalizeCombo(combo: string): string {
  return combo
    .toLowerCase()
    .split("+")
    .map((p) => p.trim())
    .filter(Boolean)
    .sort()
    .join("+");
}

export function comboFromEvent(e: KeyboardEvent): string {
  const parts: string[] = [];
  if (e.ctrlKey || e.metaKey) parts.push("mod");
  if (e.altKey) parts.push("alt");
  if (e.shiftKey) parts.push("shift");
  const key = e.key.toLowerCase();
  if (!MODIFIER_KEYS.has(key)) {
    parts.push(key === " " ? "space" : key);
  }
  return parts.sort().join("+");
}

export function isCompleteCombo(combo: string): boolean {
  const parts = combo.split("+").filter(Boolean);
  return parts.length > 0 && parts.some((p) => !["mod", "alt", "shift"].includes(p));
}

const PLATFORM_MOD_LABEL =
  typeof navigator !== "undefined" && /mac/i.test(navigator.platform ?? "") ? "Cmd" : "Ctrl";

export function formatCombo(combo: string): string {
  return combo
    .split("+")
    .filter(Boolean)
    .map((part) => {
      if (part === "mod") return PLATFORM_MOD_LABEL;
      if (part === "alt") return "Alt";
      if (part === "shift") return "Shift";
      if (part === "space") return "Space";
      return part.length === 1 ? part.toUpperCase() : part[0].toUpperCase() + part.slice(1);
    })
    .join(" + ");
}
