import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../theme/theme";
import { formatDate } from "../utils/format";

interface DateFieldProps {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
}

export function DateField({ label, value, onChange }: DateFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable style={styles.input} onPress={() => setOpen(true)}>
        <Text style={styles.valueText}>{formatDate(value)}</Text>
        <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
      </Pressable>
      {open && (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={(event, selected) => {
            setOpen(Platform.OS === "ios");
            if (event.type === "dismissed") {
              setOpen(false);
              return;
            }
            if (selected) onChange(selected);
            if (Platform.OS === "android") setOpen(false);
          }}
        />
      )}
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
  valueText: { fontSize: 15, color: colors.text },
});
