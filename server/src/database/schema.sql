-- ====================================================================
-- CareerPrep AI: PostgreSQL Production Schema
-- Final Year B.Tech Major Project Database DDL
-- Entities: 16 Core Tables with Relationships, Constraints & Indexes
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BRANCHES
CREATE TABLE IF NOT EXISTS branches (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. COMPANIES
CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    tier VARCHAR(50) DEFAULT 'Service/Product',
    pattern_description TEXT,
    website VARCHAR(255),
    logo_icon VARCHAR(50),
    hiring_rounds JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. JOB ROLES
CREATE TABLE IF NOT EXISTS job_roles (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    branch_id VARCHAR(50) REFERENCES branches(id) ON DELETE SET NULL,
    description TEXT,
    expected_skills JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. USERS
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'STUDENT' CHECK (role IN ('STUDENT', 'ADMIN')),
    branch_id VARCHAR(50) REFERENCES branches(id) ON DELETE SET NULL,
    year VARCHAR(20) DEFAULT '4th Year',
    graduation_year INT DEFAULT 2026,
    preferred_job_role_id VARCHAR(50) REFERENCES job_roles(id) ON DELETE SET NULL,
    target_companies JSONB DEFAULT '[]'::jsonb,
    skill_level VARCHAR(30) DEFAULT 'Intermediate' CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced')),
    areas_of_interest JSONB DEFAULT '[]'::jsonb,
    total_xp INT DEFAULT 0,
    current_level INT DEFAULT 1,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_active_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. SUBJECTS
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(30),
    branch_id VARCHAR(50) REFERENCES branches(id) ON DELETE CASCADE,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TOPICS
CREATE TABLE IF NOT EXISTS topics (
    id VARCHAR(50) PRIMARY KEY,
    subject_id VARCHAR(50) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    importance_weight DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. QUESTIONS
CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR(50) PRIMARY KEY,
    question TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL DEFAULT 'MCQ' CHECK (question_type IN ('MCQ', 'Multiple Select', 'Coding', 'Technical Interview Question', 'Conceptual Question', 'Scenario-Based Question')),
    branch_id VARCHAR(50) REFERENCES branches(id) ON DELETE SET NULL,
    company_id VARCHAR(50) REFERENCES companies(id) ON DELETE SET NULL,
    job_role_id VARCHAR(50) REFERENCES job_roles(id) ON DELETE SET NULL,
    subject_id VARCHAR(50) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    topic_id VARCHAR(50) NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    difficulty VARCHAR(20) NOT NULL DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    expected_time INT DEFAULT 60, -- in seconds
    xp_value INT DEFAULT 20,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. QUESTION OPTIONS
CREATE TABLE IF NOT EXISTS question_options (
    id VARCHAR(50) PRIMARY KEY,
    question_id VARCHAR(50) NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_key VARCHAR(10) NOT NULL, -- e.g. 'A', 'B', 'C', 'D'
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    explanation TEXT
);

-- 9. QUIZ SESSIONS
CREATE TABLE IF NOT EXISTS quiz_sessions (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mode VARCHAR(50) NOT NULL CHECK (mode IN ('ADAPTIVE_DAILY', 'CUSTOM_PRACTICE', 'COMPANY_PATTERN')),
    status VARCHAR(30) DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'ABANDONED')),
    total_questions INT NOT NULL,
    correct_count INT DEFAULT 0,
    score DECIMAL(5,2) DEFAULT 0.0,
    xp_earned INT DEFAULT 0,
    time_taken_seconds INT DEFAULT 0,
    config_params JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 10. QUIZ QUESTIONS (Session join table)
CREATE TABLE IF NOT EXISTS quiz_questions (
    id VARCHAR(50) PRIMARY KEY,
    session_id VARCHAR(50) NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    question_id VARCHAR(50) NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    sequence_order INT NOT NULL,
    user_answer TEXT,
    is_correct BOOLEAN,
    time_spent_seconds INT DEFAULT 0
);

-- 11. ATTEMPTS
CREATE TABLE IF NOT EXISTS attempts (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id VARCHAR(50) NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    session_id VARCHAR(50) REFERENCES quiz_sessions(id) ON DELETE SET NULL,
    user_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_spent_seconds INT NOT NULL,
    xp_gained INT DEFAULT 0,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. STUDENT PERFORMANCE (Aggregated Weak/Strong Topics)
CREATE TABLE IF NOT EXISTS student_performance (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id VARCHAR(50) NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    subject_id VARCHAR(50) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    attempts_count INT DEFAULT 0,
    correct_count INT DEFAULT 0,
    accuracy_rate DECIMAL(5,2) DEFAULT 0.0,
    weakness_score DECIMAL(5,2) DEFAULT 0.5, -- 0.0 = very strong, 1.0 = very weak
    last_attempted_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_topic UNIQUE (user_id, topic_id)
);

-- 13. XP HISTORY
CREATE TABLE IF NOT EXISTS xp_history (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INT NOT NULL,
    action_type VARCHAR(100) NOT NULL, -- e.g. 'CORRECT_ANSWER', 'SPEED_BONUS', 'DAILY_QUIZ_COMPLETED', 'STREAK_BONUS'
    reference_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. STREAKS
CREATE TABLE IF NOT EXISTS streaks (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_activity_date DATE,
    streak_freeze_count INT DEFAULT 1,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS achievements (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    badge_icon VARCHAR(100) NOT NULL,
    category VARCHAR(50) DEFAULT 'PRACTICE',
    xp_reward INT DEFAULT 100,
    condition_type VARCHAR(100) NOT NULL,
    threshold INT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_achievements (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id VARCHAR(50) NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_id)
);

-- 16. KNOWLEDGE DOCUMENTS (For PrepPilot RAG Retrieval)
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    branch_id VARCHAR(50) REFERENCES branches(id) ON DELETE SET NULL,
    subject_id VARCHAR(50) REFERENCES subjects(id) ON DELETE SET NULL,
    company_id VARCHAR(50) REFERENCES companies(id) ON DELETE SET NULL,
    category VARCHAR(100) NOT NULL, -- e.g. 'CONCEPT', 'INTERVIEW_PATTERN', 'CODE_WALKTHROUGH', 'HR_BEHAVIORAL'
    content TEXT NOT NULL,
    summary TEXT,
    keywords JSONB DEFAULT '[]'::jsonb,
    embedding JSONB, -- Stored float array vector for semantic search
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR MAXIMUM QUERY OPTIMIZATION
CREATE INDEX IF NOT EXISTS idx_questions_subject_topic ON questions(subject_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_company ON questions(company_id);
CREATE INDEX IF NOT EXISTS idx_questions_branch ON questions(branch_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_question ON attempts(question_id);
CREATE INDEX IF NOT EXISTS idx_student_performance_user ON student_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_student_performance_weakness ON student_performance(user_id, weakness_score DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user ON quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_subject ON knowledge_documents(subject_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_company ON knowledge_documents(company_id);

-- 17. CODING PROBLEMS
CREATE TABLE IF NOT EXISTS coding_problems (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    branch_id VARCHAR(50) REFERENCES branches(id) ON DELETE SET NULL,
    company_id VARCHAR(50) REFERENCES companies(id) ON DELETE SET NULL,
    subject_id VARCHAR(50) REFERENCES subjects(id) ON DELETE SET NULL,
    topic_id VARCHAR(50) REFERENCES topics(id) ON DELETE SET NULL,
    tags JSONB DEFAULT '[]'::jsonb,
    description TEXT NOT NULL,
    constraints TEXT,
    time_limit_ms INT DEFAULT 2000,
    memory_limit_mb INT DEFAULT 256,
    starter_code JSONB DEFAULT '{}'::jsonb,
    hints JSONB DEFAULT '[]'::jsonb,
    editorial JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. CODING TEST CASES
CREATE TABLE IF NOT EXISTS coding_test_cases (
    id VARCHAR(50) PRIMARY KEY,
    problem_id VARCHAR(50) NOT NULL REFERENCES coding_problems(id) ON DELETE CASCADE,
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. CODING SUBMISSIONS
CREATE TABLE IF NOT EXISTS coding_submissions (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id VARCHAR(50) NOT NULL REFERENCES coding_problems(id) ON DELETE CASCADE,
    language VARCHAR(20) NOT NULL,
    code TEXT NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'COMPILATION_ERROR', 'RUNTIME_ERROR'
    passed_cases INT DEFAULT 0,
    total_cases INT DEFAULT 0,
    runtime_ms INT DEFAULT 0,
    memory_kb INT DEFAULT 0,
    assessment_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 20. CODING BOOKMARKS
CREATE TABLE IF NOT EXISTS coding_bookmarks (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id VARCHAR(50) NOT NULL REFERENCES coding_problems(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_problem_bookmark UNIQUE (user_id, problem_id)
);

-- 21. CODING ASSESSMENTS
CREATE TABLE IF NOT EXISTS coding_assessments (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    company VARCHAR(100),
    duration_minutes INT NOT NULL DEFAULT 45,
    difficulty VARCHAR(20) NOT NULL DEFAULT 'Medium',
    total_marks INT DEFAULT 100,
    problem_ids JSONB DEFAULT '[]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 22. CODING ASSESSMENT ATTEMPTS
CREATE TABLE IF NOT EXISTS coding_assessment_attempts (
    id VARCHAR(50) PRIMARY KEY,
    assessment_id VARCHAR(50) NOT NULL REFERENCES coding_assessments(id) ON DELETE CASCADE,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    duration_minutes INT NOT NULL,
    status VARCHAR(30) DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'TIMED_OUT', 'ABANDONED')),
    score DECIMAL(5,2) DEFAULT 0.0,
    answers JSONB DEFAULT '{}'::jsonb,
    results JSONB DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR CODING PLATFORM
CREATE INDEX IF NOT EXISTS idx_coding_problems_difficulty ON coding_problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_coding_problems_topic ON coding_problems(topic_id);
CREATE INDEX IF NOT EXISTS idx_coding_test_cases_problem ON coding_test_cases(problem_id);
CREATE INDEX IF NOT EXISTS idx_coding_submissions_user_problem ON coding_submissions(user_id, problem_id);
CREATE INDEX IF NOT EXISTS idx_coding_bookmarks_user ON coding_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_coding_assessment_attempts_user ON coding_assessment_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_coding_assessment_attempts_assessment ON coding_assessment_attempts(assessment_id);

