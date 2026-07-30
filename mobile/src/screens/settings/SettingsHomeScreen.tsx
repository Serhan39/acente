import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../components/Screen";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { colors, spacing, typography } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";
import { SettingsStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<SettingsStackParamList, "SettingsHome">;

export function SettingsHomeScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();

  function handleSignOut() {
    Alert.alert("Çıkış yap", "Hesabınızdan çıkış yapmak istediğinize emin misiniz?", [
      { text: "Vazgeç", style: "cancel" },
      { text: "Çıkış Yap", style: "destructive", onPress: signOut },
    ]);
  }

  return (
    <Screen>
      <Card>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.fullName?.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.fullName}</Text>
        {user?.companyName ? <Text style={styles.company}>{user.companyName}</Text> : null}
        <Text style={styles.email}>{user?.email}</Text>
      </Card>

      <Text style={styles.sectionTitle}>Yönetim</Text>
      <Card style={{ padding: 0 }}>
        <MenuRow icon="wallet-outline" label="Kasa / Banka Hesapları" onPress={() => navigation.navigate("CashAccounts")} />
        <View style={styles.rowDivider} />
        <MenuRow icon="pricetags-outline" label="Kategoriler" onPress={() => navigation.navigate("Categories")} />
      </Card>

      <Button label="Çıkış Yap" variant="danger" onPress={handleSignOut} style={{ marginTop: spacing.lg }} />
    </Screen>
  );
}

function MenuRow({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.menuRow} onPress={onPress}>
      <Ionicons name={icon} size={20} color={colors.primary} style={{ marginRight: spacing.sm }} />
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  avatarText: { color: colors.primary, fontSize: 22, fontWeight: "700" },
  name: { ...typography.h3, color: colors.text },
  company: { ...typography.body, color: colors.textMuted, marginTop: 2 },
  email: { ...typography.caption, color: colors.textLight, marginTop: 4 },
  sectionTitle: { ...typography.bodyBold, color: colors.textMuted, marginTop: spacing.lg, marginBottom: spacing.sm },
  menuRow: { flexDirection: "row", alignItems: "center", padding: spacing.md },
  menuLabel: { ...typography.body, color: colors.text, flex: 1 },
  rowDivider: { height: 1, backgroundColor: colors.border },
});
