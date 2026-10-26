import { z } from "zod";
import { isoDateString } from "@/types/common";
import { TaskCategorySchema, TaskStatusSchema } from "@/types/task";
import { VendorStatusSchema } from "@/types/vendor";
import { IdeaTypeSchema } from "@/types/idea";
import { DraftFormatSchema } from "@/types/styleProfile";

/* ---------------------------------------------------------------------- */
/* Quick Capture (Phase 6.1)                                               */
/* ---------------------------------------------------------------------- */

export const QuickCaptureTaskProposalSchema = z.object({
  title: z.string().min(1).max(200),
  due: isoDateString.nullable().default(null),
  category: TaskCategorySchema.default("other"),
  owner: z.string().max(100).default(""),
  notes: z.string().max(500).default(""),
});
export type QuickCaptureTaskProposal = z.infer<typeof QuickCaptureTaskProposalSchema>;

export const QuickCaptureBudgetProposalSchema = z.object({
  category: z.string().min(1).max(100),
  planned: z.number().min(0).nullable().default(null),
  actual: z.number().min(0).nullable().default(null),
  reason: z.string().max(300).default(""),
});
export type QuickCaptureBudgetProposal = z.infer<typeof QuickCaptureBudgetProposalSchema>;

export const QuickCaptureVendorNoteProposalSchema = z.object({
  vendorNameOrCategory: z.string().min(1).max(150),
  note: z.string().min(1).max(500),
});
export type QuickCaptureVendorNoteProposal = z.infer<typeof QuickCaptureVendorNoteProposalSchema>;

export const QuickCaptureFlagProposalSchema = z.object({
  message: z.string().min(1).max(300),
  severity: z.enum(["info", "warning"]).default("info"),
});
export type QuickCaptureFlagProposal = z.infer<typeof QuickCaptureFlagProposalSchema>;

export const QuickCaptureResultSchema = z.object({
  tasks: z.array(QuickCaptureTaskProposalSchema).default([]),
  budgetUpdates: z.array(QuickCaptureBudgetProposalSchema).default([]),
  vendorNotes: z.array(QuickCaptureVendorNoteProposalSchema).default([]),
  flags: z.array(QuickCaptureFlagProposalSchema).default([]),
});
export type QuickCaptureResult = z.infer<typeof QuickCaptureResultSchema>;

/* ---------------------------------------------------------------------- */
/* Assistant (Phase 6.3) — structured proposals a chat turn can produce.   */
/* Shared with the Budget Optimizer (Phase 6.5), which emits the same      */
/* reallocate_budget / update_budget_item proposal shapes.                 */
/* ---------------------------------------------------------------------- */

export const AssistantProposalSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("add_task"),
    title: z.string().min(1).max(200),
    due: isoDateString,
    category: TaskCategorySchema.default("other"),
    owner: z.string().max(100).default(""),
    notes: z.string().max(500).default(""),
  }),
  z.object({
    type: z.literal("update_task_status"),
    taskTitle: z.string().min(1).max(200),
    status: TaskStatusSchema,
  }),
  z.object({
    type: z.literal("reallocate_budget"),
    fromCategory: z.string().min(1).max(100),
    toCategory: z.string().min(1).max(100),
    amount: z.number().positive(),
    reason: z.string().max(300).default(""),
  }),
  z.object({
    type: z.literal("update_budget_item"),
    category: z.string().min(1).max(100),
    planned: z.number().min(0).nullable().default(null),
    actual: z.number().min(0).nullable().default(null),
    reason: z.string().max(300).default(""),
  }),
  z.object({
    type: z.literal("add_vendor"),
    category: z.string().min(1).max(100),
    name: z.string().min(1).max(150),
    status: VendorStatusSchema.default("shortlisted"),
    notes: z.string().max(500).default(""),
  }),
  z.object({
    type: z.literal("update_vendor_status"),
    vendorName: z.string().min(1).max(150),
    status: VendorStatusSchema,
  }),
  z.object({
    type: z.literal("add_vendor_note"),
    vendorNameOrCategory: z.string().min(1).max(150),
    note: z.string().min(1).max(500),
  }),
  z.object({
    type: z.literal("add_idea"),
    ideaType: IdeaTypeSchema,
    title: z.string().min(1).max(150),
    body: z.string().min(1).max(1500),
  }),
]);
export type AssistantProposal = z.infer<typeof AssistantProposalSchema>;

export const AssistantPayloadSchema = z.object({
  proposals: z.array(AssistantProposalSchema).default([]),
});
export type AssistantPayload = z.infer<typeof AssistantPayloadSchema>;

/* ---------------------------------------------------------------------- */
/* Ideas (Phase 6.4)                                                       */
/* ---------------------------------------------------------------------- */

export const IdeaProposalSchema = z.object({
  type: IdeaTypeSchema,
  title: z.string().min(1).max(150),
  body: z.string().min(1).max(1500),
});
export type IdeaProposal = z.infer<typeof IdeaProposalSchema>;

export const IdeasResultSchema = z.object({
  ideas: z.array(IdeaProposalSchema).min(1).max(8),
});
export type IdeasResult = z.infer<typeof IdeasResultSchema>;

/* ---------------------------------------------------------------------- */
/* Budget optimizer (Phase 6.5)                                            */
/* ---------------------------------------------------------------------- */

export const BudgetChangeProposalSchema = z.object({
  category: z.string().min(1).max(100),
  currentPlanned: z.number().min(0),
  suggestedPlanned: z.number().min(0),
  reason: z.string().min(1).max(300),
});
export type BudgetChangeProposal = z.infer<typeof BudgetChangeProposalSchema>;

export const BudgetOptimizerResultSchema = z.object({
  changes: z.array(BudgetChangeProposalSchema).default([]),
  summary: z.string().max(500).default(""),
});
export type BudgetOptimizerResult = z.infer<typeof BudgetOptimizerResultSchema>;

/* ---------------------------------------------------------------------- */
/* Vendor questions & WhatsApp drafts (Phase 6.6)                          */
/* ---------------------------------------------------------------------- */

export const VendorQuestionsResultSchema = z.object({
  questions: z.array(z.string().min(1).max(300)).min(1).max(10),
});
export type VendorQuestionsResult = z.infer<typeof VendorQuestionsResultSchema>;

export const VendorMessageResultSchema = z.object({
  message: z.string().min(1).max(1500),
});
export type VendorMessageResult = z.infer<typeof VendorMessageResultSchema>;

/* ---------------------------------------------------------------------- */
/* Draft with my style (Phase 7)                                           */
/* ---------------------------------------------------------------------- */

export const DraftResultSchema = z.object({
  draft: z.string().min(1).max(3000),
});
export type DraftResult = z.infer<typeof DraftResultSchema>;

export const DraftRequestFormatSchema = DraftFormatSchema;
