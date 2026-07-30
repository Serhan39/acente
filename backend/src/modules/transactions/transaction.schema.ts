import { z } from "zod";

export const createTransactionSchema = z
  .object({
    type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
    amount: z.number().positive("Tutar sıfırdan büyük olmalı"),
    date: z.coerce.date().default(() => new Date()),
    description: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    cashAccountId: z.string().uuid("Kasa/banka hesabı seçin"),
    targetCashAccountId: z.string().uuid().optional(),
    accountId: z.string().uuid().optional(),
  })
  .refine((data) => data.type !== "TRANSFER" || !!data.targetCashAccountId, {
    message: "Transfer için hedef hesap seçilmeli",
    path: ["targetCashAccountId"],
  })
  .refine(
    (data) => data.type !== "TRANSFER" || data.targetCashAccountId !== data.cashAccountId,
    { message: "Kaynak ve hedef hesap aynı olamaz", path: ["targetCashAccountId"] },
  );

export const updateTransactionSchema = z.object({
  amount: z.number().positive().optional(),
  date: z.coerce.date().optional(),
  description: z.string().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  accountId: z.string().uuid().nullable().optional(),
});

export const listTransactionsQuerySchema = z.object({
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]).optional(),
  cashAccountId: z.string().uuid().optional(),
  accountId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
