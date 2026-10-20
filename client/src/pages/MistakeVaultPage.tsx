import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import { useVoice } from '../context/VoiceContext';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Sparkles,
  Search,
  Filter,
  Play,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Flame,
  Zap,
  Check,
  RefreshCw,
  SlidersHorizontal,
  FolderOpen
} from 'lucide-react';

interface MistakeOption {
  option_key: string;
  option_text: string;
  is_correct: boolean;
}

interface MistakeItem {
  vault_id: string;
  question_id: string;
  question: string;
  question_type: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  expected_time: number;
  xp_value: number;
  subject_id: string;
  subject_name: string;
  topic_id: string;
  topic_name: string;
  company_name: string | null;
  options: MistakeOption[];
  correct_answer: string;
  correct_text: string;
  last_chosen_answer: string;
  last_chosen_text: string;
  why_incorrect: string;
  why_correct: string;
  explanation: string;
  mistake_count: number;
  mastery_status: 'unresolved' | 'mastered';
  mastered_at: string | null;
  created_at: string;
  updated_at: string;
}

interface MistakeSubjectStat {
  id: string;
  name: string;
  total: number;
  unresolved: number;
  mastered: number;
}

interface DrillQuestion {
  id: string;
  sequence: number;
  question: string;
  difficulty: string;
  subject_name: string;
  topic_name: string;
  company_name: string;
  previous_mistake_count: number;
  last_chosen_answer: string;
  options: {
    option_key: string;
    option_text: string;
  }[];
}

interface DrillResult {
  session_id: string;
  status: string;
  total_questions: number;
  correct_count: number;
  newly_mastered_count: number;
  accuracy_rate: number;
  xp_earned: number;
  time_taken_seconds: number;
  graded_questions: {
    question_id: string;
    sequence: number;
    question: string;
    chosen_answer: string;
    chosen_text: string;
    correct_answer: string;
    correct_text: string;
    is_correct: boolean;
    is_mastered_now: boolean;
    why_correct: string;
    why_incorrect: string;
    explanation: string;
    subject_name: string;
    topic_name: string;
  }[];
}

interface MistakeVaultPageProps {
  onNavigateTab?: (tab: string) => void;
}

export const MistakeVaultPage: React.FC<MistakeVaultPageProps> = ({ onNavigateTab }) => {
  const { speakText, stopSpeaking, isSpeaking } = useVoice();

  // Vault state
  const [loading, setLoading] = useState(true);
  const [mistakes, setMistakes] = useState<MistakeItem[]>([]);
  const [subjects, setSubjects] = useState<MistakeSubjectStat[]>([]);
  const [stats, setStats] = useState({
    total_recorded: 0,
    unresolved_count: 0,
    mastered_count: 0,
    mastery_rate: 0
  });

  // Filters & controls
  const [activeStatus, setActiveStatus] = useState<'unresolved' | 'mastered' | 'all'>('unresolved');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);

  // Revision Drill State
  const [isDrillActive, setIsDrillActive] = useState(false);
  const [drillLoading, setDrillLoading] = useState(false);
  const [drillSessionId, setDrillSessionId] = useState<string | null>(null);
  const [drillQuestions, setDrillQuestions] = useState<DrillQuestion[]>([]);
  const [drillCurrentIdx, setDrillCurrentIdx] = useState(0);
  const [drillAnswers, setDrillAnswers] = useState<Record<string, string>>({});
  const [drillTimeRemaining, setDrillTimeRemaining] = useState(0);
  const [drillTotalTime, setDrillTotalTime] = useState(0);
  const [drillSubmitting, setDrillSubmitting] = useState(false);
  const [drillResult, setDrillResult] = useState<DrillResult | null>(null);
  const [drillQuestionCount, setDrillQuestionCount] = useState<number>(5);

  const timerRef = useRef<any>(null);

  // Load vault data
  const loadMistakeVault = async () => {
    setLoading(true);
    try {
      const res = await api.getMistakeVault({
        status: activeStatus,
        subject_id: selectedSubject !== 'all' ? selectedSubject : undefined,
        search: searchQuery.trim() || undefined
      });

      if (res.success) {
        setMistakes(res.mistakes || []);
        setSubjects(res.subjects || []);
        if (res.stats) {
          setStats(res.stats);
        }
      }
    } catch (err) {
      console.error('Failed to load mistake vault:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMistakeVault();
  }, [activeStatus, selectedSubject]);

  // Handle Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadMistakeVault();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Card Expand Toggle
  const toggleCardExpand = (qid: string) => {
    setExpandedCards(prev => {
      const updated = new Set(prev);
      if (updated.has(qid)) updated.delete(qid);
      else updated.add(qid);
      return updated;
    });
  };

  // Toggle Mastery Status
  const handleToggleMastery = async (qid: string) => {
    try {
      const res = await api.toggleMistakeMastery(qid);
      if (res.success) {
        setMistakes(prev =>
          prev.map(item =>
            item.question_id === qid
              ? { ...item, mastery_status: res.mastery_status }
              : item
          )
        );
        loadMistakeVault();
      }
    } catch (err) {
      console.error('Failed to toggle mastery:', err);
    }
  };

  // Voice narration of mistake explanation
  const handleAudioNarration = (item: MistakeItem) => {
    if (currentlySpeakingId === item.question_id && isSpeaking) {
      stopSpeaking();
      setCurrentlySpeakingId(null);
      return;
    }

    const narrationText = `Question analysis for ${item.subject_name}. ${item.question}. ${item.why_incorrect} ${item.why_correct} ${item.explanation || ''}`;
    setCurrentlySpeakingId(item.question_id);
    speakText(narrationText);
  };

  // ==========================================
  // REVISION DRILL LOGIC
  // ==========================================
  const handleStartRevisionDrill = async () => {
    setDrillLoading(true);
    try {
      const res = await api.startMistakeDrill(
        drillQuestionCount,
        selectedSubject !== 'all' ? selectedSubject : undefined
      );

      if (res.success && res.questions && res.questions.length > 0) {
        setDrillSessionId(res.session_id);
        setDrillQuestions(res.questions);
        setDrillAnswers({});
        setDrillCurrentIdx(0);
        const allocatedSeconds = (res.duration_minutes || 5) * 60;
        setDrillTimeRemaining(allocatedSeconds);
        setDrillTotalTime(allocatedSeconds);
        setDrillResult(null);
        setIsDrillActive(true);
      } else {
        alert(res.message || 'No unresolved mistakes available for the drill.');
      }
    } catch (err) {
      console.error('Error starting revision drill:', err);
    } finally {
      setDrillLoading(false);
    }
  };

  // Drill Timer
  useEffect(() => {
    if (!isDrillActive || drillResult) return;

    timerRef.current = setInterval(() => {
      setDrillTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmitDrill();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isDrillActive, drillResult]);

  // Keyboard navigation during drill
  useEffect(() => {
    if (!isDrillActive || drillResult) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentQ = drillQuestions[drillCurrentIdx];
      if (!currentQ) return;

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        setDrillAnswers(prev => ({ ...prev, [currentQ.id]: key }));
      } else if (['1', '2', '3', '4'].includes(key)) {
        const map = ['A', 'B', 'C', 'D'];
        setDrillAnswers(prev => ({ ...prev, [currentQ.id]: map[parseInt(key) - 1] }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrillActive, drillCurrentIdx, drillQuestions, drillResult]);

  const handleSubmitDrill = async () => {
    if (!drillSessionId || drillSubmitting) return;

    setDrillSubmitting(true);
    try {
      const formattedAnswers = Object.entries(drillAnswers).map(([qid, ans]) => ({
        question_id: qid,
        answer: ans,
        time_spent: 30
      }));

      const timeTaken = drillTotalTime - drillTimeRemaining;
      const res = await api.submitMistakeDrill(drillSessionId, formattedAnswers, timeTaken);

      if (res.success && res.result) {
        setDrillResult(res.result);
        if (res.result.newly_mastered_count > 0) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
        // Refresh vault data in background
        loadMistakeVault();
      }
    } catch (err) {
      console.error('Error submitting revision drill:', err);
    } finally {
      setDrillSubmitting(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-150">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. HEADER SECTION & SPACED REPETITION CONTEXT                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-[var(--surface-border)]">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
              <RotateCcw size={13} /> Spaced Repetition & Revision Locker
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              Automated Error Capture across Quizzes, Tests & Aptitude
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Mistake Vault & Revision Drill
          </h1>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            Every question you've previously answered incorrectly is gathered here. Review why your selected option was wrong, master the correct logic, and launch targeted revision drills to convert mistakes into 100% mastery.
          </p>
        </div>

        {/* Global Live Stats Cards */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="px-4 py-2.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xs text-center min-w-[90px]">
            <div className="flex items-center justify-center gap-1 text-rose-400 text-xs font-bold">
              <AlertTriangle size={14} />
              <span>{stats.unresolved_count}</span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)]">Unresolved</span>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xs text-center min-w-[90px]">
            <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs font-bold">
              <CheckCircle2 size={14} />
              <span>{stats.mastered_count}</span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)]">Mastered</span>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xs text-center min-w-[90px]">
            <div className="flex items-center justify-center gap-1 text-indigo-400 text-xs font-bold">
              <Sparkles size={14} />
              <span>{stats.mastery_rate}%</span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)]">Mastery Rate</span>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. REVISION DRILL ACTIVE RUNNER (MODAL / OVERLAY)             */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isDrillActive && !drillResult && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface-card)] border border-indigo-500/40 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-4 border-b border-[var(--surface-border)] pb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">
                Drill Question {drillCurrentIdx + 1} of {drillQuestions.length}
              </span>
              <span className="text-xs text-[var(--text-muted)] hidden sm:inline">
                Answered: {Object.keys(drillAnswers).length} / {drillQuestions.length}
              </span>
            </div>

            {/* Countdown timer */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-sm font-extrabold border ${
                drillTimeRemaining <= 60
                  ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 animate-pulse'
                  : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
              }`}
            >
              <Clock size={15} />
              <span>{formatSeconds(drillTimeRemaining)}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (confirm('Exit revision drill? Your progress on this session will not be submitted.')) {
                    setIsDrillActive(false);
                  }
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-white hover:bg-[var(--surface-hover)]"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDrill}
                disabled={drillSubmitting}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check size={14} />
                <span>{drillSubmitting ? 'Evaluating...' : 'Submit Drill'}</span>
              </button>
            </div>
          </div>

          {/* Drill Question Statement & Options */}
          {drillQuestions[drillCurrentIdx] && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {drillQuestions[drillCurrentIdx].subject_name} • {drillQuestions[drillCurrentIdx].topic_name}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[var(--surface-elevated)] text-[var(--text-secondary)]">
                    {drillQuestions[drillCurrentIdx].difficulty}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    Missed {drillQuestions[drillCurrentIdx].previous_mistake_count}x previously
                  </span>
                </div>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] leading-relaxed whitespace-pre-line">
                {drillQuestions[drillCurrentIdx].question}
              </h3>

              {/* Options */}
              <div className="space-y-3">
                {drillQuestions[drillCurrentIdx].options.map(opt => {
                  const isSelected = drillAnswers[drillQuestions[drillCurrentIdx].id] === opt.option_key;
                  return (
                    <button
                      key={opt.option_key}
                      onClick={() =>
                        setDrillAnswers(prev => ({
                          ...prev,
                          [drillQuestions[drillCurrentIdx].id]: opt.option_key
                        }))
                      }
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-3.5 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600/15 border-indigo-500 ring-2 ring-indigo-500/20'
                          : 'bg-[var(--surface-elevated)] border-[var(--surface-border)] hover:border-indigo-500/40'
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-[var(--surface-card)] text-[var(--text-secondary)] border border-[var(--surface-border)]'
                        }`}
                      >
                        {opt.option_key}
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-[var(--text-primary)]">
                        {opt.option_text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Question Navigation Palette */}
              <div className="pt-4 border-t border-[var(--surface-border)] flex items-center justify-between gap-4">
                <button
                  onClick={() => setDrillCurrentIdx(prev => Math.max(0, prev - 1))}
                  disabled={drillCurrentIdx === 0}
                  className="px-4 py-2 rounded-xl bg-[var(--surface-elevated)] text-[var(--text-primary)] disabled:opacity-30 border border-[var(--surface-border)] text-xs font-bold"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  {drillQuestions.map((q, idx) => {
                    const isAnswered = Boolean(drillAnswers[q.id]);
                    const isCurrent = drillCurrentIdx === idx;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setDrillCurrentIdx(idx)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                          isCurrent
                            ? 'ring-2 ring-indigo-500 bg-indigo-600 text-white'
                            : isAnswered
                            ? 'bg-emerald-500 text-white'
                            : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--surface-border)]'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setDrillCurrentIdx(prev => Math.min(drillQuestions.length - 1, prev + 1))}
                  disabled={drillCurrentIdx === drillQuestions.length - 1}
                  className="px-4 py-2 rounded-xl bg-indigo-600/10 text-indigo-400 disabled:opacity-30 border border-indigo-500/20 text-xs font-bold"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2B. REVISION DRILL RESULTS SCORECARD                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isDrillActive && drillResult && (
        <div className="p-8 sm:p-10 rounded-3xl bg-[var(--surface-card)] border border-emerald-500/40 shadow-2xl space-y-8 animate-in zoom-in-95 duration-200">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Award size={32} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
              Revision Drill Complete!
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-lg mx-auto">
              {drillResult.newly_mastered_count > 0
                ? `Fantastic job! You successfully mastered ${drillResult.newly_mastered_count} previously missed questions and earned +${drillResult.xp_earned} XP.`
                : 'Review the detailed breakdowns below to master these concepts on your next drill.'}
            </p>
          </div>

          {/* Drill Result Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-center">
              <span className="text-2xl font-extrabold text-emerald-400">
                {drillResult.newly_mastered_count}
              </span>
              <span className="block text-[11px] text-[var(--text-muted)] mt-1">Newly Mastered</span>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-center">
              <span className="text-2xl font-extrabold text-indigo-400">
                {drillResult.accuracy_rate}%
              </span>
              <span className="block text-[11px] text-[var(--text-muted)] mt-1">Drill Accuracy</span>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-center">
              <span className="text-2xl font-extrabold text-amber-400">
                +{drillResult.xp_earned}
              </span>
              <span className="block text-[11px] text-[var(--text-muted)] mt-1">XP Earned</span>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-center">
              <span className="text-2xl font-extrabold text-cyan-400">
                {formatSeconds(drillResult.time_taken_seconds)}
              </span>
              <span className="block text-[11px] text-[var(--text-muted)] mt-1">Time Elapsed</span>
            </div>
          </div>

          {/* Question by question drill review */}
          <div className="space-y-4 pt-4 border-t border-[var(--surface-border)]">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Drill Questions Breakdown
            </h3>

            <div className="space-y-4">
              {drillResult.graded_questions?.map((g, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border ${
                    g.is_correct
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : 'bg-rose-500/5 border-rose-500/20'
                  } space-y-3`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-secondary)]">
                      Question #{idx + 1} • {g.subject_name} ({g.topic_name})
                    </span>
                    <span
                      className={`text-xs font-bold flex items-center gap-1 ${
                        g.is_correct ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {g.is_correct ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      {g.is_correct ? 'Mastered (+35 XP)' : 'Needs Another Drill'}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {g.question}
                  </p>

                  <div className="text-xs space-y-1">
                    <div>
                      <span className="text-[var(--text-muted)]">Your Selection: </span>
                      <span className={g.is_correct ? 'font-bold text-emerald-400' : 'font-bold text-rose-400'}>
                        {g.chosen_text || 'No response'}
                      </span>
                    </div>
                    {!g.is_correct && (
                      <div>
                        <span className="text-[var(--text-muted)]">Correct Option: </span>
                        <span className="font-bold text-emerald-400">{g.correct_text}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)] text-xs text-[var(--text-secondary)] space-y-1.5">
                    {!g.is_correct && (
                      <p className="text-rose-300 leading-relaxed">
                        <strong>Why your choice was incorrect: </strong> {g.why_incorrect}
                      </p>
                    )}
                    <p className="text-emerald-300 leading-relaxed">
                      <strong>Why correct answer is right: </strong> {g.why_correct}
                    </p>
                    {g.explanation && (
                      <p className="text-slate-300 leading-relaxed pt-1 border-t border-[var(--surface-border)]">
                        <strong>Curriculum Derivation: </strong> {g.explanation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-center gap-4">
            <button
              onClick={() => {
                setDrillResult(null);
                handleStartRevisionDrill();
              }}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              Drill More Mistakes
            </button>
            <button
              onClick={() => {
                setIsDrillActive(false);
                setDrillResult(null);
              }}
              className="px-6 py-2.5 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] font-bold text-xs border border-[var(--surface-border)] cursor-pointer"
            >
              Return to Mistake Vault
            </button>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. PRIMARY ACTION & DRILL LAUNCHPAD BANNER                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      {!isDrillActive && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-[var(--surface-card)] to-purple-950/30 border border-indigo-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {stats.unresolved_count > 0 ? `${stats.unresolved_count} Mistakes Ready for Mastery` : 'All Mistakes Mastered!'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              Ready to Clear Your Mistakes?
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Launch a smart revision drill focused specifically on your unresolved errors. Answering correctly marks them as mastered and grants bonus XP.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            {/* Question count selector */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-xs font-semibold">
              <span className="px-2 text-[var(--text-muted)] text-[11px]">Questions:</span>
              {[5, 10, 15].map(cnt => (
                <button
                  key={cnt}
                  onClick={() => setDrillQuestionCount(cnt)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    drillQuestionCount === cnt
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>

            <button
              onClick={handleStartRevisionDrill}
              disabled={drillLoading || stats.unresolved_count === 0}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play size={15} className="fill-current" />
              <span>{drillLoading ? 'Preparing Drill...' : 'Launch Revision Drill'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. SUBJECT PILL FILTERS & SEARCH CONTROLS                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      {!isDrillActive && (
        <div className="space-y-4">
          {/* Subject Pills */}
          {subjects.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedSubject('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  selectedSubject === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-[var(--surface-card)] text-[var(--text-secondary)] border border-[var(--surface-border)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <span>All Subjects</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                  {stats.total_recorded}
                </span>
              </button>

              {subjects.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubject(s.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    selectedSubject === s.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-[var(--surface-card)] text-[var(--text-secondary)] border border-[var(--surface-border)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  <span>{s.name}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    selectedSubject === s.id ? 'bg-white/20' : 'bg-rose-500/15 text-rose-400'
                  }`}>
                    {s.unresolved > 0 ? `${s.unresolved} unresolved` : 'Mastered'}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Search bar & status tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-3 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)]">
            {/* Status Tabs */}
            <div className="flex items-center gap-1 bg-[var(--surface-elevated)] p-1 rounded-xl border border-[var(--surface-border)]">
              <button
                onClick={() => setActiveStatus('unresolved')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeStatus === 'unresolved'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                <AlertTriangle size={13} />
                <span>Unresolved ({stats.unresolved_count})</span>
              </button>

              <button
                onClick={() => setActiveStatus('mastered')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeStatus === 'mastered'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                <CheckCircle2 size={13} />
                <span>Mastered ({stats.mastered_count})</span>
              </button>

              <button
                onClick={() => setActiveStatus('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeStatus === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                <span>All ({stats.total_recorded})</span>
              </button>
            </div>

            {/* Keyword Search */}
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search error questions or concepts..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. MISTAKE CARDS STREAM                                       */}
      {/* ───────────────────────────────────────────────────────────── */}
      {!isDrillActive && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              <span className="text-xs font-semibold text-[var(--text-secondary)]">
                Loading Mistake Vault...
              </span>
            </div>
          ) : mistakes.length === 0 ? (
            /* Empty State */
            <div className="p-12 text-center rounded-3xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  {activeStatus === 'unresolved' ? 'No Unresolved Mistakes!' : 'No Mistakes Logged'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {activeStatus === 'unresolved'
                    ? 'You have zero unresolved mistakes right now. Take quizzes and tests to challenge yourself!'
                    : 'Questions you get wrong in assessments will automatically appear in this vault.'}
                </p>
              </div>
              <button
                onClick={() => onNavigateTab ? onNavigateTab('adaptive-quiz') : null}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Take Adaptive Quiz</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            mistakes.map(item => {
              const isExpanded = expandedCards.has(item.question_id);
              const isMastered = item.mastery_status === 'mastered';
              const isItemSpeaking = currentlySpeakingId === item.question_id && isSpeaking;

              return (
                <div
                  key={item.vault_id}
                  className={`p-6 rounded-3xl border transition-all ${
                    isMastered
                      ? 'bg-[var(--surface-card)] border-emerald-500/20 shadow-xs'
                      : 'bg-[var(--surface-card)] border-[var(--surface-border)] shadow-md hover:border-indigo-500/40'
                  } space-y-5`}
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {item.subject_name}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--surface-elevated)] text-[var(--text-secondary)]">
                        {item.topic_name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[var(--surface-elevated)] text-[var(--text-muted)]">
                        {item.difficulty}
                      </span>
                      {item.company_name && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {item.company_name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1 ${
                          isMastered
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {isMastered ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                        <span>{isMastered ? 'Mastered' : `Missed ${item.mistake_count}x`}</span>
                      </span>

                      {/* Quick Toggle Mastery Button */}
                      <button
                        onClick={() => handleToggleMastery(item.question_id)}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--surface-border)] cursor-pointer"
                        title={isMastered ? 'Mark as needing review' : 'Mark as mastered'}
                      >
                        {isMastered ? 'Mark Unresolved' : 'Mark Mastered'}
                      </button>
                    </div>
                  </div>

                  {/* Question Statement */}
                  <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] leading-relaxed whitespace-pre-line">
                    {item.question}
                  </h3>

                  {/* Side-by-Side Comparison: Selected Wrong vs Correct Answer */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                    {/* What you chose */}
                    <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-1">
                      <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold">
                        <XCircle size={14} />
                        <span>Your Previous Selection: Option ({item.last_chosen_answer || 'None'})</span>
                      </div>
                      <p className="text-xs sm:text-sm text-[var(--text-primary)] font-medium leading-snug">
                        {item.last_chosen_text || 'No response recorded'}
                      </p>
                    </div>

                    {/* Correct Answer */}
                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                        <CheckCircle2 size={14} />
                        <span>Exact Correct Answer: Option ({item.correct_answer})</span>
                      </div>
                      <p className="text-xs sm:text-sm text-[var(--text-primary)] font-medium leading-snug">
                        {item.correct_text}
                      </p>
                    </div>
                  </div>

                  {/* Expandable Deep Pedagogical Solution Section */}
                  {isExpanded && (
                    <div className="p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] space-y-3.5 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-2.5">
                        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                          <BookOpen size={15} />
                          <span>AI Mentor Pedagogical Remediation</span>
                        </div>

                        {/* Audio Speak Button */}
                        <button
                          onClick={() => handleAudioNarration(item)}
                          className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                            isItemSpeaking
                              ? 'bg-cyan-500 text-white border-cyan-400 animate-pulse'
                              : 'bg-[var(--surface-card)] text-indigo-300 border-indigo-500/30 hover:bg-indigo-900/40'
                          }`}
                          title="Listen to AI mentor explanation"
                        >
                          {isItemSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                          <span className="hidden sm:inline">
                            {isItemSpeaking ? 'Stop Audio' : 'Listen Aloud'}
                          </span>
                        </button>
                      </div>

                      {/* Why chosen option was wrong */}
                      {item.why_incorrect && (
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-rose-400">
                            Why your choice failed:
                          </span>
                          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                            {item.why_incorrect}
                          </p>
                        </div>
                      )}

                      {/* Why correct option is right */}
                      {item.why_correct && (
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-emerald-400">
                            Why the correct answer holds:
                          </span>
                          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                            {item.why_correct}
                          </p>
                        </div>
                      )}

                      {/* Curriculum derivation */}
                      {item.explanation && (
                        <div className="space-y-1 pt-2 border-t border-[var(--surface-border)]">
                          <span className="text-xs font-bold text-indigo-400">
                            Standard Textbook / Syllabus Derivation:
                          </span>
                          <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-line">
                            {item.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Bottom Controls */}
                  <div className="pt-2 flex items-center justify-between border-t border-[var(--surface-border)] text-xs">
                    <button
                      onClick={() => toggleCardExpand(item.question_id)}
                      className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide Deep Solution' : 'View Deep Solution & Why Wrong'}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    <span className="text-[11px] text-[var(--text-muted)]">
                      Last logged: {new Date(item.updated_at || item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default MistakeVaultPage;
