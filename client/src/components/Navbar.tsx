import React, { useState } from 'react';
import { CareerPrepLogo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { useVoice } from '../context/VoiceContext';
import {
  Flame,
  Zap,
  Mic,
  LayoutDashboard,
  Sparkles,
  Sliders,
  Building2,
  BarChart3,
  Shield,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Code2
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const { user, logout, isAdmin } = useAuth();
  const { openVoiceModal, isListening, isSpeaking } = useVoice();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Tailored links based on role to prevent screen overflow
  const navLinks = isAdmin
    ? [
        { id: 'admin', label: 'Admin Panel', icon: Shield },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'companies', label: 'Companies', icon: Building2 },
        { id: 'thinking-orb', label: 'AI Assistant', icon: Sparkles },
        { id: 'preppilot-studio', label: 'Voice Studio', icon: Mic },
        { id: 'dashboard', label: 'Student View', icon: LayoutDashboard }
      ]
    : [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'adaptive-quiz', label: 'Adaptive Quiz', icon: Sparkles },
        { id: 'coding-practice', label: 'Coding Practice', icon: Code2 },
        { id: 'assessment', label: 'Placement Test', icon: ShieldCheck },
        { id: 'custom-practice', label: 'Custom Practice', icon: Sliders },
        { id: 'companies', label: 'Companies', icon: Building2 },
        { id: 'thinking-orb', label: 'AI Assistant', icon: Sparkles },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'preppilot-studio', label: 'Voice Studio', icon: Mic }
      ];

  const handleNavClick = (tabId: string) => {
    onSelectTab(tabId);
    setMobileMenuOpen(false);
  };

  const handleOpenVoice = () => {
    setMobileMenuOpen(false);
    openVoiceModal();
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-slate-950/95 backdrop-blur-2xl border-b border-slate-800/90 shadow-lg shadow-black/40 overflow-x-clip">
      {/* Container constrained to max-w-7xl to prevent any right-edge spilling */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Left: Brand Logo & Navigation Links */}
          <div className="flex items-center gap-3 lg:gap-5 min-w-0">
            <button
              onClick={() => handleNavClick(isAdmin ? 'admin' : 'dashboard')}
              className="text-left focus:outline-none flex-shrink-0 transition-transform active:scale-95"
            >
              <CareerPrepLogo size="sm" />
            </button>

            {/* Desktop Navigation Links (Responsive layout) */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = currentTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide whitespace-nowrap transition-all cursor-pointer ${
                      active
                        ? link.id === 'admin'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm font-bold'
                          : 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                    }`}
                  >
                    <Icon size={14} className="flex-shrink-0" />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Header Area: Voice AI + Badges + Profile + Logout (Fully constrained to viewport) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            {/* Ask PrepPilot Voice Assistant Navbar Action */}
            <button
              onClick={handleOpenVoice}
              className={`flex-shrink-0 whitespace-nowrap relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-all border shadow-sm cursor-pointer ${
                isListening || isSpeaking
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 animate-pulse shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-500/40'
                  : 'bg-gradient-to-r from-indigo-950/90 via-slate-900 to-indigo-950/90 hover:from-indigo-900 hover:to-indigo-950 text-cyan-300 border-indigo-500/40 hover:border-cyan-400 shadow-indigo-950/40'
              }`}
              title="Launch PrepPilot Voice Assistant"
            >
              <div className="relative flex items-center justify-center flex-shrink-0">
                <Mic size={14} className={`flex-shrink-0 ${isListening ? 'animate-bounce text-red-400' : 'text-cyan-400'}`} />
                <span className="flex h-2 w-2 absolute -top-1 -right-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
              </div>
              <span className="font-bold tracking-tight text-[11px] sm:text-xs">Ask PrepPilot</span>
              <span className="hidden xl:inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Voice AI
              </span>
            </button>

            {/* Role-Aware Badges: Dean Badge vs Student Gamification */}
            {user && (
              isAdmin ? (
                /* Dean / Admin Badge */
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-extrabold whitespace-nowrap">
                  <ShieldCheck size={14} className="text-amber-400 flex-shrink-0" />
                  <span>Placement Dean</span>
                </div>
              ) : (
                /* Student Gamification Badges */
                <div className="hidden md:flex items-center gap-1.5 pl-1.5 border-l border-slate-800">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold whitespace-nowrap" title="Daily Streak">
                    <Flame size={12} className="fill-amber-400 text-amber-500 animate-pulse flex-shrink-0" />
                    <span>{user.current_streak}d</span>
                  </div>

                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold whitespace-nowrap" title="Total XP">
                    <Zap size={12} className="text-indigo-400 flex-shrink-0" />
                    <span>{user.total_xp} XP</span>
                  </div>
                </div>
              )
            )}

            {/* User Profile Avatar & Sign Out */}
            {user ? (
              <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                <button
                  onClick={() => handleNavClick(isAdmin ? 'admin' : 'profile')}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border transition-all flex-shrink-0 cursor-pointer ${
                    isAdmin
                      ? 'bg-gradient-to-tr from-amber-600 to-amber-700 text-white border-amber-400 shadow-md'
                      : currentTab === 'profile'
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                  }`}
                  title={`${user.name} (${user.email})`}
                >
                  {user.name.charAt(0).toUpperCase()}
                </button>

                <button
                  onClick={logout}
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-xl transition-colors flex-shrink-0 cursor-pointer"
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('login')}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors whitespace-nowrap flex-shrink-0 cursor-pointer"
              >
                Sign In
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg focus:outline-none flex-shrink-0 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200 shadow-2xl">
          {/* PrepPilot Voice Feature Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/90 via-slate-900 to-indigo-950/90 border border-cyan-500/30 shadow-lg flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex-shrink-0">
                <Mic size={18} className={isListening ? 'text-red-400 animate-bounce' : 'text-cyan-400'} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Ask PrepPilot</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Voice AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 truncate">
                  Ask viva & technical interview questions
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenVoice}
              className="flex-shrink-0 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
            >
              <Sparkles size={13} />
              <span>Launch</span>
            </button>
          </div>

          {/* User Status in Mobile Menu */}
          {user && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                  isAdmin ? 'bg-amber-600' : 'bg-indigo-600'
                }`}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">{user.name}</span>
                  <span className="text-[10px] text-slate-400 truncate block">
                    {isAdmin ? 'Placement Dean (Administrator)' : user.email}
                  </span>
                </div>
              </div>

              {isAdmin ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Dean Office
                </span>
              ) : (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[11px] font-bold">
                    <Flame size={12} className="fill-amber-400" />
                    <span>{user.current_streak}d</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-[11px] font-bold">
                    <Zap size={12} />
                    <span>{user.total_xp} XP</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Nav Links */}
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? link.id === 'admin'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                        : 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} />
                    <span>{link.label}</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-500" />
                </button>
              );
            })}

            {user && (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
