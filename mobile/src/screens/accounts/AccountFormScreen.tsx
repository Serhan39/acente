import React, { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "../../components/Screen";
import { TextField } from "../../components/TextField";
import { SelectField } from "../../components/SelectField";
import { Button } from "../../components/Button";
import { colors, spacing } from "../../theme/theme";
import { createAccount, getAccount, updateAccount } from "../../api/accounts";
import { getErrorMessage } from "../../api/client";
import { AccountType } from "../../types/models";
import { AccountsStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AccountsStackParamList, "AccountForm">;

const TYPE_OPTIONS = [
  { label: "Müşteri", value: "CUSTOMER" },
  { label: "Tedarikçi", value: "VENDOR" },
  { label: "Müşteri/Tedarikçi", value: "BOTH" },
];

export function AccountFormScreen({ route, navigation }: Props) {
  const editingId = route.params?.id;
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("CUSTOMER");
  const [taxNumber, setTaxNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({ title: editingId ? "Cari Hesabı Düzenle" : "Yeni Cari Hesap" });
  }, [navigation, editingId]);

  useEffect(() => {
    if (!editingId) return;
    getAccount(editingId).then((acc) => {
      setName(acc.name);
      setType(acc.type);
      setTaxNumber(acc.taxNumber || "");
      setPhone(acc.phone || "");
      setEmail(acc.email || "");
      setAddress(acc.address || "");
    });
  }, [editingId]);

  async function handleSubmit() {
    setError(null);
    if (!name.trim()) {
      setError("Cari hesap adı gerekli");
      return;
    }
    setSaving(true);
    const payload = {
      name: name.trim(),
      type,
      taxNumber: taxNumber || undefined,
      phone: phone || undefined,
      email: email || undefined,
      address: address || undefined,
    };
    try {
      if (editingId) {
        await updateAccount(editingId, payload);
      } else {
        await createAccount(payload);
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
      <TextField label="Ad Soyad / Ünvan" placeholder="Örn: ABC Ticaret Ltd. Şti." value={name} onChangeText={setName} />
      <SelectField label="Tür" value={type} onChange={(v) => setType(v as AccountType)} options={TYPE_OPTIONS} />
      <TextField label="Vergi/TC Kimlik No" value={taxNumber} onChangeText={setTaxNumber} />
      <TextField label="Telefon" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <TextField label="E-posta" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextField label="Adres" multiline numberOfLines={3} value={address} onChangeText={setAddress} />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button label={editingId ? "Güncelle" : "Kaydet"} onPress={handleSubmit} loading={saving} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.expense, marginBottom: spacing.sm, textAlign: "center" },
});
