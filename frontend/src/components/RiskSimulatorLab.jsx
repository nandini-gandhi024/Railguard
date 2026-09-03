import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Sun, 
  CloudRain, 
  Truck, 
  Clock, 
  RefreshCw, 
  AlertTriangle,
  Flame,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function RiskSimulatorLab({ tracks, onNavigateToPlanner }) {
  const [temp, setTemp] = useState(42);
  const [monsoon, setMonsoon] = useState(false);
  const [trafficInc, setTrafficInc] = useState(25);
  const [delayDays, setDelayDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [simResults, setSimResults] = useState(null);

  useEffect(() => {
    runSimulation();
  }, [temp, monsoon, trafficInc, delayDays]);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/simulate-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temperature_c: temp,
          monsoon_alert: monsoon,
          traffic_increase_pct: trafficInc,
          delay_days: delayDays
        })
      });
      const data = await res.json();
      setSimResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-amber-400" />
            Interactive Risk & Weather Scenario Simulator Lab
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulate extreme heat waves, monsoon downpours, freight traffic surges, and delayed maintenance to see real-time risk escalation.
          </p>
        </div>

        {loading && (
          <span className="text-xs text-cyan-400 font-semibold flex items-center gap-2 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin" /> Recalculating Physics Model...
          </span>
        )}
      </div>

      {/* Control Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Slider 1: Ambient Temperature */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-400" /> Rail Ambient Temp
            </span>
            <span className="font-mono font-bold text-amber-400">{temp}°C</span>
          </div>
          <input
            type="range"
            min="20"
            max="55"
            value={temp}
            onChange={(e) => setTemp(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
          <p className="text-[10px] text-slate-400">
            {temp > 40 ? '⚠️ High Thermal Buckling Risk (>50°C rail temp)' : 'Normal operating range'}
          </p>
        </div>

        {/* Slider 2: Monsoon Alert */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <CloudRain className="w-4 h-4 text-cyan-400" /> Heavy Monsoon
            </span>
            <span className={`badge ${monsoon ? 'badge-critical' : 'badge-low'}`}>
              {monsoon ? 'ACTIVE' : 'OFF'}
            </span>
          </div>
          <button
            onClick={() => setMonsoon(!monsoon)}
            className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
              monsoon
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            {monsoon ? 'Monsoon Alert Enabled' : 'Enable Monsoon Heavy Rain'}
          </button>
          <p className="text-[10px] text-slate-400">
            Simulates ballast scour and embankment instability
          </p>
        </div>

        {/* Slider 3: Traffic GMT Surge */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-purple-400" /> Freight GMT Surge
            </span>
            <span className="font-mono font-bold text-purple-400">+{trafficInc}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            value={trafficInc}
            onChange={(e) => setTrafficInc(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
          />
          <p className="text-[10px] text-slate-400">
            Increased axle load & fatigue accumulation
          </p>
        </div>

        {/* Slider 4: Maintenance Delay Days */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-red-400" /> Deferred Delay
            </span>
            <span className="font-mono font-bold text-red-400">{delayDays} Days</span>
          </div>
          <input
            type="range"
            min="0"
            max="21"
            value={delayDays}
            onChange={(e) => setDelayDays(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-400"
          />
          <p className="text-[10px] text-slate-400">
            Escalates risk exponentially over time
          </p>
        </div>
      </div>

      {/* Simulated Output Results Grid */}
      {simResults && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-400" />
            Simulated Corridor Risk Impact & Dynamic Priority Rankings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {simResults.results.map((res) => (
              <div
                key={res.track_id}
                className={`p-4 rounded-xl border transition-all ${
                  res.simulated_risk >= 75
                    ? 'bg-red-950/30 border-red-500/40'
                    : res.simulated_risk >= 55
                    ? 'bg-amber-950/30 border-amber-500/40'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-mono font-bold text-white text-sm">{res.track_id}</div>
                    <div className="text-[11px] text-slate-400 truncate">{res.section}</div>
                  </div>
                  <span className={`badge ${
                    res.simulated_risk >= 75 ? 'badge-critical' : (res.simulated_risk >= 55 ? 'badge-high' : 'badge-low')
                  }`}>
                    {res.category}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-3 pt-3 border-t border-slate-800/80">
                  <div>
                    <span className="text-2xl font-extrabold font-mono" style={{
                      color: res.simulated_risk >= 75 ? '#ff3366' : (res.simulated_risk >= 55 ? '#ffb703' : '#00e676')
                    }}>
                      {res.simulated_risk}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1">/ 100 Risk</span>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-cyan-400">TSR {res.tsr_speed} km/h</div>
                    <div className="text-[10px] text-slate-400">{res.days_to_critical}d to failure</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-end">
            <button onClick={onNavigateToPlanner} className="btn-primary text-xs">
              Re-optimize Block Schedule for Simulated Risk
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
