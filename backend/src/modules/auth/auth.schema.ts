import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(2, "Ad soyad en az 2 karakter olmalı"),
  companyName: z.string().optional(),
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

export const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(1, "Şifre girin"),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  companyName: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
