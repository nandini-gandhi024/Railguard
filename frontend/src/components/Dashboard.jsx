import React, { useMemo } from 'react';
import {
  ShieldAlert,
  Clock,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Activity,
  Layers,
  MapPin,
  CheckCircle2,
  Cpu,
  Server,
  Database,
  Eye,
  SlidersHorizontal,
  Wrench,
  BarChart3,
  Zap,
  ChevronRight,
  Train,
  Navigation,
  CalendarClock,
} from 'lucide-react';

// ─── Hero SVG illustration (railway tracks) ────────────────────
function RailwayIllustration() {
  return (
    <svg
      width="280"
      height="200"
      viewBox="0 0 280 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ opacity: 0.92 }}
    >
      {/* Rails */}
      <line x1="40" y1="180" x2="240" y2="40" stroke="rgba(255,255,255,0.3)" strokeWidth="6" strokeLinecap="round" />
      <line x1="70" y1="190" x2="270" y2="50" stroke="rgba(255,255,255,0.3)" strokeWidth="6" strokeLinecap="round" />
      {/* Sleepers */}
      {[0,1,2,3,4,5,6,7].map((i) => {
        const progress = i / 7;
        const x1 = 40 + progress * 200;
        const y1 = 180 - progress * 140;
        const x2 = x1 + 30;
        const y2 = y1 + 10;
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="4"
            strokeLinecap="round"
          />
        );
      })}
      {/* Train body */}
      <rect x="160" y="60" width="80" height="38" rx="6" fill="rgba(34,197,94,0.2)" stroke="rgba(34,197,94,0.5)" strokeWidth="1.5" />
      <rect x="165" y="55" width="70" height="12" rx="4" fill="rgba(34,197,94,0.15)" stroke="rgba(34,197,94,0.35)" strokeWidth="1" />
      {/* Windows */}
      <rect x="168" y="66" width="14" height="10" rx="2" fill="rgba(255,255,255,0.25)" />
      <rect x="186" y="66" width="14" height="10" rx="2" fill="rgba(255,255,255,0.25)" />
      <rect x="204" y="66" width="14" height="10" rx="2" fill="rgba(255,255,255,0.25)" />
      {/* Wheels */}
      <circle cx="180" cy="100" r="8" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      <circle cx="220" cy="100" r="8" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      {/* Risk indicator dots along track */}
      <circle cx="95" cy="148" r="6" fill="#ef4444" opacity="0.8" />
      <circle cx="120" cy="128" r="5" fill="#f59e0b" opacity="0.8" />
      <circle cx="145" cy="108" r="4" fill="#22c55e" opacity="0.8" />
      {/* Signal */}
      <rect x="30" y="100" width="6" height="50" rx="2" fill="rgba(255,255,255,0.25)" />
      <rect x="24" y="100" width="18" height="28" rx="3" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
      <circle cx="33" cy="109" r="4" fill="#ef4444" opacity="0.9" />
      <circle cx="33" cy="119" r="4" fill="#6b7280" opacity="0.5" />
      <circle cx="33" cy="122" r="4" fill="#6b7280" opacity="0.5" />
    </svg>
  );
}

// ─── Helpers ───────────────────────────────────────────────────
function getRiskClass(score) {
  if (score >= 75) return 'text-red-600';
  if (score >= 55) return 'text-amber-600';
  if (score >= 40) return 'text-blue-600';
  return 'text-emerald-700';
}

function getRiskBadge(category) {
  switch (category) {
    case 'CRITICAL RISK': return 'ir-badge-critical';
    case 'HIGH RISK':     return 'ir-badge-high';
    case 'MODERATE RISK': return 'ir-badge-moderate';
    default:              return 'ir-badge-low';
  }
}

// ─── Quick Access Card ─────────────────────────────────────────
function QuickCard({ icon: Icon, title, desc, iconBg, iconColor, onClick }) {
  return (
    <div className="quick-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}>
      <div className="quick-card-icon" style={{ background: iconBg }}>
        <Icon size={20} color={iconColor} />
      </div>
      <div>
        <div className="quick-card-title">{title}</div>
        <div className="quick-card-desc">{desc}</div>
      </div>
      <div className="quick-card-arrow">
        Open <ChevronRight size={13} />
      </div>
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────
function StatCard({ label, value, sub, topColor, valueColor }) {
  return (
    <div className="stat-card" style={{ borderTopColor: topColor }}>
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value" style={{ color: valueColor || 'var(--text-main)' }}>
        {value}
      </div>
      <div className="stat-card-sub">{sub}</div>
    </div>
  );
}

// ─── Risk column ───────────────────────────────────────────────
function RiskCol({ title, count, tracks, headerBg, headerText, scoreColor, borderColor }) {
  return (
    <div className="risk-col" style={{ borderTop: `3px solid ${borderColor}` }}>
      <div className="risk-col-header" style={{ background: headerBg }}>
        <div>
          <div className="risk-col-title" style={{ color: headerText }}>{title}</div>
          <div className="risk-col-count" style={{ color: headerText }}>{count}</div>
        </div>
      </div>
      <div className="risk-col-body">
        {tracks.length === 0 && (
          <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', padding: '8px 0' }}>
            No sections in this range
          </div>
        )}
        {tracks.slice(0, 4).map((t) => (
          <div key={t.track_id} className="risk-track-item">
            <span className="risk-track-id">{t.track_id}</span>
            <span className="risk-track-score" style={{ color: scoreColor }}>
              {t.composite_risk || '—'}
            </span>
          </div>
        ))}
        {tracks.length > 4 && (
          <div style={{ fontSize: '0.65rem', color: 'var(--text-light)', paddingTop: 6 }}>
            +{tracks.length - 4} more
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Alert Card ────────────────────────────────────────────────
function AlertCard({ severity, trackId, route, message, recommendation, onViewDetails, onPlanMaintenance }) {
  const colorMap = {
    CRITICAL: { border: '#ef4444', bg: '#fef2f2', text: '#b91c1c' },
    HIGH:     { border: '#f59e0b', bg: '#fffbeb', text: '#b45309' },
    MODERATE: { border: '#3b82f6', bg: '#eff6ff', text: '#1d4ed8' },
  };
  const c = colorMap[severity] || colorMap.MODERATE;

  return (
    <div className="alert-card" style={{ borderLeft: `4px solid ${c.border}`, background: c.bg }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span className="alert-card-severity" style={{ color: c.text }}>{severity}</span>
          <span className="ir-badge" style={{
            background: c.bg, color: c.text, borderColor: c.border, fontSize: '0.6rem'
          }}>
            {trackId}
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
            {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST
          </span>
        </div>
        <div className="alert-card-route" style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.875rem' }}>
          {route}
        </div>
        <div className="alert-card-message">{message}</div>
        {recommendation && (
          <div style={{
            marginTop: 6, fontSize: '0.75rem', color: c.text,
            background: 'rgba(255,255,255,0.6)', borderRadius: 4,
            padding: '4px 8px', fontWeight: 500
          }}>
            ⚑ Recommended for operator review: {recommendation}
          </div>
        )}
      </div>
      <div className="alert-card-actions">
        <button className="btn-ir-secondary" style={{ fontSize: '0.75rem', padding: '6px 12px' }}
          onClick={onViewDetails}>
          View Details <ChevronRight size={13} />
        </button>
        {onPlanMaintenance && (
          <button className="btn-ir-green" style={{ fontSize: '0.75rem', padding: '6px 12px' }}
            onClick={onPlanMaintenance}>
            Plan Maintenance
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────
export default function Dashboard({ tracks = [], alerts = [], backendHealth, onNavigate, onSelectTrack }) {
  const critical = useMemo(
    () => tracks.filter((t) => (t.composite_risk || 0) >= 75 || t.risk_category === 'CRITICAL RISK'),
    [tracks]
  );
  const high = useMemo(
    () => tracks.filter((t) => (t.composite_risk || 0) >= 55 && (t.composite_risk || 0) < 75 || t.risk_category === 'HIGH RISK'),
    [tracks]
  );
  const moderate = useMemo(
    () => tracks.filter((t) => (t.composite_risk || 0) >= 40 && (t.composite_risk || 0) < 55 || t.risk_category === 'MODERATE RISK'),
    [tracks]
  );
  const safe = useMemo(
    () => tracks.filter((t) => (t.composite_risk || 0) < 40 || t.risk_category === 'LOW RISK'),
    [tracks]
  );

  const pendingMaintenance = critical.length + high.length;
  const isOnline = backendHealth?.status === 'healthy';

  // Derive some maintenance preview rows from tracks
  const maintenancePreview = tracks
    .filter((t) => (t.composite_risk || 0) >= 55)
    .slice(0, 4)
    .map((t) => ({
      trackId: t.track_id,
      risk: t.composite_risk || 65,
      category: t.risk_category || 'HIGH RISK',
      window: '01:00 – 04:00 IST',
      duration: '3 hrs',
      conflict: 'Low',
      availGain: '+2.8%',
      status: 'Recommended',
    }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── System Advisory Strip ── */}
      <div style={{
        background: '#fff', border: '1px solid var(--border-light)',
        borderRadius: '10px', padding: '10px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 10, marginBottom: 20, boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', fontSize: '0.75rem' }}>
          <span style={{ fontWeight: 700, color: 'var(--ir-navy-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Server size={14} />  System Status
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)',
            background: '#f8fafc', padding: '3px 10px', borderRadius: 5, border: '1px solid var(--border-light)' }}>
            <CheckCircle2 size={13} color={isOnline ? '#22c55e' : '#f59e0b'} />
            API Services: <b style={{ color: 'var(--text-main)', marginLeft: 3 }}>
              {isOnline ? 'Operational' : 'Local / Hybrid'}
            </b>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)',
            background: '#f8fafc', padding: '3px 10px', borderRadius: 5, border: '1px solid var(--border-light)' }}>
            <Database size={13} color="#3b82f6" />
            Database: <b style={{ color: 'var(--text-main)', marginLeft: 3 }}>Synchronized</b>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)',
            background: '#f8fafc', padding: '3px 10px', borderRadius: 5, border: '1px solid var(--border-light)' }}>
            <Cpu size={13} color="#8b5cf6" />
            Risk AI: <b style={{ color: 'var(--text-main)', marginLeft: 3 }}>Active</b>
          </span>
        </div>
        </div>

      {/* ── Hero Section ── */}
      <div className="hero-section" style={{ marginBottom: 24 }}>
        <div className="hero-content">
          <div className="hero-eyebrow">
            <Train size={11} /> AI-Powered Railway Safety Platform
          </div>
          <h1 className="hero-title">
            Rail<span>Guard</span>
          </h1>
          <div className="hero-subtitle">
            AI-Powered Railway Asset Risk &amp; Maintenance Planning
          </div>
          <p className="hero-description">
            Identify track defects, predict deterioration risk, optimize maintenance blocks
            and improve asset availability — all in one integrated operations platform.
          </p>
          <div className="hero-actions">
            <button className="btn-hero-primary" onClick={() => onNavigate('cv_studio')}>
              <Eye size={16} /> Analyze Track
            </button>
            <button className="btn-hero-secondary" onClick={() => onNavigate('maintenance')}>
              <CalendarClock size={16} /> Plan Maintenance
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <RailwayIllustration />
        </div>
      </div>

      {/* ── Quick Access Cards ── */}
      <div style={{ marginBottom: 8 }}>
        <div className="section-heading">
          <h2><Layers className="heading-icon" /> Quick Access</h2>
        </div>
        <div className="quick-cards-grid">
          <QuickCard
            icon={Eye}
            title="AI Fault Detection"
            desc="Detect track defects from inspection images using AI vision models"
            iconBg="#eff6ff" iconColor="#1d4ed8"
            onClick={() => onNavigate('cv_studio')}
          />
          <QuickCard
            icon={ShieldAlert}
            title="Risk Prediction"
            desc="Predict deterioration and identify critical sections before failures occur"
            iconBg="#fef2f2" iconColor="#b91c1c"
            onClick={() => onNavigate('track_risk')}
          />
          <QuickCard
            icon={CalendarClock}
            title="Smart Block Planning"
            desc="Find optimized maintenance windows that minimize train disruption"
            iconBg="#f0fdf4" iconColor="#15803d"
            onClick={() => onNavigate('maintenance')}
          />
          <QuickCard
            icon={TrendingUp}
            title="Asset Availability"
            desc="Improve track availability while reducing unplanned downtime"
            iconBg="#f5f3ff" iconColor="#7c3aed"
            onClick={() => onNavigate('asset_avail')}
          />
          <QuickCard
            icon={MapPin}
            title="GIS Track Map"
            desc="Visualize track condition and risk levels geographically"
            iconBg="#ecfdf5" iconColor="#059669"
            onClick={() => onNavigate('gis_map')}
          />
          <QuickCard
            icon={SlidersHorizontal}
            title="What-If Simulation"
            desc="Test maintenance scenarios and risk interventions before execution"
            iconBg="#fff7ed" iconColor="#c2410c"
            onClick={() => onNavigate('simulator')}
          />
        </div>
      </div>

      {/* ── Live Operations Stats ── */}
      <div style={{ marginBottom: 8 }}>
        <div className="section-heading" style={{ marginBottom: 12 }}>
          <h2><BarChart3 className="heading-icon" /> Live Operations Overview</h2>
        </div>
        <div className="stats-grid">
          <StatCard
            label="Total Track Sections"
            value={tracks.length || 6}
            sub="Monitored across zones"
            topColor="var(--ir-navy-dark)"
            valueColor="var(--ir-navy-dark)"
          />
          <StatCard
            label="Critical Risk"
            value={critical.length}
            sub="Risk score ≥ 75"
            topColor="#ef4444"
            valueColor="#b91c1c"
          />
          <StatCard
            label="High Risk"
            value={high.length}
            sub="Risk score 55–74"
            topColor="#f59e0b"
            valueColor="#b45309"
          />
          <StatCard
            label="Pending Maintenance"
            value={pendingMaintenance}
            sub="Sections need action"
            topColor="#8b5cf6"
            valueColor="#6d28d9"
          />
          <StatCard
            label="Asset Availability"
            value="96.5%"
            sub="+14.0% vs baseline"
            topColor="var(--ir-green)"
            valueColor="var(--ir-green)"
          />
          <StatCard
            label="Active Alerts"
            value={alerts.length || critical.length}
            sub="Require attention"
            topColor={alerts.length > 0 ? '#ef4444' : '#94a3b8'}
            valueColor={alerts.length > 0 ? '#b91c1c' : 'var(--text-muted)'}
          />
        </div>
      </div>

      {/* ── Risk Overview ── */}
      <div style={{ marginBottom: 8 }}>
        <div className="section-heading" style={{ marginBottom: 12 }}>
          <h2><Activity className="heading-icon" /> Network Risk Overview</h2>
          <button className="btn-ir-secondary" style={{ fontSize: '0.75rem' }}
            onClick={() => onNavigate('track_risk')}>
            View Full Risk Analysis <ArrowRight size={13} />
          </button>
        </div>
        <div className="risk-overview-grid">
          <RiskCol
            title="Critical"
            count={critical.length}
            tracks={critical}
            headerBg="#fef2f2"
            headerText="#b91c1c"
            scoreColor="#b91c1c"
            borderColor="#ef4444"
          />
          <RiskCol
            title="High Risk"
            count={high.length}
            tracks={high}
            headerBg="#fffbeb"
            headerText="#b45309"
            scoreColor="#b45309"
            borderColor="#f59e0b"
          />
          <RiskCol
            title="Moderate"
            count={moderate.length}
            tracks={moderate}
            headerBg="#eff6ff"
            headerText="#1d4ed8"
            scoreColor="#1d4ed8"
            borderColor="#3b82f6"
          />
          <RiskCol
            title="Safe"
            count={safe.length}
            tracks={safe}
            headerBg="#f0fdf4"
            headerText="#15803d"
            scoreColor="#15803d"
            borderColor="#22c55e"
          />
        </div>
      </div>

      {/* ── Critical Alerts ── */}
      <div style={{ marginBottom: 8 }}>
        <div className="section-heading" style={{ marginBottom: 12 }}>
          <h2><AlertTriangle className="heading-icon" /> Critical Alerts</h2>
          <button className="btn-ir-secondary" style={{ fontSize: '0.75rem' }}
            onClick={() => onNavigate('alerts')}>
            All Alerts <ArrowRight size={13} />
          </button>
        </div>
        <div className="alerts-list">
          {/* Always show T041 as a demo critical alert */}
          <AlertCard
            severity="CRITICAL"
            trackId="T041"
            route="KM 142.5 – Delhi–Kanpur Mainline (NDLS–CNB)"
            message="Predicted critical condition in 4 days. Transverse rail crack detected. TSR 30 km/h enforced. Speed restriction active."
            recommendation="Maintenance block within 48 hours"
            onViewDetails={() => { onSelectTrack('T041'); }}
            onPlanMaintenance={() => onNavigate('maintenance')}
          />
          {critical.filter((t) => t.track_id !== 'T041').slice(0, 1).map((t) => (
            <AlertCard
              key={t.track_id}
              severity="CRITICAL"
              trackId={t.track_id}
              route={`${t.location} – ${t.zone}`}
              message={`Risk score ${t.composite_risk}/100. ${t.days_to_critical !== undefined ? `Predicted critical in ${t.days_to_critical} days.` : 'Immediate inspection required.'}`}
              recommendation="Schedule emergency maintenance block"
              onViewDetails={() => { onSelectTrack(t.track_id); }}
              onPlanMaintenance={() => onNavigate('maintenance')}
            />
          ))}
          {high.slice(0, 1).map((t) => (
            <AlertCard
              key={t.track_id}
              severity="HIGH"
              trackId={t.track_id}
              route={`${t.location} – ${t.zone}`}
              message={`Risk score ${t.composite_risk}/100. Elevated risk detected. Monitoring required.`}
              recommendation="Plan maintenance within 7 days"
              onViewDetails={() => { onSelectTrack(t.track_id); }}
            />
          ))}
          {critical.length === 0 && high.length === 0 && (
            <div style={{
              background: '#f0fdf4', border: '1px solid #a7f3d0',
              borderRadius: 10, padding: '20px 24px', textAlign: 'center',
              color: '#15803d', fontSize: '0.875rem'
            }}>
              <CheckCircle2 size={20} style={{ marginBottom: 6, display: 'block', margin: '0 auto 8px' }} />
              No critical or high risk alerts. All monitored sections are within acceptable risk levels.
            </div>
          )}
        </div>
      </div>

      {/* ── Maintenance Planning Preview ── */}
      <div style={{ marginBottom: 8 }}>
        <div className="section-heading" style={{ marginBottom: 12 }}>
          <h2><Wrench className="heading-icon" /> Recommended Maintenance Blocks</h2>
          <button className="btn-ir-secondary" style={{ fontSize: '0.75rem' }}
            onClick={() => onNavigate('maintenance')}>
            Open Block Planner <ArrowRight size={13} />
          </button>
        </div>
        <div className="maintenance-preview">
          {maintenancePreview.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No maintenance recommendations at this time.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="ir-table">
                <thead>
                  <tr>
                    <th>Track</th>
                    <th>Risk Score</th>
                    <th>Recommended Window</th>
                    <th>Duration</th>
                    <th>Train Conflict</th>
                    <th>Avail. Gain</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {maintenancePreview.map((m) => (
                    <tr key={m.trackId}>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ir-navy-dark)' }}>
                          {m.trackId}
                        </span>
                      </td>
                      <td>
                        <span className={`ir-badge ${getRiskBadge(m.category)}`}>
                          {m.risk} / 100
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                        {m.window}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{m.duration}</td>
                      <td>
                        <span style={{
                          color: m.conflict === 'Low' ? 'var(--ir-green)' : 'var(--ir-amber)',
                          fontWeight: 600, fontSize: '0.75rem'
                        }}>
                          {m.conflict}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--ir-green)', fontWeight: 700, fontSize: '0.8rem' }}>
                          {m.availGain}
                        </span>
                      </td>
                      <td>
                        <span className="ir-badge ir-badge-navy">{m.status}</span>
                      </td>
                      <td>
                        <button
                          className="btn-ir-secondary"
                          style={{ fontSize: '0.7rem', padding: '5px 10px' }}
                          onClick={() => onNavigate('maintenance')}
                        >
                          Plan
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── GIS Preview Card ── */}
      <div style={{ marginBottom: 8 }}>
        <div className="section-heading" style={{ marginBottom: 12 }}>
          <h2><Navigation className="heading-icon" /> GIS Track Map</h2>
          <button className="btn-ir-secondary" style={{ fontSize: '0.75rem' }}
            onClick={() => onNavigate('gis_map')}>
            Open Full Map <ArrowRight size={13} />
          </button>
        </div>
        <div
          onClick={() => onNavigate('gis_map')}
          style={{
            background: 'linear-gradient(135deg, var(--ir-navy-dark) 0%, var(--ir-navy) 100%)',
            borderRadius: 12, padding: '32px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', gap: 24, boxShadow: 'var(--shadow-md)',
            border: '1px solid rgba(255,255,255,0.08)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
          role="button" tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onNavigate('gis_map')}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <MapPin size={18} color="var(--ir-green-bright)" />
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                Interactive GIS Track Map
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', maxWidth: 400, lineHeight: 1.6 }}>
              Visualize track conditions, risk levels, and weather overlays across the Indian Railways network.
              Risk-coded polylines and defect markers on interactive OpenStreetMap tiles.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
              {['Risk Heatmap', 'Defect Markers', 'Weather Overlays', 'Zone Filters'].map((tag) => (
                <span key={tag} style={{
                  fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)',
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 4, padding: '3px 9px'
                }}>{tag}</span>
              ))}
            </div>
          </div>
          <div style={{ flexShrink: 0, opacity: 0.8 }}>
            <Zap size={64} color="rgba(255,255,255,0.1)" />
          </div>
        </div>
      </div>

    </div>
  );
}
