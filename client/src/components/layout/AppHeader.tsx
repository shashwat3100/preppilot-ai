import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useVoice } from '../../context/VoiceContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Menu,
  Flame,
  Zap,
  Mic,
  Sun,
  Moon,
  Monitor,
  User,
  LogOut,
  ChevronDown,
  Shield,
  Sparkles
} from 'lucide-react';

interface AppHeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenMobileMenu: () => void;
}

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Placement readiness & daily priorities' },
  'adaptive-quiz': { title: 'Adaptive Daily Quiz', subtitle: 'Personalized syllabus question generator' },
  'quiz_active': { title: 'Active Assessment', subtitle: 'Timed multiple choice session' },
  'coding-practice': { title: 'Coding Practice', subtitle: 'Algorithmic challenges with compiler & test cases' },
  assessment: { title: 'Placement Mock Test', subtitle: 'Comprehensive company screening simulator' },
  companies: { title: 'Company Preparation', subtitle: 'Tier-1 IT drive patterns and hiring rubrics' },
  'custom-practice': { title: 'Custom Revision', subtitle: 'Targeted topic selection & weakness drills' },
  analytics: { title: 'Performance Analytics', subtitle: 'Subject mastery, accuracy trends, and readiness' },
  'thinking-orb': { title: 'PrepPilot AI Mentor', subtitle: 'Syllabus grounded technical placement copilot' },
  'preppilot-studio': { title: 'Voice AI Studio', subtitle: 'Interactive spoken technical interview practice' },
  profile: { title: 'Student Profile', subtitle: 'Academic records, target companies, and credentials' },
  admin: { title: 'Administration Panel', subtitle: 'Question bank, student oversight, and analytics' }
};

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenMobileMenu
}) => {
  const { user, logout, isAdmin } = useAuth();
  const { openVoiceModal, isListening, isSpeaking } = useVoice();
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pageInfo = TAB_TITLES[currentTab] || { title: 'PrepPilot', subtitle: 'Placement Preparation Platform' };

  return (
    <header className="sticky top-0 z-20 h-16 w-full bg-[var(--surface-card)] border-b border-[var(--surface-border)] px-4 sm:px-6 flex items-center justify-between gap-3 shadow-xs">
      {/* Left Area: Mobile Drawer Toggle + Page Context */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors focus:outline-none"
          aria-label="Open sidebar navigation"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-bold text-[var(--text-primary)] tracking-tight truncate">
            {pageInfo.title}
          </h1>
          <p className="text-[11px] text-[var(--text-muted)] truncate hidden md:block">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right Area: Structured & Compact Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
        {/* Streak Indicator (Compact) */}
        {user?.current_streak !== undefined && user.current_streak > 0 && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-semibold"
            title={`${user.current_streak} Day Practice Streak`}
          >
            <Flame size={13} className="text-amber-500 flex-shrink-0" />
            <span>{user.current_streak}d</span>
          </div>
        )}

        {/* XP Badge (Compact) */}
        {user?.total_xp !== undefined && (
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold"
            title={`${user.total_xp} Total Experience Points (Level ${user.current_level || 1})`}
          >
            <Zap size={13} className="text-indigo-400 flex-shrink-0" />
            <span>{user.total_xp} XP</span>
          </div>
        )}

        {/* Voice Assistant Shortcut Button */}
        <button
          onClick={openVoiceModal}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
            isListening || isSpeaking
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
              : 'bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] border-[var(--surface-border)]'
          }`}
          title="Open Voice Assistant"
          aria-label="Launch voice assistant"
        >
          <Mic size={14} className={isListening ? 'text-rose-400' : 'text-indigo-400'} />
          <span className="hidden md:inline">Voice AI</span>
        </button>

        {/* Theme Mode Toggle (Sun/Moon cycle) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] transition-colors cursor-pointer"
          title={`Active theme: ${theme}. Click to switch.`}
          aria-label="Toggle light or dark theme"
        >
          {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 pl-1.5 sm:pr-2.5 rounded-full hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] transition-all cursor-pointer focus:outline-none"
            aria-expanded={isProfileOpen}
            aria-label="Open profile menu"
          >
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User size={14} />}
            </div>
            <span className="text-xs font-semibold text-[var(--text-primary)] hidden md:inline max-w-[100px] truncate">
              {user?.name?.split(' ')[0] || 'Student'}
            </span>
            <ChevronDown size={13} className="text-[var(--text-muted)] hidden md:inline" />
          </button>

          {/* Profile Menu Popover */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-[var(--surface-border)] mb-1">
                <div className="font-bold text-xs text-[var(--text-primary)] truncate">
                  {user?.name || 'Engineering Student'}
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] truncate">
                  {user?.email}
                </div>
                {user?.job_role_title && (
                  <div className="mt-1.5 text-[10px] px-2 py-0.5 rounded bg-[var(--surface-elevated)] text-indigo-400 border border-[var(--surface-border)] inline-block font-semibold">
                    Target: {user.job_role_title}
                  </div>
                )}
              </div>

              {/* Theme Sub-menu */}
              <div className="px-3 py-2 border-b border-[var(--surface-border)] mb-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                  Appearance
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
                      theme === 'dark'
                        ? 'bg-indigo-600 text-white'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    <Moon size={13} />
                    <span>Dark</span>
                  </button>
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
                      theme === 'light'
                        ? 'bg-indigo-600 text-white'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    <Sun size={13} />
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => setTheme('system')}
                    className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
                      theme === 'system'
                        ? 'bg-indigo-600 text-white'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    <Monitor size={13} />
                    <span>System</span>
                  </button>
                </div>
              </div>

              {/* Links */}
              <button
                onClick={() => {
                  onSelectTab('profile');
                  setIsProfileOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
              >
                <User size={14} className="text-indigo-400" />
                <span>My Profile</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => {
                    onSelectTab('admin');
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-400 hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
                >
                  <Shield size={14} className="text-amber-400" />
                  <span>Admin Dashboard</span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer mt-1"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
