import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import AccountPage from './pages/AccountPage';
import AdminPage from './pages/AdminPage';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TrackRisk from './components/TrackRisk';
import FaultDetection from './components/FaultDetection';
import MaintenancePlanning from './components/MaintenancePlanning';
import WhatIfSimulator from './components/WhatIfSimulator';
import RailwayMap from './components/RailwayMap';
import AssetAvailability from './components/AssetAvailability';
import AlertsView from './components/AlertsView';
import ReportsView from './components/ReportsView';
import SystemStatusView from './components/SystemStatusView';
import { getTracks, checkBackendHealth, getActiveAlerts, FALLBACK_TRACKS } from './services/api';

// ─── Footer ───────────────────────────────────────────────────
function PortalFooter({ onNavigate }) {
  return (
    <footer className="portal-footer">
      <div className="footer-top">
        <div>
          <div className="footer-brand-name">RailGuard</div>
          <div className="footer-brand-desc">
            AI-Powered Railway Asset Risk &amp; Maintenance Planning Platform.
          </div>
        </div>
        <div className="footer-links">
          <span onClick={() => onNavigate('dashboard')}>About</span>
          <span onClick={() => onNavigate('reports')}>Documentation</span>
          <span onClick={() => onNavigate('system_status')}>System Status</span>
          <span onClick={() => onNavigate('alerts')}>Alerts</span>
          <span onClick={() => onNavigate('reports')}>Reports</span>
        </div>
      </div>
      <hr className="footer-divider" />
      <div className="footer-bottom">
        <div className="footer-bottom-text">
          © 2026 RailGuard • Railway Operations & Asset Management Platform
        </div>
        <div className="footer-notice">
          This system operates with simulated track data for demonstration purposes.
          Does not execute automatic train control or signalling overrides.
          Recommended actions require operator review and authorization.
        </div>
      </div>
    </footer>
  );
}

// ─── Loading spinner ───────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-content)', flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: 'var(--ir-navy-dark)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 500 }}>
        Loading RailGuard…
      </div>
    </div>
  );
}

// ─── Main app shell (authenticated) ───────────────────────────
function AppShell() {
  const { isAuthenticated, loading } = useAuth();
  const [activeSection, setActiveSection]     = useState('dashboard');
  const [selectedZone, setSelectedZone]       = useState('Northern Railway (NR – Delhi)');
  const [selectedTrackId, setSelectedTrackId] = useState('T041');
  const [tracks, setTracks]                   = useState(FALLBACK_TRACKS);
  const [backendStatus, setBackendStatus]     = useState('checking');
  const [alerts, setAlerts]                   = useState([]);

  useEffect(() => {
    if (isAuthenticated) loadInitialData();
  }, [isAuthenticated]);

  const loadInitialData = async () => {
    const health = await checkBackendHealth();
    setBackendStatus(health?.status || 'offline');

    const trackList = await getTracks();
    if (Array.isArray(trackList) && trackList.length > 0) setTracks(trackList);

    const alertsRes = await getActiveAlerts();
    if (alertsRes?.alerts) setAlerts(alertsRes.alerts);
  };

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <LoginPage />;

  const handleSelectTrack = (trackId) => { setSelectedTrackId(trackId); setActiveSection('track_risk'); };
  const handleNavigateToPlanner = (trackId) => { if (trackId) setSelectedTrackId(trackId); setActiveSection('maintenance'); };
  const handleNavigateToRisk = (trackId) => { if (trackId) setSelectedTrackId(trackId); setActiveSection('track_risk'); };
  const criticalAlerts = alerts.filter((a) => a?.severity === 'CRITICAL' || a?.risk_level === 'CRITICAL RISK');

  return (
    <div className="app-shell">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        selectedZone={selectedZone}
        setSelectedZone={setSelectedZone}
        backendStatus={backendStatus}
        alertCount={criticalAlerts.length}
      />

      <div className="content-area">
        <main className="content-main">
          {activeSection === 'dashboard' && (
            <Dashboard tracks={tracks} alerts={alerts} backendHealth={{ status: backendStatus }}
              onNavigate={setActiveSection} onSelectTrack={handleSelectTrack} />
          )}
          {activeSection === 'track_risk' && (
            <TrackRisk tracks={tracks} selectedTrackId={selectedTrackId}
              onSelectTrack={(id) => setSelectedTrackId(id)} onNavigateToPlanner={handleNavigateToPlanner} />
          )}
          {activeSection === 'cv_studio' && (
            <FaultDetection tracks={tracks} onAnalyzeComplete={loadInitialData}
              onNavigateToRisk={handleNavigateToRisk} />
          )}
          {activeSection === 'maintenance' && <MaintenancePlanning />}
          {activeSection === 'simulator' && (
            <WhatIfSimulator tracks={tracks} onNavigateToPlanner={() => setActiveSection('maintenance')} />
          )}
          {activeSection === 'gis_map' && (
            <RailwayMap onNavigateToSimulator={() => setActiveSection('simulator')} />
          )}
          {activeSection === 'asset_avail' && (
            <AssetAvailability tracks={tracks} onNavigate={setActiveSection} />
          )}
          {activeSection === 'alerts' && (
            <AlertsView tracks={tracks} onNavigateToRisk={handleNavigateToRisk}
              onNavigateToPlanner={handleNavigateToPlanner} />
          )}
          {activeSection === 'reports' && <ReportsView tracks={tracks} />}
          {activeSection === 'system_status' && <SystemStatusView onNavigate={setActiveSection} />}
          {activeSection === 'account' && <AccountPage />}
          {activeSection === 'admin' && <AdminPage />}
        </main>
        <PortalFooter onNavigate={setActiveSection} />
      </div>
    </div>
  );
}

// ─── Root App wrapped with AuthProvider ───────────────────────
export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
