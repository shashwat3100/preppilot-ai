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
  console.log('PREPPILOT AI — CAMPUS PLACEMENT MANAGEMENT SUITE (ADMIN & DEAN)');
  console.log('==================================================================\n');

  try {
    await initDb();
    const port = 63400 + Math.floor(Math.random() * 500);
    testServer = await startServer(port);
    baseUrl = `http://127.0.0.1:${port}`;
    console.log(`[Test Server] Running on ${baseUrl}\n`);

    // 1. Authenticate tokens for each role
    console.log('--- 1. Authentication & Role Setup ---');

    const studentLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'student@careerprep.ai', password: 'password123' }
    });
    assert(studentLoginRes.status === 200, 'Student login succeeds (HTTP 200)');
    const studentToken = studentLoginRes.body.token;
    const studentUser = studentLoginRes.body.user;

    const adminLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@careerprep.ai', password: 'admin123' }
    });
    assert(adminLoginRes.status === 200, 'Admin login succeeds (HTTP 200)');
    const adminToken = adminLoginRes.body.token;

    let deanLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'dean@college.edu', password: 'DeanPass123' }
    });
    if (deanLoginRes.status !== 200) {
      deanLoginRes = await request('/api/auth/login', {
        method: 'POST',
        body: { email: 'faculty@careerprep.ai', password: 'faculty123' }
      });
    }
    assert(deanLoginRes.status === 200, 'Dean login succeeds (HTTP 200)');
    const deanToken = deanLoginRes.body.token;

    const adminHeaders = { Authorization: `Bearer ${adminToken}` };
    const deanHeaders = { Authorization: `Bearer ${deanToken}` };
    const studentHeaders = { Authorization: `Bearer ${studentToken}` };

    // 2. Admin Placement Assignment & Filtering
    console.log('\n--- 2. Admin Placement Tracking & Assignment ---');

    // 2a. Admin marks student as Placed
    const adminAssignPlacedRes = await request(`/api/admin/students/${studentUser.id}/placement`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: {
        placement_status: 'PLACED',
        is_placed: true,
        placed_company: 'Google Cloud India',
        placement_package: '18 LPA',
        placed_date: '2026-10-15'
      }
    });
    assert(adminAssignPlacedRes.status === 200, 'Admin can assign PLACED status via PATCH /api/admin/students/:id/placement');
    assert(adminAssignPlacedRes.body.student?.placement_status === 'PLACED', 'Student placement_status returned as PLACED');
    assert(adminAssignPlacedRes.body.student?.placed_company === 'Google Cloud India', 'Student placed_company matches Google Cloud India');
    assert(adminAssignPlacedRes.body.student?.placement_package === '18 LPA', 'Student placement_package matches 18 LPA');

    // 2b. Admin filters students by placed
    const adminFilterPlacedRes = await request('/api/admin/students?filter=placed', {
      headers: adminHeaders
    });
    assert(adminFilterPlacedRes.status === 200, 'Admin can fetch students with filter=placed');
    const hasPlacedStudent = adminFilterPlacedRes.body.students?.some(s => s.id === studentUser.id && s.placement_status === 'PLACED');
    assert(hasPlacedStudent, 'Admin filter=placed accurately contains the placed student');

    // 2c. Admin filters students by not_placed
    const adminFilterNotPlacedRes = await request('/api/admin/students?filter=not_placed', {
      headers: adminHeaders
    });
    assert(adminFilterNotPlacedRes.status === 200, 'Admin can fetch students with filter=not_placed');
    const hasNotPlacedStudent = adminFilterNotPlacedRes.body.students?.some(s => s.id === studentUser.id);
    assert(!hasNotPlacedStudent, 'Admin filter=not_placed correctly excludes the placed student');

    // 2d. Admin overview includes placement metrics
    const adminOverviewRes = await request('/api/admin/overview', {
      headers: adminHeaders
    });
    assert(adminOverviewRes.status === 200, 'Admin overview returns HTTP 200');
    assert(adminOverviewRes.body.overview?.total_placed !== undefined, 'Admin overview contains total_placed');
    assert(adminOverviewRes.body.overview?.placement_rate !== undefined, 'Admin overview contains placement_rate');

    // 3. Dean Placement Tracking & Assignment
    console.log('\n--- 3. Dean Placement Tracking & Assignment ---');

    // 3a. Dean updates student to NOT_PLACED
    const deanAssignNotPlacedRes = await request(`/api/dean/students/${studentUser.id}/placement`, {
      method: 'PATCH',
      headers: deanHeaders,
      body: {
        placement_status: 'NOT_PLACED',
        is_placed: false,
        placed_company: '',
        placement_package: '',
        placed_date: ''
      }
    });
    assert(deanAssignNotPlacedRes.status === 200, 'Dean can assign NOT_PLACED status via PATCH /api/dean/students/:id/placement');
    assert(deanAssignNotPlacedRes.body.student?.placement_status === 'NOT_PLACED', 'Student placement_status reset to NOT_PLACED');

    // 3b. Dean queries performance directory with placement_status=not_placed
    const deanFilterNotPlacedRes = await request(`/api/dean/performance?placement_status=not_placed&search=${encodeURIComponent(studentUser.email)}`, {
      headers: deanHeaders
    });
    assert(deanFilterNotPlacedRes.status === 200, 'Dean can filter performance by placement_status=not_placed');
    const deanFoundNotPlaced = deanFilterNotPlacedRes.body.students?.some(s => s.id === studentUser.id);
    assert(deanFoundNotPlaced, 'Dean performance with placement_status=not_placed includes the student');

    // 3c. Dean assigns candidate to Microsoft
    const deanAssignPlacedRes = await request(`/api/dean/students/${studentUser.id}/placement`, {
      method: 'PATCH',
      headers: deanHeaders,
      body: {
        placement_status: 'PLACED',
        is_placed: true,
        placed_company: 'Microsoft IDC',
        placement_package: '24 LPA',
        placed_date: '2026-10-18'
      }
    });
    assert(deanAssignPlacedRes.status === 200, 'Dean can assign PLACED status via PATCH /api/dean/students/:id/placement');
    assert(deanAssignPlacedRes.body.student?.placed_company === 'Microsoft IDC', 'Placed company correctly recorded as Microsoft IDC');

    // 3d. Dean queries performance directory with placement_status=placed
    const deanFilterPlacedRes = await request('/api/dean/performance?placement_status=placed', {
      headers: deanHeaders
    });
    assert(deanFilterPlacedRes.status === 200, 'Dean can filter performance by placement_status=placed');
    const deanFoundPlaced = deanFilterPlacedRes.body.students?.some(s => s.id === studentUser.id && s.placement_status === 'PLACED');
    assert(deanFoundPlaced, 'Dean performance with placement_status=placed accurately includes the newly placed student');

    // 3e. Dean overview includes total_placed & placement_rate in metrics
    const deanOverviewRes = await request('/api/dean/overview', {
      headers: deanHeaders
    });
    assert(deanOverviewRes.status === 200, 'Dean overview returns HTTP 200');
    assert(deanOverviewRes.body.metrics?.total_placed !== undefined, 'Dean overview metrics include total_placed');
    assert(deanOverviewRes.body.metrics?.placement_rate !== undefined, 'Dean overview metrics include placement_rate');

    // 4. Role Authorization & Access Control (Security Safeguards)
    console.log('\n--- 4. Role Authorization & Access Control ---');

    // 4a. Student forbidden from updating placement status via Admin endpoint
    const studentAdminForbidden = await request(`/api/admin/students/${studentUser.id}/placement`, {
      method: 'PATCH',
      headers: studentHeaders,
      body: { placement_status: 'PLACED', placed_company: 'Self-Assigned' }
    });
    assert(studentAdminForbidden.status === 403, 'Regular student receives 403 Forbidden on Admin placement endpoint');

    // 4b. Student forbidden from updating placement status via Dean endpoint
    const studentDeanForbidden = await request(`/api/dean/students/${studentUser.id}/placement`, {
      method: 'PATCH',
      headers: studentHeaders,
      body: { placement_status: 'PLACED', placed_company: 'Self-Assigned' }
    });
    assert(studentDeanForbidden.status === 403, 'Regular student receives 403 Forbidden on Dean placement endpoint');

    // 4c. Unauthenticated user denied
    const unauthenticatedRes = await request(`/api/admin/students/${studentUser.id}/placement`, {
      method: 'PATCH',
      body: { placement_status: 'PLACED' }
    });
    assert(unauthenticatedRes.status === 401, 'Unauthenticated request receives 401 Unauthorized');

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
    console.log('ALL PLACEMENT MANAGEMENT TESTS PASSED SUCCESSFULLY.\n');
    process.exit(0);
  }
}

runSuite();
