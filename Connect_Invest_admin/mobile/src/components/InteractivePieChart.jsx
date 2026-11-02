import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * Pixel-Perfect Smooth Multi-Segment Donut Chart
 * Replicates the web dashboard's crisp vector donut chart with:
 * - 100% mathematically smooth outer and inner circular borders
 * - Crisp radial cuts and clean white dividers between slices
 * - Interactive slice spotlight on tap
 * - Centered dynamic amount and label readout
 * - Unclipped, fully legible legend with right-aligned percentages
 */
export default function InteractivePieChart({
  data = [],
  size = 138,
  centerLabel = '₹0',
  centerSublabel = 'Total Invested'
}) {
  const [selectedIdx, setSelectedIdx] = useState(null);

  const total = useMemo(() => {
    return data.reduce((acc, d) => acc + (d.value || 0), 0) || 1;
  }, [data]);

  // Compute start and end fractions for each slice
  const { sliceRanges, dividerAngles } = useMemo(() => {
    let running = 0;
    const dividers = [];
    const ranges = data.map((item, idx) => {
      const fraction = (item.value || 0) / total;
      const start = running;
      running += fraction;
      // Divider at the boundary
      const divAngle = (start * 360) - 90;
      dividers.push(divAngle);
      return {
        ...item,
        originalIdx: idx,
        start,
        end: running,
        percentage: Math.round(fraction * 100)
      };
    });
    return { sliceRanges: ranges, dividerAngles: dividers };
  }, [data, total]);

  // Generate 240 dense radial bars spanning 360 degrees
  // Each bar is rotated around the center and radially clipped
  const barCount = 240;
  const barWidth = 3.0; // 3px width guarantees seamless overlap around circumference
  const innerSize = Math.round(size * 0.62); // 62% inner hole diameter (matching web)
  const thickness = Math.round((size - innerSize) / 2) + 4;

  const radialSlices = useMemo(() => {
    if (!sliceRanges || sliceRanges.length === 0) {
      return null;
    }
    const bars = [];
    for (let i = 0; i < barCount; i++) {
      const frac = i / barCount;
      const angleDeg = (frac * 360) - 90; // Start at 12 o'clock

      const slice =
        sliceRanges.find(s => frac >= s.start && frac < s.end) ||
        sliceRanges[sliceRanges.length - 1];

      if (!slice) continue;

      const isSelected = selectedIdx !== null && selectedIdx === slice.originalIdx;
      const isDimmed = selectedIdx !== null && selectedIdx !== slice.originalIdx;
      const sliceColor = slice.color || '#0047BA';

      bars.push(
        <View
          key={`bar-${i}`}
          style={[
            styles.radialBarContainer,
            {
              width: size,
              height: size,
              transform: [{ rotate: `${angleDeg}deg` }]
            }
          ]}
          pointerEvents="none"
        >
          <View
            style={[
              styles.radialBar,
              {
                left: (size - barWidth) / 2,
                width: barWidth,
                height: thickness,
                backgroundColor: sliceColor,
                opacity: isDimmed ? 0.35 : 1
              }
            ]}
          />
        </View>
      );
    }
    return bars;
  }, [size, barCount, sliceRanges, selectedIdx, thickness]);

  // Clean white dividers between slices (matching web's stroke="#FFFFFF" strokeWidth={2.5})
  const dividers = useMemo(() => {
    return dividerAngles.map((angle, idx) => (
      <View
        key={`div-${idx}`}
        style={[
          styles.radialBarContainer,
          {
            width: size,
            height: size,
            transform: [{ rotate: `${angle}deg` }]
          }
        ]}
        pointerEvents="none"
      >
        <View
          style={[
            styles.radialDivider,
            {
              left: (size - 2.5) / 2,
              width: 2.5,
              height: thickness + 2
            }
          ]}
        />
      </View>
    ));
  }, [dividerAngles, size, thickness]);

  const activeItem = selectedIdx !== null ? data[selectedIdx] : null;

  return (
    <View style={styles.container}>
      {/* 100% Smooth Continuous Donut Ring */}
      <View style={[styles.chartWrapper, { width: size, height: size }]}>
        {/* Outer circular mask */}
        <View
          style={[
            styles.donutCircleMask,
            {
              width: size,
              height: size,
              borderRadius: size / 2
            }
          ]}
        >
          {radialSlices}
          {dividers}
        </View>

        {/* Center Cutout with Metric Readout */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSelectedIdx(null)}
          style={[
            styles.donutHole,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2
            }
          ]}
        >
          <Text style={styles.centerLabelText} numberOfLines={1}>
            {activeItem
              ? `${Math.round(((activeItem.value || 0) / total) * 100)}%`
              : centerLabel}
          </Text>
          <Text style={styles.centerSubText} numberOfLines={2}>
            {activeItem ? activeItem.label : centerSublabel}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Legend Column with Full Unclipped Text & Aligned Percentages */}
      <View style={styles.legendContainer}>
        {(data || []).map((item, i) => {
          if (!item) return null;
          const itemColor = item.color || '#0047BA';
          const isSelected = selectedIdx === i;
          const pct = Math.round(((item.value || 0) / total) * 100);
          return (
            <TouchableOpacity
              key={`legend-${i}`}
              style={[styles.legendItem, isSelected && styles.legendItemSelected]}
              onPress={() => setSelectedIdx(selectedIdx === i ? null : i)}
              activeOpacity={0.7}
            >
              <View style={[styles.dot, { backgroundColor: itemColor }]} />
              <View style={styles.labelCol}>
                <Text
                  style={[
                    styles.legendLabel,
                    isSelected && { color: itemColor, fontWeight: '800' }
                  ]}
                  numberOfLines={3}
                >
                  {item.label || item.projectName || 'Project'}
                </Text>
              </View>
              <Text
                style={[
                  styles.legendPct,
                  isSelected && { color: itemColor, fontWeight: '800' }
                ]}
              >
                {pct}%
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4
  },
  chartWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  donutCircleMask: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#F8FAFC'
  },
  radialBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0
  },
  radialBar: {
    position: 'absolute',
    top: 0
  },
  radialDivider: {
    position: 'absolute',
    top: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 8
  },
  donutHole: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10
  },
  centerLabelText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center'
  },
  centerSubText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
    lineHeight: 10
  },
  legendContainer: {
    flex: 1,
    paddingLeft: 10,
    justifyContent: 'center',
    gap: 6
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderRadius: 6
  },
  legendItemSelected: {
    backgroundColor: '#EFF6FF'
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 3,
    marginRight: 6,
    flexShrink: 0
  },
  labelCol: {
    flex: 1,
    marginRight: 6
  },
  legendLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#334155',
    lineHeight: 14
  },
  legendPct: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
    flexShrink: 0,
    textAlign: 'right'
  }
});
