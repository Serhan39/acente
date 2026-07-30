import { apiClient } from "./client";
import { CashAccount } from "../types/models";

export function listCashAccounts() {
  return apiClient.get<CashAccount[]>("/cash-accounts").then((r) => r.data);
}

export function createCashAccount(input: {
  name: string;
  type: "CASH" | "BANK";
  currency?: string;
  iban?: string;
  bankName?: string;
  balance?: number;
}) {
  return apiClient.post<CashAccount>("/cash-accounts", input).then((r) => r.data);
}

export function updateCashAccount(id: string, input: Partial<CashAccount>) {
  return apiClient.patch<CashAccount>(`/cash-accounts/${id}`, input).then((r) => r.data);
}

export function deleteCashAccount(id: string) {
  return apiClient.delete(`/cash-accounts/${id}`);
}
