import React, { useState } from 'react';
import {
  Search,
  Layers,
  Globe,
  RotateCcw,
  ShieldAlert,
  Maximize2,
  Wrench,
  CloudSun,
  MapPin,
  Flame,
  Check,
  Eye,
  SlidersHorizontal
} from 'lucide-react';

export default function MapFilters({
  sections = [],
  riskFilter,
  setRiskFilter,
  envFilter,
  setEnvFilter,
  baseLayer,
  setBaseLayer,
  searchQuery,
  setSearchQuery,
  showEnvMarkers,
  setShowEnvMarkers,
  showStations,
  setShowStations,
  showMaintenance,
  setShowMaintenance,
  showRiskLayer,
  setShowRiskLayer,
  criticalView,
  setCriticalView,
  riskHeatmap,
  setRiskHeatmap,
  corridorMode,
  setCorridorMode,
  stats = { total: 0, critical: 0, high: 0, medium: 0, low: 0 },
  onResetFilters,
  onFitAll,
  onSelectTrack
}) {
  const [searchFocused, setSearchFocused] = useState(false);

  const riskButtons = [
    { id: 'ALL', label: 'All', count: stats.total, color: '#0a2540', bg: '#f8fafc' },
    { id: 'CRITICAL', label: 'Critical', count: stats.critical, color: '#b91c1c', bg: '#fee2e2' },
    { id: 'HIGH', label: 'High Risk', count: stats.high, color: '#b45309', bg: '#fef3c7' },
    { id: 'MEDIUM', label: 'Moderate', count: stats.medium, color: '#1d4ed8', bg: '#eff6ff' },
    { id: 'LOW', label: 'Safe', count: stats.low, color: '#137333', bg: '#e6f4ea' }
  ];

  // Auto-complete search results
  const searchResults = searchQuery.trim()
    ? sections.filter((s) => {
        const q = searchQuery.toLowerCase();
        return (
          (s.section_id || '').toLowerCase().includes(q) ||
          (s.route_name || '').toLowerCase().includes(q) ||
          (s.start_station || '').toLowerCase().includes(q) ||
          (s.end_station || '').toLowerCase().includes(q) ||
          (s.track_id || '').toLowerCase().includes(q)
        );
      }).slice(0, 5)
    : [];

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      {/* Top Row: Search (with dropdown) + Risk Filter Chips + Base Map Switcher + Actions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
        {/* Search Input Container */}
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: '200px' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-light)',
              pointerEvents: 'none'
            }}
          />
          <input
            type="text"
            placeholder="Search track T041, corridor, station..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            className="ir-input"
            style={{
              paddingLeft: '32px',
              width: '100%',
              height: '32px',
              fontSize: '0.75rem'
            }}
          />

          {/* Instant Search Results Dropdown */}
          {searchFocused && searchResults.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: 4,
                background: '#ffffff',
                border: '1px solid var(--border-med)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 600,
                overflow: 'hidden'
              }}
            >
              {searchResults.map((sec) => (
                <div
                  key={sec.section_id}
                  onClick={() => {
                    if (onSelectTrack) onSelectTrack(sec);
                    setSearchQuery('');
                  }}
                  style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid var(--border-light)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    transition: 'background 0.12s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--ir-navy-dark)' }}>
                    <span>{sec.section_id} • {sec.start_station} → {sec.end_station}</span>
                    <span style={{ color: sec.risk_level === 'CRITICAL' ? '#b91c1c' : '#137333', fontSize: '0.6875rem' }}>
                      {sec.risk_level}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{sec.route_name}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Risk Category Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
          {riskButtons.map((btn) => {
            const active = riskFilter === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => setRiskFilter(btn.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 9px',
                  borderRadius: 9999,
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  border: '1px solid',
                  borderColor: active ? 'var(--ir-navy-dark)' : 'var(--border-light)',
                  background: active ? 'var(--ir-navy-dark)' : btn.bg,
                  color: active ? '#ffffff' : btn.color,
                  cursor: 'pointer',
                  transition: 'all 0.12s ease'
                }}
              >
                <span>{btn.label}</span>
                <span
                  style={{
                    fontSize: '0.625rem',
                    fontFamily: 'var(--font-mono)',
                    padding: '1px 5px',
                    borderRadius: 9999,
                    background: active ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.06)',
                    color: active ? '#ffffff' : 'inherit'
                  }}
                >
                  {btn.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Base Map Switcher (Standard OSM vs Satellite) */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'var(--bg-subtle)',
            borderRadius: 6,
            border: '1px solid var(--border-light)',
            padding: 2
          }}
        >
          <button
            onClick={() => setBaseLayer('osm')}
            style={{
              padding: '3px 8px',
              borderRadius: 4,
              fontSize: '0.6875rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: baseLayer === 'osm' ? 'var(--ir-navy-dark)' : 'transparent',
              color: baseLayer === 'osm' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.12s'
            }}
          >
            Standard
          </button>
          <button
            onClick={() => setBaseLayer('satellite')}
            style={{
              padding: '3px 8px',
              borderRadius: 4,
              fontSize: '0.6875rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: baseLayer === 'satellite' ? 'var(--ir-navy-dark)' : 'transparent',
              color: baseLayer === 'satellite' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.12s'
            }}
          >
            Satellite
          </button>
        </div>

        {/* Actions: Fit All & Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {onFitAll && (
            <button
              onClick={onFitAll}
              className="btn-ir-secondary"
              style={{
                height: '32px',
                padding: '0 9px',
                fontSize: '0.6875rem',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
              title="Fit all Indian Railway corridors in view"
            >
              <Maximize2 size={12} />
              <span>Fit All Corridors</span>
            </button>
          )}

          {onResetFilters && (
            <button
              onClick={onResetFilters}
              className="btn-ir-secondary"
              style={{
                height: '32px',
                padding: '0 8px',
                fontSize: '0.6875rem',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
              title="Reset view and filters"
            >
              <RotateCcw size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Mode & Layer Toggles */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '14px',
          borderTop: '1px solid var(--border-light)',
          paddingTop: '6px',
          fontSize: '0.6875rem',
          color: 'var(--text-secondary)',
          fontWeight: 600
        }}
      >
        <span style={{ color: 'var(--text-muted)', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Layers & Modes:
        </span>

        {/* Critical View Toggle (Urgent Mode) */}
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer', color: criticalView ? '#b91c1c' : 'inherit' }}>
          <input
            type="checkbox"
            checked={Boolean(criticalView)}
            onChange={(e) => setCriticalView && setCriticalView(e.target.checked)}
            style={{ accentColor: '#b91c1c' }}
          />
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontWeight: criticalView ? 800 : 600 }}>
            <ShieldAlert size={12} color={criticalView ? '#b91c1c' : 'inherit'} />
            <span>Critical View (Urgent)</span>
          </span>
        </label>

        {/* Risk Heatmap Toggle */}
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer', color: riskHeatmap ? '#b45309' : 'inherit' }}>
          <input
            type="checkbox"
            checked={Boolean(riskHeatmap)}
            onChange={(e) => setRiskHeatmap && setRiskHeatmap(e.target.checked)}
            style={{ accentColor: '#b45309' }}
          />
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontWeight: riskHeatmap ? 800 : 600 }}>
            <Flame size={12} color={riskHeatmap ? '#b45309' : 'inherit'} />
            <span>Risk Heatmap</span>
          </span>
        </label>

        {/* Corridor Mode Toggle */}
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={Boolean(corridorMode)}
            onChange={(e) => setCorridorMode && setCorridorMode(e.target.checked)}
            style={{ accentColor: 'var(--ir-navy-dark)' }}
          />
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <SlidersHorizontal size={12} />
            <span>Corridor Mode</span>
          </span>
        </label>

        {/* Maintenance Blocks */}
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showMaintenance !== false}
            onChange={(e) => setShowMaintenance && setShowMaintenance(e.target.checked)}
            style={{ accentColor: 'var(--ir-navy-dark)' }}
          />
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <span>🔧</span>
            <span>Maintenance Blocks</span>
          </span>
        </label>

        {/* Stations */}
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showStations}
            onChange={(e) => setShowStations(e.target.checked)}
            style={{ accentColor: 'var(--ir-navy-dark)' }}
          />
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <span>🚉</span>
            <span>Stations</span>
          </span>
        </label>

        {/* Environmental Hazards */}
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showEnvMarkers}
            onChange={(e) => setShowEnvMarkers(e.target.checked)}
            style={{ accentColor: 'var(--ir-navy-dark)' }}
          />
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <span>⚠️</span>
            <span>Environmental Hazards</span>
          </span>
        </label>
      </div>
    </div>
  );
}
