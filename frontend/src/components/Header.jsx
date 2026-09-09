import React from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Eye, 
  CalendarClock, 
  SlidersHorizontal, 
  MapPin, 
  TrendingUp, 
  AlertTriangle, 
  FileSpreadsheet,
  Train,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const SECTIONS = [
  { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard },
  { id: 'track_risk', label: '2. Track Risk', icon: Activity },
  { id: 'cv_studio', label: '3. AI Fault Detection', icon: Eye },
  { id: 'maintenance', label: '4. Maintenance Planning', icon: CalendarClock },
  { id: 'simulator', label: '5. What-If Simulator', icon: SlidersHorizontal },
  { id: 'gis_map', label: '6. GIS / Track Map', icon: MapPin },
  { id: 'asset_avail', label: '7. Asset Availability', icon: TrendingUp },
  { id: 'alerts', label: '8. Alerts', icon: AlertTriangle },
  { id: 'reports', label: '9. Reports', icon: FileSpreadsheet },
];

export default function Header({ 
  activeSection, 
  setActiveSection, 
  selectedZone, 
  setSelectedZone, 
  backendStatus 
}) {
  const zones = [
    'Northern Railway (NR - Delhi Div)',
    'Central Railway (CR - Mumbai Div)',
    'Western Railway (WR - Mumbai Central)',
    'Eastern Railway (ER - Asansol Div)',
    'South Central Railway (SCR - Secunderabad)'
  ];

  return (
    <header className="mb-6">
      {/* Top Header Bar */}
      <div className="bg-[#0a2540] text-white px-5 py-3 rounded-t-lg flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#b45309]">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center border border-white/20 text-amber-400 font-bold">
            <Train className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-tight font-sans">
                RAILGUARD
              </h1>
            </div>
            <p className="text-xs text-slate-300">
              Railway Operations • Automated Track Risk Assessment & Maintenance Block Optimizer
            </p>
          </div>
        </div>

        {/* Status Indicators & Zone Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/60 border border-slate-700 text-xs">
            {backendStatus === 'healthy' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-300">Backend:</span>
                <span className="text-emerald-400 font-semibold">System Connected</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-300">Backend:</span>
                <span className="text-amber-400 font-semibold">Local / Hybrid</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-300 font-medium">Zone:</label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded border border-slate-700 outline-none focus:border-amber-400"
            >
              {zones.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <nav className="bg-white border-x border-b border-[#cbd5e1] rounded-b-lg shadow-sm px-2 py-1 flex items-center gap-1 overflow-x-auto">
        {SECTIONS.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-md font-semibold text-xs transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-[#0a2540] text-white shadow-sm'
                  : 'text-slate-700 hover:text-[#0a2540] hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
