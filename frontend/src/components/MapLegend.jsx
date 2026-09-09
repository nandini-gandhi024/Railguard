import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function MapLegend({ activeRiskFilter, onSelectRiskFilter }) {
  const [collapsed, setCollapsed] = useState(false);

  const riskLevels = [
    { id: 'LOW', label: 'Safe / Normal', color: '#137333', desc: 'Line speed 130 km/h' },
    { id: 'MEDIUM', label: 'Moderate', color: '#1d4ed8', desc: 'Monitoring (110 km/h)' },
    { id: 'HIGH', label: 'High Risk', color: '#b45309', desc: 'TSR 60-90 km/h' },
    { id: 'CRITICAL', label: 'Critical', color: '#b91c1c', desc: 'TSR 30 km/h & Emergency Block' }
  ];

  const environmentalRisks = [
    { icon: '💧', label: 'Flood / Scour Risk' },
    { icon: '⛰️', label: 'Landslide Hazard' },
    { icon: '🌊', label: 'Waterlogging' },
    { icon: '🌳', label: 'Vegetation' },
    { icon: '🌧️', label: 'Extreme Weather' }
  ];

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(6px)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
        maxWidth: '220px',
        width: '100%',
        overflow: 'hidden',
        fontSize: '0.75rem'
      }}
    >
      {/* Legend Header */}
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          padding: '8px 12px',
          background: 'var(--bg-subtle)',
          borderBottom: collapsed ? 'none' : '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Layers size={14} color="var(--ir-navy-dark)" />
          <span style={{ fontWeight: 800, fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--ir-navy-dark)', letterSpacing: '0.04em' }}>
            Map Legend
          </span>
        </div>
        <button style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Legend Content */}
      {!collapsed && (
        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Track Condition */}
          <div>
            <div style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em', marginBottom: 6 }}>
              Track Condition
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {riskLevels.map((lvl) => {
                const isSelected = activeRiskFilter === lvl.id;
                return (
                  <div
                    key={lvl.id}
                    onClick={() => onSelectRiskFilter && onSelectRiskFilter(isSelected ? 'ALL' : lvl.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '3px 6px',
                      borderRadius: 4,
                      background: isSelected ? 'var(--ir-navy-soft)' : 'transparent',
                      border: isSelected ? '1px solid var(--ir-navy-dark)' : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.12s'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: lvl.color, flexShrink: 0 }} />
                      <span style={{ fontWeight: isSelected ? 700 : 500, color: 'var(--text-main)' }}>{lvl.label}</span>
                    </span>
                    {isSelected && <span style={{ fontSize: '0.625rem', color: 'var(--ir-navy-dark)', fontWeight: 800 }}>✓</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Environmental Hazards */}
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 8 }}>
            <div style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em', marginBottom: 6 }}>
              Environmental Hazards
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
              {environmentalRisks.map((env) => (
                <div key={env.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{env.icon}</span>
                  <span>{env.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
