import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  GraduationCap,
  BookOpen,
  BarChart2,
  TrendingUp,
  Award,
  Search,
  Filter,
  Download,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  X,
  Clock,
  Zap,
  Code2,
  Flame,
  FileSpreadsheet,
  ChevronRight,
  Sparkles,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';

interface DeanDashboardPageProps {
  currentTab?: string;
  onNavigateTab?: (tab: string) => void;
}

export const DeanDashboardPage: React.FC<DeanDashboardPageProps> = ({
  currentTab = 'dean-overview',
  onNavigateTab
}) => {
  // Navigation section: 'dean-overview' | 'dean-performance' | 'dean-assessments' | 'dean-subjects' | 'dean-reports'
  const [activeSection, setActiveSection] = useState<string>(() => {
    if (currentTab.startsWith('dean-')) return currentTab;
    return 'dean-overview';
  });

  useEffect(() => {
    if (currentTab && currentTab.startsWith('dean-')) {
      setActiveSection(currentTab);
    }
  }, [currentTab]);

  const setSection = (sec: string) => {
    setActiveSection(sec);
    if (onNavigateTab) {
      onNavigateTab(sec);
    } else if (typeof window !== 'undefined') {
      window.location.hash = `#/${sec}`;
    }
  };

  // State
  const [overview, setOverview] = useState<any | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total_items: 0, total_pages: 1 });
  const [assessmentsData, setAssessmentsData] = useState<any | null>(null);
  const [subjectsData, setSubjectsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters for Student Performance
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');

  // Selected Student Dossier Modal
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentDossier, setStudentDossier] = useState<any | null>(null);
  const [loadingDossier, setLoadingDossier] = useState(false);
  const [dossierError, setDossierError] = useState<string | null>(null);

  // CSV Export Status
  const [exportingReport, setExportingReport] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const fetchOverview = async () => {
    try {
      const res = await api.getDeanOverview();
      if (res && res.success) {
        setOverview(res);
      } else {
        throw new Error(res?.message || 'Failed to load academic overview');
      }
    } catch (err: any) {
      console.error('[Dean Overview Fetch Error]:', err);
      throw err;
    }
  };

  const fetchStudents = async (page = 1) => {
    try {
      const res = await api.getDeanPerformance({
        search: searchQuery,
        performance_tier: tierFilter,
        branch: branchFilter,
        page,
        limit: 10
      });
      if (res && res.success) {
        setStudents(res.students || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err: any) {
      console.error('[Dean Students Fetch Error]:', err);
    }
  };

  const fetchAssessments = async () => {
    try {
      const res = await api.getDeanAssessments();
      if (res && res.success) {
        setAssessmentsData(res);
      }
    } catch (err: any) {
      console.error('[Dean Assessments Fetch Error]:', err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await api.getDeanSubjectAnalytics();
      if (res && res.success) {
        setSubjectsData(res.subjects || []);
      }
    } catch (err: any) {
      console.error('[Dean Subjects Fetch Error]:', err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchOverview(),
        fetchStudents(1),
        fetchAssessments(),
        fetchSubjects()
      ]);
    } catch (err: any) {
      setError(err?.message || 'Network error retrieving academic oversight data. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Debounced search / filter update
  useEffect(() => {
    if (!loading) {
      fetchStudents(1);
    }
  }, [searchQuery, tierFilter, branchFilter]);

  // Open Student Dossier
  const handleOpenDossier = async (studentId: string) => {
    setSelectedStudentId(studentId);
    setLoadingDossier(true);
    setDossierError(null);
    try {
      const res = await api.getDeanStudentDossier(studentId);
      if (res && res.success) {
        setStudentDossier(res);
      } else {
        setDossierError(res?.message || 'Unable to retrieve student academic dossier');
      }
    } catch (err: any) {
      setDossierError('Network error loading student dossier');
    } finally {
      setLoadingDossier(false);
    }
  };

  const handleExportCSV = async (reportType: string) => {
    setExportingReport(true);
    setExportSuccess(null);
    try {
      const url = api.exportDeanReportUrl(reportType);
      const token = localStorage.getItem('preppilot_token') || localStorage.getItem('careerprep_token');
      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        throw new Error('Server returned an error generating export.');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `preppilot_dean_report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setExportSuccess(`Verified ${reportType.replace('-', ' ')} CSV report downloaded successfully.`);
      setTimeout(() => setExportSuccess(null), 4000);
    } catch (err: any) {
      alert(`Export error: ${err.message || 'Unable to download report'}`);
    } finally {
      setExportingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
        <span className="text-xs font-semibold text-[var(--text-secondary)]">Loading Academic Analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-base font-bold text-[var(--text-primary)]">Academic Analytics Unavailable</h3>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{error}</p>
        <button
          onClick={loadAllData}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs inline-flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw size={14} />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  const metrics = overview?.metrics || {};
  const subjectMastery = overview?.subject_mastery || [];
  const learningGaps = overview?.learning_gaps || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner / Role Identity */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 uppercase tracking-wide">
              Dean
            </span>
            <h1 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight">
              Academic Analytics & Oversight
            </h1>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Empirical cohort performance, subject mastery trends, assessment completion, and gap diagnostics.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExportCSV('student-performance')}
            disabled={exportingReport}
            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Download size={14} />
            <span>{exportingReport ? 'Generating CSV...' : 'Export Verified Report'}</span>
          </button>
          <button
            onClick={loadAllData}
            title="Refresh All Academic Data"
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] transition-colors cursor-pointer"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {exportSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
          <span>{exportSuccess}</span>
        </div>
      )}

      {/* Internal Dean Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[var(--surface-border)] scrollbar-none">
        {[
          { id: 'dean-overview', label: 'Academic Overview', icon: BarChart2 },
          { id: 'dean-performance', label: 'Student Performance', icon: GraduationCap },
          { id: 'dean-assessments', label: 'Assessments', icon: Award },
          { id: 'dean-subjects', label: 'Subject Analytics', icon: BookOpen },
          { id: 'dean-reports', label: 'Academic Reports', icon: FileSpreadsheet }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSection(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-transparent'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* SECTION 1: ACADEMIC OVERVIEW                                          */}
      {/* ===================================================================== */}
      {activeSection === 'dean-overview' && (
        <div className="space-y-6">
          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-1">
              <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Total Cohort Students
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[var(--text-primary)]">
                  {metrics.total_students ?? 0}
                </span>
                <span className="text-[11px] font-semibold text-emerald-400">
                  {metrics.active_students ?? 0} active
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)]">Registered student accounts</p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-1">
              <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Assessment Participation
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-cyan-400">
                  {metrics.participation_rate ?? 0}%
                </span>
                <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
                  of cohort
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)]">Attempted 1+ assessments</p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-1">
              <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Cohort Average Score
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-indigo-400">
                  {metrics.cohort_average_score ?? 0}%
                </span>
                <span className="text-[11px] font-semibold text-indigo-300">
                  completion: {metrics.completion_rate ?? 0}%
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)]">Across completed test sessions</p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-1">
              <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Coding Acceptance Rate
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-400">
                  {metrics.coding_acceptance_rate ?? 0}%
                </span>
                <span className="text-[11px] font-semibold text-amber-300">
                  {metrics.accepted_coding_submissions ?? 0} / {metrics.total_coding_submissions ?? 0}
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)]">Passed all unit test suites</p>
            </div>
          </div>

          {/* Two-Column Grid: Subject Mastery & Learning Gaps */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subject Mastery Overview */}
            <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">Core Subject Mastery</h3>
                  <p className="text-xs text-[var(--text-muted)]">Aggregate cohort accuracy rate by subject</p>
                </div>
                <button
                  onClick={() => setSection('dean-subjects')}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>View Details</span>
                  <ChevronRight size={13} />
                </button>
              </div>

              {subjectMastery.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--text-muted)]">No subject data recorded.</div>
              ) : (
                <div className="space-y-3 pt-1">
                  {subjectMastery.map((sub: any) => (
                    <div key={sub.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[var(--text-primary)]">{sub.name}</span>
                        <span className="font-bold text-cyan-400">{sub.accuracy_rate}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[var(--surface-elevated)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(5, sub.accuracy_rate))}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                        <span>{sub.total_topics} syllabus topics</span>
                        <span>{sub.total_attempts} total test attempts</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Identified Learning Gaps */}
            <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">Learning Gaps & Focus Areas</h3>
                  <p className="text-xs text-[var(--text-muted)]">Topics where cohort accuracy falls below threshold</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  Priority Action
                </span>
              </div>

              {learningGaps.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--text-muted)]">No critical weakness areas detected.</div>
              ) : (
                <div className="space-y-2.5 pt-1">
                  {learningGaps.map((gap: any) => (
                    <div
                      key={gap.id}
                      className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[var(--text-primary)] block truncate">
                          {gap.name}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] block">
                          {gap.subject_name}
                        </span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-black text-rose-400 block">
                          {gap.accuracy_rate !== null ? `${gap.accuracy_rate}% Acc` : 'Needs Baseline'}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] block">
                          Weakness Score: {gap.weakness_score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 2: STUDENT PERFORMANCE DIRECTORY                              */}
      {/* ===================================================================== */}
      {activeSection === 'dean-performance' && (
        <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Student Academic Performance Directory</h3>
              <p className="text-xs text-[var(--text-muted)]">Searchable student academic tracking with performance tiers</p>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search by name, email, or branch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[var(--surface-elevated)] border border-[var(--surface-border)] rounded-xl text-xs text-[var(--text-primary)] outline-none focus:border-cyan-500"
              />
            </div>

            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="w-full py-2 px-3 bg-[var(--surface-elevated)] border border-[var(--surface-border)] rounded-xl text-xs text-[var(--text-primary)] outline-none"
            >
              <option value="all">All Performance Tiers</option>
              <option value="high-performer">High Performers (≥ 75%)</option>
              <option value="proficient">Proficient (50% - 74%)</option>
              <option value="needs-practice">Needs Practice (&lt; 50%)</option>
            </select>

            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full py-2 px-3 bg-[var(--surface-elevated)] border border-[var(--surface-border)] rounded-xl text-xs text-[var(--text-primary)] outline-none"
            >
              <option value="all">All Engineering Branches</option>
              <option value="branch-cse">Computer Science Engineering (CSE)</option>
              <option value="branch-it">Information Technology (IT)</option>
              <option value="branch-ece">Electronics & Communication (ECE)</option>
            </select>
          </div>

          {/* Students Performance Table */}
          {students.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--text-muted)]">
              No students match the specified search and filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[var(--surface-border)]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--surface-elevated)] text-[var(--text-muted)] uppercase text-[10px] font-bold border-b border-[var(--surface-border)]">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4 text-center">Tests Taken</th>
                    <th className="py-3 px-4 text-center">Avg Score</th>
                    <th className="py-3 px-4 text-center">Coding Solved</th>
                    <th className="py-3 px-4">Performance Tier</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--surface-border)]">
                  {students.map((st) => (
                    <tr key={st.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[var(--text-primary)]">{st.name}</div>
                        <div className="text-[11px] text-[var(--text-muted)]">{st.email}</div>
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">
                        {st.branch_name}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-[var(--text-primary)]">
                        {st.assessments_completed}
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        {st.average_score !== null ? (
                          <span className={st.average_score >= 75 ? 'text-emerald-400' : st.average_score >= 50 ? 'text-amber-400' : 'text-rose-400'}>
                            {st.average_score}%
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)]">No Tests</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-indigo-400">
                        {st.coding_solved}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          st.performance_tier === 'High Performer'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : st.performance_tier === 'Proficient'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {st.performance_tier}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenDossier(st.id)}
                          className="px-2.5 py-1 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-cyan-400 border border-[var(--surface-border)] text-xs font-bold cursor-pointer"
                        >
                          View Dossier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-[var(--text-muted)]">
                Showing {students.length} of {pagination.total_items} students
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => fetchStudents(pagination.page - 1)}
                  className="px-3 py-1 rounded-lg border border-[var(--surface-border)] text-[var(--text-secondary)] disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                <span className="px-2 text-[var(--text-primary)] font-bold">
                  {pagination.page} / {pagination.total_pages}
                </span>
                <button
                  disabled={pagination.page >= pagination.total_pages}
                  onClick={() => fetchStudents(pagination.page + 1)}
                  className="px-3 py-1 rounded-lg border border-[var(--surface-border)] text-[var(--text-secondary)] disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 3: ASSESSMENTS OUTCOME ANALYTICS                             */}
      {/* ===================================================================== */}
      {activeSection === 'dean-assessments' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Standardized Assessment Outcomes</h3>
              <p className="text-xs text-[var(--text-muted)]">Performance outcomes across standardized technical assessments</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
              {(assessmentsData?.assessments || []).map((asmt: any) => (
                <div
                  key={asmt.id}
                  className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] space-y-3"
                >
                  <div>
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wide block">
                      {asmt.target_company}
                    </span>
                    <h4 className="text-xs font-bold text-[var(--text-primary)] mt-0.5">
                      {asmt.title}
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] block">Attempts</span>
                      <span className="font-bold text-[var(--text-primary)]">{asmt.total_attempts}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] block">Pass Rate (≥60%)</span>
                      <span className="font-bold text-emerald-400">{asmt.pass_rate}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] block">Average Score</span>
                      <span className="font-bold text-indigo-400">{asmt.average_score}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] block">Top Score</span>
                      <span className="font-bold text-amber-400">{asmt.highest_score}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 4: SUBJECT & TOPIC ANALYTICS                                 */}
      {/* ===================================================================== */}
      {activeSection === 'dean-subjects' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Deep Subject & Topic Curriculum Breakdown</h3>
              <p className="text-xs text-[var(--text-muted)]">Subject question volume, attempt volume, and granular topic accuracy</p>
            </div>

            <div className="space-y-6 pt-2">
              {subjectsData.map((sub: any) => (
                <div key={sub.id} className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--surface-border)] pb-2.5">
                    <div>
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wide">
                        {sub.code}
                      </span>
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">
                        {sub.name}
                      </h4>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-[var(--text-muted)] block">Questions in Bank</span>
                        <span className="font-bold text-[var(--text-primary)]">{sub.total_questions}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--text-muted)] block">Total Attempts</span>
                        <span className="font-bold text-[var(--text-primary)]">{sub.total_attempts}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--text-muted)] block">Subject Accuracy</span>
                        <span className="font-bold text-cyan-400">{sub.accuracy_rate}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Topics List within Subject */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                    {(sub.topics || []).map((top: any) => (
                      <div
                        key={top.id}
                        className="p-2.5 rounded-lg bg-[var(--surface-card)] border border-[var(--surface-border)] flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0">
                          <span className="font-semibold text-[var(--text-primary)] block truncate">{top.name}</span>
                          <span className="text-[10px] text-[var(--text-muted)] block">{top.question_count} questions</span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="font-bold text-cyan-400 block">{top.accuracy_rate}%</span>
                          <span className={`text-[10px] font-bold ${
                            top.status === 'Strong' ? 'text-emerald-400' : top.status === 'Moderate' ? 'text-amber-400' : 'text-rose-400'
                          }`}>
                            {top.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 5: ACADEMIC REPORTS & EXPORT                                  */}
      {/* ===================================================================== */}
      {activeSection === 'dean-reports' && (
        <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-6">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Verified Academic Reports & Data Exports</h3>
            <p className="text-xs text-[var(--text-muted)]">Download authentic database-derived CSV reports for accreditation and placement meetings</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] space-y-3">
              <div className="flex items-center gap-2.5 text-cyan-400">
                <GraduationCap size={18} />
                <h4 className="text-xs font-bold text-[var(--text-primary)]">Student Performance Summary CSV</h4>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Contains complete list of enrolled students, email addresses, engineering branches, assessments completed, average scores, and performance tier categorization.
              </p>
              <button
                onClick={() => handleExportCSV('student-performance')}
                disabled={exportingReport}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Download size={14} />
                <span>Export Student Performance CSV</span>
              </button>
            </div>

            <div className="p-5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] space-y-3">
              <div className="flex items-center gap-2.5 text-indigo-400">
                <Award size={18} />
                <h4 className="text-xs font-bold text-[var(--text-primary)]">Standardized Assessment Outcomes CSV</h4>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Contains all completed assessment test attempts, test titles, candidate IDs, accuracy scores, correct answer counts, and completion timestamps.
              </p>
              <button
                onClick={() => handleExportCSV('assessments')}
                disabled={exportingReport}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Download size={14} />
                <span>Export Assessment Outcomes CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: INDIVIDUAL STUDENT ACADEMIC DOSSIER                             */}
      {/* ===================================================================== */}
      {selectedStudentId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wide">
                  Academic Dossier
                </span>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {studentDossier?.student?.name || 'Loading Student Record...'}
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {studentDossier?.student?.email} • {studentDossier?.student?.year || '4th Year'}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedStudentId(null);
                  setStudentDossier(null);
                }}
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--surface-hover)] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {loadingDossier ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 border-3 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                <span className="text-xs text-[var(--text-muted)]">Retrieving academic history...</span>
              </div>
            ) : dossierError ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{dossierError}</span>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {/* Dossier Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-center">
                    <span className="text-[10px] text-[var(--text-muted)] block">Total XP</span>
                    <span className="text-base font-bold text-cyan-400">
                      {studentDossier?.student?.total_xp || 0}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-center">
                    <span className="text-[10px] text-[var(--text-muted)] block">Skill Level</span>
                    <span className="text-base font-bold text-indigo-400">
                      {studentDossier?.student?.skill_level || 'Intermediate'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-center">
                    <span className="text-[10px] text-[var(--text-muted)] block">Practice Streak</span>
                    <span className="text-base font-bold text-amber-400">
                      {studentDossier?.student?.current_streak || 0} Days
                    </span>
                  </div>
                </div>

                {/* Topic Breakdown */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                    Syllabus Topic Performance
                  </h4>
                  {(studentDossier?.history?.topic_breakdown || []).length === 0 ? (
                    <div className="p-4 rounded-xl bg-[var(--surface-elevated)] text-xs text-[var(--text-muted)] text-center">
                      No recorded topic performance data for this student yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {studentDossier.history.topic_breakdown.map((t: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-semibold text-[var(--text-primary)] block">{t.topic_name}</span>
                            <span className="text-[10px] text-[var(--text-muted)]">{t.subject_name}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-cyan-400 block">{t.accuracy_rate}% Acc</span>
                            <span className="text-[10px] text-[var(--text-muted)]">{t.attempts} attempts</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Assessment Sessions */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                    Recent Assessment Sessions
                  </h4>
                  {(studentDossier?.history?.quiz_sessions || []).length === 0 ? (
                    <div className="p-4 rounded-xl bg-[var(--surface-elevated)] text-xs text-[var(--text-muted)] text-center">
                      No completed assessments on file.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {studentDossier.history.quiz_sessions.slice(-5).map((s: any) => (
                        <div
                          key={s.id}
                          className="p-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-semibold text-[var(--text-primary)] block">
                              {s.title || s.assessment_id || 'Adaptive Daily Session'}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)]">
                              Status: {s.status}
                            </span>
                          </div>
                          <span className="font-bold text-cyan-400">
                            {s.score !== undefined ? `${s.score}%` : `${s.correct_count || 0}/${s.total_questions || 0}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeanDashboardPage;
