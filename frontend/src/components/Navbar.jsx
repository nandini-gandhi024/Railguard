import React from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Eye, 
  Cpu, 
  CalendarClock, 
  Sliders, 
  Train, 
  Radio,
  MapPin
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, selectedZone, setSelectedZone }) {
  const tabs = [
    { id: 'dashboard', label: 'Command Dashboard', icon: Activity },
    { id: 'geo_map', label: 'GeoTrack & Satellite Map', icon: MapPin },
    { id: 'cv_studio', label: 'AI Fault Detector', icon: Eye },
    { id: 'risk_xai', label: 'Risk & XAI Engine', icon: Cpu },
    { id: 'block_planner', label: 'SIH26027 Block Planner', icon: CalendarClock },
    { id: 'simulator', label: 'Scenario Simulator', icon: Sliders },
  ];

  const zones = [
    'Northern Railway (NR - Delhi Div)',
    'Central Railway (CR - Mumbai Div)',
    'Western Railway (WR - Mumbai Central)',
    'Eastern Railway (ER - Asansol Div)'
  ];

  return (
    <header className="glass-card mb-6 p-4" style={{ borderRadius: '16px', background: 'rgba(12, 18, 32, 0.85)' }}>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-4 mb-4">
        {/* Brand Logo & SIH Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-glow flex items-center justify-center glow-cyan">
            <Train className="w-7 h-7 text-gray-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-white" style={{ fontFamily: 'var(--font-sans)' }}>
                RAIL<span className="text-cyan">GUARD</span>
              </h1>
              <span className="badge badge-critical" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                SIH2026 • SIH26027
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              AI-Powered Track Risk Assessment & Automatic Block Availability Optimization System
            </p>
          </div>
        </div>

        {/* System Indicators & Zone Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-slate-400">Status:</span>
            <span className="text-emerald-400 font-semibold">AI Optimizer Active</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-medium">Zone:</label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="bg-slate-900 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 outline-none focus:border-cyan-400"
            >
              {zones.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <nav className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-glow text-slate-950 shadow-lg shadow-cyan-500/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.id === 'block_planner' && (
                <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded ${isActive ? 'bg-slate-950 text-cyan-400' : 'bg-cyan-950 text-cyan-300'}`}>
                  SIH Solver
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
