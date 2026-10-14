import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VoiceProvider } from './context/VoiceContext';
import { ThemeProvider } from './context/ThemeContext';
import AppLayout from './components/layout/AppLayout';
import PrepPilotVoiceModal from './components/PrepPilotVoiceModal';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import QuizPage from './pages/QuizPage';
import CustomPracticePage from './pages/CustomPracticePage';
import CompanyPrepPage from './pages/CompanyPrepPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PrepPilotPage from './pages/PrepPilotPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProfilePage from './pages/ProfilePage';
import CodingPracticePage from './pages/CodingPracticePage';
import AssessmentPage from './pages/AssessmentPage';
const ThinkingOrbPage = React.lazy(() => import('./pages/ThinkingOrbPage'));
import api from './services/api';
import type { QuizSession } from './types';

const VALID_TABS = new Set([
  'dashboard',
  'adaptive-quiz',
  'coding-practice',
  'assessment',
  'companies',
  'custom-practice',
  'analytics',
  'preppilot-studio',
  'admin',
  'profile',
  'thinking-orb',
  'quiz_active',
  'login',
  'register'
]);

const getTabFromHash = (): string => {
  if (typeof window === 'undefined') return 'dashboard';
  const clean = window.location.hash.replace(/^#\/?/, '').trim();
  return VALID_TABS.has(clean) ? clean : 'dashboard';
};

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>(() => getTabFromHash());
  const [activeQuizSession, setActiveQuizSession] = useState<QuizSession | null>(null);

  // Synchronize hash with back/forward history navigation
  React.useEffect(() => {
    const handleHashChange = () => {
      let target = getTabFromHash();
      if (user?.role === 'STUDENT' && target === 'admin') {
        target = 'dashboard';
        window.location.hash = '#/dashboard';
      } else if (user?.role === 'ADMIN' && (target === 'dashboard' || target === 'login' || target === 'register')) {
        target = 'admin';
        window.location.hash = '#/admin';
      }
      setCurrentTab(target);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [user]);

  const handleSelectTab = (tab: string) => {
    // Role-based security routing:
    // If student attempts to access admin, strictly force to dashboard
    if (user?.role === 'STUDENT' && tab === 'admin') {
      tab = 'dashboard';
    }
    // If admin is at student dashboard, default to admin panel
    if (user?.role === 'ADMIN' && tab === 'dashboard') {
      tab = 'admin';
    }
    setCurrentTab(tab);
    if (tab !== 'quiz_active') {
      window.location.hash = `#/${tab}`;
    }
  };

  // Strict role-based landing and route protection
  React.useEffect(() => {
    if (!user) return;
    if (user.role === 'ADMIN') {
      // Admin accounts MUST open admin panel on login or if on student dashboard
      if (currentTab === 'dashboard' || currentTab === 'login' || currentTab === 'register') {
        handleSelectTab('admin');
      }
    } else if (user.role === 'STUDENT') {
      // Student accounts MUST open student dashboard on login and NEVER access admin panel
      if (currentTab === 'admin' || currentTab === 'login' || currentTab === 'register') {
        handleSelectTab('dashboard');
      }
    }
  }, [user, currentTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[var(--text-secondary)]">Loading PrepPilot...</span>
        </div>
      </div>
    );
  }

  // If not authenticated
  if (!user) {
    if (currentTab === 'register') {
      return (
        <RegisterPage
          onSuccess={() => handleSelectTab('dashboard')}
          onGoToLogin={() => handleSelectTab('login')}
        />
      );
    }
    if (currentTab === 'login') {
      return (
        <LoginPage
          onSuccess={(role) => handleSelectTab(role === 'ADMIN' ? 'admin' : 'dashboard')}
          onGoToRegister={() => handleSelectTab('register')}
        />
      );
    }
    return (
      <LandingPage
        onStartPreparing={() => handleSelectTab('register')}
        onExploreFeatures={() => {
          const el = document.getElementById('features');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onLogin={() => handleSelectTab('login')}
      />
    );
  }

  // Trigger Adaptive Daily Quiz
  const handleLaunchAdaptiveDailyQuiz = async () => {
    try {
      const res = await api.startAdaptiveDailyQuiz(5);
      if (res.success && res.quiz) {
        setActiveQuizSession(res.quiz);
        setCurrentTab('quiz_active');
      }
    } catch (err) {
      console.error('Error starting adaptive quiz:', err);
    }
  };

  // Launch Company-oriented Quiz
  const handleLaunchCompanyQuiz = async (companyId: string) => {
    try {
      const res = await api.startCustomQuiz({ company_id: companyId, question_count: 5 });
      if (res.success && res.quiz) {
        setActiveQuizSession(res.quiz);
        setCurrentTab('quiz_active');
      }
    } catch (err) {
      console.error('Error starting company quiz:', err);
    }
  };

  return (
    <AppLayout currentTab={currentTab} onSelectTab={handleSelectTab}>
      {/* Routed Workspace Tab Rendering */}
      {currentTab === 'quiz_active' && activeQuizSession ? (
        <QuizPage
          quizSession={activeQuizSession}
          onFinish={() => {
            setActiveQuizSession(null);
            handleSelectTab('dashboard');
          }}
          onRetake={() => {
            setActiveQuizSession(null);
            handleLaunchAdaptiveDailyQuiz();
          }}
        />
      ) : currentTab === 'dashboard' ? (
        <DashboardPage
          onStartAdaptiveQuiz={handleLaunchAdaptiveDailyQuiz}
          onStartCustomQuiz={() => handleSelectTab('custom-practice')}
          onStartAssessment={() => handleSelectTab('assessment')}
          onExploreCompanies={() => handleSelectTab('companies')}
          onViewAnalytics={() => handleSelectTab('analytics')}
        />
      ) : currentTab === 'adaptive-quiz' ? (
        <div className="max-w-4xl mx-auto py-8 text-center space-y-6">
          <div className="p-8 sm:p-10 rounded-3xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xl space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              AI Recommendation Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
              Adaptive Daily Quiz
            </h2>
            <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
              The recommendation engine has synthesized your weak topics, recent attempts, target companies, and branch curriculum into a tailored 5-question test.
            </p>
            <div className="pt-2">
              <button
                onClick={handleLaunchAdaptiveDailyQuiz}
                className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                Launch Personalized Daily Quiz
              </button>
            </div>
          </div>
        </div>
      ) : currentTab === 'custom-practice' ? (
        <CustomPracticePage
          onStartQuiz={(session) => {
            setActiveQuizSession(session);
            setCurrentTab('quiz_active');
          }}
        />
      ) : currentTab === 'coding-practice' ? (
        <CodingPracticePage />
      ) : currentTab === 'assessment' ? (
        <AssessmentPage onReturnToDashboard={() => handleSelectTab('dashboard')} />
      ) : currentTab === 'companies' ? (
        <CompanyPrepPage 
          onStartCompanyQuiz={handleLaunchCompanyQuiz} 
          onNavigateToCoding={() => handleSelectTab('coding-practice')}
        />
      ) : currentTab === 'analytics' ? (
        <AnalyticsPage onNavigateToCoding={() => handleSelectTab('coding-practice')} />
      ) : currentTab === 'preppilot-studio' ? (
        <PrepPilotPage />
      ) : currentTab === 'admin' && user?.role === 'ADMIN' ? (
        <AdminDashboardPage />
      ) : currentTab === 'profile' ? (
        <ProfilePage />
      ) : currentTab === 'thinking-orb' ? (
        <React.Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-sm text-[var(--text-secondary)]">Loading PrepPilot…</div>}>
          <ThinkingOrbPage />
        </React.Suspense>
      ) : (
        <DashboardPage
          onStartAdaptiveQuiz={handleLaunchAdaptiveDailyQuiz}
          onStartCustomQuiz={() => handleSelectTab('custom-practice')}
          onStartAssessment={() => handleSelectTab('assessment')}
          onExploreCompanies={() => handleSelectTab('companies')}
          onViewAnalytics={() => handleSelectTab('analytics')}
          onNavigateToCoding={() => handleSelectTab('coding-practice')}
        />
      )}

      {/* Global Interactive PrepPilot Voice Modal */}
      <PrepPilotVoiceModal />
    </AppLayout>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <VoiceProvider>
          <MainApp />
        </VoiceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
