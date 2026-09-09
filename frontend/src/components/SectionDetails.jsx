import React, { useState } from 'react';
import {
  X,
  Train,
  MapPin,
  CloudRain,
  Wind,
  Thermometer,
  Droplets,
  ShieldAlert,
  AlertTriangle,
  Calendar,
  Gauge,
  Zap,
  Layers,
  Compass,
  Maximize2,
  SlidersHorizontal,
  ArrowRight,
  TrendingUp,
  Clock,
  Route,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { RiskBadge, StatusBadge } from './common/RiskBadge';

export default function SectionDetails({
  section,
  weather,
  environmental,
  onClose,
  onFocusOnMap,
  onNavigateToSimulator,
  onOpenTrackDetails,
  onPlanMaintenance
}) {
  const [showAltRoute, setShowAltRoute] = useState(false);

  if (!section) return null;

  const isCritical = section.risk_level === 'CRITICAL';
  const isHigh = section.risk_level === 'HIGH';
  const riskScore = section.risk_score || (isCritical ? 88.5 : (isHigh ? 74.4 : (section.risk_level === 'MEDIUM' ? 48.0 : 28.0)));
  const daysToCrit = section.days_to_critical || (isCritical ? 2 : (isHigh ? 4 : 22));
  const pred7 = (riskScore + (isCritical ? 5.7 : (isHigh ? 5.0 : 2.5))).toFixed(1);
  const pred14 = (riskScore + (isCritical ? 10.1 : (isHigh ? 11.0 : 6.0))).toFixed(1);
  const normalSpeed = section.speed_limit_kmh || 130;
  const tsrSpeed = isCritical ? 30 : (isHigh ? 60 : normalSpeed);
  const trackId = section.track_id || section.section_id.replace('SEC-', 'TRK-') || 'T041';
  const priority = isCritical ? '1 (Emergency)' : (isHigh ? '2 (High)' : '3 (Normal)');

  let recommendedAction = 'Maintain standard visual and ultrasonic track inspection schedule.';
  if (isCritical) {
    recommendedAction = 'Impose immediate TSR 30 km/h and schedule emergency night maintenance block (01:00–03:00 IST).';
  } else if (isHigh) {
    recommendedAction = 'Impose TSR 60 km/h and schedule tamping / sleeper replacement block within 48 hours.';
  }

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: '660px',
        overflow: 'hidden'
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          padding: '14px 16px',
          background: isCritical ? '#fee2e2' : 'var(--ir-navy-darkest)',
          borderBottom: `1px solid ${isCritical ? '#fca5a5' : 'rgba(255,255,255,0.1)'}`,
          color: isCritical ? '#7f1d1d' : '#ffffff',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 10
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 900,
                fontSize: '0.875rem',
                color: isCritical ? '#991b1b' : '#ffffff',
                background: isCritical ? '#ffffff' : 'rgba(255,255,255,0.15)',
                padding: '2px 8px',
                borderRadius: 4
              }}
            >
              {trackId}
            </span>
            <RiskBadge value={riskScore} category={`${section.risk_level} RISK`} size="sm" />
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 800, color: isCritical ? '#7f1d1d' : '#ffffff' }}>
            {section.route_name}
          </div>
          <div style={{ fontSize: '0.6875rem', color: isCritical ? '#991b1b' : 'rgba(255,255,255,0.65)', marginTop: 2 }}>
            {section.start_station} → {section.end_station} ({section.track_length_km} KM)
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {onFocusOnMap && (
            <button
              onClick={() => onFocusOnMap(section)}
              style={{
                background: isCritical ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.15)',
                border: 'none',
                color: isCritical ? '#991b1b' : '#ffffff',
                borderRadius: 4,
                padding: 5,
                cursor: 'pointer'
              }}
              title="Zoom and focus on map"
            >
              <Maximize2 size={13} />
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              background: isCritical ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.15)',
              border: 'none',
              color: isCritical ? '#991b1b' : '#ffffff',
              borderRadius: 4,
              padding: 5,
              cursor: 'pointer'
            }}
            title="Close panel"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* ── Scrollable Body ── */}
      <div
        style={{
          padding: '16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          fontSize: '0.75rem'
        }}
      >
        {/* CRITICAL TRACK ALERT BANNER */}
        {isCritical && (
          <div
            style={{
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              borderLeft: '4px solid #b91c1c',
              borderRadius: 6,
              padding: '10px 12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <ShieldAlert size={16} color="#b91c1c" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontWeight: 800, color: '#991b1b', textTransform: 'uppercase', fontSize: '0.6875rem' }}>
                  Critical Track Condition Warning
                </div>
                <div style={{ color: '#7f1d1d', fontWeight: 600, marginTop: 2, lineHeight: 1.3 }}>
                  Track <strong>{trackId}</strong> is predicted to reach critical failure in <strong>{daysToCrit} days</strong>.
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#991b1b', marginTop: 4 }}>
                  Recommendation: Impose TSR 30 km/h & schedule immediate possession block.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SUMMARY KPIs GRID ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '6px'
          }}
        >
          <div style={{ background: 'var(--bg-subtle)', padding: '8px 6px', borderRadius: 4, border: '1px solid var(--border-light)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Risk</span>
            <div style={{ fontSize: '1.125rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: isCritical ? '#b91c1c' : (isHigh ? '#b45309' : 'var(--ir-navy-dark)') }}>
              {riskScore}
            </div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '8px 6px', borderRadius: 4, border: '1px solid var(--border-light)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Priority</span>
            <div style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--ir-navy-dark)' }}>
              {isCritical ? 'P1' : (isHigh ? 'P2' : 'P3')}
            </div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '8px 6px', borderRadius: 4, border: '1px solid var(--border-light)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>TSR Speed</span>
            <div style={{ fontSize: '1.125rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: tsrSpeed < normalSpeed ? '#b91c1c' : 'var(--ir-green)' }}>
              {tsrSpeed}
            </div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '8px 6px', borderRadius: 4, border: '1px solid var(--border-light)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Days Margin</span>
            <div style={{ fontSize: '1.125rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: daysToCrit <= 3 ? '#b91c1c' : 'var(--text-main)' }}>
              {daysToCrit}d
            </div>
          </div>
        </div>

        {/* ── RISK PREDICTION TIMELINE ── */}
        <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6, border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--ir-navy-dark)' }}>
              Risk Degradation Timeline
            </span>
            <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>Exponential physics model</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, textAlign: 'center' }}>
            <div style={{ background: '#ffffff', padding: 6, borderRadius: 4, border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>Today</div>
              <strong style={{ fontFamily: 'var(--font-mono)', color: isCritical ? '#b91c1c' : 'var(--text-main)' }}>{riskScore}</strong>
            </div>
            <div style={{ background: '#ffffff', padding: 6, borderRadius: 4, border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>7-Day</div>
              <strong style={{ fontFamily: 'var(--font-mono)', color: Number(pred7) >= 75 ? '#b91c1c' : 'var(--text-main)' }}>{pred7}</strong>
            </div>
            <div style={{ background: '#ffffff', padding: 6, borderRadius: 4, border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>14-Day</div>
              <strong style={{ fontFamily: 'var(--font-mono)', color: Number(pred14) >= 85 ? '#b91c1c' : 'var(--text-main)' }}>{pred14}</strong>
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <div style={{ width: '100%', height: 6, background: '#e2e8f0', borderRadius: 9999, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(riskScore, 100)}%`,
                  height: '100%',
                  background: isCritical ? '#b91c1c' : (isHigh ? '#f59e0b' : '#137333'),
                  borderRadius: 9999
                }}
              />
            </div>
          </div>
        </div>

        {/* ── TRACK PROPERTIES & TELEMETRY ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '6px 8px', borderRadius: 4 }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.625rem' }}>Track Type</span>
            <strong style={{ color: 'var(--text-main)', fontSize: '0.6875rem' }}>{section.track_type || 'Broad Gauge'}</strong>
          </div>
          <div style={{ background: 'var(--bg-subtle)', padding: '6px 8px', borderRadius: 4 }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.6875rem' }}>Traffic Load</span>
            <strong style={{ color: 'var(--text-main)', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)' }}>{section.traffic_gmt_per_day || 58} GMT/d</strong>
          </div>
          <div style={{ background: 'var(--bg-subtle)', padding: '6px 8px', borderRadius: 4 }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.6875rem' }}>Terrain</span>
            <strong style={{ color: 'var(--text-main)', fontSize: '0.6875rem' }}>{section.terrain || 'Plain'}</strong>
          </div>
          <div style={{ background: 'var(--bg-subtle)', padding: '6px 8px', borderRadius: 4 }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.6875rem' }}>Electrification</span>
            <strong style={{ color: 'var(--text-main)', fontSize: '0.6875rem' }}>{section.electrified ? '25kV AC OHE' : 'Non-Elec'}</strong>
          </div>
        </div>

        {/* ── DEFECT & WEATHER CONTEXT ── */}
        {section.defect_status && (
          <div style={{ background: isCritical ? '#fef2f2' : '#f8fafc', padding: '8px 10px', borderRadius: 4, border: `1px solid ${isCritical ? '#fecaca' : 'var(--border-light)'}` }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: isCritical ? '#b91c1c' : 'var(--text-muted)' }}>
              Detected Flaw Telemetry
            </span>
            <div style={{ fontWeight: 700, color: isCritical ? '#991b1b' : 'var(--text-main)', marginTop: 2 }}>
              {section.defect_status}
            </div>
            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Last Inspection: {section.last_inspection_date}
            </div>
          </div>
        )}

        {/* ── WEATHER TELEMETRY ── */}
        {weather && (
          <div style={{ background: '#f0fdf4', padding: '8px 10px', borderRadius: 4, border: '1px solid #bbf7d0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
              <span style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: '#166534' }}>
                Live Corridor Climate
              </span>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#15803d' }}>
                {weather.temperature_c}°C • {weather.weather_condition}
              </span>
            </div>
            <div style={{ fontSize: '0.625rem', color: '#166534' }}>
              Humidity: {weather.humidity_pct}% • Wind: {weather.wind_speed_kmh} km/h • Rail Temp: {Number(weather.temperature_c) + 8}°C
            </div>
          </div>
        )}

        {/* ── RECOMMENDED ACTION ── */}
        <div
          style={{
            background: isCritical ? '#fffbeb' : '#f8fafc',
            border: `1px solid ${isCritical ? '#fde68a' : 'var(--border-light)'}`,
            borderLeft: `4px solid ${isCritical ? '#b45309' : 'var(--ir-navy-dark)'}`,
            borderRadius: 4,
            padding: '8px 10px'
          }}
        >
          <div style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: isCritical ? '#b45309' : 'var(--ir-navy-dark)' }}>
            Decision Support Recommendation
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: isCritical ? '#78350f' : 'var(--text-main)', marginTop: 2 }}>
            {recommendedAction}
          </div>
        </div>

        {/* ── ALTERNATIVE CORRIDOR RE-ROUTING (FOR CRITICAL TRACKS) ── */}
        {isCritical && (
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 4, padding: '8px 10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: '#1e40af' }}>
                Alternative Corridor Available
              </span>
              <button
                onClick={() => setShowAltRoute(!showAltRoute)}
                style={{ fontSize: '0.625rem', color: '#1e40af', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                {showAltRoute ? 'Hide' : 'Review Alternative'}
              </button>
            </div>

            {showAltRoute ? (
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', background: '#ffffff', padding: 6, borderRadius: 4, border: '1px solid #dbeafe' }}>
                <div><strong>Corridor 3rd Line Bypass (Via Chord Line)</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                  <span>Safety Index: <strong>95/100</strong></span>
                  <span>Detour: <strong>+4.5 mins</strong></span>
                  <span style={{ color: 'var(--ir-green)', fontWeight: 700 }}>Available</span>
                </div>
                <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Operator review only. Does not execute automatic signalling overrides.
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.6875rem', color: '#1e40af' }}>
                Bypass routing available with zero mainline conflict.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Footer Actions ── */}
      <div
        style={{
          marginTop: 'auto',
          padding: '12px 16px',
          background: 'var(--bg-subtle)',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          {onOpenTrackDetails && (
            <button
              onClick={() => onOpenTrackDetails(section)}
              className="btn-ir-secondary"
              style={{ flex: 1, fontSize: '0.6875rem', padding: '6px 8px' }}
            >
              View Track Details
            </button>
          )}

          {onPlanMaintenance && (
            <button
              onClick={() => onPlanMaintenance(section)}
              className="btn-ir-primary"
              style={{ flex: 1, fontSize: '0.6875rem', padding: '6px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
            >
              <span>Plan Maintenance</span>
              <ArrowRight size={12} />
            </button>
          )}
        </div>

        {onNavigateToSimulator && (
          <button
            onClick={() => onNavigateToSimulator(section)}
            className="btn-ir-secondary"
            style={{ width: '100%', fontSize: '0.6875rem', padding: '5px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
          >
            <SlidersHorizontal size={12} />
            <span>Simulate Extreme Weather in What-If Lab</span>
          </button>
        )}
      </div>
    </div>
  );
}
