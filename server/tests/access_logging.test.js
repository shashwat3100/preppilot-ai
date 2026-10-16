import assert from 'assert';
import http from 'http';
import app from '../src/index.js';
import db from '../src/database/db.js';
import { generateToken } from '../src/middleware/auth.js';

async function runAccessLoggingTests() {
  console.log('\n======================================================');
  console.log('PREPPILOT AI — VISITOR & ACCESS LOGGING TEST SUITE');
  console.log('======================================================\n');

  // Start test server on dynamic port
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`[Test Server] Running at: ${baseUrl}`);

  try {
    // 1. Log in as Admin to obtain authenticated token
    const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@careerprep.ai', password: 'admin123' })
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.token;

    // 2. Perform several requests to trigger access logging
    console.log('--- 1. Testing Visitor Access Capture ---');
    const healthRes = await fetch(`${baseUrl}/api/health`, {
      headers: { 'User-Agent': 'PrepPilot-Test-Bot/1.0' }
    });
    assert.strictEqual(healthRes.status, 200, 'Health check returns HTTP 200');
    console.log('  ✓ Public request to /api/health received HTTP 200');

    // Give asynchronous log write 100ms
    await new Promise(r => setTimeout(r, 100));

    // 3. Query the admin access logs endpoint
    console.log('\n--- 2. Querying Admin Access Telemetry API ---');
    const logsRes = await fetch(`${baseUrl}/api/admin/access-logs?limit=10`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    assert.strictEqual(logsRes.status, 200, 'GET /api/admin/access-logs returns HTTP 200');
    const data = await logsRes.json();
    assert.strictEqual(data.success, true, 'Access telemetry response indicates success');
    assert.ok(typeof data.total_visits === 'number', 'Response contains total_visits counter');
    assert.ok(data.total_visits > 0, `Recorded at least 1 visit (got: ${data.total_visits})`);
    assert.ok(Array.isArray(data.recent_logs), 'Response contains recent_logs array');
    assert.ok(data.recent_logs.length > 0, 'recent_logs contains logged access records');

    const latestLog = data.recent_logs[0];
    assert.ok(latestLog.path, 'Logged record contains requested path');
    assert.ok(latestLog.ip, 'Logged record contains visitor IP');
    assert.ok(typeof latestLog.status_code === 'number' || typeof latestLog.statusCode === 'number', 'Logged record contains response status code');

    console.log(`  ✓ Successfully retrieved access logs: ${data.total_visits} total visits tracked`);
    console.log(`  ✓ Active Storage Engine: ${data.engine || data.source}`);
    console.log(`  ✓ Latest captured path: ${latestLog.path} [HTTP ${latestLog.status_code || latestLog.statusCode}]`);

    // 4. Verify unauthenticated users cannot access telemetry logs
    console.log('\n--- 3. Verifying Access Log Security Boundaries ---');
    const unauthRes = await fetch(`${baseUrl}/api/admin/access-logs`);
    assert.strictEqual(unauthRes.status, 401, 'Unauthenticated access is blocked with HTTP 401');
    console.log('  ✓ Unauthenticated requests to /api/admin/access-logs are blocked (HTTP 401)');

    const studentLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@careerprep.ai', password: 'password123' })
    });
    const studentLoginData = await studentLoginRes.json();
    const studentToken = studentLoginData.token;
    const studentRes = await fetch(`${baseUrl}/api/admin/access-logs`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert.strictEqual(studentRes.status, 403, 'Student access is blocked with HTTP 403');
    console.log('  ✓ Students blocked from viewing telemetry logs (HTTP 403)');

    console.log('\n======================================================');
    console.log('✅ ALL VISITOR & ACCESS LOGGING TESTS PASSED (100%)');
    console.log('======================================================\n');
  } finally {
    server.close();
    process.exit(0);
  }
}

runAccessLoggingTests().catch((err) => {
  console.error('❌ Access logging test failed:', err);
  process.exit(1);
});
