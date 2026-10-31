import { describe, it, expect } from "vitest";
import {
  QuickCaptureResultSchema,
  AssistantProposalSchema,
  AssistantPayloadSchema,
  IdeasResultSchema,
  BudgetOptimizerResultSchema,
  VendorQuestionsResultSchema,
  VendorMessageResultSchema,
  DraftResultSchema,
} from "./ai";

describe("QuickCaptureResultSchema", () => {
  it("accepts a fully-populated, well-formed response", () => {
    const result = QuickCaptureResultSchema.safeParse({
      tasks: [{ title: "Book mehendi artist", due: "2026-12-01", category: "mehendi", owner: "", notes: "" }],
      budgetUpdates: [{ category: "Catering", planned: null, actual: 320000, reason: "Caterer raised rates" }],
      vendorNotes: [{ vendorNameOrCategory: "Royal Feast", note: "Quoted higher rate" }],
      flags: [{ message: "Catering may exceed budget", severity: "warning" }],
    });
    expect(result.success).toBe(true);
  });

  it("defaults every array to empty when the model returns an empty object", () => {
    const result = QuickCaptureResultSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tasks).toEqual([]);
      expect(result.data.budgetUpdates).toEqual([]);
      expect(result.data.vendorNotes).toEqual([]);
      expect(result.data.flags).toEqual([]);
    }
  });

  it("allows a task's due date to be explicitly null", () => {
    const result = QuickCaptureResultSchema.safeParse({
      tasks: [{ title: "Follow up with decor vendor" }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tasks[0].due).toBeNull();
      expect(result.data.tasks[0].category).toBe("other");
    }
  });

  it("rejects a task with no title", () => {
    const result = QuickCaptureResultSchema.safeParse({ tasks: [{ title: "" }] });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid flag severity", () => {
    const result = QuickCaptureResultSchema.safeParse({
      flags: [{ message: "hmm", severity: "critical" }],
    });
    expect(result.success).toBe(false);
  });
});

describe("AssistantProposalSchema (discriminated union)", () => {
  it("accepts a valid add_task proposal", () => {
    const result = AssistantProposalSchema.safeParse({
      type: "add_task",
      title: "Book DJ",
      due: "2026-11-15",
      category: "music-dj",
      owner: "",
      notes: "",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid reallocate_budget proposal", () => {
    const result = AssistantProposalSchema.safeParse({
      type: "reallocate_budget",
      fromCategory: "Photography",
      toCategory: "Catering",
      amount: 15000,
      reason: "User request",
    });
    expect(result.success).toBe(true);
  });

  it("rejects reallocate_budget with a non-positive amount", () => {
    const result = AssistantProposalSchema.safeParse({
      type: "reallocate_budget",
      fromCategory: "Photography",
      toCategory: "Catering",
      amount: 0,
      reason: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown proposal type", () => {
    const result = AssistantProposalSchema.safeParse({
      type: "delete_everything",
      reason: "nope",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a proposal missing required fields for its type", () => {
    const result = AssistantProposalSchema.safeParse({ type: "add_task", title: "Missing due date" });
    expect(result.success).toBe(false);
  });
});

describe("AssistantPayloadSchema", () => {
  it("defaults to an empty proposals array when omitted", () => {
    const result = AssistantPayloadSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.proposals).toEqual([]);
  });

  it("validates every item in a mixed proposals array", () => {
    const result = AssistantPayloadSchema.safeParse({
      proposals: [
        { type: "update_task_status", taskTitle: "Book venue", status: "done" },
        { type: "add_idea", ideaType: "theme", title: "Ivory & gold", body: "A cohesive palette." },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("fails the whole payload if one proposal in the array is invalid", () => {
    const result = AssistantPayloadSchema.safeParse({
      proposals: [
        { type: "update_task_status", taskTitle: "Book venue", status: "done" },
        { type: "update_task_status", taskTitle: "Book venue", status: "not-a-real-status" },
      ],
    });
    expect(result.success).toBe(false);
  });
});

describe("IdeasResultSchema", () => {
  it("requires at least one idea", () => {
    expect(IdeasResultSchema.safeParse({ ideas: [] }).success).toBe(false);
  });

  it("caps at 8 ideas", () => {
    const ideas = Array.from({ length: 9 }, (_, i) => ({
      type: "decor",
      title: `Idea ${i}`,
      body: "Some body text.",
    }));
    expect(IdeasResultSchema.safeParse({ ideas }).success).toBe(false);
  });

  it("accepts a well-formed set of ideas", () => {
    const result = IdeasResultSchema.safeParse({
      ideas: [{ type: "menu", title: "Live chaat counter", body: "Keeps guests moving." }],
    });
    expect(result.success).toBe(true);
  });
});

describe("BudgetOptimizerResultSchema", () => {
  it("allows an empty changes array with just a summary", () => {
    const result = BudgetOptimizerResultSchema.safeParse({ summary: "Budget already looks balanced." });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.changes).toEqual([]);
  });

  it("rejects a change with a negative suggested amount", () => {
    const result = BudgetOptimizerResultSchema.safeParse({
      changes: [{ category: "Decor", currentPlanned: 10000, suggestedPlanned: -500, reason: "oops" }],
    });
    expect(result.success).toBe(false);
  });
});

describe("VendorQuestionsResultSchema / VendorMessageResultSchema / DraftResultSchema", () => {
  it("requires at least one question and caps at ten", () => {
    expect(VendorQuestionsResultSchema.safeParse({ questions: [] }).success).toBe(false);
    expect(
      VendorQuestionsResultSchema.safeParse({ questions: Array.from({ length: 11 }, () => "Q?") }).success
    ).toBe(false);
    expect(VendorQuestionsResultSchema.safeParse({ questions: ["What's included?"] }).success).toBe(true);
  });

  it("rejects an empty WhatsApp message", () => {
    expect(VendorMessageResultSchema.safeParse({ message: "" }).success).toBe(false);
  });

  it("rejects an empty draft", () => {
    expect(DraftResultSchema.safeParse({ draft: "" }).success).toBe(false);
  });
});
