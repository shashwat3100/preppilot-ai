import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  GraduationCap,
  Building2,
  Briefcase,
  Flame,
  Zap,
  Award,
  CheckCircle2,
  ShieldCheck,
  Rocket,
  Sun,
  Moon,
  Monitor,
  Palette,
  Shield,
  FileSpreadsheet,
  HelpCircle,
  Users,
  BarChart2,
  BookOpen
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, isAdmin, isDean } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();

  const achievementsList = [
    { title: 'First Flight', desc: 'Complete your first practice quiz on CareerPrep AI.', icon: Rocket, unlocked: true },
    { title: 'Consistent Flyer', desc: 'Maintain an uninterrupted 3-day study streak.', icon: Flame, unlocked: true },
    { title: 'Week Warrior', desc: 'Keep a 7-day placement preparation streak alive.', icon: Award, unlocked: (user?.current_streak || 0) >= 7 },
    { title: 'Normalization Ninja', desc: 'Score above 80% accuracy in Database Normalization.', icon: CheckCircle2, unlocked: true },
    { title: 'PrepPilot Navigator', desc: 'Ask PrepPilot 5 technical viva questions using Voice Assistant.', icon: Zap, unlocked: true },
    { title: 'TCS NQT Ready', desc: 'Complete 3 company pattern quizzes with >= 75% accuracy.', icon: Building2, unlocked: false }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Header Profile Card */}
      <div className="p-8 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-extrabold text-white shadow-xl flex-shrink-0 ${
          isAdmin
            ? 'bg-amber-600 border-2 border-amber-400 shadow-amber-600/30'
            : isDean
            ? 'bg-cyan-600 border-2 border-cyan-400 shadow-cyan-600/30'
            : 'bg-indigo-600 border-2 border-indigo-400 shadow-indigo-600/30'
        }`}>
          {user?.role === 'DEAN' ? 'D' : user?.name?.charAt(0) || 'U'}
        </div>

        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">
              {user?.role === 'DEAN' ? 'Dean' : user?.name}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
              isAdmin
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : isDean
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
            }`}>
              {isAdmin ? 'Administrator' : isDean ? 'Dean' : 'Student'}
            </span>
          </div>

          <p className="text-xs text-[var(--text-secondary)]">
            {user?.email} • {
              isAdmin
                ? 'Platform Operations & System Governance'
                : isDean
                ? 'Academic Oversight & Placement Analytics'
                : (user?.branch_name || 'Information Technology (IT)')
            }
          </p>

          {/* Role-specific details */}
          {isAdmin ? (
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs">
              <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <Shield size={15} className="text-amber-500" />
                Platform Governance & Content Authoring
              </span>
              <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <CheckCircle2 size={15} className="text-emerald-500" />
                Active Administrative Authority
              </span>
            </div>
          ) : isDean ? (
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs">
              <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <GraduationCap size={15} className="text-cyan-400" />
                Academic Oversight & Institutional Analytics
              </span>
              <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <CheckCircle2 size={15} className="text-emerald-500" />
                Verified Institutional Dean Authority
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs">
              <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <GraduationCap size={15} className="text-indigo-400" />
                {user?.year || '4th Year'} (Batch {user?.graduation_year || 2026})
              </span>
              <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <Briefcase size={15} className="text-cyan-500 dark:text-cyan-400" />
                {user?.job_role_title || 'Software Development Engineer (SDE)'}
              </span>
              <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <ShieldCheck size={15} className="text-emerald-500 dark:text-emerald-400" />
                {user?.skill_level || 'Intermediate'} Level
              </span>
            </div>
          )}
        </div>

        {/* Stats Badges — Distinct for Admin, Dean, and Students */}
        <div className="flex sm:flex-col gap-2 flex-shrink-0">
          {isAdmin ? (
            <>
              <div className="px-4 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-center min-w-[120px]">
                <span className="text-xs text-[var(--text-secondary)] block">Role</span>
                <span className="text-sm font-bold text-amber-500 dark:text-amber-400">Admin</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-center min-w-[120px]">
                <span className="text-xs text-[var(--text-secondary)] block">Access</span>
                <span className="text-sm font-bold text-emerald-500 dark:text-emerald-400">Full Governance</span>
              </div>
            </>
          ) : isDean ? (
            <>
              <div className="px-4 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-center min-w-[120px]">
                <span className="text-xs text-[var(--text-secondary)] block">Role</span>
                <span className="text-sm font-bold text-cyan-500 dark:text-cyan-400">Dean</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-center min-w-[120px]">
                <span className="text-xs text-[var(--text-secondary)] block">Scope</span>
                <span className="text-sm font-bold text-indigo-400">Academic Analytics</span>
              </div>
            </>
          ) : (
            <>
              <div className="px-4 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-center">
                <span className="text-xs text-[var(--text-secondary)] block">Total XP</span>
                <span className="text-lg font-bold text-amber-500 dark:text-amber-400">{user?.total_xp || 0} XP</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-center">
                <span className="text-xs text-[var(--text-secondary)] block">Streak</span>
                <span className="text-lg font-bold text-orange-500 dark:text-orange-400">{user?.current_streak || 0} Days</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Settings -> Appearance (Theme Mode) */}
      <div className="p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Palette size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Settings — Appearance & Theme</h3>
              <p className="text-xs text-[var(--text-secondary)]">Select your preferred application display mode. Persists across all sessions.</p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--surface-elevated)] border border-[var(--surface-border)] font-semibold text-[var(--text-secondary)]">
            Active: {theme.charAt(0).toUpperCase() + theme.slice(1)} ({resolvedTheme})
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Dark Mode Option */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-indigo-600/15 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                : 'bg-[var(--surface-elevated)] border-[var(--surface-border)] hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Moon size={18} className={theme === 'dark' ? 'text-indigo-400' : 'text-[var(--text-secondary)]'} />
              {theme === 'dark' && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500 text-white">Active</span>}
            </div>
            <div className="font-bold text-sm text-[var(--text-primary)]">Dark Mode</div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">
              Deep navy (#080D1B) with cyan accents. Default for PrepPilot AI.
            </div>
          </button>

          {/* Light Mode Option */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-indigo-600/15 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                : 'bg-[var(--surface-elevated)] border-[var(--surface-border)] hover:border-slate-400'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Sun size={18} className={theme === 'light' ? 'text-indigo-400' : 'text-[var(--text-secondary)]'} />
              {theme === 'light' && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500 text-white">Active</span>}
            </div>
            <div className="font-bold text-sm text-[var(--text-primary)]">Light Mode</div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">
              Clean white (#FFFFFF) with high-contrast slate text and purple actions.
            </div>
          </button>

          {/* System Mode Option */}
          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              theme === 'system'
                ? 'bg-indigo-600/15 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                : 'bg-[var(--surface-elevated)] border-[var(--surface-border)] hover:border-slate-500'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Monitor size={18} className={theme === 'system' ? 'text-indigo-400' : 'text-[var(--text-secondary)]'} />
              {theme === 'system' && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500 text-white">Active</span>}
            </div>
            <div className="font-bold text-sm text-[var(--text-primary)]">System Mode</div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">
              Automatically syncs with your operating system's light/dark setting.
            </div>
          </button>
        </div>
      </div>

      {/* Role-Specific Overview Section */}
      {isAdmin ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Shield size={16} className="text-amber-500" />
              <span>Administrative Responsibilities</span>
            </h3>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                <span>Question Bank authoring and full lifecycle CRUD management</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                <span>Student candidate oversight, progress dossiers, and account status</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                <span>Timed assessment catalog configuration and grading policies</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                <span>Single-use administrative invitations and faculty access governance</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Users size={16} className="text-indigo-400" />
              <span>Platform Governance Scope</span>
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              As a platform administrator, you maintain system-wide governance authority across question banks, candidate status, assessment configurations, and security policies. Student practice gamification (streaks, XP) does not apply to administrative accounts.
            </p>
          </div>
        </div>
      ) : isDean ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <BarChart2 size={16} className="text-cyan-400" />
              <span>Academic Oversight Responsibilities</span>
            </h3>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                <span>Real-time candidate performance tracking by branch and batch</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                <span>Engineering curriculum mastery and weak topic gap identification</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                <span>Assessment drive pass rates and recruiter benchmark monitoring</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                <span>Audited institutional academic reporting with verified CSV exports</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <BookOpen size={16} className="text-indigo-400" />
              <span>Academic Governance Scope</span>
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              As Dean, you hold institutional oversight over academic preparation outcomes, curriculum alignment, and placement screening analytics. Administrative actions (question modification, account blocking) are reserved for platform administrators. Student gamification does not apply to institutional Dean accounts.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Target Companies & Interests (Students Only) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Building2 size={16} className="text-indigo-400" />
                <span>Target Recruitment Drives</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {(user?.target_companies || ['TCS', 'Infosys', 'Amazon']).map((c, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-xs font-semibold text-cyan-500 dark:text-cyan-300">
                    {c.replace('comp-', '').toUpperCase()}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <CheckCircle2 size={16} className="text-cyan-500 dark:text-cyan-400" />
                <span>Placement Focus Areas</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {(user?.areas_of_interest || ['DBMS', 'DSA', 'Operating Systems', 'System Design']).map((item, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-xs font-semibold text-[var(--text-secondary)]">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Gamification Achievements Grid (Students Only) */}
          <div className="p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Award size={18} className="text-amber-500 dark:text-amber-400" />
                <span>Earned Achievements & Badges</span>
              </h3>
              <span className="text-xs text-[var(--text-secondary)]">
                {achievementsList.filter(a => a.unlocked).length} of {achievementsList.length} unlocked
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {achievementsList.map((ach, idx) => {
                const Icon = ach.icon;
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
                      ach.unlocked
                        ? 'bg-[var(--surface-elevated)] border-amber-500/30 text-[var(--text-primary)]'
                        : 'bg-[var(--surface-elevated)]/40 border-[var(--surface-border)] text-[var(--text-muted)] opacity-60'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${ach.unlocked ? 'bg-amber-500/10 text-amber-500 dark:text-amber-400' : 'bg-[var(--surface-card)] text-[var(--text-muted)]'}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                        <span>{ach.title}</span>
                        {ach.unlocked && <span className="text-[10px] text-amber-500 dark:text-amber-400">★</span>}
                      </h4>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">{ach.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage;
