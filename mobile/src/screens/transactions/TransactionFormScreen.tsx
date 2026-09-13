import React, { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "../../components/Screen";
import { TextField } from "../../components/TextField";
import { SelectField } from "../../components/SelectField";
import { DateField } from "../../components/DateField";
import { Button } from "../../components/Button";
import { colors, spacing, typography } from "../../theme/theme";
import { listCashAccounts } from "../../api/cashAccounts";
import { listAccounts } from "../../api/accounts";
import { listCategories } from "../../api/categories";
import { createTransaction, deleteTransaction, getTransaction, updateTransaction } from "../../api/transactions";
import { Account, CashAccount, Category, TransactionType } from "../../types/models";
import { getErrorMessage } from "../../api/client";
import { TransactionsStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<TransactionsStackParamList, "TransactionForm">;

const TYPES: { label: string; value: TransactionType }[] = [
  { label: "Gelir", value: "INCOME" },
  { label: "Gider", value: "EXPENSE" },
  { label: "Transfer", value: "TRANSFER" },
];

export function TransactionFormScreen({ route, navigation }: Props) {
  const editingId = route.params?.id;
  const prefill = route.params?.prefill;
  const [type, setType] = useState<TransactionType>(prefill?.type ?? "INCOME");
  const [amount, setAmount] = useState(prefill ? String(prefill.amount) : "");
  const [date, setDate] = useState(() => {
    if (prefill?.date) {
      const parsed = new Date(prefill.date);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  });
  const [description, setDescription] = useState(prefill?.description ?? "");
  const [cashAccountId, setCashAccountId] = useState("");
  const [targetCashAccountId, setTargetCashAccountId] = useState("");
  const [categoryId, setCategoryId] = useState(prefill?.categoryId ?? "");
  const [accountId, setAccountId] = useState("");

  const [cashAccounts, setCashAccounts] = useState<CashAccount[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [cashList, accountList] = await Promise.all([listCashAccounts(), listAccounts()]);
        setCashAccounts(cashList);
        setAccounts(accountList);
        if (cashList.length > 0 && !editingId) setCashAccountId(cashList[0].id);

        if (editingId) {
          const tx = await getTransaction(editingId);
          setType(tx.type);
          setAmount(String(tx.amount));
          setDate(new Date(tx.date));
          setDescription(tx.description || "");
          setCashAccountId(tx.cashAccount.id);
          if (tx.targetCashAccount) setTargetCashAccountId(tx.targetCashAccount.id);
          if (tx.category) setCategoryId(tx.category.id);
          if (tx.account) setAccountId(tx.account.id);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [editingId]);

  useEffect(() => {
    if (type === "TRANSFER") return;
    listCategories(type).then(setCategories);
  }, [type]);

  useEffect(() => {
    navigation.setOptions({ title: editingId ? "İşlemi Düzenle" : "Yeni İşlem" });
  }, [navigation, editingId]);

  async function handleSubmit() {
    setError(null);
    const numericAmount = Number(amount.replace(",", "."));
    if (!numericAmount || numericAmount <= 0) {
      setError("Geçerli bir tutar girin");
      return;
    }
    if (!cashAccountId) {
      setError("Kasa/banka hesabı seçin");
      return;
    }
    if (type === "TRANSFER" && !targetCashAccountId) {
      setError("Hedef hesap seçin");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateTransaction(editingId, {
          amount: numericAmount,
          date: date.toISOString(),
          description: description || undefined,
          categoryId: categoryId || undefined,
          accountId: accountId || undefined,
        });
      } else {
        await createTransaction({
          type,
          amount: numericAmount,
          date: date.toISOString(),
          description: description || undefined,
          cashAccountId,
          targetCashAccountId: type === "TRANSFER" ? targetCashAccountId : undefined,
          categoryId: type === "TRANSFER" ? undefined : categoryId || undefined,
          accountId: type === "TRANSFER" ? undefined : accountId || undefined,
        });
      }
      navigation.goBack();
    } catch (e) {
      setError(getErrorMessage(e, "İşlem kaydedilemedi"));
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!editingId) return;
    Alert.alert("İşlemi sil", "Bu işlemi silmek istediğinize emin misiniz?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTransaction(editingId);
            navigation.goBack();
          } catch (e) {
            Alert.alert("Hata", getErrorMessage(e, "İşlem silinemedi"));
          }
        },
      },
    ]);
  }

  if (loading) return null;

  return (
    <Screen>
      {!editingId && (
        <View style={styles.typeRow}>
          {TYPES.map((t) => (
            <Pressable
              key={t.value}
              style={[styles.typeChip, type === t.value && styles.typeChipActive]}
              onPress={() => setType(t.value)}
            >
              <Text style={[styles.typeText, type === t.value && styles.typeTextActive]}>{t.label}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <TextField
        label="Tutar (₺)"
        placeholder="0.00"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
      />
      <DateField label="Tarih" value={date} onChange={setDate} />
      <TextField label="Açıklama" placeholder="Opsiyonel" value={description} onChangeText={setDescription} />

      {!editingId && (
        <SelectField
          label={type === "TRANSFER" ? "Kaynak Hesap" : "Kasa/Banka"}
          value={cashAccountId}
          onChange={setCashAccountId}
          options={cashAccounts.map((c) => ({ label: c.name, value: c.id, subtitle: `${c.balance.toLocaleString("tr-TR")} ₺` }))}
        />
      )}

      {!editingId && type === "TRANSFER" && (
        <SelectField
          label="Hedef Hesap"
          value={targetCashAccountId}
          onChange={setTargetCashAccountId}
          options={cashAccounts
            .filter((c) => c.id !== cashAccountId)
            .map((c) => ({ label: c.name, value: c.id, subtitle: `${c.balance.toLocaleString("tr-TR")} ₺` }))}
        />
      )}

      {type !== "TRANSFER" && (
        <>
          <SelectField
            label="Kategori"
            placeholder="Kategori seçin (opsiyonel)"
            value={categoryId}
            onChange={setCategoryId}
            options={categories.map((c) => ({ label: c.name, value: c.id }))}
          />
          <SelectField
            label="Cari Hesap"
            placeholder="Müşteri/tedarikçi seçin (opsiyonel)"
            value={accountId}
            onChange={setAccountId}
            options={accounts.map((a) => ({ label: a.name, value: a.id }))}
          />
        </>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button label={editingId ? "Güncelle" : "Kaydet"} onPress={handleSubmit} loading={saving} />
      {editingId && (
        <Button label="Sil" variant="danger" onPress={handleDelete} style={{ marginTop: spacing.sm }} />
      )}
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
  error: { color: colors.expense, marginBottom: spacing.sm, textAlign: "center" },
});
