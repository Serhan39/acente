import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../components/Screen";
import { TextField } from "../../components/TextField";
import { SelectField } from "../../components/SelectField";
import { DateField } from "../../components/DateField";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { colors, spacing, typography } from "../../theme/theme";
import { listAccounts } from "../../api/accounts";
import { createInvoice } from "../../api/invoices";
import { getErrorMessage } from "../../api/client";
import { Account, InvoiceType } from "../../types/models";
import { formatCurrency } from "../../utils/format";
import { InvoicesStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<InvoicesStackParamList, "InvoiceForm">;

interface ItemDraft {
  key: string;
  description: string;
  quantity: string;
  unitPrice: string;
  vatRate: string;
}

function emptyItem(): ItemDraft {
  return { key: Math.random().toString(36).slice(2), description: "", quantity: "1", unitPrice: "", vatRate: "20" };
}

const TYPE_OPTIONS: { label: string; value: InvoiceType }[] = [
  { label: "Satış Faturası", value: "SALE" },
  { label: "Alış Faturası", value: "PURCHASE" },
];

export function InvoiceFormScreen({ navigation }: Props) {
  const [type, setType] = useState<InvoiceType>("SALE");
  const [accountId, setAccountId] = useState("");
  const [issueDate, setIssueDate] = useState(new Date());
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ItemDraft[]>([emptyItem()]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listAccounts().then(setAccounts);
  }, []);

  function updateItem(key: string, patch: Partial<ItemDraft>) {
    setItems((prev) => prev.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  function removeItem(key: string) {
    setItems((prev) => (prev.length > 1 ? prev.filter((item) => item.key !== key) : prev));
  }

  const parsedItems = items.map((item) => ({
    description: item.description,
    quantity: Number(item.quantity.replace(",", ".")) || 0,
    unitPrice: Number(item.unitPrice.replace(",", ".")) || 0,
    vatRate: Number(item.vatRate.replace(",", ".")) || 0,
  }));

  const subtotal = parsedItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const vatTotal = parsedItems.reduce((sum, i) => sum + i.quantity * i.unitPrice * (i.vatRate / 100), 0);
  const total = subtotal + vatTotal;

  async function handleSubmit() {
    setError(null);
    if (!accountId) {
      setError("Cari hesap seçin");
      return;
    }
    if (parsedItems.some((i) => !i.description || i.unitPrice <= 0 || i.quantity <= 0)) {
      setError("Tüm kalemler için açıklama, miktar ve birim fiyat girin");
      return;
    }

    setSaving(true);
    try {
      await createInvoice({
        accountId,
        type,
        issueDate: issueDate.toISOString(),
        dueDate: dueDate ? dueDate.toISOString() : undefined,
        notes: notes || undefined,
        items: parsedItems,
      });
      navigation.goBack();
    } catch (e) {
      setError(getErrorMessage(e, "Fatura oluşturulamadı"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <View style={styles.typeRow}>
        {TYPE_OPTIONS.map((t) => (
          <Pressable
            key={t.value}
            style={[styles.typeChip, type === t.value && styles.typeChipActive]}
            onPress={() => setType(t.value)}
          >
            <Text style={[styles.typeText, type === t.value && styles.typeTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <SelectField
        label="Cari Hesap"
        value={accountId}
        onChange={setAccountId}
        options={accounts.map((a) => ({ label: a.name, value: a.id }))}
      />
      <DateField label="Fatura Tarihi" value={issueDate} onChange={setIssueDate} />
      <DateField label="Vade Tarihi" value={dueDate || issueDate} onChange={setDueDate} />

      <Text style={styles.sectionTitle}>Kalemler</Text>
      {items.map((item, index) => (
        <Card key={item.key} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemIndex}>#{index + 1}</Text>
            {items.length > 1 && (
              <Pressable onPress={() => removeItem(item.key)}>
                <Ionicons name="trash-outline" size={18} color={colors.expense} />
              </Pressable>
            )}
          </View>
          <TextField
            placeholder="Ürün/hizmet açıklaması"
            value={item.description}
            onChangeText={(v) => updateItem(item.key, { description: v })}
            style={{ marginBottom: spacing.sm }}
          />
          <View style={styles.itemRow}>
            <TextField
              placeholder="Miktar"
              keyboardType="decimal-pad"
              value={item.quantity}
              onChangeText={(v) => updateItem(item.key, { quantity: v })}
              style={styles.itemField}
            />
            <TextField
              placeholder="Birim Fiyat"
              keyboardType="decimal-pad"
              value={item.unitPrice}
              onChangeText={(v) => updateItem(item.key, { unitPrice: v })}
              style={styles.itemField}
            />
            <TextField
              placeholder="KDV %"
              keyboardType="decimal-pad"
              value={item.vatRate}
              onChangeText={(v) => updateItem(item.key, { vatRate: v })}
              style={styles.itemField}
            />
          </View>
        </Card>
      ))}

      <Button label="+ Kalem Ekle" variant="secondary" onPress={() => setItems((prev) => [...prev, emptyItem()])} />

      <Card style={{ marginTop: spacing.md }}>
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Ara Toplam</Text>
          <Text style={styles.totalsValue}>{formatCurrency(subtotal)}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>KDV</Text>
          <Text style={styles.totalsValue}>{formatCurrency(vatTotal)}</Text>
        </View>
        <View style={[styles.totalsRow, { marginTop: spacing.xs }]}>
          <Text style={styles.grandTotalLabel}>Genel Toplam</Text>
          <Text style={styles.grandTotalValue}>{formatCurrency(total)}</Text>
        </View>
      </Card>

      <TextField
        label="Notlar"
        placeholder="Opsiyonel"
        multiline
        numberOfLines={3}
        value={notes}
        onChangeText={setNotes}
        style={{ marginTop: spacing.md }}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button label="Faturayı Oluştur" onPress={handleSubmit} loading={saving} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  typeRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  typeChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeText: { ...typography.bodyBold, color: colors.textMuted },
  typeTextActive: { color: "#fff" },
  sectionTitle: { ...typography.h3, color: colors.text, marginTop: spacing.sm, marginBottom: spacing.sm },
  itemCard: { marginBottom: spacing.sm },
  itemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xs },
  itemIndex: { ...typography.caption, color: colors.textMuted },
  itemRow: { flexDirection: "row", gap: spacing.sm },
  itemField: { flex: 1, marginBottom: 0 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  totalsLabel: { color: colors.textMuted, fontSize: 14 },
  totalsValue: { color: colors.text, fontSize: 14, fontWeight: "600" },
  grandTotalLabel: { ...typography.bodyBold, color: colors.text },
  grandTotalValue: { ...typography.h3, color: colors.primary },
  error: { color: colors.expense, marginBottom: spacing.sm, textAlign: "center", marginTop: spacing.md },
});
