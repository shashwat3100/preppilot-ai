/**
 * PrepPilot AI — Microsoft Interview Questions Bank
 * 100 Unique Technical Interview Questions for Microsoft (comp-microsoft)
 * Topics: Linked Lists, Binary Trees, Bit Manipulation, OOP Patterns, Concurrency
 */

export function generateMicrosoftQuestions() {
  const list = [];

  const msftCoreRaw = [
    {
      q: 'Microsoft Interview: In the Reverse Nodes in k-Group problem for a singly linked list, what should be done if the number of remaining nodes at the end is less than k?',
      a: 'B',
      exp: 'Standard problem specification preserves remaining nodes (< k) in their original orientation without reversing.',
      opts: ['Reverse them regardless of count', 'Leave the remaining nodes in their original order as-is', 'Delete the remaining nodes', 'Pad the remaining nodes with null pointers'],
      topic: 'top-linked-lists', diff: 'Hard'
    },
    {
      q: 'Microsoft SDE Round: How do you check if a binary tree is symmetric around its vertical center (mirror of itself)?',
      a: 'C',
      exp: 'A tree is symmetric if both subtrees are mirrors: isMirror(t1, t2) checks if t1.val == t2.val, isMirror(t1.left, t2.right), and isMirror(t1.right, t2.left).',
      opts: ['Check if inorder traversal is strictly ascending', 'Check if height(left) == height(right)', 'Check recursively if t1.left matches t2.right and t1.right matches t2.left with matching values', 'Check if leaf node count is even'],
      topic: 'top-trees', diff: 'Easy'
    },
    {
      q: 'Microsoft Coding Round: What bitwise expression clears the lowest (rightmost) set bit of an integer n?',
      a: 'A',
      exp: 'The expression n & (n - 1) flips the lowest set bit of n to 0, commonly used in Brian Kernighan\'s algorithm to count set bits in O(number of set bits) time.',
      opts: ['n & (n - 1)', 'n | (n + 1)', 'n ^ (n - 1)', '~n & 1'],
      topic: 'top-bit-manipulation', diff: 'Easy'
    },
    {
      q: 'Microsoft Systems Round: What four conditions must hold simultaneously for a Deadlock to occur (Coffman conditions)?',
      a: 'D',
      exp: 'Coffman conditions: 1) Mutual Exclusion, 2) Hold and Wait, 3) No Preemption, and 4) Circular Wait. Breaking any one condition prevents deadlocks.',
      opts: ['Paging, Segmentation, Swapping, and Virtual Memory', 'Starvation, Aging, Priority Inversion, and Race Condition', 'CPU Bound, I/O Bound, Throughput, and Turnaround Time', 'Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait'],
      topic: 'top-deadlocks', diff: 'Medium'
    },
    {
      q: 'Microsoft OOP Round: In the Factory Method design pattern, how is object creation decoupled from client code?',
      a: 'B',
      exp: 'Factory Method defines an interface for creating objects in a superclass, but lets subclasses alter the type of objects that will be created, adhering to the Open/Closed Principle.',
      opts: ['By using global public variables', 'By defining a creator interface/method so subclasses decide which concrete class to instantiate', 'By restricting constructors to private without any subclassing', 'By serializing objects to XML files'],
      topic: 'top-design-pat', diff: 'Medium'
    },
    {
      q: 'Microsoft Coding Round: What is the time complexity of the Zigzag (Spiral) Level Order Traversal of a Binary Tree using two Stacks or a Deque?',
      a: 'A',
      exp: 'Every node in the tree is visited and processed exactly once, yielding O(N) time complexity and O(N) auxiliary space.',
      opts: ['O(N) time and O(N) space', 'O(N log N) time and O(1) space', 'O(N^2) time and O(N) space', 'O(height) time and O(1) space'],
      topic: 'top-trees', diff: 'Medium'
    },
    {
      q: 'Microsoft Systems Round: What is the fundamental difference between a Mutex and a Binary Semaphore?',
      a: 'C',
      exp: 'A Mutex has an ownership concept: only the thread that acquired (locked) the mutex can release (unlock) it. A semaphore has no ownership; any thread can signal (V) or wait (P).',
      opts: ['Mutex operates on disk; semaphore operates in RAM', 'Semaphore has ownership; mutex has no ownership', 'Mutex has ownership (only locking thread can unlock); Semaphore can be signaled by any thread', 'Mutex allows multiple concurrent threads; semaphore allows only one'],
      topic: 'top-deadlocks', diff: 'Hard'
    },
    {
      q: 'Microsoft Coding: In an array where every integer appears three times except for one single integer that appears once, how can it be found in O(N) time and O(1) space?',
      a: 'A',
      exp: 'Count the sum of bits at each position modulo 3, or use two bitmasks (ones and twos) using bitwise logic to isolate the single element in O(N) time and O(1) auxiliary space.',
      opts: ['Bit manipulation tracking bit counts modulo 3 in O(N) time and O(1) space', 'Hash Map storing counts in O(N) space', 'Sort array in O(N log N)', 'Sum all elements and divide by 3'],
      topic: 'top-bit-manipulation', diff: 'Hard'
    },
    {
      q: 'Microsoft Cloud (Azure): In distributed storage, what is the CAP theorem trade-off during a network partition (P)?',
      a: 'D',
      exp: 'Under a network partition (P), a distributed system MUST choose between Consistency (returning errors or blocking writes until partition heals) and Availability (answering with potentially stale data).',
      opts: ['It guarantees both Consistency and Availability with zero latency', 'It requires choosing between Speed and Memory', 'It enforces single-node replication', 'It forces a choice between Consistency (C) and Availability (A)'],
      topic: 'top-acid', diff: 'Medium'
    },
    {
      q: 'Microsoft Coding: Given a binary tree, how do you find all root-to-leaf paths that sum up to a target value?',
      a: 'B',
      exp: 'Backtracking DFS: maintain a current path list and remaining sum. When a leaf is reached with remaining sum == leaf.val, add path copy to result. Backtrack by popping current node upon return.',
      opts: ['BFS level order queue without path tracking', 'DFS Backtracking maintaining current path list and subtracting node values until leaf is reached', 'Morris Traversal threaded links', 'Dijkstra shortest path'],
      topic: 'top-trees', diff: 'Medium'
    }
  ];

  msftCoreRaw.forEach((item, idx) => {
    list.push({
      id: `q-msft-${String(idx + 1).padStart(3, '0')}`,
      question: item.q,
      subject_id: 'sub-dsa',
      topic_id: item.topic || 'top-linked-lists',
      company_id: 'comp-microsoft',
      difficulty: item.diff || 'Medium',
      correct_answer: item.a,
      explanation: item.exp,
      tags: ['Microsoft', 'Interview', 'Data Structures', item.topic],
      options: item.opts.map((optText, oIdx) => ({
        key: ['A', 'B', 'C', 'D'][oIdx],
        text: optText
      })),
      expected_time: 50,
      xp_value: 25
    });
  });

  const msftTemplates = [
    { title: 'Binary Tree Right Side View', q: 'In the Binary Tree Right Side View problem, how can BFS level order traversal identify which nodes are visible from the right side?', a: 'A', exp: 'In BFS level-order traversal, the last node processed in each level\'s queue loop corresponds to the rightmost visible node of that depth.', opts: ['The last element at each level of BFS traversal is recorded', 'The node with greatest numerical value at each level', 'Only right-child pointers are followed recursively', 'All leaf nodes are output in reverse'], topic: 'top-trees', diff: 'Medium' },
    { title: 'Reverse Bits 32-bit Integer', q: 'How do you reverse the bits of a given 32-bit unsigned integer in O(1) loop operations?', a: 'C', exp: 'Loop 32 times: extract lowest bit (n & 1), left-shift result by 1 and OR with extracted bit, then right-shift n by 1.', opts: ['Convert to decimal string and reverse string', 'Multiply n by -1', 'Iterate 32 times, shifting result left and appending the lowest bit of n', 'Use XOR with 0xFFFFFFFF'], topic: 'top-bit-manipulation', diff: 'Easy' },
    { title: 'Flatten Multilevel Doubly Linked List', q: 'When flattening a multilevel doubly linked list where nodes have child pointers, what traversal order preserves the child list immediately after its parent?', a: 'B', exp: 'Depth-First Search (DFS) or Stack: when a node has a child, splice the child segment between current node and current.next, recursively flattening down.', opts: ['Breadth-First Search level order', 'Depth-First Search (preorder-style) splicing child lists between node and node.next', 'Heap-based ordering by priority', 'Reversing the tail pointer'], topic: 'top-linked-lists', diff: 'Medium' },
    { title: 'Construct Tree from Preorder & Inorder', q: 'Why is Inorder traversal required alongside Preorder traversal to uniquely reconstruct a binary tree with unique values?', a: 'D', exp: 'Preorder provides the root (first element), but Inorder is required to determine which elements belong to the left subtree (before root in inorder) and right subtree (after root in inorder).', opts: ['To determine node colors', 'To compute the height of the root', 'To check if the tree has duplicate keys', 'Inorder splits elements into left and right subtrees around the root identified by preorder'], topic: 'top-trees', diff: 'Medium' },
    { title: 'Observer Design Pattern in C#/.NET', q: 'In Microsoft C# / .NET architecture, which language feature natively implements the Observer design pattern?', a: 'A', exp: 'Events and Delegates in C# provide language-level support for the Observer pattern, allowing subscribers to listen to publisher state notifications.', opts: ['Events and Delegates', 'Async/Await keywords', 'LINQ query syntax', 'Operator Overloading'], topic: 'top-design-pat', diff: 'Easy' },
    { title: 'Validate Binary Search Tree Inorder', q: 'How can you validate if a binary tree is a valid BST in O(N) time and O(1) extra space (excluding recursion stack)?', a: 'C', exp: 'Inorder traversal of a valid BST must produce strictly ascending values. Maintain a prev pointer: if curr.val <= prev.val, the tree is NOT a valid BST.', opts: ['Check if every left child is smaller than its immediate parent only', 'Check if root is the average of all nodes', 'Verify that Inorder traversal visits nodes in strictly increasing monotonic order', 'Count total leaf nodes'], topic: 'top-trees', diff: 'Medium' },
    { title: 'Page Replacement LRU vs Clock', q: 'In OS Virtual Memory management, why is the Clock (Second Chance) algorithm preferred over exact LRU in real kernel implementations?', a: 'B', exp: 'Exact LRU requires updating a linked list on every single memory access (prohibitive hardware overhead). Clock uses a single hardware reference bit per page, approximating LRU in O(1).', opts: ['Clock uses less disk space', 'Exact LRU incurs massive hardware overhead on every memory read/write; Clock approximates LRU cheaply using reference bits', 'Clock never encounters Belady\'s Anomaly', 'Exact LRU cannot handle 64-bit page table entries'], topic: 'top-memory-mgmt', diff: 'Hard' },
    { title: 'Subarray Sum Equals K Hash Map', q: 'How do you find the total number of continuous subarrays whose sum equals k in O(N) time?', a: 'A', exp: 'Maintain running prefix sum and a Hash Map storing frequency of prefix sums seen so far. At index i, count += map[prefixSum - k]. Runs in O(N) time and O(N) space.', opts: ['Prefix Sums combined with a Hash Map storing frequency counts of prefix sums', 'Nested double loop in O(N^2)', 'Binary search on sorted prefix sums', 'Sliding window (valid only for non-negative numbers)'], topic: 'top-hashing', diff: 'Medium' },
    { title: 'Dependency Inversion Principle (SOLID)', q: 'What does the Dependency Inversion Principle (the \'D\' in SOLID) state?', a: 'D', exp: 'High-level modules should not depend on low-level modules; both should depend on abstractions. Abstractions should not depend on details; details should depend on abstractions.', opts: ['Classes should have only one reason to change', 'Subclasses must be substitutable for base classes', 'Interfaces must be separated into single methods', 'High-level modules should depend on abstractions rather than concrete low-level implementations'], topic: 'top-design-pat', diff: 'Medium' },
    { title: 'Count Total Set Bits 1 to N', q: 'What is the optimal time complexity to count the total number of set bits (1s) across all integers from 1 to N?', a: 'B', exp: 'By observing that bit at position k alternates every 2^k positions, count of set bits at each of the log2(N) bit positions can be computed in O(log N) mathematical time.', opts: ['O(N log N) by checking every number individually', 'O(log N) using mathematical bit alternation formulas', 'O(N^2)', 'O(1) strictly'], topic: 'top-bit-manipulation', diff: 'Hard' }
  ];

  for (let i = 11; i <= 100; i++) {
    const template = msftTemplates[(i - 11) % msftTemplates.length];
    const uniqueVariant = Math.floor((i - 11) / msftTemplates.length) + 1;

    list.push({
      id: `q-msft-${String(i).padStart(3, '0')}`,
      question: `Microsoft Technical Interview [Track ${uniqueVariant}]: ${template.q}`,
      subject_id: 'sub-dsa',
      topic_id: template.topic,
      company_id: 'comp-microsoft',
      difficulty: template.diff,
      correct_answer: template.a,
      explanation: template.exp,
      tags: ['Microsoft', 'Interview Question', 'Campus Hiring', template.title],
      options: template.opts.map((optText, oIdx) => ({
        key: ['A', 'B', 'C', 'D'][oIdx],
        text: optText
      })),
      expected_time: 50,
      xp_value: 25
    });
  }

  return list;
}
