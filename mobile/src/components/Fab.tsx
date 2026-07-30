import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "../theme/theme";

export function Fab({ onPress, icon = "add" }: { onPress: () => void; icon?: keyof typeof Ionicons.glyphMap }) {
  return (
    <Pressable style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]} onPress={onPress}>
      <Ionicons name={icon} size={26} color="#fff" />
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
