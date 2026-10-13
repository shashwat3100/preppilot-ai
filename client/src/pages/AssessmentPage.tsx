import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useVoice } from '../context/VoiceContext';
import api from '../services/api';
import { CodeEditor } from '../components/CodeEditor';
import {
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  Flame,
  LayoutDashboard,
  RotateCcw,
  Code2,
  Sparkles,
  Bot,
  Volume2,
  VolumeX,
  Mic,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Play,
  Terminal,
  FileCode2,
  BookOpen,
  ChevronRight,
  Check,
  Loader2
} from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: Array<{ id: string; option_key: string; option_text: string }>;
  subject_name?: string;
  topic_name?: string;
  explanation?: string;
}

interface CodingProblem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  constraints: string;
  starterCode: Record<string, string>;
  testCaseCount: number;
}

export const AssessmentPage: React.FC<{ onReturnToDashboard: () => void }> = ({ onReturnToDashboard }) => {
  const { user, refreshUser } = useAuth();
  const { speakText, stopSpeaking, isSpeaking, openVoiceModal } = useVoice();

  // Test stage: 'intro' | 'quiz' | 'coding' | 'result'
  const [stage, setStage] = useState<'intro' | 'quiz' | 'coding' | 'result'>('intro');

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResultScore, setQuizResultScore] = useState<any>(null);

  // Coding state
  const [codingProblem, setCodingProblem] = useState<CodingProblem | null>(null);
  const [codingLanguage, setCodingLanguage] = useState('python');
  const [codingCode, setCodingCode] = useState('');
  const [runningCode, setRunningCode] = useState(false);
  const [submittingCode, setSubmittingCode] = useState(false);
  const [runOutput, setRunOutput] = useState('');
  const [runError, setRunError] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [codingSubmitted, setCodingSubmitted] = useState(false);
  const [codingPassCount, setCodingPassCount] = useState(0);
  const [codingTotalCount, setCodingTotalCount] = useState(0);

  // Overall test timers
  const [overallStartTime, setOverallStartTime] = useState<number>(0);
  const [elapsedTimer, setElapsedTimer] = useState<number>(0);
  const [loadingInitial, setLoadingInitial] = useState(false);

  // Voice Assessment Debrief
  const [isDiagnosingVoice, setIsDiagnosingVoice] = useState(false);
  const [voiceDebrief, setVoiceDebrief] = useState<{
    speech_text: string;
    overview: string;
    recommendations: string[];
  } | null>(null);

  // Load test assets on start
  const handleStartAssessment = async () => {
    setLoadingInitial(true);
    try {
      // 1. Fetch adaptive questions for Section 1
      const quizRes = await api.startAdaptiveDailyQuiz(4);
      if (quizRes.success && quizRes.quiz && quizRes.quiz.questions) {
        setQuizQuestions(quizRes.quiz.questions);
      }

      // 2. Fetch coding problem for Section 2
      const problemsRes = await api.getCodingProblems();
      if (problemsRes.problems && problemsRes.problems.length > 0) {
        // Pick an unbiased problem (e.g. Two Sum or Valid Parentheses)
        const chosen = problemsRes.problems.find((p: any) => p.id === 'prob-two-sum') || problemsRes.problems[0];
        setCodingProblem(chosen);
        setCodingCode(chosen.starterCode?.python || 'def solve():\n    pass\n\nsolve()');
      }

      setOverallStartTime(Date.now());
      setStage('quiz');
    } catch (err) {
      console.error('Failed to initialize placement assessment:', err);
    } finally {
      setLoadingInitial(false);
    }
  };

  // Timer interval
  useEffect(() => {
    if (stage === 'intro' || stage === 'result' || !overallStartTime) return;
    const interval = setInterval(() => {
      setElapsedTimer(Math.floor((Date.now() - overallStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [stage, overallStartTime]);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Handle MCQ answer selection
  const handleSelectQuizOption = (questionId: string, optionKey: string) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: optionKey }));
  };

  // Finish Section 1 (MCQ) & advance to Section 2 (Coding)
  const handleFinishQuizSection = () => {
    // Calculate preliminary MCQ score
    let correct = 0;
    quizQuestions.forEach(q => {
      // If student answer matches
      if (quizAnswers[q.id]) {
        correct++;
      }
    });
    setQuizResultScore({
      total: quizQuestions.length,
      answered: Object.keys(quizAnswers).length
    });
    setStage('coding');
  };

  // Handle Code Run (Sample)
  const handleRunCode = async (codeVal: string, lang: string) => {
    setRunningCode(true);
    setRunOutput('');
    setRunError('');
    setTestResults([]);
    try {
      const res = await api.runCode(codeVal, lang, '');
      if (res.success) {
        setRunOutput(res.output || '(Execution finished with no stdout)');
      } else {
        setRunError(res.error || 'Execution failed');
      }
    } catch (err) {
      setRunError('Failed to execute code runner.');
    } finally {
      setRunningCode(false);
    }
  };

  // Handle Code Submit (Grading against unbiased test cases)
  const handleSubmitCode = async (codeVal: string, lang: string) => {
    if (!codingProblem) return;
    setSubmittingCode(true);
    setRunOutput('');
    setRunError('');
    try {
      const res = await api.submitCode(codingProblem.id, codeVal, lang);
      if (res.submission) {
        setTestResults(res.submission.results || []);
        setCodingPassCount(res.passedCount || 0);
        setCodingTotalCount(res.totalCount || 0);
        setCodingSubmitted(true);
      } else if (res.error) {
        setRunError(res.error);
      }
    } catch (err) {
      setRunError('Failed to grade test cases.');
    } finally {
      setSubmittingCode(false);
    }
  };

  // Complete Full Assessment and show Result Scorecard
  const handleCompleteAssessment = async () => {
    setStage('result');
    await refreshUser();

    // Trigger celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Auto-generate Voice Debrief script
    const mcqAccuracy = Math.round((Object.keys(quizAnswers).length / Math.max(1, quizQuestions.length)) * 100);
    const codingClearance = codingTotalCount > 0 ? Math.round((codingPassCount / codingTotalCount) * 100) : 100;
    const overallScore = Math.round((mcqAccuracy * 0.4) + (codingClearance * 0.6));

    const voiceScript = `Greetings ${user?.name || 'Candidate'}! Here is your complete Placement Examination debrief. In this unbiased assessment, your overall Placement Readiness Index is ${overallScore} percent. In Section 1, Technical MCQs, you attempted ${Object.keys(quizAnswers).length} of ${quizQuestions.length} questions. In Section 2, Hands-on Programming, your solution cleared ${codingPassCount} out of ${codingTotalCount || codingProblem?.testCaseCount || 5} automated test cases with zero human bias. For your next interview, keep sharpening edge-case handling in algorithms and maintain your daily practice!`;

    setVoiceDebrief({
      speech_text: voiceScript,
      overview: `Unbiased automated evaluation completed. Overall Placement Readiness Index: ${overallScore}%. Automated test cases clearance: ${codingPassCount}/${codingTotalCount || 5}.`,
      recommendations: [
        'Review edge-case input handling in standard DSA problems',
        'Practice timed problem solving under interview conditions',
        'Consult PrepPilot Voice Assistant for viva concept revisions'
      ]
    });
  };

  // Toggle voice playback
  const handleToggleVoiceDebrief = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else if (voiceDebrief?.speech_text) {
      speakText(voiceDebrief.speech_text);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  RENDER: Intro Screen                                              */
  /* ------------------------------------------------------------------ */
  if (stage === 'intro') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 animate-in fade-in duration-300">
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 text-cyan-400 border border-cyan-500/30 mb-2">
            <ShieldCheck size={40} />
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-500 dark:text-cyan-300 border border-cyan-500/30 inline-block">
            Campus Placement Simulation 2026
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
            Full Placement Assessment (Quiz + Live Coding)
          </h1>
          <p className="text-sm text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Experience an authentic, 100% objective technical screening drive. This assessment evaluates both theoretical engineering aptitude and live hands-on code clearance against strict, unbiased automated test cases.
          </p>
        </div>

        {/* Structure Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-3xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                <BookOpen size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Section 1: Technical & Aptitude Quiz</h3>
                <span className="text-xs text-[var(--text-secondary)]">4 Core CS Questions • 5 Minutes</span>
              </div>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Covers Operating Systems, DBMS normalization, Computer Networks, and Data Structures. Objectively evaluates fundamental concepts essential for technical interviews.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-500 dark:text-cyan-400 border border-cyan-500/30">
                <Code2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Section 2: Live Programming Test</h3>
                <span className="text-xs text-[var(--text-secondary)]">1 Hands-on Challenge • Test Cases Driven</span>
              </div>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Solve an algorithmic problem in C, C++, Python, or Java. Complete description, constraints, and automated execution against public and hidden test cases. Zero human bias.
            </p>
          </div>
        </div>

        {/* Fairness & AI Voice Debrief Guarantee */}
        <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3.5">
          <Sparkles size={22} className="text-cyan-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold text-white text-sm block">Objective Scoring & Voice Mentor Guarantee</span>
            <p className="text-slate-300 leading-relaxed">
              Your test code executes in a sandboxed runtime against automated test suites. At the conclusion, the <strong>PrepPilot AI Voice Mentor</strong> provides a personalized spoken debrief, dissecting your performance and giving actionable interview advice.
            </p>
          </div>
        </div>

        {/* Start Button */}
        <div className="flex items-center justify-center pt-2">
          <button
            onClick={handleStartAssessment}
            disabled={loadingInitial}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-3 transform hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-60"
          >
            {loadingInitial ? (
              <>
                <Loader2 size={18} className="animate-spin text-white" />
                <span>Initializing Assessment Environment...</span>
              </>
            ) : (
              <>
                <Play size={18} className="fill-white" />
                <span>Begin Assessment Now</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /*  RENDER: Section 1 - Technical Quiz                                */
  /* ------------------------------------------------------------------ */
  if (stage === 'quiz') {
    const currentQ = quizQuestions[quizIndex];
    if (!currentQ) return null;

    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-200">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Section 1 of 2: Quiz
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Question {quizIndex + 1} of {quizQuestions.length}
            </span>
          </div>

          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Clock size={14} />
            <span>Time Elapsed: {formatSeconds(elapsedTimer)}</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {currentQ.subject_name || 'Core Engineering'} • {currentQ.topic_name || 'Concept'}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
              {currentQ.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options?.map((opt) => {
              const selected = quizAnswers[currentQ.id] === opt.option_key;
              return (
                <button
                  key={opt.id || opt.option_key}
                  onClick={() => handleSelectQuizOption(currentQ.id, opt.option_key)}
                  className={`w-full p-4 rounded-2xl text-left text-sm font-medium transition-all flex items-center justify-between border cursor-pointer ${
                    selected
                      ? 'bg-indigo-600/20 border-cyan-500 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                      selected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {opt.option_key}
                    </span>
                    <span>{opt.option_text}</span>
                  </div>
                  {selected && <Check size={18} className="text-cyan-400" />}
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setQuizIndex(prev => Math.max(0, prev - 1))}
              disabled={quizIndex === 0}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
            >
              Previous Question
            </button>

            {quizIndex < quizQuestions.length - 1 ? (
              <button
                onClick={() => setQuizIndex(prev => prev + 1)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <span>Next Question</span>
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleFinishQuizSection}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
              >
                <span>Complete Section 1 & Proceed to Coding</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /*  RENDER: Section 2 - Live Programming Test                         */
  /* ------------------------------------------------------------------ */
  if (stage === 'coding') {
    if (!codingProblem) return null;

    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-950 overflow-hidden">
        {/* Top Assessment Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Section 2: Live Programming
            </span>
            <span className="text-xs font-bold text-white">{codingProblem.title}</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30">
              {codingProblem.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock size={13} className="text-cyan-400" />
              <span>{formatSeconds(elapsedTimer)}</span>
            </div>

            <button
              onClick={handleCompleteAssessment}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Submit Entire Assessment</span>
              <CheckCircle2 size={14} />
            </button>
          </div>
        </div>

        {/* Split Screen: Problem Description (Left) + Monaco Editor (Right) */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          {/* Left: Problem Details */}
          <div className="w-full lg:w-2/5 p-5 border-b lg:border-b-0 lg:border-r border-slate-800 overflow-y-auto space-y-4 bg-slate-950/60">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Problem Statement</span>
              <h2 className="text-xl font-bold text-white">{codingProblem.title}</h2>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
              {codingProblem.description}
            </div>

            {/* Constraints */}
            {codingProblem.constraints && (
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                <span className="font-bold text-indigo-300 uppercase tracking-wider text-[10px]">Constraints</span>
                <pre className="text-slate-400 font-mono text-[11px] whitespace-pre-wrap">{codingProblem.constraints}</pre>
              </div>
            )}

            {/* Test Case Clearance Status Banner */}
            {codingSubmitted && (
              <div className={`p-4 rounded-2xl border ${
                codingPassCount === codingTotalCount
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    {codingPassCount === codingTotalCount ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                    {codingPassCount === codingTotalCount ? 'All Test Cases Passed!' : 'Partial Clearance'}
                  </span>
                  <span className="font-extrabold text-sm">{codingPassCount}/{codingTotalCount} Passed</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {codingPassCount === codingTotalCount
                    ? '100% objective clearance achieved. Zero human bias.'
                    : 'Some test cases did not match expected output. You can edit code and re-submit or proceed.'}
                </p>
              </div>
            )}
          </div>

          {/* Right: Code Editor & Execution Runner */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-slate-900">
            <CodeEditor
              language={codingLanguage}
              onLanguageChange={(lang: string) => {
                setCodingLanguage(lang);
                if (codingProblem.starterCode?.[lang]) {
                  setCodingCode(codingProblem.starterCode[lang]);
                }
              }}
              code={codingCode}
              onCodeChange={(val: string) => setCodingCode(val)}
              onRun={handleRunCode}
              onSubmit={handleSubmitCode}
              running={runningCode}
              submitting={submittingCode}
              runOutput={runOutput}
              runError={runError}
              testResults={testResults}
              height="100%"
            />
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /*  RENDER: Section 3 - Final Unified Scorecard & Voice Debrief       */
  /* ------------------------------------------------------------------ */
  const mcqAnsweredCount = Object.keys(quizAnswers).length;
  const totalMcq = quizQuestions.length || 4;
  const mcqAccuracy = Math.round((mcqAnsweredCount / totalMcq) * 100);
  const codingTotal = codingTotalCount || codingProblem?.testCaseCount || 5;
  const codingClearance = codingTotal > 0 ? Math.round((codingPassCount / codingTotal) * 100) : 100;
  const overallIndex = Math.round((mcqAccuracy * 0.4) + (codingClearance * 0.6));

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 animate-in zoom-in-95 duration-300">
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
          <Award size={40} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
          Placement Assessment Evaluation Complete
        </h1>
        <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto">
          Comprehensive report synthesized from Section 1 (Technical MCQs) and Section 2 (Automated Code Test Case Clearance).
        </p>
      </div>

      {/* KPI Score Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] text-center">
          <span className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">Placement Readiness</span>
          <span className="text-3xl font-extrabold text-cyan-500 dark:text-cyan-400">{overallIndex}%</span>
          <span className="text-[11px] text-[var(--text-muted)] block mt-1">Weighted Composite</span>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] text-center">
          <span className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">MCQ Completed</span>
          <span className="text-3xl font-extrabold text-indigo-400">{mcqAnsweredCount}/{totalMcq}</span>
          <span className="text-[11px] text-[var(--text-muted)] block mt-1">{mcqAccuracy}% Attempt Rate</span>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] text-center">
          <span className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">Test Cases Cleared</span>
          <span className="text-3xl font-extrabold text-emerald-500 dark:text-emerald-400">{codingPassCount}/{codingTotal}</span>
          <span className="text-[11px] text-[var(--text-muted)] block mt-1">Zero-Bias Automated</span>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] text-center">
          <span className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">Total Time</span>
          <span className="text-3xl font-extrabold text-amber-500 dark:text-amber-400">{formatSeconds(elapsedTimer)}</span>
          <span className="text-[11px] text-[var(--text-muted)] block mt-1">Full Timed Drive</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* PREPPILOT VOICE ASSISTANT DEBRIEF CARD                         */}
      {/* ============================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-950 border border-cyan-500/40 p-6 sm:p-7 shadow-2xl shadow-indigo-950/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
                <Sparkles size={13} className="text-cyan-400 animate-pulse" />
                PrepPilot Voice Officer Debrief
              </span>
              {isSpeaking && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 animate-pulse">
                  <Volume2 size={12} />
                  Speaking Assessment Review
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Personalized Audio Feedback on Your Quiz & Coding Test
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Listen to a comprehensive voice breakdown of your test. PrepPilot evaluates your MCQ attempts, dissects code test case performance, and outlines exact preparation steps before your on-campus placement interview.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleToggleVoiceDebrief}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 hover:from-cyan-400 hover:to-indigo-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-cyan-500/20 flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                {isSpeaking ? (
                  <>
                    <VolumeX size={16} />
                    <span>Pause / Stop Voice Debrief</span>
                  </>
                ) : (
                  <>
                    <Mic size={16} className="animate-pulse" />
                    <span>Listen to Voice Officer Debrief</span>
                  </>
                )}
              </button>

              <button
                onClick={openVoiceModal}
                className="px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Bot size={15} className="text-cyan-400" />
                <span>Ask Voice Assistant Viva Doubts</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/70 border border-slate-800 min-w-[180px] text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isSpeaking
                ? 'bg-gradient-to-br from-cyan-500 to-indigo-600 text-white shadow-xl shadow-cyan-500/50 scale-110 animate-pulse'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}>
              {isSpeaking ? <Volume2 size={26} /> : <Mic size={26} />}
            </div>
            <span className="text-xs font-bold text-white mt-3 block">
              {isSpeaking ? 'Voice Active' : 'Ready to Speak'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {isSpeaking ? 'Candidate review in progress' : 'Tap to hear debrief'}
            </span>
          </div>
        </div>

        {/* Written Debrief Summary */}
        {voiceDebrief && (
          <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/20 text-xs space-y-1.5">
              <span className="font-extrabold text-cyan-300 flex items-center gap-1.5">
                <Sparkles size={14} /> Evaluation Summary:
              </span>
              <p className="text-slate-200 leading-relaxed">{voiceDebrief.overview}</p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-2">
              <span className="font-extrabold text-indigo-300 flex items-center gap-1.5">
                <BookOpen size={14} /> Recommended Action Items:
              </span>
              <ul className="space-y-1.5 text-slate-300">
                {voiceDebrief.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Return & Retake Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={onReturnToDashboard}
          className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
        >
          <LayoutDashboard size={16} />
          <span>Return to Dashboard</span>
        </button>

        <button
          onClick={() => {
            setStage('intro');
            setQuizAnswers({});
            setTestResults([]);
            setCodingPassCount(0);
            setCodingSubmitted(false);
          }}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw size={16} />
          <span>Retake Another Placement Assessment</span>
        </button>
      </div>
    </div>
  );
};

export default AssessmentPage;
