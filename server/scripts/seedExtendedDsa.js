import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';
import db, { initDb, saveDb } from '../src/database/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURES_FILE = path.resolve(__dirname, '../src/database/static_fixtures.json');

const NEW_DSA_TOPICS = [
  {
    id: 'top-stack-queue',
    subject_id: 'sub-dsa',
    name: 'Stacks, Queues & Monotonic Deques',
    description: 'LIFO stack applications, sliding window maximums, monotonic queues and parenthetical evaluations.',
    importance_weight: 1.0
  },
  {
    id: 'top-searching-sorting',
    subject_id: 'sub-dsa',
    name: 'Searching & Sorting (Binary Search, Merge/Quick Sort)',
    description: 'Binary search boundaries, rotated arrays, lower/upper bounds, partitioning and stability in sorting.',
    importance_weight: 1.0
  },
  {
    id: 'top-strings',
    subject_id: 'sub-dsa',
    name: 'Strings, Two-Pointers & Hashing',
    description: 'Anagrams, string hashing, Rabin-Karp, palindrome substrings and character frequencies.',
    importance_weight: 0.95
  },
  {
    id: 'top-heaps-priority',
    subject_id: 'sub-dsa',
    name: 'Heaps, Priority Queues & Top-K Elements',
    description: 'Min-heaps, max-heaps, heapify operations, median in a data stream and top-K frequent elements.',
    importance_weight: 0.95
  },
  {
    id: 'top-greedy',
    subject_id: 'sub-dsa',
    name: 'Greedy Algorithms & Interval Scheduling',
    description: 'Activity selection, meeting rooms overlap, jump game and fractional knapsack trade-offs.',
    importance_weight: 0.9
  },
  {
    id: 'top-recursion-backtrack',
    subject_id: 'sub-dsa',
    name: 'Recursion, Backtracking & Subsets',
    description: 'Permutations, combinations, N-Queens problem, pruning and recursion tree memory bounds.',
    importance_weight: 0.9
  },
  {
    id: 'top-sliding-window',
    subject_id: 'sub-dsa',
    name: 'Sliding Window & Subarray Algorithms',
    description: 'Fixed and dynamic length sliding windows, longest substring without repeating characters.',
    importance_weight: 0.95
  },
  {
    id: 'top-bit-manipulation',
    subject_id: 'sub-dsa',
    name: 'Bit Manipulation & Bitwise Algorithms',
    description: 'XOR properties, single number finding, bitmasks, power of two checks and Hamming weight.',
    importance_weight: 0.85
  }
];

const NEW_DSA_QUESTIONS = [
  {
    id: 'q-dsa-stack-01',
    question: 'In evaluating an arithmetic expression, which data structure is primarily utilized to convert an Infix expression (e.g., A + B * C) into Postfix form (e.g., A B C * +) in O(N) time?',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-tcs',
    subject_id: 'sub-dsa',
    topic_id: 'top-stack-queue',
    difficulty: 'Easy',
    correct_answer: 'B',
    explanation: 'A Stack is required in the Shunting-Yard algorithm because operators must be deferred until higher precedence operators are evaluated, adhering to LIFO semantics.',
    tags: ['DSA', 'Stack', 'Infix to Postfix', 'TCS NQT'],
    expected_time: 45,
    xp_value: 20,
    options: [
      {
        option_key: 'A',
        option_text: 'Queue',
        is_correct: false,
        explanation: 'A Queue operates under FIFO (First In First Out) semantics, which would evaluate operators in the exact order they appear, violating mathematical precedence rules.'
      },
      {
        option_key: 'B',
        option_text: 'Stack',
        is_correct: true,
        explanation: 'A Stack maintains operators and pops them according to precedence (LIFO), which is the foundation of Dijkstra\'s Shunting-Yard algorithm.'
      },
      {
        option_key: 'C',
        option_text: 'Binary Search Tree',
        is_correct: false,
        explanation: 'A Binary Search Tree orders elements by value, not by operator precedence or expression sequence, resulting in O(N log N) overhead.'
      },
      {
        option_key: 'D',
        option_text: 'Circular Doubly Linked List',
        is_correct: false,
        explanation: 'A Linked List provides bidirectional traversal but does not enforce automatic LIFO precedence resolution.'
      }
    ]
  },
  {
    id: 'q-dsa-binsearch-02',
    question: 'When performing Binary Search on a sorted array of size N to find an element, what is the exact worst-case number of comparisons required, and why?',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-infosys',
    subject_id: 'sub-dsa',
    topic_id: 'top-searching-sorting',
    difficulty: 'Easy',
    correct_answer: 'C',
    explanation: 'Binary Search halves the search space in each iteration, resulting in a recurrence relation T(N) = T(N/2) + O(1), which evaluates to floor(log2 N) + 1 comparisons.',
    tags: ['DSA', 'Binary Search', 'Time Complexity', 'Infosys'],
    expected_time: 45,
    xp_value: 20,
    options: [
      {
        option_key: 'A',
        option_text: 'O(N) comparisons because all elements might need examination in the worst case.',
        is_correct: false,
        explanation: 'O(N) is the complexity of Linear Search on an unsorted list. Binary Search guarantees discarding half the remaining elements each step.'
      },
      {
        option_key: 'B',
        option_text: 'O(N log N) comparisons due to recursive tree partitioning.',
        is_correct: false,
        explanation: 'O(N log N) is typical for comparison-based sorting algorithms like Merge Sort, not binary search lookup.'
      },
      {
        option_key: 'C',
        option_text: 'O(log2 N) comparisons because the search space is divided by 2 at each step.',
        is_correct: true,
        explanation: 'With each comparison, the search range [low, high] is cut in half. The maximum depth of the search decision tree is floor(log2 N) + 1.'
      },
      {
        option_key: 'D',
        option_text: 'O(1) constant comparisons because the middle index is checked immediately.',
        is_correct: false,
        explanation: 'O(1) is the best-case time when the target happens to be at the exact middle index on the first check, not the worst-case.'
      }
    ]
  },
  {
    id: 'q-dsa-heap-03',
    question: 'You are given an unsorted stream of 10,000,000 integers and must continuously maintain the "Top 100 Largest Numbers". What is the most optimal data structure and time complexity per element?',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-amazon',
    subject_id: 'sub-dsa',
    topic_id: 'top-heaps-priority',
    difficulty: 'Medium',
    correct_answer: 'A',
    explanation: 'A Min-Heap of size K (100) allows comparing the new element with the smallest of the top 100 in O(1) time and inserting in O(log K) time, giving O(N log K) overall.',
    tags: ['DSA', 'Min-Heap', 'Top-K', 'Amazon'],
    expected_time: 60,
    xp_value: 25,
    options: [
      {
        option_key: 'A',
        option_text: 'Min-Heap of size 100 with O(log 100) insertion per element.',
        is_correct: true,
        explanation: 'By storing the 100 largest elements in a Min-Heap, the root is always the 100th largest. If a new number is greater than the root, replace the root and heapify down in O(log 100) steps.'
      },
      {
        option_key: 'B',
        option_text: 'Max-Heap of size 10,000,000 with O(log N) insertion per element.',
        is_correct: false,
        explanation: 'A Max-Heap of size N consumes massive memory (all 10 million elements) and takes O(log N) per insert instead of bounded O(log K).'
      },
      {
        option_key: 'C',
        option_text: 'Sorted Array of size 100 with O(100) linear shift per element.',
        is_correct: false,
        explanation: 'While memory is small, inserting into a sorted array requires shifting up to 100 elements in O(K) time, which is slower than O(log K).'
      },
      {
        option_key: 'D',
        option_text: 'Hash Map storing counts of all numbers with O(1) lookup.',
        is_correct: false,
        explanation: 'A Hash Map does not maintain ordering. Finding the top 100 from an unordered map would require sorting or an O(N) selection algorithm on every query.'
      }
    ]
  },
  {
    id: 'q-dsa-queue-04',
    question: 'How can a Queue (FIFO) be implemented using two Stacks (S1, S2) such that the amortized time complexity for both Enqueue and Dequeue operations is O(1)?',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-microsoft',
    subject_id: 'sub-dsa',
    topic_id: 'top-stack-queue',
    difficulty: 'Medium',
    correct_answer: 'B',
    explanation: 'Enqueue pushes onto S1 in O(1). Dequeue pops from S2; if S2 is empty, it transfers all elements from S1 to S2 in bulk, reversing the order. Each element is moved at most twice, yielding amortized O(1).',
    tags: ['DSA', 'Queue using Stacks', 'Amortized Complexity', 'Microsoft'],
    expected_time: 60,
    xp_value: 25,
    options: [
      {
        option_key: 'A',
        option_text: 'Always transfer all elements from S1 to S2 on every Enqueue and transfer back.',
        is_correct: false,
        explanation: 'Transferring back and forth on every single push makes Enqueue strictly O(N) worst-case and amortized, which is inefficient.'
      },
      {
        option_key: 'B',
        option_text: 'Push to S1 on Enqueue; Pop from S2 on Dequeue (transferring S1 to S2 only when S2 is empty).',
        is_correct: true,
        explanation: 'S1 acts as the inbox and S2 acts as the outbox. Because each element enters S1 once and leaves S2 once, the amortized cost per operation across any sequence of N operations is strictly O(1).'
      },
      {
        option_key: 'C',
        option_text: 'Keep S1 sorted at all times by popping into S2 on every read.',
        is_correct: false,
        explanation: 'Sorting stacks requires O(N^2) or O(N log N) operations and defeats the purpose of queue emulation.'
      },
      {
        option_key: 'D',
        option_text: 'It is mathematically impossible to achieve amortized O(1) Dequeue using only two stacks.',
        is_correct: false,
        explanation: 'Amortized O(1) queue using two stacks is a canonical algorithmic technique proven via aggregate analysis.'
      }
    ]
  },
  {
    id: 'q-dsa-sort-05',
    question: 'Why is QuickSort generally preferred over MergeSort for sorting in-memory arrays in C/C++, despite QuickSort having an O(N^2) worst-case time complexity?',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-amazon',
    subject_id: 'sub-dsa',
    topic_id: 'top-searching-sorting',
    difficulty: 'Medium',
    correct_answer: 'C',
    explanation: 'QuickSort is an in-place sorting algorithm with superior spatial locality of reference (CPU cache hits) and O(1) auxiliary space, whereas standard MergeSort requires an O(N) temporary array.',
    tags: ['DSA', 'QuickSort', 'MergeSort', 'Cache Locality', 'Amazon'],
    expected_time: 50,
    xp_value: 25,
    options: [
      {
        option_key: 'A',
        option_text: 'QuickSort always runs in strictly O(N) linear time for arrays under 100,000 items.',
        is_correct: false,
        explanation: 'Comparison-based sorting has a mathematical lower bound of Omega(N log N). QuickSort cannot run in O(N) general time.'
      },
      {
        option_key: 'B',
        option_text: 'MergeSort is unstable, while QuickSort is guaranteed to be stable.',
        is_correct: false,
        explanation: 'The reverse is true: standard MergeSort is stable, whereas in-place QuickSort is naturally unstable due to long-distance swaps across the pivot.'
      },
      {
        option_key: 'C',
        option_text: 'QuickSort sorts in-place with O(1) auxiliary memory and exhibits exceptional CPU cache locality.',
        is_correct: true,
        explanation: 'QuickSort accesses contiguous memory addresses sequentially, maximizing L1/L2 cache hits. MergeSort requires allocating and copying into an auxiliary array of size O(N).'
      },
      {
        option_key: 'D',
        option_text: 'QuickSort never makes recursive function calls.',
        is_correct: false,
        explanation: 'QuickSort is fundamentally recursive (partitioning left and right sub-arrays) requiring O(log N) stack frames.'
      }
    ]
  },
  {
    id: 'q-dsa-slide-06',
    question: 'What is the optimal time complexity to find the "Maximum Sum Subarray of Fixed Size K" in an array of N integers?',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-tcs',
    subject_id: 'sub-dsa',
    topic_id: 'top-sliding-window',
    difficulty: 'Easy',
    correct_answer: 'A',
    explanation: 'Using the Sliding Window technique, you compute the sum of the first K elements in O(K). For each subsequent element, add the incoming element and subtract the outgoing element in O(1), totaling O(N) overall.',
    tags: ['DSA', 'Sliding Window', 'TCS Digital'],
    expected_time: 45,
    xp_value: 20,
    options: [
      {
        option_key: 'A',
        option_text: 'O(N) time with O(1) extra space using Sliding Window.',
        is_correct: true,
        explanation: 'As the window slides right, updating the sum takes current_sum += arr[i] - arr[i-K]. Exactly N - K updates are performed in O(1) each.'
      },
      {
        option_key: 'B',
        option_text: 'O(N * K) time by recomputing the sum of every K-length slice from scratch.',
        is_correct: false,
        explanation: 'Recomputing each window from scratch is the naive brute-force method, which is redundant because adjacent windows share K-1 elements.'
      },
      {
        option_key: 'C',
        option_text: 'O(N log N) time by sorting all subarrays.',
        is_correct: false,
        explanation: 'Subarrays must maintain contiguous order; sorting would destroy their original positional indices.'
      },
      {
        option_key: 'D',
        option_text: 'O(K^2) time using dynamic programming tabulation.',
        is_correct: false,
        explanation: 'DP is unnecessary here; simple pointer shifting achieves optimal linear time.'
      }
    ]
  },
  {
    id: 'q-dsa-bit-07',
    question: 'In an array where every integer appears exactly twice except for ONE integer which appears only once, how can you find the unique integer in O(N) time and O(1) auxiliary space?',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-microsoft',
    subject_id: 'sub-dsa',
    topic_id: 'top-bit-manipulation',
    difficulty: 'Easy',
    correct_answer: 'D',
    explanation: 'The XOR operation satisfies x ^ x = 0 and x ^ 0 = x. Commutativity ensures all duplicate pairs cancel out to 0, leaving only the unique element.',
    tags: ['DSA', 'Bit Manipulation', 'XOR', 'Microsoft'],
    expected_time: 40,
    xp_value: 20,
    options: [
      {
        option_key: 'A',
        option_text: 'Sort the array and scan adjacent pairs in O(N log N) time.',
        is_correct: false,
        explanation: 'Sorting requires O(N log N) time, which violates the O(N) linear time requirement.'
      },
      {
        option_key: 'B',
        option_text: 'Use a Hash Set to track seen numbers, removing on repeat in O(N) space.',
        is_correct: false,
        explanation: 'Using a Hash Set achieves O(N) time but requires O(N) auxiliary space, violating the O(1) space constraint.'
      },
      {
        option_key: 'C',
        option_text: 'Compute the product of all elements and divide by duplicate factors.',
        is_correct: false,
        explanation: 'Product calculations will overflow 64-bit integers almost immediately for arrays of size > 20.'
      },
      {
        option_key: 'D',
        option_text: 'XOR all elements together; duplicate pairs cancel to 0, leaving the unique number.',
        is_correct: true,
        explanation: 'Because A ^ A = 0 and A ^ 0 = A, XORing all array elements results in (x1 ^ x1) ^ (x2 ^ x2) ^ ... ^ unique = 0 ^ unique = unique in O(N) time and O(1) space.'
      }
    ]
  },
  {
    id: 'q-dsa-greedy-08',
    question: 'In the Interval Scheduling (Activity Selection) problem, which greedy strategy is proven to maximize the number of non-overlapping activities that can be performed?',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-accenture',
    subject_id: 'sub-dsa',
    topic_id: 'top-greedy',
    difficulty: 'Medium',
    correct_answer: 'B',
    explanation: 'Sorting activities by their Finish Times (earliest finish time first) leaves the maximum amount of remaining time available for subsequent activities.',
    tags: ['DSA', 'Greedy', 'Activity Selection', 'Accenture'],
    expected_time: 50,
    xp_value: 25,
    options: [
      {
        option_key: 'A',
        option_text: 'Sort activities by earliest Start Time.',
        is_correct: false,
        explanation: 'Choosing the earliest start time fails if that activity is very long (e.g., from 8 AM to 8 PM), blocking many shorter activities.'
      },
      {
        option_key: 'B',
        option_text: 'Sort activities by earliest Finish Time.',
        is_correct: true,
        explanation: 'Finishing an activity as early as possible frees up the resource immediately, greedily leaving the largest possible continuous window for remaining tasks.'
      },
      {
        option_key: 'C',
        option_text: 'Sort activities by shortest Duration.',
        is_correct: false,
        explanation: 'Choosing the shortest duration can fail when a short activity overlaps with the middle of two other compatible activities.'
      },
      {
        option_key: 'D',
        option_text: 'Sort activities by fewest overlapping conflicts.',
        is_correct: false,
        explanation: 'Minimizing conflicts is a heuristic that does not guarantee an optimal solution for all interval arrangements.'
      }
    ]
  },
  {
    id: 'q-dsa-recursion-09',
    question: 'What is the maximum depth of the call stack when solving the classic Tower of Hanoi problem for N disks, and what is its total time complexity?',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-wipro',
    subject_id: 'sub-dsa',
    topic_id: 'top-recursion-backtrack',
    difficulty: 'Medium',
    correct_answer: 'C',
    explanation: 'The recursion tree has depth N (stack space O(N)), while the total number of moves made is 2^N - 1, giving O(2^N) time complexity.',
    tags: ['DSA', 'Recursion', 'Tower of Hanoi', 'Wipro'],
    expected_time: 50,
    xp_value: 25,
    options: [
      {
        option_key: 'A',
        option_text: 'Stack depth is O(2^N), and time complexity is O(N^2).',
        is_correct: false,
        explanation: 'Stack depth represents the maximum active function frames down any path, which is bounded by N, not 2^N.'
      },
      {
        option_key: 'B',
        option_text: 'Stack depth is O(1), and time complexity is O(N).',
        is_correct: false,
        explanation: 'Tower of Hanoi cannot run in linear time because every single disk move must be printed, which takes 2^N - 1 operations.'
      },
      {
        option_key: 'C',
        option_text: 'Stack depth is O(N), and time complexity is O(2^N).',
        is_correct: true,
        explanation: 'The recurrence is T(N) = 2T(N-1) + 1, which expands to 2^N - 1 operations. At any point, at most N frames are on the call stack.'
      },
      {
        option_key: 'D',
        option_text: 'Stack depth is O(log N), and time complexity is O(N log N).',
        is_correct: false,
        explanation: 'O(log N) depth applies to divide-and-conquer where the problem size halves (N/2), whereas Hanoi reduces size by 1 (N-1).'
      }
    ]
  },
  {
    id: 'q-dsa-tree-10',
    question: 'In a Binary Search Tree (BST) containing N keys, under what condition does the search operation degrade to O(N) worst-case time, and how is this avoided in production?',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-amazon',
    subject_id: 'sub-dsa',
    topic_id: 'top-trees',
    difficulty: 'Medium',
    correct_answer: 'A',
    explanation: 'Inserting elements in sorted or reverse-sorted order creates a degenerate (skewed) tree behaving like a linked list (depth N). Self-balancing trees (AVL or Red-Black trees) guarantee O(log N) depth.',
    tags: ['DSA', 'BST', 'Skewed Tree', 'AVL Tree', 'Amazon'],
    expected_time: 50,
    xp_value: 25,
    options: [
      {
        option_key: 'A',
        option_text: 'When keys are inserted in sorted order (skewed tree); avoided using self-balancing trees like AVL or Red-Black trees.',
        is_correct: true,
        explanation: 'Inserting already sorted data [1, 2, 3, 4, 5] makes every node a right child, turning height into N. Self-balancing trees perform tree rotations to keep height bounded by O(log N).'
      },
      {
        option_key: 'B',
        option_text: 'When all keys are identical; avoided using hash tables.',
        is_correct: false,
        explanation: 'Standard BSTs either disallow duplicates or store count frequencies, which does not degrade search traversal.'
      },
      {
        option_key: 'C',
        option_text: 'When the tree has an odd number of nodes; avoided using complete binary trees.',
        is_correct: false,
        explanation: 'Odd or even node parity has no influence on tree height or traversal efficiency.'
      },
      {
        option_key: 'D',
        option_text: 'A BST search never degrades to O(N) because binary search always guarantees O(log N).',
        is_correct: false,
        explanation: 'Binary Search guarantees O(log N) on contiguous arrays. A BST only guarantees O(height), which can become O(N) if unbalanced.'
      }
    ]
  }
];

async function seed() {
  console.log('[DSA Seed] Initializing database engines...');
  await initDb();

  // 1. Insert new DSA topics into SQLite
  console.log('[DSA Seed] Inserting new DSA topics...');
  for (const topic of NEW_DSA_TOPICS) {
    const existing = db.get('topics', topic.id);
    if (!existing) {
      db.insert('topics', topic);
      console.log(`  + Added Topic: ${topic.name}`);
    } else {
      db.update('topics', topic.id, topic);
    }
  }

  // 2. Insert new DSA questions and options into SQLite
  console.log('[DSA Seed] Inserting new high-yield DSA questions & options...');
  let addedQuestions = 0;
  for (const q of NEW_DSA_QUESTIONS) {
    const { options, ...questionData } = q;
    const existingQ = db.get('questions', questionData.id);
    if (!existingQ) {
      db.insert('questions', questionData);
      addedQuestions++;

      // Insert options
      if (options && options.length > 0) {
        for (const opt of options) {
          const optId = `opt-${questionData.id}-${opt.option_key}`;
          db.insert('questionOptions', {
            id: optId,
            question_id: questionData.id,
            option_key: opt.option_key,
            option_text: opt.option_text,
            is_correct: opt.is_correct,
            explanation: opt.explanation
          });
        }
      }
      console.log(`  + Added Question: ${questionData.id} (${questionData.difficulty})`);
    }
  }

  saveDb();
  console.log(`✓ SQLite updated. Added ${addedQuestions} new DSA questions.`);

  // 3. Update static_fixtures.json permanently
  if (fs.existsSync(FIXTURES_FILE)) {
    try {
      const raw = fs.readFileSync(FIXTURES_FILE, 'utf-8');
      const fixtures = JSON.parse(raw);

      // Add topics if not present
      if (!fixtures.topics) fixtures.topics = [];
      const topicIds = new Set(fixtures.topics.map(t => t.id));
      for (const t of NEW_DSA_TOPICS) {
        if (!topicIds.has(t.id)) {
          fixtures.topics.push(t);
        }
      }

      // Add questions and options if not present
      if (!fixtures.questions) fixtures.questions = [];
      if (!fixtures.questionOptions) fixtures.questionOptions = [];
      const qIds = new Set(fixtures.questions.map(q => q.id));

      for (const q of NEW_DSA_QUESTIONS) {
        const { options, ...questionData } = q;
        if (!qIds.has(questionData.id)) {
          fixtures.questions.push(questionData);
          if (options) {
            for (const opt of options) {
              fixtures.questionOptions.push({
                id: `opt-${questionData.id}-${opt.option_key}`,
                question_id: questionData.id,
                option_key: opt.option_key,
                option_text: opt.option_text,
                is_correct: opt.is_correct,
                explanation: opt.explanation
              });
            }
          }
        }
      }

      fs.writeFileSync(FIXTURES_FILE, JSON.stringify(fixtures, null, 2), 'utf-8');
      console.log('✓ static_fixtures.json updated successfully.');
    } catch (err) {
      console.error('Error updating static fixtures:', err.message);
    }
  }

  // 4. Update PostgreSQL 18
  if (process.env.DATABASE_URL) {
    console.log('[DSA Seed] Synchronizing new questions into PostgreSQL 18...');
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    try {
      const client = await pool.connect();

      // Insert topics
      for (const t of NEW_DSA_TOPICS) {
        await client.query(`
          INSERT INTO topics (id, subject_id, name, description, importance_weight)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
        `, [t.id, t.subject_id, t.name, t.description, t.importance_weight]);
      }

      // Insert questions and options
      for (const q of NEW_DSA_QUESTIONS) {
        const { options, ...qData } = q;
        await client.query(`
          INSERT INTO questions (id, question, question_type, branch_id, company_id, subject_id, topic_id, difficulty, correct_answer, explanation, tags, expected_time, xp_value)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT (id) DO UPDATE SET question = EXCLUDED.question, explanation = EXCLUDED.explanation;
        `, [
          qData.id, qData.question, qData.question_type, qData.branch_id, qData.company_id,
          qData.subject_id, qData.topic_id, qData.difficulty, qData.correct_answer,
          qData.explanation, JSON.stringify(qData.tags), qData.expected_time, qData.xp_value
        ]);

        if (options) {
          for (const opt of options) {
            const optId = `opt-${qData.id}-${opt.option_key}`;
            await client.query(`
              INSERT INTO question_options (id, question_id, option_key, option_text, is_correct, explanation)
              VALUES ($1, $2, $3, $4, $5, $6)
              ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, explanation = EXCLUDED.explanation;
            `, [optId, qData.id, opt.option_key, opt.option_text, opt.is_correct, opt.explanation]);
          }
        }
      }

      const qTotal = await client.query('SELECT COUNT(*) FROM questions');
      const optTotal = await client.query('SELECT COUNT(*) FROM question_options');
      console.log(`✓ PostgreSQL 18 updated: Total questions = ${qTotal.rows[0].count}, Total options = ${optTotal.rows[0].count}`);

      client.release();
      await pool.end();
    } catch (pgErr) {
      console.error('Error synchronizing to PostgreSQL:', pgErr.message);
    }
  }

  console.log('\n======================================================');
  console.log('🎉 EXPANDED DSA TOPICS & QUESTIONS SEEDED SUCCESSFULLY!');
  console.log('======================================================\n');
}

seed().catch(console.error);
