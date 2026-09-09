import React, { useState } from 'react';
import {
  LayoutDashboard, Activity, Eye, CalendarClock, SlidersHorizontal,
  MapPin, TrendingUp, AlertTriangle, FileSpreadsheet, Train,
  CheckCircle2, AlertCircle, Menu, X, Shield, Server,
  User, LogOut, Settings,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const SECTIONS = [
  { id: 'dashboard',     label: 'Dashboard',            icon: LayoutDashboard },
  { id: 'track_risk',    label: 'Track Risk',            icon: Activity },
  { id: 'cv_studio',     label: 'AI Fault Detection',    icon: Eye },
  { id: 'maintenance',   label: 'Maintenance Planning',   icon: CalendarClock },
  { id: 'simulator',     label: 'What-If Simulator',     icon: SlidersHorizontal },
  { id: 'gis_map',       label: 'GIS Track Map',         icon: MapPin },
  { id: 'asset_avail',   label: 'Asset Availability',    icon: TrendingUp },
  { id: 'alerts',        label: 'Alerts',                icon: AlertTriangle, badge: true },
  { id: 'reports',       label: 'Reports',               icon: FileSpreadsheet },
  { id: 'system_status', label: 'System Status',         icon: Server },
];

const ROLE_LABELS = {
  admin: 'Administrator',
  railway_operator: 'Railway Operator',
  maintenance_engineer: 'Maintenance Engineer',
  viewer: 'Viewer',
};

const ZONES = [
  'Northern Railway (NR – Delhi)',
  'Central Railway (CR – Mumbai)',
  'Western Railway (WR – Mumbai Central)',
  'Eastern Railway (ER – Asansol)',
  'South Central Railway (SCR – Secunderabad)',
];

export default function Sidebar({
  activeSection, setActiveSection, selectedZone, setSelectedZone,
  backendStatus, alertCount = 0,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, role } = useAuth();

  const handleNav = (id) => { setActiveSection(id); setMobileOpen(false); };
  const isOnline = backendStatus === 'healthy';

  // Avatar initials from name
  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'RG';

  return (
    <>
      {/* Mobile toggle */}
      <button className="sidebar-mobile-toggle" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle sidebar">
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 299, display: 'none',
        }} className="sidebar-overlay" />
      )}

      {/* Sidebar panel */}
      <nav className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-logo">
            <div className="sidebar-brand-icon">
              <Shield size={20} color="#fff" />
            </div>
            <div>
              <div className="sidebar-brand-name">RailGuard</div>
              <div className="sidebar-brand-sub">Railway Asset Management</div>
            </div>
          </div>
        </div>

        {/* Zone picker */}
        <div className="sidebar-zone">
          <div className="sidebar-zone-label">Active Zone</div>
          <select value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)}>
            {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>

        {/* Navigation */}
        <div className="sidebar-nav">
          <div className="sidebar-nav-section-label">Navigation</div>
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            const showBadge = sec.badge && alertCount > 0;
            return (
              <div key={sec.id} className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNav(sec.id)} role="button" tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleNav(sec.id)}>
                <Icon className="nav-icon" />
                <span>{sec.label}</span>
                {showBadge && <span className="nav-badge">{alertCount}</span>}
              </div>
            );
          })}

          {/* Account link — all users */}
          <div className="sidebar-nav-section-label" style={{ marginTop: 12 }}>Account</div>
          <div className={`sidebar-nav-item ${activeSection === 'account' ? 'active' : ''}`}
            onClick={() => handleNav('account')} role="button" tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleNav('account')}>
            <User className="nav-icon" />
            <span>My Account</span>
          </div>

          {/* Admin link — admin only */}
          {role === 'admin' && (
            <div className={`sidebar-nav-item ${activeSection === 'admin' ? 'active' : ''}`}
              onClick={() => handleNav('admin')} role="button" tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleNav('admin')}>
              <Settings className="nav-icon" />
              <span>User Management</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          {/* Backend status */}
          <div className="sidebar-status" onClick={() => handleNav('system_status')}
            style={{ cursor: 'pointer' }} title="View System Status">
            <div className={`sidebar-status-dot ${isOnline ? 'online' : 'offline'}`} />
            <div className="sidebar-status-text">
              <strong>{isOnline ? 'Backend Connected' : 'Local / Offline'}</strong>
              {isOnline ? 'API services live' : 'Fallback data active'}
            </div>
          </div>

          {/* User row */}
          <div className="sidebar-user" style={{ cursor: 'pointer' }} onClick={() => handleNav('account')}
            title="My Account">
            <div className="sidebar-user-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="user-name">{user?.full_name || 'User'}</div>
              <div className="user-role">{ROLE_LABELS[user?.role] || user?.role || 'Viewer'}</div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); logout(); }}
              title="Sign Out"
              style={{
                marginLeft: 'auto', background: 'none', border: 'none',
                cursor: 'pointer', color: 'rgba(255,255,255,0.45)', padding: 4,
                display: 'flex', alignItems: 'center',
              }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
