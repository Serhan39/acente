import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../components/Screen";
import { Card } from "../../components/Card";
import { MoneyText } from "../../components/MoneyText";
import { EmptyState } from "../../components/EmptyState";
import { Button } from "../../components/Button";
import { colors, spacing, typography } from "../../theme/theme";
import { getAccount, getAccountTransactions } from "../../api/accounts";
import { listInvoices } from "../../api/invoices";
import { Account, Transaction } from "../../types/models";
import { formatDate } from "../../utils/format";
import { AccountsStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AccountsStackParamList, "AccountDetail">;

interface LedgerEntry {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  delta: number;
}

export function AccountDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const [account, setAccount] = useState<Account | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [acc, txs, invoiceResult] = await Promise.all([
        getAccount(id),
        getAccountTransactions(id),
        listInvoices({ accountId: id, pageSize: 100 }),
      ]);
      setAccount(acc);
      navigation.setOptions({ title: acc.name });

      const transactionEntries: LedgerEntry[] = txs
        .filter((tx: Transaction) => !tx.invoiceId)
        .map((tx) => ({
          id: `tx-${tx.id}`,
          date: tx.date,
          title: tx.description || tx.category?.name || (tx.type === "INCOME" ? "Tahsilat" : "Ödeme"),
          subtitle: tx.cashAccount.name,
          delta: tx.type === "INCOME" ? -tx.amount : tx.amount,
        }));

      const invoiceEntries: LedgerEntry[] = invoiceResult.items
        .filter((inv) => inv.status !== "CANCELLED")
        .map((inv) => ({
          id: `inv-${inv.id}`,
          date: inv.issueDate,
          title: `${inv.invoiceNumber} numaralı fatura`,
          subtitle: inv.type === "SALE" ? "Satış faturası" : "Alış faturası",
          delta: inv.type === "SALE" ? inv.total : -inv.total,
        }));

      const paymentEntries: LedgerEntry[] = txs
        .filter((tx: Transaction) => !!tx.invoiceId)
        .map((tx) => ({
          id: `pay-${tx.id}`,
          date: tx.date,
          title: tx.description || (tx.type === "INCOME" ? "Fatura tahsilatı" : "Fatura ödemesi"),
          subtitle: tx.cashAccount.name,
          delta: tx.type === "INCOME" ? -tx.amount : tx.amount,
        }));

      const combined = [...transactionEntries, ...invoiceEntries, ...paymentEntries].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      setLedger(combined);
    } finally {
      setLoading(false);
    }
  }, [id, navigation]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading || !account) {
    return (
      <Screen scroll={false}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Card>
        <Text style={styles.balanceLabel}>{account.balance >= 0 ? "Alacağınız" : "Borcunuz"}</Text>
        <MoneyText amount={Math.abs(account.balance)} size={28} />
        <View style={styles.infoRow}>
          {account.phone ? <Text style={styles.infoText}>📞 {account.phone}</Text> : null}
          {account.email ? <Text style={styles.infoText}>✉️ {account.email}</Text> : null}
          {account.taxNumber ? <Text style={styles.infoText}>🧾 {account.taxNumber}</Text> : null}
          {account.address ? <Text style={styles.infoText}>📍 {account.address}</Text> : null}
        </View>
        <Button
          label="Bilgileri Düzenle"
          variant="secondary"
          onPress={() => navigation.navigate("AccountForm", { id: account.id })}
          style={{ marginTop: spacing.md }}
        />
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={styles.sectionTitle}>Hesap Ekstresi</Text>
        {ledger.length === 0 ? (
          <EmptyState icon="receipt-outline" title="Hareket bulunamadı" />
        ) : (
          ledger.map((entry) => (
            <View key={entry.id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{entry.title}</Text>
                <Text style={styles.rowSubtitle}>
                  {formatDate(entry.date)} · {entry.subtitle}
                </Text>
              </View>
              <MoneyText amount={entry.delta} signed size={14} />
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  balanceLabel: { ...typography.caption, color: colors.textMuted, marginBottom: 4 },
  infoRow: { marginTop: spacing.md, gap: 4 },
  infoText: { ...typography.caption, color: colors.textMuted },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowTitle: { ...typography.bodyBold, color: colors.text },
  rowSubtitle: { ...typography.small, color: colors.textMuted, marginTop: 2 },
});
