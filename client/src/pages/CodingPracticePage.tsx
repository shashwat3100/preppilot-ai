import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Code2,
  Play,
  Send,
  ChevronRight,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  AlertTriangle,
  Terminal,
  FileCode2,
  Loader2,
  BookOpen,
  ArrowLeft,
  Flame,
  Tag,
  Star,
  Lightbulb,
  Check,
  Building2,
  Timer,
  Award,
  Layers,
  Sparkles,
  RotateCcw,
  Eye,
  BarChart3,
  X,
  Save,
  HelpCircle
} from 'lucide-react';
import { CodeEditor } from '../components/CodeEditor';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CodingProblem {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  branch_id?: string;
  company_id?: string;
  subject_id?: string;
  topic_id?: string;
  tags: string[];
  constraints: string;
  starterCode: Record<string, string>;
  hints?: string[];
  sampleTestCases?: TestCase[];
  editorial?: {
    approach: string;
    timeComplexity: string;
    spaceComplexity: string;
    explanation: string;
  };
  timeLimit: number;
  memoryLimit: number;
  solved: boolean;
  attempts: number;
  isBookmarked?: boolean;
  testCaseCount: number;
  totalSubmissions?: number;
  acceptanceRate?: number | null;
}

interface TestCase {
  id?: string;
  input: string;
  expectedOutput: string;
  explanation?: string;
  isHidden?: boolean;
}

interface TestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  error?: string;
  timedOut?: boolean;
  compileError?: boolean;
  executionTimeMs?: number;
  memoryKb?: number | null;
  isHidden?: boolean;
}

interface Submission {
  id: string;
  status: string;
  code?: string;
  language: string;
  passed_count: number;
  total_count: number;
  execution_time?: number;
  submitted_at: string;
  results?: TestResult[];
}

interface CodingStats {
  totalSubmissions: number;
  acceptedSubmissions: number;
  uniqueProblemsSolved: number;
  byDifficulty: Record<string, number>;
  byLanguage: Record<string, number>;
  acceptanceRate: number | string;
}

interface CodingAssessment {
  id: string;
  title: string;
  description: string;
  company: string;
  duration_minutes: number;
  difficulty: string;
  total_marks: number;
  problem_ids: string[];
  tags: string[];
  completed?: boolean;
  bestScore?: number | null;
  latestAttempt?: any;
}

/* ------------------------------------------------------------------ */
/*  Helpers & Constants                                                */
/* ------------------------------------------------------------------ */

const DIFFICULTY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Easy: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  Medium: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  Hard: { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' },
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ACCEPTED: { label: 'Accepted', color: 'text-emerald-400' },
  WRONG_ANSWER: { label: 'Wrong Answer', color: 'text-rose-400' },
  RUNTIME_ERROR: { label: 'Runtime Error', color: 'text-amber-400' },
  COMPILATION_ERROR: { label: 'Compile Error', color: 'text-rose-400' },
  TIME_LIMIT_EXCEEDED: { label: 'TLE', color: 'text-orange-400' },
  NO_SUBMISSION: { label: 'Unattempted', color: 'text-slate-400' }
};

const COMPANIES = ['All', 'Amazon', 'TCS', 'Infosys', 'Wipro', 'Cognizant', 'Accenture', 'Microsoft'];

const getDraftStorageKey = (userId: string | undefined, problemId: string, lang: string) =>
  `preppilot_draft_${userId || 'guest'}_${problemId}_${lang}`;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const CodingPracticePage: React.FC = () => {
  const { user } = useAuth();

  // Navigation mode: 'practice' | 'assessment'
  const [arenaMode, setArenaMode] = useState<'practice' | 'assessment'>('practice');

  // Problem bank & filters
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem | null>(null);
  const [sampleTestCases, setSampleTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [companyFilter, setCompanyFilter] = useState<string>('All');
  const [onlyBookmarked, setOnlyBookmarked] = useState<boolean>(false);
  const [stats, setStats] = useState<CodingStats | null>(null);

  // Split-pane layout (30% to 70%)
  const [splitWidth, setSplitWidth] = useState<number>(45);
  const isDraggingRef = useRef(false);

  // Workspace Tabs
  const [activeTab, setActiveTab] = useState<'description' | 'hints' | 'editorial' | 'submissions'>('description');
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const [viewingSubmissionCode, setViewingSubmissionCode] = useState<Submission | null>(null);

  // Editor State
  const [language, setLanguage] = useState('c');
  const [code, setCode] = useState('');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runOutput, setRunOutput] = useState('');
  const [runError, setRunError] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | undefined>(undefined);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // Draft Autosave & Reset Modal
  const [draftSavedTimestamp, setDraftSavedTimestamp] = useState<string | null>(null);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  // Assessment Mode State
  const [assessments, setAssessments] = useState<CodingAssessment[]>([]);
  const [activeAssessment, setActiveAssessment] = useState<any | null>(null);
  const [assessmentProblems, setAssessmentProblems] = useState<CodingProblem[]>([]);
  const [activeAssessmentProblemIdx, setActiveAssessmentProblemIdx] = useState(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, { code: string; language: string }>>({});
  const [assessmentAttemptId, setAssessmentAttemptId] = useState<string | null>(null);
  const [assessmentTimeLeft, setAssessmentTimeLeft] = useState<number>(0);
  const [assessmentScorecard, setAssessmentScorecard] = useState<any | null>(null);
  const [submittingAssessment, setSubmittingAssessment] = useState(false);

  // 1. Debounce search input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 2. Fetch problems with AbortController to prevent stale responses
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchProblems = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setFetchError(null);
    try {
      const params: Record<string, string> = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (difficultyFilter) params.difficulty = difficultyFilter;
      if (companyFilter !== 'All') {
        params.company = companyFilter;
        params.tag = companyFilter;
      }
      if (onlyBookmarked) params.bookmarked = 'true';

      const res = await api.getCodingProblems(params);
      const loadedProblems = res.problems || [];
      setProblems(loadedProblems);
      if (selectedProblem) {
        const match = loadedProblems.find((p: any) => p.id === selectedProblem.id);
        if (match && Array.isArray(match.sampleTestCases) && match.sampleTestCases.length > 0) {
          setSampleTestCases(prev => (prev.length === 0 ? match.sampleTestCases : prev));
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setFetchError('Failed to load coding problems. Please check server status.');
      }
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, difficultyFilter, companyFilter, onlyBookmarked, selectedProblem]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.getCodingStats();
      setStats(res);
    } catch (err) {
      console.error('Error fetching coding stats:', err);
    }
  }, []);

  const fetchAssessments = useCallback(async () => {
    try {
      const res = await api.getCodingAssessments();
      setAssessments(res.assessments || []);
    } catch (err) {
      console.error('Error fetching coding assessments:', err);
    }
  }, []);

  useEffect(() => {
    fetchProblems();
    fetchStats();
    fetchAssessments();
  }, [fetchProblems, fetchStats, fetchAssessments]);

  // 3. Dragging Splitter Logic (Bounded 30% to 70%)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = 'col-resize';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const totalWidth = window.innerWidth;
      const newPct = Math.min(Math.max((e.clientX / totalWidth) * 100, 30), 70);
      setSplitWidth(newPct);
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        document.body.style.cursor = 'default';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const DEFAULT_LANGUAGE_STARTERS: Record<string, string> = {
    c: `#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Write your C solution here\n    \n    return 0;\n}`,
    cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    \n    // Write your C++ solution here\n    \n    return 0;\n}`,
    python: `def solve():\n    # Write your Python solution here\n    pass\n\nif __name__ == "__main__":\n    solve()`,
    java: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your Java solution here\n    }\n}`,
    javascript: `// Write your JavaScript solution here\nfunction solve() {\n    \n}\n\nsolve();`
  };

  // 4. Code Draft Autosaving & Loading (Strict language-isolated states)
  const loadCodeForProblemAndLanguage = useCallback((prob: CodingProblem, lang: string) => {
    try {
      const storageKey = getDraftStorageKey(user?.id, prob.id, lang);
      const savedDraft = localStorage.getItem(storageKey);
      if (savedDraft !== null && savedDraft.trim() !== '') {
        setCode(savedDraft);
        setDraftSavedTimestamp('Restored Draft');
        return;
      }
    } catch (e) {
      // Storage unavailable
    }
    const initialStarter = prob.starterCode?.[lang] || DEFAULT_LANGUAGE_STARTERS[lang] || DEFAULT_LANGUAGE_STARTERS.python;
    setCode(initialStarter);
    setDraftSavedTimestamp(null);
  }, [user?.id]);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    if (selectedProblem) {
      try {
        const storageKey = getDraftStorageKey(user?.id, selectedProblem.id, language);
        localStorage.setItem(storageKey, newCode);
        setDraftSavedTimestamp('Autosaved');
      } catch (e) {
        // Storage quota
      }
    }
  }, [selectedProblem, language, user?.id]);

  // 5. Select Problem
  const selectProblem = useCallback(async (problem: CodingProblem) => {
    setSelectedProblem(problem);
    setActiveTab('description');
    setRevealedHints([]);
    setViewingSubmissionCode(null);
    setRunOutput('');
    setRunError('');
    setTestResults([]);
    setExecutionTimeMs(undefined);

    // Immediately load sample test cases from problem object
    if (problem.sampleTestCases && problem.sampleTestCases.length > 0) {
      setSampleTestCases(problem.sampleTestCases);
    }

    loadCodeForProblemAndLanguage(problem, language);

    try {
      const res = await api.getCodingProblem(problem.id);
      if (res && res.problem) {
        setSelectedProblem(prev => ({ ...(prev || problem), ...res.problem, isBookmarked: res.isBookmarked }));
      }
      if (res && Array.isArray(res.sampleTestCases) && res.sampleTestCases.length > 0) {
        setSampleTestCases(res.sampleTestCases);
      }
      if (res && Array.isArray(res.userSubmissions)) {
        setSubmissions(res.userSubmissions);
      }
    } catch (err) {
      console.error('Error fetching problem details:', err);
    }
  }, [language, loadCodeForProblemAndLanguage]);

  // 6. Language Switcher (Preserves Drafts without cross-language corruption)
  const handleLanguageChange = useCallback((newLang: string) => {
    if (newLang === language) return;
    // 1. Immediately persist current code for existing language
    if (selectedProblem && code) {
      try {
        const storageKey = getDraftStorageKey(user?.id, selectedProblem.id, language);
        localStorage.setItem(storageKey, code);
      } catch (e) {}
    }
    // 2. Set new language and load its draft or starter
    setLanguage(newLang);
    if (selectedProblem) {
      loadCodeForProblemAndLanguage(selectedProblem, newLang);
    }
  }, [selectedProblem, language, code, user?.id, loadCodeForProblemAndLanguage]);

  // 7. Reset Code with Confirmation
  const confirmResetCode = useCallback(() => {
    if (!selectedProblem) return;
    try {
      const storageKey = getDraftStorageKey(user?.id, selectedProblem.id, language);
      localStorage.removeItem(storageKey);
    } catch (e) {}
    const starter = selectedProblem.starterCode?.[language] || DEFAULT_LANGUAGE_STARTERS[language] || DEFAULT_LANGUAGE_STARTERS.python;
    setCode(starter);
    setDraftSavedTimestamp('Reset to Default');
    setShowResetConfirmModal(false);
  }, [selectedProblem, language, user?.id]);

  // 8. Bookmark Toggle
  const handleToggleBookmark = useCallback(async (problemId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await api.toggleCodingBookmark(problemId);
      setProblems(prev =>
        prev.map(p => p.id === problemId ? { ...p, isBookmarked: res.isBookmarked } : p)
      );
      if (selectedProblem?.id === problemId) {
        setSelectedProblem(prev => prev ? { ...prev, isBookmarked: res.isBookmarked } : null);
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  }, [selectedProblem]);

  // 9. Run Code
  const handleRun = useCallback(async (codeValue: string, lang: string, customInput?: string) => {
    setRunning(true);
    setRunOutput('');
    setRunError('');
    setTestResults([]);
    setExecutionTimeMs(undefined);
    try {
      const res = await api.runCode(codeValue, lang, customInput || '');
      if (res.success) {
        setRunOutput(res.output || '(Execution completed with no standard output)');
        setExecutionTimeMs(res.executionTimeMs);
      } else {
        setRunError(res.error || 'Execution encountered an error');
        setExecutionTimeMs(res.executionTimeMs);
      }
    } catch (err: any) {
      setRunError(err.message || 'Failed to execute code. Verify server connectivity.');
    } finally {
      setRunning(false);
    }
  }, []);

  // 10. Submit Code
  const handleSubmit = useCallback(async (codeValue: string, lang: string) => {
    if (!selectedProblem) return;
    setSubmitting(true);
    setRunOutput('');
    setRunError('');
    setTestResults([]);
    try {
      const res = await api.submitCode(selectedProblem.id, codeValue, lang);
      if (res.submission) {
        setTestResults(res.submission.results || []);
        setExecutionTimeMs(res.executionTimeMs);
        setSubmissions(prev => [res.submission, ...prev]);
        fetchProblems();
        fetchStats();
      } else if (res.error) {
        setRunError(res.error);
      }
    } catch (err: any) {
      setRunError(err.message || 'Submission failed. Please check backend judge.');
    } finally {
      setSubmitting(false);
    }
  }, [selectedProblem, fetchProblems, fetchStats]);

  // 11. Assessments Execution
  const startAssessment = useCallback(async (asmt: CodingAssessment) => {
    try {
      setLoading(true);
      const res = await api.startCodingAssessment(asmt.id);
      const attempt = res.attempt;
      setAssessmentAttemptId(attempt.id);

      const details = await api.getCodingAssessment(asmt.id);
      setActiveAssessment(details.assessment);
      setAssessmentProblems(details.problems || []);
      setActiveAssessmentProblemIdx(0);
      setAssessmentScorecard(null);

      const startTime = new Date(attempt.start_time).getTime();
      const durationMs = attempt.duration_minutes * 60 * 1000;
      const elapsedMs = Date.now() - startTime;
      const remainSec = Math.max(0, Math.floor((durationMs - elapsedMs) / 1000));
      setAssessmentTimeLeft(remainSec);

      const currentAnswers = attempt.answers || {};
      (details.problems || []).forEach((p: CodingProblem) => {
        if (!currentAnswers[p.id]) {
          currentAnswers[p.id] = {
            code: p.starterCode?.c || '',
            language: 'c'
          };
        }
      });
      setAssessmentAnswers(currentAnswers);
    } catch (err) {
      console.error('Error starting assessment:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!activeAssessment || assessmentScorecard) return;
    const interval = setInterval(() => {
      setAssessmentTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          submitAssessmentAttempt();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeAssessment, assessmentScorecard]);

  const submitAssessmentAttempt = useCallback(async () => {
    if (!activeAssessment || !assessmentAttemptId) return;
    setSubmittingAssessment(true);
    try {
      const res = await api.submitCodingAssessment(activeAssessment.id, {
        attemptId: assessmentAttemptId,
        answers: assessmentAnswers
      });
      setAssessmentScorecard(res);
      fetchAssessments();
      fetchStats();
    } catch (err) {
      console.error('Error submitting assessment:', err);
    } finally {
      setSubmittingAssessment(false);
    }
  }, [activeAssessment, assessmentAttemptId, assessmentAnswers, fetchAssessments, fetchStats]);

  const exitAssessment = useCallback(() => {
    setActiveAssessment(null);
    setAssessmentScorecard(null);
    setAssessmentAttemptId(null);
    setAssessmentAnswers({});
    fetchAssessments();
  }, [fetchAssessments]);

  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearch('');
    setDifficultyFilter('');
    setCompanyFilter('All');
    setOnlyBookmarked(false);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Boolean(searchTerm || difficultyFilter || companyFilter !== 'All' || onlyBookmarked);
  }, [searchTerm, difficultyFilter, companyFilter, onlyBookmarked]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Keyboard shortcut listener (Ctrl/Cmd + Enter for Run)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          handleSubmit(code, language);
        } else {
          handleRun(code, language, '');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, language, handleRun, handleSubmit]);

  // ---- Render: Stats Bar -------------------------------------------
  const renderStatsBar = () => {
    if (!stats) return null;
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] text-center shadow-sm">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Trophy size={16} className="text-amber-500" />
            <span className="text-2xl font-extrabold text-[var(--text-primary)]">{stats.uniqueProblemsSolved}</span>
          </div>
          <span className="text-[11px] text-[var(--text-secondary)] font-medium">Problems Solved</span>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] text-center shadow-sm">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Send size={16} className="text-indigo-400" />
            <span className="text-2xl font-extrabold text-[var(--text-primary)]">{stats.totalSubmissions}</span>
          </div>
          <span className="text-[11px] text-[var(--text-secondary)] font-medium">Submissions</span>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] text-center shadow-sm">
          <div className="flex items-center justify-center gap-2 mb-1">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span className="text-2xl font-extrabold text-[var(--text-primary)]">{stats.acceptanceRate}%</span>
          </div>
          <span className="text-[11px] text-[var(--text-secondary)] font-medium">Acceptance Rate</span>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] text-center shadow-sm">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Flame size={16} className="text-rose-500" />
            <span className="text-2xl font-extrabold text-[var(--text-primary)]">
              {(stats.byDifficulty?.Easy || 0) + (stats.byDifficulty?.Medium || 0) + (stats.byDifficulty?.Hard || 0)}
            </span>
          </div>
          <span className="text-[11px] text-[var(--text-secondary)] font-medium">
            <span className="text-emerald-500 font-bold">{stats.byDifficulty?.Easy || 0}E</span>{' / '}
            <span className="text-amber-500 font-bold">{stats.byDifficulty?.Medium || 0}M</span>{' / '}
            <span className="text-rose-500 font-bold">{stats.byDifficulty?.Hard || 0}H</span>
          </span>
        </div>
      </div>
    );
  };

  // ---- Render: Reset Code Confirmation Modal -----------------------
  const renderResetConfirmModal = () => {
    if (!showResetConfirmModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
        <div className="max-w-md w-full p-6 rounded-3xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-2xl space-y-4">
          <div className="flex items-center gap-3 text-amber-400">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <RotateCcw size={20} />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Reset Code to Default?</h3>
          </div>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Your current code draft for <strong>{selectedProblem?.title} ({language.toUpperCase()})</strong> will be discarded and replaced with the initial boilerplate template. This action cannot be undone.
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              onClick={() => setShowResetConfirmModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={confirmResetCode}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Reset Code
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ---- Render: Assessment Scorecard --------------------------------
  const renderAssessmentScorecard = () => {
    if (!assessmentScorecard) return null;
    const { attempt, results, score, maxScore, percentage, recommendations } = assessmentScorecard;
    const isPassing = percentage >= 60;

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${
              isPassing ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              <Award size={36} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
              {activeAssessment?.title} Completed
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Evaluated on {new Date(attempt?.submitted_at || Date.now()).toLocaleString()}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-center">
              <span className="text-xs text-[var(--text-muted)] font-semibold uppercase">Total Score</span>
              <div className="text-3xl font-black text-[var(--text-primary)] mt-1">
                {score} <span className="text-sm text-[var(--text-muted)] font-normal">/ {maxScore}</span>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-center">
              <span className="text-xs text-[var(--text-muted)] font-semibold uppercase">Accuracy</span>
              <div className={`text-3xl font-black mt-1 ${isPassing ? 'text-emerald-400' : 'text-amber-400'}`}>
                {percentage}%
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-center">
              <span className="text-xs text-[var(--text-muted)] font-semibold uppercase">Verdict</span>
              <div className={`text-xl font-bold mt-2 ${isPassing ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isPassing ? 'Interview Ready' : 'Needs Practice'}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
              Problem Evaluation Breakdown
            </h3>
            <div className="space-y-2">
              {results?.map((res: any, idx: number) => {
                const statusInfo = STATUS_LABELS[res.verdict] || { label: res.verdict, color: 'text-slate-400' };
                return (
                  <div key={idx} className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[var(--text-muted)]">Q{idx + 1}</span>
                        <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">{res.title}</h4>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-[var(--surface-card)] text-[var(--text-secondary)] border border-[var(--surface-border)]">
                          {res.language?.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] mt-1">
                        Passed {res.passedCount} of {res.totalCount} test cases
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-sm font-bold block ${statusInfo.color}`}>{statusInfo.label}</span>
                      <span className="text-xs font-semibold text-[var(--text-muted)]">+{res.score} pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {recommendations && recommendations.length > 0 && (
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <Sparkles size={16} />
                <span>AI Preparation Recommendations</span>
              </div>
              <div className="space-y-2">
                {recommendations.map((rec: any, idx: number) => (
                  <div key={idx} className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    <strong className="text-indigo-300 mr-1.5">• {rec.topic}:</strong>
                    {rec.recommendation}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-4 border-t border-[var(--surface-border)]">
            <button
              onClick={exitAssessment}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Back to Coding Arena
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ---- Render: Active Assessment Workspace -------------------------
  const renderActiveAssessment = () => {
    if (assessmentScorecard) {
      return renderAssessmentScorecard();
    }

    const currentProblem = assessmentProblems[activeAssessmentProblemIdx];
    if (!currentProblem) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-indigo-400" />
        </div>
      );
    }

    const currentAns = assessmentAnswers[currentProblem.id] || {
      code: currentProblem.starterCode?.c || '',
      language: 'c'
    };

    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-[var(--surface-card)]">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--surface-elevated)] border-b border-[var(--surface-border)] gap-4 select-none">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400">
              <Award size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-extrabold text-[var(--text-primary)] truncate">{activeAssessment?.title}</h2>
              <span className="text-[11px] text-[var(--text-muted)] font-medium">Placement Assessment Simulation</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-[var(--surface-card)] p-1 rounded-xl border border-[var(--surface-border)]">
            {assessmentProblems.map((prob, idx) => (
              <button
                key={prob.id}
                onClick={() => setActiveAssessmentProblemIdx(idx)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeAssessmentProblemIdx === idx
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                Q{idx + 1}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs font-bold ${
              assessmentTimeLeft <= 300
                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse'
                : 'bg-[var(--surface-card)] text-amber-400 border-[var(--surface-border)]'
            }`}>
              <Timer size={14} />
              <span>{formatTimer(assessmentTimeLeft)}</span>
            </div>

            <button
              onClick={submitAssessmentAttempt}
              disabled={submittingAssessment}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {submittingAssessment ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Finish & Submit</span>
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
          <div style={{ width: `${splitWidth}%` }} className="h-full overflow-y-auto p-5 border-r border-[var(--surface-border)] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase">
                Question {activeAssessmentProblemIdx + 1} of {assessmentProblems.length}
              </span>
              <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${DIFFICULTY_STYLES[currentProblem.difficulty]?.bg} ${DIFFICULTY_STYLES[currentProblem.difficulty]?.text} ${DIFFICULTY_STYLES[currentProblem.difficulty]?.border}`}>
                {currentProblem.difficulty}
              </span>
            </div>

            <h3 className="text-lg font-extrabold text-[var(--text-primary)]">{currentProblem.title}</h3>

            <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
              {currentProblem.description}
            </div>

            {currentProblem.constraints && (
              <div>
                <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-1.5">Constraints</h4>
                <pre className="text-xs text-[var(--text-secondary)] bg-[var(--surface-elevated)] rounded-lg p-3 border border-[var(--surface-border)] whitespace-pre-wrap">
                  {currentProblem.constraints}
                </pre>
              </div>
            )}

            {currentProblem.sampleTestCases && currentProblem.sampleTestCases.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">Sample Test Cases</h4>
                <div className="space-y-2">
                  {currentProblem.sampleTestCases.map((tc, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-xs font-mono">
                      <span className="text-[10px] text-[var(--text-muted)] block uppercase font-bold mb-1">Example {idx + 1}</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-[var(--text-muted)] block">Input:</span>
                          <pre className="text-[var(--text-primary)]">{tc.input}</pre>
                        </div>
                        <div>
                          <span className="text-[10px] text-[var(--text-muted)] block">Expected Output:</span>
                          <pre className="text-emerald-400">{tc.expectedOutput}</pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div
            onMouseDown={handleMouseDown}
            className="w-1.5 hover:w-2 bg-[var(--surface-border)] hover:bg-indigo-500 cursor-col-resize transition-all hidden lg:block z-20"
            title="Drag to resize panes"
          />

          <div style={{ width: `${100 - splitWidth}%` }} className="h-full flex flex-col min-w-0 min-h-0">
            <CodeEditor
              language={currentAns.language}
              onLanguageChange={(newLang) => {
                setAssessmentAnswers(prev => ({
                  ...prev,
                  [currentProblem.id]: {
                    language: newLang,
                    code: currentProblem.starterCode?.[newLang] || prev[currentProblem.id]?.code || ''
                  }
                }));
              }}
              code={currentAns.code}
              onCodeChange={(newCode) => {
                setAssessmentAnswers(prev => ({
                  ...prev,
                  [currentProblem.id]: {
                    ...prev[currentProblem.id],
                    code: newCode
                  }
                }));
              }}
              onRun={(c, l, inp) => handleRun(c, l, inp)}
              onSubmit={(c, l) => handleRun(c, l, '')}
              running={running}
              submitting={false}
              runOutput={runOutput}
              runError={runError}
              sampleTestCases={currentProblem.sampleTestCases || []}
              height="100%"
            />
          </div>
        </div>
      </div>
    );
  };

  // ---- Render: Assessments List View -------------------------------
  const renderAssessmentsList = () => (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/10 border border-indigo-500/20">
              <Award size={22} className="text-indigo-400" />
            </div>
            Company-Style Timed Assessments
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1.5">
            Real simulated placement coding rounds with strict countdown timers and automated test judging
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {assessments.map(asmt => (
          <div
            key={asmt.id}
            className="p-5 rounded-3xl bg-[var(--surface-card)] border border-[var(--surface-border)] hover:border-indigo-500/40 transition-all flex flex-col justify-between shadow-sm group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">
                  <Building2 size={12} />
                  {asmt.company}
                </span>
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Clock size={12} />
                  {asmt.duration_minutes} Mins
                </span>
              </div>

              <h3 className="text-base font-extrabold text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors">
                {asmt.title}
              </h3>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {asmt.description}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {asmt.tags?.map(t => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--surface-border)]">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-5 mt-5 border-t border-[var(--surface-border)] flex items-center justify-between">
              <div>
                {asmt.bestScore !== null && asmt.bestScore !== undefined ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    Best: {asmt.bestScore} pts
                  </span>
                ) : (
                  <span className="text-xs text-[var(--text-muted)]">Not attempted yet</span>
                )}
              </div>

              <button
                onClick={() => startAssessment(asmt)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Play size={12} className="fill-current" />
                <span>Start Assessment</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ---- Render: Problem Bank View -----------------------------------
  const renderProblemList = () => (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/10 border border-indigo-500/20">
              <Code2 size={22} className="text-indigo-400" />
            </div>
            PrepPilot AI Coding Arena
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1.5">
            Production-grade coding workspace with Monaco Editor, Sandboxed Judging, and Company Placement Assessments
          </p>
        </div>

        <div className="flex items-center p-1 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl shadow-sm">
          <button
            onClick={() => setArenaMode('practice')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              arenaMode === 'practice'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Code2 size={13} />
            <span>Problem Bank</span>
          </button>
          <button
            onClick={() => setArenaMode('assessment')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              arenaMode === 'assessment'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Timer size={13} />
            <span>Mock Assessments</span>
          </button>
        </div>
      </div>

      {arenaMode === 'assessment' ? (
        renderAssessmentsList()
      ) : (
        <>
          {renderStatsBar()}

          <div className="space-y-3 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search problems by title, tags, or patterns..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <button
                onClick={() => setOnlyBookmarked(!onlyBookmarked)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  onlyBookmarked
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : 'bg-[var(--surface-card)] text-[var(--text-secondary)] border-[var(--surface-border)] hover:text-[var(--text-primary)]'
                }`}
                title="Filter by bookmarked problems"
              >
                <Star size={13} className={onlyBookmarked ? 'fill-current' : ''} />
                <span>Bookmarked</span>
              </button>

              <div className="flex gap-1.5">
                {['', 'Easy', 'Medium', 'Hard'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficultyFilter(d)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                      difficultyFilter === d
                        ? d === '' ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40'
                          : `${DIFFICULTY_STYLES[d]?.bg} ${DIFFICULTY_STYLES[d]?.text} ${DIFFICULTY_STYLES[d]?.border}`
                        : 'bg-[var(--surface-card)] text-[var(--text-secondary)] border-[var(--surface-border)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {d || 'All Difficulties'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-[var(--text-muted)] font-medium flex items-center gap-1 flex-shrink-0">
                <Building2 size={12} />
                Company:
              </span>
              {COMPANIES.map(comp => (
                <button
                  key={comp}
                  onClick={() => setCompanyFilter(comp)}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap border text-[11px] font-semibold ${
                    companyFilter === comp
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                      : 'bg-[var(--surface-card)] text-[var(--text-secondary)] border-[var(--surface-border)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {comp}
                </button>
              ))}
            </div>

            {/* Active Filters Bar with One-Click Reset */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-[var(--text-muted)] font-medium">Active Filters:</span>
                {debouncedSearch && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[var(--surface-card)] text-[var(--text-primary)] border border-[var(--surface-border)]">
                    Query: "{debouncedSearch}"
                    <button onClick={() => setSearchTerm('')} className="hover:text-rose-400 cursor-pointer ml-1">
                      <X size={11} />
                    </button>
                  </span>
                )}
                {difficultyFilter && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[var(--surface-card)] text-[var(--text-primary)] border border-[var(--surface-border)]">
                    Difficulty: {difficultyFilter}
                    <button onClick={() => setDifficultyFilter('')} className="hover:text-rose-400 cursor-pointer ml-1">
                      <X size={11} />
                    </button>
                  </span>
                )}
                {companyFilter !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[var(--surface-card)] text-[var(--text-primary)] border border-[var(--surface-border)]">
                    Company: {companyFilter}
                    <button onClick={() => setCompanyFilter('All')} className="hover:text-rose-400 cursor-pointer ml-1">
                      <X size={11} />
                    </button>
                  </span>
                )}
                {onlyBookmarked && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    Bookmarked Only
                    <button onClick={() => setOnlyBookmarked(false)} className="hover:text-rose-400 cursor-pointer ml-1">
                      <X size={11} />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-rose-400 hover:text-rose-300 underline font-semibold ml-auto cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-indigo-400" />
            </div>
          ) : fetchError ? (
            <div className="text-center py-16 p-8 rounded-3xl bg-[var(--surface-card)] border border-rose-500/30 space-y-3">
              <AlertTriangle size={36} className="mx-auto text-rose-400" />
              <h3 className="text-base font-bold text-[var(--text-primary)]">{fetchError}</h3>
              <button
                onClick={fetchProblems}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : problems.length === 0 ? (
            <div className="text-center py-16 p-8 rounded-3xl bg-[var(--surface-card)] border border-[var(--surface-border)]">
              <Code2 size={36} className="mx-auto text-indigo-400 mb-3 opacity-60" />
              <h3 className="text-base font-bold text-[var(--text-primary)]">No matching problems found</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Try adjusting your active filters.</p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="mt-3 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {problems.map((problem, idx) => {
                const style = DIFFICULTY_STYLES[problem.difficulty] || DIFFICULTY_STYLES.Easy;
                return (
                  <div
                    key={problem.id}
                    onClick={() => selectProblem(problem)}
                    className="w-full text-left p-4 sm:p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] hover:border-indigo-500/40 hover:bg-[var(--surface-hover)] transition-all group cursor-pointer shadow-sm flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        problem.solved
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--surface-border)]'
                      }`}>
                        {problem.solved ? <CheckCircle2 size={16} /> : <span>{idx + 1}</span>}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors truncate">
                            {problem.title}
                          </h3>
                        </div>

                        <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-1">
                          {problem.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mt-2.5">
                          {problem.tags?.slice(0, 4).map(tag => (
                            <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--surface-elevated)] text-[var(--text-secondary)] text-[10px] font-medium border border-[var(--surface-border)]">
                              <Tag size={9} />
                              {tag}
                            </span>
                          ))}

                          {problem.acceptanceRate !== null && problem.acceptanceRate !== undefined && (
                            <span className="text-[10px] text-[var(--text-muted)] font-medium flex items-center gap-1">
                              <BarChart3 size={10} />
                              {problem.acceptanceRate}% Acceptance
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => handleToggleBookmark(problem.id, e)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          problem.isBookmarked
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'text-[var(--text-muted)] hover:text-amber-400 border-transparent hover:bg-[var(--surface-card)]'
                        }`}
                        title={problem.isBookmarked ? 'Remove bookmark' : 'Bookmark problem'}
                      >
                        <Star size={14} className={problem.isBookmarked ? 'fill-current' : ''} />
                      </button>

                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${style.bg} ${style.text} ${style.border}`}>
                        {problem.difficulty}
                      </span>

                      <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );

  // ---- Render: Problem Workspace -----------------------------------
  const renderProblemWorkspace = () => {
    if (!selectedProblem) return null;
    const diffStyle = DIFFICULTY_STYLES[selectedProblem.difficulty] || DIFFICULTY_STYLES.Easy;

    return (
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-[var(--surface-card)]">
        {/* Left Pane */}
        <div
          style={{ width: window.innerWidth >= 1024 ? `${splitWidth}%` : '100%' }}
          className="h-full flex flex-col border-r border-[var(--surface-border)] overflow-hidden bg-[var(--surface-card)]"
        >
          <div className="p-4 border-b border-[var(--surface-border)] bg-[var(--surface-card)]/95 backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setSelectedProblem(null)}
                className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-indigo-400 transition-colors cursor-pointer font-semibold"
              >
                <ArrowLeft size={14} />
                <span>Problem Bank</span>
              </button>

              <div className="flex items-center gap-2">
                {draftSavedTimestamp && (
                  <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 font-mono">
                    <Save size={10} className="text-emerald-400" />
                    {draftSavedTimestamp}
                  </span>
                )}
                <button
                  onClick={(e) => handleToggleBookmark(selectedProblem.id, e)}
                  className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    selectedProblem.isBookmarked
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'text-[var(--text-secondary)] hover:text-amber-400 border-[var(--surface-border)]'
                  }`}
                >
                  <Star size={13} className={selectedProblem.isBookmarked ? 'fill-current' : ''} />
                  <span>{selectedProblem.isBookmarked ? 'Saved' : 'Bookmark'}</span>
                </button>
              </div>
            </div>

            <h2 className="text-lg font-extrabold text-[var(--text-primary)] leading-tight">
              {selectedProblem.title}
            </h2>

            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${diffStyle.bg} ${diffStyle.text} ${diffStyle.border}`}>
                {selectedProblem.difficulty}
              </span>
              <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 font-mono">
                <Clock size={11} />
                {selectedProblem.timeLimit}ms
              </span>
              <span className="text-[11px] text-[var(--text-muted)] font-mono">
                {selectedProblem.memoryLimit}MB
              </span>
              {selectedProblem.solved && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                  <CheckCircle2 size={11} />
                  Solved
                </span>
              )}
            </div>

            <div className="flex gap-1.5 mt-3 pt-3 border-t border-[var(--surface-border)]">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'description'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <BookOpen size={12} />
                <span>Description</span>
              </button>

              <button
                onClick={() => setActiveTab('hints')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'hints'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Lightbulb size={12} />
                <span>Hints ({selectedProblem.hints?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('editorial')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'editorial'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Layers size={12} />
                <span>Editorial</span>
              </button>

              <button
                onClick={() => setActiveTab('submissions')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'submissions'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Send size={12} />
                <span>Submissions ({submissions.length})</span>
              </button>
            </div>
          </div>

          <div className="flex-1 p-5 overflow-y-auto space-y-5">
            {activeTab === 'description' && (
              <div className="space-y-5">
                <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                  {selectedProblem.description}
                </div>

                {selectedProblem.constraints && (
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <AlertTriangle size={12} className="text-amber-400" />
                      Constraints
                    </h4>
                    <pre className="text-xs text-[var(--text-secondary)] bg-[var(--surface-elevated)] rounded-xl p-3 border border-[var(--surface-border)] whitespace-pre-wrap font-mono">
                      {selectedProblem.constraints}
                    </pre>
                  </div>
                )}

                {sampleTestCases.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Terminal size={12} className="text-cyan-400" />
                      Sample Test Cases
                    </h4>
                    <div className="space-y-3">
                      {sampleTestCases.map((tc, idx) => (
                        <div key={tc.id || idx} className="rounded-2xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] overflow-hidden font-mono text-xs">
                          <div className="px-3.5 py-1.5 bg-[var(--surface-card)] border-b border-[var(--surface-border)] text-[11px] font-bold text-[var(--text-secondary)]">
                            Example {idx + 1}
                          </div>
                          <div className="p-3.5 space-y-2">
                            <div>
                              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Input:</span>
                              <pre className="text-[var(--text-primary)] mt-0.5 whitespace-pre-wrap">{tc.input || '(empty)'}</pre>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Output:</span>
                              <pre className="text-emerald-400 mt-0.5 whitespace-pre-wrap">{tc.expectedOutput}</pre>
                            </div>
                            {tc.explanation && (
                              <div className="font-sans">
                                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Explanation:</span>
                                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{tc.explanation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProblem.tags?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">Topic & Company Tags</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProblem.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--surface-elevated)] text-[var(--text-secondary)] text-[11px] font-medium border border-[var(--surface-border)]">
                          <Tag size={10} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'hints' && (
              <div className="space-y-4">
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Progressive hints guide your problem-solving process without prematurely revealing the solution code.
                </p>

                {(!selectedProblem.hints || selectedProblem.hints.length === 0) ? (
                  <div className="text-xs text-[var(--text-muted)] text-center py-8">
                    No hints configured for this problem.
                  </div>
                ) : (
                  selectedProblem.hints.map((hint, idx) => {
                    const isRevealed = revealedHints.includes(idx);
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                            <Lightbulb size={13} />
                            Hint {idx + 1}
                          </span>
                          {!isRevealed && (
                            <button
                              onClick={() => setRevealedHints(prev => [...prev, idx])}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Reveal Hint
                            </button>
                          )}
                        </div>

                        {isRevealed ? (
                          <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                            {hint}
                          </p>
                        ) : (
                          <p className="text-xs text-[var(--text-muted)] italic">
                            Click 'Reveal Hint' when you get stuck.
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'editorial' && (
              <div className="space-y-4">
                {selectedProblem.editorial ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] space-y-3">
                      <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Official Approach</span>
                      <h3 className="text-base font-extrabold text-[var(--text-primary)]">
                        {selectedProblem.editorial.approach}
                      </h3>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="p-2.5 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)]">
                          <span className="text-[10px] text-[var(--text-muted)] block uppercase font-bold">Time Complexity</span>
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            {selectedProblem.editorial.timeComplexity}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)]">
                          <span className="text-[10px] text-[var(--text-muted)] block uppercase font-bold">Space Complexity</span>
                          <span className="text-xs font-mono font-bold text-cyan-400">
                            {selectedProblem.editorial.spaceComplexity}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] space-y-2">
                      <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                        Algorithmic Explanation
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {selectedProblem.editorial.explanation}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-[var(--text-muted)]">
                    Official editorial is being prepared by the PrepPilot content team.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="space-y-3">
                {submissions.length === 0 ? (
                  <div className="text-center py-12 text-xs text-[var(--text-muted)]">
                    No submissions recorded yet. Write your code and click Submit.
                  </div>
                ) : (
                  submissions.map((sub) => {
                    const statusInfo = STATUS_LABELS[sub.status] || { label: sub.status, color: 'text-slate-400' };
                    return (
                      <div
                        key={sub.id}
                        className="p-3.5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${statusInfo.color}`}>{statusInfo.label}</span>
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {new Date(sub.submitted_at).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded bg-[var(--surface-card)] text-[10px] font-mono">
                              {sub.language.toUpperCase()}
                            </span>
                            <span>•</span>
                            <span>{sub.passed_count}/{sub.total_count} tests passed</span>
                            {sub.execution_time !== undefined && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-[11px]">{sub.execution_time}ms</span>
                              </>
                            )}
                          </div>

                          {sub.code && (
                            <button
                              onClick={() => setViewingSubmissionCode(viewingSubmissionCode?.id === sub.id ? null : sub)}
                              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                            >
                              <Eye size={12} />
                              <span>{viewingSubmissionCode?.id === sub.id ? 'Hide' : 'View Code'}</span>
                            </button>
                          )}
                        </div>

                        {viewingSubmissionCode?.id === sub.id && sub.code && (
                          <div className="mt-2 pt-2 border-t border-[var(--surface-border)]">
                            <pre className="p-3 rounded-xl bg-[var(--surface-card)] font-mono text-xs text-[var(--text-primary)] overflow-auto max-h-48 whitespace-pre-wrap">
                              {sub.code}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Resizable Divider Handle (Hidden on mobile) */}
        <div
          onMouseDown={handleMouseDown}
          className="w-1.5 hover:w-2 bg-[var(--surface-border)] hover:bg-indigo-500 cursor-col-resize transition-all hidden lg:block z-20"
          title="Drag to resize panes"
        />

        {/* Right Pane: Code Editor */}
        <div
          style={{ width: window.innerWidth >= 1024 ? `${100 - splitWidth}%` : '100%' }}
          className="h-full flex flex-col min-w-0 min-h-0 bg-[var(--surface-card)]"
        >
          <CodeEditor
            language={language}
            onLanguageChange={handleLanguageChange}
            code={code}
            onCodeChange={handleCodeChange}
            onReset={() => setShowResetConfirmModal(true)}
            onRun={handleRun}
            onSubmit={handleSubmit}
            running={running}
            submitting={submitting}
            runOutput={runOutput}
            runError={runError}
            testResults={testResults}
            executionTimeMs={executionTimeMs}
            sampleTestCases={sampleTestCases}
            height="100%"
          />
        </div>

        {renderResetConfirmModal()}
      </div>
    );
  };

  // ---- Main Return -------------------------------------------------
  if (activeAssessment) {
    return renderActiveAssessment();
  }

  return selectedProblem ? renderProblemWorkspace() : renderProblemList();
};

export default CodingPracticePage;
