import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { validateBody } from "../../utils/validate";
import { createAccountSchema, updateAccountSchema } from "./account.schema";

export const accountRouter = Router();
accountRouter.use(requireAuth);

accountRouter.get("/", async (req, res) => {
  const { search, type } = req.query;
  const accounts = await prisma.account.findMany({
    where: {
      userId: req.auth!.userId,
      isActive: true,
      ...(type ? { type: type as "CUSTOMER" | "VENDOR" | "BOTH" } : {}),
      ...(search
        ? { name: { contains: String(search), mode: "insensitive" as const } }
        : {}),
    },
    orderBy: { name: "asc" },
  });
  res.json(accounts);
});

accountRouter.get("/:id", async (req, res) => {
  const account = await prisma.account.findFirst({
    where: { id: req.params.id, userId: req.auth!.userId },
  });
  if (!account) throw ApiError.notFound("Cari hesap bulunamadı");
  res.json(account);
});

accountRouter.get("/:id/transactions", async (req, res) => {
  const account = await prisma.account.findFirst({
    where: { id: req.params.id, userId: req.auth!.userId },
  });
  if (!account) throw ApiError.notFound("Cari hesap bulunamadı");

  const transactions = await prisma.transaction.findMany({
    where: { accountId: account.id },
    include: { category: true, cashAccount: true },
    orderBy: { date: "desc" },
  });
  res.json(transactions);
});

accountRouter.post("/", validateBody(createAccountSchema), async (req, res) => {
  const account = await prisma.account.create({
    data: { ...req.body, userId: req.auth!.userId },
  });
  res.status(201).json(account);
});

accountRouter.patch("/:id", validateBody(updateAccountSchema), async (req, res) => {
  const existing = await prisma.account.findFirst({
    where: { id: req.params.id, userId: req.auth!.userId },
  });
  if (!existing) throw ApiError.notFound("Cari hesap bulunamadı");

  const account = await prisma.account.update({
    where: { id: existing.id },
    data: req.body,
  });
  res.json(account);
});

accountRouter.delete("/:id", async (req, res) => {
  const existing = await prisma.account.findFirst({
    where: { id: req.params.id, userId: req.auth!.userId },
  });
  if (!existing) throw ApiError.notFound("Cari hesap bulunamadı");

  const txCount = await prisma.transaction.count({ where: { accountId: existing.id } });
  const invoiceCount = await prisma.invoice.count({ where: { accountId: existing.id } });
  if (txCount > 0 || invoiceCount > 0) {
    await prisma.account.update({ where: { id: existing.id }, data: { isActive: false } });
    return res.status(200).json({ message: "Hareketli olduğu için pasife alındı" });
  }

  await prisma.account.delete({ where: { id: existing.id } });
  res.status(204).send();
});
