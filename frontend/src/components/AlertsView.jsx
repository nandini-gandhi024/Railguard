import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowRight,
  BellRing,
  MapPin,
  Check,
  RefreshCw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import PageHeader from './common/PageHeader';
import MetricCard from './common/MetricCard';
import { RiskBadge, StatusBadge } from './common/RiskBadge';
import { getActiveAlerts } from '../services/api';

export default function AlertsView({ tracks = [], onNavigateToRisk, onNavigateToPlanner }) {
  const [alertsData, setAlertsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'HIGH' | 'WARNING' | 'RESOLVED'
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewedAlerts, setReviewedAlerts] = useState({});

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await getActiveAlerts();
      setAlertsData(data);
    } catch (err) {
      console.error('[AlertsView] Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReviewed = (alertId) => {
    setReviewedAlerts((prev) => ({
      ...prev,
      [alertId]: {
        reviewedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        reviewedBy: 'Control Room Officer'
      }
    }));
  };

  const rawAlerts = alertsData?.alerts || [
    {
      alert_id: 'ALT-NR-001',
      track_id: 'T041',
      location: 'KM 142.5 Delhi-Kanpur Mainline',
      section: 'NDLS-CNB Mainline',
      severity: 'CRITICAL',
      risk_score: 88.5,
      timestamp: '2026-09-08 21:30 IST',
      reason: 'Transverse rail crack detected on high-GMT corridor with severe thermal expansion (42°C rail ambient)',
      recommended_action: 'Impose TSR 30 km/h and schedule emergency night maintenance block (01:00-03:00 IST)'
    },
    {
      alert_id: 'ALT-CR-002',
      track_id: 'TRK-CR-204',
      location: 'KM 42.1 Kharghar-Panvel',
      section: 'CSTM-PUNE Corridor',
      severity: 'HIGH',
      risk_score: 82.0,
      timestamp: '2026-09-08 20:45 IST',
      reason: 'Broken concrete sleeper with high GMT freight fatigue load',
      recommended_action: 'Apply TSR 30 km/h and plan sleeper replacement within 72 hours'
    },
    {
      alert_id: 'ALT-ER-003',
      track_id: 'TRK-ER-405',
      location: 'KM 195.4 Barddhaman-Asansol',
      section: 'HWH-NDLS Grand Chord',
      severity: 'WARNING',
      risk_score: 68.0,
      timestamp: '2026-09-08 19:15 IST',
      reason: 'Ballast voiding and track settlement detected under heavy freight corridor',
      recommended_action: 'Schedule tamping machine pass during upcoming weekend block window'
    }
  ];

  // Counts
  const counts = useMemo(() => {
    let crit = 0;
    let high = 0;
    let warn = 0;
    let res = Object.keys(reviewedAlerts).length;

    rawAlerts.forEach((a) => {
      if (reviewedAlerts[a.alert_id]) return;
      if (a.severity === 'CRITICAL') crit++;
      else if (a.severity === 'HIGH') high++;
      else warn++;
    });

    return { crit, high, warn, res, total: rawAlerts.length };
  }, [rawAlerts, reviewedAlerts]);

  // Filtered alerts list
  const filteredAlerts = useMemo(() => {
    return rawAlerts.filter((a) => {
      const isResolved = Boolean(reviewedAlerts[a.alert_id]);

      // Tab filter
      if (activeTab === 'RESOLVED') {
        if (!isResolved) return false;
      } else if (activeTab !== 'ALL') {
        if (isResolved) return false;
        if (a.severity !== activeTab) return false;
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          (a.track_id || '').toLowerCase().includes(q) ||
          (a.location || '').toLowerCase().includes(q) ||
          (a.reason || '').toLowerCase().includes(q) ||
          (a.alert_id || '').toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [rawAlerts, activeTab, searchQuery, reviewedAlerts]);

  const getAlertSeverityStyles = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          border: 'var(--ir-red)',
          bg: '#ffffff',
          badgeBg: '#fee2e2',
          badgeText: '#b91c1c',
          tag: 'CRITICAL'
        };
      case 'HIGH':
        return {
          border: 'var(--ir-gold-bright)',
          bg: '#ffffff',
          badgeBg: '#fef3c7',
          badgeText: '#b45309',
          tag: 'HIGH'
        };
      case 'WARNING':
        return {
          border: '#2563eb',
          bg: '#ffffff',
          badgeBg: '#eff6ff',
          badgeText: '#1d4ed8',
          tag: 'WARNING'
        };
      default:
        return {
          border: 'var(--border-med)',
          bg: '#ffffff',
          badgeBg: '#f1f5f9',
          badgeText: '#475569',
          tag: 'INFO'
        };
    }
  };

  return (
    <div>
      {/* ── Page Header ── */}
      <PageHeader
        title="Operations Control Room Alert Center"
        subtitle="Real-time automated alerts for critical track flaws, extreme thermal hazards, speed restriction triggers, and PWI block requisitions."
        icon={BellRing}
        badgeText={`${counts.crit} Critical Actionable`}
        badgeType={counts.crit > 0 ? 'red' : 'navy'}
        breadcrumbs={['RailGuard Ops', 'Safety & Telemetry', 'Alert Center']}
        actions={
          <button
            onClick={fetchAlerts}
            disabled={loading}
            className="btn-ir-secondary"
            style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 6, height: '36px' }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Feed</span>
          </button>
        }
      />

      {/* ── TOP KPI CARDS ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
          marginBottom: '20px'
        }}
      >
        <MetricCard
          label="Critical Alerts"
          value={counts.crit}
          sub="Immediate TSR & Block Required"
          topColor="var(--ir-red)"
          valueColor="var(--ir-red)"
          icon={ShieldAlert}
          onClick={() => setActiveTab('CRITICAL')}
        />

        <MetricCard
          label="High Risk Alerts"
          value={counts.high}
          sub="Requires PWI inspection within 72h"
          topColor="var(--ir-gold-bright)"
          valueColor="var(--ir-gold)"
          icon={AlertTriangle}
          onClick={() => setActiveTab('HIGH')}
        />

        <MetricCard
          label="Warning Alerts"
          value={counts.warn}
          sub="Geometry & ballast settlement"
          topColor="#2563eb"
          valueColor="#1e40af"
          icon={Clock}
          onClick={() => setActiveTab('WARNING')}
        />

        <MetricCard
          label="Reviewed / Resolved"
          value={counts.res}
          sub="Acknowledged by Section Controller"
          topColor="var(--ir-green)"
          valueColor="var(--ir-green)"
          icon={CheckCircle2}
          onClick={() => setActiveTab('RESOLVED')}
        />
      </div>

      {/* ── TABS & SEARCH BAR ── */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12
        }}
      >
        {/* Category Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {[
            { key: 'ALL', label: `All Alerts (${counts.total})` },
            { key: 'CRITICAL', label: `Critical (${counts.crit})` },
            { key: 'HIGH', label: `High (${counts.high})` },
            { key: 'WARNING', label: `Warning (${counts.warn})` },
            { key: 'RESOLVED', label: `Resolved (${counts.res})` }
          ].map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  border: '1px solid',
                  borderColor: active ? 'var(--ir-navy-dark)' : 'var(--border-med)',
                  background: active ? 'var(--ir-navy-dark)' : '#ffffff',
                  color: active ? '#ffffff' : 'var(--text-secondary)',
                  borderRadius: 9999,
                  padding: '5px 14px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input
            type="text"
            placeholder="Search alerts by track ID, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ir-input"
            style={{ width: '100%', paddingLeft: '32px', height: '34px', fontSize: '0.8125rem' }}
          />
        </div>
      </div>

      {/* ── ALERTS LIST CARDS ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredAlerts.length === 0 ? (
          <div
            className="ir-card p-6"
            style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '48px 24px' }}
          >
            <CheckCircle2 size={36} color="var(--ir-green)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px' }}>
              No Active Alerts in this Category
            </h3>
            <p style={{ fontSize: '0.8125rem', margin: 0 }}>
              All track assets in the selected filter range are operating within safe permissible limits.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alt) => {
            const isResolved = Boolean(reviewedAlerts[alt.alert_id]);
            const s = getAlertSeverityStyles(alt.severity);

            return (
              <div
                key={alt.alert_id}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-light)',
                  borderLeft: `5px solid ${isResolved ? 'var(--ir-green)' : s.border}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 20px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  opacity: isResolved ? 0.75 : 1.0,
                  transition: 'opacity 0.2s ease'
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        background: isResolved ? '#e6f4ea' : s.badgeBg,
                        color: isResolved ? '#137333' : s.badgeText,
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: 4,
                        letterSpacing: '0.04em'
                      }}
                    >
                      {isResolved ? 'RESOLVED' : alt.severity}
                    </span>

                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.875rem', color: 'var(--ir-navy-dark)' }}>
                      {alt.track_id}
                    </span>

                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      • {alt.alert_id}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Clock size={13} />
                    <span>{alt.timestamp}</span>
                  </div>
                </div>

                {/* Location & Section */}
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {alt.location}
                </div>

                {/* Reason description */}
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  <strong>Fault Reason:</strong> {alt.reason}
                </div>

                {/* Recommended action highlight */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid var(--border-light)',
                    borderRadius: 6,
                    padding: '8px 12px',
                    fontSize: '0.75rem',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8
                  }}
                >
                  <span style={{ color: 'var(--ir-navy-dark)', fontWeight: 800, whiteSpace: 'nowrap' }}>
                    Recommended Action:
                  </span>
                  <span style={{ fontWeight: 600, color: '#0d3057' }}>{alt.recommended_action}</span>
                </div>

                {/* Bottom action bar */}
                <div
                  style={{
                    borderTop: '1px solid var(--border-light)',
                    paddingTop: 10,
                    marginTop: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 10
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {isResolved ? (
                      <span style={{ color: 'var(--ir-green)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Check size={14} /> Reviewed at {reviewedAlerts[alt.alert_id].reviewedAt} by {reviewedAlerts[alt.alert_id].reviewedBy}
                      </span>
                    ) : (
                      <span>Decision support advisory. Operator acknowledgement required.</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {!isResolved && (
                      <button
                        onClick={() => handleMarkReviewed(alt.alert_id)}
                        className="btn-ir-secondary"
                        style={{ fontSize: '0.75rem', padding: '5px 12px' }}
                      >
                        Mark as Reviewed
                      </button>
                    )}

                    <button
                      onClick={() => onNavigateToRisk && onNavigateToRisk(alt.track_id)}
                      className="btn-ir-secondary"
                      style={{ fontSize: '0.75rem', padding: '5px 12px' }}
                    >
                      View Track
                    </button>

                    <button
                      onClick={() => onNavigateToPlanner && onNavigateToPlanner(alt.track_id)}
                      className="btn-ir-primary"
                      style={{ fontSize: '0.75rem', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <span>Schedule Block</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
