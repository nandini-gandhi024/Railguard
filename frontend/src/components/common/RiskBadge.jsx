import React from 'react';

export function getRiskLevel(scoreOrCategory) {
  if (typeof scoreOrCategory === 'number') {
    if (scoreOrCategory >= 75) return 'CRITICAL';
    if (scoreOrCategory >= 55) return 'HIGH';
    if (scoreOrCategory >= 40) return 'MODERATE';
    return 'LOW';
  }
  const str = String(scoreOrCategory || '').toUpperCase();
  if (str.includes('CRITICAL')) return 'CRITICAL';
  if (str.includes('HIGH')) return 'HIGH';
  if (str.includes('MODERATE')) return 'MODERATE';
  return 'LOW';
}

export function RiskBadge({ value, category, size = 'normal', showDot = true }) {
  const level = getRiskLevel(category || value);

  const styleMap = {
    CRITICAL: {
      bg: '#fee2e2',
      border: '#fca5a5',
      text: '#b91c1c',
      dot: '#ef4444',
      label: 'Critical Risk'
    },
    HIGH: {
      bg: '#fef3c7',
      border: '#fde68a',
      text: '#b45309',
      dot: '#f59e0b',
      label: 'High Risk'
    },
    MODERATE: {
      bg: '#eff6ff',
      border: '#bfdbfe',
      text: '#1d4ed8',
      dot: '#3b82f6',
      label: 'Moderate Risk'
    },
    LOW: {
      bg: '#e6f4ea',
      border: '#a7f3d0',
      text: '#137333',
      dot: '#22c55e',
      label: 'Low Risk'
    }
  };

  const conf = styleMap[level];
  const displayLabel = category || (typeof value === 'number' ? `${value} — ${conf.label}` : conf.label);
  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? 4 : 6,
        padding: isSmall ? '2px 8px' : '3px 10px',
        borderRadius: 9999,
        fontSize: isSmall ? '0.6875rem' : '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.01em',
        backgroundColor: conf.bg,
        border: `1px solid ${conf.border}`,
        color: conf.text,
        lineHeight: 1.2,
        whiteSpace: 'nowrap'
      }}
    >
      {showDot && (
        <span
          style={{
            width: isSmall ? 6 : 7,
            height: isSmall ? 6 : 7,
            borderRadius: '50%',
            backgroundColor: conf.dot,
            flexShrink: 0
          }}
        />
      )}
      {displayLabel}
    </span>
  );
}

export function StatusBadge({ status = 'Operational', size = 'normal' }) {
  const isSpeedRestricted = status.toLowerCase().includes('restrict');
  const isMaintenance = status.toLowerCase().includes('maint');
  const isCritical = status.toLowerCase().includes('crit') || status.toLowerCase().includes('fail');

  let bg = '#e6f4ea';
  let border = '#a7f3d0';
  let text = '#137333';
  let dot = '#22c55e';

  if (isCritical) {
    bg = '#fee2e2';
    border = '#fca5a5';
    text = '#b91c1c';
    dot = '#ef4444';
  } else if (isSpeedRestricted) {
    bg = '#fffbeb';
    border = '#fef08a';
    text = '#b45309';
    dot = '#f59e0b';
  } else if (isMaintenance) {
    bg = '#f1f5f9';
    border = '#cbd5e1';
    text = '#475569';
    dot = '#64748b';
  }

  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? 4 : 6,
        padding: isSmall ? '2px 8px' : '3px 10px',
        borderRadius: 4,
        fontSize: isSmall ? '0.6875rem' : '0.75rem',
        fontWeight: 600,
        backgroundColor: bg,
        border: `1px solid ${border}`,
        color: text,
        whiteSpace: 'nowrap'
      }}
    >
      <span
        style={{
          width: isSmall ? 6 : 7,
          height: isSmall ? 6 : 7,
          borderRadius: '50%',
          backgroundColor: dot,
          flexShrink: 0
        }}
      />
      {status}
    </span>
  );
}

export default RiskBadge;
