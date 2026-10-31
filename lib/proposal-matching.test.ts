import { describe, it, expect } from "vitest";
import { findByName } from "./proposal-matching";

interface Named {
  id: string;
  name: string;
}

function item(id: string, name: string): Named {
  return { id, name };
}

describe("findByName", () => {
  const items = [item("1", "Royal Feast Caterers"), item("2", "Petal & Thread Decor"), item("3", "Henna Haat")];

  it("matches an exact name, case-insensitively", () => {
    const result = findByName(items, "royal feast caterers", (i) => i.name);
    expect(result?.id).toBe("1");
  });

  it("matches ignoring surrounding whitespace", () => {
    const result = findByName(items, "  Henna Haat  ", (i) => i.name);
    expect(result?.id).toBe("3");
  });

  it("falls back to a substring match when the AI gives a shorter name", () => {
    const result = findByName(items, "decor", (i) => i.name);
    expect(result?.id).toBe("2");
  });

  it("falls back to a substring match in the other direction (stored name shorter than query)", () => {
    const short = [item("x", "Decor")];
    const result = findByName(short, "Petal & Thread Decor", (i) => i.name);
    expect(result?.id).toBe("x");
  });

  it("returns undefined when nothing matches", () => {
    const result = findByName(items, "Security Services", (i) => i.name);
    expect(result).toBeUndefined();
  });

  it("returns undefined for an empty or blank query", () => {
    expect(findByName(items, "", (i) => i.name)).toBeUndefined();
    expect(findByName(items, "   ", (i) => i.name)).toBeUndefined();
  });

  it("prefers an exact match over a looser substring match elsewhere in the list", () => {
    const ambiguous = [item("a", "Decor"), item("b", "Premium Decor Co")];
    const result = findByName(ambiguous, "Decor", (i) => i.name);
    expect(result?.id).toBe("a");
  });

  it("does not match against an item with an empty name", () => {
    const withBlank = [item("a", ""), item("b", "Catering")];
    const result = findByName(withBlank, "Catering", (i) => i.name);
    expect(result?.id).toBe("b");
  });
});
