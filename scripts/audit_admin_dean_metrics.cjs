const http = require('http');

function apiCall(endpoint, method = 'GET', token = null, postData = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, 'http://localhost:5000');
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;
    if (postData) {
      const dataStr = JSON.stringify(postData);
      options.headers['Content-Length'] = Buffer.byteLength(dataStr);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
}

async function auditAdminDean() {
  console.log('🔍 AUDITING ADMIN AND DEAN SECTIONS...');

  // 1. Login as Admin
  const adminLogin = await apiCall('/api/auth/login', 'POST', null, {
    email: 'admin@preppilot.ai',
    password: 'admin123'
  });
  const adminToken = adminLogin.body.token;
  if (!adminToken) {
    console.error('❌ Admin login failed:', adminLogin.body);
    return;
  }
  console.log('✅ Admin login successful');

  // 2. Login as Dean
  const deanLogin = await apiCall('/api/auth/login', 'POST', null, {
    email: 'dean@college.edu',
    password: 'DeanPass123'
  });
  const deanToken = deanLogin.body.token;
  if (!deanToken) {
    console.error('❌ Dean login failed:', deanLogin.body);
    return;
  }
  console.log('✅ Dean login successful');

  // =========================================================================
  // ADMIN SECTION AUDIT
  // =========================================================================
  console.log('\n--- ADMIN ENDPOINTS AUDIT ---');

  // A. Admin Overview
  const adminOverview = await apiCall('/api/admin/overview', 'GET', adminToken);
  console.log('Admin Overview Status:', adminOverview.status);
  console.log('Admin Overview Stats:', adminOverview.body?.stats);

  // B. Admin Students List
  const adminStudents = await apiCall('/api/admin/students', 'GET', adminToken);
  console.log('Admin Students Count:', adminStudents.body?.count);
  const shashwatAdmin = adminStudents.body?.students?.find(s => s.email.includes('balamwarshashwat'));
  console.log('Shashwat in Admin Student List:', {
    name: shashwatAdmin?.name,
    email: shashwatAdmin?.email,
    total_attempted: shashwatAdmin?.total_attempted,
    total_correct: shashwatAdmin?.total_correct,
    accuracy: shashwatAdmin?.accuracy,
    total_xp: shashwatAdmin?.total_xp,
    readiness_score: shashwatAdmin?.readiness_score
  });

  // C. Admin Student Progress (Shashwat)
  if (shashwatAdmin) {
    const studentProgress = await apiCall(`/api/admin/students/${shashwatAdmin.id}/progress`, 'GET', adminToken);
    console.log('Shashwat Progress in Admin View:', {
      readiness_score: studentProgress.body?.progress?.readiness_score,
      overall_accuracy: studentProgress.body?.progress?.summary?.overall_accuracy,
      total_attempted: studentProgress.body?.progress?.summary?.total_attempted,
      correct_count: studentProgress.body?.progress?.summary?.correct_count,
      avg_time: studentProgress.body?.progress?.summary?.avg_time_per_question
    });
  }

  // =========================================================================
  // DEAN SECTION AUDIT
  // =========================================================================
  console.log('\n--- DEAN ENDPOINTS AUDIT ---');

  // A. Dean Overview
  const deanOverview = await apiCall('/api/dean/overview', 'GET', deanToken);
  console.log('Dean Overview Status:', deanOverview.status);
  console.log('Dean Overview Summary:', deanOverview.body?.summary);

  // B. Dean Departments
  const deanDepts = await apiCall('/api/dean/departments', 'GET', deanToken);
  console.log('Dean Departments Status:', deanDepts.status);
  console.log('Dean Departments Count:', deanDepts.body?.departments?.length);
  if (deanDepts.body?.departments?.length > 0) {
    console.log('Sample Department:', deanDepts.body?.departments[0]);
  }

  // C. Dean Performance List
  const deanPerf = await apiCall('/api/dean/performance', 'GET', deanToken);
  console.log('Dean Performance Status:', deanPerf.status);
  console.log('Dean Performance Count:', deanPerf.body?.count);
  const shashwatDean = deanPerf.body?.students?.find(s => s.email?.includes('balamwarshashwat'));
  console.log('Shashwat in Dean Performance List:', shashwatDean);

  // D. Dean Subject Analytics
  const deanSubjects = await apiCall('/api/dean/subject-analytics', 'GET', deanToken);
  console.log('Dean Subject Analytics Status:', deanSubjects.status);
  console.log('Dean Subject Analytics Count:', deanSubjects.body?.subjects?.length);
}

auditAdminDean().catch(console.error);

