import React, { useState } from 'react';
import Sidebar from './Sidebar';
import AppHeader from './AppHeader';

interface AppLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentTab,
  onSelectTab,
  children
}) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('preppilot_sidebar_collapsed') === 'true';
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleToggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('preppilot_sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen flex w-full bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main App Workspace */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <AppHeader
          currentTab={currentTab}
          onSelectTab={onSelectTab}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
        />

        {/* Routed Content Area with subtle entrance motion */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-150">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
