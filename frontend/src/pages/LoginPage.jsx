/**
 * RailGuard Login Page
 * Professional navy + white government-portal style
 */
import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Train, Lock, Mail, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AccessRequestModal from './AccessRequestModal';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [showRequest, setShowRequest] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: 'var(--font-sans)',
      background: 'var(--bg-content)',
    }}>
      {/* ── Left panel — navy branding ─────────────────────────── */}
      <div style={{
        width: '42%',
        background: 'linear-gradient(160deg, var(--ir-navy-darkest) 0%, var(--ir-navy-dark) 60%, var(--ir-navy) 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 52px',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }} className="login-left-panel">
        {/* Subtle rail pattern overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 60px)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 36 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={26} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
                RailGuard
              </div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Railway Asset Management
              </div>
            </div>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.3, marginBottom: 18 }}>
            Railway Asset<br />Management Platform
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 340 }}>
            AI-powered track risk assessment, predictive maintenance planning, and real-time asset monitoring for Indian Railways operations.
          </p>
        </div>

        {/* Feature list */}
        <div style={{ position: 'relative' }}>
          {[
            ['AI Fault Detection', 'Automated visual defect identification'],
            ['Risk Prediction', 'Track risk scoring with 14-day degradation forecast'],
            ['Maintenance Planning', 'Optimal block scheduling with zero disruption'],
            ['GIS Track Map', 'Real-time corridor asset mapping and monitoring'],
          ].map(([title, desc]) => (
            <div key={title} style={{
              display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 22,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--ir-green-light)', marginTop: 6, flexShrink: 0,
              }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{title}</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer notice */}
        <div style={{
          position: 'relative',
          borderTop: '1px solid rgba(255,255,255,0.12)',
          paddingTop: 20,
          fontSize: '0.72rem',
          color: 'rgba(255,255,255,0.4)',
          lineHeight: 1.6,
        }}>
          Decision-support system for authorized railway maintenance personnel.
        </div>
      </div>

      {/* ── Right panel — login form ──────────────────────────────── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'var(--ir-navy-soft)', color: 'var(--ir-navy-dark)',
              borderRadius: 20, padding: '5px 14px',
              fontSize: '0.75rem', fontWeight: 700,
              letterSpacing: '0.05em', textTransform: 'uppercase',
              marginBottom: 16,
            }}>
              <Lock size={12} />
              Authorized Personnel Only
            </div>
            <h2 style={{
              fontSize: '1.75rem', fontWeight: 800,
              color: 'var(--ir-navy-dark)', marginBottom: 8,
            }}>
              Sign In
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Use your organization credentials to access RailGuard.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block', fontSize: '0.8rem', fontWeight: 600,
                color: 'var(--text-secondary)', marginBottom: 7,
              }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{
                  position: 'absolute', left: 14, top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-muted)',
                }} />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@organization.in"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '11px 14px 11px 42px',
                    border: `1.5px solid ${error ? 'var(--ir-red)' : 'var(--border-med)'}`,
                    borderRadius: 'var(--radius-md)', fontSize: '0.92rem',
                    fontFamily: 'var(--font-sans)', background: '#fff',
                    color: 'var(--text-main)', outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--ir-navy)'}
                  onBlur={(e) => e.target.style.borderColor = error ? 'var(--ir-red)' : 'var(--border-med)'}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 28 }}>
              <label style={{
                display: 'block', fontSize: '0.8rem', fontWeight: 600,
                color: 'var(--text-secondary)', marginBottom: 7,
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{
                  position: 'absolute', left: 14, top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-muted)',
                }} />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '11px 44px 11px 42px',
                    border: `1.5px solid ${error ? 'var(--ir-red)' : 'var(--border-med)'}`,
                    borderRadius: 'var(--radius-md)', fontSize: '0.92rem',
                    fontFamily: 'var(--font-sans)', background: '#fff',
                    color: 'var(--text-main)', outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--ir-navy)'}
                  onBlur={(e) => e.target.style.borderColor = error ? 'var(--ir-red)' : 'var(--border-med)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: 4,
                  }}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--ir-red-soft)', color: 'var(--ir-red)',
                borderRadius: 'var(--radius-sm)', padding: '10px 14px',
                marginBottom: 20, fontSize: '0.85rem', fontWeight: 500,
              }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading ? 'var(--ir-navy-mid)' : 'var(--ir-navy-dark)',
                color: '#fff', border: 'none', borderRadius: 'var(--radius-md)',
                fontSize: '0.95rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: 'background 0.15s',
                boxShadow: '0 2px 8px rgba(10,37,64,0.25)',
              }}
              onMouseEnter={(e) => { if (!loading) e.target.style.background = 'var(--ir-navy)'; }}
              onMouseLeave={(e) => { if (!loading) e.target.style.background = 'var(--ir-navy-dark)'; }}
            >
              {loading && <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />}
              {loading ? 'Signing In…' : 'Sign In'}
            </button>
          </form>

          {/* Request Access divider */}
          <div style={{
            marginTop: 32, paddingTop: 24,
            borderTop: '1px solid var(--border-light)',
            textAlign: 'center',
          }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 12 }}>
              Don't have an account?
            </p>
            <button
              id="request-access-btn"
              onClick={() => setShowRequest(true)}
              style={{
                background: 'none', border: '1.5px solid var(--border-med)',
                borderRadius: 'var(--radius-md)', padding: '10px 24px',
                fontSize: '0.88rem', fontWeight: 600,
                color: 'var(--ir-navy-dark)', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = 'var(--ir-navy)';
                e.target.style.background = 'var(--ir-navy-soft)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'var(--border-med)';
                e.target.style.background = 'none';
              }}
            >
              Request Access
            </button>
            <p style={{ color: 'var(--text-light)', fontSize: '0.77rem', marginTop: 10 }}>
              Requests are reviewed and approved by a system administrator.
            </p>
          </div>
        </div>
      </div>

      {/* Access Request Modal */}
      {showRequest && <AccessRequestModal onClose={() => setShowRequest(false)} />}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .login-left-panel { display: none !important; } }
      `}</style>
    </div>
  );
}
