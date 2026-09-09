/**
 * RailGuard Admin Page (Admin role only)
 * Comprehensive User Management:
 * - Direct user account creation (+ Add User)
 * - Review & Approve / Reject access requests
 * - Activate / Deactivate user accounts
 * - Assign & Change user roles
 * - Remove access (delete account)
 * - View all authorized accounts & audit activity
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  UserCheck, UserX, Users, ClipboardList, Activity,
  CheckCircle, XCircle, Ban, RefreshCw, Shield, Clock,
  UserPlus, Trash2, Key, Mail, Building, Briefcase, X, AlertCircle
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const ROLE_OPTIONS = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'maintenance_engineer', label: 'Maintenance Engineer' },
  { value: 'railway_operator', label: 'Railway Operator' },
  { value: 'admin', label: 'Administrator' },
];

const ROLE_COLORS = {
  admin: '#b45309',
  railway_operator: '#1d4ed8',
  maintenance_engineer: '#15803d',
  viewer: '#475569',
};

function TabButton({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 22px', border: 'none', borderRadius: 'var(--radius-md)',
        background: active ? 'var(--ir-navy-dark)' : 'transparent',
        color: active ? '#fff' : 'var(--text-secondary)',
        fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 8,
      }}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span style={{
          background: active ? 'rgba(255,255,255,0.25)' : 'var(--ir-red)',
          color: '#fff', borderRadius: 12, padding: '1px 8px', fontSize: '0.72rem', fontWeight: 800,
        }}>
          {count}
        </span>
      )}
    </button>
  );
}

export default function AdminPage() {
  const { authFetch, role, user: currentUser } = useAuth();
  const [tab, setTab]                     = useState('requests');
  const [requests, setRequests]           = useState([]);
  const [users, setUsers]                 = useState([]);
  const [auditLog, setAuditLog]           = useState([]);
  const [loadingAction, setLoadingAction] = useState(null);
  const [message, setMessage]             = useState('');
  const [approveRole, setApproveRole]     = useState({});
  const [showAddModal, setShowAddModal]   = useState(false);

  // New user form state
  const [newUser, setNewUser] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'railway_operator',
    designation: '',
    organization: '',
  });
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserError, setAddUserError]     = useState('');

  if (role !== 'admin') {
    return (
      <div className="page-section">
        <div style={{
          background: 'var(--ir-red-soft)', color: 'var(--ir-red)',
          padding: 24, borderRadius: 'var(--radius-lg)', fontWeight: 600,
        }}>
          Access Denied — This page requires Administrator role.
        </div>
      </div>
    );
  }

  const showMsg = (m) => { setMessage(m); setTimeout(() => setMessage(''), 5000); };

  useEffect(() => {
    if (tab === 'requests') loadRequests();
    if (tab === 'users') loadUsers();
    if (tab === 'audit') loadAudit();
  }, [tab]);

  const loadRequests = async () => {
    try {
      const res = await authFetch(`${API_BASE}/admin/access-requests`);
      if (res.ok) setRequests((await res.json()).requests || []);
    } catch { /* ignore */ }
  };

  const loadUsers = async () => {
    try {
      const res = await authFetch(`${API_BASE}/admin/users`);
      if (res.ok) setUsers((await res.json()).users || []);
    } catch { /* ignore */ }
  };

  const loadAudit = async () => {
    try {
      const res = await authFetch(`${API_BASE}/admin/audit-log?limit=100`);
      if (res.ok) setAuditLog((await res.json()).entries || []);
    } catch { /* ignore */ }
  };

  const approveRequest = async (id, email) => {
    const r = approveRole[id] || 'viewer';
    setLoadingAction(`approve-${id}`);
    try {
      const res = await authFetch(`${API_BASE}/admin/access-requests/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: r }),
      });
      const data = await res.json();
      if (res.ok) {
        showMsg(`✅ Approved ${email}. Temporary password: ${data.temporary_password}`);
        loadRequests();
        loadUsers();
      } else {
        showMsg(`❌ ${data.detail || 'Approval failed'}`);
      }
    } catch (err) {
      showMsg(`❌ ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const rejectRequest = async (id, email) => {
    setLoadingAction(`reject-${id}`);
    try {
      const res = await authFetch(`${API_BASE}/admin/access-requests/${id}/reject`, { method: 'POST' });
      if (res.ok) {
        showMsg(`Request from ${email} rejected.`);
        loadRequests();
      }
    } catch (err) {
      showMsg(`❌ ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const deleteRequest = async (id, email) => {
    if (!window.confirm(`Delete access request from ${email}?`)) return;
    try {
      const res = await authFetch(`${API_BASE}/admin/access-requests/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showMsg(`Access request for ${email} deleted.`);
        loadRequests();
      }
    } catch (err) {
      showMsg(`❌ ${err.message}`);
    }
  };

  const toggleActive = async (userId, email, currentActive) => {
    setLoadingAction(`active-${userId}`);
    try {
      const res = await authFetch(`${API_BASE}/admin/users/${userId}/activate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentActive }),
      });
      if (res.ok) {
        showMsg(`User ${email} ${!currentActive ? 'activated' : 'deactivated'}.`);
        loadUsers();
      }
    } catch (err) {
      showMsg(`❌ ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const changeRole = async (userId, email, newRole) => {
    setLoadingAction(`role-${userId}`);
    try {
      const res = await authFetch(`${API_BASE}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        showMsg(`Role for ${email} updated to ${newRole}.`);
        loadUsers();
      }
    } catch (err) {
      showMsg(`❌ ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const deleteUser = async (userId, email) => {
    if (!window.confirm(`Are you sure you want to permanently remove access for ${email}? This action cannot be undone.`)) {
      return;
    }
    setLoadingAction(`del-${userId}`);
    try {
      const res = await authFetch(`${API_BASE}/admin/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        showMsg(`✅ User account for ${email} permanently deleted.`);
        loadUsers();
      } else {
        showMsg(`❌ ${data.detail || 'Could not delete user'}`);
      }
    } catch (err) {
      showMsg(`❌ ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setAddUserError('');
    if (!newUser.full_name.trim() || !newUser.email.trim() || !newUser.password) {
      setAddUserError('Name, email, and password are required.');
      return;
    }
    if (newUser.password.length < 8) {
      setAddUserError('Password must be at least 8 characters long.');
      return;
    }

    setAddUserLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to create user account.');

      showMsg(`✅ Account created successfully for ${newUser.email}.`);
      setShowAddModal(false);
      setNewUser({
        full_name: '',
        email: '',
        password: '',
        role: 'railway_operator',
        designation: '',
        organization: '',
      });
      loadUsers();
    } catch (err) {
      setAddUserError(err.message);
    } finally {
      setAddUserLoading(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let pwd = '';
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUser((prev) => ({ ...prev, password: pwd }));
  };

  const pending = requests.filter((r) => r.status === 'pending');
  const allRequests = requests;

  const rowStyle = {
    display: 'grid', alignItems: 'center',
    padding: '14px 20px', borderBottom: '1px solid var(--border-light)',
    fontSize: '0.86rem', gap: 14,
  };

  return (
    <div className="page-section">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Shield size={22} color="var(--ir-navy)" /> User Management & Access Control
          </h1>
          <p className="page-subtitle">
            Manage authorized accounts, review access requests, assign roles, and inspect security audit logs.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => { tab === 'requests' ? loadRequests() : tab === 'users' ? loadUsers() : loadAudit(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px',
              border: '1.5px solid var(--border-med)', borderRadius: 'var(--radius-md)',
              background: '#fff', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 600,
              color: 'var(--text-secondary)'
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          {tab === 'users' && (
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px',
                border: 'none', borderRadius: 'var(--radius-md)',
                background: 'var(--ir-navy-dark)', color: '#fff', cursor: 'pointer',
                fontSize: '0.86rem', fontWeight: 700,
              }}
            >
              <UserPlus size={16} /> Add Authorized Account
            </button>
          )}
        </div>
      </div>

      {/* Flash message */}
      {message && (
        <div style={{
          padding: '12px 18px', borderRadius: 'var(--radius-md)', marginBottom: 18,
          background: message.startsWith('✅') ? 'var(--ir-green-soft)' : message.startsWith('❌') ? 'var(--ir-red-soft)' : 'var(--ir-navy-soft)',
          color: message.startsWith('✅') ? 'var(--ir-green)' : message.startsWith('❌') ? 'var(--ir-red)' : 'var(--ir-navy-dark)',
          fontWeight: 600, fontSize: '0.88rem', border: '1px solid currentColor',
        }}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: 'var(--bg-subtle)', padding: 6, borderRadius: 'var(--radius-md)', width: 'fit-content' }}>
        <TabButton label="Pending Requests" active={tab === 'requests'} onClick={() => setTab('requests')} count={pending.length} />
        <TabButton label={`All Authorized Accounts (${users.length})`} active={tab === 'users'} onClick={() => setTab('users')} />
        <TabButton label="Audit Trail" active={tab === 'audit'} onClick={() => setTab('audit')} />
      </div>

      {/* ── Pending Requests ─────────────────────────────────────── */}
      {tab === 'requests' && (
        <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--ir-navy-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Access Requests ({allRequests.length} total, {pending.length} pending review)</span>
          </div>
          {allRequests.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              No access requests have been submitted.
            </div>
          )}
          {allRequests.map((req) => (
            <div key={req.id} style={{ ...rowStyle, gridTemplateColumns: '1.2fr 1.2fr auto auto auto auto' }}>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem' }}>{req.full_name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{req.email}</div>
                <div style={{ color: 'var(--text-light)', fontSize: '0.76rem', marginTop: 2 }}>
                  {req.designation || 'Staff'} {req.organization ? `· ${req.organization}` : ''}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>Purpose:</span> {req.purpose || 'Operations & Safety Monitoring'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Submitted: {new Date(req.requested_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              {/* Status or Role selector */}
              {req.status === 'pending' ? (
                <>
                  <select
                    value={approveRole[req.id] || req.requested_role || 'viewer'}
                    onChange={(e) => setApproveRole((prev) => ({ ...prev, [req.id]: e.target.value }))}
                    style={{ padding: '7px 10px', borderRadius: 8, border: '1.5px solid var(--border-med)', fontSize: '0.82rem', cursor: 'pointer', background: '#fff' }}
                  >
                    {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                  <button
                    onClick={() => approveRequest(req.id, req.email)}
                    disabled={loadingAction === `approve-${req.id}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--ir-green)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}
                  >
                    <UserCheck size={14} /> Approve Access
                  </button>
                  <button
                    onClick={() => rejectRequest(req.id, req.email)}
                    disabled={loadingAction === `reject-${req.id}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--ir-red-soft)', color: 'var(--ir-red)', border: '1.5px solid var(--ir-red)', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}
                  >
                    <UserX size={14} /> Reject
                  </button>
                  <button
                    onClick={() => deleteRequest(req.id, req.email)}
                    title="Dismiss / Delete request"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', padding: 6 }}
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              ) : (
                <>
                  <span style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700,
                    background: req.status === 'approved' ? 'var(--ir-green-soft)' : 'var(--ir-red-soft)',
                    color: req.status === 'approved' ? 'var(--ir-green)' : 'var(--ir-red)',
                    gridColumn: 'span 3',
                  }}>
                    {req.status === 'approved' ? 'Approved' : 'Rejected'} by {req.reviewed_by || 'admin'}
                  </span>
                  <button
                    onClick={() => deleteRequest(req.id, req.email)}
                    title="Delete record"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', padding: 6 }}
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── All Users ─────────────────────────────────────────────── */}
      {tab === 'users' && (
        <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--ir-navy-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Authorized Accounts Directory ({users.length})</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Only accounts listed here with Active status can log in.
            </span>
          </div>
          {users.map((u) => {
            const isSelf = currentUser && currentUser.email === u.email;
            return (
              <div key={u.id} style={{ ...rowStyle, gridTemplateColumns: '1.4fr 1fr auto auto auto auto' }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {u.full_name}
                    {isSelf && (
                      <span style={{ fontSize: '0.7rem', background: 'var(--ir-navy-soft)', color: 'var(--ir-navy-dark)', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                        Current User
                      </span>
                    )}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{u.email}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: 2 }}>
                    {u.designation || 'Staff'} {u.organization ? `· ${u.organization}` : ''}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    Created: {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN') : 'Setup'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: 2 }}>
                    Last Login: {u.last_login ? new Date(u.last_login).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Never'}
                  </div>
                </div>

                <select
                  value={u.role}
                  onChange={(e) => changeRole(u.id, u.email, e.target.value)}
                  disabled={loadingAction === `role-${u.id}`}
                  style={{
                    padding: '7px 10px', borderRadius: 8, border: '1.5px solid var(--border-med)',
                    fontSize: '0.82rem', cursor: 'pointer', color: ROLE_COLORS[u.role] || '#475569',
                    fontWeight: 700, background: '#fff',
                  }}
                >
                  {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>

                <span style={{
                  padding: '4px 12px', borderRadius: 20, fontSize: '0.76rem', fontWeight: 700,
                  background: u.is_active ? 'var(--ir-green-soft)' : 'var(--ir-red-soft)',
                  color: u.is_active ? 'var(--ir-green)' : 'var(--ir-red)',
                  display: 'inline-block', textAlign: 'center', minWidth: 65,
                }}>
                  {u.is_active ? 'Active' : 'Disabled'}
                </span>

                <button
                  onClick={() => toggleActive(u.id, u.email, u.is_active)}
                  disabled={loadingAction === `active-${u.id}` || isSelf}
                  title={isSelf ? 'Cannot deactivate your own logged-in account' : (u.is_active ? 'Disable account' : 'Enable account')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px',
                    border: '1.5px solid var(--border-med)', borderRadius: 8, background: '#fff',
                    cursor: isSelf ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 600,
                    color: isSelf ? 'var(--text-light)' : 'var(--text-secondary)',
                    opacity: isSelf ? 0.5 : 1,
                  }}
                >
                  <Ban size={13} /> {u.is_active ? 'Disable' : 'Enable'}
                </button>

                <button
                  onClick={() => deleteUser(u.id, u.email)}
                  disabled={loadingAction === `del-${u.id}` || isSelf}
                  title={isSelf ? 'Cannot delete your own admin account' : 'Remove user access'}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5, padding: '7px 11px',
                    border: '1.5px solid var(--ir-red-soft)', borderRadius: 8,
                    background: 'var(--ir-red-soft)', color: 'var(--ir-red)',
                    cursor: isSelf ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 700,
                    opacity: isSelf ? 0.4 : 1,
                  }}
                >
                  <Trash2 size={13} /> Remove
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Audit Log ─────────────────────────────────────────────── */}
      {tab === 'audit' && (
        <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--ir-navy-dark)' }}>
            Security Audit Trail (Last 100 actions)
          </div>
          {auditLog.map((entry) => (
            <div key={entry.id} style={{ ...rowStyle, gridTemplateColumns: 'auto 1fr auto auto' }}>
              <Activity size={14} color="var(--text-muted)" />
              <div>
                <span style={{ fontWeight: 700, color: 'var(--text-main)', marginRight: 8 }}>{entry.action.replace(/_/g, ' ')}</span>
                {entry.target && <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>→ {entry.target}</span>}
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{entry.user_email || 'anonymous'}</span>
              <span style={{ color: 'var(--text-light)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                {entry.timestamp ? new Date(entry.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
            </div>
          ))}
          {auditLog.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>No audit entries recorded yet.</div>
          )}
        </div>
      )}

      {/* ── Direct Add User Modal ───────────────────────────────────── */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1100,
          background: 'rgba(10,37,64,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520,
            boxShadow: '0 24px 64px rgba(0,0,0,0.25)', overflow: 'hidden',
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'var(--ir-navy-dark)', color: '#fff',
              padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <UserPlus size={18} /> Add Authorized Account
                </div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
                  Directly provision an approved user with assigned role and credentials.
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateUser} style={{ padding: 24 }}>
              {addUserError && (
                <div style={{
                  display: 'flex', gap: 8, alignItems: 'center', padding: '10px 14px',
                  background: 'var(--ir-red-soft)', color: 'var(--ir-red)', borderRadius: 8,
                  marginBottom: 16, fontSize: '0.84rem', fontWeight: 600,
                }}>
                  <AlertCircle size={15} /> {addUserError}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                    placeholder="e.g. Ramesh Sharma"
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border-med)', borderRadius: 8, fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="user@railway.gov.in"
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border-med)', borderRadius: 8, fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Initial Password * (min 8 characters)
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    style={{ background: 'none', border: 'none', color: 'var(--ir-navy)', cursor: 'pointer', fontSize: '0.74rem', fontWeight: 700 }}
                  >
                    Generate Random
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Set account password"
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border-med)', borderRadius: 8, fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>
                  Assigned Role *
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border-med)', borderRadius: 8, fontSize: '0.88rem', background: '#fff' }}
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>
                    Designation
                  </label>
                  <input
                    type="text"
                    value={newUser.designation}
                    onChange={(e) => setNewUser({ ...newUser, designation: e.target.value })}
                    placeholder="e.g. Senior Track Engineer"
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border-med)', borderRadius: 8, fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>
                    Organization / Division
                  </label>
                  <input
                    type="text"
                    value={newUser.organization}
                    onChange={(e) => setNewUser({ ...newUser, organization: e.target.value })}
                    placeholder="e.g. Northern Railway, Delhi"
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border-med)', borderRadius: 8, fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '9px 18px', background: 'none', border: '1.5px solid var(--border-med)',
                    borderRadius: 8, fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addUserLoading}
                  style={{
                    padding: '9px 22px', background: 'var(--ir-navy-dark)', color: '#fff',
                    border: 'none', borderRadius: 8, fontSize: '0.88rem', fontWeight: 700,
                    cursor: addUserLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {addUserLoading ? 'Provisioning…' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
