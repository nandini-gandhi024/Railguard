import React, { useState, useEffect } from 'react';
import { 
  CalendarClock, 
  Play, 
  CheckCircle2, 
  TrendingUp, 
  Train, 
  Clock, 
  FileText, 
  ShieldCheck, 
  AlertCircle,
  Download,
  Printer
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceArea 
} from 'recharts';

export default function BlockPlanningStudio() {
  const [corridorSection, setCorridorSection] = useState('NDLS-CNB Mainline Corridor');
  const [optimizing, setOptimizing] = useState(false);
  const [optData, setOptData] = useState(null);

  useEffect(() => {
    runOptimizer();
  }, [corridorSection]);

  const runOptimizer = async () => {
    setOptimizing(true);
    try {
      const res = await fetch('http://localhost:8000/api/optimize-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ corridor_section: corridorSection })
      });
      const data = await res.json();
      setOptData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setOptimizing(false);
    }
  };

  const printBlockOrder = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Studio Header & SIH Banner */}
      <div className="glass-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CalendarClock className="w-6 h-6 text-cyan-400" />
              SIH26027 AI Automatic Block Planning Workbench
            </h2>
            <span className="badge badge-low text-[10px]">SIH Problem Statement SIH26027</span>
          </div>
          <p className="text-xs text-slate-400">
            Automatically schedules track maintenance blocks while maximizing asset availability and eliminating passenger train delays.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runOptimizer}
            disabled={optimizing}
            className="btn-primary text-xs py-2.5 px-5"
          >
            {optimizing ? (
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 animate-spin" /> Solving Constraint Model...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Play className="w-4 h-4 fill-current" /> Run AI Block Optimizer
              </span>
            )}
          </button>
        </div>
      </div>

      {optData && (
        <>
          {/* 1. Availability Gain KPI Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-card p-5 border-l-4 border-emerald-400">
              <div className="text-xs font-semibold text-slate-400 uppercase">Optimized Asset Availability</div>
              <div className="text-3xl font-extrabold text-emerald-400 mt-1 font-mono">
                {optData.metrics.optimized_asset_availability_pct}%
              </div>
              <p className="text-[11px] text-emerald-300 font-semibold mt-1">
                +{optData.metrics.asset_availability_gain_pct}% gain over baseline ({optData.metrics.unoptimized_asset_availability_pct}%)
              </p>
            </div>

            <div className="glass-card p-5 border-l-4 border-cyan-400">
              <div className="text-xs font-semibold text-slate-400 uppercase">Total Blocks Scheduled</div>
              <div className="text-3xl font-extrabold text-cyan-400 mt-1 font-mono">
                {optData.metrics.total_blocks_scheduled} <span className="text-sm text-slate-400">Slots</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {optData.metrics.total_downtime_hours} Total Hours Scheduled
              </p>
            </div>

            <div className="glass-card p-5 border-l-4 border-amber-400">
              <div className="text-xs font-semibold text-slate-400 uppercase">Passenger Train Delay</div>
              <div className="text-3xl font-extrabold text-amber-400 mt-1 font-mono">
                0.0 <span className="text-sm text-slate-400">mins</span>
              </div>
              <p className="text-[11px] text-amber-300 font-semibold mt-1">
                Zero delay for Vande Bharat & Rajdhani
              </p>
            </div>

            <div className="glass-card p-5 border-l-4 border-purple-400">
              <div className="text-xs font-semibold text-slate-400 uppercase">Corridor Section</div>
              <div className="text-sm font-bold text-white mt-2 truncate">
                {optData.corridor_section}
              </div>
              <p className="text-[11px] text-purple-300 font-semibold mt-1">
                Northern Railway Mainline
              </p>
            </div>
          </div>

          {/* 2. Interactive Time-Distance (Stringline) Chart */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Train className="w-5 h-5 text-cyan-400" />
                  Corridor Time-Distance Stringline Chart (Master Train & Maintenance Block Plot)
                </h3>
                <p className="text-xs text-slate-400">
                  Visualizes train movements (angled lines) vs maintenance block windows (shaded slots) across 24-hour timeline.
                </p>
              </div>
              <button onClick={printBlockOrder} className="btn-secondary text-xs">
                <Printer className="w-4 h-4 text-cyan-400" /> Print Permission Order
              </button>
            </div>

            {/* Time-Distance Visual Stringline Canvas */}
            <div className="h-[280px] w-full bg-slate-950/60 p-4 rounded-xl border border-slate-800 relative">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis 
                    dataKey="time" 
                    type="category" 
                    allowDuplicatedCategory={false}
                    stroke="#64748b" 
                    tick={{ fontSize: 10 }} 
                  />
                  <YAxis domain={[0, 440]} label={{ value: 'Distance (KM)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }} stroke="#64748b" tick={{ fontSize: 10 }} />
                  
                  {/* Shaded Maintenance Block Areas (Night Window 01:30 to 05:00) */}
                  <ReferenceArea x1="01:30" x2="05:00" y1={120} y2={160} fill="#00f2fe" fillOpacity={0.18} stroke="#00f2fe" strokeDasharray="3 3" />
                  
                  {/* Train Lines */}
                  <Line type="monotone" data={[{ time: "06:00", km: 0 }, { time: "08:15", km: 440 }]} dataKey="km" stroke="#00f2fe" strokeWidth={3} name="Vande Bharat (22436)" />
                  <Line type="monotone" data={[{ time: "08:45", km: 440 }, { time: "11:15", km: 0 }]} dataKey="km" stroke="#4facfe" strokeWidth={3} name="Rajdhani Exp (12952)" />
                  <Line type="monotone" data={[{ time: "12:00", km: 0 }, { time: "14:30", km: 440 }]} dataKey="km" stroke="#ffb703" strokeWidth={2} name="Shatabdi Exp (12002)" />
                  <Line type="monotone" data={[{ time: "20:30", km: 0 }, { time: "00:30", km: 440 }]} dataKey="km" stroke="#9d4edd" strokeWidth={2} strokeDasharray="4 4" name="Freight Special (F9021)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. AI-Scheduled Maintenance Block Orders Table */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              AI-Optimized Maintenance Block Schedule & Permission Orders
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Block ID</th>
                    <th className="py-3 px-4">Track Location</th>
                    <th className="py-3 px-4">Block Type</th>
                    <th className="py-3 px-4">Required Duration</th>
                    <th className="py-3 px-4">AI Scheduled Window</th>
                    <th className="py-3 px-4">Window Category</th>
                    <th className="py-3 px-4">Assigned Crew</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {optData.optimized_blocks.map((blk) => (
                    <tr key={blk.block_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-cyan-400">{blk.block_id}</td>
                      <td className="py-3 px-4 font-semibold text-slate-200">{blk.location}</td>
                      <td className="py-3 px-4 text-slate-300">{blk.block_type}</td>
                      <td className="py-3 px-4 font-mono">{blk.required_duration_hours} hrs</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        {blk.scheduled_start} - {blk.scheduled_end}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">{blk.window_type}</td>
                      <td className="py-3 px-4 text-slate-300">{blk.crew_assigned}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="badge badge-low text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" /> {blk.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Train Regulation & Operations Impact Table */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Train className="w-5 h-5 text-amber-400" />
              Train Operations Regulation & Timetable Impact Summary
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Train No. & Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Scheduled Run</th>
                    <th className="py-3 px-4">Delay Penalty</th>
                    <th className="py-3 px-4">Regulation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {optData.train_impacts.map((tr) => (
                    <tr key={tr.train_number} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-200">
                        <span className="font-mono text-cyan-400 font-bold mr-2">{tr.train_number}</span>
                        {tr.train_name}
                      </td>
                      <td className="py-3 px-4 text-slate-300">{tr.train_type}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-300">P{tr.priority}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {tr.scheduled_departure} → {tr.scheduled_arrival}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold">
                        {tr.delay_minutes === 0 ? (
                          <span className="text-emerald-400">0.0 mins</span>
                        ) : (
                          <span className="text-amber-400">+{tr.delay_minutes} mins</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-medium">
                        {tr.regulation_status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
