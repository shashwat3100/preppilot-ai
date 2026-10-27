import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useVoice } from '../context/VoiceContext';
import api from '../services/api';
import type { QuizSession, QuizResult } from '../types';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  ArrowRight,
  RotateCcw,
  Award,
  AlertTriangle,
  Flame,
  LayoutDashboard,
  Mic,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  HelpCircle,
  BookOpen,
  ArrowUpRight,
  Loader2
} from 'lucide-react';

interface QuizPageProps {
  quizSession: QuizSession;
  onFinish: () => void;
  onRetake: () => void;
}

export const QuizPage: React.FC<QuizPageProps> = ({ quizSession, onFinish, onRetake }) => {
  const { refreshUser } = useAuth();
  const { speakText, stopSpeaking, isSpeaking, openVoiceModal, setActiveQuestionContext } = useVoice();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [answers, setAnswers] = useState<Array<{ question_id: string; answer: string; time_spent: number }>>([]);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [overallStartTime] = useState<number>(Date.now());
  const [elapsedTimer, setElapsedTimer] = useState<number>(0);


  const [submittedCurrent, setSubmittedCurrent] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [finalResult, setFinalResult] = useState<QuizResult | null>(null);

  // Voice Diagnostic State
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [voiceDiagnostic, setVoiceDiagnostic] = useState<{
    speech_text: string;
    overview: string;
    mistakes: Array<{
      questionNumber: number;
      sequence?: number;
      question: string;
      chosenAnswer?: string;
      chosen_answer?: string;
      chosenText?: string;
      chosen_text?: string;
      correctAnswer?: string;
      correct_answer?: string;
      correctText?: string;
      correct_text?: string;
      topic: string;
      subject?: string;
      diagnosis?: string;
      remediation?: string;
      why_chosen_wrong?: string;
      why_correct?: string;
      technical_deep_dive?: string;
      viva_tip?: string;
      is_negative_constraint?: boolean;
      speech_text?: string;
    }>;
    recommendations: string[];
  } | null>(null);
  const [activeVoiceQuestionIdx, setActiveVoiceQuestionIdx] = useState<number | null>(null);
  const [activeVoiceMistakeIdx, setActiveVoiceMistakeIdx] = useState<number | null>(null);
  const [loadingQuestionIdx, setLoadingQuestionIdx] = useState<number | null>(null);

  const questions = quizSession.questions || [];
  const currentQ = questions[currentIndex];

  // Global quiz timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTimer(Math.floor((Date.now() - overallStartTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [overallStartTime]);

  // Reset state when advancing question
  useEffect(() => {
    setSelectedOption('');
    setSubmittedCurrent(false);
    setQuestionStartTime(Date.now());
  }, [currentIndex]);

  // Synchronize Active Question Context with Global Voice Assistant
  useEffect(() => {
    if (!currentQ) {
      setActiveQuestionContext(null);
      return;
    }
    const chosenOpt = currentQ.options?.find((o: any) => o.option_key === selectedOption);
    const correctOpt = currentQ.options?.find((o: any) => o.option_key === currentQ.correct_answer);

    setActiveQuestionContext({
      questionId: currentQ.id,
      sequence: currentIndex + 1,
      questionText: currentQ.question || (currentQ as any).question_text || '',
      topic: currentQ.topic_name,
      subject: currentQ.subject_name,
      options: currentQ.options?.map((o: any) => ({ option_key: o.option_key, option_text: o.option_text })),
      chosenAnswer: selectedOption || undefined,
      chosenText: chosenOpt?.option_text || undefined,
      correctAnswer: submittedCurrent ? currentQ.correct_answer : undefined,
      correctText: submittedCurrent ? correctOpt?.option_text : undefined,
      explanation: submittedCurrent ? currentQ.explanation : undefined,
      isCorrect: submittedCurrent ? selectedOption === currentQ.correct_answer : undefined
    });

    return () => {
      setActiveQuestionContext(null);
    };
  }, [currentQ, currentIndex, selectedOption, submittedCurrent, setActiveQuestionContext]);


  const handleSelectOption = (key: string) => {
    if (submittedCurrent) return;
    setSelectedOption(key);
  };

  const handleConfirmAnswer = () => {
    if (!selectedOption || submittedCurrent) return;
    const timeSpent = Math.max(1, Math.floor((Date.now() - questionStartTime) / 1000));

    setAnswers(prev => [
      ...prev.filter(a => a.question_id !== currentQ.id),
      { question_id: currentQ.id, answer: selectedOption, time_spent: timeSpent }
    ]);
    setSubmittedCurrent(true);
  };

  const handleNextOrFinish = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Complete Quiz Submission
      setIsEvaluating(true);
      const totalTime = Math.floor((Date.now() - overallStartTime) / 1000);

      try {
        const res = await api.submitQuiz(quizSession.session_id, answers, totalTime);
        if (res.success && res.result) {
          setFinalResult(res.result);
          await refreshUser(); // Update XP & streak in navbar

          // Trigger festive confetti if passed
          if (res.result.accuracy_rate >= 60) {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 }
            });
          }
        }
      } catch (err) {
        console.error('Error submitting quiz:', err);
      } finally {
        setIsEvaluating(false);
      }
    }
  };

  const handleFetchVoiceDiagnostic = async () => {
    if (!finalResult) return;
    if (voiceDiagnostic) {
      // If already loaded, toggle speech
      if (isSpeaking) {
        stopSpeaking();
        setActiveVoiceQuestionIdx(null);
        setActiveVoiceMistakeIdx(null);
      } else {
        setActiveVoiceQuestionIdx(null);
        setActiveVoiceMistakeIdx(null);
        speakText(voiceDiagnostic.speech_text);
      }
      return;
    }

    setIsDiagnosing(true);
    try {
      const res = await api.diagnoseMistakes({
        type: 'quiz',
        gradedQuestions: finalResult.graded_questions,
        weak_topics: finalResult.weak_topics,
        accuracy_rate: finalResult.accuracy_rate
      });

      if (res.success) {
        setVoiceDiagnostic(res);
        setActiveVoiceQuestionIdx(null);
        setActiveVoiceMistakeIdx(null);
        speakText(res.speech_text);
      }
    } catch (err) {
      console.error('Failed to get voice diagnostic:', err);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleSpeakMistake = (m: any, mIdx: number) => {
    if (activeVoiceMistakeIdx === mIdx && isSpeaking) {
      stopSpeaking();
      setActiveVoiceMistakeIdx(null);
      return;
    }
    setActiveVoiceQuestionIdx(null);
    setActiveVoiceMistakeIdx(mIdx);
    speakText(m.speech_text || m.remediation || m.why_correct || m.diagnosis);
  };

  const handleExplainSingleQuestion = async (g: any, idx: number) => {
    if (activeVoiceQuestionIdx === idx && isSpeaking) {
      stopSpeaking();
      setActiveVoiceQuestionIdx(null);
      return;
    }

    setActiveVoiceMistakeIdx(null);
    setLoadingQuestionIdx(idx);
    try {
      const res = await api.explainSingleMistake({
        question: g.question,
        chosen_answer: g.chosen_answer,
        chosen_text: g.chosen_text,
        correct_answer: g.correct_answer,
        correct_text: g.correct_text,
        explanation: g.explanation,
        why_correct: g.why_correct,
        why_incorrect: g.why_incorrect,
        topic_name: g.topic_name,
        subject_name: g.subject_name,
        sequence: g.sequence || (idx + 1),
        options: g.options,
        is_negative_constraint: g.is_negative_constraint,
        question_id: g.question_id
      });

      if (res.success && res.speech_text) {
        setActiveVoiceQuestionIdx(idx);
        speakText(res.speech_text);
      }
    } catch (err) {
      console.error('Failed to explain question mistake:', err);
    } finally {
      setLoadingQuestionIdx(null);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // If Quiz Completed: Show Result Screen
  if (finalResult) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 animate-in zoom-in-95 duration-300">
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 text-cyan-400 border border-cyan-500/20 mb-2">
            <Award size={36} />
          </div>
          <h1 className="text-3xl font-extrabold text-white">Quiz Evaluation Complete</h1>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            {finalResult.recommendation_summary}
          </p>
        </div>

        {/* Primary Score Board */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3.5 sm:p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] text-center">
            <span className="text-[11px] sm:text-xs font-semibold text-[var(--text-secondary)] block mb-1">Score Accuracy</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-cyan-500 dark:text-cyan-400">{finalResult.accuracy_rate}%</span>
            <span className="text-[10px] sm:text-[11px] text-[var(--text-muted)] block mt-1">
              {finalResult.correct_count} of {finalResult.total_questions} correct
            </span>
          </div>

          <div className="p-3.5 sm:p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] text-center">
            <span className="text-[11px] sm:text-xs font-semibold text-[var(--text-secondary)] block mb-1">XP Earned</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-500 dark:text-amber-400 flex items-center justify-center gap-1">
              +{finalResult.xp_earned} <Zap size={18} />
            </span>
            <span className="text-[10px] sm:text-[11px] text-[var(--text-muted)] block mt-1">Total: {finalResult.total_xp} XP</span>
          </div>

          <div className="p-3.5 sm:p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] text-center">
            <span className="text-[11px] sm:text-xs font-semibold text-[var(--text-secondary)] block mb-1">Time Invested</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-500 dark:text-indigo-400">{formatSeconds(finalResult.time_taken_seconds)}</span>
            <span className="text-[10px] sm:text-[11px] text-[var(--text-muted)] block mt-1">Timed practice</span>
          </div>

          <div className="p-3.5 sm:p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] text-center">
            <span className="text-[11px] sm:text-xs font-semibold text-[var(--text-secondary)] block mb-1">Current Streak</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-orange-500 dark:text-orange-400 flex items-center justify-center gap-1">
              {finalResult.current_streak}d <Flame size={18} className="fill-orange-400" />
            </span>
            <span className="text-[10px] sm:text-[11px] text-[var(--text-muted)] block mt-1">Daily consistency</span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* PREPPILOT VOICE ASSISTANT DIAGNOSTIC & MISTAKE MENTOR CARD     */}
        {/* ============================================================== */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-950 border border-cyan-500/40 p-6 sm:p-7 shadow-2xl shadow-indigo-950/40">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-cyan-500/10 to-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-cyan-400 animate-pulse" />
                  PrepPilot Voice AI Remediation
                </span>
                {isSpeaking && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 animate-pulse">
                    <Volume2 size={12} />
                    Speaking Diagnostic
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                AI Voice Mistake Mentor: Where You Went Wrong & What To Do
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                PrepPilot analyzes your quiz answers using the verified B.Tech placement curriculum. Listen to an empathetic, verbal breakdown of where your conceptual errors occurred, why the option was wrong, and actionable study steps to prepare for technical interview viva.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleFetchVoiceDiagnostic}
                  disabled={isDiagnosing}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 hover:from-cyan-400 hover:to-indigo-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-cyan-500/20 flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-60"
                >
                  {isDiagnosing ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-white" />
                      <span>Synthesizing Voice Diagnostic...</span>
                    </>
                  ) : isSpeaking ? (
                    <>
                      <VolumeX size={16} className="text-white" />
                      <span>Pause / Stop Voice Mentor</span>
                    </>
                  ) : (
                    <>
                      <Mic size={16} className="text-white animate-pulse" />
                      <span>{voiceDiagnostic ? 'Replay Voice Mentor Diagnostic' : 'Listen to Voice Mentor Diagnostic'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={openVoiceModal}
                  className="px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Bot size={15} className="text-cyan-400" />
                  <span>Open Interactive Voice Studio</span>
                </button>
              </div>
            </div>

            {/* Visual Animated Audio Waveform Ring */}
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
                {isSpeaking ? 'Listening to feedback' : 'Tap button to listen'}
              </span>
            </div>
          </div>

          {/* Expanded Diagnostic Details */}
          {voiceDiagnostic && (
            <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-5 animate-in fade-in duration-300">
              {/* Diagnostic Overview Banner */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/20 text-xs space-y-2">
                <span className="font-extrabold text-cyan-300 flex items-center gap-1.5">
                  <Sparkles size={14} /> Diagnostic Summary:
                </span>
                <p className="text-slate-200 leading-relaxed">{voiceDiagnostic.overview}</p>
              </div>

              {/* Detailed Breakdown for each mistake */}
              {voiceDiagnostic.mistakes && voiceDiagnostic.mistakes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles size={13} className="text-cyan-400" />
                      Detailed Mistake Breakdown & Interview Viva Keys:
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Tap any card to hear dedicated audio diagnosis
                    </span>
                  </div>

                  <div className="space-y-3">
                    {voiceDiagnostic.mistakes.map((m, mIdx) => {
                      const isSpeakingThisMistake = activeVoiceMistakeIdx === mIdx && isSpeaking;
                      const qNumber = m.sequence || m.questionNumber || (mIdx + 1);
                      const chosenAnswerKey = m.chosen_answer || m.chosenAnswer || '';
                      const chosenAnswerText = m.chosen_text || m.chosenText || '';
                      const correctAnswerKey = m.correct_answer || m.correctAnswer || '';
                      const correctAnswerText = m.correct_text || m.correctText || '';

                      return (
                        <div
                          key={mIdx}
                          className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 ${
                            isSpeakingThisMistake
                              ? 'bg-slate-900 border-cyan-400 shadow-lg shadow-cyan-500/10'
                              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {/* Question header info */}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-lg bg-indigo-600/20 text-indigo-300 font-bold text-xs border border-indigo-500/30">
                                Question {qNumber}
                              </span>
                              <span className="text-xs font-semibold text-slate-300">
                                {m.topic}
                              </span>
                            </div>
                            {m.is_negative_constraint && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                <AlertTriangle size={11} /> Negative Premise (Contains NOT / EXCEPT)
                              </span>
                            )}
                          </div>

                          {/* Full Question Text */}
                          <h4 className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                            {m.question}
                          </h4>

                          {/* Side-by-side: Why chosen was wrong vs Why correct is right */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            {/* Chosen Option Card */}
                            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs space-y-1.5">
                              <div className="flex items-center gap-1.5 font-bold text-rose-400">
                                <XCircle size={14} className="flex-shrink-0" />
                                <span>You Chose: Option {chosenAnswerKey}</span>
                              </div>
                              {chosenAnswerText && (
                                <p className="font-semibold text-slate-200">
                                  "{chosenAnswerText}"
                                </p>
                              )}
                              <p className="text-slate-300 leading-relaxed text-[11px] sm:text-xs">
                                {m.why_chosen_wrong || m.diagnosis || `This selection does not satisfy the requirements.`}
                              </p>
                            </div>

                            {/* Exact Correct Option Card */}
                            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs space-y-1.5">
                              <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                                <CheckCircle2 size={14} className="flex-shrink-0" />
                                <span>Exact Correct Answer: Option {correctAnswerKey}</span>
                              </div>
                              {correctAnswerText && (
                                <p className="font-semibold text-slate-200">
                                  "{correctAnswerText}"
                                </p>
                              )}
                              <p className="text-slate-300 leading-relaxed text-[11px] sm:text-xs">
                                {m.why_correct || m.technical_deep_dive || m.remediation || `Option ${correctAnswerKey} is the correct answer.`}
                              </p>
                            </div>
                          </div>

                          {/* Placement Viva Takeaway */}
                          {m.viva_tip && (
                            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200 flex items-start gap-2">
                              <Sparkles size={14} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                              <span className="leading-relaxed"><strong>Placement Viva Key:</strong> {m.viva_tip}</span>
                            </div>
                          )}

                          {/* Action Button for single question voice */}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => handleSpeakMistake(m, mIdx)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                isSpeakingThisMistake
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                                  : 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                              }`}
                            >
                              {isSpeakingThisMistake ? (
                                <>
                                  <VolumeX size={12} />
                                  <span>Stop Voice Explanation</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 size={12} />
                                  <span>Listen to Question {qNumber} Audio Diagnosis</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {voiceDiagnostic.recommendations && voiceDiagnostic.recommendations.length > 0 && (
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-2">
                  <span className="font-extrabold text-indigo-300 flex items-center gap-1.5">
                    <BookOpen size={14} /> What You Should Do Next:
                  </span>
                  <ul className="space-y-1.5 text-slate-300">
                    {voiceDiagnostic.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 size={13} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Topic Weakness Calibration Alert */}
        {finalResult.weak_topics && finalResult.weak_topics.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <span className="font-bold text-amber-300 block">
                Adaptive Recommendation Engine Recalibrated:
              </span>
              <p className="text-slate-300 leading-relaxed">
                We detected conceptual challenges in:{' '}
                <span className="font-bold text-white">
                  {finalResult.weak_topics.join(', ')}
                </span>
                . Questions from these topics have been given top priority for your next Adaptive Daily Quiz session.
              </p>
            </div>
          </div>
        )}

        {/* Question Review Breakdown with Per-Question Voice Tutor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">Question-by-Question Review & AI Voice Tutor</h2>
            <span className="text-xs text-slate-400">Click voice icon on any question for spoken explanation</span>
          </div>

          <div className="space-y-3">
            {finalResult.graded_questions.map((g, idx) => {
              const isExplainingThis = activeVoiceQuestionIdx === idx && isSpeaking;
              const isLoadingThis = loadingQuestionIdx === idx;

              return (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border transition-all ${
                    isExplainingThis
                      ? 'bg-[var(--surface-card)] border-cyan-400 shadow-lg shadow-cyan-500/10'
                      : g.is_correct
                      ? 'bg-[var(--surface-card)] border-emerald-500/30'
                      : 'bg-[var(--surface-card)] border-rose-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[var(--text-secondary)]">Q{idx + 1}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                          g.is_correct ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {g.is_correct ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {g.is_correct ? 'Correct' : 'Incorrect'}
                        </span>
                        <span className="text-[11px] text-[var(--text-secondary)]">
                          {g.subject_name} • {g.topic_name}
                        </span>
                      </div>

                      <h3 className="text-sm font-semibold text-[var(--text-primary)]">{g.question}</h3>

                      <div className="flex flex-wrap gap-4 text-xs pt-1">
                        <span>Your choice: <strong className={g.is_correct ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}>Option {g.chosen_answer}{g.chosen_text ? ` ("${g.chosen_text}")` : ''}</strong></span>
                        <span>Correct answer: <strong className="text-emerald-500 dark:text-emerald-400">Option {g.correct_answer}{g.correct_text ? ` ("${g.correct_text}")` : ''}</strong></span>
                        <span className="text-[var(--text-muted)]">Time: {g.time_spent}s</span>
                        {g.xp_gained > 0 && <span className="text-amber-500 dark:text-amber-400 font-semibold">+{g.xp_gained} XP</span>}
                      </div>

                      {/* Tailored Why Correct / Why Incorrect Breakdown */}
                      <div className="space-y-2 mt-2">
                        {g.is_correct ? (
                          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1">
                            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                              <CheckCircle2 size={14} /> Why Your Answer is Correct:
                            </span>
                            <p className="text-[var(--text-secondary)] leading-relaxed">
                              {g.why_correct || g.explanation}
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-1">
                              <span className="font-bold text-rose-400 flex items-center gap-1.5">
                                <XCircle size={14} /> Why Your Selection Was Incorrect:
                              </span>
                              <p className="text-[var(--text-secondary)] leading-relaxed">
                                {g.why_incorrect || `You chose Option (${g.chosen_answer || 'None'}), which does not satisfy the requirements.`}
                              </p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1">
                              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                                <CheckCircle2 size={14} /> Why Option ({g.correct_answer}) is Right:
                              </span>
                              <p className="text-[var(--text-secondary)] leading-relaxed">
                                {g.why_correct || g.explanation}
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Per-Question Voice Tutor Button */}
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => handleExplainSingleQuestion(g, idx)}
                          disabled={isLoadingThis}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isExplainingThis
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                              : 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30'
                          }`}
                        >
                          {isLoadingThis ? (
                            <>
                              <Loader2 size={12} className="animate-spin" />
                              <span>Generating Voice...</span>
                            </>
                          ) : isExplainingThis ? (
                            <>
                              <VolumeX size={12} />
                              <span>Stop Voice Explanation</span>
                            </>
                          ) : (
                            <>
                              <Volume2 size={12} />
                              <span>Voice Explanation: Why {g.is_correct ? 'is this correct?' : 'was I wrong?'}</span>
                            </>
                          )}
                        </button>

                        {!g.is_correct && (
                          <button
                            onClick={openVoiceModal}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] flex items-center gap-1 cursor-pointer"
                          >
                            <HelpCircle size={12} />
                            <span>Ask Follow-up in Voice Studio</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <button
            onClick={onFinish}
            className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <LayoutDashboard size={16} />
            <span>Return to Dashboard</span>
          </button>

          <button
            onClick={onRetake}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw size={16} />
            <span>Start Another Practice Session</span>
          </button>
        </div>
      </div>
    );
  }

  // Active Quiz View
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* Header bar: Progress + Timer */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 sm:p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)]">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="px-2 sm:px-2.5 py-1 rounded-lg bg-indigo-600/15 text-indigo-400 text-[11px] sm:text-xs font-bold border border-indigo-500/20">
            {quizSession.mode === 'ADAPTIVE_DAILY' ? 'Adaptive Quiz' : 'Custom Quiz'}
          </span>
          <span className="text-xs font-semibold text-[var(--text-secondary)]">
            Q{currentIndex + 1} / {questions.length}
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-[var(--surface-elevated)] text-cyan-500 dark:text-cyan-400 font-mono text-xs font-bold border border-[var(--surface-border)]">
            <Clock size={13} />
            <span>{formatSeconds(elapsedTimer)}</span>
          </div>

          <button
            onClick={onFinish}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[var(--surface-elevated)] h-1.5 rounded-full overflow-hidden border border-[var(--surface-border)]">
        <div
          className="bg-gradient-to-r from-indigo-500 via-sky-400 to-cyan-400 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      {currentQ && (
        <div className="p-6 sm:p-8 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xl space-y-6">
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              {currentQ.subject_name}
            </span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--surface-border)]">
              {currentQ.topic_name}
            </span>
            <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold ${
              currentQ.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' :
              currentQ.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500 dark:text-amber-400' :
              'bg-rose-500/10 text-rose-500 dark:text-rose-400'
            }`}>
              {currentQ.difficulty}
            </span>
            {currentQ.company_name && (
              <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border border-cyan-500/20">
                {currentQ.company_name}
              </span>
            )}
            {currentQ.is_unattempted !== false && (
              <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Sparkles size={11} /> Fresh Question
              </span>
            )}
            <span className="ml-auto text-xs text-amber-500 dark:text-amber-400 font-bold flex items-center gap-1">
              <Zap size={13} /> {currentQ.xp_value || 25} XP
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] leading-relaxed">
            {currentQ.question}
          </h2>

          {/* Options List */}
          <div className="space-y-3 pt-2">
            {currentQ.options.map((opt) => {
              const isSelected = selectedOption === opt.option_key;

              return (
                <button
                  key={opt.option_key}
                  disabled={submittedCurrent}
                  onClick={() => handleSelectOption(opt.option_key)}
                  className={`w-full p-4 rounded-xl text-left border flex items-center gap-4 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500 text-[var(--text-primary)] shadow-md ring-1 ring-indigo-500/30'
                      : 'bg-[var(--surface-elevated)] border-[var(--surface-border)] text-[var(--text-secondary)] hover:border-indigo-400 hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-extrabold shadow-sm'
                      : 'bg-[var(--surface-card)] text-[var(--text-secondary)] border border-[var(--surface-border)]'
                  }`}>
                    {opt.option_key}
                  </span>
                  <span className="text-sm font-medium leading-relaxed text-[var(--text-primary)]">{opt.option_text}</span>
                </button>
              );
            })}
          </div>

          {/* Instant feedback review banner upon confirming */}
          {submittedCurrent && (
            <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-xs text-[var(--text-secondary)] space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400" />
                <span className="font-bold text-emerald-500 dark:text-emerald-400">Answer recorded</span>
              </div>
              <p className="text-[var(--text-secondary)]">
                Click <strong>Next Question</strong> to continue. A comprehensive conceptual review will be presented upon quiz completion.
              </p>
            </div>
          )}

          {/* Actions Bottom Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--surface-border)]">
            <span className="text-xs text-[var(--text-muted)]">
              Expected time: ~{currentQ.expected_time || 45} seconds
            </span>

            {!submittedCurrent ? (
              <button
                disabled={!selectedOption}
                onClick={handleConfirmAnswer}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                Submit Answer
              </button>
            ) : (
              <button
                disabled={isEvaluating}
                onClick={handleNextOrFinish}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{currentIndex < questions.length - 1 ? 'Next Question' : isEvaluating ? 'Submitting...' : 'Finish & View Results'}</span>
                <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
