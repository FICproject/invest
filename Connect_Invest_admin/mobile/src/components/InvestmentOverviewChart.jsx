import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Pure React Native Bar & Return Trends Widget
 * 100% Native Views - Zero compilation issues
 */
export default function InvestmentOverviewChart({
  trends = [
    { month: 'Jan', invested: 0.52, returnVal: 0.28 },
    { month: 'Feb', invested: 0.68, returnVal: 0.45 },
    { month: 'Mar', invested: 0.85, returnVal: 0.52 },
    { month: 'Apr', invested: 1.05, returnVal: 0.65 },
    { month: 'May', invested: 1.25, returnVal: 0.82 },
    { month: 'Jun', invested: 1.35, returnVal: 0.95 },
    { month: 'Jul', invested: 1.45, returnVal: 1.30 }
  ]
}) {
  const maxVal = 2.0;

  return (
    <View style={styles.container}>
      {/* Legend Row */}
      <View style={styles.legendRow}>
        <View style={styles.legendGroup}>
          <View style={[styles.dot, { backgroundColor: '#0047BA' }]} />
          <Text style={styles.legendText}>Invested Amount</Text>
        </View>
        <View style={styles.legendGroup}>
          <View style={[styles.dot, { backgroundColor: '#FAB800' }]} />
          <Text style={styles.legendText}>Returns</Text>
        </View>
      </View>

      {/* Bar Chart Area */}
      <View style={styles.chartArea}>
        {trends.map((item, index) => {
          const barHeightPct = Math.min(100, (item.invested / maxVal) * 100);
          return (
            <View key={`trend-${index}`} style={styles.barColumn}>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { height: `${barHeightPct}%` }]} />
              </View>
              <Text style={styles.monthText}>{item.month}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginBottom: 12
  },
  legendGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  legendText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569'
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 4
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end'
  },
  barTrack: {
    width: 14,
    height: 85,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden'
  },
  barFill: {
    width: '100%',
    backgroundColor: '#0047BA',
    borderRadius: 4
  },
  monthText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 6
  }
});
