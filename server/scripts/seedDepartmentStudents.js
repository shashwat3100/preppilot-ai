import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { initDb, saveDb, CANONICAL_BRANCHES } from '../src/database/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Standard bcrypt hash for password "Password123" with salt rounds = 10
const DEFAULT_PASSWORD_HASH = '$2b$10$HrT5izLhjOv1LR4nw7bAsOQEbopY/viseoDaL1duWUbKUvdmU0agK';

// Authentic Indian First Names (45 Male, 45 Female)
const FIRST_NAMES_MALE = [
  'Aarav', 'Vihaan', 'Aditya', 'Rohan', 'Ishaan', 'Tanmay', 'Ayush', 'Parth',
  'Om', 'Kunal', 'Pranav', 'Nikhil', 'Harshit', 'Yash', 'Atharva', 'Vedant',
  'Shreyas', 'Aniket', 'Tejas', 'Harsh', 'Mayank', 'Saurabh', 'Sahil', 'Varun',
  'Gaurav', 'Abhinav', 'Rishabh', 'Chinmay', 'Sanket', 'Suyash', 'Tushar', 'Alok',
  'Mohit', 'Rohit', 'Vivek', 'Shubham', 'Akshay', 'Chetan', 'Deepak', 'Devendra',
  'Hemant', 'Jayesh', 'Kiran', 'Manish', 'Nilesh'
];

const FIRST_NAMES_FEMALE = [
  'Ananya', 'Sneha', 'Priya', 'Diya', 'Ishita', 'Riya', 'Tanvi', 'Shreya',
  'Pooja', 'Neha', 'Sakshi', 'Aditi', 'Shruti', 'Meera', 'Rashi', 'Rutuja',
  'Vaishnavi', 'Prachi', 'Simran', 'Nikita', 'Komal', 'Payal', 'Mansi', 'Diksha',
  'Kalyani', 'Sanjana', 'Shivani', 'Swati', 'Divya', 'Aishwarya', 'Ashwini',
  'Bhagyashree', 'Chetana', 'Dhanashree', 'Gayatri', 'Harshada', 'Jagruti', 'Madhuri',
  'Pallavi', 'Pranali', 'Radhika', 'Rashmi', 'Samruddhi', 'Sayali', 'Tejaswini'
];

// Authentic Indian Surnames
const LAST_NAMES = [
  'Sharma', 'Deshmukh', 'Patil', 'Kulkarni', 'Joshi', 'Nair', 'Verma', 'Gupta',
  'Iyer', 'Rao', 'Reddy', 'Mehra', 'Choudhary', 'Singh', 'Bhat', 'Sawant',
  'Shinde', 'Jadhav', 'More', 'Wagh', 'Balamwar', 'Gaikwad', 'Pawar', 'Kamble',
  'Kale', 'Kadam', 'Tambe', 'Chavan', 'Salunkhe', 'Mhatre', 'Thakre', 'Gadkari',
  'Agrawal', 'Bansal', 'Mittal', 'Jain', 'Shah', 'Mehta', 'Trivedi', 'Dave',
  'Shukla', 'Tiwari', 'Mishra', 'Pandey', 'Dubey', 'Tripathi', 'Saxena', 'Sinha'
];

// Department profile differentiation (so each branch has realistic, distinctive score & XP distributions)
const BRANCH_PROFILES = {
  'branch-cse': { scoreDelta: +3.2, xpBonus: 180, codingBias: 1.25 },
  'branch-ai': { scoreDelta: +2.6, xpBonus: 150, codingBias: 1.20 },
  'branch-cs-ds': { scoreDelta: +2.0, xpBonus: 130, codingBias: 1.15 },
  'branch-it': { scoreDelta: +1.4, xpBonus: 110, codingBias: 1.10 },
  'branch-csbs': { scoreDelta: +0.8, xpBonus: 90, codingBias: 1.05 },
  'branch-cs-cyber': { scoreDelta: +0.2, xpBonus: 80, codingBias: 1.00 },
  'branch-robotics-ai': { scoreDelta: -0.6, xpBonus: 50, codingBias: 0.95 },
  'branch-iiot': { scoreDelta: -1.2, xpBonus: 30, codingBias: 0.90 },
  'branch-etc': { scoreDelta: -1.9, xpBonus: 10, codingBias: 0.85 },
  'branch-ee': { scoreDelta: -2.6, xpBonus: -20, codingBias: 0.80 },
  'branch-me': { scoreDelta: -3.3, xpBonus: -40, codingBias: 0.75 },
  'branch-ce': { scoreDelta: -4.0, xpBonus: -60, codingBias: 0.70 }
};

const TARGET_COMPANIES_POOL = [
  'comp-tcs', 'comp-infosys', 'comp-wipro', 'comp-accenture',
  'comp-capgemini', 'comp-cognizant', 'comp-deloitte', 'comp-amazon',
  'comp-microsoft', 'comp-google'
];

const CODING_PROBLEMS_POOL = [
  'prob-two-sum', 'prob-valid-parentheses', 'prob-binary-search',
  'prob-max-subarray', 'prob-palindrome-string', 'prob-longest-substring',
  'prob-buy-sell-stock', 'prob-climbing-stairs', 'prob-container-with-most-water'
];

const ASSESSMENT_TYPES = [
  { type: 'core-cs', title: 'Core Engineering Fundamentals Assessment' },
  { type: 'tcs-nqt', title: 'TCS NQT Placement Qualifier Test' },
  { type: 'cognizant-genc', title: 'Cognizant GenC Technical Assessment' },
  { type: 'infosys-sp', title: 'Infosys Specialist Programmer Assessment' },
  { type: 'aptitude-speed', title: 'Quantitative & Logical Aptitude Test' }
];

export async function seedAllDepartmentStudents() {
  await initDb();
  console.log('[Seed Department Students]: Initializing 70 authentic students per branch...');

  const branches = db.getAll('branches');
  console.log(`[Seed Department Students]: Found ${branches.length} active branches in database.`);

  const allQuestions = db.getAll('questions') || [];
  const subjects = db.getAll('subjects') || [];

  const existingUsers = db.getAll('users');
  const reservedEmails = new Set([
    'student@college.edu', 'admin@college.edu', 'dean@college.edu',
    'student@preppilot.ai', 'admin@preppilot.ai'
  ]);

  // Clean out previously seeded cohort students to prevent duplicates
  const usersToKeep = existingUsers.filter(u =>
    reservedEmails.has(u.email) ||
    u.role === 'ADMIN' ||
    u.role === 'DEAN' ||
    u.id === 'user-student-college' ||
    u.id === 'user-student-demo'
  );

  console.log(`[Seed Department Students]: Preserving ${usersToKeep.length} core admin/dean/demo user accounts.`);

  const newUsers = [...usersToKeep];
  const newQuizSessions = [];
  const newAttempts = [];
  const newStudentPerformance = [];
  const newCodingSubmissions = [];
  const newStreaks = [];

  let globalStudentCounter = 0;
  const now = Date.now();

  // Create a pool of 840 unique, non-repeating name pairs
  const uniqueNamePairs = [];
  for (let m = 0; m < FIRST_NAMES_MALE.length; m++) {
    for (let l = 0; l < LAST_NAMES.length; l++) {
      uniqueNamePairs.push({ first: FIRST_NAMES_MALE[m], last: LAST_NAMES[l], isFemale: false });
    }
  }
  for (let f = 0; f < FIRST_NAMES_FEMALE.length; f++) {
    for (let l = 0; l < LAST_NAMES.length; l++) {
      uniqueNamePairs.push({ first: FIRST_NAMES_FEMALE[f], last: LAST_NAMES[l], isFemale: true });
    }
  }

  // Shuffle name pool deterministically
  const selectedNames = [];
  const step = 17;
  for (let i = 0; i < 840; i++) {
    const idx = (i * step) % uniqueNamePairs.length;
    selectedNames.push(uniqueNamePairs[idx]);
  }

  for (let bIdx = 0; bIdx < branches.length; bIdx++) {
    const branch = branches[bIdx];
    const branchCodeSlug = branch.code.toLowerCase().replace(/[^a-z0-9]/g, '');
    const profile = BRANCH_PROFILES[branch.id] || { scoreDelta: 0, xpBonus: 0, codingBias: 1.0 };

    // Applicable subjects for this branch
    const branchSubjects = subjects.filter(s => s.branch_id === branch.id);
    const applicableSubjectIds = branchSubjects.length > 0
      ? branchSubjects.map(s => s.id)
      : ['sub-dsa', 'sub-dbms', 'sub-os', 'sub-aptitude'];

    const branchQuestions = allQuestions.filter(q =>
      applicableSubjectIds.includes(q.subject_id) || q.subject_id === 'sub-aptitude'
    );
    const questionsPool = branchQuestions.length >= 20 ? branchQuestions : allQuestions;

    for (let i = 1; i <= 70; i++) {
      const nameObj = selectedNames[globalStudentCounter];
      globalStudentCounter++;

      const fullName = `${nameObj.first} ${nameObj.last}`;
      const email = `${nameObj.first.toLowerCase()}.${nameObj.last.toLowerCase()}.${branchCodeSlug}${i}@college.edu`;
      const userId = `std-${branchCodeSlug}-${String(i).padStart(3, '0')}`;

      // Calculate distinct individual score, XP, streak, and tier per student
      let tier = 'AVERAGE';
      let skillLevel = 'Intermediate';
      let accuracyBase = 0.70;
      let xp = 1100;
      let streak = 4;
      let completedTestsCount = 2;
      let codingAttemptsCount = 2;

      if (i <= 10) {
        // TOP PERFORMERS (1..10 per branch)
        // Differentiated scores between 86% and 98%
        tier = 'TOP';
        skillLevel = 'Advanced';
        const rawScore = 97.5 - ((i - 1) * 1.25) + profile.scoreDelta + (((i * 17 + bIdx) % 7) * 0.35 - 1.0);
        accuracyBase = Math.max(0.85, Math.min(0.99, rawScore / 100));
        xp = Math.round(2600 - ((i - 1) * 60) + profile.xpBonus + ((i * 23 + bIdx * 11) % 45));
        streak = 10 + ((i * 3 + bIdx * 2) % 15); // 10 to 24 days streak
        completedTestsCount = (i <= 4) ? 4 : 3;
        codingAttemptsCount = (i <= 5) ? 4 : 3;
      } else if (i >= 50) {
        // DEVELOPING STUDENTS (50..70 per branch)
        // Differentiated scores between 35% and 58%
        tier = 'DEVELOPING';
        skillLevel = 'Beginner';
        const rawScore = 57.5 - ((i - 50) * 1.05) + profile.scoreDelta + (((i * 29 + bIdx) % 9) * 0.4 - 1.6);
        accuracyBase = Math.max(0.35, Math.min(0.58, rawScore / 100));
        xp = Math.round(780 - ((i - 50) * 23) + ((i * 7 + bIdx) % 25));
        streak = (i % 3 === 0) ? 1 : 0;
        completedTestsCount = 1;
        codingAttemptsCount = (i % 2 === 0) ? 1 : 0;
      } else {
        // AVERAGE CORE STUDENTS (11..49 per branch)
        // Differentiated scores between 60% and 84%
        tier = 'AVERAGE';
        skillLevel = 'Intermediate';
        const rawScore = 83.0 - ((i - 11) * 0.58) + profile.scoreDelta + (((i * 19 + bIdx) % 11) * 0.45 - 2.2);
        accuracyBase = Math.max(0.60, Math.min(0.84, rawScore / 100));
        xp = Math.round(1850 - ((i - 11) * 27) + profile.xpBonus + ((i * 13 + bIdx * 5) % 35));
        streak = 2 + ((i + bIdx) % 6);
        completedTestsCount = (i % 4 === 0) ? 3 : 2;
        codingAttemptsCount = 1 + ((i + bIdx) % 3);
      }

      // Last active date
      const daysAgo = (i % 7 === 0) ? 8 + ((i + bIdx) % 6) : 1 + ((i + bIdx) % 5);
      const lastActiveDate = new Date(now - daysAgo * 24 * 3600 * 1000).toISOString().split('T')[0];

      // Target companies (3 companies per student)
      const targetComps = [
        TARGET_COMPANIES_POOL[(i + bIdx) % TARGET_COMPANIES_POOL.length],
        TARGET_COMPANIES_POOL[(i + bIdx + 3) % TARGET_COMPANIES_POOL.length],
        TARGET_COMPANIES_POOL[(i + bIdx + 6) % TARGET_COMPANIES_POOL.length]
      ];

      const userRecord = {
        id: userId,
        name: fullName,
        email: email,
        password_hash: DEFAULT_PASSWORD_HASH,
        role: 'STUDENT',
        branch_id: branch.id,
        branch_name: branch.name,
        branch_code: branch.code,
        year: i % 3 === 0 ? '3rd Year' : '4th Year',
        graduation_year: i % 3 === 0 ? 2027 : 2026,
        preferred_job_role_id: (i % 2 === 0) ? 'role-sde' : 'role-systems',
        target_companies: targetComps,
        skill_level: skillLevel,
        areas_of_interest: ['DBMS', 'DSA', 'Operating Systems', 'Aptitude'],
        total_xp: xp,
        current_level: Math.max(1, Math.min(10, Math.floor(xp / 350) + 1)),
        current_streak: streak,
        longest_streak: streak + ((i % 5) + 1),
        last_active_date: lastActiveDate,
        is_blocked: false,
        status: 'ACTIVE'
      };
      newUsers.push(userRecord);

      // Streak record
      newStreaks.push({
        id: `streak-${userId}`,
        user_id: userId,
        current_streak: streak,
        longest_streak: streak + ((i % 5) + 1),
        last_activity_date: lastActiveDate,
        streak_freeze_count: 2
      });

      // Generate completed quizSessions for this student with distinct test scores
      for (let sIdx = 1; sIdx <= completedTestsCount; sIdx++) {
        const sessionId = `sess-${userId}-${sIdx}`;
        const totalQ = 20;

        // Individual progression variance across tests (e.g. test 2 may be higher or lower)
        const testProgressionDelta = (sIdx === 1 ? -0.03 : sIdx === 2 ? +0.02 : +0.05);
        const studentTestAccuracy = Math.max(0.30, Math.min(1.0, accuracyBase + testProgressionDelta + (((i * sIdx) % 5) * 0.015 - 0.03)));
        const correctQ = Math.max(4, Math.min(20, Math.round(totalQ * studentTestAccuracy)));
        const scorePercent = Math.round((correctQ / totalQ) * 100);
        const timeTaken = 420 + (sIdx * 110) + ((i * 13 + bIdx * 7) % 280);
        const sessionDate = new Date(now - (daysAgo + sIdx * 2) * 24 * 3600 * 1000).toISOString();

        const testTemplate = ASSESSMENT_TYPES[(sIdx - 1 + bIdx) % ASSESSMENT_TYPES.length];

        newQuizSessions.push({
          id: sessionId,
          user_id: userId,
          mode: 'TIMED_ASSESSMENT',
          assessment_type: testTemplate.type,
          assessment_title: testTemplate.title,
          category: 'Placement Assessment',
          duration_minutes: 25,
          status: 'COMPLETED',
          total_questions: totalQ,
          correct_count: correctQ,
          score: scorePercent,
          xp_earned: Math.round(correctQ * 15 + ((i % 3) * 5)),
          time_taken_seconds: timeTaken,
          created_at: sessionDate,
          completed_at: sessionDate,
          updated_at: sessionDate
        });

        // Generate sample question attempts for this session from diverse topics
        const startIdx = ((i * 7 + sIdx * 11 + bIdx * 13) % Math.max(1, questionsPool.length - 10));
        const sessionQuestions = questionsPool.slice(startIdx, startIdx + 10);
        sessionQuestions.forEach((q, qIndex) => {
          const isCorrect = qIndex < Math.round(10 * (correctQ / totalQ));
          newAttempts.push({
            id: `att-${sessionId}-${qIndex}`,
            user_id: userId,
            question_id: q.id,
            session_id: sessionId,
            chosen_answer: isCorrect ? (q.correct_answer || 'A') : 'B',
            is_correct: isCorrect,
            time_spent: 30 + ((qIndex * 7 + i) % 45),
            created_at: sessionDate
          });
        });
      }

      // Generate StudentPerformance metrics across core curriculum topics
      const studentTopics = [
        // Known challenge areas (legitimate learning gaps with lower cohort accuracy)
        { id: 'top-dp', sub: 'sub-dsa', name: 'Dynamic Programming', delta: -0.22 },
        { id: 'top-graphs', sub: 'sub-dsa', name: 'Graphs & BFS/DFS', delta: -0.19 },
        { id: 'top-sliding-window', sub: 'sub-dsa', name: 'Sliding Window & Subarray Algorithms', delta: -0.17 },
        { id: 'top-indexing', sub: 'sub-dbms', name: 'B-Trees & Database Indexing', delta: -0.15 },
        { id: 'top-verbal', sub: 'sub-aptitude', name: 'Verbal Ability', delta: -0.13 },
        { id: 'top-memory-mgmt', sub: 'sub-os', name: 'Virtual Memory & Paging', delta: -0.11 },
        { id: 'top-deadlocks', sub: 'sub-os', name: 'Deadlock Detection & Prevention', delta: -0.09 },
        { id: 'top-routing', sub: 'sub-cn', name: 'IP Addressing & Subnetting', delta: -0.07 },

        // Core foundational topics (moderate accuracy 64% - 72%)
        { id: 'top-arrays', sub: 'sub-dsa', name: 'Arrays & Two Pointers', delta: -0.04 },
        { id: 'top-stack-queue', sub: 'sub-dsa', name: 'Stacks & Queues', delta: -0.03 },
        { id: 'top-quant', sub: 'sub-aptitude', name: 'Quantitative Aptitude', delta: -0.02 },
        { id: 'top-searching-sorting', sub: 'sub-dsa', name: 'Searching & Sorting', delta: -0.01 },
        { id: 'top-trees', sub: 'sub-dsa', name: 'Binary Trees & BSTs', delta: +0.00 },
        { id: 'top-linked-lists', sub: 'sub-dsa', name: 'Linked Lists & Pointers', delta: +0.01 },
        { id: 'top-hashing', sub: 'sub-dsa', name: 'Hashing & Hash Tables', delta: +0.02 },
        { id: 'top-logic', sub: 'sub-aptitude', name: 'Logical Reasoning', delta: +0.02 },
        { id: 'top-heaps-priority', sub: 'sub-dsa', name: 'Heaps & Priority Queues', delta: +0.01 },
        { id: 'top-strings', sub: 'sub-dsa', name: 'Strings & Two-Pointers', delta: +0.02 },
        { id: 'top-asymptotic', sub: 'sub-dsa', name: 'Asymptotic Analysis', delta: +0.02 },
        { id: 'top-di', sub: 'sub-aptitude', name: 'Data Interpretation', delta: +0.03 },

        // High mastery topics (strength areas 74% - 85%)
        { id: 'top-cpu-sched', sub: 'sub-os', name: 'CPU Scheduling Algorithms', delta: +0.04 },
        { id: 'top-osi-tcp', sub: 'sub-cn', name: 'OSI vs TCP/IP Protocol Suite', delta: +0.04 },
        { id: 'top-pillars', sub: 'sub-oop', name: 'Core Pillars (Polymorphism & Abstraction)', delta: +0.05 },
        { id: 'top-design-pat', sub: 'sub-oop', name: 'Creational & Structural Patterns', delta: +0.04 },
        { id: 'top-normalization', sub: 'sub-dbms', name: 'Normalization (1NF to BCNF)', delta: +0.05 },
        { id: 'top-acid', sub: 'sub-dbms', name: 'Transactions & ACID Properties', delta: +0.06 },
        { id: 'top-sql-queries', sub: 'sub-dbms', name: 'SQL Queries & Joins', delta: +0.08 }
      ];

      // Each student has practice records across all challenge topics plus rotated curriculum topics
      const studentSubsetTopics = studentTopics.filter((_, tIdx) => tIdx < 8 || (tIdx + i) % 2 === 0);

      studentSubsetTopics.forEach((topic, tIdx) => {
        const topicAttempts = 6 + ((i + tIdx) % 8);
        const topicAccBase = Math.max(0.35, Math.min(0.96, accuracyBase + topic.delta + (((i + tIdx) % 5) * 0.02 - 0.04)));
        const topicCorrect = Math.max(1, Math.min(topicAttempts, Math.round(topicAttempts * topicAccBase)));
        const topicAccuracy = Math.round((topicCorrect / topicAttempts) * 100);

        newStudentPerformance.push({
          id: `perf-${userId}-${topic.id}`,
          user_id: userId,
          topic_id: topic.id,
          subject_id: topic.sub,
          attempts_count: topicAttempts,
          correct_count: topicCorrect,
          accuracy_rate: topicAccuracy,
          weakness_score: parseFloat(((100 - topicAccuracy) / 100).toFixed(2)),
          last_attempted_at: new Date(now - (daysAgo + (tIdx % 3)) * 24 * 3600 * 1000).toISOString()
        });
      });

      // Generate Coding Submissions
      for (let cIdx = 0; cIdx < codingAttemptsCount; cIdx++) {
        const probId = CODING_PROBLEMS_POOL[(i + cIdx + bIdx) % CODING_PROBLEMS_POOL.length];
        const isAccepted = tier === 'TOP'
          ? (cIdx < codingAttemptsCount - (i % 4 === 0 ? 1 : 0))
          : (tier === 'AVERAGE' && cIdx === 0);

        const passed = isAccepted ? 5 : (tier === 'AVERAGE' ? 3 : 1);
        const language = (i + cIdx) % 3 === 0 ? 'python' : ((i + cIdx) % 3 === 1 ? 'cpp' : 'java');

        newCodingSubmissions.push({
          id: `sub-${userId}-${cIdx}`,
          user_id: userId,
          problem_id: probId,
          language: language,
          status: isAccepted ? 'ACCEPTED' : 'WRONG_ANSWER',
          passed_count: passed,
          total_count: 5,
          execution_time: 180 + ((i * 11 + cIdx * 37) % 150),
          submitted_at: new Date(now - (daysAgo + cIdx) * 24 * 3600 * 1000).toISOString()
        });
      }
    }
  }

  console.log(`[Seed Department Students]: Generated ${newUsers.length} total users (${branches.length * 70} students across 12 branches).`);
  console.log(`[Seed Department Students]: Generated ${newQuizSessions.length} completed quiz sessions.`);
  console.log(`[Seed Department Students]: Generated ${newAttempts.length} individual question attempts.`);
  console.log(`[Seed Department Students]: Generated ${newStudentPerformance.length} topic performance records.`);
  console.log(`[Seed Department Students]: Generated ${newCodingSubmissions.length} coding challenge submissions.`);
  console.log(`[Seed Department Students]: Generated ${newStreaks.length} streak records.`);

  // Write to SQLite database
  console.log('[Seed Department Students]: Writing to SQLite database...');
  try {
    db.replaceAll('users', newUsers);
    db.replaceAll('quizSessions', newQuizSessions);
    db.replaceAll('attempts', newAttempts);
    db.replaceAll('studentPerformance', newStudentPerformance);
    db.replaceAll('codingSubmissions', newCodingSubmissions);
    db.replaceAll('streaks', newStreaks);
    console.log('[Seed Department Students]: Database replaceAll successful!');
  } catch (dbErr) {
    console.error('[Seed Department Students]: SQLite insertion error:', dbErr);
  }

  saveDb();
  console.log('[Seed Department Students]: Seeding complete!');

  // Generate Reference markdown log for Dean / Testing verification
  const summaryMarkdownPath = path.join(__dirname, '../../docs/STUDENT_CREDENTIALS_AND_ANALYTICS.md');
  const sampleLogins = [];

  for (const b of branches) {
    const branchStudents = newUsers
      .filter(u => u.branch_id === b.id && u.role === 'STUDENT' && u.id.startsWith('std-'))
      .sort((a, b) => (b.total_xp || 0) - (a.total_xp || 0));
    const topStudent = branchStudents[0];
    const avgStudent = branchStudents[25];
    const devStudent = branchStudents[60];

    sampleLogins.push({
      branch: b.name,
      code: b.code,
      totalStudents: branchStudents.length,
      topSample: topStudent ? `${topStudent.name} (\`${topStudent.email}\` - ${topStudent.total_xp} XP)` : 'N/A',
      avgSample: avgStudent ? `${avgStudent.name} (\`${avgStudent.email}\` - ${avgStudent.total_xp} XP)` : 'N/A',
      devSample: devStudent ? `${devStudent.name} (\`${devStudent.email}\` - ${devStudent.total_xp} XP)` : 'N/A'
    });
  }

  const tableRows = sampleLogins.map(l =>
    `| **${l.branch}** (${l.code}) | **70** | ${l.topSample} | ${l.avgSample} | ${l.devSample} |`
  ).join('\n');

  const report = `# PrepPilot AI — Department Student Cohorts & Credentials Directory

Total Enrolled Students: **840 Students** (Exactly 70 students across 12 B.Tech Engineering branches)
Universal Portal Login Password: **\`Password123\`**

---

### Department Roster & Sample 1-Click Login Accounts per Branch

| Branch / Department | Total Students | Top Performer Sample (86-98% Score) | Core Average Sample (60-84% Score) | Developing Sample (35-58% Score) |
| :--- | :---: | :--- | :--- | :--- |
${tableRows}

---

### Performance Tiers per Department (70 Students each)
- **Top Performers (10 students per branch)**: 86% - 98% accuracy, 2,100 - 2,750+ XP, 3-4 assessments completed, 3-4 coding problems solved with 100% test pass rate, 10-24 days streak.
- **Average Core Students (39 students per branch)**: 60% - 84% accuracy, 850 - 1,850 XP, 2-3 assessments completed, 1-3 coding problems solved, 2-7 days streak.
- **Developing Students (21 students per branch)**: 35% - 58% accuracy, 250 - 780 XP, 1 assessment completed, beginner coding attempts, 0-2 days streak.

---

### Administrative / Demo Accounts
| Account Type | Email | Password | Role | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Demo Student** | \`student@college.edu\` | \`Password123\` | Standard Student | Candidate Portal, Mock Interviews & Tests |
| **Placement Dean** | \`admin@college.edu\` / \`dean@college.edu\` | \`AdminPass123\` | Placement Dean | Dean Oversight & 12 Department Analytics |
`;

  fs.writeFileSync(summaryMarkdownPath, report, 'utf8');
  console.log(`[Seed Department Students]: Generated credentials guide at: ${summaryMarkdownPath}`);
}

if (process.argv[1] && process.argv[1].endsWith('seedDepartmentStudents.js')) {
  seedAllDepartmentStudents();
}
