import { z } from "zod";
import { isoDateString, isoDateTimeString } from "./common";

export const TASK_STATUSES = ["todo", "doing", "done"] as const;
export const TaskStatusSchema = z.enum(TASK_STATUSES);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const TASK_CATEGORIES = [
  "venue",
  "catering",
  "decor",
  "photography",
  "attire",
  "invitations",
  "mehendi",
  "haldi",
  "sangeet",
  "music-dj",
  "logistics",
  "guests",
  "permissions",
  "sponsors",
  "volunteers",
  "security",
  "other",
] as const;
export const TaskCategorySchema = z.enum(TASK_CATEGORIES);
export type TaskCategory = z.infer<typeof TaskCategorySchema>;

export const TaskSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  title: z.string().min(1).max(200),
  due: isoDateString,
  status: TaskStatusSchema,
  category: TaskCategorySchema,
  owner: z.string().max(100).default(""),
  notes: z.string().max(2000).default(""),
  createdAt: isoDateTimeString,
  updatedAt: isoDateTimeString,
});
export type Task = z.infer<typeof TaskSchema>;

export const TaskInputSchema = TaskSchema.omit({
  id: true,
  eventId: true,
  createdAt: true,
  updatedAt: true,
});
export type TaskInput = z.infer<typeof TaskInputSchema>;
