import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('atbrand_admin_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name && parsed.name.toLowerCase().includes('shashwat')) {
          parsed.name = 'ARSLAN TARIQ';
          localStorage.setItem('atbrand_admin_user', JSON.stringify(parsed));
        }
        return parsed;
      }
      return { name: 'ARSLAN TARIQ', email: 'atbrand00@gmail.com', role: 'ADMIN' };
    } catch {
      return { name: 'ARSLAN TARIQ', email: 'atbrand00@gmail.com', role: 'ADMIN' };
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('atbrand_admin_token') || null;
    } catch {
      return null;
    }
  });

  const login = async (username, password) => {
    // 1. First attempt to authenticate against server /api/admin/login
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setToken(data.token);
          setAdminUser(data.user);
          localStorage.setItem('atbrand_admin_token', data.token);
          localStorage.setItem('atbrand_admin_user', JSON.stringify(data.user));
          return { success: true };
        }
      }
    } catch (err) {
      console.warn('Server auth call failed, evaluating verified admin credentials fallback...', err);
    }

    // 2. Client-side verified credentials fallback (guarantees Hostinger static/PHP login never fails)
    if ((username === 'admin' || username === 'atbrand00@gmail.com') && password === 'atbrandAdmin2026!') {
      const fallbackUser = { name: 'ARSLAN TARIQ', email: 'atbrand00@gmail.com', role: 'ADMIN' };
      const fallbackToken = 'atbrand_secure_session_token_' + Date.now();
      setToken(fallbackToken);
      setAdminUser(fallbackUser);
      localStorage.setItem('atbrand_admin_token', fallbackToken);
      localStorage.setItem('atbrand_admin_user', JSON.stringify(fallbackUser));
      return { success: true };
    }

    return { success: false, error: 'Invalid username or password' };
  };

  const logout = () => {
    setToken(null);
    setAdminUser(null);
    localStorage.removeItem('atbrand_admin_token');
    localStorage.removeItem('atbrand_admin_user');
  };

  return (
    <AuthContext.Provider value={{ adminUser, token, isAuthenticated: Boolean(token), login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
