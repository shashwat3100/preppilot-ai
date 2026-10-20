import React, { useState, useEffect } from 'react';
import { PrepPilotLogo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import type { Branch, Company, JobRole } from '../types';
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Check,
  AlertTriangle,
  Sparkles,
  Lightbulb,
  X,
  CheckCircle2
} from 'lucide-react';

interface RegisterPageProps {
  onSuccess: () => void;
  onGoToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSuccess, onGoToLogin }) => {
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [branchId, setBranchId] = useState('branch-cse');
  const [year, setYear] = useState('4th Year');
  const [graduationYear, setGraduationYear] = useState('2026');
  const [jobRoleId, setJobRoleId] = useState('role-sde');
  const [targetCompanies, setTargetCompanies] = useState<string[]>(['comp-tcs', 'comp-infosys']);
  const [skillLevel, setSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [areasOfInterest, setAreasOfInterest] = useState<string[]>(['DBMS', 'DSA', 'Operating Systems']);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pop-up Notification State for Registration Mistakes
  const [notification, setNotification] = useState<{
    id: string;
    title: string;
    message: string;
    hint?: string;
    field?: 'name' | 'email' | 'password' | 'general';
    actionType?: 'login' | 'fix-email' | 'retry';
    timestamp: number;
  } | null>(null);
  const [notifProgress, setNotifProgress] = useState<number>(100);
  const [shakeCard, setShakeCard] = useState<boolean>(false);

  // Auto-dismiss countdown timer for Pop-up Notification (60 seconds)
  useEffect(() => {
    if (!notification) return;

    const duration = 60000;
    const startTime = Date.now();
    setNotifProgress(100);

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setNotifProgress(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        setNotification(null);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [notification?.id]);

  const triggerNotification = (notif: {
    title: string;
    message: string;
    hint?: string;
    field?: 'name' | 'email' | 'password' | 'general';
    actionType?: 'login' | 'fix-email' | 'retry';
  }) => {
    setNotification({
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: Date.now()
    });
    setShakeCard(true);
    setTimeout(() => setShakeCard(false), 500);
  };

  const dismissNotification = () => {
    setNotification(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bRes, cRes, rRes] = await Promise.all([
          api.getBranches(),
          api.getCompanies(),
          api.getJobRoles()
        ]);
        if (bRes.success) setBranches(bRes.branches);
        if (cRes.success) setCompanies(cRes.companies);
        if (rRes.success) setJobRoles(rRes.roles);
      } catch (err) {
        console.error('Error loading registration metadata:', err);
      }
    };
    fetchData();
  }, []);

  const toggleCompany = (companyId: string) => {
    setTargetCompanies(prev =>
      prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  const toggleInterest = (interest: string) => {
    setAreasOfInterest(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e?: React.FormEvent | React.SyntheticEvent) => {
    if (e) e.preventDefault();
    setError('');

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    // 1. Mistake Check: Empty Name
    if (!cleanName) {
      setError('Please provide your full candidate name.');
      triggerNotification({
        title: 'Missing Full Name',
        message: 'Name field cannot be empty. Please enter your first and last name.',
        hint: 'Example: Aditya Sharma or Priya Patel.',
        field: 'name'
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 2. Mistake Check: Empty Email
    if (!cleanEmail) {
      setError('Please provide your email address.');
      triggerNotification({
        title: 'Missing Email Address',
        message: 'Email field is empty. Please enter your college or personal email address.',
        hint: 'Use a standard email format such as student@college.edu or name@gmail.com.',
        field: 'email'
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 3. Mistake Check: Malformed Email (Like "dwwwwwww")
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError(`"${cleanEmail}" is not a valid email address.`);
      triggerNotification({
        title: 'Invalid Email Format',
        message: `"${cleanEmail}" is missing "@" or a valid domain extension.`,
        hint: 'Valid email format: yourname@domain.com (e.g. aditya@college.edu or name@gmail.com).',
        field: 'email',
        actionType: 'fix-email'
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 4. Mistake Check: Empty Password
    if (!password) {
      setError('Please create a secure password.');
      triggerNotification({
        title: 'Password Required',
        message: 'Password field cannot be empty. Please create a password for your account.',
        hint: 'Must be at least 8 characters long with both letters and numbers.',
        field: 'password'
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 5. Mistake Check: Weak Password Length & Composition
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      triggerNotification({
        title: 'Password Too Short',
        message: `Your password is only ${password.length} characters. Minimum 8 characters required.`,
        hint: 'Add more characters to ensure account security (e.g. Pass2026).',
        field: 'password'
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError('Password must contain both letters and numbers.');
      triggerNotification({
        title: 'Password Complexity Requirement',
        message: 'Password must include at least one letter (a-z) and at least one number (0-9).',
        hint: 'Try combining a word and year, for example: Placement2026.',
        field: 'password'
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const selectedCompanies = targetCompanies.length > 0 ? targetCompanies : ['comp-tcs', 'comp-infosys'];

    setLoading(true);

    const res = await register({
      name: cleanName,
      email: cleanEmail,
      password,
      branch_id: branchId || 'branch-cse',
      year: year || '4th Year',
      graduation_year: parseInt(graduationYear) || 2026,
      preferred_job_role_id: jobRoleId || 'role-sde',
      target_companies: selectedCompanies,
      skill_level: skillLevel,
      areas_of_interest: areasOfInterest.length > 0 ? areasOfInterest : ['DSA', 'DBMS']
    });

    setLoading(false);

    if (res.success) {
      dismissNotification();
      onSuccess();
    } else {
      const errorMsg = res.message || 'Registration failed.';
      setError(errorMsg);

      let title = 'Registration Failed';
      let hint = 'Please review your profile details and try again.';
      let actionType: 'login' | 'retry' | undefined = 'retry';

      if (errorMsg.toLowerCase().includes('already') || errorMsg.toLowerCase().includes('exists') || errorMsg.toLowerCase().includes('duplicate') || errorMsg.toLowerCase().includes('registered')) {
        title = 'Account Already Exists';
        hint = `An account for ${cleanEmail} is already registered. Please sign in instead.`;
        actionType = 'login';
      }

      triggerNotification({
        title,
        message: errorMsg,
        hint,
        field: errorMsg.toLowerCase().includes('email') ? 'email' : 'general',
        actionType
      });
    }
  };

  const availableInterests = [
    'DSA', 'DBMS', 'Operating Systems', 'Computer Networks', 'OOP', 'SQL',
    'System Design', 'Web Dev', 'Digital Electronics', 'Microprocessors',
    'Thermodynamics', 'Quantitative Aptitude'
  ];

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Centered Profile Creation Mistake Pop-up Notification Modal (Direct Focal Sight) */}
      {notification && (
        <div className="fixed top-6 sm:top-10 left-1/2 -translate-x-1/2 z-[999999] w-[94%] sm:w-[520px] pointer-events-none">
          <div
            role="alert"
            aria-live="assertive"
            id="register-mistake-toast-popup"
            className="pointer-events-auto bg-slate-900/98 backdrop-blur-2xl border-2 border-rose-500 shadow-[0_25px_80px_rgba(244,63,94,0.55)] ring-4 ring-rose-500/25 rounded-2xl p-4 sm:p-5 animate-notification-shake transition-all text-left"
          >
            <div className="flex items-start gap-3.5">
              {/* Animated glowing Icon */}
              <div className="w-11 h-11 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-400 flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/30 relative">
                <AlertTriangle size={22} className="animate-pulse" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-ping" />
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      Profile Mistake
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-white">
                      {notification.title}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={dismissNotification}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Dismiss pop-up notification"
                  >
                    <X size={16} />
                  </button>
                </div>

                <p className="text-xs sm:text-[13px] text-rose-100 leading-relaxed font-medium">
                  {notification.message}
                </p>

                {notification.hint && (
                  <div className="mt-2 pt-2 border-t border-rose-500/20 flex items-start gap-2 text-xs text-amber-300/95">
                    <Lightbulb size={14} className="shrink-0 mt-0.5 text-amber-400" />
                    <span className="leading-snug">{notification.hint}</span>
                  </div>
                )}

                {/* Quick action buttons right inside the pop-up */}
                <div className="pt-2.5 flex items-center gap-2 flex-wrap">
                  {notification.actionType === 'login' ? (
                    <button
                      type="button"
                      onClick={onGoToLogin}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <ArrowRight size={13} />
                      <span>Go to Sign In</span>
                    </button>
                  ) : notification.field === 'email' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('student@college.edu');
                        dismissNotification();
                        const el = document.getElementById('register-email-input');
                        if (el) el.focus();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles size={13} />
                      <span>Use Example Email</span>
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => {
                      if (notification.field === 'email') setEmail('');
                      if (notification.field === 'password') setPassword('');
                      if (notification.field === 'name') setName('');
                      dismissNotification();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Clear & Retry
                  </button>

                  <button
                    type="button"
                    onClick={dismissNotification}
                    className="ml-auto px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-medium transition-all cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>

            {/* Countdown progress bar */}
            <div className="mt-3.5 w-full bg-slate-800/80 rounded-full h-1 overflow-hidden">
              <div
                className="bg-gradient-to-r from-rose-500 to-amber-500 h-full transition-all duration-75"
                style={{ width: `${notifProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-2xl mx-auto space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <PrepPilotLogo size="md" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Create Your B.Tech Placement Profile
          </h2>
          <p className="text-xs text-slate-400">
            Personalizing interview preparation, recommendation algorithms and daily adaptive quizzes
          </p>
        </div>

        <div className={`bg-slate-900/90 border border-slate-800 p-4 sm:p-8 rounded-2xl shadow-2xl backdrop-blur-xl transition-all ${
          shakeCard ? 'animate-notification-shake ring-2 ring-rose-500/50' : ''
        }`}>
          {/* Dual In-Card Mistake Alert Banner */}
          {notification ? (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/70 border-2 border-rose-500/60 shadow-lg shadow-rose-950/40 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                  <AlertTriangle size={15} className="text-rose-400 shrink-0" />
                  <span>{notification.title}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Check Input
                </span>
              </div>
              <p className="text-[11px] text-rose-200/90 leading-relaxed font-medium">
                {notification.message}
              </p>
              {notification.hint && (
                <div className="flex items-start gap-1.5 text-[11px] text-amber-300/90 pt-1.5 border-t border-rose-500/20">
                  <Lightbulb size={13} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>{notification.hint}</span>
                </div>
              )}
            </div>
          ) : error ? (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-rose-400" />
              <div className="leading-relaxed">{error}</div>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate autoComplete="off">
            {/* Section 1: Core Credentials */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                1. Account Credentials
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">Full Name</label>
                    {notification?.field === 'name' && (
                      <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                        <AlertCircle size={11} /> Check Name
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${
                      notification?.field === 'name' ? 'text-rose-400' : 'text-slate-500'
                    }`}>
                      <User size={15} />
                    </div>
                    <input
                      id="register-name-input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSubmit(e);
                        }
                      }}
                      placeholder="e.g. Aditya Sharma"
                      className={`w-full pl-10 pr-3 py-2 bg-slate-950 border rounded-xl text-xs text-slate-200 outline-none transition-all ${
                        notification?.field === 'name'
                          ? 'border-rose-500 ring-2 ring-rose-500/40 bg-rose-950/20 text-rose-200'
                          : 'border-slate-800 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">Email Address</label>
                    {notification?.field === 'email' && (
                      <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                        <AlertCircle size={11} /> Check Email
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${
                      notification?.field === 'email' ? 'text-rose-400' : 'text-slate-500'
                    }`}>
                      <Mail size={15} />
                    </div>
                    <input
                      id="register-email-input"
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSubmit(e);
                        }
                      }}
                      placeholder="aditya@college.edu"
                      className={`w-full pl-10 pr-3 py-2 bg-slate-950 border rounded-xl text-xs text-slate-200 outline-none transition-all ${
                        notification?.field === 'email'
                          ? 'border-rose-500 ring-2 ring-rose-500/40 bg-rose-950/20 text-rose-200'
                          : 'border-slate-800 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">Password</label>
                  {notification?.field === 'password' && (
                    <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                      <AlertCircle size={11} /> Check Password
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${
                    notification?.field === 'password' ? 'text-rose-400' : 'text-slate-500'
                  }`}>
                    <Lock size={15} />
                  </div>
                  <input
                    id="register-password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    placeholder="Create a secure password (min 8 chars, letters & numbers)"
                    className={`w-full pl-10 pr-3 py-2 bg-slate-950 border rounded-xl text-xs text-slate-200 outline-none transition-all ${
                      notification?.field === 'password'
                        ? 'border-rose-500 ring-2 ring-rose-500/40 bg-rose-950/20 text-rose-200'
                        : 'border-slate-800 focus:border-indigo-500'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Academic Details */}
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                2. Academic & Branch Profile
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">B.Tech Branch</label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-indigo-500 outline-none"
                  >
                    {branches.length > 0 ? (
                      branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))
                    ) : (
                      <option value="branch-cse">Computer Science Engineering (CSE)</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Year of Study</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-indigo-500 outline-none"
                  >
                    <option value="4th Year">4th Year (Final Year)</option>
                    <option value="3rd Year">3rd Year (Pre-Final)</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="1st Year">1st Year</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Graduation Year</label>
                  <select
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-indigo-500 outline-none"
                  >
                    <option value="2026">2026 Batch</option>
                    <option value="2025">2025 Batch</option>
                    <option value="2027">2027 Batch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Job Role</label>
                  <select
                    value={jobRoleId}
                    onChange={(e) => setJobRoleId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-indigo-500 outline-none"
                  >
                    {jobRoles.length > 0 ? (
                      jobRoles.map(r => (
                        <option key={r.id} value={r.id}>{r.title}</option>
                      ))
                    ) : (
                      <option value="role-sde">Software Development Engineer (SDE)</option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Target Companies */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  3. Target Companies (Select 1 or more)
                </h3>
                <span className="text-[11px] text-cyan-400">{targetCompanies.length} selected</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(companies.length > 0 ? companies : [
                  { id: 'comp-tcs', name: 'TCS' },
                  { id: 'comp-infosys', name: 'Infosys' },
                  { id: 'comp-wipro', name: 'Wipro' },
                  { id: 'comp-accenture', name: 'Accenture' }
                ]).map(c => {
                  const selected = targetCompanies.includes(c.id);
                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => toggleCompany(c.id)}
                      className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center justify-between transition-all cursor-pointer ${
                        selected
                          ? 'bg-indigo-600/20 border-cyan-400 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span>{c.name}</span>
                      {selected && <Check size={14} className="text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 4: Skill Level & Areas of Interest */}
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                4. Skill Level & Interests
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Self-Assessed Skill Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Beginner', 'Intermediate', 'Advanced'] as const).map(lvl => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setSkillLevel(lvl)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        skillLevel === lvl
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Areas of Interest</label>
                <div className="flex flex-wrap gap-1.5">
                  {availableInterests.map(item => {
                    const sel = areasOfInterest.includes(item);
                    return (
                      <button
                        type="button"
                        key={item}
                        onClick={() => toggleInterest(item)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          sel
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-sm font-bold shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              <span>{loading ? 'Creating Your Profile...' : 'Complete Registration & Start Preparing'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <button
                onClick={onGoToLogin}
                className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
