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

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !STOP_WORDS.has(token));
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
    // Allow greetings and orientation questions
    const greetings = ['hi', 'hello', 'hey', 'start', 'begin', 'help', 'what can we do', 'who are you', 'how can you help', 'good morning', 'good afternoon', 'good evening'];
    if (greetings.some(g => q.startsWith(g) || q.includes(g))) {
      return true;
    }

    const allowedKeywords = [
      'dbms', 'sql', 'dsa', 'algorithm', 'tree', 'array', 'graph', 'dynamic programming',
      'operating system', 'linux', 'deadlock', 'paging', 'virtual memory', 'process', 'thread',
      'network', 'tcp', 'ip', 'osi', 'http', 'dns', 'router', 'subnet',
      'oop', 'java', 'c++', 'python', 'polymorphism', 'inheritance', 'interface', 'class',
      'tcs', 'infosys', 'wipro', 'accenture', 'capgemini', 'cognizant', 'amazon', 'google', 'microsoft',
      'interview', 'placement', 'quiz', 'btech', 'engineering', 'branch', 'ece', 'electrical',
      'mechanical', 'civil', 'chemical', 'microprocessor', '8085', 'circuit', 'transformer',
      'thermodynamics', 'fluid', 'formula', 'complexity', 'normalize', 'acid', 'normal form',
      'pointer', 'stack', 'queue', 'recursion', 'sorting', 'binary search', 'viva', 'explain', 'what is', 'how'
    ];

    return allowedKeywords.some(kw => q.includes(kw)) || query.trim().split(/\s+/).length >= 2;
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

      let similarity = Math.max(
        calculateCosineSimilarity(queryTokens, docTokens),
        coverage(docSet) * 0.14,
        coverage(titleSet) * 0.2,
        coverage(keywordSet) * 0.22
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
Style Guidelines:
1. Be professional, academic, direct, and concise. Do NOT sound like an automated robotic template.
2. Under NO circumstance use emojis or casual filler phrases. Maintain a polished, professional engineering tone.
3. Structure your response clearly using standard Markdown:
   - Use ### for primary section headers.
   - Use clean numbered lists for sequential mechanisms or steps.
   - Use bullet points for parallel characteristics.
   - For code, always use proper fenced blocks (\`\`\`python, \`\`\`cpp, \`\`\`java, \`\`\`sql).
4. If addressing interview questions, include a concluding callout block (> Key Technical Consideration:) explaining what technical recruiters evaluate.
5. Ground your answer with relevant syllabus concepts.

Relevant Reference Documents:
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
        const speechFriendly = text
          .replace(/[#*`>_]/g, '')
          .replace(/\n+/g, ' ')
          .slice(0, 300);

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

    // 5. High-Precision Professional Grounded Synthesis (Clean, Academic, Zero Emojis)
    let responseMarkdown = '';
    let speechFriendly = '';

    if (topDoc && topDocRelevance > 0.08) {
      const company = topDoc.company_id ? db.get('companies', topDoc.company_id)?.name : null;
      const subject = topDoc.subject_id ? db.get('subjects', topDoc.subject_id)?.name : null;

      responseMarkdown = `### ${topDoc.title}\n\n`;
      if (subject || company) {
        responseMarkdown += `**Curriculum Domain:** ${subject || 'Engineering'}${company ? ` | **Target Pattern:** ${company}` : ''}\n\n`;
      }
      if (topDoc.summary) {
        responseMarkdown += `${topDoc.summary}\n\n`;
      }
      responseMarkdown += `#### Technical Explanation:\n${topDoc.content.trim()}\n\n`;
      responseMarkdown += `> **Key Interview Consideration:** In campus placement technical rounds, interviewers evaluate whether candidates provide formal academic definitions, discuss underlying data structures or system constraints, and state time and space complexities upfront.`;

      speechFriendly = `${topDoc.title}. ${topDoc.summary || ''} In technical interviews, provide the formal definition, discuss trade-offs, and state complexity upfront.`;
    } else {
      // Direct, tailored technical answers without boilerplate template filler
      if (qLower.includes('normalize') || qLower.includes('normalization') || qLower.includes('3nf') || qLower.includes('2nf') || qLower.includes('1nf') || qLower.includes('bcnf')) {
        responseMarkdown = `### Database Normalization (1NF to BCNF)

Database normalization is a systematic technique for designing relational database schemas that minimizes data redundancy and eliminates update, insertion, and deletion anomalies.

#### Normal Form Progression:
1. **First Normal Form (1NF):**
   - Each table cell must contain a single atomic value.
   - Disallows repeating groups or multi-valued attributes in a single tuple.

2. **Second Normal Form (2NF):**
   - Must satisfy 1NF.
   - Eliminates partial functional dependency: Every non-key attribute must depend fully on the complete primary key, not on a subset of a composite primary key.

3. **Third Normal Form (3NF):**
   - Must satisfy 2NF.
   - Eliminates transitive functional dependency: No non-prime attribute may depend on another non-prime attribute. Formally, for $X \\rightarrow Y$, either $X$ is a super key or $Y$ is a prime attribute.

4. **Boyce-Codd Normal Form (BCNF):**
   - Stricter form of 3NF. For every non-trivial functional dependency $X \\rightarrow Y$, $X$ must strictly be a super key.

> **Key Interview Consideration:** When asked why enterprise systems frequently standardize on 3NF rather than BCNF, note that 3NF preserves all functional dependencies alongside lossless join decomposition, whereas BCNF may require sacrificing dependency preservation in complex schemas.`;

        speechFriendly = "Database normalization minimizes redundancy and eliminates data anomalies through successive normal forms from 1NF to BCNF.";
      } else if (qLower.includes('acid') || qLower.includes('transaction')) {
        responseMarkdown = `### ACID Properties in Relational Database Management Systems

In database transactions, the ACID properties guarantee data validity and consistency despite errors, power failures, or concurrent execution:

1. **Atomicity:**
   - Ensures all operations within a transaction unit execute completely or none do.
   - Managed via the DBMS recovery manager and write-ahead logging (WAL) using commit and rollback operations.

2. **Consistency:**
   - Guarantees the database transitions from one valid state to another, satisfying all schema rules, foreign keys, and integrity constraints.

3. **Isolation:**
   - Controls concurrent transaction execution so intermediate states remain invisible to other transactions.
   - Implemented using concurrency control mechanisms such as two-phase locking (2PL) and multi-version concurrency control (MVCC).

4. **Durability:**
   - Guarantees that once a transaction commits, its modifications persist permanently in non-volatile storage, even during system crashes.

> **Key Interview Consideration:** Expect questions comparing isolation levels—Read Uncommitted, Read Committed, Repeatable Read, and Serializable—and the concurrency phenomena they prevent (Dirty Read, Non-Repeatable Read, and Phantom Read).`;

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

> **Key Interview Consideration:** Highlight the architectural difference between deadlock prevention (static design constraints) and deadlock avoidance (dynamic runtime monitoring via Banker's Algorithm).`;

        speechFriendly = "A deadlock occurs when processes hold resources while waiting for resources held by others. The four Coffman conditions are mutual exclusion, hold and wait, no preemption, and circular wait.";
      } else if (qLower.includes('tcp') || qLower.includes('handshake')) {
        responseMarkdown = `### Computer Networks: TCP Three-Way Handshake Protocol

The Transmission Control Protocol (TCP) establishes a reliable, bidirectional connection between client and server using a standardized three-step synchronization sequence:

1. **Step 1 (SYN):**
   - The client initiates the connection by transmitting a packet with the SYN flag enabled and selects an Initial Sequence Number ($ISN = x$).
   - Client enters the \`SYN_SENT\` state.

2. **Step 2 (SYN-ACK):**
   - The server receives the SYN, acknowledges it by setting the ACK flag with acknowledgment number $x + 1$, sets its own SYN flag with server $ISN = y$.
   - Server enters the \`SYN_RCVD\` state.

3. **Step 3 (ACK):**
   - The client transmits an ACK packet with acknowledgment number $y + 1$.
   - Both client and server transition to the \`ESTABLISHED\` state and reliable payload transmission begins.

> **Key Interview Consideration:** Technical interviewers frequently ask how TCP protects against SYN flood Denial of Service attacks; mention SYN Cookies as the primary mitigation mechanism where state is not allocated until the final ACK arrives.`;

        speechFriendly = "TCP establishes a reliable connection using a three-way handshake: SYN from client, SYN-ACK from server, and final ACK from client.";
      } else if (qLower.includes('ale') && (qLower.includes('8085') || qLower.includes('microprocessor'))) {
        responseMarkdown = `### 8085 Microprocessor: Address Latch Enable (ALE) Function

In the 8085 microprocessor architecture, pins AD0 through AD7 are time-multiplexed to minimize the pin count on the 40-pin dual inline package (DIP).

#### Operational Mechanism:
- **Multiplexed Bus (AD0–AD7):** During clock cycle $T_1$ of a machine cycle, these pins carry the lower 8 bits of the memory address ($A_0-A_7$). During clock cycles $T_2$ and $T_3$, these same pins carry bidirectional data ($D_0-D_7$).
- **Role of the ALE Pin:** ALE is an active-high output signal generated during the $T_1$ state. The falling edge of ALE is used to trigger an external octal transparent latch (such as the 74LS373 IC).
- **Result:** The lower 8 address bits are latched and held stable on the address bus for the remainder of the read or write cycle, allowing the multiplexed pins to be repurposed for data transfer.

> **Key Interview Consideration:** Note that the upper address lines ($A_8-A_{15}$) are unidirectional and non-multiplexed, meaning demultiplexing hardware is only required for the lower byte.`;

        speechFriendly = "In the 8085 microprocessor, ALE is an active-high output that demultiplexes lower address lines AD0 to AD7 during clock state T1 using an external latch like 74LS373.";
      } else if (qLower.includes('tcs') || qLower.includes('infosys') || qLower.includes('wipro') || qLower.includes('capgemini')) {
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

> **Key Interview Consideration:** Technical panels place significant emphasis on algorithmic clarity and code explainability. Always trace your code with test cases before declaring a solution complete.`;

        speechFriendly = "Campus placement drives evaluate programming, data structures, DBMS, and OOP concepts. Be prepared to explain code line-by-line and trace edge cases.";
      } else {
        responseMarkdown = `### Technical Assessment: ${q.charAt(0).toUpperCase() + q.slice(1)}

When approaching technical interview inquiries regarding this concept, candidates are evaluated on three structured dimensions:

1. **Theoretical Definition:** State the formal computer science definition clearly, avoiding colloquial terms or filler statements.
2. **System Mechanics & Trade-offs:** Explain the runtime behavior, architectural constraints, and the associated time and space complexities.
3. **Enterprise Implementation:** Describe how this concept is deployed in production systems or standard algorithmic libraries.

> **Key Interview Consideration:** Structure your answer by first stating the definition, then walking through an illustrative example, and finally addressing edge cases and performance trade-offs.`;

        speechFriendly = `Regarding ${q}, structure your technical interview response with a formal definition, practical trade-offs, and clear complexity analysis.`;
      }
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
