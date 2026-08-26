import { apiClient } from "./client";
import { ReceiptScanResult } from "../types/models";

export interface ScanReceiptInput {
  base64: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
}

export function scanReceipt(input: ScanReceiptInput) {
  return apiClient
    .post<ReceiptScanResult>(
      "/receipts/scan",
      { image: input.base64, mimeType: input.mimeType },
      { timeout: 45000 },
    )
    .then((r) => r.data);
}
