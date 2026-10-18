import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { PrepPilotLogo } from '../Logo';
import {
  LayoutDashboard,
  Sparkles,
  Code2,
  ShieldCheck,
  Building2,
  Sliders,
  BarChart3,
  Bot,
  Mic,
  Shield,
  ChevronLeft,
  ChevronRight,
  X,
  Users,
  HelpCircle,
  Award,
  TrendingUp,
  FileSpreadsheet,
  GraduationCap,
  BookOpen,
  BarChart2
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile
}) => {
  const { isAdmin, isDean } = useAuth();

  let navSections = [];

  if (isAdmin) {
    navSections = [
      {
        title: 'Platform Governance',
        items: [
          { id: 'admin-overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'admin-students', label: 'Students', icon: Users },
          { id: 'admin-questions', label: 'Question Bank', icon: HelpCircle },
          { id: 'admin-assessments', label: 'Assessments', icon: Award },
          { id: 'admin-analytics', label: 'Platform Analytics', icon: TrendingUp },
          { id: 'admin-users', label: 'User Management', icon: Shield }
        ]
      }
    ];
  } else if (isDean) {
    navSections = [
      {
        title: 'Academic Oversight',
        items: [
          { id: 'dean-overview', label: 'Academic Overview', icon: BarChart2 },
          { id: 'dean-departments', label: 'Department Analytics', icon: Building2 },
          { id: 'dean-performance', label: 'Student Performance', icon: GraduationCap },
          { id: 'dean-assessments', label: 'Assessments', icon: Award },
          { id: 'dean-subjects', label: 'Subject Analytics', icon: BookOpen },
          { id: 'dean-reports', label: 'Academic Reports', icon: FileSpreadsheet }
        ]
      }
    ];
  } else {
    navSections = [
      {
        title: 'Workspace',
        items: [
          { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
          { id: 'adaptive-quiz', label: 'Adaptive Quiz', icon: Sparkles },
          { id: 'coding-practice', label: 'Coding Practice', icon: Code2 },
          { id: 'assessment', label: 'Placement Tests', icon: ShieldCheck }
        ]
      },
      {
        title: 'Preparation',
        items: [
          { id: 'companies', label: 'Company Prep', icon: Building2 },
          { id: 'custom-practice', label: 'Custom Revision', icon: Sliders }
        ]
      },
      {
        title: 'Insights',
        items: [
          { id: 'analytics', label: 'Performance Analytics', icon: BarChart3 }
        ]
      },
      {
        title: 'Assistance',
        items: [
          { id: 'thinking-orb', label: 'PrepPilot AI Mentor', icon: Bot },
          { id: 'preppilot-studio', label: 'Voice AI Studio', icon: Mic }
        ]
      }
    ];
  }

  const handleItemClick = (tabId: string) => {
    onSelectTab(tabId);
    onCloseMobile();
  };

  const defaultHomeTab = isAdmin ? 'admin-overview' : isDean ? 'dean-overview' : 'dashboard';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[var(--surface-card)] border-r border-[var(--surface-border)] select-none">
      {/* Brand Header */}
      <div className={`flex items-center h-16 px-4 border-b border-[var(--surface-border)] ${
        isCollapsed ? 'justify-center' : 'justify-between'
      }`}>
        <button
          onClick={() => handleItemClick(defaultHomeTab)}
          className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg cursor-pointer"
        >
          <PrepPilotLogo size="sm" showText={false} />
          {!isCollapsed && (
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-[var(--text-primary)]">
              PrepPilot <span className="text-indigo-400">AI</span>
            </span>
          )}
        </button>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>

        {/* Desktop collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5" aria-label="Main Navigation">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {section.title}
              </h3>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id ||
                  (isAdmin && currentTab === 'admin' && item.id === 'admin-overview') ||
                  (isDean && currentTab === 'dean' && item.id === 'dean-overview');
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[var(--primary-accent-subtle)] text-indigo-400 border border-indigo-500/30 font-bold shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`}
                  >
                    <Icon size={17} className={`flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-[var(--text-secondary)]'}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Info */}
      {!isCollapsed && (
        <div className="p-3 border-t border-[var(--surface-border)] text-[11px] text-[var(--text-muted)] flex items-center justify-between">
          <span>SPPU Placement Ready</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-[var(--surface-elevated)] border border-[var(--surface-border)]">
            v2.5
          </span>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden lg:block sticky top-0 h-screen transition-all duration-200 z-30 flex-shrink-0 ${
          isCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (with backdrop) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
