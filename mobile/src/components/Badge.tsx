import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme/theme";

interface BadgeProps {
  label: string;
  color?: string;
  backgroundColor?: string;
}

export function Badge({ label, color = colors.primary, backgroundColor = colors.primaryLight }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.full,
    alignSelf: "flex-start",
  },
  text: { fontSize: 12, fontWeight: "600" },
});
