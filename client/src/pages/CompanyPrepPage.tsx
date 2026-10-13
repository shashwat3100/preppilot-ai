import React, { useState, useEffect } from 'react';
import api from '../services/api';
import type { Company, Question } from '../types';
import {
  Building2,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Layers,
  BookOpen
} from 'lucide-react';

interface CompanyPrepPageProps {
  onStartCompanyQuiz: (companyId: string) => void;
}

export const CompanyPrepPage: React.FC<CompanyPrepPageProps> = ({ onStartCompanyQuiz }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [companyDetails, setCompanyDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.getCompanies();
        if (res.success && res.companies) {
          setCompanies(res.companies);
        }
      } catch (err) {
        console.error('Error fetching companies:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const handleSelectCompany = async (id: string) => {
    setSelectedCompanyId(id);
    setDetailsLoading(true);
    try {
      const res = await api.getCompanyDetails(id);
      if (res.success && res.company) {
        setCompanyDetails(res.company);
      }
    } catch (err) {
      console.error('Error fetching company details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Page Header with Disclaimers */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Building2 size={22} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Company-Oriented Placement Preparation
          </h1>
        </div>
        <p className="text-sm text-[var(--text-secondary)] max-w-3xl">
          Prepare for targeted recruitment drives using curated <strong>Company Pattern Questions</strong>, hiring round simulations, and frequently tested technical viva concepts.
        </p>

        {/* Regulatory Project Disclaimer */}
        <div className="p-3.5 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)] text-xs text-[var(--text-secondary)] flex items-start gap-2.5">
          <ShieldAlert size={16} className="text-cyan-500 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Academic Integrity Notice:</strong> Questions represent <em>Company-Oriented Practice Questions</em> and <em>Frequently Tested Recruitment Patterns</em> reconstructed from campus placement memory and interview reports. They are not guaranteed exact questions from proprietary hiring drives.
          </span>
        </div>
      </div>

      {/* Main Grid: Companies List OR Selected Company Deep-Dive */}
      {!selectedCompanyId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((c) => (
            <div
              key={c.id}
              className="p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] hover:border-indigo-500/40 hover:bg-[var(--surface-hover)] transition-all flex flex-col justify-between group shadow-lg"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-cyan-500 dark:text-cyan-400 flex items-center justify-center font-bold text-sm">
                      {c.name.substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors">
                        {c.name}
                      </h3>
                      <span className="text-[11px] text-[var(--text-secondary)]">{c.tier}</span>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--text-secondary)] font-medium border border-[var(--surface-border)]">
                    {c.difficulty_level || 'Moderate'}
                  </span>
                </div>

                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                  {c.pattern_description}
                </p>

                {/* Hiring Rounds */}
                <div className="space-y-1.5 pt-2 border-t border-[var(--surface-border)]">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                    Hiring Process:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {c.hiring_rounds.map((round, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--surface-border)]">
                        {idx + 1}. {round}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[var(--surface-border)] mt-6 flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)]">
                  {c.question_count || 10}+ pattern items
                </span>
                <button
                  onClick={() => handleSelectCompany(c.id)}
                  className="px-4 py-2 rounded-xl bg-indigo-600/15 hover:bg-indigo-600 text-indigo-400 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Explore Track</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Selected Company View */
        <div className="space-y-6 animate-in fade-in">
          <button
            onClick={() => { setSelectedCompanyId(null); setCompanyDetails(null); }}
            className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors cursor-pointer"
          >
            ← Back to all recruitment tracks
          </button>

          {detailsLoading ? (
            <div className="p-12 text-center text-[var(--text-secondary)] text-xs">Loading company blueprint...</div>
          ) : companyDetails ? (
            <div className="space-y-8">
              {/* Header Overview Card */}
              <div className="p-6 sm:p-8 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">{companyDetails.name}</h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-500 dark:text-cyan-300 border border-cyan-500/30 font-semibold">
                      {companyDetails.tier}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                    {companyDetails.pattern_description}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onStartCompanyQuiz(companyDetails.id)}
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles size={16} />
                    <span>Launch {companyDetails.name} Pattern Quiz</span>
                  </button>
                </div>
              </div>

              {/* Hiring Rounds Timeline */}
              <div className="p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-4">
                <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Layers size={16} className="text-cyan-500 dark:text-cyan-400" />
                  <span>Standard Recruitment Blueprint</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {companyDetails.hiring_rounds?.map((round: string, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] space-y-1">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase">Round {idx + 1}</span>
                      <h4 className="text-xs font-bold text-[var(--text-primary)]">{round}</h4>
                    </div>
                  ))}
                </div>
              </div>

              {/* Questions Bank for this Company */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <BookOpen size={16} className="text-purple-400" />
                    <span>Frequently Tested Practice Items</span>
                  </h3>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {companyDetails.questions?.length || 0} questions available
                  </span>
                </div>

                <div className="space-y-3">
                  {companyDetails.questions && companyDetails.questions.length > 0 ? (
                    companyDetails.questions.map((q: Question) => (
                      <div
                        key={q.id}
                        className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] hover:border-indigo-500/30 transition-all space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400">
                              {q.subject_name}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--surface-border)]">
                              {q.topic_name}
                            </span>
                            <span className="text-[10px] text-[var(--text-secondary)]">
                              Difficulty: {q.difficulty}
                            </span>
                          </div>
                          <span className="text-[11px] text-cyan-500 dark:text-cyan-400 font-semibold">
                            Exp. time: {q.expected_time}s
                          </span>
                        </div>

                        <h4 className="text-sm font-semibold text-[var(--text-primary)] leading-relaxed">
                          {q.question}
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                          {q.options?.map((opt) => (
                            <div key={opt.option_key} className="p-2.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-[var(--text-secondary)] flex items-center gap-2">
                              <span className="font-bold text-[var(--text-primary)]">{opt.option_key}.</span>
                              <span>{opt.option_text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-[var(--text-secondary)] text-xs bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-xl">
                      Additional pattern questions are being indexed for this company.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default CompanyPrepPage;
