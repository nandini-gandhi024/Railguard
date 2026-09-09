import React from 'react';

export default function MetricCard({
  label,
  value,
  sub,
  topColor = 'var(--ir-navy)',
  valueColor,
  icon: Icon,
  trend,
  onClick
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#ffffff',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-light)',
        borderTop: `4px solid ${topColor}`,
        padding: '16px 18px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        minHeight: '104px'
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--text-muted)'
          }}
        >
          {label}
        </span>
        {Icon && <Icon size={16} color={topColor} />}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: '1.875rem',
            fontWeight: 900,
            fontFamily: 'var(--font-mono)',
            color: valueColor || 'var(--text-main)',
            lineHeight: 1
          }}
        >
          {value}
        </span>
        {trend && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: 4,
              backgroundColor: trend.positive ? '#e6f4ea' : '#fee2e2',
              color: trend.positive ? '#137333' : '#b91c1c'
            }}
          >
            {trend.text}
          </span>
        )}
      </div>

      {sub && (
        <div
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginTop: '8px',
            lineHeight: 1.3
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}
