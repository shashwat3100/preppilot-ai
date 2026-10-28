import http from 'http';
import assert from 'assert';
import app, { startServer } from '../src/index.js';
import db, { initDb } from '../src/database/db.js';
import { passwordResets } from '../src/routes/authRoutes.js';
import { cleanTestProbes } from '../scripts/clean_test_probes.js';

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
      timeout: 15000
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
      req.destroy(new Error(`Request to ${path} timed out`));
    });
    req.on('error', reject);

    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('SERVERLESS PASSWORD RESET & STATELESS TOKEN TESTS');
  console.log('====================================================\n');

  await initDb();
  await new Promise(resolve => {
    testServer = app.listen(0, '127.0.0.1', () => {
      baseUrl = `http://127.0.0.1:${testServer.address().port}`;
      resolve();
    });
  });

  try {
    const testEmail = `serverless_user_${Date.now()}@college.edu`;
    const initialPassword = 'InitialPassword123';
    const newPassword = 'NewSecretPassword456';

    // 1. Register candidate
    const regRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Serverless Reset Candidate',
        email: testEmail,
        password: initialPassword
      }
    });
    assert.strictEqual(regRes.status, 201, 'User registration succeeded');
    console.log('  ✓ User registered successfully');

    // 2. Request Forgot Password PIN
    const forgotRes = await request('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: testEmail }
    });
    assert.strictEqual(forgotRes.status, 200, 'Forgot password returned HTTP 200');
    assert.ok(forgotRes.body.reset_token, 'reset_token is generated and returned');
    assert.ok(forgotRes.body.preview_pin, 'preview_pin is generated and returned');
    const previewPin = forgotRes.body.preview_pin;
    const resetToken = forgotRes.body.reset_token;
    console.log('  ✓ Forgot password generated preview_pin and signed reset_token');

    // 3. SIMULATE VERCEL SERVERLESS COLD START:
    // Completely wipe all in-memory passwordResets to simulate landing on a completely different Lambda container!
    passwordResets.clear();
    assert.strictEqual(passwordResets.size, 0, 'In-memory resets map completely wiped');
    console.log('  ✓ Simulating serverless cold-start: in-memory state wiped (Map size = 0)');

    // 4. Test: Wrong PIN with reset_token fails
    const wrongPinRes = await request('/api/auth/reset-password', {
      method: 'POST',
      body: {
        email: testEmail,
        verification_pin: '000000',
        new_password: newPassword,
        reset_token: resetToken
      }
    });
    assert.strictEqual(wrongPinRes.status, 400, 'Wrong PIN with reset_token rejected with HTTP 400');
    console.log('  ✓ Incorrect PIN with reset_token correctly rejected');

    // 5. Test: Reset password with valid PIN and reset_token across cold start
    const resetRes = await request('/api/auth/reset-password', {
      method: 'POST',
      body: {
        email: testEmail,
        verification_pin: previewPin,
        new_password: newPassword,
        reset_token: resetToken
      }
    });
    assert.strictEqual(resetRes.status, 200, 'Reset password succeeded on fresh serverless container');
    assert.strictEqual(resetRes.body.success, true);
    console.log('  ✓ Reset password succeeded across simulated serverless cold start');

    // 6. Test: Re-using the same reset_token again is rejected
    passwordResets.clear(); // Clear local container memory to test timestamp/updated_at check
    const replayRes = await request('/api/auth/reset-password', {
      method: 'POST',
      body: {
        email: testEmail,
        verification_pin: previewPin,
        new_password: 'AnotherPassword789',
        reset_token: resetToken
      }
    });
    assert.strictEqual(replayRes.status, 400, 'Re-using already consumed reset_token is rejected');
    console.log('  ✓ Replay attack / reuse of consumed reset_token prevented');

    // 7. Verify login with NEW password
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: testEmail,
        password: newPassword
      }
    });
    assert.strictEqual(loginRes.status, 200, 'Login with new password succeeded');
    assert.ok(loginRes.body.token, 'Login returned valid auth token');
    console.log('  ✓ Login with new password succeeded');

    // 8. Verify old password fails
    const oldLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: testEmail,
        password: initialPassword
      }
    });
    assert.strictEqual(oldLoginRes.status, 401, 'Login with old password rejected');
    console.log('  ✓ Login with obsolete password rejected');

    console.log('\n====================================================');
    console.log('✅ ALL SERVERLESS STATELESS RESET TESTS PASSED (100%)');
    console.log('====================================================');
  } finally {
    if (testServer) {
      await new Promise(resolve => testServer.close(resolve));
    }
    await cleanTestProbes();
  }
}

runTests().catch(err => {
  console.error('\n❌ Test Failure:', err);
  process.exit(1);
});
