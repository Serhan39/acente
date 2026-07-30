import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../components/Screen";
import { Card } from "../../components/Card";
import { TextField } from "../../components/TextField";
import { Button } from "../../components/Button";
import { colors, spacing, typography } from "../../theme/theme";
import { createCategory, deleteCategory, listCategories } from "../../api/categories";
import { Category, CategoryType } from "../../types/models";
import { getErrorMessage } from "../../api/client";

export function CategoriesScreen() {
  const [income, setIncome] = useState<Category[]>([]);
  const [expense, setExpense] = useState<Category[]>([]);
  const [activeType, setActiveType] = useState<CategoryType>("EXPENSE");
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [inc, exp] = await Promise.all([listCategories("INCOME"), listCategories("EXPENSE")]);
    setIncome(inc);
    setExpense(exp);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleAdd() {
    setError(null);
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await createCategory({ name: newName.trim(), type: activeType });
      setNewName("");
      load();
    } catch (e) {
      setError(getErrorMessage(e, "Kategori eklenemedi"));
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(id: string) {
    Alert.alert("Kategoriyi sil", "Bu kategoriyi silmek istediğinize emin misiniz?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCategory(id);
            load();
          } catch (e) {
            Alert.alert("Hata", getErrorMessage(e, "Kategori silinemedi"));
          }
        },
      },
    ]);
  }

  const list = activeType === "INCOME" ? income : expense;

  return (
    <Screen>
      <View style={styles.typeRow}>
        <Pressable
          style={[styles.typeChip, activeType === "EXPENSE" && styles.typeChipActive]}
          onPress={() => setActiveType("EXPENSE")}
        >
          <Text style={[styles.typeText, activeType === "EXPENSE" && styles.typeTextActive]}>Gider Kategorileri</Text>
        </Pressable>
        <Pressable
          style={[styles.typeChip, activeType === "INCOME" && styles.typeChipActive]}
          onPress={() => setActiveType("INCOME")}
        >
          <Text style={[styles.typeText, activeType === "INCOME" && styles.typeTextActive]}>Gelir Kategorileri</Text>
        </Pressable>
      </View>

      <Card>
        <View style={styles.addRow}>
          <TextField
            placeholder="Yeni kategori adı"
            value={newName}
            onChangeText={setNewName}
            style={{ flex: 1, marginBottom: 0 }}
          />
          <Button label="Ekle" onPress={handleAdd} loading={saving} style={styles.addButton} />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </Card>

      <Card style={{ marginTop: spacing.md, padding: 0 }}>
        {list.map((cat, index) => (
          <View key={cat.id}>
            <View style={styles.catRow}>
              <View style={[styles.dot, { backgroundColor: cat.color }]} />
              <Text style={styles.catName}>{cat.name}</Text>
              <Pressable onPress={() => handleDelete(cat.id)}>
                <Ionicons name="trash-outline" size={18} color={colors.textLight} />
              </Pressable>
            </View>
            {index < list.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  typeRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  typeChip: { flex: 1, paddingVertical: spacing.sm, borderRadius: 10, alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  typeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeText: { ...typography.bodyBold, color: colors.textMuted, fontSize: 13 },
  typeTextActive: { color: "#fff" },
  addRow: { flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" },
  addButton: { paddingHorizontal: spacing.md },
  error: { color: colors.expense, marginTop: spacing.sm },
  catRow: { flexDirection: "row", alignItems: "center", padding: spacing.md, gap: spacing.sm },
  catName: { ...typography.body, color: colors.text, flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: spacing.md },
});
