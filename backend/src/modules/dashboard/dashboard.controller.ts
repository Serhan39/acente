import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { prisma } from "../../lib/prisma";

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

dashboardRouter.get("/summary", async (req, res) => {
  const userId = req.auth!.userId;
  const monthsParam = Number(req.query.months ?? 6);
  const months = Number.isFinite(monthsParam) ? Math.min(Math.max(monthsParam, 1), 24) : 6;

  const now = new Date();
  const rangeStart = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

  const [cashAccounts, accounts, rangeTransactions, recentTransactions, openInvoices] = await Promise.all([
    prisma.cashAccount.findMany({ where: { userId, isActive: true } }),
    prisma.account.findMany({ where: { userId, isActive: true } }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: rangeStart }, type: { in: ["INCOME", "EXPENSE"] } },
      select: { type: true, amount: true, date: true },
    }),
    prisma.transaction.findMany({
      where: { userId },
      include: { category: true, cashAccount: true, account: true },
      orderBy: { date: "desc" },
      take: 10,
    }),
    prisma.invoice.findMany({
      where: { userId, status: { in: ["SENT", "PARTIALLY_PAID", "OVERDUE"] } },
      include: { account: true },
      orderBy: { dueDate: "asc" },
      take: 10,
    }),
  ]);

  const totalCashBalance = cashAccounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
  const totalReceivable = accounts.reduce((sum, acc) => (Number(acc.balance) > 0 ? sum + Number(acc.balance) : sum), 0);
  const totalPayable = accounts.reduce((sum, acc) => (Number(acc.balance) < 0 ? sum + Math.abs(Number(acc.balance)) : sum), 0);

  const seriesMap = new Map<string, { income: number; expense: number }>();
  for (let i = 0; i < months; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    seriesMap.set(monthKey(d), { income: 0, expense: 0 });
  }
  for (const tx of rangeTransactions) {
    const key = monthKey(tx.date);
    const bucket = seriesMap.get(key);
    if (!bucket) continue;
    if (tx.type === "INCOME") bucket.income += Number(tx.amount);
    else bucket.expense += Number(tx.amount);
  }
  const monthlySeries = Array.from(seriesMap.entries()).map(([month, v]) => ({
    month,
    income: v.income,
    expense: v.expense,
    net: v.income - v.expense,
  }));

  const currentMonthKey = monthKey(now);
  const currentMonth = monthlySeries.find((m) => m.month === currentMonthKey) ?? { income: 0, expense: 0, net: 0 };

  res.json({
    totalCashBalance,
    cashAccounts,
    totalReceivable,
    totalPayable,
    netWorth: totalCashBalance + totalReceivable - totalPayable,
    currentMonth,
    monthlySeries,
    recentTransactions,
    openInvoices,
  });
});
