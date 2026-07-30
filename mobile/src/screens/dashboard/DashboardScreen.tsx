import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../components/Screen";
import { Card } from "../../components/Card";
import { MoneyText } from "../../components/MoneyText";
import { BarChart } from "../../components/BarChart";
import { EmptyState } from "../../components/EmptyState";
import { Badge } from "../../components/Badge";
import { colors, spacing, typography } from "../../theme/theme";
import { getDashboardSummary } from "../../api/dashboard";
import { DashboardSummary } from "../../types/models";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../utils/format";

export function DashboardScreen() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const data = await getDashboardSummary(6);
      setSummary(data);
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading || !summary) {
    return (
      <Screen scroll={false}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen refreshing={refreshing} onRefresh={() => load(true)}>
      <Text style={styles.greeting}>Merhaba, {user?.fullName?.split(" ")[0]}</Text>
      {user?.companyName ? <Text style={styles.company}>{user.companyName}</Text> : null}

      <Card style={styles.heroCard}>
        <Text style={styles.heroLabel}>Net Değer</Text>
        <MoneyText amount={summary.netWorth} size={30} style={{ color: "#fff" }} />
        <View style={styles.heroRow}>
          <View>
            <Text style={styles.heroSubLabel}>Kasa/Banka</Text>
            <Text style={styles.heroSubValue}>{summary.totalCashBalance.toLocaleString("tr-TR")} ₺</Text>
          </View>
          <View>
            <Text style={styles.heroSubLabel}>Alacak</Text>
            <Text style={styles.heroSubValue}>{summary.totalReceivable.toLocaleString("tr-TR")} ₺</Text>
          </View>
          <View>
            <Text style={styles.heroSubLabel}>Borç</Text>
            <Text style={styles.heroSubValue}>{summary.totalPayable.toLocaleString("tr-TR")} ₺</Text>
          </View>
        </View>
      </Card>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Bu Ay Gelir</Text>
          <MoneyText amount={summary.currentMonth.income} size={18} />
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Bu Ay Gider</Text>
          <MoneyText amount={-summary.currentMonth.expense} size={18} />
        </Card>
      </View>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={styles.sectionTitle}>Son 6 Ay Gelir / Gider</Text>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.income }]} />
            <Text style={styles.legendText}>Gelir</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.expense }]} />
            <Text style={styles.legendText}>Gider</Text>
          </View>
        </View>
        <BarChart data={summary.monthlySeries} />
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={styles.sectionTitle}>Vadesi Yaklaşan / Açık Faturalar</Text>
        {summary.openInvoices.length === 0 ? (
          <EmptyState icon="checkmark-circle-outline" title="Açık faturanız yok" />
        ) : (
          summary.openInvoices.map((inv) => (
            <View key={inv.id} style={styles.listRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listTitle}>{inv.account.name}</Text>
                <Text style={styles.listSubtitle}>
                  {inv.invoiceNumber} · Vade: {inv.dueDate ? formatDate(inv.dueDate) : "-"}
                </Text>
              </View>
              <MoneyText amount={inv.total - inv.paidAmount} size={14} />
            </View>
          ))
        )}
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={styles.sectionTitle}>Son İşlemler</Text>
        {summary.recentTransactions.length === 0 ? (
          <EmptyState icon="swap-horizontal-outline" title="Henüz işlem yok" />
        ) : (
          summary.recentTransactions.map((tx) => (
            <View key={tx.id} style={styles.listRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listTitle}>{tx.description || tx.category?.name || "İşlem"}</Text>
                <Text style={styles.listSubtitle}>
                  {formatDate(tx.date)} · {tx.cashAccount.name}
                </Text>
              </View>
              {tx.type === "TRANSFER" ? (
                <Badge label="Transfer" color={colors.primary} backgroundColor={colors.primaryLight} />
              ) : (
                <MoneyText amount={tx.type === "INCOME" ? tx.amount : -tx.amount} signed size={14} />
              )}
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  greeting: { ...typography.h2, color: colors.text },
  company: { ...typography.body, color: colors.textMuted, marginTop: 2, marginBottom: spacing.md },
  heroCard: { backgroundColor: colors.primary, borderWidth: 0, marginTop: spacing.sm },
  heroLabel: { color: "#E0E7FF", fontSize: 13, marginBottom: 4 },
  heroRow: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.md },
  heroSubLabel: { color: "#C7D2FE", fontSize: 12 },
  heroSubValue: { color: "#fff", fontSize: 14, fontWeight: "700", marginTop: 2 },
  statsRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  statCard: { flex: 1 },
  statLabel: { ...typography.caption, color: colors.textMuted, marginBottom: 4 },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  legendRow: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.xs },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: colors.textMuted },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  listTitle: { ...typography.bodyBold, color: colors.text },
  listSubtitle: { ...typography.small, color: colors.textMuted, marginTop: 2 },
});
