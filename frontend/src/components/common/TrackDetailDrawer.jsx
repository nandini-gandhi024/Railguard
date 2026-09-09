import React, { useState, useEffect } from 'react';
import {
  X,
  Activity,
  AlertTriangle,
  Clock,
  Gauge,
  Calendar,
  Layers,
  MapPin,
  TrendingUp,
  Route,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { getTrackRisk, assessRisk, recommendAlternativeRoute } from '../../services/api';
import { RiskBadge, StatusBadge } from './RiskBadge';

export default function TrackDetailDrawer({
  isOpen,
  onClose,
  track,
  onNavigateToPlanner
}) {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [routeAdvisory, setRouteAdvisory] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  useEffect(() => {
    if (isOpen && track?.track_id) {
      loadDetails(track.track_id);
      setRouteAdvisory(null);
    }
  }, [isOpen, track?.track_id]);

  const loadDetails = async (trackId) => {
    setLoading(true);
    try {
      let data = await getTrackRisk(trackId);
      if (!data) {
        data = await assessRisk({
          track_id: trackId,
          defect_severity: trackId === 'T041' || trackId === 'TRK-NR-101' ? 88.5 : (trackId === 'TRK-CR-204' ? 82.0 : 45.0),
          defect_confidence: 0.94,
          temperature_c: 38.0,
          monsoon_alert: false,
          delay_days: 0
        });
      }
      setRiskData(data);
    } catch (e) {
      console.error('Error loading track detail risk:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRouteCalc = async () => {
    if (!track?.track_id) return;
    setLoadingRoute(true);
    try {
      const res = await recommendAlternativeRoute(track.track_id);
      setRouteAdvisory(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRoute(false);
    }
  };

  if (!isOpen || !track) return null;

  const currentScore = riskData?.risk?.score || riskData?.composite_risk || track.composite_risk || 75.0;
  const currentCategory = riskData?.risk?.category || riskData?.category || track.risk_category || 'CRITICAL RISK';
  const tsrSpeed = riskData?.risk?.tsr_speed_kmh || riskData?.tsr_speed_kmh || track.tsr_speed || 30;
  const normalSpeed = track.speed_limit || 130;
  const daysToCrit = riskData?.prediction?.days_to_critical ?? riskData?.days_to_critical ?? track.days_to_critical ?? 2;
  const pred7 = riskData?.prediction?.risk_7_days || (currentScore >= 75 ? 94.2 : 48.0);
  const pred14 = riskData?.prediction?.risk_14_days || (currentScore >= 75 ? 98.6 : 56.5);
  const priority = track.priority || (currentScore >= 75 ? 'P1 Emergency' : 'P2 High');
  const recommendedAction = riskData?.recommendation?.action || riskData?.urgency_action || 'Schedule maintenance block within 48 hours and impose TSR 30 km/h.';

  // XAI factor bars
  const factors = riskData?.xai_breakdown
    ? Object.entries(riskData.xai_breakdown).map(([k, v]) => ({ name: k, pct: Number(v) }))
    : [
        { name: 'Defect Severity', pct: 38 },
        { name: 'Traffic GMT', pct: 24 },
        { name: 'Thermal / Monsoon Stress', pct: 14 },
        { name: 'Track Age', pct: 10 },
        { name: 'Maintenance Delay', pct: 8 },
        { name: 'Repair Fatigue', pct: 6 }
      ];

  // Timeline prediction
  const timelinePoints = [
    { label: 'Today (Now)', value: currentScore, sub: 'Current State' },
    { label: '7 Days', value: pred7, sub: `+${(pred7 - currentScore).toFixed(1)} escalation` },
    { label: '14 Days', value: pred14, sub: `+${(pred14 - currentScore).toFixed(1)} escalation` }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(6, 22, 37, 0.65)',
        backdropFilter: 'blur(3px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          height: '100%',
          backgroundColor: '#ffffff',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          animation: 'slideInRight 0.25s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div
          style={{
            padding: '20px 24px',
            backgroundColor: 'var(--ir-navy-darkest)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: '#ffffff',
                  letterSpacing: '0.04em'
                }}
              >
                {track.track_id}
              </span>
              <RiskBadge value={currentScore} category={currentCategory} size="sm" />
              <StatusBadge status={track.status || 'Speed Restricted'} size="sm" />
            </div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--ir-navy-soft)' }}>
              {track.location || track.section}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
              {track.division} • {track.zone}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#ffffff',
              borderRadius: 6,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.15s'
            }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* SUMMARY KPI CARDS */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px'
            }}
          >
            <div
              style={{
                background: currentScore >= 75 ? '#fee2e2' : '#f8fafc',
                border: `1px solid ${currentScore >= 75 ? '#fca5a5' : 'var(--border-light)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px'
              }}
            >
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Current Risk
              </div>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: currentScore >= 75 ? '#b91c1c' : 'var(--ir-navy-dark)'
                }}
              >
                {currentScore}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>/ 100 Risk Score</div>
            </div>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px'
              }}
            >
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Priority
              </div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--ir-navy-dark)',
                  marginTop: 2
                }}
              >
                {priority.split(' ')[0]}
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#b45309', fontWeight: 600 }}>Emergency</div>
            </div>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px'
              }}
            >
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                TSR Speed
              </div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: tsrSpeed < normalSpeed ? '#b91c1c' : 'var(--ir-navy-dark)',
                  marginTop: 2
                }}
              >
                {tsrSpeed} <span style={{ fontSize: '0.6875rem' }}>km/h</span>
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Normal: {normalSpeed}</div>
            </div>

            <div
              style={{
                background: daysToCrit <= 3 ? '#fffbeb' : '#f8fafc',
                border: `1px solid ${daysToCrit <= 3 ? '#fde68a' : 'var(--border-light)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px'
              }}
            >
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Days to Crit.
              </div>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: daysToCrit <= 3 ? '#b45309' : 'var(--ir-navy-dark)'
                }}
              >
                {daysToCrit}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Days margin</div>
            </div>
          </div>

          {/* SECTION 1: Track Information */}
          <div className="ir-card p-4">
            <div className="ir-card-header mb-3" style={{ padding: 0, border: 'none' }}>
              <h3 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--ir-navy-dark)', textTransform: 'uppercase' }}>
                Section 1: Track Asset & Geometry Parameters
              </h3>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                fontSize: '0.75rem'
              }}
            >
              <div style={{ background: 'var(--bg-subtle)', padding: '8px 10px', borderRadius: 4 }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.6875rem' }}>Steel Grade</span>
                <strong style={{ color: 'var(--text-main)' }}>{track.steel_grade || '60kg 90UTS'}</strong>
              </div>
              <div style={{ background: 'var(--bg-subtle)', padding: '8px 10px', borderRadius: 4 }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.6875rem' }}>Traffic Load</span>
                <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>{track.traffic_per_day || 58} GMT/day</strong>
              </div>
              <div style={{ background: 'var(--bg-subtle)', padding: '8px 10px', borderRadius: 4 }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.6875rem' }}>Track Age</span>
                <strong style={{ color: 'var(--text-main)' }}>{track.track_age || 14} Years</strong>
              </div>
              <div style={{ background: 'var(--bg-subtle)', padding: '8px 10px', borderRadius: 4 }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.6875rem' }}>Curve Radius</span>
                <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>{track.curve_radius || 1200} m</strong>
              </div>
              <div style={{ background: 'var(--bg-subtle)', padding: '8px 10px', borderRadius: 4 }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.6875rem' }}>Previous Repairs</span>
                <strong style={{ color: 'var(--text-main)' }}>{track.previous_repairs || 4} Welds</strong>
              </div>
              <div style={{ background: 'var(--bg-subtle)', padding: '8px 10px', borderRadius: 4 }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.6875rem' }}>Last Tamping</span>
                <strong style={{ color: 'var(--text-main)' }}>{track.last_tamping_days || 210} d ago</strong>
              </div>
            </div>
          </div>

          {/* SECTION 2 & 3: Risk Assessment & Timeline Prediction */}
          <div className="ir-card p-4">
            <div className="ir-card-header mb-3" style={{ padding: 0, border: 'none' }}>
              <h3 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--ir-navy-dark)', textTransform: 'uppercase' }}>
                Section 2 & 3: Risk Prediction Timeline (Today → 7d → 14d)
              </h3>
            </div>
            
            {/* Visual Timeline Steps */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                position: 'relative',
                padding: '10px 0'
              }}
            >
              {timelinePoints.map((tp, idx) => (
                <div
                  key={idx}
                  style={{
                    background: idx === 0 ? '#f8fafc' : (tp.value >= 85 ? '#fee2e2' : '#fef3c7'),
                    border: `1px solid ${idx === 0 ? 'var(--border-light)' : (tp.value >= 85 ? '#fca5a5' : '#fde68a')}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {tp.label}
                  </div>
                  <div
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 900,
                      fontFamily: 'var(--font-mono)',
                      color: tp.value >= 85 ? '#b91c1c' : (tp.value >= 60 ? '#b45309' : '#137333'),
                      margin: '4px 0'
                    }}
                  >
                    {tp.value}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    {tp.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* Visual Linear Progress */}
            <div style={{ marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>Deterioration Scale</span>
                <span style={{ fontWeight: 700, color: '#b91c1c' }}>Critical Failure Level: 85.0</span>
              </div>
              <div style={{ width: '100%', height: 10, background: '#e2e8f0', borderRadius: 9999, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(currentScore, 100)}%`,
                    height: '100%',
                    background: currentScore >= 75 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #22c55e, #3b82f6)',
                    borderRadius: 9999
                  }}
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Explainable AI (XAI) / Why this Risk? */}
          <div className="ir-card p-4">
            <div className="ir-card-header mb-3" style={{ padding: 0, border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--ir-navy-dark)', textTransform: 'uppercase' }}>
                Section 4: XAI / Why is this Track High Risk?
              </h3>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Factor attribution</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {factors.map((f, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: 3 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{f.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ir-navy-dark)' }}>{f.pct}%</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: 9999, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${f.pct}%`,
                        height: '100%',
                        backgroundColor: idx === 0 ? '#b91c1c' : (idx === 1 ? '#0d3057' : '#b45309'),
                        borderRadius: 9999
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 5: Recommended Action */}
          <div
            style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderLeft: '5px solid #b45309',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <AlertTriangle size={20} color="#b45309" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#b45309', letterSpacing: '0.04em' }}>
                  Section 5: Recommended Action
                </div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#78350f', marginTop: 4 }}>
                  {recommendedAction}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#92400e', marginTop: 4 }}>
                  Decision support recommendation only. Requires Section Controller / PWI review and authorization.
                </div>
              </div>
            </div>
          </div>

          {/* ALTERNATIVE ROUTE ADVISORY */}
          <div
            style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 'var(--radius-sm)',
              padding: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase' }}>
                Alternative Corridor Routing
              </span>
              <button
                onClick={handleRouteCalc}
                disabled={loadingRoute}
                className="btn-ir-secondary"
                style={{ fontSize: '0.6875rem', padding: '4px 10px' }}
              >
                {loadingRoute ? 'Evaluating...' : 'Evaluate Bypass Corridor'}
              </button>
            </div>
            {routeAdvisory ? (
              <div style={{ background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 4, padding: 10, fontSize: '0.75rem' }}>
                <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: 4 }}>
                  {routeAdvisory.alternative_route?.route_name}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, color: 'var(--text-muted)' }}>
                  <div>Safety: <strong>{routeAdvisory.alternative_route?.safety_score}/100</strong></div>
                  <div>Detour: <strong>+{routeAdvisory.alternative_route?.detour_delay_mins}m</strong></div>
                  <div>Capacity: <strong>{routeAdvisory.alternative_route?.available_capacity}</strong></div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                Click evaluate to calculate safe bypass routes without disrupting mainline schedules.
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div
          style={{
            marginTop: 'auto',
            padding: '16px 24px',
            backgroundColor: 'var(--bg-subtle)',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}
        >
          <button
            onClick={onClose}
            className="btn-ir-secondary"
            style={{ fontSize: '0.8125rem' }}
          >
            Close
          </button>

          <button
            onClick={() => {
              onClose();
              if (onNavigateToPlanner) onNavigateToPlanner(track.track_id);
            }}
            className="btn-ir-primary"
            style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span>Schedule Maintenance Block</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
