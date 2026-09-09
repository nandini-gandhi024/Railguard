import React, { useState, useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  ShieldAlert,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Download,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import PageHeader from './common/PageHeader';
import MetricCard from './common/MetricCard';
import FilterBar from './common/FilterBar';
import { RiskBadge, StatusBadge } from './common/RiskBadge';
import TrackDetailDrawer from './common/TrackDetailDrawer';

export default function TrackRisk({
  tracks = [],
  selectedTrackId,
  onSelectTrack,
  onNavigateToPlanner
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedDivision, setSelectedDivision] = useState('ALL');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTrack, setActiveTrack] = useState(null);

  // Extract unique filter dropdown values
  const zones = useMemo(() => {
    const s = new Set(tracks.map((t) => t.zone).filter(Boolean));
    return ['ALL', ...Array.from(s)];
  }, [tracks]);

  const divisions = useMemo(() => {
    const s = new Set(tracks.map((t) => t.division).filter(Boolean));
    return ['ALL', ...Array.from(s)];
  }, [tracks]);

  const sections = useMemo(() => {
    const s = new Set(tracks.map((t) => t.section).filter(Boolean));
    return ['ALL', ...Array.from(s)];
  }, [tracks]);

  const statuses = useMemo(() => {
    const s = new Set(tracks.map((t) => t.status).filter(Boolean));
    return ['ALL', ...Array.from(s)];
  }, [tracks]);

  // Compute Top KPI Cards
  const kpis = useMemo(() => {
    let crit = 0;
    let high = 0;
    let mod = 0;
    let low = 0;
    let sumScore = 0;

    tracks.forEach((t) => {
      const score = t.composite_risk || 0;
      sumScore += score;
      if (score >= 75 || t.risk_category === 'CRITICAL RISK') crit++;
      else if (score >= 55 || t.risk_category === 'HIGH RISK') high++;
      else if (score >= 40 || t.risk_category === 'MODERATE RISK') mod++;
      else low++;
    });

    const avg = tracks.length > 0 ? (sumScore / tracks.length).toFixed(1) : '0.0';

    return { crit, high, mod, low, avg };
  }, [tracks]);

  // Filtered tracks
  const filteredTracks = useMemo(() => {
    return tracks.filter((t) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          (t.track_id || '').toLowerCase().includes(q) ||
          (t.location || '').toLowerCase().includes(q) ||
          (t.section || '').toLowerCase().includes(q) ||
          (t.division || '').toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Zone filter
      if (selectedZone !== 'ALL' && t.zone !== selectedZone) return false;

      // Division filter
      if (selectedDivision !== 'ALL' && t.division !== selectedDivision) return false;

      // Section filter
      if (selectedSection !== 'ALL' && t.section !== selectedSection) return false;

      // Status filter
      if (selectedStatus !== 'ALL' && t.status !== selectedStatus) return false;

      // Risk category chips
      if (selectedCategory !== 'ALL') {
        const score = t.composite_risk || 0;
        if (selectedCategory === 'CRITICAL' && !(score >= 75 || t.risk_category === 'CRITICAL RISK')) return false;
        if (selectedCategory === 'HIGH' && !(score >= 55 && score < 75 || t.risk_category === 'HIGH RISK')) return false;
        if (selectedCategory === 'MODERATE' && !(score >= 40 && score < 55 || t.risk_category === 'MODERATE RISK')) return false;
        if (selectedCategory === 'LOW' && !(score < 40 || t.risk_category === 'LOW RISK')) return false;
      }

      return true;
    });
  }, [tracks, searchQuery, selectedZone, selectedDivision, selectedSection, selectedStatus, selectedCategory]);

  const handleOpenDrawer = (track) => {
    setActiveTrack(track);
    setDrawerOpen(true);
    if (onSelectTrack) onSelectTrack(track.track_id);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedZone('ALL');
    setSelectedDivision('ALL');
    setSelectedSection('ALL');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
  };

  return (
    <div>
      {/* ── Page Header ── */}
      <PageHeader
        title="Track Risk Assessment"
        subtitle="Monitor railway asset condition, predicted risk and urgency."
        icon={Activity}
        badgeType="navy"
        breadcrumbs={['RailGuard Ops', 'Asset Health', 'Track Risk']}
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
          label="Critical Tracks"
          value={kpis.crit}
          sub="Immediate block required (<48h)"
          topColor="var(--ir-red)"
          valueColor="var(--ir-red)"
          icon={ShieldAlert}
          onClick={() => setSelectedCategory('CRITICAL')}
        />

        <MetricCard
          label="High Risk Tracks"
          value={kpis.high}
          sub="TSR speed restricted corridor"
          topColor="var(--ir-gold-bright)"
          valueColor="var(--ir-gold)"
          icon={AlertTriangle}
          onClick={() => setSelectedCategory('HIGH')}
        />

        <MetricCard
          label="Moderate Risk"
          value={kpis.mod}
          sub="Scheduled for tamping pass"
          topColor="#2563eb"
          valueColor="#1e40af"
          icon={Clock}
          onClick={() => setSelectedCategory('MODERATE')}
        />

        <MetricCard
          label="Low Risk"
          value={kpis.low}
          sub="Normal operating line speed"
          topColor="var(--ir-green)"
          valueColor="var(--ir-green)"
          icon={CheckCircle2}
          onClick={() => setSelectedCategory('LOW')}
        />

        <MetricCard
          label="Avg Risk Score"
          value={kpis.avg}
          sub="Network composite average"
          topColor="var(--ir-navy-dark)"
          valueColor="var(--ir-navy-dark)"
          icon={TrendingUp}
        />
      </div>

      {/* ── FILTER BAR ── */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search Track ID, section, location, division..."
        filters={[
          { label: 'Zone', value: selectedZone, options: zones, onChange: setSelectedZone },
          { label: 'Division', value: selectedDivision, options: divisions, onChange: setSelectedDivision },
          { label: 'Section', value: selectedSection, options: sections, onChange: setSelectedSection },
          { label: 'Status', value: selectedStatus, options: statuses, onChange: setSelectedStatus }
        ]}
        activeCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        totalCount={tracks.length}
        filteredCount={filteredTracks.length}
        onReset={handleResetFilters}
      />

      {/* ── MAIN CONTENT: Table/Card Hybrid ── */}
      <div className="table-container">
        <table className="ir-table">
          <thead>
            <tr>
              <th>Track ID</th>
              <th>Location & Section</th>
              <th>Risk Score</th>
              <th>Category</th>
              <th>Priority</th>
              <th>7-Day Risk</th>
              <th>14-Day Risk</th>
              <th>Days to Critical</th>
              <th>TSR</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTracks.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  No railway tracks matched the active filter criteria.
                </td>
              </tr>
            ) : (
              filteredTracks.map((tr) => {
                const score = tr.composite_risk || 45.0;
                const pred7 = (score >= 75 ? (score + 5.7).toFixed(1) : (score + 3.2).toFixed(1));
                const pred14 = (score >= 75 ? (score + 10.1).toFixed(1) : (score + 6.8).toFixed(1));
                const daysCrit = tr.days_to_critical || (score >= 75 ? 2 : (score >= 55 ? 7 : 24));
                const tsr = tr.tsr_speed || (score >= 75 ? 30 : tr.speed_limit || 130);
                const normal = tr.speed_limit || 130;
                const isRestricted = tsr < normal;

                let scoreBarColor = 'var(--ir-green)';
                if (score >= 75) scoreBarColor = 'var(--ir-red)';
                else if (score >= 55) scoreBarColor = 'var(--ir-gold-bright)';
                else if (score >= 40) scoreBarColor = '#2563eb';

                return (
                  <tr
                    key={tr.track_id}
                    onClick={() => handleOpenDrawer(tr)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Track ID */}
                    <td>
                      <span
                        style={{
                          fontWeight: 800,
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--ir-navy-dark)',
                          letterSpacing: '0.02em'
                        }}
                      >
                        {tr.track_id}
                      </span>
                    </td>

                    {/* Location */}
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        {tr.location || tr.section}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        {tr.section} • {tr.zone}
                      </div>
                    </td>

                    {/* Risk Score + visual progress */}
                    <td style={{ minWidth: '130px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 900, fontFamily: 'var(--font-mono)', color: scoreBarColor, fontSize: '0.875rem' }}>
                          {score}
                        </span>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>/100</span>
                      </div>
                      <div style={{ width: '100%', height: 6, background: '#e2e8f0', borderRadius: 9999, overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${Math.min(score, 100)}%`,
                            height: '100%',
                            backgroundColor: scoreBarColor,
                            borderRadius: 9999
                          }}
                        />
                      </div>
                    </td>

                    {/* Category */}
                    <td>
                      <RiskBadge value={score} category={tr.risk_category} size="sm" />
                    </td>

                    {/* Priority */}
                    <td>
                      <span style={{ fontWeight: 700, fontSize: '0.75rem', color: score >= 75 ? 'var(--ir-red)' : 'var(--text-secondary)' }}>
                        {score >= 75 ? 'P1' : (score >= 55 ? 'P2' : 'P3')}
                      </span>
                    </td>

                    {/* 7-Day Risk */}
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: pred7 >= 75 ? 'var(--ir-red)' : 'var(--text-main)' }}>
                        {pred7}
                      </span>
                    </td>

                    {/* 14-Day Risk */}
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: pred14 >= 85 ? 'var(--ir-red)' : 'var(--text-main)' }}>
                        {pred14}
                      </span>
                    </td>

                    {/* Days to Critical */}
                    <td>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: daysCrit <= 3 ? 'var(--ir-red)' : 'var(--text-secondary)'
                        }}
                      >
                        {daysCrit}d
                      </span>
                    </td>

                    {/* TSR */}
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          fontFamily: 'var(--font-mono)',
                          color: isRestricted ? 'var(--ir-red)' : 'var(--ir-green)',
                          fontSize: '0.75rem'
                        }}
                      >
                        {tsr} km/h
                      </span>
                      {isRestricted && (
                        <span style={{ display: 'block', fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                          (Norm {normal})
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td>
                      <StatusBadge status={tr.status || (score >= 75 ? 'Speed Restricted' : 'Operational')} size="sm" />
                    </td>

                    {/* Action */}
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn-ir-secondary"
                        style={{ fontSize: '0.6875rem', padding: '4px 10px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDrawer(tr);
                        }}
                      >
                        Inspect <ChevronRight size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Polished Track Detail Drawer ── */}
      <TrackDetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        track={activeTrack}
        onNavigateToPlanner={onNavigateToPlanner}
      />
    </div>
  );
}
