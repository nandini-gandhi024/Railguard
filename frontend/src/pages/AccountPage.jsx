/**
 * RailGuard Account Page
 * Shows: profile info, change password, recent audit activity, logout
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  User, Mail, Building2, Briefcase, Shield, Clock,
  Key, Eye, EyeOff, CheckCircle, AlertCircle, LogOut, Loader,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const ROLE_LABELS = {
  admin: 'Administrator',
  railway_operator: 'Railway Operator',
  maintenance_engineer: 'Maintenance Engineer',
  viewer: 'Viewer',
};

const ROLE_COLORS = {
  admin: { bg: '#fef3c7', color: '#b45309' },
  railway_operator: { bg: '#dbeafe', color: '#1d4ed8' },
  maintenance_engineer: { bg: '#dcfce7', color: '#15803d' },
  viewer: { bg: '#f1f5f9', color: '#475569' },
};

function card(children, style = {}) {
  return (
    <div style={{
      background: '#fff', borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-light)',
      boxShadow: 'var(--shadow-sm)', padding: '28px 32px',
      ...style,
    }}>
      {children}
    </div>
  );
}

export default function AccountPage() {
  const { user, logout, authFetch } = useAuth();
  const [auditLog, setAuditLog]   = useState([]);

  // Change password
  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    loadAuditLog();
  }, []);

  const loadAuditLog = async () => {
    try {
      const res = await authFetch(`${API_BASE}/admin/my-audit-log?limit=15`);
      if (res.ok) {
        const data = await res.json();
        setAuditLog(data.entries || []);
      }
    } catch { /* silent */ }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError(''); setPwSuccess(false);
    if (pwForm.new !== pwForm.confirm) { setPwError('New passwords do not match.'); return; }
    if (pwForm.new.length < 8) { setPwError('Password must be at least 8 characters.'); return; }
    setPwLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/auth/me/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: pwForm.current, new_password: pwForm.new }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to update password.');
      setPwSuccess(true);
      setPwForm({ current: '', new: '', confirm: '' });
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwLoading(false);
    }
  };

  if (!user) return null;
  const roleStyle = ROLE_COLORS[user.role] || ROLE_COLORS.viewer;

  const inputStyle = {
    width: '100%', padding: '10px 13px',
    border: '1.5px solid var(--border-med)', borderRadius: 'var(--radius-md)',
    fontSize: '0.88rem', fontFamily: 'var(--font-sans)',
    color: 'var(--text-main)', background: '#fff', outline: 'none',
  };

  return (
    <div className="page-section" style={{ maxWidth: 860 }}>
      {/* ── Page header ───────────────────────────────────────────── */}
      <div className="page-header" style={{ marginBottom: 28 }}>
        <div className="page-header-left">
          <h1 className="page-title">Account</h1>
          <p className="page-subtitle">Manage your profile, password, and session.</p>
        </div>
        <button
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 18px', border: '1.5px solid var(--border-med)',
            borderRadius: 'var(--radius-md)', background: '#fff',
            color: 'var(--ir-red)', fontWeight: 700, cursor: 'pointer',
            fontSize: '0.88rem',
          }}
        >
          <LogOut size={15} /> Sign Out
        </button>
      </div>

      {/* ── Profile card ──────────────────────────────────────────── */}
      {card(
        <>
          <h3 style={{ fontWeight: 800, color: 'var(--ir-navy-dark)', marginBottom: 22, fontSize: '1rem' }}>
            Profile Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {[
              [User, 'Full Name', user.full_name],
              [Mail, 'Email', user.email],
              [Briefcase, 'Designation', user.designation || '—'],
              [Building2, 'Organization', user.organization || '—'],
              [Shield, 'Role', (
                <span style={{
                  background: roleStyle.bg, color: roleStyle.color,
                  padding: '3px 10px', borderRadius: 20, fontWeight: 700,
                  fontSize: '0.78rem',
                }}>
                  {ROLE_LABELS[user.role] || user.role}
                </span>
              )],
              [Clock, 'Last Login', user.last_login
                ? new Date(user.last_login).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                : 'First session'],
            ].map(([Icon, label, value]) => (
              <div key={label} style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'var(--ir-navy-soft)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={16} color="var(--ir-navy-dark)" />
                </div>
                <div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>
                    {label}
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                    {value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      , { marginBottom: 20 })}

      {/* ── Change password ───────────────────────────────────────── */}
      {card(
        <>
          <h3 style={{ fontWeight: 800, color: 'var(--ir-navy-dark)', marginBottom: 22, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 9 }}>
            <Key size={18} /> Change Password
          </h3>
          <form onSubmit={handlePasswordChange} noValidate style={{ maxWidth: 420 }}>
            {[
              ['Current Password', 'current', showCur, () => setShowCur((v) => !v)],
              ['New Password', 'new', showNew, () => setShowNew((v) => !v)],
              ['Confirm New Password', 'confirm', showNew, () => setShowNew((v) => !v)],
            ].map(([label, key, show, toggle]) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <label style={{
                  display: 'block', fontSize: '0.78rem', fontWeight: 600,
                  color: 'var(--text-secondary)', marginBottom: 6,
                }}>
                  {label}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={show ? 'text' : 'password'}
                    value={pwForm[key]}
                    onChange={(e) => setPwForm((f) => ({ ...f, [key]: e.target.value }))}
                    style={{ ...inputStyle, paddingRight: 42 }}
                    required
                  />
                  <button type="button" onClick={toggle} style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  }}>
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            ))}

            {pwError && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--ir-red)', fontSize: '0.83rem', marginBottom: 14 }}>
                <AlertCircle size={15} /> {pwError}
              </div>
            )}
            {pwSuccess && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--ir-green)', fontSize: '0.83rem', marginBottom: 14 }}>
                <CheckCircle size={15} /> Password updated successfully.
              </div>
            )}

            <button type="submit" disabled={pwLoading} style={{
              padding: '10px 22px', background: 'var(--ir-navy-dark)',
              color: '#fff', border: 'none', borderRadius: 'var(--radius-md)',
              fontWeight: 700, cursor: pwLoading ? 'not-allowed' : 'pointer',
              fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {pwLoading && <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />}
              Update Password
            </button>
          </form>
        </>
      , { marginBottom: 20 })}

      {/* ── Recent activity ───────────────────────────────────────── */}
      {card(
        <>
          <h3 style={{ fontWeight: 800, color: 'var(--ir-navy-dark)', marginBottom: 18, fontSize: '1rem' }}>
            Recent Activity
          </h3>
          {auditLog.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No recent activity recorded.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {auditLog.map((entry) => (
                <div key={entry.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)', fontSize: '0.85rem',
                }}>
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--ir-navy-dark)' }}>{entry.action.replace(/_/g, ' ')}</span>
                    {entry.target && <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>→ {entry.target}</span>}
                  </div>
                  <span style={{ color: 'var(--text-light)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                    {entry.timestamp ? new Date(entry.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
