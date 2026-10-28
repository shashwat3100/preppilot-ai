export interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'ADMIN' | 'DEAN';
  branch_id?: string;
  branch_name?: string;
  branch_code?: string;
  year?: string;
  graduation_year?: number;
  preferred_job_role_id?: string;
  job_role_title?: string;
  target_companies?: string[];
  skill_level?: 'Beginner' | 'Intermediate' | 'Advanced';
  areas_of_interest?: string[];
  total_xp: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  last_active_date?: string;
}

export interface QuestionOption {
  option_key: string;
  option_text: string;
}

export interface Question {
  id: string;
  sequence?: number;
  question: string;
  question_type: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  subject_id?: string;
  subject_name?: string;
  topic_id?: string;
  topic_name?: string;
  company_id?: string;
  company_name?: string;
  branch_id?: string;
  expected_time: number;
  xp_value: number;
  options: QuestionOption[];
  correct_answer?: string;
  explanation?: string;
  recommendation_score?: number;
  recommendation_reason?: string;
  is_unattempted?: boolean;
  has_attempted?: boolean;
  score_breakdown?: {
    topic_weakness: number;
    company_relevance: number;
    branch_relevance: number;
    difficulty_match: number;
    unattempted_priority: number;
    spaced_repetition: number;
  };
}

export interface QuizSession {
  session_id: string;
  mode: 'ADAPTIVE_DAILY' | 'CUSTOM_PRACTICE' | 'COMPANY_PATTERN';
  total_questions: number;
  questions: Question[];
}

export interface GradedQuestion {
  question_id: string;
  question: string;
  chosen_answer: string;
  chosen_text?: string;
  correct_answer: string;
  correct_text?: string;
  is_correct: boolean;
  why_correct?: string;
  why_incorrect?: string;
  explanation: string;
  options?: Array<{
    option_key: string;
    option_text: string;
    is_correct: boolean;
    explanation?: string;
  }>;
  time_spent: number;
  xp_gained: number;
  subject_name?: string;
  topic_name?: string;
}

export interface QuizResult {
  session_id: string;
  total_questions: number;
  correct_count: number;
  incorrect_count: number;
  accuracy_rate: number;
  xp_earned: number;
  total_xp: number;
  current_level: number;
  current_streak: number;
  time_taken_seconds: number;
  graded_questions: GradedQuestion[];
  weak_topics: string[];
  mastered_topics: string[];
  recommendation_summary: string;
}

export interface Company {
  id: string;
  name: string;
  tier: string;
  pattern_description: string;
  website: string;
  logo_icon: string;
  hiring_rounds: string[];
  question_count?: number;
  available_subjects?: string[];
  difficulty_level?: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  description: string;
  subjects?: Subject[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  branch_id: string;
  icon?: string;
  description?: string;
}

export interface Topic {
  id: string;
  subject_id: string;
  name: string;
  description?: string;
}

export interface JobRole {
  id: string;
  title: string;
  branch_id: string;
  description: string;
}

export interface DashboardStats {
  preparation_score: number;
  total_questions_attempted: number;
  accuracy_percentage: number;
  total_xp: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  weak_topics: Array<{
    topic_id: string;
    topic_name: string;
    subject_name: string;
    attempts: number;
    accuracy: number;
    weakness_score: number;
  }>;
  strong_topics: Array<{
    topic_id: string;
    topic_name: string;
    subject_name: string;
    attempts: number;
    accuracy: number;
    weakness_score: number;
  }>;
  recent_attempts: Array<{
    id: string;
    question_id: string;
    question_text: string;
    topic_name: string;
    is_correct: boolean;
    xp_gained: number;
    attempted_at: string;
  }>;
  recommended_questions: Question[];
  target_companies: Array<{
    id: string;
    name: string;
    tier: string;
    logo_icon: string;
    question_count: number;
    attempted_count: number;
    accuracy: number;
  }>;
  subject_progress: Array<{
    id: string;
    name: string;
    code: string;
    icon?: string;
    total_questions: number;
    attempted: number;
    accuracy: number;
  }>;
  difficulty_progression: {
    Easy: { attempted: number; correct: number; accuracy: number };
    Medium: { attempted: number; correct: number; accuracy: number };
    Hard: { attempted: number; correct: number; accuracy: number };
  };
}

export interface AnalyticsData {
  summary: {
    total_attempted: number;
    correct_answers: number;
    incorrect_answers: number;
    overall_accuracy: number;
    avg_time_per_question: number;
    current_streak: number;
    longest_streak: number;
  };
  placement_readiness?: {
    has_activity?: boolean;
    score: number;
    percentile: number;
    tier_fit: string;
    company_eligibility: Array<{
      company_name: string;
      tier: string;
      cutoff_accuracy: number;
      min_coding_solved: number;
      current_accuracy: number;
      current_coding_solved: number;
      status: 'ELIGIBLE' | 'BORDERLINE' | 'NEEDS_PREPARATION';
      match_score: number;
    }>;
  };
  subject_accuracy: Array<{ name: string; fullName: string; attempted: number; accuracy: number }>;
  topic_accuracy: Array<{ name: string; attempted: number; accuracy: number }>;
  company_accuracy: Array<{ name: string; attempted: number; available: number; accuracy: number }>;
  difficulty_accuracy: Array<{ difficulty: string; attempted: number; correct: number; accuracy: number }>;
  weekly_progress: Array<{
    date: string;
    day: string;
    questionsAttempted: number;
    accuracy: number;
    correctCount?: number;
    dailyAccuracy?: number | null;
    cumulativeAccuracy?: number;
    hasActivity?: boolean;
  }>;
  weakest_topics: Array<{ topic: string; subject: string; accuracy: number; weakness: number }>;
  strongest_topics: Array<{ topic: string; subject: string; accuracy: number; strength: number }>;
  coding?: {
    total_submissions: number;
    accepted_submissions: number;
    problems_solved: number;
    problems_attempted: number;
    acceptance_rate: number;
    language_breakdown: Record<string, number>;
    difficulty_breakdown: {
      Easy: { solved: number; total: number };
      Medium: { solved: number; total: number };
      Hard: { solved: number; total: number };
    };
    revision_recommendations: Array<{
      problem_id: string;
      title: string;
      difficulty: string;
      attempts_count: number;
      last_status: string;
      reason: string;
    }>;
  };
}

export interface PrepPilotChatMessage {
  id: string;
  sender: 'user' | 'preppilot';
  text: string;
  speechText?: string;
  timestamp: string;
  sources?: string[];
  isVoiceInput?: boolean;
  model?: string;
  isLiveApi?: boolean;
}

export interface AiModelOption {
  id: string;
  name: string;
  tag: string;
  description: string;
  isDefault?: boolean;
}
