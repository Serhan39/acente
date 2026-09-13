import "express-async-errors";
import { Prisma } from "@prisma/client";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { authRouter } from "./modules/auth/auth.controller";
import { accountRouter } from "./modules/accounts/account.controller";
import { cashAccountRouter } from "./modules/cashAccounts/cashAccount.controller";
import { categoryRouter } from "./modules/categories/category.controller";
import { transactionRouter } from "./modules/transactions/transaction.controller";
import { invoiceRouter } from "./modules/invoices/invoice.controller";
import { dashboardRouter } from "./modules/dashboard/dashboard.controller";
import { receiptRouter } from "./modules/receipts/receipt.controller";

export const app = express();

// Prisma Decimal alanları (para tutarları) JSON'a number olarak yazılsın diye;
// aksi halde Decimal.toJSON() string döner ve mobil tarafta tip tutarsızlığına yol açar.
app.set("json replacer", function decimalReplacer(this: Record<string, unknown>, key: string, value: unknown) {
  const original = this[key];
  if (original instanceof Prisma.Decimal) {
    return original.toNumber();
  }
  return value;
});

app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
// Varsayılan 100kb limiti fiş fotoğrafı (base64) yüklemeleri için yetersiz kalıyor.
app.use(express.json({ limit: "8mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/cash-accounts", cashAccountRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/invoices", invoiceRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/receipts", receiptRouter);

app.use(notFoundHandler);
app.use(errorHandler);
