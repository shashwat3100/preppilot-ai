/**
 * PrepPilot AI — Central Application Configuration
 * 
 * Provides unified branding, metadata, route definitions, and navigation targets.
 */

export interface NavRoute {
  id: string;
  path: string;
  label: string;
  description: string;
  iconName: string;
  category: 'workspace' | 'preparation' | 'insights' | 'assistance' | 'admin';
  isProtected: boolean;
  adminOnly?: boolean;
}

export const APP_CONFIG = {
  name: 'PrepPilot AI',
  tagline: 'Intelligent B.Tech Placement Interview & Assessment Platform',
  description: 'AI-guided campus placement preparation platform with authentic MCQ assessments, live multi-language coding arena, syllabus-grounded technical coach, and recruiter readiness analytics.',
  version: '2.1.0',
  author: 'PrepPilot Engineering Team',
  branding: {
    logoText: 'PrepPilot',
    logoAccent: 'AI',
    colorPrimary: '#4f46e5',
    colorAccent: '#06b6d4',
    favicon: '/favicon.svg'
  },
  routes: {
    defaultAuthRoute: 'dashboard',
    defaultAdminRoute: 'admin',
    defaultUnauthRoute: 'login',
    aliases: {
      '': 'dashboard',
      '/': 'dashboard',
      'overview': 'dashboard',
      'assessments': 'assessment',
      'mock-test': 'assessment',
      'coding': 'coding-practice',
      'coding-arena': 'coding-practice',
      'coach': 'thinking-orb',
      'mentor': 'thinking-orb',
      'studio': 'preppilot-studio',
      'voice-studio': 'preppilot-studio',
      'revision': 'custom-practice',
      'practice': 'custom-practice',
      'stats': 'analytics',
      'admin': 'admin-overview',
      'admin-overview': 'admin-overview',
      'admin-students': 'admin-students',
      'admin-questions': 'admin-questions',
      'admin-assessments': 'admin-assessments',
      'admin-analytics': 'admin-analytics',
      'admin-users': 'admin-users',
      'dean': 'dean-overview',
      'dean-overview': 'dean-overview',
      'dean-performance': 'dean-performance',
      'dean-assessments': 'dean-assessments',
      'dean-subjects': 'dean-subjects',
      'dean-reports': 'dean-reports'
    } as Record<string, string>
  },
  navigation: [
    {
      id: 'dashboard',
      path: '#/dashboard',
      label: 'Overview',
      description: 'Placement readiness dossier, daily goals, and priority actions',
      iconName: 'LayoutDashboard',
      category: 'workspace',
      isProtected: true
    },
    {
      id: 'adaptive-quiz',
      path: '#/adaptive-quiz',
      label: 'Adaptive Quiz',
      description: 'Personalized engineering syllabus question drills',
      iconName: 'Sparkles',
      category: 'workspace',
      isProtected: true
    },
    {
      id: 'coding-practice',
      path: '#/coding-practice',
      label: 'Coding Arena',
      description: 'Algorithmic challenges in C, C++, Python, Java & JS with test case runner',
      iconName: 'Code2',
      category: 'workspace',
      isProtected: true
    },
    {
      id: 'assessment',
      path: '#/assessment',
      label: 'Assessments',
      description: 'Timed Core CS, TCS-style, and DSA placement screening tests',
      iconName: 'ShieldCheck',
      category: 'workspace',
      isProtected: true
    },
    {
      id: 'companies',
      path: '#/companies',
      label: 'Company Prep',
      description: 'Tier-1 IT drive patterns, syllabus rubrics, and hiring tests',
      iconName: 'Building2',
      category: 'preparation',
      isProtected: true
    },
    {
      id: 'custom-practice',
      path: '#/custom-practice',
      label: 'Custom Revision',
      description: 'Targeted topic selection and weakness reinforcement drills',
      iconName: 'Sliders',
      category: 'preparation',
      isProtected: true
    },
    {
      id: 'analytics',
      path: '#/analytics',
      label: 'Analytics & Insights',
      description: 'Honest placement readiness scoring, percentile, and company eligibility',
      iconName: 'BarChart3',
      category: 'insights',
      isProtected: true
    },
    {
      id: 'thinking-orb',
      path: '#/thinking-orb',
      label: 'AI Technical Mentor',
      description: 'Syllabus-grounded technical interview coach with voice synthesis',
      iconName: 'Bot',
      category: 'assistance',
      isProtected: true
    },
    {
      id: 'preppilot-studio',
      path: '#/preppilot-studio',
      label: 'Voice AI Studio',
      description: 'Interactive spoken viva and technical interview simulator',
      iconName: 'Mic',
      category: 'assistance',
      isProtected: true
    },
    {
      id: 'admin',
      path: '#/admin',
      label: 'Administration',
      description: 'Student oversight, candidate dossiers, and question bank governance',
      iconName: 'Shield',
      category: 'admin',
      isProtected: true,
      adminOnly: true
    }
  ] as NavRoute[],
  assessmentCatalog: [
    {
      id: 'asmt-core-cs',
      title: 'Core Computer Science Comprehensive Assessment',
      category: 'Core Computer Science',
      questionCount: 20,
      durationMinutes: 25,
      description: 'Rigorous 20-question evaluation spanning Operating Systems, DBMS Normalization & Transactions, Computer Networks, and Object-Oriented Principles.',
      passingScorePercent: 65,
      subjects: ['Operating Systems', 'Database Management Systems', 'Computer Networks', 'Object Oriented Programming']
    },
    {
      id: 'asmt-tcs-nqt',
      title: 'TCS-Style National Qualifier Mock Assessment',
      category: 'Company Recruitment',
      questionCount: 30,
      durationMinutes: 45,
      description: 'Authentic 30-question screening following TCS NQT Ninja & Digital patterns: Quantitative Aptitude, Logical Reasoning, and Technical CS Foundations.',
      passingScorePercent: 60,
      subjects: ['General Aptitude & Reasoning', 'Data Structures & Algorithms', 'C / C++ Fundamentals']
    },
    {
      id: 'asmt-dsa-mastery',
      title: 'Data Structures & Algorithms Mastery Test',
      category: 'Algorithms & Problem Solving',
      questionCount: 15,
      durationMinutes: 30,
      description: 'Focused 15-question technical drill covering Trees, Graphs, Hashing, Heaps, Dynamic Programming, and Asymptotic Complexity.',
      passingScorePercent: 70,
      subjects: ['Data Structures & Algorithms']
    },
    {
      id: 'asmt-full-simulation',
      title: 'Full Campus Placement Simulation (Quiz + Live Coding)',
      category: 'Comprehensive Screening',
      questionCount: 10,
      hasCodingSection: true,
      durationMinutes: 35,
      description: 'Dual-section evaluation simulating Tier-1 corporate drives: 10 fundamental technical MCQs followed by a live programming challenge evaluated against test cases.',
      passingScorePercent: 70,
      subjects: ['Core Engineering', 'Data Structures & Algorithms']
    }
  ]
};

export default APP_CONFIG;
