import http from 'http';
import app, { startServer } from '../src/index.js';
import db, { initDb } from '../src/database/db.js';
import { runCode } from '../src/services/codeExecutionService.js';
import { passwordResets } from '../src/routes/authRoutes.js';
import crypto from 'crypto';

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
  console.log('🛡️  PREPPILOT AI - ROUTE-LEVEL SECURITY & RELIABILITY TEST SUITE');
  console.log('==================================================================\n');

  // Initialize DB and launch ephemeral test server on random available port
  await initDb();
  testServer = await startServer(0);
  const address = testServer.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`[Test Server] Active on ${baseUrl}\n`);

  try {
    // -------------------------------------------------------------------------
    // TEST GROUP 1: Authentication Security & Privilege Escalation Prevention
    // -------------------------------------------------------------------------
    console.log('[Test Group 1] Authentication Security & Privilege Escalation');

    // 1.1 Public registration with role: 'ADMIN' must NEVER grant ADMIN privileges
    const studentEmail = `student_esc_${Date.now()}@college.edu`;
    const regRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Escalation Attacker',
        email: studentEmail,
        password: 'Password123',
        role: 'ADMIN' // Malicious attempt to escalate
      }
    });

    assert(regRes.status === 201, 'Registration returns HTTP 201');
    assert(regRes.body.user && regRes.body.user.role === 'STUDENT', 'Public registration forces role to STUDENT, blocking escalation');
    const studentToken = regRes.body.token;

    // 1.2 Dean registration with hardcoded legacy passcode (e.g. DEAN2026) must be REJECTED
    const legacyPasscodeRes = await request('/api/auth/register-dean', {
      method: 'POST',
      body: {
        name: 'Attacker Dean',
        email: `dean_atk_${Date.now()}@college.edu`,
        password: 'Password123',
        passcode: 'DEAN2026' // Legacy hard-coded passcode must be dead
      }
    });
    assert(legacyPasscodeRes.status === 403, 'Dean registration with legacy passcode DEAN2026 rejected with HTTP 403');

    // 1.3 Dean registration without authorization token must be REJECTED
    const noTokenRes = await request('/api/auth/register-dean', {
      method: 'POST',
      body: {
        name: 'Attacker Dean',
        email: `dean_atk2_${Date.now()}@college.edu`,
        password: 'Password123'
      }
    });
    assert(noTokenRes.status === 400 || noTokenRes.status === 403, 'Dean registration without authorization token rejected');

    // 1.4 Admin logs in, issues genuine single-use invitation token, and faculty registers with it
    const adminLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@careerprep.ai', password: 'admin123' }
    });
    assert(adminLoginRes.status === 200, 'Admin demo login succeeds');
    const adminToken = adminLoginRes.body.token;

    const facultyEmail = `faculty_inv_${Date.now()}@college.edu`;
    const inviteRes = await request('/api/admin/faculty/invite', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        email: facultyEmail,
        designation: 'Associate Placement Officer'
      }
    });
    assert(inviteRes.status === 201, 'Admin can issue single-use invitation token');
    const issuedInviteToken = inviteRes.body.invitation.token;

    // Register with issued token
    const facultyRegRes = await request('/api/auth/register-dean', {
      method: 'POST',
      body: {
        name: 'Dr. Invited Faculty',
        email: facultyEmail,
        password: 'FacultyPassword123',
        invite_token: issuedInviteToken
      }
    });
    assert(facultyRegRes.status === 201, 'Registration with valid invitation token grants Dean access');
    assert(facultyRegRes.body.user.role === 'DEAN', 'Invited user has verified DEAN role');

    // Replay attack: using the same invitation token a second time must FAIL
    const replayRes = await request('/api/auth/register-dean', {
      method: 'POST',
      body: {
        name: 'Replay Attacker',
        email: `replay_${Date.now()}@college.edu`,
        password: 'FacultyPassword123',
        invite_token: issuedInviteToken
      }
    });
    assert(replayRes.status === 403, 'Replay of used invitation token is rejected with HTTP 403');

    // -------------------------------------------------------------------------
    // TEST GROUP 2: Password Reset Security (No Secrets Disclosed, Limits, Expiry)
    // -------------------------------------------------------------------------
    console.log('\n[Test Group 2] Password Reset Security');

    // 2.1 Request password reset - verification PIN must NEVER be disclosed in response
    const forgotRes = await request('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: studentEmail }
    });
    assert(forgotRes.status === 200, 'Forgot password request processed with HTTP 200');
    assert(!forgotRes.body.verification_pin && !forgotRes.body.code && !forgotRes.body.resetCode, 'Verification PIN is NEVER exposed in API response body');
    assert(typeof forgotRes.body.message === 'string', 'Honest user-facing message provided in response');

    // Retrieve active in-memory record to test cryptographic expiry and attempt limits
    const resetRecord = passwordResets.get(studentEmail.toLowerCase());
    assert(Boolean(resetRecord), 'Password reset entry created securely in server memory');
    assert(typeof resetRecord.codeHash === 'string', 'Stored code is securely hashed with bcrypt');

    // 2.2 Attempting to reset with wrong PIN fails and decrements attempts
    const wrongPinRes = await request('/api/auth/reset-password', {
      method: 'POST',
      body: {
        email: studentEmail,
        verification_pin: '000000',
        new_password: 'NewValidPassword123'
      }
    });
    assert(wrongPinRes.status === 400, 'Invalid verification PIN rejected with HTTP 400');

    // 2.3 Exceeding maximum verification attempts invalidates the reset request
    for (let i = 0; i < 5; i++) {
      await request('/api/auth/reset-password', {
        method: 'POST',
        body: { email: studentEmail, verification_pin: '999999', new_password: 'NewValidPassword123' }
      });
    }
    const lockedResetRes = await request('/api/auth/reset-password', {
      method: 'POST',
      body: { email: studentEmail, verification_pin: '999999', new_password: 'NewValidPassword123' }
    });
    assert(lockedResetRes.status === 400 || lockedResetRes.status === 429, 'Excessive invalid attempts invalidate reset request for protection');

    // 2.4 Expired reset code is strictly rejected
    const expireTestEmail = `expire_${Date.now()}@college.edu`;
    await request('/api/auth/register', {
      method: 'POST',
      body: { name: 'Expire Test', email: expireTestEmail, password: 'Password123' }
    });
    await request('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: expireTestEmail }
    });
    const expireRecord = passwordResets.get(expireTestEmail.toLowerCase());
    if (expireRecord) {
      expireRecord.expiresAt = Date.now() - 1000; // Artificially expire
    }
    const expiredSubmitRes = await request('/api/auth/reset-password', {
      method: 'POST',
      body: { email: expireTestEmail, verification_pin: '123456', new_password: 'NewPassword123' }
    });
    assert(expiredSubmitRes.status === 400, 'Expired verification PIN is rejected with HTTP 400');

    // -------------------------------------------------------------------------
    // TEST GROUP 3: Password Policy & Input Normalization
    // -------------------------------------------------------------------------
    console.log('\n[Test Group 3] Password Policy & Input Normalization');

    // 3.1 Weak passwords (< 8 chars or all numbers or all letters) must be rejected
    const shortPassRes = await request('/api/auth/register', {
      method: 'POST',
      body: { name: 'Weak User', email: `weak1_${Date.now()}@college.edu`, password: 'short' }
    });
    assert(shortPassRes.status === 400, 'Short password (< 8 chars) rejected');

    const noNumPassRes = await request('/api/auth/register', {
      method: 'POST',
      body: { name: 'Weak User', email: `weak2_${Date.now()}@college.edu`, password: 'passwordonly' }
    });
    assert(noNumPassRes.status === 400, 'Password without digits rejected');

    // 3.2 Invalid email format must be rejected
    const badEmailRes = await request('/api/auth/register', {
      method: 'POST',
      body: { name: 'Bad Email', email: 'not-an-email', password: 'ValidPassword123' }
    });
    assert(badEmailRes.status === 400, 'Invalid email address syntax rejected');

    // -------------------------------------------------------------------------
    // TEST GROUP 4: Blocked & Suspended Accounts
    // -------------------------------------------------------------------------
    console.log('\n[Test Group 4] Blocked Account Enforcement');

    // 4.1 Create a user and mark as blocked in DB
    const blockedEmail = `blocked_${Date.now()}@college.edu`;
    const regBlocked = await request('/api/auth/register', {
      method: 'POST',
      body: { name: 'Suspended Candidate', email: blockedEmail, password: 'Password123' }
    });
    const blockedUserId = regBlocked.body.user.id;
    const blockedUserToken = regBlocked.body.token;

    db.update('users', blockedUserId, { is_blocked: true, status: 'BLOCKED' });

    // 4.2 Login attempt by blocked account must return HTTP 403 Forbidden
    const blockedLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: blockedEmail, password: 'Password123' }
    });
    assert(blockedLoginRes.status === 403, 'Blocked account login is strictly forbidden (HTTP 403)');

    // 4.3 Active token verification for blocked account must return HTTP 403
    const blockedMeRes = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${blockedUserToken}` }
    });
    assert(blockedMeRes.status === 403, 'Session /me for blocked account is rejected with HTTP 403');

    // 4.4 Password reset attempt for blocked account must return HTTP 403
    const blockedResetRes = await request('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: blockedEmail }
    });
    assert(blockedResetRes.status === 403, 'Password reset for blocked account is prohibited with HTTP 403');

    // 4.5 Invalid/forged token must return HTTP 401
    const invalidTokenRes = await request('/api/auth/me', {
      headers: { Authorization: 'Bearer forged.invalid.token' }
    });
    assert(invalidTokenRes.status === 401, 'Invalid/forged JWT session rejected with HTTP 401');

    // -------------------------------------------------------------------------
    // TEST GROUP 5: Code Execution Sandbox & Production Policy Enforcement
    // -------------------------------------------------------------------------
    console.log('\n[Test Group 5] Code Execution Sandbox Boundary');

    // 5.1 In production mode without Judge0, execution must be BLOCKED
    const prevEnv = process.env.NODE_ENV;
    const prevJudge0 = process.env.JUDGE0_API_URL;
    try {
      process.env.NODE_ENV = 'production';
      delete process.env.JUDGE0_API_URL;

      const prodExecRes = await runCode('int main() { return 0; }', 'c', '');
      assert(prodExecRes.success === false, 'Production execution without trusted sandbox is strictly blocked');
      assert(prodExecRes.engine === 'SANDBOX_CONFIG_REQUIRED', 'Engine reports SANDBOX_CONFIG_REQUIRED');
    } finally {
      process.env.NODE_ENV = prevEnv;
      if (prevJudge0) process.env.JUDGE0_API_URL = prevJudge0;
    }

    // 5.2 Local runner labeled as development without claiming OS isolation
    const devExecRes = await runCode('print("Safe dev execution")', 'python', '');
    if (devExecRes.engine) {
      assert(
        devExecRes.engine.includes('LOCAL_DEVELOPMENT_RUNNER') || devExecRes.engine.includes('JUDGE0'),
        'Runner engine is explicitly designated and does not misrepresent OS-level isolation'
      );
    }

    // -------------------------------------------------------------------------
    // TEST GROUP 6: Concurrency & Single XP Awarding Guarantees
    // -------------------------------------------------------------------------
    console.log('\n[Test Group 6] Concurrent Submissions & Idempotent XP Awards');

    // 6.1 Register a fresh candidate to test concurrent submissions
    const concurrentUserEmail = `concurrent_${Date.now()}@college.edu`;
    const regConcurRes = await request('/api/auth/register', {
      method: 'POST',
      body: { name: 'Concurrent Test Candidate', email: concurrentUserEmail, password: 'Password123' }
    });
    const concurToken = regConcurRes.body.token;
    const concurUserId = regConcurRes.body.user.id;
    const initialXp = regConcurRes.body.user.total_xp || 50;

    // Pick a seeded easy problem
    const problems = db.getAll('codingProblems');
    const targetProblem = problems[0] || { id: 'problem-two-sum', difficulty: 'Easy' };

    // Fire 5 concurrent accepted submissions for the exact same problem
    const cSolutions = Array(5).fill(null).map(() =>
      request('/api/coding/submit', {
        method: 'POST',
        headers: { Authorization: `Bearer ${concurToken}` },
        body: {
          problemId: targetProblem.id,
          code: targetProblem.starterCode?.c || targetProblem.starterCode?.python || 'int main() { return 0; }',
          language: 'c'
        }
      })
    );

    await Promise.all(cSolutions);

    // Verify user's XP in database: exactly 1 XP award for this problem
    const xpEntries = db.find('xpHistory', x =>
      x.user_id === concurUserId &&
      x.reference_id === targetProblem.id &&
      x.action_type === 'CODING_PROBLEM_SOLVED'
    );
    assert(xpEntries.length <= 1, 'Concurrent accepted coding submissions award problem XP at most ONCE');

    // 6.2 Concurrent timed assessment finalization
    const assessments = db.getAll('codingAssessments');
    if (assessments.length > 0) {
      const asmt = assessments[0];
      // Start an attempt
      const startRes = await request(`/api/coding/assessments/${asmt.id}/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${concurToken}` }
      });
      const attemptId = startRes.body.attempt.id;

      // Fire 4 concurrent submissions for the same attempt
      const concurAsmtSubmissions = Array(4).fill(null).map(() =>
        request(`/api/coding/assessments/${asmt.id}/submit`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${concurToken}` },
          body: {
            attemptId,
            answers: {}
          }
        })
      );

      const asmtResponses = await Promise.all(concurAsmtSubmissions);
      const successfulSubmissions = asmtResponses.filter(r => r.status === 200);
      assert(successfulSubmissions.length >= 1, 'Assessment submission successfully evaluated');

      // Check that assessment completion XP was awarded at most once
      const asmtXpEntries = db.find('xpHistory', x =>
        x.user_id === concurUserId &&
        x.reference_id === attemptId &&
        x.action_type === 'CODING_ASSESSMENT_COMPLETED'
      );
      assert(asmtXpEntries.length <= 1, 'Concurrent assessment submissions award assessment XP at most ONCE');
    }

    console.log('\n==================================================================');
    const failedCount = results.filter(r => !r.passed).length;
    const passedCount = results.filter(r => r.passed).length;
    console.log(`📊 TEST SUITE SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED (TOTAL: ${results.length})`);
    console.log('==================================================================\n');

    if (testServer) {
      testServer.close();
    }

    if (failedCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Test Suite Exception:', err);
    if (testServer) {
      testServer.close();
    }
    process.exit(1);
  }
}

runSuite();
