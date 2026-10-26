import { z } from "zod";

export const VENDOR_STATUSES = [
  "shortlisted",
  "contacted",
  "quoted",
  "booked",
] as const;
export const VendorStatusSchema = z.enum(VENDOR_STATUSES);
export type VendorStatus = z.infer<typeof VendorStatusSchema>;

export const VendorSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  category: z.string().min(1).max(100),
  name: z.string().min(1).max(150),
  contact: z.string().max(50).default(""),
  status: VendorStatusSchema,
  quote: z.number().min(0).nullable().default(null),
  notes: z.string().max(2000).default(""),
});
export type Vendor = z.infer<typeof VendorSchema>;

export const VendorInputSchema = VendorSchema.omit({
  id: true,
  eventId: true,
});
export type VendorInput = z.infer<typeof VendorInputSchema>;
