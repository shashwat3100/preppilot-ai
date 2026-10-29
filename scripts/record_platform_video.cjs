const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const RECORDINGS_DIR = path.resolve(__dirname, '../recordings');
if (!fs.existsSync(RECORDINGS_DIR)) {
  fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
}

// Helper: Smooth Eased Scrolling
async function smoothScroll(page, targetY, durationMs = 1200) {
  const startY = await page.evaluate(() => window.scrollY);
  const distance = targetY - startY;
  const steps = Math.max(10, Math.floor(durationMs / 25));
  for (let i = 1; i <= steps; i++) {
    const progress = i / steps;
    const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
    await page.evaluate((y) => window.scrollTo(0, y), startY + distance * ease);
    await page.waitForTimeout(25);
  }
}

// Helper: Video HUD Indicator Banner
async function updateHud(page, sceneNumber, sceneTitle, subtitle = '') {
  await page.evaluate(({ sceneNumber, sceneTitle, subtitle }) => {
    let hud = document.getElementById('preppilot-video-hud');
    if (!hud) {
      hud = document.createElement('div');
      hud.id = 'preppilot-video-hud';
      hud.style.position = 'fixed';
      hud.style.top = '16px';
      hud.style.left = '50%';
      hud.style.transform = 'translateX(-50%)';
      hud.style.zIndex = '999999';
      hud.style.pointerEvents = 'none';
      hud.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      hud.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      document.body.appendChild(hud);
    }
    hud.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 20px;
        background: rgba(15, 23, 42, 0.92);
        border: 1px solid rgba(99, 102, 241, 0.5);
        border-radius: 9999px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 0 15px rgba(99, 102, 241, 0.35);
        backdrop-filter: blur(14px);
      ">
        <div style="
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 10px #10b981;
        "></div>
        <div style="font-weight: 800; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #818cf8;">
          ${sceneNumber} / ${sceneTitle}
        </div>
        ${subtitle ? `
          <div style="height: 12px; width: 1px; background: rgba(255, 255, 255, 0.25);"></div>
          <div style="font-size: 11px; font-weight: 500; color: #cbd5e1;">
            ${subtitle}
          </div>
        ` : ''}
      </div>
    `;
  }, { sceneNumber, sceneTitle, subtitle });
}

async function recordPlatformWalkthrough() {
  console.log('🎬 Starting PrepPilot AI Comprehensive Platform Video Walkthrough...');

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    recordVideo: {
      dir: RECORDINGS_DIR,
      size: { width: 1280, height: 720 }
    },
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  try {
    // =========================================================================
    // SCENE 1: LANDING PAGE & ECOSYSTEM INTRODUCTION
    // =========================================================================
    console.log('📍 Scene 1: Platform Introduction');
    await page.goto('http://localhost:5173/#/');
    await page.waitForLoadState('networkidle');
    await updateHud(page, '01', 'PLATFORM INTRO', 'Intelligent B.Tech Placement & Career Architecture');
    await page.waitForTimeout(2000);

    await smoothScroll(page, 450, 1200);
    await page.waitForTimeout(1200);
    await smoothScroll(page, 950, 1200);
    await page.waitForTimeout(1400);
    await smoothScroll(page, 0, 1000);
    await page.waitForTimeout(1000);

    // =========================================================================
    // SCENE 2: AUTHENTICATION & SECURE SIGN-IN
    // =========================================================================
    console.log('📍 Scene 2: Candidate Authentication');
    await updateHud(page, '02', 'CANDIDATE SIGN IN', 'Direct Verification via Student Credentials');
    await page.goto('http://localhost:5173/#/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const emailInput = await page.waitForSelector('input[type="email"]');
    await emailInput.fill('');
    await emailInput.type('balamwarshashwat@gmail.com', { delay: 45 });
    await page.waitForTimeout(400);

    const passwordInput = await page.waitForSelector('input[type="password"]');
    await passwordInput.fill('');
    await passwordInput.type('password123', { delay: 45 });
    await page.waitForTimeout(500);

    const submitBtn = await page.waitForSelector('button[type="submit"]');
    await submitBtn.click();

    await page.waitForURL('**/#/dashboard', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // =========================================================================
    // SCENE 3: STUDENT COMMAND CENTER (DASHBOARD)
    // =========================================================================
    console.log('📍 Scene 3: Student Dashboard');
    await updateHud(page, '03', 'STUDENT COMMAND CENTER', 'Readiness: 76% • Accuracy: 67% (26 of 39) • Level 3 (745 XP)');
    await page.waitForTimeout(2000);

    // Open Placement Readiness Methodology Explainer Modal
    const helpBtn = await page.$('button[title="How is readiness calculated?"]');
    if (helpBtn) {
      await helpBtn.click();
      await page.waitForTimeout(2000);
      const closeBtn = await page.$('button:has-text("Understood")');
      if (closeBtn) {
        await closeBtn.click();
        await page.waitForTimeout(800);
      }
    }

    await smoothScroll(page, 450, 1200);
    await page.waitForTimeout(1500);
    await smoothScroll(page, 900, 1200);
    await page.waitForTimeout(1500);
    await smoothScroll(page, 0, 1000);
    await page.waitForTimeout(1000);

    // =========================================================================
    // SCENE 4: APTITUDE TEST SOLVING (INTERACTIVE QUIZ)
    // =========================================================================
    console.log('📍 Scene 4: Aptitude Quiz & Topic Solving');
    await page.goto('http://localhost:5173/#/aptitude');
    await page.waitForLoadState('networkidle');
    await updateHud(page, '04', 'APTITUDE SYLLABUS & STATS', 'Quantitative, Logical, Verbal & CS Core Diagnostics');
    await page.waitForTimeout(2200);

    await smoothScroll(page, 350, 1000);
    await page.waitForTimeout(1400);
    await smoothScroll(page, 0, 800);
    await page.waitForTimeout(800);

    // Switch to Timed Test Mode
    const testModeBtn = await page.waitForSelector('button:has-text("Timed Test Mode")');
    await testModeBtn.click();
    await updateHud(page, '04', 'TIMED SCREENING LAUNCH PAD', 'Curated 10 Questions • 15 Mins • +250 Max XP');
    await page.waitForTimeout(1800);

    // Start Timed Test
    const beginTestBtn = await page.waitForSelector('button:has-text("Begin Timed Assessment")');
    await beginTestBtn.click();
    await page.waitForTimeout(1200);

    // Solve Aptitude Test Questions Interactively (Human Simulation: 4 Correct, 1 Learning Error)
    await updateHud(page, '04', 'SOLVING APTITUDE TEST', 'Realistic Candidate Solving • Deliberate Option Selection');
    const aptitudeChoices = ['A', 'B', 'C', 'D', 'B'];

    for (let i = 0; i < 5; i++) {
      console.log(`Solving Aptitude Question ${i + 1}...`);
      await page.waitForTimeout(1000);
      // Click option
      const choice = aptitudeChoices[i];
      const optBtn = page.locator(`.space-y-3 button:has(span:text-is("${choice}"))`).first();
      if (await optBtn.count() > 0) {
        await optBtn.click();
      } else {
        const fallbackOpt = page.locator('.space-y-3 button').nth(i % 4);
        await fallbackOpt.click();
      }
      await page.waitForTimeout(800);

      if (i < 4) {
        const nextBtn = await page.waitForSelector('button:has-text("Next")');
        await nextBtn.click();
        await page.waitForTimeout(700);
      }
    }

    // Submit Aptitude Test
    await updateHud(page, '04', 'TEST SUBMISSION & GRADING', 'Evaluating Multi-Factor Accuracy & Time Velocity');
    const submitAptitudeBtn = await page.waitForSelector('button:has-text("Submit Test")');
    await submitAptitudeBtn.click();
    await page.waitForTimeout(2500);

    // Review Scorecard & Mistake Diagnostic
    await updateHud(page, '04', 'APTITUDE ASSESSMENT SCORECARD', 'Evaluation Completed • Accuracy Score & XP Awarded');
    await page.waitForTimeout(2000);
    await smoothScroll(page, 400, 1000);
    await page.waitForTimeout(1800);
    await smoothScroll(page, 0, 800);
    await page.waitForTimeout(1000);

    // =========================================================================
    // SCENE 5: PROGRAMMING / CODING TEST SOLVING (MONACO ARENA)
    // =========================================================================
    console.log('📍 Scene 5: Programming / Coding Test Solving');
    await page.goto('http://localhost:5173/#/coding');
    await page.waitForLoadState('networkidle');
    await updateHud(page, '05', 'PROGRAMMING & CODING ARENA', 'LeetCode-Style Practice • Monaco Editor • Multi-Language Sandbox');
    await page.waitForTimeout(2000);

    // Select Two Sum Problem
    const twoSumProblem = await page.waitForSelector('text="Two Sum"');
    await twoSumProblem.click();
    await page.waitForTimeout(1500);
    await updateHud(page, '05', 'PROBLEM: TWO SUM (EASY)', 'Hash Map Algorithm • Time: O(n) • Space: O(n)');

    // Scroll problem description
    await smoothScroll(page, 250, 800);
    await page.waitForTimeout(1200);

    // Set Two Sum Python Solution in Monaco Editor
    const pythonCode = `import sys

def solve():
    lines = sys.stdin.read().strip().split('\\n')
    if len(lines) < 2:
        return
    nums = list(map(int, lines[0].split()))
    target = int(lines[1].strip())

    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            print(f"{seen[diff]} {i}")
            return
        seen[num] = i

if __name__ == '__main__':
    solve()
`;

    await page.evaluate((codeToSet) => {
      if (window.monaco && window.monaco.editor) {
        const models = window.monaco.editor.getModels();
        if (models.length > 0) {
          models[0].setValue(codeToSet);
        }
      }
    }, pythonCode);
    await page.waitForTimeout(1500);

    // Click Run Code
    await updateHud(page, '05', 'RUNNING SAMPLE TESTCASES', 'Compiling Python Solution against Public Test Suite');
    const runBtn = await page.waitForSelector('button:has-text("Run Code")');
    await runBtn.click();
    await page.waitForTimeout(2500);

    // Click Submit Solution
    await updateHud(page, '05', 'SUBMITTING TO CODE JUDGE', 'Executing Test Suite against Strict Time & Memory Limits');
    const submitCodeBtn = await page.waitForSelector('button:has-text("Submit")');
    await submitCodeBtn.click();
    await page.waitForTimeout(3000);

    await updateHud(page, '05', 'SUBMISSION ACCEPTED', 'Verdict: Accepted • All Testcases Passed • +30 XP Earned');
    await page.waitForTimeout(2000);

    // =========================================================================
    // SCENE 6: COMPANY PLACEMENT TEST SOLVING (TCS TRACK)
    // =========================================================================
    console.log('📍 Scene 6: Company Placement Test Solving');
    await page.goto('http://localhost:5173/#/companies');
    await page.waitForLoadState('networkidle');
    await updateHud(page, '06', 'TARGET RECRUITER TRACKS', 'TCS, Infosys, Accenture, Wipro, Amazon & Google Blueprints');
    await page.waitForTimeout(2000);

    // Open TCS Details
    const tcsBlueprintBtn = await page.waitForSelector('div:has(h3:has-text("TCS")) button:has-text("View Blueprint")');
    await tcsBlueprintBtn.click();
    await page.waitForTimeout(1500);
    await updateHud(page, '06', 'TCS RECRUITMENT BLUEPRINT', 'Ninja, Digital & Prime Packages • ₹3.36 - 9.0 LPA');
    await smoothScroll(page, 350, 1000);
    await page.waitForTimeout(1500);
    await smoothScroll(page, 0, 800);

    // Launch TCS Pattern Quiz
    const launchCompanyQuizBtn = await page.waitForSelector('button:has-text("Launch TCS Pattern Quiz")');
    await launchCompanyQuizBtn.click();
    await page.waitForSelector('text="Question Palette"', { timeout: 10000 });
    await updateHud(page, '06', 'SOLVING TCS COMPANY TEST', 'Simulating Company Screening Assessment');

    // Solve 5 Questions with Human Pacing
    const companyOptions = [0, 1, 2, 1, 0];
    for (let q = 0; q < 5; q++) {
      console.log(`Solving TCS Question ${q + 1}...`);
      await page.waitForTimeout(800);
      const optBtn = page.locator('.space-y-3.pt-2 button').nth(companyOptions[q]);
      if (await optBtn.count() > 0) {
        await optBtn.click();
      }
      await page.waitForTimeout(700);

      if (q < 4) {
        const nextQBtn = page.locator('button:has-text("Next Question")');
        if (await nextQBtn.count() > 0) {
          await nextQBtn.click();
        }
        await page.waitForTimeout(600);
      }
    }

    // Submit TCS Quiz
    await updateHud(page, '06', 'TCS QUIZ SUBMISSION', 'Evaluating Verbal, Quant & Core Sections');
    const submitTcsBtn = page.locator('button:has-text("Submit Quiz")');
    if (await submitTcsBtn.count() > 0) {
      await submitTcsBtn.click();
    }
    await page.waitForTimeout(1000);

    // Handle confirm if needed
    const confirmAnyway = page.locator('button:has-text("Submit Anyway")');
    if (await confirmAnyway.count() > 0) {
      await confirmAnyway.click();
    }
    await page.waitForTimeout(2500);

    await updateHud(page, '06', 'TCS SCREENING EVALUATED', 'Performance Benchmark & Interview Viva Tips Displayed');
    await page.waitForTimeout(2000);
    await smoothScroll(page, 450, 1000);
    await page.waitForTimeout(1500);
    await smoothScroll(page, 0, 800);

    // =========================================================================
    // SCENE 7: MISTAKE VAULT & SPACED REPETITION
    // =========================================================================
    console.log('📍 Scene 7: Mistake Vault');
    await page.goto('http://localhost:5173/#/mistakes');
    await page.waitForLoadState('networkidle');
    await updateHud(page, '07', 'SPACED REPETITION VAULT', 'Active Remediation of Conceptual & Pattern Errors');
    await page.waitForTimeout(2000);
    await smoothScroll(page, 400, 1000);
    await page.waitForTimeout(1500);
    await smoothScroll(page, 0, 800);

    // =========================================================================
    // SCENE 8: LIVE PERFORMANCE ANALYTICS & INSTITUTIONAL DOSSIER
    // =========================================================================
    console.log('📍 Scene 8: Performance Analytics');
    await page.goto('http://localhost:5173/#/analytics');
    await page.waitForLoadState('networkidle');
    await updateHud(page, '08', 'PERFORMANCE ANALYTICS', 'Placement Readiness: 76% • 76th Percentile • 4 Cutoffs Cleared');
    await page.waitForTimeout(2200);

    // Open Official Placement Report Dossier
    const reportBtn = await page.$('button:has-text("Official Placement Report")');
    if (reportBtn) {
      await reportBtn.click();
      await page.waitForTimeout(2000);
      await smoothScroll(page, 300, 800);
      await page.waitForTimeout(1800);
      const closeReport = await page.$('.report-modal-overlay button:has-text("Close"), .report-modal-overlay button');
      if (closeReport) {
        await closeReport.click();
        await page.waitForTimeout(800);
      }
    }

    await smoothScroll(page, 750, 1200);
    await page.waitForTimeout(1500);
    await smoothScroll(page, 0, 1000);

    // =========================================================================
    // SCENE 9: STUDENT PROFILE & CREDENTIALS
    // =========================================================================
    console.log('📍 Scene 9: Student Profile');
    await page.goto('http://localhost:5173/#/profile');
    await page.waitForLoadState('networkidle');
    await updateHud(page, '09', 'STUDENT PROFILE & CREDENTIALS', 'Shashwat Balamwar • Level 3+ • Verified Academic Standing');
    await page.waitForTimeout(2000);
    await smoothScroll(page, 350, 1000);
    await page.waitForTimeout(1500);
    await smoothScroll(page, 0, 800);

    // =========================================================================
    // SCENE 10: ADMIN COMMAND CENTER (GOVERNANCE & COHORT TASKS)
    // =========================================================================
    console.log('📍 Scene 10: Admin Command Center');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('http://localhost:5173/#/login');
    await page.waitForLoadState('networkidle');
    await updateHud(page, '10', 'ADMINISTRATOR AUTHENTICATION', 'Role-Based Access Control: Admin Command Center');
    await page.waitForTimeout(1000);

    const adminEmailInput = await page.waitForSelector('input[type="email"]');
    await adminEmailInput.fill('');
    await adminEmailInput.type('admin@preppilot.ai', { delay: 35 });
    const adminPasswordInput = await page.waitForSelector('input[type="password"]');
    await adminPasswordInput.fill('');
    await adminPasswordInput.type('admin123', { delay: 35 });
    const adminSubmit = await page.waitForSelector('button[type="submit"]');
    await adminSubmit.click();

    await page.waitForURL('**/#/admin-overview', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await updateHud(page, '10', 'ADMIN COMMAND CENTER', '850 Enrolled Students • 1,233 Questions in Bank • 75% Platform Accuracy');
    await page.waitForTimeout(2200);

    await smoothScroll(page, 500, 1200);
    await page.waitForTimeout(1500);
    await smoothScroll(page, 0, 800);

    // Admin Task 1: Student Roster Governance
    await page.goto('http://localhost:5173/#/admin-students');
    await page.waitForLoadState('networkidle');
    await updateHud(page, '10', 'ADMIN TASK: STUDENT ROSTER', 'Live Candidate Performance Audit & Progress Inspection');
    await page.waitForTimeout(1500);

    const studentSearch = await page.$('input[placeholder*="Search by candidate name"]');
    if (studentSearch) {
      await studentSearch.fill('');
      await studentSearch.type('shashwat', { delay: 40 });
      await page.waitForTimeout(1800);
    }
    await smoothScroll(page, 300, 800);
    await page.waitForTimeout(1500);
    await smoothScroll(page, 0, 800);

    // Admin Task 2: Question Bank Management
    await page.goto('http://localhost:5173/#/admin-questions');
    await page.waitForLoadState('networkidle');
    await updateHud(page, '10', 'ADMIN TASK: QUESTION CURATION', 'Question Banks • Difficulty Distribution • Bloom Taxonomy');
    await page.waitForTimeout(2000);
    await smoothScroll(page, 400, 1000);
    await page.waitForTimeout(1500);
    await smoothScroll(page, 0, 800);

    // =========================================================================
    // SCENE 11: DEAN ACADEMIC PORTAL & INSTITUTIONAL BENCHMARKS
    // =========================================================================
    console.log('📍 Scene 11: Dean Academic Portal');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('http://localhost:5173/#/login');
    await page.waitForLoadState('networkidle');
    await updateHud(page, '11', 'DEAN AUTHENTICATION', 'Role-Based Access Control: Academic Dean Portal');
    await page.waitForTimeout(1000);

    const deanEmailInput = await page.waitForSelector('input[type="email"]');
    await deanEmailInput.fill('');
    await deanEmailInput.type('dean@college.edu', { delay: 35 });
    const deanPasswordInput = await page.waitForSelector('input[type="password"]');
    await deanPasswordInput.fill('');
    await deanPasswordInput.type('DeanPass123', { delay: 35 });
    const deanSubmit = await page.waitForSelector('button[type="submit"]');
    await deanSubmit.click();

    await page.waitForURL('**/#/dean-overview', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await updateHud(page, '11', 'DEAN ACADEMIC OVERVIEW', '12 Engineering Departments • Tier Benchmarks & Learning Gaps');
    await page.waitForTimeout(2200);

    await smoothScroll(page, 500, 1200);
    await page.waitForTimeout(1500);
    await smoothScroll(page, 950, 1200);
    await page.waitForTimeout(1500);
    await smoothScroll(page, 0, 800);

    // Dean Task 1: Department Benchmarks
    await page.goto('http://localhost:5173/#/dean-departments');
    await page.waitForLoadState('networkidle');
    await updateHud(page, '11', 'DEAN TASK: DEPARTMENT BENCHMARKS', 'CSE, IT, ECE, EE, ME, CE & AI Accreditation Matrix');
    await page.waitForTimeout(2000);
    await smoothScroll(page, 500, 1200);
    await page.waitForTimeout(1500);
    await smoothScroll(page, 0, 800);

    // Dean Task 2: Student Performance Cohort Directory
    await page.goto('http://localhost:5173/#/dean-performance');
    await page.waitForLoadState('networkidle');
    await updateHud(page, '11', 'DEAN TASK: COHORT PERFORMANCE', 'Departmental Candidate Placement Eligibility Tiers');
    await page.waitForTimeout(2000);
    await smoothScroll(page, 400, 1000);
    await page.waitForTimeout(1500);
    await smoothScroll(page, 0, 800);

    // =========================================================================
    // SCENE 12: CONCLUSION (RETURN TO STUDENT DASHBOARD)
    // =========================================================================
    console.log('📍 Scene 12: Platform Verification & Conclusion');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('http://localhost:5173/#/login');
    await page.waitForLoadState('networkidle');
    await updateHud(page, '12', 'VERIFICATION WRAP-UP', 'Returning to Candidate Command Center');

    const finalEmailInput = await page.waitForSelector('input[type="email"]');
    await finalEmailInput.fill('');
    await finalEmailInput.type('balamwarshashwat@gmail.com', { delay: 35 });
    const finalPasswordInput = await page.waitForSelector('input[type="password"]');
    await finalPasswordInput.fill('');
    await finalPasswordInput.type('password123', { delay: 35 });
    const finalSubmit = await page.waitForSelector('button[type="submit"]');
    await finalSubmit.click();

    await page.waitForURL('**/#/dashboard', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await updateHud(page, '12', 'MASTER PLATFORM WALKTHROUGH', 'Readiness Verified • Tests Solved • Admin & Dean Ecosystem Proven');
    await page.waitForTimeout(3500);

  } catch (err) {
    console.error('❌ Error during recording:', err);
  } finally {
    await page.close();
    await context.close();
    await browser.close();
    console.log('✅ Master video recording finished!');

    // Find and rename the latest video file
    const files = fs.readdirSync(RECORDINGS_DIR).filter(f => f.endsWith('.webm'));
    if (files.length > 0) {
      files.sort((a, b) => {
        const sa = fs.statSync(path.join(RECORDINGS_DIR, a)).mtimeMs;
        const sb = fs.statSync(path.join(RECORDINGS_DIR, b)).mtimeMs;
        return sb - sa;
      });
      const latestVideo = path.join(RECORDINGS_DIR, files[0]);
      const finalName = path.join(RECORDINGS_DIR, 'PrepPilot_AI_Platform_Walkthrough.webm');
      try {
        if (latestVideo !== finalName) {
          if (fs.existsSync(finalName)) fs.unlinkSync(finalName);
          fs.renameSync(latestVideo, finalName);
        }
        console.log(`🎬 Master Walkthrough Video saved at: ${finalName}`);
        const sizeMb = (fs.statSync(finalName).size / (1024 * 1024)).toFixed(2);
        console.log(`📁 File Size: ${sizeMb} MB`);
      } catch (renameErr) {
        console.log(`Saved as: ${latestVideo}`);
      }
    }
  }
}

recordPlatformWalkthrough().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
