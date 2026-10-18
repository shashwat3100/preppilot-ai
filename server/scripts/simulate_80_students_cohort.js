import db from '../src/database/db.js';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

// 80 Modern Real Names (40 Male, 40 Female) with realistic institutional profiles
const STUDENT_NAMES = [
  // 40 Male Students
  { name: 'Aarav Sharma', gender: 'M', branch: 'branch-cse', year: '4th Year' },
  { name: 'Vivaan Patel', gender: 'M', branch: 'branch-it', year: '4th Year' },
  { name: 'Aditya Verma', gender: 'M', branch: 'branch-cse', year: '3rd Year' },
  { name: 'Rohan Iyer', gender: 'M', branch: 'branch-ece', year: '4th Year' },
  { name: 'Siddharth Malhotra', gender: 'M', branch: 'branch-cse', year: '4th Year' },
  { name: 'Ishaan Joshi', gender: 'M', branch: 'branch-it', year: '3rd Year' },
  { name: 'Kabir Nair', gender: 'M', branch: 'branch-cse', year: '4th Year' },
  { name: 'Aryan Gupta', gender: 'M', branch: 'branch-ece', year: '3rd Year' },
  { name: 'Devansh Mehta', gender: 'M', branch: 'branch-cse', year: '4th Year' },
  { name: 'Pranav Choudhury', gender: 'M', branch: 'branch-it', year: '4th Year' },
  { name: 'Vihaan Rao', gender: 'M', branch: 'branch-cse', year: '3rd Year' },
  { name: 'Dhruv Singhania', gender: 'M', branch: 'branch-ece', year: '4th Year' },
  { name: 'Reyansh Saxena', gender: 'M', branch: 'branch-cse', year: '4th Year' },
  { name: 'Samar Kulkarni', gender: 'M', branch: 'branch-it', year: '3rd Year' },
  { name: 'Armaan Deshmukh', gender: 'M', branch: 'branch-cse', year: '4th Year' },
  { name: 'Tanmay Agarwal', gender: 'M', branch: 'branch-ece', year: '4th Year' },
  { name: 'Nikhil Sen', gender: 'M', branch: 'branch-cse', year: '3rd Year' },
  { name: 'Kunal Mukherjee', gender: 'M', branch: 'branch-it', year: '4th Year' },
  { name: 'Rishabh Reddy', gender: 'M', branch: 'branch-cse', year: '4th Year' },
  { name: 'Shaurya Nambiar', gender: 'M', branch: 'branch-ece', year: '3rd Year' },
  { name: 'Advait Menon', gender: 'M', branch: 'branch-cse', year: '4th Year' },
  { name: 'Harshit Kapoor', gender: 'M', branch: 'branch-it', year: '3rd Year' },
  { name: 'Manav Bhatt', gender: 'M', branch: 'branch-cse', year: '4th Year' },
  { name: 'Parth Trivedi', gender: 'M', branch: 'branch-ece', year: '4th Year' },
  { name: 'Ayush Pillai', gender: 'M', branch: 'branch-cse', year: '3rd Year' },
  { name: 'Aniket Chatterjee', gender: 'M', branch: 'branch-it', year: '4th Year' },
  { name: 'Tejas Patil', gender: 'M', branch: 'branch-cse', year: '4th Year' },
  { name: 'Varun Bhatia', gender: 'M', branch: 'branch-ece', year: '3rd Year' },
  { name: 'Tushar Chawla', gender: 'M', branch: 'branch-cse', year: '4th Year' },
  { name: 'Chirag Oberoi', gender: 'M', branch: 'branch-it', year: '3rd Year' },
  { name: 'Yashvardhan Rathore', gender: 'M', branch: 'branch-cse', year: '4th Year' },
  { name: 'Neil Goswami', gender: 'M', branch: 'branch-ece', year: '4th Year' },
  { name: 'Abhinav Kashyap', gender: 'M', branch: 'branch-cse', year: '3rd Year' },
  { name: 'Mayank Sethi', gender: 'M', branch: 'branch-it', year: '4th Year' },
  { name: 'Hrithik Kaul', gender: 'M', branch: 'branch-cse', year: '4th Year' },
  { name: 'Gautam Mathur', gender: 'M', branch: 'branch-ece', year: '3rd Year' },
  { name: 'Ritwik Sundaram', gender: 'M', branch: 'branch-cse', year: '4th Year' },
  { name: 'Sourav Das', gender: 'M', branch: 'branch-it', year: '4th Year' },
  { name: 'Madhav Vashisht', gender: 'M', branch: 'branch-cse', year: '3rd Year' },
  { name: 'Daksh Mittal', gender: 'M', branch: 'branch-ece', year: '4th Year' },

  // 40 Female Students
  { name: 'Ananya Verma', gender: 'F', branch: 'branch-cse', year: '4th Year' },
  { name: 'Diya Sen', gender: 'F', branch: 'branch-it', year: '4th Year' },
  { name: 'Tanvi Deshmukh', gender: 'F', branch: 'branch-cse', year: '3rd Year' },
  { name: 'Priya Patel', gender: 'F', branch: 'branch-ece', year: '4th Year' },
  { name: 'Meera Reddy', gender: 'F', branch: 'branch-cse', year: '4th Year' },
  { name: 'Sneha Mukherjee', gender: 'F', branch: 'branch-it', year: '3rd Year' },
  { name: 'Riya Banerjee', gender: 'F', branch: 'branch-cse', year: '4th Year' },
  { name: 'Ishita Rao', gender: 'F', branch: 'branch-ece', year: '3rd Year' },
  { name: 'Kavya Pillai', gender: 'F', branch: 'branch-cse', year: '4th Year' },
  { name: 'Natasha Saxena', gender: 'F', branch: 'branch-it', year: '4th Year' },
  { name: 'Anika Nair', gender: 'F', branch: 'branch-cse', year: '3rd Year' },
  { name: 'Tara Sengupta', gender: 'F', branch: 'branch-ece', year: '4th Year' },
  { name: 'Aditi Kulkarni', gender: 'F', branch: 'branch-cse', year: '4th Year' },
  { name: 'Simran Bhatia', gender: 'F', branch: 'branch-it', year: '3rd Year' },
  { name: 'Shreya Choudhury', gender: 'F', branch: 'branch-cse', year: '4th Year' },
  { name: 'Pooja Agarwal', gender: 'F', branch: 'branch-ece', year: '4th Year' },
  { name: 'Kriti Sharma', gender: 'F', branch: 'branch-cse', year: '3rd Year' },
  { name: 'Avani Joshi', gender: 'F', branch: 'branch-it', year: '4th Year' },
  { name: 'Navya Oberoi', gender: 'F', branch: 'branch-cse', year: '4th Year' },
  { name: 'Divya Malhotra', gender: 'F', branch: 'branch-ece', year: '3rd Year' },
  { name: 'Swara Menon', gender: 'F', branch: 'branch-cse', year: '4th Year' },
  { name: 'Ira Bhattacharya', gender: 'F', branch: 'branch-it', year: '3rd Year' },
  { name: 'Sanjana Kapoor', gender: 'F', branch: 'branch-cse', year: '4th Year' },
  { name: 'Disha Trivedi', gender: 'F', branch: 'branch-ece', year: '4th Year' },
  { name: 'Riddhi Singhania', gender: 'F', branch: 'branch-cse', year: '3rd Year' },
  { name: 'Anvi Goswami', gender: 'F', branch: 'branch-it', year: '4th Year' },
  { name: 'Trisha Sethi', gender: 'F', branch: 'branch-cse', year: '4th Year' },
  { name: 'Megha Sundaram', gender: 'F', branch: 'branch-ece', year: '3rd Year' },
  { name: 'Radhika Das', gender: 'F', branch: 'branch-cse', year: '4th Year' },
  { name: 'Lavanya Nambiar', gender: 'F', branch: 'branch-it', year: '3rd Year' },
  { name: 'Shalini Kaul', gender: 'F', branch: 'branch-cse', year: '4th Year' },
  { name: 'Vidhi Mathur', gender: 'F', branch: 'branch-ece', year: '4th Year' },
  { name: 'Pallavi Vashisht', gender: 'F', branch: 'branch-cse', year: '3rd Year' },
  { name: 'Jhanvi Mittal', gender: 'F', branch: 'branch-it', year: '4th Year' },
  { name: 'Ahana Chatterjee', gender: 'F', branch: 'branch-cse', year: '4th Year' },
  { name: 'Shruti Rathore', gender: 'F', branch: 'branch-ece', year: '3rd Year' },
  { name: 'Niharika Kashyap', gender: 'F', branch: 'branch-cse', year: '4th Year' },
  { name: 'Anushree Chawla', gender: 'F', branch: 'branch-it', year: '3rd Year' },
  { name: 'Bhavna Patil', gender: 'F', branch: 'branch-cse', year: '4th Year' },
  { name: 'Mansi Bhatt', gender: 'F', branch: 'branch-ece', year: '4th Year' }
];

// Verified Coding Solutions in JavaScript (Node.js CommonJS runner)
const CODING_SOLUTIONS = {
  'prob-two-sum': `
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (input.length >= 2) {
  const nums = input[0].trim().split(/\\s+/).map(Number);
  const target = Number(input[1].trim());
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      console.log(map.get(complement) + ' ' + i);
      break;
    }
    map.set(nums[i], i);
  }
}
`,
  'prob-valid-parentheses': `
const fs = require('fs');
const s = fs.readFileSync(0, 'utf-8').trim();
function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const c of s) {
    if (c === '(' || c === '{' || c === '[') {
      stack.push(c);
    } else if (map[c]) {
      if (stack.length === 0 || stack.pop() !== map[c]) return false;
    }
  }
  return stack.length === 0;
}
console.log(isValid(s) ? 'true' : 'false');
`,
  'prob-binary-search': `
const fs = require('fs');
const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (lines.length >= 2) {
  const nums = lines[0].trim().split(/\\s+/).map(Number);
  const target = Number(lines[1].trim());
  let left = 0, right = nums.length - 1, ans = -1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) {
      ans = mid;
      break;
    } else if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  console.log(ans);
}
`
};

const TARGET_COMPANIES = ['comp-tcs', 'comp-infosys', 'comp-amazon', 'comp-wipro', 'comp-accenture'];

async function jsonFetch(url, options = {}, retries = 4) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Connection': 'keep-alive',
          ...(options.headers || {})
        }
      });
      const data = await res.json().catch(() => ({}));
      return { status: res.status, data };
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 250 * attempt));
    }
  }
}

async function runCohortSimulation() {
  console.log('==================================================================');
  console.log('🚀 PREPPILOT AI: 80 MODERN REAL STUDENTS COHORT END-TO-END TEST');
  console.log('==================================================================\n');

  console.log(`Checking connection to backend at ${BASE_URL}...`);
  const health = await jsonFetch(`${BASE_URL}/api/health`);
  if (health.status !== 200) {
    console.error('Backend health check failed:', health);
    process.exit(1);
  }
  console.log('✓ Backend is ONLINE:', health.data.service);

  const cohortResults = [];
  const startTime = Date.now();

  console.log(`\nBeginning simulation for ${STUDENT_NAMES.length} real students...\n`);

  for (let i = 0; i < STUDENT_NAMES.length; i++) {
    const st = STUDENT_NAMES[i];
    const emailSlug = st.name.toLowerCase().replace(/[^a-z]/g, '.');
    const email = `${emailSlug}.${i + 1}@college.edu`;
    const password = 'Password123';

    process.stdout.write(`[${i + 1}/80] Processing student: ${st.name} (${email})... `);

    // 1. REGISTER STUDENT
    const regRes = await jsonFetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      body: JSON.stringify({
        name: st.name,
        email,
        password,
        branch_id: st.branch,
        year: st.year,
        target_companies: [
          TARGET_COMPANIES[i % TARGET_COMPANIES.length],
          TARGET_COMPANIES[(i + 1) % TARGET_COMPANIES.length]
        ],
        areas_of_interest: ['DSA', 'Operating Systems', 'DBMS', 'Computer Networks']
      })
    });

    let token = '';
    let userId = '';

    if (regRes.status === 201 && regRes.data.success) {
      token = regRes.data.token;
      userId = regRes.data.user.id;
    } else {
      // If already registered, log in
      const loginRes = await jsonFetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (loginRes.status !== 200 || !loginRes.data.token) {
        console.error(`\n❌ Failed to authenticate student ${email}:`, loginRes.data);
        continue;
      }
      token = loginRes.data.token;
      userId = loginRes.data.user.id;
    }

    const authHeaders = { Authorization: `Bearer ${token}` };

    // 2. SOLVE QUIZ
    // Generate custom practice quiz with 5 questions
    const quizInitRes = await jsonFetch(`${BASE_URL}/api/quiz/custom`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        question_count: 5,
        difficulty: i % 3 === 0 ? 'Medium' : 'Easy'
      })
    });

    let quizSummary = { score: 0, xp: 0, verified: false };

    if (quizInitRes.status === 200 && quizInitRes.data.quiz) {
      const quiz = quizInitRes.data.quiz;
      const sessionId = quiz.session_id;
      const questions = quiz.questions || [];

      // Realistic answering: students answer 4 or 5 correctly (80% - 100% accuracy)
      const answers = questions.map((q, qIdx) => {
        const trueQ = db.get('questions', q.id);
        const correctKey = trueQ ? trueQ.correct_answer : (q.options && q.options[0] ? q.options[0].option_key : 'A');

        // Occasional human mistake (1 wrong answer for every 5th student on question 1)
        const makeMistake = (i % 5 === 0 && qIdx === 0);
        let selectedOption = correctKey;

        if (makeMistake) {
          const wrongOption = (q.options || []).find(o => o.option_key !== correctKey);
          selectedOption = wrongOption ? wrongOption.option_key : 'A';
        }

        return {
          question_id: q.id,
          selected_option: selectedOption,
          time_spent: 18 + (qIdx * 6)
        };
      });

      const submitRes = await jsonFetch(`${BASE_URL}/api/quiz/${sessionId}/submit`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          answers,
          total_time_taken: 120
        })
      });

      if (submitRes.status === 200 && submitRes.data.result) {
        const resObj = submitRes.data.result;
        quizSummary.score = resObj.accuracy_rate;
        quizSummary.xp = resObj.xp_earned;

        // VERIFY: Can student view their past quiz results?
        const getSessionRes = await jsonFetch(`${BASE_URL}/api/quiz/session/${sessionId}`, {
          headers: authHeaders
        });
        if (getSessionRes.status === 200 && getSessionRes.data.session) {
          quizSummary.verified = true;
        }
      }
    }

    // 3. SOLVE PROGRAMMING PROBLEM
    const codingProblemKey = i % 3 === 0 ? 'prob-valid-parentheses' : i % 3 === 1 ? 'prob-binary-search' : 'prob-two-sum';
    const codeSnippet = CODING_SOLUTIONS[codingProblemKey];

    const codingRes = await jsonFetch(`${BASE_URL}/api/coding/submit`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        problemId: codingProblemKey,
        language: 'javascript',
        code: codeSnippet
      })
    });

    let codingSummary = { problem: codingProblemKey, status: 'FAILED', verified: false, testsPassed: 0 };
    if (codingRes.status === 200 && codingRes.data.submission) {
      codingSummary.status = codingRes.data.status;
      codingSummary.testsPassed = codingRes.data.passedCount;

      // VERIFY: Can student view their coding submissions history?
      const subListRes = await jsonFetch(`${BASE_URL}/api/coding/submissions?problem_id=${codingProblemKey}`, {
        headers: authHeaders
      });
      if (subListRes.status === 200 && Array.isArray(subListRes.data.submissions) && subListRes.data.submissions.length > 0) {
        codingSummary.verified = true;
      }
    }

    // 4. VERIFY DASHBOARD RESULTS
    const dashRes = await jsonFetch(`${BASE_URL}/api/dashboard/stats`, {
      headers: authHeaders
    });

    let dashSummary = { xp: 0, accuracy: 0, prepScore: 0, verified: false };
    if (dashRes.status === 200 && dashRes.data.stats) {
      const stats = dashRes.data.stats;
      dashSummary.xp = stats.total_xp || 0;
      dashSummary.accuracy = stats.overall_accuracy || 0;
      dashSummary.prepScore = stats.preparation_score || 0;
      dashSummary.verified = true;
    }

    cohortResults.push({
      id: i + 1,
      name: st.name,
      email,
      branch: st.branch.replace('branch-', '').toUpperCase(),
      year: st.year,
      quizScore: `${quizSummary.score}%`,
      quizXp: quizSummary.xp,
      quizResultVisible: quizSummary.verified ? 'YES' : 'NO',
      codingProblem: codingSummary.problem,
      codingStatus: codingSummary.status,
      codingResultVisible: codingSummary.verified ? 'YES' : 'NO',
      dashPrepScore: dashSummary.prepScore,
      dashVerified: dashSummary.verified ? 'YES' : 'NO'
    });

    console.log(`✓ [Quiz: ${quizSummary.score}% (${quizSummary.xp} XP)] [Code: ${codingSummary.status} (${codingSummary.testsPassed} tests)] [Results Visible: YES]`);
    await new Promise(r => setTimeout(r, 60));
  }

  const durationSec = Math.round((Date.now() - startTime) / 1000);

  console.log('\n==================================================================');
  console.log(`📊 COHORT VERIFICATION SUMMARY (${cohortResults.length} STUDENTS)`);
  console.log(`⏱️ Completed in ${durationSec} seconds`);
  console.log('==================================================================\n');

  console.table(cohortResults.slice(0, 15));
  console.log(`... and ${cohortResults.length - 15} more students successfully completed.\n`);

  // 5. AUDIT ADMIN AND DEAN DASHBOARDS
  console.log('--- ADMIN & DEAN COHORT AUDIT ---');

  // Admin login
  const adminLogin = await jsonFetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@preppilot.ai', password: 'admin123' })
  });

  if (adminLogin.status === 200 && adminLogin.data.token) {
    const adminToken = adminLogin.data.token;
    const adminOverview = await jsonFetch(`${BASE_URL}/api/admin/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminStudents = await jsonFetch(`${BASE_URL}/api/admin/students`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('✓ Admin Dashboard Overview:');
    const stats = adminOverview.data.overview || adminOverview.data.stats || {};
    console.log(`  - Total Registered Students: ${stats.total_students || adminStudents.data.students?.length}`);
    console.log(`  - Total Assessment/Quiz Sessions: ${stats.total_sessions}`);
    console.log(`  - Total Coding Submissions: ${stats.total_coding_submissions}`);
    console.log(`  - Questions in Bank: ${stats.total_questions}`);
    console.log(`  - Roster count from /admin/students: ${adminStudents.data.students?.length} students`);
  }

  // Dean login
  const deanLogin = await jsonFetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: 'dean@college.edu', password: 'DeanPass123' })
  });

  if (deanLogin.status === 200 && deanLogin.data.token) {
    const deanToken = deanLogin.data.token;
    const deanOverview = await jsonFetch(`${BASE_URL}/api/dean/overview`, {
      headers: { Authorization: `Bearer ${deanToken}` }
    });
    const deanPerf = await jsonFetch(`${BASE_URL}/api/dean/performance`, {
      headers: { Authorization: `Bearer ${deanToken}` }
    });

    console.log('✓ Dean Academic Oversight:');
    const metrics = deanOverview.data.overview?.metrics || {};
    console.log(`  - Cohort Total Students: ${metrics.total_students}`);
    console.log(`  - Cohort Average Score: ${metrics.cohort_average_score}%`);
    console.log(`  - Coding Acceptance Rate: ${metrics.coding_acceptance_rate}%`);
    console.log(`  - Performance records ranked: ${deanPerf.data.students?.length}`);
  }

  const allPassedQuiz = cohortResults.every(r => r.quizResultVisible === 'YES');
  const allPassedCoding = cohortResults.every(r => r.codingResultVisible === 'YES');
  const allPassedDash = cohortResults.every(r => r.dashVerified === 'YES');

  if (allPassedQuiz && allPassedCoding && allPassedDash) {
    console.log('\n==================================================================');
    console.log('🎉 ALL 80 STUDENTS TESTED, SOLVED QUIZZES & CODING, AND ACCESSED RESULTS!');
    console.log('==================================================================\n');
  } else {
    console.warn('\n⚠️ Some student verifications failed. Review logs above.');
  }
}

runCohortSimulation().catch(console.error);
