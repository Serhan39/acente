import { z } from "zod";

export const createAccountSchema = z.object({
  name: z.string().min(1, "Cari hesap adı gerekli"),
  type: z.enum(["CUSTOMER", "VENDOR", "BOTH"]).default("CUSTOMER"),
  taxNumber: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
});

export const updateAccountSchema = createAccountSchema.partial().extend({
  isActive: z.boolean().optional(),
});
