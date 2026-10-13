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
  Calendar,
  Sparkles,
  X,
  Download,
  Megaphone,
  AlertCircle,
  RefreshCw,
  GraduationCap,
  Send,
  UserPlus,
  ShieldCheck,
  BadgeCheck
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [overview, setOverview] = useState<any | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<'students' | 'faculty' | 'overview' | 'questions' | 'add_question' | 'announcements'>('students');
  const [loading, setLoading] = useState(true);

  // Student list filter & search
  const [studentSearch, setStudentSearch] = useState('');
  const [studentFilter, setStudentFilter] = useState<'all' | 'new' | 'active' | 'blocked'>('all');
  const [studentSort, setStudentSort] = useState<'default' | 'newest' | 'xp' | 'accuracy' | 'name'>('default');

  // Selected student for progress dossier modal
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentDossier, setStudentDossier] = useState<any | null>(null);
  const [loadingDossier, setLoadingDossier] = useState(false);

  // Appoint Dean Modal & State
  const [showAppointModal, setShowAppointModal] = useState(false);
  const [appointName, setAppointName] = useState('');
  const [appointEmail, setAppointEmail] = useState('');
  const [appointPassword, setAppointPassword] = useState('dean123');
  const [appointDesignation, setAppointDesignation] = useState('Associate Placement Dean');
  const [appointDepartment, setAppointDepartment] = useState('Training & Placement Cell');
  const [appointLoading, setAppointLoading] = useState(false);
  const [appointError, setAppointError] = useState('');

  // New question form state
  const [newQText, setNewQText] = useState('');
  const [newQSubject, setNewQSubject] = useState('');
  const [newQTopic, setNewQTopic] = useState('');
  const [newQCompany, setNewQCompany] = useState('');
  const [newQDifficulty, setNewQDifficulty] = useState('Medium');
  const [newQCorrect, setNewQCorrect] = useState('A');
  const [newQExplanation, setNewQExplanation] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // New announcement form state
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annCategory, setAnnCategory] = useState('DRIVE');
  const [annPriority, setAnnPriority] = useState('HIGH');
  const [annCompany, setAnnCompany] = useState('');
  const [annDeadline, setAnnDeadline] = useState('');
  const [annSuccess, setAnnSuccess] = useState('');

  // Notification banners
  const [actionFeedback, setActionFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchAllData = async () => {
    try {
      const [oRes, qRes, sRes, fRes, compRes, subjRes, topRes, annRes] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminQuestions(),
        api.getAdminStudents(),
        api.getFaculty(),
        api.getCompanies(),
        api.getSubjects(),
        api.getTopics(),
        api.getAnnouncements()
      ]);

      if (oRes.success) setOverview(oRes.stats);
      if (qRes.success) setQuestions(qRes.questions);
      if (sRes.success) setStudents(sRes.students);
      if (fRes.success) setFacultyList(fRes.faculty);
      if (compRes.success) setCompanies(compRes.companies);
      if (annRes.success) setAnnouncements(annRes.announcements);

      if (subjRes.success) {
        setSubjects(subjRes.subjects);
        if (subjRes.subjects.length > 0 && !newQSubject) setNewQSubject(subjRes.subjects[0].id);
      }
      if (topRes.success) {
        setTopics(topRes.topics);
        if (topRes.topics.length > 0 && !newQTopic) setNewQTopic(topRes.topics[0].id);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setActionFeedback({ message, type });
    setTimeout(() => setActionFeedback(null), 5000);
  };

  // 1. Kick Out (Delete) Student
  const handleKickOutStudent = async (studentId: string, studentName: string) => {
    const confirmed = window.confirm(
      `⚠️ ARE YOU SURE YOU WANT TO KICK OUT ${studentName.toUpperCase()}?\n\nThis will permanently delete their account and purge all test attempts and scores from the database.`
    );
    if (!confirmed) return;

    try {
      const res = await api.deleteStudent(studentId);
      if (res.success) {
        setStudents(prev => prev.filter(s => s.id !== studentId));
        if (selectedStudentId === studentId) {
          setSelectedStudentId(null);
          setStudentDossier(null);
        }
        showNotification(res.message || `Student ${studentName} kicked out.`);
        const oRes = await api.getAdminOverview();
        if (oRes.success) setOverview(oRes.stats);
      } else {
        showNotification(res.message || 'Failed to remove student.', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Error kicking out student.', 'error');
    }
  };

  // 2. Block / Unblock Student Profile
  const handleToggleStudentStatus = async (studentId: string, currentBlocked: boolean, studentName: string) => {
    const action = currentBlocked ? 'unblock' : 'suspend / block';
    const confirmed = window.confirm(`Are you sure you want to ${action} the profile for ${studentName}?`);
    if (!confirmed) return;

    try {
      const res = await api.updateStudentStatus(studentId, !currentBlocked);
      if (res.success) {
        setStudents(prev => prev.map(s => {
          if (s.id === studentId) {
            return {
              ...s,
              is_blocked: !currentBlocked,
              status: !currentBlocked ? 'BLOCKED' : 'ACTIVE'
            };
          }
          return s;
        }));

        if (studentDossier && studentDossier.student.id === studentId) {
          setStudentDossier((prev: any) => ({
            ...prev,
            student: {
              ...prev.student,
              is_blocked: !currentBlocked,
              status: !currentBlocked ? 'BLOCKED' : 'ACTIVE'
            }
          }));
        }

        showNotification(res.message || `Student ${studentName} status updated.`);
        const oRes = await api.getAdminOverview();
        if (oRes.success) setOverview(oRes.stats);
      } else {
        showNotification(res.message || 'Failed to update student status.', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Error updating student status.', 'error');
    }
  };

  // 3. View Student Progress Dossier
  const handleViewStudentProgress = async (studentId: string) => {
    setSelectedStudentId(studentId);
    setLoadingDossier(true);
    try {
      const res = await api.getStudentProgress(studentId);
      if (res.success) {
        setStudentDossier(res.progress);
      } else {
        showNotification(res.message || 'Failed to fetch student progress.', 'error');
        setSelectedStudentId(null);
      }
    } catch (err: any) {
      showNotification('Error loading progress dossier.', 'error');
      setSelectedStudentId(null);
    } finally {
      setLoadingDossier(false);
    }
  };

  // 4. Appoint New Placement Dean / Officer
  const handleAppointFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppointError('');
    setAppointLoading(true);

    try {
      const res = await api.appointFaculty({
        name: appointName,
        email: appointEmail,
        password: appointPassword,
        designation: appointDesignation,
        department: appointDepartment
      });

      if (res.success) {
        setShowAppointModal(false);
        setAppointName('');
        setAppointEmail('');
        showNotification(res.message || 'New Placement Dean/Officer appointed successfully!');
        const fRes = await api.getFaculty();
        if (fRes.success) setFacultyList(fRes.faculty);
      } else {
        setAppointError(res.message || 'Failed to appoint faculty.');
      }
    } catch (err: any) {
      setAppointError(err.message || 'Error appointing faculty.');
    } finally {
      setAppointLoading(false);
    }
  };

  // 5. Revoke Dean / Faculty Access
  const handleRevokeFaculty = async (facultyId: string, facultyName: string) => {
    if (!confirm(`Revoke Dean / Placement Administrator credentials for ${facultyName}?`)) return;
    try {
      const res = await api.revokeFaculty(facultyId);
      if (res.success) {
        setFacultyList(prev => prev.filter(f => f.id !== facultyId));
        showNotification(res.message || `Credentials for ${facultyName} revoked.`);
      } else {
        showNotification(res.message || 'Cannot revoke credentials.', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Error revoking credentials.', 'error');
    }
  };

  // 6. Create Question
  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const questionPayload = {
        question: newQText,
        subject_id: newQSubject,
        topic_id: newQTopic,
        company_id: newQCompany || undefined,
        difficulty: newQDifficulty,
        correct_answer: newQCorrect,
        explanation: newQExplanation,
        expected_time: 45,
        xp_value: 25,
        options: [
          { option_key: 'A', option_text: optA },
          { option_key: 'B', option_text: optB },
          { option_key: 'C', option_text: optC },
          { option_key: 'D', option_text: optD }
        ]
      };

      const res = await api.createQuestion(questionPayload);
      if (res.success) {
        setFormSuccess('Question successfully indexed into recommendation pool!');
        setNewQText('');
        setOptA('');
        setOptB('');
        setOptC('');
        setOptD('');
        setNewQExplanation('');

        const qRefresh = await api.getAdminQuestions();
        if (qRefresh.success) setQuestions(qRefresh.questions);
        const oRes = await api.getAdminOverview();
        if (oRes.success) setOverview(oRes.stats);
      }
    } catch (err) {
      console.error('Error adding question:', err);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      const res = await api.deleteQuestion(id);
      if (res.success) {
        setQuestions(prev => prev.filter(q => q.id !== id));
        showNotification('Question deleted.');
      }
    } catch (err) {
      console.error('Error deleting question:', err);
    }
  };

  // 7. Announcements
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: annTitle,
        message: annMessage,
        category: annCategory,
        priority: annPriority,
        company_name: annCompany || null,
        deadline: annDeadline || null
      };

      const res = await api.createAnnouncement(payload);
      if (res.success) {
        setAnnSuccess('Placement drive announcement broadcasted!');
        setAnnTitle('');
        setAnnMessage('');
        setAnnCompany('');
        setAnnDeadline('');
        const aRes = await api.getAnnouncements();
        if (aRes.success) setAnnouncements(aRes.announcements);
        setTimeout(() => setAnnSuccess(''), 4000);
      }
    } catch (err) {
      console.error('Error creating announcement:', err);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Delete this broadcast alert?')) return;
    try {
      const res = await api.deleteAnnouncement(id);
      if (res.success) {
        setAnnouncements(prev => prev.filter(a => a.id !== id));
        showNotification('Broadcast alert removed.');
      }
    } catch (err) {
      console.error('Error deleting announcement:', err);
    }
  };

  // 8. Export CSV
  const handleExportPlacementReport = () => {
    if (students.length === 0) return;
    const headers = ['Candidate Name', 'Email', 'Branch', 'Year', 'Target Companies', 'Attempts', 'Accuracy %', 'XP', 'Streak', 'Status', 'Joined Date'];
    const rows = students.map(s => [
      `"${s.name}"`,
      `"${s.email}"`,
      `"${s.branch_name || 'B.Tech'}"`,
      `"${s.year || '4th Year'}"`,
      `"${(s.target_companies || []).join('; ')}"`,
      s.total_attempted || 0,
      `${s.accuracy || 0}%`,
      s.total_xp || 0,
      `${s.current_streak || 0}d`,
      s.is_blocked ? 'BLOCKED' : 'ACTIVE',
      `"${s.created_at ? new Date(s.created_at).toLocaleDateString() : ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CareerPrep_Placement_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Student Placement Report CSV exported successfully.');
  };

  // Filtered Students
  const filteredStudents = students
    .filter(s => {
      if (studentSearch.trim()) {
        const q = studentSearch.trim().toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesEmail = s.email.toLowerCase().includes(q);
        const matchesBranch = s.branch_name?.toLowerCase().includes(q);
        const matchesCompany = (s.target_companies || []).some((c: string) => c.toLowerCase().includes(q));
        if (!matchesName && !matchesEmail && !matchesBranch && !matchesCompany) return false;
      }
      if (studentFilter === 'new') return s.is_new_joinee;
      if (studentFilter === 'blocked') return s.is_blocked;
      if (studentFilter === 'active') return !s.is_blocked;
      return true;
    })
    .sort((a, b) => {
      if (studentSort === 'newest') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      if (studentSort === 'xp') return (b.total_xp || 0) - (a.total_xp || 0);
      if (studentSort === 'accuracy') return (a.accuracy || 0) - (b.accuracy || 0);
      if (studentSort === 'name') return a.name.localeCompare(b.name);
      if (a.is_new_joinee && !b.is_new_joinee) return -1;
      if (!a.is_new_joinee && b.is_new_joinee) return 1;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });

  const newJoineesCount = students.filter(s => s.is_new_joinee).length;
  const blockedCount = students.filter(s => s.is_blocked).length;
  const activeCount = students.filter(s => !s.is_blocked).length;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-400">Loading Placement Governance Portal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 space-y-7 animate-in fade-in">
      {/* Action Notification Banner */}
      {actionFeedback && (
        <div className={`p-4 rounded-xl flex items-center justify-between gap-3 text-xs font-bold border transition-all ${
          actionFeedback.type === 'success'
            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
            : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {actionFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{actionFeedback.message}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="hover:opacity-75">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Admin Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-indigo-500/30 shadow-2xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Shield size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white">Dean & Placement Governance</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wide">
                  Dean Office
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage candidate enrollments, new joinees, student dossiers, Dean appointments, and placement alerts.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowAppointModal(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-600/20"
          >
            <UserPlus size={14} />
            <span>Appoint New Dean</span>
          </button>

          <button
            onClick={handleExportPlacementReport}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Megaphone size={14} />
            <span>Broadcast Alert</span>
          </button>

          <button
            onClick={() => {
              setLoading(true);
              fetchAllData();
            }}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Refresh All"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'students'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Users size={14} />
          <span>Candidate Directory ({students.length})</span>
          {newJoineesCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-cyan-400 text-slate-950 animate-pulse">
              +{newJoineesCount} New
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('faculty')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'faculty'
              ? 'bg-amber-600 text-slate-950 font-extrabold shadow-lg shadow-amber-600/30'
              : 'text-amber-400 hover:text-amber-300 hover:bg-slate-900'
          }`}
        >
          <ShieldCheck size={14} />
          <span>Faculty & Deans ({facultyList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <BarChart2 size={14} />
          <span>Campus Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'questions'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <HelpCircle size={14} />
          <span>Question Bank ({questions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('add_question')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'add_question'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Plus size={14} />
          <span>Add Question</span>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'announcements'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Megaphone size={14} />
          <span>Drive Alerts ({announcements.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ENROLLED CANDIDATES (New Joinees, Kick out & Block)               */}
      {/* ========================================================================= */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar for Students */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div
              onClick={() => setStudentFilter('all')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                studentFilter === 'all'
                  ? 'bg-indigo-950/60 border-indigo-500 text-white ring-1 ring-indigo-500'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Total Enrolled</span>
                <Users size={16} className="text-indigo-400" />
              </div>
              <div className="text-2xl font-extrabold text-white mt-2">{students.length}</div>
              <span className="text-[11px] text-slate-500 block mt-0.5">Engineering Candidates</span>
            </div>

            <div
              onClick={() => setStudentFilter('new')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                studentFilter === 'new'
                  ? 'bg-cyan-950/70 border-cyan-400 text-white ring-2 ring-cyan-500/50'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-cyan-500/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-cyan-300">New Joinees</span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                </div>
                <Sparkles size={16} className="text-cyan-400" />
              </div>
              <div className="text-2xl font-extrabold text-cyan-300 mt-2">{newJoineesCount}</div>
              <span className="text-[11px] text-cyan-400/80 block mt-0.5">Joined this week</span>
            </div>

            <div
              onClick={() => setStudentFilter('active')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                studentFilter === 'active'
                  ? 'bg-emerald-950/60 border-emerald-500 text-white ring-1 ring-emerald-500'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">Active Candidates</span>
                <CheckCircle2 size={16} className="text-emerald-400" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-300 mt-2">{activeCount}</div>
              <span className="text-[11px] text-emerald-500/80 block mt-0.5">In good standing</span>
            </div>

            <div
              onClick={() => setStudentFilter('blocked')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                studentFilter === 'blocked'
                  ? 'bg-rose-950/60 border-rose-500 text-white ring-1 ring-rose-500'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400">Suspended / Blocked</span>
                <Ban size={16} className="text-rose-400" />
              </div>
              <div className="text-2xl font-extrabold text-rose-300 mt-2">{blockedCount}</div>
              <span className="text-[11px] text-rose-400/80 block mt-0.5">Access frozen by Dean</span>
            </div>
          </div>

          {/* Search, Filter Pills & Sort Controls */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search candidate name, email, branch or company..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-slate-200 placeholder-slate-500 outline-none"
              />
              {studentSearch && (
                <button
                  onClick={() => setStudentSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-bold">
                <button
                  onClick={() => setStudentFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    studentFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({students.length})
                </button>
                <button
                  onClick={() => setStudentFilter('new')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                    studentFilter === 'new'
                      ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-sm'
                      : 'text-cyan-400 hover:text-cyan-300'
                  }`}
                >
                  <Sparkles size={12} />
                  <span>New Joinees ({newJoineesCount})</span>
                </button>
                <button
                  onClick={() => setStudentFilter('active')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    studentFilter === 'active' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Active ({activeCount})
                </button>
                <button
                  onClick={() => setStudentFilter('blocked')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    studentFilter === 'blocked' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Blocked ({blockedCount})
                </button>
              </div>

              <select
                value={studentSort}
                onChange={(e: any) => setStudentSort(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 outline-none cursor-pointer"
              >
                <option value="default">Default (New Joinees First)</option>
                <option value="newest">Sort by Registration Date</option>
                <option value="xp">Sort by Highest XP</option>
                <option value="accuracy">Sort by Accuracy (Low to High)</option>
                <option value="name">Sort by Candidate Name</option>
              </select>
            </div>
          </div>

          {/* Students Table */}
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <Users size={36} className="mx-auto text-slate-600" />
              <h4 className="text-sm font-bold text-white">No candidates match current criteria</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try adjusting your search query or reset filter to "All".
              </p>
              <button
                onClick={() => {
                  setStudentSearch('');
                  setStudentFilter('all');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">Candidate & Branch</th>
                    <th className="p-4">Enrollment Date</th>
                    <th className="p-4">Target Drives</th>
                    <th className="p-4">Performance</th>
                    <th className="p-4">Account Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredStudents.map((s) => (
                    <tr
                      key={s.id}
                      className={`transition-colors ${
                        s.is_blocked
                          ? 'bg-rose-950/10 hover:bg-rose-950/20'
                          : s.is_new_joinee
                          ? 'bg-cyan-950/15 hover:bg-cyan-950/25'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                            s.is_blocked
                              ? 'bg-rose-900/40 text-rose-300 border border-rose-500/40'
                              : s.is_new_joinee
                              ? 'bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/20'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-white text-sm block truncate">{s.name}</span>
                              {s.is_new_joinee && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm animate-pulse">
                                  <Sparkles size={10} />
                                  <span>NEW JOINEE</span>
                                </span>
                              )}
                            </div>
                            <span className="text-slate-400 text-xs block truncate">{s.email}</span>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                              <GraduationCap size={12} className="text-indigo-400 flex-shrink-0" />
                              <span>{s.branch_name || 'B.Tech Core'}</span>
                              <span>•</span>
                              <span className="text-slate-500">{s.year || '4th Year'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className={`text-xs font-semibold block ${s.is_new_joinee ? 'text-cyan-300 font-bold' : 'text-slate-300'}`}>
                            {s.joined_relative}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {s.created_at ? new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pre-seeded'}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {(s.target_companies && s.target_companies.length > 0) ? (
                            s.target_companies.slice(0, 3).map((cid: string) => {
                              const comp = companies.find(c => c.id === cid);
                              return (
                                <span key={cid} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                                  {comp?.name || cid.replace('comp-', '').toUpperCase()}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-slate-500 text-[11px]">General Placement</span>
                          )}
                          {(s.target_companies || []).length > 3 && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] text-slate-400 bg-slate-800/60">
                              +{s.target_companies.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              s.accuracy >= 70
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : s.accuracy >= 40
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}>
                              {s.accuracy}% Accuracy
                            </span>
                            <span className="text-[11px] text-slate-400">
                              ({s.total_attempted} Qs)
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span className="text-amber-400 font-bold flex items-center gap-1">
                              <Zap size={11} /> {s.total_xp} XP
                            </span>
                            <span>•</span>
                            <span className="text-orange-400 font-bold flex items-center gap-1">
                              <Flame size={11} /> {s.current_streak}d
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        {s.is_blocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            <Ban size={11} />
                            <span>SUSPENDED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 size={11} />
                            <span>ACTIVE</span>
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleViewStudentProgress(s.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Inspect candidate progress"
                          >
                            <TrendingUp size={13} />
                            <span>Progress</span>
                          </button>

                          <button
                            onClick={() => handleToggleStudentStatus(s.id, s.is_blocked, s.name)}
                            className={`p-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                              s.is_blocked
                                ? 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border-emerald-500/40'
                                : 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border-amber-500/30'
                            }`}
                            title={s.is_blocked ? 'Restore candidate access' : 'Freeze/block candidate account'}
                          >
                            {s.is_blocked ? <CheckCircle2 size={15} /> : <Ban size={15} />}
                          </button>

                          <button
                            onClick={() => handleKickOutStudent(s.id, s.name)}
                            className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200 border border-rose-500/30 text-xs font-bold transition-colors cursor-pointer"
                            title={`Kick out candidate ${s.name}`}
                          >
                            <UserX size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FACULTY & DEAN GOVERNANCE (Appoint / Promote New Deans)            */}
      {/* ========================================================================= */}
      {activeTab === 'faculty' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck size={18} className="text-amber-400" />
                <span>Placement Deans & Faculty Coordinators ({facultyList.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Authorized institutional officers with platform governance, candidate moderation, and question bank rights.
              </p>
            </div>

            <button
              onClick={() => setShowAppointModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-extrabold flex items-center gap-2 shadow-md cursor-pointer self-start sm:self-auto"
            >
              <UserPlus size={15} />
              <span>Appoint New Dean / Officer</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {facultyList.map((f) => (
              <div key={f.id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-4 shadow-xl">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-indigo-600 text-white font-extrabold text-sm flex items-center justify-center flex-shrink-0 shadow-md">
                    {f.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-extrabold text-white">{f.name}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {f.designation || 'Placement Dean'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 block">{f.email}</span>
                    <span className="text-[11px] text-slate-500 block">{f.department || 'Training & Placement Cell'}</span>
                    <span className="text-[10px] text-slate-500 block pt-1">
                      Appointed: {f.joined_relative || 'Official'}
                    </span>
                  </div>
                </div>

                {f.id !== 'user-admin-demo' && (
                  <button
                    onClick={() => handleRevokeFaculty(f.id, f.name)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Revoke Dean privileges"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CAMPUS ANALYTICS                                                   */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Enrolled Candidates</span>
              <span className="text-3xl font-extrabold text-white">{overview?.total_students || 0}</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-cyan-400 font-bold">+{overview?.new_joinees_count || 0} new</span>
                <span className="text-[11px] text-slate-500">•</span>
                <span className="text-[11px] text-emerald-400 font-bold">{overview?.active_students || 0} active</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Question Bank Depth</span>
              <span className="text-3xl font-extrabold text-indigo-400">{overview?.total_questions || 0}</span>
              <span className="text-[11px] text-slate-500 block mt-1">Spanning 9 B.Tech branches</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Quiz Completion Rate</span>
              <span className="text-3xl font-extrabold text-cyan-400">{overview?.quiz_completion_rate || 100}%</span>
              <span className="text-[11px] text-slate-500 block mt-1">{overview?.completed_quizzes || 0} finished sessions</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Platform Avg Accuracy</span>
              <span className="text-3xl font-extrabold text-amber-400">{overview?.platform_average_accuracy || 0}%</span>
              <span className="text-[11px] text-slate-500 block mt-1">Campus-wide placement index</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle size={16} className="text-rose-400" />
                <span>Campus-Wide Weakest Technical Topics</span>
              </h4>
              <div className="space-y-3">
                {overview?.weakest_topics_platform && overview.weakest_topics_platform.length > 0 ? (
                  overview.weakest_topics_platform.map((item: any, idx: number) => (
                    <div key={item.topic_id || idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white block">{item.topic_name}</span>
                        <span className="text-[10px] text-slate-400">{item.student_count} student attempts</span>
                      </div>
                      <span className="text-xs font-extrabold text-rose-400">{Math.round(item.avg_weakness * 100)}% Weakness</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 text-center py-4">No topic deficiency registered yet.</div>
                )}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 size={16} className="text-cyan-400" />
                <span>Most Targeted Recruitment Drives</span>
              </h4>
              <div className="space-y-3">
                {overview?.most_selected_companies && overview.most_selected_companies.length > 0 ? (
                  overview.most_selected_companies.map((c: any) => (
                    <div key={c.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{c.name}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {c.student_count} candidates
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 text-center py-4">No companies selected yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: QUESTION BANK                                                      */}
      {/* ========================================================================= */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Curriculum Question Bank ({questions.length})</h3>
            <button
              onClick={() => setActiveTab('add_question')}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> Add New Question
            </button>
          </div>

          <div className="space-y-3">
            {questions.map((q) => (
              <div key={q.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                      {q.subject_name}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                      {q.topic_name}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] text-cyan-400 bg-cyan-500/10">
                      {q.difficulty}
                    </span>
                    <span className="text-[10px] text-slate-400">{q.company_name}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">{q.question}</h4>
                  <div className="text-xs text-slate-400">
                    Correct Option: <strong className="text-emerald-400">{q.correct_answer}</strong> • Expected: {q.expected_time}s
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Delete question"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ADD QUESTION FORM                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'add_question' && (
        <div className="max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <h3 className="text-lg font-bold text-white">Add Curriculum Question to Question Bank</h3>

          {formSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{formSuccess}</span>
            </div>
          )}

          <form onSubmit={handleCreateQuestion} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Question Prompt</label>
              <textarea
                required
                rows={3}
                value={newQText}
                onChange={(e) => setNewQText(e.target.value)}
                placeholder="State the technical interview question clearly..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                <select
                  value={newQSubject}
                  onChange={(e) => setNewQSubject(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none"
                >
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Topic</label>
                <select
                  value={newQTopic}
                  onChange={(e) => setNewQTopic(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none"
                >
                  {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Company Tag</label>
                <select
                  value={newQCompany}
                  onChange={(e) => setNewQCompany(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none"
                >
                  <option value="">Universal / General</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
                <select
                  value={newQDifficulty}
                  onChange={(e) => setNewQDifficulty(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Correct Answer</label>
                <select
                  value={newQCorrect}
                  onChange={(e) => setNewQCorrect(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none"
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Answer Options</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Option A"
                  value={optA}
                  onChange={(e) => setOptA(e.target.value)}
                  className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="Option B"
                  value={optB}
                  onChange={(e) => setOptB(e.target.value)}
                  className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="Option C"
                  value={optC}
                  onChange={(e) => setOptC(e.target.value)}
                  className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="Option D"
                  value={optD}
                  onChange={(e) => setOptD(e.target.value)}
                  className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Explanation</label>
              <textarea
                rows={2}
                value={newQExplanation}
                onChange={(e) => setNewQExplanation(e.target.value)}
                placeholder="Explain the technical concept behind this question..."
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Add Question to Pool
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: CAMPUS DRIVE ALERTS                                                */}
      {/* ========================================================================= */}
      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Megaphone size={16} className="text-cyan-400" />
              <span>Broadcast Placement Alert</span>
            </h4>
            <p className="text-xs text-slate-400">
              Publish recruitment notifications, assessment schedules, or interview reminders to students.
            </p>

            {annSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 size={15} />
                <span>{annSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateAnnouncement} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Alert Headline</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. TCS NQT Registration Closing Soon"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Announcement Details</label>
                <textarea
                  required
                  rows={3}
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  placeholder="State round structure, eligibility criteria, or prep instructions..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={annCategory}
                    onChange={(e) => setAnnCategory(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none"
                  >
                    <option value="DRIVE">Campus Drive</option>
                    <option value="WORKSHOP">Prep Workshop</option>
                    <option value="URGENT">Urgent Notice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={annPriority}
                    onChange={(e) => setAnnPriority(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none"
                  >
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Normal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Company (Optional)</label>
                  <input
                    type="text"
                    value={annCompany}
                    onChange={(e) => setAnnCompany(e.target.value)}
                    placeholder="e.g. TCS / Infosys"
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Drive Date</label>
                  <input
                    type="text"
                    value={annDeadline}
                    onChange={(e) => setAnnDeadline(e.target.value)}
                    placeholder="e.g. Oct 28, 2026"
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send size={13} />
                <span>Publish Broadcast</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-bold text-white">Active Placement Broadcasts ({announcements.length})</h4>
            {announcements.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 text-xs">
                No active announcements published yet.
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map((a) => (
                  <div key={a.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          a.priority === 'HIGH' ? 'bg-rose-500/20 text-rose-300' : 'bg-cyan-500/20 text-cyan-300'
                        }`}>
                          {a.category || 'DRIVE'}
                        </span>
                        {a.company_name && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-bold">
                            {a.company_name}
                          </span>
                        )}
                        {a.deadline && (
                          <span className="text-[10px] text-amber-400 flex items-center gap-1">
                            <Calendar size={10} /> {a.deadline}
                          </span>
                        )}
                      </div>
                      <h5 className="text-sm font-bold text-white">{a.title}</h5>
                      <p className="text-xs text-slate-300 leading-relaxed">{a.message}</p>
                      <span className="text-[10px] text-slate-500 block">
                        Published by {a.created_by || 'Dean Office'} • {new Date(a.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteAnnouncement(a.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Remove announcement"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: APPOINT NEW PLACEMENT DEAN / OFFICER                             */}
      {/* ========================================================================= */}
      {showAppointModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl relative">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-amber-400" />
                  <h3 className="text-lg font-bold text-white">Appoint New Placement Dean / Officer</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Grant administrative Dean governance privileges to a faculty or training coordinator.
                </p>
              </div>
              <button
                onClick={() => setShowAppointModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {appointError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{appointError}</span>
              </div>
            )}

            <form onSubmit={handleAppointFaculty} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Faculty Full Name</label>
                <input
                  type="text"
                  required
                  value={appointName}
                  onChange={(e) => setAppointName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Verma"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Institutional Email</label>
                <input
                  type="email"
                  required
                  value={appointEmail}
                  onChange={(e) => setAppointEmail(e.target.value)}
                  placeholder="e.g. rajesh.verma@careerprep.ai"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={appointDepartment}
                    onChange={(e) => setAppointDepartment(e.target.value)}
                    placeholder="Training & Placement Cell"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    value={appointDesignation}
                    onChange={(e) => setAppointDesignation(e.target.value)}
                    placeholder="Associate Placement Dean"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  value={appointPassword}
                  onChange={(e) => setAppointPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-[11px] text-slate-300 leading-relaxed">
                <strong className="text-amber-400">Institutional Authority:</strong> Appointed members will have full rights to inspect candidates, kick out accounts, and moderate question banks.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAppointModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={appointLoading}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-extrabold flex items-center gap-2 cursor-pointer"
                >
                  <span>{appointLoading ? 'Appointing...' : 'Appoint as Dean'}</span>
                  <BadgeCheck size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: STUDENT PROGRESS DOSSIER                                         */}
      {/* ========================================================================= */}
      {selectedStudentId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">
                      {studentDossier?.student.name || 'Candidate Progress Dossier'}
                    </h3>
                    {studentDossier?.student.is_new_joinee && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-cyan-400 text-slate-950">
                        NEW JOINEE
                      </span>
                    )}
                    {studentDossier?.student.is_blocked && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        BLOCKED
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">
                    {studentDossier?.student.email} • {studentDossier?.student.branch_name} ({studentDossier?.student.year})
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedStudentId(null);
                  setStudentDossier(null);
                }}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
              {loadingDossier ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                  <span className="text-xs text-slate-400">Loading candidate test history and topic analytics...</span>
                </div>
              ) : studentDossier ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 col-span-2 sm:col-span-1 text-center flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-indigo-300 block">Readiness Index</span>
                      <span className="text-3xl font-extrabold text-white mt-1">
                        {studentDossier.readiness_score}/100
                      </span>
                      <span className="text-[10px] text-cyan-400 block mt-0.5">Placement Benchmark</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 block">Overall Accuracy</span>
                      <span className="text-xl font-extrabold text-emerald-400 mt-1">
                        {studentDossier.summary.overall_accuracy}%
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {studentDossier.summary.correct_count} of {studentDossier.summary.total_attempted} correct
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 block">Total XP Earned</span>
                      <span className="text-xl font-extrabold text-amber-400 mt-1">
                        {studentDossier.student.total_xp} XP
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Level {studentDossier.student.current_level} Candidate
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 block">Prep Streak</span>
                      <span className="text-xl font-extrabold text-orange-400 mt-1">
                        {studentDossier.student.current_streak} Days
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Best: {studentDossier.student.longest_streak}d
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 block">Avg Response Speed</span>
                      <span className="text-xl font-extrabold text-cyan-400 mt-1">
                        {studentDossier.summary.avg_time_per_question}s
                      </span>
                      <span className="text-[10px] text-slate-500 block">Per technical MCQ</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <BookOpen size={14} className="text-indigo-400" />
                      <span>Subject Competency Breakdown</span>
                    </h4>

                    {studentDossier.subject_breakdown.length === 0 ? (
                      <div className="text-xs text-slate-500 py-2">No subject attempts logged yet.</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {studentDossier.subject_breakdown.map((sub: any) => (
                          <div key={sub.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="text-white">{sub.name}</span>
                              <span className={sub.accuracy >= 70 ? 'text-emerald-400' : sub.accuracy >= 40 ? 'text-amber-400' : 'text-rose-400'}>
                                {sub.accuracy}% ({sub.correct}/{sub.attempted})
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  sub.accuracy >= 70 ? 'bg-emerald-500' : sub.accuracy >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${sub.accuracy}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2.5">
                      <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                        <AlertTriangle size={14} />
                        <span>Critical Weak Topics (Need Faculty Intervention)</span>
                      </h4>
                      {studentDossier.weak_topics.length === 0 ? (
                        <div className="text-xs text-slate-500 py-2">No weaknesses recorded.</div>
                      ) : (
                        <div className="space-y-1.5">
                          {studentDossier.weak_topics.map((t: any) => (
                            <div key={t.topic_id} className="p-2 rounded-lg bg-slate-950/80 flex items-center justify-between text-xs">
                              <span className="text-slate-200 font-semibold">{t.topic_name}</span>
                              <span className="text-rose-400 font-bold">{t.accuracy}% Accuracy</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2.5">
                      <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                        <Award size={14} />
                        <span>Mastered Topics (Placement Ready)</span>
                      </h4>
                      {studentDossier.strong_topics.length === 0 ? (
                        <div className="text-xs text-slate-500 py-2">Mastered topics will appear after quizzes.</div>
                      ) : (
                        <div className="space-y-1.5">
                          {studentDossier.strong_topics.map((t: any) => (
                            <div key={t.topic_id} className="p-2 rounded-lg bg-slate-950/80 flex items-center justify-between text-xs">
                              <span className="text-slate-200 font-semibold">{t.topic_name}</span>
                              <span className="text-emerald-400 font-bold">{t.accuracy}% Accuracy</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Clock size={14} className="text-cyan-400" />
                      <span>Recent Assessment Sessions ({studentDossier.recent_sessions.length})</span>
                    </h4>

                    {studentDossier.recent_sessions.length === 0 ? (
                      <div className="text-xs text-slate-500 py-2">No quiz sessions on record yet.</div>
                    ) : (
                      <div className="space-y-2">
                        {studentDossier.recent_sessions.map((sess: any) => (
                          <div key={sess.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white uppercase">{sess.quiz_type}</span>
                                <span className={`px-2 py-0.2 rounded-full text-[9px] font-extrabold ${
                                  sess.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                                }`}>
                                  {sess.status}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-500">{sess.date_formatted}</span>
                            </div>

                            <div className="text-right">
                              <span className="text-sm font-extrabold text-white">
                                {sess.score} / {sess.total_questions}
                              </span>
                              <span className="text-[10px] text-slate-400 block">{sess.time_taken_seconds}s spent</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <HelpCircle size={14} className="text-indigo-400" />
                      <span>Question Attempt Log</span>
                    </h4>

                    {studentDossier.recent_attempts.length === 0 ? (
                      <div className="text-xs text-slate-500 py-2">No attempt logs recorded yet.</div>
                    ) : (
                      <div className="space-y-2">
                        {studentDossier.recent_attempts.map((att: any) => (
                          <div key={att.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800/70 text-xs space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                                  {att.subject_name}
                                </span>
                                <span className="text-slate-400 text-[10px]">{att.topic_name}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                att.is_correct ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                              }`}>
                                {att.is_correct ? 'CORRECT' : 'INCORRECT'}
                              </span>
                            </div>

                            <p className="text-slate-200 font-semibold line-clamp-2">{att.question_text}</p>
                            <div className="text-[11px] text-slate-400 flex items-center gap-3">
                              <span>Selected: <strong className="text-white">{att.user_answer}</strong></span>
                              <span>Correct: <strong className="text-emerald-400">{att.correct_answer}</strong></span>
                              <span>Time: {att.time_spent_seconds}s</span>
                              <span className="text-slate-500">{att.date_formatted}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            {studentDossier && (
              <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStudentStatus(studentDossier.student.id, studentDossier.student.is_blocked, studentDossier.student.name)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                      studentDossier.student.is_blocked
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold'
                    }`}
                  >
                    {studentDossier.student.is_blocked ? (
                      <>
                        <CheckCircle2 size={14} />
                        <span>Unblock Profile</span>
                      </>
                    ) : (
                      <>
                        <Ban size={14} />
                        <span>Suspend Access</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleKickOutStudent(studentDossier.student.id, studentDossier.student.name)}
                    className="px-3 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <UserX size={14} />
                    <span>Kick Out Candidate</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setSelectedStudentId(null);
                    setStudentDossier(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Close Dossier
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
