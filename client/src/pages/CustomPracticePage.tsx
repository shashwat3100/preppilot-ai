import React, { useState, useEffect } from 'react';
import api from '../services/api';
import type { Branch, Company, JobRole, Subject, Topic, QuizSession } from '../types';
import { Sliders, Check, ArrowRight, AlertCircle } from 'lucide-react';

interface CustomPracticePageProps {
  onStartQuiz: (session: QuizSession) => void;
}

export const CustomPracticePage: React.FC<CustomPracticePageProps> = ({ onStartQuiz }) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  // Filter selections
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string>('All');
  const [questionCount, setQuestionCount] = useState<number>(5);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [bRes, cRes, rRes, sRes, tRes] = await Promise.all([
          api.getBranches(),
          api.getCompanies(),
          api.getJobRoles(),
          api.getSubjects(),
          api.getTopics()
        ]);

        if (bRes.success) setBranches(bRes.branches);
        if (cRes.success) setCompanies(cRes.companies);
        if (rRes.success) setJobRoles(rRes.roles);
        if (sRes.success) setSubjects(sRes.subjects);
        if (tRes.success) setTopics(tRes.topics);
      } catch (err) {
        console.error('Error loading custom filters:', err);
      }
    };
    loadFilters();
  }, []);

  const toggleSubject = (subId: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subId) ? prev.filter(id => id !== subId) : [...prev, subId]
    );
  };

  const toggleTopic = (topId: string) => {
    setSelectedTopics(prev =>
      prev.includes(topId) ? prev.filter(id => id !== topId) : [...prev, topId]
    );
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.startCustomQuiz({
        branch_id: selectedBranch || undefined,
        company_id: selectedCompany || undefined,
        job_role_id: selectedRole || undefined,
        subject_ids: selectedSubjects.length > 0 ? selectedSubjects : undefined,
        topic_ids: selectedTopics.length > 0 ? selectedTopics : undefined,
        difficulty: difficulty !== 'All' ? difficulty : undefined,
        question_count: questionCount
      });

      if (res.success && res.quiz) {
        onStartQuiz(res.quiz);
      } else {
        setError(res.message || 'No questions found for the given criteria.');
      }
    } catch (err: any) {
      setError(err.message || 'Error generating custom quiz session.');
    } finally {
      setLoading(false);
    }
  };

  // Filter topics based on selected subjects if any
  const displayedTopics = selectedSubjects.length > 0
    ? topics.filter(t => selectedSubjects.includes(t.subject_id))
    : topics;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Sliders size={20} />
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Custom Practice Quiz Builder
          </h1>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Target specific engineering branches, company patterns, subjects, topics, and difficulty levels.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleGenerate} className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-4 sm:p-8 space-y-6 sm:space-y-8 shadow-xl">
        {/* Row 1: Branch, Company, Role */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
              Engineering Branch
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2.5 bg-[var(--surface-elevated)] border border-[var(--surface-border)] rounded-xl text-xs text-[var(--text-primary)] focus:border-indigo-500 outline-none cursor-pointer"
            >
              <option value="">All Supported Branches</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
              Target Company Pattern
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-3 py-2.5 bg-[var(--surface-elevated)] border border-[var(--surface-border)] rounded-xl text-xs text-[var(--text-primary)] focus:border-indigo-500 outline-none cursor-pointer"
            >
              <option value="">Universal / All Companies</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.tier})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
              Job Role Focus
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2.5 bg-[var(--surface-elevated)] border border-[var(--surface-border)] rounded-xl text-xs text-[var(--text-primary)] focus:border-indigo-500 outline-none cursor-pointer"
            >
              <option value="">All Technical Roles</option>
              {jobRoles.map(r => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Multi-select Subjects */}
        <div className="space-y-3 pt-2 border-t border-[var(--surface-border)]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Select Subjects (Multi-Select Supported)
            </label>
            <span className="text-[11px] text-cyan-500 dark:text-cyan-400">
              {selectedSubjects.length === 0 ? 'All Subjects Included' : `${selectedSubjects.length} selected`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {subjects.map(s => {
              const selected = selectedSubjects.includes(s.id);
              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => toggleSubject(s.id)}
                  className={`p-3 rounded-xl text-xs font-semibold border flex items-center justify-between text-left transition-all cursor-pointer ${
                    selected
                      ? 'bg-indigo-600/15 border-indigo-500 text-[var(--text-primary)] shadow-md ring-1 ring-indigo-500/30'
                      : 'bg-[var(--surface-elevated)] border-[var(--surface-border)] text-[var(--text-secondary)] hover:border-indigo-400 hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span className="truncate pr-1">{s.name}</span>
                  {selected && <Check size={14} className="text-indigo-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Multi-select Topics */}
        {displayedTopics.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-[var(--surface-border)]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Specific Topic Focus (Optional)
              </label>
              <span className="text-[11px] text-[var(--text-secondary)]">
                {selectedTopics.length === 0 ? 'All Topics' : `${selectedTopics.length} selected`}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
              {displayedTopics.map(t => {
                const selected = selectedTopics.includes(t.id);
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => toggleTopic(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      selected
                        ? 'bg-cyan-500/20 text-cyan-500 dark:text-cyan-300 border-cyan-500/50'
                        : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] border-[var(--surface-border)] hover:border-slate-500 hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Row 4: Difficulty & Count */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-[var(--surface-border)]">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-2">
              Difficulty Calibration
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['All', 'Easy', 'Medium', 'Hard'].map(d => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    difficulty === d
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm'
                      : 'bg-[var(--surface-elevated)] border-[var(--surface-border)] text-[var(--text-secondary)] hover:border-slate-500 hover:text-[var(--text-primary)]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-2">
              Number of Questions: <span className="text-cyan-500 dark:text-cyan-400 font-bold">{questionCount}</span>
            </label>
            <input
              type="range"
              min={3}
              max={15}
              step={1}
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1">
              <span>3 Qs (Quick Drill)</span>
              <span>10 Qs (Standard)</span>
              <span>15 Qs (Full Mock)</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-[var(--surface-border)] flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
          >
            <span>{loading ? 'Assembling Custom Quiz...' : 'Generate Custom Quiz'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomPracticePage;
