/**
 * RailGuard Access Request Modal
 * Public form — collects details, submits to POST /auth/request-access
 */
import React, { useState } from 'react';
import { X, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const ROLES = [
  { value: 'viewer', label: 'Viewer — Read-only access' },
  { value: 'maintenance_engineer', label: 'Maintenance Engineer — View & plan maintenance' },
  { value: 'railway_operator', label: 'Railway Operator — Full operational access' },
];

export default function AccessRequestModal({ onClose }) {
  const [form, setForm] = useState({
    full_name: '', email: '', designation: '',
    organization: '', purpose: '', requested_role: 'viewer',
  });
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.full_name.trim() || !form.email.trim()) {
      setError('Full name and email are required.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/request-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Submission failed.');
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 13px',
    border: '1.5px solid var(--border-med)', borderRadius: 'var(--radius-md)',
    fontSize: '0.88rem', fontFamily: 'var(--font-sans)',
    color: 'var(--text-main)', background: '#fff', outline: 'none',
  };

  const labelStyle = {
    display: 'block', fontSize: '0.78rem', fontWeight: 600,
    color: 'var(--text-secondary)', marginBottom: 6,
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(10,37,64,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520,
        maxHeight: '90vh', overflow: 'auto',
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
      }}>
        {/* Header */}
        <div style={{
          background: 'var(--ir-navy-dark)', color: '#fff',
          padding: '22px 28px', borderRadius: '16px 16px 0 0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>Request Access</div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>
              Complete the form below. An administrator will review your request.
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.7)', padding: 4,
          }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '28px' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <CheckCircle size={52} style={{ color: 'var(--ir-green)', marginBottom: 16 }} />
              <h3 style={{ fontWeight: 800, color: 'var(--ir-navy-dark)', marginBottom: 10 }}>
                Request Submitted
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.7, fontWeight: 500 }}>
                Access request submitted for administrator approval.
              </p>
              <button
                onClick={onClose}
                style={{
                  marginTop: 24, padding: '10px 28px',
                  background: 'var(--ir-navy-dark)', color: '#fff',
                  border: 'none', borderRadius: 'var(--radius-md)',
                  fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
                }}
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input style={inputStyle} value={form.full_name} onChange={set('full_name')}
                    placeholder="Your full name" required />
                </div>
                <div>
                  <label style={labelStyle}>Email Address *</label>
                  <input style={inputStyle} type="email" value={form.email} onChange={set('email')}
                    placeholder="you@organization.in" required />
                </div>
                <div>
                  <label style={labelStyle}>Designation</label>
                  <input style={inputStyle} value={form.designation} onChange={set('designation')}
                    placeholder="e.g. Track Inspector" />
                </div>
                <div>
                  <label style={labelStyle}>Organization / Division</label>
                  <input style={inputStyle} value={form.organization} onChange={set('organization')}
                    placeholder="e.g. Northern Railway" />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Requested Access Level</label>
                <select
                  style={{ ...inputStyle, background: '#fff' }}
                  value={form.requested_role}
                  onChange={set('requested_role')}
                >
                  {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 22 }}>
                <label style={labelStyle}>Purpose / Reason for Access</label>
                <textarea
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                  value={form.purpose}
                  onChange={set('purpose')}
                  placeholder="Briefly describe why you need access to RailGuard…"
                />
              </div>

              {error && (
                <div style={{
                  display: 'flex', gap: 9, alignItems: 'center',
                  background: 'var(--ir-red-soft)', color: 'var(--ir-red)',
                  borderRadius: 'var(--radius-sm)', padding: '10px 14px',
                  marginBottom: 18, fontSize: '0.84rem',
                }}>
                  <AlertCircle size={15} /> {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={onClose} style={{
                  padding: '10px 20px', background: 'none',
                  border: '1.5px solid var(--border-med)', borderRadius: 'var(--radius-md)',
                  fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem',
                  color: 'var(--text-secondary)',
                }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} style={{
                  padding: '10px 22px',
                  background: 'var(--ir-navy-dark)', color: '#fff',
                  border: 'none', borderRadius: 'var(--radius-md)',
                  fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '0.88rem',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  {loading ? <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} />}
                  {loading ? 'Submitting…' : 'Submit Request'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
