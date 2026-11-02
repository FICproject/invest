import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';

/**
 * Responsive SVG Sector Allocation Donut Chart
 */
export const PortfolioDonutChart = ({ sectors = [], totalInvested = 0 }) => {
  const colors = ['#C8963E', '#3B0A11', '#059669', '#D97706', '#6366F1'];

  // Default fallback if sectors are empty
  const data = sectors.length > 0 ? sectors : [
    { category: 'Renewable Energy', percentage: 40 },
    { category: 'Real Estate', percentage: 25 },
    { category: 'Technology', percentage: 20 },
    { category: 'Others', percentage: 15 }
  ];

  // SVG Donut calculation
  const size = 180;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercentage = 0;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
      {/* Donut SVG */}
      <div style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          {data.map((item, index) => {
            const strokeDashoffset = circumference - (circumference * item.percentage) / 100;
            const rotation = (accumulatedPercentage / 100) * 360;
            accumulatedPercentage += item.percentage;

            return (
              <circle
                key={item.category || index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={colors[index % colors.length]}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{
                  transformOrigin: '50% 50%',
                  transform: `rotate(${rotation}deg)`,
                  transition: 'stroke-dashoffset 0.8s ease'
                }}
              />
            );
          })}
        </svg>

        {/* Center Text */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            pointerEvents: 'none'
          }}
        >
          <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1.2 }}>
            {formatCurrency(totalInvested)}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Total Investment
          </span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '150px' }}>
        {data.map((item, index) => (
          <div key={item.category || index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', fontSize: '12.5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: colors[index % colors.length]
                }}
              />
              <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{item.category}</span>
            </div>
            <span style={{ fontWeight: '700', color: 'var(--text-muted)' }}>{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Responsive SVG Monthly Returns Line Chart
 */
export const MonthlyReturnsLineChart = ({ data = [] }) => {
  const chartData = data.length > 0 ? data : [
    { month: 'Oct', amount: 120 },
    { month: 'Nov', amount: 350 },
    { month: 'Dec', amount: 620 },
    { month: 'Jan', amount: 890 },
    { month: 'Feb', amount: 1100 },
    { month: 'Mar', amount: 1225 }
  ];

  const maxVal = Math.max(...chartData.map((d) => d.amount), 1500);
  const width = 360;
  const height = 150;
  const paddingX = 35;
  const paddingY = 25;

  const points = chartData.map((d, i) => {
    const x = paddingX + (i / (chartData.length - 1)) * (width - 2 * paddingX);
    const y = height - paddingY - (d.amount / maxVal) * (height - 2 * paddingY);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', maxHeight: '180px' }}>
        <defs>
          <linearGradient id="returnGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B0A11" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3B0A11" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.5, 1].map((ratio, idx) => {
          const y = height - paddingY - ratio * (height - 2 * paddingY);
          return (
            <line
              key={idx}
              x1={paddingX}
              y1={y}
              x2={width - paddingX}
              y2={y}
              stroke="var(--border-color)"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill="url(#returnGradient)" />

        {/* Line */}
        <path d={pathD} fill="none" stroke="#3B0A11" strokeWidth="2.5" />

        {/* Points & Labels */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4.5" fill="#C8963E" stroke="#FFFFFF" strokeWidth="2" />
            <text
              x={p.x}
              y={height - 6}
              textAnchor="middle"
              fontSize="10"
              fill="var(--text-muted)"
              fontFamily="inherit"
            >
              {p.month}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

/**
 * Status Donut Chart (Confirmed, Pending, Completed)
 */
export const InvestmentStatusChart = ({ status = { confirmed: 3, pending: 1, completed: 2 } }) => {
  const total = (status.confirmed || 0) + (status.pending || 0) + (status.completed || 0);
  const confirmedPct = total > 0 ? Math.round((status.confirmed / total) * 100) : 60;

  const size = 110;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * confirmedPct) / 100;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="var(--border-color)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#3B0A11"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: '800',
            color: 'var(--text-main)'
          }}
        >
          {confirmedPct}%
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3B0A11' }} />
          <span style={{ color: 'var(--text-muted)' }}>Confirmed:</span>
          <strong>{status.confirmed || 0}</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
          <span style={{ color: 'var(--text-muted)' }}>Pending:</span>
          <strong>{status.pending || 0}</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
          <span style={{ color: 'var(--text-muted)' }}>Completed:</span>
          <strong>{status.completed || 0}</strong>
        </div>
      </div>
    </div>
  );
};
