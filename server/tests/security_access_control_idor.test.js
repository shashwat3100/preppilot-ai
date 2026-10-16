import http from 'http';
import assert from 'assert';
import { startServer } from '../src/index.js';
import db, { initDb } from '../src/database/db.js';
import QuizEngine from '../src/services/quizEngine.js';
import { v4 as uuidv4 } from 'uuid';

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
      headers
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

    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function runSecurityAccessControlAudit() {
  console.log('==================================================================');
  console.log('PREPPILOT AI — SECURITY ACCESS CONTROL & IDOR VERIFICATION SUITE');
  console.log('==================================================================\n');

  initDb();
  testServer = await startServer(0);
  const port = testServer.address().port;
  baseUrl = `http://127.0.0.1:${port}`;

  const timestamp = Date.now();
  const student1Email = `student_alice_${timestamp}@college.edu`;
  const student2Email = `student_bob_${timestamp}@college.edu`;

  // 1. Setup Student Alice
  const regAlice = await request('/api/auth/register', {
    method: 'POST',
    body: { name: 'Alice Student', email: student1Email, password: 'Password123' }
  });
  assert.strictEqual(regAlice.status, 201, 'Alice registration must return 201');
  const aliceToken = regAlice.body.token;
  const aliceId = regAlice.body.user.id;

  // 2. Setup Student Bob
  const regBob = await request('/api/auth/register', {
    method: 'POST',
    body: { name: 'Bob Student', email: student2Email, password: 'Password123' }
  });
  assert.strictEqual(regBob.status, 201, 'Bob registration must return 201');
  const bobToken = regBob.body.token;
  const bobId = regBob.body.user.id;

  console.log(`[Setup] Alice ID: ${aliceId}`);
  console.log(`[Setup] Bob ID:   ${bobId}`);

  // -------------------------------------------------------------------------
  // SECTION 1: VERIFY STUDENTS CANNOT ACCESS ADMIN FEATURES OR ENDPOINTS
  // -------------------------------------------------------------------------
  console.log('\n--- Section 1: Verification That Students Cannot Access Admin Features ---');

  // Test 1.1: GET /api/admin/overview
  const adminOverview = await request('/api/admin/overview', {
    headers: { Authorization: `Bearer ${aliceToken}` }
  });
  console.log(`[Security 1.1] GET /api/admin/overview with Student Token: HTTP ${adminOverview.status}`);
  assert.strictEqual(adminOverview.status, 403, 'Student must be rejected from admin overview with HTTP 403');
  assert.strictEqual(adminOverview.body.success, false);

  // Test 1.2: GET /api/admin/students
  const adminStudents = await request('/api/admin/students', {
    headers: { Authorization: `Bearer ${aliceToken}` }
  });
  console.log(`[Security 1.2] GET /api/admin/students with Student Token: HTTP ${adminStudents.status}`);
  assert.strictEqual(adminStudents.status, 403, 'Student must be rejected from admin students roster with HTTP 403');

  // Test 1.3: GET /api/admin/students/:id
  const adminStudentDetail = await request(`/api/admin/students/${bobId}`, {
    headers: { Authorization: `Bearer ${aliceToken}` }
  });
  console.log(`[Security 1.3] GET /api/admin/students/:id with Student Token: HTTP ${adminStudentDetail.status}`);
  assert.strictEqual(adminStudentDetail.status, 403, 'Student must be rejected from viewing another student via admin endpoint with HTTP 403');

  // Test 1.4: POST /api/admin/questions (Create question)
  const adminCreateQuestion = await request('/api/admin/questions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${aliceToken}` },
    body: { question: 'Malicious Injected Question', difficulty: 'Easy' }
  });
  console.log(`[Security 1.4] POST /api/admin/questions with Student Token: HTTP ${adminCreateQuestion.status}`);
  assert.strictEqual(adminCreateQuestion.status, 403, 'Student must be prohibited from creating questions with HTTP 403');

  // Test 1.5: DELETE /api/admin/questions/:id
  const adminDeleteQuestion = await request('/api/admin/questions/q-dbms-1', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${aliceToken}` }
  });
  console.log(`[Security 1.5] DELETE /api/admin/questions/:id with Student Token: HTTP ${adminDeleteQuestion.status}`);
  assert.strictEqual(adminDeleteQuestion.status, 403, 'Student must be prohibited from deleting questions with HTTP 403');

  // Test 1.6: POST /api/admin/invite-token (Issue Dean/Admin invite)
  const adminInviteToken = await request('/api/admin/invite-token', {
    method: 'POST',
    headers: { Authorization: `Bearer ${aliceToken}` },
    body: { role: 'ADMIN' }
  });
  console.log(`[Security 1.6] POST /api/admin/invite-token with Student Token: HTTP ${adminInviteToken.status}`);
  assert.strictEqual(adminInviteToken.status, 403, 'Student must be prohibited from generating admin tokens with HTTP 403');

  // Test 1.7: POST /api/coding/problems (Admin-only problem creation)
  const codingCreateProblem = await request('/api/coding/problems', {
    method: 'POST',
    headers: { Authorization: `Bearer ${aliceToken}` },
    body: { title: 'Unauthorized Problem', difficulty: 'Easy', description: 'Test' }
  });
  console.log(`[Security 1.7] POST /api/coding/problems with Student Token: HTTP ${codingCreateProblem.status}`);
  assert.strictEqual(codingCreateProblem.status, 403, 'Student must be rejected from creating coding problems with HTTP 403');

  // Test 1.8: PUT /api/coding/problems/:id (Admin-only problem update)
  const codingUpdateProblem = await request('/api/coding/problems/prob-two-sum', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${aliceToken}` },
    body: { title: 'Hacked Title' }
  });
  console.log(`[Security 1.8] PUT /api/coding/problems/:id with Student Token: HTTP ${codingUpdateProblem.status}`);
  assert.strictEqual(codingUpdateProblem.status, 403, 'Student must be rejected from updating coding problems with HTTP 403');

  // Test 1.9: DELETE /api/coding/problems/:id (Admin-only problem deletion)
  const codingDeleteProblem = await request('/api/coding/problems/prob-two-sum', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${aliceToken}` }
  });
  console.log(`[Security 1.9] DELETE /api/coding/problems/:id with Student Token: HTTP ${codingDeleteProblem.status}`);
  assert.strictEqual(codingDeleteProblem.status, 403, 'Student must be rejected from deleting coding problems with HTTP 403');

  // Test 1.10: POST /api/coding/problems/:id/testcases (Admin-only testcase creation)
  const codingAddTestCase = await request('/api/coding/problems/prob-two-sum/testcases', {
    method: 'POST',
    headers: { Authorization: `Bearer ${aliceToken}` },
    body: { input: '123', expectedOutput: '456' }
  });
  console.log(`[Security 1.10] POST /api/coding/problems/:id/testcases with Student Token: HTTP ${codingAddTestCase.status}`);
  assert.strictEqual(codingAddTestCase.status, 403, 'Student must be rejected from adding testcases with HTTP 403');

  // Test 1.11: Vertical Privilege Escalation via registration body
  const regEscalation = await request('/api/auth/register', {
    method: 'POST',
    body: { name: 'Escalation Attacker', email: `hacker_${timestamp}@college.edu`, password: 'Password123', role: 'ADMIN' }
  });
  console.log(`[Security 1.11] Public registration with role: 'ADMIN': role forced to '${regEscalation.body.user?.role}'`);
  assert.strictEqual(regEscalation.status, 201);
  assert.strictEqual(regEscalation.body.user.role, 'STUDENT', 'Public registration must force role to STUDENT, never granting ADMIN');

  // -------------------------------------------------------------------------
  // SECTION 2: VERIFY STUDENTS CANNOT ACCESS OR MUTATE ANOTHER STUDENT'S DATA (IDOR)
  // -------------------------------------------------------------------------
  console.log('\n--- Section 2: Verification of Student Data Isolation & IDOR Protection ---');

  // Setup: Alice creates an active Quiz Session
  const aliceQuizStart = await request('/api/quiz/assessments/core-cs/start', {
    method: 'POST',
    headers: { Authorization: `Bearer ${aliceToken}` }
  });
  const aliceSessionId = aliceQuizStart.body.assessment?.session_id;
  assert.ok(aliceSessionId, 'Alice must successfully start a quiz session');
  console.log(`[Setup] Alice started quiz session: ${aliceSessionId}`);

  // Test 2.1: IDOR GET - Bob attempts to retrieve Alice's quiz session
  const bobFetchAliceSession = await request(`/api/quiz/session/${aliceSessionId}`, {
    headers: { Authorization: `Bearer ${bobToken}` }
  });
  console.log(`[Security 2.1] Bob querying Alice's Quiz Session (/api/quiz/session/${aliceSessionId}): HTTP ${bobFetchAliceSession.status}`);
  assert.strictEqual(bobFetchAliceSession.status, 404, 'Bob must be denied access to Alice quiz session with HTTP 404');

  // Test 2.2: IDOR POST - Bob attempts to submit answers on Alice's quiz session
  const bobSubmitAliceSession = await request(`/api/quiz/${aliceSessionId}/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${bobToken}` },
    body: { answers: [], total_time_taken: 10 }
  });
  console.log(`[Security 2.2] Bob submitting answers to Alice's Quiz Session: HTTP ${bobSubmitAliceSession.status}`);
  assert.strictEqual(bobSubmitAliceSession.status, 400, 'Bob must be rejected when submitting answers to Alice session');
  assert.ok(
    bobSubmitAliceSession.body.message?.toLowerCase().includes('unauthorized') ||
    bobSubmitAliceSession.body.message?.toLowerCase().includes('not found') ||
    !bobSubmitAliceSession.body.success,
    'Server must reject submission with unauthorized message'
  );

  // Setup: Alice creates a coding submission
  const aliceSubmissionId = `sub-alice-${uuidv4()}`;
  db.insert('codingSubmissions', {
    id: aliceSubmissionId,
    problem_id: 'prob-two-sum',
    user_id: aliceId,
    code: 'print("Alice secret code solution")',
    language: 'python',
    status: 'ACCEPTED',
    submitted_at: new Date().toISOString()
  });
  console.log(`[Setup] Alice created coding submission: ${aliceSubmissionId}`);

  // Test 2.3: IDOR GET - Bob attempts to view Alice's coding submission
  const bobFetchAliceCode = await request(`/api/coding/submissions/${aliceSubmissionId}`, {
    headers: { Authorization: `Bearer ${bobToken}` }
  });
  console.log(`[Security 2.3] Bob fetching Alice's Coding Submission (/api/coding/submissions/${aliceSubmissionId}): HTTP ${bobFetchAliceCode.status}`);
  assert.strictEqual(bobFetchAliceCode.status, 404, 'Bob must receive HTTP 404 when querying Alice coding submission');

  // Setup: Alice starts a timed coding assessment attempt
  const aliceAssessmentAttemptId = `asmt-att-alice-${uuidv4()}`;
  db.insert('codingAssessmentAttempts', {
    id: aliceAssessmentAttemptId,
    assessment_id: 'asmt-tcs-nqt-round1',
    user_id: aliceId,
    start_time: new Date().toISOString(),
    duration_minutes: 45,
    status: 'IN_PROGRESS',
    created_at: new Date().toISOString()
  });
  console.log(`[Setup] Alice created timed coding assessment attempt: ${aliceAssessmentAttemptId}`);

  // Test 2.4: IDOR GET - Bob attempts to view Alice's assessment attempt
  const bobFetchAliceAssessment = await request(`/api/coding/assessments/asmt-tcs-nqt-round1/attempt/${aliceAssessmentAttemptId}`, {
    headers: { Authorization: `Bearer ${bobToken}` }
  });
  console.log(`[Security 2.4] Bob fetching Alice's Assessment Attempt: HTTP ${bobFetchAliceAssessment.status}`);
  assert.strictEqual(bobFetchAliceAssessment.status, 404, 'Bob must receive HTTP 404 when attempting to view Alice assessment attempt');

  // Test 2.5: IDOR POST - Bob attempts to submit Alice's assessment attempt
  const bobSubmitAliceAssessment = await request(`/api/coding/assessments/asmt-tcs-nqt-round1/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${bobToken}` },
    body: { attemptId: aliceAssessmentAttemptId, answers: {} }
  });
  console.log(`[Security 2.5] Bob submitting Alice's Assessment Attempt: HTTP ${bobSubmitAliceAssessment.status}`);
  assert.strictEqual(bobSubmitAliceAssessment.status, 404, 'Bob must receive HTTP 404 when attempting to submit Alice assessment attempt');

  // Test 2.6: Profile Data Isolation via /api/auth/me
  const aliceMe = await request('/api/auth/me', { headers: { Authorization: `Bearer ${aliceToken}` } });
  const bobMe = await request('/api/auth/me', { headers: { Authorization: `Bearer ${bobToken}` } });
  console.log(`[Security 2.6] /api/auth/me profile isolation: Alice ID=${aliceMe.body.user?.id}, Bob ID=${bobMe.body.user?.id}`);
  assert.strictEqual(aliceMe.body.user?.id, aliceId);
  assert.strictEqual(bobMe.body.user?.id, bobId);
  assert.notStrictEqual(aliceMe.body.user?.id, bobMe.body.user?.id, 'Profiles must be strictly discrete');

  // Setup: Alice creates student performance and attempts records
  db.insert('attempts', {
    id: `att-alice-${uuidv4()}`,
    user_id: aliceId,
    question_id: 'q-dbms-1',
    is_correct: true,
    time_spent_seconds: 40,
    xp_gained: 20,
    attempted_at: new Date().toISOString()
  });

  // Test 2.7: Analytics Data Isolation
  const aliceAnalytics = await request('/api/analytics', { headers: { Authorization: `Bearer ${aliceToken}` } });
  const bobAnalytics = await request('/api/analytics', { headers: { Authorization: `Bearer ${bobToken}` } });
  console.log(`[Security 2.7] /api/analytics isolation: Alice Attempted=${aliceAnalytics.body.summary?.total_attempted}, Bob Attempted=${bobAnalytics.body.summary?.total_attempted}`);
  assert.ok(aliceAnalytics.body.summary?.total_attempted >= 1, 'Alice must reflect her attempt');
  assert.strictEqual(bobAnalytics.body.summary?.total_attempted, 0, 'Bob must have 0 attempts; Alice data must not leak into Bob analytics');

  // Test 2.8: Dashboard Stats Data Isolation
  const aliceDashboard = await request('/api/dashboard/stats', { headers: { Authorization: `Bearer ${aliceToken}` } });
  const bobDashboard = await request('/api/dashboard/stats', { headers: { Authorization: `Bearer ${bobToken}` } });
  console.log(`[Security 2.8] /api/dashboard/stats isolation: Alice Attempted=${aliceDashboard.body.stats?.total_questions_attempted}, Bob Attempted=${bobDashboard.body.stats?.total_questions_attempted}`);
  assert.ok(aliceDashboard.body.stats?.total_questions_attempted >= 1);
  assert.strictEqual(bobDashboard.body.stats?.total_questions_attempted, 0, 'Bob must have 0 attempted in dashboard stats');

  // Setup: Alice bookmarks a problem
  const bmRes = await request('/api/coding/problems/prob-two-sum/bookmark', {
    method: 'POST',
    headers: { Authorization: `Bearer ${aliceToken}` }
  });
  assert.strictEqual(bmRes.status, 200);

  // Test 2.9: Bookmarks Data Isolation
  const aliceBookmarks = await request('/api/coding/bookmarks', { headers: { Authorization: `Bearer ${aliceToken}` } });
  const bobBookmarks = await request('/api/coding/bookmarks', { headers: { Authorization: `Bearer ${bobToken}` } });
  console.log(`[Security 2.9] Coding Bookmarks isolation: Alice count=${aliceBookmarks.body.bookmarks?.length}, Bob count=${bobBookmarks.body.bookmarks?.length}`);
  assert.ok(aliceBookmarks.body.bookmarks?.includes('prob-two-sum'), 'Alice bookmarks must include prob-two-sum');
  assert.strictEqual(bobBookmarks.body.bookmarks?.length, 0, 'Bob bookmarks must be empty; Alice bookmarks must not leak to Bob');

  // Test 2.10: Submissions List Isolation
  const aliceSubmissionsList = await request('/api/coding/submissions', { headers: { Authorization: `Bearer ${aliceToken}` } });
  const bobSubmissionsList = await request('/api/coding/submissions', { headers: { Authorization: `Bearer ${bobToken}` } });
  console.log(`[Security 2.10] Submissions list isolation: Alice count=${aliceSubmissionsList.body.submissions?.length}, Bob count=${bobSubmissionsList.body.submissions?.length}`);
  assert.ok(aliceSubmissionsList.body.submissions?.some(s => s.id === aliceSubmissionId), 'Alice must see her submission');
  assert.strictEqual(bobSubmissionsList.body.submissions?.length, 0, 'Bob must see 0 submissions; Alice code submissions must not be visible to Bob');

  testServer.close();

  console.log('\n==================================================================');
  console.log('ALL 21 SECURITY & IDOR CHECKS PASSED EMPIRICALLY!');
  console.log('==================================================================\n');
}

runSecurityAccessControlAudit().catch(err => {
  console.error('Fatal security test failure:', err);
  if (testServer) testServer.close();
  process.exit(1);
});
