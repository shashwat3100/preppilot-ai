import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMP_DIR = path.join(__dirname, '..', '..', 'temp_code');

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

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
    command: 'python',
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
  }
};

const EXECUTION_LIMITS = {
  timeout: 5000,
  memoryLimit: 256 * 1024 * 1024,
  outputLimit: 1024 * 1024
};

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
      command = 'g++',
      args = [filePath, '-o', exePath, '-std=c++17', '-O2'];
    } else if (language === 'java') {
      command = 'javac';
      args = [filePath];
      exePath = path.join(runDir, 'Main');
    }

    const proc = spawn(command, args, { cwd: runDir, timeout: 10000 });

    let stderr = '';
    proc.stderr.on('data', (data) => { stderr += data.toString(); });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, exePath });
      } else {
        resolve({ success: false, error: stderr || `Compilation failed with exit code ${code}` });
      }
    });

    proc.on('error', (err) => {
      resolve({ success: false, error: `Compiler not found: ${command}. ${err.message}` });
    });
  });
}

async function executeCode(exePath, config, input, language, runDir) {
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
      cwd: runDir,
      timeout: EXECUTION_LIMITS.timeout,
      maxBuffer: EXECUTION_LIMITS.outputLimit
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timeoutHandle = setTimeout(() => {
      timedOut = true;
      try { proc.kill('SIGKILL'); } catch (e) {}
    }, EXECUTION_LIMITS.timeout);

    if (input) {
      proc.stdin.write(input);
      proc.stdin.end();
    } else {
      proc.stdin.end();
    }

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
      if (stdout.length > EXECUTION_LIMITS.outputLimit) {
        try { proc.kill('SIGKILL'); } catch (e) {}
      }
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      clearTimeout(timeoutHandle);
      const executionTimeMs = Number((process.hrtime.bigint() - startTime) / 1000000n);
      if (timedOut) {
        resolve({ success: false, output: '', error: 'Time Limit Exceeded (5s)', timedOut: true, executionTimeMs });
      } else if (code !== 0 && stderr) {
        resolve({ success: false, output: stdout, error: stderr.trim(), executionTimeMs });
      } else {
        resolve({ success: true, output: stdout.trim(), error: '', executionTimeMs });
      }
    });

    proc.on('error', (err) => {
      clearTimeout(timeoutHandle);
      const executionTimeMs = Number((process.hrtime.bigint() - startTime) / 1000000n);
      resolve({ success: false, output: '', error: `Execution error: ${err.message}`, executionTimeMs });
    });
  });
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

export async function runCode(code, language, input = '') {
  let runDir = null;
  try {
    const fileInfo = writeCodeFile(code, language);
    runDir = fileInfo.runDir;

    const compileResult = await compileCode(fileInfo.filePath, fileInfo.config, language);
    if (!compileResult.success) {
      cleanupRunDir(runDir);
      return { success: false, output: '', error: compileResult.error, compileError: true, executionTimeMs: 0 };
    }

    const execResult = await executeCode(compileResult.exePath, fileInfo.config, input, language, runDir);
    cleanupRunDir(runDir);
    return execResult;
  } catch (err) {
    if (runDir) cleanupRunDir(runDir);
    return { success: false, output: '', error: `Internal error: ${err.message}`, executionTimeMs: 0 };
  }
}

export async function runTestCases(code, language, testCases) {
  const results = [];
  let totalExecutionTimeMs = 0;

  for (const tc of testCases) {
    const result = await runCode(code, language, tc.input);
    const cleanActual = (result.output || '').replace(/\r\n/g, '\n').trim();
    const cleanExpected = (tc.expectedOutput || '').replace(/\r\n/g, '\n').trim();
    const passed = result.success && cleanActual === cleanExpected;
    totalExecutionTimeMs += (result.executionTimeMs || 0);

    results.push({
      input: tc.isHidden ? '[Hidden Test Case]' : tc.input,
      expectedOutput: tc.isHidden ? '[Hidden Server Output]' : tc.expectedOutput,
      actualOutput: tc.isHidden && !passed ? '[Hidden mismatch]' : result.output,
      passed,
      error: result.error,
      timedOut: result.timedOut,
      compileError: result.compileError,
      executionTimeMs: result.executionTimeMs || 0,
      isHidden: tc.isHidden
    });
    if (!passed) break;
  }

  const allPassed = results.length === testCases.length && results.every(r => r.passed);
  return {
    results,
    allPassed,
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