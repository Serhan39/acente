import { apiClient } from "./client";
import { Account, AccountType, Transaction } from "../types/models";

export function listAccounts(params?: { search?: string; type?: AccountType }) {
  return apiClient.get<Account[]>("/accounts", { params }).then((r) => r.data);
}

export function getAccount(id: string) {
  return apiClient.get<Account>(`/accounts/${id}`).then((r) => r.data);
}

export function getAccountTransactions(id: string) {
  return apiClient.get<Transaction[]>(`/accounts/${id}/transactions`).then((r) => r.data);
}

export function createAccount(input: {
  name: string;
  type: AccountType;
  taxNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
}) {
  return apiClient.post<Account>("/accounts", input).then((r) => r.data);
}

export function updateAccount(id: string, input: Partial<Account>) {
  return apiClient.patch<Account>(`/accounts/${id}`, input).then((r) => r.data);
}

export function deleteAccount(id: string) {
  return apiClient.delete(`/accounts/${id}`);
}
