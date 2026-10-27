import http from 'http';
import bcrypt from 'bcryptjs';
import app from '../src/index.js';
import db, { initDb } from '../src/database/db.js';
import { calculateDepartmentMetrics } from '../src/routes/deanRoutes.js';

process.env.TEST_MODE = 'true';

async function verifyAll() {
  await initDb();
  console.log('=== VERIFYING 12 BRANCHES & 70 STUDENTS PER BRANCH ===\n');

  const branches = db.getAll('branches');
  console.log(`Total Branches in DB: ${branches.length}`);
  if (branches.length !== 12) {
    throw new Error(`Expected 12 branches, found ${branches.length}`);
  }

  const allUsers = db.getAll('users');
  const allStudents = allUsers.filter(u => u.role === 'STUDENT' && u.id.startsWith('std-'));
  console.log(`Total Department Students in DB: ${allStudents.length}`);
  if (allStudents.length !== 840) {
    throw new Error(`Expected 840 department students, found ${allStudents.length}`);
  }

  console.log('\n--- Checking Student Counts & Sample Login per Branch ---');
  const testPassword = 'Password123';
  let verifiedLogins = 0;

  for (const branch of branches) {
    const branchStudents = allStudents.filter(s => s.branch_id === branch.id);
    if (branchStudents.length !== 70) {
      throw new Error(`Branch ${branch.name} (${branch.code}) expected 70 students, got ${branchStudents.length}`);
    }

    // Pick top student (#1) and test login password hash
    const sampleStudent = branchStudents[0];
    const isPasswordValid = await bcrypt.compare(testPassword, sampleStudent.password_hash);
    if (!isPasswordValid) {
      throw new Error(`Login password verification failed for ${sampleStudent.email}`);
    }
    verifiedLogins++;

    // Check score distribution within this branch
    const topStudents = branchStudents.filter(s => s.skill_level === 'Advanced');
    const midStudents = branchStudents.filter(s => s.skill_level === 'Intermediate');
    const devStudents = branchStudents.filter(s => s.skill_level === 'Beginner');

    console.log(`[PASS] ${branch.name.padEnd(65)} [${branch.code.padEnd(11)}] -> 70 students | Sample Login: ${sampleStudent.email.padEnd(38)} (PASS) | Tiers: ${topStudents.length} Top, ${midStudents.length} Mid, ${devStudents.length} Dev`);
  }

  console.log(`\nVerified ${verifiedLogins} / 12 department sample student credentials with bcrypt.`);

  // Verify quiz sessions & scores
  const allSessions = db.getAll('quizSessions');
  console.log(`\nTotal Quiz Sessions: ${allSessions.length}`);
  const scores = allSessions.map(s => s.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  console.log(`Score Range across all tests: Min: ${minScore}%, Max: ${maxScore}%, Avg: ${avgScore}%`);

  // Verify Dean Department Metrics Calculation
  console.log('\n--- Testing Dean Analytics Engine (calculateDepartmentMetrics) ---');
  const metricsResult = calculateDepartmentMetrics();
  console.log(`Dean Analytics processed ${metricsResult.departments.length} departments.`);
  console.log(`Total Enrolled Students in Analytics: ${metricsResult.summary.total_enrolled_students}`);
  metricsResult.departments.forEach(d => {
    console.log(`- ${d.name.padEnd(65)}: ${d.student_count} Students | Avg Score: ${d.average_score}% | Active: ${d.active_students} | Tier: ${d.performance_tier}`);
  });

  // Verify Live Express API Portal Login via HTTP POST /api/auth/login
  console.log('\n--- Testing Live HTTP Portal Login (POST /api/auth/login) ---');
  const testServer = http.createServer(app);
  await new Promise(resolve => testServer.listen(0, resolve));
  const port = testServer.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const testLoginEmails = [
    'aarav.sharma.ce1@college.edu',
    'gaurav.trivedi.cse1@college.edu',
    'aditya.mittal.roboticsai1@college.edu'
  ];

  for (const email of testLoginEmails) {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: testPassword })
    });
    const data = await res.json();
    if (res.status !== 200 || !data.token || !data.user) {
      testServer.close();
      throw new Error(`Portal login failed for ${email}: status ${res.status}, msg: ${data.message}`);
    }
    console.log(`[PASS] Live Portal Login HTTP 200 OK for ${email} (Name: ${data.user.name}, Branch: ${data.user.branch_name}, XP: ${data.user.total_xp})`);
  }

  testServer.close();
  console.log('\n=== ALL VERIFICATIONS PASSED SUCCESSFULLY! ===');
}

verifyAll().catch(err => {
  console.error('VERIFICATION FAILED:', err);
  process.exit(1);
});
