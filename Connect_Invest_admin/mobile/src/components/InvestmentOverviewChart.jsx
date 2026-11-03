import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Pure React Native Bar & Return Trends Widget
 * 100% Native Views - Zero compilation issues
 */
export default function InvestmentOverviewChart({
  trends = []
}) {
  const maxVal = trends.length > 0 ? Math.max(...trends.map(t => Math.max(t.invested || 0, t.returnVal || 0)), 1.0) : 1.0;

  if (!trends || trends.length === 0) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center', paddingVertical: 24 }]}>
        <Text style={{ fontSize: 11, color: '#94A3B8', fontStyle: 'italic' }}>
          No historical investment transactions available yet
        </Text>
      </View>
    );
  }

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
