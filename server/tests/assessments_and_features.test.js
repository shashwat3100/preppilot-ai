import http from 'http';
import app, { startServer } from '../src/index.js';
import db, { initDb } from '../src/database/db.js';
import QuizEngine from '../src/services/quizEngine.js';
import { runCode, getSupportedLanguages } from '../src/services/codeExecutionService.js';
import RagService from '../src/services/ragService.js';

process.env.TEST_MODE = 'true';

let testServer;
let baseUrl;

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const bodyStr = options.body ? JSON.stringify(options.body) : '';
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    if (bodyStr) {
      headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const req = http.request(url, {
      method: options.method || 'GET',
      headers,
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json;
        try {
          json = data ? JSON.parse(data) : {};
        } catch {
          json = { raw: data };
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('timeout', () => {
      req.destroy(new Error(`Request to ${path} timed out after 10000ms`));
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

const testResults = [];
function assert(condition, message) {
  if (condition) {
    testResults.push({ passed: true, message });
    console.log(`  ✓ ${message}`);
  } else {
    testResults.push({ passed: false, message });
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function runTests() {
  console.log('\n==================================================================');
  console.log('PrepPilot AI — Functional Feature & Assessment Audit Test Suite');
  console.log('==================================================================\n');

  try {
    initDb();
    testServer = await startServer(0);
    const port = testServer.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
    console.log(`[Test Server Booted] Running on ${baseUrl}\n`);

    // --- TEST GROUP 1: Health & App Branding Configuration ---
    console.log('--- TEST GROUP 1: Health & App Branding ---');
    const healthRes = await request('/api/health');
    assert(healthRes.status === 200, 'GET /api/health returns HTTP 200');
    assert(healthRes.body.status === 'ONLINE', 'PrepPilot service status is ONLINE');
    assert(healthRes.body.service.includes('PrepPilot AI'), 'Service identifier contains PrepPilot AI');

    // Authenticate a student user
    const studentUser = db.findOne('users', u => u.email === 'student@preppilot.ai') ||
      db.findOne('users', u => u.email === 'student@careerprep.ai') ||
      db.findOne('users', u => (u.role || '').toLowerCase() === 'student');
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: studentUser.email,
        password: studentUser.email === 'student@preppilot.ai' || studentUser.email === 'student@careerprep.ai' ? 'password123' : 'Student@123'
      }
    });
    assert(loginRes.status === 200, 'Student authenticates successfully via /api/auth/login');
    const token = loginRes.body.token;
    assert(token && token.length > 20, 'Auth endpoint returns valid JWT token');

    const authHeaders = {
      Authorization: `Bearer ${token}`
    };

    // --- TEST GROUP 2: Assessment Catalog & Distinct Quotas ---
    console.log('\n--- TEST GROUP 2: Assessment System & Question Banks ---');
    const catalogRes = await request('/api/quiz/assessments', { headers: authHeaders });
    assert(catalogRes.status === 200, 'GET /api/quiz/assessments returns HTTP 200');
    assert(catalogRes.body.success === true, 'Assessment catalog returns success: true');
    assert(Array.isArray(catalogRes.body.assessments), 'Assessments catalog is an array');

    const coreCs = catalogRes.body.assessments.find(a => a.id.includes('core-cs') || a.type === 'core-cs');
    const tcs = catalogRes.body.assessments.find(a => a.id.includes('tcs') || a.type === 'tcs-nqt');
    const dsa = catalogRes.body.assessments.find(a => a.id.includes('dsa') || a.type === 'dsa-mastery');

    assert(coreCs && (coreCs.question_count === 20 || coreCs.questionCount === 20) && (coreCs.duration_minutes === 25 || coreCs.durationMinutes === 25), 'Core CS assessment has exactly 20 questions and 25-minute limit');
    assert(tcs && (tcs.question_count === 30 || tcs.questionCount === 30) && (tcs.duration_minutes === 45 || tcs.durationMinutes === 45), 'TCS assessment has exactly 30 questions and 45-minute limit');
    assert(dsa && (dsa.question_count === 15 || dsa.questionCount === 15) && (dsa.duration_minutes === 30 || dsa.durationMinutes === 30), 'DSA assessment has exactly 15 questions and 30-minute limit');

    // Start assessment via HTTP endpoint
    const startCoreCsRes = await request('/api/quiz/assessments/core-cs/start', {
      method: 'POST',
      headers: authHeaders
    });
    assert(startCoreCsRes.status === 200, 'POST /api/quiz/assessments/core-cs/start returns HTTP 200');
    const startedAssessment = startCoreCsRes.body.assessment;
    assert(startedAssessment && startedAssessment.questions.length === 20, 'API started assessment delivers exactly 20 questions');
    const startedIds = new Set(startedAssessment.questions.map(q => q.id));
    assert(startedIds.size === 20, 'All 20 questions delivered to candidate are unique and non-duplicated');

    // Generate TCS and DSA directly from QuizEngine to verify non-duplicated authentic questions
    const generatedTcs = QuizEngine.generateAssessment(studentUser.id, 'tcs-nqt');
    assert(generatedTcs.questions.length === 30, `Generated TCS assessment contains exactly 30 questions (got ${generatedTcs.questions.length})`);
    const tcsIds = new Set(generatedTcs.questions.map(q => q.id));
    assert(tcsIds.size === 30, 'All 30 questions in TCS assessment are unique without repetition');

    const generatedDsa = QuizEngine.generateAssessment(studentUser.id, 'dsa-mastery');
    assert(generatedDsa.questions.length === 15, `Generated DSA assessment contains exactly 15 questions (got ${generatedDsa.questions.length})`);
    const dsaIds = new Set(generatedDsa.questions.map(q => q.id));
    assert(dsaIds.size === 15, 'All 15 questions in DSA assessment are unique');

    // Test assessment scoring and explanation generation
    const sampleQuestion = startedAssessment.questions[0];
    const fullDbQ = db.get('questions', sampleQuestion.id);
    const answersPayload = {
      [sampleQuestion.id]: fullDbQ.correct_answer
    };

    const targetSessionId = startedAssessment.session_id || startedAssessment.quiz_id;
    const answersList = [
      {
        question_id: sampleQuestion.id,
        user_answer: fullDbQ.correct_answer,
        time_spent_seconds: 15
      }
    ];

    const submitRes = await request(`/api/quiz/${targetSessionId}/submit`, {
      method: 'POST',
      headers: authHeaders,
      body: {
        answers: answersList,
        total_time_taken: 120
      }
    });
    assert(submitRes.status === 200, 'POST /api/quiz/:id/submit returns HTTP 200');
    assert(submitRes.body.success === true, 'Quiz submission returns success: true');
    const resultData = submitRes.body.result;
    assert(resultData && (resultData.accuracy_rate !== undefined || resultData.score !== undefined), 'Quiz grading calculates accuracy score for submission');
    assert(Array.isArray(resultData.graded_questions || resultData.detailed_results), 'Quiz submission returns graded questions array');
    const gradedList = resultData.graded_questions || resultData.detailed_results;
    assert(gradedList[0].explanation && gradedList[0].explanation.length > 5, 'Graded question returns educational explanation');

    // --- TEST GROUP 3: Coding Arena Languages & Starter Codes ---
    console.log('\n--- TEST GROUP 3: Coding Arena & Sandboxed Execution ---');
    const supportedLangs = getSupportedLanguages();
    const langIds = supportedLangs.map(l => l.id);
    assert(langIds.includes('javascript'), 'Coding execution engine supports javascript');
    assert(langIds.includes('python'), 'Coding execution engine supports python');
    assert(langIds.includes('java'), 'Coding execution engine supports java');
    assert(langIds.includes('c'), 'Coding execution engine supports C');
    assert(langIds.includes('cpp'), 'Coding execution engine supports C++');

    // Execute Python code in local environment
    const pyResult = await runCode('print("PrepPilot Test Success")', 'python', '');
    assert(pyResult.success === true, 'Python code executes successfully');
    assert(pyResult.output && pyResult.output.includes('PrepPilot Test Success'), 'Python output contains expected stdout');
    assert(pyResult.isSandboxed === false, 'Code execution honestly reports un-sandboxed local dev status');

    // Execute JavaScript code
    const jsResult = await runCode('console.log("JS Runner Active");', 'javascript', '');
    assert(jsResult.success === true, 'JavaScript code runner executes cleanly');
    assert(jsResult.output && jsResult.output.includes('JS Runner Active'), 'JavaScript output contains expected log message');

    // --- TEST GROUP 4: Interview Coach & RAG Service Honesty ---
    console.log('\n--- TEST GROUP 4: Interview Coach & RAG Service Honesty ---');
    // Test empty query rejection
    const emptyQueryRes = await RagService.answerStudentQuery('   ');
    assert(emptyQueryRes.answer && emptyQueryRes.answer.length > 0, 'Empty or non-domain queries trigger guardrail guidance');

    // Test technical query response
    const dbmsQueryRes = await RagService.answerStudentQuery('Explain 3NF and BCNF normalization anomalies');
    assert(dbmsQueryRes.answer.includes('Normal Form'), 'Coach returns detailed normalization explanation');
    assert(dbmsQueryRes.isLiveApi === false, 'Coach honestly reports isLiveApi: false when no external Google API key is configured');
    assert(dbmsQueryRes.model === 'gemini-2.5-flash', 'Coach attributes requested model tag accurately');

    // --- TEST GROUP 5: Analytics Honesty & Metrics Compilation ---
    console.log('\n--- TEST GROUP 5: Analytics Honesty & Metrics Compilation ---');
    const analyticsRes = await request('/api/analytics', { headers: authHeaders });
    assert(analyticsRes.status === 200, 'GET /api/analytics returns HTTP 200');
    assert(analyticsRes.body.success === true, 'Analytics returns success: true');
    const analytics = analyticsRes.body.analytics;
    assert(analytics && analytics.summary, 'Analytics payload contains summary data');
    assert(analytics.placement_readiness, 'Analytics contains placement readiness calculation');
    assert(analytics.placement_readiness.company_eligibility.length === 8, 'Recruiter benchmark matrix covers all 8 top recruitment companies');

  } catch (err) {
    console.error('Fatal test error:', err);
    assert(false, `Unexpected error during test execution: ${err.message}`);
  } finally {
    if (testServer) {
      testServer.close();
      console.log('\n[Test Server Stopped]');
    }

    const passed = testResults.filter(r => r.passed).length;
    const failed = testResults.filter(r => !r.passed).length;
    console.log('\n==================================================================');
    console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED (TOTAL: ${testResults.length})`);
    console.log('==================================================================\n');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

runTests();
