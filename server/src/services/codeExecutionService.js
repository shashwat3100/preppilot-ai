import { spawn, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMP_DIR = process.env.VERCEL
  ? path.join('/tmp', 'temp_code')
  : path.join(__dirname, '..', '..', 'temp_code');

try {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
  const tempPkg = path.join(TEMP_DIR, 'package.json');
  if (!fs.existsSync(tempPkg)) {
    fs.writeFileSync(tempPkg, JSON.stringify({ type: 'commonjs' }, null, 2), 'utf-8');
  }
} catch (e) {
  // Silent fallback in read-only serverless environments
}

// Judge0 Language IDs
const JUDGE0_LANGUAGE_IDS = {
  c: 50,      // C (GCC 9.2.0)
  cpp: 54,    // C++ (GCC 9.2.0)
  python: 71, // Python (3.8.1)
  java: 62,   // Java (OpenJDK 13.0.1)
  javascript: 63 // JavaScript (Node.js 12.14.0)
};

// Local runner configurations
const LANGUAGE_CONFIG = {
  c: {
    extension: '.c',
    command: null,
    args: null,
    compile: (filePath) => {
      const exePath = filePath.replace('.c', '.exe');
      return { command: 'gcc', args: [filePath, '-o', exePath, '-O2'], exePath };
    }
  },
  cpp: {
    extension: '.cpp',
    command: null,
    args: null,
    compile: (filePath) => {
      const exePath = filePath.replace('.cpp', '.exe');
      return { command: 'g++', args: [filePath, '-o', exePath, '-std=c++17', '-O2'], exePath };
    }
  },
  python: {
    extension: '.py',
    command: process.platform === 'win32' ? 'python' : 'python3',
    args: (filePath) => [filePath],
    compile: null
  },
  java: {
    extension: '.java',
    command: null,
    args: null,
    compile: (filePath) => {
      const className = path.basename(filePath, '.java');
      const dir = path.dirname(filePath);
      return { command: 'javac', args: [filePath], exePath: path.join(dir, className), className };
    }
  },
  javascript: {
    extension: '.js',
    command: 'node',
    args: (filePath) => [filePath],
    compile: null
  }
};

// Strict Execution Safeguards
export const EXECUTION_LIMITS = {
  maxCodeLength: 64 * 1024,      // 64 KB
  maxInputLength: 32 * 1024,     // 32 KB
  timeoutMs: 5000,               // 5 seconds wall-clock
  compileTimeoutMs: 10000,       // 10 seconds compilation limit
  maxOutputBytes: 512 * 1024,    // 512 KB output limit per channel
  maxConcurrentJobs: 3,          // concurrency limit for local runner
  maxQueueSize: 10               // maximum pending requests in runner queue
};

// Concurrency queue with backpressure for local runner
let activeLocalJobs = 0;
const localJobQueue = [];

function acquireLocalSlot() {
  return new Promise((resolve, reject) => {
    if (activeLocalJobs < EXECUTION_LIMITS.maxConcurrentJobs) {
      activeLocalJobs++;
      resolve();
    } else if (localJobQueue.length >= EXECUTION_LIMITS.maxQueueSize) {
      reject(new Error('Execution queue capacity reached. Please retry in a few moments.'));
    } else {
      const queueTimeoutHandle = setTimeout(() => {
        const idx = localJobQueue.findIndex(item => item.resolve === resolve);
        if (idx !== -1) {
          localJobQueue.splice(idx, 1);
          reject(new Error('Execution request timed out waiting for an available runner slot.'));
        }
      }, 10000); // 10s wait in queue
      localJobQueue.push({ resolve, timeoutHandle: queueTimeoutHandle });
    }
  });
}

function releaseLocalSlot() {
  activeLocalJobs--;
  if (localJobQueue.length > 0) {
    const next = localJobQueue.shift();
    clearTimeout(next.timeoutHandle);
    activeLocalJobs++;
    next.resolve();
  }
}

// Kill process tree cleanly across platforms
function killProcessTree(pid, proc) {
  try {
    if (process.platform === 'win32') {
      exec(`taskkill /PID ${pid} /T /F`, () => {});
    } else {
      try {
        process.kill(pid, 'SIGKILL');
      } catch {}
      try {
        process.kill(-pid, 'SIGKILL');
      } catch {}
    }
  } catch (err) {
    // Process may have already exited
  }
  if (proc && typeof proc.kill === 'function') {
    try {
      proc.kill('SIGKILL');
    } catch {}
  }
}

function cleanupRunDir(runDir) {
  try {
    if (runDir && fs.existsSync(runDir)) {
      fs.rmSync(runDir, { recursive: true, force: true });
    }
  } catch (err) {
    console.warn('[CodeExecution] Cleanup warning:', err.message);
  }
}

// --------------------------------------------------------------------
// Judge0 Sandboxed Execution (External Trusted Provider)
// --------------------------------------------------------------------
async function runWithJudge0(code, language, input = '', overrideUrl = null) {
  const effectiveUrl = overrideUrl || process.env.JUDGE0_API_URL || 'https://ce.judge0.com';
  const apiUrl = effectiveUrl.replace(/\/$/, '');
  const apiKey = process.env.JUDGE0_API_KEY || '';
  const langId = JUDGE0_LANGUAGE_IDS[language];

  if (!langId) {
    throw new Error(`Unsupported language for Judge0: ${language}`);
  }

  const headers = {
    'Content-Type': 'application/json'
  };
  if (apiKey) {
    headers['X-Auth-Token'] = apiKey;
    headers['x-rapidapi-key'] = apiKey;
  }

  const payload = {
    source_code: code,
    language_id: langId,
    stdin: input,
    cpu_time_limit: EXECUTION_LIMITS.timeoutMs / 1000,
    wall_time_limit: (EXECUTION_LIMITS.timeoutMs + 2000) / 1000,
    max_file_size: 1024
  };

  const response = await fetch(`${apiUrl}/submissions?base64_encoded=false&wait=true`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    const isInfra = response.status >= 500 || response.status === 404 || response.status === 429;
    const err = new Error(`Judge0 API error (HTTP ${response.status}): ${errText.slice(0, 200)}`);
    err.isInfrastructureError = isInfra;
    throw err;
  }

  const result = await response.json();
  const stdout = (result.stdout || '').trim();
  const stderr = (result.stderr || result.compile_output || '').trim();
  const statusId = result.status?.id;
  const statusDesc = result.status?.description || '';

  // Status IDs:
  // 3 = Accepted, 4 = Wrong Answer, 5 = Time Limit Exceeded, 6 = Compilation Error
  // 7-12 = Runtime Errors (SIGSEGV, NZEC, etc.)
  // 13 = Internal Error, 14 = Exec Format Error
  const isAccepted = statusId === 3;
  const isTLE = statusId === 5;
  const isCompileError = statusId === 6;
  const isRuntimeError = statusId >= 7 && statusId <= 12;
  const isInfraError = statusId === 13 || statusId === 14;

  return {
    success: isAccepted && !stderr,
    output: stdout,
    error: stderr,
    verdict: statusDesc || (isAccepted ? 'Accepted' : 'Failed'),
    timedOut: isTLE,
    compileError: isCompileError,
    runtimeError: isRuntimeError,
    isInfrastructureError: isInfraError,
    executionTimeMs: result.time ? Math.round(Number(result.time) * 1000) : 0,
    memoryKb: result.memory || null,
    isSandboxed: true,
    engine: 'JUDGE0_SANDBOX'
  };
}

// --------------------------------------------------------------------
// Local Development Execution Engine (Safe Development Fallback)
// --------------------------------------------------------------------
function writeCodeFile(code, language) {
  const config = LANGUAGE_CONFIG[language];
  if (!config) throw new Error(`Unsupported language: ${language}`);

  const id = uuidv4();
  const runDir = path.join(TEMP_DIR, id);
  fs.mkdirSync(runDir, { recursive: true });

  const fileName = language === 'java' ? 'Main.java' : language === 'cpp' ? 'solution.cpp' : language === 'c' ? 'solution.c' : `main${config.extension}`;
  const filePath = path.join(runDir, fileName);

  fs.writeFileSync(filePath, code, 'utf-8');
  return { filePath, id, runDir, config };
}

async function compileCode(filePath, config, language) {
  if (!config.compile) return { success: true, exePath: filePath };

  return new Promise((resolve) => {
    const runDir = path.dirname(filePath);
    let command, args, exePath;

    if (language === 'c') {
      exePath = path.join(runDir, 'solution.exe');
      command = 'gcc';
      args = [filePath, '-o', exePath, '-O2'];
    } else if (language === 'cpp') {
      exePath = path.join(runDir, 'solution.exe');
      command = 'g++';
      args = [filePath, '-o', exePath, '-std=c++17', '-O2'];
    } else if (language === 'java') {
      command = 'javac';
      args = [filePath];
      exePath = path.join(runDir, 'Main');
    }

    const proc = spawn(command, args, { cwd: runDir });

    let stderr = '';
    let timedOut = false;
    let outputExceeded = false;

    const timeoutHandle = setTimeout(() => {
      timedOut = true;
      killProcessTree(proc.pid, proc);
    }, EXECUTION_LIMITS.compileTimeoutMs);

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
      if (stderr.length > EXECUTION_LIMITS.maxOutputBytes) {
        outputExceeded = true;
        killProcessTree(proc.pid, proc);
      }
    });

    proc.on('close', (code) => {
      clearTimeout(timeoutHandle);
      if (timedOut) {
        resolve({ success: false, error: 'Compilation timed out (limit: 10s)', compileError: true, timedOut: true });
      } else if (outputExceeded) {
        resolve({ success: false, error: 'Compiler diagnostic output limit exceeded (512 KB)', compileError: true });
      } else if (code === 0) {
        resolve({ success: true, exePath });
      } else {
        resolve({ success: false, error: stderr.slice(0, 4000) || `Compilation failed with exit code ${code}`, compileError: true });
      }
    });

    proc.on('error', (err) => {
      clearTimeout(timeoutHandle);
      resolve({ success: false, error: `Compiler unavailable or not found: ${command}. (${err.message})`, isInfrastructureError: true });
    });
  });
}

async function executeCodeLocally(exePath, config, input, language, runDir) {
  return new Promise((resolve) => {
    const startTime = process.hrtime.bigint();
    let command, args;

    if (language === 'cpp' || language === 'c') {
      command = exePath;
      args = [];
    } else if (language === 'java') {
      command = 'java';
      args = ['-cp', runDir, 'Main'];
    } else {
      command = config.command;
      args = [exePath];
    }

    const proc = spawn(command, args, {
      cwd: runDir
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let outputExceeded = false;

    const timeoutHandle = setTimeout(() => {
      timedOut = true;
      killProcessTree(proc.pid, proc);
    }, EXECUTION_LIMITS.timeoutMs);

    if (input) {
      try {
        proc.stdin.write(input);
        proc.stdin.end();
      } catch (err) {
        // Stdin write error
      }
    } else {
      try { proc.stdin.end(); } catch (e) {}
    }

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
      if (stdout.length > EXECUTION_LIMITS.maxOutputBytes) {
        outputExceeded = true;
        killProcessTree(proc.pid, proc);
      }
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
      if (stderr.length > EXECUTION_LIMITS.maxOutputBytes) {
        outputExceeded = true;
        killProcessTree(proc.pid, proc);
      }
    });

    proc.on('close', (code) => {
      clearTimeout(timeoutHandle);
      const executionTimeMs = Number((process.hrtime.bigint() - startTime) / 1000000n);
      if (outputExceeded) {
        resolve({
          success: false,
          output: stdout.slice(0, 1000) + '\n... [Output Truncated]',
          error: 'Output Limit Exceeded (512 KB max output exceeded)',
          outputLimitExceeded: true,
          executionTimeMs,
          memoryKb: null,
          isSandboxed: false,
          engine: 'LOCAL_DEVELOPMENT_RUNNER (NO_OS_ISOLATION)'
        });
      } else if (timedOut) {
        resolve({
          success: false,
          output: '',
          error: 'Time Limit Exceeded (5s)',
          timedOut: true,
          executionTimeMs,
          memoryKb: null,
          isSandboxed: false,
          engine: 'LOCAL_DEVELOPMENT_RUNNER (NO_OS_ISOLATION)'
        });
      } else if (code !== 0 && stderr) {
        resolve({
          success: false,
          output: stdout.trim(),
          error: stderr.trim(),
          runtimeError: true,
          executionTimeMs,
          memoryKb: null,
          isSandboxed: false,
          engine: 'LOCAL_DEVELOPMENT_RUNNER (NO_OS_ISOLATION)'
        });
      } else {
        resolve({
          success: true,
          output: stdout.trim(),
          error: '',
          executionTimeMs,
          memoryKb: null,
          isSandboxed: false,
          engine: 'LOCAL_DEVELOPMENT_RUNNER (NO_OS_ISOLATION)'
        });
      }
    });

    proc.on('error', (err) => {
      clearTimeout(timeoutHandle);
      const executionTimeMs = Number((process.hrtime.bigint() - startTime) / 1000000n);
      resolve({
        success: false,
        output: '',
        error: `Execution error: ${err.message}`,
        executionTimeMs,
        memoryKb: null,
        isSandboxed: false,
        isInfrastructureError: true,
        engine: 'LOCAL_DEVELOPMENT_RUNNER (NO_OS_ISOLATION)'
      });
    });
  });
}

// --------------------------------------------------------------------
// Public Unified Execution API
// --------------------------------------------------------------------
export async function runCode(code, language, input = '') {
  // Input validations
  if (typeof code !== 'string' || typeof language !== 'string') {
    return { success: false, output: '', error: 'Code and language must be strings', executionTimeMs: 0 };
  }
  if (code.length > EXECUTION_LIMITS.maxCodeLength) {
    return { success: false, output: '', error: `Code exceeds maximum allowed size of ${EXECUTION_LIMITS.maxCodeLength / 1024} KB`, executionTimeMs: 0 };
  }
  if (input && input.length > EXECUTION_LIMITS.maxInputLength) {
    return { success: false, output: '', error: `Input exceeds maximum allowed size of ${EXECUTION_LIMITS.maxInputLength / 1024} KB`, executionTimeMs: 0 };
  }
  if (!LANGUAGE_CONFIG[language]) {
    return { success: false, output: '', error: `Unsupported language: ${language}`, executionTimeMs: 0 };
  }

  // 1. Production Security Boundary Check:
  // In production, untrusted execution is BLOCKED unless a trusted external sandbox provider is configured.
  // Never silently fall back to host execution in production.
  const isProduction = process.env.NODE_ENV === 'production';
  const effectiveJudge0Url = process.env.JUDGE0_API_URL || (process.env.VERCEL ? 'https://ce.judge0.com' : null);
  if (isProduction) {
    if (!effectiveJudge0Url) {
      return {
        success: false,
        output: '',
        error: 'Execution service blocked: Production environment strictly requires a trusted sandboxed execution provider (JUDGE0_API_URL). Local host execution fallback is disabled.',
        executionTimeMs: 0,
        isSandboxed: false,
        isInfrastructureError: true,
        engine: 'SANDBOX_CONFIG_REQUIRED'
      };
    }
    try {
      return await runWithJudge0(code, language, input, effectiveJudge0Url);
    } catch (err) {
      console.error('[CodeExecution] Judge0 dispatch failed in production:', err.message);
      return {
        success: false,
        output: '',
        error: `Sandboxed execution provider temporarily unavailable: ${err.message}. Local host execution fallback is prohibited in production.`,
        executionTimeMs: 0,
        isSandboxed: true,
        isInfrastructureError: true,
        engine: 'JUDGE0_SANDBOX_OUTAGE'
      };
    }
  }

  // 2. In development, try Judge0 first if configured; otherwise use local runner
  if (process.env.JUDGE0_API_URL) {
    try {
      return await runWithJudge0(code, language, input);
    } catch (err) {
      console.warn('[CodeExecution] Judge0 dispatch failed in development, falling back to local runner:', err.message);
    }
  }

  // 3. Local Development Runner (clearly labeled as unisolated development fallback)
  try {
    await acquireLocalSlot();
  } catch (queueErr) {
    return {
      success: false,
      output: '',
      error: queueErr.message,
      executionTimeMs: 0,
      isSandboxed: false,
      isInfrastructureError: true,
      engine: 'LOCAL_DEVELOPMENT_RUNNER (QUEUE_FULL)'
    };
  }

  let runDir = null;
  try {
    const fileInfo = writeCodeFile(code, language);
    runDir = fileInfo.runDir;

    const compileResult = await compileCode(fileInfo.filePath, fileInfo.config, language);
    if (!compileResult.success) {
      cleanupRunDir(runDir);
      return {
        success: false,
        output: '',
        error: compileResult.error,
        compileError: true,
        executionTimeMs: 0,
        isSandboxed: false,
        engine: 'LOCAL_DEVELOPMENT_RUNNER (NO_OS_ISOLATION)'
      };
    }

    const execResult = await executeCodeLocally(compileResult.exePath, fileInfo.config, input, language, runDir);
    cleanupRunDir(runDir);
    return execResult;
  } catch (err) {
    if (runDir) cleanupRunDir(runDir);
    return {
      success: false,
      output: '',
      error: `Internal runner error: ${err.message}`,
      executionTimeMs: 0,
      isSandboxed: false,
      engine: 'LOCAL_DEVELOPMENT_RUNNER (NO_OS_ISOLATION)'
    };
  } finally {
    releaseLocalSlot();
  }
}

export async function runTestCases(code, language, testCases) {
  const results = [];
  let totalExecutionTimeMs = 0;

  for (const tc of testCases) {
    const result = await runCode(code, language, tc.input);
    const cleanActual = (result.output || '').replace(/\r\n/g, '\n').trim();
    const expectedVal = tc.expectedOutput ?? tc.expected_output ?? '';
    const cleanExpected = expectedVal.replace(/\r\n/g, '\n').trim();
    const isHiddenCase = Boolean(tc.isHidden ?? tc.is_hidden);
    const passed = result.success && cleanActual === cleanExpected;
    totalExecutionTimeMs += (result.executionTimeMs || 0);

    results.push({
      input: isHiddenCase ? '[Hidden Test Case]' : tc.input,
      expectedOutput: isHiddenCase ? '[Hidden Server Output]' : expectedVal,
      actualOutput: isHiddenCase && !passed ? '[Hidden mismatch]' : result.output,
      passed,
      error: result.error,
      timedOut: result.timedOut,
      compileError: result.compileError,
      isInfrastructureError: Boolean(result.isInfrastructureError),
      executionTimeMs: result.executionTimeMs || 0,
      memoryKb: result.memoryKb || null,
      isHidden: isHiddenCase
    });

    // Short-circuit on first failure to conserve execution quota
    if (!passed) break;
  }

  const allPassed = results.length === testCases.length && results.every(r => r.passed);
  const hasInfrastructureError = results.some(r => r.isInfrastructureError);
  return {
    results,
    allPassed,
    hasInfrastructureError,
    passedCount: results.filter(r => r.passed).length,
    totalCount: testCases.length,
    totalExecutionTimeMs
  };
}

export function getSupportedLanguages() {
  return Object.keys(LANGUAGE_CONFIG).map(key => ({
    id: key,
    name: key === 'cpp' ? 'C++' : key === 'c' ? 'C' : key.charAt(0).toUpperCase() + key.slice(1),
    extension: LANGUAGE_CONFIG[key].extension,
    monacoId: key === 'cpp' ? 'cpp' : key === 'c' ? 'c' : key
  }));
}