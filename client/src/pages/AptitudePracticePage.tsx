import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import { useVoice } from '../context/VoiceContext';
import {
  Calculator,
  Brain,
  BookOpen,
  BarChart3,
  Sparkles,
  Flame,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  ChevronLeft,
  Search,
  Filter,
  RotateCcw,
  BookMarked,
  Lightbulb,
  FileText,
  Compass,
  ArrowRight,
  Play,
  Award,
  Layers,
  X,
  Target,
  PenTool,
  Check,
  LayoutGrid,
  Volume2,
  VolumeX,
  Mic,
  Pause,
  Radio,
  HelpCircle
} from 'lucide-react';

interface QuestionOption {
  option_key: string;
  option_text: string;
  is_correct?: boolean;
  explanation?: string;
}

interface AptitudeQuestion {
  id: string;
  sequence?: number;
  question: string;
  question_type: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  subject_id: string;
  topic_id: string;
  subtopic?: string;
  topic_name?: string;
  category_id?: 'quant' | 'logic' | 'verbal' | 'di';
  category_name?: string;
  company_id?: string;
  company_name?: string;
  expected_time: number;
  xp_value: number;
  tags?: string[];
  correct_answer?: string;
  explanation?: string;
  options: QuestionOption[];
}

interface AptitudeCategory {
  id: 'quant' | 'logic' | 'verbal' | 'di';
  topicId: string;
  name: string;
  shortName: string;
  badge: string;
  icon: string;
  color: string;
  description: string;
  subtopics: string[];
  questionCount: number;
  difficultyCounts?: { easy: number; medium: number; hard: number };
  userStats?: { attemptedCount: number; solvedCount: number; accuracy: number };
}

interface FormulaItem {
  title: string;
  formula: string;
  tip?: string;
}

interface FormulaSheetCategory {
  category: string;
  formulas: FormulaItem[];
}

interface AptitudePracticePageProps {
  onStartQuizSession?: (session: any) => void;
  onNavigateToDashboard?: () => void;
}

export const AptitudePracticePage: React.FC<AptitudePracticePageProps> = ({
  onNavigateToDashboard
}) => {
  // Navigation & Category Selection
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Mode: 'practice' (Instant Solver & Formulas) vs 'test' (Timed Screening Exam)
  const [activeMode, setActiveMode] = useState<'practice' | 'test'>('practice');

  // Data states
  const [categories, setCategories] = useState<AptitudeCategory[]>([]);
  const [questions, setQuestions] = useState<AptitudeQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [overallStats, setOverallStats] = useState({
    totalQuestions: 0,
    totalAttempted: 0,
    totalSolved: 0,
    accuracy: 0
  });

  // Practice Mode state
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [checkingAnswer, setCheckingAnswer] = useState<boolean>(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [sessionScore, setSessionScore] = useState<{ solved: number; attempted: number; xp: number }>({
    solved: 0,
    attempted: 0,
    xp: 0
  });

  // Track practice responses across the 100+ questions palette
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, { chosen: string; isCorrect: boolean; result: any }>>({});
  const [showQuestionPalette, setShowQuestionPalette] = useState<boolean>(false);

  // Timed Test Mode state
  const [isTestActive, setIsTestActive] = useState<boolean>(false);
  const [testSessionId, setTestSessionId] = useState<string | null>(null);
  const [testQuestions, setTestQuestions] = useState<AptitudeQuestion[]>([]);
  const [testAnswers, setTestAnswers] = useState<Record<string, string>>({});
  const [testFlagged, setTestFlagged] = useState<Set<string>>(new Set());
  const [testTimeRemaining, setTestTimeRemaining] = useState<number>(15 * 60);
  const [testTotalTime, setTestTotalTime] = useState<number>(15 * 60);
  const [testSubmitted, setTestSubmitted] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [submittingTest, setSubmittingTest] = useState<boolean>(false);

  // Modals & Drawers
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);
  const [formulaSheets, setFormulaSheets] = useState<FormulaSheetCategory[]>([]);
  const [showScratchpad, setShowScratchpad] = useState<boolean>(false);
  const [scratchNotes, setScratchNotes] = useState<string>('');

  const timerRef = useRef<any>(null);

  // Voice Mentor Integration
  const {
    speakText,
    stopSpeaking,
    isSpeaking,
    openVoiceModal,
    setActiveQuestionContext
  } = useVoice();

  // Aptitude Voice Mistake Mentor State
  const [voiceDiagnosis, setVoiceDiagnosis] = useState<any | null>(null);
  const [loadingVoiceDiagnosis, setLoadingVoiceDiagnosis] = useState<boolean>(false);
  const [voiceSpeechRate, setVoiceSpeechRate] = useState<number>(1.05);
  const [showVoiceMentorPanel, setShowVoiceMentorPanel] = useState<boolean>(false);

  // Timed Test Mode Voice Diagnostic
  const [testVoiceDiagnostic, setTestVoiceDiagnostic] = useState<any | null>(null);
  const [loadingTestDiagnostic, setLoadingTestDiagnostic] = useState<boolean>(false);
  const [activeTestVoiceQuestionIdx, setActiveTestVoiceQuestionIdx] = useState<number | null>(null);
  const [loadingTestQuestionIdx, setLoadingTestQuestionIdx] = useState<number | null>(null);

  // 1. Initial Load: Categories & Stats
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, formulaRes] = await Promise.all([
          api.getAptitudeTypes(),
          api.getAptitudeFormulas()
        ]);
        if (catRes.success) {
          setCategories(catRes.categories || []);
          if (catRes.overall) setOverallStats(catRes.overall);
        }
        if (formulaRes.success) {
          setFormulaSheets(formulaRes.cheat_sheets || []);
        }
      } catch (err) {
        console.error('Failed to load aptitude metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  // 2. Fetch Questions based on Filters (loads 100+ questions per section in deterministic order)
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const res = await api.getAptitudeQuestions({
          type: selectedCategory !== 'all' ? selectedCategory : undefined,
          subtopic: selectedSubtopic !== 'all' ? selectedSubtopic : undefined,
          difficulty: selectedDifficulty !== 'All' ? selectedDifficulty : undefined,
          company_id: selectedCompany !== 'all' ? selectedCompany : undefined,
          search: searchQuery.trim() || undefined,
          mode: 'practice',
          limit: 150
        });

        if (res.success && res.questions) {
          setQuestions(res.questions);
          setCurrentIndex(0);
          setSelectedOption(null);
          setAnswerSubmitted(false);
          setValidationResult(null);
          setShowExplanation(false);
        }
      } catch (err) {
        console.error('Error fetching aptitude questions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [selectedCategory, selectedSubtopic, selectedDifficulty, selectedCompany, searchQuery]);

  // Current active question in practice mode
  const currentQuestion: AptitudeQuestion | null = useMemo(() => {
    if (questions.length === 0 || currentIndex >= questions.length) return null;
    return questions[currentIndex];
  }, [questions, currentIndex]);

  // Synchronize Active Question Context with Global Voice Assistant
  useEffect(() => {
    if (!currentQuestion) {
      setActiveQuestionContext(null);
      return;
    }

    const prevAttempt = answeredQuestions[currentQuestion.id];
    const chosenKey = selectedOption || prevAttempt?.chosen || '';
    const chosenOpt = currentQuestion.options.find(o => o.option_key === chosenKey);
    const correctKey = validationResult?.correct_answer || currentQuestion.correct_answer || '';
    const correctOpt = currentQuestion.options.find(o => o.option_key === correctKey);

    setActiveQuestionContext({
      questionId: currentQuestion.id,
      sequence: currentIndex + 1,
      questionText: currentQuestion.question,
      topic: currentQuestion.topic_name || currentQuestion.category_name || 'Aptitude & Reasoning',
      subject: 'Campus Placement Aptitude',
      options: currentQuestion.options.map(o => ({ option_key: o.option_key, option_text: o.option_text })),
      chosenAnswer: chosenKey,
      chosenText: chosenOpt?.option_text || (chosenKey ? `Option ${chosenKey}` : ''),
      correctAnswer: correctKey,
      correctText: correctOpt?.option_text || (correctKey ? `Option ${correctKey}` : ''),
      explanation: validationResult?.explanation || currentQuestion.explanation || '',
      isCorrect: validationResult ? validationResult.is_correct : (prevAttempt ? prevAttempt.isCorrect : undefined)
    });

    return () => {
      setActiveQuestionContext(null);
    };
  }, [currentQuestion, selectedOption, answerSubmitted, validationResult, answeredQuestions, currentIndex]);

  // Jump to specific question index in practice mode
  const jumpToQuestion = (idx: number) => {
    if (idx < 0 || idx >= questions.length) return;
    const targetQ = questions[idx];
    setCurrentIndex(idx);
    stopSpeaking();
    setVoiceDiagnosis(null);
    setShowVoiceMentorPanel(false);

    const prevAttempt = answeredQuestions[targetQ.id];
    if (prevAttempt) {
      setSelectedOption(prevAttempt.chosen);
      setAnswerSubmitted(true);
      setValidationResult(prevAttempt.result);
      setShowExplanation(true);
    } else {
      setSelectedOption(null);
      setAnswerSubmitted(false);
      setValidationResult(null);
      setShowExplanation(false);
    }
  };

  // Handle Practice Answer Selection
  const handleSelectOption = (key: string) => {
    if (answerSubmitted) return;
    setSelectedOption(key);
  };

  // Keyboard shortcut listener for options (1,2,3,4 or A,B,C,D) in both Practice & Timed Test Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      const key = e.key.toUpperCase();

      if (isTestActive && testQuestions.length > 0 && !testSubmitted) {
        const currentTestQ = testQuestions[currentIndex];
        if (!currentTestQ) return;
        if (['A', 'B', 'C', 'D'].includes(key)) {
          handleSelectTestOption(currentTestQ.id, key);
        } else if (['1', '2', '3', '4'].includes(key)) {
          const map = ['A', 'B', 'C', 'D'];
          handleSelectTestOption(currentTestQ.id, map[parseInt(key) - 1]);
        } else if (e.key === 'ArrowRight' && currentIndex < testQuestions.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
          setCurrentIndex(prev => prev - 1);
        }
        return;
      }

      if (answerSubmitted || !currentQuestion) return;

      if (['A', 'B', 'C', 'D'].includes(key)) {
        handleSelectOption(key);
      } else if (['1', '2', '3', '4'].includes(key)) {
        const map = ['A', 'B', 'C', 'D'];
        handleSelectOption(map[parseInt(key) - 1]);
      } else if (e.key === 'Enter' && selectedOption && !answerSubmitted) {
        handleVerifyPracticeAnswer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, selectedOption, answerSubmitted, isTestActive, testSubmitted, currentIndex, testQuestions]);

  // Aptitude Voice Mistake Mentor: Fetch and narrate detailed mathematical/logical derivation
  const handleExplainQuestionWithVoice = async (
    targetQuestion?: AptitudeQuestion,
    chosenKeyParam?: string | null,
    resultParam?: any,
    autoSpeak: boolean = true
  ) => {
    const targetQ = targetQuestion || currentQuestion;
    if (!targetQ) return;

    if (isSpeaking && autoSpeak) {
      stopSpeaking();
      return;
    }

    const prevAttempt = answeredQuestions[targetQ.id];
    const chosenKey = chosenKeyParam || selectedOption || prevAttempt?.chosen || '';
    const chosenOpt = targetQ.options.find(o => o.option_key === chosenKey);
    const resultObj = resultParam || validationResult || prevAttempt?.result;
    const correctKey = resultObj?.correct_answer || targetQ.correct_answer || '';
    const correctOpt = targetQ.options.find(o => o.option_key === correctKey);

    setShowVoiceMentorPanel(true);
    setLoadingVoiceDiagnosis(true);
    try {
      const res = await api.explainSingleMistake({
        question: targetQ.question,
        chosen_answer: chosenKey,
        chosen_text: chosenOpt?.option_text || (chosenKey ? `Option ${chosenKey}` : 'Unanswered'),
        correct_answer: correctKey,
        correct_text: correctOpt?.option_text || correctKey,
        explanation: resultObj?.explanation || targetQ.explanation || '',
        topic_name: targetQ.topic_name || targetQ.category_name || 'Aptitude & Reasoning',
        subject_name: 'Campus Placement Aptitude',
        sequence: (targetQ.sequence || currentIndex + 1),
        options: targetQ.options,
        question_id: targetQ.id
      });

      if (res && res.success && res.diagnosis) {
        setVoiceDiagnosis(res.diagnosis);
        if (autoSpeak) {
          speakText(res.speech_text || res.diagnosis.speech_text, voiceSpeechRate);
        }
      }
    } catch (err) {
      console.error('Failed to explain aptitude mistake with voice mentor:', err);
    } finally {
      setLoadingVoiceDiagnosis(false);
    }
  };

  // Timed Test Mode Comprehensive Voice Diagnostic
  const handleVoiceDiagnoseTest = async () => {
    if (!testResult) return;

    if (isSpeaking && !loadingTestDiagnostic) {
      stopSpeaking();
      setActiveTestVoiceQuestionIdx(null);
      return;
    }

    if (testVoiceDiagnostic) {
      speakText(testVoiceDiagnostic.speech_text, voiceSpeechRate);
      return;
    }

    setLoadingTestDiagnostic(true);
    try {
      const res = await api.diagnoseMistakes({
        type: 'quiz',
        gradedQuestions: testResult.graded_questions,
        weak_topics: testResult.weak_topics || [],
        accuracy_rate: testResult.accuracy_rate
      });

      if (res && res.success) {
        setTestVoiceDiagnostic(res);
        speakText(res.speech_text, voiceSpeechRate);
      }
    } catch (err) {
      console.error('Failed to run test voice diagnosis:', err);
    } finally {
      setLoadingTestDiagnostic(false);
    }
  };

  // Timed Test Mode: Single Question Voice Explanation
  const handleExplainTestQuestionVoice = async (g: any, idx: number) => {
    if (activeTestVoiceQuestionIdx === idx && isSpeaking) {
      stopSpeaking();
      setActiveTestVoiceQuestionIdx(null);
      return;
    }

    setLoadingTestQuestionIdx(idx);
    try {
      const res = await api.explainSingleMistake({
        question: g.question,
        chosen_answer: g.chosen_answer,
        chosen_text: g.chosen_text,
        correct_answer: g.correct_answer,
        correct_text: g.correct_text,
        explanation: g.explanation,
        topic_name: g.topic_name || selectedCategory || 'Aptitude',
        subject_name: 'Campus Placement Aptitude',
        sequence: idx + 1,
        options: g.options,
        question_id: g.question_id
      });

      if (res && res.success && res.speech_text) {
        setActiveTestVoiceQuestionIdx(idx);
        speakText(res.speech_text, voiceSpeechRate);
      }
    } catch (err) {
      console.error('Failed to voice-explain test question:', err);
    } finally {
      setLoadingTestQuestionIdx(null);
    }
  };

  // Verify Practice Answer
  const handleVerifyPracticeAnswer = async () => {
    if (!currentQuestion || !selectedOption || checkingAnswer || answerSubmitted) return;

    setCheckingAnswer(true);
    try {
      const res = await api.checkAptitudeAnswer({
        question_id: currentQuestion.id,
        chosen_option: selectedOption,
        time_spent: 35
      });

      if (res.success) {
        setValidationResult(res);
        setAnswerSubmitted(true);
        setShowExplanation(true);

        const isCorrect = res.is_correct;
        setAnsweredQuestions(prev => ({
          ...prev,
          [currentQuestion.id]: {
            chosen: selectedOption,
            isCorrect,
            result: res
          }
        }));

        setSessionScore(prev => ({
          solved: prev.solved + (isCorrect ? 1 : 0),
          attempted: prev.attempted + 1,
          xp: prev.xp + (res.xp_earned || (isCorrect ? 25 : 5))
        }));

        if (isCorrect) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 }
          });
        } else {
          // Pre-fetch the deep Voice Mistake Mentor breakdown immediately
          handleExplainQuestionWithVoice(currentQuestion, selectedOption, res, false);
        }
      }
    } catch (err) {
      console.error('Failed to verify answer:', err);
    } finally {
      setCheckingAnswer(false);
    }
  };

  // Navigation across practice questions
  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      jumpToQuestion(currentIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      jumpToQuestion(currentIndex - 1);
    }
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedIds(prev => {
      const updated = new Set(prev);
      if (updated.has(id)) updated.delete(id);
      else updated.add(id);
      return updated;
    });
  };

  // ==========================================
  // TIMED TEST MODE LOGIC
  // ==========================================
  const handleStartTest = async () => {
    setLoading(true);
    try {
      const res = await api.startAptitudeTestSession({
        type: selectedCategory !== 'all' ? selectedCategory : undefined,
        difficulty: selectedDifficulty !== 'All' ? selectedDifficulty : undefined,
        company_id: selectedCompany !== 'all' ? selectedCompany : undefined,
        count: 10,
        duration_minutes: 15
      });

      if (res.success && res.questions) {
        setTestSessionId(res.session_id);
        setTestQuestions(res.questions);
        setTestAnswers({});
        setTestFlagged(new Set());
        setTestTimeRemaining((res.duration_minutes || 15) * 60);
        setTestTotalTime((res.duration_minutes || 15) * 60);
        setCurrentIndex(0);
        setIsTestActive(true);
        setTestSubmitted(false);
        setTestResult(null);
      }
    } catch (err) {
      console.error('Error starting test session:', err);
    } finally {
      setLoading(false);
    }
  };

  // Timer countdown for active test
  useEffect(() => {
    if (!isTestActive || testSubmitted) return;

    timerRef.current = setInterval(() => {
      setTestTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTestActive, testSubmitted]);

  const handleAutoSubmitTest = () => {
    handleSubmitTest();
  };

  const handleSelectTestOption = (qId: string, optKey: string) => {
    setTestAnswers(prev => ({
      ...prev,
      [qId]: optKey
    }));
  };

  const toggleTestFlag = (qId: string) => {
    setTestFlagged(prev => {
      const updated = new Set(prev);
      if (updated.has(qId)) updated.delete(qId);
      else updated.add(qId);
      return updated;
    });
  };

  const handleSubmitTest = async () => {
    if (!testSessionId || submittingTest) return;

    setSubmittingTest(true);
    try {
      const formattedAnswers = testQuestions.map(q => ({
        question_id: q.id,
        chosen_option: testAnswers[q.id] || null,
        time_spent: Math.max(10, Math.round((testTotalTime - testTimeRemaining) / Math.max(1, testQuestions.length)))
      }));

      const timeTaken = testTotalTime - testTimeRemaining;

      const res = await api.submitAptitudeTestSession(testSessionId, formattedAnswers, timeTaken);
      if (res.success && res.result) {
        setTestResult(res.result);
        setTestSubmitted(true);
        setIsTestActive(false);

        if (res.result.accuracy_rate >= 60) {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 }
          });
        }
      }
    } catch (err) {
      console.error('Error submitting test session:', err);
    } finally {
      setSubmittingTest(false);
    }
  };

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Render Category Icon helper
  const renderCategoryIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'Calculator':
        return <Calculator className={className} />;
      case 'Brain':
        return <Brain className={className} />;
      case 'BookOpen':
        return <BookOpen className={className} />;
      case 'BarChart3':
        return <BarChart3 className={className} />;
      default:
        return <Compass className={className} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-150">
      {/* ======================================================== */}
      {/* 1. HEADER SECTION & APTITUDE PERFORMANCE STATS           */}
      {/* ======================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-[var(--surface-border)]">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5">
              <Calculator size={13} /> Campus Placement Aptitude
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              TCS NQT • Infosys • Accenture • Cognizant • Wipro
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Aptitude Practice & Screening Arena
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            Select your target aptitude type, practice high-yield questions with instant formula derivations, or launch a timed screening exam simulation.
          </p>
        </div>

        {/* Global Live Stats Cards */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xs text-center">
            <div className="flex items-center justify-center gap-1 text-amber-500 text-xs font-bold">
              <Flame size={14} />
              <span>{sessionScore.attempted} Solved</span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)]">Session Progress</span>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xs text-center">
            <div className="flex items-center justify-center gap-1 text-indigo-400 text-xs font-bold">
              <Zap size={14} />
              <span>+{sessionScore.xp} XP</span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)]">Aptitude Points</span>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xs text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-500 text-xs font-bold">
              <Target size={14} />
              <span>
                {sessionScore.attempted > 0
                  ? `${Math.round((sessionScore.solved / sessionScore.attempted) * 100)}%`
                  : `${overallStats.accuracy}%`}
              </span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)]">Accuracy Rate</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. CHOOSE TYPE OF APTITUDE (CATEGORY CARDS)               */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-indigo-400" />
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Choose Type of Aptitude
            </h2>
          </div>
          <span className="text-xs text-[var(--text-muted)]">
            Click any section to filter questions immediately
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Card 0: All Types */}
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedSubtopic('all');
            }}
            className={`p-4 rounded-2xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between group ${
              selectedCategory === 'all'
                ? 'bg-indigo-600/10 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                : 'bg-[var(--surface-card)] border-[var(--surface-border)] hover:border-indigo-500/40 hover:bg-[var(--surface-hover)]'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Comprehensive
                </span>
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors">
                  All Aptitude Types
                </h3>
                <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 mt-0.5">
                  Full mix of Quant, Logic, Verbal, and Data Interpretation.
                </p>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[var(--surface-border)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
              <span>{overallStats.totalQuestions} Questions</span>
              <span className="font-semibold text-indigo-400">Mixed</span>
            </div>
          </button>

          {/* Cards 1-4: Quant, Logic, Verbal, DI */}
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedSubtopic('all');
                }}
                className={`p-4 rounded-2xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-indigo-600/10 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                    : 'bg-[var(--surface-card)] border-[var(--surface-border)] hover:border-indigo-500/40 hover:bg-[var(--surface-hover)]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-[var(--surface-elevated)] text-[var(--text-primary)] flex items-center justify-center border border-[var(--surface-border)] group-hover:scale-105 transition-transform">
                      {renderCategoryIcon(cat.icon, 'w-4 h-4 text-indigo-400')}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--surface-border)]">
                      {cat.questionCount} MCQs
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 mt-0.5 leading-snug">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[var(--surface-border)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                  <span>Solved: {cat.userStats?.solvedCount || 0}</span>
                  <span className="font-semibold text-emerald-500">
                    {cat.userStats?.accuracy || 0}% Acc
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Section Subtopic Selector Bar */}
        {selectedCategory !== 'all' && (
          <div className="pt-2 animate-in fade-in">
            <div className="p-3 rounded-2xl bg-[var(--surface-card)] border border-indigo-500/20 shadow-xs flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-xs font-bold text-indigo-400 shrink-0 flex items-center gap-1.5 px-2">
                <Filter size={13} />
                <span>Subtopics:</span>
              </span>
              <button
                onClick={() => setSelectedSubtopic('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  selectedSubtopic === 'all'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--surface-border)]'
                }`}
              >
                All Topics ({categories.find(c => c.id === selectedCategory)?.questionCount || questions.length})
              </button>
              {categories.find(c => c.id === selectedCategory)?.subtopics?.map(sub => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubtopic(sub)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    selectedSubtopic === sub
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--surface-border)]'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 3. TOOLBAR: FILTERS, PRACTICE/TEST MODE, CHEAT SHEETS    */}
      {/* ======================================================== */}
      <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left: Mode Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] shrink-0">
          <button
            onClick={() => {
              setActiveMode('practice');
              setIsTestActive(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'practice'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Lightbulb size={14} />
            <span>Practice Mode</span>
          </button>
          <button
            onClick={() => {
              setActiveMode('test');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'test'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Clock size={14} />
            <span>Timed Test Mode</span>
          </button>
        </div>

        {/* Center: Filters (Difficulty & Company) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[var(--text-muted)] font-medium">Difficulty:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="All">All Levels</option>
              <option value="Easy">Easy (Speed Drills)</option>
              <option value="Medium">Medium (Campus Standard)</option>
              <option value="Hard">Hard (Prime / Tier-1)</option>
            </select>
          </div>

          {/* Company Filter Dropdown */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[var(--text-muted)] font-medium">Pattern:</span>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Recruiters</option>
              <option value="comp-tcs">TCS NQT Pattern</option>
              <option value="comp-infosys">Infosys Mathematical</option>
              <option value="comp-accenture">Accenture Cognitive</option>
              <option value="comp-wipro">Wipro National Qualifier</option>
              <option value="comp-cognizant">Cognizant GenC</option>
            </select>
          </div>

          {/* Quick Search Input */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search train, pipes, clocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-indigo-500 w-36 sm:w-48"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Right: Quick Utility Modals (Formulas & Scratchpad) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowFormulaModal(true)}
            className="px-3 py-1.5 rounded-xl bg-[var(--surface-elevated)] hover:bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20 hover:border-indigo-500/40 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Open Aptitude Speed-Math & Clock Angle formulas"
          >
            <FileText size={14} />
            <span className="hidden sm:inline">Formula</span> Sheet
          </button>

          <button
            onClick={() => setShowScratchpad(!showScratchpad)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              showScratchpad
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                : 'bg-[var(--surface-elevated)] border-[var(--surface-border)] hover:border-amber-500/30 text-[var(--text-secondary)] hover:text-amber-400'
            }`}
            title="Open Rough Work Notepad for calculations"
          >
            <PenTool size={14} />
            <span className="hidden sm:inline">Scratchpad</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SCRATCHPAD DRAWER (IF OPENED)                            */}
      {/* ======================================================== */}
      {showScratchpad && (
        <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-amber-500/30 shadow-md space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-amber-500">
            <span className="flex items-center gap-1.5">
              <PenTool size={14} /> Built-in Rough Work & Calculation Pad
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setScratchNotes('')}
                className="text-[var(--text-muted)] hover:text-rose-400 transition-colors cursor-pointer"
              >
                Clear Pad
              </button>
              <button
                onClick={() => setShowScratchpad(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          <textarea
            value={scratchNotes}
            onChange={(e) => setScratchNotes(e.target.value)}
            placeholder="Type your intermediate step calculations here (e.g. 72 * 5/18 = 20 m/s; 180 / 20 = 9s)..."
            rows={3}
            className="w-full p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:border-amber-500 resize-y"
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. MAIN CONTENT AREA: PRACTICE MODE vs TIMED TEST MODE   */}
      {/* ======================================================== */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[var(--text-secondary)]">
            Loading Aptitude Challenge Questions...
          </span>
        </div>
      ) : activeMode === 'test' && !isTestActive && !testSubmitted ? (
        /* TIMED TEST LAUNCH PAD */
        <div className="p-8 sm:p-12 rounded-3xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xl text-center max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <Clock size={32} />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-[var(--text-primary)]">
              Timed Aptitude Screening Test
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Simulates actual campus aptitude assessments (TCS NQT Ninja/Digital, Infosys Mathematical Ability). 10 curated questions across selected topics with real-time countdown.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-xs font-semibold text-[var(--text-secondary)]">
            <div>
              <span className="block text-base font-extrabold text-[var(--text-primary)]">10</span>
              <span>Questions</span>
            </div>
            <div>
              <span className="block text-base font-extrabold text-[var(--text-primary)]">15</span>
              <span>Minutes</span>
            </div>
            <div>
              <span className="block text-base font-extrabold text-indigo-400">+250</span>
              <span>Max XP</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleStartTest}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2 mx-auto"
            >
              <Play size={16} className="fill-current" />
              <span>Begin Timed Assessment</span>
            </button>
          </div>
        </div>
      ) : activeMode === 'test' && isTestActive ? (
        /* ACTIVE TIMED TEST RUNNER */
        <div className="space-y-6">
          {/* Test Header Bar */}
          <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Question {currentIndex + 1} of {testQuestions.length}
              </span>
              <span className="text-xs text-[var(--text-muted)] hidden sm:inline">
                Answered: {Object.keys(testAnswers).length}/{testQuestions.length}
              </span>
            </div>

            {/* Countdown Clock */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-sm font-extrabold border ${
                testTimeRemaining <= 120
                  ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 animate-pulse'
                  : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
              }`}
            >
              <Clock size={16} />
              <span>{formatTime(testTimeRemaining)}</span>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitTest}
              disabled={submittingTest}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 size={14} />
              <span>{submittingTest ? 'Grading...' : 'Submit Test'}</span>
            </button>
          </div>

          {/* Test Question & Palette Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Question Card */}
            <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-md space-y-6">
              {testQuestions[currentIndex] && (
                <>
                  <div className="flex items-center justify-between gap-2 border-b border-[var(--surface-border)] pb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {testQuestions[currentIndex].topic_name || 'Aptitude'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[var(--surface-elevated)] text-[var(--text-secondary)]">
                        {testQuestions[currentIndex].difficulty}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleTestFlag(testQuestions[currentIndex].id)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
                        testFlagged.has(testQuestions[currentIndex].id)
                          ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                          : 'bg-[var(--surface-elevated)] border-[var(--surface-border)] text-[var(--text-muted)] hover:text-amber-400'
                      }`}
                    >
                      <BookMarked size={12} />
                      <span>{testFlagged.has(testQuestions[currentIndex].id) ? 'Flagged' : 'Flag for review'}</span>
                    </button>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] leading-relaxed whitespace-pre-line">
                    {testQuestions[currentIndex].question}
                  </h3>

                  {/* Options */}
                  <div className="space-y-3">
                    {testQuestions[currentIndex].options.map((opt) => {
                      const isChosen = testAnswers[testQuestions[currentIndex].id] === opt.option_key;
                      return (
                        <button
                          key={opt.option_key}
                          onClick={() => handleSelectTestOption(testQuestions[currentIndex].id, opt.option_key)}
                          className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-3.5 cursor-pointer ${
                            isChosen
                              ? 'bg-indigo-600/15 border-indigo-500 ring-2 ring-indigo-500/20'
                              : 'bg-[var(--surface-elevated)] border-[var(--surface-border)] hover:border-indigo-500/40'
                          }`}
                        >
                          <span
                            className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                              isChosen
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

                  {/* Pagination Actions */}
                  <div className="pt-4 flex items-center justify-between border-t border-[var(--surface-border)]">
                    <button
                      onClick={() => setCurrentIndex(prev => Math.max(prev - 1, 0))}
                      disabled={currentIndex === 0}
                      className="px-4 py-2 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] disabled:opacity-40 text-xs font-bold text-[var(--text-primary)] border border-[var(--surface-border)] flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft size={14} /> Previous
                    </button>

                    {currentIndex < testQuestions.length - 1 ? (
                      <button
                        onClick={() => setCurrentIndex(prev => Math.min(prev + 1, testQuestions.length - 1))}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        Next <ChevronRight size={14} />
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitTest}
                        disabled={submittingTest}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
                      >
                        <CheckCircle2 size={14} />
                        <span>{submittingTest ? 'Grading Test...' : 'Submit Test'}</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Question Palette Sidebar */}
            <div className="lg:col-span-4 p-5 rounded-3xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-md space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Question Navigator
              </h4>

              <div className="grid grid-cols-5 gap-2">
                {testQuestions.map((q, idx) => {
                  const isAnswered = Boolean(testAnswers[q.id]);
                  const isFlagged = testFlagged.has(q.id);
                  const isCurrent = currentIndex === idx;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-10 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
                        isCurrent
                          ? 'ring-2 ring-indigo-500 scale-105 shadow-sm'
                          : ''
                      } ${
                        isAnswered
                          ? 'bg-emerald-500 text-white'
                          : isFlagged
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--surface-border)] hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      {idx + 1}
                      {isFlagged && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-[var(--surface-border)] space-y-1.5 text-[11px] text-[var(--text-muted)]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-emerald-500" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-amber-500/30 border border-amber-500" />
                  <span>Flagged for Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-[var(--surface-elevated)] border border-[var(--surface-border)]" />
                  <span>Unattempted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeMode === 'test' && testSubmitted && testResult ? (
        /* TIMED TEST RESULTS REPORT */
        <div className="p-8 sm:p-10 rounded-3xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xl space-y-8 max-w-4xl mx-auto animate-in fade-in">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
              <Award size={32} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
              Aptitude Assessment Scorecard
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Evaluation completed against campus recruitment benchmarks.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-center">
              <span className="text-2xl font-extrabold text-indigo-400">
                {testResult.accuracy_rate}%
              </span>
              <span className="block text-[11px] text-[var(--text-muted)] mt-1">Accuracy Score</span>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-center">
              <span className="text-2xl font-extrabold text-emerald-500">
                {testResult.correct_count} / {testResult.total_questions}
              </span>
              <span className="block text-[11px] text-[var(--text-muted)] mt-1">Correct Answers</span>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-center">
              <span className="text-2xl font-extrabold text-amber-500">
                +{testResult.xp_earned}
              </span>
              <span className="block text-[11px] text-[var(--text-muted)] mt-1">XP Earned</span>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-center">
              <span className="text-2xl font-extrabold text-cyan-400">
                {formatTime(testResult.time_taken_seconds || 0)}
              </span>
              <span className="block text-[11px] text-[var(--text-muted)] mt-1">Time Elapsed</span>
            </div>
          </div>

          {/* Aptitude Comprehensive Voice Diagnostic Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/30 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
                <Mic size={24} className={isSpeaking && activeTestVoiceQuestionIdx === null ? 'animate-bounce text-cyan-300' : ''} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm sm:text-base font-extrabold text-white">
                    Aptitude Voice Mistake Diagnostic
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    Comprehensive Mentor Review
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {testResult.correct_count === testResult.total_questions
                    ? 'Perfect score! Listen to advanced placement strategy and speed-math mastery.'
                    : `Listen to a comprehensive voice breakdown of your ${testResult.total_questions - testResult.correct_count} mistakes with step-by-step logic.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleVoiceDiagnoseTest}
                disabled={loadingTestDiagnostic}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                  isSpeaking && activeTestVoiceQuestionIdx === null
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 animate-pulse'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                }`}
              >
                {loadingTestDiagnostic ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isSpeaking && activeTestVoiceQuestionIdx === null ? (
                  <Pause size={15} className="fill-current" />
                ) : (
                  <Volume2 size={15} />
                )}
                <span>
                  {loadingTestDiagnostic
                    ? 'Analyzing...'
                    : isSpeaking && activeTestVoiceQuestionIdx === null
                    ? 'Pause Diagnostic'
                    : 'Listen to Voice Diagnostic'}
                </span>
              </button>
            </div>
          </div>

          {/* Graded Question Breakdown */}
          <div className="space-y-4 pt-4 border-t border-[var(--surface-border)]">
            <h4 className="text-sm font-bold text-[var(--text-primary)]">
              Question-by-Question Derivation & Explanations
            </h4>

            <div className="space-y-4">
              {testResult.graded_questions?.map((g: any, idx: number) => (
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
                      Question #{idx + 1} ({g.difficulty})
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleExplainTestQuestionVoice(g, idx)}
                        disabled={loadingTestQuestionIdx === idx}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                          activeTestVoiceQuestionIdx === idx && isSpeaking
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                            : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20 hover:bg-indigo-500/20'
                        }`}
                      >
                        {loadingTestQuestionIdx === idx ? (
                          <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                        ) : activeTestVoiceQuestionIdx === idx && isSpeaking ? (
                          <Pause size={12} className="fill-current" />
                        ) : (
                          <Volume2 size={12} />
                        )}
                        <span>{activeTestVoiceQuestionIdx === idx && isSpeaking ? 'Stop Voice' : 'Voice Mentor'}</span>
                      </button>
                      <span
                        className={`text-xs font-bold flex items-center gap-1 ${
                          g.is_correct ? 'text-emerald-500' : 'text-rose-500'
                        }`}
                      >
                        {g.is_correct ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        {g.is_correct ? 'Correct (+25 XP)' : 'Incorrect'}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {g.question}
                  </p>

                  <div className="text-xs space-y-1">
                    <div>
                      <span className="text-[var(--text-muted)]">Your Answer: </span>
                      <span className={g.is_correct ? 'font-bold text-emerald-500' : 'font-bold text-rose-500'}>
                        {g.chosen_text || 'No response'}
                      </span>
                    </div>
                    {!g.is_correct && (
                      <div>
                        <span className="text-[var(--text-muted)]">Correct Answer: </span>
                        <span className="font-bold text-emerald-500">
                          {g.correct_text}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)] text-xs text-[var(--text-secondary)]">
                    <strong className="text-indigo-400">Step-by-step Solution: </strong>
                    {g.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-center gap-4">
            <button
              onClick={() => {
                setTestSubmitted(false);
                setIsTestActive(false);
                handleStartTest();
              }}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-md"
            >
              Retake Another Test
            </button>
            <button
              onClick={() => {
                setActiveMode('practice');
                setTestSubmitted(false);
              }}
              className="px-6 py-2.5 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] font-bold text-xs border border-[var(--surface-border)] cursor-pointer"
            >
              Back to Practice Drills
            </button>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* PRACTICE MODE (INTERACTIVE DRILL SOLVER)                 */
        /* ======================================================== */
        <div className="space-y-6">
          {questions.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-3">
              <Compass size={36} className="mx-auto text-[var(--text-muted)]" />
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                No questions found matching your filter selection
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
                Try switching the aptitude type to "All Types", or selecting a broader difficulty level.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedDifficulty('All');
                  setSelectedCompany('all');
                  setSearchQuery('');
                }}
                className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : currentQuestion ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-md space-y-6">
              {/* Question Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--surface-border)] pb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Question {currentIndex + 1} of {questions.length}
                  </span>

                  <button
                    onClick={() => setShowQuestionPalette(!showQuestionPalette)}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      showQuestionPalette
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                        : 'bg-[var(--surface-elevated)] text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10'
                    }`}
                    title="Open question grid selector (jump directly to any question)"
                  >
                    <LayoutGrid size={13} />
                    <span>Question Grid (1-{questions.length})</span>
                  </button>

                  {currentQuestion.subtopic && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {currentQuestion.subtopic}
                    </span>
                  )}

                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--surface-border)]">
                    {currentQuestion.topic_name}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      currentQuestion.difficulty === 'Easy'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : currentQuestion.difficulty === 'Medium'
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-rose-500/10 text-rose-500'
                    }`}
                  >
                    {currentQuestion.difficulty}
                  </span>

                  {currentQuestion.company_name && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {currentQuestion.company_name}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                    <Clock size={13} /> {currentQuestion.expected_time || 45}s
                  </span>
                  <span className="text-xs text-indigo-400 font-bold flex items-center gap-1">
                    <Zap size={13} /> +{currentQuestion.xp_value || 25} XP
                  </span>

                  <button
                    onClick={() => {
                      if (showVoiceMentorPanel && isSpeaking) {
                        stopSpeaking();
                      } else {
                        handleExplainQuestionWithVoice(currentQuestion, selectedOption, validationResult, true);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSpeaking
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 ring-2 ring-amber-500/20 animate-pulse'
                        : showVoiceMentorPanel
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                        : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20'
                    }`}
                    title="Aptitude Voice Mistake Mentor: Listen to step-by-step reasoning"
                  >
                    <Mic size={13} className={isSpeaking ? 'text-amber-400 animate-pulse' : 'text-indigo-400'} />
                    <span>{isSpeaking ? 'Mentor Speaking...' : 'Voice Mentor'}</span>
                  </button>

                  <button
                    onClick={() => toggleBookmark(currentQuestion.id)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      bookmarkedIds.has(currentQuestion.id)
                        ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                        : 'border-[var(--surface-border)] text-[var(--text-muted)] hover:text-amber-400'
                    }`}
                    title="Bookmark this question"
                  >
                    <BookMarked size={14} />
                  </button>
                </div>
              </div>

              {/* Collapsible Question Jump Navigator Palette */}
              {showQuestionPalette && (
                <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-indigo-500/30 shadow-inner space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LayoutGrid size={15} className="text-indigo-400" />
                      <h4 className="text-xs font-bold text-[var(--text-primary)]">
                        Question Navigator — Jump to Any Question (1 to {questions.length})
                      </h4>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Solved
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Incorrect
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Current
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16 gap-1.5 max-h-56 overflow-y-auto p-1">
                    {questions.map((q, idx) => {
                      const attempt = answeredQuestions[q.id];
                      const isCurrent = currentIndex === idx;

                      let btnClass = 'bg-[var(--surface-card)] text-[var(--text-secondary)] border border-[var(--surface-border)] hover:border-indigo-500/50';
                      if (isCurrent) {
                        btnClass = 'bg-indigo-600 text-white font-extrabold ring-2 ring-indigo-400 scale-105';
                      } else if (attempt) {
                        if (attempt.isCorrect) {
                          btnClass = 'bg-emerald-500 text-white font-bold border-emerald-400';
                        } else {
                          btnClass = 'bg-rose-500 text-white font-bold border-rose-400';
                        }
                      }

                      return (
                        <button
                          key={q.id}
                          onClick={() => jumpToQuestion(idx)}
                          className={`h-8 rounded-lg text-xs transition-all flex items-center justify-center cursor-pointer ${btnClass}`}
                          title={`Question ${idx + 1}: ${q.subtopic || q.topic_name}`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Question Text */}
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] leading-relaxed whitespace-pre-line">
                  {currentQuestion.question}
                </h3>
              </div>

              {/* Options Selection */}
              <div className="space-y-3 pt-2">
                {currentQuestion.options.map((opt) => {
                  const isSelected = selectedOption === opt.option_key;
                  const isSubmitted = answerSubmitted;
                  const isCorrect = validationResult
                    ? opt.option_key === validationResult.correct_answer
                    : opt.option_key === currentQuestion.correct_answer;
                  const isWrongChoice = isSubmitted && isSelected && !isCorrect;

                  let borderClass = 'border-[var(--surface-border)] hover:border-indigo-500/40 bg-[var(--surface-elevated)]';
                  let badgeClass = 'bg-[var(--surface-card)] text-[var(--text-secondary)] border border-[var(--surface-border)]';

                  if (isSubmitted) {
                    if (isCorrect) {
                      borderClass = 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20';
                      badgeClass = 'bg-emerald-500 text-white';
                    } else if (isWrongChoice) {
                      borderClass = 'bg-rose-500/10 border-rose-500 ring-2 ring-rose-500/20';
                      badgeClass = 'bg-rose-500 text-white';
                    }
                  } else if (isSelected) {
                    borderClass = 'bg-indigo-600/15 border-indigo-500 ring-2 ring-indigo-500/20';
                    badgeClass = 'bg-indigo-600 text-white';
                  }

                  return (
                    <button
                      key={opt.option_key}
                      onClick={() => handleSelectOption(opt.option_key)}
                      disabled={answerSubmitted}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-4 cursor-pointer group ${borderClass}`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${badgeClass}`}>
                          {opt.option_key}
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-[var(--text-primary)]">
                          {opt.option_text}
                        </span>
                      </div>

                      {isSubmitted && isCorrect && (
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                      )}
                      {isSubmitted && isWrongChoice && (
                        <XCircle size={18} className="text-rose-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Bottom Practice Action Bar */}
              <div className="pt-4 border-t border-[var(--surface-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {!answerSubmitted ? (
                    <button
                      onClick={handleVerifyPracticeAnswer}
                      disabled={!selectedOption || checkingAnswer}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check size={14} />
                      <span>{checkingAnswer ? 'Checking...' : 'Check Answer'}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                          validationResult?.is_correct
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {validationResult?.is_correct ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        {validationResult?.is_correct
                          ? `Correct! (+${validationResult.xp_earned} XP)`
                          : `Incorrect! Correct is (${validationResult?.correct_answer || currentQuestion.correct_answer})`}
                      </span>

                      <button
                        onClick={() => {
                          if (!showVoiceMentorPanel) {
                            handleExplainQuestionWithVoice(currentQuestion, selectedOption, validationResult, true);
                          } else if (isSpeaking) {
                            stopSpeaking();
                          } else if (voiceDiagnosis) {
                            speakText(voiceDiagnosis.speech_text, voiceSpeechRate);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                          !validationResult?.is_correct
                            ? 'bg-gradient-to-r from-rose-500/20 to-indigo-500/20 border-rose-500/40 text-rose-300 hover:from-rose-500/30 hover:to-indigo-500/30 ring-1 ring-rose-500/30 animate-pulse'
                            : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20'
                        }`}
                        title="Open Voice Mistake Mentor for verbal step-by-step guidance"
                      >
                        <Radio size={14} className={isSpeaking ? 'animate-pulse text-amber-400' : 'text-indigo-400'} />
                        <span>
                          {isSpeaking
                            ? 'Stop Voice Narration'
                            : !validationResult?.is_correct
                            ? '🎙️ Voice Mistake Mentor'
                            : '🎙️ Voice Speed Shortcut'}
                        </span>
                      </button>

                      <button
                        onClick={() => setShowExplanation(!showExplanation)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4 cursor-pointer"
                      >
                        {showExplanation ? 'Hide Text Solution' : 'View Text Solution'}
                      </button>
                    </div>
                  )}

                  <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline ml-2">
                    Press 1-4 or A-D on keyboard
                  </span>
                </div>

                {/* Next / Previous Navigator */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={currentIndex === 0}
                    className="p-2 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] disabled:opacity-30 text-[var(--text-primary)] border border-[var(--surface-border)] cursor-pointer"
                    title="Previous question"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <button
                    onClick={handleNextQuestion}
                    disabled={currentIndex === questions.length - 1}
                    className="px-4 py-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 disabled:opacity-30 text-indigo-400 text-xs font-bold border border-indigo-500/30 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Next Question</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* ======================================================== */}
              {/* APTITUDE VOICE MISTAKE MENTOR PANEL                      */}
              {/* ======================================================== */}
              {showVoiceMentorPanel && (
                <div className="p-6 rounded-3xl bg-slate-900/95 border border-indigo-500/40 shadow-2xl space-y-5 animate-in fade-in duration-200 backdrop-blur-md">
                  {/* Panel Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-500/20 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
                        <Mic size={20} className={isSpeaking ? 'animate-bounce text-cyan-300' : ''} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
                            PrepPilot Aptitude Voice Mistake Mentor
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                            <Sparkles size={11} /> AI Voice Derivation
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Step-by-step mathematical reasoning, error root-cause critique, and campus screening speed shortcuts
                        </p>
                      </div>
                    </div>

                    {/* Voice Controls: Play/Stop & Speed */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-[11px]">
                        <span className="text-slate-400 text-[10px] px-1 font-semibold">Speed:</span>
                        {[1.0, 1.25].map(rate => (
                          <button
                            key={rate}
                            onClick={() => {
                              setVoiceSpeechRate(rate);
                              if (isSpeaking && voiceDiagnosis) {
                                speakText(voiceDiagnosis.speech_text, rate);
                              }
                            }}
                            className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                              voiceSpeechRate === rate
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          if (isSpeaking) {
                            stopSpeaking();
                          } else if (voiceDiagnosis) {
                            speakText(voiceDiagnosis.speech_text, voiceSpeechRate);
                          } else {
                            handleExplainQuestionWithVoice(currentQuestion, selectedOption, validationResult, true);
                          }
                        }}
                        disabled={loadingVoiceDiagnosis}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                          isSpeaking
                            ? 'bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 ring-2 ring-amber-500/20'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/40 shadow-indigo-600/30'
                        }`}
                      >
                        {loadingVoiceDiagnosis ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : isSpeaking ? (
                          <Pause size={14} className="fill-current" />
                        ) : (
                          <Volume2 size={14} />
                        )}
                        <span>{loadingVoiceDiagnosis ? 'Synthesizing...' : isSpeaking ? 'Pause Narration' : 'Listen to Mentor'}</span>
                      </button>

                      <button
                        onClick={() => {
                          stopSpeaking();
                          setShowVoiceMentorPanel(false);
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Close voice mentor panel"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Live Soundwave Audio Bar (active while speaking) */}
                  {isSpeaking && (
                    <div className="p-3 rounded-2xl bg-slate-950/70 border border-cyan-500/30 flex items-center justify-between gap-4 animate-in fade-in">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                        <span className="text-xs font-semibold text-cyan-300">
                          Mentor Speaking: Explaining Option comparison and step-by-step logic...
                        </span>
                      </div>
                      <div className="flex items-center gap-1 h-5 pr-2">
                        {[35, 75, 100, 55, 90, 45, 80, 60].map((h, i) => (
                          <span
                            key={i}
                            className="w-1 rounded-full bg-gradient-to-t from-indigo-500 to-cyan-400 animate-pulse"
                            style={{
                              height: `${h}%`,
                              animationDuration: '650ms',
                              animationDelay: `${i * 90}ms`
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Content Breakdown Grid */}
                  {loadingVoiceDiagnosis ? (
                    <div className="py-8 text-center space-y-3">
                      <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs text-slate-400 font-medium">
                        PrepPilot Mentor is analyzing your chosen answer, verifying the formula, and generating audio derivation...
                      </p>
                    </div>
                  ) : voiceDiagnosis ? (
                    <div className="space-y-4">
                      {/* Side-by-side comparison cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Card 1: Candidate's Chosen Answer */}
                        <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/30 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
                              <XCircle size={13} /> Your Selected Choice
                            </span>
                            <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              Option {voiceDiagnosis.chosen_answer}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-white">
                            {voiceDiagnosis.chosen_text}
                          </div>
                          <div className="text-xs text-slate-300 leading-relaxed pt-1">
                            <strong className="text-rose-400">Why this was incorrect: </strong>
                            {voiceDiagnosis.why_chosen_wrong}
                          </div>
                        </div>

                        {/* Card 2: Exact Correct Solution */}
                        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/30 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 size={13} /> Verified Correct Answer
                            </span>
                            <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Option {voiceDiagnosis.correct_answer}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-white">
                            {voiceDiagnosis.correct_text}
                          </div>
                          <div className="text-xs text-slate-300 leading-relaxed pt-1">
                            <strong className="text-emerald-400">Mathematical & Logical Proof: </strong>
                            {voiceDiagnosis.why_correct}
                          </div>
                        </div>
                      </div>

                      {/* Speed Shortcut & Placement Tip */}
                      <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-start gap-3">
                        <Zap size={18} className="text-cyan-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <h5 className="text-xs font-bold text-cyan-300">
                            Campus Screening Speed-Math Shortcut (TCS, Infosys, Accenture, Cognizant)
                          </h5>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {voiceDiagnosis.speed_shortcut || 'Use option elimination and test boundaries first.'}
                          </p>
                        </div>
                      </div>

                      {/* Spoken Text Accordion Preview */}
                      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between gap-3">
                        <span className="flex items-center gap-1.5">
                          <Radio size={13} className="text-indigo-400" />
                          <span>Audible narration script ready for replay anytime.</span>
                        </span>
                        <button
                          onClick={() => speakText(voiceDiagnosis.speech_text, voiceSpeechRate)}
                          className="text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
                        >
                          Replay Audio
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Step-by-Step Mathematical & Logical Solution Reveal */}
              {showExplanation && (
                <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                    <Lightbulb size={16} />
                    <span>Step-by-Step Derivation & Placement Pro-Tip</span>
                  </div>

                  <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-line">
                    {validationResult?.explanation || currentQuestion.explanation}
                  </p>

                  <div className="pt-2 flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
                      Shortcut Insight
                    </span>
                    <span>
                      Speed formula: Review related formulas in the Formula Sheet above for faster computation.
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. FORMULA CHEAT SHEET MODAL                             */}
      {/* ======================================================== */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-4">
              <div className="flex items-center gap-2.5">
                <FileText size={20} className="text-indigo-400" />
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  Aptitude Speed-Math & Formula Cheat Sheet
                </h3>
              </div>
              <button
                onClick={() => setShowFormulaModal(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6">
              {formulaSheets.map((cat, idx) => (
                <div key={idx} className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    {cat.category}
                  </h4>
                  <div className="grid grid-cols-1 gap-2.5">
                    {cat.formulas.map((f, fIdx) => (
                      <div
                        key={fIdx}
                        className="p-3.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] space-y-1"
                      >
                        <h5 className="text-xs font-bold text-[var(--text-primary)]">{f.title}</h5>
                        <p className="text-xs font-mono text-cyan-400 bg-black/20 p-2 rounded-lg border border-[var(--surface-border)]">
                          {f.formula}
                        </p>
                        {f.tip && (
                          <p className="text-[11px] text-[var(--text-muted)] italic pt-0.5">
                            💡 {f.tip}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center border-t border-[var(--surface-border)]">
              <button
                onClick={() => setShowFormulaModal(false)}
                className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
              >
                Close Sheet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AptitudePracticePage;
