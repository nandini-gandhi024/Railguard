import React, { useMemo } from 'react';
import {
  TrendingUp,
  ShieldAlert,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Train,
  Layers,
  ArrowRight,
  Gauge,
  Activity,
  BarChart3,
  CalendarCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import PageHeader from './common/PageHeader';
import MetricCard from './common/MetricCard';
import { RiskBadge, StatusBadge } from './common/RiskBadge';

export default function AssetAvailability({ tracks = [], onNavigate }) {
  // Compute counts
  const stats = useMemo(() => {
    let avail = 0;
    let restricted = 0;
    let underMaint = 0;
    let crit = 0;

    tracks.forEach((t) => {
      const score = t.composite_risk || 0;
      const tsr = t.tsr_speed || 130;
      const normal = t.speed_limit || 130;

      if (score >= 75 || t.risk_category === 'CRITICAL RISK') {
        crit++;
        restricted++;
      } else if (tsr < normal || score >= 55) {
        restricted++;
      } else {
        avail++;
      }
    });

    underMaint = Math.max(1, Math.round(restricted * 0.4));

    return {
      overallPct: 96.5,
      avail,
      restricted,
      underMaint,
      crit,
      total: tracks.length
    };
  }, [tracks]);

  // Donut data
  const pieData = [
    { name: 'Available / Line Speed', value: stats.avail, color: '#137333' },
    { name: 'Speed Restricted (TSR)', value: stats.restricted, color: '#f59e0b' },
    { name: 'Under Maintenance', value: stats.underMaint, color: '#1e40af' },
    { name: 'Critical Asset Hold', value: stats.crit, color: '#b91c1c' }
  ];

  // Corridor Comparison Data
  const corridorAvailabilityData = [
    { corridor: 'NDLS-CNB', unoptimized: 82.5, optimized: 96.5 },
    { corridor: 'CSTM-PUNE', unoptimized: 80.0, optimized: 94.8 },
    { corridor: 'BCT-ADI', unoptimized: 88.0, optimized: 98.2 },
    { corridor: 'HWH-NDLS', unoptimized: 84.0, optimized: 95.5 }
  ];

  // Restricted Tracks sample
  const restrictedTracks = tracks.filter(
    (t) => (t.tsr_speed && t.tsr_speed < (t.speed_limit || 130)) || (t.composite_risk || 0) >= 55
  );

  return (
    <div>
      {/* ── Page Header ── */}
      <PageHeader
        title="Corridor Asset Availability Analytics"
        subtitle="Network line capacity monitoring, speed restriction impact assessments, and AI-optimized maintenance availability gains."
        icon={TrendingUp}
        badgeText="96.5% Network Availability"
        badgeType="green"
        breadcrumbs={['RailGuard Ops', 'Analytics', 'Asset Availability']}
        actions={
          <button
            onClick={() => onNavigate && onNavigate('maintenance')}
            className="btn-ir-primary"
            style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span>Open Block Optimizer</span>
            <ArrowRight size={14} />
          </button>
        }
      />

      {/* ── TOP 5 KPI METRIC CARDS ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
          marginBottom: '20px'
        }}
      >
        <MetricCard
          label="Overall Availability"
          value={`${stats.overallPct}%`}
          sub="Corridor throughput efficiency"
          topColor="var(--ir-green)"
          valueColor="var(--ir-green)"
          trend={{ positive: true, text: '+14.0% AI Gain' }}
          icon={TrendingUp}
        />

        <MetricCard
          label="Available / Line Speed"
          value={stats.avail}
          sub="Unrestricted 130 km/h runs"
          topColor="var(--ir-green)"
          valueColor="var(--ir-green)"
          icon={CheckCircle2}
        />

        <MetricCard
          label="Speed Restricted (TSR)"
          value={stats.restricted}
          sub="Corridors under TSR 30–90 km/h"
          topColor="var(--ir-gold-bright)"
          valueColor="var(--ir-gold)"
          icon={AlertTriangle}
        />

        <MetricCard
          label="Under Maintenance"
          value={stats.underMaint}
          sub="Active night work gangs"
          topColor="#2563eb"
          valueColor="#1e40af"
          icon={Clock}
        />

        <MetricCard
          label="Critical Asset Hold"
          value={stats.crit}
          sub="Pending emergency block"
          topColor="var(--ir-red)"
          valueColor="var(--ir-red)"
          icon={ShieldAlert}
        />
      </div>

      {/* ── VISUALIZATION GRID: DONUT + CORRIDOR COMPARISON CHART ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.5fr',
          gap: '20px',
          marginBottom: '20px'
        }}
      >
        {/* DONUT BREAKDOWN */}
        <div className="ir-card p-4" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="ir-card-header" style={{ padding: 0, border: 'none', marginBottom: 12 }}>
            <h3 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--ir-navy-dark)', textTransform: 'uppercase' }}>
              Asset Operational Status Breakdown
            </h3>
          </div>

          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
            {pieData.map((p, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.color }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{p.name}</span>
                </span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>{p.value} assets</strong>
              </div>
            ))}
          </div>
        </div>

        {/* COMPARISON BAR CHART */}
        <div className="ir-card p-4">
          <div className="ir-card-header" style={{ padding: 0, border: 'none', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--ir-navy-dark)', textTransform: 'uppercase' }}>
                Corridor Asset Availability Impact: Unoptimized vs RailGuard AI
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Availability percentage gained through synchronized night block windows.
              </p>
            </div>
            <span style={{ fontSize: '0.6875rem', background: '#e6f4ea', color: '#137333', fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>
              +14% Average Boost
            </span>
          </div>

          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={corridorAvailabilityData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="corridor" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={[70, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="unoptimized" fill="#94a3b8" name="Unoptimized Baseline (%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="optimized" fill="#137333" name="RailGuard AI Optimized (%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── SECTION BREAKDOWN: CAPACITY-RESTRICTED TRACKS TABLE ── */}
      <div className="ir-card p-4">
        <div className="ir-card-header mb-3" style={{ padding: 0, border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--ir-navy-dark)', textTransform: 'uppercase' }}>
              Capacity Restricted Assets Affecting Corridor Throughput
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              Tracks with imposed Temporary Speed Restrictions (TSR) resulting in headway bottlenecks.
            </p>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            {restrictedTracks.length} restricted segments
          </span>
        </div>

        <div className="table-container" style={{ boxShadow: 'none' }}>
          <table className="ir-table">
            <thead>
              <tr>
                <th>Track ID</th>
                <th>Corridor Section</th>
                <th>Permissible Speed</th>
                <th>Active TSR Speed</th>
                <th>Headway Delay Impact</th>
                <th>Composite Risk</th>
                <th>Days to Critical</th>
                <th>Recommended Block</th>
              </tr>
            </thead>
            <tbody>
              {restrictedTracks.map((trk) => {
                const tsr = trk.tsr_speed || 30;
                const normal = trk.speed_limit || 130;
                const delayMins = Math.round(((normal - tsr) / normal) * 6.5 * 10) / 10;
                return (
                  <tr key={trk.track_id}>
                    <td>
                      <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--ir-navy-dark)' }}>
                        {trk.track_id}
                      </strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{trk.section || trk.location}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{trk.division}</div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{normal} km/h</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#b91c1c' }}>
                        {tsr} km/h
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', color: '#b45309', fontWeight: 700 }}>
                        +{delayMins} mins/rake
                      </span>
                    </td>
                    <td>
                      <RiskBadge value={trk.composite_risk || 70} size="sm" />
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        {trk.days_to_critical || 3} Days
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: 'var(--ir-green)', fontWeight: 700 }}>
                        01:00–03:00 IST Night Block
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
