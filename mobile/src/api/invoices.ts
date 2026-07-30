import { apiClient } from "./client";
import { Invoice, InvoiceStatus, InvoiceType, Paginated, Transaction } from "../types/models";

export interface InvoiceFilters {
  status?: InvoiceStatus;
  type?: InvoiceType;
  accountId?: string;
  page?: number;
  pageSize?: number;
}

export function listInvoices(filters: InvoiceFilters = {}) {
  return apiClient.get<Paginated<Invoice>>("/invoices", { params: filters }).then((r) => r.data);
}

export function getInvoice(id: string) {
  return apiClient.get<Invoice>(`/invoices/${id}`).then((r) => r.data);
}

export interface CreateInvoiceInput {
  accountId: string;
  type: InvoiceType;
  invoiceNumber?: string;
  issueDate?: string;
  dueDate?: string;
  notes?: string;
  items: { description: string; quantity: number; unitPrice: number; vatRate: number }[];
}

export function createInvoice(input: CreateInvoiceInput) {
  return apiClient.post<Invoice>("/invoices", input).then((r) => r.data);
}

export function recordInvoicePayment(
  id: string,
  input: { amount: number; cashAccountId: string; date?: string; description?: string },
) {
  return apiClient
    .post<{ invoice: Invoice; transaction: Transaction }>(`/invoices/${id}/payments`, input)
    .then((r) => r.data);
}

export function cancelInvoice(id: string) {
  return apiClient.post<Invoice>(`/invoices/${id}/cancel`).then((r) => r.data);
}

export function deleteInvoice(id: string) {
  return apiClient.delete(`/invoices/${id}`);
}
