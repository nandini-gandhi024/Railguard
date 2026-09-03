import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  ShieldAlert, 
  HelpCircle, 
  Activity, 
  TrendingUp, 
  Calendar, 
  AlertTriangle,
  Zap,
  Gauge
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export default function RiskXAIModule({ selectedTrackId, tracks, onNavigateToBlockPlanner }) {
  const [currentTrackId, setCurrentTrackId] = useState(selectedTrackId || 'TRK-NR-101');
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedTrackId) setCurrentTrackId(selectedTrackId);
  }, [selectedTrackId]);

  useEffect(() => {
    fetchRiskAssessment(currentTrackId);
  }, [currentTrackId]);

  const fetchRiskAssessment = async (trackId) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/assess-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track_id: trackId,
          defect_severity: trackId === 'TRK-NR-101' ? 88.5 : (trackId === 'TRK-CR-204' ? 82.0 : 45.0),
          defect_confidence: 0.94,
          temperature_c: 38.0,
          monsoon_alert: false,
          delay_days: 0
        })
      });
      const data = await res.json();
      setRiskData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Convert XAI dictionary to array format for Recharts Radar
  const getRadarData = () => {
    if (!riskData || !riskData.xai_breakdown) return [];
    return Object.entries(riskData.xai_breakdown).map(([key, value]) => ({
      subject: key,
      contribution: value,
      fullMark: 100
    }));
  };

  return (
    <div className="space-y-6">
      {/* Module Header & Track Selector */}
      <div className="glass-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-cyan-400" />
            Multi-Factor Risk & Explainable AI (XAI) Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Answers "Why is it high risk?", calculates TSR restrictions, and predicts degradation trajectories over 30 days.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 font-medium">Select Track:</label>
          <select
            value={currentTrackId}
            onChange={(e) => setCurrentTrackId(e.target.value)}
            className="bg-slate-900 text-slate-200 text-xs font-mono font-semibold px-4 py-2 rounded-xl border border-slate-700 outline-none focus:border-cyan-400"
          >
            {tracks.map((tr) => (
              <option key={tr.track_id} value={tr.track_id}>
                {tr.track_id} ({tr.section})
              </option>
            ))}
          </select>
        </div>
      </div>

      {riskData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Composite Risk & TSR Summary (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Risk Score Card */}
            <div className="glass-card p-6 relative overflow-hidden">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Composite Track Risk Index
              </span>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <div className="text-5xl font-extrabold font-mono" style={{ color: riskData.color_code }}>
                    {riskData.composite_risk}
                  </div>
                  <span className="badge mt-2" style={{
                    backgroundColor: `${riskData.color_code}20`,
                    color: riskData.color_code,
                    borderColor: `${riskData.color_code}40`
                  }}>
                    {riskData.category}
                  </span>
                </div>

                <div className="w-20 h-20 rounded-full border-4 flex items-center justify-center font-bold text-sm font-mono"
                  style={{ borderColor: riskData.color_code, color: riskData.color_code }}>
                  {riskData.composite_risk}%
                </div>
              </div>

              {/* TSR Recommendation Box */}
              <div className="mt-6 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-400">Temporary Speed Restriction</span>
                  <span className="text-[10px] font-mono text-slate-500">Normal: {riskData.normal_speed_kmh} km/h</span>
                </div>
                <div className="text-2xl font-extrabold text-cyan-400 font-mono">
                  TSR {riskData.tsr_speed_kmh} <span className="text-xs text-slate-400">km/h</span>
                </div>
              </div>

              {/* Urgency Action Banner */}
              <div className="mt-4 p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-amber-400 inline mr-1" />
                {riskData.urgency_action}
              </div>
            </div>

            {/* Days to Critical Failure Card */}
            <div className="glass-card p-5 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase">Estimated Time to Failure</div>
                <div className="text-2xl font-extrabold text-red-400 mt-1">
                  {riskData.days_to_critical} <span className="text-sm font-normal text-slate-400">Days</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">If maintenance block is deferred</p>
              </div>
              <button 
                onClick={() => onNavigateToBlockPlanner && onNavigateToBlockPlanner(currentTrackId)}
                className="btn-primary text-xs py-2 px-3"
              >
                Schedule Block
              </button>
            </div>
          </div>

          {/* Right Column: XAI Radar & 30-Day Failure Trajectory (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* XAI Factor Contribution Radar & Bar Chart */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                Explainable AI (XAI) Diagnostic Breakdown ("Why is it High Risk?")
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Exact contribution percentages of defect severity, GMT traffic, weather stress, track geometry age, and deferred maintenance.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Radar Chart */}
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={getRadarData()}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                      <Radar name="Contribution %" dataKey="contribution" stroke="#00f2fe" fill="#00f2fe" fillOpacity={0.35} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Contribution Bars */}
                <div className="space-y-3">
                  {riskData.xai_breakdown && Object.entries(riskData.xai_breakdown).map(([factor, val]) => (
                    <div key={factor}>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-300">{factor}</span>
                        <span className="text-cyan-400 font-mono">{val}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div 
                          className="bg-cyan-glow h-full rounded-full transition-all"
                          style={{ width: `${val}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 30-Day Failure Degradation Projection Curve */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-400" />
                30-Day Degradation Projection (Delayed Maintenance Trajectory)
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Projected exponential risk escalation over 30 days under current traffic GMT and thermal stress.
              </p>

              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={riskData.degradation_curve}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} 
                    />
                    <Line type="monotone" dataKey="risk_score" stroke="#ff3366" strokeWidth={3} dot={{ r: 3 }} name="Risk Trajectory" />
                    <Line type="monotone" dataKey="critical_threshold" stroke="#ffb703" strokeDasharray="5 5" strokeWidth={2} name="Critical Threshold (85)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
