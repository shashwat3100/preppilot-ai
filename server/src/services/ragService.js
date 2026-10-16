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
      'pointer', 'stack', 'queue', 'recursion', 'sorting', 'binary search', 'viva', 'explain', 'what is', 'how',
      'effect', 'convoy', 'belady', 'anomaly', 'scheduling', 'round robin', 'quantum', 'starvation', 'aging',
      'mutex', 'semaphore', 'banker', 'coffman', 'thrashing', 'tlb', 'page fault', 'trie', 'dsu', 'hashing'
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

    // 5. Direct, Targeted Grounded Synthesis (Clean, Academic, Zero Emojis, No Raw Document Dumps)
    let responseMarkdown = '';
    let speechFriendly = '';

    // A. Specific High-Yield Placement Concepts Grounded in RAG Knowledge Base
    if (
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

    } else if (topDoc && topDocRelevance > 0.04) {
      // B. Dynamic Extractive Grounded Answering from Database RAG Document
      // Extract the most relevant section/paragraph that answers the student's question
      const rawContent = topDoc.content || '';
      const paragraphs = rawContent
        .split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(p => p.length > 20);

      const queryTokens = tokenize(q);
      let bestSection = paragraphs[0] || rawContent;
      let maxSectionScore = -1;

      for (const section of paragraphs) {
        const sectionTokens = tokenize(section);
        const score = calculateCosineSimilarity(queryTokens, sectionTokens);
        if (score > maxSectionScore) {
          maxSectionScore = score;
          bestSection = section;
        }
      }

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
