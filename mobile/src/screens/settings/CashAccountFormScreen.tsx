import React, { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "../../components/Screen";
import { TextField } from "../../components/TextField";
import { SelectField } from "../../components/SelectField";
import { Button } from "../../components/Button";
import { colors, spacing } from "../../theme/theme";
import { createCashAccount, listCashAccounts, updateCashAccount } from "../../api/cashAccounts";
import { getErrorMessage } from "../../api/client";
import { CashAccountType } from "../../types/models";
import { SettingsStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<SettingsStackParamList, "CashAccountForm">;

export function CashAccountFormScreen({ route, navigation }: Props) {
  const editingId = route.params?.id;
  const [name, setName] = useState("");
  const [type, setType] = useState<CashAccountType>("CASH");
  const [bankName, setBankName] = useState("");
  const [iban, setIban] = useState("");
  const [balance, setBalance] = useState("0");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({ title: editingId ? "Hesabı Düzenle" : "Yeni Kasa/Banka" });
  }, [navigation, editingId]);

  useEffect(() => {
    if (!editingId) return;
    listCashAccounts().then((all) => {
      const acc = all.find((a) => a.id === editingId);
      if (acc) {
        setName(acc.name);
        setType(acc.type);
        setBankName(acc.bankName || "");
        setIban(acc.iban || "");
        setBalance(String(acc.balance));
      }
    });
  }, [editingId]);

  async function handleSubmit() {
    setError(null);
    if (!name.trim()) {
      setError("Hesap adı gerekli");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateCashAccount(editingId, { name: name.trim(), type, bankName: bankName || undefined, iban: iban || undefined });
      } else {
        await createCashAccount({
          name: name.trim(),
          type,
          bankName: bankName || undefined,
          iban: iban || undefined,
          balance: Number(balance.replace(",", ".")) || 0,
        });
      }
      navigation.goBack();
    } catch (e) {
      setError(getErrorMessage(e, "Kaydedilemedi"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <TextField label="Hesap Adı" placeholder="Örn: İş Bankası Vadesiz" value={name} onChangeText={setName} />
      <SelectField
        label="Tür"
        value={type}
        onChange={(v) => setType(v as CashAccountType)}
        options={[
          { label: "Kasa (Nakit)", value: "CASH" },
          { label: "Banka Hesabı", value: "BANK" },
        ]}
      />
      {type === "BANK" && (
        <>
          <TextField label="Banka Adı" value={bankName} onChangeText={setBankName} />
          <TextField label="IBAN" autoCapitalize="characters" value={iban} onChangeText={setIban} />
        </>
      )}
      {!editingId && (
        <TextField label="Açılış Bakiyesi (₺)" keyboardType="decimal-pad" value={balance} onChangeText={setBalance} />
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button label={editingId ? "Güncelle" : "Kaydet"} onPress={handleSubmit} loading={saving} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.expense, marginBottom: spacing.sm, textAlign: "center" },
});
