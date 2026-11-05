import React, { useState } from 'react';

/**
 * Interactive animated SVG Pie / Donut Chart with tooltips, slice popout on hover,
 * smooth animations, and interactive legend selection.
 */
export default function InteractivePieChart({
  data = [],
  size = 190,
  innerRadiusRatio = 0.62,
  centerLabel = '₹0',
  centerSublabel = 'Total Invested',
  layout = 'horizontal' // 'horizontal' or 'vertical'
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Normalize data with sensible fallbacks
  const safeData = Array.isArray(data) && data.length > 0 ? data : [
    { label: 'Corporate Debt', projectName: 'Corporate Debt', value: 45, color: '#0047BA', amount: '₹4,50,000' },
    { label: 'Clean Energy Bonds', projectName: 'Clean Energy Bonds', value: 30, color: '#10B981', amount: '₹3,00,000' },
    { label: 'Infrastructure Notes', projectName: 'Infrastructure Notes', value: 25, color: '#FAB800', amount: '₹2,50,000' }
  ];

  const total = safeData.reduce((acc, d) => acc + (Number(d.value) || 0), 0) || 100;
  const center = size / 2;
  const radius = (size / 2) - 16;
  const innerRadius = radius * innerRadiusRatio;

  // Compute angles for each slice
  let currentAngle = -90; // Start at 12 o'clock
  const slices = safeData.map((d, index) => {
    const val = Number(d.value) || 0;
    const sliceAngle = (val / total) * 360;
    // When a single item represents 100% (or sliceAngle >= 359.99), SVG arcs fail if start == end.
    // In SVG, an arc with identical start and end points is degenerate and disappears.
    // We cap sliceAngle at 359.99 degrees to ensure full 360 circle donut renders cleanly.
    const effectiveAngle = sliceAngle >= 359.9 ? 359.99 : sliceAngle;
    const startAngle = currentAngle;
    const endAngle = currentAngle + effectiveAngle;
    const midAngle = startAngle + effectiveAngle / 2;
    currentAngle += sliceAngle;

    const isHovered = hoveredIdx === index;
    // Popout offset when hovered
    const popoutDistance = isHovered ? 6 : 0;
    const radMid = (midAngle * Math.PI) / 180;
    const dx = Math.cos(radMid) * popoutDistance;
    const dy = Math.sin(radMid) * popoutDistance;

    // Outer & inner arc coordinates
    const radStart = (startAngle * Math.PI) / 180;
    const radEnd = (endAngle * Math.PI) / 180;

    const x1 = center + radius * Math.cos(radStart);
    const y1 = center + radius * Math.sin(radStart);
    const x2 = center + radius * Math.cos(radEnd);
    const y2 = center + radius * Math.sin(radEnd);

    const x3 = center + innerRadius * Math.cos(radEnd);
    const y3 = center + innerRadius * Math.sin(radEnd);
    const x4 = center + innerRadius * Math.cos(radStart);
    const y4 = center + innerRadius * Math.sin(radStart);

    const largeArcFlag = effectiveAngle > 180 ? 1 : 0;

    // SVG path string
    const path = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
      'Z'
    ].join(' ');

    return {
      ...d,
      index,
      path,
      dx,
      dy,
      isHovered,
      percentage: Math.round((val / total) * 100)
    };
  });

  const activeSlice = hoveredIdx !== null ? slices[hoveredIdx] : null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: layout === 'horizontal' ? 'row' : 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '14px',
      width: '100%'
    }}>
      {/* Chart Canvas with Animated Center Display */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ overflow: 'visible', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.06))' }}
        >
          {slices.map((slice) => (
            <g
              key={slice.index}
              transform={`translate(${slice.dx}, ${slice.dy})`}
              style={{
                transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                cursor: 'pointer'
              }}
              onMouseEnter={() => setHoveredIdx(slice.index)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <path
                d={slice.path}
                fill={slice.color}
                stroke="#FFFFFF"
                strokeWidth={2.5}
                style={{
                  filter: slice.isHovered ? 'brightness(1.08)' : 'none',
                  transition: 'filter 0.2s ease, opacity 0.2s ease',
                  opacity: hoveredIdx !== null && !slice.isHovered ? 0.75 : 1
                }}
              />
            </g>
          ))}
        </svg>

        {/* Center Dynamic Stat Display inside the Donut hole */}
        <div
          style={{
            position: 'absolute',
            width: `${innerRadius * 1.95}px`,
            height: `${innerRadius * 1.95}px`,
            borderRadius: '50%',
            background: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)',
            pointerEvents: 'none',
            padding: '2px 4px',
            boxSizing: 'border-box',
            overflow: 'visible'
          }}
        >
          {activeSlice ? (
            <div style={{ animation: 'fadeIn 0.2s ease', maxWidth: '100%', width: '100%', padding: '0 2px' }}>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                color: activeSlice.color,
                display: 'block',
                lineHeight: 1.15,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }} title={activeSlice.projectName || activeSlice.label}>
                {activeSlice.projectName || activeSlice.label}
              </span>
              <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', display: 'block', marginTop: '1px', lineHeight: 1.1 }}>
                {activeSlice.percentage}%
              </span>
              <span style={{
                fontSize: activeSlice.amount && activeSlice.amount.length > 9 ? '0.62rem' : '0.72rem',
                fontWeight: 800,
                color: '#1E293B',
                marginTop: '1px',
                display: 'block',
                whiteSpace: 'nowrap',
                lineHeight: 1.1
              }}>
                {activeSlice.amount}
              </span>
            </div>
          ) : (
            <div style={{ maxWidth: '100%', width: '100%', padding: '0 2px' }}>
              <span style={{
                fontSize: centerLabel.length > 11 ? '0.68rem' : centerLabel.length > 8 ? '0.76rem' : '0.88rem',
                fontWeight: 800,
                color: '#0F172A',
                display: 'block',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                whiteSpace: 'nowrap'
              }} title={centerLabel}>
                {centerLabel}
              </span>
              <span style={{ fontSize: '0.60rem', color: '#64748B', fontWeight: 600, display: 'block', marginTop: '1px', lineHeight: 1.1 }}>
                {centerSublabel}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Legend List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: 0, width: '100%' }}>
        {safeData.map((item, index) => {
          const isSelected = hoveredIdx === index;
          const percentage = Math.round(((Number(item.value) || 0) / total) * 100);

          return (
            <div
              key={index}
              onMouseEnter={() => setHoveredIdx(index)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '8px',
                padding: '5px 8px',
                borderRadius: '8px',
                background: isSelected ? '#F1F5F9' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                width: '100%',
                boxSizing: 'border-box'
              }}
              title={`${item.label}: ${percentage}%`}
            >
              {/* Colored Dot + Label */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', minWidth: 0, flex: 1 }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    minWidth: '8px',
                    minHeight: '8px',
                    borderRadius: '50%',
                    background: item.color,
                    flexShrink: 0,
                    marginTop: '4px'
                  }}
                />
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? '#0047BA' : '#334155',
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    wordBreak: 'break-word'
                  }}
                >
                  {item.label}
                </span>
              </div>

              {/* Percentage Badge */}
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: isSelected ? '#0047BA' : '#475569',
                  flexShrink: 0,
                  marginLeft: '6px',
                  marginTop: '1px',
                  textAlign: 'right'
                }}
              >
                {percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
