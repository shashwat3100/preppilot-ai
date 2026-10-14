import React, { useState, useEffect, useRef } from 'react';
import { useVoice } from '../context/VoiceContext';
import { useAuth } from '../context/AuthContext';
import FormattedAiMessage from '../components/ui/FormattedAiMessage';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Trash2,
  Bot,
  User,
  ArrowRight,
  Database,
  Cpu,
  Layers,
  Building2,
  ChevronDown,
  Key,
  Check,
  Zap,
  Settings2,
  X
} from 'lucide-react';

const SUGGESTIONS = [
  {
    icon: Database,
    title: 'Database Normalization',
    subtitle: '1NF, 2NF, 3NF and BCNF comparison & anomalies',
    prompt: 'Explain Database Normalization: 1NF, 2NF, 3NF, and BCNF with real-world examples and why candidate keys matter.'
  },
  {
    icon: Layers,
    title: 'Operating Systems & Deadlocks',
    subtitle: 'Coffman conditions & Banker\'s Algorithm',
    prompt: 'Explain the 4 Coffman conditions for Deadlocks in Operating Systems, and how deadlock prevention differs from deadlock avoidance.'
  },
  {
    icon: Cpu,
    title: '8085 Microprocessor & Circuits',
    subtitle: 'ALE pin function & interrupt priorities',
    prompt: 'Explain the function of the ALE pin in the 8085 Microprocessor, why multiplexed address/data buses exist, and list interrupt priorities.'
  },
  {
    icon: Building2,
    title: 'TCS NQT & Infosys Placement Prep',
    subtitle: 'Campus interview patterns & core questions',
    prompt: 'What are the most frequent technical interview questions and coding patterns asked in TCS NQT and Infosys campus drives?'
  }
];

export default function ThinkingOrbPage() {
  const { user } = useAuth();
  const {
    conversation,
    isListening,
    isSpeaking,
    isProcessing,
    speechSupported,
    transcript,
    voiceError,
    startListening,
    stopListening,
    sendQuery,
    speakText,
    stopSpeaking,
    clearConversation,
    selectedModel,
    setSelectedModel,
    availableModels,
    apiKey,
    setApiKey,
    hasSystemKey
  } = useVoice();

  const [inputVal, setInputVal] = useState('');
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, isProcessing, transcript]);

  // Keep input focused so user can click and type anytime
  useEffect(() => {
    inputRef.current?.focus();
  }, [conversation]);

  // Handle user submission
  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text || isProcessing) return;

    setInputVal('');
    await sendQuery(text, false, selectedModel);

    // Re-focus input immediately so user can type second/third message with zero friction
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

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const currentModelInfo = availableModels.find(m => m.id === selectedModel) || {
    id: selectedModel,
    name: selectedModel,
    tag: 'Latest Model'
  };

  const handleSaveApiKey = () => {
    setApiKey(tempApiKey.trim());
    setShowSettingsModal(false);
  };

  const hasMessages = conversation.length > 1; // 1 is default welcome message

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 flex flex-col justify-between text-slate-100">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* Top Header Bar                                                */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-16 z-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 flex-shrink-0">
              <Sparkles size={16} className="text-white" />
            </div>
            <div className="min-w-0 flex items-center gap-2">
              <h1 className="text-sm font-bold text-white flex items-center gap-2 truncate">
                <span>PrepPilot AI</span>
              </h1>

              {/* Model Selector Pill */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowModelMenu(!showModelMenu)}
                  className="text-[11px] px-2.5 py-1 rounded-full font-medium bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 hover:from-indigo-500/30 hover:to-cyan-500/30 text-indigo-200 border border-indigo-500/40 flex items-center gap-1.5 transition-all shadow-sm"
                  title="Switch AI Model"
                >
                  <Sparkles size={11} className="text-cyan-400" />
                  <span className="font-semibold">{currentModelInfo.name}</span>
                  <ChevronDown size={11} className={`text-slate-400 transition-transform ${showModelMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showModelMenu && (
                  <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 py-1.5">
                      Select Google Gemini Model
                    </div>
                    {availableModels.map(m => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedModel(m.id);
                          setShowModelMenu(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-start gap-2.5 ${
                          selectedModel === m.id
                            ? 'bg-indigo-600/20 border border-indigo-500/40 text-white'
                            : 'hover:bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        <Zap size={15} className={`mt-0.5 flex-shrink-0 ${selectedModel === m.id ? 'text-indigo-400' : 'text-slate-500'}`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-100">{m.name}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded font-medium bg-slate-800 text-indigo-300 border border-slate-700">
                              {m.tag}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                            {m.description}
                          </p>
                        </div>
                        {selectedModel === m.id && <Check size={14} className="text-indigo-400 mt-1 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Active Mode Pill */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border bg-slate-900 border-slate-800 text-slate-300">
              <span className={`w-2 h-2 rounded-full ${apiKey || hasSystemKey ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`} />
              <span>{apiKey || hasSystemKey ? 'Live GenAI Mode' : 'Curriculum RAG Grounded'}</span>
            </div>

            {/* Model Settings Button */}
            <button
              onClick={() => {
                setTempApiKey(apiKey);
                setShowSettingsModal(true);
              }}
              className={`p-2 rounded-xl border transition-colors ${
                apiKey || hasSystemKey
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="Configure Gemini API Settings"
              aria-label="Gemini API Key Settings"
            >
              <Settings2 size={16} />
            </button>

            {/* Audio Indicator */}
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 animate-pulse cursor-pointer"
                title="Stop audio playback"
              >
                <VolumeX size={13} />
                <span className="hidden sm:inline">Stop Audio</span>
              </button>
            )}

            {/* Clear Conversation */}
            {conversation.length > 1 && (
              <button
                onClick={clearConversation}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Clear conversation"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Central Content Area (Stream of Conversation in Middle)       */}
      {/* ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-4 py-8" onClick={() => setShowModelMenu(false)}>
        <div className="max-w-4xl mx-auto w-full">
          {!hasMessages ? (
            /* Empty State: Center Hero Aura & Suggestions */
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 animate-in fade-in duration-300">
              {/* Gemini-Inspired Breathing Ambient Orb */}
              <div className="relative mb-8 group cursor-default">
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 opacity-75 blur-2xl animate-pulse" />
                <div className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 via-indigo-600 to-purple-700 flex items-center justify-center shadow-2xl border border-white/20">
                  <Sparkles size={32} className="text-white animate-spin" style={{ animationDuration: '12s' }} />
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                What would you like to prepare with {currentModelInfo.name}?
              </h2>
              <p className="text-sm text-slate-400 max-w-lg mb-8 leading-relaxed">
                Trained on Pune University curriculum and verified against placement interviews from TCS, Infosys, Capgemini, Google, and Amazon.
              </p>

              {/* 4 Interactive Topic Suggestion Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-2xl text-left">
                {SUGGESTIONS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSend(item.prompt)}
                      className="group p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 transition-all duration-200 flex flex-col justify-between text-left cursor-pointer shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-0.5"
                    >
                      <div className="flex items-center justify-between mb-2 w-full">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:text-cyan-300">
                          <Icon size={16} />
                        </div>
                        <ArrowRight size={14} className="text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-slate-200 group-hover:text-white mb-0.5">
                          {item.title}
                        </div>
                        <div className="text-xs text-slate-400 line-clamp-1">
                          {item.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Active Message History (Middle-of-the-screen stream) */
            <div className="space-y-6">
              {conversation.map((msg, index) => {
                const isUser = msg.sender === 'user';
                return (
                  <article
                    key={msg.id || index}
                    className={`flex gap-3.5 sm:gap-4 max-w-full ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {/* Bot Icon on the left */}
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-indigo-700 flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-cyan-500/20 mt-1">
                        <Sparkles size={16} />
                      </div>
                    )}

                    {/* Message Bubble Body */}
                    <div className={`max-w-[85%] sm:max-w-[78%] ${isUser ? 'order-1' : 'order-2'}`}>
                      {isUser ? (
                        <div className="p-4 rounded-2xl rounded-tr-none bg-indigo-600 text-white shadow-xl shadow-indigo-600/20">
                          {msg.isVoiceInput && (
                            <div className="flex items-center gap-1 text-[10px] text-cyan-200 font-semibold mb-1">
                              <Mic size={11} /> Spoken via microphone
                            </div>
                          )}
                          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      ) : (
                        <div className="p-5 sm:p-6 rounded-2xl rounded-tl-none bg-slate-900/90 border border-slate-800 text-slate-100 shadow-xl shadow-black/30">
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

                      <div className={`flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <span>{msg.timestamp || 'Just now'}</span>
                        {!isUser && (
                          <>
                            <span className="text-indigo-400 font-medium">
                              • {msg.model || selectedModel}
                            </span>
                            {msg.isLiveApi ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Live GenAI API
                              </span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                Grounded RAG & Syllabus Demo Mode
                              </span>
                            )}
                            {(msg.text.includes("connection hiccup") || msg.text.includes("Please retry")) && (
                              <button
                                onClick={() => {
                                  const prevUserMsg = [...conversation.slice(0, index)].reverse().find(m => m.sender === 'user');
                                  if (prevUserMsg) {
                                    sendQuery(prevUserMsg.text, prevUserMsg.isVoiceInput);
                                  }
                                }}
                                className="text-[10px] px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 cursor-pointer transition-colors"
                              >
                                ↻ Retry Question
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* User Avatar on the right */}
                    {isUser && (
                      <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0 mt-1 order-2">
                        <User size={15} />
                      </div>
                    )}
                  </article>
                );
              })}

              {/* Real-time Voice Transcript preview while user speaks */}
              {transcript && (
                <div className="flex justify-end gap-3 animate-pulse">
                  <div className="max-w-[80%] p-3.5 rounded-2xl rounded-tr-none bg-indigo-950/70 border border-cyan-500/40 text-cyan-200 text-xs sm:text-sm italic">
                    "{transcript}..."
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/60 flex items-center justify-center text-white flex-shrink-0 mt-1">
                    <Mic size={15} />
                  </div>
                </div>
              )}

              {/* Quick & Snappy Thinking Indicator (Gemini-style) */}
              {isProcessing && (
                <div className="flex items-center gap-3.5 text-slate-400 text-xs animate-in fade-in duration-150">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
                    <Sparkles size={16} className="animate-spin" />
                  </div>
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span className="text-slate-300 text-xs font-medium">
                      {currentModelInfo.name} synthesizing curriculum & interview insights...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Bottom Floating Input Bar (Always Centered & Never Broken)    */}
      {/* ───────────────────────────────────────────────────────────── */}
      <footer className="sticky bottom-0 z-20 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pt-4 pb-5 px-4">
        <div className="max-w-4xl mx-auto w-full space-y-2">
          {voiceError && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
              <span>{voiceError}</span>
            </div>
          )}

          {/* Gemini Capsule Input Bar */}
          <div className={`relative flex items-end gap-2 p-2 rounded-2xl bg-slate-900/95 border transition-all shadow-2xl ${
            isListening
              ? 'border-red-500/60 ring-2 ring-red-500/20'
              : 'border-slate-800 hover:border-slate-700 focus-within:border-cyan-500/80 focus-within:ring-2 focus-within:ring-cyan-500/20'
          }`}>
            {/* Auto-expanding text input */}
            <textarea
              ref={inputRef}
              rows={1}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening
                  ? 'Listening to speech...'
                  : `Ask ${currentModelInfo.name} about DSA, DBMS, Microprocessor, or interview rounds...`
              }
              className="flex-1 bg-transparent border-0 text-slate-100 placeholder-slate-400 text-xs sm:text-sm px-3 py-2 resize-none focus:outline-none max-h-36 min-h-[42px] leading-relaxed"
            />

            {/* Voice Mic Button */}
            <button
              onClick={handleMicToggle}
              disabled={!speechSupported && !isListening}
              className={`p-2.5 rounded-xl transition-all cursor-pointer flex-shrink-0 ${
                isListening
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/40 animate-pulse'
                  : speechSupported
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 cursor-not-allowed'
              }`}
              title={isListening ? 'Stop listening' : 'Speak your question'}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            {/* Send Button */}
            <button
              onClick={() => handleSend()}
              disabled={!inputVal.trim() || isProcessing}
              className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${
                inputVal.trim() && !isProcessing
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/20 cursor-pointer'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
              title="Send message (Enter)"
            >
              <Send size={18} />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-2">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">Shift+Enter</kbd> for line breaks</span>
            <span className="hidden sm:inline">Model: {currentModelInfo.name} • SPPU Syllabus Grounded</span>
          </div>
        </div>
      </footer>

      {/* Model & API Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Key size={18} className="text-cyan-400" />
                <h3 className="text-base font-bold text-white">Google Gemini Settings</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Active AI Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {availableModels.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.tag})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Google Gemini API Key (Optional)
              </label>
              <input
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                If provided, PrepPilot connects directly to official Google GenAI endpoints. If left blank, PrepPilot utilizes our high-precision syllabus-grounded Gemini 2.5 synthesis engine.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKey}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
