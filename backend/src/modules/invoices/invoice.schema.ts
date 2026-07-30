import { z } from "zod";

const invoiceItemSchema = z.object({
  description: z.string().min(1, "Kalem açıklaması gerekli"),
  quantity: z.number().positive().default(1),
  unitPrice: z.number().nonnegative(),
  vatRate: z.number().min(0).max(100).default(20),
});

export const createInvoiceSchema = z.object({
  accountId: z.string().uuid("Cari hesap seçin"),
  type: z.enum(["SALE", "PURCHASE"]).default("SALE"),
  invoiceNumber: z.string().optional(),
  issueDate: z.coerce.date().default(() => new Date()),
  dueDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "En az bir kalem ekleyin"),
});

export const recordPaymentSchema = z.object({
  amount: z.number().positive("Tutar sıfırdan büyük olmalı"),
  cashAccountId: z.string().uuid("Kasa/banka hesabı seçin"),
  date: z.coerce.date().default(() => new Date()),
  description: z.string().optional(),
});

export const listInvoicesQuerySchema = z.object({
  status: z.enum(["DRAFT", "SENT", "PAID", "PARTIALLY_PAID", "OVERDUE", "CANCELLED"]).optional(),
  type: z.enum(["SALE", "PURCHASE"]).optional(),
  accountId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
