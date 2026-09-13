import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, typography } from "../../theme/theme";
import { listTransactions } from "../../api/transactions";
import { Transaction, TransactionType } from "../../types/models";
import { MoneyText } from "../../components/MoneyText";
import { Badge } from "../../components/Badge";
import { EmptyState } from "../../components/EmptyState";
import { Fab } from "../../components/Fab";
import { formatDate } from "../../utils/format";
import { TransactionsStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<TransactionsStackParamList, "TransactionsList">;

const FILTERS: { label: string; value: TransactionType | undefined }[] = [
  { label: "Tümü", value: undefined },
  { label: "Gelir", value: "INCOME" },
  { label: "Gider", value: "EXPENSE" },
  { label: "Transfer", value: "TRANSFER" },
];

export function TransactionsListScreen({ navigation }: Props) {
  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TransactionType | undefined>(undefined);

  const load = useCallback(async (type?: TransactionType) => {
    setLoading(true);
    try {
      const result = await listTransactions({ type, pageSize: 50 });
      setItems(result.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(filter);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]),
  );

  function renderItem({ item }: { item: Transaction }) {
    const isTransfer = item.type === "TRANSFER";
    return (
      <Pressable
        style={styles.row}
        onPress={() => navigation.navigate("TransactionForm", { id: item.id })}
      >
        <View style={[styles.iconWrap, { backgroundColor: isTransfer ? colors.primaryLight : item.type === "INCOME" ? colors.incomeLight : colors.expenseLight }]}>
          <Text style={{ fontSize: 16 }}>{isTransfer ? "🔁" : item.type === "INCOME" ? "⬆️" : "⬇️"}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>
            {item.description || item.category?.name || (isTransfer ? "Hesaplar arası transfer" : "İşlem")}
          </Text>
          <Text style={styles.subtitle}>
            {formatDate(item.date)} · {item.cashAccount.name}
            {item.account ? ` · ${item.account.name}` : ""}
          </Text>
        </View>
        {isTransfer ? (
          <Badge label="Transfer" />
        ) : (
          <MoneyText amount={item.type === "INCOME" ? item.amount : -item.amount} signed size={15} />
        )}
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gelir / Gider</Text>
      </View>

      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.label}
            style={[styles.filterChip, filter === f.value && styles.filterChipActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.filterText, filter === f.value && styles.filterTextActive]}>{f.label}</Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}
          ListEmptyComponent={<EmptyState icon="swap-horizontal-outline" title="Henüz işlem yok" subtitle="Sağ alttaki + ile ekleyin" />}
        />
      )}

      <Fab
        icon="camera"
        size={48}
        style={{ right: 20, bottom: 92 }}
        onPress={() => navigation.navigate("ReceiptScan")}
      />
      <Fab onPress={() => navigation.navigate("TransactionForm", undefined)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  headerTitle: { ...typography.h2, color: colors.text },
  filters: { flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.md, marginTop: spacing.sm },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 13, color: colors.textMuted },
  filterTextActive: { color: "#fff", fontWeight: "600" },
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
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginRight: spacing.sm },
  title: { ...typography.bodyBold, color: colors.text },
  subtitle: { ...typography.small, color: colors.textMuted, marginTop: 2 },
});
