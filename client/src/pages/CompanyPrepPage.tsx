import React, { useState, useEffect } from 'react';
import api from '../services/api';
import type { Company, Question } from '../types';
import {
  Building2,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Layers,
  BookOpen,
  Code2,
  Briefcase,
  Search,
  CheckCircle2,
  ExternalLink,
  Target,
  Award,
  Zap,
  ArrowRight,
  Eye,
  EyeOff,
  Clock,
  GraduationCap
} from 'lucide-react';

interface CompanyPrepPageProps {
  onStartCompanyQuiz: (companyId: string) => void;
  onNavigateToCoding?: (problemId?: string) => void;
}

export const CompanyPrepPage: React.FC<CompanyPrepPageProps> = ({ 
  onStartCompanyQuiz,
  onNavigateToCoding
}) => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [companyDetails, setCompanyDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'blueprint' | 'questions' | 'coding'>('blueprint');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'PRODUCT' | 'SERVICES' | 'CONSULTING'>('ALL');
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

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
    setActiveTab('blueprint');
    setRevealedAnswers({});
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

  const toggleAnswerReveal = (questionId: string) => {
    setRevealedAnswers(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.pattern_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tier.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'PRODUCT') return c.tier.toLowerCase().includes('product') || c.tier.toLowerCase().includes('faang');
    if (selectedCategory === 'SERVICES') return c.tier.toLowerCase().includes('service');
    if (selectedCategory === 'CONSULTING') return c.tier.toLowerCase().includes('consulting');
    return true;
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[var(--text-secondary)]">Loading company tracks & hiring blueprints...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Company-Specific Placement Preparation
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
              Targeted recruitment drive blueprints, verified CTC tiers, eligibility criteria, and authentic pattern questions.
            </p>
          </div>
        </div>

        {/* Regulatory Project Disclaimer */}
        <div className="p-3.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] text-xs text-[var(--text-secondary)] flex items-start gap-2.5 shadow-sm">
          <ShieldAlert size={16} className="text-cyan-500 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Academic Placement Notice:</strong> Syllabi, recruitment patterns, and question formats are curated from university memory and student interview debriefs. They accurately reflect verified recruitment round standards for B.Tech placement readiness.
          </span>
        </div>
      </div>

      {/* Main Content: Companies List OR Selected Company View */}
      {!selectedCompanyId ? (
        <div className="space-y-6">
          {/* Search & Category Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)]">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search recruiters (e.g. TCS, Amazon, Infosys)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {(['ALL', 'PRODUCT', 'SERVICES', 'CONSULTING'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--surface-border)]'
                  }`}
                >
                  {cat === 'ALL' ? 'All Recruiters' : cat === 'PRODUCT' ? 'Tier-1 Product' : cat === 'SERVICES' ? 'IT Services' : 'Consulting'}
                </button>
              ))}
            </div>
          </div>

          {/* Companies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((c) => (
              <div
                key={c.id}
                className="p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] hover:border-indigo-500/40 hover:bg-[var(--surface-hover)] transition-all flex flex-col justify-between group shadow-sm hover:shadow-lg"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/10 border border-indigo-500/30 text-cyan-400 flex items-center justify-center font-extrabold text-sm shadow-inner">
                        {c.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors">
                          {c.name}
                        </h3>
                        <span className="text-[11px] text-[var(--text-secondary)] block">{c.tier}</span>
                      </div>
                    </div>
                    {c.ctc_breakdown?.min_lpa && (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold whitespace-nowrap">
                        ₹{c.ctc_breakdown.min_lpa} - {c.ctc_breakdown.max_lpa} LPA
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                    {c.pattern_description}
                  </p>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--surface-border)]">
                    <div className="p-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)]">
                      <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase block">Practice Items</span>
                      <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5 mt-0.5">
                        <BookOpen size={12} className="text-indigo-400" />
                        {c.question_count || 0} Questions
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)]">
                      <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase block">Coding Arena</span>
                      <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5 mt-0.5">
                        <Code2 size={12} className="text-cyan-400" />
                        {c.coding_problem_count || 1}+ Challenges
                      </span>
                    </div>
                  </div>

                  {/* Rounds preview */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                      Hiring Stages:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {c.hiring_rounds?.slice(0, 3).map((round: string, idx: number) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--surface-border)]">
                          {round}
                        </span>
                      ))}
                      {c.hiring_rounds?.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded text-[var(--text-muted)]">
                          +{c.hiring_rounds.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-5 border-t border-[var(--surface-border)] mt-5 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-cyan-500 dark:text-cyan-400">
                    {c.difficulty_level || 'Moderate to High'}
                  </span>
                  <button
                    onClick={() => handleSelectCompany(c.id)}
                    className="px-4 py-2 rounded-xl bg-indigo-600/15 hover:bg-indigo-600 text-indigo-400 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>View Blueprint</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Selected Company View */
        <div className="space-y-6 animate-in fade-in">
          <button
            onClick={() => { setSelectedCompanyId(null); setCompanyDetails(null); }}
            className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 transition-colors cursor-pointer group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
            <span>Back to All Recruitment Tracks</span>
          </button>

          {detailsLoading ? (
            <div className="p-16 text-center text-[var(--text-secondary)] text-xs flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              <span>Loading company blueprint, CTC packages, and technical questions...</span>
            </div>
          ) : companyDetails ? (
            <div className="space-y-6">
              {/* Header Overview Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[var(--surface-card)] via-[var(--surface-card)] to-indigo-950/20 border border-[var(--surface-border)] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-cyan-500/20 border border-indigo-500/40 text-cyan-300 flex items-center justify-center font-extrabold text-base shadow-inner">
                      {companyDetails.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
                        {companyDetails.name}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                          {companyDetails.tier}
                        </span>
                        {companyDetails.ctc_breakdown?.min_lpa && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                            ₹{companyDetails.ctc_breakdown.min_lpa} - {companyDetails.ctc_breakdown.max_lpa} LPA Package
                          </span>
                        )}
                        {companyDetails.selection_ratio && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium">
                            {companyDetails.selection_ratio}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-3xl leading-relaxed">
                    {companyDetails.pattern_description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => onStartCompanyQuiz(companyDetails.id)}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition-all transform hover:-translate-y-0.5"
                  >
                    <Sparkles size={16} />
                    <span>Launch {companyDetails.name} Pattern Quiz</span>
                  </button>
                  {companyDetails.coding_problems?.length > 0 && onNavigateToCoding && (
                    <button
                      onClick={() => onNavigateToCoding()}
                      className="px-5 py-3 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] text-cyan-400 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <Code2 size={16} />
                      <span>Solve Coding Problems ({companyDetails.coding_problems.length})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-[var(--surface-border)] gap-2">
                <button
                  onClick={() => setActiveTab('blueprint')}
                  className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'blueprint'
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Layers size={16} />
                  <span>Hiring Blueprint & CTC Tiers</span>
                </button>
                <button
                  onClick={() => setActiveTab('questions')}
                  className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'questions'
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <BookOpen size={16} />
                  <span>Technical & Aptitude MCQs ({companyDetails.questions?.length || 0})</span>
                </button>
                <button
                  onClick={() => setActiveTab('coding')}
                  className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'coding'
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Code2 size={16} />
                  <span>Coding Challenges ({companyDetails.coding_problems?.length || 0})</span>
                </button>
              </div>

              {/* TAB 1: BLUEPRINT & TIERS */}
              {activeTab === 'blueprint' && (
                <div className="space-y-6">
                  {/* CTC Tiers Breakdown */}
                  {companyDetails.ctc_breakdown?.tiers && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Briefcase size={16} className="text-emerald-400" />
                        <span>Offered Career Roles & CTC Salary Tiers</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {companyDetails.ctc_breakdown.tiers.map((tier: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-sm space-y-2"
                          >
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                              Tier {idx + 1} Profile
                            </span>
                            <h4 className="text-sm font-bold text-[var(--text-primary)]">{tier.name}</h4>
                            <div className="text-base font-extrabold text-emerald-400">{tier.package}</div>
                            <p className="text-xs text-[var(--text-secondary)] pt-1 border-t border-[var(--surface-border)]">
                              {tier.role}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Campus Eligibility Criteria & Timeline */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {companyDetails.eligibility_criteria && (
                      <div className="p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-4">
                        <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                          <GraduationCap size={16} className="text-cyan-400" />
                          <span>Campus Eligibility Criteria</span>
                        </h3>
                        <div className="space-y-3 text-xs">
                          <div className="flex items-center justify-between pb-2 border-b border-[var(--surface-border)]">
                            <span className="text-[var(--text-secondary)]">Minimum CGPA Required</span>
                            <span className="font-bold text-[var(--text-primary)]">{companyDetails.eligibility_criteria.min_cgpa} CGPA</span>
                          </div>
                          <div className="flex items-center justify-between pb-2 border-b border-[var(--surface-border)]">
                            <span className="text-[var(--text-secondary)]">Active Backlogs Permitted</span>
                            <span className="font-bold text-[var(--text-primary)]">{companyDetails.eligibility_criteria.max_backlogs} Active Backlog</span>
                          </div>
                          <div className="space-y-1 pb-2 border-b border-[var(--surface-border)]">
                            <span className="text-[var(--text-secondary)] block">Eligible B.Tech Engineering Branches:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {companyDetails.eligibility_criteria.allowed_branches?.map((b: string) => (
                                <span key={b} className="px-2 py-0.5 rounded bg-[var(--surface-elevated)] border border-[var(--surface-border)] font-semibold text-[var(--text-primary)]">
                                  {b}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[var(--text-secondary)] block">Academic Gap Policy:</span>
                            <p className="text-[var(--text-muted)] italic leading-relaxed">
                              {companyDetails.eligibility_criteria.gap_criteria}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Timeline & Cutoffs */}
                    <div className="p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-4">
                      <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Clock size={16} className="text-purple-400" />
                        <span>Recruitment Timeline & Cutoffs</span>
                      </h3>
                      <div className="space-y-3 text-xs">
                        <div className="space-y-1 pb-2 border-b border-[var(--surface-border)]">
                          <span className="text-[var(--text-secondary)] block font-semibold">Drive Season & Schedule:</span>
                          <p className="text-[var(--text-primary)] font-medium leading-relaxed">
                            {companyDetails.hiring_timeline || 'Annual campus placement cycle.'}
                          </p>
                        </div>
                        <div className="space-y-1 pb-2 border-b border-[var(--surface-border)]">
                          <span className="text-[var(--text-secondary)] block font-semibold">Expected Cut-off Standards:</span>
                          <p className="text-cyan-400 font-semibold leading-relaxed">
                            {companyDetails.cutoff_scores || 'Sectional scores above 65%.'}
                          </p>
                        </div>
                        {companyDetails.interview_focus_areas && (
                          <div className="space-y-1">
                            <span className="text-[var(--text-secondary)] block font-semibold">High-Yield Technical Focus Areas:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {companyDetails.interview_focus_areas.map((fa: string) => (
                                <span key={fa} className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                                  {fa}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Standard Recruitment Rounds Blueprint */}
                  <div className="p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-4">
                    <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <Layers size={16} className="text-cyan-400" />
                      <span>Sequential Recruitment Rounds Workflow</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {companyDetails.hiring_rounds?.map((round: string, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--surface-border)] space-y-1.5 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase">Stage {idx + 1}</span>
                            <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-[10px] font-bold">
                              {idx + 1}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-[var(--text-primary)]">{round}</h4>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: TECHNICAL & APTITUDE MCQS */}
              {activeTab === 'questions' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">
                        Frequently Tested Pattern Questions ({companyDetails.questions?.length || 0})
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Curated multiple-choice questions matching this company's latest online assessment pattern.
                      </p>
                    </div>
                    <button
                      onClick={() => onStartCompanyQuiz(companyDetails.id)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles size={14} />
                      <span>Start Timed Quiz</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {companyDetails.questions && companyDetails.questions.length > 0 ? (
                      companyDetails.questions.map((q: Question) => {
                        const isRevealed = revealedAnswers[q.id];
                        return (
                          <div
                            key={q.id}
                            className="p-5 sm:p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-3.5 shadow-sm"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                                  {q.subject_name || 'Core CS'}
                                </span>
                                <span className="px-2.5 py-0.5 rounded text-[10px] bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--surface-border)] font-medium">
                                  {q.topic_name || 'Technical'}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  q.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-400' :
                                  q.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                                  'bg-rose-500/20 text-rose-400'
                                }`}>
                                  {q.difficulty}
                                </span>
                              </div>
                              <span className="text-[11px] text-cyan-400 font-semibold flex items-center gap-1">
                                <Clock size={12} />
                                Expected: {q.expected_time}s
                              </span>
                            </div>

                            <h4 className="text-sm font-semibold text-[var(--text-primary)] leading-relaxed whitespace-pre-line">
                              {q.question}
                            </h4>

                            {/* Options */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                              {q.options?.map((opt) => {
                                const isCorrectOpt = isRevealed && opt.option_key === q.correct_answer;
                                return (
                                  <div
                                    key={opt.option_key}
                                    className={`p-3 rounded-xl border transition-all flex items-start gap-2.5 ${
                                      isCorrectOpt
                                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                                        : 'bg-[var(--surface-elevated)] border-[var(--surface-border)] text-[var(--text-secondary)]'
                                    }`}
                                  >
                                    <span className="font-bold text-[var(--text-primary)]">{opt.option_key}.</span>
                                    <span>{opt.option_text}</span>
                                    {isCorrectOpt && (
                                      <CheckCircle2 size={14} className="text-emerald-400 ml-auto flex-shrink-0 mt-0.5" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Answer Reveal Accordion */}
                            <div className="pt-2 flex items-center justify-between border-t border-[var(--surface-border)]">
                              <button
                                onClick={() => toggleAnswerReveal(q.id)}
                                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                                <span>{isRevealed ? 'Hide Solution' : 'View Correct Answer & Explanation'}</span>
                              </button>
                              <span className="text-[11px] text-[var(--text-muted)] font-medium">
                                +{q.xp_value || 25} XP
                              </span>
                            </div>

                            {isRevealed && (
                              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs space-y-1 animate-in fade-in">
                                <div className="font-bold text-indigo-300">
                                  Correct Answer: Option {q.correct_answer}
                                </div>
                                <p className="text-[var(--text-secondary)] leading-relaxed">
                                  {q.explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center text-[var(--text-secondary)] text-xs bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl">
                        No pattern questions currently indexed for this track.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: COMPANY CODING CHALLENGES */}
              {activeTab === 'coding' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">
                        {companyDetails.name} Technical Programming Problems ({companyDetails.coding_problems?.length || 0})
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Solve real coding interview challenges tested in {companyDetails.name} technical assessment rounds.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {companyDetails.coding_problems && companyDetails.coding_problems.length > 0 ? (
                      companyDetails.coding_problems.map((prob: any) => (
                        <div
                          key={prob.id}
                          className="p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] hover:border-indigo-500/30 transition-all space-y-3.5 shadow-sm"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <h4 className="text-base font-extrabold text-[var(--text-primary)]">
                                {prob.title}
                              </h4>
                              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                prob.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-400' :
                                prob.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-rose-500/20 text-rose-400'
                              }`}>
                                {prob.difficulty}
                              </span>
                            </div>
                            {onNavigateToCoding && (
                              <button
                                onClick={() => onNavigateToCoding(prob.id)}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                              >
                                <span>Solve Challenge</span>
                                <ArrowRight size={14} />
                              </button>
                            )}
                          </div>

                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                            {prob.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {prob.tags?.map((t: string) => (
                              <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--surface-border)] font-medium">
                                #{t}
                              </span>
                            ))}
                            <span className="text-[10px] text-[var(--text-muted)] ml-auto">
                              Time Limit: {prob.timeLimit}ms • Memory: {prob.memoryLimit}MB
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-[var(--text-secondary)] text-xs bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl">
                        Coding challenges are being curated for this company.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default CompanyPrepPage;
