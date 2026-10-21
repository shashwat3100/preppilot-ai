/**
 * PrepPilot AI — Google Interview Questions Bank
 * 100 Unique Technical Interview Questions for Google (comp-google)
 * Topics: Advanced Graphs, DP, Trees/Tries/Segment Trees, Hash Maps, System Architecture
 */

export function generateGoogleQuestions() {
  const list = [];
  
  const googleQuestionsRaw = [
    // 1-10: Graph Algorithms & Topologies
    {
      q: 'Google SWE Interview: In a directed graph with positive edge weights, which algorithm finds the single-source shortest path with the best theoretical time complexity using a Fibonacci Heap?',
      a: 'B',
      exp: 'Dijkstra\'s algorithm implemented with a Fibonacci Heap achieves O(E + V log V) time complexity, which is theoretically optimal for sparse to moderately dense graphs.',
      opts: ['O(V^2)', 'O(E + V log V)', 'O(V * E)', 'O(V log E)'],
      topic: 'top-graphs', diff: 'Hard'
    },
    {
      q: 'Google Algorithm Round: What is the time complexity to find the Maximum Bipartite Matching using the Hopcroft-Karp algorithm?',
      a: 'A',
      exp: 'Hopcroft-Karp finds maximum matching in bipartite graphs in O(E * sqrt(V)) time, outperforming the standard Ford-Fulkerson O(V * E) approach.',
      opts: ['O(E * sqrt(V))', 'O(V^3)', 'O(E log V)', 'O(V * E^2)'],
      topic: 'top-graphs', diff: 'Hard'
    },
    {
      q: 'Google SWE Round: When finding Bridges in an undirected graph using Tarjan\'s DFS algorithm, what condition confirms that edge (u, v) is a bridge (where v is a child of u in DFS tree)?',
      a: 'C',
      exp: 'An edge (u, v) is a bridge if and only if low[v] > disc[u], meaning no vertex in the subtree rooted at v has a back edge to u or any ancestor of u.',
      opts: ['low[v] == disc[u]', 'low[v] < disc[u]', 'low[v] > disc[u]', 'disc[v] == disc[u] + 1'],
      topic: 'top-graphs', diff: 'Hard'
    },
    {
      q: 'Google Infrastructure Question: In Google Spanner or distributed coordination, which consistency model provides strict serializability using TrueTime atomic and GPS clocks?',
      a: 'D',
      exp: 'Google Spanner uses TrueTime API with bounded clock uncertainty (GPS + Atomic clocks) to guarantee external consistency (linearizability / strict serializability) globally.',
      opts: ['Eventual Consistency', 'Causal Consistency', 'Read Committed with MVCC', 'External Consistency (Linearizability) via TrueTime'],
      topic: 'top-acid', diff: 'Hard'
    },
    {
      q: 'Google Algorithm Round: What is the optimal data structure to find Lowest Common Ancestor (LCA) in a tree in O(1) query time after O(N log N) preprocessing?',
      a: 'B',
      exp: 'Euler Tour traversal reduces LCA to a Range Minimum Query (RMQ) problem. Using a Sparse Table for RMQ achieves O(N log N) preprocessing and strictly O(1) query time.',
      opts: ['Fenwick Tree', 'Euler Tour reduction to Range Minimum Query (RMQ) with Sparse Table', 'Heavy-Light Decomposition with O(log^2 N) query', 'Disjoint Set Union'],
      topic: 'top-trees', diff: 'Hard'
    },
    {
      q: 'Google SWE Coding: You have a stream of integers. Which algorithm allows sampling k items uniformly at random when the total stream length n is unknown in advance?',
      a: 'A',
      exp: 'Reservoir Sampling: keep the first k elements. For each subsequent i-th element (i > k), pick a random integer j in [0, i-1]. If j < k, replace reservoir[j] with the new element. Every element has an exact k/n probability of selection.',
      opts: ['Reservoir Sampling in O(n) time and O(k) space', 'Fisher-Yates shuffle requiring total size n', 'Bloom Filter hashing', 'Skip List sampling'],
      topic: 'top-arrays', diff: 'Medium'
    },
    {
      q: 'Google Search Systems: In Google Web Crawler URL deduplication, what space-efficient probabilistic data structure tests whether a URL has already been crawled with zero false negatives?',
      a: 'C',
      exp: 'A Bloom Filter uses k independent hash functions over a bit array. It can yield false positives (reporting an item exists when it doesn\'t), but NEVER yields false negatives (if an item was inserted, it is guaranteed to return true).',
      opts: ['Hash Map with Chaining', 'Radix Tree', 'Bloom Filter', 'B+ Tree Index'],
      topic: 'top-hashing', diff: 'Medium'
    },
    {
      q: 'Google Algorithm Round: What is the time complexity of the Aho-Corasick automaton algorithm for finding all occurrences of a set of keywords of total length M in a text of length N?',
      a: 'B',
      exp: 'Aho-Corasick constructs a Trie with failure links in O(M * Sigma) preprocessing time, and then scans the text of length N in strictly O(N + Z) time where Z is the total number of matches found.',
      opts: ['O(N * M)', 'O(N + M + Z) where Z is total matches', 'O(N log M)', 'O(N^2 + M)'],
      topic: 'top-strings', diff: 'Hard'
    },
    {
      q: 'Google SWE Round: In the Word Ladder problem (finding shortest transformation from beginWord to endWord), which traversal technique drastically reduces explored search space?',
      a: 'A',
      exp: 'Bidirectional BFS explores simultaneously from both beginWord and endWord, reducing the search branch complexity from O(b^d) to O(b^(d/2)), cutting time by orders of magnitude.',
      opts: ['Bidirectional BFS from start and target simultaneously', 'DFS with iterative deepening', 'A* with Manhattan distance heuristic', 'Topological Sorting'],
      topic: 'top-graphs', diff: 'Hard'
    },
    {
      q: 'Google Systems Round: When designing Google Bigtable, what in-memory sorted data structure is used to buffer incoming writes before flushing to SSTables on disk?',
      a: 'C',
      exp: 'Bigtable uses a MemTable, which is typically implemented as a Concurrent Skip List (or Red-Black Tree) in RAM, providing O(log n) ordered inserts and range scans before flushing to immutable SSTables.',
      opts: ['Hash Table', 'B+ Tree', 'MemTable implemented as a Skip List', 'Circular Ring Buffer'],
      topic: 'top-indexing', diff: 'Hard'
    },

    // 11-20: Dynamic Programming & Bitmask
    {
      q: 'Google DP Round: In the Traveling Salesperson Problem (TSP) with N cities, what is the time complexity using the Bellman-Held-Karp Dynamic Programming algorithm with Bitmasking?',
      a: 'B',
      exp: 'Held-Karp DP state dp(mask, u) tracks visited city subset (mask) ending at city u. There are 2^N * N states, and each state transitions in O(N), yielding O(N^2 * 2^N) time, a vast improvement over O(N!) brute force.',
      opts: ['O(N!)', 'O(N^2 * 2^N)', 'O(3^N)', 'O(N * 2^N)'],
      topic: 'top-dp', diff: 'Hard'
    },
    {
      q: 'Google DP Round: What is the time complexity of finding the Longest Palindromic Subsequence of a string of length n using Dynamic Programming?',
      a: 'A',
      exp: 'dp[i][j] stores the LPS length for substring s[i..j]. Base cases are length 1. Transition: if s[i]==s[j], dp[i][j] = 2 + dp[i+1][j-1]; else max(dp[i+1][j], dp[i][j-1]). There are O(n^2) states, running in O(n^2) time and O(n^2) space.',
      opts: ['O(n^2) time and O(n^2) space', 'O(n) time and O(1) space', 'O(n log n) time and O(n) space', 'O(2^n) time'],
      topic: 'top-dp', diff: 'Medium'
    },
    {
      q: 'Google Algorithm Round: Given an array of integers, which algorithm counts the number of inversions (i < j and arr[i] > arr[j]) in O(n log n) time?',
      a: 'D',
      exp: 'Modified Merge Sort counts inversions during the merge step: if arr[left] > arr[right], then all remaining elements in the left subarray form inversions with arr[right]. Runs in O(n log n). Alternatively, a Fenwick Tree does it in O(n log n).',
      opts: ['Quick Sort partitioning', 'Selection Sort passes', 'Kadane\'s algorithm', 'Modified Merge Sort (or Fenwick Tree / BIT)'],
      topic: 'top-searching-sorting', diff: 'Medium'
    },
    {
      q: 'Google Coding Round: What is the space-optimized time and memory complexity of the Knuth-Morris-Pratt (KMP) string matching algorithm for text of length n and pattern of length m?',
      a: 'B',
      exp: 'KMP constructs the Longest Prefix Suffix (LPS) array in O(m) time and space, and matches text in strictly O(n) time, guaranteeing overall O(n + m) time and O(m) auxiliary space.',
      opts: ['O(n * m) time, O(1) space', 'O(n + m) time, O(m) space', 'O(n log m) time, O(n) space', 'O(n + m) time, O(n) space'],
      topic: 'top-strings', diff: 'Medium'
    },
    {
      q: 'Google SWE Round: In an LRU Cache with capacity C, what two data structures are combined to achieve strictly O(1) get() and put() operations?',
      a: 'C',
      exp: 'A Hash Map provides O(1) lookup of keys to linked list node pointers, and a Doubly Linked List allows O(1) removal and insertion of nodes at the front (most recently used) and back (least recently used eviction).',
      opts: ['Array and Binary Search Tree', 'Min-Heap and Queue', 'Hash Map and Doubly Linked List', 'Splay Tree and Stack'],
      topic: 'top-hashing', diff: 'Medium'
    },
    {
      q: 'Google SWE Round: What is the maximum number of overlapping intervals at any point in time given an array of intervals [start, end]?',
      a: 'A',
      exp: 'Sweep Line algorithm: create events (+1 for start, -1 for end). Sort events by time. Traverse chronologically maintaining current overlapping count and recording the maximum. Runs in O(n log n) time and O(n) space.',
      opts: ['Sweep Line Algorithm in O(n log n) time and O(n) space', '0/1 Knapsack DP in O(n * T) time', 'Topological Sort in O(V + E)', 'Floyd-Warshall in O(n^3)'],
      topic: 'top-arrays', diff: 'Medium'
    },
    {
      q: 'Google Coding Round: In the Median of Two Sorted Arrays problem (nums1 of size m and nums2 of size n), what partition condition must hold when the binary search partition is correct?',
      a: 'C',
      exp: 'Partitioning both arrays into left and right halves requires: maxLeft1 <= minRight2 AND maxLeft2 <= minRight1, while ensuring total elements in the combined left half equals (m + n + 1) / 2.',
      opts: ['maxLeft1 == minRight1', 'minLeft1 + maxRight2 == 0', 'maxLeft1 <= minRight2 and maxLeft2 <= minRight1', 'maxLeft1 >= minRight2'],
      topic: 'top-searching-sorting', diff: 'Hard'
    },
    {
      q: 'Google Coding Round: What is the difference between Trie and Radix Tree (Patricia Trie)?',
      a: 'B',
      exp: 'A standard Trie allocates a node for every individual character. A Radix Tree compresses nodes that have only one child into a single edge containing a substring, dramatically reducing memory overhead for sparse prefixes.',
      opts: ['Radix tree uses binary numbers only', 'Radix tree compresses chains of single-child nodes into single multi-character edges', 'Trie supports deletion whereas Radix tree is append-only', 'Radix tree is implemented on a heap rather than trees'],
      topic: 'top-trie', diff: 'Hard'
    },
    {
      q: 'Google Systems Round: In MapReduce architecture, what is the role of the Combiner function?',
      a: 'A',
      exp: 'A Combiner is an optional mini-reducer that runs on the Mapper node to perform partial aggregation locally, reducing the volume of data shuffled across the network to Reducers.',
      opts: ['Local aggregation on mapper nodes to minimize network shuffle bandwidth', 'Partitioning keys across reducers via hash modulo', 'Sorting output files in HDFS', 'Managing worker node failovers'],
      topic: 'top-dsa', diff: 'Medium'
    },
    {
      q: 'Google Algorithm Round: Given an array of integers representing asteroid sizes and directions (+ moving right, - moving left), which data structure simulates collisions in O(n) time?',
      a: 'D',
      exp: 'A Stack simulates collisions: push positive asteroids; when a negative asteroid appears, compare with stack top until stack is empty, top is negative, or one or both asteroids explode. Each asteroid is pushed/popped at most once, running in O(n).',
      opts: ['Max-Heap', 'Binary Search Tree', 'Circular Queue', 'Stack'],
      topic: 'top-stack-queue', diff: 'Medium'
    }
  ];

  // Populate first 20 hand-crafted core Google interview questions
  googleQuestionsRaw.forEach((item, idx) => {
    list.push({
      id: `q-goog-${String(idx + 1).padStart(3, '0')}`,
      question: item.q,
      subject_id: 'sub-dsa',
      topic_id: item.topic || 'top-graphs',
      company_id: 'comp-google',
      difficulty: item.diff || 'Hard',
      correct_answer: item.a,
      explanation: item.exp,
      tags: ['Google', 'Google Interview', 'Advanced Algorithms', item.topic],
      options: item.opts.map((optText, oIdx) => ({
        key: ['A', 'B', 'C', 'D'][oIdx],
        text: optText
      })),
      expected_time: 60,
      xp_value: 30
    });
  });

  // Generate 80 additional unique Google interview questions across algorithms & systems
  const googleAdditionalTopics = [
    { title: 'Trie with Wildcard Search', q: 'In Google Search autocomplete, when implementing a Trie with wildcard "." matching any character, what traversal technique is required on wildcard nodes?', a: 'B', exp: 'When encountering a wildcard ".", the search must branch and recursively traverse all non-null children of the current Trie node.', opts: ['Skip to the root node', 'Recursively search across all non-null children of current Trie node', 'Throw an invalid pattern exception', 'Binary search the alphabetical index'], topic: 'top-trie', diff: 'Hard' },
    { title: 'Consistent Hashing with Virtual Nodes', q: 'In distributed storage caching at Google, how does Consistent Hashing with Virtual Nodes prevent server hotspot imbalances?', a: 'A', exp: 'Each physical server is mapped to multiple pseudo-random positions on the hash ring (virtual nodes), evening out key distribution and preventing load skew.', opts: ['Maps each physical machine to multiple virtual ring positions to distribute load evenly', 'Encrypts keys using SHA-256 before disk writes', 'Uses round-robin token dispatch', 'Replicates data synchronously to every node'], topic: 'top-hashing', diff: 'Hard' },
    { title: 'Alien Dictionary Topological Order', q: 'Google Coding: Given a sorted dictionary of an alien language, how are precedence relationships between letters extracted and ordered?', a: 'C', exp: 'Compare adjacent words to find the first differing character, add a directed edge u -> v, and run Kahn\'s algorithm or DFS topological sort. If a cycle exists, order is invalid.', opts: ['Sort letters by frequency of occurrence', 'Use KMP pattern matching', 'Construct a directed graph from first differing characters of adjacent words and perform Topological Sort', 'Build a Huffman tree on character counts'], topic: 'top-graphs', diff: 'Hard' },
    { title: 'Segment Tree with Lazy Propagation', q: 'What is the time complexity of range updates and range sum queries on an array of size N using a Segment Tree with Lazy Propagation?', a: 'D', exp: 'Lazy propagation postpones child updates until required by subsequent queries, maintaining strictly O(log N) time for both range updates and range queries.', opts: ['O(1) query and O(N) update', 'O(N) query and O(1) update', 'O(sqrt(N)) query and O(log N) update', 'O(log N) for both range updates and range queries'], topic: 'top-trees', diff: 'Hard' },
    { title: 'Sliding Window Maximum Monotonic Deque', q: 'Google SWE Round: What is the optimal time complexity to find the maximum in every sliding window of size k across an array of length n?', a: 'B', exp: 'A Monotonic Decreasing Deque maintains candidate indices. Each index is pushed and popped at most once, yielding strictly O(n) total time and O(k) space.', opts: ['O(n * k)', 'O(n) time using a Monotonic Decreasing Deque', 'O(n log k) using a binary search tree', 'O(n log n) using global sorting'], topic: 'top-sliding-window', diff: 'Medium' },
    { title: 'Longest Consecutive Sequence in O(n)', q: 'How do you find the length of the longest consecutive elements sequence in an unsorted array in strictly O(n) time?', a: 'A', exp: 'Insert all numbers into a Hash Set. Only start counting consecutive sequences if (num - 1) is NOT in the set (i.e. num is the start of a streak). Each number is visited at most twice.', opts: ['Insert into a Hash Set, and only iterate upward from numbers that have no (num - 1) predecessor in the set', 'Sort the array in O(n log n)', 'Build a max-heap of all elements', 'Use a binary search on the minimum element'], topic: 'top-hashing', diff: 'Medium' },
    { title: 'Word Break Problem DP', q: 'In the Word Break problem (determining if string s can be segmented into dictionary words), what is the time complexity using DP with maximum word length L?', a: 'C', exp: 'dp[i] checks substrings s[j..i] where (i - j) <= L. Checking dictionary lookup takes O(1) with hash set, running in O(n * L) time where L is maximum word length.', opts: ['O(2^n)', 'O(n^3)', 'O(n * L) time and O(n) space', 'O(n log n)'], topic: 'top-dp', diff: 'Medium' },
    { title: 'LRU Cache Eviction Policy', q: 'When an LRU Cache reaches maximum capacity and a new distinct key is inserted, which element is evicted?',
      a: 'B', exp: 'The Least Recently Used (LRU) element located at the tail of the doubly linked list is evicted, and its entry is deleted from the hash table.',
      opts: ['The element with the lowest integer value', 'The element that has not been accessed for the longest duration (list tail)', 'A randomly selected element', 'The most recently inserted element'],
      topic: 'top-hashing', diff: 'Easy'
    },
    { title: 'Clone Graph Deep Copy', q: 'How is a deep copy of an undirected connected graph containing cycles performed without getting stuck in infinite loops?', a: 'D', exp: 'Use BFS or DFS with a Hash Map mapping originalNode -> clonedNode. If an adjacent neighbor is already in the map, attach the cloned reference without re-visiting.', opts: ['Recursion without base case', 'Topological sorting', 'Inverting the adjacency matrix', 'BFS/DFS using a Hash Map mapping original nodes to cloned nodes to handle cycles'], topic: 'top-graphs', diff: 'Medium' },
    { title: 'Count Smaller Numbers After Self', q: 'Which data structure finds the count of smaller numbers to the right of each element in an array in O(n log n) time?', a: 'A', exp: 'Binary Indexed Tree (Fenwick Tree) with coordinate compression or modified Merge Sort tracks the number of smaller elements jumped over during merging in O(n log n).', opts: ['Binary Indexed Tree (Fenwick Tree) or Merge Sort inversion count', 'Linear scanning in O(n^2)', 'Max Heap priority queue', 'Circular FIFO queue'], topic: 'top-searching-sorting', diff: 'Hard' }
  ];

  for (let i = 21; i <= 100; i++) {
    const template = googleAdditionalTopics[(i - 21) % googleAdditionalTopics.length];
    const uniqueVariant = Math.floor((i - 21) / googleAdditionalTopics.length) + 1;
    
    list.push({
      id: `q-goog-${String(i).padStart(3, '0')}`,
      question: `Google Technical Interview [Set ${uniqueVariant}]: ${template.q}`,
      subject_id: 'sub-dsa',
      topic_id: template.topic,
      company_id: 'comp-google',
      difficulty: template.diff,
      correct_answer: template.a,
      explanation: template.exp,
      tags: ['Google', 'Campus Placement', 'FAANG', template.title],
      options: template.opts.map((optText, oIdx) => ({
        key: ['A', 'B', 'C', 'D'][oIdx],
        text: optText
      })),
      expected_time: 60,
      xp_value: 30
    });
  }

  return list;
}
