import React from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  ArrowUpRight, 
  Maximize2, 
  MapPin, 
  Activity,
  Layers
} from 'lucide-react';

export default function DashboardOverview({ summary, tracks, onSelectTrack, onNavigate }) {
  const getBadgeClass = (category) => {
    switch (category) {
      case 'CRITICAL RISK': return 'badge-critical';
      case 'HIGH RISK': return 'badge-high';
      case 'MODERATE RISK': return 'badge-moderate';
      default: return 'badge-low';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Top System KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Asset Availability</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {summary?.asset_availability_pct || 96.5}%
            </span>
            <span className="text-xs font-bold text-emerald-400 flex items-center">
              +{summary?.asset_availability_gain_pct || 14.0}% gain
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            SIH26027 Block Optimization boost vs unoptimized schedule (82.5%)
          </p>
        </div>

        {/* KPI 2 */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Network Risk Index</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400">68.4</span>
            <span className="text-xs text-slate-400 font-medium">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            High thermal expansion & GMT load on Northern Corridor
          </p>
        </div>

        {/* KPI 3 */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Critical Faults</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 glow-red">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-400">
              {summary?.active_critical_faults || 2}
            </span>
            <span className="text-xs font-semibold text-red-300">Sections</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            TSR 30 km/h applied on TRK-NR-101 & TRK-CR-204
          </p>
        </div>

        {/* KPI 4 */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Optimized Blocks</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 glow-cyan">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-cyan-400">
              {summary?.pending_maintenance_blocks || 3}
            </span>
            <span className="text-xs font-semibold text-cyan-300">Slots Today</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Zero passenger train delays guaranteed
          </p>
        </div>
      </div>

      {/* 2. Emergency Alerts Ticker Banner */}
      <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/20 rounded-lg text-red-400 animate-pulse">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-red-200">
              CRITICAL RISK ALERT: Transverse Rail Crack Detected on TRK-NR-101 (KM 142.5)
            </h4>
            <p className="text-xs text-red-300/80">
              Severity 88.5 • Temporary Speed Restriction (TSR 30 km/h) active. Recommended Emergency Maintenance Block slot: 02:00 - 05:00.
            </p>
          </div>
        </div>
        <button 
          onClick={() => onNavigate('cv_studio')}
          className="btn-primary text-xs py-2 px-4 shadow-red-500/20"
          style={{ background: 'linear-gradient(135deg, #FF3366, #FF8008)', color: '#fff' }}
        >
          Inspect Fault Image
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* 3. Corridor Section Health Breakdown Grid */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              Corridor Section Health & Risk Radar
            </h3>
            <p className="text-xs text-slate-400">
              Live status across Northern, Central, Western, and Eastern Railway Mainline corridors
            </p>
          </div>
          <button onClick={() => onNavigate('block_planner')} className="btn-secondary text-xs">
            Open SIH Block Planner
          </button>
        </div>

        {/* Section visual track strip */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
          {tracks.map((tr) => (
            <div 
              key={tr.track_id}
              onClick={() => onSelectTrack(tr.track_id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                tr.composite_risk >= 75 
                  ? 'bg-red-950/30 border-red-500/40 hover:border-red-400' 
                  : tr.composite_risk >= 55 
                  ? 'bg-amber-950/30 border-amber-500/40 hover:border-amber-400' 
                  : 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-slate-200">{tr.track_id}</span>
                <span className={`badge ${getBadgeClass(tr.risk_category)}`} style={{ fontSize: '0.6rem', padding: '1px 6px' }}>
                  {tr.composite_risk}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-semibold truncate mb-1">{tr.section}</p>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{tr.traffic_per_day} GMT/day</span>
                <span className="font-semibold text-cyan-400">{tr.tsr_speed} km/h</span>
              </div>
            </div>
          ))}
        </div>

        {/* Full Track Health Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Track ID</th>
                <th className="py-3 px-4">Location & Corridor</th>
                <th className="py-3 px-4">Zone / Division</th>
                <th className="py-3 px-4">Traffic GMT</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">TSR Rec.</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tracks.map((tr) => (
                <tr key={tr.track_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    {tr.track_id}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-200">{tr.location}</div>
                    <div className="text-[11px] text-slate-400">{tr.section}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {tr.zone}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className="text-white font-semibold">{tr.traffic_per_day}</span> <span className="text-slate-500">GMT/d</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-base">
                    <span className={tr.composite_risk >= 75 ? 'text-red-400' : (tr.composite_risk >= 55 ? 'text-amber-400' : 'text-emerald-400')}>
                      {tr.composite_risk}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${getBadgeClass(tr.risk_category)}`}>
                      {tr.risk_category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-cyan-300">
                    {tr.tsr_speed} km/h
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button 
                      onClick={() => onSelectTrack(tr.track_id)}
                      className="btn-secondary text-[11px] py-1 px-3"
                    >
                      Deep Analysis & XAI
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
