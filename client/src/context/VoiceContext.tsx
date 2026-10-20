import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  speakText: (text: string) => void;
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
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

// Web Speech API Types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

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
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const silenceTimeoutRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');
  const isProcessingRef = useRef<boolean>(false);

  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  // Initialize Speech Recognition & Synthesis
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

      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
        window.speechSynthesis.onvoiceschanged = () => {
          try { window.speechSynthesis.getVoices(); } catch {}
        };
      }
    }
  }, []);

  const openVoiceModal = () => setIsModalOpen(true);
  const closeVoiceModal = () => {
    stopListening();
    stopSpeaking();
    setIsModalOpen(false);
  };
  const toggleVoiceModal = () => {
    if (isModalOpen) closeVoiceModal();
    else openVoiceModal();
  };

  const startListening = () => {
    setVoiceError('');
    stopSpeaking();
    transcriptRef.current = '';
    setTranscript('');
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
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
    setIsListening(false);
    const pending = transcriptRef.current.trim();
    if (pending && !isProcessingRef.current) {
      transcriptRef.current = '';
      setTranscript('');
      sendQuery(pending, true);
    }
  };

  const speakText = (text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    // Strip code blocks and markdown markers for clean speech playback
    const cleanSpeech = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/[#*`>_]/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    if (!cleanSpeech) return;

    // Chrome SpeechSynthesis resume fix
    if (synthRef.current.paused) {
      synthRef.current.resume();
    }

    let speechToRead = cleanSpeech;
    if (speechToRead.length > 500) {
      const sentenceEnd = speechToRead.lastIndexOf('.', 500);
      speechToRead = sentenceEnd > 150 ? speechToRead.slice(0, sentenceEnd + 1) : speechToRead.slice(0, 500);
    }

    const utterance = new SpeechSynthesisUtterance(speechToRead);
    activeUtteranceRef.current = utterance;
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    const voices = synthRef.current.getVoices();
    const englishVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      activeUtteranceRef.current = null;
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      activeUtteranceRef.current = null;
    };

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      activeUtteranceRef.current = null;
    }
  };

  const getOfflineFallbackResponse = (query: string): { reply: string; speech: string } => {
    const q = query.toLowerCase();

    if ((q.includes('company') || q.includes('companies')) && (q.includes('list') || q.includes('platform') || q.includes('all') || q.includes('each') || q.includes('every') || q.includes('which') || q.includes('what') || q.includes('available'))) {
      return {
        reply: "### Recruitment Companies on PrepPilot AI\nPrepPilot AI features dedicated recruitment blueprints for 10 premier recruiters:\n- **Tier-1 Product**: Google (36–55 LPA), Amazon (32–45 LPA), Microsoft (34–48 LPA)\n- **Consulting**: Deloitte (7.6–12.5 LPA), Accenture (4.5–11 LPA), Capgemini (4–7.5 LPA)\n- **IT Services**: TCS (3.6–11.5 LPA), Infosys (3.6–9.5 LPA), Wipro (3.5–8.5 LPA), Cognizant (4–9 LPA)",
        speech: "PrepPilot AI features 10 recruitment company blueprints including Google, Amazon, Microsoft, TCS, Infosys, Wipro, Accenture, Capgemini, Cognizant, and Deloitte with packages up to 55 LPA."
      };
    }
    if (q.includes('branch') || q.includes('branches')) {
      return {
        reply: "### Supported Engineering Branches\nPrepPilot AI supports 9 engineering branches:\n- **Computing**: Computer Science (CSE), Information Technology (IT), AI & Data Science (AIDS), AI & Machine Learning (AIML)\n- **Circuits**: Electronics & Telecommunication (ECE), Electrical Engineering (EE)\n- **Core Engineering**: Mechanical (ME), Civil (CE), Chemical (CHE)",
        speech: "PrepPilot AI supports 9 engineering branches including Computer Science, IT, Electronics and Telecommunication, Electrical, Mechanical, Civil, Chemical, and AI Data Science."
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
    if (q.includes('array')) {
      return {
        reply: "### What is an Array?\nAn **array** is a fundamental linear data structure that stores homogeneous elements in **contiguous memory locations**.\n\n- **Access**: $O(1)$ constant time via index arithmetic.\n- **Search**: $O(n)$ linear / $O(\\log n)$ binary search on sorted data.\n- **Insert/Delete**: $O(n)$ due to element shifting.",
        speech: "An array is a linear data structure that stores elements of the same data type in contiguous memory locations with O(1) random access."
      };
    }
    if (q.includes('linked list')) {
      return {
        reply: "### What is a Linked List?\nA **linked list** is a linear data structure composed of nodes containing data and pointers to the next node, stored non-contiguously on the heap.\n\n- **Head Insertion/Deletion**: $O(1)$ without memory shifting.\n- **Search/Access**: $O(n)$ sequential traversal.",
        speech: "A linked list consists of nodes with data and pointers stored non-contiguously, allowing O(1) insertions at the head."
      };
    }
    if (q.includes('stack')) {
      return {
        reply: "### What is a Stack?\nA **stack** is a linear LIFO (Last-In, First-Out) data structure where elements are pushed and popped from the same end (top) in $O(1)$ time.",
        speech: "A stack is a linear data structure following the Last-In First-Out principle with O(1) push and pop operations."
      };
    }
    if (q.includes('queue')) {
      return {
        reply: "### What is a Queue?\nA **queue** is a linear FIFO (First-In, First-Out) data structure where elements are enqueued at the rear and dequeued from the front in $O(1)$ time.",
        speech: "A queue is a linear data structure following the First-In First-Out principle with O(1) enqueue and dequeue operations."
      };
    }
    if (q.includes('tree')) {
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

      try {
        const res = await api.askPrepPilot(normalizedQuery, activeModel, apiKey || undefined);
        replyText = res.reply || res.message || "I have received your placement query.";
        speechOutput = res.speech_text || replyText;
        sources = res.sources || [];
        isLive = res.is_live_api;
      } catch (networkErr) {
        // Intelligent offline curriculum fallback if server is unreachable or offline
        console.warn('[PrepPilot API offline fallback]:', networkErr);
        const fallback = getOfflineFallbackResponse(normalizedQuery);
        replyText = fallback.reply;
        speechOutput = fallback.speech;
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
        hasSystemKey
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
