const getApiBase = (): string => {
  // If running via Vite dev server proxy (port 5173), use relative '/api'
  if (typeof window !== 'undefined' && window.location.port === '5173') {
    return '/api';
  }
  // If explicitly configured via Vite env
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // When running via VS Code "Go Live" (Live Server ports like 5500, 5501, etc.)
  // or opening via file/static server on localhost/127.0.0.1, direct API calls to the Express backend
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000/api';
  }
  return '/api';
};

const API_BASE = getApiBase();

const safeJson = async (res: Response) => {
  try {
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    if (data && typeof data === 'object') {
      if (!data.message && data.error) {
        data.message = data.error;
      }
      if (!data.error && data.message) {
        data.error = data.message;
      }
      if (!res.ok) {
        data.success = false;
        if (!data.message) {
          data.message = res.status === 404
            ? 'Endpoint not found (HTTP 404).'
            : res.status === 429
            ? 'Too many attempts. Please wait a moment before trying again.'
            : `Request failed (HTTP ${res.status}).`;
        }
      }
    }
    return data;
  } catch {
    return {
      success: false,
      message: res.status === 404
        ? 'Service endpoint not found (404). Please ensure the backend server is active.'
        : `Server communication error (HTTP ${res.status}).`
    };
  }
};

const safeFetch = async (url: string, options?: RequestInit): Promise<any> => {
  try {
    const res = await fetch(url, options);
    return await safeJson(res);
  } catch (err: any) {
    console.warn(`[API Network Disconnect] ${options?.method || 'GET'} ${url} unreachable:`, err?.message);
    return {
      success: false,
      isNetworkError: true,
      message: 'Backend server on port 5000 is not reachable. Live Server static mode is active.'
    };
  }
};

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('preppilot_token') || localStorage.getItem('careerprep_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth
  register: async (userData: any) => {
    return safeFetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
  },

  login: async (credentials: any) => {
    return safeFetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
  },

  getMe: async () => {
    return safeFetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
  },

  // Dashboard
  getDashboardStats: async () => {
    const res = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Quiz
  getQuizAssessments: async () => {
    const res = await fetch(`${API_BASE}/quiz/assessments`, {
      headers: getAuthHeaders()
    });
    return safeJson(res);
  },

  startQuizAssessment: async (type: string) => {
    const res = await fetch(`${API_BASE}/quiz/assessments/${type}/start`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return safeJson(res);
  },

  startAdaptiveDailyQuiz: async (count = 5) => {
    const res = await fetch(`${API_BASE}/quiz/adaptive-daily`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ count })
    });
    return res.json();
  },

  startCustomQuiz: async (filters: any) => {
    const res = await fetch(`${API_BASE}/quiz/custom`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(filters)
    });
    return res.json();
  },

  submitQuiz: async (sessionId: string, answers: any[], totalTimeTaken: number) => {
    const res = await fetch(`${API_BASE}/quiz/${sessionId}/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ answers, total_time_taken: totalTimeTaken })
    });
    return res.json();
  },

  getRecommendations: async (params: any = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/quiz/recommendations?${query}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Mistake Vault & Revision Drill
  getMistakeVault: async (params: { status?: string; subject_id?: string; search?: string } = {}) => {
    const cleanParams: Record<string, string> = {};
    if (params.status) cleanParams.status = params.status;
    if (params.subject_id) cleanParams.subject_id = params.subject_id;
    if (params.search) cleanParams.search = params.search;
    const query = new URLSearchParams(cleanParams).toString();
    const res = await fetch(`${API_BASE}/quiz/mistakes?${query}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  startMistakeDrill: async (count: number = 5, subjectId?: string) => {
    const res = await fetch(`${API_BASE}/quiz/mistakes/drill`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ count, subject_id: subjectId })
    });
    return res.json();
  },

  submitMistakeDrill: async (sessionId: string, answers: any[], totalTimeTaken: number = 0) => {
    const res = await fetch(`${API_BASE}/quiz/mistakes/drill/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ session_id: sessionId, answers, total_time_taken: totalTimeTaken })
    });
    return res.json();
  },

  toggleMistakeMastery: async (questionId: string) => {
    const res = await fetch(`${API_BASE}/quiz/mistakes/${questionId}/toggle-mastery`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Analytics
  getAnalytics: async () => {
    const res = await fetch(`${API_BASE}/analytics`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Companies
  getCompanies: async () => {
    return safeFetch(`${API_BASE}/companies`);
  },

  getCompanyDetails: async (id: string) => {
    return safeFetch(`${API_BASE}/companies/${id}`);
  },

  // Branches & Subjects
  getBranches: async () => {
    return safeFetch(`${API_BASE}/branches/branches`);
  },

  getSubjects: async (branchId?: string) => {
    const url = branchId ? `${API_BASE}/branches/subjects?branch_id=${branchId}` : `${API_BASE}/branches/subjects`;
    return safeFetch(url);
  },

  getTopics: async (subjectId?: string) => {
    const url = subjectId ? `${API_BASE}/branches/topics?subject_id=${subjectId}` : `${API_BASE}/branches/topics`;
    return safeFetch(url);
  },

  getJobRoles: async () => {
    return safeFetch(`${API_BASE}/branches/roles`);
  },

  // PrepPilot Voice AI
  askPrepPilot: async (message: string, model: string = 'gemini-2.5-flash', apiKey?: string) => {
    const res = await fetch(`${API_BASE}/preppilot/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message, model, apiKey })
    });
    return res.json();
  },

  getPrepPilotModels: async () => {
    const res = await fetch(`${API_BASE}/preppilot/models`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  getPrepPilotKnowledge: async () => {
    const res = await fetch(`${API_BASE}/preppilot/knowledge`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  diagnoseMistakes: async (payload: {
    type?: 'quiz' | 'coding';
    gradedQuestions?: any[];
    weak_topics?: string[];
    accuracy_rate?: number;
    codingMistake?: any;
  }) => {
    const res = await fetch(`${API_BASE}/preppilot/diagnose-mistakes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return safeJson(res);
  },

  explainSingleMistake: async (payload: {
    question: string;
    chosen_answer: string;
    chosen_text?: string;
    correct_answer: string;
    correct_text?: string;
    explanation?: string;
    why_correct?: string;
    why_incorrect?: string;
    topic_name?: string;
    subject_name?: string;
    sequence?: number;
    options?: any[];
    is_negative_constraint?: boolean;
    question_id?: string;
  }) => {
    const res = await fetch(`${API_BASE}/preppilot/explain-single-mistake`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return safeJson(res);
  },

  // Admin
  getAdminOverview: async () => {
    const res = await fetch(`${API_BASE}/admin/overview`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  getAdminQuestions: async () => {
    const res = await fetch(`${API_BASE}/admin/questions`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  createQuestion: async (questionData: any) => {
    const res = await fetch(`${API_BASE}/admin/questions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(questionData)
    });
    return res.json();
  },

  deleteQuestion: async (id: string) => {
    const res = await fetch(`${API_BASE}/admin/questions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  updateQuestion: async (id: string, questionData: any) => {
    const res = await fetch(`${API_BASE}/admin/questions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(questionData)
    });
    return res.json();
  },

  getAdminStudents: async (params: { filter?: string; search?: string; sort?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.filter) query.append('filter', params.filter);
    if (params.search) query.append('search', params.search);
    if (params.sort) query.append('sort', params.sort);
    const queryString = query.toString() ? `?${query.toString()}` : '';

    const res = await fetch(`${API_BASE}/admin/students${queryString}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  getStudentProgress: async (studentId: string) => {
    const res = await fetch(`${API_BASE}/admin/students/${studentId}/progress`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  updateStudentStatus: async (studentId: string, is_blocked: boolean, reason?: string) => {
    const res = await fetch(`${API_BASE}/admin/students/${studentId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ is_blocked, reason })
    });
    return res.json();
  },

  updateStudentPlacement: async (
    studentId: string,
    placementData: {
      placement_status?: 'PLACED' | 'NOT_PLACED';
      is_placed?: boolean;
      placed_company?: string;
      placement_package?: string;
      placed_date?: string;
    }
  ) => {
    const res = await fetch(`${API_BASE}/admin/students/${studentId}/placement`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(placementData)
    });
    return res.json();
  },

  deleteStudent: async (studentId: string) => {
    const res = await fetch(`${API_BASE}/admin/students/${studentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  getAdminKnowledge: async () => {
    const res = await fetch(`${API_BASE}/admin/knowledge`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  addKnowledgeDocument: async (docData: any) => {
    const res = await fetch(`${API_BASE}/admin/knowledge`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(docData)
    });
    return res.json();
  },

  deleteKnowledgeDocument: async (id: string) => {
    const res = await fetch(`${API_BASE}/admin/knowledge/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  getAnnouncements: async () => {
    const res = await fetch(`${API_BASE}/admin/announcements`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  createAnnouncement: async (data: any) => {
    const res = await fetch(`${API_BASE}/admin/announcements`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  deleteAnnouncement: async (id: string) => {
    const res = await fetch(`${API_BASE}/admin/announcements/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Dean Registration & Password Recovery
  registerDean: async (deanData: any) => {
    const res = await fetch(`${API_BASE}/auth/register-dean`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deanData)
    });
    return safeJson(res);
  },

  forgotPassword: async (email: string) => {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return safeJson(res);
  },

  resetPassword: async (data: { email: string; verification_pin: string; new_password: string }) => {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return safeJson(res);
  },

  // Faculty & Dean Governance
  getFaculty: async () => {
    const res = await fetch(`${API_BASE}/admin/faculty`, {
      headers: getAuthHeaders()
    });
    return safeJson(res);
  },

  appointFaculty: async (facultyData: any) => {
    const res = await fetch(`${API_BASE}/admin/faculty/appoint`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(facultyData)
    });
    return safeJson(res);
  },

  revokeFaculty: async (id: string) => {
    const res = await fetch(`${API_BASE}/admin/faculty/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return safeJson(res);
  },

  // Coding Practice
  getCodingProblems: async (params: { branch_id?: string; company_id?: string; subject_id?: string; difficulty?: string; search?: string } = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => { if (val) query.append(key, val); });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE}/coding/problems${queryString}`, { headers: getAuthHeaders() });
    return res.json();
  },

  getCodingProblem: async (id: string) => {
    const res = await fetch(`${API_BASE}/coding/problems/${id}`, { headers: getAuthHeaders() });
    return res.json();
  },

  getCodingLanguages: async () => {
    const res = await fetch(`${API_BASE}/coding/languages`, { headers: getAuthHeaders() });
    return res.json();
  },

  runCode: async (code: string, language: string, input?: string) => {
    const res = await fetch(`${API_BASE}/coding/run`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ code, language, input: input || '' })
    });
    return res.json();
  },

  submitCode: async (problemId: string, code: string, language: string) => {
    const res = await fetch(`${API_BASE}/coding/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ problemId, code, language })
    });
    return res.json();
  },

  getCodingStats: async () => {
    const res = await fetch(`${API_BASE}/coding/stats`, { headers: getAuthHeaders() });
    return res.json();
  },

  getCodingSubmissions: async (problemId?: string) => {
    const query = problemId ? `?problem_id=${problemId}` : '';
    const res = await fetch(`${API_BASE}/coding/submissions${query}`, { headers: getAuthHeaders() });
    return res.json();
  },

  toggleCodingBookmark: async (problemId: string) => {
    const res = await fetch(`${API_BASE}/coding/problems/${problemId}/bookmark`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  getCodingBookmarks: async () => {
    const res = await fetch(`${API_BASE}/coding/bookmarks`, { headers: getAuthHeaders() });
    return res.json();
  },

  getCodingAssessments: async () => {
    const res = await fetch(`${API_BASE}/coding/assessments`, { headers: getAuthHeaders() });
    return res.json();
  },

  getCodingAssessment: async (id: string) => {
    const res = await fetch(`${API_BASE}/coding/assessments/${id}`, { headers: getAuthHeaders() });
    return res.json();
  },

  startCodingAssessment: async (id: string) => {
    const res = await fetch(`${API_BASE}/coding/assessments/${id}/start`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  submitCodingAssessment: async (id: string, data: { attemptId: string; answers: any }) => {
    const res = await fetch(`${API_BASE}/coding/assessments/${id}/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getCodingAssessmentAttempt: async (id: string, attemptId: string) => {
    const res = await fetch(`${API_BASE}/coding/assessments/${id}/attempt/${attemptId}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Dean Academic Analytics API
  getDeanOverview: async () => {
    const res = await fetch(`${API_BASE}/dean/overview`, {
      headers: getAuthHeaders()
    });
    return safeJson(res);
  },

  getDeanPerformance: async (params: { search?: string; branch?: string; performance_tier?: string; placement_status?: string; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.branch) query.append('branch', params.branch);
    if (params.performance_tier) query.append('performance_tier', params.performance_tier);
    if (params.placement_status) query.append('placement_status', params.placement_status);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    const queryString = query.toString() ? `?${query.toString()}` : '';

    const res = await fetch(`${API_BASE}/dean/performance${queryString}`, {
      headers: getAuthHeaders()
    });
    return safeJson(res);
  },

  updateDeanStudentPlacement: async (
    studentId: string,
    placementData: {
      placement_status?: 'PLACED' | 'NOT_PLACED';
      is_placed?: boolean;
      placed_company?: string;
      placement_package?: string;
      placed_date?: string;
    }
  ) => {
    const res = await fetch(`${API_BASE}/dean/students/${studentId}/placement`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(placementData)
    });
    return safeJson(res);
  },

  getDeanStudentDossier: async (id: string) => {
    const res = await fetch(`${API_BASE}/dean/performance/${id}`, {
      headers: getAuthHeaders()
    });
    return safeJson(res);
  },

  getDeanAssessments: async () => {
    const res = await fetch(`${API_BASE}/dean/assessments`, {
      headers: getAuthHeaders()
    });
    return safeJson(res);
  },

  getDeanSubjectAnalytics: async () => {
    const res = await fetch(`${API_BASE}/dean/subject-analytics`, {
      headers: getAuthHeaders()
    });
    return safeJson(res);
  },

  getDeanDepartments: async () => {
    const res = await fetch(`${API_BASE}/dean/departments`, {
      headers: getAuthHeaders()
    });
    return safeJson(res);
  },

  exportDeanReportUrl: (reportType: string = 'student-performance') => {
    return `${API_BASE}/dean/reports/export?report_type=${reportType}`;
  },

  generateAdminInviteToken: async (data: { email?: string; designation?: string; department?: string; expiresInHours?: number } = {}) => {
    const res = await fetch(`${API_BASE}/admin/invite-token`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return safeJson(res);
  },

  // Aptitude
  getAptitudeTypes: async () => {
    const res = await fetch(`${API_BASE}/aptitude/types`, {
      headers: getAuthHeaders()
    });
    return safeJson(res);
  },

  getAptitudeQuestions: async (params: {
    type?: string;
    subtopic?: string;
    difficulty?: string;
    company_id?: string;
    search?: string;
    mode?: 'practice' | 'test';
    limit?: number;
  } = {}) => {
    const cleanParams: Record<string, string> = {};
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null && val !== '' && val !== 'undefined' && val !== 'null') {
        cleanParams[key] = String(val);
      }
    }
    const query = new URLSearchParams(cleanParams).toString();
    const url = query ? `${API_BASE}/aptitude/questions?${query}` : `${API_BASE}/aptitude/questions`;
    const res = await fetch(url, {
      headers: getAuthHeaders()
    });
    return safeJson(res);
  },

  checkAptitudeAnswer: async (payload: {
    question_id: string;
    chosen_option: string;
    time_spent?: number;
  }) => {
    const res = await fetch(`${API_BASE}/aptitude/check-answer`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return safeJson(res);
  },

  startAptitudeTestSession: async (payload: {
    type?: string;
    difficulty?: string;
    company_id?: string;
    count?: number;
    duration_minutes?: number;
  }) => {
    const res = await fetch(`${API_BASE}/aptitude/session/start`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return safeJson(res);
  },

  submitAptitudeTestSession: async (
    sessionId: string,
    answers: Array<{ question_id: string; chosen_option: string | null; time_spent?: number }>,
    totalTimeTaken: number
  ) => {
    const res = await fetch(`${API_BASE}/aptitude/session/${sessionId}/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ answers, total_time_taken: totalTimeTaken })
    });
    return safeJson(res);
  },

  getAptitudeFormulas: async () => {
    const res = await fetch(`${API_BASE}/aptitude/formulas`, {
      headers: getAuthHeaders()
    });
    return safeJson(res);
  }
};

export default api;

