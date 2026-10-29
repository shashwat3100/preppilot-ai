import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import type { DashboardStats, Question } from '../types';
import PrepPilotCard from '../components/PrepPilotCard';
import {
  Flame,
  Zap,
  Target,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Brain,
  Sliders,
  Building2,
  ChevronRight,
  Info,
  Megaphone,
  Calendar,
  Code2,
  ArrowRight,
  BookOpen,
  Award,
  HelpCircle,
  X,
  Sparkles,
  Play,
  Briefcase,
  Layers,
  Clock,
  Compass,
  Calculator,
  RotateCcw
} from 'lucide-react';

interface DashboardPageProps {
  onStartAdaptiveQuiz: () => void;
  onStartCustomQuiz: () => void;
  onStartAssessment?: () => void;
  onExploreCompanies: () => void;
  onViewAnalytics: () => void;
  onNavigateToCoding?: () => void;
  onNavigateToAptitude?: () => void;
  onNavigateToMistakes?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onStartAdaptiveQuiz,
  onStartCustomQuiz,
  onStartAssessment,
  onExploreCompanies,
  onViewAnalytics,
  onNavigateToCoding,
  onNavigateToAptitude,
  onNavigateToMistakes
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestionModal, setSelectedQuestionModal] = useState<Question | null>(null);
  const [showReadinessExplainer, setShowReadinessExplainer] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [res, annRes] = await Promise.all([
          api.getDashboardStats(),
          api.getAnnouncements()
        ]);
        if (res.success && res.stats) {
          setStats(res.stats);
        }
        if (annRes.success && annRes.announcements) {
          setAnnouncements(annRes.announcements);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[var(--text-secondary)]">Assembling your personalized placement command center...</span>
        </div>
      </div>
    );
  }

  const isNewStudent = (stats?.total_questions_attempted || 0) === 0;
  const prepScore = stats?.preparation_score !== undefined ? stats.preparation_score : 0;
  const companyNameMap: Record<string, string> = {
    'comp-tcs': 'TCS',
    'comp-infosys': 'Infosys',
    'comp-wipro': 'Wipro',
    'comp-accenture': 'Accenture',
    'comp-capgemini': 'Capgemini',
    'comp-cognizant': 'Cognizant',
    'comp-deloitte': 'Deloitte',
    'comp-amazon': 'Amazon',
    'comp-microsoft': 'Microsoft',
    'comp-google': 'Google'
  };

  const targetCompanies = user?.target_companies && user.target_companies.length > 0
    ? user.target_companies.map(c => companyNameMap[c] || c.replace(/^comp-/, '').toUpperCase()).join(', ')
    : 'TCS, Infosys, Amazon, Accenture';
  const targetRole = user?.job_role_title || 'Software Development Engineer (SDE)';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-150">
      {/* Active Campus Placement Drive Announcements */}
      {announcements.length > 0 && (
        <div className="space-y-3">
          {announcements.slice(0, 2).map((a) => (
            <div
              key={a.id}
              className="p-4 rounded-2xl bg-[var(--surface-card)] border border-amber-500/30 flex items-start sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex-shrink-0 mt-0.5 sm:mt-0">
                  <Megaphone size={18} />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-300 uppercase tracking-wider">
                      Placement Cell Alert: {a.category}
                    </span>
                    {a.company_name && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-[var(--surface-elevated)] text-[var(--text-primary)] font-semibold border border-[var(--surface-border)]">
                        {a.company_name}
                      </span>
                    )}
                    {a.deadline && (
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                        <Calendar size={11} /> {a.deadline}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate">{a.title}</h4>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-1">{a.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/40 via-[var(--surface-card)] to-[var(--surface-card)] border border-[var(--surface-border)] p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                {user?.branch_code || 'B.Tech IT'} • {user?.year || '4th Year'}
              </span>
              <span className="text-xs text-[var(--text-secondary)] font-medium">
                Batch of {user?.graduation_year || 2026}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Lvl {stats?.current_level || 1} • {stats?.total_xp || 0} XP
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Welcome back, {user?.name || 'Engineer'}
            </h1>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Target Track: <span className="font-semibold text-indigo-400">{targetRole}</span> at{' '}
              <span className="font-semibold text-[var(--text-primary)]">{targetCompanies}</span>. Your syllabus-grounded daily recommendations and coding tracks are live.
            </p>
          </div>

          {/* Action Hub - 3 Balanced Professional Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-72 shrink-0">
            {/* Primary Action Button */}
            <button
              onClick={onStartAdaptiveQuiz}
              className="w-full px-5 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-between transition-all transform hover:-translate-y-0.5 cursor-pointer group"
            >
              <span className="flex items-center gap-2">
                <Sparkles size={16} className="text-cyan-200" />
                <span>Continue Today's Plan</span>
              </span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Secondary Dual Action Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
              <button
                onClick={() => {
                  if (onStartAssessment) onStartAssessment();
                  else onStartAdaptiveQuiz();
                }}
                className="px-2.5 py-2.5 rounded-xl bg-[var(--surface-elevated)] hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 font-bold text-xs border border-emerald-500/20 hover:border-emerald-500/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Code2 size={13} />
                <span>Mock Test</span>
              </button>

              <button
                onClick={() => {
                  if (onNavigateToMistakes) onNavigateToMistakes();
                }}
                className="px-2.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-xs border border-amber-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RotateCcw size={13} />
                <span>Mistake Vault</span>
              </button>

              <button
                onClick={onStartCustomQuiz}
                className="px-2.5 py-2.5 rounded-xl bg-[var(--surface-elevated)] hover:bg-indigo-500/10 text-[var(--text-secondary)] hover:text-indigo-300 font-bold text-xs border border-[var(--surface-border)] hover:border-indigo-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs col-span-2 sm:col-span-1"
              >
                <Sliders size={13} />
                <span>Custom Drill</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK LAUNCH ACTION CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div
          onClick={onStartAdaptiveQuiz}
          className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] hover:border-indigo-500/40 hover:bg-[var(--surface-hover)] transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Brain size={20} />
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Sparkles size={10} /> Fresh Questions
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors">
              Adaptive Daily Quiz
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Always brings new, unattempted questions synthesized from your target companies & weak concepts.
            </p>
          </div>
          <div className="pt-4 flex items-center text-xs font-bold text-indigo-400">
            <span>Launch Drill</span>
            <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {onNavigateToAptitude && (
          <div
            onClick={onNavigateToAptitude}
            className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] hover:border-indigo-500/40 hover:bg-[var(--surface-hover)] transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Calculator size={20} />
              </div>
              <h3 className="text-sm font-extrabold text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors">
                Aptitude Arena
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Quantitative, Logical Reasoning, Verbal Ability & DI with step-by-step formula derivations.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-indigo-400">
              <span>Practice Aptitude</span>
              <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        )}

        {onNavigateToCoding && (
          <div
            onClick={onNavigateToCoding}
            className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] hover:border-cyan-500/40 hover:bg-[var(--surface-hover)] transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Code2 size={20} />
              </div>
              <h3 className="text-sm font-extrabold text-[var(--text-primary)] group-hover:text-cyan-400 transition-colors">
                Coding & Compiler Arena
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                LeetCode-style problems tagged for TCS, Infosys, Amazon with Python, C++, Java runners.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-cyan-400">
              <span>Enter Arena</span>
              <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        )}

        <div
          onClick={onExploreCompanies}
          className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] hover:border-purple-500/40 hover:bg-[var(--surface-hover)] transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Building2 size={20} />
            </div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] group-hover:text-purple-400 transition-colors">
              Company Blueprints & Tiers
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Recruitment rounds, CTC packages (up to 45 LPA), syllabus roadmaps, and authentic pattern questions.
            </p>
          </div>
          <div className="pt-4 flex items-center text-xs font-bold text-purple-400">
            <span>Explore 10 Recruiter Tracks</span>
            <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={onViewAnalytics}
          className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] hover:border-emerald-500/40 hover:bg-[var(--surface-hover)] transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] group-hover:text-emerald-400 transition-colors">
              Placement Diagnostics
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Campus percentile benchmarks, company cutoff eligibility matrix, and speed velocity telemetry.
            </p>
          </div>
          <div className="pt-4 flex items-center text-xs font-bold text-emerald-400">
            <span>View Full Report</span>
            <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* PrepPilot Dedicated AI Assistant Card */}
      <PrepPilotCard />

      {/* 4 Compact Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Placement Readiness */}
        <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Placement Readiness</span>
            <button
              onClick={() => setShowReadinessExplainer(true)}
              className="text-[var(--text-muted)] hover:text-indigo-400 p-0.5 rounded transition-colors cursor-pointer"
              title="How is readiness calculated?"
            >
              <HelpCircle size={15} />
            </button>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[var(--text-primary)]">{prepScore}%</span>
            {isNewStudent ? (
              <span className="text-xs text-indigo-400 font-semibold flex items-center">
                New Candidate
              </span>
            ) : (
              <span className="text-xs text-emerald-500 font-semibold flex items-center">
                <TrendingUp size={12} className="mr-0.5" /> Calibrated
              </span>
            )}
          </div>
          <div className="w-full bg-[var(--surface-elevated)] h-2 rounded-full mt-3 overflow-hidden border border-[var(--surface-border)]">
            <div
              className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${prepScore}%` }}
            />
          </div>
          <span className="text-[11px] text-[var(--text-muted)] mt-2">
            {isNewStudent ? 'Complete first quiz to activate scoring' : 'Multi-factor syllabus & test accuracy index'}
          </span>
        </div>

        {/* Metric 2: Practice Accuracy */}
        <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Practice Accuracy</span>
            <CheckCircle2 size={18} className="text-cyan-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[var(--text-primary)]">
              {stats?.accuracy_percentage || 0}%
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              ({stats?.correct_answers ?? Math.round(((stats?.accuracy_percentage || 0) * (stats?.total_questions_attempted || 0)) / 100)} correct of {stats?.total_questions_attempted || 0})
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-2 truncate" title={stats?.subject_progress?.filter((s: any) => s.attempted > 0).map((s: any) => s.name).join(', ') || 'Across syllabus topics'}>
            {stats?.subject_progress && stats.subject_progress.filter((s: any) => s.attempted > 0).length > 0
              ? `Across ${stats.subject_progress.filter((s: any) => s.attempted > 0).map((s: any) => s.name.split(' ')[0]).slice(0, 4).join(', ')}`
              : 'Across core syllabus subjects'}
          </p>
        </div>

        {/* Metric 3: Daily Streak */}
        <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Daily Study Streak</span>
            <Flame size={18} className="text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[var(--text-primary)]">
              {stats?.current_streak || 0} Days
            </span>
            <span className="text-xs text-amber-500 font-semibold">Active Streak</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mt-2">
            <span>Daily Goal: 5 MCQs</span>
            <span>Record: {stats?.longest_streak || 0}d</span>
          </div>
        </div>

        {/* Metric 4: Experience Points & Level */}
        <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Experience Level</span>
            <Zap size={18} className="text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[var(--text-primary)]">
              Lvl {stats?.current_level || 1}
            </span>
            <span className="text-xs text-indigo-400 font-semibold">
              ({stats?.total_xp || 0} XP)
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mt-2">
            <span>Next Level:</span>
            <span>{((stats?.total_xp || 0) % 250)} / 250 XP</span>
          </div>
        </div>
      </div>

      {/* Main Split: Recommended Today (Left 7 cols) & Revision & Companies (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recommendations */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain size={19} className="text-indigo-400" />
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight">
                Recommended For You Today
              </h2>
            </div>
            <span className="text-xs text-[var(--text-muted)] hidden sm:inline">
              Multi-Factor Adaptive Scored
            </span>
          </div>

          <div className="space-y-3">
            {stats?.recommended_questions && stats.recommended_questions.length > 0 ? (
              stats.recommended_questions.map((q) => (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] hover:border-indigo-500/40 transition-all shadow-xs group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {q.subject_name}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--surface-border)]">
                          {q.topic_name}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500' :
                          q.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-rose-500/10 text-rose-500'
                        }`}>
                          {q.difficulty}
                        </span>
                        {q.company_name && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                            {q.company_name}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors line-clamp-2">
                        {q.question}
                      </h3>

                      {q.recommendation_reason && (
                        <p className="text-xs text-[var(--text-secondary)] italic">
                          {q.recommendation_reason}
                        </p>
                      )}
                    </div>

                    {/* Match Score Badge */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-indigo-400 text-xs font-bold">
                        <span>{q.recommendation_score}% Match</span>
                      </div>
                      <button
                        onClick={() => setSelectedQuestionModal(q)}
                        className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-0.5 transition-colors cursor-pointer"
                      >
                        <Info size={12} /> Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-[var(--surface-card)] rounded-2xl border border-[var(--surface-border)] text-[var(--text-secondary)] text-xs">
                Complete your first quiz session to unlock tailored recommendations.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Weak Topics, Strong Topics & Companies */}
        <div className="lg:col-span-5 space-y-6">
          {/* Target Companies Overview */}
          <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-indigo-400" />
                <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-wide">
                  Target Recruiters Track
                </h3>
              </div>
              <button
                onClick={onExploreCompanies}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>View All 10</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-2.5">
              {stats?.target_companies && stats.target_companies.length > 0 ? (
                stats.target_companies.map((c) => (
                  <div
                    key={c.id}
                    onClick={onExploreCompanies}
                    className="p-3.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] hover:border-indigo-500/40 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors">{c.name}</h4>
                      <span className="text-[10px] text-[var(--text-muted)]">{c.tier}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-indigo-400">{c.accuracy}% acc</span>
                      <span className="block text-[10px] text-[var(--text-muted)]">{c.attempted_count} solved</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[var(--text-muted)] italic">No target companies specified.</p>
              )}
            </div>
          </div>

          {/* Weak Topics (Requiring Attention) */}
          <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-amber-500/20 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" />
                <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-wide">
                  Topics Requiring Attention
                </h3>
              </div>
              <span className="text-[11px] text-[var(--text-muted)]">Priority items</span>
            </div>

            <div className="space-y-2.5">
              {stats?.weak_topics && stats.weak_topics.length > 0 ? (
                stats.weak_topics.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">{item.topic_name}</h4>
                      <span className="text-[10px] text-[var(--text-muted)]">{item.subject_name} • {item.attempts} attempts</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-bold text-amber-500">{item.accuracy}%</span>
                        <span className="block text-[9px] text-[var(--text-muted)]">Accuracy</span>
                      </div>
                      <button
                        onClick={onStartAdaptiveQuiz}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 text-[11px] font-bold border border-amber-500/30 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Practice adaptive drill on this topic"
                      >
                        <Play size={10} className="fill-current" />
                        <span>Drill</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[var(--text-muted)] italic">No critical weak spots detected yet.</p>
              )}
            </div>
          </div>

          {/* Mastered Concepts */}
          <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-emerald-500/20 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-wide">
                  Top Mastered Concepts
                </h3>
              </div>
              <span className="text-[11px] text-emerald-500 font-semibold">Solid grasp</span>
            </div>

            <div className="space-y-2.5">
              {stats?.strong_topics && stats.strong_topics.length > 0 ? (
                stats.strong_topics.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">{item.topic_name}</h4>
                      <span className="text-[10px] text-[var(--text-muted)]">{item.subject_name}</span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-bold text-emerald-500">{item.accuracy}%</span>
                      <span className="block text-[9px] text-[var(--text-muted)]">Accuracy</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[var(--text-muted)] italic">Complete more quizzes to identify masteries.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transparent Readiness Methodology Modal */}
      {showReadinessExplainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-3">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-indigo-400" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Placement Readiness Methodology
                </h3>
              </div>
              <button
                onClick={() => setShowReadinessExplainer(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[var(--text-secondary)] leading-relaxed">
              <p>
                Your Placement Readiness score ({prepScore}%) is calibrated from multi-factor placement diagnostics matching official campus benchmarks:
              </p>
              <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] space-y-2">
                <div className="flex justify-between font-semibold text-[var(--text-primary)]">
                  <span>1. Assessment & Quiz Accuracy</span>
                  <span className="text-indigo-400">Up to 50 Pts</span>
                </div>
                <div className="flex justify-between font-semibold text-[var(--text-primary)]">
                  <span>2. Velocity & Question Speed (s/item)</span>
                  <span className="text-indigo-400">Up to 20 Pts</span>
                </div>
                <div className="flex justify-between font-semibold text-[var(--text-primary)]">
                  <span>3. Practice Volume & Syllabus Depth</span>
                  <span className="text-indigo-400">Up to 15 Pts</span>
                </div>
                <div className="flex justify-between font-semibold text-[var(--text-primary)]">
                  <span>4. Study Streak & Active Consistency</span>
                  <span className="text-indigo-400">Up to 15 Pts</span>
                </div>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] italic">
                Note: This estimate tracks preparation progress across curriculum standards and Tier-1 IT patterns, providing feedback for ongoing placement preparation.
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-[var(--surface-border)]">
              <button
                onClick={() => setShowReadinessExplainer(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recommendation Detail Modal */}
      {selectedQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Recommendation Score Breakdown
              </h3>
              <button
                onClick={() => setSelectedQuestionModal(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)]">
                <div className="text-[11px] font-bold text-indigo-400 mb-1">Target Question</div>
                <div className="text-xs text-[var(--text-primary)] leading-relaxed">{selectedQuestionModal.question}</div>
              </div>

              <div className="space-y-2 text-xs text-[var(--text-secondary)]">
                <div className="flex justify-between py-1 border-b border-[var(--surface-border)]">
                  <span>Subject:</span>
                  <span className="font-semibold text-[var(--text-primary)]">{selectedQuestionModal.subject_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--surface-border)]">
                  <span>Topic:</span>
                  <span className="font-semibold text-[var(--text-primary)]">{selectedQuestionModal.topic_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--surface-border)]">
                  <span>Difficulty:</span>
                  <span className="font-semibold text-[var(--text-primary)]">{selectedQuestionModal.difficulty}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--surface-border)]">
                  <span>Expected Time:</span>
                  <span className="font-semibold text-[var(--text-primary)]">{selectedQuestionModal.expected_time} seconds</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[var(--surface-border)]">
              <button
                onClick={() => setSelectedQuestionModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
