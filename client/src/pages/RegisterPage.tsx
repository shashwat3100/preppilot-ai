import React, { useState, useEffect } from 'react';
import { CareerPrepLogo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import type { Branch, Company, JobRole } from '../types';
import { User, Mail, Lock, ArrowRight, AlertCircle, Check } from 'lucide-react';

interface RegisterPageProps {
  onSuccess: () => void;
  onGoToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSuccess, onGoToLogin }) => {
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [branchId, setBranchId] = useState('branch-cse');
  const [year, setYear] = useState('4th Year');
  const [graduationYear, setGraduationYear] = useState('2026');
  const [jobRoleId, setJobRoleId] = useState('role-sde');
  const [targetCompanies, setTargetCompanies] = useState<string[]>(['comp-tcs', 'comp-infosys']);
  const [skillLevel, setSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [areasOfInterest, setAreasOfInterest] = useState<string[]>(['DBMS', 'DSA', 'Operating Systems']);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bRes, cRes, rRes] = await Promise.all([
          api.getBranches(),
          api.getCompanies(),
          api.getJobRoles()
        ]);
        if (bRes.success) setBranches(bRes.branches);
        if (cRes.success) setCompanies(cRes.companies);
        if (rRes.success) setJobRoles(rRes.roles);
      } catch (err) {
        console.error('Error loading registration metadata:', err);
      }
    };
    fetchData();
  }, []);

  const toggleCompany = (companyId: string) => {
    setTargetCompanies(prev =>
      prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  const toggleInterest = (interest: string) => {
    setAreasOfInterest(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all core credentials.');
      return;
    }
    if (targetCompanies.length === 0) {
      setError('Please select at least one target company.');
      return;
    }

    setError('');
    setLoading(true);

    const res = await register({
      name,
      email,
      password,
      branch_id: branchId,
      year,
      graduation_year: parseInt(graduationYear),
      preferred_job_role_id: jobRoleId,
      target_companies: targetCompanies,
      skill_level: skillLevel,
      areas_of_interest: areasOfInterest
    });

    setLoading(false);

    if (res.success) {
      onSuccess();
    } else {
      setError(res.message || 'Registration failed.');
    }
  };

  const availableInterests = [
    'DSA', 'DBMS', 'Operating Systems', 'Computer Networks', 'OOP', 'SQL',
    'System Design', 'Web Dev', 'Digital Electronics', 'Microprocessors',
    'Thermodynamics', 'Quantitative Aptitude'
  ];

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <CareerPrepLogo size="md" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Create Your B.Tech Placement Profile
          </h2>
          <p className="text-xs text-slate-400">
            Personalizing interview preparation, recommendation algorithms and daily adaptive quizzes
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-8 rounded-2xl shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Core Credentials */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                1. Account Credentials
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <User size={15} />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Aditya Sharma"
                      className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail size={15} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="aditya@college.edu"
                      className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock size={15} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Academic Details */}
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                2. Academic & Branch Profile
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">B.Tech Branch</label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-indigo-500 outline-none"
                  >
                    {branches.length > 0 ? (
                      branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))
                    ) : (
                      <option value="branch-cse">Computer Science Engineering (CSE)</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Year of Study</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-indigo-500 outline-none"
                  >
                    <option value="4th Year">4th Year (Final Year)</option>
                    <option value="3rd Year">3rd Year (Pre-Final)</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="1st Year">1st Year</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Graduation Year</label>
                  <select
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-indigo-500 outline-none"
                  >
                    <option value="2026">2026 Batch</option>
                    <option value="2025">2025 Batch</option>
                    <option value="2027">2027 Batch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Job Role</label>
                  <select
                    value={jobRoleId}
                    onChange={(e) => setJobRoleId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-indigo-500 outline-none"
                  >
                    {jobRoles.length > 0 ? (
                      jobRoles.map(r => (
                        <option key={r.id} value={r.id}>{r.title}</option>
                      ))
                    ) : (
                      <option value="role-sde">Software Development Engineer (SDE)</option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Target Companies */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  3. Target Companies (Select 1 or more)
                </h3>
                <span className="text-[11px] text-cyan-400">{targetCompanies.length} selected</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {companies.map(c => {
                  const selected = targetCompanies.includes(c.id);
                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => toggleCompany(c.id)}
                      className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center justify-between transition-all ${
                        selected
                          ? 'bg-indigo-600/20 border-cyan-400 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span>{c.name}</span>
                      {selected && <Check size={14} className="text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 4: Skill Level & Areas of Interest */}
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                4. Skill Level & Interests
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Self-Assessed Skill Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Beginner', 'Intermediate', 'Advanced'] as const).map(lvl => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setSkillLevel(lvl)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        skillLevel === lvl
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Areas of Interest</label>
                <div className="flex flex-wrap gap-1.5">
                  {availableInterests.map(item => {
                    const sel = areasOfInterest.includes(item);
                    return (
                      <button
                        type="button"
                        key={item}
                        onClick={() => toggleInterest(item)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          sel
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-sm font-bold shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              <span>{loading ? 'Creating Your Profile...' : 'Complete Registration & Start Preparing'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <button
                onClick={onGoToLogin}
                className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
