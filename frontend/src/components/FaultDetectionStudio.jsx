import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Upload, 
  CheckCircle2, 
  AlertOctagon, 
  Layers, 
  RefreshCw, 
  ArrowRight,
  ShieldAlert,
  Zap
} from 'lucide-react';

export default function FaultDetectionStudio({ onAnalyzeComplete, onNavigateToRisk }) {
  const [selectedPreset, setSelectedPreset] = useState('crack');
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [customFile, setCustomFile] = useState(null);

  // Fetch preset catalogs from backend API
  useEffect(() => {
    fetch('http://localhost:8000/api/defect-presets')
      .then((res) => res.json())
      .then((data) => {
        setPresets(data);
        runAnalysis('crack', null);
      })
      .catch(() => {
        // Fallback preset data
        setPresets([
          { key: 'crack', name: 'Transverse Rail Crack', category: 'Structural Defect' },
          { key: 'head_check', name: 'Head Check & Spalling', category: 'Surface Wear' },
          { key: 'broken_sleeper', name: 'Broken Concrete Sleeper', category: 'Substructure' },
          { key: 'missing_clip', name: 'Missing Elastic Clip', category: 'Fastener Defect' },
          { key: 'ballast_void', name: 'Ballast Voiding', category: 'Trackbed Defect' },
          { key: 'track_buckling', name: 'Thermal Track Buckling', category: 'Alignment Defect' }
        ]);
        runAnalysis('crack', null);
      });
  }, []);

  const runAnalysis = async (presetKey, fileObj) => {
    setLoading(true);
    try {
      const formData = new FormData();
      if (presetKey) formData.append('preset_key', presetKey);
      if (fileObj) formData.append('file', fileObj);

      const res = await fetch('http://localhost:8000/api/analyze-image', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setAnalysis(data);
      if (onAnalyzeComplete) onAnalyzeComplete(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSelect = (key) => {
    setSelectedPreset(key);
    setCustomFile(null);
    runAnalysis(key, null);
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCustomFile(file);
      setSelectedPreset(null);
      runAnalysis(null, file);
    }
  };

  // SVGs for simulated inspection images
  const getPresetSVG = (code) => {
    switch (code) {
      case 'crack':
        return (
          <svg viewBox="0 0 400 300" className="w-full h-full object-cover">
            <rect width="400" height="300" fill="#1e293b" />
            <path d="M 0 150 L 400 150" stroke="#64748b" strokeWidth="48" />
            <path d="M 0 150 L 400 150" stroke="#94a3b8" strokeWidth="32" />
            <path d="M 180 140 L 220 165 L 210 175" stroke="#ef4444" strokeWidth="4" fill="none" strokeLinecap="round" />
          </svg>
        );
      case 'broken_sleeper':
        return (
          <svg viewBox="0 0 400 300" className="w-full h-full object-cover">
            <rect width="400" height="300" fill="#0f172a" />
            <rect x="50" y="80" width="300" height="140" fill="#475569" rx="8" />
            <path d="M 180 80 L 210 220" stroke="#0f172a" strokeWidth="12" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 400 300" className="w-full h-full object-cover">
            <rect width="400" height="300" fill="#1e293b" />
            <path d="M 0 120 L 400 120" stroke="#64748b" strokeWidth="40" />
            <circle cx="240" cy="120" r="16" fill="#f59e0b" opacity="0.8" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="glass-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Eye className="w-6 h-6 text-cyan-400" />
            AI Fault Inspector
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Detect rail surface cracks, broken sleepers, missing clips, and structural flaws using automated visual inspection.
          </p>
        </div>

        {/* Upload Custom Photo Button */}
        <label className="btn-secondary text-xs cursor-pointer">
          <Upload className="w-4 h-4 text-cyan-400" />
          <span>Upload Custom Track Photo</span>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Defect Presets Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-card p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Inspection Presets & Defect Catalog
            </h3>
            <div className="space-y-2">
              {presets.map((p) => (
                <button
                  key={p.key}
                  onClick={() => handlePresetSelect(p.key)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                    selectedPreset === p.key && !customFile
                      ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-md shadow-cyan-500/10'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{p.name}</div>
                    <div className="text-[10px] text-slate-400">{p.category}</div>
                  </div>
                  {selectedPreset === p.key && !customFile && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Visual Canvas & Detection Output (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-card p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Live CV Visual Inference Canvas
              </span>
              {loading && (
                <span className="text-xs text-cyan-400 font-semibold flex items-center gap-2 animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running AI Fault Detection...
                </span>
              )}
            </div>

            {/* Simulated Image Display with Bounding Box Overlay */}
            <div className="relative w-full h-[320px] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
              {getPresetSVG(analysis?.defect_code || selectedPreset)}

              {/* Scanning Line Animation */}
              {loading && (
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/0 via-cyan-400/20 to-cyan-500/0 animate-pulse"></div>
              )}

              {/* Dynamic Bounding Box Overlay */}
              {analysis && analysis.bounding_box && !loading && (
                <div
                  className="absolute border-2 border-red-500 bg-red-500/10 rounded transition-all glow-red"
                  style={{
                    top: `${analysis.bounding_box.ymin}%`,
                    left: `${analysis.bounding_box.xmin}%`,
                    width: `${analysis.bounding_box.xmax - analysis.bounding_box.xmin}%`,
                    height: `${analysis.bounding_box.ymax - analysis.bounding_box.ymin}%`,
                  }}
                >
                  <div className="absolute -top-6 left-0 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    {analysis.defect_type} ({(analysis.confidence * 100).toFixed(0)}%)
                  </div>
                </div>
              )}
            </div>

            {/* Analysis Breakdown Panel */}
            {analysis && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Metric 1: Defect Classification */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase mb-1">Detected Flaw Type</div>
                  <div className="text-lg font-bold text-white mb-2">{analysis.defect_type}</div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-slate-400">
                      Confidence: <span className="text-cyan-400 font-bold">{(analysis.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Base Severity: <span className="text-amber-400 font-bold">{analysis.severity} / 100</span>
                    </div>
                  </div>
                </div>

                {/* Metric 2: Emergency Action Guidance */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase mb-1">Recommended Action</div>
                  <div className="text-xs font-medium text-slate-200 leading-relaxed mb-3">
                    {analysis.recommended_action}
                  </div>
                  <button
                    onClick={() => onNavigateToRisk && onNavigateToRisk(analysis)}
                    className="btn-primary text-xs py-2 px-4 w-full justify-center"
                  >
                    Assess Track Risk & Generate TSR
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
