import { z } from "zod";
import { isoDateTimeString } from "./common";

export const IDEA_TYPES = [
  "theme",
  "decor",
  "menu",
  "activities",
  "invitation",
  "return-gifts",
] as const;
export const IdeaTypeSchema = z.enum(IDEA_TYPES);
export type IdeaType = z.infer<typeof IdeaTypeSchema>;

export const IdeaSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  type: IdeaTypeSchema,
  title: z.string().min(1).max(150),
  body: z.string().min(1).max(3000),
  pinned: z.boolean().default(false),
  createdAt: isoDateTimeString,
});
export type Idea = z.infer<typeof IdeaSchema>;

export const IdeaInputSchema = IdeaSchema.omit({
  id: true,
  eventId: true,
  createdAt: true,
});
export type IdeaInput = z.infer<typeof IdeaInputSchema>;
