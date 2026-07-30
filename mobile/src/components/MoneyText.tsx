import React from "react";
import { StyleProp, Text, TextStyle } from "react-native";
import { colors } from "../theme/theme";
import { formatCurrency } from "../utils/format";

interface MoneyTextProps {
  amount: number;
  size?: number;
  bold?: boolean;
  signed?: boolean;
  style?: StyleProp<TextStyle>;
}

export function MoneyText({ amount, size = 15, bold = true, signed = false, style }: MoneyTextProps) {
  const color = amount > 0 ? colors.income : amount < 0 ? colors.expense : colors.text;
  const prefix = signed && amount > 0 ? "+" : "";

  return (
    <Text style={[{ fontSize: size, fontWeight: bold ? "700" : "400", color: signed ? color : colors.text }, style]}>
      {prefix}
      {formatCurrency(amount)}
    </Text>
  );
}
