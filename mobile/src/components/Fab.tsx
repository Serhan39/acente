import React from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "../theme/theme";

interface FabProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  size?: number;
}

export function Fab({ onPress, icon = "add", style, size = 56 }: FabProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.fab, { width: size, height: size, borderRadius: size / 2 }, style, pressed && { opacity: 0.85 }]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={size === 56 ? 26 : 22} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
});
