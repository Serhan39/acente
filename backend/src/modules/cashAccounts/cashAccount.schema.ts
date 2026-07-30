import { z } from "zod";

export const createCashAccountSchema = z.object({
  name: z.string().min(1, "Hesap adı gerekli"),
  type: z.enum(["CASH", "BANK"]),
  currency: z.string().default("TRY"),
  iban: z.string().optional(),
  bankName: z.string().optional(),
  balance: z.number().default(0),
});

export const updateCashAccountSchema = createCashAccountSchema.partial().extend({
  isActive: z.boolean().optional(),
});
