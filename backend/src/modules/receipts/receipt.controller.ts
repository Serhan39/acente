import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validateBody } from "../../utils/validate";
import { scanReceiptSchema } from "./receipt.schema";
import * as receiptService from "./receipt.service";

export const receiptRouter = Router();
receiptRouter.use(requireAuth);

receiptRouter.post("/scan", validateBody(scanReceiptSchema), async (req, res) => {
  const result = await receiptService.scanReceipt(req.auth!.userId, req.body);
  res.json(result);
});
