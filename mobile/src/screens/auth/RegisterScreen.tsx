import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/Button";
import { TextField } from "../../components/TextField";
import { colors, spacing, typography } from "../../theme/theme";
import { getErrorMessage } from "../../api/client";
import { AuthStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export function RegisterScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!fullName || !email || !password) {
      setError("Ad soyad, e-posta ve şifre gerekli");
      return;
    }
    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalı");
      return;
    }
    setLoading(true);
    try {
      await signUp({ fullName, companyName: companyName || undefined, email: email.trim().toLowerCase(), password });
    } catch (e) {
      setError(getErrorMessage(e, "Kayıt oluşturulamadı"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.appName}>Hesap Oluştur</Text>
        <Text style={styles.subtitle}>Muhasebenizi yönetmeye hemen başlayın</Text>

        <View style={styles.form}>
          <TextField label="Ad Soyad" placeholder="Adınız Soyadınız" value={fullName} onChangeText={setFullName} />
          <TextField
            label="İşletme Adı (opsiyonel)"
            placeholder="Şirket / işletme adı"
            value={companyName}
            onChangeText={setCompanyName}
          />
          <TextField
            label="E-posta"
            placeholder="ornek@sirket.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextField label="Şifre" placeholder="En az 6 karakter" secureTextEntry value={password} onChangeText={setPassword} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button label="Kayıt Ol" onPress={handleSubmit} loading={loading} style={{ marginTop: spacing.sm }} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Zaten hesabınız var mı?</Text>
          <Button label="Giriş Yap" variant="ghost" onPress={() => navigation.navigate("Login")} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, justifyContent: "center", padding: spacing.lg },
  appName: { ...typography.h1, color: colors.primary, textAlign: "center" },
  subtitle: { ...typography.body, color: colors.textMuted, textAlign: "center", marginTop: spacing.xs, marginBottom: spacing.xl },
  form: { marginTop: spacing.md },
  error: { color: colors.expense, marginBottom: spacing.sm, textAlign: "center" },
  footer: { alignItems: "center", marginTop: spacing.lg, flexDirection: "row", justifyContent: "center", gap: spacing.xs },
  footerText: { color: colors.textMuted },
});
