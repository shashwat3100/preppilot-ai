import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  ChevronLeft,
  Check,
  Loader2,
  HelpCircle,
  BarChart3,
  ListOrdered,
  Building2,
  Sliders,
  Send,
  X,
  Flag,
  Printer,
  FileText
} from 'lucide-react';

interface QuestionOption {
  id: string;
  option_key: string;
  option_text: string;
}

interface Question {
  id: string;
  question: string;
  options: QuestionOption[];
  subject_name?: string;
  topic_name?: string;
  difficulty?: string;
  explanation?: string;
  correct_answer?: string;
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

interface AssessmentCard {
  id: string;
  type: string;
  title: string;
  category: string;
  questionCount: number;
  availableQuestions?: number;
  durationMinutes: number;
  description: string;
  passingPercent: number;
  subjects: string[];
  hasCodingSection?: boolean;
}

const DEFAULT_ASSESSMENTS: AssessmentCard[] = [
  {
    id: 'asmt-core-cs',
    type: 'core-cs',
    title: 'Core Computer Science Comprehensive Assessment',
    category: 'Core Computer Science',
    questionCount: 20,
    durationMinutes: 25,
    description: 'Comprehensive 20-question evaluation covering Operating Systems (paging, deadlocks, scheduling), DBMS (normalization, ACID, indexing), Computer Networks (OSI, TCP/IP, DNS), and OOP principles.',
    passingPercent: 65,
    subjects: ['Operating Systems', 'DBMS', 'Computer Networks', 'OOP']
  },
  {
    id: 'asmt-tcs-nqt',
    type: 'tcs-nqt',
    title: 'TCS-Style National Qualifier Mock Assessment',
    category: 'Company Recruitment',
    questionCount: 30,
    durationMinutes: 45,
    description: 'Authentic 30-question screening test following TCS NQT patterns: Quantitative Aptitude (work/time, speeds, ratios, percentages), Logical Reasoning (syllogisms, clocks, seating), and Technical CS Foundations.',
    passingPercent: 60,
    subjects: ['Quantitative Aptitude', 'Logical Reasoning', 'C / C++ Basics', 'Core CS']
  },
  {
    id: 'asmt-dsa-mastery',
    type: 'dsa-mastery',
    title: 'Data Structures & Algorithms Mastery Test',
    category: 'Algorithms & Problem Solving',
    questionCount: 15,
    durationMinutes: 30,
    description: 'Focused 15-question technical drill covering Binary Trees & BSTs, Graph Traversals (BFS/DFS), Hash Tables, Min/Max Heaps, Dynamic Programming, and Asymptotic Complexity.',
    passingPercent: 70,
    subjects: ['Data Structures & Algorithms']
  },
  {
    id: 'asmt-full-simulation',
    type: 'full-simulation',
    title: 'Full Campus Placement Simulation (Quiz + Live Coding)',
    category: 'Comprehensive Screening',
    questionCount: 10,
    hasCodingSection: true,
    durationMinutes: 35,
    description: 'Dual-section evaluation simulating Tier-1 corporate drives: 10 technical MCQs followed by a live programming challenge evaluated against automated test cases.',
    passingPercent: 70,
    subjects: ['Core Engineering', 'Data Structures & Algorithms']
  }
];

export const AssessmentPage: React.FC<{ onReturnToDashboard: () => void }> = ({ onReturnToDashboard }) => {
  const { user, refreshUser } = useAuth();
  const { speakText, stopSpeaking, isSpeaking, setActiveQuestionContext } = useVoice();


  // Test stage: 'catalog' | 'quiz' | 'coding' | 'result'
  const [stage, setStage] = useState<'catalog' | 'quiz' | 'coding' | 'result'>('catalog');

  // Available Assessments Catalog
  const [catalog, setCatalog] = useState<AssessmentCard[]>(DEFAULT_ASSESSMENTS);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentCard | null>(null);

  // Active Assessment State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(0);
  const [totalDurationSeconds, setTotalDurationSeconds] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [loadingAssessment, setLoadingAssessment] = useState(false);
  const [submittingAssessment, setSubmittingAssessment] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Results State
  const [gradedResult, setGradedResult] = useState<any | null>(null);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'correct' | 'incorrect' | 'unattempted'>('all');

  // Live Coding Section (for Full Simulation)
  const [codingProblem, setCodingProblem] = useState<CodingProblem | null>(null);
  const [codingLanguage, setCodingLanguage] = useState('python');
  const [codingCode, setCodingCode] = useState('');
  const [runningCode, setRunningCode] = useState(false);
  const [runOutput, setRunOutput] = useState('');
  const [runError, setRunError] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [codingPassCount, setCodingPassCount] = useState(0);
  const [codingTotalCount, setCodingTotalCount] = useState(0);

  // Voice Assessment Debrief
  const [voiceDebrief, setVoiceDebrief] = useState<{
    speech_text: string;
    overview: string;
    recommendations: string[];
  } | null>(null);

  // Load live assessment catalog on mount
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await api.getQuizAssessments();
        if (res.success && res.assessments && res.assessments.length > 0) {
          setCatalog(res.assessments);
        }
      } catch (e) {
        // Fallback to DEFAULT_ASSESSMENTS
      }
    };
    fetchCatalog();
  }, []);

  // Restore active assessment progress from localStorage if present
  useEffect(() => {
    if (!user?.id || stage !== 'catalog') return;
    try {
      const savedKey = `preppilot_active_asmt_${user.id}`;
      const saved = localStorage.getItem(savedKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.sessionId && parsed.questions?.length > 0) {
          const elapsed = Math.floor((Date.now() - parsed.startTime) / 1000);
          const remaining = Math.max(0, parsed.totalDurationSeconds - elapsed);
          if (remaining > 0) {
            setSessionId(parsed.sessionId);
            setSelectedAssessment(parsed.selectedAssessment);
            setQuestions(parsed.questions);
            setAnswers(parsed.answers || {});
            setCurrentIndex(parsed.currentIndex || 0);
            setTimeRemainingSeconds(remaining);
            setTotalDurationSeconds(parsed.totalDurationSeconds);
            setStartTime(parsed.startTime);
            setStage('quiz');
          } else {
            localStorage.removeItem(savedKey);
          }
        }
      }
    } catch (e) {}
  }, [user?.id, stage]);

  // Autosave progress during active quiz attempt
  useEffect(() => {
    if (stage === 'quiz' && user?.id && sessionId && questions.length > 0) {
      try {
        const savedKey = `preppilot_active_asmt_${user.id}`;
        localStorage.setItem(savedKey, JSON.stringify({
          sessionId,
          selectedAssessment,
          questions,
          answers,
          currentIndex,
          startTime,
          totalDurationSeconds
        }));
      } catch (e) {}
    }
  }, [stage, user?.id, sessionId, questions, answers, currentIndex, startTime, totalDurationSeconds, selectedAssessment]);

  // Synchronize Active Question Context with Global Voice Assistant
  useEffect(() => {
    if (stage !== 'quiz' || questions.length === 0 || currentIndex >= questions.length) {
      setActiveQuestionContext(null);
      return;
    }
    const currentQ = questions[currentIndex];
    const chosenKey = answers[currentQ.id];
    const chosenOpt = currentQ.options?.find(o => o.option_key === chosenKey);

    setActiveQuestionContext({
      questionId: currentQ.id,
      sequence: currentIndex + 1,
      questionText: currentQ.question,
      topic: currentQ.topic_name,
      subject: currentQ.subject_name,
      options: currentQ.options?.map(o => ({ option_key: o.option_key, option_text: o.option_text })),
      chosenAnswer: chosenKey,
      chosenText: chosenOpt?.option_text,
      correctAnswer: currentQ.correct_answer,
      explanation: currentQ.explanation
    });

    return () => {
      setActiveQuestionContext(null);
    };
  }, [stage, questions, currentIndex, answers, setActiveQuestionContext]);

  // Countdown Timer Hook
  useEffect(() => {
    if (stage !== 'quiz' && stage !== 'coding') return;
    if (timeRemainingSeconds <= 0 && stage === 'quiz') {
      // Auto-submit on expiry
      handleAutoSubmitOnExpiry();
      return;
    }

    const interval = setInterval(() => {
      setTimeRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmitOnExpiry();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stage, timeRemainingSeconds]);

  // Keyboard navigation & rapid option selection hotkeys
  useEffect(() => {
    if (stage !== 'quiz' || showSubmitModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const currentQ = questions[currentIndex];
      if (!currentQ) return;

      // 1-4 Number keys
      if (['1', '2', '3', '4'].includes(e.key)) {
        const optIdx = parseInt(e.key, 10) - 1;
        if (currentQ.options && currentQ.options[optIdx]) {
          e.preventDefault();
          handleSelectOption(currentQ.options[optIdx].option_key);
        }
      }

      // A-D Letter keys
      const upperKey = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(upperKey)) {
        const found = currentQ.options?.find(o => o.option_key.toUpperCase() === upperKey);
        if (found) {
          e.preventDefault();
          handleSelectOption(found.option_key);
        }
      }

      // Next / Previous navigation
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(prev => prev + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentIndex > 0) {
          setCurrentIndex(prev => prev - 1);
        }
      }

      // Toggle Flag with 'F' key
      if (upperKey === 'F') {
        e.preventDefault();
        setFlaggedQuestions(prev => ({
          ...prev,
          [currentQ.id]: !prev[currentQ.id]
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage, showSubmitModal, currentIndex, questions]);

  // Auto-submit when countdown hits zero
  const handleAutoSubmitOnExpiry = useCallback(() => {
    if (submittingAssessment) return;
    handleFinalSubmit(true);
  }, [submittingAssessment, answers, questions, sessionId]);

  // Format seconds into MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Start selected assessment
  const handleStartAssessment = async (asmt: AssessmentCard) => {
    setSelectedAssessment(asmt);
    setLoadingAssessment(true);

    try {
      const res = await api.startQuizAssessment(asmt.type || asmt.id);
      if (res.success && res.assessment) {
        const asmtData = res.assessment;
        setSessionId(asmtData.session_id);
        setQuestions(asmtData.questions || []);
        setAnswers({});
        setCurrentIndex(0);

        const durationSec = (asmtData.duration_minutes || asmt.durationMinutes || 25) * 60;
        setTimeRemainingSeconds(durationSec);
        setTotalDurationSeconds(durationSec);
        setStartTime(Date.now());

        // If Full Placement Simulation, fetch coding problem
        if (asmt.hasCodingSection) {
          const problemsRes = await api.getCodingProblems();
          if (problemsRes.problems && problemsRes.problems.length > 0) {
            const prob = problemsRes.problems[0];
            setCodingProblem(prob);
            setCodingCode(prob.starterCode?.python || 'def solve():\n    pass\n\nsolve()');
          }
        }

        setStage('quiz');
      } else {
        alert(res.message || 'Failed to initialize assessment questions. Please try again.');
      }
    } catch (err: any) {
      console.error('Error starting assessment:', err);
      alert('Network error initializing assessment. Please ensure backend is active.');
    } finally {
      setLoadingAssessment(false);
    }
  };

  // Handle Option Selection
  const handleSelectOption = (optionKey: string) => {
    if (!questions[currentIndex]) return;
    const qId = questions[currentIndex].id;
    setAnswers(prev => ({ ...prev, [qId]: optionKey }));
  };

  // Final Submit Action
  const handleFinalSubmit = async (isExpired = false) => {
    if (submittingAssessment || !sessionId) return;
    setSubmittingAssessment(true);
    setShowSubmitModal(false);

    try {
      const formattedAnswers = questions.map(q => ({
        question_id: q.id,
        answer: answers[q.id] || '',
        time_spent: 30
      }));

      const elapsedSeconds = totalDurationSeconds - timeRemainingSeconds;
      const res = await api.submitQuiz(sessionId, formattedAnswers, Math.max(1, elapsedSeconds));

      // Clean up localStorage active attempt
      if (user?.id) {
        localStorage.removeItem(`preppilot_active_asmt_${user.id}`);
      }

      if (res.success && res.result) {
        setGradedResult(res.result);
        await refreshUser();

        // If this is full simulation with coding, advance to coding challenge
        if (selectedAssessment?.hasCodingSection && codingProblem) {
          setStage('coding');
        } else {
          setStage('result');
          triggerCelebration();
          buildVoiceDebrief(res.result);
        }
      } else {
        alert(res.message || 'Error grading assessment submission.');
      }
    } catch (err: any) {
      console.error('Error submitting assessment:', err);
      alert('Error submitting assessment. Please check connection and try again.');
    } finally {
      setSubmittingAssessment(false);
    }
  };

  // Confetti celebration
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 110,
        spread: 75,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  // Build Voice Debrief
  const buildVoiceDebrief = (result: any) => {
    const accuracy = result.accuracy_rate || 0;
    const correct = result.correct_count || 0;
    const total = result.total_questions || questions.length;
    const passing = (selectedAssessment?.passingPercent || 65);
    const passed = accuracy >= passing;

    const script = `Greetings ${user?.name || 'Candidate'}! You have completed the ${selectedAssessment?.title || 'Placement Assessment'}. You scored ${correct} out of ${total} questions, achieving an accuracy of ${accuracy} percent. ${passed ? 'You have successfully cleared the placement benchmark!' : 'This assessment highlighted a few core concepts for revision.'} Keep practicing to maximize your campus placement clearance.`;

    setVoiceDebrief({
      speech_text: script,
      overview: `${passed ? 'Cleared' : 'Needs Preparation'} • Score: ${correct}/${total} (${accuracy}%) • Time: ${formatTime(result.time_taken_seconds || 0)}`,
      recommendations: result.weak_topics?.length > 0
        ? result.weak_topics.map((t: string) => `Review fundamental concepts in ${t}`)
        : [
            'Maintain regular daily timed practice sessions',
            'Focus on edge-case scenarios under interview constraints',
            'Consult the PrepPilot Voice Assistant for viva revision'
          ]
    });
  };

  // Run Code in Coding Section
  const handleRunCodingChallenge = async () => {
    if (!codingProblem || runningCode) return;
    setRunningCode(true);
    setRunOutput('');
    setRunError('');

    try {
      const res = await api.runCode(codingCode, codingLanguage);
      if (res.output) setRunOutput(res.output);
      if (res.error) setRunError(res.error);
      if (res.testResults) {
        setTestResults(res.testResults);
        const passed = res.testResults.filter((r: any) => r.passed).length;
        setCodingPassCount(passed);
        setCodingTotalCount(res.testResults.length);
      }
    } catch (err: any) {
      setRunError(err.message || 'Execution error');
    } finally {
      setRunningCode(false);
    }
  };

  // Submit Final Full Simulation
  const handleCompleteFullSimulation = () => {
    setStage('result');
    triggerCelebration();
    if (gradedResult) {
      buildVoiceDebrief(gradedResult);
    }
  };

  // Reset Assessment State
  const handleResetToCatalog = () => {
    if (user?.id) {
      localStorage.removeItem(`preppilot_active_asmt_${user.id}`);
    }
    stopSpeaking();
    setStage('catalog');
    setSelectedAssessment(null);
    setSessionId(null);
    setQuestions([]);
    setAnswers({});
    setCurrentIndex(0);
    setGradedResult(null);
    setCodingProblem(null);
  };

  // Print Assessment Scorecard
  const handlePrintScorecard = () => {
    const accuracy = gradedResult?.accuracy_rate ?? 0;
    const correctCount = gradedResult?.correct_count ?? 0;
    const totalCount = gradedResult?.total_questions ?? questions.length;
    const timeTaken = gradedResult?.time_taken_seconds ?? 0;
    const passingCutoff = selectedAssessment?.passingPercent ?? 65;
    const isPassed = accuracy >= passingCutoff;

    const iframe = document.createElement('iframe');
    iframe.setAttribute('style', 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;');
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    const headStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map(el => el.outerHTML)
      .join('\n');

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>Assessment_Scorecard_${user?.name || 'Student'}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          ${headStyles}
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            body {
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              background: #ffffff !important;
              color: #0f172a !important;
              padding: 24px;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          </style>
        </head>
        <body>
          <div style="border: 2px solid #6366f1; border-radius: 20px; padding: 28px; max-width: 720px; margin: 0 auto; background: #ffffff;">
            <div style="display: flex; justify-content: space-between; align-items: start; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px;">
              <div>
                <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #4f46e5;">PREPPILOT AI</h1>
                <p style="margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700;">
                  Official Assessment Evaluation Scorecard
                </p>
              </div>
              <div style="text-align: right;">
                <span style="display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 800; background: ${isPassed ? '#dcfce7' : '#fef3c7'}; color: ${isPassed ? '#15803d' : '#b45309'}; border: 1px solid ${isPassed ? '#86efac' : '#fcd34d'};">
                  ${isPassed ? 'BENCHMARK CLEARED' : 'NEEDS REINFORCEMENT'}
                </span>
                <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
                  Date: ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 20px 0; padding: 14px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 12px;">
              <div><strong style="color: #64748b; text-transform: uppercase; font-size: 10px; display: block;">Candidate Name</strong> ${user?.name || 'Candidate'}</div>
              <div><strong style="color: #64748b; text-transform: uppercase; font-size: 10px; display: block;">Candidate Email</strong> ${user?.email || 'student@college.edu'}</div>
              <div><strong style="color: #64748b; text-transform: uppercase; font-size: 10px; display: block;">Department</strong> ${user?.branch_name || 'Computer Science & Engineering'}</div>
              <div><strong style="color: #64748b; text-transform: uppercase; font-size: 10px; display: block;">Assessment Track</strong> ${selectedAssessment?.title || 'Placement Assessment'}</div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 20px 0; text-align: center;">
              <div style="padding: 12px; background: #eef2ff; border-radius: 12px; border: 1px solid #c7d2fe;">
                <span style="font-size: 10px; font-weight: 700; color: #4338ca; text-transform: uppercase; display: block;">Score</span>
                <span style="font-size: 22px; font-weight: 900; color: #312e81;">${correctCount} / ${totalCount}</span>
              </div>
              <div style="padding: 12px; background: #ecfdf5; border-radius: 12px; border: 1px solid #a7f3d0;">
                <span style="font-size: 10px; font-weight: 700; color: #047857; text-transform: uppercase; display: block;">Accuracy</span>
                <span style="font-size: 22px; font-weight: 900; color: #065f46;">${accuracy}%</span>
              </div>
              <div style="padding: 12px; background: #f0fdfa; border-radius: 12px; border: 1px solid #99f6e4;">
                <span style="font-size: 10px; font-weight: 700; color: #0f766e; text-transform: uppercase; display: block;">Time Spent</span>
                <span style="font-size: 22px; font-weight: 900; color: #115e59;">${formatTime(timeTaken)}</span>
              </div>
              <div style="padding: 12px; background: #f8fafc; border-radius: 12px; border: 1px solid #cbd5e1;">
                <span style="font-size: 10px; font-weight: 700; color: #475569; text-transform: uppercase; display: block;">Cutoff</span>
                <span style="font-size: 22px; font-weight: 900; color: #1e293b;">${passingCutoff}%</span>
              </div>
            </div>

            <div style="margin-top: 36px; padding-top: 20px; border-top: 1px dashed #cbd5e1; display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; text-align: center;">
              <div>
                <div style="height: 36px; border-bottom: 1px solid #94a3b8; margin-bottom: 6px;"></div>
                <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Candidate Signature</span>
              </div>
              <div>
                <div style="height: 36px; border-bottom: 1px solid #94a3b8; margin-bottom: 6px; font-size: 11px; font-family: monospace; color: #4f46e5; line-height: 48px;">SEAL-VERIFIED-2026</div>
                <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">TPO Assessment Authority</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

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

  /* ================================================================== */
  /*  RENDER 1: Assessment Catalog & Selection Screen                   */
  /* ================================================================== */
  if (stage === 'catalog') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
        {/* Hero Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 text-cyan-400 border border-cyan-500/30 mb-1">
            <ShieldCheck size={36} />
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-500 dark:text-cyan-300 border border-cyan-500/30 inline-block">
            Campus Placement Assessment Engine
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
            Standardized Placement Screening Tests
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            Choose an official timed assessment matching actual corporate drive formats. Each test features verified question counts, strict countdown timing, and automated scoring with comprehensive answer explanations.
          </p>
        </div>

        {/* Assessment Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {catalog.map(asmt => (
            <div
              key={asmt.id}
              className="p-6 sm:p-7 rounded-3xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-sm hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
                    {asmt.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)]">
                    <Clock size={14} className="text-cyan-400" />
                    <span>{asmt.durationMinutes} Minutes</span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                    {asmt.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                    {asmt.description}
                  </p>
                </div>

                {/* Key Metrics Pill Row */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="p-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-center">
                    <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block">Questions</span>
                    <span className="text-sm font-extrabold text-[var(--text-primary)]">{asmt.questionCount} MCQs</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-center">
                    <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block">Time Limit</span>
                    <span className="text-sm font-extrabold text-cyan-400">{asmt.durationMinutes} mins</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-center">
                    <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block">Cutoff</span>
                    <span className="text-sm font-extrabold text-emerald-400">{asmt.passingPercent}%</span>
                  </div>
                </div>

                {/* Subject Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {asmt.subjects.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-md bg-[var(--surface-elevated)] text-[var(--text-muted)] text-[10px] font-semibold border border-[var(--surface-border)]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <div className="pt-3 border-t border-[var(--surface-border)]">
                <button
                  onClick={() => handleStartAssessment(asmt)}
                  disabled={loadingAssessment}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loadingAssessment && selectedAssessment?.id === asmt.id ? (
                    <>
                      <Loader2 size={15} className="animate-spin text-white" />
                      <span>Loading Question Bank...</span>
                    </>
                  ) : (
                    <>
                      <Play size={14} className="fill-current" />
                      <span>Start {asmt.questionCount}-Question Assessment</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ================================================================== */
  /*  RENDER 2: Active Timed MCQ Assessment View                        */
  /* ================================================================== */
  if (stage === 'quiz') {
    const currentQ = questions[currentIndex];
    const isAnswered = currentQ && Boolean(answers[currentQ.id]);
    const answeredCount = Object.keys(answers).length;
    const isTimeLow = timeRemainingSeconds <= 120; // less than 2 mins

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in">
        {/* Top Sticky Test Header */}
        <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
              {selectedAssessment?.category || 'Timed Assessment'}
            </span>
            <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
              {selectedAssessment?.title || 'Placement Assessment'}
            </h2>
          </div>

          {/* Center Timer & Counters */}
          <div className="flex items-center gap-3">
            {/* Countdown Display */}
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-extrabold transition-colors ${
              isTimeLow
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                : 'bg-[var(--surface-elevated)] text-[var(--text-primary)] border-[var(--surface-border)]'
            }`}>
              <Clock size={15} className={isTimeLow ? 'text-rose-400' : 'text-cyan-400'} />
              <span>Time Left: {formatTime(timeRemainingSeconds)}</span>
            </div>

            {/* Answered Progress Counter */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface-elevated)] text-xs font-semibold text-[var(--text-secondary)] border border-[var(--surface-border)]">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span>{answeredCount} / {questions.length} Answered</span>
            </div>

            {/* Submit Action Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              disabled={submittingAssessment}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send size={13} />
              <span>Submit Test</span>
            </button>
          </div>
        </div>

        {/* Main Workspace: Left Question Area + Right Question Palette */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Active Question Card */}
          <div className="lg:col-span-8 space-y-6">
            {currentQ ? (
              <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-6 shadow-sm">
                {/* Question Info Bar */}
                <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-400 font-extrabold text-xs">
                      Q{currentIndex + 1}
                    </span>
                    <span className="text-xs font-bold text-[var(--text-muted)]">
                      {currentQ.subject_name || 'Engineering'} • {currentQ.topic_name || 'Technical'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFlaggedQuestions(prev => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }))}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                        flaggedQuestions[currentQ.id]
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-[var(--surface-elevated)] text-[var(--text-muted)] border-[var(--surface-border)] hover:text-amber-400'
                      }`}
                      title="Flag for review before submission (Shortcut: Press 'F')"
                    >
                      <Flag size={12} className={flaggedQuestions[currentQ.id] ? 'fill-current text-amber-400' : ''} />
                      <span>{flaggedQuestions[currentQ.id] ? 'Flagged' : 'Flag'}</span>
                    </button>

                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl border ${
                      isAnswered
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-[var(--surface-elevated)] text-[var(--text-muted)] border-[var(--surface-border)]'
                    }`}>
                      {isAnswered ? 'Answered' : 'Unattempted'}
                    </span>
                  </div>
                </div>

                {/* Question Text */}
                <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] leading-relaxed">
                  {currentQ.question}
                </h3>

                {/* Answer Options */}
                <div className="space-y-3">
                  {currentQ.options?.map(opt => {
                    const isSelected = answers[currentQ.id] === opt.option_key;
                    return (
                      <button
                        key={opt.id || opt.option_key}
                        type="button"
                        onClick={() => handleSelectOption(opt.option_key)}
                        className={`w-full p-4 rounded-2xl text-left text-sm font-medium transition-all flex items-center justify-between border cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600/15 border-indigo-500 text-[var(--text-primary)] shadow-sm'
                            : 'bg-[var(--surface-elevated)] border-[var(--surface-border)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-[var(--surface-card)] text-[var(--text-muted)] border border-[var(--surface-border)]'
                          }`}>
                            {opt.option_key}
                          </span>
                          <span className="leading-snug">{opt.option_text}</span>
                        </div>
                        {isSelected && <Check size={18} className="text-indigo-400 flex-shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>

                {/* Hotkeys Helper Bar */}
                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] px-1 pt-1 select-none flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-indigo-400">Hotkeys:</span>
                    <span className="px-1.5 py-0.5 rounded bg-[var(--surface-elevated)] border border-[var(--surface-border)] font-mono text-[10px]">1-4 / A-D</span>
                    <span>Select Option</span>
                    <span className="text-[var(--surface-border)]">•</span>
                    <span className="px-1.5 py-0.5 rounded bg-[var(--surface-elevated)] border border-[var(--surface-border)] font-mono text-[10px]">→</span>
                    <span>Next</span>
                    <span className="text-[var(--surface-border)]">•</span>
                    <span className="px-1.5 py-0.5 rounded bg-[var(--surface-elevated)] border border-[var(--surface-border)] font-mono text-[10px]">←</span>
                    <span>Prev</span>
                    <span className="text-[var(--surface-border)]">•</span>
                    <span className="px-1.5 py-0.5 rounded bg-[var(--surface-elevated)] border border-[var(--surface-border)] font-mono text-[10px]">F</span>
                    <span>Flag</span>
                  </div>
                </div>

                {/* Question Bottom Navigation Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--surface-border)]">
                  <button
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] disabled:opacity-30 cursor-pointer flex items-center gap-1.5"
                  >
                    <ChevronLeft size={14} />
                    <span>Previous</span>
                  </button>

                  <span className="text-xs text-[var(--text-muted)] font-semibold">
                    {currentIndex + 1} of {questions.length}
                  </span>

                  {currentIndex < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentIndex(prev => prev + 1)}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-600/20"
                    >
                      <span>Next</span>
                      <ChevronRight size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowSubmitModal(true)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-600/20"
                    >
                      <span>Review & Submit</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-[var(--surface-card)] border border-[var(--surface-border)] text-center space-y-2">
                <AlertTriangle size={24} className="text-amber-400 mx-auto" />
                <p className="text-sm font-semibold text-[var(--text-primary)]">No question loaded.</p>
              </div>
            )}
          </div>

          {/* Right: Question Navigation Palette */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-3xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-3">
                <h4 className="text-xs font-extrabold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                  <ListOrdered size={15} className="text-indigo-400" />
                  <span>Question Palette</span>
                </h4>
                <span className="text-xs font-bold text-emerald-400">
                  {answeredCount}/{questions.length} Done
                </span>
              </div>

              {/* Legend with 3 States: Answered, Flagged, Unattempted */}
              <div className="grid grid-cols-3 gap-1.5 text-[10px] text-[var(--text-muted)] pb-1 font-semibold">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-md bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">✓</div>
                  <span>Done</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-md bg-amber-500 text-black flex items-center justify-center text-[9px] font-bold">⚑</div>
                  <span>Flagged</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-md bg-[var(--surface-elevated)] border border-[var(--surface-border)]" />
                  <span>Pending</span>
                </div>
              </div>

              {/* Number Buttons Grid */}
              <div className="grid grid-cols-5 gap-2 max-h-[380px] overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const answered = Boolean(answers[q.id]);
                  const isCurrent = idx === currentIndex;
                  const isFlagged = Boolean(flaggedQuestions[q.id]);

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`relative h-9 rounded-xl text-xs font-extrabold flex items-center justify-center transition-all cursor-pointer ${
                        isCurrent
                          ? 'ring-2 ring-indigo-500 text-white bg-indigo-600 shadow-md shadow-indigo-600/30'
                          : isFlagged
                          ? 'bg-amber-500/20 text-amber-300 border-2 border-amber-500/60 hover:bg-amber-500/30'
                          : answered
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                          : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--surface-border)] hover:bg-[var(--surface-hover)]'
                      }`}
                      title={`Jump to Question ${idx + 1}${isFlagged ? ' (Flagged for Review)' : ''}`}
                    >
                      <span>{idx + 1}</span>
                      {isFlagged && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-900 shadow-xs" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Submit Button in Palette */}
              <button
                onClick={() => setShowSubmitModal(true)}
                className="w-full mt-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Send size={13} />
                <span>Submit Assessment</span>
              </button>
            </div>
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] max-w-md w-full rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
                    <HelpCircle size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--text-primary)]">Confirm Assessment Submission</h3>
                    <p className="text-xs text-[var(--text-muted)]">Are you sure you want to finish your attempt?</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">Total Questions:</span>
                  <span className="font-bold text-[var(--text-primary)]">{questions.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">Questions Answered:</span>
                  <span className="font-bold text-emerald-400">{answeredCount}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">Unattempted:</span>
                  <span className="font-bold text-amber-400">{questions.length - answeredCount}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">Time Remaining:</span>
                  <span className="font-bold text-cyan-400">{formatTime(timeRemainingSeconds)}</span>
                </div>
              </div>

              {questions.length - answeredCount > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>You still have {questions.length - answeredCount} unattempted questions. Submitting now will grade unanswered questions as incorrect.</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] cursor-pointer"
                >
                  Keep Answering
                </button>
                <button
                  type="button"
                  onClick={() => handleFinalSubmit(false)}
                  disabled={submittingAssessment}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                >
                  {submittingAssessment ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Grading...</span>
                    </>
                  ) : (
                    <span>Yes, Submit Assessment</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ================================================================== */
  /*  RENDER 3: Live Coding Section (for Full Simulation)               */
  /* ================================================================== */
  if (stage === 'coding') {
    if (!codingProblem) return null;

    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-950 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Section 2: Live Programming Challenge
            </span>
            <span className="text-xs font-bold text-white">{codingProblem.title}</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30">
              {codingProblem.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock size={13} className="text-cyan-400" />
              <span>Time Remaining: {formatTime(timeRemainingSeconds)}</span>
            </div>

            <button
              onClick={handleCompleteFullSimulation}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 size={13} />
              <span>Finish Full Simulation</span>
            </button>
          </div>
        </div>

        {/* Workspace */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Problem Description Pane */}
          <div className="w-full lg:w-2/5 p-6 border-r border-slate-800 overflow-y-auto space-y-4 bg-slate-900/60">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Problem Description</span>
              <h2 className="text-lg font-bold text-white mt-1">{codingProblem.title}</h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed whitespace-pre-line">{codingProblem.description}</p>
            </div>

            {codingProblem.constraints && (
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-slate-400">Constraints</span>
                <p className="text-xs text-slate-300 font-mono whitespace-pre-line">{codingProblem.constraints}</p>
              </div>
            )}
          </div>

          {/* Code Editor Pane */}
          <div className="flex-1 flex flex-col h-full bg-slate-950">
            <CodeEditor
              language={codingLanguage}
              onLanguageChange={setCodingLanguage}
              code={codingCode}
              onCodeChange={setCode => setCodingCode(setCode)}
              onRun={handleRunCodingChallenge}
              onSubmit={handleRunCodingChallenge}
              running={runningCode}
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

  /* ================================================================== */
  /*  RENDER 4: Detailed Results & Question-by-Question Review          */
  /* ================================================================== */
  if (stage === 'result') {
    const accuracy = gradedResult?.accuracy_rate ?? 0;
    const correctCount = gradedResult?.correct_count ?? 0;
    const totalCount = gradedResult?.total_questions ?? questions.length;
    const timeTaken = gradedResult?.time_taken_seconds ?? 0;
    const passingCutoff = selectedAssessment?.passingPercent ?? 65;
    const isPassed = accuracy >= passingCutoff;
    const gradedList: any[] = gradedResult?.graded_questions ?? [];

    const filteredReview = gradedList.filter(item => {
      if (reviewFilter === 'correct') return item.is_correct;
      if (reviewFilter === 'incorrect') return !item.is_correct && Boolean(item.chosen_answer);
      if (reviewFilter === 'unattempted') return !item.chosen_answer;
      return true;
    });

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
        {/* Scorecard Hero */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--surface-border)] pb-6">
            <div className="space-y-1">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                Official Scorecard & Evaluation Report
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                {selectedAssessment?.title || 'Placement Assessment'}
              </h1>
              <p className="text-xs text-[var(--text-secondary)]">
                Evaluation completed on {new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}
              </p>
            </div>

            <div className={`px-4 py-2 rounded-2xl text-xs font-black border flex items-center gap-2 self-start sm:self-auto ${
              isPassed
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
            }`}>
              {isPassed ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              <span>{isPassed ? 'CLEARED BENCHMARK' : 'NEEDS REINFORCEMENT'}</span>
            </div>
          </div>

          {/* Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-center">
              <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block">Score</span>
              <span className="text-2xl font-black text-indigo-400">{correctCount} / {totalCount}</span>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-center">
              <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block">Accuracy</span>
              <span className="text-2xl font-black text-emerald-400">{accuracy}%</span>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-center">
              <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block">Time Taken</span>
              <span className="text-2xl font-black text-cyan-400">{formatTime(timeTaken)}</span>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-center">
              <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block">Cutoff Required</span>
              <span className="text-2xl font-black text-slate-300">{passingCutoff}%</span>
            </div>
          </div>

          {/* Voice Assessment Debrief Script */}
          {voiceDebrief && (
            <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold">
                  <Bot size={16} />
                  <span>AI Placement Debrief</span>
                </div>
                <button
                  onClick={() => isSpeaking ? stopSpeaking() : speakText(voiceDebrief.speech_text)}
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  <span>{isSpeaking ? 'Mute Audio' : 'Listen to Debrief'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{voiceDebrief.overview}</p>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleResetToCatalog}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <RotateCcw size={14} />
                <span>Choose Another Assessment</span>
              </button>

              <button
                onClick={handlePrintScorecard}
                className="px-5 py-2.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
              >
                <Printer size={14} />
                <span>Print Scorecard / Certificate</span>
              </button>
            </div>

            <button
              onClick={onReturnToDashboard}
              className="px-5 py-2.5 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] text-xs font-bold border border-[var(--surface-border)] flex items-center gap-2 cursor-pointer"
            >
              <LayoutDashboard size={14} />
              <span>Return to Dashboard</span>
            </button>
          </div>
        </div>

        {/* Detailed Question Review Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <BookOpen size={18} className="text-indigo-400" />
                <span>Detailed Question-by-Question Review ({gradedList.length})</span>
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Inspect your submitted answers against correct answer keys with comprehensive technical explanations.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] overflow-x-auto">
              {(['all', 'incorrect', 'correct', 'unattempted'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setReviewFilter(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                    reviewFilter === tab
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-4">
            {filteredReview.map((item, idx) => {
              const isCorrect = item.is_correct;
              const unattempted = !item.chosen_answer;

              return (
                <div
                  key={item.question_id || idx}
                  className="p-5 sm:p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-3.5 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[var(--surface-elevated)] border border-[var(--surface-border)] flex items-center justify-center text-xs font-bold text-[var(--text-muted)]">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-[var(--text-muted)]">
                        {item.subject_name || 'Engineering'} • {item.topic_name || 'Core'}
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${
                      isCorrect
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : unattempted
                        ? 'bg-slate-500/15 text-slate-400 border-slate-500/30'
                        : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    }`}>
                      {isCorrect ? <CheckCircle2 size={13} /> : unattempted ? <Clock size={13} /> : <XCircle size={13} />}
                      <span>{isCorrect ? 'Correct' : unattempted ? 'Unattempted' : 'Incorrect'}</span>
                    </span>
                  </div>

                  {/* Question */}
                  <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)] leading-snug">
                    {item.question}
                  </h4>

                  {/* Answer Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    <div className={`p-3 rounded-xl border ${
                      isCorrect
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                        : unattempted
                        ? 'bg-slate-800/40 border-slate-700 text-slate-400'
                        : 'bg-rose-500/10 border-rose-500/25 text-rose-300'
                    }`}>
                      <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block mb-0.5">Your Answer:</span>
                      <span className="font-bold">{item.chosen_answer ? `Option ${item.chosen_answer}` : 'No option selected'}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-0.5">Correct Answer:</span>
                      <span className="font-bold">Option {item.correct_answer}</span>
                    </div>
                  </div>

                  {/* Tailored Why Correct / Why Incorrect Breakdown */}
                  <div className="space-y-2 pt-1">
                    {isCorrect ? (
                      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1">
                        <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 size={14} /> Why Your Answer is Correct:
                        </span>
                        <p className="text-[var(--text-secondary)] leading-relaxed">
                          {item.why_correct || item.explanation}
                        </p>
                      </div>
                    ) : (
                      <>
                        {!unattempted && (
                          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-1">
                            <span className="font-bold text-rose-400 flex items-center gap-1.5">
                              <XCircle size={14} /> Why Your Selection Was Incorrect:
                            </span>
                            <p className="text-[var(--text-secondary)] leading-relaxed">
                              {item.why_incorrect || `You selected Option (${item.chosen_answer || 'None'}), which is incorrect for this problem.`}
                            </p>
                          </div>
                        )}

                        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1">
                          <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 size={14} /> Why Option ({item.correct_answer}) is Right:
                          </span>
                          <p className="text-[var(--text-secondary)] leading-relaxed">
                            {item.why_correct || item.explanation}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredReview.length === 0 && (
              <div className="p-8 text-center rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] text-xs text-[var(--text-muted)]">
                No questions found matching the selected filter ({reviewFilter}).
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AssessmentPage;
