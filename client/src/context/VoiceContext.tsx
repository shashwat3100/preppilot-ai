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
      text: "Welcome to PrepPilot, your technical interview and curriculum mentor powered by Gemini. You can ask conceptual questions across Database Management Systems, Operating Systems, Computer Networks, Data Structures, or campus placement patterns.",
      speechText: "Welcome to PrepPilot, your technical interview and curriculum mentor. Ask me any conceptual or placement question.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: 'gemini-2.5-flash'
    }
  ]);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize Speech Recognition & Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);

          // If final result obtained
          if (event.results[0].isFinal) {
            const finalQuery = currentTranscript.trim();
            if (finalQuery) {
              sendQuery(finalQuery, true);
            }
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('[Speech Recognition Event]:', event.error);
          setVoiceError(event.error === 'not-allowed' || event.error === 'service-not-allowed'
            ? 'Microphone access is blocked. Allow microphone access in your browser settings and try again.'
            : 'Voice input stopped unexpectedly. Try again or type your question.');
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setSpeechSupported(false);
      }

      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
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
    if (recognitionRef.current && speechSupported) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Recognition already started');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore
      }
    }
    setIsListening(false);
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

    const utterance = new SpeechSynthesisUtterance(cleanSpeech.slice(0, 320));
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    const voices = synthRef.current.getVoices();
    const englishVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
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
      const res = await api.askPrepPilot(normalizedQuery, activeModel, apiKey || undefined);
      const replyText = res.reply || res.message || "I have received your placement query.";
      const speechOutput = res.speech_text || replyText;

      const botMsg: PrepPilotChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'preppilot',
        text: replyText,
        speechText: speechOutput,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: res.sources || [],
        model: res.model || activeModel,
        isLiveApi: res.is_live_api
      };

      setConversation(prev => [...prev, botMsg]);

      // If user invoked via voice or voice modal is open, speak the answer
      if (isVoice || isModalOpen) {
        speakText(speechOutput);
      }
      return replyText;
    } catch (err) {
      console.error('[PrepPilot Query Error]:', err);
      const errorMsg: PrepPilotChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'preppilot',
        text: "I experienced a temporary connection hiccup with the RAG knowledge server. Please retry your technical question.",
        speechText: "Please retry your question.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: activeModel
      };
      setConversation(prev => [...prev, errorMsg]);
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
