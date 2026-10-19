import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Shield,
  Users,
  HelpCircle,
  TrendingUp,
  CheckCircle2,
  Plus,
  Trash2,
  Edit2,
  Building2,
  BookOpen,
  AlertTriangle,
  Search,
  Ban,
  UserX,
  BarChart2,
  Award,
  Zap,
  Flame,
  Clock,
  Sparkles,
  X,
  AlertCircle,
  RefreshCw,
  GraduationCap,
  KeyRound,
  UserPlus,
  ShieldCheck,
  Check,
  Copy,
  Sliders,
  Code2,
  Briefcase
} from 'lucide-react';

interface AdminDashboardPageProps {
  currentTab?: string;
  onNavigateTab?: (tab: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  currentTab = 'admin-overview',
  onNavigateTab
}) => {
  // Navigation section: 'admin-overview' | 'admin-students' | 'admin-questions' | 'admin-assessments' | 'admin-analytics' | 'admin-users'
  const [activeSection, setActiveSection] = useState<string>(() => {
    if (currentTab.startsWith('admin-')) return currentTab;
    return 'admin-overview';
  });

  useEffect(() => {
    if (currentTab && currentTab.startsWith('admin-')) {
      setActiveSection(currentTab);
    }
  }, [currentTab]);

  const setSection = (sec: string) => {
    setActiveSection(sec);
    if (onNavigateTab) {
      onNavigateTab(sec);
    } else if (typeof window !== 'undefined') {
      window.location.hash = `#/${sec}`;
    }
  };

  // State
  const [overview, setOverview] = useState<any | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Student Filter & Search
  const [studentSearch, setStudentSearch] = useState('');
  const [studentFilter, setStudentFilter] = useState<'all' | 'new' | 'active' | 'blocked' | 'placed' | 'not_placed'>('all');
  const [studentSort, setStudentSort] = useState<'default' | 'newest' | 'xp' | 'accuracy' | 'name'>('default');

  // Placement Assignment Modal State
  const [showPlacementModal, setShowPlacementModal] = useState(false);
  const [placementStudent, setPlacementStudent] = useState<any | null>(null);
  const [placementStatus, setPlacementStatus] = useState<'PLACED' | 'NOT_PLACED'>('PLACED');
  const [placedCompany, setPlacedCompany] = useState('');
  const [placementPackage, setPlacementPackage] = useState('');
  const [placedDate, setPlacedDate] = useState('');
  const [savingPlacement, setSavingPlacement] = useState(false);

  // Student Dossier Modal
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentDossier, setStudentDossier] = useState<any | null>(null);
  const [loadingDossier, setLoadingDossier] = useState(false);

  // Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    onConfirm: async () => { }
  });

  // Question Filter & Search
  const [questionSearch, setQuestionSearch] = useState('');
  const [questionSubjectFilter, setQuestionSubjectFilter] = useState('all');
  const [questionDifficultyFilter, setQuestionDifficultyFilter] = useState('all');

  // Question Create / Edit Modal
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [qPrompt, setQPrompt] = useState('');
  const [qSubjectId, setQSubjectId] = useState('');
  const [qTopicId, setQTopicId] = useState('');
  const [qCompanyId, setQCompanyId] = useState('');
  const [qDifficulty, setQDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [qCorrect, setQCorrect] = useState('A');
  const [qExplanation, setQExplanation] = useState('');
  const [qOptA, setQOptA] = useState('');
  const [qOptB, setQOptB] = useState('');
  const [qOptC, setQOptC] = useState('');
  const [qOptD, setQOptD] = useState('');
  const [savingQuestion, setSavingQuestion] = useState(false);

  // Staff / Faculty Appoint Modal
  const [showAppointModal, setShowAppointModal] = useState(false);
  const [appointName, setAppointName] = useState('');
  const [appointEmail, setAppointEmail] = useState('');
  const [appointPassword, setAppointPassword] = useState('DeanPass123');
  const [appointRole, setAppointRole] = useState<'DEAN' | 'ADMIN'>('DEAN');
  const [appointDepartment, setAppointDepartment] = useState('Academic & Placement Governance');
  const [appointDesignation, setAppointDesignation] = useState('Dean');
  const [appointLoading, setAppointLoading] = useState(false);

  // Invitation Token Generator State
  const [issuedToken, setIssuedToken] = useState<string | null>(null);
  const [tokenCopied, setTokenCopied] = useState(false);
  const [generatingToken, setGeneratingToken] = useState(false);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [oRes, qRes, sRes, fRes, compRes, subjRes, topRes] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminQuestions(),
        api.getAdminStudents({ filter: studentFilter, search: studentSearch, sort: studentSort }),
        api.getFaculty(),
        api.getCompanies(),
        api.getSubjects(),
        api.getTopics()
      ]);

      if (oRes && oRes.success) {
        const data = oRes.overview || oRes.stats || oRes.data || {};
        setOverview({
          total_students: data.total_students ?? 0,
          active_students_7d: data.active_students_7d ?? data.active_students ?? 0,
          blocked_students: data.blocked_students ?? 0,
          total_questions: data.total_questions ?? 0,
          total_sessions: data.total_sessions ?? data.completed_quizzes ?? 0,
          assessment_completion_rate: data.assessment_completion_rate ?? data.quiz_completion_rate ?? 100,
          total_attempts: data.total_attempts ?? 0,
          total_coding_submissions: data.total_coding_submissions ?? 0,
          coding_acceptance_rate: data.coding_acceptance_rate ?? 0,
          ...data
        });
      }
      if (qRes && qRes.success) setQuestions(qRes.questions || []);
      if (sRes && sRes.success) setStudents(sRes.students || []);
      if (fRes && fRes.success) setFacultyList(fRes.faculty || []);
      if (compRes && compRes.success) setCompanies(compRes.companies || []);
      if (subjRes && subjRes.success) setSubjects(subjRes.subjects || []);
      if (topRes && topRes.success) setTopics(topRes.topics || []);
    } catch (err: any) {
      console.error('[Admin Data Load Error]:', err);
      setError(err?.message || 'Network error retrieving administrative data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Debounced student list refresh on search/filter changes
  useEffect(() => {
    if (!loading) {
      api.getAdminStudents({ filter: studentFilter, search: studentSearch, sort: studentSort })
        .then(res => {
          if (res && res.success) setStudents(res.students || []);
        })
        .catch(err => console.error('Student filter error:', err));
    }
  }, [studentFilter, studentSearch, studentSort]);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setActionFeedback({ message, type });
    setTimeout(() => setActionFeedback(null), 4000);
  };

  // Student Actions
  const handleToggleBlock = (student: any) => {
    const isCurrentlyBlocked = student.is_blocked || student.status === 'BLOCKED';
    const action = isCurrentlyBlocked ? 'unblock and reinstate' : 'suspend';

    setConfirmDialog({
      isOpen: true,
      title: `${isCurrentlyBlocked ? 'Reinstate' : 'Suspend'} Student Account`,
      message: `Are you sure you want to ${action} account access for ${student.name} (${student.email})?`,
      confirmLabel: isCurrentlyBlocked ? 'Reinstate Account' : 'Suspend Account',
      onConfirm: async () => {
        try {
          const res = await api.updateStudentStatus(student.id, !isCurrentlyBlocked);
          if (res && res.success) {
            showFeedback(res.message || `Student account status updated.`);
            // Update local student row
            setStudents(prev => prev.map(s => s.id === student.id ? { ...s, is_blocked: !isCurrentlyBlocked, status: !isCurrentlyBlocked ? 'BLOCKED' : 'ACTIVE' } : s));
          } else {
            showFeedback(res?.message || 'Failed to update student status.', 'error');
          }
        } catch (err: any) {
          showFeedback('Error updating student status.', 'error');
        }
      }
    });
  };

  const handleDeleteStudent = (student: any) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Purge Student Profile',
      message: `Are you sure you want to permanently delete ${student.name}'s profile? All performance history and quiz attempts will be erased. This action cannot be undone.`,
      confirmLabel: 'Permanently Purge',
      onConfirm: async () => {
        try {
          const res = await api.deleteStudent(student.id);
          if (res && res.success) {
            showFeedback(res.message || 'Student account purged successfully.');
            setStudents(prev => prev.filter(s => s.id !== student.id));
          } else {
            showFeedback(res?.message || 'Failed to delete student.', 'error');
          }
        } catch (err: any) {
          showFeedback('Error deleting student.', 'error');
        }
      }
    });
  };

  const handleOpenDossier = async (studentId: string) => {
    setSelectedStudentId(studentId);
    setLoadingDossier(true);
    try {
      const res = await api.getStudentProgress(studentId);
      if (res && res.success) {
        setStudentDossier(res.progress);
      }
    } catch (err) {
      console.error('Error fetching dossier:', err);
    } finally {
      setLoadingDossier(false);
    }
  };

  const handleOpenPlacementModal = (st: any) => {
    setPlacementStudent(st);
    setPlacementStatus(st.placement_status === 'PLACED' ? 'PLACED' : 'NOT_PLACED');
    setPlacedCompany(st.placed_company || (st.target_companies && st.target_companies[0]) || 'Tata Consultancy Services (TCS)');
    setPlacementPackage(st.placement_package || '7.5 LPA');
    setPlacedDate(st.placed_date || new Date().toISOString().split('T')[0]);
    setShowPlacementModal(true);
  };

  const handleSavePlacement = async () => {
    if (!placementStudent) return;
    setSavingPlacement(true);
    try {
      const res = await api.updateStudentPlacement(placementStudent.id, {
        placement_status: placementStatus,
        is_placed: placementStatus === 'PLACED',
        placed_company: placementStatus === 'PLACED' ? placedCompany.trim() : '',
        placement_package: placementStatus === 'PLACED' ? placementPackage.trim() : '',
        placed_date: placementStatus === 'PLACED' ? placedDate : ''
      });

      if (res && res.success) {
        showFeedback(res.message || `Updated placement status for ${placementStudent.name}.`);
        // Update local student in list optimistically
        setStudents(prev => prev.map(s => {
          if (s.id === placementStudent.id) {
            return {
              ...s,
              placement_status: placementStatus,
              is_placed: placementStatus === 'PLACED',
              placed_company: placementStatus === 'PLACED' ? placedCompany.trim() : null,
              placement_package: placementStatus === 'PLACED' ? placementPackage.trim() : null,
              placed_date: placementStatus === 'PLACED' ? placedDate : null
            };
          }
          return s;
        }));

        // Also update student in dossier if open
        if (studentDossier && studentDossier.student && studentDossier.student.id === placementStudent.id) {
          setStudentDossier((prev: any) => ({
            ...prev,
            student: {
              ...prev.student,
              placement_status: placementStatus,
              is_placed: placementStatus === 'PLACED',
              placed_company: placementStatus === 'PLACED' ? placedCompany.trim() : null,
              placement_package: placementStatus === 'PLACED' ? placementPackage.trim() : null,
              placed_date: placementStatus === 'PLACED' ? placedDate : null
            }
          }));
        }

        setShowPlacementModal(false);

        // Refresh overview stats
        api.getAdminOverview().then(oRes => {
          if (oRes && oRes.success) {
            setOverview(oRes.overview || oRes.stats || oRes.data || {});
          }
        });
      } else {
        showFeedback(res?.message || 'Failed to update placement status.', 'error');
      }
    } catch (err: any) {
      showFeedback('Error updating placement status: ' + err.message, 'error');
    } finally {
      setSavingPlacement(false);
    }
  };

  // Question Actions
  const handleOpenCreateQuestion = () => {
    setEditingQuestionId(null);
    setQPrompt('');
    setQSubjectId(subjects[0]?.id || '');
    setQTopicId(topics[0]?.id || '');
    setQCompanyId('');
    setQDifficulty('Medium');
    setQCorrect('A');
    setQExplanation('');
    setQOptA('');
    setQOptB('');
    setQOptC('');
    setQOptD('');
    setShowQuestionModal(true);
  };

  const handleOpenEditQuestion = (q: any) => {
    setEditingQuestionId(q.id);
    setQPrompt(q.question || '');
    setQSubjectId(q.subject_id || subjects[0]?.id || '');
    setQTopicId(q.topic_id || topics[0]?.id || '');
    setQCompanyId(q.company_id || '');
    setQDifficulty(q.difficulty || 'Medium');
    setQCorrect(q.correct_answer || 'A');
    setQExplanation(q.explanation || '');

    const opts = q.options || [];
    setQOptA(opts.find((o: any) => o.option_key === 'A')?.option_text || '');
    setQOptB(opts.find((o: any) => o.option_key === 'B')?.option_text || '');
    setQOptC(opts.find((o: any) => o.option_key === 'C')?.option_text || '');
    setQOptD(opts.find((o: any) => o.option_key === 'D')?.option_text || '');
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qPrompt.trim() || !qSubjectId || !qTopicId) {
      alert('Prompt, subject, and topic are required.');
      return;
    }

    setSavingQuestion(true);
    const options = [
      { option_key: 'A', option_text: qOptA.trim() },
      { option_key: 'B', option_text: qOptB.trim() },
      { option_key: 'C', option_text: qOptC.trim() },
      { option_key: 'D', option_text: qOptD.trim() }
    ].filter(o => o.option_text);

    const payload = {
      question: qPrompt.trim(),
      question_type: 'MCQ',
      subject_id: qSubjectId,
      topic_id: qTopicId,
      company_id: qCompanyId || null,
      difficulty: qDifficulty,
      correct_answer: qCorrect,
      explanation: qExplanation.trim(),
      options
    };

    try {
      if (editingQuestionId) {
        const res = await api.updateQuestion(editingQuestionId, payload);
        if (res && res.success) {
          showFeedback('Question updated successfully.');
          setShowQuestionModal(false);
          const qListRes = await api.getAdminQuestions();
          if (qListRes.success) setQuestions(qListRes.questions || []);
        } else {
          alert(res?.message || 'Failed to update question.');
        }
      } else {
        const res = await api.createQuestion(payload);
        if (res && res.success) {
          showFeedback('Question created successfully.');
          setShowQuestionModal(false);
          const qListRes = await api.getAdminQuestions();
          if (qListRes.success) setQuestions(qListRes.questions || []);
        } else {
          alert(res?.message || 'Failed to create question.');
        }
      }
    } catch (err: any) {
      alert('Error saving question: ' + err.message);
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleDeleteQuestion = (q: any) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Question',
      message: `Are you sure you want to delete this question from the bank? "${q.question.substring(0, 60)}..."`,
      confirmLabel: 'Delete Question',
      onConfirm: async () => {
        try {
          const res = await api.deleteQuestion(q.id);
          if (res && res.success) {
            showFeedback('Question removed from question bank.');
            setQuestions(prev => prev.filter(item => item.id !== q.id));
          } else {
            showFeedback(res?.message || 'Failed to delete question.', 'error');
          }
        } catch (err: any) {
          showFeedback('Error deleting question.', 'error');
        }
      }
    });
  };

  // Staff / Faculty Actions
  const handleAppointStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppointLoading(true);
    try {
      const res = await api.appointFaculty({
        name: appointName.trim(),
        email: appointEmail.trim(),
        password: appointPassword,
        role: appointRole,
        designation: appointDesignation || (appointRole === 'ADMIN' ? 'Administrator' : 'Dean'),
        department: appointDepartment
      });

      if (res && res.success) {
        showFeedback(res.message || `${appointName} appointed successfully.`);
        setShowAppointModal(false);
        setAppointName('');
        setAppointEmail('');
        const fRes = await api.getFaculty();
        if (fRes && fRes.success) setFacultyList(fRes.faculty || []);
      } else {
        alert(res?.message || 'Failed to appoint staff member.');
      }
    } catch (err: any) {
      alert('Error appointing staff: ' + err.message);
    } finally {
      setAppointLoading(false);
    }
  };

  const handleRevokeStaff = (f: any) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Revoke Privileges',
      message: `Are you sure you want to revoke ${f.role} credentials for ${f.name} (${f.email})? Their account will be converted to a regular student profile.`,
      confirmLabel: 'Revoke Credentials',
      onConfirm: async () => {
        try {
          const res = await api.revokeFaculty(f.id);
          if (res && res.success) {
            showFeedback(res.message || 'Credentials revoked.');
            setFacultyList(prev => prev.filter(item => item.id !== f.id));
          } else {
            showFeedback(res?.message || 'Failed to revoke credentials.', 'error');
          }
        } catch (err: any) {
          showFeedback('Error revoking credentials.', 'error');
        }
      }
    });
  };

  const handleGenerateInviteToken = async () => {
    setGeneratingToken(true);
    setIssuedToken(null);
    setTokenCopied(false);
    try {
      const res = await api.generateAdminInviteToken({
        designation: 'Dean',
        expiresInHours: 48
      });
      if (res && res.success) {
        setIssuedToken(res.token);
        showFeedback('Single-use invitation token issued.');
      } else {
        showFeedback(res?.message || 'Failed to issue invitation token.', 'error');
      }
    } catch (err) {
      showFeedback('Network error generating invitation token.', 'error');
    } finally {
      setGeneratingToken(false);
    }
  };

  const handleCopyToken = () => {
    if (issuedToken) {
      navigator.clipboard.writeText(issuedToken);
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 3000);
    }
  };

  // Filtered Questions
  const filteredQuestions = questions.filter(q => {
    const matchesSearch = !questionSearch.trim() ||
      q.question.toLowerCase().includes(questionSearch.toLowerCase()) ||
      (q.subject_name && q.subject_name.toLowerCase().includes(questionSearch.toLowerCase()));
    const matchesSubj = questionSubjectFilter === 'all' || q.subject_id === questionSubjectFilter;
    const matchesDiff = questionDifficultyFilter === 'all' || q.difficulty === questionDifficultyFilter;
    return matchesSearch && matchesSubj && matchesDiff;
  });

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        <span className="text-xs font-semibold text-[var(--text-secondary)]">Loading Platform Management Console...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-base font-bold text-[var(--text-primary)]">Platform Console Error</h3>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{error}</p>
        <button
          onClick={fetchAllData}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs inline-flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw size={14} />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner / Role Identity */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase tracking-wide">
              Administrator
            </span>
            <h1 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight">
              Platform Management Console
            </h1>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Full platform administration: student accounts, question bank CRUD, standardized assessments, and user access control.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAllData}
            title="Refresh All Administrative Data"
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] transition-colors cursor-pointer"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in ${actionFeedback.type === 'success'
            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
            : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
          }`}>
          {actionFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {/* Internal Admin Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[var(--surface-border)] scrollbar-none">
        {[
          { id: 'admin-overview', label: 'Overview', icon: BarChart2 },
          { id: 'admin-students', label: 'Students', icon: Users },
          { id: 'admin-questions', label: 'Question Bank', icon: HelpCircle },
          { id: 'admin-assessments', label: 'Assessments', icon: Award },
          { id: 'admin-analytics', label: 'Platform Analytics', icon: TrendingUp },
          { id: 'admin-users', label: 'User Management', icon: Shield }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSection(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${isActive
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-transparent'
                }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* SECTION 1: OVERVIEW METRICS                                           */}
      {/* ===================================================================== */}
      {activeSection === 'admin-overview' && (
        loading && !overview ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-[var(--text-muted)]">
            <RefreshCw size={24} className="animate-spin text-amber-500" />
            <span className="text-xs font-semibold">Loading platform overview metrics...</span>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-1">
                <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Total Students
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[var(--text-primary)]">
                    {overview?.total_students ?? students.length}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-400">
                    {overview?.active_students_7d ?? overview?.active_students ?? 0} active
                  </span>
                </div>
                <p className="text-[10px] text-[var(--text-muted)]">{overview?.blocked_students ?? 0} suspended</p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-emerald-500/30 space-y-1 bg-gradient-to-br from-[var(--surface-card)] to-emerald-950/20">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Placed Students</span>
                  <Briefcase size={13} className="text-emerald-400" />
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-400">
                    {overview?.total_placed ?? overview?.placed_students_count ?? students.filter(s => s.placement_status === 'PLACED').length}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-300">
                    {overview?.placement_rate ?? Math.round((students.filter(s => s.placement_status === 'PLACED').length / Math.max(1, students.length)) * 100)}% placed
                  </span>
                </div>
                <p className="text-[10px] text-[var(--text-muted)]">Verified recruitment offers</p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-1">
                <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Questions in Bank
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-amber-400">
                    {overview?.total_questions ?? questions.length}
                  </span>
                  <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
                    {subjects.length} subjects
                  </span>
                </div>
                <p className="text-[10px] text-[var(--text-muted)]">Verified question assets</p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-1">
                <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Assessments & Quizzes
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-indigo-400">
                    {overview?.total_sessions ?? 0}
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-300">
                    {overview?.assessment_completion_rate ?? overview?.quiz_completion_rate ?? 100}%
                  </span>
                </div>
                <p className="text-[10px] text-[var(--text-muted)]">{overview?.total_attempts ?? 0} attempts</p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-1">
                <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Coding Submissions
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-cyan-400">
                    {overview?.total_coding_submissions ?? 0}
                  </span>
                  <span className="text-[11px] font-semibold text-cyan-300">
                    {overview?.coding_acceptance_rate ?? 0}% pass
                  </span>
                </div>
                <p className="text-[10px] text-[var(--text-muted)]">Compilations & test runs</p>
              </div>
            </div>

            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setSection('admin-students')}
                className="p-5 rounded-2xl bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] text-left transition-all cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Users size={18} />
                </div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Manage Student Accounts</h4>
                <p className="text-xs text-[var(--text-muted)] mt-1">Search student roster, inspect dossiers, and manage account statuses.</p>
              </button>

              <button
                onClick={() => setSection('admin-questions')}
                className="p-5 rounded-2xl bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] text-left transition-all cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Plus size={18} />
                </div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Question Bank Management</h4>
                <p className="text-xs text-[var(--text-muted)] mt-1">Create, edit, organize, or purge multiple-choice questions.</p>
              </button>

              <button
                onClick={() => setSection('admin-users')}
                className="p-5 rounded-2xl bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] text-left transition-all cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Shield size={18} />
                </div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">User & Access Management</h4>
                <p className="text-xs text-[var(--text-muted)] mt-1">Appoint Deans and Administrators, issue invitation secrets, and revoke roles.</p>
              </button>
            </div>
          </div>
        )
      )}

      {/* ===================================================================== */}
      {/* SECTION 2: STUDENT MANAGEMENT                                         */}
      {/* ===================================================================== */}
      {activeSection === 'admin-students' && (
        <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Student Account Directory</h3>
              <p className="text-xs text-[var(--text-muted)]">Search, inspect progress dossiers, and perform account status actions</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--text-secondary)]">
                {students.length} Accounts Found
              </span>
            </div>
          </div>

          {/* Search, Filter & Sort Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search by student name or email..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[var(--surface-elevated)] border border-[var(--surface-border)] rounded-xl text-xs text-[var(--text-primary)] outline-none focus:border-amber-500"
              />
            </div>

            <select
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value as any)}
              className="w-full py-2 px-3 bg-[var(--surface-elevated)] border border-[var(--surface-border)] rounded-xl text-xs text-[var(--text-primary)] outline-none"
            >
              <option value="all">All Accounts (Active & Suspended)</option>
              <option value="placed">🎯 Placed Students Only</option>
              <option value="not_placed">⏳ Not Placed (Seeking)</option>
              <option value="new">New Joinees (Last 7 Days)</option>
              <option value="active">Active Recently</option>
              <option value="blocked">Suspended Only</option>
            </select>

            <select
              value={studentSort}
              onChange={(e) => setStudentSort(e.target.value as any)}
              className="w-full py-2 px-3 bg-[var(--surface-elevated)] border border-[var(--surface-border)] rounded-xl text-xs text-[var(--text-primary)] outline-none"
            >
              <option value="default">Default Sort</option>
              <option value="newest">Newest Registration</option>
              <option value="xp">Highest XP</option>
              <option value="accuracy">Highest Accuracy</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

          {/* Student Table */}
          {students.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--text-muted)]">
              No student accounts found matching the filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[var(--surface-border)]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--surface-elevated)] text-[var(--text-muted)] uppercase text-[10px] font-bold border-b border-[var(--surface-border)]">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Branch / Year</th>
                    <th className="py-3 px-4 text-center">XP</th>
                    <th className="py-3 px-4 text-center">Accuracy</th>
                    <th className="py-3 px-4">Placement</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--surface-border)]">
                  {students.map((st) => {
                    const isBlocked = st.is_blocked || st.status === 'BLOCKED';
                    const isPlaced = st.placement_status === 'PLACED';
                    return (
                      <tr key={st.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-[var(--text-primary)]">{st.name}</div>
                          <div className="text-[11px] text-[var(--text-muted)]">{st.email}</div>
                        </td>
                        <td className="py-3 px-4 text-[var(--text-secondary)]">
                          {st.branch_code || 'CSE'} • {st.year || '4th Year'}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-amber-400">
                          {st.total_xp || 0}
                        </td>
                        <td className="py-3 px-4 text-center font-bold">
                          {(st.accuracy_rate !== undefined && st.accuracy_rate !== null) ? (
                            <span className={st.accuracy_rate >= 75 ? 'text-emerald-400' : st.accuracy_rate >= 50 ? 'text-amber-400' : 'text-rose-400'}>
                              {st.accuracy_rate}%
                            </span>
                          ) : (st.accuracy !== undefined && st.accuracy !== null && (st.total_attempted || 0) > 0) ? (
                            <span className={st.accuracy >= 75 ? 'text-emerald-400' : st.accuracy >= 50 ? 'text-amber-400' : 'text-rose-400'}>
                              {st.accuracy}%
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-[var(--text-muted)] bg-[var(--surface-elevated)] px-2 py-0.5 rounded-md border border-[var(--surface-border)]">
                              {(st.total_attempted === 0 || st.total_attempted === undefined) ? 'No Tests' : 'N/A'}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {isPlaced ? (
                            <div className="inline-flex flex-col">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-max">
                                <Check size={10} />
                                <span>Placed</span>
                              </span>
                              {st.placed_company && (
                                <span className="text-[11px] font-semibold text-[var(--text-primary)] mt-0.5 truncate max-w-[130px]" title={st.placed_company}>
                                  {st.placed_company} {st.placement_package ? `(${st.placement_package})` : ''}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
                              Not Placed
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isBlocked
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                            {isBlocked ? 'Suspended' : 'Active'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenDossier(st.id)}
                              className="px-2.5 py-1 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-cyan-400 border border-[var(--surface-border)] text-xs font-bold cursor-pointer"
                              title="Inspect Performance Dossier"
                            >
                              Dossier
                            </button>
                            <button
                              onClick={() => handleOpenPlacementModal(st)}
                              className={`p-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${isPlaced
                                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                                }`}
                              title={isPlaced ? `Edit Placement (${st.placed_company || 'Placed'})` : 'Assign Placement Status'}
                            >
                              <Briefcase size={14} />
                            </button>
                            <button
                              onClick={() => handleToggleBlock(st)}
                              className={`p-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${isBlocked
                                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
                                }`}
                              title={isBlocked ? 'Reinstate Account' : 'Suspend Account'}
                            >
                              <Ban size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(st)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold cursor-pointer transition-colors"
                              title="Purge Student Account"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 3: QUESTION BANK MANAGEMENT                                   */}
      {/* ===================================================================== */}
      {activeSection === 'admin-questions' && (
        <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Question Bank Management</h3>
              <p className="text-xs text-[var(--text-muted)]">Browse, create, edit, and organize multiple choice practice questions</p>
            </div>
            <button
              onClick={handleOpenCreateQuestion}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Plus size={14} />
              <span>Add New Question</span>
            </button>
          </div>

          {/* Search & Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search questions by text or keyword..."
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[var(--surface-elevated)] border border-[var(--surface-border)] rounded-xl text-xs text-[var(--text-primary)] outline-none focus:border-amber-500"
              />
            </div>

            <select
              value={questionSubjectFilter}
              onChange={(e) => setQuestionSubjectFilter(e.target.value)}
              className="w-full py-2 px-3 bg-[var(--surface-elevated)] border border-[var(--surface-border)] rounded-xl text-xs text-[var(--text-primary)] outline-none"
            >
              <option value="all">All Subjects</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <select
              value={questionDifficultyFilter}
              onChange={(e) => setQuestionDifficultyFilter(e.target.value)}
              className="w-full py-2 px-3 bg-[var(--surface-elevated)] border border-[var(--surface-border)] rounded-xl text-xs text-[var(--text-primary)] outline-none"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Questions List */}
          {filteredQuestions.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--text-muted)]">
              No questions found matching your search and filter criteria.
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {filteredQuestions.slice(0, 30).map((q) => (
                <div
                  key={q.id}
                  className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] space-y-2.5 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                        <span className="px-2 py-0.5 rounded font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {q.subject_name || 'Core CS'}
                        </span>
                        <span className="px-2 py-0.5 rounded font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {q.topic_name || 'General'}
                        </span>
                        <span className={`px-2 py-0.5 rounded font-bold ${q.difficulty === 'Hard'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : q.difficulty === 'Easy'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                          {q.difficulty}
                        </span>
                        {q.company_name && q.company_name !== 'Universal' && (
                          <span className="px-2 py-0.5 rounded font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            {q.company_name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-[var(--text-primary)] leading-relaxed pt-1">
                        {q.question}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleOpenEditQuestion(q)}
                        className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-cyan-400 hover:bg-[var(--surface-card)] border border-[var(--surface-border)] cursor-pointer"
                        title="Edit Question"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q)}
                        className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-rose-400 hover:bg-[var(--surface-card)] border border-[var(--surface-border)] cursor-pointer"
                        title="Delete Question"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Options Display */}
                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
                      {q.options.map((opt: any) => {
                        const isCorrect = opt.option_key === q.correct_answer;
                        return (
                          <div
                            key={opt.option_key}
                            className={`p-2 rounded-lg border flex items-center gap-2 ${isCorrect
                                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 font-semibold'
                                : 'bg-[var(--surface-card)] border-[var(--surface-border)] text-[var(--text-secondary)]'
                              }`}
                          >
                            <span className="font-bold w-4">{opt.option_key}.</span>
                            <span className="truncate">{opt.option_text}</span>
                            {isCorrect && <Check size={12} className="ml-auto text-emerald-400 flex-shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 4: ASSESSMENTS GOVERNANCE                                     */}
      {/* ===================================================================== */}
      {activeSection === 'admin-assessments' && (
        <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Platform Standardized Assessments</h3>
            <p className="text-xs text-[var(--text-muted)]">Assessment configuration, completion metrics, and attempt statistics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {[
              {
                id: 'core-cs',
                title: 'Core CS Fundamentals Mock',
                duration: '25 mins',
                questions: 20,
                target: 'Universal Placement',
                category: 'Operating Systems, DBMS, Computer Networks'
              },
              {
                id: 'tcs-nqt',
                title: 'TCS NQT National Mock Drive',
                duration: '45 mins',
                questions: 30,
                target: 'TCS Ninja & Digital',
                category: 'Numerical Ability, Reasoning, Pseudocode'
              },
              {
                id: 'dsa-mastery',
                title: 'Data Structures & Algorithms Sprint',
                duration: '30 mins',
                questions: 15,
                target: 'Product Engineering Firms',
                category: 'Trees, Graphs, Dynamic Programming, Arrays'
              }
            ].map((asmt) => (
              <div
                key={asmt.id}
                className="p-5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] space-y-3"
              >
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                    {asmt.target}
                  </span>
                  <h4 className="text-sm font-bold text-[var(--text-primary)] mt-0.5">
                    {asmt.title}
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1">{asmt.category}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[var(--surface-border)]">
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] block">Time Bound</span>
                    <span className="font-bold text-[var(--text-primary)]">{asmt.duration}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] block">Items</span>
                    <span className="font-bold text-indigo-400">{asmt.questions} Questions</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 5: PLATFORM ANALYTICS                                         */}
      {/* ===================================================================== */}
      {activeSection === 'admin-analytics' && (
        loading && !overview ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-[var(--text-muted)]">
            <RefreshCw size={24} className="animate-spin text-amber-500" />
            <span className="text-xs font-semibold">Loading platform analytics...</span>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Platform Activity & Usage Metrics</h3>
                <p className="text-xs text-[var(--text-muted)]">Real-time aggregate activity across quizzes, coding submissions, and student engagement</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] space-y-1.5">
                  <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Assessment Sessions</span>
                  <div className="text-xl font-black text-indigo-400">
                    {overview?.total_sessions ?? overview?.completed_quizzes ?? 0}
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)]">Completed tests across all enrolled candidates</p>
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] space-y-1.5">
                  <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Coding Executions</span>
                  <div className="text-xl font-black text-cyan-400">
                    {overview?.total_coding_submissions ?? 0}
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)]">Algorithmic sandbox code executions</p>
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] space-y-1.5">
                  <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Active Joinees</span>
                  <div className="text-xl font-black text-emerald-400">
                    {overview?.new_joinees_7d ?? overview?.active_students_7d ?? 0}
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)]">New students joined in the past 7 days</p>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* ===================================================================== */}
      {/* SECTION 6: USER MANAGEMENT & FACULTY GOVERNANCE                       */}
      {/* ===================================================================== */}
      {activeSection === 'admin-users' && (
        <div className="space-y-6">
          {/* Top Panel: Appoint Staff & Issue Tokens */}
          <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">User & Faculty Access Governance</h3>
                <p className="text-xs text-[var(--text-muted)]">Manage authorized Dean and Administrator accounts and issue onboarding tokens</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerateInviteToken}
                  disabled={generatingToken}
                  className="px-3.5 py-2 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <KeyRound size={14} />
                  <span>{generatingToken ? 'Issuing...' : 'Issue Invitation Token'}</span>
                </button>
                <button
                  onClick={() => setShowAppointModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <UserPlus size={14} />
                  <span>Appoint Staff</span>
                </button>
              </div>
            </div>

            {/* Issued Token Banner */}
            {issuedToken && (
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between gap-3 animate-in fade-in">
                <div className="min-w-0 space-y-0.5">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide block">
                    Cryptographic Single-Use Invitation Token (Valid for 48 Hours)
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-200 block truncate select-all">
                    {issuedToken}
                  </span>
                </div>
                <button
                  onClick={handleCopyToken}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                >
                  {tokenCopied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{tokenCopied ? 'Copied!' : 'Copy Token'}</span>
                </button>
              </div>
            )}

            {/* Faculty & Admins Table */}
            {facultyList.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--text-muted)] border rounded-xl border-[var(--surface-border)] bg-[var(--surface-elevated)]">
                No faculty or administrative users found. Click "Appoint Staff" or "Issue Invitation Token" to onboard users.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-[var(--surface-border)] pt-1">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--surface-elevated)] text-[var(--text-muted)] uppercase text-[10px] font-bold border-b border-[var(--surface-border)]">
                    <tr>
                      <th className="py-3 px-4">Member Name</th>
                      <th className="py-3 px-4">Institutional Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Designation</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--surface-border)]">
                    {facultyList.map((f) => (
                      <tr key={f.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                        <td className="py-3 px-4 font-bold text-[var(--text-primary)]">
                          {f.name}
                        </td>
                        <td className="py-3 px-4 text-[var(--text-secondary)]">
                          {f.email}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${f.role === 'ADMIN'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            }`}>
                            {f.role === 'ADMIN' ? 'Administrator' : 'Dean'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[var(--text-muted)]">
                          {f.designation || (f.role === 'ADMIN' ? 'Administrator' : 'Dean')}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleRevokeStaff(f)}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 border border-[var(--surface-border)] text-xs font-bold cursor-pointer transition-colors"
                            title="Revoke Credentials"
                          >
                            <UserX size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: QUESTION CREATE / EDIT MODAL                                 */}
      {/* ===================================================================== */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {editingQuestionId ? 'Edit Practice Question' : 'Create New Practice Question'}
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Add verified curriculum questions to the PrepPilot question bank
                </p>
              </div>
              <button
                onClick={() => setShowQuestionModal(false)}
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--surface-hover)] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                  Question Prompt
                </label>
                <textarea
                  required
                  rows={3}
                  value={qPrompt}
                  onChange={(e) => setQPrompt(e.target.value)}
                  placeholder="Enter the complete question prompt..."
                  className="w-full p-2.5 bg-[var(--surface-elevated)] border border-[var(--surface-border)] rounded-xl text-xs text-[var(--text-primary)] outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Subject</label>
                  <select
                    required
                    value={qSubjectId}
                    onChange={(e) => setQSubjectId(e.target.value)}
                    className="w-full p-2 bg-[var(--surface-elevated)] border border-[var(--surface-border)] rounded-xl text-xs text-[var(--text-primary)] outline-none"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Topic</label>
                  <select
                    required
                    value={qTopicId}
                    onChange={(e) => setQTopicId(e.target.value)}
                    className="w-full p-2 bg-[var(--surface-elevated)] border border-[var(--surface-border)] rounded-xl text-xs text-[var(--text-primary)] outline-none"
                  >
                    <option value="">Select Topic</option>
                    {topics.filter(t => !qSubjectId || t.subject_id === qSubjectId).map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Difficulty</label>
                  <select
                    value={qDifficulty}
                    onChange={(e) => setQDifficulty(e.target.value as any)}
                    className="w-full p-2 bg-[var(--surface-elevated)] border border-[var(--surface-border)] rounded-xl text-xs text-[var(--text-primary)] outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Option A</label>
                  <input
                    type="text"
                    required
                    value={qOptA}
                    onChange={(e) => setQOptA(e.target.value)}
                    placeholder="Option A text"
                    className="w-full p-2 bg-[var(--surface-elevated)] border border-[var(--surface-border)] rounded-xl text-xs text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Option B</label>
                  <input
                    type="text"
                    required
                    value={qOptB}
                    onChange={(e) => setQOptB(e.target.value)}
                    placeholder="Option B text"
                    className="w-full p-2 bg-[var(--surface-elevated)] border border-[var(--surface-border)] rounded-xl text-xs text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Option C</label>
                  <input
                    type="text"
                    required
                    value={qOptC}
                    onChange={(e) => setQOptC(e.target.value)}
                    placeholder="Option C text"
                    className="w-full p-2 bg-[var(--surface-elevated)] border border-[var(--surface-border)] rounded-xl text-xs text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Option D</label>
                  <input
                    type="text"
                    required
                    value={qOptD}
                    onChange={(e) => setQOptD(e.target.value)}
                    placeholder="Option D text"
                    className="w-full p-2 bg-[var(--surface-elevated)] border border-[var(--surface-border)] rounded-xl text-xs text-[var(--text-primary)] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Correct Answer</label>
                  <select
                    value={qCorrect}
                    onChange={(e) => setQCorrect(e.target.value)}
                    className="w-full p-2 bg-[var(--surface-elevated)] border border-[var(--surface-border)] rounded-xl text-xs text-[var(--text-primary)] outline-none font-bold text-emerald-400"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Target Company (Optional)</label>
                  <select
                    value={qCompanyId}
                    onChange={(e) => setQCompanyId(e.target.value)}
                    className="w-full p-2 bg-[var(--surface-elevated)] border border-[var(--surface-border)] rounded-xl text-xs text-[var(--text-primary)] outline-none"
                  >
                    <option value="">Universal / General</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                  Educational Explanation
                </label>
                <textarea
                  rows={2}
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  placeholder="Explanation shown to students after submitting this question..."
                  className="w-full p-2.5 bg-[var(--surface-elevated)] border border-[var(--surface-border)] rounded-xl text-xs text-[var(--text-primary)] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--surface-elevated)] text-[var(--text-secondary)] text-xs font-semibold hover:bg-[var(--surface-hover)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingQuestion}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {savingQuestion ? 'Saving...' : editingQuestionId ? 'Update Question' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: APPOINT STAFF / FACULTY MODAL                                */}
      {/* ===================================================================== */}
      {showAppointModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Appoint Staff Member</h3>
                <p className="text-xs text-[var(--text-muted)]">Assign Dean or Administrator role</p>
              </div>
              <button
                onClick={() => setShowAppointModal(false)}
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--surface-hover)] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAppointStaff} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={appointName}
                  onChange={(e) => setAppointName(e.target.value)}
                  placeholder="e.g. Dr. Sunita Deshmukh"
                  className="w-full p-2.5 bg-[var(--surface-elevated)] border border-[var(--surface-border)] rounded-xl text-xs text-[var(--text-primary)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Institutional Email</label>
                <input
                  type="email"
                  required
                  value={appointEmail}
                  onChange={(e) => setAppointEmail(e.target.value)}
                  placeholder="e.g. dean@college.edu"
                  className="w-full p-2.5 bg-[var(--surface-elevated)] border border-[var(--surface-border)] rounded-xl text-xs text-[var(--text-primary)] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Role</label>
                  <select
                    value={appointRole}
                    onChange={(e) => {
                      const r = e.target.value as 'DEAN' | 'ADMIN';
                      setAppointRole(r);
                      setAppointDesignation(r === 'ADMIN' ? 'Administrator' : 'Dean');
                    }}
                    className="w-full p-2 bg-[var(--surface-elevated)] border border-[var(--surface-border)] rounded-xl text-xs text-[var(--text-primary)] outline-none"
                  >
                    <option value="DEAN">Dean</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={appointPassword}
                    onChange={(e) => setAppointPassword(e.target.value)}
                    className="w-full p-2 bg-[var(--surface-elevated)] border border-[var(--surface-border)] rounded-xl text-xs text-[var(--text-primary)] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Designation</label>
                <input
                  type="text"
                  value={appointDesignation}
                  onChange={(e) => setAppointDesignation(e.target.value)}
                  placeholder="Dean"
                  className="w-full p-2.5 bg-[var(--surface-elevated)] border border-[var(--surface-border)] rounded-xl text-xs text-[var(--text-primary)] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAppointModal(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--surface-elevated)] text-[var(--text-secondary)] text-xs font-semibold hover:bg-[var(--surface-hover)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={appointLoading}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {appointLoading ? 'Appointing...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: STUDENT DOSSIER MODAL                                        */}
      {/* ===================================================================== */}
      {selectedStudentId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                  Student Performance Dossier
                </span>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {studentDossier?.student?.name || 'Loading Profile...'}
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {studentDossier?.student?.email}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedStudentId(null);
                  setStudentDossier(null);
                }}
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--surface-hover)] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {loadingDossier ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                <span className="text-xs text-[var(--text-muted)]">Retrieving student performance...</span>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {/* Placement Status Banner */}
                <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                  studentDossier?.student?.placement_status === 'PLACED'
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-[var(--surface-elevated)] border-[var(--surface-border)]'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      studentDossier?.student?.placement_status === 'PLACED'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-700/20 text-[var(--text-muted)]'
                    }`}>
                      <Briefcase size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[var(--text-primary)]">
                          {studentDossier?.student?.placement_status === 'PLACED' ? 'Placement Status: Placed' : 'Placement Status: Not Placed'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          studentDossier?.student?.placement_status === 'PLACED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-500/15 text-slate-400 border border-slate-500/20'
                        }`}>
                          {studentDossier?.student?.placement_status === 'PLACED' ? 'Offer Secured' : 'In Preparation'}
                        </span>
                      </div>
                      {studentDossier?.student?.placement_status === 'PLACED' ? (
                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                          Company: <span className="font-semibold text-[var(--text-primary)]">{studentDossier?.student?.placed_company || 'Undisclosed'}</span>
                          {studentDossier?.student?.placement_package && (
                            <span> • CTC: <span className="font-bold text-emerald-400">{studentDossier?.student?.placement_package}</span></span>
                          )}
                          {studentDossier?.student?.placed_date && (
                            <span> • Date: <span className="text-[var(--text-muted)]">{studentDossier?.student?.placed_date}</span></span>
                          )}
                        </p>
                      ) : (
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                          Candidate is actively undertaking prep tracks and skill assessments.
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const curSt = studentDossier.student;
                      setSelectedStudentId(null);
                      setStudentDossier(null);
                      handleOpenPlacementModal(curSt);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                  >
                    <Edit2 size={12} />
                    <span>Change</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-[var(--surface-elevated)] text-center">
                    <span className="text-[10px] text-[var(--text-muted)] block">XP</span>
                    <span className="text-base font-bold text-amber-400">
                      {studentDossier?.student?.total_xp || 0}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--surface-elevated)] text-center">
                    <span className="text-[10px] text-[var(--text-muted)] block">Skill Level</span>
                    <span className="text-base font-bold text-indigo-400">
                      {studentDossier?.student?.skill_level || 'Intermediate'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--surface-elevated)] text-center">
                    <span className="text-[10px] text-[var(--text-muted)] block">Streak</span>
                    <span className="text-base font-bold text-cyan-400">
                      {studentDossier?.student?.current_streak || 0} Days
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                    Recent Test Sessions
                  </h4>
                  {(studentDossier?.sessions || []).length === 0 ? (
                    <div className="p-4 rounded-xl bg-[var(--surface-elevated)] text-xs text-[var(--text-muted)] text-center">
                      No assessment attempts recorded for this candidate.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {studentDossier.sessions.slice(-5).map((sess: any) => (
                        <div
                          key={sess.id}
                          className="p-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-semibold text-[var(--text-primary)] block">
                              {sess.title || sess.mode || 'Adaptive Session'}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)]">
                              Status: {sess.status}
                            </span>
                          </div>
                          <span className="font-bold text-amber-400">
                            {sess.score !== undefined ? `${sess.score}%` : `${sess.correct_count || 0}/${sess.total_questions || 0}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: ASSIGN / UPDATE STUDENT PLACEMENT STATUS                     */}
      {/* ===================================================================== */}
      {showPlacementModal && placementStudent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                  <Briefcase size={11} />
                  <span>Campus Placement Record</span>
                </span>
                <h3 className="text-base font-bold text-[var(--text-primary)] mt-0.5">
                  Update Placement Status
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {placementStudent.name} ({placementStudent.email})
                </p>
              </div>
              <button
                onClick={() => setShowPlacementModal(false)}
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--surface-hover)] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1.5">
                  Placement Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPlacementStatus('PLACED')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      placementStatus === 'PLACED'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-sm'
                        : 'bg-[var(--surface-elevated)] border-[var(--surface-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Check size={14} />
                    <span>Placed</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlacementStatus('NOT_PLACED')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      placementStatus === 'NOT_PLACED'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-sm'
                        : 'bg-[var(--surface-elevated)] border-[var(--surface-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <X size={14} />
                    <span>Not Placed</span>
                  </button>
                </div>
              </div>

              {placementStatus === 'PLACED' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--surface-border)]">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                      Recruiting Company / Employer
                    </label>
                    <input
                      type="text"
                      list="admin-placement-companies"
                      value={placedCompany}
                      onChange={(e) => setPlacedCompany(e.target.value)}
                      placeholder="e.g. Google, Microsoft, TCS, Infosys, Wipro"
                      className="w-full p-2.5 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-xl text-xs text-[var(--text-primary)] outline-none focus:border-emerald-500"
                    />
                    <datalist id="admin-placement-companies">
                      {companies.map((c: any) => (
                        <option key={c.id || c.name} value={c.name} />
                      ))}
                      <option value="Google" />
                      <option value="Amazon" />
                      <option value="Microsoft" />
                      <option value="Tata Consultancy Services (TCS)" />
                      <option value="Infosys" />
                      <option value="Wipro" />
                      <option value="Accenture" />
                      <option value="Cognizant" />
                      <option value="Capgemini" />
                    </datalist>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                        Package / CTC
                      </label>
                      <input
                        type="text"
                        value={placementPackage}
                        onChange={(e) => setPlacementPackage(e.target.value)}
                        placeholder="e.g. 12 LPA or 8.5 LPA"
                        className="w-full p-2.5 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-xl text-xs text-[var(--text-primary)] outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                        Offer / Placement Date
                      </label>
                      <input
                        type="date"
                        value={placedDate}
                        onChange={(e) => setPlacedDate(e.target.value)}
                        className="w-full p-2.5 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-xl text-xs text-[var(--text-primary)] outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPlacementModal(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--surface-elevated)] text-[var(--text-secondary)] text-xs font-semibold hover:bg-[var(--surface-hover)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePlacement}
                  disabled={savingPlacement || (placementStatus === 'PLACED' && !placedCompany.trim())}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Briefcase size={13} />
                  <span>{savingPlacement ? 'Updating...' : 'Save Placement Status'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* CONFIRMATION DIALOG FOR DESTRUCTIVE ACTIONS                            */}
      {/* ===================================================================== */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {confirmDialog.title}
              </h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {confirmDialog.message}
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl bg-[var(--surface-elevated)] text-[var(--text-secondary)] text-xs font-semibold hover:bg-[var(--surface-hover)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const fn = confirmDialog.onConfirm;
                  setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                  await fn();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
