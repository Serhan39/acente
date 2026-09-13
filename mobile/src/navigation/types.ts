export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type DashboardStackParamList = {
  DashboardHome: undefined;
};

export type TransactionsStackParamList = {
  TransactionsList: undefined;
  TransactionForm:
    | {
        id?: string;
        prefill?: {
          type: "INCOME" | "EXPENSE";
          amount: number;
          date?: string;
          description?: string;
          categoryId?: string;
        };
      }
    | undefined;
  ReceiptScan: undefined;
};

export type AccountsStackParamList = {
  AccountsList: undefined;
  AccountForm: { id?: string } | undefined;
  AccountDetail: { id: string };
};

export type InvoicesStackParamList = {
  InvoicesList: undefined;
  InvoiceForm: undefined;
  InvoiceDetail: { id: string };
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
  CashAccounts: undefined;
  CashAccountForm: { id?: string } | undefined;
  Categories: undefined;
};

export type MainTabParamList = {
  DashboardTab: undefined;
  TransactionsTab: undefined;
  AccountsTab: undefined;
  InvoicesTab: undefined;
  SettingsTab: undefined;
};
