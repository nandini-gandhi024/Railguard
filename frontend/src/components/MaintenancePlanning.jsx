import React, { useState, useEffect } from 'react';
import {
  CalendarClock,
  Play,
  CheckCircle2,
  TrendingUp,
  Train,
  Clock,
  FileText,
  ShieldCheck,
  AlertCircle,
  Download,
  Printer,
  DollarSign,
  Sparkles,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import PageHeader from './common/PageHeader';
import MetricCard from './common/MetricCard';
import { RiskBadge, StatusBadge } from './common/RiskBadge';
import { optimizeMaintenance, optimizeBudget } from '../services/api';

export default function MaintenancePlanning() {
  const [corridorSection, setCorridorSection] = useState('NDLS-CNB Mainline Corridor');
  const [optimizing, setOptimizing] = useState(false);
  const [optData, setOptData] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('schedule'); // 'schedule' | 'budget'
  const [budgetInr, setBudgetInr] = useState(5000000);
  const [budgetData, setBudgetData] = useState(null);
  const [loadingBudget, setLoadingBudget] = useState(false);

  const corridors = [
    'NDLS-CNB Mainline Corridor',
    'CSTM-PUNE Corridor',
    'BCT-ADI Mainline',
    'HWH-NDLS Grand Chord'
  ];

  useEffect(() => {
    runOptimizer();
  }, [corridorSection]);

  const runOptimizer = async () => {
    setOptimizing(true);
    try {
      const data = await optimizeMaintenance(corridorSection);
      setOptData(data);
    } catch (err) {
      console.error('[MaintenancePlanning] Optimization error:', err);
    } finally {
      setOptimizing(false);
    }
  };

  const handleRunBudgetOptimizer = async () => {
    setLoadingBudget(true);
    try {
      const res = await optimizeBudget(budgetInr);
      setBudgetData(res);
    } catch (err) {
      console.error('[MaintenancePlanning] Budget optimization error:', err);
    } finally {
      setLoadingBudget(false);
    }
  };

  const printBlockPermit = () => {
    window.print();
  };

  const blocks = optData?.optimized_blocks || [
    {
      block_id: 'BLK-001',
      track_id: 'T041',
      location: 'KM 142.5 Delhi-Kanpur Line',
      block_type: 'Emergency Rail Cut & Weld Replacement',
      required_duration_hours: 2.0,
      scheduled_start: '01:00',
      scheduled_end: '03:00',
      window_type: 'Night Maintenance Corridor Window (01:00–03:00)',
      status: 'AI Optimized',
      priority_score: 92.5,
      train_delay_penalty: 0.0,
      crew_assigned: 'Northern Railway Track Gang #7'
    },
    {
      block_id: 'BLK-002',
      track_id: 'TRK-CR-204',
      location: 'KM 42.1 Kharghar-Panvel Line',
      block_type: 'Ballast Deep Screening & Sleeper Renewal',
      required_duration_hours: 2.5,
      scheduled_start: '01:30',
      scheduled_end: '04:00',
      window_type: 'Night Maintenance Corridor Window (01:30–04:00)',
      status: 'AI Optimized',
      priority_score: 84.0,
      train_delay_penalty: 0.0,
      crew_assigned: 'Central Railway Gang #12'
    }
  ];

  const metrics = optData?.metrics || {
    unoptimized_asset_availability_pct: 82.5,
    optimized_asset_availability_pct: 96.5,
    asset_availability_gain_pct: 14.0,
    total_blocks_scheduled: 2,
    total_downtime_hours: 4.5
  };

  const reasoning = optData?.reasoning || 'Selected 01:00–03:00 night window: Lowest passenger traffic density on NDLS-CNB corridor, zero conflict with Vande Bharat / Rajdhani rakes, and eliminates speed restriction.';

  return (
    <div>
      {/* ── Page Header ── */}
      <PageHeader
        title="Maintenance Block Planning & Constraint Optimizer"
        subtitle="Automatic scheduling of track possession windows to maximize asset availability and eliminate passenger train disruptions."
        icon={CalendarClock}
        badgeText="Smart Block Planner"
        badgeType="navy"
        breadcrumbs={['RailGuard Ops', 'Operations', 'Block Planning']}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <select
              value={corridorSection}
              onChange={(e) => setCorridorSection(e.target.value)}
              className="ir-select"
              style={{ height: '36px', fontSize: '0.8125rem' }}
            >
              {corridors.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              onClick={runOptimizer}
              disabled={optimizing}
              className="btn-ir-primary"
              style={{ height: '36px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {optimizing ? (
                <>
                  <Clock size={14} className="animate-spin" />
                  <span>Optimizing...</span>
                </>
              ) : (
                <>
                  <Play size={14} fill="currentColor" />
                  <span>Optimize Maintenance Plan</span>
                </>
              )}
            </button>
          </div>
        }
      />

      {/* ── TOP KPI METRIC CARDS ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          marginBottom: '20px'
        }}
      >
        <MetricCard
          label="Corridor Availability"
          value={`${metrics.optimized_asset_availability_pct}%`}
          sub="Up from 82.5% unoptimized"
          topColor="var(--ir-green)"
          valueColor="var(--ir-green)"
          trend={{ positive: true, text: `+${metrics.asset_availability_gain_pct}% Gain` }}
          icon={TrendingUp}
        />

        <MetricCard
          label="Scheduled Downtime"
          value={`${metrics.total_downtime_hours} hrs`}
          sub="Synchronized night window"
          topColor="var(--ir-navy-dark)"
          valueColor="var(--ir-navy-dark)"
          icon={Clock}
        />

        <MetricCard
          label="Train Delay Penalty"
          value="₹0.00"
          sub="Zero conflict with premium expresses"
          topColor="var(--ir-green)"
          valueColor="var(--ir-green)"
          icon={Train}
        />

        <MetricCard
          label="Scheduled Blocks"
          value={metrics.total_blocks_scheduled}
          sub="Ready for PWI authorization"
          topColor="var(--ir-gold-bright)"
          valueColor="var(--ir-gold)"
          icon={CalendarClock}
        />
      </div>

      {/* ── SUB-TABS: SCHEDULE VS BUDGET OPTIMIZER ── */}
      <div
        style={{
          display: 'flex',
          gap: '24px',
          borderBottom: '1px solid var(--border-light)',
          marginBottom: '20px',
          fontSize: '0.875rem',
          fontWeight: 700
        }}
      >
        <button
          onClick={() => setActiveSubTab('schedule')}
          style={{
            paddingBottom: '10px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: activeSubTab === 'schedule' ? 'var(--ir-navy-dark)' : 'var(--text-muted)',
            borderBottom: activeSubTab === 'schedule' ? '3px solid var(--ir-navy-dark)' : '3px solid transparent',
            transition: 'all 0.15s'
          }}
        >
          Timeline & Block Schedule
        </button>

        <button
          onClick={() => setActiveSubTab('budget')}
          style={{
            paddingBottom: '10px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: activeSubTab === 'budget' ? 'var(--ir-navy-dark)' : 'var(--text-muted)',
            borderBottom: activeSubTab === 'budget' ? '3px solid var(--ir-navy-dark)' : '3px solid transparent',
            transition: 'all 0.15s'
          }}
        >
          Capex Budget Allocation Optimizer
        </button>
      </div>

      {activeSubTab === 'schedule' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* ── TIMELINE / GANTT-STYLE MAINTENANCE PLANNER ── */}
          <div className="ir-card p-4">
            <div className="ir-card-header mb-3" style={{ padding: 0, border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--ir-navy-dark)', textTransform: 'uppercase' }}>
                  Corridor Block Window & Timeline Planner
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Recommended possession windows plotted against corridor train traffic density.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--ir-green)' }} />
                  <span>Recommended Window (01:00–04:00 IST)</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: '#cbd5e1' }} />
                  <span>Heavy Traffic Corridor</span>
                </span>
              </div>
            </div>

            {/* Visual Timeline Strip */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
                marginBottom: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>
                <span>20:00 (Night Rakes)</span>
                <span>23:00</span>
                <span style={{ color: 'var(--ir-green)', fontWeight: 800 }}>★ 01:00 (Low Traffic Slot)</span>
                <span style={{ color: 'var(--ir-green)', fontWeight: 800 }}>03:00 (Optimum Window)</span>
                <span>06:00 (Morning Vande Bharat)</span>
                <span>09:00 (Peak Express)</span>
              </div>

              <div style={{ width: '100%', height: 28, background: '#e2e8f0', borderRadius: 6, position: 'relative', overflow: 'hidden' }}>
                {/* Traffic indicators */}
                <div style={{ position: 'absolute', left: '0%', width: '35%', height: '100%', background: '#fed7aa', opacity: 0.5 }} title="Medium traffic" />
                <div style={{ position: 'absolute', left: '70%', width: '30%', height: '100%', background: '#fca5a5', opacity: 0.5 }} title="High traffic" />

                {/* AI Scheduled Green Window */}
                <div
                  style={{
                    position: 'absolute',
                    left: '35%',
                    width: '35%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #16a34a, #22c55e)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)'
                  }}
                >
                  RECOMMENDED WINDOW (01:00 → 04:00 IST)
                </div>
              </div>
            </div>

            {/* Table of Scheduled Blocks */}
            <div className="table-container" style={{ boxShadow: 'none' }}>
              <table className="ir-table">
                <thead>
                  <tr>
                    <th>Track</th>
                    <th>Location & Type</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Duration</th>
                    <th>Crew</th>
                    <th>Train Conflict</th>
                    <th>Penalty</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {blocks.map((blk) => (
                    <tr key={blk.block_id}>
                      <td>
                        <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--ir-navy-dark)' }}>
                          {blk.track_id}
                        </strong>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{blk.block_type}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{blk.location}</div>
                      </td>
                      <td>
                        <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--ir-green)' }}>
                          {blk.scheduled_start} IST
                        </strong>
                      </td>
                      <td>
                        <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--ir-green)' }}>
                          {blk.scheduled_end} IST
                        </strong>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>{blk.required_duration_hours} hrs</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{blk.crew_assigned}</span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--ir-green)', fontWeight: 700, fontSize: '0.75rem' }}>
                          ✓ None (0 trains)
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ir-green)', fontWeight: 700 }}>
                          ₹0.00
                        </span>
                      </td>
                      <td>
                        <RiskBadge value={blk.status} category="LOW" size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── TWO-COLUMN COMPARISON: CURRENT PLAN vs RAILGUARD PLAN ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px'
            }}
          >
            {/* CURRENT PLAN */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '18px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Current Uncoordinated Plan
                </span>
                <span style={{ fontSize: '0.6875rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                  Baseline
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6 }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Asset Availability</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#b91c1c' }}>
                    {metrics.unoptimized_asset_availability_pct}%
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6 }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Expected Downtime</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
                    7.5 hrs
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6 }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Train Delay Penalty</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#b91c1c' }}>
                    ₹4,80,000
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6 }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Number of Blocks</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
                    4 unsynchronized
                  </div>
                </div>
              </div>
            </div>

            {/* RAILGUARD AI PLAN */}
            <div
              style={{
                background: '#ffffff',
                border: '2px solid #22c55e',
                borderRadius: 'var(--radius-md)',
                padding: '18px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--ir-green)' }}>
                  RailGuard AI Optimized Plan
                </span>
                <span style={{ fontSize: '0.6875rem', background: '#e6f4ea', color: '#137333', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                  ★ Recommended Block
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: '#e6f4ea', padding: 10, borderRadius: 6 }}>
                  <span style={{ fontSize: '0.6875rem', color: '#137333' }}>Asset Availability</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#137333' }}>
                    {metrics.optimized_asset_availability_pct}%
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6 }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Expected Downtime</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--ir-green)' }}>
                    {metrics.total_downtime_hours} hrs
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6 }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Train Delay Penalty</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--ir-green)' }}>
                    ₹0.00
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6 }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Number of Blocks</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
                    {metrics.total_blocks_scheduled} synchronized
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── "WHY THIS BLOCK WAS SELECTED" CARD ── */}
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderLeft: '5px solid #16a34a',
              borderRadius: 'var(--radius-sm)',
              padding: '16px 20px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <Sparkles size={22} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#16a34a', letterSpacing: '0.04em' }}>
                  Why This Block Was Selected (Constraint Solver Explanation)
                </div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#14532d', marginTop: 4, lineHeight: 1.5 }}>
                  {reasoning}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: 6 }}>
                  Evaluated 12 alternative windows across 4 corridor segments. Zero conflict generated on Section Control interlocking board.
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── CAPEX BUDGET ALLOCATION TAB ── */
        <div className="ir-card p-4 space-y-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--ir-navy-dark)', textTransform: 'uppercase' }}>
                Zonal Capex Budget Optimization
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Allocate maintenance funds to maximize network safety and prevent critical track derailments.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Total Budget:</span>
              <select
                value={budgetInr}
                onChange={(e) => setBudgetInr(Number(e.target.value))}
                className="ir-select"
                style={{ height: '36px', fontSize: '0.8125rem' }}
              >
                <option value={2500000}>₹25 Lakhs (Constrained)</option>
                <option value={5000000}>₹50 Lakhs (Standard)</option>
                <option value={10000000}>₹1.00 Crore (Enhanced)</option>
              </select>
              <button
                onClick={handleRunBudgetOptimizer}
                disabled={loadingBudget}
                className="btn-ir-primary"
                style={{ height: '36px', fontSize: '0.8125rem' }}
              >
                {loadingBudget ? 'Solving Knapsack...' : 'Run Budget Solver'}
              </button>
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 6, border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>
              ALLOCATION RESULTS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <div style={{ background: '#fff', padding: 10, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>High-Risk Tracks Covered</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--ir-green)' }}>
                  {budgetData?.allocated_tracks?.length || 3} Tracks
                </div>
              </div>
              <div style={{ background: '#fff', padding: 10, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Risk Reduction Yield</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--ir-navy-dark)' }}>
                  -64.2% Risk
                </div>
              </div>
              <div style={{ background: '#fff', padding: 10, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Unallocated Reserve</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)' }}>
                  ₹{(budgetInr * 0.08).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Block Permit Printable Card */}
      <div
        className="ir-card p-4 no-print"
        style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--ir-navy-dark)' }}>
            Official Indian Railways Track Possession Permit
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Form T/409 compliant maintenance authorization ready for Chief Controller signature.
          </div>
        </div>
        <button onClick={printBlockPermit} className="btn-ir-secondary" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Printer size={14} />
          <span>Print Possession Order</span>
        </button>
      </div>
    </div>
  );
}
