import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";

interface InvoiceItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
}

interface CreateInvoiceInput {
  accountId: string;
  type: "SALE" | "PURCHASE";
  invoiceNumber?: string;
  issueDate: Date;
  dueDate?: Date;
  notes?: string;
  items: InvoiceItemInput[];
}

function computeTotals(items: InvoiceItemInput[]) {
  let subtotal = 0;
  let vatTotal = 0;
  const computedItems = items.map((item) => {
    const lineSubtotal = item.quantity * item.unitPrice;
    const lineVat = lineSubtotal * (item.vatRate / 100);
    subtotal += lineSubtotal;
    vatTotal += lineVat;
    return { ...item, total: lineSubtotal + lineVat };
  });
  return { computedItems, subtotal, vatTotal, total: subtotal + vatTotal };
}

async function generateInvoiceNumber(userId: string, type: "SALE" | "PURCHASE") {
  const year = new Date().getFullYear();
  const prefix = type === "SALE" ? "SAT" : "AL";
  const count = await prisma.invoice.count({
    where: { userId, type, invoiceNumber: { startsWith: `${prefix}-${year}-` } },
  });
  return `${prefix}-${year}-${String(count + 1).padStart(4, "0")}`;
}

const invoiceInclude = {
  items: true,
  account: true,
  transactions: { include: { cashAccount: true } },
} satisfies Prisma.InvoiceInclude;

export async function listInvoices(
  userId: string,
  filters: {
    status?: "DRAFT" | "SENT" | "PAID" | "PARTIALLY_PAID" | "OVERDUE" | "CANCELLED";
    type?: "SALE" | "PURCHASE";
    accountId?: string;
    page: number;
    pageSize: number;
  },
) {
  const where: Prisma.InvoiceWhereInput = {
    userId,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.accountId ? { accountId: filters.accountId } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: { account: true, items: true },
      orderBy: { issueDate: "desc" },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    prisma.invoice.count({ where }),
  ]);

  return { items, total, page: filters.page, pageSize: filters.pageSize };
}

export async function getInvoice(userId: string, id: string) {
  const invoice = await prisma.invoice.findFirst({ where: { id, userId }, include: invoiceInclude });
  if (!invoice) throw ApiError.notFound("Fatura bulunamadı");
  return invoice;
}

export async function createInvoice(userId: string, input: CreateInvoiceInput) {
  const account = await prisma.account.findFirst({ where: { id: input.accountId, userId } });
  if (!account) throw ApiError.badRequest("Geçersiz cari hesap");

  const { computedItems, subtotal, vatTotal, total } = computeTotals(input.items);
  const invoiceNumber = input.invoiceNumber || (await generateInvoiceNumber(userId, input.type));

  const existingNumber = await prisma.invoice.findUnique({
    where: { userId_invoiceNumber: { userId, invoiceNumber } },
  });
  if (existingNumber) throw ApiError.conflict("Bu fatura numarası zaten kullanılıyor");

  return prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.create({
      data: {
        userId,
        accountId: input.accountId,
        invoiceNumber,
        type: input.type,
        status: "SENT",
        issueDate: input.issueDate,
        dueDate: input.dueDate,
        notes: input.notes,
        subtotal,
        vatTotal,
        total,
        items: {
          create: computedItems.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            vatRate: item.vatRate,
            total: item.total,
          })),
        },
      },
      include: invoiceInclude,
    });

    const accountDelta = input.type === "SALE" ? total : -total;
    await tx.account.update({
      where: { id: input.accountId },
      data: { balance: { increment: accountDelta } },
    });

    return invoice;
  });
}

export async function recordPayment(
  userId: string,
  invoiceId: string,
  input: { amount: number; cashAccountId: string; date: Date; description?: string },
) {
  const invoice = await prisma.invoice.findFirst({ where: { id: invoiceId, userId } });
  if (!invoice) throw ApiError.notFound("Fatura bulunamadı");
  if (invoice.status === "CANCELLED") throw ApiError.badRequest("İptal edilmiş faturaya ödeme kaydedilemez");

  const cashAccount = await prisma.cashAccount.findFirst({ where: { id: input.cashAccountId, userId } });
  if (!cashAccount) throw ApiError.badRequest("Geçersiz kasa/banka hesabı");

  const remaining = Number(invoice.total) - Number(invoice.paidAmount);
  if (input.amount > remaining + 0.01) {
    throw ApiError.badRequest(`Ödeme tutarı kalan bakiyeden (${remaining.toFixed(2)}) fazla olamaz`);
  }

  const transactionType = invoice.type === "SALE" ? "INCOME" : "EXPENSE";

  return prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        userId,
        type: transactionType,
        amount: input.amount,
        date: input.date,
        description:
          input.description ||
          (invoice.type === "SALE"
            ? `${invoice.invoiceNumber} numaralı fatura tahsilatı`
            : `${invoice.invoiceNumber} numaralı fatura ödemesi`),
        cashAccountId: input.cashAccountId,
        accountId: invoice.accountId,
        invoiceId: invoice.id,
      },
    });

    const cashDelta = transactionType === "INCOME" ? input.amount : -input.amount;
    await tx.cashAccount.update({ where: { id: input.cashAccountId }, data: { balance: { increment: cashDelta } } });

    const accountDelta = transactionType === "INCOME" ? -input.amount : input.amount;
    await tx.account.update({ where: { id: invoice.accountId }, data: { balance: { increment: accountDelta } } });

    const newPaid = Number(invoice.paidAmount) + input.amount;
    const isFullyPaid = newPaid >= Number(invoice.total) - 0.01;
    const updatedInvoice = await tx.invoice.update({
      where: { id: invoice.id },
      data: { paidAmount: newPaid, status: isFullyPaid ? "PAID" : "PARTIALLY_PAID" },
      include: invoiceInclude,
    });

    return { invoice: updatedInvoice, transaction };
  });
}

export async function cancelInvoice(userId: string, id: string) {
  const invoice = await prisma.invoice.findFirst({ where: { id, userId } });
  if (!invoice) throw ApiError.notFound("Fatura bulunamadı");
  if (invoice.status === "CANCELLED") throw ApiError.badRequest("Fatura zaten iptal edilmiş");
  if (Number(invoice.paidAmount) > 0) {
    throw ApiError.badRequest("Tahsilat/ödeme yapılmış fatura iptal edilemez");
  }

  return prisma.$transaction(async (tx) => {
    const accountDelta = invoice.type === "SALE" ? -Number(invoice.total) : Number(invoice.total);
    await tx.account.update({ where: { id: invoice.accountId }, data: { balance: { increment: accountDelta } } });

    return tx.invoice.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: invoiceInclude,
    });
  });
}

export async function deleteInvoice(userId: string, id: string) {
  const invoice = await prisma.invoice.findFirst({ where: { id, userId } });
  if (!invoice) throw ApiError.notFound("Fatura bulunamadı");
  if (Number(invoice.paidAmount) > 0) {
    throw ApiError.badRequest("Tahsilat/ödeme yapılmış fatura silinemez, iptal edebilirsiniz");
  }

  await prisma.$transaction(async (tx) => {
    if (invoice.status !== "CANCELLED") {
      const accountDelta = invoice.type === "SALE" ? -Number(invoice.total) : Number(invoice.total);
      await tx.account.update({ where: { id: invoice.accountId }, data: { balance: { increment: accountDelta } } });
    }
    await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
    await tx.invoice.delete({ where: { id } });
  });
}
