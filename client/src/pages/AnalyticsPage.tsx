import React, { useState, useEffect } from 'react';
import api from '../services/api';
import type { AnalyticsData } from '../types';
import { useTheme } from '../context/ThemeContext';
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
  Terminal
} from 'lucide-react';

interface AnalyticsPageProps {
  onNavigateToCoding?: () => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ onNavigateToCoding }) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const summary = data?.summary;
  const isDark = resolvedTheme === 'dark';
  const gridStroke = isDark ? '#1E293B' : '#E2E8F0';
  const axisStroke = isDark ? '#94A3B8' : '#64748B';
  const tooltipBg = isDark ? '#10192B' : '#FFFFFF';
  const tooltipBorder = isDark ? '#1E293B' : '#CBD5E1';
  const tooltipText = isDark ? '#F8FAFC' : '#172033';

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150">
      {/* Page Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <BarChart3 size={20} />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Placement Performance & Analytics
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
          In-depth diagnostics across syllabus subjects, accuracy progression, and question solving velocity.
        </p>
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
            <span className="text-xs font-semibold uppercase tracking-wider">Velocity / Speed</span>
            <Clock size={16} className="text-cyan-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-cyan-500">{summary?.avg_time_per_question || 45}s</span>
          <span className="text-xs text-[var(--text-muted)] block mt-1">Average per question</span>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Questions Solved</span>
            <Layers size={16} className="text-indigo-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-indigo-400">{summary?.total_attempted || 0}</span>
          <span className="text-xs text-[var(--text-muted)] block mt-1">
            {summary?.incorrect_answers} questions for revision
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Streak</span>
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
          <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">Company Target Preparedness</h3>
          <div className="space-y-3">
            {data?.company_accuracy.map((c, i) => (
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
            <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">Priority Revision Topics</h3>
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
            <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">Strongest Placement Concepts</h3>
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
                  LeetCode-style submission metrics, language adoption, and algorithmic revision cues.
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
                  No problematic coding patterns identified. All attempted problems are passing cleanly!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
