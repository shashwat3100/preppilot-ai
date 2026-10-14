import React, { useRef, useEffect, useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { useVoice } from '../context/VoiceContext';
import { useTheme } from '../context/ThemeContext';
import {
  RotateCcw,
  Play,
  Send,
  Terminal,
  FileCode2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Volume2,
  VolumeX,
  Mic,
  AlignLeft,
  Edit3,
  Copy,
  Check
} from 'lucide-react';

const DEFAULT_CODE: Record<string, string> = {
  c: `#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Write your C solution here\n    \n    return 0;\n}`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    \n    // Write your C++ solution here\n    \n    return 0;\n}`,
  python: `def solve():\n    # Write your Python solution here\n    pass\n\nif __name__ == "__main__":\n    solve()`,
  java: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your Java solution here\n    }\n}`,
  javascript: `// Write your JavaScript solution here\nfunction solve() {\n    \n}\n\nsolve();`
};

const LANGUAGE_CONFIG: Record<string, { monaco: string; label: string; icon: string; filename: string }> = {
  c: { monaco: 'c', label: 'C', icon: '💻', filename: 'solution.c' },
  cpp: { monaco: 'cpp', label: 'C++', icon: '⚙️', filename: 'solution.cpp' },
  python: { monaco: 'python', label: 'Python', icon: '🐍', filename: 'solution.py' },
  java: { monaco: 'java', label: 'Java', icon: '☕', filename: 'Solution.java' },
  javascript: { monaco: 'javascript', label: 'JavaScript', icon: '🟨', filename: 'solution.js' }
};

export interface CodeEditorProps {
  language: string;
  onLanguageChange?: (lang: string) => void;
  code: string;
  onCodeChange?: (val: string, event?: any) => void;
  readOnly?: boolean;
  height?: string | number;
  theme?: string;
  onRun?: (code: string, language: string, customInput?: string) => void;
  onSubmit?: (code: string, language: string) => void;
  onReset?: () => void;
  running?: boolean;
  submitting?: boolean;
  runOutput?: string;
  runError?: string;
  testResults?: any[];
  executionTimeMs?: number;
  sampleTestCases?: Array<{ input: string; expectedOutput: string; explanation?: string }>;
}

export function CodeEditor({
  language,
  onLanguageChange,
  code,
  onCodeChange,
  readOnly = false,
  height = '100%',
  theme,
  onRun,
  onSubmit,
  onReset,
  running = false,
  submitting = false,
  runOutput,
  runError,
  testResults,
  executionTimeMs,
  sampleTestCases = []
}: CodeEditorProps) {
  const { speakText, stopSpeaking, isSpeaking } = useVoice();
  const { resolvedTheme } = useTheme();
  const activeMonacoTheme = theme || (resolvedTheme === 'light' ? 'vs' : 'vs-dark');

  const editorRef = useRef<any>(null);
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [currentCode, setCurrentCode] = useState(code);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [drawerTab, setDrawerTab] = useState<'sample' | 'custom' | 'output'>('sample');
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);
  const [customInput, setCustomInput] = useState('');

  // Switch to output tab when running finishes
  useEffect(() => {
    if (runOutput || runError || (testResults && testResults.length > 0)) {
      setDrawerTab('output');
      setDrawerOpen(true);
    }
  }, [runOutput, runError, testResults]);

  useEffect(() => {
    setCurrentLanguage(language);
  }, [language]);

  useEffect(() => {
    setCurrentCode(code);
  }, [code]);

  const handleVoiceDebug = useCallback(() => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    if (testResults && testResults.some((r: any) => !r.passed)) {
      const failed = testResults.find((r: any) => !r.passed);
      const failedIdx = testResults.findIndex((r: any) => !r.passed) + 1;
      const script = `PrepPilot AI Debugger: Test case ${failedIdx} failed. Input was ${failed?.input || 'sample test case'}. Your output was "${failed?.actualOutput || 'no output'}", whereas expected output was "${failed?.expectedOutput}". Check boundary conditions, loop bounds, and ensure whitespace matches the exact format.`;
      speakText(script);
    } else if (runError) {
      const script = `Execution error: ${runError.slice(0, 150)}. Verify variable declarations, null checks, and array indexing.`;
      speakText(script);
    } else {
      speakText("All test cases evaluated successfully! Optimal execution.");
    }
  }, [testResults, runError, isSpeaking, speakText, stopSpeaking]);

  const handleEditorChange = useCallback((value?: string, e?: any) => {
    const val = value || '';
    setCurrentCode(val);
    onCodeChange?.(val, e);
  }, [onCodeChange]);

  const handleLanguageChange = useCallback((lang: string) => {
    setCurrentLanguage(lang);
    onLanguageChange?.(lang);
  }, [onLanguageChange]);

  const handleRun = useCallback(() => {
    const inputToSend = drawerTab === 'custom'
      ? customInput
      : (sampleTestCases[selectedCaseIdx]?.input || '');
    onRun?.(currentCode, currentLanguage, inputToSend);
  }, [onRun, currentCode, currentLanguage, drawerTab, customInput, sampleTestCases, selectedCaseIdx]);

  const handleSubmit = useCallback(() => {
    onSubmit?.(currentCode, currentLanguage);
  }, [onSubmit, currentCode, currentLanguage]);

  const handleReset = useCallback(() => {
    if (onReset) {
      onReset();
    } else {
      const newCode = DEFAULT_CODE[currentLanguage] || '';
      setCurrentCode(newCode);
      onCodeChange?.(newCode);
    }
  }, [onReset, currentLanguage, onCodeChange]);

  const handleFormat = useCallback(() => {
    editorRef.current?.editor?.getAction('editor.action.formatDocument')?.run();
  }, []);

  const [copied, setCopied] = useState(false);

  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // Fallback
    }
  }, [currentCode]);

  const activeConfig = LANGUAGE_CONFIG[currentLanguage] || LANGUAGE_CONFIG.python;

  return (
    <div className="flex flex-col h-full bg-[var(--surface-card)] rounded-xl overflow-hidden border border-[var(--surface-border)]">
      {/* Top Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-[var(--surface-elevated)] border-b border-[var(--surface-border)] gap-2">
        <div className="flex items-center gap-2">
          {/* Language selector */}
          <select
            value={currentLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            disabled={running || submitting}
            className="bg-[var(--surface-card)] text-[var(--text-primary)] px-3 py-1.5 rounded-lg border border-[var(--surface-border)] focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs font-semibold appearance-none cursor-pointer hover:bg-[var(--surface-hover)] transition-colors"
          >
            {Object.entries(LANGUAGE_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.icon} {config.label}
              </option>
            ))}
          </select>

          {/* Active File Name Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface-card)] border border-[var(--surface-border)] text-[11px] font-mono text-[var(--text-muted)]">
            <FileCode2 size={13} className="text-indigo-400" />
            <span>{activeConfig.filename}</span>
          </div>

          {/* Copy Code button */}
          <button
            onClick={handleCopyCode}
            className="px-2.5 py-1.5 bg-[var(--surface-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs rounded-lg hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Copy Code to Clipboard"
          >
            {copied ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>

          {/* Reset Code button */}
          <button
            onClick={handleReset}
            disabled={running || submitting}
            className="px-2.5 py-1.5 bg-[var(--surface-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs rounded-lg hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Reset to Starter Code"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Format Code button */}
          <button
            onClick={handleFormat}
            disabled={running || submitting}
            className="px-2.5 py-1.5 bg-[var(--surface-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs rounded-lg hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Format Code"
          >
            <AlignLeft size={13} />
            <span className="hidden sm:inline">Format</span>
          </button>
        </div>

        {/* Action Buttons: Run & Submit */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRun}
            disabled={running || submitting}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            title="Run solution against sample or custom input"
          >
            {running ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play size={13} className="fill-current" />
                <span>Run Code</span>
              </>
            )}
          </button>

          <button
            onClick={handleSubmit}
            disabled={running || submitting}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            title="Submit solution to server test suite"
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Judging...</span>
              </>
            ) : (
              <>
                <Send size={13} />
                <span>Submit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Center: Monaco Editor */}
      <div className="flex-1 relative min-h-0">
        <Editor
          height={height}
          language={LANGUAGE_CONFIG[currentLanguage]?.monaco || 'python'}
          theme={activeMonacoTheme}
          value={currentCode}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: 'on',
            bracketPairColorization: { enabled: true },
            renderLineHighlight: 'all',
            folding: true,
            readOnly,
            scrollbar: { vertical: 'auto', horizontal: 'auto' }
          }}
          onMount={(editor, monaco) => {
            editorRef.current = { editor, monaco };
          }}
          beforeMount={(monaco) => {
            monaco.languages.typescript?.javascriptDefaults?.setCompilerOptions({
              target: monaco.languages.typescript.ScriptTarget.ES2020,
              allowNonTsExtensions: true,
              moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
              module: monaco.languages.typescript.ModuleKind.CommonJS,
              noEmit: true,
              esModuleInterop: true,
              jsx: monaco.languages.typescript.JsxEmit.React,
              allowJs: true
            });
          }}
        />
      </div>

      {/* Bottom Test Case & Console Output Drawer */}
      <div className={`border-t border-[var(--surface-border)] bg-[var(--surface-card)] flex flex-col transition-all duration-200 ${drawerOpen ? 'h-64' : 'h-10'}`}>
        {/* Drawer Header Bar */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--surface-elevated)] border-b border-[var(--surface-border)] select-none">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setDrawerTab('sample'); setDrawerOpen(true); }}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                drawerTab === 'sample' && drawerOpen
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Terminal size={12} />
              <span>Sample Tests ({sampleTestCases.length})</span>
            </button>

            <button
              onClick={() => { setDrawerTab('custom'); setDrawerOpen(true); }}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                drawerTab === 'custom' && drawerOpen
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Edit3 size={12} />
              <span>Custom Input</span>
            </button>

            <button
              onClick={() => { setDrawerTab('output'); setDrawerOpen(true); }}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                drawerTab === 'output' && drawerOpen
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <FileCode2 size={12} />
              <span>Console & Verdict</span>
              {testResults && testResults.length > 0 && (
                <span className={`w-2 h-2 rounded-full ${testResults.every((r: any) => r.passed) ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* AI Voice Mentor */}
            {(testResults?.some((r: any) => !r.passed) || runError) && (
              <button
                onClick={handleVoiceDebug}
                className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  isSpeaking
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                    : 'bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40'
                }`}
                title="AI Voice Mentor Diagnostic"
              >
                {isSpeaking ? <VolumeX size={12} /> : <Mic size={12} className="text-cyan-400" />}
                <span className="hidden sm:inline">{isSpeaking ? 'Stop Voice' : 'AI Voice Diagnostic'}</span>
              </button>
            )}

            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
              title={drawerOpen ? 'Collapse drawer' : 'Expand drawer'}
            >
              {drawerOpen ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        {drawerOpen && (
          <div className="flex-1 p-3 overflow-y-auto font-mono text-xs">
            {drawerTab === 'sample' && (
              <div className="h-full flex flex-col space-y-2">
                <div className="flex items-center gap-1.5">
                  {sampleTestCases.map((tc, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedCaseIdx(idx)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border transition-colors ${
                        selectedCaseIdx === idx
                          ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40'
                          : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] border-[var(--surface-border)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      Case {idx + 1}
                    </button>
                  ))}
                </div>

                {sampleTestCases[selectedCaseIdx] ? (
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Input</span>
                      <pre className="flex-1 p-2 rounded-lg bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-[var(--text-primary)] overflow-auto whitespace-pre-wrap">
                        {sampleTestCases[selectedCaseIdx].input || '(empty)'}
                      </pre>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Expected Output</span>
                      <pre className="flex-1 p-2 rounded-lg bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-emerald-400 overflow-auto whitespace-pre-wrap">
                        {sampleTestCases[selectedCaseIdx].expectedOutput}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-[var(--text-muted)] text-center py-6">No sample test cases available.</div>
                )}
              </div>
            )}

            {drawerTab === 'custom' && (
              <div className="h-full flex flex-col space-y-1">
                <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Standard Input (stdin):</span>
                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Enter custom test input here, then click 'Run Code'..."
                  className="flex-1 w-full p-2.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] font-mono text-xs resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}

            {drawerTab === 'output' && (
              <div className="space-y-3">
                {/* Test results from submission or run */}
                {testResults && testResults.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-[var(--surface-border)]">
                      <div className="flex items-center gap-2">
                        {testResults.every((r: any) => r.passed) ? (
                          <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
                            <CheckCircle2 size={16} />
                            Accepted
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-rose-400 font-bold text-sm">
                            <XCircle size={16} />
                            Failed ({testResults.filter((r: any) => r.passed).length}/{testResults.length} Passed)
                          </span>
                        )}
                      </div>
                      {executionTimeMs !== undefined && (
                        <span className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)] font-medium">
                          <Clock size={12} />
                          Runtime: {executionTimeMs} ms
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      {testResults.map((result: any, idx: number) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-lg border text-xs ${
                            result.passed
                              ? 'bg-emerald-500/10 border-emerald-500/30'
                              : 'bg-rose-500/10 border-rose-500/30'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-[var(--text-primary)]">
                              Test Case {idx + 1} {result.isHidden ? '(Server Hidden)' : ''}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              result.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}>
                              {result.passed ? 'PASSED' : result.timedOut ? 'TIME LIMIT EXCEEDED' : result.compileError ? 'COMPILATION ERROR' : 'WRONG ANSWER'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <span className="text-[10px] text-[var(--text-muted)] block">Input:</span>
                              <pre className="text-[var(--text-secondary)] whitespace-pre-wrap">{result.input || '(empty)'}</pre>
                            </div>
                            <div>
                              <span className="text-[10px] text-[var(--text-muted)] block">Expected Output:</span>
                              <pre className="text-emerald-400 whitespace-pre-wrap">{result.expectedOutput}</pre>
                            </div>
                            <div>
                              <span className="text-[10px] text-[var(--text-muted)] block">Your Output:</span>
                              <pre className="text-[var(--text-primary)] whitespace-pre-wrap">{result.actualOutput || '(no output)'}</pre>
                            </div>
                          </div>

                          {result.error && (
                            <div className="mt-1.5 pt-1.5 border-t border-rose-500/20 text-rose-400">
                              <span className="text-[10px] font-bold block">Error / Diagnosis:</span>
                              <pre className="whitespace-pre-wrap">{result.error}</pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : runError ? (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <AlertTriangle size={14} />
                      Execution Error
                    </div>
                    <pre className="whitespace-pre-wrap text-xs text-rose-300">{runError}</pre>
                  </div>
                ) : runOutput ? (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Program Output (stdout):</span>
                    <pre className="p-2.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--surface-border)] text-emerald-400 whitespace-pre-wrap">
                      {runOutput}
                    </pre>
                  </div>
                ) : (
                  <div className="text-[var(--text-muted)] text-center py-6">
                    Click "Run Code" or "Submit" to execute your program against the judging environment.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CodeEditor;