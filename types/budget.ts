import { z } from "zod";

export const BudgetItemSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  category: z.string().min(1).max(100),
  planned: z.number().min(0),
  actual: z.number().min(0),
});
export type BudgetItem = z.infer<typeof BudgetItemSchema>;

export const BudgetItemInputSchema = BudgetItemSchema.omit({
  id: true,
  eventId: true,
});
export type BudgetItemInput = z.infer<typeof BudgetItemInputSchema>;
