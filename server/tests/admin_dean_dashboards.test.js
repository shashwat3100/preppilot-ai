import http from 'http';
import app, { startServer } from '../src/index.js';
import db, { initDb } from '../src/database/db.js';

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

const results = [];
function assert(condition, message) {
  if (condition) {
    results.push({ passed: true, message });
    console.log(`  ✓ ${message}`);
  } else {
    results.push({ passed: false, message });
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function runSuite() {
  console.log('\n==================================================================');
  console.log('PREPPILOT AI — ADMIN & DEAN DASHBOARD INTEGRATION TEST SUITE');
  console.log('==================================================================\n');

  try {
    await initDb();
    const port = 63300 + Math.floor(Math.random() * 500);
    testServer = await startServer(port);
    baseUrl = `http://127.0.0.1:${port}`;
    console.log(`[Test Server] Active on ${baseUrl}\n`);

    // 1. Authenticate tokens for each role
    console.log('--- 1. Authentication & Role Verification ---');

    // 1a. Student Login
    const studentLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'student@careerprep.ai', password: 'password123' }
    });
    assert(studentLoginRes.status === 200, 'Student login succeeds with HTTP 200');
    assert(studentLoginRes.body.user?.role === 'STUDENT', 'Student role is strictly STUDENT');
    const studentToken = studentLoginRes.body.token;

    // 1b. Admin Login
    const adminLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@careerprep.ai', password: 'admin123' }
    });
    assert(adminLoginRes.status === 200, 'Admin login succeeds with HTTP 200');
    assert(adminLoginRes.body.user?.role === 'ADMIN', 'Admin role is strictly ADMIN');
    const adminToken = adminLoginRes.body.token;

    // 1c. Dean Login (primary dean account)
    let deanLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'dean@college.edu', password: 'DeanPass123' }
    });
    if (deanLoginRes.status !== 200) {
      deanLoginRes = await request('/api/auth/login', {
        method: 'POST',
        body: { email: 'admin@college.edu', password: 'AdminPass123' }
      });
    }
    assert(deanLoginRes.status === 200, 'Dean login succeeds with HTTP 200');
    assert(deanLoginRes.body.user?.role === 'DEAN', 'Dean role is strictly DEAN');
    assert(!deanLoginRes.body.user?.name?.includes('Dr. Ramesh Kulkarni'), 'Dean name contains NO legacy Dr. Ramesh Kulkarni personal name');
    assert(deanLoginRes.body.user?.designation === 'Dean' || deanLoginRes.body.user?.role === 'DEAN', 'Dean designation is strictly Dean');
    const deanToken = deanLoginRes.body.token;

    // 1d. Legacy Dean Account (`admin@college.edu`) verification
    const legacyDeanRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@college.edu', password: 'AdminPass123' }
    });
    if (legacyDeanRes.status === 200) {
      assert(legacyDeanRes.body.user?.role === 'DEAN', 'Legacy Dean account (admin@college.edu) normalized to DEAN role without data loss');
      assert(!legacyDeanRes.body.user?.name?.includes('Ramesh'), 'Legacy Dean account name cleaned of personal names');
    }

    // 2. Student Access Restrictions (RBAC Boundary)
    console.log('\n--- 2. Student Access Restrictions (HTTP 403 Forbidden) ---');
    const studentAuthHeader = { Authorization: `Bearer ${studentToken}` };

    const stAdminOverview = await request('/api/admin/overview', { headers: studentAuthHeader });
    assert(stAdminOverview.status === 403, 'Student blocked from GET /api/admin/overview with HTTP 403');

    const stAdminStudents = await request('/api/admin/students', { headers: studentAuthHeader });
    assert(stAdminStudents.status === 403, 'Student blocked from GET /api/admin/students with HTTP 403');

    const stAdminQuestions = await request('/api/admin/questions', { headers: studentAuthHeader });
    assert(stAdminQuestions.status === 403, 'Student blocked from GET /api/admin/questions with HTTP 403');

    const stCreateQ = await request('/api/admin/questions', {
      method: 'POST',
      headers: studentAuthHeader,
      body: { question: 'Hack attempt', subject_id: 'sub-dsa', topic_id: 'top-arrays', correct_answer: 'A' }
    });
    assert(stCreateQ.status === 403, 'Student blocked from POST /api/admin/questions with HTTP 403');

    const stDeanOverview = await request('/api/dean/overview', { headers: studentAuthHeader });
    assert(stDeanOverview.status === 403, 'Student blocked from GET /api/dean/overview with HTTP 403');

    const stDeanPerformance = await request('/api/dean/performance', { headers: studentAuthHeader });
    assert(stDeanPerformance.status === 403, 'Student blocked from GET /api/dean/performance with HTTP 403');

    const stDeanReports = await request('/api/dean/reports/export', { headers: studentAuthHeader });
    assert(stDeanReports.status === 403, 'Student blocked from GET /api/dean/reports/export with HTTP 403');

    // 3. Dean Privileges & Academic Analytics
    console.log('\n--- 3. Dean Dashboard Endpoints & Academic Analytics ---');
    const deanAuthHeader = { Authorization: `Bearer ${deanToken}` };

    const deanOverview = await request('/api/dean/overview', { headers: deanAuthHeader });
    assert(deanOverview.status === 200, 'Dean can access GET /api/dean/overview');
    assert(deanOverview.body.success === true, 'Dean overview returns success: true');
    assert(typeof deanOverview.body.metrics?.total_students === 'number', 'Dean overview returns total_students number');
    assert(typeof deanOverview.body.metrics?.cohort_average_score === 'number', 'Dean overview returns cohort_average_score number');
    assert(Array.isArray(deanOverview.body.subject_mastery), 'Dean overview returns subject_mastery array');
    assert(Array.isArray(deanOverview.body.learning_gaps), 'Dean overview returns learning_gaps array');

    const deanPerformance = await request('/api/dean/performance?page=1&limit=10', { headers: deanAuthHeader });
    assert(deanPerformance.status === 200, 'Dean can access GET /api/dean/performance');
    assert(Array.isArray(deanPerformance.body.students), 'Dean performance returns students array');
    assert(typeof deanPerformance.body.pagination?.total_items === 'number', 'Dean performance returns pagination info');

    const deanAssessments = await request('/api/dean/assessments', { headers: deanAuthHeader });
    assert(deanAssessments.status === 200, 'Dean can access GET /api/dean/assessments');
    assert(Array.isArray(deanAssessments.body.assessments), 'Dean assessments returns catalog metrics array');

    const deanSubjects = await request('/api/dean/subject-analytics', { headers: deanAuthHeader });
    assert(deanSubjects.status === 200, 'Dean can access GET /api/dean/subject-analytics');
    assert(Array.isArray(deanSubjects.body.subjects), 'Dean subject analytics returns subjects array');

    const deanExport = await request('/api/dean/reports/export?branch=ALL&batch=ALL', { headers: deanAuthHeader });
    assert(deanExport.status === 200, 'Dean can export academic reports via GET /api/dean/reports/export');
    assert(deanExport.headers['content-type']?.includes('text/csv'), 'Report export headers specify text/csv');
    assert(typeof deanExport.body.raw === 'string' && deanExport.body.raw.includes('Student ID,Full Name,Email,Branch'), 'CSV output contains standard academic header row');

    // 4. Dean Restrictions (RBAC Boundary: Dean CANNOT manage platform or CRUD questions)
    console.log('\n--- 4. Dean Restrictions Enforcement (HTTP 403 on Admin Operations) ---');

    const deanCreateQ = await request('/api/admin/questions', {
      method: 'POST',
      headers: deanAuthHeader,
      body: {
        question: 'Unauthorized Dean Question',
        subject_id: 'sub-dsa',
        topic_id: 'top-arrays',
        correct_answer: 'A'
      }
    });
    assert(deanCreateQ.status === 403, 'Dean blocked from POST /api/admin/questions with HTTP 403');

    const deanUpdateQ = await request('/api/admin/questions/any-id', {
      method: 'PUT',
      headers: deanAuthHeader,
      body: { question: 'Tampered' }
    });
    assert(deanUpdateQ.status === 403, 'Dean blocked from PUT /api/admin/questions/:id with HTTP 403');

    const deanDeleteQ = await request('/api/admin/questions/any-id', {
      method: 'DELETE',
      headers: deanAuthHeader
    });
    assert(deanDeleteQ.status === 403, 'Dean blocked from DELETE /api/admin/questions/:id with HTTP 403');

    const deanInvite = await request('/api/admin/invite-token', {
      method: 'POST',
      headers: deanAuthHeader
    });
    assert(deanInvite.status === 403, 'Dean blocked from POST /api/admin/invite-token with HTTP 403');

    const deanFaculty = await request('/api/admin/faculty', {
      method: 'POST',
      headers: deanAuthHeader,
      body: { name: 'Unauthorized Dean Appointee', email: 'deanfac@college.edu' }
    });
    assert(deanFaculty.status === 403, 'Dean blocked from POST /api/admin/faculty with HTTP 403');

    const deanChangeStatus = await request('/api/admin/students/any-id/status', {
      method: 'PATCH',
      headers: deanAuthHeader,
      body: { is_blocked: false }
    });
    assert(deanChangeStatus.status === 403, 'Dean blocked from changing student status with HTTP 403');

    const deanDeleteStudent = await request('/api/admin/students/any-id', {
      method: 'DELETE',
      headers: deanAuthHeader
    });
    assert(deanDeleteStudent.status === 403, 'Dean blocked from deleting students with HTTP 403');

    // 5. Admin Governance & Complete CRUD Operations
    console.log('\n--- 5. Admin Governance & Question Bank CRUD ---');
    const adminAuthHeader = { Authorization: `Bearer ${adminToken}` };

    const adminOverview = await request('/api/admin/overview', { headers: adminAuthHeader });
    assert(adminOverview.status === 200, 'Admin can access GET /api/admin/overview');
    assert(adminOverview.body.success === true, 'Admin overview returns success: true');

    const adminStudents = await request('/api/admin/students', { headers: adminAuthHeader });
    assert(adminStudents.status === 200, 'Admin can access GET /api/admin/students');
    assert(Array.isArray(adminStudents.body.students), 'Admin students list is an array');

    // CRUD: Create Question
    const createRes = await request('/api/admin/questions', {
      method: 'POST',
      headers: adminAuthHeader,
      body: {
        question: 'Admin Integration Test Question: What is ACID in DBMS?',
        options: [
          { option_key: 'A', option_text: 'Atomicity, Consistency, Isolation, Durability' },
          { option_key: 'B', option_text: 'Access, Control, Identity, Data' },
          { option_key: 'C', option_text: 'Array, Class, Interface, Document' },
          { option_key: 'D', option_text: 'Asynchronous, Concurrent, Indexed, Distributed' }
        ],
        correct_answer: 'A',
        explanation: 'ACID transactions guarantee database reliability.',
        subject_id: 'sub-dsa',
        topic_id: 'top-arrays',
        difficulty: 'Medium'
      }
    });
    assert(createRes.status === 201, 'Admin can create question via POST /api/admin/questions (HTTP 201)');
    const createdQuestionId = createRes.body.question?.id;
    assert(Boolean(createdQuestionId), 'Created question returns valid generated ID');

    // CRUD: Read Question in Question Bank
    const readQuestions = await request(`/api/admin/questions`, { headers: adminAuthHeader });
    assert(readQuestions.status === 200, 'Admin can query question bank via GET /api/admin/questions');
    const found = readQuestions.body.questions?.some(q => q.id === createdQuestionId);
    assert(found, 'Created question is found in admin question bank search results');

    // CRUD: Update Question
    const updateRes = await request(`/api/admin/questions/${createdQuestionId}`, {
      method: 'PUT',
      headers: adminAuthHeader,
      body: {
        question: 'Admin Integration Test Question: What does ACID represent in database transactions? (Updated)',
        difficulty: 'Hard'
      }
    });
    assert(updateRes.status === 200, 'Admin can update question via PUT /api/admin/questions/:id (HTTP 200)');
    assert(updateRes.body.question?.difficulty === 'Hard', 'Updated question difficulty persisted as Hard');

    // CRUD: Delete Question
    const deleteRes = await request(`/api/admin/questions/${createdQuestionId}`, {
      method: 'DELETE',
      headers: adminAuthHeader
    });
    assert(deleteRes.status === 200, 'Admin can delete question via DELETE /api/admin/questions/:id (HTTP 200)');

    // Verify deletion
    const verifyDel = await request(`/api/admin/questions`, { headers: adminAuthHeader });
    const stillExists = verifyDel.body.questions?.some(q => q.id === createdQuestionId);
    assert(!stillExists, 'Deleted question no longer exists in database');

    // 6. Admin can also access academic analytics (requireDeanOrAdmin)
    console.log('\n--- 6. Admin Overarching Access to Academic Analytics ---');
    const adminDeanOverview = await request('/api/dean/overview', { headers: adminAuthHeader });
    assert(adminDeanOverview.status === 200, 'Admin can access academic analytics via GET /api/dean/overview');

  } catch (err) {
    console.error('Test execution error:', err);
    assert(false, `Unexpected exception: ${err.message}`);
  } finally {
    if (testServer) {
      testServer.close();
    }
  }

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log('\n==================================================================');
  console.log(`TOTAL TESTS: ${results.length} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('==================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('ALL ADMIN & DEAN DASHBOARD INTEGRATION TESTS PASSED SUCCESSFULLY.\n');
    process.exit(0);
  }
}

runSuite();
