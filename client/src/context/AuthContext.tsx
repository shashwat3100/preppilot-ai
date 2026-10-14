import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: any) => Promise<{ success: boolean; message?: string; user?: User }>;
  register: (data: any) => Promise<{ success: boolean; message?: string; user?: User }>;
  registerDean: (data: any) => Promise<{ success: boolean; message?: string; user?: User }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('careerprep_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const storedToken = localStorage.getItem('careerprep_token');
      if (!storedToken) {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      } else if (res.message && (res.message.includes('401') || res.message.toLowerCase().includes('token') || res.message.toLowerCase().includes('unauthorized'))) {
        localStorage.removeItem('careerprep_token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('[Auth Refresh Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: any) => {
    try {
      const res = await api.login(credentials);
      if (res.success && res.token) {
        localStorage.setItem('careerprep_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true, user: res.user, message: res.message };
      }
      return { success: false, message: res.message || res.error || 'Login failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error during login' };
    }
  };

  const register = async (data: any) => {
    try {
      const res = await api.register(data);
      if (res.success && res.token) {
        localStorage.setItem('careerprep_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true, user: res.user, message: res.message };
      }
      return { success: false, message: res.message || res.error || 'Registration failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error during registration' };
    }
  };

  const registerDean = async (data: any) => {
    try {
      const res = await api.registerDean(data);
      if (res.success && res.token) {
        localStorage.setItem('careerprep_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true, user: res.user, message: res.message };
      }
      return { success: false, message: res.message || res.error || 'Dean registration failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error during dean registration' };
    }
  };

  const logout = () => {
    localStorage.removeItem('careerprep_token');
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.hash = '#/login';
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, registerDean, logout, refreshUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
