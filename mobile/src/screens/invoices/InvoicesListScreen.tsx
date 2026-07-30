import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, typography } from "../../theme/theme";
import { listInvoices } from "../../api/invoices";
import { Invoice, InvoiceType } from "../../types/models";
import { MoneyText } from "../../components/MoneyText";
import { Badge } from "../../components/Badge";
import { EmptyState } from "../../components/EmptyState";
import { Fab } from "../../components/Fab";
import { formatDate } from "../../utils/format";
import { InvoicesStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<InvoicesStackParamList, "InvoicesList">;

const TYPE_FILTERS: { label: string; value: InvoiceType | undefined }[] = [
  { label: "Tümü", value: undefined },
  { label: "Satış", value: "SALE" },
  { label: "Alış", value: "PURCHASE" },
];

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: "Taslak", color: colors.textMuted, bg: colors.border },
  SENT: { label: "Açık", color: colors.warning, bg: colors.warningLight },
  PARTIALLY_PAID: { label: "Kısmi Ödendi", color: colors.primary, bg: colors.primaryLight },
  PAID: { label: "Ödendi", color: colors.income, bg: colors.incomeLight },
  OVERDUE: { label: "Vadesi Geçti", color: colors.expense, bg: colors.expenseLight },
  CANCELLED: { label: "İptal", color: colors.textMuted, bg: colors.border },
};

export function InvoicesListScreen({ navigation }: Props) {
  const [items, setItems] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<InvoiceType | undefined>(undefined);

  const load = useCallback(async (filterType?: InvoiceType) => {
    setLoading(true);
    try {
      const result = await listInvoices({ type: filterType, pageSize: 50 });
      setItems(result.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(type);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type]),
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Faturalar</Text>
      </View>

      <View style={styles.filters}>
        {TYPE_FILTERS.map((f) => (
          <Pressable
            key={f.label}
            style={[styles.filterChip, type === f.value && styles.filterChipActive]}
            onPress={() => setType(f.value)}
          >
            <Text style={[styles.filterText, type === f.value && styles.filterTextActive]}>{f.label}</Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}
          ListEmptyComponent={<EmptyState icon="document-text-outline" title="Fatura yok" subtitle="Sağ alttaki + ile fatura kesin" />}
          renderItem={({ item }) => {
            const status = STATUS_LABELS[item.status];
            return (
              <Pressable style={styles.row} onPress={() => navigation.navigate("InvoiceDetail", { id: item.id })}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{item.account.name}</Text>
                  <Text style={styles.subtitle}>
                    {item.invoiceNumber} · {formatDate(item.issueDate)} · {item.type === "SALE" ? "Satış" : "Alış"}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <MoneyText amount={item.total} size={14} bold />
                  <Badge label={status.label} color={status.color} backgroundColor={status.bg} />
                </View>
              </Pressable>
            );
          }}
        />
      )}

      <Fab onPress={() => navigation.navigate("InvoiceForm")} />
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
  title: { ...typography.bodyBold, color: colors.text },
  subtitle: { ...typography.small, color: colors.textMuted, marginTop: 2 },
});
