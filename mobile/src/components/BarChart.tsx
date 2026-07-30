import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Line, Rect } from "react-native-svg";
import { colors, spacing } from "../theme/theme";
import { monthLabel } from "../utils/format";

interface Series {
  month: string;
  income: number;
  expense: number;
}

interface BarChartProps {
  data: Series[];
  height?: number;
}

export function BarChart({ data, height = 160 }: BarChartProps) {
  const maxValue = Math.max(1, ...data.flatMap((d) => [d.income, d.expense]));
  const barGroupWidth = 36;
  const barWidth = 12;
  const chartWidth = Math.max(data.length * barGroupWidth, 280);

  return (
    <View>
      <Svg width={chartWidth} height={height}>
        <Line x1={0} y1={height - 20} x2={chartWidth} y2={height - 20} stroke={colors.border} strokeWidth={1} />
        {data.map((item, index) => {
          const groupX = index * barGroupWidth + 8;
          const incomeHeight = (item.income / maxValue) * (height - 32);
          const expenseHeight = (item.expense / maxValue) * (height - 32);
          return (
            <React.Fragment key={item.month}>
              <Rect
                x={groupX}
                y={height - 20 - incomeHeight}
                width={barWidth}
                height={incomeHeight}
                rx={3}
                fill={colors.income}
              />
              <Rect
                x={groupX + barWidth + 4}
                y={height - 20 - expenseHeight}
                width={barWidth}
                height={expenseHeight}
                rx={3}
                fill={colors.expense}
              />
            </React.Fragment>
          );
        })}
      </Svg>
      <View style={[styles.labelsRow, { width: chartWidth }]}>
        {data.map((item) => (
          <Text key={item.month} style={styles.labelText}>
            {monthLabel(item.month)}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labelsRow: { flexDirection: "row", justifyContent: "space-around", marginTop: spacing.xs },
  labelText: { fontSize: 11, color: colors.textMuted },
});
