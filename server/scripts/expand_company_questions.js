import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDbFilePath } from '../src/database/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = getDbFilePath();

const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Additional Company-Specific Placement MCQs
const newCompanyQuestions = [
  // --- INFOSYS QUESTIONS ---
  {
    id: 'q-inf-01',
    subject_id: 'sub-dsa',
    topic_id: 'top-dsa-trees',
    company_id: 'comp-infosys',
    question: 'In Infosys DSE/SP technical round: What is the maximum number of nodes in a binary tree of depth k (considering root depth as 1)?',
    options: [
      { id: 'opt-inf-01-a', option_key: 'A', option_text: '2^k - 1' },
      { id: 'opt-inf-01-b', option_key: 'B', option_text: '2^(k-1)' },
      { id: 'opt-inf-01-c', option_key: 'C', option_text: '2^(k+1) - 1' },
      { id: 'opt-inf-01-d', option_key: 'D', option_text: '2^k + 1' }
    ],
    correct_answer: 'A',
    explanation: 'A full binary tree of depth k has at most 2^k - 1 nodes (sum of 2^0 + 2^1 + ... + 2^(k-1) = 2^k - 1).',
    difficulty: 'Easy',
    question_type: 'MCQ',
    expected_time: 45,
    xp_value: 20
  },
  {
    id: 'q-inf-02',
    subject_id: 'sub-oop',
    topic_id: 'top-oop-poly',
    company_id: 'comp-infosys',
    question: 'In Infosys Java assessment: Which of the following cannot be declared as static in Java?',
    options: [
      { id: 'opt-inf-02-a', option_key: 'A', option_text: 'Class constructor' },
      { id: 'opt-inf-02-b', option_key: 'B', option_text: 'Nested class' },
      { id: 'opt-inf-02-c', option_key: 'C', option_text: 'Block of code' },
      { id: 'opt-inf-02-d', option_key: 'D', option_text: 'Member method' }
    ],
    correct_answer: 'A',
    explanation: 'Constructors in Java cannot be declared static because a constructor is invoked specifically to initialize a newly created instance of the object.',
    difficulty: 'Easy',
    question_type: 'MCQ',
    expected_time: 40,
    xp_value: 20
  },
  {
    id: 'q-inf-03',
    subject_id: 'sub-aptitude',
    topic_id: 'top-apt-quant',
    company_id: 'comp-infosys',
    question: 'Infosys Mathematical Reasoning: If a train running at 72 km/hr crosses an electric pole in 15 seconds, what is the length of the train?',
    options: [
      { id: 'opt-inf-03-a', option_key: 'A', option_text: '300 meters' },
      { id: 'opt-inf-03-b', option_key: 'B', option_text: '250 meters' },
      { id: 'opt-inf-03-c', option_key: 'C', option_text: '320 meters' },
      { id: 'opt-inf-03-d', option_key: 'D', option_text: '180 meters' }
    ],
    correct_answer: 'A',
    explanation: 'Speed in m/s = 72 * (5/18) = 20 m/s. Distance (length) = Speed * Time = 20 m/s * 15 s = 300 meters.',
    difficulty: 'Easy',
    question_type: 'MCQ',
    expected_time: 50,
    xp_value: 20
  },
  {
    id: 'q-inf-04',
    subject_id: 'sub-dbms',
    topic_id: 'top-dbms-sql',
    company_id: 'comp-infosys',
    question: 'In an Infosys technical interview, what is the fundamental difference between the WHERE clause and the HAVING clause in SQL?',
    options: [
      { id: 'opt-inf-04-a', option_key: 'A', option_text: 'WHERE filters individual rows before grouping; HAVING filters aggregate groups after GROUP BY.' },
      { id: 'opt-inf-04-b', option_key: 'B', option_text: 'WHERE filters groups; HAVING filters columns.' },
      { id: 'opt-inf-04-c', option_key: 'C', option_text: 'WHERE can only use aggregate functions like SUM and AVG.' },
      { id: 'opt-inf-04-d', option_key: 'D', option_text: 'There is no difference; they are strictly interchangeable.' }
    ],
    correct_answer: 'A',
    explanation: 'WHERE filters rows before any group-by operation takes place. HAVING filters summary groups calculated by aggregate functions (e.g. HAVING COUNT(*) > 5).',
    difficulty: 'Medium',
    question_type: 'MCQ',
    expected_time: 45,
    xp_value: 25
  },

  // --- ACCENTURE QUESTIONS ---
  {
    id: 'q-acc-01',
    subject_id: 'sub-cn',
    topic_id: 'top-cn-protocols',
    company_id: 'comp-accenture',
    question: 'Accenture Cloud & Networking Round: Which protocol operates on UDP port 53 to translate human-readable domain names into IP addresses?',
    options: [
      { id: 'opt-acc-01-a', option_key: 'A', option_text: 'DNS (Domain Name System)' },
      { id: 'opt-acc-01-b', option_key: 'B', option_text: 'DHCP (Dynamic Host Configuration Protocol)' },
      { id: 'opt-acc-01-c', option_key: 'C', option_text: 'SNMP (Simple Network Management Protocol)' },
      { id: 'opt-acc-01-d', option_key: 'D', option_text: 'ARP (Address Resolution Protocol)' }
    ],
    correct_answer: 'A',
    explanation: 'DNS uses UDP port 53 for standard name queries because of low overhead and fast query-response times.',
    difficulty: 'Easy',
    question_type: 'MCQ',
    expected_time: 35,
    xp_value: 20
  },
  {
    id: 'q-acc-02',
    subject_id: 'sub-dsa',
    topic_id: 'top-dsa-arrays',
    company_id: 'comp-accenture',
    question: 'Accenture Coding Section: What is the optimal time complexity to find the maximum sum contiguous subarray in an array of n integers (Kadane\'s Algorithm)?',
    options: [
      { id: 'opt-acc-02-a', option_key: 'A', option_text: 'O(n) time and O(1) space' },
      { id: 'opt-acc-02-b', option_key: 'B', option_text: 'O(n log n) time and O(n) space' },
      { id: 'opt-acc-02-c', option_key: 'C', option_text: 'O(n^2) time and O(1) space' },
      { id: 'opt-acc-02-d', option_key: 'D', option_text: 'O(log n) time and O(1) space' }
    ],
    correct_answer: 'A',
    explanation: 'Kadane\'s algorithm iterates through the array once keeping track of the max ending here and max so far, achieving linear O(n) time with constant O(1) auxiliary space.',
    difficulty: 'Medium',
    question_type: 'MCQ',
    expected_time: 45,
    xp_value: 25
  },
  {
    id: 'q-acc-03',
    subject_id: 'sub-os',
    topic_id: 'top-os-sched',
    company_id: 'comp-accenture',
    question: 'Accenture Technical Interview: What CPU scheduling algorithm suffers from the Convoy Effect?',
    options: [
      { id: 'opt-acc-03-a', option_key: 'A', option_text: 'FCFS (First-Come, First-Served)' },
      { id: 'opt-acc-03-b', option_key: 'B', option_text: 'Round Robin' },
      { id: 'opt-acc-03-c', option_key: 'C', option_text: 'Shortest Job First (Preemptive)' },
      { id: 'opt-acc-03-d', option_key: 'D', option_text: 'Multilevel Queue' }
    ],
    correct_answer: 'A',
    explanation: 'In FCFS, when a long CPU-bound process holds the processor, shorter I/O-bound processes are forced to wait in the ready queue, creating the convoy effect and poor CPU utilization.',
    difficulty: 'Easy',
    question_type: 'MCQ',
    expected_time: 40,
    xp_value: 20
  },

  // --- AMAZON QUESTIONS ---
  {
    id: 'q-amz-01',
    subject_id: 'sub-dsa',
    topic_id: 'top-dsa-trees',
    company_id: 'comp-amazon',
    question: 'Amazon SDE-1 Technical Round: You are given a binary search tree. What traversal order outputs the elements in strictly sorted ascending order?',
    options: [
      { id: 'opt-amz-01-a', option_key: 'A', option_text: 'In-order traversal (Left, Root, Right)' },
      { id: 'opt-amz-01-b', option_key: 'B', option_text: 'Pre-order traversal (Root, Left, Right)' },
      { id: 'opt-amz-01-c', option_key: 'C', option_text: 'Post-order traversal (Left, Right, Root)' },
      { id: 'opt-amz-01-d', option_key: 'D', option_text: 'Level-order breadth first traversal' }
    ],
    correct_answer: 'A',
    explanation: 'By definition of a BST, all left descendants are smaller than the root and right descendants are greater. Therefore, visiting Left, then Root, then Right produces ascending sorted values.',
    difficulty: 'Easy',
    question_type: 'MCQ',
    expected_time: 40,
    xp_value: 25
  },
  {
    id: 'q-amz-02',
    subject_id: 'sub-dsa',
    topic_id: 'top-dsa-dp',
    company_id: 'comp-amazon',
    question: 'Amazon Online Assessment (OA): For an LRU (Least Recently Used) Cache design requiring O(1) get and O(1) put operations, which combination of data structures is optimal?',
    options: [
      { id: 'opt-amz-02-a', option_key: 'A', option_text: 'Hash Map + Doubly Linked List' },
      { id: 'opt-amz-02-b', option_key: 'B', option_text: 'Binary Min-Heap + Array' },
      { id: 'opt-amz-02-c', option_key: 'C', option_text: 'Red-Black Tree + Queue' },
      { id: 'opt-amz-02-d', option_key: 'D', option_text: 'Singly Linked List + Stack' }
    ],
    correct_answer: 'A',
    explanation: 'A Hash Map gives O(1) key-to-node lookup, while a Doubly Linked List allows O(1) node removal and insertion at the head when an item is accessed or evicted.',
    difficulty: 'Medium',
    question_type: 'MCQ',
    expected_time: 50,
    xp_value: 30
  },
  {
    id: 'q-amz-03',
    subject_id: 'sub-dbms',
    topic_id: 'top-dbms-acid',
    company_id: 'comp-amazon',
    question: 'Amazon High-Scale Systems Interview: In DynamoDB and distributed data stores, what does the CAP theorem assert?',
    options: [
      { id: 'opt-amz-03-a', option_key: 'A', option_text: 'A distributed system can guarantee at most two out of Consistency, Availability, and Partition Tolerance simultaneously.' },
      { id: 'opt-amz-03-b', option_key: 'B', option_text: 'Cache, Authentication, and Persistence must scale independently.' },
      { id: 'opt-amz-03-c', option_key: 'C', option_text: 'Concurrency, Atomicity, and Performance must always be prioritized over fault-tolerance.' },
      { id: 'opt-amz-03-d', option_key: 'D', option_text: 'Every distributed database guarantees strict serializability.' }
    ],
    correct_answer: 'A',
    explanation: 'Eric Brewer\'s CAP theorem proves that in the presence of a network partition (P), a distributed system must choose between Consistency (C) and Availability (A).',
    difficulty: 'Medium',
    question_type: 'MCQ',
    expected_time: 45,
    xp_value: 25
  },

  // --- GOOGLE QUESTIONS ---
  {
    id: 'q-goog-01',
    subject_id: 'sub-dsa',
    topic_id: 'top-dsa-graphs',
    company_id: 'comp-google',
    question: 'Google Software Engineering Interview: What is the tightest time complexity of Dijkstra\'s single-source shortest path algorithm using a Min-Indexed Binary Heap on a graph with V vertices and E edges?',
    options: [
      { id: 'opt-goog-01-a', option_key: 'A', option_text: 'O((V + E) log V)' },
      { id: 'opt-goog-01-b', option_key: 'B', option_text: 'O(V^2)' },
      { id: 'opt-goog-01-c', option_key: 'C', option_text: 'O(E log E)' },
      { id: 'opt-goog-01-d', option_key: 'D', option_text: 'O(V * E)' }
    ],
    correct_answer: 'A',
    explanation: 'With an adjacency list and binary min-heap, each vertex is extracted once (V log V) and each edge is relaxed once with decrease-key (E log V), giving O((V + E) log V).',
    difficulty: 'Hard',
    question_type: 'MCQ',
    expected_time: 60,
    xp_value: 35
  },
  {
    id: 'q-goog-02',
    subject_id: 'sub-os',
    topic_id: 'top-os-deadlock',
    company_id: 'comp-google',
    question: 'Google Systems Coding Round: In an operating system, why does Virtual Memory use Translation Lookaside Buffers (TLB)?',
    options: [
      { id: 'opt-goog-02-a', option_key: 'A', option_text: 'To cache recent virtual-to-physical address translations and avoid frequent multi-level page table lookups in RAM.' },
      { id: 'opt-goog-02-b', option_key: 'B', option_text: 'To replace the CPU L1 and L2 cache hierarchies entirely.' },
      { id: 'opt-goog-02-c', option_key: 'C', option_text: 'To store process thread control blocks on disk.' },
      { id: 'opt-goog-02-d', option_key: 'D', option_text: 'To compress memory pages before swapping.' }
    ],
    correct_answer: 'A',
    explanation: 'The TLB is an associative high-speed hardware cache on the CPU that stores recent virtual-to-physical page mappings, cutting memory access penalties from 2-4 memory cycles to ~1 cycle.',
    difficulty: 'Medium',
    question_type: 'MCQ',
    expected_time: 50,
    xp_value: 30
  },

  // --- MICROSOFT QUESTIONS ---
  {
    id: 'q-msft-01',
    subject_id: 'sub-dsa',
    topic_id: 'top-dsa-arrays',
    company_id: 'comp-microsoft',
    question: 'Microsoft Campus Round: In Floyd\'s Cycle-Finding Algorithm (Tortoise and Hare) for detecting a cycle in a linked list, how do the two pointers advance?',
    options: [
      { id: 'opt-msft-01-a', option_key: 'A', option_text: 'Slow moves 1 node per step; Fast moves 2 nodes per step.' },
      { id: 'opt-msft-01-b', option_key: 'B', option_text: 'Slow moves 1 node per step; Fast moves 3 nodes per step.' },
      { id: 'opt-msft-01-c', option_key: 'C', option_text: 'Both move 1 node per step from opposite ends.' },
      { id: 'opt-msft-01-d', option_key: 'D', option_text: 'Fast moves backward while Slow moves forward.' }
    ],
    correct_answer: 'A',
    explanation: 'The slow pointer advances by 1 step while the fast pointer advances by 2 steps. If a cycle exists, the distance between them decreases by 1 in each step until they meet within O(n) time.',
    difficulty: 'Easy',
    question_type: 'MCQ',
    expected_time: 40,
    xp_value: 20
  },
  {
    id: 'q-msft-02',
    subject_id: 'sub-os',
    topic_id: 'top-os-deadlock',
    company_id: 'comp-microsoft',
    question: 'Microsoft Systems Round: What is the primary functional difference between a Mutex and a Binary Semaphore?',
    options: [
      { id: 'opt-msft-02-a', option_key: 'A', option_text: 'A Mutex has ownership semantics (only the locking thread can unlock it); a Semaphore has no ownership and can be signaled by any thread.' },
      { id: 'opt-msft-02-b', option_key: 'B', option_text: 'A Mutex can take any integer value while a Semaphore is strictly 0 or 1.' },
      { id: 'opt-msft-02-c', option_key: 'C', option_text: 'A Semaphore runs in kernel space while a Mutex only runs in user space.' },
      { id: 'opt-msft-02-d', option_key: 'D', option_text: 'There is no difference; they are synonymous.' }
    ],
    correct_answer: 'A',
    explanation: 'Mutex (Mutual Exclusion) enforces thread ownership: only the thread that locked the mutex can unlock it. A binary semaphore is a signaling mechanism where any thread can signal (V) or wait (P).',
    difficulty: 'Medium',
    question_type: 'MCQ',
    expected_time: 45,
    xp_value: 25
  },

  // --- DELOITTE QUESTIONS ---
  {
    id: 'q-del-01',
    subject_id: 'sub-dbms',
    topic_id: 'top-dbms-sql',
    company_id: 'comp-deloitte',
    question: 'Deloitte Tech Analyst Round: What is the purpose of the SQL COALESCE function?',
    options: [
      { id: 'opt-del-01-a', option_key: 'A', option_text: 'It returns the first non-null expression among its arguments.' },
      { id: 'opt-del-01-b', option_key: 'B', option_text: 'It concatenates two string columns together.' },
      { id: 'opt-del-01-c', option_key: 'C', option_text: 'It converts negative numbers into positive absolute values.' },
      { id: 'opt-del-01-d', option_key: 'D', option_text: 'It forces a full table scan instead of an index scan.' }
    ],
    correct_answer: 'A',
    explanation: 'COALESCE(val1, val2, ... valN) evaluates the arguments in order and returns the current value of the first expression that does not evaluate to NULL.',
    difficulty: 'Easy',
    question_type: 'MCQ',
    expected_time: 40,
    xp_value: 20
  },
  {
    id: 'q-del-02',
    subject_id: 'sub-cn',
    topic_id: 'top-cn-protocols',
    company_id: 'comp-deloitte',
    question: 'Deloitte Consulting Case & Technology: What is the fundamental difference between symmetric and asymmetric encryption?',
    options: [
      { id: 'opt-del-02-a', option_key: 'A', option_text: 'Symmetric encryption uses a single shared key for both encryption and decryption; asymmetric encryption uses a public/private key pair.' },
      { id: 'opt-del-02-b', option_key: 'B', option_text: 'Asymmetric encryption is significantly faster than symmetric encryption.' },
      { id: 'opt-del-02-c', option_key: 'C', option_text: 'Symmetric encryption cannot be used over the Internet.' },
      { id: 'opt-del-02-d', option_key: 'D', option_text: 'Asymmetric encryption requires no keys.' }
    ],
    correct_answer: 'A',
    explanation: 'Symmetric encryption (AES, DES) uses one shared secret key for both operations. Asymmetric encryption (RSA, ECC) uses a mathematically linked public key for encryption and private key for decryption.',
    difficulty: 'Easy',
    question_type: 'MCQ',
    expected_time: 40,
    xp_value: 20
  }
];

let addedQuestions = 0;
let addedOptions = 0;

newCompanyQuestions.forEach(q => {
  const exists = data.questions.some(item => item.id === q.id);
  if (!exists) {
    const { options, ...questionData } = q;
    data.questions.push(questionData);
    addedQuestions++;

    options.forEach(opt => {
      data.questionOptions.push({
        id: opt.id,
        question_id: q.id,
        option_key: opt.option_key,
        option_text: opt.option_text
      });
      addedOptions++;
    });
  }
});

// Enrich Company Insights (interview blueprints & stage breakdowns)
const companyBlueprints = {
  'comp-tcs': {
    blueprint_stages: [
      { name: 'Stage 1: NQT Cognitive Test', duration: '60 mins', topics: 'Numerical Ability, Verbal Ability, Reasoning Ability' },
      { name: 'Stage 2: NQT Technical & Coding', duration: '50 mins', topics: 'Technical MCQs (OS/DBMS/DSA) + 2 Coding Problems' },
      { name: 'Stage 3: Technical & MR Interview', duration: '35 mins', topics: 'Project Viva, Core OOP/DBMS, Scenario-based problem solving' },
      { name: 'Stage 4: HR Discussion', duration: '15 mins', topics: 'Background verification, shift readiness, relocation consent' }
    ],
    tips: [
      'TCS NQT has sectional timing—you cannot switch between sections once a section starts.',
      'For TCS Digital and Prime upgrades, passing all test cases on at least one coding problem is required.',
      'Expect deep questions on your final year engineering capstone project.'
    ]
  },
  'comp-infosys': {
    blueprint_stages: [
      { name: 'Stage 1: Online Assessment', duration: '100 mins', topics: 'Reasoning Ability, Mathematical Ability, Verbal Ability, Pseudocode, Puzzle Solving' },
      { name: 'Stage 2: Technical Interview', duration: '40 mins', topics: 'DSA (Arrays/Trees), DBMS Normalization, SQL Joins, OOP in Java/Python' },
      { name: 'Stage 3: HR Round', duration: '15 mins', topics: 'Communication, behavioral fit, college academics' }
    ],
    tips: [
      'Pseudocode section tests nested loops, bitwise operators, and recursion tracing.',
      'Prepare code for Second Largest Element, String Palindrome, and Binary Search from scratch.'
    ]
  },
  'comp-amazon': {
    blueprint_stages: [
      { name: 'Stage 1: Online Assessment (OA-1 & OA-2)', duration: '90 mins', topics: '2 Algorithmic Coding Problems + Work Styles Assessment (Leadership Principles)' },
      { name: 'Stage 2: Technical Interview Round 1', duration: '60 mins', topics: 'Data Structures (Trees/Graphs/DP) + LP Questions (STAR Method)' },
      { name: 'Stage 3: Technical Interview Round 2', duration: '60 mins', topics: 'System Design basics / LRU Cache / Concurrency + Customer Obsession' },
      { name: 'Stage 4: Bar Raiser Round', duration: '60 mins', topics: 'Deep dive into past projects, architectural trade-offs, Deliver Results LP' }
    ],
    tips: [
      'Amazon interviewers evaluate code through 14 Leadership Principles (Customer Obsession, Ownership, Bias for Action).',
      'Format all behavioral answers strictly in STAR format: Situation, Task, Action, Result.'
    ]
  },
  'comp-google': {
    blueprint_stages: [
      { name: 'Stage 1: Google Online Challenge (GOC)', duration: '60 mins', topics: '2 Algorithmic Coding Problems (Strings, Graphs, Greedy)' },
      { name: 'Stage 2: Technical Phone Screen', duration: '45 mins', topics: 'Live coding on Google Docs without IDE syntax highlighting' },
      { name: 'Stage 3: Onsite / Virtual Rounds (x3)', duration: '45 mins each', topics: 'Deep algorithmic derivations, asymptotic complexity, edge case handling' },
      { name: 'Stage 4: Googliness & Leadership', duration: '45 mins', topics: 'Navigating ambiguity, constructive collaboration, ethics' }
    ],
    tips: [
      'Always discuss Big-O Time & Space complexities before writing a single line of code.',
      'Check for empty inputs, integer overflow, and extreme edge cases out loud.'
    ]
  },
  'comp-microsoft': {
    blueprint_stages: [
      { name: 'Stage 1: Online Coding Assessment', duration: '75 mins', topics: '3 LeetCode Medium Coding Problems' },
      { name: 'Stage 2: Technical Rounds 1 & 2', duration: '45 mins each', topics: 'Linked Lists, Trees, Dynamic Programming, Bit Manipulation' },
      { name: 'Stage 3: Systems & Architecture Round', duration: '45 mins', topics: 'OS concepts (Threads, Mutexes, Memory), Object Oriented Design' },
      { name: 'Stage 4: AA (As Appropriate / Partner)', duration: '45 mins', topics: 'Culture fit, growth mindset, technical passion' }
    ],
    tips: [
      'Focus on writing clean, modular code with descriptive variable names.',
      'Demonstrate a Growth Mindset: be open to hints and iterate collaboratively.'
    ]
  },
  'comp-accenture': {
    blueprint_stages: [
      { name: 'Stage 1: Cognitive & Technical Assessment', duration: '90 mins', topics: 'Cognitive (50Q) + Technical (40Q on Pseudocode, Cloud, Networking, Security)' },
      { name: 'Stage 2: Coding Assessment', duration: '45 mins', topics: '2 Coding questions (Hands-on Python/C++/Java)' },
      { name: 'Stage 3: Communication Assessment', duration: '20 mins', topics: 'Automated speech test: Reading, Listening, Retelling stories' },
      { name: 'Stage 4: Learning Agility / Interview', duration: '25 mins', topics: 'Final technical + HR assessment' }
    ],
    tips: [
      'Stage 1 elimination is automatic based on aggregate and sectional cutoffs.',
      'Communication assessment tests pronunciation, fluency, and sentence mastery in quiet surroundings.'
    ]
  }
};

data.companies.forEach(c => {
  if (companyBlueprints[c.id]) {
    c.blueprint_stages = companyBlueprints[c.id].blueprint_stages;
    c.tips = companyBlueprints[c.id].tips;
  }
});

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`[Success] Added ${addedQuestions} company-specific questions and ${addedOptions} options.`);
console.log(`[Success] Updated company recruitment blueprints & tips.`);
