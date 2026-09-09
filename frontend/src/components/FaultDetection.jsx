import React, { useState, useEffect, useRef } from 'react';
import {
  Eye,
  Upload,
  Camera,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Zap,
  Layers,
  FileImage,
  Crosshair,
  Maximize2,
  Clock
} from 'lucide-react';
import PageHeader from './common/PageHeader';
import MetricCard from './common/MetricCard';
import { RiskBadge, StatusBadge } from './common/RiskBadge';
import { analyzeTrackImage } from '../services/api';

export default function FaultDetection({
  tracks = [],
  onAnalyzeComplete,
  onNavigateToRisk
}) {
  const [selectedTrackId, setSelectedTrackId] = useState('T041');
  const [selectedPreset, setSelectedPreset] = useState('crack');
  const [customFile, setCustomFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const fileInputRef = useRef(null);

  const presets = [
    {
      key: 'crack',
      name: 'Transverse Rail Crack',
      category: 'Structural Flaw',
      description: 'Internal fatigue flaw propagating upward through rail head on high-GMT mainline.',
      severity: 88.5,
      confidence: 0.94,
      box: { xmin: 35, ymin: 30, xmax: 65, ymax: 70 }
    },
    {
      key: 'head_check',
      name: 'Head Check & Spalling',
      category: 'Surface Fatigue',
      description: 'Rolling contact fatigue fine gauge-corner surface fissures under heavy axle loading.',
      severity: 62.0,
      confidence: 0.89,
      box: { xmin: 25, ymin: 35, xmax: 75, ymax: 60 }
    },
    {
      key: 'broken_sleeper',
      name: 'Broken Concrete Sleeper',
      category: 'Substructure Failure',
      description: 'Complete transverse shear fracture through PSC sleeper beneath rail seat.',
      severity: 82.0,
      confidence: 0.96,
      box: { xmin: 30, ymin: 40, xmax: 70, ymax: 75 }
    },
    {
      key: 'missing_clip',
      name: 'Missing Elastic Fastener Clip',
      category: 'Fastener Dislodgement',
      description: 'Pandrol / ERC elastic fastening clip absent, compromising gauge retention.',
      severity: 54.0,
      confidence: 0.91,
      box: { xmin: 40, ymin: 45, xmax: 60, ymax: 65 }
    },
    {
      key: 'ballast_void',
      name: 'Ballast Voiding & Cavity',
      category: 'Trackbed Instability',
      description: 'Loss of ballast support beneath sleeper resulting in severe track pumping dynamic deflection.',
      severity: 74.0,
      confidence: 0.88,
      box: { xmin: 20, ymin: 50, xmax: 80, ymax: 85 }
    },
    {
      key: 'track_buckling',
      name: 'Thermal Track Buckling Hazard',
      category: 'Alignment Hazard',
      description: 'Lateral thermal deformation of CWR (Continuous Welded Rail) under 44°C+ rail ambient.',
      severity: 92.0,
      confidence: 0.97,
      box: { xmin: 15, ymin: 25, xmax: 85, ymax: 75 }
    }
  ];

  useEffect(() => {
    // Initial analysis for default preset
    runAnalysis('crack', null);
  }, []);

  const runAnalysis = async (presetKey, fileObj) => {
    setAnalyzing(true);
    setAnalysisProgress(15);

    const timer1 = setTimeout(() => setAnalysisProgress(55), 200);
    const timer2 = setTimeout(() => setAnalysisProgress(85), 450);

    try {
      const formData = new FormData();
      formData.append('track_id', selectedTrackId);
      if (presetKey) formData.append('preset_key', presetKey);
      if (fileObj) formData.append('file', fileObj);

      const data = await analyzeTrackImage(formData);
      setAnalysisProgress(100);
      setAnalysisResult(data);
      if (onAnalyzeComplete) onAnalyzeComplete(data);
    } catch (err) {
      console.error('[FaultDetection] Error analyzing image:', err);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setTimeout(() => setAnalyzing(false), 250);
    }
  };

  const handleSelectPreset = (key) => {
    setSelectedPreset(key);
    setCustomFile(null);
    setPreviewUrl(null);
    runAnalysis(key, null);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setCustomFile(f);
      setSelectedPreset(null);
      setPreviewUrl(URL.createObjectURL(f));
      runAnalysis(null, f);
    }
  };

  const activePresetObj = presets.find((p) => p.key === selectedPreset) || presets[0];

  // Render Defect Canvas with simulated inspection graphics
  const renderDefectCanvas = () => {
    if (previewUrl) {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <img
            src={previewUrl}
            alt="Custom inspection upload"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {/* Visual overlay box for custom upload */}
          <div
            style={{
              position: 'absolute',
              left: '30%',
              top: '30%',
              width: '40%',
              height: '40%',
              border: '2px dashed #ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-end',
              padding: 4
            }}
          >
            <span style={{ background: '#b91c1c', color: '#fff', fontSize: '0.625rem', fontWeight: 800, padding: '2px 6px', borderRadius: 2 }}>
              DETECTED FLAW: 94.0%
            </span>
          </div>
        </div>
      );
    }

    const box = activePresetObj.box;

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', background: '#0b1928' }}>
        {/* Synthetic photorealistic SVG of track defect */}
        <svg viewBox="0 0 500 320" style={{ width: '100%', height: '100%', display: 'block' }}>
          {/* Ballast trackbed */}
          <rect width="500" height="320" fill="#1e293b" />
          {[...Array(60)].map((_, i) => (
            <circle
              key={i}
              cx={(i * 19) % 500}
              cy={120 + ((i * 37) % 200)}
              r={3 + (i % 4)}
              fill="#334155"
              opacity="0.7"
            />
          ))}

          {/* Sleepers */}
          <rect x="30" y="70" width="440" height="34" rx="4" fill="#64748b" />
          <rect x="30" y="160" width="440" height="34" rx="4" fill="#64748b" />
          <rect x="30" y="250" width="440" height="34" rx="4" fill="#64748b" />

          {/* Left Rail */}
          <rect x="120" y="0" width="28" height="320" fill="#94a3b8" />
          <rect x="126" y="0" width="16" height="320" fill="#cbd5e1" />

          {/* Right Rail */}
          <rect x="350" y="0" width="28" height="320" fill="#94a3b8" />
          <rect x="356" y="0" width="16" height="320" fill="#cbd5e1" />

          {/* Defect illustration per preset */}
          {selectedPreset === 'crack' && (
            <path
              d="M 358 135 L 368 150 L 362 165 L 372 180"
              stroke="#ef4444"
              strokeWidth="4"
              fill="none"
            />
          )}

          {selectedPreset === 'broken_sleeper' && (
            <path
              d="M 320 160 L 335 178 L 330 194"
              stroke="#ef4444"
              strokeWidth="5"
              fill="none"
            />
          )}

          {selectedPreset === 'missing_clip' && (
            <circle cx="342" cy="177" r="10" stroke="#ef4444" strokeWidth="3" fill="none" strokeDasharray="3 3" />
          )}

          {selectedPreset === 'track_buckling' && (
            <path
              d="M 126 0 Q 150 160 126 320"
              stroke="#cbd5e1"
              strokeWidth="16"
              fill="none"
            />
          )}

          {/* Grid overlay lines (inspection HUD) */}
          <line x1="0" y1="160" x2="500" y2="160" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
          <line x1="250" y1="0" x2="250" y2="320" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
        </svg>

        {/* Bounding Box HUD Highlight */}
        <div
          style={{
            position: 'absolute',
            left: `${box.xmin}%`,
            top: `${box.ymin}%`,
            width: `${box.xmax - box.xmin}%`,
            height: `${box.ymax - box.ymin}%`,
            border: '2px solid #ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.18)',
            boxShadow: '0 0 12px rgba(239, 68, 68, 0.6)',
            borderRadius: 4,
            pointerEvents: 'none'
          }}
        >
          {/* Crosshairs */}
          <div style={{ position: 'absolute', top: -6, left: -6, width: 12, height: 12, borderTop: '2px solid #ef4444', borderLeft: '2px solid #ef4444' }} />
          <div style={{ position: 'absolute', top: -6, right: -6, width: 12, height: 12, borderTop: '2px solid #ef4444', borderRight: '2px solid #ef4444' }} />
          <div style={{ position: 'absolute', bottom: -6, left: -6, width: 12, height: 12, borderBottom: '2px solid #ef4444', borderLeft: '2px solid #ef4444' }} />
          <div style={{ position: 'absolute', bottom: -6, right: -6, width: 12, height: 12, borderBottom: '2px solid #ef4444', borderRight: '2px solid #ef4444' }} />

          {/* Detection Tag */}
          <div
            style={{
              position: 'absolute',
              top: -24,
              left: 0,
              backgroundColor: '#b91c1c',
              color: '#ffffff',
              fontSize: '0.625rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 3,
              whiteSpace: 'nowrap',
              letterSpacing: '0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Crosshair size={11} />
            <span>{activePresetObj.name.toUpperCase()} ({(activePresetObj.confidence * 100).toFixed(0)}%)</span>
          </div>
        </div>

        {/* HUD Info Badges */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: 10,
            right: 10,
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.6875rem',
            color: 'rgba(255,255,255,0.7)',
            fontFamily: 'var(--font-mono)'
          }}
        >
          <span>SENSOR: FLIR HD-OPTICAL • 4K</span>
          <span>ROI: [{box.xmin}%, {box.ymin}%] → [{box.xmax}%, {box.ymax}%]</span>
        </div>
      </div>
    );
  };

  const detectedDefect = analysisResult?.fault?.defect_type || activePresetObj.name;
  const confidencePct = ((analysisResult?.fault?.confidence || activePresetObj.confidence) * 100).toFixed(1);
  const severityScore = analysisResult?.fault?.severity || activePresetObj.severity;
  const description = analysisResult?.fault?.description || activePresetObj.description;
  const actionText = analysisResult?.recommendation?.action || 'Impose immediate TSR 30 km/h and schedule emergency maintenance block.';

  return (
    <div>
      {/* ── Page Header ── */}
      <PageHeader
        title="AI Vision Fault Detection Studio"
        subtitle="Automated rail defect identification, bounding-box localization, and severity classification using trained AI vision models."
        icon={Eye}
        badgeText="AI Fault Detection"
        badgeType="navy"
        breadcrumbs={['RailGuard Ops', 'Defect Inspection', 'AI Vision']}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Target Track:</span>
            <select
              value={selectedTrackId}
              onChange={(e) => setSelectedTrackId(e.target.value)}
              className="ir-select"
              style={{ height: '36px', fontSize: '0.8125rem' }}
            >
              {tracks.map((t) => (
                <option key={t.track_id} value={t.track_id}>
                  {t.track_id} ({t.section || t.location})
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* ── STEP 1: PRESET DEFECT SELECTION & UPLOAD BAR ── */}
      <div
        className="ir-card p-4"
        style={{ marginBottom: '20px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--ir-navy-dark)', textTransform: 'uppercase' }}>
              Step 1: Choose Inspection Source or Upload Image
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Select an Indian Railways test case telemetry capture or upload field drone/track-car photos.
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-ir-secondary"
            style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Upload size={14} />
            <span>Upload Custom Photo</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Preset Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '10px'
          }}
        >
          {presets.map((p) => {
            const isSelected = selectedPreset === p.key && !customFile;
            return (
              <div
                key={p.key}
                onClick={() => handleSelectPreset(p.key)}
                style={{
                  border: `2px solid ${isSelected ? 'var(--ir-navy-dark)' : 'var(--border-light)'}`,
                  background: isSelected ? 'var(--ir-navy-soft)' : '#ffffff',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    {p.category}
                  </span>
                  <RiskBadge value={p.severity} size="sm" showDot={false} />
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.8125rem', color: 'var(--ir-navy-dark)', lineHeight: 1.3 }}>
                  {p.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── STEP 2: TWO-COLUMN INSPECTION & ANALYSIS LAYOUT ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '20px'
        }}
      >
        {/* LEFT COLUMN: INSPECTION IMAGE & HUD */}
        <div className="ir-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="ir-card-header flex items-center justify-between">
            <h3 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--ir-navy-dark)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Eye size={15} /> Optical Inspection Canvas
            </h3>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Track Asset: <strong>{selectedTrackId}</strong></span>
          </div>

          {/* Canvas container */}
          <div
            style={{
              height: '340px',
              width: '100%',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {renderDefectCanvas()}

            {analyzing && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(6, 22, 37, 0.75)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  color: '#ffffff'
                }}
              >
                <RefreshCw size={28} className="animate-spin text-emerald-400" />
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Running AI Inspection Analysis...</div>
                <div style={{ width: '200px', height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 9999, overflow: 'hidden' }}>
                  <div style={{ width: `${analysisProgress}%`, height: '100%', background: '#22c55e', transition: 'width 0.2s ease' }} />
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--bg-subtle)',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Source: {customFile ? customFile.name : `Track Inspection Sample — ${activePresetObj.name}`}
            </span>
            <button
              onClick={() => runAnalysis(selectedPreset, customFile)}
              disabled={analyzing}
              className="btn-ir-primary"
              style={{ fontSize: '0.75rem', padding: '6px 14px' }}
            >
              {analyzing ? 'Analyzing...' : 'Re-Run AI Inspection'}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: AI FINDINGS & RISK ASSESSMENT */}
        <div className="ir-card p-4" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="ir-card-header" style={{ padding: 0, border: 'none', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--ir-navy-dark)', textTransform: 'uppercase' }}>
                AI Findings & Risk Scoring
              </h3>
              <RiskBadge value={severityScore} size="sm" />
            </div>

            {/* Finding Detail Row */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px',
                marginBottom: '14px'
              }}
            >
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Detected Defect
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--ir-navy-dark)', margin: '4px 0' }}>
                {detectedDefect}
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                {description}
              </p>
            </div>

            {/* Scores Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '14px'
              }}
            >
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 6, border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Model Confidence
                </span>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--ir-green)', marginTop: 2 }}>
                  {confidencePct}%
                </div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>AI Model Confidence</span>
              </div>

              <div style={{ background: '#fee2e2', padding: '12px', borderRadius: 6, border: '1px solid #fca5a5' }}>
                <span style={{ fontSize: '0.6875rem', color: '#991b1b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Defect Severity
                </span>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#b91c1c', marginTop: 2 }}>
                  {severityScore} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>/ 100</span>
                </div>
                <span style={{ fontSize: '0.6875rem', color: '#991b1b' }}>Physical Risk Factor</span>
              </div>
            </div>

            {/* Severity Progress Bar */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>Defect Severity Scale</span>
                <span style={{ color: severityScore >= 75 ? '#b91c1c' : 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                  {severityScore >= 75 ? 'CRITICAL STRUCTURAL DEFECT' : 'MODERATE WEAR'}
                </span>
              </div>
              <div style={{ width: '100%', height: 8, background: '#e2e8f0', borderRadius: 9999, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${severityScore}%`,
                    height: '100%',
                    backgroundColor: severityScore >= 75 ? '#b91c1c' : '#f59e0b',
                    borderRadius: 9999
                  }}
                />
              </div>
            </div>

            {/* Recommended Action */}
            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderLeft: '4px solid #b45309',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px'
              }}
            >
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: '#b45309' }}>
                Operational Recommendation
              </div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#78350f', marginTop: 2 }}>
                {actionText}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', gap: 10 }}>
            <button
              onClick={() => onNavigateToRisk && onNavigateToRisk(selectedTrackId)}
              className="btn-ir-secondary"
              style={{ flex: 1, fontSize: '0.75rem' }}
            >
              Inspect Risk Breakdown
            </button>
            <button
              onClick={() => {
                const el = document.querySelector('[role="button"][tabindex="0"]');
                if (onNavigateToRisk) onNavigateToRisk(selectedTrackId);
              }}
              className="btn-ir-primary"
              style={{ flex: 1, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <span>Schedule Block</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
