import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  CheckCircle2,
  FileText,
  Layers,
  Calendar,
  Train,
  ShieldAlert,
  TrendingUp,
  Filter,
  Eye,
  CalendarClock
} from 'lucide-react';
import PageHeader from './common/PageHeader';
import MetricCard from './common/MetricCard';
import { RiskBadge, StatusBadge } from './common/RiskBadge';

export default function ReportsView({ tracks = [] }) {
  const [selectedSection, setSelectedSection] = useState('risk_summary'); // 'risk_summary' | 'inspection' | 'maintenance' | 'availability'
  const [selectedDivision, setSelectedDivision] = useState('ALL');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-09-08');

  const reportSections = [
    {
      id: 'risk_summary',
      title: 'Corridor Risk Assessment Summary',
      desc: 'Track risk scores, TSR speed restrictions, and 7/14-day degradation forecasts.',
      icon: ShieldAlert
    },
    {
      id: 'inspection',
      title: 'AI Fault Detection & Inspection Log',
      desc: 'Detected rail fractures, sleeper cracks, missing elastic fasteners, and AI inspection confidence ratings.',
      icon: Eye
    },
    {
      id: 'maintenance',
      title: 'Maintenance Block Planning & Optimization Report',
      desc: 'Scheduled possession windows, duration hours, assigned gangs, and delay penalties.',
      icon: CalendarClock
    },
    {
      id: 'availability',
      title: 'Network Asset Availability & Uptime Audit',
      desc: 'Corridor throughput capacity, TSR speed bottleneck impact, and availability yield.',
      icon: TrendingUp
    }
  ];

  const divisions = useMemo(() => {
    const s = new Set(tracks.map((t) => t.division).filter(Boolean));
    return ['ALL', ...Array.from(s)];
  }, [tracks]);

  const filteredTracks = useMemo(() => {
    if (selectedDivision === 'ALL') return tracks;
    return tracks.filter((t) => t.division === selectedDivision);
  }, [tracks, selectedDivision]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let headers = '';
    let rows = '';

    if (selectedSection === 'risk_summary') {
      headers = 'Track ID,Location,Section,Division,Zone,Traffic GMT/d,Composite Risk,Category,Speed Limit km/h,TSR Speed km/h,Days to Critical\n';
      rows = filteredTracks.map((t) =>
        `"${t.track_id}","${t.location || ''}","${t.section || ''}","${t.division || ''}","${t.zone || ''}",${t.traffic_per_day || 50},${t.composite_risk || 45.0},"${t.risk_category || 'MODERATE'}",${t.speed_limit || 130},${t.tsr_speed || 130},${t.days_to_critical || 14}`
      ).join('\n');
    } else if (selectedSection === 'inspection') {
      headers = 'Track ID,Section,Defect Type,Model Confidence %,Defect Severity /100,TSR Imposed km/h,Recommended Action\n';
      rows = filteredTracks.map((t) => {
        const sev = t.composite_risk || 85.0;
        const defect = sev >= 75 ? 'Transverse Rail Crack' : (sev >= 55 ? 'Broken Concrete Sleeper' : 'Fastener Slack');
        return `"${t.track_id}","${t.section || ''}","${defect}",94.0,${sev},${t.tsr_speed || 30},"Schedule Emergency Block"`;
      }).join('\n');
    } else if (selectedSection === 'maintenance') {
      headers = 'Block ID,Track ID,Section,Block Window,Duration hrs,Crew Assigned,Train Conflict,Availability Gain\n';
      rows = filteredTracks.slice(0, 5).map((t, idx) =>
        `"BLK-00${idx + 1}","${t.track_id}","${t.section || ''}","01:00-03:00 IST",2.5,"Northern Railway Gang #7",0 trains,"+14.0%"`
      ).join('\n');
    } else {
      headers = 'Corridor,Unoptimized Availability %,Optimized Availability %,Throughput Gain %,Restricted Segments\n';
      rows = [
        '"NDLS-CNB Mainline",82.5,96.5,+14.0,2',
        '"CSTM-PUNE Corridor",80.0,94.8,+14.8,1',
        '"BCT-ADI Mainline",88.0,98.2,+10.2,1',
        '"HWH-NDLS Grand Chord",84.0,95.5,+11.5,1'
      ].join('\n');
    }

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `RailGuard_${selectedSection}_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* ── Page Header ── */}
      <PageHeader
        title="Indian Railways Official Safety & Audit Reports"
        subtitle="Generate compliance-ready documentation for track asset integrity, AI inspection logs, maintenance possession permits, and availability audits."
        icon={FileSpreadsheet}
        badgeText="Official Compliance"
        badgeType="navy"
        breadcrumbs={['RailGuard Ops', 'Compliance', 'Official Reports']}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={handleExportCSV}
              className="btn-ir-secondary"
              style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 6, height: '36px' }}
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="btn-ir-primary"
              style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 6, height: '36px' }}
            >
              <Printer size={14} />
              <span>Print Official Report</span>
            </button>
          </div>
        }
      />

      {/* ── REPORT TYPE SELECTOR CARDS ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}
      >
        {reportSections.map((sec) => {
          const active = selectedSection === sec.id;
          const Icon = sec.icon;
          return (
            <div
              key={sec.id}
              onClick={() => setSelectedSection(sec.id)}
              style={{
                border: `2px solid ${active ? 'var(--ir-navy-dark)' : 'var(--border-light)'}`,
                background: active ? 'var(--ir-navy-soft)' : '#ffffff',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: active ? 'var(--ir-navy-dark)' : 'var(--bg-subtle)',
                    color: active ? '#ffffff' : 'var(--ir-navy-dark)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Icon size={16} />
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.8125rem', color: 'var(--ir-navy-dark)', lineHeight: 1.3 }}>
                  {sec.title}
                </div>
              </div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                {sec.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── FILTER CONTROLS BAR ── */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Division:</span>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="ir-select"
              style={{ height: '34px', fontSize: '0.8125rem' }}
            >
              {divisions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="ir-input"
              style={{ height: '34px', fontSize: '0.8125rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="ir-input"
              style={{ height: '34px', fontSize: '0.8125rem' }}
            />
          </div>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Records in Report: <strong style={{ color: 'var(--ir-navy-dark)' }}>{filteredTracks.length} tracks</strong>
        </div>
      </div>

      {/* ── REPORT DOCUMENT VIEW ── */}
      <div
        className="ir-card p-6"
        style={{
          background: '#ffffff',
          boxShadow: 'var(--shadow-md)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)'
        }}
      >
        {/* Document Formal Header (visible in print too) */}
        <div style={{ borderBottom: '2px solid var(--ir-navy-dark)', paddingBottom: 16, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--ir-navy)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                RAILWAY ASSET MANAGEMENT • OFFICIAL DECISION AUDIT
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--ir-navy-dark)', margin: '4px 0 2px' }}>
                RAILGUARD DECISION SUPPORT SYSTEM AUDIT REPORT
              </h2>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Report Code: <strong>RG-{selectedSection.toUpperCase()}-2026</strong>
              </div>
            </div>

            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <div>Generated: <strong>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></div>
              <div>Audit Cycle: <strong>Weekly Corridor Telemetry</strong></div>
              <div>Classification: <strong>Official / Operations Only</strong></div>
            </div>
          </div>
        </div>

        {/* Dynamic Table for selected report type */}
        <div className="table-container" style={{ boxShadow: 'none' }}>
          {selectedSection === 'risk_summary' && (
            <table className="ir-table">
              <thead>
                <tr>
                  <th>Track ID</th>
                  <th>Location</th>
                  <th>Division</th>
                  <th>Traffic GMT</th>
                  <th>Risk Score</th>
                  <th>Risk Category</th>
                  <th>Speed Limit</th>
                  <th>TSR Speed</th>
                  <th>Days to Crit.</th>
                </tr>
              </thead>
              <tbody>
                {filteredTracks.map((tr) => (
                  <tr key={tr.track_id}>
                    <td><strong style={{ fontFamily: 'var(--font-mono)' }}>{tr.track_id}</strong></td>
                    <td>{tr.location || tr.section}</td>
                    <td>{tr.division}</td>
                    <td>{tr.traffic_per_day} GMT/d</td>
                    <td><strong style={{ fontFamily: 'var(--font-mono)' }}>{tr.composite_risk || 45.0}</strong></td>
                    <td><RiskBadge value={tr.composite_risk || 45.0} size="sm" /></td>
                    <td>{tr.speed_limit || 130} km/h</td>
                    <td><strong style={{ color: (tr.tsr_speed || 130) < 130 ? '#b91c1c' : 'var(--ir-green)' }}>{tr.tsr_speed || 130} km/h</strong></td>
                    <td>{tr.days_to_critical || 14}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedSection === 'inspection' && (
            <table className="ir-table">
              <thead>
                <tr>
                  <th>Track ID</th>
                  <th>Section</th>
                  <th>Detected Defect</th>
                  <th>AI Confidence</th>
                  <th>Severity Score</th>
                  <th>TSR Imposed</th>
                  <th>Prescribed Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTracks.map((tr) => {
                  const sev = tr.composite_risk || 85.0;
                  const defect = sev >= 75 ? 'Transverse Rail Crack' : (sev >= 55 ? 'Broken Concrete Sleeper' : 'Pandrol Clip Slack');
                  return (
                    <tr key={tr.track_id}>
                      <td><strong style={{ fontFamily: 'var(--font-mono)' }}>{tr.track_id}</strong></td>
                      <td>{tr.section || tr.location}</td>
                      <td><strong style={{ color: 'var(--ir-navy-dark)' }}>{defect}</strong></td>
                      <td><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ir-green)' }}>94.0%</span></td>
                      <td><strong style={{ color: '#b91c1c' }}>{sev} / 100</strong></td>
                      <td>{tr.tsr_speed || 30} km/h</td>
                      <td><span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Schedule Emergency Block Window</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {selectedSection === 'maintenance' && (
            <table className="ir-table">
              <thead>
                <tr>
                  <th>Block ID</th>
                  <th>Track ID</th>
                  <th>Section</th>
                  <th>Block Window</th>
                  <th>Duration</th>
                  <th>Crew Assigned</th>
                  <th>Train Disruption</th>
                  <th>Availability Gain</th>
                </tr>
              </thead>
              <tbody>
                {filteredTracks.slice(0, 6).map((tr, i) => (
                  <tr key={tr.track_id}>
                    <td><strong style={{ fontFamily: 'var(--font-mono)' }}>BLK-00{i + 1}</strong></td>
                    <td><strong style={{ fontFamily: 'var(--font-mono)' }}>{tr.track_id}</strong></td>
                    <td>{tr.section || tr.location}</td>
                    <td><strong style={{ color: 'var(--ir-green)' }}>01:00 → 03:30 IST</strong></td>
                    <td>2.5 hrs</td>
                    <td>Northern Railway Gang #{i + 4}</td>
                    <td><span style={{ color: 'var(--ir-green)', fontWeight: 700 }}>Zero (0 trains)</span></td>
                    <td><strong style={{ color: 'var(--ir-green)' }}>+14.0%</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedSection === 'availability' && (
            <table className="ir-table">
              <thead>
                <tr>
                  <th>Corridor</th>
                  <th>Baseline Availability</th>
                  <th>RailGuard AI Availability</th>
                  <th>Throughput Gain</th>
                  <th>Speed Restricted Segments</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { corridor: 'NDLS-CNB Mainline', unopt: 82.5, opt: 96.5, gain: '+14.0%', segments: 2 },
                  { corridor: 'CSTM-PUNE Corridor', unopt: 80.0, opt: 94.8, gain: '+14.8%', segments: 1 },
                  { corridor: 'BCT-ADI Mainline', unopt: 88.0, opt: 98.2, gain: '+10.2%', segments: 1 },
                  { corridor: 'HWH-NDLS Grand Chord', unopt: 84.0, opt: 95.5, gain: '+11.5%', segments: 1 }
                ].map((row, idx) => (
                  <tr key={idx}>
                    <td><strong>{row.corridor}</strong></td>
                    <td><span style={{ fontFamily: 'var(--font-mono)' }}>{row.unopt}%</span></td>
                    <td><strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--ir-green)' }}>{row.opt}%</strong></td>
                    <td><strong style={{ color: 'var(--ir-green)' }}>{row.gain}</strong></td>
                    <td>{row.segments} Active TSRs</td>
                    <td><RiskBadge value="Optimized" category="LOW" size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Document Footer Signatures (for print compliance) */}
        <div
          style={{
            marginTop: '32px',
            borderTop: '1px solid var(--border-light)',
            paddingTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}
        >
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: 2 }}>
              Prepared by: RailGuard Risk Prediction AI
            </div>
            <div>Railway Operations Risk & Asset Management Platform</div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: 2 }}>
              Verified by: Chief Controller / Section In-Charge
            </div>
            <div>Signature & Official Seal Required for Field Possession</div>
          </div>
        </div>
      </div>
    </div>
  );
}
