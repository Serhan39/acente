import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "Kategori adı gerekli"),
  type: z.enum(["INCOME", "EXPENSE"]),
  color: z.string().default("#4F46E5"),
  icon: z.string().default("tag"),
});

export const updateCategorySchema = createCategorySchema.partial();
