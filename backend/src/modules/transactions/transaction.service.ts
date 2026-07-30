import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";

type TxClient = Prisma.TransactionClient | PrismaClient;

interface BalanceEffectInput {
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  amount: number;
  cashAccountId: string;
  targetCashAccountId?: string | null;
  accountId?: string | null;
}

async function adjustBalances(tx: TxClient, data: BalanceEffectInput, sign: 1 | -1) {
  if (data.type === "TRANSFER") {
    await tx.cashAccount.update({
      where: { id: data.cashAccountId },
      data: { balance: { increment: -sign * data.amount } },
    });
    await tx.cashAccount.update({
      where: { id: data.targetCashAccountId! },
      data: { balance: { increment: sign * data.amount } },
    });
    return;
  }

  const cashDelta = data.type === "INCOME" ? sign * data.amount : -sign * data.amount;
  await tx.cashAccount.update({
    where: { id: data.cashAccountId },
    data: { balance: { increment: cashDelta } },
  });

  if (data.accountId) {
    const accountDelta = data.type === "INCOME" ? -sign * data.amount : sign * data.amount;
    await tx.account.update({
      where: { id: data.accountId },
      data: { balance: { increment: accountDelta } },
    });
  }
}

async function assertOwnership(userId: string, data: BalanceEffectInput) {
  const cashAccount = await prisma.cashAccount.findFirst({
    where: { id: data.cashAccountId, userId },
  });
  if (!cashAccount) throw ApiError.badRequest("Geçersiz kasa/banka hesabı");

  if (data.targetCashAccountId) {
    const target = await prisma.cashAccount.findFirst({
      where: { id: data.targetCashAccountId, userId },
    });
    if (!target) throw ApiError.badRequest("Geçersiz hedef kasa/banka hesabı");
  }

  if (data.accountId) {
    const account = await prisma.account.findFirst({ where: { id: data.accountId, userId } });
    if (!account) throw ApiError.badRequest("Geçersiz cari hesap");
  }
}

export async function listTransactions(
  userId: string,
  filters: {
    type?: "INCOME" | "EXPENSE" | "TRANSFER";
    cashAccountId?: string;
    accountId?: string;
    categoryId?: string;
    from?: Date;
    to?: Date;
    page: number;
    pageSize: number;
  },
) {
  const where: Prisma.TransactionWhereInput = {
    userId,
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.cashAccountId ? { cashAccountId: filters.cashAccountId } : {}),
    ...(filters.accountId ? { accountId: filters.accountId } : {}),
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.from || filters.to
      ? {
          date: {
            ...(filters.from ? { gte: filters.from } : {}),
            ...(filters.to ? { lte: filters.to } : {}),
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { category: true, cashAccount: true, targetCashAccount: true, account: true },
      orderBy: { date: "desc" },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    prisma.transaction.count({ where }),
  ]);

  return { items, total, page: filters.page, pageSize: filters.pageSize };
}

export async function getTransaction(userId: string, id: string) {
  const transaction = await prisma.transaction.findFirst({
    where: { id, userId },
    include: { category: true, cashAccount: true, targetCashAccount: true, account: true },
  });
  if (!transaction) throw ApiError.notFound("İşlem bulunamadı");
  return transaction;
}

export async function createTransaction(userId: string, input: BalanceEffectInput & { date: Date; description?: string; categoryId?: string }) {
  await assertOwnership(userId, input);

  return prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        userId,
        type: input.type,
        amount: input.amount,
        date: input.date,
        description: input.description,
        categoryId: input.categoryId,
        cashAccountId: input.cashAccountId,
        targetCashAccountId: input.targetCashAccountId,
        accountId: input.accountId,
      },
      include: { category: true, cashAccount: true, targetCashAccount: true, account: true },
    });

    await adjustBalances(tx, input, 1);
    return transaction;
  });
}

export async function updateTransaction(
  userId: string,
  id: string,
  input: { amount?: number; date?: Date; description?: string; categoryId?: string | null; accountId?: string | null },
) {
  const existing = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!existing) throw ApiError.notFound("İşlem bulunamadı");

  if (input.accountId) {
    const account = await prisma.account.findFirst({ where: { id: input.accountId, userId } });
    if (!account) throw ApiError.badRequest("Geçersiz cari hesap");
  }

  return prisma.$transaction(async (tx) => {
    const oldEffect: BalanceEffectInput = {
      type: existing.type,
      amount: Number(existing.amount),
      cashAccountId: existing.cashAccountId,
      targetCashAccountId: existing.targetCashAccountId,
      accountId: existing.accountId,
    };
    await adjustBalances(tx, oldEffect, -1);

    const updated = await tx.transaction.update({
      where: { id },
      data: {
        amount: input.amount,
        date: input.date,
        description: input.description,
        categoryId: input.categoryId,
        accountId: input.accountId,
      },
      include: { category: true, cashAccount: true, targetCashAccount: true, account: true },
    });

    const newEffect: BalanceEffectInput = {
      type: updated.type,
      amount: Number(updated.amount),
      cashAccountId: updated.cashAccountId,
      targetCashAccountId: updated.targetCashAccountId,
      accountId: updated.accountId,
    };
    await adjustBalances(tx, newEffect, 1);

    return updated;
  });
}

export async function deleteTransaction(userId: string, id: string) {
  const existing = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!existing) throw ApiError.notFound("İşlem bulunamadı");

  if (existing.invoiceId) {
    throw ApiError.badRequest("Faturaya bağlı tahsilat/ödeme işlemi faturadan yönetilmeli");
  }

  await prisma.$transaction(async (tx) => {
    await adjustBalances(
      tx,
      {
        type: existing.type,
        amount: Number(existing.amount),
        cashAccountId: existing.cashAccountId,
        targetCashAccountId: existing.targetCashAccountId,
        accountId: existing.accountId,
      },
      -1,
    );
    await tx.transaction.delete({ where: { id } });
  });
}
