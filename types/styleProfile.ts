import { z } from "zod";

export const StyleProfileSchema = z.object({
  tone: z.string().max(500).default(""),
  vocabulary: z.array(z.string().min(1).max(60)).default([]),
  avoidPhrases: z.array(z.string().min(1).max(60)).default([]),
  samples: z.array(z.string().min(1).max(4000)).default([]),
  formatRules: z
    .object({
      linkedin: z.string().max(1000).default(""),
      invitation: z.string().max(1000).default(""),
      vendorMessage: z.string().max(1000).default(""),
      whatsapp: z.string().max(1000).default(""),
    })
    .default({
      linkedin: "",
      invitation: "",
      vendorMessage: "",
      whatsapp: "",
    }),
});
export type StyleProfile = z.infer<typeof StyleProfileSchema>;

export const DRAFT_FORMATS = [
  "linkedin",
  "invitation",
  "vendorMessage",
  "whatsapp",
] as const;
export const DraftFormatSchema = z.enum(DRAFT_FORMATS);
export type DraftFormat = z.infer<typeof DraftFormatSchema>;

export const DRAFT_FORMAT_LABELS: Record<DraftFormat, string> = {
  linkedin: "LinkedIn post",
  invitation: "Invitation text",
  vendorMessage: "Vendor message",
  whatsapp: "WhatsApp message",
};
