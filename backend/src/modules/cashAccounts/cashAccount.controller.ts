import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { validateBody } from "../../utils/validate";
import { createCashAccountSchema, updateCashAccountSchema } from "./cashAccount.schema";

export const cashAccountRouter = Router();
cashAccountRouter.use(requireAuth);

cashAccountRouter.get("/", async (req, res) => {
  const accounts = await prisma.cashAccount.findMany({
    where: { userId: req.auth!.userId },
    orderBy: { createdAt: "asc" },
  });
  res.json(accounts);
});

cashAccountRouter.get("/:id", async (req, res) => {
  const account = await prisma.cashAccount.findFirst({
    where: { id: req.params.id, userId: req.auth!.userId },
  });
  if (!account) throw ApiError.notFound("Kasa/banka hesabı bulunamadı");
  res.json(account);
});

cashAccountRouter.post("/", validateBody(createCashAccountSchema), async (req, res) => {
  const account = await prisma.cashAccount.create({
    data: { ...req.body, userId: req.auth!.userId },
  });
  res.status(201).json(account);
});

cashAccountRouter.patch("/:id", validateBody(updateCashAccountSchema), async (req, res) => {
  const existing = await prisma.cashAccount.findFirst({
    where: { id: req.params.id, userId: req.auth!.userId },
  });
  if (!existing) throw ApiError.notFound("Kasa/banka hesabı bulunamadı");

  const account = await prisma.cashAccount.update({
    where: { id: existing.id },
    data: req.body,
  });
  res.json(account);
});

cashAccountRouter.delete("/:id", async (req, res) => {
  const existing = await prisma.cashAccount.findFirst({
    where: { id: req.params.id, userId: req.auth!.userId },
  });
  if (!existing) throw ApiError.notFound("Kasa/banka hesabı bulunamadı");

  const txCount = await prisma.transaction.count({ where: { cashAccountId: existing.id } });
  if (txCount > 0) {
    throw ApiError.badRequest("Bu hesaba bağlı işlemler olduğu için silinemez, pasife alabilirsiniz");
  }

  await prisma.cashAccount.delete({ where: { id: existing.id } });
  res.status(204).send();
});
