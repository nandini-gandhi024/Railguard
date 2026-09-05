import React from 'react';
import { 
  X, 
  Train, 
  MapPin, 
  CloudRain, 
  Wind, 
  Thermometer, 
  Droplets, 
  ShieldAlert, 
  AlertTriangle, 
  Calendar, 
  Gauge, 
  Zap, 
  Layers, 
  Compass, 
  Maximize2,
  Sliders
} from 'lucide-react';
import { getRiskColor, getEnvironmentalScoreColor } from '../services/railwayService';
import { getWeatherStyling } from '../services/weatherService';

export default function SectionDetails({
  section,
  weather,
  environmental,
  onClose,
  onFocusOnMap,
  onNavigateToSimulator
}) {
  if (!section) return null;

  const riskColor = getRiskColor(section.risk_level);
  const weatherStyle = getWeatherStyling(weather?.weather_condition || '');
  const envScore = environmental?.environmental_risk_score ?? 35;
  const envColor = getEnvironmentalScoreColor(envScore);

  return (
    <div 
      className="glass-card shadow-2xl flex flex-col h-full overflow-hidden pointer-events-auto transition-all"
      style={{
        background: 'rgba(10, 15, 29, 0.96)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: '16px',
        maxHeight: 'calc(100vh - 180px)'
      }}
    >
      {/* 1. Header Banner */}
      <div 
        className="p-4 border-b border-slate-800/80 flex items-start justify-between gap-3 relative overflow-hidden"
        style={{ borderTop: `4px solid ${riskColor}` }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono font-extrabold text-sm text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
              {section.section_id}
            </span>
            <span 
              className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded"
              style={{
                backgroundColor: `${riskColor}22`,
                color: riskColor,
                border: `1px solid ${riskColor}55`
              }}
            >
              {section.risk_level} RISK
            </span>
            {section.ai_defect_type && (
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/40">
                AI Verified
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-white truncate max-w-[280px]">
            {section.route_name}
          </h3>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            {section.start_station} → {section.end_station}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {onFocusOnMap && (
            <button
              onClick={() => onFocusOnMap(section)}
              className="p-1.5 rounded-lg bg-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="Focus and Center on Map"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/70 text-slate-400 hover:text-white hover:bg-red-950/40 transition-colors"
            title="Close Section Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Content Body */}
      <div className="p-4 space-y-5 overflow-y-auto custom-scrollbar flex-1 text-xs">
        
        {/* 2. Railway Infrastructure Specifications */}
        <div>
          <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Train className="w-3.5 h-3.5 text-cyan-400" />
            Railway Infrastructure & Track Geometry
          </h4>

          <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            <div>
              <span className="text-[10px] text-slate-500 block">Section Length</span>
              <span className="font-mono font-bold text-slate-200 text-sm">
                {section.track_length_km} <span className="text-[10px] text-slate-400 font-normal">KM</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block">Sectional Speed</span>
              <span className="font-mono font-bold text-cyan-400 text-sm">
                {section.speed_limit_kmh || 130} <span className="text-[10px] text-slate-400 font-normal">km/h</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block">Track Configuration</span>
              <span className="font-medium text-slate-200 truncate block" title={section.track_type}>
                {section.track_type}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block">Traction Electrification</span>
              <span className="font-medium text-emerald-400 flex items-center gap-1">
                <Zap className="w-3 h-3" /> {section.electrified ? '25kV OHE Electrified' : 'Non-Electrified'}
              </span>
            </div>

            <div className="col-span-2 pt-1 border-t border-slate-800/60 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-500 block">Terrain Classification</span>
                <span className="font-semibold text-slate-300">{section.terrain}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">Traffic Density</span>
                <span className="font-mono font-semibold text-slate-300">{section.traffic_gmt_per_day || 50} GMT/day</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Live & Atmospheric Weather Metrics */}
        <div>
          <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
              Atmospheric & Weather Conditions
            </span>
            <span className="text-[9px] font-mono text-slate-500">
              {weather?.source || 'Synthetic IMD Grid'}
            </span>
          </h4>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{weatherStyle.icon}</span>
                <div>
                  <div className="font-bold text-slate-200 capitalize">
                    {weather?.weather_condition || 'Partly Cloudy'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Atmospheric Stress: {weatherStyle.label}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-mono font-extrabold text-amber-400">
                  {weather?.temperature ?? 34.0}°C
                </div>
                <div className="text-[10px] text-slate-500">Ambient Temp</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-1.5 rounded-lg bg-slate-800/40 border border-slate-700/40">
                <Droplets className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-0.5" />
                <span className="text-[9px] text-slate-400 block">Humidity</span>
                <span className="font-mono font-bold text-slate-200">{weather?.humidity ?? 65}%</span>
              </div>

              <div className="p-1.5 rounded-lg bg-slate-800/40 border border-slate-700/40">
                <CloudRain className="w-3.5 h-3.5 text-blue-400 mx-auto mb-0.5" />
                <span className="text-[9px] text-slate-400 block">Rainfall</span>
                <span className="font-mono font-bold text-slate-200">{weather?.rainfall ?? 0.0} mm</span>
              </div>

              <div className="p-1.5 rounded-lg bg-slate-800/40 border border-slate-700/40">
                <Wind className="w-3.5 h-3.5 text-teal-400 mx-auto mb-0.5" />
                <span className="text-[9px] text-slate-400 block">Wind Speed</span>
                <span className="font-mono font-bold text-slate-200">{weather?.wind_speed ?? 15.0} km/h</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Environmental Risk Diagnostic */}
        <div>
          <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Environmental Geospatial Hazard Score
            </span>
            <span 
              className="font-mono font-extrabold text-xs px-2 py-0.5 rounded"
              style={{
                backgroundColor: `${envColor}22`,
                color: envColor,
                border: `1px solid ${envColor}44`
              }}
            >
              {envScore} / 100
            </span>
          </h4>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 space-y-3">
            {/* Score Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                <span>Environmental Vulnerability</span>
                <span style={{ color: envColor }}>
                  {envScore > 75 ? 'CRITICAL RISK' : envScore > 50 ? 'HIGH RISK' : envScore > 25 ? 'MODERATE RISK' : 'LOW RISK'}
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${envScore}%`, backgroundColor: envColor }}
                ></div>
              </div>
            </div>

            {/* Individual Hazard Pill Grid */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="flex items-center justify-between p-1.5 rounded bg-slate-800/50">
                <span className="text-slate-400">💧 Flood Risk:</span>
                <span className="font-bold text-slate-200">{environmental?.flood_risk || 'LOW'}</span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded bg-slate-800/50">
                <span className="text-slate-400">⛰️ Landslide:</span>
                <span className="font-bold text-slate-200">{environmental?.landslide_risk || 'LOW'}</span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded bg-slate-800/50">
                <span className="text-slate-400">🌊 Waterlogging:</span>
                <span className="font-bold text-slate-200">{environmental?.waterlogging_risk || 'LOW'}</span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded bg-slate-800/50">
                <span className="text-slate-400">🌳 Vegetation:</span>
                <span className="font-bold text-slate-200">{environmental?.vegetation_risk || 'LOW'}</span>
              </div>
            </div>

            {/* Primary Hazard Description */}
            {environmental?.hazard_description && (
              <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-200/90 leading-relaxed">
                <span className="font-bold text-amber-300 block mb-0.5">
                  Primary Hazard Alert: {environmental.primary_hazard}
                </span>
                {environmental.hazard_description}
              </div>
            )}
          </div>
        </div>

        {/* 5. Defect Status & Inspection History */}
        <div>
          <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            Inspection Audit & Track Defect Status
          </h4>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> Last Visual/USFD Inspection:
              </span>
              <span className="font-mono font-bold text-slate-200">
                {section.last_inspection_date}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block mb-0.5 font-semibold">Active Track Condition:</span>
              <span className="font-bold text-slate-200 block">
                {section.defect_status}
              </span>
            </div>

            {section.risk_level === 'CRITICAL' && (
              <div className="text-[11px] text-red-300 font-semibold flex items-center gap-1 bg-red-950/40 p-2 rounded border border-red-500/30">
                <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>Requires immediate TSR imposition and AI Block scheduling.</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Footer Navigation Button */}
      {onNavigateToSimulator && (
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/70">
          <button
            onClick={() => onNavigateToSimulator(section)}
            className="btn-primary w-full text-xs py-2 justify-center"
          >
            <Sliders className="w-4 h-4" />
            Simulate Extreme Weather What-If
          </button>
        </div>
      )}
    </div>
  );
}
