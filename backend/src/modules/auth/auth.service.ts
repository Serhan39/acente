import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { LoginInput, RegisterInput } from "./auth.schema";

function toPublicUser(user: { id: string; email: string; fullName: string; companyName: string | null; createdAt: Date }) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    companyName: user.companyName,
    createdAt: user.createdAt,
  };
}

function signToken(userId: string, email: string) {
  return jwt.sign({ userId, email }, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions);
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw ApiError.conflict("Bu e-posta adresi zaten kayıtlı");
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      fullName: input.fullName,
      companyName: input.companyName,
    },
  });

  const defaultCategories = [
    { name: "Satış Geliri", type: "INCOME" as const, color: "#16A34A", icon: "trending-up" },
    { name: "Diğer Gelir", type: "INCOME" as const, color: "#0EA5E9", icon: "plus-circle" },
    { name: "Kira", type: "EXPENSE" as const, color: "#DC2626", icon: "home" },
    { name: "Fatura/Gider", type: "EXPENSE" as const, color: "#EA580C", icon: "file-text" },
    { name: "Maaş/Personel", type: "EXPENSE" as const, color: "#7C3AED", icon: "users" },
    { name: "Vergi/SGK", type: "EXPENSE" as const, color: "#475569", icon: "shield" },
  ];

  await prisma.$transaction([
    prisma.category.createMany({
      data: defaultCategories.map((c) => ({ ...c, userId: user.id })),
    }),
    prisma.cashAccount.create({
      data: { userId: user.id, name: "Kasa", type: "CASH", currency: "TRY" },
    }),
  ]);

  const token = signToken(user.id, user.email);
  return { user: toPublicUser(user), token };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw ApiError.unauthorized("E-posta veya şifre hatalı");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.password);
  if (!passwordMatches) {
    throw ApiError.unauthorized("E-posta veya şifre hatalı");
  }

  const token = signToken(user.id, user.email);
  return { user: toPublicUser(user), token };
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw ApiError.notFound("Kullanıcı bulunamadı");
  }
  return toPublicUser(user);
}

export async function updateProfile(userId: string, data: { fullName?: string; companyName?: string }) {
  const user = await prisma.user.update({ where: { id: userId }, data });
  return toPublicUser(user);
}
