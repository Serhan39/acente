import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/Button";
import { TextField } from "../../components/TextField";
import { colors, spacing, typography } from "../../theme/theme";
import { getErrorMessage } from "../../api/client";
import { AuthStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!email || !password) {
      setError("E-posta ve şifre gerekli");
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
    } catch (e) {
      setError(getErrorMessage(e, "Giriş yapılamadı"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.container}>
        <Text style={styles.appName}>Acente Muhasebe</Text>
        <Text style={styles.subtitle}>Hesabınıza giriş yapın</Text>

        <View style={styles.form}>
          <TextField
            label="E-posta"
            placeholder="ornek@sirket.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextField
            label="Şifre"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button label="Giriş Yap" onPress={handleSubmit} loading={loading} style={{ marginTop: spacing.sm }} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Hesabınız yok mu?</Text>
          <Button label="Kayıt Ol" variant="ghost" onPress={() => navigation.navigate("Register")} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, justifyContent: "center", padding: spacing.lg },
  appName: { ...typography.h1, color: colors.primary, textAlign: "center" },
  subtitle: { ...typography.body, color: colors.textMuted, textAlign: "center", marginTop: spacing.xs, marginBottom: spacing.xl },
  form: { marginTop: spacing.md },
  error: { color: colors.expense, marginBottom: spacing.sm, textAlign: "center" },
  footer: { alignItems: "center", marginTop: spacing.lg, flexDirection: "row", justifyContent: "center", gap: spacing.xs },
  footerText: { color: colors.textMuted },
});
