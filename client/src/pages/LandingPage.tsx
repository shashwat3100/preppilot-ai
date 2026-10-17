import { PrepPilotLogo } from '../components/Logo';
import { useVoice } from '../context/VoiceContext';
import {
  Sparkles,
  Mic,
  Brain,
  Building2,
  Sliders,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Flame,
  ChevronRight
} from 'lucide-react';

interface LandingPageProps {
  onStartPreparing: () => void;
  onExploreFeatures: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartPreparing,
  onExploreFeatures,
  onLogin
}) => {
  const { openVoiceModal } = useVoice();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <PrepPilotLogo size="sm" />
          <div className="flex items-center gap-4">
            <button
              onClick={onLogin}
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onStartPreparing}
              className="text-xs font-bold px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5"
            >
              Start Preparing
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 border-b border-slate-800/80">
        {/* Ambient lighting glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-40 right-10 w-[300px] h-[300px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
            <Sparkles size={14} className="text-cyan-400" />
            <span>Next-Gen Placement Engineering & Recommendation Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Prepare Smarter. Practice Better.{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-cyan-300 bg-clip-text text-transparent">
              Get Interview Ready.
            </span>
          </h1>

          <p className="text-sm sm:text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            An intelligent B.Tech placement preparation platform that personalizes interview practice based on your branch, target company, skills and performance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-3 sm:pt-4">
            <button
              onClick={onStartPreparing}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-600/40 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 transition-all"
            >
              <span>Start Preparing</span>
              <ArrowRight size={17} />
            </button>

            <button
              onClick={onExploreFeatures}
              className="w-full sm:w-auto px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700/80 transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Features</span>
              <ChevronRight size={17} />
            </button>
          </div>

          {/* Branch chips */}
          <div className="pt-6 sm:pt-8 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-400 max-w-3xl mx-auto">
            <span className="text-slate-500 font-medium">Supported B.Tech Branches:</span>
            {['CSE', 'IT', 'ECE / ENTC', 'Electrical (EE)', 'Mechanical (ME)', 'Civil', 'Chemical', 'AI & Data Science', 'AI & ML'].map((b, i) => (
              <span key={i} className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-medium">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Meet PrepPilot Promotional Section */}
      <section className="py-14 sm:py-20 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950 border-b border-slate-800/80 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-indigo-950/90 via-slate-900 to-slate-900 border border-indigo-500/40 p-5 sm:p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
                  <Mic size={14} className="text-cyan-400" />
                  <span>AI Voice Assistant</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                  Meet PrepPilot
                </h2>

                <p className="text-lg text-indigo-300 font-medium">
                  Your AI-powered interview preparation assistant.
                </p>

                <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                  PrepPilot uses advanced <strong>RAG (Retrieval-Augmented Generation)</strong> to answer technical interview queries using approved B.Tech syllabus and company recruitment patterns. Speak directly with voice or text to clarify DBMS normalization, OS deadlocks, or coding logic.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-cyan-400 flex-shrink-0" />
                    <span>Real-time Speech-to-Text & TTS Voice</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-cyan-400 flex-shrink-0" />
                    <span>Grounded in Placement Knowledge Base</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-cyan-400 flex-shrink-0" />
                    <span>Context-aware for Branch & Target Role</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-cyan-400 flex-shrink-0" />
                    <span>Domain-guarded against off-topic queries</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={openVoiceModal}
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5"
                  >
                    <Mic size={18} />
                    <span>Try PrepPilot</span>
                  </button>
                </div>
              </div>

              {/* Graphic Mock Card */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-md bg-slate-950/80 border border-indigo-500/30 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <PrepPilotLogo size="sm" active />
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      RAG Ready
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-indigo-200">
                      <span className="font-semibold text-indigo-400 block mb-1">Student asks:</span>
                      "Explain why BCNF is stricter than 3NF in DBMS?"
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                      <span className="font-semibold text-cyan-400 block mb-1 flex items-center gap-1">
                        <Sparkles size={11} /> PrepPilot explains:
                      </span>
                      "In 3NF, for X → A, either X is a superkey OR A is prime. In BCNF, X MUST be a superkey without exception!"
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Synthesized in 240ms</span>
                    <span className="text-cyan-400">Audio playback ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Pillars Section */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
            Complete Preparation Ecosystem
          </h2>
          <h3 className="text-3xl font-extrabold text-white">
            Engineered for Campus Recruitment Success
          </h3>
          <p className="text-sm text-slate-400">
            A comprehensive suite designed for B.Tech final-year placement drives, technical interviews, and online assessments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. Personalized Preparation */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all hover:bg-slate-900/90 group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Brain size={24} />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Personalized Preparation</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Dynamically tailors your preparation roadmap based on your engineering branch, preferred job role, target company, and past quiz performance.
            </p>
          </div>

          {/* 2. Adaptive Daily Quiz */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all hover:bg-slate-900/90 group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles size={24} />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Adaptive Daily Quiz</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              No random questions. Our recommendation engine detects weak topics, balances fresh curriculum questions, and tunes difficulty dynamically.
            </p>
          </div>

          {/* 3. Company-wise Practice */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all hover:bg-slate-900/90 group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Building2 size={24} />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Company Pattern Questions</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Practice questions curated to the hiring patterns of TCS NQT, Infosys InfyTQ, Accenture Cognitive, Wipro NTH, Amazon, and Microsoft.
            </p>
          </div>

          {/* 4. Custom Quiz Builder */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all hover:bg-slate-900/90 group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sliders size={24} />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Custom Quiz Builder</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Filter by branch, company, subject (DSA, DBMS, OS, Networks, ECE core), specific topics, difficulty level, and custom question count.
            </p>
          </div>

          {/* 5. Performance Analytics */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all hover:bg-slate-900/90 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BarChart3 size={24} />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">In-Depth Performance Analytics</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Track overall accuracy, topic-wise strengths and weaknesses, weekly progression, and average speed with interactive visual charts.
            </p>
          </div>

          {/* 6. Gamified Learning */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all hover:bg-slate-900/90 group">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Flame size={24} />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Gamified Preparation</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Earn XP on correct answers, gain speed bonuses, maintain daily preparation streaks, level up from Novice to Placement Ready, and unlock achievement badges.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <PrepPilotLogo size="sm" />
          <div className="text-xs text-slate-500 text-center sm:text-right">
            <p>B.Tech Major Project • Placement Interview & Quiz Recommendation Engine</p>
            <p className="mt-1">Powered by PrepPilot Voice AI & RAG Knowledge Retrieval</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
