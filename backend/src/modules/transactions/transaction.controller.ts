import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validateBody, validateQuery } from "../../utils/validate";
import {
  createTransactionSchema,
  listTransactionsQuerySchema,
  updateTransactionSchema,
} from "./transaction.schema";
import * as transactionService from "./transaction.service";

export const transactionRouter = Router();
transactionRouter.use(requireAuth);

transactionRouter.get("/", validateQuery(listTransactionsQuerySchema), async (req, res) => {
  const query = req.query as unknown as {
    type?: "INCOME" | "EXPENSE" | "TRANSFER";
    cashAccountId?: string;
    accountId?: string;
    categoryId?: string;
    from?: Date;
    to?: Date;
    page: number;
    pageSize: number;
  };
  const result = await transactionService.listTransactions(req.auth!.userId, query);
  res.json(result);
});

transactionRouter.get("/:id", async (req, res) => {
  const transaction = await transactionService.getTransaction(req.auth!.userId, req.params.id);
  res.json(transaction);
});

transactionRouter.post("/", validateBody(createTransactionSchema), async (req, res) => {
  const transaction = await transactionService.createTransaction(req.auth!.userId, req.body);
  res.status(201).json(transaction);
});

transactionRouter.patch("/:id", validateBody(updateTransactionSchema), async (req, res) => {
  const transaction = await transactionService.updateTransaction(req.auth!.userId, req.params.id, req.body);
  res.json(transaction);
});

transactionRouter.delete("/:id", async (req, res) => {
  await transactionService.deleteTransaction(req.auth!.userId, req.params.id);
  res.status(204).send();
});
