const http = require('http');

function apiCall(endpoint, method = 'GET', token = null, postData = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, 'http://localhost:5000');
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
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

async function audit() {
  console.log('🔍 AUDITING DASHBOARD & ANALYTICS METRICS...');

  // 1. Login as Shashwat
  const loginRes = await apiCall('/api/auth/login', 'POST', null, {
    email: 'balamwarshashwat@gmail.com',
    password: 'password123'
  });

  if (!loginRes.body.token) {
    console.error('Login failed:', loginRes.body);
    return;
  }

  const token = loginRes.body.token;
  const user = loginRes.body.user;

  // 2. Fetch Dashboard Stats
  const dashRes = await apiCall('/api/dashboard/stats', 'GET', token);
  const dashStats = dashRes.body.stats || {};

  // 3. Fetch Analytics
  const analyticsRes = await apiCall('/api/analytics', 'GET', token);
  const anData = analyticsRes.body || {};
  const anSummary = anData.summary || {};
  const anReadiness = anData.placement_readiness || {};
  const anAnalytics = anData.analytics || {};

  console.log('\n======================================================');
  console.log('📊 SIDE-BY-SIDE METRIC AUDIT (SHASHWAT BALAMWAR)');
  console.log('======================================================');

  const comparisons = [
    {
      metric: 'Placement Readiness Score',
      dashboard: dashStats.preparation_score,
      analytics: anReadiness.score,
      status: dashStats.preparation_score === anReadiness.score ? '✅ MATCH' : '❌ MISMATCH'
    },
    {
      metric: 'Total Attempted Questions',
      dashboard: dashStats.total_questions_attempted,
      analytics: anSummary.total_attempted,
      status: dashStats.total_questions_attempted === anSummary.total_attempted ? '✅ MATCH' : '❌ MISMATCH'
    },
    {
      metric: 'Overall Accuracy %',
      dashboard: dashStats.accuracy_percentage,
      analytics: anSummary.overall_accuracy,
      status: dashStats.accuracy_percentage === anSummary.overall_accuracy ? '✅ MATCH' : '❌ MISMATCH'
    },
    {
      metric: 'Current Streak',
      dashboard: dashStats.current_streak,
      analytics: anSummary.current_streak,
      status: dashStats.current_streak === anSummary.current_streak ? '✅ MATCH' : '❌ MISMATCH'
    },
    {
      metric: 'Longest Streak',
      dashboard: dashStats.longest_streak,
      analytics: anSummary.longest_streak,
      status: dashStats.longest_streak === anSummary.longest_streak ? '✅ MATCH' : '❌ MISMATCH'
    }
  ];

  console.table(comparisons);

  // Deep dive into Weak & Strong topics
  console.log('\n--- WEAK & STRONG TOPICS AUDIT ---');
  console.log('Dashboard Weak Topics Count:', dashStats.weak_topics?.length || 0);
  console.log('Analytics Weak Topics Count:', anAnalytics.weakest_topics?.length || 0);
  console.log('Dashboard Strong Topics Count:', dashStats.strong_topics?.length || 0);
  console.log('Analytics Strong Topics Count:', anAnalytics.strongest_topics?.length || 0);

  console.log('\nDashboard Weak Topics Sample:', dashStats.weak_topics?.slice(0, 3));
  console.log('Analytics Weak Topics Sample:', anAnalytics.weakest_topics?.slice(0, 3));

  // Deep dive into Subject Progress
  console.log('\n--- SUBJECT PROGRESS / ACCURACY AUDIT ---');
  console.log('Dashboard Subject Progress:', dashStats.subject_progress?.map(s => ({ name: s.name, accuracy: s.accuracy, attempted: s.attempted, total_questions: s.total_questions })));
  console.log('Analytics Subject Accuracy:', anAnalytics.subject_accuracy?.map(s => ({ name: s.fullName || s.name, accuracy: s.accuracy, attempted: s.attempted })));

  // Recruiter Benchmarks
  console.log('\n--- RECRUITER ELIGIBILITY AUDIT ---');
  console.log('Analytics Cleared Cutoffs Count:', anReadiness.company_eligibility?.filter(c => c.status === 'ELIGIBLE').length);
  console.log('Dashboard Target Companies:', dashStats.target_companies);
}

audit().catch(console.error);

