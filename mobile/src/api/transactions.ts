import { apiClient } from "./client";
import { Paginated, Transaction, TransactionType } from "../types/models";

export interface TransactionFilters {
  type?: TransactionType;
  cashAccountId?: string;
  accountId?: string;
  categoryId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export function listTransactions(filters: TransactionFilters = {}) {
  return apiClient.get<Paginated<Transaction>>("/transactions", { params: filters }).then((r) => r.data);
}

export function getTransaction(id: string) {
  return apiClient.get<Transaction>(`/transactions/${id}`).then((r) => r.data);
}

export interface CreateTransactionInput {
  type: TransactionType;
  amount: number;
  date?: string;
  description?: string;
  categoryId?: string;
  cashAccountId: string;
  targetCashAccountId?: string;
  accountId?: string;
}

export function createTransaction(input: CreateTransactionInput) {
  return apiClient.post<Transaction>("/transactions", input).then((r) => r.data);
}

export function updateTransaction(id: string, input: Partial<CreateTransactionInput>) {
  return apiClient.patch<Transaction>(`/transactions/${id}`, input).then((r) => r.data);
}

export function deleteTransaction(id: string) {
  return apiClient.delete(`/transactions/${id}`);
}
