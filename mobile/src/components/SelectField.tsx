import React, { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../theme/theme";

export interface SelectOption {
  label: string;
  value: string;
  subtitle?: string;
}

interface SelectFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  error?: string;
}

export function SelectField({ label, placeholder = "Seçin", value, options, onChange, error }: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable style={[styles.input, error && styles.inputError]} onPress={() => setOpen(true)}>
        <Text style={selected ? styles.valueText : styles.placeholderText} numberOfLines={1}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label || placeholder}</Text>
              <Pressable onPress={() => setOpen(false)}>
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </Pressable>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              style={{ maxHeight: 360 }}
              ListEmptyComponent={<Text style={styles.emptyText}>Kayıt bulunamadı</Text>}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.option}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optionLabel}>{item.label}</Text>
                    {item.subtitle ? <Text style={styles.optionSubtitle}>{item.subtitle}</Text> : null}
                  </View>
                  {item.value === value ? <Ionicons name="checkmark" size={20} color={colors.primary} /> : null}
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { ...typography.bodyBold, color: colors.text, marginBottom: spacing.xs },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputError: { borderColor: colors.expense },
  valueText: { fontSize: 15, color: colors.text, flex: 1 },
  placeholderText: { fontSize: 15, color: colors.textLight, flex: 1 },
  error: { color: colors.expense, fontSize: 12, marginTop: spacing.xs },
  backdrop: { flex: 1, backgroundColor: "rgba(15,23,42,0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sheetTitle: { ...typography.h3, color: colors.text },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionLabel: { fontSize: 15, color: colors.text },
  optionSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  emptyText: { textAlign: "center", color: colors.textMuted, paddingVertical: spacing.lg },
});
