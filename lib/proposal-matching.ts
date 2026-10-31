/**
 * Best-effort, case-insensitive matching used to resolve AI-proposed names
 * (e.g. "Decor", "mehendi artist") back to existing records by name. Exact
 * match wins; otherwise falls back to a substring match in either direction,
 * since free-text model output rarely matches stored casing/wording exactly.
 * Pulled out of `useApplyProposals` so this logic can be unit tested without
 * React or the store context.
 */
export function findByName<T>(
  items: T[],
  name: string,
  getName: (item: T) => string
): T | undefined {
  const target = name.trim().toLowerCase();
  if (!target) return undefined;

  const exact = items.find((item) => getName(item).trim().toLowerCase() === target);
  if (exact) return exact;

  return items.find((item) => {
    const itemName = getName(item).trim().toLowerCase();
    if (!itemName) return false;
    return itemName.includes(target) || target.includes(itemName);
  });
}
