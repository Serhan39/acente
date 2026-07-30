import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, typography } from "../../theme/theme";
import { listAccounts } from "../../api/accounts";
import { Account } from "../../types/models";
import { MoneyText } from "../../components/MoneyText";
import { EmptyState } from "../../components/EmptyState";
import { Fab } from "../../components/Fab";
import { TextField } from "../../components/TextField";
import { AccountsStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AccountsStackParamList, "AccountsList">;

export function AccountsListScreen({ navigation }: Props) {
  const [items, setItems] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async (query?: string) => {
    setLoading(true);
    try {
      const result = await listAccounts(query ? { search: query } : undefined);
      setItems(result);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(search);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cari Hesaplar</Text>
      </View>
      <View style={styles.searchWrap}>
        <TextField
          placeholder="Müşteri/tedarikçi ara"
          value={search}
          onChangeText={(v) => {
            setSearch(v);
            load(v);
          }}
          style={{ marginBottom: 0 }}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}
          ListEmptyComponent={<EmptyState icon="people-outline" title="Cari hesap yok" subtitle="Sağ alttaki + ile ekleyin" />}
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => navigation.navigate("AccountDetail", { id: item.id })}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.subtitle}>{item.type === "CUSTOMER" ? "Müşteri" : item.type === "VENDOR" ? "Tedarikçi" : "Müşteri/Tedarikçi"}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <MoneyText amount={item.balance} size={14} />
                <Text style={styles.balanceHint}>{item.balance > 0 ? "alacak" : item.balance < 0 ? "borç" : ""}</Text>
              </View>
            </Pressable>
          )}
        />
      )}

      <Fab onPress={() => navigation.navigate("AccountForm", undefined)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  headerTitle: { ...typography.h2, color: colors.text },
  searchWrap: { paddingHorizontal: spacing.md, marginTop: spacing.sm },
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  avatarText: { color: colors.primary, fontWeight: "700" },
  title: { ...typography.bodyBold, color: colors.text },
  subtitle: { ...typography.small, color: colors.textMuted, marginTop: 2 },
  balanceHint: { ...typography.small, color: colors.textLight, marginTop: 2 },
});
