import React from 'react';
import { useVoice } from '../context/VoiceContext';
import { Mic, Volume2, Sparkles } from 'lucide-react';

export const FloatingVoiceButton: React.FC = () => {
  const { isModalOpen, openVoiceModal, isListening, isSpeaking, isProcessing, audioWaveform } = useVoice();

  // If voice modal is already covering the screen, hide the floating button
  if (isModalOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 group">
      {/* Tooltip Pill */}
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none translate-x-1 group-hover:translate-x-0">
        <Sparkles size={12} className="text-cyan-400" />
        <span className="font-medium">Voice AI Mentor</span>
        <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">Alt+V</kbd>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={openVoiceModal}
        aria-label="Open PrepPilot Voice Assistant"
        className={`relative p-3.5 sm:p-4 rounded-full shadow-2xl transition-all duration-300 cursor-pointer flex items-center justify-center ${
          isListening
            ? 'bg-rose-600 text-white shadow-rose-600/50 ring-4 ring-rose-500/30 animate-pulse'
            : isSpeaking
            ? 'bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 text-white shadow-cyan-500/40 ring-4 ring-cyan-500/30'
            : isProcessing
            ? 'bg-indigo-600 text-white shadow-indigo-600/40 animate-pulse'
            : 'bg-gradient-to-tr from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-cyan-600 text-white shadow-indigo-600/40 hover:shadow-cyan-500/30 hover:scale-105 active:scale-95'
        }`}
        title="Open Voice Assistant (Alt+V)"
      >
        {/* Ambient Glow Aura */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 opacity-0 group-hover:opacity-40 blur-md transition-opacity duration-300" />

        {/* Icon / Sound Wave */}
        {isSpeaking ? (
          <div className="flex items-center gap-0.5 h-5 px-1">
            {audioWaveform.slice(0, 4).map((bar, i) => (
              <span
                key={i}
                className="w-1 bg-white rounded-full transition-all duration-75"
                style={{ height: `${Math.max(6, Math.round(bar * 18))}px` }}
              />
            ))}
          </div>
        ) : isListening ? (
          <Mic size={22} className="animate-bounce" />
        ) : (
          <div className="relative">
            <Mic size={22} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-slate-900" />
          </div>
        )}
      </button>
    </div>
  );
};

export default FloatingVoiceButton;
