import http from 'http';
import app from '../src/index.js';
import db from '../src/database/db.js';
import { getPgPool, queryPostgresUserByEmail, closePgPool } from '../src/database/postgres.js';

let server;
let baseUrl;

function makeRequest(path, options = {}) {
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

    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function runTest() {
  console.log('--- STARTING RELOGIN LIFECYCLE VERIFICATION ---');

  await new Promise((resolve) => {
    server = http.createServer(app).listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`Test server running on ${baseUrl}`);
      resolve();
    });
  });

  const testEmail = `relogin_test_${Date.now()}@college.edu`;
  const testPassword = 'SecurePass123';
  const testName = 'Coldstart Test Student';

  console.log(`\nStep 1: Registering new student (${testEmail})...`);
  const regRes = await makeRequest('/api/auth/register', {
    method: 'POST',
    body: {
      name: testName,
      email: testEmail,
      password: testPassword,
      branch_id: 'branch-cse',
      year: '4th Year'
    }
  });

  if (regRes.status !== 201 || !regRes.body.success) {
    console.error('Registration failed:', regRes.status, regRes.body);
    process.exit(1);
  }
  console.log('✓ Registration succeeded:', regRes.body.message);
  const createdUserId = regRes.body.user.id;

  console.log('\nStep 2: Verifying user was durably saved in PostgreSQL Neon...');
  const pgUser = await queryPostgresUserByEmail(testEmail);
  if (!pgUser) {
    console.error('FAIL: User was not found in PostgreSQL Neon!');
    process.exit(1);
  }
  console.log('✓ Found user in PostgreSQL Neon:', {
    id: pgUser.id,
    email: pgUser.email,
    role: pgUser.role,
    total_xp: pgUser.total_xp
  });

  console.log('\nStep 3: Simulating logout and serverless container cold-start...');
  // Delete user from local SQLite/in-memory database completely
  db.delete('users', createdUserId);
  const localCheck = db.findOne('users', u => (u.email || '').toLowerCase() === testEmail.toLowerCase());
  if (localCheck) {
    console.error('FAIL: Local user was not purged from local cache');
    process.exit(1);
  }
  console.log('✓ Local container cache successfully wiped (user does not exist in local SQLite/memory)');

  console.log('\nStep 4: Attempting re-login with the exact same email and password...');
  const loginRes = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: {
      email: testEmail,
      password: testPassword
    }
  });

  if (loginRes.status !== 200 || !loginRes.body.success || !loginRes.body.token) {
    console.error('FAIL: Re-login failed:', loginRes.status, loginRes.body);
    process.exit(1);
  }
  console.log('✓ Re-login succeeded! Token received:', loginRes.body.token.slice(0, 20) + '...');
  console.log('✓ Authenticated User:', loginRes.body.user);

  console.log('\nStep 5: Testing wrong password rejection...');
  const wrongPassRes = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: {
      email: testEmail,
      password: 'WrongPassword999'
    }
  });

  if (wrongPassRes.status !== 401) {
    console.error('FAIL: Wrong password should return 401, got:', wrongPassRes.status);
    process.exit(1);
  }
  console.log('✓ Wrong password rejected with 401 as expected');

  console.log('\nStep 6: Testing user account balamwarshashwat@gmmail.com login...');
  // Purge from local db first to ensure PostgreSQL fallback works for Shashwat
  const shashwatLocal = db.findOne('users', u => (u.email || '').toLowerCase() === 'balamwarshashwat@gmmail.com');
  if (shashwatLocal) {
    db.delete('users', shashwatLocal.id);
  }
  const shashwatLoginRes = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: {
      email: 'balamwarshashwat@gmmail.com',
      password: 'password123'
    }
  });

  if (shashwatLoginRes.status !== 200 || !shashwatLoginRes.body.success) {
    console.error('FAIL: Shashwat login failed:', shashwatLoginRes.status, shashwatLoginRes.body);
    process.exit(1);
  }
  console.log('✓ Shashwat login succeeded via PostgreSQL Neon lookup!');
  console.log('✓ Shashwat User Details:', {
    name: shashwatLoginRes.body.user.name,
    email: shashwatLoginRes.body.user.email,
    total_xp: shashwatLoginRes.body.user.total_xp,
    current_streak: shashwatLoginRes.body.user.current_streak
  });

  // Clean up test user in PostgreSQL
  const pool = getPgPool();
  if (pool) {
    await pool.query('DELETE FROM users WHERE email = $1', [testEmail]);
    console.log('\n✓ Cleaned up test user from PostgreSQL');
  }
  await closePgPool();
  server.close();

  console.log('\n>>> ALL RELOGIN LIFECYCLE TESTS PASSED PERFECTLY! <<<');
  process.exit(0);
}

runTest().catch(err => {
  console.error('Unexpected error during test:', err);
  process.exit(1);
});
