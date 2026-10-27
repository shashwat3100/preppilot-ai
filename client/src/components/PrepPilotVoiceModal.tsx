import React, { useState, useEffect, useRef } from 'react';
import { useVoice } from '../context/VoiceContext';
import { useAuth } from '../context/AuthContext';
import { PrepPilotLogo } from './Logo';
import FormattedAiMessage from './ui/FormattedAiMessage';
import {
  X,
  Trash2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  User,
  Send,
  Loader2,
  Database,
  Cpu,
  Layers,
  Building2,
  ArrowRight,
  HelpCircle,
  Activity,
  Sliders,
  Check,
  BarChart3,
  TrendingUp,
  AlertCircle,
  GraduationCap,
  UserCheck,
  Target,
  Lightbulb
} from 'lucide-react';

const SUGGESTIONS = [
  {
    icon: Database,
    title: 'Database Normalization',
    subtitle: '1NF, 2NF, 3NF & BCNF anomalies',
    prompt: 'Explain Database Normalization: 1NF, 2NF, 3NF, and BCNF with real-world examples and why candidate keys matter.'
  },
  {
    icon: Layers,
    title: 'Deadlocks in OS',
    subtitle: 'Coffman conditions & Banker\'s Algorithm',
    prompt: 'Explain the 4 Coffman conditions for Deadlocks in Operating Systems, and how deadlock prevention differs from deadlock avoidance.'
  },
  {
    icon: Cpu,
    title: 'SOLID Principles in OOP',
    subtitle: 'Single responsibility to dependency inversion',
    prompt: 'Explain the 5 SOLID design principles in Object-Oriented Programming with practical software engineering examples.'
  },
  {
    icon: Building2,
    title: 'Placement Interview Prep',
    subtitle: 'Top questions for TCS NQT & Infosys',
    prompt: 'What are the most frequent technical interview questions and coding patterns asked in TCS NQT and Infosys campus drives?'
  }
];

const SPEECH_RATES = [
  { label: '0.9x', value: 0.9 },
  { label: '1.05x', value: 1.05 },
  { label: '1.25x', value: 1.25 },
  { label: '1.5x', value: 1.5 }
];

export const PrepPilotVoiceModal: React.FC = () => {
  const {
    isModalOpen,
    closeVoiceModal,
    isListening,
    isSpeaking,
    isProcessing,
    speechSupported,
    voiceError,
    transcript,
    conversation,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
    sendQuery,
    clearConversation,
    activeQuestionContext,
    audioWaveform,
    audioLevel,
    speechRate,
    setSpeechRate
  } = useVoice();

  const { user } = useAuth();
  const role = (user?.role || '').toUpperCase();
  const isDeanOrAdmin = role === 'ADMIN' || role === 'DEAN';
  const isStudent = role === 'STUDENT';

  const [inputVal, setInputVal] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new conversation messages
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation, isProcessing, transcript]);

  // Keep input focused so user can click and type anytime
  useEffect(() => {
    if (isModalOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isModalOpen, conversation]);

  // Handle escape key
  useEffect(() => {
    if (!isModalOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeVoiceModal();
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isModalOpen, closeVoiceModal]);

  if (!isModalOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text || isProcessing) return;

    setInputVal('');
    await sendQuery(text, false);

    // Keep textarea ready for consecutive typing
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="preppilot-dialog-title"
      className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-150 overflow-hidden"
    >
      {/* Top Bar - Clean, Elegant & Mentor-Focused */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-3 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <PrepPilotLogo size="sm" active={isListening || isSpeaking || isProcessing} />
          <div>
            <div className="flex items-center gap-2">
              <h2 id="preppilot-dialog-title" className="text-sm sm:text-base font-bold text-white tracking-tight">
                PrepPilot AI
              </h2>

              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-slate-900 border-slate-800 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>Voice Copilot</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Syllabus-grounded technical mentor & placement copilot
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Animated 16-Bar Audio Waveform Visualizer */}
          <div
            className="flex items-center gap-0.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 h-7"
            title={isListening ? `Listening (${audioLevel}%)` : isSpeaking ? 'Speaking response' : 'Audio visualizer ready'}
          >
            {audioWaveform.map((bar, idx) => (
              <span
                key={idx}
                className={`w-[2.5px] rounded-full transition-all duration-75 ${
                  isListening
                    ? 'bg-rose-400'
                    : isSpeaking
                    ? 'bg-cyan-400'
                    : isProcessing
                    ? 'bg-indigo-400 animate-pulse'
                    : 'bg-slate-600'
                }`}
                style={{
                  height: `${Math.max(4, Math.round(bar * 20))}px`
                }}
              />
            ))}
            <span className="text-[10px] font-mono text-slate-400 ml-1.5 hidden sm:inline">
              {isListening ? 'Listening' : isSpeaking ? 'Speaking' : isProcessing ? 'Thinking' : 'Ready'}
            </span>
          </div>

          {/* Voice Speed Settings Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(prev => !prev)}
              aria-label="Audio speech rate"
              className={`p-2 rounded-xl transition-colors ${
                showSettings
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
              title={`Voice Speed: ${speechRate}x`}
            >
              <Sliders size={16} />
            </button>

            {showSettings && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-30 animate-in fade-in zoom-in-95">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">
                  Playback Speed
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {SPEECH_RATES.map((rate) => (
                    <button
                      key={rate.value}
                      onClick={() => {
                        setSpeechRate(rate.value);
                        setShowSettings(false);
                      }}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        Math.abs(speechRate - rate.value) < 0.05
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{rate.label}</span>
                      {Math.abs(speechRate - rate.value) < 0.05 && <Check size={12} />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Voice speaking stop */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              aria-label="Stop speaking"
              className="p-2 text-rose-400 bg-rose-950/40 border border-rose-800/50 hover:bg-rose-900/60 rounded-xl transition-colors"
              title="Stop voice playback"
            >
              <VolumeX size={16} />
            </button>
          )}

          {/* Clear conversation */}
          {conversation.length > 0 && (
            <button
              onClick={clearConversation}
              aria-label="Clear conversation"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-xl transition-colors"
              title="Clear chat history"
            >
              <Trash2 size={16} />
            </button>
          )}

          {/* Close button */}
          <button
            onClick={closeVoiceModal}
            aria-label="Close assistant"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors"
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Active Question Context Banner (if user is taking a quiz, assessment, or practice) */}
      {activeQuestionContext && (
        <div className="bg-indigo-950/60 border-b border-indigo-900/60 px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse flex-shrink-0" />
            <span className="font-semibold text-cyan-200 flex-shrink-0">
              Active Question Context:
            </span>
            <span className="text-slate-300 truncate max-w-md">
              {activeQuestionContext.questionText}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleSend("Explain this question and diagnose why my answer might be wrong.")}
              className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-[11px] font-medium transition-colors cursor-pointer"
            >
              Diagnose My Answer
            </button>
            <button
              onClick={() => handleSend("Give me a hint for solving this problem step-by-step.")}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
            >
              Give Me a Hint
            </button>
          </div>
        </div>
      )}

      {/* Main Conversation Area - Centered Layout */}
      <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-3xl mx-auto w-full">
          {conversation.length === 0 ? (
            /* Empty State: Centered Aura & Quick Prompts */
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-8 animate-in fade-in duration-300">
              {/* Ambient Glowing Orb */}
              <div className="relative mb-6">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 opacity-80 blur-xl animate-pulse" />
                <div className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 flex items-center justify-center shadow-2xl border border-indigo-400/30">
                  <Sparkles size={28} className="text-white animate-spin" style={{ animationDuration: '10s' }} />
                </div>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
                {isDeanOrAdmin
                  ? "Academic Executive AI Briefing"
                  : isStudent
                  ? `Welcome, ${user?.name?.split(' ')[0] || 'Candidate'}`
                  : "How can I help you today?"}
              </h3>
              <p className="text-slate-400 text-sm max-w-lg mb-8 leading-relaxed">
                {isDeanOrAdmin
                  ? "Institutional Academic Telemetry: Monitor 844 students across 12 departments, analyze performance diagrams, and inspect learning gaps."
                  : isStudent
                  ? "Your Private Academic Copilot: Track your personal scorecard, identify areas of improvement, and receive genuine technical study tips."
                  : "Ask any question about Data Structures, OS, DBMS, Aptitude, or campus placement rounds."}
              </p>

              {/* Suggestions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl text-left">
                {(isDeanOrAdmin ? [
                  {
                    icon: BarChart3,
                    title: 'Student Performance & Diagrams',
                    subtitle: '12-branch benchmarks & visual flowchart',
                    prompt: 'How is student performance going across departments? Show me student stats with diagram.'
                  },
                  {
                    icon: TrendingUp,
                    title: 'Department Benchmarks',
                    subtitle: 'Compare scores & coding acceptance',
                    prompt: 'Compare departmental average scores and coding acceptance rates across all 12 branches.'
                  },
                  {
                    icon: AlertCircle,
                    title: 'Institutional Learning Gaps',
                    subtitle: 'Dynamic Programming, Graphs & B-Trees',
                    prompt: 'What are the primary institutional learning gaps and weak topics across the college?'
                  },
                  {
                    icon: GraduationCap,
                    title: 'Placement Readiness Distribution',
                    subtitle: 'Day-1 ready vs remedial cohorts',
                    prompt: 'Show student placement readiness distribution diagram and cohort breakdown.'
                  }
                ] : isStudent ? [
                  {
                    icon: UserCheck,
                    title: 'My Performance Scorecard',
                    subtitle: 'Your accuracy, assessments & streak',
                    prompt: 'How am I doing and what are my performance stats?'
                  },
                  {
                    icon: Target,
                    title: 'Areas of Improvement',
                    subtitle: 'Identify your weakest curriculum topics',
                    prompt: 'What are my areas of improvement and weakest topics?'
                  },
                  {
                    icon: Lightbulb,
                    title: 'Genuine Study Tips',
                    subtitle: 'Actionable problem-solving strategies',
                    prompt: 'Give me genuine pedagogical tips to improve my weakest topics.'
                  },
                  {
                    icon: Database,
                    title: 'Database Normalization',
                    subtitle: '1NF, 2NF, 3NF & BCNF anomalies',
                    prompt: 'Explain Database Normalization: 1NF, 2NF, 3NF, and BCNF with real-world examples and why candidate keys matter.'
                  }
                ] : SUGGESTIONS).map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSend(item.prompt)}
                      className="group p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-150 flex flex-col justify-between text-left shadow-sm hover:shadow-indigo-500/5 hover:-translate-y-0.5"
                    >
                      <div className="flex items-center justify-between mb-2 w-full">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:text-indigo-300">
                          <Icon size={16} />
                        </div>
                        <ArrowRight size={14} className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs sm:text-sm text-slate-200 group-hover:text-white mb-0.5">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">
                          {item.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Active Conversation Stream */
            <div className="space-y-6 pb-4">
              {conversation.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 sm:gap-4 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {/* Assistant Avatar (on left) */}
                  {msg.sender === 'preppilot' && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-600/20 mt-1">
                      <Sparkles size={16} />
                    </div>
                  )}

                  {/* Message Bubble Container */}
                  <div
                    className={`flex flex-col space-y-1.5 ${
                      msg.sender === 'user' ? 'items-end max-w-[85%] sm:max-w-[75%]' : 'items-start w-full max-w-full'
                    }`}
                  >
                    {msg.sender === 'user' ? (
                      /* User message pill */
                      <div className="p-3.5 sm:p-4 rounded-2xl rounded-tr-sm bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/10 text-sm leading-relaxed">
                        {msg.isVoiceInput && (
                          <div className="flex items-center gap-1.5 text-[11px] text-indigo-200 font-medium mb-1">
                            <Mic size={12} /> Spoken via microphone
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    ) : (
                      /* Gemini-grade AI response container */
                      <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-sm">
                        <FormattedAiMessage
                          text={msg.text}
                          sources={msg.sources}
                          speechText={msg.speechText}
                          isSpeaking={isSpeaking}
                          onSpeak={speakText}
                          onStopSpeak={stopSpeaking}
                          onPromptClick={handleSend}
                        />
                      </div>
                    )}

                    {/* Metadata line */}
                    <div className="flex items-center gap-2 px-1 text-[11px] text-slate-500">
                      <span>{msg.timestamp}</span>
                      {msg.sender === 'preppilot' && (
                        <>
                          <span className="text-indigo-400 font-medium">
                            • PrepPilot AI Mentor
                          </span>
                          <span className="text-slate-400 hidden sm:inline">• Syllabus Grounded</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* User Avatar (on right) */}
                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center flex-shrink-0 shadow-md mt-1">
                      <User size={15} />
                    </div>
                  )}
                </div>
              ))}

              {/* Live Voice Input Transcript */}
              {transcript && (
                <div className="flex justify-end gap-3 animate-in fade-in">
                  <div className="p-3.5 rounded-2xl rounded-tr-sm bg-indigo-950/80 border border-cyan-500/50 text-cyan-200 text-sm italic flex items-center gap-2 shadow-lg shadow-cyan-500/10">
                    <Mic size={14} className="text-rose-400 animate-pulse" />
                    <span>"{transcript}..."</span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/40 flex items-center justify-center text-white flex-shrink-0">
                    <User size={15} />
                  </div>
                </div>
              )}

              {/* Fast & Snappy Processing Indicator */}
              {isProcessing && (
                <div className="flex items-start gap-3 sm:gap-4 animate-in fade-in duration-150">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-md mt-1 animate-pulse">
                    <Sparkles size={16} />
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-300 text-sm flex items-center gap-3">
                    <Loader2 size={16} className="text-indigo-400 animate-spin" />
                    <span className="text-slate-300 text-xs sm:text-sm">
                      Synthesizing syllabus context & answers...
                    </span>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>
          )}
        </div>
      </main>

      {/* Centered Capsule Input Bar - Always Responsive & Consecutive */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-xl px-4 sm:px-6 py-3 flex-shrink-0 z-20">
        <div className="max-w-3xl mx-auto w-full">
          {voiceError && (
            <div className="mb-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
              <span>{voiceError}</span>
            </div>
          )}

          <div className={`relative flex items-end gap-2 bg-slate-900/90 border transition-all shadow-xl rounded-2xl p-2 ${
            isListening
              ? 'border-rose-500/70 ring-2 ring-rose-500/20'
              : 'border-slate-700/80 hover:border-slate-600 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20'
          }`}>
            {/* Auto-expanding textarea */}
            <textarea
              ref={inputRef}
              rows={1}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening
                  ? 'Listening to your voice... Speak now'
                  : 'Ask about concepts, formulas, algorithms, or placement patterns...'
              }
              className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-400 px-3 py-2 resize-none focus:outline-none max-h-36 min-h-[40px] leading-relaxed"
            />

            {/* Mic Toggle Button */}
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={!speechSupported && !isListening}
              aria-label={isListening ? 'Stop listening' : 'Start voice input'}
              className={`p-2.5 rounded-xl transition-all flex-shrink-0 cursor-pointer ${
                isListening
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40 animate-pulse'
                  : speechSupported
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 cursor-not-allowed'
              }`}
              title={isListening ? 'Stop voice input' : 'Speak via microphone'}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!inputVal.trim() || isProcessing}
              aria-label="Send message"
              className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${
                inputVal.trim() && !isProcessing
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
              title="Send (Enter)"
            >
              <Send size={18} />
            </button>
          </div>

          <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-400">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">Enter</kbd> to send • <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">Alt+V</kbd> toggles voice assistant</span>
            <span className="hidden sm:inline">PrepPilot Placement Mentor</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrepPilotVoiceModal;
