import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../components/Screen";
import { Card } from "../../components/Card";
import { MoneyText } from "../../components/MoneyText";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { TextField } from "../../components/TextField";
import { SelectField } from "../../components/SelectField";
import { colors, spacing, typography } from "../../theme/theme";
import { cancelInvoice, getInvoice, recordInvoicePayment } from "../../api/invoices";
import { listCashAccounts } from "../../api/cashAccounts";
import { CashAccount, Invoice } from "../../types/models";
import { formatCurrency, formatDate } from "../../utils/format";
import { getErrorMessage } from "../../api/client";
import { InvoicesStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<InvoicesStackParamList, "InvoiceDetail">;

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: "Taslak", color: colors.textMuted, bg: colors.border },
  SENT: { label: "Açık", color: colors.warning, bg: colors.warningLight },
  PARTIALLY_PAID: { label: "Kısmi Ödendi", color: colors.primary, bg: colors.primaryLight },
  PAID: { label: "Ödendi", color: colors.income, bg: colors.incomeLight },
  OVERDUE: { label: "Vadesi Geçti", color: colors.expense, bg: colors.expenseLight },
  CANCELLED: { label: "İptal", color: colors.textMuted, bg: colors.border },
};

export function InvoiceDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [cashAccounts, setCashAccounts] = useState<CashAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentCashAccountId, setPaymentCashAccountId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [inv, cash] = await Promise.all([getInvoice(id), listCashAccounts()]);
      setInvoice(inv);
      setCashAccounts(cash);
      if (cash.length > 0) setPaymentCashAccountId(cash[0].id);
      navigation.setOptions({ title: inv.invoiceNumber });
    } finally {
      setLoading(false);
    }
  }, [id, navigation]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleRecordPayment() {
    if (!invoice) return;
    setError(null);
    const amount = Number(paymentAmount.replace(",", "."));
    if (!amount || amount <= 0) {
      setError("Geçerli bir tutar girin");
      return;
    }
    if (!paymentCashAccountId) {
      setError("Kasa/banka hesabı seçin");
      return;
    }
    setSaving(true);
    try {
      await recordInvoicePayment(invoice.id, { amount, cashAccountId: paymentCashAccountId });
      setShowPaymentForm(false);
      setPaymentAmount("");
      load();
    } catch (e) {
      setError(getErrorMessage(e, "Ödeme kaydedilemedi"));
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (!invoice) return;
    Alert.alert("Faturayı iptal et", "Bu faturayı iptal etmek istediğinize emin misiniz?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "İptal Et",
        style: "destructive",
        onPress: async () => {
          try {
            await cancelInvoice(invoice.id);
            load();
          } catch (e) {
            Alert.alert("Hata", getErrorMessage(e, "Fatura iptal edilemedi"));
          }
        },
      },
    ]);
  }

  if (loading || !invoice) {
    return (
      <Screen scroll={false}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </Screen>
    );
  }

  const status = STATUS_LABELS[invoice.status];
  const remaining = invoice.total - invoice.paidAmount;
  const canRecordPayment = invoice.status !== "CANCELLED" && invoice.status !== "PAID" && remaining > 0;
  const canCancel = invoice.status !== "CANCELLED" && invoice.paidAmount === 0;

  return (
    <Screen>
      <Card>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.accountName}>{invoice.account.name}</Text>
            <Text style={styles.invoiceMeta}>
              {invoice.type === "SALE" ? "Satış Faturası" : "Alış Faturası"} · {formatDate(invoice.issueDate)}
            </Text>
          </View>
          <Badge label={status.label} color={status.color} backgroundColor={status.bg} />
        </View>

        {invoice.dueDate ? <Text style={styles.dueDate}>Vade: {formatDate(invoice.dueDate)}</Text> : null}

        <View style={styles.divider} />

        {invoice.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemDesc}>{item.description}</Text>
              <Text style={styles.itemMeta}>
                {item.quantity} x {formatCurrency(item.unitPrice)} · KDV %{item.vatRate}
              </Text>
            </View>
            <Text style={styles.itemTotal}>{formatCurrency(item.total)}</Text>
          </View>
        ))}

        <View style={styles.divider} />

        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Ara Toplam</Text>
          <Text style={styles.totalsValue}>{formatCurrency(invoice.subtotal)}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>KDV</Text>
          <Text style={styles.totalsValue}>{formatCurrency(invoice.vatTotal)}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={styles.grandTotalLabel}>Genel Toplam</Text>
          <Text style={styles.grandTotalValue}>{formatCurrency(invoice.total)}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Ödenen</Text>
          <Text style={styles.totalsValue}>{formatCurrency(invoice.paidAmount)}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Kalan</Text>
          <MoneyText amount={remaining} size={14} />
        </View>

        {invoice.notes ? <Text style={styles.notes}>{invoice.notes}</Text> : null}
      </Card>

      {canRecordPayment && (
        <Card style={{ marginTop: spacing.md }}>
          {!showPaymentForm ? (
            <Button
              label={invoice.type === "SALE" ? "Tahsilat Kaydet" : "Ödeme Kaydet"}
              onPress={() => setShowPaymentForm(true)}
            />
          ) : (
            <View>
              <TextField
                label="Tutar (₺)"
                placeholder={String(remaining)}
                keyboardType="decimal-pad"
                value={paymentAmount}
                onChangeText={setPaymentAmount}
              />
              <SelectField
                label="Kasa/Banka"
                value={paymentCashAccountId}
                onChange={setPaymentCashAccountId}
                options={cashAccounts.map((c) => ({ label: c.name, value: c.id }))}
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Button label="Kaydet" onPress={handleRecordPayment} loading={saving} />
              <Button label="Vazgeç" variant="ghost" onPress={() => setShowPaymentForm(false)} />
            </View>
          )}
        </Card>
      )}

      {invoice.transactions && invoice.transactions.length > 0 && (
        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.sectionTitle}>Ödeme Geçmişi</Text>
          {invoice.transactions.map((tx) => (
            <View key={tx.id} style={styles.paymentRow}>
              <Text style={styles.itemMeta}>
                {formatDate(tx.date)} · {tx.cashAccount.name}
              </Text>
              <Text style={styles.itemTotal}>{formatCurrency(tx.amount)}</Text>
            </View>
          ))}
        </Card>
      )}

      {canCancel && (
        <Button label="Faturayı İptal Et" variant="danger" onPress={handleCancel} style={{ marginTop: spacing.md }} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  accountName: { ...typography.h3, color: colors.text },
  invoiceMeta: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  dueDate: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  itemRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  itemDesc: { ...typography.body, color: colors.text },
  itemMeta: { ...typography.small, color: colors.textMuted, marginTop: 2 },
  itemTotal: { ...typography.bodyBold, color: colors.text },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  totalsLabel: { color: colors.textMuted, fontSize: 14 },
  totalsValue: { color: colors.text, fontSize: 14, fontWeight: "600" },
  grandTotalLabel: { ...typography.bodyBold, color: colors.text },
  grandTotalValue: { ...typography.h3, color: colors.primary },
  notes: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm, fontStyle: "italic" },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  paymentRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderTopWidth: 1, borderTopColor: colors.border },
  error: { color: colors.expense, marginBottom: spacing.sm, textAlign: "center" },
});
