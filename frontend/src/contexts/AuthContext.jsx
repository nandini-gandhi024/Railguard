/**
 * RailGuard Authentication Context
 * Provides: user, token, login(), logout(), isAuthenticated, role
 * Stores JWT in localStorage; auto-refreshes before expiry.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('rg_access_token'));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('rg_refresh_token'));
  const [loading, setLoading]         = useState(true);
  const refreshTimerRef               = useRef(null);

  // ── Fetch with timeout (default 5 s) ────────────────────────────
  const fetchWithTimeout = (url, options = {}, timeoutMs = 5000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, { ...options, signal: controller.signal })
      .finally(() => clearTimeout(timer));
  };

  // ── Persist tokens ──────────────────────────────────────────────
  const storeTokens = (access, refresh) => {
    localStorage.setItem('rg_access_token', access);
    localStorage.setItem('rg_refresh_token', refresh);
    setAccessToken(access);
    setRefreshToken(refresh);
  };

  const clearTokens = () => {
    localStorage.removeItem('rg_access_token');
    localStorage.removeItem('rg_refresh_token');
    setAccessToken(null);
    setRefreshToken(null);
  };

  // ── Schedule silent refresh 2 min before access token expires ──
  const scheduleRefresh = useCallback((refresh) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    // ACCESS_TOKEN_EXPIRE_MINUTES=15, refresh at 13 min
    const delay = (15 - 2) * 60 * 1000;
    refreshTimerRef.current = setTimeout(() => doRefresh(refresh), delay);
  }, []);

  const doRefresh = async (refresh) => {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refresh }),
      });
      if (res.ok) {
        const data = await res.json();
        storeTokens(data.access_token, data.refresh_token);
        setUser(data.user);
        scheduleRefresh(data.refresh_token);
      } else {
        // Refresh failed — session expired
        clearTokens();
        setUser(null);
      }
    } catch {
      // Network error or timeout — just clear and let login page show
      clearTokens();
      setUser(null);
    }
  };

  // ── Restore session on mount ─────────────────────────────────────
  useEffect(() => {
    const restore = async () => {
      const storedAccess  = localStorage.getItem('rg_access_token');
      const storedRefresh = localStorage.getItem('rg_refresh_token');

      if (storedAccess) {
        try {
          const res = await fetchWithTimeout(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${storedAccess}` },
          });
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
            if (storedRefresh) scheduleRefresh(storedRefresh);
          } else if (storedRefresh) {
            // Token expired — try silent refresh (also has its own timeout)
            await doRefresh(storedRefresh);
          } else {
            clearTokens();
          }
        } catch {
          // Backend unreachable / timed out — clear stale tokens, show login
          clearTokens();
        }
      }

      // Always unblock the UI — login page will show if not authenticated
      setLoading(false);
    };

    restore();
    return () => { if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current); };
  }, []);

  // ── Login ────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Login failed.');
    }
    storeTokens(data.access_token, data.refresh_token);
    setUser(data.user);
    scheduleRefresh(data.refresh_token);
    return data.user;
  };

  // ── Logout ───────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    const storedAccess  = localStorage.getItem('rg_access_token');
    const storedRefresh = localStorage.getItem('rg_refresh_token');
    if (storedAccess && storedRefresh) {
      try {
        await fetchWithTimeout(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${storedAccess}`,
          },
          body: JSON.stringify({ refresh_token: storedRefresh }),
        });
      } catch { /* best-effort */ }
    }
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    clearTokens();
    setUser(null);
  }, []);

  // ── Authenticated fetch helper ───────────────────────────────────
  const authFetch = useCallback(async (url, options = {}) => {
    const stored = localStorage.getItem('rg_access_token');
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(stored ? { Authorization: `Bearer ${stored}` } : {}),
      },
    });
    if (res.status === 401) {
      logout();
    }
    return res;
  }, [logout]);

  const value = {
    user,
    accessToken,
    isAuthenticated: !!user,
    role: user?.role || null,
    login,
    logout,
    authFetch,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
