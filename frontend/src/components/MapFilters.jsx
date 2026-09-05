import React from 'react';
import { 
  Filter, 
  Search, 
  Layers, 
  Globe, 
  Eye, 
  ShieldAlert, 
  AlertOctagon, 
  CheckCircle2, 
  RotateCcw,
  CloudRain,
  Mountain,
  Waves,
  Trees,
  Flame
} from 'lucide-react';

export default function MapFilters({
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
  stats = { total: 0, critical: 0, high: 0, medium: 0, low: 0 },
  onResetFilters
}) {
  const riskButtons = [
    { id: 'ALL', label: 'All Sections', count: stats.total, color: 'border-slate-700 text-slate-200' },
    { id: 'CRITICAL', label: 'Critical', count: stats.critical, color: 'border-red-500/50 text-red-400 bg-red-950/20' },
    { id: 'HIGH', label: 'High Risk', count: stats.high, color: 'border-orange-500/50 text-orange-400 bg-orange-950/20' },
    { id: 'MEDIUM', label: 'Medium', count: stats.medium, color: 'border-yellow-500/50 text-yellow-400 bg-yellow-950/20' },
    { id: 'LOW', label: 'Low Risk', count: stats.low, color: 'border-emerald-500/50 text-emerald-400 bg-emerald-950/20' }
  ];

  const envOptions = [
    { id: 'ALL', label: 'All Hazards' },
    { id: 'FLOOD', label: '💧 Flood Risk' },
    { id: 'LANDSLIDE', label: '⛰️ Landslide / Rockfall' },
    { id: 'WATERLOGGING', label: '🌊 Waterlogging' },
    { id: 'VEGETATION', label: '🌳 Vegetation Infringement' },
    { id: 'EXTREME_WEATHER', label: '🌧️ Extreme Weather / Thermal' }
  ];

  return (
    <div 
      className="glass-card p-4 transition-all pointer-events-auto"
      style={{
        background: 'rgba(10, 15, 29, 0.92)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '16px'
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative min-w-[220px] flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search section, station, route or terrain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all font-sans"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Risk Level Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {riskButtons.map((btn) => {
            const isActive = riskFilter === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => setRiskFilter(btn.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-500/10 font-bold'
                    : `${btn.color} hover:bg-slate-800/60`
                }`}
              >
                <span>{btn.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800/80 font-mono text-slate-300">
                  {btn.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Environmental Hazard Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-medium whitespace-nowrap flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-cyan-400" /> Hazard:
          </label>
          <select
            value={envFilter}
            onChange={(e) => setEnvFilter(e.target.value)}
            className="bg-slate-900/90 border border-slate-700/80 text-xs font-medium text-slate-200 rounded-xl px-3 py-1.5 outline-none focus:border-cyan-400"
          >
            {envOptions.map((opt) => (
              <option key={opt.id} value={opt.id} className="bg-slate-900 text-slate-200">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Base Layer Switcher (OpenStreetMap vs Satellite) */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-700/80 text-xs">
          <button
            onClick={() => setBaseLayer('osm')}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
              baseLayer === 'osm'
                ? 'bg-cyan-glow text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="OpenStreetMap Standard Vector Tiles"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Street</span>
          </button>

          <button
            onClick={() => setBaseLayer('satellite')}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
              baseLayer === 'satellite'
                ? 'bg-cyan-glow text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="High-Resolution Satellite Imagery Layer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Satellite</span>
          </button>
        </div>

        {/* Toggles & Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEnvMarkers(!showEnvMarkers)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
              showEnvMarkers
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Environmental Hazard Markers on Map"
          >
            <span>⚠️</span>
            <span>Hazards</span>
          </button>

          <button
            onClick={() => setShowStations(!showStations)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
              showStations
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Terminus Station Markers"
          >
            <span>🚉</span>
            <span>Stations</span>
          </button>

          {(riskFilter !== 'ALL' || envFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={onResetFilters}
              className="p-1.5 rounded-xl bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/60"
              title="Reset all filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
