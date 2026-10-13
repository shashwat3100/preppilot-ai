import React from 'react';
import { useVoice } from '../context/VoiceContext';
import { PrepPilotLogo } from './Logo';
import { Mic, Sparkles, Volume2, ShieldCheck, Zap } from 'lucide-react';

export const PrepPilotCard: React.FC = () => {
  const { openVoiceModal, startListening } = useVoice();

  const handleStartVoice = () => {
    openVoiceModal();
    // Give modal brief moment to mount then start microphone
    setTimeout(() => {
      startListening();
    }, 400);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/40 p-6 shadow-xl shadow-indigo-950/50 group">
      {/* Ambient background glow & radar circles */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-500" />
      <div className="absolute bottom-0 left-1/4 -mb-10 w-40 h-40 rounded-full bg-indigo-600/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left branding & messaging */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-slate-800/90 border border-indigo-500/30 text-cyan-400 shadow-lg flex-shrink-0">
            <PrepPilotLogo size="lg" animated showText={false} />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Ask PrepPilot
              </h3>
              <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <Sparkles size={11} /> AI Voice Assistant
              </span>
            </div>

            <p className="text-sm text-slate-300 font-medium">
              Get quick help with your interview preparation.
            </p>

            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Ask about DBMS normalization, algorithm complexity, operating systems, or specific recruitment patterns for TCS, Infosys, and Amazon.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck size={13} /> Grounded RAG Architecture
              </span>
              <span className="flex items-center gap-1 text-indigo-300">
                <Volume2 size={13} /> Natural Voice Synthesis
              </span>
              <span className="flex items-center gap-1 text-amber-300">
                <Zap size={13} /> Branch Specific Answers
              </span>
            </div>
          </div>
        </div>

        {/* Right CTA Button & Quick Launch */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto flex-shrink-0 pt-2 md:pt-0">
          <button
            onClick={openVoiceModal}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700 transition-colors text-center"
          >
            Chat Mode
          </button>

          <button
            onClick={handleStartVoice}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2.5 transform hover:-translate-y-0.5 transition-all text-center"
          >
            <Mic size={17} className="animate-bounce" />
            <span>Start Voice Assistant</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrepPilotCard;
