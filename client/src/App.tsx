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

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activeQuizSession, setActiveQuizSession] = useState<QuizSession | null>(null);

  React.useEffect(() => {
    if (user && user.role === 'ADMIN' && currentTab === 'dashboard') {
      setCurrentTab('admin');
    }
  }, [user]);

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
          onSuccess={() => setCurrentTab('dashboard')}
          onGoToLogin={() => setCurrentTab('login')}
        />
      );
    }
    if (currentTab === 'login') {
      return (
        <LoginPage
          onSuccess={(role) => setCurrentTab(role === 'ADMIN' ? 'admin' : 'dashboard')}
          onGoToRegister={() => setCurrentTab('register')}
        />
      );
    }
    return (
      <LandingPage
        onStartPreparing={() => setCurrentTab('register')}
        onExploreFeatures={() => {
          const el = document.getElementById('features');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onLogin={() => setCurrentTab('login')}
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
    <AppLayout currentTab={currentTab} onSelectTab={setCurrentTab}>
      {/* Routed Workspace Tab Rendering */}
      {currentTab === 'quiz_active' && activeQuizSession ? (
        <QuizPage
          quizSession={activeQuizSession}
          onFinish={() => {
            setActiveQuizSession(null);
            setCurrentTab('dashboard');
          }}
          onRetake={() => {
            setActiveQuizSession(null);
            handleLaunchAdaptiveDailyQuiz();
          }}
        />
      ) : currentTab === 'dashboard' ? (
        <DashboardPage
          onStartAdaptiveQuiz={handleLaunchAdaptiveDailyQuiz}
          onStartCustomQuiz={() => setCurrentTab('custom-practice')}
          onExploreCompanies={() => setCurrentTab('companies')}
          onViewAnalytics={() => setCurrentTab('analytics')}
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
        <AssessmentPage onReturnToDashboard={() => setCurrentTab('dashboard')} />
      ) : currentTab === 'companies' ? (
        <CompanyPrepPage onStartCompanyQuiz={handleLaunchCompanyQuiz} />
      ) : currentTab === 'analytics' ? (
        <AnalyticsPage />
      ) : currentTab === 'preppilot-studio' ? (
        <PrepPilotPage />
      ) : currentTab === 'admin' ? (
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
          onStartCustomQuiz={() => setCurrentTab('custom-practice')}
          onStartAssessment={() => setCurrentTab('assessment')}
          onExploreCompanies={() => setCurrentTab('companies')}
          onViewAnalytics={() => setCurrentTab('analytics')}
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
