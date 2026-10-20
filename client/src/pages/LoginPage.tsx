import React, { useState, useEffect } from 'react';
import { PrepPilotLogo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Shield,
  GraduationCap,
  KeyRound,
  UserPlus,
  X,
  CheckCircle2,
  Key,
  AlertTriangle,
  Sparkles,
  Lightbulb
} from 'lucide-react';

interface LoginPageProps {
  onSuccess: (role?: string) => void;
  onGoToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onGoToRegister }) => {
  const { login, registerDean } = useAuth();
  const [loginMode, setLoginMode] = useState<'student' | 'admin' | 'dean'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [showDeanRegisterModal, setShowDeanRegisterModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Dean Register State
  const [deanName, setDeanName] = useState('');
  const [deanEmail, setDeanEmail] = useState('');
  const [deanPassword, setDeanPassword] = useState('');
  const [deanPasscode, setDeanPasscode] = useState('');
  const [deanDepartment, setDeanDepartment] = useState('Academic & Placement Governance');
  const [deanDesignation, setDeanDesignation] = useState('Dean');
  const [deanRegisterError, setDeanRegisterError] = useState('');
  const [deanRegisterLoading, setDeanRegisterLoading] = useState(false);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [generatedPin, setGeneratedPin] = useState('');
  const [inputPin, setInputPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Pop-up Notification State for Login Mistakes
  const [notification, setNotification] = useState<{
    id: string;
    title: string;
    message: string;
    hint?: string;
    field?: 'email' | 'password' | 'credentials' | 'general';
    timestamp: number;
  } | null>(null);
  const [notifProgress, setNotifProgress] = useState<number>(100);
  const [shakeCard, setShakeCard] = useState<boolean>(false);

  // Auto-dismiss countdown timer for Pop-up Notification
  useEffect(() => {
    if (!notification) return;

    setNotifProgress(100);
    const duration = 30000; // 30 seconds auto-dismiss
    const intervalTime = 100;
    const decrement = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setNotifProgress(prev => {
        if (prev <= decrement) {
          clearInterval(timer);
          setNotification(null);
          return 0;
        }
        return prev - decrement;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [notification]);

  const triggerNotification = (notif: {
    title: string;
    message: string;
    hint?: string;
    field?: 'email' | 'password' | 'credentials' | 'general';
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

  const handleModeSwitch = (mode: 'student' | 'admin' | 'dean') => {
    setLoginMode(mode);
    setError('');
    setSuccessMsg('');
    dismissNotification();
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanEmail = email.trim();

    // 1. Mistake Check: Empty Email
    if (!cleanEmail) {
      setError('Please provide your registered email address.');
      triggerNotification({
        title: 'Missing Email Address',
        message: 'Email field is empty. Please enter your registered college or demo email address.',
        hint: 'Use student@preppilot.ai or click "Fill Demo" to populate student credentials.',
        field: 'email'
      });
      return;
    }

    // 2. Mistake Check: Malformed Email Address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError(`"${cleanEmail}" is not a valid email format.`);
      triggerNotification({
        title: 'Invalid Email Format',
        message: `"${cleanEmail}" is missing "@" or a valid domain extension.`,
        hint: 'Expected format: yourname@domain.com (e.g. student@preppilot.ai).',
        field: 'email'
      });
      return;
    }

    // 3. Mistake Check: Empty Password
    if (!password) {
      setError('Please enter your account password.');
      triggerNotification({
        title: 'Password Required',
        message: 'Password field cannot be empty. Please enter your account password.',
        hint: 'Passwords are case-sensitive. Verify CAPS LOCK is turned off.',
        field: 'password'
      });
      return;
    }

    setLoading(true);
    const res = await login({ email: cleanEmail, password });
    setLoading(false);

    if (res.success) {
      dismissNotification();
      const resolvedRole = res.user?.role || (loginMode === 'admin' ? 'ADMIN' : loginMode === 'dean' ? 'DEAN' : 'STUDENT');
      onSuccess(resolvedRole);
    } else {
      const errorMsg = res.message || 'Invalid email or password credentials.';
      setError(errorMsg);

      let title = 'Authentication Mistake';
      let hint = 'Check for typos in your password or click "Use Demo Account" to auto-fill valid credentials.';

      if (errorMsg.toLowerCase().includes('suspend') || errorMsg.toLowerCase().includes('block')) {
        title = 'Account Suspended';
        hint = 'Please contact your placement cell coordinator or college administrator.';
      } else if (errorMsg.toLowerCase().includes('offline') || errorMsg.toLowerCase().includes('unreachable') || errorMsg.toLowerCase().includes('network')) {
        title = 'Server Connection Error';
        hint = 'Backend server on port 5000 is unreachable. Ensure the dev server is active.';
      }

      triggerNotification({
        title,
        message: errorMsg,
        hint,
        field: 'credentials'
      });
    }
  };

  const handleQuickAdminLogin = async () => {
    setError('');
    setSuccessMsg('');
    dismissNotification();
    setLoading(true);
    const res = await login({ email: 'admin@preppilot.ai', password: 'admin123' });
    setLoading(false);
    if (res.success) {
      onSuccess('ADMIN');
    } else {
      const errorMsg = res.message || 'Administrator login failed.';
      setError(errorMsg);
      triggerNotification({
        title: 'Administrator Sign-In Failed',
        message: errorMsg,
        hint: 'Verify administrator demo credentials in SQLite database.',
        field: 'credentials'
      });
    }
  };

  const handleQuickDeanLogin = async () => {
    setError('');
    setSuccessMsg('');
    dismissNotification();
    setLoading(true);
    let res = await login({ email: 'dean@college.edu', password: 'DeanPass123' });
    if (!res.success) {
      res = await login({ email: 'admin@college.edu', password: 'AdminPass123' });
    }
    setLoading(false);
    if (res.success) {
      onSuccess('DEAN');
    } else {
      const errorMsg = res.message || 'Dean login failed.';
      setError(errorMsg);
      triggerNotification({
        title: 'Dean Sign-In Failed',
        message: errorMsg,
        hint: 'Check Dean demo accounts or register with your institutional passcode.',
        field: 'credentials'
      });
    }
  };

  const handleDeanRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeanRegisterError('');
    setDeanRegisterLoading(true);

    try {
      const res = await registerDean({
        name: deanName.trim(),
        email: deanEmail.trim(),
        password: deanPassword,
        passcode: deanPasscode.trim(),
        department: deanDepartment.trim(),
        designation: 'Dean'
      });

      if (res.success) {
        setShowDeanRegisterModal(false);
        onSuccess('DEAN');
      } else {
        const errorMsg = res.message || 'Failed to register Dean account.';
        setDeanRegisterError(errorMsg);
        triggerNotification({
          title: 'Dean Registration Mistake',
          message: errorMsg,
          hint: 'Verify the institutional passcode or try a different college email.',
          field: 'credentials'
        });
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Network error during Dean registration.';
      setDeanRegisterError(errorMsg);
      triggerNotification({
        title: 'Registration Error',
        message: errorMsg,
        hint: 'Please check your connection and try again.',
        field: 'credentials'
      });
    } finally {
      setDeanRegisterLoading(false);
    }
  };

  // Step 1: Request PIN for Forgot Password
  const handleRequestResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);

    try {
      const res = await api.forgotPassword(forgotEmail.trim());
      if (res.success) {
        setForgotStep(2);
      } else {
        const errorMsg = res.message || 'Failed to verify email address.';
        setForgotError(errorMsg);
        triggerNotification({
          title: 'Password Reset Mistake',
          message: errorMsg,
          hint: 'Verify that this email address is already registered in the platform.',
          field: 'email'
        });
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Network error requesting reset PIN.';
      setForgotError(errorMsg);
      triggerNotification({
        title: 'Reset Request Failed',
        message: errorMsg,
        hint: 'Ensure backend server is running and accessible.',
        field: 'email'
      });
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2: Reset Password with PIN
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);

    try {
      const res = await api.resetPassword({
        email: forgotEmail,
        verification_pin: inputPin,
        new_password: newPassword
      });

      if (res.success) {
        setShowForgotModal(false);
        setEmail(forgotEmail);
        setPassword(newPassword);
        setSuccessMsg('Password has been successfully updated! You can now sign in.');
      } else {
        const errorMsg = res.message || 'Failed to reset password.';
        setForgotError(errorMsg);
        triggerNotification({
          title: 'Password Reset Mistake',
          message: errorMsg,
          hint: 'Verify the 6-digit PIN and ensure the new password is at least 6 characters.',
          field: 'password'
        });
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Network error resetting password.';
      setForgotError(errorMsg);
      triggerNotification({
        title: 'Reset Error',
        message: errorMsg,
        hint: 'Check your network connection and retry.',
        field: 'password'
      });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Centered Login Mistake Pop-up Notification Modal (Direct Focal Sight) */}
      {notification && (
        <div className="fixed top-6 sm:top-10 left-1/2 -translate-x-1/2 z-[999999] w-[94%] sm:w-[520px] pointer-events-none">
          <div
            role="alert"
            aria-live="assertive"
            id="login-mistake-toast-popup"
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
                      Login Mistake
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
                  <button
                    type="button"
                    onClick={() => {
                      if (loginMode === 'student') {
                        setEmail('student@preppilot.ai');
                        setPassword('password123');
                      } else if (loginMode === 'admin') {
                        setEmail('admin@preppilot.ai');
                        setPassword('admin123');
                      } else {
                        setEmail('dean@college.edu');
                        setPassword('DeanPass123');
                      }
                      dismissNotification();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles size={13} />
                    <span>Fill Demo Account</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmail('');
                      setPassword('');
                      const el = document.getElementById('login-email-input');
                      if (el) el.focus();
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

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 z-10">
        <div className="flex justify-center">
          <PrepPilotLogo size="md" />
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-white">
          {loginMode === 'admin' ? 'Placement Cell Administration' : 'Sign In to Your PrepPilot Dashboard'}
        </h2>
        <p className="text-xs text-slate-400">
          {loginMode === 'admin'
            ? 'Platform Management • Student Directory • Question Bank CRUD • User Access Control'
            : loginMode === 'dean'
            ? 'Academic Oversight • Student Performance Analytics • Assessment Reports • Verified CSV'
            : 'Prepare Smarter. Practice Better. Get Placement Ready.'}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className={`bg-slate-900/90 border border-slate-800 py-7 px-6 shadow-2xl rounded-2xl sm:px-9 backdrop-blur-xl space-y-5 transition-all ${
          shakeCard ? 'animate-notification-shake ring-2 ring-rose-500/50' : ''
        }`}>
          {/* 3-Role Switcher Tabs */}
          <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => handleModeSwitch('student')}
              className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                loginMode === 'student'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap size={14} />
              <span>Student</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeSwitch('admin')}
              className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                loginMode === 'admin'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield size={14} />
              <span>Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeSwitch('dean')}
              className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                loginMode === 'dean'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-700 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck size={14} />
              <span>Dean</span>
            </button>
          </div>

          {/* Role Dedicated Banner */}
          {loginMode === 'admin' ? (
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <Shield size={16} />
                  <span>Platform Administrator Mode</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  Full Authority
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Platform administration: manage student accounts, question bank CRUD, platform analytics, and user access control.
              </p>
              <div className="grid grid-cols-1 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleQuickAdminLogin}
                  disabled={loading}
                  className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-2 shadow-md shadow-amber-600/20 transition-all cursor-pointer"
                >
                  <KeyRound size={14} />
                  <span>Instant 1-Click Sign In (Administrator)</span>
                </button>
              </div>
            </div>
          ) : loginMode === 'dean' ? (
            <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                  <ShieldCheck size={16} />
                  <span>Dean Mode</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                  Academic Analytics
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Academic analytics: student cohort performance, assessment completion outcomes, subject mastery, and verified reporting.
              </p>
              <div className="grid grid-cols-1 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleQuickDeanLogin}
                  disabled={loading}
                  className="w-full py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-2 shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
                >
                  <KeyRound size={14} />
                  <span>Instant 1-Click Sign In (Dean)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowDeanRegisterModal(true)}
                  className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-cyan-500/30 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <UserPlus size={14} />
                  <span>Register as Dean (Invitation Required)</span>
                </button>
              </div>
            </div>
          ) : (
            /* Student Quick Fill Bar */
            <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-indigo-300 block">Candidate Demo Account:</span>
                <span className="text-[10px] text-slate-400 block truncate">student@preppilot.ai</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail('student@preppilot.ai');
                  setPassword('password123');
                  dismissNotification();
                }}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 text-xs font-bold border border-indigo-500/30 flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
              >
                <UserCheck size={13} />
                <span>Fill Demo</span>
              </button>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Dual In-Card Mistake Alert Banner */}
          {notification ? (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border-2 border-rose-500/60 shadow-lg shadow-rose-950/40 space-y-2 animate-in fade-in">
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
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-rose-400" />
              <div className="leading-relaxed">{error}</div>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate autoComplete="off">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  {loginMode === 'admin' ? 'Administrator Email' : loginMode === 'dean' ? 'Dean Email' : 'Candidate Email'}
                </label>
                <div className="flex items-center gap-2">
                  {notification?.field === 'email' && (
                    <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                      <AlertCircle size={11} /> Check Email
                    </span>
                  )}
                  {(email || password) && (
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('');
                        setPassword('');
                        dismissNotification();
                      }}
                      className="text-[10px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <div className="relative rounded-xl shadow-sm">
                <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${
                  notification?.field === 'email' ? 'text-rose-400' : 'text-slate-500'
                }`}>
                  <Mail size={16} />
                </div>
                <input
                  id="login-email-input"
                  type="email"
                  value={email}
                  autoComplete="off"
                  data-lpignore="true"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={loginMode === 'admin' ? 'admin@preppilot.ai' : loginMode === 'dean' ? 'dean@college.edu' : 'student@preppilot.ai'}
                  className={`block w-full pl-10 pr-3 py-2.5 bg-slate-950 border rounded-xl text-xs text-slate-200 placeholder-slate-500 outline-none transition-all ${
                    notification?.field === 'email'
                      ? 'border-rose-500 ring-2 ring-rose-500/40 bg-rose-950/20 text-rose-200'
                      : 'border-slate-800 focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Password
                </label>
                <div className="flex items-center gap-3">
                  {(notification?.field === 'password' || notification?.field === 'credentials') && (
                    <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                      <AlertCircle size={11} /> Check Password
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setShowForgotModal(true);
                    }}
                    className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>
              <div className="relative rounded-xl shadow-sm">
                <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${
                  notification?.field === 'password' || notification?.field === 'credentials' ? 'text-rose-400' : 'text-slate-500'
                }`}>
                  <Lock size={16} />
                </div>
                <input
                  id="login-password-input"
                  type="password"
                  value={password}
                  autoComplete="new-password"
                  data-lpignore="true"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`block w-full pl-10 pr-3 py-2.5 bg-slate-950 border rounded-xl text-xs text-slate-200 placeholder-slate-500 outline-none transition-all ${
                    notification?.field === 'password' || notification?.field === 'credentials'
                      ? 'border-rose-500 ring-2 ring-rose-500/40 bg-rose-950/20 text-rose-200'
                      : 'border-slate-800 focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 py-3 px-4 rounded-xl text-white text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer ${
                loginMode === 'admin'
                  ? 'bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-500 hover:to-amber-700 shadow-amber-600/30'
                  : loginMode === 'dean'
                  ? 'bg-gradient-to-r from-cyan-600 via-cyan-700 to-blue-800 hover:from-cyan-500 hover:to-blue-700 shadow-cyan-600/30'
                  : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-500 hover:to-indigo-600 shadow-indigo-600/30'
              }`}
            >
              <span>{loading ? 'Verifying Credentials...' : loginMode === 'admin' ? 'Sign In as Administrator' : loginMode === 'dean' ? 'Sign In as Dean' : 'Sign In as Candidate'}</span>
              <ArrowRight size={15} />
            </button>
          </form>

          {loginMode === 'student' ? (
            <div className="pt-4 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-400">
                New B.Tech student?{' '}
                <button
                  type="button"
                  onClick={onGoToRegister}
                  className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  Create student profile
                </button>
              </p>
            </div>
          ) : loginMode === 'dean' ? (
            <div className="pt-4 border-t border-slate-800 text-center space-y-1.5">
              <p className="text-[11px] text-slate-400">
                Need to create a Dean account?{' '}
                <button
                  type="button"
                  onClick={() => setShowDeanRegisterModal(true)}
                  className="font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer"
                >
                  Register with Invitation Token
                </button>
              </p>
              <p className="text-[10px] text-slate-500">
                PrepPilot AI Academic Portal • Dean & Academic Governance
              </p>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-800 text-center space-y-1.5">
              <p className="text-[10px] text-slate-500">
                PrepPilot AI Platform Governance • Authorized Platform Administrators Only
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: REGISTER NEW DEAN                                                */}
      {/* ========================================================================= */}
      {showDeanRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl relative">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-cyan-400" />
                  <h3 className="text-lg font-bold text-white">Register Dean</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Create an authorized Dean account for academic analytics and student performance oversight.
                </p>
              </div>
              <button
                onClick={() => setShowDeanRegisterModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {deanRegisterError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{deanRegisterError}</span>
              </div>
            )}

            <form onSubmit={handleDeanRegister} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Full Name with Title</label>
                <input
                  type="text"
                  required
                  value={deanName}
                  onChange={(e) => setDeanName(e.target.value)}
                  placeholder="e.g. Dr. Sunita Deshmukh"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Institutional Email</label>
                <input
                  type="email"
                  required
                  value={deanEmail}
                  onChange={(e) => setDeanEmail(e.target.value)}
                  placeholder="e.g. dean@college.edu"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={deanDepartment}
                    onChange={(e) => setDeanDepartment(e.target.value)}
                    placeholder="Academic & Placement Governance"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    value={deanDesignation}
                    onChange={(e) => setDeanDesignation(e.target.value)}
                    placeholder="Dean"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Create Password</label>
                <input
                  type="password"
                  required
                  value={deanPassword}
                  onChange={(e) => setDeanPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>

              {/* Authorization Token */}
              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                    <Key size={13} />
                    <span>Administrator Authorization Invitation Token</span>
                  </label>
                  <span className="text-[10px] text-cyan-400 font-mono font-bold bg-cyan-500/20 px-2 py-0.5 rounded">
                    Token Required
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={deanPasscode}
                  onChange={(e) => setDeanPasscode(e.target.value)}
                  placeholder="Enter Invitation Token (e.g. inv-...)"
                  className="w-full p-2.5 bg-slate-950 border border-cyan-500/40 rounded-xl text-xs font-mono text-cyan-300 outline-none"
                />
                <p className="text-[10px] text-slate-400">
                  Required to prevent unauthorized registrations. Contact your Campus Administrator for an authorized invitation token.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeanRegisterModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deanRegisterLoading}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-extrabold flex items-center gap-2 cursor-pointer"
                >
                  <span>{deanRegisterLoading ? 'Activating...' : 'Register & Sign In as Dean'}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: FORGOT PASSWORD RECOVERY (Student & Dean)                        */}
      {/* ========================================================================= */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl relative">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <KeyRound size={20} className="text-cyan-400" />
                  <h3 className="text-lg font-bold text-white">Reset Account Password</h3>
                </div>
                <p className="text-xs text-slate-400">
                  {forgotStep === 1
                    ? 'Enter your registered email to generate a reset PIN.'
                    : 'Enter the verification PIN and your new password.'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotStep(1);
                  setForgotError('');
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {forgotError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotStep === 1 ? (
              /* Step 1: Request PIN */
              <form onSubmit={handleRequestResetPin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Registered Account Email</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="student@preppilot.ai or admin@preppilot.ai"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <span>{forgotLoading ? 'Verifying...' : 'Generate Reset PIN'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2: Enter PIN and New Password */
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-cyan-300 block">Verification Code Dispatched</span>
                    <span className="text-[10px] text-slate-400 block">
                      Enter the 6-digit PIN issued for {forgotEmail}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
                    15 Min Expiry
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Enter 6-Digit PIN</label>
                  <input
                    type="text"
                    required
                    value={inputPin}
                    onChange={(e) => setInputPin(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">New Password (Min 8 characters, letters & numbers)</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <span>{forgotLoading ? 'Updating...' : 'Set New Password'}</span>
                    <CheckCircle2 size={14} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
