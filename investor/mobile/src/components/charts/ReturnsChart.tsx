import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Line, Text as SvgText, Circle } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { RADIUS, SPACING } from '../../theme/spacing';
import { formatCurrency } from '../../utils/formatters';

interface ReturnsChartProps {
  data: { month: string; amount: number }[];
  title?: string;
}

export const ReturnsChart: React.FC<ReturnsChartProps> = ({
  data = [],
  title = 'Returns Progression (Last 6 Months)',
}) => {
  if (!data || data.length === 0) {
    return null;
  }

  const chartHeight = 150;
  const chartWidth = 320;
  const paddingBottom = 26;
  const paddingTop = 15;
  const availableHeight = chartHeight - paddingBottom - paddingTop;

  const maxAmount = Math.max(...data.map((d) => d.amount), 1000);
  const barWidth = 24;
  const spacing = (chartWidth - data.length * barWidth) / (data.length + 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartWrapper}>
        <Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          {/* Baseline grid */}
          <Line
            x1="10"
            y1={chartHeight - paddingBottom}
            x2={chartWidth - 10}
            y2={chartHeight - paddingBottom}
            stroke={COLORS.border}
            strokeWidth="1"
          />

          {data.map((item, index) => {
            const barHeight = Math.max(6, (item.amount / maxAmount) * availableHeight);
            const x = spacing + index * (barWidth + spacing);
            const y = chartHeight - paddingBottom - barHeight;

            return (
              <React.Fragment key={index}>
                {/* Bar */}
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={4}
                  fill={index === data.length - 1 ? COLORS.gold : COLORS.primary}
                />

                {/* Amount indicator pill dot on top of current month */}
                {index === data.length - 1 && (
                  <Circle
                    cx={x + barWidth / 2}
                    cy={y - 6}
                    r={3}
                    fill={COLORS.gold}
                  />
                )}

                {/* Month label */}
                <SvgText
                  x={x + barWidth / 2}
                  y={chartHeight - 6}
                  fontSize="11"
                  fill={COLORS.textSecondary}
                  textAnchor="middle"
                  fontWeight={index === data.length - 1 ? '700' : '500'}
                >
                  {item.month}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
          <Text style={styles.legendText}>Historical Payouts</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.gold }]} />
          <Text style={styles.legendText}>Current Month</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});

export default ReturnsChart;
