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
  isOfflineMode: boolean;
}

const DEMO_FALLBACK_USERS: Record<string, { pass: string; user: User }> = {
  'student@careerprep.ai': {
    pass: 'password123',
    user: {
      id: 'user-student-demo',
      name: 'Aditya Sharma',
      email: 'student@careerprep.ai',
      role: 'STUDENT',
      branch_id: 'branch-it',
      branch_name: 'Information Technology (IT)',
      year: '4th Year',
      graduation_year: 2026,
      preferred_job_role_id: 'role-sde',
      target_companies: ['comp-tcs', 'comp-infosys', 'comp-amazon'],
      skill_level: 'Intermediate',
      areas_of_interest: ['DBMS', 'DSA', 'Operating Systems', 'System Design'],
      total_xp: 420,
      current_level: 3,
      current_streak: 5,
      longest_streak: 9
    }
  },
  'student@college.edu': {
    pass: 'Password123',
    user: {
      id: 'user-student-college',
      name: 'Student Candidate',
      email: 'student@college.edu',
      role: 'STUDENT',
      branch_id: 'branch-cse',
      branch_name: 'Computer Science Engineering (CSE)',
      year: '4th Year',
      graduation_year: 2026,
      preferred_job_role_id: 'role-sde',
      target_companies: ['comp-tcs', 'comp-infosys', 'comp-amazon'],
      skill_level: 'Intermediate',
      areas_of_interest: ['DBMS', 'DSA', 'Operating Systems'],
      total_xp: 420,
      current_level: 3,
      current_streak: 5,
      longest_streak: 9
    }
  },
  'admin@careerprep.ai': {
    pass: 'admin123',
    user: {
      id: 'user-admin-demo',
      name: 'Dr. Ramesh Kulkarni (Placement Dean)',
      email: 'admin@careerprep.ai',
      role: 'ADMIN',
      branch_id: 'branch-cse',
      branch_name: 'Computer Science Engineering (CSE)',
      year: 'Faculty / Admin',
      graduation_year: 2020,
      preferred_job_role_id: 'role-sde',
      target_companies: ['comp-tcs', 'comp-infosys', 'comp-wipro', 'comp-accenture'],
      skill_level: 'Advanced',
      areas_of_interest: ['Campus Placement Drives', 'Assessment Evaluation', 'Curriculum Mapping'],
      total_xp: 2500,
      current_level: 10,
      current_streak: 30,
      longest_streak: 45
    }
  },
  'admin@college.edu': {
    pass: 'AdminPass123',
    user: {
      id: 'user-admin-college',
      name: 'Dean of Placements',
      email: 'admin@college.edu',
      role: 'ADMIN',
      branch_id: 'branch-cse',
      branch_name: 'Computer Science Engineering (CSE)',
      year: 'Faculty / Admin',
      graduation_year: 2018,
      preferred_job_role_id: 'role-sde',
      target_companies: ['comp-tcs', 'comp-infosys'],
      skill_level: 'Advanced',
      areas_of_interest: ['Campus Placement Drives'],
      total_xp: 2500,
      current_level: 10,
      current_streak: 30,
      longest_streak: 45
    }
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('careerprep_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('careerprep_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  const refreshUser = async () => {
    try {
      const storedToken = localStorage.getItem('careerprep_token');
      const storedUser = localStorage.getItem('careerprep_user');

      if (!storedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      // If token is an offline session token, restore local user directly
      if (storedToken.startsWith('offline_session_') && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setIsOfflineMode(true);
        } catch {}
        setLoading(false);
        return;
      }

      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('careerprep_user', JSON.stringify(res.user));
        setIsOfflineMode(false);
      } else if (res.isNetworkError) {
        // Backend temporarily unreachable (e.g. running via Live Server without backend daemon)
        // Keep user logged in from local cache!
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
            setIsOfflineMode(true);
          } catch {}
        }
      } else if (res.message && (res.message.includes('401') || res.message.toLowerCase().includes('token') || res.message.toLowerCase().includes('unauthorized'))) {
        localStorage.removeItem('careerprep_token');
        localStorage.removeItem('careerprep_user');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.warn('[Auth Refresh] Retaining cached session due to network disconnect:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: any) => {
    const cleanEmail = (credentials.email || '').trim().toLowerCase();

    try {
      const res = await api.login(credentials);

      if (res.success && res.token) {
        localStorage.setItem('careerprep_token', res.token);
        if (res.user) {
          localStorage.setItem('careerprep_user', JSON.stringify(res.user));
        }
        setToken(res.token);
        setUser(res.user);
        setIsOfflineMode(false);
        return { success: true, user: res.user, message: res.message };
      }

      // If login failed due to network disconnect or port 5000 offline:
      if (res.isNetworkError || !res.message || res.message.includes('unreachable') || res.message.includes('Failed to fetch')) {
        const fallback = DEMO_FALLBACK_USERS[cleanEmail];
        if (fallback && fallback.pass === credentials.password) {
          const fallbackToken = 'offline_session_' + Date.now();
          localStorage.setItem('careerprep_token', fallbackToken);
          localStorage.setItem('careerprep_user', JSON.stringify(fallback.user));
          setToken(fallbackToken);
          setUser(fallback.user);
          setIsOfflineMode(true);
          return {
            success: true,
            user: fallback.user,
            message: 'Authenticated in Resilient Standalone Mode.'
          };
        }
        return {
          success: false,
          message: 'Backend server on port 5000 is offline. Please launch "npm run dev:server" or use 1-Click Demo Fill to log in.'
        };
      }

      return { success: false, message: res.message || res.error || 'Login failed. Please verify credentials.' };
    } catch (err: any) {
      // Direct network rejection fallback
      const fallback = DEMO_FALLBACK_USERS[cleanEmail];
      if (fallback && fallback.pass === credentials.password) {
        const fallbackToken = 'offline_session_' + Date.now();
        localStorage.setItem('careerprep_token', fallbackToken);
        localStorage.setItem('careerprep_user', JSON.stringify(fallback.user));
        setToken(fallbackToken);
        setUser(fallback.user);
        setIsOfflineMode(true);
        return {
          success: true,
          user: fallback.user,
          message: 'Authenticated in Resilient Standalone Mode.'
        };
      }
      return { success: false, message: err?.message || 'Network error during login' };
    }
  };

  const register = async (data: any) => {
    try {
      const res = await api.register(data);
      if (res.success && res.token) {
        localStorage.setItem('careerprep_token', res.token);
        if (res.user) {
          localStorage.setItem('careerprep_user', JSON.stringify(res.user));
        }
        setToken(res.token);
        setUser(res.user);
        setIsOfflineMode(false);
        return { success: true, user: res.user, message: res.message };
      }
      return { success: false, message: res.message || res.error || 'Registration failed' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error during registration' };
    }
  };

  const registerDean = async (data: any) => {
    try {
      const res = await api.registerDean(data);
      if (res.success && res.token) {
        localStorage.setItem('careerprep_token', res.token);
        if (res.user) {
          localStorage.setItem('careerprep_user', JSON.stringify(res.user));
        }
        setToken(res.token);
        setUser(res.user);
        setIsOfflineMode(false);
        return { success: true, user: res.user, message: res.message };
      }
      return { success: false, message: res.message || res.error || 'Dean registration failed' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error during dean registration' };
    }
  };

  const logout = () => {
    localStorage.removeItem('careerprep_token');
    localStorage.removeItem('careerprep_user');
    setToken(null);
    setUser(null);
    setIsOfflineMode(false);
    if (typeof window !== 'undefined') {
      window.location.hash = '#/login';
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, registerDean, logout, refreshUser, isAdmin, isOfflineMode }}>
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
