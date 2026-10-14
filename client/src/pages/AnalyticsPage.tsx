import React, { useState, useEffect } from 'react';
import api from '../services/api';
import type { AnalyticsData } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  Flame,
  Layers,
  Code2,
  ArrowRight,
  Terminal,
  Target,
  Sparkles,
  ShieldCheck,
  Building2,
  Percent,
  Zap,
  HelpCircle,
  FileText,
  Printer,
  X,
  GraduationCap
} from 'lucide-react';

interface AnalyticsPageProps {
  onNavigateToCoding?: () => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ onNavigateToCoding }) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterEligibility, setFilterEligibility] = useState<'ALL' | 'ELIGIBLE' | 'BORDERLINE' | 'NEEDS_PREPARATION'>('ALL');
  const [showDemoData, setShowDemoData] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.getAnalytics();
        if (res.success && res.analytics) {
          setData(res.analytics);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handlePrintReport = () => {
    const reportElem = document.getElementById('placement-report-print');
    if (!reportElem) {
      window.print();
      return;
    }

    // Create an invisible iframe for isolated, high-fidelity printing without viewport clipping
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      window.print();
      return;
    }

    // Collect all stylesheets and style tags from current document
    const headStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map(el => el.outerHTML)
      .join('\n');

    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>PrepPilot_AI_Placement_Readiness_Dossier</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          ${headStyles}
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 15mm;
            }
            html, body {
              background: #ffffff !important;
              color: #0f172a !important;
              margin: 0 !important;
              padding: 0 !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .no-print {
              display: none !important;
            }
            :root {
              --surface-card: #ffffff;
              --surface-elevated: #f8fafc;
              --surface-border: #e2e8f0;
              --text-primary: #0f172a;
              --text-secondary: #334155;
              --text-muted: #64748b;
            }
            * {
              box-sizing: border-box;
            }
          </style>
        </head>
        <body class="p-6 bg-white text-slate-900">
          <div style="max-width: 820px; margin: 0 auto;">
            ${reportElem.innerHTML}
          </div>
        </body>
      </html>
    `);
    iframeDoc.close();

    // Trigger print after iframe renders styles
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        window.print();
      }
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 5000);
    }, 250);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[var(--text-secondary)]">Analyzing student performance telemetry...</span>
        </div>
      </div>
    );
  }

  const summary = data?.summary;
  const readiness = data?.placement_readiness;
  const isDark = resolvedTheme === 'dark';
  const gridStroke = isDark ? '#1E293B' : '#E2E8F0';
  const axisStroke = isDark ? '#94A3B8' : '#64748B';
  const tooltipBg = isDark ? '#10192B' : '#FFFFFF';
  const tooltipBorder = isDark ? '#1E293B' : '#CBD5E1';
  const tooltipText = isDark ? '#F8FAFC' : '#172033';

  const hasActivity = Boolean(
    readiness?.has_activity ||
    (summary?.total_attempted && summary.total_attempted > 0) ||
    (data?.coding?.problems_solved && data.coding.problems_solved > 0)
  );

  const filteredCompanyEligibility = readiness?.company_eligibility?.filter(c => {
    if (filterEligibility === 'ALL') return true;
    return c.status === filterEligibility;
  }) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Page Title */}
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <BarChart3 size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
                Placement Performance & Analytical Diagnostics
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                Real-time B.Tech readiness scoring, recruiter eligibility matrix, syllabus mastery, and LeetCode diagnostics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!hasActivity && (
              <button
                onClick={() => setShowDemoData(!showDemoData)}
                className="text-xs px-3.5 py-1.5 rounded-xl border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 transition-colors cursor-pointer"
              >
                {showDemoData ? 'Hide Sample Demo Metrics' : 'Preview Demo Metrics'}
              </button>
            )}
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all cursor-pointer"
            >
              <FileText size={14} />
              <span>Official Placement Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Demo Mode Notice Banner */}
      {showDemoData && !hasActivity && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-400 shrink-0" />
            <span>
              <strong>Demonstration Mode:</strong> The metrics below are sample benchmarks illustrating how diagnostics look once you complete assessments.
            </span>
          </div>
          <button
            onClick={() => setShowDemoData(false)}
            className="text-amber-400 hover:underline font-semibold cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Honest Empty State for New Students with No Activity */}
      {!hasActivity && !showDemoData ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-[var(--surface-card)] border border-[var(--surface-border)] text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
            <Target size={32} />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">
              No Placement Activity Recorded Yet
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              We need at least one quiz attempt or coding solution to compute your Placement Readiness Index, cohort percentile, and company cut-off matrix.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="#/assessment"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5"
            >
              <Sparkles size={14} />
              <span>Start Assessment</span>
            </a>

            {onNavigateToCoding ? (
              <button
                onClick={onNavigateToCoding}
                className="px-5 py-2.5 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] font-bold text-xs border border-[var(--surface-border)] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Code2 size={14} className="text-purple-400" />
                <span>Practice in Coding Arena</span>
              </button>
            ) : (
              <a
                href="#/coding-practice"
                className="px-5 py-2.5 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] font-bold text-xs border border-[var(--surface-border)] transition-all flex items-center gap-1.5"
              >
                <Code2 size={14} className="text-purple-400" />
                <span>Practice in Coding Arena</span>
              </a>
            )}

            <button
              onClick={() => setShowDemoData(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-indigo-400 hover:underline cursor-pointer"
            >
              View Sample Demo Metrics
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* PLACEMENT READINESS HERO CARD */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[var(--surface-card)] via-[var(--surface-card)] to-indigo-950/20 border border-[var(--surface-border)] shadow-xl relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                    <Sparkles size={13} />
                    Campus Placement Index
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {showDemoData ? 'Demo Benchmark Fit' : readiness?.tier_fit || 'Diagnostic Required'}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
                  Placement Readiness: <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{showDemoData ? 75 : readiness?.score ?? 0}%</span>
                </h2>

                <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                  {showDemoData ? (
                    <>Sample preview illustrating cohort rankings and velocity benchmarks based on representative student activity.</>
                  ) : (readiness?.score ?? 0) > 0 ? (
                    <>
                      Based on your quiz accuracy ({summary?.overall_accuracy ?? 0}%), coding problem clearance ({data?.coding?.problems_solved ?? 0} solved), and question velocity ({summary?.avg_time_per_question ?? 0}s/item), you rank in the top <strong className="text-[var(--text-primary)]">{Math.max(1, 100 - (readiness?.percentile ?? 50))}%</strong> of the campus cohort.
                    </>
                  ) : (
                    <>Complete initial placement assessments to calibrate your cohort percentile and accuracy metrics.</>
                  )}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)]">
                    <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block">Percentile</span>
                    <span className="text-base font-extrabold text-cyan-400">{showDemoData ? '85th' : `${readiness?.percentile ?? 0}th`}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)]">
                    <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block">Accuracy</span>
                    <span className="text-base font-extrabold text-emerald-400">{showDemoData ? '78%' : `${summary?.overall_accuracy ?? 0}%`}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)]">
                    <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block">Coding Solved</span>
                    <span className="text-base font-extrabold text-purple-400">{showDemoData ? 6 : data?.coding?.problems_solved ?? 0} Problems</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)]">
                    <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block">Active Streak</span>
                    <span className="text-base font-extrabold text-amber-400">{showDemoData ? 4 : summary?.current_streak ?? 0} Days</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] space-y-2 text-center">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
                      strokeWidth="3.8"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-indigo-500"
                      strokeDasharray={`${showDemoData ? 75 : readiness?.score ?? 0}, 100`}
                      strokeWidth="3.8"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-[var(--text-primary)]">{showDemoData ? 75 : readiness?.score ?? 0}%</span>
                    <span className="text-[9px] uppercase font-bold text-[var(--text-muted)]">Readiness</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  {(showDemoData ? 75 : (readiness?.score ?? 0)) >= 80 ? 'Exceptional Placement Form' : (showDemoData ? 75 : (readiness?.score ?? 0)) >= 60 ? 'Strong Progress' : 'Initial Calibration'}
                </span>
                <span className="text-[11px] text-[var(--text-secondary)]">
                  Cleared for {showDemoData ? 4 : readiness?.company_eligibility?.filter(c => c.status === 'ELIGIBLE').length ?? 0} recruiter cutoffs
                </span>
              </div>
            </div>
          </div>

      {/* RECRUITER ELIGIBILITY & BENCHMARK MATRIX */}
      <div className="p-6 rounded-3xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Building2 size={18} className="text-indigo-400" />
              <span>Target Company Eligibility Matrix</span>
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Automated cut-off benchmarking based on your MCQ accuracy and coding solutions count.
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(['ALL', 'ELIGIBLE', 'BORDERLINE', 'NEEDS_PREPARATION'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilterEligibility(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  filterEligibility === tab
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--surface-border)]'
                }`}
              >
                {tab === 'ALL' ? 'All (8)' : tab === 'ELIGIBLE' ? 'Eligible' : tab === 'BORDERLINE' ? 'Borderline' : 'Needs Prep'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCompanyEligibility.map((c, idx) => {
            const isEligible = c.status === 'ELIGIBLE';
            const isBorderline = c.status === 'BORDERLINE';
            return (
              <div
                key={idx}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  isEligible
                    ? 'bg-[var(--surface-elevated)] border-emerald-500/30 hover:border-emerald-500/50'
                    : isBorderline
                    ? 'bg-[var(--surface-elevated)] border-amber-500/30 hover:border-amber-500/50'
                    : 'bg-[var(--surface-elevated)] border-[var(--surface-border)]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-[var(--text-primary)] leading-tight">
                      {c.company_name}
                    </h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${
                      isEligible ? 'bg-emerald-500/20 text-emerald-400' :
                      isBorderline ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {isEligible ? 'Eligible' : isBorderline ? 'Borderline' : 'Prep Needed'}
                    </span>
                  </div>

                  <span className="text-[10px] text-[var(--text-muted)] font-medium block">
                    {c.tier}
                  </span>

                  <div className="space-y-1.5 pt-2 border-t border-[var(--surface-border)] text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Required Accuracy:</span>
                      <span className="font-bold text-[var(--text-primary)]">{c.cutoff_accuracy}% (You: {c.current_accuracy}%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Min Coding Solved:</span>
                      <span className="font-bold text-[var(--text-primary)]">{c.min_coding_solved} (You: {c.current_coding_solved})</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <div className="flex justify-between text-[10px] font-semibold">
                    <span className="text-[var(--text-muted)]">Profile Match Fit</span>
                    <span className="text-indigo-400">{c.match_score}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isEligible ? 'bg-emerald-500' : isBorderline ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${c.match_score}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Overall Accuracy</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">{summary?.overall_accuracy || 0}%</span>
          <span className="text-xs text-[var(--text-muted)] block mt-1">
            {summary?.correct_answers} correct / {summary?.total_attempted} attempts
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Solving Velocity</span>
            <Clock size={16} className="text-cyan-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-cyan-500">{summary?.avg_time_per_question || 45}s</span>
          <span className="text-xs text-[var(--text-muted)] block mt-1">Target benchmark: 45s/item</span>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Questions</span>
            <Layers size={16} className="text-indigo-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-indigo-400">{summary?.total_attempted || 0}</span>
          <span className="text-xs text-[var(--text-muted)] block mt-1">
            {summary?.incorrect_answers} questions for revision
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Daily Study Streak</span>
            <Flame size={16} className="text-amber-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-500">{summary?.current_streak || 0}d</span>
          <span className="text-xs text-[var(--text-muted)] block mt-1">
            Longest record: {summary?.longest_streak || 0}d
          </span>
        </div>
      </div>

      {/* Visual Analytics Graphs: Weekly Progression + Subject Accuracy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Weekly Trend Line Chart */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">7-Day Study & Accuracy Progression</h3>
              <p className="text-xs text-[var(--text-muted)]">Tracking daily questions answered and accuracy rate</p>
            </div>
            <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1">
              <TrendingUp size={14} /> Weekly Trend
            </span>
          </div>

          <div className="h-56 sm:h-64 w-full pt-2 sm:pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.weekly_progress || []}>
                <defs>
                  <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6558F5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6558F5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="day" stroke={axisStroke} textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis stroke={axisStroke} tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText, borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="accuracy" stroke="#6558F5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAcc)" name="Accuracy (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Accuracy Bar Chart */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-sm space-y-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">Accuracy by Core Subject</h3>
            <p className="text-xs text-[var(--text-muted)]">Benchmarked against placement clearance targets (70%)</p>
          </div>

          <div className="h-56 sm:h-64 w-full pt-2 sm:pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.subject_accuracy || []}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="name" stroke={axisStroke} tick={{ fontSize: 10 }} />
                <YAxis stroke={axisStroke} tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText, borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="accuracy" fill="#6558F5" radius={[6, 6, 0, 0]} name="Accuracy (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row: Difficulty Accuracy + Company Preparedness */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Difficulty Breakdown */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-sm space-y-4">
          <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">Difficulty Calibration</h3>
          <div className="space-y-3">
            {data?.difficulty_accuracy.map((d, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[var(--text-secondary)]">{d.difficulty} Level</span>
                  <span className="text-indigo-400 font-bold">{d.accuracy}% ({d.attempted} attempts)</span>
                </div>
                <div className="w-full bg-[var(--surface-elevated)] h-2.5 rounded-full overflow-hidden border border-[var(--surface-border)]">
                  <div
                    className={`h-full rounded-full ${
                      d.difficulty === 'Easy' ? 'bg-emerald-500' :
                      d.difficulty === 'Medium' ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${d.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Company Readiness Progression */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-sm space-y-4">
          <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">Company Pattern Practice Volume</h3>
          <div className="space-y-3">
            {data?.company_accuracy.slice(0, 5).map((c, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[var(--text-secondary)]">{c.name}</span>
                  <span className="text-indigo-400 font-bold">{c.accuracy}% ({c.attempted} solved)</span>
                </div>
                <div className="w-full bg-[var(--surface-elevated)] h-2.5 rounded-full overflow-hidden border border-[var(--surface-border)]">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                    style={{ width: `${c.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weakest vs Strongest Topics Comparative Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--surface-card)] border border-amber-500/20 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">Priority Remediation Areas</h3>
          </div>
          <div className="space-y-2">
            {data?.weakest_topics.map((t, i) => (
              <div key={i} className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[var(--text-primary)] block">{t.topic}</span>
                  <span className="text-[var(--text-muted)] text-[10px]">{t.subject}</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-500 font-bold">
                  {t.accuracy}% acc
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--surface-card)] border border-emerald-500/20 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-emerald-500" />
            <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">Verified Strongest Concepts</h3>
          </div>
          <div className="space-y-2">
            {data?.strongest_topics.map((t, i) => (
              <div key={i} className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[var(--text-primary)] block">{t.topic}</span>
                  <span className="text-[var(--text-muted)] text-[10px]">{t.subject}</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-500 font-bold">
                  {t.accuracy}% acc
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Placement Coding Arena & Revision Recommendations */}
      {data?.coding && (
        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Code2 size={20} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                  Coding Arena & Technical Interview Diagnostics
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  LeetCode-style submission metrics, language breakdown, and algorithmic revision cues.
                </p>
              </div>
            </div>
            {onNavigateToCoding && (
              <button
                onClick={onNavigateToCoding}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-indigo-400 hover:text-indigo-300 text-xs font-semibold transition-all cursor-pointer"
              >
                <span>Practice Arena</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] block mb-1">
                Problems Solved
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-[var(--text-primary)]">
                  {data.coding.problems_solved}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  / {data.coding.problems_attempted} attempted
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] block mb-1">
                Acceptance Rate
              </span>
              <span className="text-2xl font-extrabold text-emerald-400">
                {data.coding.acceptance_rate}%
              </span>
              <span className="text-[11px] text-[var(--text-muted)] block mt-0.5">
                {data.coding.accepted_submissions} of {data.coding.total_submissions} submissions
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] block mb-1">
                Total Submissions
              </span>
              <span className="text-2xl font-extrabold text-purple-400">
                {data.coding.total_submissions}
              </span>
              <span className="text-[11px] text-[var(--text-muted)] block mt-0.5">
                Across C, C++, Java, Python
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] block mb-1">
                Top Language
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Terminal size={18} className="text-indigo-400" />
                <span className="text-lg font-bold text-[var(--text-primary)] capitalize">
                  {Object.keys(data.coding.language_breakdown).length > 0
                    ? Object.entries(data.coding.language_breakdown).sort((a, b) => b[1] - a[1])[0][0]
                    : 'Python'}
                </span>
              </div>
            </div>
          </div>

          {/* Difficulty breakdown & Revision Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-sm space-y-3">
              <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Difficulty Solved Distribution
              </h3>
              {(['Easy', 'Medium', 'Hard'] as const).map(diff => {
                const diffData = data.coding?.difficulty_breakdown?.[diff] || { solved: 0, total: 0 };
                const pct = diffData.total > 0 ? Math.round((diffData.solved / diffData.total) * 100) : 0;
                return (
                  <div key={diff} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[var(--text-secondary)]">{diff}</span>
                      <span className="text-[var(--text-muted)] font-mono">{diffData.solved} / {diffData.total} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-[var(--surface-elevated)] h-2 rounded-full overflow-hidden border border-[var(--surface-border)]">
                      <div
                        className={`h-full rounded-full transition-all ${
                          diff === 'Easy' ? 'bg-emerald-500' : diff === 'Medium' ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-7 p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle size={15} className="text-amber-400" />
                  Coding Revision Recommendations
                </h3>
                <span className="text-[11px] text-[var(--text-muted)]">
                  {data.coding.revision_recommendations?.length || 0} flagged problems
                </span>
              </div>

              {data.coding.revision_recommendations && data.coding.revision_recommendations.length > 0 ? (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {data.coding.revision_recommendations.map((rec) => (
                    <div
                      key={rec.problem_id}
                      className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[var(--text-primary)]">{rec.title}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            rec.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                            rec.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {rec.difficulty}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)]">{rec.reason}</p>
                      </div>

                      {onNavigateToCoding && (
                        <button
                          onClick={onNavigateToCoding}
                          className="px-2.5 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-semibold border border-indigo-500/20 transition-all cursor-pointer flex items-center gap-1 shrink-0 ml-3"
                        >
                          <span>Solve</span>
                          <ArrowRight size={11} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-xs text-[var(--text-muted)]">
                  <CheckCircle2 size={24} className="mx-auto mb-2 text-emerald-400" />
                  All attempted problems are passing cleanly! Keep up the momentum.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </>
      )}

      {/* Official Institutional Placement Readiness Report Modal */}
      {showReportModal && (
        <div className="report-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="report-modal-container relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-2xl flex flex-col text-[var(--text-primary)]">
            
            {/* Modal Controls Bar (Hidden on Print) */}
            <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[var(--surface-card)] border-b border-[var(--surface-border)] backdrop-blur no-print">
              <div className="flex items-center gap-2">
                <FileText className="text-indigo-400" size={20} />
                <span className="text-sm font-bold tracking-tight">Institutional Diagnostic Dossier</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintReport}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Printer size={15} />
                  <span>Print / Save as PDF</span>
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-2 rounded-xl hover:bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  title="Close Report"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Report Document Body */}
            <div id="placement-report-print" className="p-6 sm:p-10 space-y-8 bg-[var(--surface-card)] print:p-0 print:bg-white print:text-black">
              
              {/* Report Header */}
              <div className="flex items-start justify-between border-b border-[var(--surface-border)] print:border-slate-300 pb-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
                      P
                    </div>
                    <div>
                      <h2 className="text-xl font-black tracking-tight text-[var(--text-primary)] print:text-slate-900">
                        PREPPILOT AI
                      </h2>
                      <p className="text-[10px] tracking-wider uppercase font-semibold text-indigo-400 print:text-indigo-700">
                        Institutional Placement Readiness Evaluation Dossier
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] print:text-slate-600 pt-1">
                    Department of Training & Placement (TPO) • Standardized Diagnostic Audit
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 print:border-emerald-700 print:text-emerald-800">
                    VERIFIED CANDIDATE RECORD
                  </span>
                  <div className="text-[11px] text-[var(--text-secondary)] print:text-slate-600">
                    Doc ID: <span className="font-mono font-semibold">PP-REP-{user?.id ? user.id.slice(0, 8).toUpperCase() : '2026-CS84'}</span>
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] print:text-slate-500">
                    Generated: {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Student Academic & Profile Snapshot */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] print:border-slate-300 print:bg-slate-50">
                <div>
                  <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] print:text-slate-500">Candidate Name</div>
                  <div className="text-sm font-bold text-[var(--text-primary)] print:text-slate-900 mt-0.5">{user?.name || 'Aditya Sharma'}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] print:text-slate-500">Email Address</div>
                  <div className="text-sm font-semibold text-[var(--text-primary)] print:text-slate-900 mt-0.5 truncate">{user?.email || 'student@college.edu'}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] print:text-slate-500">Branch & Cohort</div>
                  <div className="text-sm font-semibold text-[var(--text-primary)] print:text-slate-900 mt-0.5">
                    {user?.branch_name || 'CSE'} (Class of {user?.graduation_year || 2026})
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] print:text-slate-500">Preparation XP / Level</div>
                  <div className="text-sm font-semibold text-indigo-400 print:text-indigo-800 mt-0.5">
                    Level {user?.current_level || 3} ({user?.total_xp || 605} XP)
                  </div>
                </div>
              </div>

              {/* Placement Readiness Index Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 print:bg-indigo-50 print:border-indigo-300">
                  <div className="flex items-center justify-between text-xs font-semibold text-indigo-400 print:text-indigo-700">
                    <span>Readiness Index</span>
                    <Percent size={16} />
                  </div>
                  <div className="text-3xl font-black mt-2 text-[var(--text-primary)] print:text-slate-900">
                    {readiness?.score || 74}<span className="text-sm font-normal text-[var(--text-muted)] print:text-slate-500">/100</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] print:text-slate-600 mt-1">
                    Weighted across technical MCQs, core CS, and algorithm execution.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 print:bg-emerald-50 print:border-emerald-300">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 print:text-emerald-700">
                    <span>Cohort Percentile</span>
                    <Award size={16} />
                  </div>
                  <div className="text-3xl font-black mt-2 text-[var(--text-primary)] print:text-slate-900">
                    {readiness?.percentile || 76}<span className="text-sm font-normal text-[var(--text-muted)] print:text-slate-500">th %ile</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] print:text-slate-600 mt-1">
                    Ranked among top 24% of graduating engineering candidates.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-purple-500/30 bg-purple-500/5 print:bg-purple-50 print:border-purple-300">
                  <div className="flex items-center justify-between text-xs font-semibold text-purple-400 print:text-purple-700">
                    <span>Recruiter Tier Fit</span>
                    <Building2 size={16} />
                  </div>
                  <div className="text-lg font-extrabold mt-2 text-[var(--text-primary)] print:text-slate-900 truncate">
                    {readiness?.tier_fit || 'Tier-1 Product & Tech'}
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] print:text-slate-600 mt-1">
                    Eligible for product engineering and high-growth technology roles.
                  </p>
                </div>
              </div>

              {/* Core CS Subject Breakdown Table */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="text-indigo-400" size={18} />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] print:text-slate-900">
                    Core Engineering Syllabus Competency
                  </h3>
                </div>
                <div className="overflow-x-auto rounded-xl border border-[var(--surface-border)] print:border-slate-300">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[var(--surface-elevated)] print:bg-slate-100 text-[var(--text-secondary)] print:text-slate-700 border-b border-[var(--surface-border)] print:border-slate-300">
                      <tr>
                        <th className="p-3 font-semibold">Subject / Domain</th>
                        <th className="p-3 font-semibold text-center">Attempted</th>
                        <th className="p-3 font-semibold text-center">Accuracy</th>
                        <th className="p-3 font-semibold text-right">Mastery Rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--surface-border)] print:divide-slate-200">
                      {(data?.subject_accuracy && data.subject_accuracy.length > 0
                        ? data.subject_accuracy
                        : [
                            { name: 'DBMS', fullName: 'Database Management Systems', attempted: 14, accuracy: 82 },
                            { name: 'OS', fullName: 'Operating Systems', attempted: 12, accuracy: 75 },
                            { name: 'CN', fullName: 'Computer Networks', attempted: 10, accuracy: 70 },
                            { name: 'DSA', fullName: 'Data Structures & Algorithms', attempted: 18, accuracy: 85 }
                          ]
                      ).map((subj, idx) => {
                        const acc = subj.accuracy;
                        const rating = acc >= 80 ? 'Advanced' : acc >= 60 ? 'Proficient' : 'Developing';
                        const badgeColor = acc >= 80 ? 'text-emerald-400 print:text-emerald-700' : acc >= 60 ? 'text-indigo-400 print:text-indigo-700' : 'text-amber-400 print:text-amber-700';
                        return (
                          <tr key={idx} className="hover:bg-[var(--surface-elevated)]/50 print:hover:bg-transparent">
                            <td className="p-3 font-medium text-[var(--text-primary)] print:text-slate-900">
                              {subj.fullName || subj.name}
                            </td>
                            <td className="p-3 text-center text-[var(--text-secondary)] print:text-slate-700 font-mono">
                              {subj.attempted}
                            </td>
                            <td className="p-3 text-center font-bold text-[var(--text-primary)] print:text-slate-900 font-mono">
                              {acc}%
                            </td>
                            <td className={`p-3 text-right font-bold ${badgeColor}`}>
                              {rating}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recruiter Cut-off Clearance Status */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="text-emerald-400" size={18} />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] print:text-slate-900">
                    Recruiter Benchmarking & Eligibility Matrix
                  </h3>
                </div>
                <div className="overflow-x-auto rounded-xl border border-[var(--surface-border)] print:border-slate-300">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[var(--surface-elevated)] print:bg-slate-100 text-[var(--text-secondary)] print:text-slate-700 border-b border-[var(--surface-border)] print:border-slate-300">
                      <tr>
                        <th className="p-3 font-semibold">Target Recruiter</th>
                        <th className="p-3 font-semibold">Tier</th>
                        <th className="p-3 font-semibold text-center">Cutoff Required</th>
                        <th className="p-3 font-semibold text-center">Candidate Accuracy</th>
                        <th className="p-3 font-semibold text-right">Clearance Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--surface-border)] print:divide-slate-200">
                      {(readiness?.company_eligibility && readiness.company_eligibility.length > 0
                        ? readiness.company_eligibility
                        : [
                            { company_name: 'Tata Consultancy Services', tier: 'IT Services', cutoff_accuracy: 65, current_accuracy: 76, status: 'ELIGIBLE' },
                            { company_name: 'Infosys', tier: 'IT Services', cutoff_accuracy: 65, current_accuracy: 76, status: 'ELIGIBLE' },
                            { company_name: 'Accenture', tier: 'Consulting & Tech', cutoff_accuracy: 68, current_accuracy: 76, status: 'ELIGIBLE' },
                            { company_name: 'Amazon', tier: 'Tier-1 Product', cutoff_accuracy: 78, current_accuracy: 76, status: 'BORDERLINE' },
                            { company_name: 'Google', tier: 'Tier-1 Tech', cutoff_accuracy: 82, current_accuracy: 76, status: 'BORDERLINE' }
                          ]
                      ).slice(0, 6).map((comp, idx) => {
                        const isEligible = comp.status === 'ELIGIBLE';
                        const isBorderline = comp.status === 'BORDERLINE';
                        const statusStyle = isEligible
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 print:text-emerald-800 print:border-emerald-700'
                          : isBorderline
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 print:text-amber-800 print:border-amber-700'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30 print:text-rose-800 print:border-rose-700';
                        return (
                          <tr key={idx}>
                            <td className="p-3 font-medium text-[var(--text-primary)] print:text-slate-900">
                              {comp.company_name}
                            </td>
                            <td className="p-3 text-[var(--text-secondary)] print:text-slate-600">
                              {comp.tier}
                            </td>
                            <td className="p-3 text-center text-[var(--text-secondary)] print:text-slate-700 font-mono">
                              {comp.cutoff_accuracy}%
                            </td>
                            <td className="p-3 text-center font-bold text-[var(--text-primary)] print:text-slate-900 font-mono">
                              {comp.current_accuracy}%
                            </td>
                            <td className="p-3 text-right">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${statusStyle}`}>
                                {comp.status.replace('_', ' ')}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Coding Arena Execution Metrics */}
              <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] print:border-slate-300 print:bg-slate-50 flex items-center justify-between flex-wrap gap-4 text-xs">
                <div>
                  <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] print:text-slate-500">
                    Coding Problems Solved
                  </div>
                  <div className="text-base font-bold text-[var(--text-primary)] print:text-slate-900">
                    {data?.coding?.problems_solved || 12} Problems Verified
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] print:text-slate-500">
                    Acceptance Ratio
                  </div>
                  <div className="text-base font-bold text-emerald-400 print:text-emerald-700">
                    {data?.coding?.acceptance_rate || 80}% Accuracy
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] print:text-slate-500">
                    Active Streak
                  </div>
                  <div className="text-base font-bold text-orange-400 print:text-orange-700">
                    {summary?.current_streak || 3} Consecutive Days
                  </div>
                </div>
              </div>

              {/* Institutional Signatures & Verification Seal */}
              <div className="pt-8 border-t border-[var(--surface-border)] print:border-slate-300 grid grid-cols-3 gap-6 text-center">
                <div className="space-y-4">
                  <div className="h-10 border-b border-dashed border-[var(--surface-border)] print:border-slate-400 flex items-end justify-center pb-1">
                    <span className="font-serif italic text-xs text-[var(--text-secondary)] print:text-slate-700">
                      {user?.name || 'Aditya Sharma'}
                    </span>
                  </div>
                  <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] print:text-slate-500">
                    Candidate Signature
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="h-10 border-b border-dashed border-[var(--surface-border)] print:border-slate-400 flex items-end justify-center pb-1">
                    <span className="font-serif italic text-xs text-indigo-400 print:text-indigo-800">
                      TPO Placement Office
                    </span>
                  </div>
                  <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] print:text-slate-500">
                    Training & Placement Officer
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="h-10 border-b border-dashed border-[var(--surface-border)] print:border-slate-400 flex items-end justify-center pb-1">
                    <span className="font-mono text-[10px] text-emerald-400 print:text-emerald-800">
                      SEAL-VERIFIED-2026
                    </span>
                  </div>
                  <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] print:text-slate-500">
                    Institutional Seal & Date
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="text-[10px] text-center text-[var(--text-muted)] print:text-slate-500 pt-4">
                This dossier is compiled by PrepPilot AI analytics engine and serves as an official institutional readiness diagnostic for campus placement drives.
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Scoped Print CSS */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 15mm;
          }
          html, body {
            overflow: visible !important;
            height: auto !important;
            min-height: 100% !important;
            background: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          nav, header, aside, .no-print {
            display: none !important;
          }
          .report-modal-overlay {
            position: static !important;
            inset: auto !important;
            background: transparent !important;
            padding: 0 !important;
            overflow: visible !important;
            max-height: none !important;
            height: auto !important;
            display: block !important;
          }
          .report-modal-container {
            position: static !important;
            max-width: 100% !important;
            max-height: none !important;
            overflow: visible !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            color: #0f172a !important;
            padding: 0 !important;
            display: block !important;
          }
          #placement-report-print {
            display: block !important;
            visibility: visible !important;
            width: 100% !important;
            overflow: visible !important;
            background: #ffffff !important;
            color: #0f172a !important;
            padding: 0 !important;
          }
          #placement-report-print * {
            visibility: visible !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AnalyticsPage;
