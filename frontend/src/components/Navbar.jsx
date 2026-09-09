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
  MapPin,
  RefreshCw
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, selectedZone, setSelectedZone, onRunPipeline, isPipelineRunning }) {
  const tabs = [
    { id: 'dashboard', label: 'Command Dashboard', icon: Activity },
    { id: 'geo_map', label: 'Railway GIS Map', icon: MapPin },
    { id: 'cv_studio', label: 'AI Fault Detector', icon: Eye },
    { id: 'risk_xai', label: 'Risk Prediction', icon: Cpu },
    { id: 'block_planner', label: 'Maintenance Planner', icon: CalendarClock },
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
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-glow flex items-center justify-center glow-cyan">
            <Train className="w-7 h-7 text-gray-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-white" style={{ fontFamily: 'var(--font-sans)' }}>
                RAIL<span className="text-cyan">GUARD</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              AI-Powered Railway Asset Risk & Maintenance Planning Platform
            </p>
          </div>
        </div>

        {/* Action Controls & Division Selector */}
        <div className="flex items-center gap-3">
          <select 
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="input-field text-xs py-2 px-3 bg-slate-900 border-slate-700 text-slate-200 rounded-lg"
          >
            {zones.map(z => <option key={z} value={z}>{z}</option>)}
          </select>

          <button 
            onClick={onRunPipeline}
            disabled={isPipelineRunning}
            className="btn-primary text-xs py-2 px-4 flex items-center gap-2 glow-cyan"
          >
            <RefreshCw className={`w-4 h-4 ${isPipelineRunning ? 'animate-spin' : ''}`} />
            {isPipelineRunning ? 'Running ML Telemetry...' : 'Execute AI Pipeline'}
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <nav className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-glow text-slate-950 shadow-lg glow-cyan'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.id === 'block_planner' && (
                <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded ${isActive ? 'bg-slate-950 text-cyan-400' : 'bg-cyan-950 text-cyan-300'}`}>
                  Optimization
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
