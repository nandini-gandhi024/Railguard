import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function MapLegend({ activeRiskFilter, onSelectRiskFilter }) {
  const [collapsed, setCollapsed] = useState(false);

  const riskLevels = [
    { id: 'LOW', label: 'LOW RISK', color: '#10b981', symbol: '🟢', desc: 'Normal Track Condition (Speed 130 km/h)' },
    { id: 'MEDIUM', label: 'MEDIUM RISK', color: '#eab308', symbol: '🟡', desc: 'Minor Surface Wear / Monitoring (Speed 110 km/h)' },
    { id: 'HIGH', label: 'HIGH RISK', color: '#f97316', symbol: '🟠', desc: 'Maintenance Window Required within 48h' },
    { id: 'CRITICAL', label: 'CRITICAL RISK', color: '#ef4444', symbol: '🔴', desc: 'Immediate TSR (30-60 km/h) & Emergency Block' }
  ];

  const environmentalRisks = [
    { icon: '💧', label: 'Flood Risk', desc: 'River overflow, bridge scour & track wash' },
    { icon: '⛰️', label: 'Landslide Risk', desc: 'Rockfall, ghat slope creep & boulder fall' },
    { icon: '🌊', label: 'Waterlogging', desc: 'Submerged track circuits, yard flooding' },
    { icon: '🌳', label: 'Vegetation Risk', desc: 'OHE wire infringement & curve sightline block' },
    { icon: '🌧️', label: 'Extreme Weather', desc: 'Thermal rail buckling (>52°C) or cyclone gales' }
  ];

  return (
    <div className="glass-card shadow-2xl transition-all duration-300 pointer-events-auto"
      style={{
        background: 'rgba(10, 15, 29, 0.92)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '14px',
        maxWidth: '300px',
        width: '100%'
      }}
    >
      {/* Legend Header */}
      <div 
        onClick={() => setCollapsed(!collapsed)}
        className="p-3.5 flex items-center justify-between cursor-pointer border-b border-slate-800/80 hover:bg-slate-800/30 rounded-t-xl transition-colors select-none"
      >
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Railway Safety Legend
          </span>
        </div>
        <button className="text-slate-400 hover:text-slate-200 p-0.5">
          {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Legend Body */}
      {!collapsed && (
        <div className="p-3.5 space-y-4 text-xs">
          {/* Section 1: Track Risk Levels */}
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              Railway Section Risk Levels
            </div>
            <div className="space-y-1.5">
              {riskLevels.map((lvl) => {
                const isSelected = activeRiskFilter === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => onSelectRiskFilter && onSelectRiskFilter(isSelected ? 'ALL' : lvl.id)}
                    className={`w-full text-left p-2 rounded-lg transition-all border flex items-center justify-between ${
                      isSelected
                        ? 'bg-slate-800/90 border-cyan-400 shadow-sm'
                        : 'bg-slate-900/50 border-slate-800/60 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: lvl.color }}></span>
                      <span className="font-bold text-[11px] text-slate-200">{lvl.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {isSelected ? 'ACTIVE' : lvl.symbol}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Environmental Hazard Indicators */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Environmental Hazard Markers
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {environmentalRisks.map((env) => (
                <div 
                  key={env.label}
                  className="flex items-center gap-2 p-1.5 rounded-md bg-slate-900/40 border border-slate-800/40 text-[11px]"
                >
                  <span className="text-base">{env.icon}</span>
                  <div className="truncate">
                    <span className="font-semibold text-slate-300">{env.label}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{env.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attribution Footer */}
          <div className="pt-1 text-[9px] text-slate-500 text-center font-mono">
            OpenStreetMap • Esri Satellite • IMD Weather
          </div>
        </div>
      )}
    </div>
  );
}
