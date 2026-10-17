import db from '../database/db.js';
import { GoogleGenAI } from '@google/genai';

/**
 * Text Vector & Similarity Utilities
 */
const STOP_WORDS = new Set([
  'what', 'does', 'the', 'how', 'are', 'for', 'with', 'and', 'why', 'can', 'tell',
  'explain', 'about', 'is', 'in', 'of', 'to', 'as', 'do', 'which', 'used', 'use',
  'function', 'please', 'describe', 'give', 'me', 'it', 'this', 'that', 'from'
]);

const TECHNICAL_ACRONYMS_2 = new Set(['os', 'ip', 'dp', 'db', 'io', 'ai', 'ml', 'cs', 'cn', 'rr', '2pl']);

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(token => (token.length > 2 || TECHNICAL_ACRONYMS_2.has(token)) && !STOP_WORDS.has(token));
}

function calculateCosineSimilarity(queryTokens, docTokens) {
  if (!queryTokens.length || !docTokens.length) return 0;
  const querySet = new Set(queryTokens);
  let matches = 0;

  for (const token of docTokens) {
    if (querySet.has(token)) {
      matches += 1;
    }
  }

  const denominator = Math.sqrt(queryTokens.length) * Math.sqrt(docTokens.length);
  return denominator === 0 ? 0 : matches / denominator;
}

export const SUPPORTED_MODELS = [
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

export class RagService {
  /**
   * Domain guardrail checker: Ensures query relates to placement,
   * engineering, tech viva, coding or recruitment.
   */
  static isDomainRelevant(query) {
    const q = query.toLowerCase().trim();
    if (!q) return false;

    // Reject obvious non-domain topics
    const blockedKeywords = ['recipe', 'cake', 'cook', 'pasta', 'weather', 'movie', 'song', 'sports', 'cricket', 'football', 'bitcoin', 'crypto', 'fashion', 'makeup'];
    if (blockedKeywords.some(b => q.includes(b))) {
      return false;
    }

    // Allow greetings and orientation questions using word boundaries for short words
    const greetingRegex = /\b(hi|hello|hey|good\s+morning|good\s+afternoon|good\s+evening)\b/i;
    const orientationPhrases = [
      'start', 'begin', 'help', 'what can we do', 'who are you', 'how can you help',
      'can i access', 'without login', 'about preppilot', 'about the platform',
      'where to start', 'help me prepare', 'what should i do', 'tell me about preppilot'
    ];
    if (greetingRegex.test(q) || orientationPhrases.some(g => q.includes(g))) {
      return true;
    }

    const allowedKeywords = [
      'dbms', 'sql', 'dsa', 'algorithm', 'tree', 'array', 'graph', 'dynamic programming',
      'operating system', 'linux', 'deadlock', 'paging', 'virtual memory', 'process', 'thread',
      'network', 'tcp', 'ip', 'osi', 'http', 'dns', 'router', 'subnet',
      'oop', 'java', 'c++', 'python', 'polymorphism', 'inheritance', 'interface', 'class',
      'tcs', 'infosys', 'wipro', 'accenture', 'capgemini', 'cognizant', 'amazon', 'google', 'microsoft', 'deloitte',
      'interview', 'placement', 'quiz', 'btech', 'engineering', 'branch', 'branches', 'ece', 'electrical',
      'mechanical', 'civil', 'chemical', 'microprocessor', '8085', 'circuit', 'transformer',
      'thermodynamics', 'fluid', 'formula', 'complexity', 'normalize', 'normalization', 'acid', 'normal form', '3nf', '2nf', '1nf', 'bcnf',
      'pointer', 'stack', 'queue', 'recursion', 'sorting', 'binary search', 'viva', 'question', 'questions',
      'linked list', 'list', 'node', 'heap', 'hashmap', 'hash table', 'priority queue', 'string', 'strings',
      'dfs', 'bfs', 'greedy', 'backtracking', 'sliding window', 'two pointer', 'matrix', 'bitwise',
      'effect', 'convoy', 'belady', 'anomaly', 'scheduling', 'round robin', 'quantum', 'starvation', 'aging',
      'mutex', 'semaphore', 'banker', 'coffman', 'thrashing', 'tlb', 'page fault', 'trie', 'dsu', 'hashing',
      'roadmap', 'prepare', 'target', 'crack', 'study', 'two sum', 'hint', 'oops', 'object', 'memory', 'heap',
      'company', 'companies', 'platform', 'listed', 'arena', 'coding', 'code', 'ctc', 'salary', 'package',
      'hiring', 'recruitment', 'round', 'rounds', 'eligibility', 'criteria', 'curriculum', 'syllabus',
      'preppilot', 'portal', 'assessment', 'practice', 'test', 'challenge', 'challenges', 'problem', 'problems',
      'aids', 'aiml', 'cse', 'it', 'entc', 'ee', 'me', 'ce', 'che', 'partner', 'tier', 'dean', 'student'
    ];

    return allowedKeywords.some(kw => q.includes(kw));
  }

  /**
   * Vector / Similarity Retrieval from KnowledgeDocuments
   */
  static retrieveContext(query, studentProfile = null, topK = 3) {
    const queryTokens = tokenize(query);
    const allDocs = db.getAll('knowledgeDocuments');

    const scoredDocs = allDocs.map(doc => {
      // Aggregate searchable text
      const docText = `${doc.title} ${doc.summary || ''} ${doc.content} ${(doc.keywords || []).join(' ')}`;
      const docTokens = tokenize(docText);
      const querySet = new Set(queryTokens);
      const docSet = new Set(docTokens);
      const titleSet = new Set(tokenize(doc.title));
      const keywordSet = new Set(tokenize((doc.keywords || []).join(' ')));
      const coverage = (tokens) => querySet.size
        ? [...querySet].filter(token => tokens.has(token)).length / querySet.size
        : 0;

      const cosine = calculateCosineSimilarity(queryTokens, docTokens);
      const titleCov = coverage(titleSet);
      const keyCov = coverage(keywordSet);
      const docCov = coverage(docSet);

      let similarity = Math.max(
        cosine,
        titleCov * 0.35,
        keyCov * 0.30,
        (titleCov > 0 || keyCov > 0 || cosine > 0.1 ? docCov * 0.15 : 0)
      );

      if (studentProfile && similarity >= 0.035) {
        if (studentProfile.branch_id && doc.branch_id === studentProfile.branch_id) {
          similarity += 0.01;
        }
        if (studentProfile.target_companies && studentProfile.target_companies.includes(doc.company_id)) {
          similarity += 0.015;
        }
      }

      return {
        ...doc,
        similarityScore: similarity
      };
    });

    scoredDocs.sort((a, b) => b.similarityScore - a.similarityScore);
    return scoredDocs.slice(0, topK);
  }

  /**
   * Call official Google Gemini Generative AI Model if API key is provided
   */
  static async callGeminiLive(query, ragDocs, modelName = 'gemini-2.5-flash', apiKey) {
    if (!apiKey) return null;

    try {
      const ai = new GoogleGenAI({ apiKey });

      const contextText = ragDocs.map((d, i) => 
        `[Document ${i + 1}: ${d.title}]\nCategory: ${d.category}\nContent: ${d.content}\nSummary: ${d.summary || ''}`
      ).join('\n\n');

      const systemInstruction = `You are PrepPilot, an elite B.Tech Campus Placement & Technical Interview Mentor powered by ${modelName}.
Role & Instructions:
1. Answer strictly and directly what the student asks. Ground your response directly in the Database RAG Reference Documents provided below.
2. DO NOT simply dump the reference document or output document titles/metadata as your answer. Provide a direct, targeted explanation that addresses the user's specific query.
3. Be professional, academic, direct, and concise. Under NO circumstance use emojis or casual filler phrases.
4. Structure your response clearly using standard Markdown:
   - Use ### for primary section headers.
   - Use clean numbered lists for sequential steps or mechanisms.
   - Use bullet points for key characteristics.
   - For code, always use proper fenced blocks (\`\`\`python, \`\`\`cpp, \`\`\`java, \`\`\`sql).
5. Conclude with a short callout block (> **Key Placement Interview Consideration:**) explaining what technical interviewers evaluate.

Database RAG Reference Documents:
${contextText || 'Core engineering syllabus and standard campus placement standards.'}`;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: query,
        config: {
          systemInstruction,
          temperature: 0.3
        }
      });

      if (response && response.text) {
        const text = response.text.trim();
        // Extract 2 clean sentences for natural voice speech output
        const cleanSpeech = text
          .replace(/```[\s\S]*?```/g, '')
          .replace(/[#*`>_]/g, '')
          .split('\n')
          .map(l => l.trim())
          .filter(l => l.length > 15 && !l.toLowerCase().startsWith('key placement'))
          .slice(0, 2)
          .join(' ');

        let speechFriendly = cleanSpeech || text.replace(/[#*`>_]/g, '').replace(/\s+/g, ' ').slice(0, 220);
        if (speechFriendly.length > 250) {
          const lastPeriod = speechFriendly.lastIndexOf('.', 250);
          if (lastPeriod > 80) {
            speechFriendly = speechFriendly.slice(0, lastPeriod + 1);
          } else {
            speechFriendly = speechFriendly.slice(0, 247) + '...';
          }
        }

        return {
          answer: text,
          speechText: speechFriendly,
          model: modelName,
          isLiveApi: true
        };
      }
    } catch (err) {
      console.warn(`[Gemini API call to ${modelName} failed, falling back to local grounded synthesis]:`, err.message);
    }

    return null;
  }

  /**
   * Generates grounded answer using RAG context and requested AI model
   */
  static async answerStudentQuery(query, studentProfile = null, requestedModel = 'gemini-2.5-flash', clientApiKey = null) {
    const validModel = SUPPORTED_MODELS.some(m => m.id === requestedModel)
      ? requestedModel
      : 'gemini-2.5-flash';

    const q = query.trim();
    const qLower = q.toLowerCase();

    // 1. Guardrail check
    if (!this.isDomainRelevant(q)) {
      return {
        answer: "I am PrepPilot, your technical placement and curriculum mentor. My focus is restricted to engineering subjects, coding assessments, and campus recruitment interviews. Please ask a question related to your syllabus, technical subjects, or placement preparation.",
        speechText: "I am PrepPilot, your placement preparation assistant. Please ask a question related to engineering or placement interviews.",
        retrievedDocuments: [],
        sources: [],
        model: validModel,
        isLiveApi: false
      };
    }

    // 2. Natural Conversational / Orientation Queries (e.g. "hi so what can we do today")
    if (
      qLower === 'hi' ||
      qLower === 'hello' ||
      qLower === 'hey' ||
      qLower.includes('what can we do today') ||
      qLower.includes('how can you help') ||
      qLower.includes('who are you') ||
      qLower.includes('where to start') ||
      qLower.includes('help me prepare') ||
      qLower.includes('what should i do')
    ) {
      const naturalGreeting = `### Welcome to PrepPilot Technical Preparation

Today we can focus on several core areas to prepare you for campus technical interviews and online assessment rounds:

1. Core Curriculum Revision: Review high-yield fundamentals across Database Management Systems (normalization, transactions, indexing), Operating Systems (process scheduling, deadlock conditions, virtual memory), or Computer Networks.
2. Algorithmic Practice: Solve coding problems covering arrays, two-pointer techniques, hash maps, binary search, and dynamic programming with full test case execution.
3. Timed Placement Tests: Take an adaptive subject quiz or a simulated company placement assessment matching TCS, Infosys, Capgemini, or product engineering test patterns.

Which subject or company pattern would you like to begin with?`;

      return {
        answer: naturalGreeting,
        speechText: "Welcome to PrepPilot. Today we can review core subjects like DBMS and Operating Systems, practice algorithmic coding problems, or take timed placement quizzes. Which area would you like to start with?",
        retrievedDocuments: [],
        sources: [],
        model: validModel,
        isLiveApi: false
      };
    }

    // 3. RAG Retrieval for technical queries
    const retrievedDocs = this.retrieveContext(q, studentProfile, 3);
    const topDoc = retrievedDocs[0];
    const topDocRelevance = topDoc ? topDoc.similarityScore : 0;
    const sources = retrievedDocs.filter(d => d.similarityScore > 0.05).map(d => d.title);

    // 4. Check for Live Gemini API execution
    const effectiveApiKey = clientApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (effectiveApiKey) {
      const liveResult = await this.callGeminiLive(q, retrievedDocs, validModel, effectiveApiKey);
      if (liveResult) {
        return {
          ...liveResult,
          retrievedDocuments: retrievedDocs.map(d => ({
            id: d.id,
            title: d.title,
            category: d.category,
            relevanceScore: Math.round(d.similarityScore * 100)
          })),
          sources
        };
      }
    }

    // 5. Intelligent Intent Routing for Placement Preparation & Platform Queries

    // Intent 1: Student Portal Access & Authentication Queries
    if (
      qLower.includes('without login') ||
      qLower.includes('sign in') ||
      (qLower.includes('login') && (qLower.includes('access') || qLower.includes('can i') || qLower.includes('without') || qLower.includes('need') || qLower.includes('require'))) ||
      (qLower.includes('access') && qLower.includes('student') && (qLower.includes('without') || qLower.includes('can')))
    ) {
      const accessMarkdown = `### PrepPilot Platform Access: Public vs. Student Login

Here is how student access works on the PrepPilot platform:

#### 1. What You Can Access Without Logging In:
- **Public Practice Overview:** Explore syllabus curriculum outlines, company assessment blueprints, and high-level placement topics.
- **Platform Navigation:** View available technical domains (DBMS, OS, DSA, Computer Networks) and assessment catalogs.

#### 2. Features Requiring a Student Login:
- **Interactive Coding Arena:** Writing, compiling, and running code against hidden test cases with sandboxed execution.
- **Timed Placement Assessments:** Taking official 20-question Core CS or 30-question TCS/Infosys mock assessments with automated grading.
- **XP, Streaks & Gamification:** Earning experience points, maintaining daily streaks, and leveling up your candidate profile.
- **Personalized Placement Analytics:** Accessing your readiness score, weak topic diagnostics, and recruiter benchmark radar.

> **How to Sign In:** Click **Login** or **Register** in the top navigation bar to create a free student account and begin practicing immediately.`;

      return {
        answer: accessMarkdown,
        speechText: "You can browse the curriculum publicly, but logging into your student account is required to execute code, take timed placement assessments, and save your analytics.",
        retrievedDocuments: [],
        sources: ['PrepPilot Platform Guide'],
        model: validModel,
        isLiveApi: false
      };
    }

    // Intent 2: Question Serving ("give me five question", "give me questions", "practice questions", "ask me questions")
    if (
      (qLower.includes('question') || qLower.includes('questions')) &&
      (qLower.includes('give') || qLower.includes('ask') || qLower.includes('show') || qLower.includes('provide') || qLower.includes('practice') || qLower.includes('five') || qLower.includes('5') || qLower.includes('10') || qLower.includes('mcq') || qLower.includes('test me'))
    ) {
      let count = 5;
      if (qLower.includes('ten') || qLower.includes('10')) count = 10;
      else if (qLower.includes('three') || qLower.includes('3')) count = 3;
      else if (qLower.includes('one') || qLower.includes('1 ') || qLower === 'give me a question') count = 1;

      const allQuestions = db.getAll('questions') || [];
      const allOptions = db.getAll('questionOptions') || [];

      // Filter by subject / company if specified in query
      let matchedQuestions = allQuestions;
      if (qLower.includes('dbms') || qLower.includes('database') || qLower.includes('sql')) {
        matchedQuestions = allQuestions.filter(qItem => qItem.subject_id === 'sub-dbms');
      } else if (qLower.includes('os') || qLower.includes('operating system')) {
        matchedQuestions = allQuestions.filter(qItem => qItem.subject_id === 'sub-os');
      } else if (qLower.includes('dsa') || qLower.includes('data structure') || qLower.includes('algorithm')) {
        matchedQuestions = allQuestions.filter(qItem => qItem.subject_id === 'sub-dsa');
      } else if (qLower.includes('network') || qLower.includes('cn')) {
        matchedQuestions = allQuestions.filter(qItem => qItem.subject_id === 'sub-cn');
      } else if (qLower.includes('tcs') || qLower.includes('ninja')) {
        matchedQuestions = allQuestions.filter(qItem => qItem.company_id === 'comp-tcs');
      }

      if (matchedQuestions.length < count) {
        matchedQuestions = allQuestions;
      }

      const selectedQuestions = matchedQuestions.slice(0, count);

      let questionsFormatted = `### ${selectedQuestions.length} Practice Placement Questions\n\nHere are ${selectedQuestions.length} targeted questions from the PrepPilot question bank:\n\n`;

      selectedQuestions.forEach((qItem, idx) => {
        const options = allOptions.filter(o => o.question_id === qItem.id);
        const subjectObj = qItem.subject_id ? db.get('subjects', qItem.subject_id) : null;
        const subjectName = subjectObj ? subjectObj.name : 'Technical';

        questionsFormatted += `#### Question ${idx + 1} (${subjectName} | ${qItem.difficulty || 'Medium'})\n`;
        questionsFormatted += `${qItem.question}\n\n`;

        if (options.length > 0) {
          options.forEach(opt => {
            questionsFormatted += `- **${opt.option_key})** ${opt.option_text}\n`;
          });
        }

        const correctOpt = options.find(o => o.option_key === qItem.correct_answer || o.is_correct);
        const correctText = correctOpt ? `${qItem.correct_answer}) ${correctOpt.option_text}` : qItem.correct_answer;

        questionsFormatted += `\n> **Correct Answer:** **${correctText}**\n`;
        if (qItem.explanation) {
          questionsFormatted += `> *Explanation:* ${qItem.explanation}\n`;
        }
        questionsFormatted += `\n`;
      });

      questionsFormatted += `> **Interview Tip:** Practice writing out the rationale for each option before selecting your answer in technical placement screenings.`;

      return {
        answer: questionsFormatted,
        speechText: `Here are ${selectedQuestions.length} targeted placement questions from our question bank covering core technical topics. Review each question and option to test your placement readiness.`,
        retrievedDocuments: [],
        sources: ['PrepPilot Question Bank'],
        model: validModel,
        isLiveApi: false
      };
    }

    // Intent 3: Placement Preparation Roadmap & Schedule (e.g. 20-day TCS Ninja plan)
    if (
      (qLower.includes('day') || qLower.includes('week') || qLower.includes('plan') || qLower.includes('roadmap') || qLower.includes('schedule') || qLower.includes('strategy')) &&
      (qLower.includes('tcs') || qLower.includes('ninja') || qLower.includes('placement') || qLower.includes('prep') || qLower.includes('easy medium') || qLower.includes('interview'))
    ) {
      const roadmapMarkdown = `### 20-Day TCS Ninja Placement Preparation Roadmap

Here is a structured, day-by-day technical preparation plan organized across **Easy**, **Medium**, and **Hard** difficulty tiers:

#### Phase 1: Days 1–6 (Easy — Foundational Speed & Cognitive Accuracy)
- **Day 1–2 (Quantitative & Reasoning):** Number systems, percentages, ratios, blood relations, and syllogisms (TCS Cognitive Section).
- **Day 3–4 (Basic Coding & Syntax):** String operations (palindrome, anagram, character frequency counting) without built-in library functions.
- **Day 5–6 (Array Basics):** Array reversal, finding min/max, linear search, and basic frequency arrays.

#### Phase 2: Days 7–14 (Medium — Core Engineering & Standard Algorithmic Patterns)
- **Day 7–8 (Array Patterns):** Two-pointer techniques, sliding window, prefix sums, and binary search on sorted arrays.
- **Day 9–10 (Data Structures):** Singly linked lists, stack push/pop, queue BFS traversals, and recursion tree tracing.
- **Day 11–12 (DBMS & SQL):** Normalization (1NF, 2NF, 3NF, BCNF), Primary vs Foreign Keys, and writing JOIN / GROUP BY queries.
- **Day 13–14 (Operating Systems & Networks):** CPU scheduling (FCFS convoy effect, Round Robin), Deadlock 4 Coffman conditions, and OSI 7 layers.

#### Phase 3: Days 15–20 (Hard — Advanced Assessment & Technical Interview Mock)
- **Day 15–16 (Advanced Coding):** Matrix spiral traversal, dynamic programming (0/1 Knapsack, Longest Common Subsequence), and Tree inorder/preorder.
- **Day 17–18 (Timed Coding Arena):** Solve 2 to 3 coding problems in PrepPilot's Coding Arena within the 45-minute TCS test timer.
- **Day 19 (OOP & System Viva):** 4 pillars of OOP (Encapsulation, Abstraction, Polymorphism, Inheritance), runtime vs compile-time polymorphism.
- **Day 20 (Final Mock Assessment):** Take a full 30-question TCS Ninja Assessment in PrepPilot's Assessment module to verify placement readiness.

> **Key Placement Interview Consideration:** In TCS Ninja technical rounds, interviewers evaluate code cleanliness, time complexity awareness ($O(n)$ vs $O(n^2)$), and whether you can trace your logic with edge cases.`;

      return {
        answer: roadmapMarkdown,
        speechText: "Here is your 20-day TCS Ninja preparation plan organized into three phases: foundational aptitude and basic strings for days 1 to 6, core data structures and DBMS for days 7 to 14, and advanced algorithms with mock assessments for days 15 to 20.",
        retrievedDocuments: [],
        sources: ['TCS Ninja Placement Syllabus'],
        model: validModel,
        isLiveApi: false
      };
    }

    // Intent 4: Platform All Companies Directory ("listed on your platform and tell me about each and every company", "all companies", "what companies are listed")
    const allCompanies = db.getAll('companies') || [];
    const isAllCompaniesQuery =
      (
        (qLower.includes('company') || qLower.includes('companies')) &&
        (
          qLower.includes('listed') ||
          qLower.includes('platform') ||
          qLower.includes('all') ||
          qLower.includes('each') ||
          qLower.includes('every') ||
          qLower.includes('which') ||
          qLower.includes('what') ||
          qLower.includes('available') ||
          qLower.includes('show') ||
          qLower.includes('tell me') ||
          qLower.includes('partner') ||
          qLower.includes('who are') ||
          qLower.includes('directory') ||
          qLower.includes('catalog')
        )
      ) ||
      qLower.includes('companies on') ||
      qLower.includes('companies listed') ||
      qLower.includes('recruitment partners') ||
      qLower.includes('list of companies') ||
      qLower === 'companies';

    if (isAllCompaniesQuery) {
      const companiesMarkdown = `### Recruitment Companies Listed on PrepPilot AI (10 Partners)

PrepPilot AI features dedicated recruitment blueprints, hiring pipelines, and technical assessment patterns for **10 premier campus recruiters** categorized by compensation tiers and engineering focus:

#### 1. Tier-1 Product Engineering (High CTC: 28–55 LPA):
- **Google (36–55 LPA | Avg: 42 LPA):** Google Online Challenge (OA) → Technical DSA Rounds (Graphs, Segment Trees, Trie, Advanced DP) → Googliness & Leadership. Focus on asymptotic time/space complexity and think-aloud problem solving.
- **Amazon (32–45 LPA | Avg: 36.5 LPA):** Online Assessment (Coding + Work Simulation) → 3–4 Rounds Technical DSA (Trees, Two Pointers, Dynamic Programming, System Design) → 16 Leadership Principles & STAR behavioral interview.
- **Microsoft (34–48 LPA | Avg: 38 LPA):** Codility Online Assessment → 3 Technical Rounds (Data Structures, Algorithms, Memory Management, Relational Schema Design) → Engineering Manager Fitment.

#### 2. Consulting & Enterprise Product (7.6–12.5 LPA):
- **Deloitte (7.6–12.5 LPA | Avg: 9 LPA):** Versant Communication Assessment → Advanced Technical MCQ + Coding → Technical & Case Study Viva → Partner Round. Focus on enterprise cloud, Java/Python, and DBMS.

#### 3. Consulting & Technology Services (4.0–12.0 LPA):
- **Accenture (4.5–11.0 LPA | Avg: 6.2 LPA):** Cognitive & Technical Assessment → Hands-on Coding (2 Questions) → Communication Assessment → Virtual Interview. Hiring streams include Associate Software Engineer (ASE) and Advanced ASE.
- **Capgemini (4.0–7.5 LPA | Avg: 5.2 LPA):** Pseudocode Assessment → English Communication → Game-based Aptitude → Technical Viva (OOP, SQL, Data Structures).

#### 4. Global IT & Enterprise Services (3.5–11.5 LPA):
- **TCS (3.6–11.5 LPA | Avg: 5.8 LPA):** TCS National Qualifier Test (NQT) Cognitive + Advanced Coding → Technical & Managerial Interview. Three hiring tiers: **Ninja** (3.6 LPA), **Digital** (7.5 LPA), and **Prime** (9–11.5 LPA).
- **Infosys (3.6–9.5 LPA | Avg: 5.5 LPA):** Pseudocode & Mathematical Ability → Hands-on Coding (InfyTQ / HackWithInfy) → Technical Interview. Tiers: **Systems Engineer** (3.6 LPA), **Digital Specialist Engineer** (6.5 LPA), and **Specialist Programmer** (9.5 LPA).
- **Wipro (3.5–8.5 LPA | Avg: 4.8 LPA):** Elite National Talent Hunt (Aptitude + Written Communication + 2 Coding Problems) → Technical Interview. Tiers: **Elite** (3.5 LPA), **Turbo** (6.5 LPA), and **Velocity** (8.5 LPA).
- **Cognizant (4.0–9.0 LPA | Avg: 5.6 LPA):** GenC, GenC Elevate, and GenC Next coding tracks evaluating C/Java algorithms, SQL queries, and full-stack fundamentals.

> **Next Step:** You can ask about any individual company (e.g. *"How can I target Amazon?"* or *"Tell me about TCS hiring rounds"*) or launch a company-specific placement assessment!`;

      return {
        answer: companiesMarkdown,
        speechText: "PrepPilot AI features 10 recruitment company blueprints including Google, Amazon, Microsoft, TCS, Infosys, Wipro, Accenture, Capgemini, Cognizant, and Deloitte. Packages range from 3.6 LPA for IT services up to 55 LPA for product engineering.",
        retrievedDocuments: [],
        sources: ['PrepPilot Company Placement Blueprints'],
        model: validModel,
        isLiveApi: false
      };
    }

    // Intent 5: Engineering Branches & Supported Curriculum
    const isBranchesQuery =
      (
        (qLower.includes('branch') || qLower.includes('branches') || qLower.includes('discipline') || qLower.includes('disciplines') || qLower.includes('engineering branch')) &&
        (
          qLower.includes('what') ||
          qLower.includes('which') ||
          qLower.includes('support') ||
          qLower.includes('available') ||
          qLower.includes('list') ||
          qLower.includes('all') ||
          qLower.includes('tell me') ||
          qLower.includes('platform') ||
          qLower.includes('show') ||
          qLower.includes('who can')
        )
      ) ||
      qLower.includes('supported branches') ||
      qLower.includes('all branches') ||
      qLower.includes('which branches');

    if (isBranchesQuery) {
      const allBranches = db.getAll('branches') || [];
      const branchesMarkdown = `### Supported Engineering Branches on PrepPilot AI (9 Disciplines)

PrepPilot AI provides customized curriculum alignment, viva preparation, and technical assessment questions for **9 B.Tech & Engineering branches**:

#### 1. Software & Computing:
- **Computer Science Engineering (CSE):** Core computing, Data Structures, Algorithms, Operating Systems, DBMS, and Systems Architecture.
- **Information Technology (IT):** Enterprise software, Computer Networks, Database Administration, Web Systems, and Cloud Infrastructure.
- **AI & Data Science (AIDS):** Machine Learning, Deep Learning, Statistical Analytics, and Big Data Engineering.
- **AI & Machine Learning (AIML):** Neural Networks, Computer Vision, Natural Language Processing, and Applied AI Models.

#### 2. Electronics & Electrical:
- **Electronics & Telecommunication (ENTC/ECE):** Digital & Analog Circuits, VLSI Design, 8085/8086 Microprocessors, Embedded C, and Signal Processing.
- **Electrical Engineering (EE):** Power Systems, Control Systems, Electrical Machines, Transformers, and Power Electronics.

#### 3. Core Engineering & Infrastructure:
- **Mechanical Engineering (ME):** Laws of Thermodynamics, Heat Transfer, Fluid Mechanics, Strength of Materials, and Mechanical Design.
- **Civil Engineering (CE):** Structural Engineering, Concrete Technology, Geotechnical Analysis, and Transportation Systems.
- **Chemical Engineering (CHE):** Chemical Reaction Engineering, Mass Transfer Operations, and Process Optimization.

> **Placement Insight:** Non-CS students (ECE, EE, ME, CE) can practice both core engineering viva concepts and IT placement coding tracks (TCS Ninja/Digital, Infosys, Wipro).`;

      return {
        answer: branchesMarkdown,
        speechText: "PrepPilot AI supports 9 engineering branches including Computer Science, IT, Electronics and Telecommunication, Electrical, Mechanical, Civil, Chemical, and AI Data Science, complete with core subject viva guides and placement assessments.",
        retrievedDocuments: [],
        sources: ['PrepPilot Engineering Curriculum Guide'],
        model: validModel,
        isLiveApi: false
      };
    }

    // Intent 6: Coding Arena & Algorithmic Practice
    const isCodingQuery =
      (
        (qLower.includes('coding') || qLower.includes('arena') || qLower.includes('programming') || qLower.includes('code')) &&
        (qLower.includes('problem') || qLower.includes('challenge') || qLower.includes('question') || qLower.includes('practice') || qLower.includes('what') || qLower.includes('how many') || qLower.includes('available') || qLower.includes('can i') || qLower.includes('tell me') || qLower.includes('list'))
      ) ||
      qLower.includes('coding arena') ||
      qLower.includes('coding problems') ||
      qLower.includes('algorithmic challenges');

    if (isCodingQuery) {
      const allProblems = db.getAll('codingProblems') || [];
      const codingMarkdown = `### PrepPilot Interactive Coding Arena (18 Algorithmic Challenges)

The **Coding Arena** is a sandboxed technical coding environment designed to simulate real-world technical assessment rounds:

#### 1. Problem Categories & Difficulty Breakdown:
- **Total Problems:** 18 curated challenges mirroring high-frequency campus hiring questions.
- **Difficulty Tiers:** 13 Easy problems (Foundations, Arrays, Strings) and 5 Medium problems (Trees, Dynamic Programming, Two Pointers).
- **Core Patterns Covered:** Two Pointers (Two Sum, Valid Palindrome), Stack Monotonicity (Valid Parentheses), Divide & Conquer (Binary Search), Dynamic Programming (Kadane’s Algorithm, Maximum Subarray), and Tree Traversals.

#### 2. Multi-Language Sandboxed Execution:
- Write and run solutions in **C++**, **Java**, **Python**, or **JavaScript**.
- Real-time compiler output with standard output capture.
- Automated grading against **public example test cases** and **hidden edge-case test suites** (verifying time limits, integer overflow, and empty collections).

> **Ready to Code?** Navigate to the **Coding Arena** from the top menu, pick a challenge, and click *Run Code* or *Submit Solution*!`;

      return {
        answer: codingMarkdown,
        speechText: "The Coding Arena includes 18 curated algorithmic problems across arrays, trees, and dynamic programming, featuring browser execution with automated test cases in C++, Java, Python, and JavaScript.",
        retrievedDocuments: [],
        sources: ['PrepPilot Coding Arena Documentation'],
        model: validModel,
        isLiveApi: false
      };
    }

    // Intent 7: Platform Overview & What Can You Do
    const isPlatformOverviewQuery =
      (
        (qLower.includes('what can') || qLower.includes('what is') || qLower.includes('how can you') || qLower.includes('features') || qLower.includes('about') || qLower.includes('tell me about')) &&
        (qLower.includes('preppilot') || qLower.includes('platform') || qLower.includes('website') || qLower.includes('app') || qLower.includes('system') || qLower.includes('tool'))
      ) ||
      qLower === 'what is preppilot' ||
      qLower === 'tell me about preppilot' ||
      qLower === 'about preppilot';

    if (isPlatformOverviewQuery) {
      const overviewMarkdown = `### PrepPilot AI: B.Tech Placement & Curriculum Copilot

PrepPilot AI is a comprehensive engineering mentorship platform engineered to guide university students from foundational academics to top-tier technical placement offers:

#### Core Platform Capabilities:
1. **AI Voice & Chat Placement Mentor:** Ask conceptual technical questions across DBMS, Operating Systems, Computer Networks, and DSA, or practice oral technical interview simulations.
2. **Curated Question Bank (98+ Questions):** High-yield multiple choice questions with line-by-line explanations covering 13 technical and branch-specific subjects.
3. **Interactive Coding Arena (18 Problems):** Write, execute, and submit code in Python, C++, Java, and JavaScript with automated test case evaluation.
4. **10 Company Recruitment Blueprints:** In-depth hiring pipelines, package ranges, and test patterns for TCS, Infosys, Wipro, Accenture, Capgemini, Cognizant, Deloitte, Amazon, Microsoft, and Google.
5. **9 Engineering Branches:** Dedicated viva revision guides for CSE, IT, ECE, EE, ME, CE, Chemical, AIDS, and AIML.
6. **Student Placement Readiness Radar:** Dynamic radar chart tracking your mastery across technical topics, difficulty levels, and speed benchmarks.

> **Get Started:** Choose a subject to study, start practicing coding in the Arena, or speak into the microphone to ask any technical question!`;

      return {
        answer: overviewMarkdown,
        speechText: "PrepPilot AI is your B.Tech placement copilot featuring company hiring blueprints, an interactive coding arena, syllabus-grounded question banks, and AI voice mentorship.",
        retrievedDocuments: [],
        sources: ['PrepPilot Platform Guide'],
        model: validModel,
        isLiveApi: false
      };
    }

    // Intent 8: Company Targeting & Recruitment Blueprint ("how can I target Google", "target Amazon", "crack Microsoft", "prepare for TCS")
    const matchedCompany = allCompanies.find(c => {
      const cName = c.name.toLowerCase();
      return qLower.includes(cName) || (c.id && qLower.includes(c.id.replace('comp-', '')));
    });

    const isTargetingQuery =
      qLower.includes('target') ||
      qLower.includes('crack') ||
      qLower.includes('prepare for') ||
      qLower.includes('get into') ||
      qLower.includes('join') ||
      qLower.includes('hiring') ||
      qLower.includes('interview process') ||
      qLower.includes('selection process') ||
      qLower.includes('how to clear') ||
      qLower.includes('how can i');

    const isSingleCompanyQuery = matchedCompany && (
      isTargetingQuery ||
      qLower.includes('about') ||
      qLower.includes('ctc') ||
      qLower.includes('package') ||
      qLower.includes('salary') ||
      qLower.includes('round') ||
      qLower.includes('rounds') ||
      qLower.includes('process') ||
      qLower.includes('eligibility') ||
      qLower.includes('criteria') ||
      qLower.includes('pattern') ||
      qLower.includes('cutoff') ||
      qLower.includes('role') ||
      qLower.includes('tell me') ||
      qLower.includes('what is') ||
      qLower.includes('how to') ||
      qLower.trim() === matchedCompany.name.toLowerCase()
    );

    if (isSingleCompanyQuery) {
      const rounds = matchedCompany.hiring_rounds || [
        'Online Assessment (Coding & Aptitude)',
        'Technical Interview 1 (DSA)',
        'Technical Interview 2 (System Design & CS Core)',
        'HR / Managerial Round'
      ];

      const focusAreas = matchedCompany.interview_focus_areas || [
        'Data Structures & Algorithms',
        'Time & Space Complexity Optimization',
        'Database Systems & SQL Queries',
        'Operating Systems & Multithreading'
      ];

      const ctcInfo = matchedCompany.ctc_breakdown
        ? `${matchedCompany.ctc_breakdown.min_lpa} LPA - ${matchedCompany.ctc_breakdown.max_lpa} LPA (Average: ~${matchedCompany.ctc_breakdown.average_lpa} LPA)`
        : 'Competitive Industry Standard';

      const eligibility = matchedCompany.eligibility_criteria
        ? `Min CGPA: ${matchedCompany.eligibility_criteria.min_cgpa || '7.0'}, 10th/12th: ${matchedCompany.eligibility_criteria.min_percentage_10_12 || '60'}%+, Backlogs: ${matchedCompany.eligibility_criteria.max_backlogs ?? 0}`
        : '60%+ aggregate across 10th, 12th, and B.Tech with no active backlogs';

      const companyMarkdown = `### How to Target and Crack ${matchedCompany.name} (${matchedCompany.tier || 'Tier-1 Engineering'})

To successfully clear the placement drive and technical interviews for **${matchedCompany.name}**, follow this structured four-pillar preparation strategy:

#### 1. Hiring Process & Interview Pipeline:
${rounds.map((r, i) => `${i + 1}. **Round ${i + 1} — ${r}:** ${i === 0 ? 'Evaluates initial algorithmic problem solving and cognitive accuracy under time constraints.' : i === rounds.length - 1 ? 'Evaluates cultural alignment, leadership values, and behavioral scenario handling.' : 'Evaluates clean code generation, algorithmic optimization, and technical depth.'}`).join('\n')}

#### 2. High-Yield Technical Focus Areas:
${focusAreas.map(fa => `- **${fa}:** High-frequency topic tested extensively across screening and technical interview rounds.`).join('\n')}

#### 3. 4-Step Engineering Action Plan:
1. **Master Core Algorithmic Patterns:** Focus on Graphs (BFS/DFS, Dijkstra), Trees (BST, Lowest Common Ancestor), Dynamic Programming, and Two-Pointers. Aim to solve medium-to-hard problems in under 30 minutes with optimal time complexity.
2. **Practice Whiteboard & "Think-Aloud" Communication:** ${matchedCompany.name} interviewers prioritize candidate thought process over memorized answers. Clarify constraints upfront, outline edge cases (null inputs, duplicates, integer overflows), and trace your code before declaring it complete.
3. **Strengthen CS Fundamentals:** Deepen your mastery of Database Indexing (B+ Trees), Concurrency (Deadlocks, Mutex vs Semaphore), Memory Management (Virtual Memory, Paging), and the OSI/TCP-IP networking model.
4. **Behavioral & Culture Alignment:** Prepare STAR-method (Situation, Task, Action, Result) stories for past projects, handling team disagreements, architectural trade-offs, and technical failures.

#### 4. Compensation & Eligibility Benchmark:
- **Typical Package Range:** ${ctcInfo}
- **Eligibility Benchmark:** ${eligibility}
- **Selection Ratio:** ${matchedCompany.selection_ratio || 'Top percentile of university and off-campus applicants.'}

> **Key Placement Interview Consideration:** Interviewers at ${matchedCompany.name} evaluate code explainability, Big-O awareness ($O(n \\log n)$ vs $O(n^2)$), and how you respond to follow-up optimization questions when your first solution works.`;

      return {
        answer: companyMarkdown,
        speechText: `To target ${matchedCompany.name}, focus on mastering advanced data structures and algorithms, practice communicating your thought process out loud during coding, and prepare for behavioral and leadership rounds.`,
        retrievedDocuments: [],
        sources: [`${matchedCompany.name} Placement Blueprint`],
        model: validModel,
        isLiveApi: false
      };
    }

    // 6. Direct, Targeted Grounded Synthesis (Clean, Academic, Zero Emojis, No Raw Document Dumps)
    let responseMarkdown = '';
    let speechFriendly = '';

    // A. Specific High-Yield Placement Concepts Grounded in RAG Knowledge Base
    if (
      qLower.includes('what is array') ||
      qLower === 'what is an array' ||
      qLower === 'array' ||
      qLower === 'arrays' ||
      qLower.includes('array data structure') ||
      qLower.includes('define array') ||
      qLower.includes('explain array') ||
      (qLower.includes('array') && !qLower.includes('rotation') && !qLower.includes('sliding') && !qLower.includes('tcs') && !qLower.includes('suffix') && !qLower.includes('subarray'))
    ) {
      responseMarkdown = `### What is an Array?

An **array** is a fundamental linear data structure that stores a collection of elements of the same data type in **contiguous memory locations**. Each element in an array is uniquely identified by an integer index, typically zero-indexed ($0, 1, \\dots, n-1$).

#### 1. Core Architectural Characteristics:
- **Contiguous Memory Allocation:** Array elements occupy an unbroken sequence of physical memory addresses, enabling exceptional CPU cache performance and spatial locality.
- **Constant-Time Direct Indexing:** Any element can be accessed in constant time $O(1)$ through pointer arithmetic using the base address:
  $$\\text{Address}(A[i]) = \\text{Base Address} + (i \\times \\text{Size of Element})$$
- **Homogeneous Data:** In statically typed systems (C, C++, Java), all elements stored must share the identical data type.
- **Static vs. Dynamic Arrays:**
  - *Static Arrays:* Fixed capacity allocated at compile-time or stack initialization.
  - *Dynamic Arrays* (e.g., \`std::vector\` in C++, \`ArrayList\` in Java, \`list\` in Python): Automatically double capacity when full, achieving $O(1)$ amortized append operations.

#### 2. Time & Space Complexity:
| Operation | Average Case | Worst Case | Technical Rationale |
| :--- | :--- | :--- | :--- |
| **Access ($A[i]$)** | $O(1)$ | $O(1)$ | Direct memory offset calculation |
| **Search (Linear)** | $O(n)$ | $O(n)$ | Sequential traversal for unsorted items |
| **Search (Binary)** | $O(\\log n)$ | $O(\\log n)$ | Divide-and-conquer on sorted arrays |
| **Insertion (End)** | $O(1)$ | $O(1)$ | Direct write (amortized in dynamic arrays) |
| **Insertion (Begin/Mid)** | $O(n)$ | $O(n)$ | Requires shifting subsequent elements rightward |
| **Deletion** | $O(n)$ | $O(n)$ | Requires shifting subsequent elements leftward |
| **Auxiliary Space** | $O(1)$ | $O(1)$ | Operates in-place within allocated memory |

#### 3. Code Implementation Example (C++):
\`\`\`cpp
#include <iostream>
#include <vector>

int main() {
    // 1. Static Array (Contiguous stack memory)
    int staticArr[5] = {10, 20, 30, 40, 50};
    std::cout << "Element at index 2: " << staticArr[2] << "\\n"; // O(1) Access

    // 2. Dynamic Array (Heap allocated with automatic resizing)
    std::vector<int> dynamicArr = {1, 2, 3};
    dynamicArr.push_back(4); // O(1) Amortized insertion
    return 0;
}
\`\`\`

#### 4. Engineering Trade-offs:
- **Advantages:** Instantaneous $O(1)$ random access, zero pointer memory overhead, superior cache line utilization.
- **Disadvantages:** Fixed capacity in static arrays, expensive $O(n)$ insertions and deletions due to element shifts, and demands large contiguous memory blocks that can cause allocation failures in fragmented memory.

> **Key Placement Interview Consideration:** Technical interviewers (Amazon, Google, TCS) frequently test why arrays outperform linked lists for sequential iteration (**CPU cache spatial locality**) and expect proficiency in array-centric patterns: **Two Pointers**, **Sliding Window**, and **Prefix Sums**.`;

      speechFriendly = "An array is a linear data structure that stores elements of the same data type in contiguous memory locations. It provides constant-time O(1) random access by index, but insertions and deletions take O(N) time due to element shifting.";

    } else if (
      qLower.includes('linked list') ||
      qLower.includes('singly linked') ||
      qLower.includes('doubly linked') ||
      qLower.includes('circular linked')
    ) {
      responseMarkdown = `### What is a Linked List?

A **linked list** is a linear data structure consisting of discrete nodes where each node contains **data** and one or more **pointers (references)** to adjacent nodes. Unlike arrays, linked list nodes are allocated dynamically on the heap and are **not stored contiguously** in physical memory.

#### 1. Common Variations:
1. **Singly Linked List:** Each node stores data and a single \`next\` pointer to the successor node.
2. **Doubly Linked List:** Each node stores data, a \`next\` pointer, and a \`prev\` pointer, enabling bidirectional traversal at the expense of extra pointer overhead.
3. **Circular Linked List:** The tail node's \`next\` pointer connects back to the head node, forming a closed ring.

#### 2. Time & Space Complexity:
| Operation | Linked List | Array Comparison |
| :--- | :--- | :--- |
| **Access / Search** | $O(n)$ | $O(1)$ Access in Arrays |
| **Insert at Head** | $O(1)$ | $O(n)$ in Arrays (requires shifting) |
| **Insert at Tail** | $O(1)$ with tail pointer | $O(1)$ amortized in Dynamic Arrays |
| **Insert at Middle** | $O(n)$ search $+ O(1)$ pointer update | $O(n)$ shift in Arrays |
| **Memory Overhead** | $O(n)$ extra for node pointers | Zero pointer overhead in Arrays |

#### 3. Node Structure (Java):
\`\`\`java
class ListNode {
    int val;
    ListNode next;
    ListNode(int val) {
        this.val = val;
        this.next = null;
    }
}
\`\`\`

#### 4. Array vs. Linked List Trade-offs:
- **Choose Linked List When:** Frequent insertions and deletions occur at the beginning or arbitrary positions where node references are already available, or when memory size varies unpredictably.
- **Choose Array When:** Fast random access by index is required and sequential iteration speed benefits from CPU cache lines.

> **Key Placement Interview Consideration:** Interviewers frequently ask candidates to reverse a linked list in-place ($O(1)$ space), detect cycles using Floyd's Tortoise and Hare algorithm ($O(n)$ time, $O(1)$ space), and merge two sorted linked lists.`;

      speechFriendly = "A linked list is a linear data structure consisting of nodes with data and pointers stored non-contiguously in memory. It allows O(1) insertions and deletions at the head without memory reallocation, but requires O(N) sequential traversal to access elements.";

    } else if (
      qLower.includes('what is stack') ||
      qLower === 'stack' ||
      qLower.includes('stack data structure') ||
      (qLower.includes('stack') && (qLower.includes('lifo') || qLower.includes('push') || qLower.includes('pop') || qLower.includes('monotonic') || qLower.includes('bracket')))
    ) {
      responseMarkdown = `### What is a Stack?

A **stack** is a linear data structure that adheres strictly to the **Last-In, First-Out (LIFO)** operational principle: the last element added to the stack is the first element removed.

#### 1. Core Operations (All $O(1)$ Time):
- **\`push(x)\`:** Inserts element $x$ onto the top of the stack.
- **\`pop()\`:** Removes and returns the element currently at the top of the stack. Throws an underflow error if the stack is empty.
- **\`peek()\` / \`top()\`:** Returns the top element without removing it.
- **\`isEmpty()\`:** Evaluates whether the stack contains zero elements.

#### 2. Standard Implementations:
1. **Array-Based Implementation:** Maintains a \`top\` index pointer. Fast and memory-efficient, but requires resizing if using static allocation.
2. **Linked-List-Based Implementation:** Pushes and pops from the head of the list ($O(1)$), allowing dynamic growth without reallocation.

#### 3. High-Yield Applications:
- **Function Call Stack:** Managing subroutine execution, local variables, and return addresses during nested function calls and recursion.
- **Expression Parsing:** Converting infix expressions to postfix (Reverse Polish Notation) and evaluating mathematical expressions.
- **Syntax Validation:** Balanced parentheses checking in compilers and linters.
- **Monotonic Stack:** Resolving the Next Greater Element and largest rectangle in histogram problems in linear $O(n)$ time.

> **Key Placement Interview Consideration:** When asked to implement a stack supporting \`getMin()\` in $O(1)$ time, describe either using an auxiliary min-stack or storing encoded differential values ($2x - \\text{min}$).`;

      speechFriendly = "A stack is a linear data structure that follows the Last-In, First-Out principle. All primary operations like push, pop, and peek execute in constant O(1) time.";

    } else if (
      qLower.includes('what is queue') ||
      qLower === 'queue' ||
      qLower.includes('queue data structure') ||
      (qLower.includes('queue') && (qLower.includes('fifo') || qLower.includes('circular') || qLower.includes('deque')))
    ) {
      responseMarkdown = `### What is a Queue?

A **queue** is a linear data structure that operates under the **First-In, First-Out (FIFO)** operational principle: the element inserted first is the first one to be removed.

#### 1. Core Operations (All $O(1)$ Time):
- **\`enqueue(x)\`:** Appends element $x$ to the back (rear) of the queue.
- **\`dequeue()\`:** Removes and returns the element from the front of the queue.
- **\`front()\` / \`peek()\`:** Reads the front element without removing it.
- **\`isEmpty()\`:** Verifies whether the queue contains any elements.

#### 2. Queue Variations:
1. **Circular Queue:** Connects the last position back to the first position using modulo arithmetic ($(\\text{rear} + 1) \\bmod N$), eliminating space wastage in fixed arrays.
2. **Double-Ended Queue (Deque):** Permits insertions and deletions at both the front and rear in $O(1)$ time.
3. **Priority Queue:** Each element has an associated priority; elements with higher priority are dequeued before lower-priority elements (typically implemented via a Heap).

#### 3. Real-World Applications:
- **Operating Systems:** CPU ready queues, I/O request buffers, and printer spooling.
- **Networking:** Router packet switching and network buffer management.
- **Algorithms:** Breadth-First Search (BFS) graph and tree traversals.

> **Key Placement Interview Consideration:** Interviewers frequently ask candidates to implement a queue using two stacks, where amortized time complexity per operation remains $O(1)$.`;

      speechFriendly = "A queue is a linear data structure that follows the First-In, First-Out principle. Elements are enqueued at the rear and dequeued from the front in constant O(1) time.";

    } else if (
      qLower.includes('what is tree') ||
      qLower.includes('binary tree') ||
      qLower.includes('binary search tree') ||
      qLower.includes('what is bst') ||
      (qLower.includes('tree') && (qLower.includes('traversal') || qLower.includes('inorder') || qLower.includes('preorder')) && !qLower.includes('trie') && !qLower.includes('b-tree'))
    ) {
      responseMarkdown = `### What is a Binary Tree & Binary Search Tree (BST)?

A **tree** is a hierarchical, non-linear data structure consisting of nodes linked by directed edges. A **Binary Tree** is a specialized tree where each node has at most two children, referred to as the left child and right child.

#### The Binary Search Tree (BST) Invariant:
For every node $X$ in a BST:
- All values in $X$'s left subtree are strictly **less than** $X$'s value.
- All values in $X$'s right subtree are strictly **greater than** $X$'s value.

#### 1. Standard Tree Traversals:
1. **Inorder (Left, Root, Right):** Produces elements in **sorted ascending order** for any valid BST.
2. **Preorder (Root, Left, Right):** Ideal for serializing or cloning tree hierarchies.
3. **Postorder (Left, Right, Root):** Used for bottom-up node deletions and evaluating postfix expressions.
4. **Level-Order (Breadth-First):** Traverses nodes layer by layer using a FIFO Queue.

#### 2. Complexity Analysis:
| Operation | Average Case (Balanced) | Worst Case (Skewed) | Self-Balancing (AVL / Red-Black) |
| :--- | :--- | :--- | :--- |
| **Search** | $O(\\log n)$ | $O(n)$ | $O(\\log n)$ Guaranteed |
| **Insert** | $O(\\log n)$ | $O(n)$ | $O(\\log n)$ Guaranteed |
| **Delete** | $O(\\log n)$ | $O(n)$ | $O(\\log n)$ Guaranteed |

> **Key Placement Interview Consideration:** Highlight that an unbalance/skewed BST degrades into a linked list with $O(n)$ runtime, which is why production engines employ self-balancing trees like AVL or Red-Black trees.`;

      speechFriendly = "A Binary Search Tree is a hierarchical data structure where every node has at most two children, with left keys smaller and right keys larger than the root. It provides O of log N average search, insertion, and deletion.";

    } else if (
      qLower.includes('what is heap') ||
      qLower.includes('min heap') ||
      qLower.includes('max heap') ||
      qLower.includes('priority queue') ||
      (qLower.includes('heap') && !qLower.includes('sort') && !qLower.includes('memory'))
    ) {
      responseMarkdown = `### What is a Heap & Priority Queue?

A **heap** is a specialized complete binary tree that satisfies the **heap property**:
- **Max-Heap:** The value of each node is greater than or equal to the values of its children. The root holds the maximum element.
- **Min-Heap:** The value of each node is less than or equal to the values of its children. The root holds the minimum element.

#### 1. Compact Array-Based Representation:
Because a heap is a complete binary tree, it is stored in a contiguous array without explicit pointers:
- For a node at index $i$:
  - **Left Child:** $2i + 1$
  - **Right Child:** $2i + 2$
  - **Parent:** $\\lfloor (i - 1) / 2 \\rfloor$

#### 2. Time & Space Complexity:
- **Get Min / Max:** $O(1)$
- **Insert (\`push\`):** $O(\\log n)$ via upward sift (bubble-up)
- **Extract Min / Max (\`pop\`):** $O(\\log n)$ via downward sift (heapify)
- **Build Heap from Array:** $O(n)$ using bottom-up heapification

#### 3. Primary Applications:
- Implementing **Priority Queues** in operating systems and network schedulers.
- **Dijkstra's Shortest Path** and **Prim's Minimum Spanning Tree** algorithms.
- Finding the **K-th Largest/Smallest Element** in a stream using a fixed-size heap in $O(n \\log k)$ time.

> **Key Placement Interview Consideration:** Interviewers frequently test why \`buildHeap\` executes in $O(n)$ rather than $O(n \\log n)$; explain the mathematical summation of node heights across levels: $\\sum_{h=0}^{\\log n} \\frac{n}{2^{h+1}} O(h) = O(n)$.`;

      speechFriendly = "A heap is a complete binary tree that maintains the min-heap or max-heap property. It allows O(1) peek of the extreme element and logarithmic O of log N insertions and extractions.";

    } else if (
      qLower.includes('what is graph') ||
      qLower === 'graph' ||
      qLower.includes('graph data structure') ||
      (qLower.includes('graph') && (qLower.includes('representation') || qLower.includes('adjacency') || qLower.includes('vertex') || qLower.includes('vertices')))
    ) {
      responseMarkdown = `### What is a Graph Data Structure?

A **graph** is a non-linear data structure consisting of a finite set of **vertices (nodes)** $V$ and a collection of **edges** $E$ that connect pairs of vertices.

#### 1. Graph Classifications:
- **Directed (Digraph) vs. Undirected:** Edges possess a specific directional orientation ($u \\to v$) or are bidirectional.
- **Weighted vs. Unweighted:** Edges carry numerical costs/weights (e.g., latency, distance).
- **Cyclic vs. Acyclic:** Whether paths exist that start and terminate at the same vertex (e.g., Directed Acyclic Graphs or DAGs).

#### 2. Standard Representation Models:
1. **Adjacency Matrix ($V \\times V$ 2D Array):**
   - $O(1)$ edge existence verification (\`matrix[u][v]\`).
   - High space overhead: $O(V^2)$, wasteful for sparse graphs.
2. **Adjacency List (Array of Lists / Hash Maps):**
   - Stores only existing outgoing edges for each vertex.
   - Space complexity: $O(V + E)$, optimal for sparse graphs.

#### 3. Foundational Traversals:
- **Breadth-First Search (BFS):** Explores vertices level-by-level using a FIFO Queue. Guarantees the shortest path in unweighted graphs ($O(V + E)$).
- **Depth-First Search (DFS):** Explores deeply along branches using recursion or a LIFO Stack. Used for cycle detection, topological sorting, and connected components.

> **Key Placement Interview Consideration:** Always ask the interviewer whether the graph is directed or undirected and whether it contains cycles or disconnected components before implementing BFS or DFS.`;

      speechFriendly = "A graph is a non-linear data structure consisting of vertices and edges. It is represented using adjacency lists for memory efficiency or adjacency matrices for constant-time edge queries.";

    } else if (
      qLower.includes('dynamic programming') ||
      qLower.includes('what is dp') ||
      qLower.includes('memoization') ||
      qLower.includes('tabulation')
    ) {
      responseMarkdown = `### What is Dynamic Programming (DP)?

**Dynamic Programming (DP)** is an algorithmic optimization paradigm that solves complex problems by breaking them down into simpler subproblems, solving each subproblem exactly once, and storing their solutions to eliminate redundant computations.

#### The Two Mandatory Pre-conditions:
1. **Overlapping Subproblems:** The problem breaks down into recurring subproblems whose solutions are needed multiple times (e.g., Fibonacci numbers, shortest paths).
2. **Optimal Substructure:** The optimal solution to the overall problem can be constructed from optimal solutions to its constituent subproblems.

#### 1. The Two Implementation Paradigms:
- **Top-Down with Memoization:**
  - Recursive formulation that caches computed states in a hash map or array.
  - Computes only required subproblems on-demand; subject to call stack overhead.
- **Bottom-Up with Tabulation:**
  - Iterative formulation that solves smaller subproblems first, populating an $N$-dimensional table.
  - Eliminates recursion stack overhead and frequently enables space optimization (e.g., keeping only the last two rows).

#### 2. Classic Placement Problem Patterns:
- **0/1 Knapsack & Unbounded Knapsack** (Subset sum, coin change)
- **Longest Common Subsequence (LCS)** (Edit distance, string diffing)
- **Longest Increasing Subsequence (LIS)** ($O(n \\log n)$ with binary search)
- **Matrix Chain Multiplication (MCM)** (Interval DP)

> **Key Placement Interview Consideration:** Start by expressing the naive brute-force recursion and recurrence relation, identify the repeated state parameters, and then demonstrate how memoization reduces exponential time $O(2^n)$ to polynomial time $O(n)$.`;

      speechFriendly = "Dynamic Programming optimizes recursive algorithms by caching results of overlapping subproblems. It uses either top-down memoization or bottom-up tabulation to convert exponential solutions into polynomial time.";

    } else if (
      qLower.includes('what is oop') ||
      qLower.includes('object oriented') ||
      qLower.includes('polymorphism') ||
      qLower.includes('inheritance') ||
      qLower.includes('encapsulation') ||
      qLower.includes('abstraction')
    ) {
      responseMarkdown = `### Object-Oriented Programming (OOP) & The Four Pillars

**Object-Oriented Programming (OOP)** is a software engineering paradigm organized around **objects** (data structures containing attributes) and **classes** (blueprints defining behaviors and methods).

#### The Four Fundamental Pillars:
1. **Encapsulation:**
   - Bundling data and the methods that operate on that data into a single unit (class) while restricting direct outside access to internal state.
   - Achieved using access specifiers (\`private\`, \`protected\`, \`public\`) and exposing public getters and setters.

2. **Abstraction:**
   - Hiding complex background implementation details and exposing only essential interfaces to the user.
   - Implemented via **Abstract Classes** and **Interfaces** (e.g., calling \`drive()\` on a car without needing to understand combustion timing).

3. **Inheritance:**
   - Enabling a child (derived) class to inherit properties and behaviors from a parent (base) class, promoting DRY (Don't Repeat Yourself) code reuse.
   - Establishes an *"is-a"* relationship (e.g., a \`Dog\` is an \`Animal\`).

4. **Polymorphism (Many Forms):**
   - **Compile-Time (Static) Polymorphism:** Method Overloading (same method name, different parameter signature) and Operator Overloading.
   - **Runtime (Dynamic) Polymorphism:** Method Overriding, where a derived class provides a specific implementation of a virtual method declared in its parent class, resolved dynamically via vtables.

> **Key Placement Interview Consideration:** Contrast Method Overloading (compile-time resolution based on arguments) with Method Overriding (runtime dynamic dispatch based on actual runtime object type).`;

      speechFriendly = "The four pillars of Object-Oriented Programming are Encapsulation for data hiding, Abstraction for interface separation, Inheritance for code reuse, and Polymorphism for dynamic behavior.";

    } else if (
      qLower.includes('process vs thread') ||
      qLower.includes('what is process') ||
      qLower.includes('what is thread') ||
      qLower.includes('multithreading')
    ) {
      responseMarkdown = `### Operating Systems: Process vs. Thread

| Feature | Process | Thread (Lightweight Process) |
| :--- | :--- | :--- |
| **Definition** | An independent program in execution | The smallest dispatchable unit of CPU execution |
| **Memory Space** | Dedicated isolated address space (Text, Data, Heap, Stack) | Shares the parent process's Heap, Data, and Code segment |
| **Private State** | Separate PID, page tables, file descriptors | Private Program Counter (PC), CPU registers, and Stack |
| **Creation Overhead** | High (involves \`fork()\` and OS memory mapping) | Low (shares existing process memory) |
| **Context Switching** | Expensive (invalidates TLB and CPU cache lines) | Inexpensive (TLB translations remain valid) |
| **Communication** | Requires Inter-Process Communication (IPC: Pipes, Sockets) | Direct shared memory access (requires synchronization) |
| **Fault Isolation** | High (if one process crashes, others survive) | Low (an unhandled exception in one thread can terminate the whole process) |

> **Key Placement Interview Consideration:** When asked why multithreading is preferred for network servers, explain that thread creation has substantially lower memory and CPU overhead than process creation and allows zero-copy data exchange via shared heap memory.`;

      speechFriendly = "A process is an executing program with isolated memory space, while a thread is a lightweight execution unit inside a process that shares the heap and data segment with peer threads.";

    } else if (
      qLower.includes('indexing') ||
      qLower.includes('b-tree') ||
      qLower.includes('b+ tree') ||
      qLower.includes('clustered index')
    ) {
      responseMarkdown = `### Database Indexing & B+ Trees

A **database index** is an auxiliary data structure that enhances the speed of data retrieval operations on a table at the expense of additional disk storage and slower write operations (\`INSERT\`, \`UPDATE\`, \`DELETE\`).

#### Why B+ Trees are Used in Relational Databases:
1. **High Fan-Out & Low Depth:** B+ Trees have a high branching factor ($100+$ children per node), allowing tables with millions of rows to be searched in only $3$ to $4$ disk I/O operations.
2. **All Data in Leaves:** Internal nodes contain only routing keys; all actual table records (or row pointers) reside exclusively in leaf nodes.
3. **Sequential Leaf Linkage:** Leaf nodes are linked together via a doubly linked list, enabling exceptionally fast $O(\\log n + k)$ range queries and sorting scans.

#### Clustered vs. Non-Clustered Indexes:
- **Clustered Index:** Dictates the physical storage order of data rows on disk. A table can have **at most one** clustered index (typically on the Primary Key).
- **Non-Clustered (Secondary) Index:** Stored in a separate structure containing index keys and pointers back to the physical table rows. A table can have multiple non-clustered indexes.

> **Key Placement Interview Consideration:** Interviewers frequently ask why hash indexes are not the default in databases like PostgreSQL or MySQL; explain that Hash Indexes only support point lookups ($O(1)$) and cannot evaluate range scans (\`WHERE age BETWEEN 20 AND 30\`) or ordering.`;

      speechFriendly = "Database indexing uses balanced B+ trees to speed up search queries from O of N table scans to O of log N disk lookups, optimizing both single-record lookups and range queries.";

    } else if (
      qLower.includes('convoy') ||
      qLower.includes('what effect') ||
      qLower.includes('effect is') ||
      qLower.includes('scheduling effect') ||
      (qLower.includes('effect') && (qLower.includes('fcfs') || qLower.includes('sched') || qLower.includes('cpu') || qLower.includes('os') || qLower.includes('burst')))
    ) {
      responseMarkdown = `### The Convoy Effect in CPU Scheduling (FCFS)

In Operating Systems, the **Convoy Effect** is a critical performance degradation phenomenon associated with the non-preemptive **First-Come, First-Served (FCFS)** scheduling algorithm. It occurs when a single CPU-intensive, long-burst process acquires the CPU, forcing numerous shorter, I/O-intensive processes to wait behind it in the ready queue—analogous to a convoy of fast cars stuck behind a slow-moving heavy truck on a single-lane highway.

#### Mechanism & System Impact:
1. **Device & CPU Underutilization:**
   - While the long CPU-bound process executes, all peripheral I/O devices sit idle.
   - Once the CPU-bound process finally requests I/O and relinquishes the CPU, all the short I/O-bound processes execute their brief CPU bursts quickly and crowd the I/O device queue simultaneously, leaving the CPU idle.
2. **Elevated Average Waiting Time:**
   - Because short processes must wait for long execution bursts to finish, both average waiting time and turnaround time spike dramatically compared to optimal scheduling.
3. **Absence of Preemption:**
   - In non-preemptive FCFS, the operating system kernel cannot pause or preempt a running process, even when high-priority interactive tasks arrive.

#### Architectural Solutions:
- **Round Robin (RR) Scheduling:** Enforces preemptive time-slicing using a fixed time quantum ($q$), ensuring no single process can monopolize the CPU.
- **Shortest Remaining Time First (SRTF):** Preemptively assigns the processor to the process with the smallest remaining burst time, yielding mathematically minimal average waiting times.

> **Key Placement Interview Consideration:** When asked about the Convoy Effect in technical interviews, clearly contrast CPU-bound versus I/O-bound jobs, explain why I/O device utilization plummets in FCFS, and cite Round Robin as the industry-standard preemptive countermeasure.`;

      speechFriendly = "The Convoy Effect occurs in non-preemptive First-Come, First-Served scheduling when shorter I/O-bound processes wait behind a long CPU-bound process, resulting in high average wait times and device underutilization. It is mitigated by preemptive scheduling algorithms like Round Robin or Shortest Remaining Time First.";

    } else if (qLower.includes('belady') || (qLower.includes('anomaly') && (qLower.includes('page') || qLower.includes('fifo') || qLower.includes('frame')))) {
      responseMarkdown = `### Belady's Anomaly in Virtual Memory (FIFO Page Replacement)

In Operating Systems memory management, **Belady's Anomaly** is the counter-intuitive phenomenon where **increasing the number of physical page frames results in an increase in the number of page faults** for a given memory reference string under the **First-In, First-Out (FIFO)** page replacement policy.

#### Theoretical Cause:
- FIFO does not satisfy the **inclusion property** (the set of pages in a memory of $N$ frames is not necessarily a subset of the pages in a memory of $N+1$ frames).
- Because FIFO replaces the oldest loaded page without regard to recency or access frequency, allocating extra frames can disrupt the optimal replacement ordering.

#### Algorithms Immune to Belady's Anomaly (Stack Algorithms):
- **Least Recently Used (LRU):** Tracks temporal locality. The set of pages in an $N$-frame system is always a strict subset of the pages in an $(N+1)$-frame system.
- **Optimal (OPT / MIN) Replacement:** Replaces the page that will not be referenced for the longest duration in the future.

> **Key Placement Interview Consideration:** Technical interviewers frequently ask which algorithms are immune to Belady's Anomaly. Emphasize that all **stack algorithms** (including LRU, LFU, and Optimal) strictly adhere to the inclusion property and are mathematically immune.`;

      speechFriendly = "Belady's Anomaly is the counter-intuitive phenomenon where increasing the number of physical page frames increases page faults under FIFO page replacement. Stack algorithms like LRU and Optimal never exhibit this anomaly because they follow the inclusion property.";

    } else if (qLower.includes('thrashing')) {
      responseMarkdown = `### Thrashing in Operating Systems Virtual Memory

**Thrashing** is a pathological state in virtual memory where an operating system spends significantly more CPU cycles swapping pages between physical RAM and secondary swap storage than executing productive process instructions, causing CPU utilization to collapse toward zero.

#### Underlying Cause:
- Thrashing occurs when the degree of multiprogramming is too high, such that the sum of the **working sets** of all active processes exceeds the total capacity of physical memory ($D = \\sum WSS_i > \\text{Total RAM}$).
- When processes lack sufficient resident pages, they continually trigger page faults. The OS scheduler misinterprets low CPU utilization as an idle system and admits more processes, worsening the paging loop.

#### Mitigation Strategies:
1. **Working Set Model (Peter Denning):** Define a working set parameter $\\Delta$. Only schedule a process if its complete working set fits in physical memory.
2. **Page Fault Frequency (PFF) Strategy:** Dynamically allocate frames based on measured page fault rates: assign additional frames if the fault rate exceeds an upper threshold, and reclaim frames if it falls below a lower threshold.

> **Key Placement Interview Consideration:** Always define thrashing in terms of the working set model and contrast local page replacement with global page replacement to show how a single thrashing process can impact the entire system.`;

      speechFriendly = "Thrashing occurs when an operating system spends more time swapping pages into and out of swap space than executing process instructions because the sum of working sets exceeds physical RAM. It is mitigated using the Working Set Model or Page Fault Frequency algorithms.";

    } else if (
      qLower.includes('round robin') ||
      qLower.includes('time quantum') ||
      (qLower.includes('rr') && (qLower.includes('sched') || qLower.includes('cpu')))
    ) {
      responseMarkdown = `### Round Robin (RR) CPU Scheduling Algorithm

**Round Robin (RR)** is a preemptive CPU scheduling algorithm specifically engineered for time-sharing and interactive operating systems. The kernel allocates the CPU to ready processes in a circular queue, granting each process an execution time slice called a **time quantum** ($q$).

#### Operational Mechanics:
- When a process's burst exceeds $q$, a hardware timer interrupt fires, triggering a context switch that places the preempted process at the tail of the ready queue.
- If a process finishes or blocks for I/O before $q$ expires, the CPU is immediately reassigned to the next ready process.

#### The Quantum Selection Trade-off:
- **Too Large ($q \\to \\infty$):** Round Robin degrades into First-Come, First-Served (FCFS), re-introducing the Convoy Effect and poor response times.
- **Too Small ($q \\to 0$):** Context-switching overhead dominates, severely degrading overall system throughput.
- **Rule of Thumb:** A rule of thumb in operating systems is that 80% of CPU bursts should be shorter than the selected time quantum.

> **Key Placement Interview Consideration:** Round Robin is starvation-free and provides an optimal response time for interactive users, but its average waiting time is often higher than Shortest Job First.`;

      speechFriendly = "Round Robin is a preemptive CPU scheduling algorithm where each process receives a cyclic time quantum. An optimal quantum balances interactive responsiveness with low context switching overhead.";

    } else if (
      qLower.includes('sjf') ||
      qLower.includes('srtf') ||
      qLower.includes('shortest job') ||
      qLower.includes('shortest remaining')
    ) {
      responseMarkdown = `### Shortest Job First (SJF) and Shortest Remaining Time First (SRTF)

**Shortest Job First (SJF)** selects the process with the smallest CPU burst time. **Shortest Remaining Time First (SRTF)** is the preemptive variant of SJF: when a new process arrives with a remaining burst shorter than the currently executing process, the CPU is preempted.

#### Core Characteristics:
1. **Mathematical Optimality:** SJF/SRTF is provably optimal in minimizing the average waiting time for any given set of processes.
2. **Practical Limitation:** CPU burst durations cannot be known in advance; kernels estimate bursts using exponential smoothing: $\\tau_{n+1} = \\alpha t_n + (1 - \\alpha) \\tau_n$.
3. **Starvation Risk:** Long CPU-intensive jobs can starve indefinitely if shorter bursts arrive continuously.

> **Key Placement Interview Consideration:** When asked how to prevent starvation in SJF/SRTF, explain **Aging**—gradually increasing the priority or reducing effective burst time of waiting processes as their wait time increases.`;

      speechFriendly = "Shortest Remaining Time First is the preemptive version of Shortest Job First. It guarantees optimal minimum average waiting time but can cause starvation of long CPU-intensive jobs.";

    } else if (qLower.includes('starvation') || qLower.includes('aging')) {
      responseMarkdown = `### Starvation and Aging in Operating Systems

**Starvation** (indefinite blocking) is a condition where a ready process is perpetually denied CPU or system resources because higher-priority or shorter processes continuously enter the ready queue.

#### The Solution: Aging Technique:
- **Mechanism:** The kernel periodically increments the priority of processes that reside in the ready queue for extended periods.
- **Outcome:** Even the lowest-priority process will eventually accumulate enough priority to reach the head of the queue and execute, guaranteeing that starvation is eliminated.

> **Key Placement Interview Consideration:** Contrast starvation with deadlock: In a deadlock, processes are mutually blocked and cannot make progress without external intervention; in starvation, the system continues executing, but specific unlucky processes are indefinitely postponed.`;

      speechFriendly = "Starvation is the indefinite blocking of lower-priority processes when higher-priority jobs arrive continuously. Aging resolves starvation by gradually increasing the priority of processes as they wait in the ready queue.";

    } else if (qLower.includes('mutex') || qLower.includes('semaphore') || qLower.includes('critical section')) {
      responseMarkdown = `### Process Synchronization: Mutex vs. Semaphore

In concurrent programming, managing shared resources requires satisfying three critical section requirements: **Mutual Exclusion**, **Progress**, and **Bounded Waiting**.

#### Mutex (Mutual Exclusion Object):
- **Ownership:** A locking mechanism with strict ownership. Only the specific thread that acquired the mutex can release (unlock) it.
- **State:** Binary (Locked / Unlocked). Used to protect a single shared critical section or variable.

#### Semaphore:
- **Signaling Mechanism:** Uses an integer counter manipulated via two atomic operations: \`wait()\` (or \`P()\`) and \`signal()\` (or \`V()\`).
- **Counting Semaphore:** Initialized to integer $N$ representing available resource instances.
- **Binary Semaphore:** Initialized to 1, behaves like a mutex but has **no ownership** (any thread can signal it).

> **Key Placement Interview Consideration:** Interviewers frequently ask: "Can a thread release a mutex locked by another thread?" The answer is strictly **No**; only the owning thread can release a mutex, whereas any thread can signal a semaphore.`;

      speechFriendly = "A Mutex provides exclusive locking with ownership so only the acquiring thread can release it. A Semaphore is a signaling primitive using an integer counter without ownership constraints.";

    } else if (qLower.includes('banker') || qLower.includes('safe state') || qLower.includes('safe sequence')) {
      responseMarkdown = `### Dijkstra's Banker's Algorithm for Deadlock Avoidance

**Banker's Algorithm** is a dynamic deadlock avoidance algorithm developed by Edsger Dijkstra. It tests for safety by simulating the allocation of predetermined maximum possible resources, ensuring that the system never enters an **Unsafe State**.

#### Key Data Structures:
- **Available[$m$]:** Number of available instances of each resource type.
- **Max[$n$][$m$]:** Maximum demand of each process.
- **Allocation[$n$][$m$]:** Resources currently allocated to each process.
- **Need[$n$][$m$]:** Remaining resources required: $\\text{Need}[i][j] = \\text{Max}[i][j] - \\text{Allocation}[i][j]$.

#### Safety Condition:
A state is **safe** if there exists a **Safe Sequence** $\\langle P_0, P_1, \\dots, P_{n-1} \\rangle$ such that for each $P_i$, the resources that $P_i$ can still request can be satisfied by currently available resources plus resources held by all preceding processes.

> **Key Placement Interview Consideration:** Emphasize that an unsafe state is NOT necessarily a deadlock; however, every deadlock is an unsafe state. Banker's Algorithm guarantees that the system never enters an unsafe state.`;

      speechFriendly = "Dijkstra's Banker's Algorithm dynamically avoids deadlocks by verifying that granting a resource request leaves the system in a safe state with a valid process completion sequence.";

    } else if (qLower.includes('tlb') || qLower.includes('translation lookaside')) {
      responseMarkdown = `### Translation Lookaside Buffer (TLB) in Paging

A **Translation Lookaside Buffer (TLB)** is a high-speed, hardware associative cache integrated into the CPU's Memory Management Unit (MMU) that stores recent virtual-to-physical address translations.

#### Operational Mechanism:
1. When the CPU references a logical address, the MMU checks the TLB for the Page Number ($p$).
2. **TLB Hit:** The physical Frame Number ($f$) is retrieved in a single clock cycle, avoiding a memory lookup.
3. **TLB Miss:** The MMU accesses the Page Table in physical RAM, copies the translation into the TLB, and retrieves the frame.

#### Effective Memory Access Time (EMAT):
$$\\text{EMAT} = h \\times (t_{\\text{TLB}} + t_{\\text{RAM}}) + (1 - h) \\times (t_{\\text{TLB}} + 2 \\times t_{\\text{RAM}})$$
where $h$ is the TLB hit ratio, $t_{\\text{TLB}}$ is cache lookup latency, and $t_{\\text{RAM}}$ is main memory access time.

> **Key Placement Interview Consideration:** High TLB hit ratios (>98%) are achieved through temporal and spatial locality in software execution.`;

      speechFriendly = "A Translation Lookaside Buffer is a high-speed hardware cache that stores recent virtual-to-physical address translations to reduce memory access latency.";

    } else if (
      qLower.includes('page fault') ||
      (qLower.includes('paging') && !qLower.includes('tlb')) ||
      (qLower.includes('virtual memory') && !qLower.includes('thrash') && !qLower.includes('belady'))
    ) {
      responseMarkdown = `### Page Fault Handling in Virtual Memory

A **Page Fault** is an interrupt (trap) raised by the CPU Memory Management Unit (MMU) when a program accesses a page table entry whose **valid/invalid bit** is set to $0$ (invalid), indicating the referenced page is not currently resident in physical RAM.

#### Step-by-Step Trap Handling Sequence:
1. **Trap to Kernel:** CPU pauses the faulting instruction and transfers control to the OS page fault handler.
2. **Disk Lookup:** The OS checks the internal process table to verify legal memory access and locates the page on the swap disk.
3. **Frame Allocation:** The OS finds a free physical frame in RAM (or executes a page replacement algorithm like LRU if memory is full).
4. **I/O Transfer:** The OS reads the page from disk into the allocated physical frame.
5. **Page Table Update:** The page table entry is updated with the physical frame number and the valid bit is set to $1$.
6. **Instruction Restart:** The OS restarts the faulting instruction seamlessly.

> **Key Placement Interview Consideration:** Emphasize that disk I/O latency makes page faults expensive (taking milliseconds vs nanoseconds for RAM), which is why thrashing degrades performance so catastrophically.`;

      speechFriendly = "A page fault is a hardware trap raised when an instruction references a virtual page not resident in physical RAM. The OS loads the page from disk and updates the page table.";

    } else if (
      qLower.includes('normalize') ||
      qLower.includes('normalization') ||
      qLower.includes('normal form') ||
      qLower.includes('3nf') ||
      qLower.includes('2nf') ||
      qLower.includes('1nf') ||
      qLower.includes('bcnf') ||
      qLower.includes('functional dependenc')
    ) {
      responseMarkdown = `### Database Normalization (1NF to BCNF)

Database normalization is a systematic technique for designing relational database schemas that minimizes data redundancy and eliminates update, insertion, and deletion anomalies.

#### Normal Form Progression:
1. **First Normal Form (1NF):**
   - Each table cell must contain a single atomic value.
   - Disallows repeating groups or multi-valued attributes in a single tuple.

2. **Second Normal Form (2NF):**
   - Must satisfy 1NF.
   - Eliminates **partial functional dependency**: Every non-key attribute must depend fully on the complete primary key, not on a subset of a composite candidate key.

3. **Third Normal Form (3NF):**
   - Must satisfy 2NF.
   - Eliminates **transitive functional dependency**: For every non-trivial functional dependency $X \\rightarrow Y$, either $X$ is a super key or $Y$ is a prime attribute (part of a candidate key).

4. **Boyce-Codd Normal Form (BCNF):**
   - Stricter form of 3NF. For every non-trivial functional dependency $X \\rightarrow Y$, $X$ must strictly be a super key.

> **Key Placement Interview Consideration:** When asked why enterprise systems frequently standardize on 3NF rather than BCNF, note that 3NF preserves all functional dependencies alongside lossless join decomposition, whereas BCNF may require sacrificing dependency preservation in complex schemas.`;

      speechFriendly = "Database normalization minimizes redundancy and eliminates update anomalies across 1NF for atomic values, 2NF for removing partial dependencies, 3NF for eliminating transitive dependencies, and BCNF for strict superkeys.";

    } else if (
      qLower.includes('acid') ||
      qLower.includes('transaction') ||
      qLower.includes('isolation level') ||
      qLower.includes('dirty read') ||
      qLower.includes('phantom read') ||
      qLower.includes('2pl') ||
      qLower.includes('mvcc')
    ) {
      responseMarkdown = `### ACID Properties in Relational Database Management Systems

In database transactions, the ACID properties guarantee data validity and consistency despite errors, power failures, or concurrent execution:

1. **Atomicity:**
   - Ensures all operations within a transaction unit execute completely or none do (all-or-nothing).
   - Managed via the DBMS recovery manager and write-ahead logging (WAL) using commit and rollback operations.

2. **Consistency:**
   - Guarantees the database transitions from one valid state to another, satisfying all schema rules, foreign keys, and integrity constraints.

3. **Isolation:**
   - Controls concurrent transaction execution so intermediate states remain invisible to other transactions.
   - Implemented using concurrency control mechanisms such as two-phase locking (2PL) and multi-version concurrency control (MVCC).

4. **Durability:**
   - Guarantees that once a transaction commits, its modifications persist permanently in non-volatile storage, even during system crashes.

#### Transaction Isolation Levels & Concurrency Phenomena:
- **Read Uncommitted:** Suffers from Dirty Reads, Non-Repeatable Reads, and Phantom Reads.
- **Read Committed:** Prevents Dirty Reads; permits Non-Repeatable and Phantom Reads.
- **Repeatable Read:** Prevents Dirty and Non-Repeatable Reads; permits Phantom Reads (mitigated in PostgreSQL via MVCC).
- **Serializable:** Complete isolation, strictly prevents all concurrency anomalies.

> **Key Placement Interview Consideration:** Expect questions comparing isolation levels—Read Uncommitted, Read Committed, Repeatable Read, and Serializable—and the concurrency phenomena they prevent (Dirty Read, Non-Repeatable Read, and Phantom Read).`;

      speechFriendly = "ACID properties ensure transaction reliability: Atomicity for all-or-nothing execution, Consistency for data rules, Isolation for concurrent processes, and Durability for permanent storage.";

    } else if (qLower.includes('deadlock') || qLower.includes('coffman')) {
      responseMarkdown = `### Operating Systems: Deadlock Handling and Coffman Conditions

A deadlock occurs when a set of concurrent processes are permanently blocked because each process holds resources and waits for resources held by another process in the set.

#### The Four Necessary Coffman Conditions:
1. **Mutual Exclusion:** At least one resource must be held in a non-shareable mode.
2. **Hold and Wait:** A process holding at least one resource is currently requesting additional resources held by other processes.
3. **No Preemption:** Resources allocated to a process cannot be forcibly confiscated; they must be released voluntarily by the holding process.
4. **Circular Wait:** A closed chain of processes exists ($P_0 \\rightarrow P_1 \\dots \\rightarrow P_n \\rightarrow P_0$), where each process waits for a resource held by the next.

#### Mitigation Approaches:
- **Prevention:** Design the system to invalidate at least one Coffman condition (for example, enforcing a total ordering on resource allocation to prevent Circular Wait).
- **Avoidance:** Dynamically evaluate each resource allocation request to ensure the system remains in a safe state, typically using Dijkstra's Banker's Algorithm.
- **Detection and Recovery:** Periodically examine the Resource Allocation Graph (RAG) for cycles and terminate offending processes or preempt resources.

> **Key Placement Interview Consideration:** Highlight the architectural difference between deadlock prevention (static design constraints) and deadlock avoidance (dynamic runtime monitoring via Banker's Algorithm).`;

      speechFriendly = "A deadlock occurs when processes hold resources while waiting for resources held by others. The four Coffman conditions are mutual exclusion, hold and wait, no preemption, and circular wait.";

    } else if (qLower.includes('trie') || qLower.includes('prefix tree')) {
      responseMarkdown = `### Trie (Prefix Tree) Data Structure

A **Trie** (derived from retrieval) is an advanced tree data structure engineered for efficient string storage, dictionary lookups, and prefix-based search queries.

#### Structural Characteristics:
- **Node Anatomy:** Each Trie node contains an array of child pointers (typically size 26 for lowercase English letters) and a boolean flag (\`isEndOfWord\`) signifying word termination.
- **Time Complexity:**
  - Search: $O(L)$ where $L$ is the length of the query string.
  - Insert: $O(L)$ where $L$ is word length.
  - Prefix Matching: $O(P)$ where $P$ is prefix length.
- **Space Complexity:** $O(\\text{Alphabet Size} \\times L \\times N)$, representing a classic space-for-time trade-off.

#### Industry Applications:
- Search engine query auto-completion and type-ahead suggestions.
- Spell checking and predictive text entry.
- IP routing using Longest Prefix Matching (LPM).

> **Key Placement Interview Consideration:** When asked why a Trie is superior to a Hash Table for string lookups, point out that a Trie supports fast prefix searches (\`startsWith\`) in $O(P)$ time and avoids hash collisions and costly string hash recalculations.`;

      speechFriendly = "A Trie or prefix tree is a tree data structure used for efficient string retrieval and prefix searching, delivering O of L search and insert time complexity where L is the string length.";

    } else if (
      qLower.includes('dsu') ||
      qLower.includes('union find') ||
      qLower.includes('disjoint set') ||
      qLower.includes('path compression') ||
      qLower.includes('union by rank')
    ) {
      responseMarkdown = `### Disjoint Set Union (DSU / Union-Find)

The **Disjoint Set Union (DSU)** data structure maintains a collection of non-overlapping sets and supports two primary operations: **Find** (determining which set an element belongs to) and **Union** (merging two distinct sets).

#### High-Performance Optimizations:
1. **Find with Path Compression:**
   - Flattens the tree structure during find operations by making every visited node point directly to the representative root node.
2. **Union by Rank / Size:**
   - Always attaches the root of the smaller tree under the root of the larger tree, preventing unbalanced chains.

#### Time Complexity:
- With both optimizations, any sequence of $M$ operations on $N$ elements executes in $O(M \\cdot \\alpha(N))$ time, where $\\alpha$ is the extremely slow-growing **Inverse Ackermann Function**. For all practical engineering values ($N \\le 10^{80}$), $\\alpha(N) < 5$, effectively yielding **nearly $O(1)$ amortized time**.

> **Key Placement Interview Consideration:** DSU is the foundational algorithm behind Kruskal's Minimum Spanning Tree (MST) and undirected graph cycle detection. Always state the $O(\\alpha(N))$ time complexity in interviews.`;

      speechFriendly = "Disjoint Set Union manages partitioned sets with Find and Union operations. With Union by Rank and Path Compression, operations run in nearly O of 1 amortized time using the inverse Ackermann function.";

    } else if (
      qLower.includes('double hashing') ||
      qLower.includes('separate chaining') ||
      qLower.includes('open addressing') ||
      qLower.includes('load factor') ||
      (qLower.includes('hash') && (qLower.includes('collision') || qLower.includes('table') || qLower.includes('map')))
    ) {
      responseMarkdown = `### Hashing & Collision Resolution Strategies

A **Hash Table** stores key-value pairs and computes an index into an array of buckets using a hash function, aiming for $O(1)$ average-case search, insertion, and deletion.

#### Collision Resolution Mechanisms:
1. **Separate Chaining (Open Hashing):**
   - Each bucket references a linked list (or balanced BST) of colliding records.
   - Handles high load factors gracefully without running out of slots.
2. **Open Addressing (Closed Hashing):**
   - All elements reside directly within the hash table array itself.
   - **Linear Probing:** $h(k, i) = (h(k) + i) \\bmod m$. Simple, but suffers from **Primary Clustering**.
   - **Quadratic Probing:** $h(k, i) = (h(k) + c_1 i + c_2 i^2) \\bmod m$. Eliminates primary clustering but suffers from **Secondary Clustering**.
   - **Double Hashing:** $h(k, i) = (h_1(k) + i \\cdot h_2(k)) \\bmod m$. Uses a secondary hash function to eliminate both primary and secondary clustering. $h_2(k)$ must be relatively prime to table size $m$.

#### Load Factor & Rehashing:
$$\\text{Load Factor } (\\alpha) = \\frac{n}{m} = \\frac{\\text{Total Elements}}{\\text{Total Slots}}$$
- When $\\alpha$ exceeds a threshold (typically 0.75 in production libraries), the table dynamically doubles its capacity and **rehashes** all existing entries.

> **Key Placement Interview Consideration:** In interviews, explain why $h_2(k)$ in double hashing must never return 0 (which would cause an infinite loop at the initial collision slot) and why table size $m$ is ideally chosen as a prime number.`;

      speechFriendly = "Hashing maps keys to table indices in O of 1 average time. Collisions are resolved using Separate Chaining or Open Addressing such as Double Hashing, which eliminates primary and secondary clustering.";

    } else if (qLower.includes('binary search')) {
      responseMarkdown = `### Binary Search Algorithm

**Binary Search** is an optimal divide-and-conquer searching algorithm designed to locate a target element within a sorted array.

#### Operational Principles:
1. **Prerequisite:** The input sequence must be strictly monotonically ordered (sorted).
2. **Mechanism:** Compute the midpoint, compare with target:
   - If target equals mid: return index.
   - If target is smaller: recurse on the left half.
   - If target is larger: recurse on the right half.
3. **Midpoint Calculation:** Always calculate midpoint as $\\text{mid} = \\text{low} + \\frac{\\text{high} - \\text{low}}{2}$ to prevent integer arithmetic overflow in languages like C++, Java, and C.

#### Complexities:
- **Time Complexity:** Best: $O(1)$, Average: $O(\\log n)$, Worst: $O(\\log n)$.
- **Space Complexity:** Iterative: $O(1)$, Recursive: $O(\\log n)$ call stack frames.

> **Key Placement Interview Consideration:** Interviewers look for whether you recognize the overflow bug with \`(low + high) / 2\` and whether you can apply binary search on answer spaces (e.g., Aggressive Cows, Book Allocation problem).`;

      speechFriendly = "Binary Search is a divide-and-conquer algorithm that finds a target in a sorted collection in O of log N time by repeatedly halving the search space.";

    } else if (
      qLower.includes('quicksort') ||
      qLower.includes('mergesort') ||
      qLower.includes('quick sort') ||
      qLower.includes('merge sort') ||
      (qLower.includes('sorting') && !qLower.includes('topological'))
    ) {
      responseMarkdown = `### Sorting Algorithms: QuickSort vs. MergeSort

| Feature | QuickSort | MergeSort |
| :--- | :--- | :--- |
| **Strategy** | Partition-based Divide & Conquer | Subarray Merging Divide & Conquer |
| **Best/Average Time** | $O(n \\log n)$ | $O(n \\log n)$ |
| **Worst Time** | $O(n^2)$ (sorted array, naive pivot) | $O(n \\log n)$ (guaranteed) |
| **Auxiliary Space** | $O(\\log n)$ call stack (in-place) | $O(n)$ temporary array memory |
| **Stability** | Not Stable (swaps over distances) | Strictly Stable (preserves relative order) |
| **Hardware Fit** | Superior cache locality | Preferred for linked lists and external disk sorting |

#### Avoiding QuickSort $O(n^2)$ Worst Case:
- Select a randomized pivot or use the median-of-three heuristic (first, middle, last).

> **Key Placement Interview Consideration:** When asked when MergeSort is preferred over QuickSort despite higher memory usage, mention stability requirements and scenarios where guaranteed $O(n \\log n)$ worst-case latency is mandatory (such as real-time operating systems).`;

      speechFriendly = "QuickSort is an in-place sort with O of N log N average time and superior cache locality, while MergeSort provides a stable guaranteed O of N log N sort requiring O of N auxiliary memory.";

    } else if (qLower.includes('master theorem') || (qLower.includes('recurrence') && qLower.includes('divide'))) {
      responseMarkdown = `### Master Theorem for Divide-and-Conquer Recurrences

The **Master Theorem** provides a direct asymptotic solution for divide-and-conquer recurrences of the form:
$$T(n) = a T(n/b) + f(n)$$
where $a \\ge 1$ is the number of subproblems, $b > 1$ is the subproblem shrinkage factor, and $f(n) = \\Theta(n^k \\log^p n)$ is the cost of dividing and combining.

#### The Three Core Cases:
1. **Case 1 (Work dominated by leaves):** If $\\log_b a > k$, then $T(n) = \\Theta(n^{\\log_b a})$.
2. **Case 2 (Work evenly distributed):** If $\\log_b a = k$:
   - If $p > -1$: $T(n) = \\Theta(n^k \\log^{p+1} n)$. (Example: MergeSort has $a=2, b=2, k=1, p=0 \\implies T(n) = \\Theta(n \\log n)$).
3. **Case 3 (Work dominated by root):** If $\\log_b a < k$ and regularity holds: $T(n) = \\Theta(f(n))$.

> **Key Placement Interview Consideration:** Interviewers test whether you recognize recurrences where Master Theorem does NOT apply—such as when $a$ is not constant, $b < 1$, or $f(n)$ is not polynomial (e.g., $T(n) = 2T(n/2) + n / \\log n$).`;

      speechFriendly = "The Master Theorem provides asymptotic solutions for divide-and-conquer recurrences by comparing the work at the leaf nodes with the work done dividing and combining subproblems.";

    } else if (
      qLower.includes('tcp') ||
      qLower.includes('handshake') ||
      qLower.includes('syn') ||
      qLower.includes('osi') ||
      qLower.includes('subnet') ||
      qLower.includes('dns') ||
      qLower.includes('udp')
    ) {
      responseMarkdown = `### Computer Networks: TCP Three-Way Handshake Protocol

The Transmission Control Protocol (TCP) establishes a reliable, bidirectional, connection-oriented session between client and server using a standardized three-step synchronization sequence:

1. **Step 1 (SYN):**
   - The client initiates connection by transmitting a packet with the SYN flag enabled and selects an Initial Sequence Number ($ISN = x$).
   - Client enters the \`SYN_SENT\` state.

2. **Step 2 (SYN-ACK):**
   - The server receives the SYN, acknowledges it by setting the ACK flag with acknowledgment number $x + 1$, and sets its own SYN flag with server $ISN = y$.
   - Server enters the \`SYN_RCVD\` state.

3. **Step 3 (ACK):**
   - The client transmits an ACK packet with acknowledgment number $y + 1$.
   - Both endpoints transition to the \`ESTABLISHED\` state and reliable payload transmission begins.

#### Security Mitigation: SYN Flood Defense:
- In a SYN flood attack, an attacker exhausts server connection backlogs by sending SYN packets without sending the final ACK.
- **Solution:** **SYN Cookies**, where the server does not allocate state memory until the final ACK arrives, encoding connection state inside the initial sequence number.

> **Key Placement Interview Consideration:** Technical interviewers frequently ask how TCP protects against SYN flood Denial of Service attacks; mention SYN Cookies as the primary mitigation mechanism where state is not allocated until the final ACK arrives.`;

      speechFriendly = "TCP establishes a reliable connection using a three-way handshake: SYN from client, SYN-ACK from server, and final ACK from client. SYN cookies mitigate SYN flood attacks.";

    } else if (qLower.includes('ale') && (qLower.includes('8085') || qLower.includes('microprocessor'))) {
      responseMarkdown = `### 8085 Microprocessor: Address Latch Enable (ALE) Function

In the 8085 microprocessor architecture, pins AD0 through AD7 are time-multiplexed to minimize the pin count on the 40-pin dual inline package (DIP).

#### Operational Mechanism:
- **Multiplexed Bus (AD0–AD7):** During clock cycle $T_1$ of a machine cycle, these pins carry the lower 8 bits of the memory address ($A_0-A_7$). During clock cycles $T_2$ and $T_3$, these same pins carry bidirectional data ($D_0-D_7$).
- **Role of the ALE Pin:** ALE is an active-high output signal generated during the $T_1$ state. The falling edge of ALE is used to trigger an external octal transparent latch (such as the 74LS373 IC).
- **Result:** The lower 8 address bits are latched and held stable on the address bus for the remainder of the read or write cycle, allowing the multiplexed pins to be repurposed for data transfer.

#### 8085 Interrupt Hierarchy:
- **TRAP (RST 4.5):** Highest priority, non-maskable, vectored at 0024H.
- **RST 7.5 > RST 6.5 > RST 5.5:** Maskable vectored interrupts.
- **INTR:** Lowest priority, non-vectored general interrupt.

> **Key Placement Interview Consideration:** Note that the upper address lines ($A_8-A_{15}$) are unidirectional and non-multiplexed, meaning demultiplexing hardware is only required for the lower byte.`;

      speechFriendly = "In the 8085 microprocessor, ALE is an active-high output that demultiplexes lower address lines AD0 to AD7 during clock state T1 using an external latch like 74LS373.";

    } else if (qLower.includes('thermodynamic') || qLower.includes('carnot') || qLower.includes('heat transfer') || qLower.includes('entropy')) {
      responseMarkdown = `### Mechanical Engineering: Laws of Thermodynamics & Carnot Cycle

Thermodynamics governs heat, work, and energy transformation across mechanical and thermal systems:

1. **Zeroth Law:** If systems A and B are each in thermal equilibrium with C, then A and B are in thermal equilibrium with each other (defines temperature).
2. **First Law (Energy Conservation):** $\\Delta Q = \\Delta U + \\Delta W$ (heat supplied equals change in internal energy plus work done).
3. **Second Law (Entropy & Directionality):**
   - **Clausius Statement:** Heat cannot spontaneously transfer from a cooler body to a hotter body without external work.
   - **Kelvin-Planck Statement:** No cyclic heat engine can convert 100% of absorbed heat entirely into mechanical work.
4. **Carnot Engine:** The ideal reversible cycle operating between heat reservoirs $T_H$ and $T_C$ with theoretical maximum thermal efficiency:
   $$\\eta_{\\text{Carnot}} = 1 - \\frac{T_C}{T_H}$$

> **Key Placement Interview Consideration:** Technical panels frequently ask why 100% thermal efficiency is physically impossible; cite the Kelvin-Planck statement of the Second Law of Thermodynamics.`;

      speechFriendly = "The laws of thermodynamics govern energy conservation and entropy. The Carnot cycle establishes the maximum theoretical efficiency for heat engines operating between thermal reservoirs.";

    } else if (
      qLower.includes('tcs') ||
      qLower.includes('infosys') ||
      qLower.includes('wipro') ||
      qLower.includes('capgemini') ||
      qLower.includes('amazon') ||
      qLower.includes('star method')
    ) {
      responseMarkdown = `### Campus Placement Technical Preparation Strategy

Campus recruitment drives for IT services and product engineering companies evaluate candidates across foundational and analytical dimensions:

1. **Online Assessment Structure:**
   - **Cognitive Section:** Quantitative ability, logical reasoning, and verbal aptitude.
   - **Coding Section:** Two to three algorithmic problems focusing on string manipulation, array sliding windows, hashing, and frequency counting.

2. **Technical Interview Core Topics:**
   - **Object-Oriented Programming:** Encapsulation, inheritance, polymorphism, and abstraction with practical code examples.
   - **DBMS:** SQL joins, aggregation, normalization, and indexing.
   - **Data Structures:** Linked lists, stacks, queues, binary search trees, and basic recursion.
   - **Project Architecture:** Ability to explain project schema, API design, and trade-offs made during development.

3. **Behavioral Interviews (STAR Method):**
   - **Situation:** Set the engineering context.
   - **Task:** Identify your specific responsibility.
   - **Action:** Describe the technical solution you designed and implemented.
   - **Result:** Quantify the business impact, latency improvement, or metric gained.

> **Key Placement Interview Consideration:** Technical panels place significant emphasis on algorithmic clarity and code explainability. Always trace your code with test cases before declaring a solution complete.`;

      speechFriendly = "Campus placement drives evaluate programming, data structures, DBMS, and OOP concepts. Be prepared to explain code line-by-line and trace edge cases.";

    } else if (qLower.includes('two sum') || (qLower.includes('hint') && qLower.includes('sum'))) {
      responseMarkdown = `### Two Sum Problem: Algorithmic Hint & Strategy
      
To solve **Two Sum** efficiently without an $O(n^2)$ brute-force nested loop:

#### 1. Core Algorithmic Hint:
- Instead of searching for all pairs $(nums[i], nums[j])$, think about what value is needed to reach the target: $\\text{complement} = \\text{target} - nums[i]$.
- As you iterate through the array, can you look up whether you have already seen the complement in $O(1)$ time?

#### 2. Optimal Data Structure:
- Use a **Hash Map** (or dictionary) that maps each number's value to its array index: \`{ value: index }\`.
- For each element at index $i$:
  1. Calculate $\\text{diff} = \\text{target} - nums[i]$.
  2. If $\\text{diff}$ exists in the Hash Map, return $[\\text{map}[\\text{diff}], i]$.
  3. Otherwise, insert $nums[i]$ with index $i$ into the map.

#### 3. Complexity:
- **Time Complexity:** $O(n)$ with a single pass over the array.
- **Space Complexity:** $O(n)$ auxiliary space to store the hash map entries.

> **Interview Tip:** Always clarify whether the input array is sorted (if sorted, Two-Pointer technique can achieve $O(1)$ space) and whether duplicate elements or multiple valid pairs can exist.`;

      speechFriendly = "For Two Sum, use a hash map to store each number and its index. As you iterate, check if the complement, target minus current number, exists in the map in O of 1 time.";

    } else if (
      qLower.includes('oops') ||
      qLower.includes('object-oriented') ||
      qLower.includes('object oriented') ||
      (qLower.includes('oop') && !qLower.includes('loop')) ||
      (qLower.includes('pillar') && qLower.includes('oop'))
    ) {
      responseMarkdown = `### Core Pillars of Object-Oriented Programming (OOP)

Object-Oriented Programming organizes software design around data, or objects, rather than functions and logic.

#### The Four Core Pillars:
1. **Encapsulation:**
   - Bundling data (attributes) and methods that operate on that data into a single unit (class).
   - Restricting direct external access to internal object components using access modifiers (\`private\`, \`protected\`, \`public\`) and exposing getter/setter methods.
2. **Abstraction:**
   - Hiding complex background implementation details and exposing only essential functional interfaces to users (e.g., using Abstract Classes and Interfaces).
3. **Inheritance:**
   - Mechanism where a subclass derives attributes and behaviors from a superclass, facilitating code reusability and establishing "IS-A" relationships.
4. **Polymorphism:**
   - Ability of entities to take on multiple forms:
     - **Compile-Time (Static):** Method Overloading (same method name, different parameter signatures).
     - **Run-Time (Dynamic):** Method Overriding (subclass provides specific implementation of superclass method resolved dynamically at runtime).

> **Key Placement Interview Consideration:** Interviewers frequently ask you to contrast Abstract Classes with Interfaces: An abstract class can have state and non-abstract methods, whereas an interface historically defines purely functional contracts (with default methods in modern Java).`;

      speechFriendly = "The four pillars of Object-Oriented Programming are Encapsulation for data hiding, Abstraction for interface design, Inheritance for code reusability, and Polymorphism for flexible behaviors.";

    } else if (
      qLower.includes('java') ||
      (qLower.includes('heap') && qLower.includes('stack')) ||
      qLower.includes('jvm')
    ) {
      responseMarkdown = `### Java Architecture: JVM Memory Model (Heap vs. Stack)

The Java Virtual Machine (JVM) divides runtime data memory into distinct logical regions:

#### 1. Stack Memory:
- **Allocation:** Per-thread execution memory allocated in LIFO (Last-In, First-Out) order.
- **Contents:** Stores method call frames, local primitive variables (\`int\`, \`boolean\`), and object reference handles.
- **Lifecycle:** Automatically allocated when a method is invoked and deallocated immediately upon method return.
- **Characteristics:** Fast access; finite size (can trigger \`StackOverflowError\` on deep recursion).

#### 2. Heap Memory:
- **Allocation:** Shared memory region across all threads created on JVM startup.
- **Contents:** Stores all instantiated class objects and arrays.
- **Lifecycle:** Managed dynamically by the automated Garbage Collector (Young Generation / Eden, Survivor spaces, and Tenured Old Generation).
- **Characteristics:** Slower allocation than stack; can trigger \`OutOfMemoryError\` if memory is exhausted.

#### 3. Metaspace (formerly PermGen):
- Resides in native memory; stores class definitions, method metadata, and constant pools.

> **Key Placement Interview Consideration:** Remember: *Primitives and references live on the stack; all actual objects reside on the heap.* In Java, all object arguments are passed by value (where the value is the reference address).`;

      speechFriendly = "In the Java memory model, Stack memory stores local primitive variables and method call frames per thread, while Heap memory stores all instantiated objects managed by garbage collection.";

    } else if (topDoc && topDocRelevance >= 0.14) {
      // B. Dynamic Extractive Grounded Answering from Database RAG Document
      // Extract the most relevant section/paragraph that answers the student's question
      const rawContent = topDoc.content || '';
      const paragraphs = rawContent
        .split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(p => p.length > 20);

      // When candidate asks for a conceptual definition, prioritize conceptual text over company assessment lists
      const isConceptualQuery = qLower.includes('what is') || qLower.includes('define') || qLower.includes('explain') || qLower.includes('how does') || qLower.includes('why');
      const filteredParagraphs = isConceptualQuery
        ? paragraphs.filter(p => !p.toLowerCase().includes('top repeated coding patterns') && !p.toLowerCase().includes('blueprint'))
        : paragraphs;
      const candidateParagraphs = filteredParagraphs.length > 0 ? filteredParagraphs : paragraphs;

      const queryTokens = tokenize(q);
      let bestSection = candidateParagraphs[0] || rawContent;
      let maxSectionScore = -1;

      for (const section of candidateParagraphs) {
        const sectionTokens = tokenize(section);
        const score = calculateCosineSimilarity(queryTokens, sectionTokens);
        if (score > maxSectionScore) {
          maxSectionScore = score;
          bestSection = section;
        }
      }

      // Only dump extractive paragraph if there is genuine token match in the section
      if (maxSectionScore > 0.04) {
        const company = topDoc.company_id ? db.get('companies', topDoc.company_id)?.name : null;
        const subject = topDoc.subject_id ? db.get('subjects', topDoc.subject_id)?.name : null;

        responseMarkdown = `### ${q.charAt(0).toUpperCase() + q.slice(1)}

${bestSection}

#### Curriculum Context:
- **Domain:** ${subject || topDoc.category || 'Engineering Fundamentals'}${company ? ` | **Target Pattern:** ${company}` : ''}
- **Placement Relevance:** High-yield conceptual topic tested in technical interview rounds and campus assessments.

> **Key Placement Interview Consideration:** In campus technical interviews, state the formal academic definition clearly, explain runtime and system trade-offs, and trace an illustrative example with standard edge cases.`;

        // Extract 2 clean sentences for natural spoken audio
        const cleanParaLines = bestSection
          .replace(/^[0-9]+[.)]\s*/gm, '')
          .replace(/^[-*]\s*/gm, '')
          .replace(/[:]/g, '.')
          .split(/[.\n]+/)
          .map(s => s.trim())
          .filter(s => s.length > 15);

        speechFriendly = cleanParaLines.slice(0, 2).join('. ');
        if (speechFriendly && !speechFriendly.endsWith('.')) {
          speechFriendly += '.';
        }
        if (!speechFriendly || speechFriendly.length < 20) {
          speechFriendly = `${topDoc.title}. Focus on the core definition, runtime trade-offs, and time complexity.`;
        }
      } else {
        responseMarkdown = `### Placement Preparation Analysis: ${q.charAt(0).toUpperCase() + q.slice(1)}

When approaching technical interview inquiries regarding this topic, candidates are evaluated on three structured dimensions:

1. **Theoretical Definition & Core Principles:** State the formal definition clearly, avoiding colloquial terms or filler statements.
2. **System Mechanics & Trade-offs:** Explain the runtime behavior, architectural constraints, and the associated time and space complexities.
3. **Enterprise Implementation:** Describe how this concept is deployed in production systems or standard algorithmic libraries.

> **Key Placement Interview Consideration:** Structure your answer by first stating the definition, then walking through an illustrative example, and finally addressing edge cases and performance trade-offs.`;

        speechFriendly = `Regarding ${q}, structure your technical interview response with a formal definition, practical trade-offs, and clear complexity analysis.`;
      }

    } else {
      // C. General Technical Mentorship Structure
      responseMarkdown = `### Technical Assessment: ${q.charAt(0).toUpperCase() + q.slice(1)}

When approaching technical interview inquiries regarding this concept, candidates are evaluated on three structured dimensions:

1. **Theoretical Definition:** State the formal computer science definition clearly, avoiding colloquial terms or filler statements.
2. **System Mechanics & Trade-offs:** Explain the runtime behavior, architectural constraints, and the associated time and space complexities.
3. **Enterprise Implementation:** Describe how this concept is deployed in production systems or standard algorithmic libraries.

> **Key Placement Interview Consideration:** Structure your answer by first stating the definition, then walking through an illustrative example, and finally addressing edge cases and performance trade-offs.`;

      speechFriendly = `Regarding ${q}, structure your technical interview response with a formal definition, practical trade-offs, and clear complexity analysis.`;
    }

    return {
      answer: responseMarkdown,
      speechText: speechFriendly,
      retrievedDocuments: retrievedDocs.map(d => ({
        id: d.id,
        title: d.title,
        category: d.category,
        relevanceScore: Math.round(d.similarityScore * 100)
      })),
      sources,
      model: validModel,
      isLiveApi: false
    };
  }
}

export default RagService;
