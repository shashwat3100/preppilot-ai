import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURES_FILE = path.resolve(__dirname, '../src/database/static_fixtures.json');
const SQLITE_FILE = path.resolve(__dirname, '../data/careerprep.db');
const POSTGRES_URL = process.env.DATABASE_URL || 'postgres://postgres:Pranjal%4025@localhost:1111/careerprep';

// 1. Standard DSA Placement Topics (Fully curriculum aligned, neutral branding)
const standardDsaTopics = [
  {
    id: 'top-hashing',
    subject_id: 'sub-dsa',
    name: 'Hashing & Hash Tables',
    description: 'Hash functions, separate chaining, open addressing (linear/quadratic probing, double hashing), load factor & rehashing.',
    importance_weight: 1.0
  },
  {
    id: 'top-trie',
    subject_id: 'sub-dsa',
    name: 'Trie (Prefix Tree) & Auto-complete',
    description: 'Prefix tree creation, searching, startswith operations, memory optimization, bitwise Trie, and word dictionaries.',
    importance_weight: 0.9
  },
  {
    id: 'top-dsu',
    subject_id: 'sub-dsa',
    name: 'Disjoint Set Union (DSU / Union-Find)',
    description: 'Path compression, union by rank and size, cycle detection in undirected graphs, Kruskal minimum spanning tree.',
    importance_weight: 0.95
  },
  {
    id: 'top-asymptotic',
    subject_id: 'sub-dsa',
    name: 'Asymptotic Analysis & Recurrences',
    description: 'Big-O, Big-Omega, Big-Theta bounds, recursion tree analysis, Master Theorem for divide-and-conquer, space complexity.',
    importance_weight: 1.0
  }
];

// 2. White-Labeled Curriculum RAG Knowledge Documents for PrepPilot AI
const standardKnowledgeDocs = [
  {
    id: 'doc-dsa-placement-roadmap',
    title: 'Data Structures & Algorithms: Complete Placement Preparation Roadmap',
    branch_id: 'branch-cse',
    subject_id: 'sub-dsa',
    company_id: 'comp-amazon',
    category: 'CONCEPT',
    summary: 'A structured placement syllabus covering linear data structures, non-linear hierarchical structures, dynamic programming, and algorithmic paradigms.',
    keywords: ['dsa roadmap', 'placement preparation', 'algorithms', 'data structures', 'problem solving'],
    content: `Data Structures & Algorithms Placement Framework:
Phase 1: Foundations & Complexity Analysis
Master Big-O, Big-Omega, and Big-Theta notations. Learn the difference between worst-case, average-case, and amortized time complexity. Understand space complexity, including auxiliary space versus input space, and how the recursion call stack impacts memory usage.

Phase 2: Linear Data Structures
1. Arrays & Dynamic Vectors: Contiguous memory, cache locality, prefix sum arrays, two-pointer techniques, and Kadane's algorithm for maximum subarray sum.
2. Strings: Character manipulation, rolling hash (Rabin-Karp), sliding window for substring problems, and Knuth-Morris-Pratt (KMP) pattern matching.
3. Linked Lists: Singly, doubly, and circular linked lists. Fast and slow pointer technique (Floyd's cycle detection algorithm) to find cycles and midpoints in O(1) space.
4. Stacks & Queues: LIFO vs FIFO principles. Monotonic stack for Next Greater Element and Largest Rectangle in Histogram. Circular queues and deques for sliding window minimums/maximums.
5. Hashing: Hash tables, collision resolution via separate chaining vs open addressing (linear probing, quadratic probing, double hashing). Amortized O(1) average lookup.

Phase 3: Hierarchical & Non-Linear Structures
1. Trees & BSTs: Binary tree properties, DFS traversals (inorder, preorder, postorder) and BFS level order traversal. Binary Search Trees (BST) invariant: left < root < right. Lowest Common Ancestor (LCA) and height-balanced AVL/Red-Black tree concepts.
2. Heaps & Priority Queues: Complete binary tree representation in an array. Min-heap and Max-heap. Building a heap in O(N) linear time using sift-down. Finding the Top-K elements and running median from data streams.
3. Graphs: Adjacency list vs adjacency matrix representations. Breadth-First Search (BFS) for shortest path in unweighted graphs. Depth-First Search (DFS) for connectivity. Cycle detection in directed graphs using topological sorting (Kahn's algorithm) or 3-color DFS. Dijkstra's algorithm for shortest paths with non-negative edge weights using a min-heap in O((V + E) log V).
4. Advanced Structures: Tries (Prefix Trees) for dictionary searches and prefix lookups in O(L) time where L is word length. Disjoint Set Union (DSU / Union-Find) with path compression and union by rank achieving nearly linear O(alpha(V)) time, widely used in Kruskal's Minimum Spanning Tree algorithm.

Phase 4: Core Algorithmic Paradigms
1. Searching & Sorting: Binary search on answer space, rotated sorted arrays, and lower/upper bounds. QuickSort partitioning (Lomuto vs Hoare) and MergeSort divide-and-conquer.
2. Dynamic Programming: Optimal substructure and overlapping subproblems. Top-down memoization vs bottom-up tabulation. Standard classics: 0/1 Knapsack, Longest Common Subsequence (LCS), Longest Increasing Subsequence (LIS), and Matrix Chain Multiplication.
3. Greedy Algorithms: Greedy choice property. Interval scheduling, Activity Selection, Fractional Knapsack, and Huffman Coding.
4. Backtracking: Exploring decision trees with pruning. Classic problems: N-Queens, Sudoku Solver, Rat in a Maze, and generating permutations/subsets.`
  },
  {
    id: 'doc-dsa-hashing-guide',
    title: 'Data Structures: Hashing, Collision Resolution & Open Addressing',
    branch_id: 'branch-cse',
    subject_id: 'sub-dsa',
    company_id: 'comp-google',
    category: 'CONCEPT',
    summary: 'Comprehensive analysis of hash functions, separate chaining, open addressing (linear probing, quadratic probing, double hashing), load factor management, and rehashing.',
    keywords: ['hashing', 'hash table', 'collision resolution', 'separate chaining', 'open addressing', 'double hashing', 'load factor'],
    content: `Hashing is a fundamental technique to achieve average-case O(1) insertion, deletion, and search operations.
1. Hash Functions:
A good hash function maps large keys uniformly across the table slots, minimizing clustering. Common methods include the Division Method (h(k) = k mod m, where m is prime) and the Multiplication Method.

2. Collision Resolution Techniques:
When two keys hash to the same bucket (h(k1) == h(k2)), collisions must be resolved:
A. Separate Chaining (Open Hashing):
Each bucket in the hash table points to a linked list (or balanced BST in Java 8+ HashMap when bucket size exceeds 8).
- Advantages: Simple to implement, table never fills up completely, less sensitive to load factor alpha.
- Disadvantages: Cache misses due to pointer chasing, extra memory overhead for pointers.

B. Open Addressing (Closed Hashing):
All elements are stored directly inside the hash table array. If a collision occurs, alternative slots are systematically probed:
- Linear Probing: h(k, i) = (h'(k) + i) mod m. Suffers from Primary Clustering (long contiguous runs of occupied slots build up, degrading performance to O(N)).
- Quadratic Probing: h(k, i) = (h'(k) + c1*i + c2*i^2) mod m. Reduces primary clustering but suffers from Secondary Clustering (keys hashing to the same starting slot follow the exact same probe sequence).
- Double Hashing: h(k, i) = (h1(k) + i * h2(k)) mod m. Best open addressing method. Uses a second hash function h2(k) that must never evaluate to 0 and must be relatively prime to table size m. Eliminates both primary and secondary clustering.

3. Load Factor (alpha) & Rehashing:
Load factor alpha = n / m (where n is the number of keys and m is table size). In open addressing, alpha must be strictly less than 1 (typically kept under 0.7). When alpha exceeds the threshold, rehashing is triggered: a new table of approximately 2x size (prime) is allocated, and all keys are recomputed and re-inserted.`
  },
  {
    id: 'doc-dsa-advanced-structures',
    title: 'Advanced Data Structures: Tries (Prefix Trees) & Disjoint Set Union (DSU)',
    branch_id: 'branch-cse',
    subject_id: 'sub-dsa',
    company_id: 'comp-microsoft',
    category: 'CONCEPT',
    summary: 'Implementation details and asymptotic complexities of Trie (Prefix Tree) and Disjoint Set Union (DSU) with Path Compression and Union by Rank.',
    keywords: ['trie', 'prefix tree', 'dsu', 'union find', 'path compression', 'union by rank', 'kruskal', 'ackermann'],
    content: `Advanced Data Structures frequently tested in Product Company Interviews:

1. Trie (Prefix Tree):
A Trie is an efficient tree-like data structure used for storing and retrieving strings over an alphabet (e.g., lowercase English letters a-z).
- Structure: Each node contains an array of child pointers (children[26]) or a hash map, and a boolean flag isEndOfWord.
- Operations:
  * Insert(word): Traverse node by node. If character node does not exist, create it. Mark last node isEndOfWord = true. Time: O(L), Space: O(L * alphabet_size) where L is string length.
  * Search(word): Traverse characters. If any child pointer is null, return false. Return isEndOfWord at the end. Time: O(L).
  * StartsWith(prefix): Identical to search, but returns true as long as prefix traversal succeeds, regardless of isEndOfWord. Time: O(L).
- Applications: Autocomplete search suggestions, spell checkers, IP routing longest-prefix match, and Bitwise Trie for maximum XOR pair queries.

2. Disjoint Set Union (DSU / Union-Find):
DSU tracks a partition of elements into disjoint (non-overlapping) subsets.
- Primary Operations:
  * Find(x): Determines which set element x belongs to by returning the representative (root) of its set.
  * Union(x, y): Merges the set containing x with the set containing y.
- Optimizations:
  * Path Compression (in Find): During find(x), redirect all traversed nodes to point directly to the root: parent[x] = find(parent[x]). Flattens tree height dramatically.
  * Union by Rank / Size (in Union): Attach the shorter tree under the root of the taller tree. Prevents tree degeneration into a linked list.
- Time Complexity: With both Path Compression and Union by Rank, any sequence of m operations on n elements runs in O(m * alpha(n)) time, where alpha is the Inverse Ackermann function. In practice, alpha(n) <= 4 for all realistic values of n (even greater than the number of atoms in the universe), making operations effectively O(1) amortized.
- Applications: Kruskal's Minimum Spanning Tree algorithm, detecting cycles in undirected graphs, and dynamic connectivity in networks.`
  }
];

// 3. Placement Questions with Clean Neutral IDs and Tags
const cleanQuestions = [
  {
    id: 'q-dsa-hashing-collision',
    subject_id: 'sub-dsa',
    topic_id: 'top-hashing',
    difficulty: 'Medium',
    company_id: 'comp-amazon',
    question: 'In open addressing for hash tables, which probing technique effectively eliminates both primary and secondary clustering?',
    correct_answer: 'C',
    explanation: 'Double hashing uses a probe sequence of h(k, i) = (h1(k) + i * h2(k)) mod m. Because the probe step depends on the key via h2(k), it eliminates both primary and secondary clustering.',
    expected_time: 45,
    xp_value: 25,
    tags: ['DSA', 'Data Structures', 'Hashing', 'Medium'],
    options: [
      {
        option_key: 'A',
        option_text: 'Linear Probing',
        is_correct: false,
        explanation: 'Linear probing probes sequential slots (i, i+1, i+2...), which causes severe primary clustering as adjacent occupied blocks merge into long chains.'
      },
      {
        option_key: 'B',
        option_text: 'Quadratic Probing',
        is_correct: false,
        explanation: 'Quadratic probing uses quadratic steps (c1*i + c2*i^2), eliminating primary clustering, but keys that hash to the same starting slot still follow identical probe sequences (secondary clustering).'
      },
      {
        option_key: 'C',
        option_text: 'Double Hashing',
        is_correct: true,
        explanation: 'Double hashing uses two independent hash functions where the step size is h2(key). This ensures distinct probe paths even for keys with the same initial hash, eliminating primary and secondary clustering.'
      },
      {
        option_key: 'D',
        option_text: 'Separate Chaining',
        is_correct: false,
        explanation: 'Separate chaining is a closed-addressing (open hashing) scheme where entries are stored in external linked lists, not open addressing.'
      }
    ]
  },
  {
    id: 'q-dsa-trie-complexity',
    subject_id: 'sub-dsa',
    topic_id: 'top-trie',
    difficulty: 'Medium',
    company_id: 'comp-google',
    question: 'What is the worst-case time complexity of searching for a word of length L in a Trie containing N words over an alphabet of size Sigma?',
    correct_answer: 'B',
    explanation: 'Searching in a Trie depends only on the length of the query word L. At each character, an O(1) pointer transition is performed, giving O(L) time regardless of the total number of words N in the Trie.',
    expected_time: 40,
    xp_value: 20,
    tags: ['DSA', 'Data Structures', 'Trie', 'Medium'],
    options: [
      {
        option_key: 'A',
        option_text: 'O(N * L)',
        is_correct: false,
        explanation: 'O(N * L) would be the brute-force search time comparing against all N words in a list; a Trie avoids this by sharing common prefixes.'
      },
      {
        option_key: 'B',
        option_text: 'O(L)',
        is_correct: true,
        explanation: 'In a Trie, each character of the word corresponds to one edge traversal in O(1) time. Searching a word of length L requires exactly L operations, strictly independent of total stored words N.'
      },
      {
        option_key: 'C',
        option_text: 'O(log N + L)',
        is_correct: false,
        explanation: 'O(log N) would apply to binary search in a sorted array of words, but a Trie does not perform binary search on nodes.'
      },
      {
        option_key: 'D',
        option_text: 'O(Sigma * L)',
        is_correct: false,
        explanation: 'Sigma represents the alphabet size. With direct array indexing (children[char - "a"]), the transition takes O(1) time, not O(Sigma).'
      }
    ]
  },
  {
    id: 'q-dsa-dsu-complexity',
    subject_id: 'sub-dsa',
    topic_id: 'top-dsu',
    difficulty: 'Hard',
    company_id: 'comp-microsoft',
    question: 'When implementing Disjoint Set Union (DSU) with both Path Compression and Union by Rank, what is the amortized time complexity per operation for M operations on N elements?',
    correct_answer: 'C',
    explanation: 'Combining path compression and union by rank yields an amortized time complexity of O(alpha(N)) per operation, where alpha is the extremely slowly growing Inverse Ackermann function.',
    expected_time: 50,
    xp_value: 30,
    tags: ['DSA', 'Data Structures', 'Graphs', 'Hard'],
    options: [
      {
        option_key: 'A',
        option_text: 'O(log N)',
        is_correct: false,
        explanation: 'O(log N) is the time complexity when using only Union by Rank without Path Compression.'
      },
      {
        option_key: 'B',
        option_text: 'O(N)',
        is_correct: false,
        explanation: 'O(N) occurs only in naive Disjoint Sets without optimizations where tree structures degenerate into linear chains.'
      },
      {
        option_key: 'C',
        option_text: 'O(alpha(N)) where alpha is the Inverse Ackermann function',
        is_correct: true,
        explanation: 'The combination of path compression (which flattens trees during find) and union by rank (which bounds tree height) achieves O(alpha(N)) amortized time, which is practically <= 4 for all physical inputs.'
      },
      {
        option_key: 'D',
        option_text: 'O(1) strict worst-case for every single operation',
        is_correct: false,
        explanation: 'Individual operations can take longer than O(1) due to path compression traversal; the bound is amortized across operations, not strict worst-case.'
      }
    ]
  },
  {
    id: 'q-dsa-master-theorem',
    subject_id: 'sub-dsa',
    topic_id: 'top-asymptotic',
    difficulty: 'Medium',
    company_id: 'comp-tcs',
    question: 'According to the Master Theorem, what is the asymptotic solution to the recurrence relation T(n) = 2T(n/2) + O(n)?',
    correct_answer: 'A',
    explanation: 'Here a=2, b=2, and f(n)=O(n). Since log_b(a) = log_2(2) = 1, and f(n) = Theta(n^1), this corresponds to Case 2 of Master Theorem, giving T(n) = Theta(n log n). This is the exact recurrence of Merge Sort.',
    expected_time: 40,
    xp_value: 20,
    tags: ['DSA', 'Algorithms', 'Complexity Analysis', 'Medium'],
    options: [
      {
        option_key: 'A',
        option_text: 'Theta(n log n)',
        is_correct: true,
        explanation: 'With a=2, b=2, n^(log_b a) = n^1. Since f(n) = n = Theta(n^1), Case 2 applies: T(n) = Theta(n^(log_b a) * log n) = Theta(n log n).'
      },
      {
        option_key: 'B',
        option_text: 'Theta(n^2)',
        is_correct: false,
        explanation: 'Theta(n^2) would occur if f(n) = O(n^2), which is not the case here.'
      },
      {
        option_key: 'C',
        option_text: 'Theta(n)',
        is_correct: false,
        explanation: 'Theta(n) would occur if work at root dominated (e.g. T(n) = T(n/2) + n), but here both subproblems contribute equal work at every level.'
      },
      {
        option_key: 'D',
        option_text: 'Theta(log n)',
        is_correct: false,
        explanation: 'Theta(log n) applies to Binary Search where T(n) = T(n/2) + O(1), having only 1 recursive call per step.'
      }
    ]
  }
];

async function syncAdvancedCurriculum() {
  console.log('==================================================================');
  console.log('📚 PREPPILOT AI: CLEAN ADVANCED DSA CURRICULUM SYNC');
  console.log('==================================================================');

  // 1. Clean and update static_fixtures.json
  const rawFixtures = fs.readFileSync(FIXTURES_FILE, 'utf-8');
  const fixtures = JSON.parse(rawFixtures);

  // Remove any obsolete q-gfg questions & options
  fixtures.questions = fixtures.questions.filter(q => !q.id.startsWith('q-gfg-'));
  fixtures.questionOptions = fixtures.questionOptions.filter(o => !o.id.includes('q-gfg-') && !o.question_id?.startsWith('q-gfg-'));

  // Ensure topics exist
  const existingTopicIds = new Set(fixtures.topics.map(t => t.id));
  for (const t of standardDsaTopics) {
    if (!existingTopicIds.has(t.id)) {
      fixtures.topics.push(t);
      existingTopicIds.add(t.id);
    }
  }

  // Ensure questions exist with neutral IDs
  const existingQIds = new Set(fixtures.questions.map(q => q.id));
  const existingOptIds = new Set(fixtures.questionOptions.map(o => o.id));

  for (const q of cleanQuestions) {
    if (!existingQIds.has(q.id)) {
      fixtures.questions.push({
        id: q.id,
        question: q.question,
        question_type: 'MCQ',
        branch_id: 'branch-cse',
        company_id: q.company_id,
        subject_id: q.subject_id,
        topic_id: q.topic_id,
        difficulty: q.difficulty,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        tags: q.tags,
        expected_time: q.expected_time,
        xp_value: q.xp_value
      });
      existingQIds.add(q.id);

      for (const opt of q.options) {
        const optId = `opt-${q.id}-${opt.option_key.toLowerCase()}`;
        if (!existingOptIds.has(optId)) {
          fixtures.questionOptions.push({
            id: optId,
            question_id: q.id,
            option_key: opt.option_key,
            option_text: opt.option_text,
            is_correct: opt.is_correct,
            explanation: opt.explanation
          });
          existingOptIds.add(optId);
        }
      }
    }
  }

  fs.writeFileSync(FIXTURES_FILE, JSON.stringify(fixtures, null, 2), 'utf-8');
  console.log('✓ static_fixtures.json cleaned and updated without external website branding!');

  // 2. Synchronize SQLite
  if (fs.existsSync(SQLITE_FILE)) {
    const sqlite = new DatabaseSync(SQLITE_FILE);

    // Clean obsolete gfg records from SQLite
    sqlite.exec(`DELETE FROM questions WHERE id LIKE 'q-gfg-%'`);
    sqlite.exec(`DELETE FROM questionOptions WHERE id LIKE '%q-gfg-%' OR question_id LIKE 'q-gfg-%'`);

    // Insert topics
    const insertTopic = sqlite.prepare(`
      INSERT OR REPLACE INTO topics (id, data, created_at, updated_at)
      VALUES (?, ?, datetime('now'), datetime('now'))
    `);
    for (const t of standardDsaTopics) {
      insertTopic.run(t.id, JSON.stringify(t));
    }

    // Insert questions and options
    const insertQ = sqlite.prepare(`
      INSERT OR REPLACE INTO questions (id, question, subject_id, topic_id, difficulty, company_id, correct_answer, data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
    const insertOpt = sqlite.prepare(`
      INSERT OR REPLACE INTO questionOptions (id, question_id, option_key, data, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `);

    for (const q of cleanQuestions) {
      insertQ.run(
        q.id,
        q.question,
        q.subject_id,
        q.topic_id,
        q.difficulty,
        q.company_id,
        q.correct_answer,
        JSON.stringify(q)
      );

      for (const opt of q.options) {
        const optId = `opt-${q.id}-${opt.option_key.toLowerCase()}`;
        insertOpt.run(
          optId,
          q.id,
          opt.option_key,
          JSON.stringify({
            id: optId,
            question_id: q.id,
            option_key: opt.option_key,
            option_text: opt.option_text,
            is_correct: opt.is_correct,
            explanation: opt.explanation
          })
        );
      }
    }

    // Insert clean knowledge documents
    const insertDoc = sqlite.prepare(`
      INSERT OR REPLACE INTO knowledgeDocuments (id, data, created_at, updated_at)
      VALUES (?, ?, datetime('now'), datetime('now'))
    `);
    for (const doc of standardKnowledgeDocs) {
      insertDoc.run(doc.id, JSON.stringify(doc));
    }

    sqlite.close();
    console.log('✓ SQLite database synchronized cleanly!');
  }

  // 3. Synchronize PostgreSQL 18
  try {
    const pgClient = new pg.Client({ connectionString: POSTGRES_URL });
    await pgClient.connect();
    console.log('✓ Connected to PostgreSQL 18 instance');

    // Clean obsolete gfg records
    await pgClient.query(`DELETE FROM questions WHERE id LIKE 'q-gfg-%'`);
    await pgClient.query(`DELETE FROM knowledge_documents WHERE id LIKE 'doc-gfg-%'`);

    // Insert topics
    for (const t of standardDsaTopics) {
      await pgClient.query(`
        INSERT INTO topics (id, subject_id, name, description, importance_weight)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          importance_weight = EXCLUDED.importance_weight
      `, [t.id, t.subject_id, t.name, t.description, t.importance_weight]);
    }

    // Insert clean questions and options
    for (const q of cleanQuestions) {
      await pgClient.query(`
        INSERT INTO questions (id, question, question_type, branch_id, company_id, subject_id, topic_id, difficulty, correct_answer, explanation, tags, expected_time, xp_value)
        VALUES ($1, $2, 'MCQ', 'branch-cse', $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11)
        ON CONFLICT (id) DO UPDATE SET
          question = EXCLUDED.question,
          difficulty = EXCLUDED.difficulty,
          correct_answer = EXCLUDED.correct_answer,
          explanation = EXCLUDED.explanation,
          tags = EXCLUDED.tags
      `, [
        q.id,
        q.question,
        q.company_id,
        q.subject_id,
        q.topic_id,
        q.difficulty,
        q.correct_answer,
        q.explanation,
        JSON.stringify(q.tags),
        q.expected_time,
        q.xp_value
      ]);

      for (const opt of q.options) {
        const optId = `opt-${q.id}-${opt.option_key.toLowerCase()}`;
        await pgClient.query(`
          INSERT INTO question_options (id, question_id, option_key, option_text, is_correct, explanation)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO UPDATE SET
            option_text = EXCLUDED.option_text,
            is_correct = EXCLUDED.is_correct,
            explanation = EXCLUDED.explanation
        `, [optId, q.id, opt.option_key, opt.option_text, opt.is_correct, opt.explanation]);
      }
    }

    // Insert clean RAG knowledge documents
    for (const doc of standardKnowledgeDocs) {
      await pgClient.query(`
        INSERT INTO knowledge_documents (id, title, branch_id, subject_id, company_id, category, content, summary, keywords)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          content = EXCLUDED.content,
          summary = EXCLUDED.summary,
          keywords = EXCLUDED.keywords
      `, [
        doc.id,
        doc.title,
        doc.branch_id,
        doc.subject_id,
        doc.company_id,
        doc.category,
        doc.content,
        doc.summary,
        JSON.stringify(doc.keywords)
      ]);
    }

    const qCount = await pgClient.query('SELECT COUNT(*) FROM questions');
    const optCount = await pgClient.query('SELECT COUNT(*) FROM question_options');
    const docCount = await pgClient.query('SELECT COUNT(*) FROM knowledge_documents');
    const tCount = await pgClient.query('SELECT COUNT(*) FROM topics WHERE subject_id = $1', ['sub-dsa']);

    console.log('\n======================================================');
    console.log('🎉 ADVANCED DSA CURRICULUM SYNC COMPLETED:');
    console.log(`  - DSA Specific Topics: ${tCount.rows[0].count}`);
    console.log(`  - Total Platform Questions: ${qCount.rows[0].count}`);
    console.log(`  - Total Question Options: ${optCount.rows[0].count}`);
    console.log(`  - RAG Knowledge Documents: ${docCount.rows[0].count}`);
    console.log('======================================================\n');

    await pgClient.end();
  } catch (err) {
    console.error('PostgreSQL Sync Error:', err.message);
  }
}

syncAdvancedCurriculum().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
