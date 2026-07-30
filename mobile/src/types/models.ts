export type AccountType = "CUSTOMER" | "VENDOR" | "BOTH";
export type CashAccountType = "CASH" | "BANK";
export type CategoryType = "INCOME" | "EXPENSE";
export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";
export type InvoiceType = "SALE" | "PURCHASE";
export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "PARTIALLY_PAID" | "OVERDUE" | "CANCELLED";

export interface User {
  id: string;
  email: string;
  fullName: string;
  companyName?: string | null;
  createdAt: string;
}

export interface CashAccount {
  id: string;
  name: string;
  type: CashAccountType;
  currency: string;
  iban?: string | null;
  bankName?: string | null;
  balance: number;
  isActive: boolean;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  taxNumber?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  balance: number;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  description?: string | null;
  category?: Category | null;
  cashAccount: CashAccount;
  targetCashAccount?: CashAccount | null;
  account?: Account | null;
  invoiceId?: string | null;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: InvoiceType;
  status: InvoiceStatus;
  issueDate: string;
  dueDate?: string | null;
  subtotal: number;
  vatTotal: number;
  total: number;
  paidAmount: number;
  notes?: string | null;
  account: Account;
  items: InvoiceItem[];
  transactions?: Transaction[];
}

export interface DashboardSummary {
  totalCashBalance: number;
  cashAccounts: CashAccount[];
  totalReceivable: number;
  totalPayable: number;
  netWorth: number;
  currentMonth: { income: number; expense: number; net: number };
  monthlySeries: { month: string; income: number; expense: number; net: number }[];
  recentTransactions: Transaction[];
  openInvoices: Invoice[];
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
