import React, { useState, useEffect } from 'react';
import { useVoice } from '../context/VoiceContext';
import { PrepPilotLogo } from '../components/Logo';
import FormattedAiMessage from '../components/ui/FormattedAiMessage';
import api from '../services/api';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Trash2,
  Sparkles,
  Send,
  BookOpen,
  Database,
  Bot,
  User
} from 'lucide-react';

export const PrepPilotPage: React.FC = () => {
  const {
    isListening,
    isSpeaking,
    isProcessing,
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
  const [knowledgeDocs, setKnowledgeDocs] = useState<any[]>([]);
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false);

  useEffect(() => {
    const fetchKnowledge = async () => {
      try {
        const res = await api.getPrepPilotKnowledge();
        if (res.success && res.documents) {
          setKnowledgeDocs(res.documents);
        }
      } catch (err) {
        console.error('Error fetching knowledge docs:', err);
      }
    };
    fetchKnowledge();
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isProcessing) return;
    sendQuery(inputVal.trim(), false);
    setInputVal('');
  };

  const samplePrompts = [
    "Explain Database Normalization (1NF, 2NF, 3NF, BCNF) with clear interview examples",
    "What are the 4 Coffman conditions required for Deadlocks in Operating Systems?",
    "Explain the TCP 3-Way Handshake step-by-step for networking rounds",
    "What is the recruitment structure and syllabus for TCS NQT?",
    "In 8085 microprocessor, what is the exact function of the ALE pin?",
    "What are ACID properties and why does PG default to Read Committed?"
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Studio Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-500/30">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <PrepPilotLogo size="md" active={isListening || isSpeaking} />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              PrepPilot Interactive Voice Studio
            </h1>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl">
            Real-time conversational voice assistant grounded in verified B.Tech engineering curriculum and campus recruitment guides.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowKnowledgeModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <BookOpen size={15} />
            <span>Browse RAG Knowledge ({knowledgeDocs.length})</span>
          </button>

          <button
            onClick={clearConversation}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Clear conversation"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Big Voice Orb + Conversation Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Interactive Voice Controller & Waveform (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center space-y-6 shadow-xl relative overflow-hidden">
            {/* Ambient glow */}
            <div className={`absolute inset-0 bg-indigo-500/10 blur-2xl pointer-events-none transition-all ${
              isListening ? 'bg-red-500/15' : isSpeaking ? 'bg-cyan-500/15' : ''
            }`} />

            <div className="relative z-10 flex flex-col items-center space-y-4">
              {/* Giant Voice Orb Button */}
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`w-28 h-28 rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${
                  isListening
                    ? 'bg-red-600 text-white shadow-2xl shadow-red-600/50 animate-voice-pulse'
                    : isSpeaking
                    ? 'bg-cyan-600 text-white shadow-2xl shadow-cyan-500/50 animate-pulse'
                    : 'bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-xl shadow-indigo-600/40 hover:shadow-cyan-500/40'
                }`}
                title={isListening ? "Stop listening" : "Tap to Speak"}
              >
                {isListening ? (
                  <MicOff size={40} className="animate-pulse" />
                ) : (
                  <Mic size={40} />
                )}
              </button>

              <div className="space-y-1">
                <span className="text-sm font-bold text-white block">
                  {isListening ? "Listening to your microphone..." : isSpeaking ? "PrepPilot Vocalizing Response" : "Tap Orb to Speak"}
                </span>
                <span className="text-xs text-slate-400 block">
                  Speech-to-Text • RAG Retrieval • Voice Synthesis
                </span>
              </div>

              {/* Audio Waveform visualization */}
              <div className="flex items-center gap-1.5 h-8 pt-2">
                <span className={`w-1.5 rounded-full ${isListening || isSpeaking ? 'bg-cyan-400 wave-bar-1' : 'bg-slate-700 h-2'}`} />
                <span className={`w-1.5 rounded-full ${isListening || isSpeaking ? 'bg-indigo-400 wave-bar-2' : 'bg-slate-700 h-2'}`} />
                <span className={`w-1.5 rounded-full ${isListening || isSpeaking ? 'bg-purple-400 wave-bar-3' : 'bg-slate-700 h-2'}`} />
                <span className={`w-1.5 rounded-full ${isListening || isSpeaking ? 'bg-cyan-400 wave-bar-4' : 'bg-slate-700 h-2'}`} />
                <span className={`w-1.5 rounded-full ${isListening || isSpeaking ? 'bg-blue-400 wave-bar-5' : 'bg-slate-700 h-2'}`} />
                <span className={`w-1.5 rounded-full ${isListening || isSpeaking ? 'bg-sky-400 wave-bar-2' : 'bg-slate-700 h-2'}`} />
                <span className={`w-1.5 rounded-full ${isListening || isSpeaking ? 'bg-indigo-400 wave-bar-3' : 'bg-slate-700 h-2'}`} />
              </div>
            </div>

            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="relative z-10 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5"
              >
                <VolumeX size={14} /> Mute Assistant
              </button>
            )}
          </div>

          {/* Quick Technical Prompts */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
              Suggested Viva Prompts:
            </span>
            <div className="space-y-2">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => sendQuery(p, false)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800/80 transition-colors leading-relaxed"
                >
                  "{p}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Conversation Stream & Input (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-[700px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {conversation.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3.5 max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-800 text-cyan-400 border border-cyan-500/20 shadow-lg'
                }`}>
                  {msg.sender === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>

                <div className={`flex flex-col space-y-1.5 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-none'
                      : 'bg-slate-800/90 border border-slate-700/80 text-slate-200 rounded-tl-none shadow-md backdrop-blur-sm'
                  }`}>
                    {msg.isVoiceInput && (
                      <div className="flex items-center gap-1 text-[11px] text-indigo-200 font-semibold mb-1">
                        <Mic size={12} /> Spoken via microphone
                      </div>
                    )}

                    {msg.sender === 'user' ? (
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    ) : (
                      <FormattedAiMessage
                        text={msg.text}
                        sources={msg.sources}
                        speechText={msg.speechText}
                        isSpeaking={isSpeaking}
                        onSpeak={speakText}
                        onStopSpeak={stopSpeaking}
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-2 px-1 text-[11px] text-slate-500">
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'preppilot' && msg.speechText && (
                      <button
                        onClick={() => speakText(msg.speechText!)}
                        className="text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
                      >
                        <Volume2 size={12} /> Listen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {transcript && (
              <div className="flex gap-3.5 max-w-[85%] ml-auto flex-row-reverse animate-pulse">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/50 flex items-center justify-center flex-shrink-0 text-white">
                  <Mic size={18} />
                </div>
                <div className="p-3.5 rounded-2xl rounded-tr-none bg-indigo-950/70 border border-indigo-500/40 text-indigo-200 text-sm italic">
                  "{transcript}..."
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="flex gap-3.5 max-w-[85%] mr-auto items-center">
                <div className="w-9 h-9 rounded-xl bg-slate-800 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                  <Bot size={18} className="animate-spin" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-slate-800/60 border border-slate-700 text-slate-400 text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  PrepPilot searching B.Tech knowledge documents & synthesizing interview explanation...
                </div>
              </div>
            )}
          </div>

          {/* Form Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center gap-3">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask a technical concept, company interview question, or tap mic..."
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors"
              disabled={isProcessing}
            />

            <button
              type="submit"
              disabled={!inputVal.trim() || isProcessing}
              className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* RAG Knowledge Base Inspector Modal */}
      {showKnowledgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Database size={18} className="text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  PrepPilot RAG Knowledge Base
                </h3>
              </div>
              <button
                onClick={() => setShowKnowledgeModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              These approved documents are indexed with vector embeddings to keep PrepPilot grounded in verified B.Tech curriculum and prevent hallucinations.
            </p>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {knowledgeDocs.map((doc) => (
                <div key={doc.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">{doc.title}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      {doc.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{doc.summary}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {doc.keywords?.map((kw: string, i: number) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowKnowledgeModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrepPilotPage;
