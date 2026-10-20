import React, { useState, useEffect, useRef } from 'react';
import { useVoice } from '../context/VoiceContext';
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
  ArrowRight
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
    title: '8085 Microprocessor',
    subtitle: 'ALE pin function & interrupt priorities',
    prompt: 'Explain the function of the ALE pin in the 8085 Microprocessor, why multiplexed address/data buses exist, and list interrupt priorities.'
  },
  {
    icon: Building2,
    title: 'Placement Interview Prep',
    subtitle: 'Top questions for TCS NQT & Infosys',
    prompt: 'What are the most frequent technical interview questions and coding patterns asked in TCS NQT and Infosys campus drives?'
  }
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
    clearConversation
  } = useVoice();

  const [inputVal, setInputVal] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new conversation messages
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation, isProcessing, transcript]);

  // Keep input focused so user can click and type anytime (fixes second-click issue)
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
      <header className="flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-slate-800/70 bg-slate-950/80 backdrop-blur-md flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <PrepPilotLogo size="sm" active={isListening || isSpeaking || isProcessing} />
          <div>
            <div className="flex items-center gap-2">
              <h2 id="preppilot-dialog-title" className="text-sm sm:text-base font-bold text-white tracking-tight">
                PrepPilot AI
              </h2>

              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-slate-900 border-slate-800 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>Placement AI Mentor</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Syllabus-grounded technical mentor & placement copilot
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isListening
                  ? 'bg-rose-500 animate-ping'
                  : isSpeaking
                  ? 'bg-cyan-500 animate-pulse'
                  : isProcessing
                  ? 'bg-indigo-500 animate-ping'
                  : 'bg-emerald-500'
              }`}
            />
            <span className="text-slate-300 text-[11px]">
              {isListening
                ? 'Listening...'
                : isSpeaking
                ? 'Speaking...'
                : isProcessing
                ? 'Thinking...'
                : 'Ready'}
            </span>
          </div>

          {/* Voice speaking stop */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              aria-label="Stop speaking"
              className="p-2 text-cyan-400 bg-cyan-950/40 border border-cyan-800/50 hover:bg-cyan-900/60 rounded-xl transition-colors"
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
                How can I help you today?
              </h3>
              <p className="text-slate-400 text-sm max-w-lg mb-8 leading-relaxed">
                Ask any question about Data Structures, OS, DBMS, Microprocessors, or campus placement rounds.
              </p>

              {/* Suggestions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl text-left">
                {SUGGESTIONS.map((item, idx) => {
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
                  <div className="p-3 rounded-2xl rounded-tr-sm bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 text-sm italic flex items-center gap-2">
                    <Mic size={14} className="text-indigo-400 animate-pulse" />
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
      <footer className="border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-xl px-4 sm:px-6 py-3.5 flex-shrink-0 z-20">
        <div className="max-w-3xl mx-auto w-full">
          {voiceError && (
            <div className="mb-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
              <span>{voiceError}</span>
            </div>
          )}

          <div className="relative flex items-end gap-2 bg-slate-900/90 border border-slate-700/80 hover:border-slate-600 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 rounded-2xl p-2 transition-all shadow-xl">
            {/* Auto-expanding textarea */}
            <textarea
              ref={inputRef}
              rows={1}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening
                  ? 'Listening to your voice...'
                  : 'Ask about concepts, gate questions, or interview topics...'
              }
              className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-400 px-3 py-2 resize-none focus:outline-none max-h-36 min-h-[40px] leading-relaxed"
            />

            {/* Mic Toggle Button */}
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={!speechSupported && !isListening}
              aria-label={isListening ? 'Stop listening' : 'Start voice input'}
              className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${
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
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
              title="Send (Enter)"
            >
              <Send size={18} />
            </button>
          </div>

          <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-400">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">Shift+Enter</kbd> for new line</span>
            <span className="hidden sm:inline">PrepPilot Placement Mentor</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrepPilotVoiceModal;
