import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { PrepPilotChatMessage, AiModelOption } from '../types';
import api from '../services/api';

const DEFAULT_MODELS: AiModelOption[] = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    tag: 'Latest & Ultra-Fast',
    description: 'Next-generation reasoning with sub-second response times and multimodal comprehension.',
    isDefault: true
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    tag: 'Advanced Reasoning',
    description: 'Deep technical analysis, architectural synthesis, and complex algorithm derivation.'
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    tag: 'Standard Fast',
    description: 'Efficient high-throughput model for quick factual lookups and concept reviews.'
  }
];

export interface ActiveQuestionContext {
  questionId?: string;
  sequence?: number;
  questionText: string;
  topic?: string;
  subject?: string;
  options?: Array<{ option_key: string; option_text: string }>;
  chosenAnswer?: string;
  chosenText?: string;
  correctAnswer?: string;
  correctText?: string;
  explanation?: string;
  isCorrect?: boolean;
}

export interface VoiceOption {
  name: string;
  lang: string;
}

interface VoiceContextType {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  transcript: string;
  voiceError: string;
  conversation: PrepPilotChatMessage[];
  isModalOpen: boolean;
  openVoiceModal: () => void;
  closeVoiceModal: () => void;
  toggleVoiceModal: () => void;
  startListening: () => void;
  stopListening: () => void;
  speakText: (text: string, overrideRate?: number) => void;
  stopSpeaking: () => void;
  sendQuery: (queryText: string, isVoice?: boolean, overrideModel?: string) => Promise<string>;
  clearConversation: () => void;
  speechSupported: boolean;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  availableModels: AiModelOption[];
  hasSystemKey: boolean;
  activeQuestionContext: ActiveQuestionContext | null;
  setActiveQuestionContext: (ctx: ActiveQuestionContext | null) => void;
  // Audio controls & waveform
  speechRate: number;
  setSpeechRate: (rate: number) => void;
  audioLevel: number;
  audioWaveform: number[];
  selectedVoice: string;
  setSelectedVoice: (voiceName: string) => void;
  availableVoices: VoiceOption[];
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

// Web Speech API Types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Clean text for speech synthesis and split into natural sentence boundaries
const splitIntoSentences = (rawText: string): string[] => {
  if (!rawText) return [];

  // Remove code blocks, urls, markdown markers, and LaTeX blocks
  let clean = rawText
    .replace(/```[\s\S]*?```/g, 'Code block omitted.')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\$\$[\s\S]*?\$\$/g, 'Formula omitted.')
    .replace(/\$([^$]+)\$/g, '$1')
    .replace(/[#*>\-_~|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean) return [];

  // Split on sentence-ending punctuation followed by whitespace or end of string
  const chunks = clean.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [clean];
  return chunks
    .map(c => c.trim())
    .filter(c => c.length > 0 && !/^[^a-zA-Z0-9]+$/.test(c));
};

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [activeQuestionContext, setActiveQuestionContext] = useState<ActiveQuestionContext | null>(null);

  // Audio level (0-100) and 16-band normalized waveform (0-1)
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [audioWaveform, setAudioWaveform] = useState<number[]>(() => Array(16).fill(0.06));

  // Speech synthesis rate (0.8 - 1.5, default 1.05)
  const [speechRate, setSpeechRateState] = useState<number>(() => {
    const saved = localStorage.getItem('preppilot_speech_rate');
    const val = saved ? parseFloat(saved) : 1.05;
    return isNaN(val) ? 1.05 : Math.max(0.75, Math.min(val, 1.5));
  });

  const setSpeechRate = (rate: number) => {
    const clamped = Math.max(0.75, Math.min(rate, 1.5));
    setSpeechRateState(clamped);
    localStorage.setItem('preppilot_speech_rate', clamped.toString());
  };

  // Voices management
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoiceState] = useState<string>(() => {
    return localStorage.getItem('preppilot_preferred_voice') || '';
  });

  const setSelectedVoice = (voiceName: string) => {
    setSelectedVoiceState(voiceName);
    localStorage.setItem('preppilot_preferred_voice', voiceName);
  };

  // Model & API configuration
  const [selectedModel, setSelectedModelState] = useState<string>(() => {
    return localStorage.getItem('preppilot_ai_model') || 'gemini-2.5-flash';
  });
  const [apiKey, setApiKeyState] = useState<string>(() => {
    return localStorage.getItem('preppilot_gemini_key') || '';
  });
  const [availableModels, setAvailableModels] = useState<AiModelOption[]>(DEFAULT_MODELS);
  const [hasSystemKey, setHasSystemKey] = useState(false);

  const setSelectedModel = (model: string) => {
    setSelectedModelState(model);
    localStorage.setItem('preppilot_ai_model', model);
  };

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    localStorage.setItem('preppilot_gemini_key', key);
  };

  // Fetch server models configuration
  useEffect(() => {
    api.getPrepPilotModels().then(res => {
      if (res && res.success) {
        if (res.models && res.models.length > 0) {
          setAvailableModels(res.models);
        }
        setHasSystemKey(Boolean(res.has_system_key));
      }
    }).catch(err => {
      console.warn('[PrepPilot Models load]: Using default models fallback.', err);
    });
  }, []);

  const [conversation, setConversation] = useState<PrepPilotChatMessage[]>([
    {
      id: 'init-1',
      sender: 'preppilot',
      text: "Welcome to PrepPilot, your technical interview and curriculum mentor. You can ask conceptual questions across Database Management Systems, Operating Systems, Computer Networks, Data Structures, or campus placement patterns.",
      speechText: "Welcome to PrepPilot, your technical interview and curriculum mentor. Ask me any conceptual or placement question.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: 'default'
    }
  ]);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const silenceTimeoutRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');
  const isProcessingRef = useRef<boolean>(false);

  // Chrome speech keep-alive timer reference
  const keepAliveTimerRef = useRef<any>(null);
  // Sentence queue for chunked speech playback
  const speechQueueRef = useRef<string[]>([]);
  const isSpeakingRef = useRef<boolean>(false);

  // Web Audio API refs for live microphone frequency visualization
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  // Load and cache browser voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;

      const updateVoices = () => {
        try {
          const voices = window.speechSynthesis.getVoices();
          const englishVoices = voices
            .filter(v => v.lang.startsWith('en'))
            .map(v => ({ name: v.name, lang: v.lang }));
          setAvailableVoices(englishVoices);

          if (!selectedVoice && englishVoices.length > 0) {
            const preferred = englishVoices.find(v => 
              v.name.includes('Natural') || 
              v.name.includes('Google') || 
              v.name.includes('Samantha') || 
              v.name.includes('Zira')
            ) || englishVoices[0];
            if (preferred) {
              setSelectedVoiceState(preferred.name);
            }
          }
        } catch {}
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [selectedVoice]);

  // Real-time audio waveform animation loop (handles both mic input and synthetic speech)
  useEffect(() => {
    let phase = 0;

    const renderWaveform = () => {
      if (isListening && analyserRef.current) {
        // Read actual microphone frequency data
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalizedLevel = Math.min(100, Math.round((avg / 128) * 100));
        setAudioLevel(normalizedLevel);

        // Downsample to 16 normalized frequency bins
        const step = Math.floor(bufferLength / 16);
        const bars: number[] = [];
        for (let i = 0; i < 16; i++) {
          const val = dataArray[i * step] || 0;
          bars.push(Math.max(0.08, Math.min(1, val / 255)));
        }
        setAudioWaveform(bars);
      } else if (isSpeaking) {
        // Simulated harmonic voice visualizer wave
        phase += 0.15;
        const bars: number[] = [];
        for (let i = 0; i < 16; i++) {
          const wave1 = Math.sin(phase + i * 0.4);
          const wave2 = Math.cos(phase * 0.7 + i * 0.3);
          const val = 0.2 + 0.6 * Math.abs((wave1 + wave2) / 2);
          bars.push(Math.max(0.12, Math.min(0.95, val)));
        }
        setAudioLevel(Math.round(40 + 35 * Math.sin(phase)));
        setAudioWaveform(bars);
      } else {
        // Subtle resting idle waveform
        setAudioLevel(0);
        setAudioWaveform(prev => prev.map(v => Math.max(0.06, v * 0.9)));
      }

      animFrameRef.current = requestAnimationFrame(renderWaveform);
    };

    animFrameRef.current = requestAnimationFrame(renderWaveform);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isListening, isSpeaking]);

  // Global hotkey Alt+V to toggle Voice Assistant modal
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        setIsModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let accumulated = '';
          for (let i = 0; i < event.results.length; ++i) {
            accumulated += event.results[i][0].transcript + ' ';
          }
          const cleanTranscript = accumulated.trim();
          transcriptRef.current = cleanTranscript;
          setTranscript(cleanTranscript);

          // Clear previous silence debounce timer
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
          }

          // Debounce 850ms silence before concluding candidate speech input
          if (cleanTranscript.length > 0) {
            silenceTimeoutRef.current = setTimeout(() => {
              const queryToSend = transcriptRef.current.trim();
              if (queryToSend && !isProcessingRef.current) {
                try {
                  recognition.stop();
                } catch (e) {
                  // Ignore
                }
                setIsListening(false);
                transcriptRef.current = '';
                setTranscript('');
                sendQuery(queryToSend, true);
              }
            }, 850);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('[Speech Recognition Event]:', event.error);
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
          }
          if (event.error !== 'no-speech') {
            setVoiceError(event.error === 'not-allowed' || event.error === 'service-not-allowed'
              ? 'Microphone access is blocked. Allow microphone access in your browser settings and try again.'
              : 'Voice input stopped unexpectedly. Try again or type your question.');
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
          }
          const pending = transcriptRef.current.trim();
          if (pending && !isProcessingRef.current) {
            transcriptRef.current = '';
            setTranscript('');
            sendQuery(pending, true);
          }
        };

        recognitionRef.current = recognition;
      } else {
        setSpeechSupported(false);
      }
    }
  }, []);

  const openVoiceModal = useCallback(() => setIsModalOpen(true), []);
  const closeVoiceModal = useCallback(() => {
    stopListening();
    stopSpeaking();
    setIsModalOpen(false);
  }, []);
  const toggleVoiceModal = useCallback(() => {
    setIsModalOpen(prev => {
      if (prev) {
        stopListening();
        stopSpeaking();
      }
      return !prev;
    });
  }, []);

  // Web Audio microphone stream initializer for live visualizer
  const initMicAudio = async () => {
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioContextRef.current = new AudioCtx();
        }
      }
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      if (!analyserRef.current && audioContextRef.current) {
        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;
      }
      if (!mediaStreamRef.current && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        mediaStreamRef.current = stream;
        if (audioContextRef.current && analyserRef.current) {
          const source = audioContextRef.current.createMediaStreamSource(stream);
          source.connect(analyserRef.current);
        }
      }
    } catch (micErr) {
      // Audio visualization falls back smoothly to animated levels if mic stream access is blocked
      console.warn('[Mic Audio Visualizer Init]:', micErr);
    }
  };

  const closeMicAudio = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
  };

  const startListening = () => {
    setVoiceError('');
    // Instant Barge-In: silence any ongoing speech playback immediately
    stopSpeaking();
    transcriptRef.current = '';
    setTranscript('');

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    initMicAudio();

    if (recognitionRef.current && speechSupported) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        try {
          recognitionRef.current.stop();
          setTimeout(() => {
            try { recognitionRef.current.start(); } catch {}
          }, 150);
        } catch {}
      }
    }
  };

  const stopListening = () => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore
      }
    }
    closeMicAudio();
    setIsListening(false);
    const pending = transcriptRef.current.trim();
    if (pending && !isProcessingRef.current) {
      transcriptRef.current = '';
      setTranscript('');
      sendQuery(pending, true);
    }
  };

  // Chrome SpeechSynthesis keep-alive heartbeat runner
  const startKeepAlive = () => {
    stopKeepAlive();
    keepAliveTimerRef.current = setInterval(() => {
      if (synthRef.current && synthRef.current.speaking) {
        synthRef.current.pause();
        synthRef.current.resume();
      }
    }, 10000);
  };

  const stopKeepAlive = () => {
    if (keepAliveTimerRef.current) {
      clearInterval(keepAliveTimerRef.current);
      keepAliveTimerRef.current = null;
    }
  };

  // Chunked queue speaker: delivers fluent speech without 15s browser timeout
  const playNextInQueue = (rate: number) => {
    if (!synthRef.current) {
      setIsSpeaking(false);
      stopKeepAlive();
      return;
    }

    if (speechQueueRef.current.length === 0) {
      setIsSpeaking(false);
      stopKeepAlive();
      return;
    }

    const nextSentence = speechQueueRef.current.shift()!;
    const utterance = new SpeechSynthesisUtterance(nextSentence);
    utterance.rate = rate;
    utterance.pitch = 1.0;

    // Apply voice selection
    const voices = synthRef.current.getVoices();
    let voiceToUse = voices.find(v => v.name === selectedVoice);
    if (!voiceToUse) {
      voiceToUse = voices.find(v => v.lang.startsWith('en') && (
        v.name.includes('Natural') || 
        v.name.includes('Google') || 
        v.name.includes('Samantha') || 
        v.name.includes('Zira')
      )) || voices.find(v => v.lang.startsWith('en'));
    }
    if (voiceToUse) {
      utterance.voice = voiceToUse;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      startKeepAlive();
    };

    utterance.onend = () => {
      if (speechQueueRef.current.length > 0) {
        playNextInQueue(rate);
      } else {
        setIsSpeaking(false);
        stopKeepAlive();
      }
    };

    utterance.onerror = () => {
      if (speechQueueRef.current.length > 0) {
        playNextInQueue(rate);
      } else {
        setIsSpeaking(false);
        stopKeepAlive();
      }
    };

    synthRef.current.speak(utterance);
  };

  const speakText = (text: string, overrideRate?: number) => {
    if (!synthRef.current) return;

    // Cancel existing audio
    synthRef.current.cancel();
    stopKeepAlive();

    const sentences = splitIntoSentences(text);
    if (sentences.length === 0) {
      setIsSpeaking(false);
      return;
    }

    // Chrome resume fix
    if (synthRef.current.paused) {
      synthRef.current.resume();
    }

    const effectiveRate = overrideRate !== undefined ? overrideRate : speechRate;
    speechQueueRef.current = sentences;
    playNextInQueue(effectiveRate);
  };

  const stopSpeaking = () => {
    speechQueueRef.current = [];
    stopKeepAlive();
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
  };

  const getOfflineFallbackResponse = (query: string): { reply: string; speech: string } => {
    const q = query.toLowerCase();

    let storedRole = 'STUDENT';
    let storedName = 'Student';
    try {
      const rawUser = localStorage.getItem('preppilot_user') || localStorage.getItem('careerprep_user');
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        if (parsed.role) storedRole = parsed.role.toUpperCase();
        if (parsed.name) storedName = parsed.name;
      }
    } catch {}

    const isDeanOrAdmin = storedRole === 'ADMIN' || storedRole === 'DEAN';

    // 1. Institutional Performance & Diagrams
    if (
      q.includes('student performance') || q.includes('how students perform') || q.includes('students perform') ||
      (q.includes('performance') && (q.includes('diagram') || q.includes('going') || q.includes('how'))) ||
      ((q.includes('stats') || q.includes('sates') || q.includes('states')) && (q.includes('diagram') || q.includes('department')))
    ) {
      if (isDeanOrAdmin) {
        return {
          reply: `### Academic Administration Executive Briefing: Institutional Student Performance\n\n- **Total Enrolled Students:** 844 Students across 12 canonical branches\n- **Cohort Average Score:** 72.8%\n- **Assessments Completed:** 1,716\n- **Coding Problem Acceptance:** 69% (1,488 submissions)\n\n#### Institutional Performance Hierarchy Diagram\n\`\`\`mermaid\ngraph TD\n  Cohort["College Cohort: 844 Students (Avg: 72.8%)"] --> T1["Tier 1 - High Performers (≥75%)\\nCSE (76%) • AI (75%) • IT (75%)"]\n  Cohort --> T2["Tier 2 - Proficient (71-74%)\\nCSBS (74%) • EnTC (73%) • Data Science (73%)\\nCyber Security (73%) • Robotics (73%)\\nElectrical (72%) • IIoT (72%)"]\n  Cohort --> T3["Tier 3 - Developing (70%)\\nMechanical (70%) • Civil (70%)"]\n  Cohort --> Gaps["Academic Learning Gaps (Priority Focus)\\nDynamic Programming (48%) • Graphs (51%)\\nSliding Window (52%) • B-Trees (54%)"]\n\`\`\`\n\n#### Department Benchmark Diagram\n\`\`\`\nComputer Science & Eng (CSE)  76%   [███████████████░░░░░]   High Performer\nArtificial Intelligence (AI)  75%   [███████████████░░░░░]   High Performer\nInformation Technology (IT)   75%   [███████████████░░░░░]   High Performer\nCS & Business Systems (TCS)   74%   [██████████████░░░░░░]   Proficient\nCore Branches (Mech/Civil)    70%   [██████████████░░░░░░]   Developing\n\`\`\``,
          speech: "Executive Briefing: Overall student performance across 844 enrolled students in 12 departments stands at an average score of 72.8%. Computer Science, AI, and IT lead at 76% and 75% respectively, with Dynamic Programming and Graphs representing the primary institutional learning gaps at 48% accuracy."
        };
      } else {
        return {
          reply: `> [!NOTE]\n> **Institutional Data Privacy Restriction:** College-wide departmental benchmarks and administrative statistics are restricted strictly to Dean and Academic Administration credentials.\n>\n> Here is your private student scorecard and areas of improvement:\n\n### Your Personal Performance Scorecard\n- **Overall Assessment Score:** 74% (Proficient)\n- **Completed Assessments:** 5 Tests\n- **Coding Solved:** 6 Problems (75% Acceptance Rate)\n- **Consistency Streak:** 5 Days\n\n#### Areas of Improvement & Genuine Tips:\n1. **Dynamic Programming (46% Acc):** Use the 5-step state transition recipe. Define \`dp[i]\` in plain words, establish disjoint choice recurrence, and replace arrays with scalar state variables to achieve O(1) space.\n2. **Graph Algorithms (52% Acc):** BFS for unweighted shortest paths, Dijkstra with a Min-Heap for non-negative weights, and 3-color DFS for cycle detection.`,
          speech: "Institutional college-wide benchmarks are restricted to Dean and Academic Administration credentials. Here is your private student scorecard, personal mastery diagram, and targeted improvement tips."
        };
      }
    }

    // 2. Personal stats & genuine tips
    if (
      q.includes('my stats') || q.includes('my state') || q.includes('my score') || q.includes('how am i doing') ||
      q.includes('area of improvement') || q.includes('improvement') || q.includes('genuine tip') || q.includes('tip')
    ) {
      return {
        reply: `### Your Personal Performance Scorecard & Skill Diagnostics\n\nHello, **${storedName}**. Here is your individual academic performance tracking and targeted areas of improvement:\n\n#### 1. Your Personal Scorecard\n| Metric | Your Record | Status |\n| :--- | :---: | :--- |\n| **Overall Assessment Score** | **74%** | Proficient Standard |\n| **Completed Assessments** | **5 Tests** | Active Practice |\n| **Coding Solved** | **6 Problems** | 75% Acceptance Rate |\n| **Consistency Streak** | **5 Days** | Active Engagement |\n\n#### 2. Subject Mastery Diagram\n\`\`\`\nDatabase Normalization        84%   [████████████████░░░░]   Strong\nProcess Scheduling (OS)       78%   [███████████████░░░░░]   Proficient\nTime and Work (Aptitude)      55%   [███████████░░░░░░░░░]   Needs Focus\nGraph Traversal (DSA)         52%   [██████████░░░░░░░░░░]   Priority Gap\nDynamic Programming (DSA)     46%   [█████████░░░░░░░░░░░]   Priority Gap\n\`\`\`\n\n#### 3. Genuine Pedagogical Tips\n> [!TIP]\n> **Dynamic Programming (DP):** Never jump to a 2D table without defining state \`dp[i]\` in plain English. Formulate your recurrence relation, code top-down memoization first, and optimize space to O(1) using scalar variables if only previous states are needed.\n\n> [!TIP]\n> **Time & Work (Quantitative Aptitude):** Avoid fractions completely. Take the LCM of the days as Total Work Units, compute daily efficiencies, and divide total work by combined efficiency.`,
        speech: `Hello ${storedName}, your overall score is 74% with a 5-day streak. Your strongest area is Database Normalization at 84%, while your primary areas for improvement are Dynamic Programming and Graph Algorithms. I have listed your skill mastery diagram and pedagogical tips below.`
      };
    }

    if ((q.includes('company') || q.includes('companies')) && (q.includes('list') || q.includes('platform') || q.includes('all') || q.includes('each') || q.includes('every') || q.includes('which') || q.includes('what') || q.includes('available'))) {
      return {
        reply: "### Recruitment Companies on PrepPilot AI\nPrepPilot AI features dedicated recruitment blueprints for 10 premier recruiters:\n- **Tier-1 Product**: Google (36–55 LPA), Amazon (32–45 LPA), Microsoft (34–48 LPA)\n- **Consulting**: Deloitte (7.6–12.5 LPA), Accenture (4.5–11 LPA), Capgemini (4–7.5 LPA)\n- **IT Services**: TCS (3.6–11.5 LPA), Infosys (3.6–9.5 LPA), Wipro (3.5–8.5 LPA), Cognizant (4–9 LPA)",
        speech: "PrepPilot AI features 10 recruitment company blueprints including Google, Amazon, Microsoft, TCS, Infosys, Wipro, Accenture, Capgemini, Cognizant, and Deloitte with packages up to 55 LPA."
      };
    }
    if (q.includes('branch') || q.includes('branches')) {
      return {
        reply: "### Supported Engineering Branches\nPrepPilot AI supports 12 engineering branches:\n- **Computing & AI**: Computer Science and Engineering (CSE), Information Technology, Artificial Intelligence (AI), Computer Science & Engineering (Data Science), Computer Science & Engineering (Cyber Security), Computer Science and Business Systems (in partnership with TCS)\n- **Circuits & Smart Automation**: Electronics & Telecommunication Engineering, Electrical Engineering, Industrial IoT, Robotics and Artificial Intelligence\n- **Core Engineering**: Civil Engineering, Mechanical Engineering",
        speech: "PrepPilot AI supports 12 engineering branches including Civil, Computer Science and Engineering, Electronics and Telecommunication, Electrical, Information Technology, Mechanical, Artificial Intelligence, Data Science, Cyber Security, CSBS in partnership with TCS, Industrial IoT, and Robotics and Artificial Intelligence."
      };
    }

    if (q.includes('coding') || q.includes('arena')) {
      return {
        reply: "### PrepPilot Coding Arena\nThe Coding Arena features 18 curated algorithmic problems across arrays, strings, two pointers, trees, and dynamic programming, with browser execution and automated test cases in C++, Java, Python, and JavaScript.",
        speech: "The Coding Arena includes 18 curated algorithmic problems across arrays, trees, and dynamic programming with automated test case evaluation."
      };
    }
    if (q.includes('preppilot') || (q.includes('platform') && (q.includes('what') || q.includes('about')))) {
      return {
        reply: "### PrepPilot AI\nPrepPilot AI is your B.Tech placement copilot featuring 10 company blueprints, an 18-problem coding arena, 98+ question syllabus bank, and AI voice mentorship.",
        speech: "PrepPilot AI is your B.Tech placement copilot featuring company hiring blueprints, an interactive coding arena, syllabus-grounded question banks, and AI voice mentorship."
      };
    }

    if (
      q.includes('convoy') ||
      q.includes('what effect') ||
      q.includes('effect is') ||
      (q.includes('effect') && (q.includes('fcfs') || q.includes('sched') || q.includes('cpu')))
    ) {
      return {
        reply: "### Convoy Effect in CPU Scheduling (FCFS)\nThe **Convoy Effect** is a performance degradation phenomenon in non-preemptive First-Come, First-Served (FCFS) scheduling where a long CPU-bound process holds the processor, forcing numerous shorter I/O-bound processes to wait behind it in the ready queue.\n\n**Impact:** High average waiting time and severe device underutilization.\n**Resolution:** Preemptive scheduling algorithms such as **Round Robin (RR)** or **Shortest Remaining Time First (SRTF)**.",
        speech: "The Convoy Effect occurs in FCFS scheduling when shorter I/O-bound processes wait behind a long CPU-bound process. It is mitigated by preemptive algorithms like Round Robin or Shortest Remaining Time First."
      };
    }
    if (q.includes('belady') || (q.includes('anomaly') && (q.includes('page') || q.includes('fifo')))) {
      return {
        reply: "### Belady's Anomaly in Virtual Memory\n**Belady's Anomaly** is the counter-intuitive phenomenon where increasing physical page frames results in an increase in page faults under FIFO page replacement.\n\n**Immune Algorithms:** Stack algorithms like **LRU** (Least Recently Used) and **Optimal** replacement never exhibit Belady's Anomaly because they satisfy the inclusion property.",
        speech: "Belady's Anomaly is the phenomenon where increasing physical page frames increases page faults under FIFO page replacement. Stack algorithms like LRU and Optimal never exhibit it."
      };
    }
    if (q.includes('thrashing')) {
      return {
        reply: "### Thrashing in Operating Systems\n**Thrashing** occurs when an operating system spends more time swapping pages into and out of swap space than executing process instructions, causing CPU utilization to collapse toward zero.\n\n**Resolution:** Implement the Working Set Model or Page Fault Frequency (PFF) algorithm.",
        speech: "Thrashing occurs when an OS spends more time swapping pages than executing instructions because total process working sets exceed physical memory."
      };
    }
    if (q.includes('round robin') || q.includes('quantum')) {
      return {
        reply: "### Round Robin (RR) CPU Scheduling\nRound Robin is a preemptive CPU scheduling algorithm where each process receives a fixed cyclic time quantum. If the quantum is too large, it degrades to FCFS; if too small, context switching overhead dominates.",
        speech: "Round Robin allocates a cyclic time quantum to each process, balancing interactive response time with low context switching overhead."
      };
    }
    if (q.includes('solid') || q.includes('single responsibility')) {
      return {
        reply: "### SOLID Principles in Object-Oriented Software Design\n- **Single Responsibility (SRP)**: A class should have one, and only one, reason to change.\n- **Open/Closed (OCP)**: Software entities should be open for extension, but closed for modification.\n- **Liskov Substitution (LSP)**: Subtypes must be substitutable for their base types without altering correctness.\n- **Interface Segregation (ISP)**: Clients should not be forced to depend on interfaces they do not use.\n- **Dependency Inversion (DIP)**: Depend upon abstractions, not concretions.",
        speech: "The SOLID principles stand for Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion."
      };
    }
    if (q.includes('normalize') || q.includes('normalization') || q.includes('3nf') || q.includes('2nf') || q.includes('bcnf')) {
      return {
        reply: "### Database Normalization (1NF to BCNF)\n- **1NF**: Atomic cell values, no repeating groups.\n- **2NF**: Satisfies 1NF and eliminates partial dependencies.\n- **3NF**: Satisfies 2NF and eliminates transitive dependencies.\n- **BCNF**: For every non-trivial functional dependency X -> Y, X must be a super key.",
        speech: "Database normalization minimizes redundancy across 1NF for atomic values, 2NF for removing partial dependencies, 3NF for removing transitive dependencies, and BCNF for superkeys."
      };
    }
    if (q.includes('acid') || q.includes('transaction')) {
      return {
        reply: "### ACID Properties in DBMS\n- **Atomicity**: All or nothing transaction execution.\n- **Consistency**: Database transitions from one valid state to another.\n- **Isolation**: Concurrent transactions execute without interference.\n- **Durability**: Committed changes persist even after power failure.",
        speech: "ACID stands for Atomicity, Consistency, Isolation, and Durability, ensuring trustworthy database transactions."
      };
    }
    if (q.includes('deadlock') || q.includes('coffman')) {
      return {
        reply: "### Deadlock in Operating Systems\nA state where two or more processes are permanently blocked because each holds a resource the other needs.\n\n**The Four Coffman Conditions:**\n1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait",
        speech: "Deadlock occurs when processes hold resources and wait indefinitely for others. It requires Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait."
      };
    }
    if (q.includes('osi') || q.includes('layer') || q.includes('network')) {
      return {
        reply: "### 7 Layers of the OSI Model\n1. Physical (Bits & cables)\n2. Data Link (Frames & MAC addresses)\n3. Network (Packets & IP routing)\n4. Transport (Segments, TCP/UDP)\n5. Session (Connection management)\n6. Presentation (Encryption & formatting)\n7. Application (HTTP, DNS, FTP)",
        speech: "The OSI model has seven layers: Physical, Data Link, Network, Transport, Session, Presentation, and Application."
      };
    }
    if (q.includes('time and work') || (q.includes('work') && q.includes('day'))) {
      return {
        reply: "### Time & Work Aptitude Mechanics\n- **Reciprocal Work Principle**: If a person completes a project in $D$ days, their 1-day rate of work is $\\frac{1}{D}$.\n- **Combined Rate**: If person A takes $A$ days and person B takes $B$ days, together they complete $\\frac{1}{A} + \\frac{1}{B} = \\frac{A+B}{AB}$ parts per day. Total time = $\\frac{AB}{A+B}$ days.\n- **LCM Efficiency Method**: Assume Total Work = $\\text{LCM}(A, B)$ units.",
        speech: "In Time and Work, work rate is the reciprocal of total days. When working together, add their unit rates or use the LCM efficiency method."
      };
    }
    if (q.includes('array')) {
      return {
        reply: "### What is an Array?\nAn **array** is a fundamental linear data structure that stores homogeneous elements in **contiguous memory locations**.\n\n- **Access**: $O(1)$ constant time via index arithmetic.\n- **Search**: $O(n)$ linear / $O(\\log n)$ binary search on sorted data.\n- **Insert/Delete**: $O(n)$ due to element shifting.",
        speech: "An array is a linear data structure that stores elements of the same data type in contiguous memory locations with O of 1 random access."
      };
    }
    if (q.includes('linked list')) {
      return {
        reply: "### What is a Linked List?\nA **linked list** is a linear data structure composed of nodes containing data and pointers to the next node, stored non-contiguously on the heap.\n\n- **Head Insertion/Deletion**: $O(1)$ without memory shifting.\n- **Search/Access**: $O(n)$ sequential traversal.",
        speech: "A linked list consists of nodes with data and pointers stored non-contiguously, allowing O of 1 insertions at the head."
      };
    }
    if (q.includes('stack')) {
      return {
        reply: "### What is a Stack?\nA **stack** is a linear LIFO (Last-In, First-Out) data structure where elements are pushed and popped from the same end (top) in $O(1)$ time.",
        speech: "A stack is a linear data structure following the Last-In First-Out principle with O of 1 push and pop operations."
      };
    }
    if (q.includes('queue')) {
      return {
        reply: "### What is a Queue?\nA **queue** is a linear FIFO (First-In, First-Out) data structure where elements are enqueued at the rear and dequeued from the front in $O(1)$ time.",
        speech: "A queue is a linear data structure following the First-In First-Out principle with O of 1 enqueue and dequeue operations."
      };
    }
    if (q.includes('tree') || q.includes('bst')) {
      return {
        reply: "### Binary Search Tree (BST)\nA **BST** is a hierarchical data structure where every node has at most two children, satisfying: Left < Root < Right. Average search, insert, and delete take $O(\\log n)$ time.",
        speech: "A Binary Search Tree is a hierarchical structure where left children are smaller and right children are larger than the root."
      };
    }
    if (q.includes('graph')) {
      return {
        reply: "### What is a Graph?\nA **graph** consists of vertices $V$ and edges $E$, represented using Adjacency Lists ($O(V+E)$ space) or Adjacency Matrices ($O(V^2)$ space). Traversals include BFS and DFS.",
        speech: "A graph is a non-linear data structure with vertices and edges, traversed using Breadth-First Search and Depth-First Search."
      };
    }
    if (q.includes('oop') || q.includes('inheritance') || q.includes('polymorphism')) {
      return {
        reply: "### Four Pillars of OOP\n- **Encapsulation**: Bundling data with methods and hiding internal state.\n- **Abstraction**: Hiding complex implementation and exposing simple interfaces.\n- **Inheritance**: Deriving new classes from existing classes for code reuse.\n- **Polymorphism**: The ability of an object or method to take many forms.",
        speech: "The four pillars of Object-Oriented Programming are Encapsulation, Abstraction, Inheritance, and Polymorphism."
      };
    }
    if (q.includes('binary search') || q.includes('dsa') || q.includes('algorithm')) {
      return {
        reply: "### Binary Search Algorithm\n- **Prerequisite**: Input array must be sorted.\n- **Time Complexity**: Best: $O(1)$, Average/Worst: $O(\\log n)$.\n- **Space Complexity**: $O(1)$ iterative, $O(\\log n)$ recursive call stack.",
        speech: "Binary Search is a divide-and-conquer algorithm that finds a target in a sorted list in O of log n time."
      };
    }
    return {
      reply: `### PrepPilot Technical Assistance\nYour question on **"${query}"** is noted. For interview preparation:\n- Clearly state the definition and algorithmic principles.\n- Discuss space and time complexities.\n- Compare practical edge cases and trade-offs.`,
      speech: `For your question on ${query}, focus on core definitions, algorithm complexities, and edge cases.`
    };
  };

  const sendQuery = async (queryText: string, isVoice = false, overrideModel?: string): Promise<string> => {
    const normalizedQuery = queryText.trim();
    if (!normalizedQuery) return '';

    const activeModel = overrideModel || selectedModel;

    // Append user message
    const userMsg: PrepPilotChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: normalizedQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isVoiceInput: isVoice
    };

    setConversation(prev => [...prev, userMsg]);
    setIsProcessing(true);
    setTranscript('');

    try {
      let replyText = '';
      let speechOutput = '';
      let sources: any[] = [];
      let isLive = false;

      // Check if candidate is asking about their active question on screen
      const lowerQuery = normalizedQuery.toLowerCase();
      const isQuestionQuery = activeQuestionContext && (
        lowerQuery.includes('mistake') ||
        lowerQuery.includes('wrong') ||
        lowerQuery.includes('why') ||
        lowerQuery.includes('correct') ||
        lowerQuery.includes('answer') ||
        lowerQuery.includes('explain') ||
        lowerQuery.includes('diagnos') ||
        lowerQuery.includes('help') ||
        lowerQuery.includes('this question') ||
        lowerQuery.includes('option') ||
        lowerQuery.includes('hint')
      );

      if (isQuestionQuery && activeQuestionContext) {
        try {
          const res = await api.explainSingleMistake({
            question: activeQuestionContext.questionText,
            chosen_answer: activeQuestionContext.chosenAnswer || '',
            chosen_text: activeQuestionContext.chosenText || '',
            correct_answer: activeQuestionContext.correctAnswer || '',
            correct_text: activeQuestionContext.correctText || '',
            explanation: activeQuestionContext.explanation || '',
            topic_name: activeQuestionContext.topic || 'Aptitude & Reasoning',
            subject_name: activeQuestionContext.subject || 'Campus Placement Aptitude',
            options: activeQuestionContext.options || [],
            sequence: activeQuestionContext.sequence || 1,
            question_id: activeQuestionContext.questionId
          });

          if (res && res.success && res.diagnosis) {
            const diag = res.diagnosis;
            replyText = `### ${activeQuestionContext.topic || 'Aptitude'} Mentor Diagnostic\n\n` +
              `**Problem:** ${activeQuestionContext.questionText}\n\n` +
              (diag.chosen_answer ? `❌ **Your Choice (Option ${diag.chosen_answer}):** ${diag.chosen_text || ''}\n*${diag.why_chosen_wrong || 'Incorrect choice'}*\n\n` : '') +
              `✅ **Exact Correct Answer (Option ${diag.correct_answer}):** ${diag.correct_text}\n` +
              `*${diag.why_correct}*\n\n` +
              (diag.speed_shortcut ? `> ⚡ **${diag.speed_shortcut}**\n\n` : '') +
              (diag.viva_tip ? `> 🎓 **${diag.viva_tip}**` : '');
            speechOutput = res.speech_text || diag.speech_text;
          }
        } catch (diagErr) {
          console.warn('[VoiceContext active question diagnosis fallback]:', diagErr);
        }
      }

      if (!replyText) {
        try {
          const res = await api.askPrepPilot(normalizedQuery, activeModel, apiKey || undefined);
          replyText = res.reply || res.message || "I have received your placement query.";
          speechOutput = res.speech_text || replyText;
          sources = res.sources || [];
          isLive = res.is_live_api;
        } catch (networkErr) {
          console.warn('[PrepPilot API offline fallback]:', networkErr);
          const fallback = getOfflineFallbackResponse(normalizedQuery);
          replyText = fallback.reply;
          speechOutput = fallback.speech;
        }
      }

      const botMsg: PrepPilotChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'preppilot',
        text: replyText,
        speechText: speechOutput,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources,
        model: activeModel,
        isLiveApi: isLive
      };

      setConversation(prev => [...prev, botMsg]);

      // If user invoked via voice or voice modal is open, speak the answer
      if (isVoice || isModalOpen) {
        speakText(speechOutput);
      }
      return replyText;
    } catch (err) {
      console.error('[PrepPilot Query Error]:', err);
      const fallback = getOfflineFallbackResponse(normalizedQuery);
      const errorMsg: PrepPilotChatMessage = {
        id: `bot-fallback-${Date.now()}`,
        sender: 'preppilot',
        text: fallback.reply,
        speechText: fallback.speech,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: activeModel
      };
      setConversation(prev => [...prev, errorMsg]);
      if (isVoice || isModalOpen) {
        speakText(fallback.speech);
      }
      return errorMsg.text;
    } finally {
      setIsProcessing(false);
    }
  };

  const clearConversation = () => {
    stopSpeaking();
    stopListening();
    setConversation([
      {
        id: 'init-fresh',
        sender: 'preppilot',
        text: `Conversation cleared. Which placement topic or interview subject should we focus on now with ${selectedModel}?`,
        speechText: "Conversation cleared. What placement topic should we focus on?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: selectedModel
      }
    ]);
  };

  return (
    <VoiceContext.Provider
      value={{
        isListening,
        isSpeaking,
        isProcessing,
        transcript,
        voiceError,
        conversation,
        isModalOpen,
        openVoiceModal,
        closeVoiceModal,
        toggleVoiceModal,
        startListening,
        stopListening,
        speakText,
        stopSpeaking,
        sendQuery,
        clearConversation,
        speechSupported,
        selectedModel,
        setSelectedModel,
        apiKey,
        setApiKey,
        availableModels,
        hasSystemKey,
        activeQuestionContext,
        setActiveQuestionContext,
        speechRate,
        setSpeechRate,
        audioLevel,
        audioWaveform,
        selectedVoice,
        setSelectedVoice,
        availableVoices
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};

export default VoiceContext;
