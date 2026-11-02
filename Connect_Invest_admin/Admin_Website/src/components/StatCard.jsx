import React from 'react';

export default function StatCard({
  title,
  value,
  subvalue,
  icon: Icon,
  trend = '+12%',
  colorScheme = 'blue', // 'blue', 'emerald', 'purple', 'amber'
  onClick
}) {
  const schemeClasses = {
    blue: { squircle: 'squircle-blue', iconColor: '#2563EB' },
    emerald: { squircle: 'squircle-emerald', iconColor: '#16A34A' },
    purple: { squircle: 'squircle-purple', iconColor: '#9333EA' },
    amber: { squircle: 'squircle-amber', iconColor: '#D97706' }
  }[colorScheme] || { squircle: 'squircle-blue', iconColor: '#2563EB' };

  return (
    <div
      onClick={onClick}
      className="forge-card-interactive"
      style={{
        padding: '24px',
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '175px'
      }}
    >
      {/* Top Row: Icon Squircle + Trend Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div className={`icon-squircle ${schemeClasses.squircle}`}>
          {Icon && <Icon size={22} color={schemeClasses.iconColor} strokeWidth={2.2} />}
        </div>

        {trend && (
          <span className="trend-badge">
            {trend}
          </span>
        )}
      </div>

      {/* Middle: Title & Big Value */}
      <div>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
          {title}
        </div>
        <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-dark)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          {value}
        </div>
      </div>

      {/* Bottom Subtext */}
      <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '8px' }}>
        {subvalue}
      </div>
    </div>
  );
}
