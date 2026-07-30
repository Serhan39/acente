import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validateBody, validateQuery } from "../../utils/validate";
import { createInvoiceSchema, listInvoicesQuerySchema, recordPaymentSchema } from "./invoice.schema";
import * as invoiceService from "./invoice.service";

export const invoiceRouter = Router();
invoiceRouter.use(requireAuth);

invoiceRouter.get("/", validateQuery(listInvoicesQuerySchema), async (req, res) => {
  const query = req.query as unknown as {
    status?: "DRAFT" | "SENT" | "PAID" | "PARTIALLY_PAID" | "OVERDUE" | "CANCELLED";
    type?: "SALE" | "PURCHASE";
    accountId?: string;
    page: number;
    pageSize: number;
  };
  const result = await invoiceService.listInvoices(req.auth!.userId, query);
  res.json(result);
});

invoiceRouter.get("/:id", async (req, res) => {
  const invoice = await invoiceService.getInvoice(req.auth!.userId, req.params.id);
  res.json(invoice);
});

invoiceRouter.post("/", validateBody(createInvoiceSchema), async (req, res) => {
  const invoice = await invoiceService.createInvoice(req.auth!.userId, req.body);
  res.status(201).json(invoice);
});

invoiceRouter.post("/:id/payments", validateBody(recordPaymentSchema), async (req, res) => {
  const result = await invoiceService.recordPayment(req.auth!.userId, req.params.id, req.body);
  res.status(201).json(result);
});

invoiceRouter.post("/:id/cancel", async (req, res) => {
  const invoice = await invoiceService.cancelInvoice(req.auth!.userId, req.params.id);
  res.json(invoice);
});

invoiceRouter.delete("/:id", async (req, res) => {
  await invoiceService.deleteInvoice(req.auth!.userId, req.params.id);
  res.status(204).send();
});
