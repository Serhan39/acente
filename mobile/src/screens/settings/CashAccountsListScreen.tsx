import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../../theme/theme";
import { listCashAccounts } from "../../api/cashAccounts";
import { CashAccount } from "../../types/models";
import { MoneyText } from "../../components/MoneyText";
import { EmptyState } from "../../components/EmptyState";
import { Fab } from "../../components/Fab";
import { Screen } from "../../components/Screen";
import { SettingsStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<SettingsStackParamList, "CashAccounts">;

export function CashAccountsListScreen({ navigation }: Props) {
  const [items, setItems] = useState<CashAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listCashAccounts());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <Screen scroll={false} style={{ padding: 0 }}>
      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}
          ListEmptyComponent={<EmptyState icon="wallet-outline" title="Kasa/banka hesabı yok" />}
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => navigation.navigate("CashAccountForm", { id: item.id })}>
              <View style={styles.iconWrap}>
                <Text style={{ fontSize: 18 }}>{item.type === "CASH" ? "💵" : "🏦"}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.subtitle}>{item.type === "CASH" ? "Kasa" : item.bankName || "Banka"}</Text>
              </View>
              <MoneyText amount={item.balance} size={15} />
            </Pressable>
          )}
        />
      )}
      <Fab onPress={() => navigation.navigate("CashAccountForm", undefined)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.sm + 2,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryLight, alignItems: "center", justifyContent: "center", marginRight: spacing.sm },
  title: { ...typography.bodyBold, color: colors.text },
  subtitle: { ...typography.small, color: colors.textMuted, marginTop: 2 },
});
