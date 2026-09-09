import React from 'react';

export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  badgeText,
  badgeType = 'navy',
  actions,
  breadcrumbs = []
}) {
  const badgeClasses = {
    navy: { bg: '#0d3057', text: '#ffffff' },
    green: { bg: '#e6f4ea', text: '#137333', border: '#a7f3d0' },
    amber: { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
    red: { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' }
  };

  const badgeStyle = badgeClasses[badgeType] || badgeClasses.navy;

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
        marginBottom: '20px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}
    >
      <div>
        {breadcrumbs.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.6875rem',
              color: 'var(--text-muted)',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontWeight: 600
            }}
          >
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <span>{crumb}</span>
                {idx < breadcrumbs.length - 1 && <span>/</span>}
              </React.Fragment>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {Icon && (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: 'var(--ir-navy-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ir-navy-dark)'
              }}
            >
              <Icon size={18} />
            </div>
          )}

          <h1
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--ir-navy-dark)',
              margin: 0,
              letterSpacing: '-0.01em'
            }}
          >
            {title}
          </h1>

          {badgeText && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 8px',
                borderRadius: 9999,
                fontSize: '0.6875rem',
                fontWeight: 700,
                backgroundColor: badgeStyle.bg,
                color: badgeStyle.text,
                border: badgeStyle.border ? `1px solid ${badgeStyle.border}` : 'none'
              }}
            >
              {badgeText}
            </span>
          )}
        </div>

        {subtitle && (
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
              margin: '4px 0 0 0',
              lineHeight: 1.4
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {actions}
        </div>
      )}
    </div>
  );
}
