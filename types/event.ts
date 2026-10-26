import { z } from "zod";
import { isoDateString, isoDateTimeString } from "./common";
import { TaskSchema } from "./task";
import { BudgetItemSchema } from "./budget";
import { VendorSchema } from "./vendor";
import { IdeaSchema } from "./idea";

export const EVENT_TYPES = ["wedding", "birthday", "community"] as const;
export const EventTypeSchema = z.enum(EVENT_TYPES);
export type EventType = z.infer<typeof EventTypeSchema>;

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  wedding: "Wedding",
  birthday: "Birthday",
  community: "Community event",
};

export const EventSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(150),
  type: EventTypeSchema,
  date: isoDateString,
  city: z.string().max(100).default(""),
  guestCount: z.number().int().min(0),
  totalBudget: z.number().min(0),
  notes: z.string().max(4000).default(""),
  createdAt: isoDateTimeString,
  updatedAt: isoDateTimeString,
  tasks: z.array(TaskSchema).default([]),
  budgetItems: z.array(BudgetItemSchema).default([]),
  vendors: z.array(VendorSchema).default([]),
  ideas: z.array(IdeaSchema).default([]),
});
export type Event = z.infer<typeof EventSchema>;

export const EventInputSchema = EventSchema.pick({
  name: true,
  type: true,
  date: true,
  city: true,
  guestCount: true,
  totalBudget: true,
  notes: true,
});
export type EventInput = z.infer<typeof EventInputSchema>;
