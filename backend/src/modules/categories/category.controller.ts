import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { validateBody } from "../../utils/validate";
import { createCategorySchema, updateCategorySchema } from "./category.schema";

export const categoryRouter = Router();
categoryRouter.use(requireAuth);

categoryRouter.get("/", async (req, res) => {
  const { type } = req.query;
  const categories = await prisma.category.findMany({
    where: {
      userId: req.auth!.userId,
      ...(type ? { type: type as "INCOME" | "EXPENSE" } : {}),
    },
    orderBy: { name: "asc" },
  });
  res.json(categories);
});

categoryRouter.post("/", validateBody(createCategorySchema), async (req, res) => {
  const category = await prisma.category.create({
    data: { ...req.body, userId: req.auth!.userId },
  });
  res.status(201).json(category);
});

categoryRouter.patch("/:id", validateBody(updateCategorySchema), async (req, res) => {
  const existing = await prisma.category.findFirst({
    where: { id: req.params.id, userId: req.auth!.userId },
  });
  if (!existing) throw ApiError.notFound("Kategori bulunamadı");

  const category = await prisma.category.update({
    where: { id: existing.id },
    data: req.body,
  });
  res.json(category);
});

categoryRouter.delete("/:id", async (req, res) => {
  const existing = await prisma.category.findFirst({
    where: { id: req.params.id, userId: req.auth!.userId },
  });
  if (!existing) throw ApiError.notFound("Kategori bulunamadı");

  await prisma.category.delete({ where: { id: existing.id } });
  res.status(204).send();
});
