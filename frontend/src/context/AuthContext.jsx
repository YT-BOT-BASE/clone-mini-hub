import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { setToken, getToken, setOnUnauthorized } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    if (!getToken()) { setLoading(false); return; }
    try {
      const res = await api.get('/api/auth/me');
      setUser(res.data.user);
    } catch {
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => {
      setUser(null);
      setToken(null);
    });
    loadMe();
  }, [loadMe]);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    setToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/api/auth/register', { name, email, password });
    setToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    try { await api.post('/api/auth/logout'); } catch {}
    setToken(null);
    setUser(null);
  };

  const googleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, googleLogin, refreshUser: loadMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
