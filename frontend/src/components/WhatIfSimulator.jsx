import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  Sun,
  CloudRain,
  Truck,
  Clock,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  CheckCircle2,
  Zap,
  Gauge
} from 'lucide-react';
import PageHeader from './common/PageHeader';
import MetricCard from './common/MetricCard';
import { RiskBadge, StatusBadge } from './common/RiskBadge';
import { simulateCorridorRisk } from '../services/api';

export default function WhatIfSimulator({ tracks = [], onNavigateToPlanner }) {
  const [selectedTrackId, setSelectedTrackId] = useState(tracks[0]?.track_id || 'T041');
  const [temp, setTemp] = useState(42);
  const [monsoon, setMonsoon] = useState(false);
  const [trafficInc, setTrafficInc] = useState(25);
  const [delayDays, setDelayDays] = useState(7);
  const [defectSeverity, setDefectSeverity] = useState(75);
  const [loading, setLoading] = useState(false);
  const [simResults, setSimResults] = useState(null);

  useEffect(() => {
    runSimulation();
  }, [selectedTrackId, temp, monsoon, trafficInc, delayDays, defectSeverity]);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const data = await simulateCorridorRisk({
        track_id: selectedTrackId,
        temperature_c: temp,
        monsoon_alert: monsoon,
        traffic_increase_pct: trafficInc,
        delay_days: delayDays,
        defect_severity: defectSeverity
      });
      setSimResults(data);
    } catch (err) {
      console.error('[WhatIfSimulator] Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedTrack = tracks.find((t) => t.track_id === selectedTrackId) || tracks[0] || {};
  const currentRisk = Number(selectedTrack.composite_risk || 72.0);

  // Compute simulated risk dynamically if backend returns null
  const baseDelta = (
    (temp > 35 ? (temp - 35) * 0.45 : 0) +
    (monsoon ? 8.5 : 0) +
    (trafficInc * 0.18) +
    (delayDays * 0.95) +
    ((defectSeverity - 50) * 0.22)
  );

  const simulatedRisk = simResults?.simulated_risk || Math.min(100, Math.round((currentRisk + baseDelta) * 10) / 10);
  const riskDelta = Math.round((simulatedRisk - currentRisk) * 10) / 10;
  const daysToCrit = Math.max(1, Math.round(18 - (simulatedRisk * 0.17)));
  const pred7 = Math.min(100, Math.round((simulatedRisk + 5.2) * 10) / 10);
  const pred14 = Math.min(100, Math.round((simulatedRisk + 11.4) * 10) / 10);

  let recommendation = 'Normal track inspection frequency.';
  if (simulatedRisk >= 85) {
    recommendation = 'Impose emergency TSR 30 km/h and authorize immediate 2-hour night block within 24 hours.';
  } else if (simulatedRisk >= 70) {
    recommendation = 'Schedule preventive tamping and weld inspection within 7 days. Restrict freight to 60 km/h.';
  } else if (simulatedRisk >= 55) {
    recommendation = 'Monitor track geometry telemetry under increased freight GMT load.';
  }

  return (
    <div>
      {/* ── Page Header ── */}
      <PageHeader
        title="What-If Scenario Risk Simulator"
        subtitle="Evaluate the cascading risk effects of extreme summer rail temperatures, monsoon trackbed washouts, freight GMT surges, and maintenance deferral."
        icon={SlidersHorizontal}
        badgeText="Scenario Simulator"
        badgeType="navy"
        breadcrumbs={['RailGuard Ops', 'Decision Support', 'What-If Simulator']}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Target Asset:</span>
            <select
              value={selectedTrackId}
              onChange={(e) => setSelectedTrackId(e.target.value)}
              className="ir-select"
              style={{ height: '36px', fontSize: '0.8125rem' }}
            >
              {tracks.map((t) => (
                <option key={t.track_id} value={t.track_id}>
                  {t.track_id} ({t.section || t.location})
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* ── TWO-COLUMN INTERACTIVE SIMULATION WORKSPACE ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px'
        }}
      >
        {/* LEFT COLUMN: INPUT CONTROLS / SLIDERS */}
        <div className="ir-card p-4 space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="ir-card-header" style={{ padding: 0, border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--ir-navy-dark)', textTransform: 'uppercase' }}>
              Parametric Simulation Inputs
            </h3>
            {loading && (
              <span style={{ fontSize: '0.6875rem', color: '#1e40af', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                <RefreshCw size={12} className="animate-spin" /> Recalculating...
              </span>
            )}
          </div>

          {/* SLIDER 1: Defect Severity */}
          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 6, border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: 6 }}>
              <span style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Gauge size={14} color="var(--ir-navy)" /> Initial Defect Severity
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ir-navy-dark)', fontSize: '0.875rem' }}>
                {defectSeverity} / 100
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="95"
              value={defectSeverity}
              onChange={(e) => setDefectSeverity(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--ir-navy-dark)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: 2 }}>
              <span>Minor Spall (20)</span>
              <span>Deep Transverse Fracture (95)</span>
            </div>
          </div>

          {/* SLIDER 2: Ambient Temperature */}
          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 6, border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: 6 }}>
              <span style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sun size={14} color="#b45309" /> Ambient Rail Temperature
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', color: temp > 40 ? '#b91c1c' : 'var(--ir-navy-dark)', fontSize: '0.875rem' }}>
                {temp}°C
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="55"
              value={temp}
              onChange={(e) => setTemp(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--ir-navy-dark)', cursor: 'pointer' }}
            />
            <div style={{ fontSize: '0.6875rem', color: temp > 40 ? '#b91c1c' : 'var(--text-muted)', marginTop: 2 }}>
              {temp > 40 ? '⚠️ High Thermal Buckling Risk (>50°C rail internal temp)' : 'Normal operating temperature range'}
            </div>
          </div>

          {/* SLIDER 3: Monsoon Alert */}
          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 6, border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CloudRain size={14} color="#2563eb" /> Monsoon Precipitation & Washout
              </span>
              <RiskBadge value={monsoon ? 'ACTIVE' : 'OFF'} category={monsoon ? 'CRITICAL' : 'LOW'} size="sm" />
            </div>
            <button
              onClick={() => setMonsoon(!monsoon)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: 4,
                border: '1px solid',
                borderColor: monsoon ? 'var(--ir-navy-dark)' : 'var(--border-med)',
                background: monsoon ? 'var(--ir-navy-dark)' : '#ffffff',
                color: monsoon ? '#ffffff' : 'var(--text-main)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {monsoon ? '✓ Monsoon Conditions Active (Ballast Washout Stress)' : 'Enable Monsoon Weather Scenario'}
            </button>
          </div>

          {/* SLIDER 4: Traffic Surge */}
          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 6, border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: 6 }}>
              <span style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Truck size={14} color="var(--ir-navy)" /> Freight Traffic Surge
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ir-navy-dark)', fontSize: '0.875rem' }}>
                +{trafficInc}% GMT
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={trafficInc}
              onChange={(e) => setTrafficInc(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--ir-navy-dark)', cursor: 'pointer' }}
            />
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Simulates diverted freight rakes from adjacent congested corridors
            </div>
          </div>

          {/* SLIDER 5: Maintenance Delay */}
          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 6, border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: 6 }}>
              <span style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={14} color="#b45309" /> Maintenance Delay (Deferred Block)
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', color: delayDays > 7 ? '#b91c1c' : 'var(--ir-navy-dark)', fontSize: '0.875rem' }}>
                +{delayDays} Days
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={delayDays}
              onChange={(e) => setDelayDays(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--ir-navy-dark)', cursor: 'pointer' }}
            />
            <div style={{ fontSize: '0.6875rem', color: delayDays > 7 ? '#b91c1c' : 'var(--text-muted)', marginTop: 2 }}>
              Simulates postponement of scheduled tamping / weld renewal
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE RESULT PANEL WITH VISUAL COMPARISON */}
        <div className="ir-card p-4 space-y-4" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="ir-card-header" style={{ padding: 0, border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--ir-navy-dark)', textTransform: 'uppercase' }}>
                Live Scenario Simulation Output
              </h3>
              <RiskBadge value={simulatedRisk} size="sm" />
            </div>

            {/* ── VISUAL COMPARISON CARDS (CURRENT vs SIMULATED) ── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px'
              }}
            >
              {/* CURRENT */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  CURRENT
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--ir-navy-dark)', margin: '4px 0' }}>
                  {currentRisk}
                </div>
                <RiskBadge value={currentRisk} size="sm" showDot={false} />
              </div>

              {/* ARROW & DELTA BADGE */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    background: riskDelta >= 0 ? '#fee2e2' : '#e6f4ea',
                    color: riskDelta >= 0 ? '#b91c1c' : '#137333',
                    border: `1px solid ${riskDelta >= 0 ? '#fca5a5' : '#a7f3d0'}`,
                    borderRadius: 9999,
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  <TrendingUp size={14} />
                  <span>{riskDelta >= 0 ? `+${riskDelta}` : riskDelta} RISK</span>
                </div>
              </div>

              {/* SIMULATED */}
              <div
                style={{
                  background: simulatedRisk >= 75 ? '#fee2e2' : '#fffbeb',
                  border: `2px solid ${simulatedRisk >= 75 ? '#ef4444' : '#f59e0b'}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px',
                  textAlign: 'center',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: simulatedRisk >= 75 ? '#b91c1c' : '#b45309' }}>
                  SIMULATED
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: simulatedRisk >= 75 ? '#b91c1c' : '#b45309', margin: '4px 0' }}>
                  {simulatedRisk}
                </div>
                <RiskBadge value={simulatedRisk} size="sm" showDot={false} />
              </div>
            </div>

            {/* ── SECONDARY METRICS: 7d, 14d, DAYS TO CRITICAL ── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                marginBottom: '20px'
              }}
            >
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 6, border: '1px solid var(--border-light)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  7-Day Escalation
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: pred7 >= 75 ? '#b91c1c' : 'var(--text-main)', marginTop: 2 }}>
                  {pred7}
                </div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Projected Score</span>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 6, border: '1px solid var(--border-light)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  14-Day Escalation
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: pred14 >= 85 ? '#b91c1c' : 'var(--text-main)', marginTop: 2 }}>
                  {pred14}
                </div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Critical Boundary</span>
              </div>

              <div style={{ background: daysToCrit <= 3 ? '#fee2e2' : '#f8fafc', padding: '12px', borderRadius: 6, border: `1px solid ${daysToCrit <= 3 ? '#fca5a5' : 'var(--border-light)'}`, textAlign: 'center' }}>
                <span style={{ fontSize: '0.6875rem', color: daysToCrit <= 3 ? '#b91c1c' : 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Days to Critical
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: daysToCrit <= 3 ? '#b91c1c' : 'var(--text-main)', marginTop: 2 }}>
                  {daysToCrit} Days
                </div>
                <span style={{ fontSize: '0.6875rem', color: daysToCrit <= 3 ? '#b91c1c' : 'var(--text-muted)' }}>Operating Window</span>
              </div>
            </div>

            {/* ── OPERATOR RECOMMENDATION BANNER ── */}
            <div
              style={{
                background: simulatedRisk >= 75 ? '#fee2e2' : '#fffbeb',
                border: `1px solid ${simulatedRisk >= 75 ? '#fca5a5' : '#fde68a'}`,
                borderLeft: `4px solid ${simulatedRisk >= 75 ? '#ef4444' : '#f59e0b'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <AlertTriangle size={18} color={simulatedRisk >= 75 ? '#b91c1c' : '#b45309'} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: simulatedRisk >= 75 ? '#b91c1c' : '#b45309' }}>
                    Operator Decision Support Recommendation
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: simulatedRisk >= 75 ? '#991b1b' : '#78350f', marginTop: 3 }}>
                    {recommendation}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Advisory recommendation for Chief Controller review. Does not override block safety rules.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <button
              onClick={onNavigateToPlanner}
              className="btn-ir-primary"
              style={{ width: '100%', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <span>Transfer Parameters to Maintenance Block Optimizer</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
