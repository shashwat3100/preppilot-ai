/**
 * PrepPilot AI — Comprehensive Knowledge Documents Registry
 * Grounded syllabus and campus recruitment blueprints for RAG vector retrieval.
 */

export const EXTENDED_KNOWLEDGE_DOCS = [
  {
    id: "doc-norm-guide",
    title: "Mastering Database Normalization (1NF, 2NF, 3NF, BCNF) for Placement Interviews",
    branch_id: "branch-it",
    subject_id: "sub-dbms",
    company_id: "comp-tcs",
    category: "CONCEPT",
    keywords: [
      "normalization", "1nf", "2nf", "3nf", "bcnf",
      "functional dependencies", "redundancy", "transitive",
      "candidate key", "super key", "database", "sql"
    ],
    summary: "Comprehensive viva guide on eliminating anomalies (insertion, deletion, update) in relational schemas with clear interview examples.",
    content: `Database Normalization is the systematic technique of organizing data in a relational database to minimize redundancy and eliminate anomalous dependencies (Insertion, Update, and Deletion anomalies).

Key Normal Forms for Technical Interviews:
1. First Normal Form (1NF):
   - Every column must hold atomic (indivisible) values.
   - No repeating groups or arrays stored in a single attribute.
   - A primary key must uniquely identify each record.

2. Second Normal Form (2NF):
   - Relation must be in 1NF.
   - Eliminates Partial Dependency: Every non-prime attribute must be fully functionally dependent on the entire primary key, not a proper subset of it.
   - Note: If the primary key consists of only a single attribute, the relation is automatically in 2NF if in 1NF!

3. Third Normal Form (3NF):
   - Relation must be in 2NF.
   - Eliminates Transitive Dependency: For every functional dependency X -> A, either X is a Super Key or A is a prime attribute. Non-prime attributes cannot determine other non-prime attributes.
   - Standard placement interview question: "Why is 3NF preferred over BCNF in industry?" Answer: 3NF guarantees dependency preservation while achieving lossless join decomposition.

4. Boyce-Codd Normal Form (BCNF / 3.5NF):
   - Stricter version of 3NF. For every functional dependency X -> A, X MUST be a Super Key without exception.

Common Interview Trap:
Candidate key vs Super key: A superkey is any set of attributes that uniquely identifies a row; a candidate key is a minimal superkey containing no redundant attributes.`
  },
  {
    id: "doc-acid-transactions",
    title: "ACID Properties, Isolation Levels and Deadlock Handling in Production DBMS",
    branch_id: "branch-it",
    subject_id: "sub-dbms",
    company_id: "comp-infosys",
    category: "CONCEPT",
    keywords: [
      "acid", "atomicity", "consistency", "isolation", "durability",
      "dirty read", "phantom read", "serializability", "2pl", "wal", "write ahead log"
    ],
    summary: "Interview-ready breakdown of transaction management, isolation anomalies and Two-Phase Locking (2PL).",
    content: `A database transaction is a logical unit of work that must satisfy ACID properties:
- Atomicity: "All or nothing" execution. Managed via Write-Ahead Logging (WAL) and Undo logs.
- Consistency: The database must transition from one valid state to another, preserving all integrity constraints and foreign keys.
- Isolation: Concurrent transactions must execute without mutual interference.
- Durability: Once a transaction commits, its modifications are permanently recorded even in the event of power outage or system crash (via Redo logs and checkpointing).

SQL Isolation Levels & Prevented Read Phenomena:
1. Read Uncommitted: Suffers from Dirty Reads, Non-Repeatable Reads, Phantom Reads.
2. Read Committed (Postgres default): Prevents Dirty Reads.
3. Repeatable Read (MySQL default): Prevents Dirty Reads and Non-Repeatable Reads.
4. Serializable: Prevents all anomalies including Phantom Reads via strict 2-Phase Locking (2PL) or SSI.`
  },
  {
    id: "doc-tcs-pattern",
    title: "TCS NQT & Digital Interview Blueprint – Frequently Tested Patterns",
    branch_id: "branch-cse",
    subject_id: "sub-dsa",
    company_id: "comp-tcs",
    category: "INTERVIEW_PATTERN",
    keywords: [
      "tcs", "nqt", "digital", "ninja", "prime", "pattern", "recruitment", "syllabus", "round"
    ],
    summary: "In-depth guide to cracking TCS National Qualifier Test: Foundation Cognitive, Advanced Quantitative, Pseudocode & Coding rounds.",
    content: `TCS NQT Recruitment Blueprint & Assessment Format:
1. Foundation Section:
   - Numerical Ability: Percentages, Profit and Loss, Time and Work, Ratios, Speed-Distance-Time.
   - Reasoning Ability: Data sufficiency, Syllogisms, Seating arrangements, Series.
   - Verbal Ability: Reading comprehension, Paragraph ordering, Sentence correction.

2. Advanced Cognitive & Technical Section:
   - Advanced Quantitative & Reasoning: Permutations & Combinations, Probability, Clocks & Calendars, Geometry.
   - Advanced Coding: 2 problems (30 & 60 minutes) covering arrays, strings, dynamic programming, matrix operations, and mathematical series.

3. Technical Interview Round:
   - Project Architecture: Explain your final year project, database schema design, and API endpoints.
   - Core CS Questions: Difference between processes and threads, OOP pillars with real-world examples, SQL indexing.`
  },
  {
    id: "doc-os-paging",
    title: "Operating Systems: Virtual Memory, Paging, Page Fault Handling & Thrashing",
    branch_id: "branch-cse",
    subject_id: "sub-os",
    company_id: "comp-accenture",
    category: "CONCEPT",
    keywords: [
      "operating systems", "virtual memory", "paging", "page fault",
      "thrashing", "tlb", "belady anomaly", "mmu", "working set"
    ],
    summary: "Detailed engineering walkthrough of virtual memory hardware, TLB lookups, page replacement algorithms, and thrashing prevention.",
    content: `Virtual Memory and Paging Architecture:
1. Virtual Memory Principle:
   - Decouples logical address space from physical memory (RAM).
   - The Memory Management Unit (MMU) translates virtual addresses (Page Number + Offset) to physical addresses (Frame Number + Offset).
   - Translation Lookaside Buffer (TLB): High-speed hardware associative cache holding recently translated page table entries.
   - TLB Hit: Translation occurs in hardware (~1 CPU cycle).
   - TLB Miss: Page table walk in RAM (~50-100 ns).

2. Page Fault Handling Steps:
   - Step 1: MMU generates a hardware page fault interrupt (trap) when the present bit in the page table entry is 0.
   - Step 2: CPU context switches from user mode to OS kernel mode.
   - Step 3: OS checks whether the address is valid in the process virtual memory map.
   - Step 4: OS locates the missing page in swap space on secondary storage (SSD/HDD).
   - Step 5: OS finds a free physical frame in RAM (or evicts a victim frame via page replacement).
   - Step 6: Disk I/O reads the page into the frame, page table entry is updated (present bit = 1), and the faulting instruction is restarted.

3. Page Replacement Algorithms:
   - FIFO: First-In First-Out. Suffers from Belady's Anomaly (increasing frames can increase page faults).
   - LRU: Least Recently Used. Uses stack or timestamp counters. Optimal approximation.
   - Optimal (OPT / Belady's Min): Replaces the page that will not be used for the longest future period. Benchmark only.

4. Thrashing:
   - Occurs when CPU utilization collapses because processes spend more time swapping pages in/out of swap space than executing instructions.
   - Remedy: Working Set Model and Local Page Replacement.`
  },
  {
    id: "doc-amazon-principles",
    title: "Cracking FAANG & Amazon Technical Interviews: DSA & STAR Method",
    branch_id: "branch-cse",
    subject_id: "sub-dsa",
    company_id: "comp-amazon",
    category: "INTERVIEW_PATTERN",
    keywords: [
      "amazon", "faang", "leadership principles", "star method",
      "coding interview", "behavioral", "sde", "system design"
    ],
    summary: "Mastering Amazon's 16 Leadership Principles, coding rounds expectations, and STAR behavioral answering framework.",
    content: `Amazon Technical Interview & SDE Blueprint:
1. Online Assessment (OA):
   - 2 Coding Questions (90 minutes): Arrays, Two Pointers, Hash Maps, Priority Queues, DFS/BFS on grids.
   - Work Style Assessment: Behavioral simulation choosing responses aligned with Amazon Leadership Principles.

2. Onsite Technical Rounds:
   - Coding Round 1: Core Algorithms & Data Structures (Monotonic Stacks, Sliding Window, Graph Traversals).
   - Coding Round 2: Tree traversals, Dynamic Programming, and edge case rigor.
   - Behavioral Round: Customer Obsession, Ownership, Bias for Action, Dive Deep, Earn Trust.

3. STAR Answering Framework:
   - Situation: Set the scene and background context (15% of answer).
   - Task: Define your specific responsibility and the problem constraint (15%).
   - Action: Detailed steps YOU took, tools used, and technical trade-offs evaluated (55%).
   - Result: Quantifiable business outcome, latency reduction, and lessons learned (15%).`
  },
  {
    id: "doc-ece-embedded",
    title: "ENTC / ECE Placement Core Guide: 8085 Architecture, Interrupts and Embedded C",
    branch_id: "branch-ece",
    subject_id: "sub-micro",
    company_id: "comp-capgemini",
    category: "CONCEPT",
    keywords: [
      "8085", "microprocessor", "ale pin", "interrupts", "trap",
      "rst", "multiplexed bus", "embedded c", "vlsi", "electronics"
    ],
    summary: "Electronics & Telecommunication technical viva guide on 8085 pins, interrupt hierarchy, and memory interfacing.",
    content: `8085 Microprocessor Placement Fundamentals:
1. Bus Multiplexing & ALE Pin:
   - AD0-AD7 are multiplexed address/data lines to reduce IC pin count from 48 to 40.
   - ALE (Address Latch Enable): Positive pulse generated during the T1 state of an instruction cycle.
   - When ALE is HIGH: Lines AD0-AD7 carry the lower 8 bits of memory address (A0-A7), latched using external IC 74LS373.
   - When ALE is LOW: Lines AD0-AD7 carry data (D0-D7).

2. Interrupt Priority & Characteristics:
   - TRAP (RST 4.5): Highest priority, Non-Maskable, Vectored at 0024H. Triggered by Level and Edge.
   - RST 7.5: Maskable, Vectored at 003CH. Rising Edge triggered.
   - RST 6.5: Maskable, Vectored at 0034H. High Level triggered.
   - RST 5.5: Maskable, Vectored at 002CH. High Level triggered.
   - INTR: Lowest priority, Maskable, Non-Vectored. Handled via external vector opcode.`
  },
  {
    id: "doc-thermo-me",
    title: "Mechanical Engineering Core Interview: Laws of Thermodynamics & Heat Transfer",
    branch_id: "branch-me",
    subject_id: "sub-thermo",
    company_id: "comp-tcs",
    category: "CONCEPT",
    keywords: [
      "thermodynamics", "carnot", "first law", "second law",
      "heat transfer", "mechanical", "entropy", "fourier", "convection"
    ],
    summary: "Mechanical technical interview questions for GET (Graduate Engineer Trainee) drives.",
    content: `Essential Mechanical Engineering Placement Concepts:
1. Zeroth Law: Establishes thermal equilibrium and temperature measurement.
2. First Law: Conservation of energy (dQ = dU + dW for closed systems).
3. Second Law:
   - Kelvin-Planck statement: Impossible to construct an engine operating in a cycle that absorbs heat from a single reservoir and produces an equivalent amount of work.
   - Clausius statement: Impossible to construct a cyclic device that transfers heat from a lower temperature body to a higher temperature body without external work input.
4. Modes of Heat Transfer:
   - Conduction (Fourier's Law: Q = -k * A * dT/dx)
   - Convection (Newton's Law of Cooling: Q = h * A * (Ts - Tinf))
   - Radiation (Stefan-Boltzmann Law: E = epsilon * sigma * A * T^4)`
  },
  {
    id: "doc-dsa-placement-roadmap",
    title: "Data Structures & Algorithms: Complete Placement Preparation Roadmap",
    branch_id: "branch-cse",
    subject_id: "sub-dsa",
    company_id: "comp-amazon",
    category: "CONCEPT",
    summary: "A structured placement syllabus covering linear data structures, non-linear hierarchical structures, dynamic programming, and algorithmic paradigms.",
    keywords: [
      "dsa roadmap", "placement preparation", "algorithms", "data structures",
      "problem solving", "complexity", "big o", "arrays", "graphs"
    ],
    content: `Data Structures & Algorithms Placement Framework:
Phase 1: Foundations & Complexity Analysis
Master Big-O, Big-Omega, and Big-Theta notations. Learn the difference between worst-case, average-case, and amortized time complexity. Understand auxiliary space versus input space.

Phase 2: Linear Data Structures
1. Arrays: Contiguous memory, cache spatial locality, prefix sums, two pointers, sliding window.
2. Strings: Rolling hash, KMP pattern matching, anagram frequency counting.
3. Linked Lists: Singly, doubly, circular. Floyd's cycle detection (tortoise and hare) in O(1) space.
4. Stacks & Queues: LIFO vs FIFO. Monotonic stacks for Next Greater Element. Circular queues.
5. Hashing: Separate chaining vs open addressing (linear, quadratic, double hashing).

Phase 3: Hierarchical & Non-Linear Structures
1. Trees & BST: DFS (inorder, preorder, postorder) and BFS level order. Invariant: left < root < right.
2. Heaps: Min-heap and Max-heap. Building a heap in O(N) time with sift-down.
3. Graphs: BFS for unweighted shortest paths, DFS for connectivity, Dijkstra's with min-heap for shortest paths with non-negative edge weights in O((V + E) log V).
4. Advanced: Tries for prefix lookups in O(L). Disjoint Set Union (DSU) with path compression.`
  },
  {
    id: "doc-dsa-hashing-guide",
    title: "Data Structures: Hashing, Collision Resolution & Open Addressing",
    branch_id: "branch-cse",
    subject_id: "sub-dsa",
    company_id: "comp-google",
    category: "CONCEPT",
    summary: "Comprehensive analysis of hash functions, separate chaining, open addressing, load factor management, and rehashing.",
    keywords: [
      "hashing", "hash table", "collision resolution", "separate chaining",
      "open addressing", "double hashing", "linear probing", "load factor"
    ],
    content: `Hashing and Collision Resolution Mechanics:
1. Hash Function Goals:
   - Uniform distribution across buckets.
   - Deterministic and fast computation in O(1).
   - Minimizes clustering.

2. Collision Resolution Techniques:
   - Separate Chaining: Each bucket holds a linked list or red-black tree (e.g., Java HashMap after threshold 8). Handles high load factors gracefully.
   - Open Addressing: All elements reside directly in the table array.
     * Linear Probing: h(k, i) = (h(k) + i) % m. Suffers from Primary Clustering.
     * Quadratic Probing: h(k, i) = (h(k) + c1*i + c2*i^2) % m. Suffers from Secondary Clustering.
     * Double Hashing: h(k, i) = (h1(k) + i * h2(k)) % m. Eliminates clustering if h2(k) is coprime to m.

3. Load Factor (alpha = n / m):
   - High alpha triggers rehashing: allocating a table of 2x capacity and re-inserting all items in O(N).`
  },
  {
    id: "doc-dsa-advanced-structures",
    title: "Advanced Data Structures: Tries (Prefix Trees) & Disjoint Set Union (DSU)",
    branch_id: "branch-cse",
    subject_id: "sub-dsa",
    company_id: "comp-google",
    category: "CONCEPT",
    summary: "Deep dive into Trie prefix trees and Disjoint Set Union with path compression and union by rank.",
    keywords: [
      "trie", "prefix tree", "disjoint set union", "dsu", "union find",
      "path compression", "kruskal", "cycle detection"
    ],
    content: `Advanced Data Structures for Product Company Placements:
1. Trie (Prefix Tree):
   - Multi-way tree storing strings where edges represent characters.
   - Operations: Insert, Search, and StartsWith operate in O(L) time where L is word length.
   - Placement use-cases: Autocomplete suggestions, spell checkers, IP routing longest prefix match.

2. Disjoint Set Union (DSU / Union-Find):
   - Maintains partitions of disjoint sets.
   - Two core optimizations:
     * Union by Rank: Connects smaller tree under the root of the larger tree, keeping tree height bounded.
     * Path Compression: Points nodes directly to the root during Find queries.
   - Time Complexity: O(alpha(V)) where alpha is the Inverse Ackermann function (practically <= 4).
   - Applications: Kruskal's Minimum Spanning Tree algorithm, cycle detection in undirected graphs.`
  },
  {
    id: "doc-os-deadlocks-scheduling",
    title: "Operating Systems: Process Scheduling, Concurrency & Deadlocks (Coffman Conditions)",
    branch_id: "branch-cse",
    subject_id: "sub-os",
    company_id: "comp-infosys",
    category: "CONCEPT",
    summary: "Thorough study of process scheduling algorithms, synchronization primitives (mutex vs semaphore), and deadlock prevention.",
    keywords: [
      "deadlock", "coffman conditions", "banker algorithm", "mutex",
      "semaphore", "cpu scheduling", "round robin", "convoy effect"
    ],
    content: `Operating Systems Concurrency & Deadlocks:
1. Four Coffman Conditions for Deadlock:
   All 4 MUST hold simultaneously for a deadlock to exist:
   - Mutual Exclusion: At least one resource is held in non-shareable mode.
   - Hold and Wait: A process holding at least one resource is waiting to acquire additional resources held by other processes.
   - No Preemption: Resources cannot be forcibly taken; they are released only voluntarily.
   - Circular Wait: A closed chain of processes exists where each process waits for a resource held by the next.

2. Deadlock Handling Strategies:
   - Prevention: Invalidate at least one Coffman condition (e.g., impose resource ordering to deny circular wait).
   - Avoidance: Banker's Algorithm ensures safe state transitions before allocating resources.
   - Detection & Recovery: Build Resource Allocation Graph (RAG) and terminate deadlocked processes.

3. Process Scheduling Algorithms:
   - FCFS: Non-preemptive. Suffers from the Convoy Effect (short jobs stuck behind long CPU-bound jobs).
   - Round Robin: Preemptive with time quantum Q. Large Q behaves like FCFS; small Q introduces excessive context-switch overhead.`
  },
  {
    id: "doc-cn-protocols",
    title: "Computer Networks: OSI 7-Layer Model, TCP/IP Suite & Handshake Protocols",
    branch_id: "branch-cse",
    subject_id: "sub-cn",
    company_id: "comp-amazon",
    category: "CONCEPT",
    summary: "Core networking interview preparation covering OSI vs TCP/IP layer responsibilities, TCP 3-way handshake, and UDP comparison.",
    keywords: [
      "computer networks", "osi layers", "tcp", "udp", "3-way handshake",
      "ip addressing", "subnetting", "dns", "http", "https"
    ],
    content: `Computer Networks Core Protocol Architecture:
1. OSI 7-Layer vs TCP/IP Protocol Stack:
   - Application Layer: HTTP/HTTPS, DNS, FTP, SMTP, SSH.
   - Transport Layer: Port addressing, flow control, error recovery. TCP (reliable byte-stream) vs UDP (connectionless datagrams).
   - Network Layer: Logical IP addressing, packet routing (OSPF, BGP).
   - Data Link Layer: Framing, MAC addressing, error detection (CRC).
   - Physical Layer: Raw binary bit transmission over physical media.

2. TCP 3-Way Handshake Connection Establishment:
   - Step 1 (Client -> Server): SYN (Seq = X).
   - Step 2 (Server -> Client): SYN-ACK (Seq = Y, ACK = X + 1).
   - Step 3 (Client -> Server): ACK (Seq = X + 1, ACK = Y + 1).
   - Connection is now ESTABLISHED.
   - Connection Teardown (4-Way Handshake): FIN -> ACK -> FIN -> ACK.`
  },
  {
    id: "doc-quant-speed-math",
    title: "Quantitative Aptitude Master Guide: Speed Math, Arithmetic & Formula Shortcuts",
    branch_id: "branch-cse",
    subject_id: "sub-aptitude",
    company_id: "comp-tcs",
    category: "APTITUDE",
    keywords: [
      "quantitative aptitude", "quant", "speed math", "time and work", "lcm method",
      "pipes and cisterns", "speed distance time", "relative speed", "trains",
      "boats and streams", "profit and loss", "successive discount", "percentage",
      "mixtures and alligation", "divisibility", "series", "ratios"
    ],
    summary: "High-speed calculation shortcuts, unit digit analysis, LCM rate methods, and core formula cheatsheets for campus recruitment screening tests.",
    content: `Quantitative Aptitude High-Yield Cheatsheet for Campus Placements:
1. Time and Work (The LCM Method):
   - Rather than using reciprocal fractions (1/A + 1/B), assume Total Work = LCM of individual completion days.
   - Efficiency (units/day) = Total Work / Days.
   - Total Days = Total Work / Combined Efficiency.
   - Two workers taking A and B days: Combined Time = (A * B) / (A + B).
   - Man-Days Formula: (M1 * D1 * H1) / W1 = (M2 * D2 * H2) / W2.

2. Speed, Distance and Time:
   - Conversion: km/h to m/s multiply by 5/18; m/s to km/h multiply by 18/5.
   - Average Speed for equal distance trips at speeds x and y: 2xy / (x + y) (Harmonic Mean).
   - Relative Speed:
     * Opposite directions (towards each other): Add speeds (S1 + S2).
     * Same direction (chasing): Subtract speeds (|S1 - S2|).
   - Trains crossing stationary pole/person: Distance = Length of Train.
   - Trains crossing platform/bridge: Distance = Length of Train + Length of Platform.
   - Boats and Streams: Downstream = u + v, Upstream = u - v. Boat speed in still water = (Downstream + Upstream) / 2.

3. Profit, Loss and Discount:
   - Profit and Loss percentages are ALWAYS calculated on Cost Price (CP) unless specified otherwise.
   - Selling Price (SP) = CP * (100 + Profit%) / 100.
   - Successive Percentage Changes (a% and b%): Net Change = [a + b + (a * b) / 100]%.
   - Successive Discounts of d1% and d2%: Net Discount = [d1 + d2 - (d1 * d2) / 100]%.

4. Speed Math & Divisibility Shortcuts:
   - Unit Digits & Cyclicity of Powers: Powers of 2, 3, 7, 8 repeat every 4 cycles. Divide the exponent by 4 and examine remainder.
   - Digital Root: Sum digits iteratively until single digit; multiplication digital roots verify answers in 5 seconds.
   - Rule of Alligation: (Quantity of Cheaper / Quantity of Dearer) = (Dearer Price - Mean Price) / (Mean Price - Cheaper Price).`
  },
  {
    id: "doc-logical-reasoning",
    title: "Logical Reasoning & Analytical Thinking: Syllogisms, Sequences & Deductive Logic",
    branch_id: "branch-cse",
    subject_id: "sub-aptitude",
    company_id: "comp-infosys",
    category: "APTITUDE",
    keywords: [
      "logical reasoning", "logic", "syllogisms", "venn diagram", "100 50 rule",
      "blood relations", "family tree", "coding decoding", "letter series", "ejoty",
      "direction sense", "seating arrangement", "clocks and calendars", "odd days"
    ],
    summary: "Deductive rules for Syllogisms, reverse decoding for Blood Relations, EJOTY letter benchmark, and angle formulas for Clocks & Calendars.",
    content: `Logical Reasoning Placement Master Framework:
1. Syllogisms & Deductive Conclusions:
   - Universal affirmative ("All A are B"): Subject distributed (100), Predicate undistributed (50).
   - Universal negative ("No A is B"): Both Subject and Predicate distributed (100, 100).
   - Particular affirmative ("Some A are B"): Both undistributed (50, 50).
   - Fundamental Law: If both premises are affirmative, the conclusion MUST be affirmative.
   - Law of Negatives: Two negative premises yield NO valid conclusion. One negative premise guarantees a negative conclusion.
   - Either/Or Complementary Pairs: (Some + No) or (All + Some Not) with same subject and predicate.

2. Blood Relations:
   - Rule 1: Always decode relationships backwards starting from "my mother's..." or "my father's...".
   - Rule 2: Never assume gender from personal names unless explicit kinship nouns (brother, sister, son, daughter, mother, father) are stated.
   - Representation: Horizontal double line (=) for married couples, single line (-) for siblings, vertical downward line (|) for parent-child generations.

3. Coding-Decoding & Series:
   - EJOTY Benchmark: E=5, J=10, O=15, T=20, Y=25 for instantaneous letter rank computation.
   - Opposite Alphabet Pairs: Letters sum to 27 (A1+Z26=27, B2+Y25=27, C3+X24=27, M13+N14=27).
   - Number Series: Check consecutive first-differences. If differences increase linearly (+2, +4, +6), the sequence is quadratic. If differences double, look for powers of 2.

4. Clocks & Calendars:
   - Angle between clock hands at H hours and M minutes: Angle theta = |30*H - (11/2)*M| degrees.
   - Hands coincide (0 degrees) 22 times in 24 hours. Hands at right angle (90 degrees) 44 times in 24 hours.
   - Calendar Odd Days: Ordinary year = 1 odd day (365 % 7 = 1); Leap year = 2 odd days (366 % 7 = 2). 100 years have 5 odd days, 400 years have 0 odd days.`
  },
  {
    id: "doc-verbal-communication",
    title: "Verbal Ability & Professional Technical Communication for Campus Drives",
    branch_id: "branch-cse",
    subject_id: "sub-aptitude",
    company_id: "comp-wipro",
    category: "VERBAL",
    keywords: [
      "verbal ability", "sentence correction", "grammar", "parallelism",
      "subject verb agreement", "critical reasoning", "reading comprehension",
      "star method", "hr interview", "communication skills", "technical interview"
    ],
    summary: "Essential English grammatical rules, subject-verb agreement, parallelism, reading comprehension strategies, and HR round communication.",
    content: `Verbal Ability & Professional Communication Guide:
1. Sentence Correction & Grammar Traps:
   - Subject-Verb Agreement: Intervening prepositional phrases (e.g., "The box of antique watches *was* stolen") do not alter subject number.
   - Neither/Nor & Either/Or: The verb agrees with the closer subject (e.g., "Neither the manager nor the *employees were* present").
   - Grammatical Parallelism: Items in a series or comparison must share identical grammatical structures (gerund with gerund, infinitive with infinitive).
   - Modifier Placement: Misplaced and dangling modifiers create illogical statements. The modifying clause must directly precede the noun it modifies.

2. Reading Comprehension Strategies:
   - Skim for the central thesis and paragraph transitions (However, Furthermore, Consequently).
   - Beware of extreme answer choices using absolute quantifiers: "Always", "Never", "Completely", "Solely". Prefer nuanced, moderate options.

3. Verbal Technical Interview Communication:
   - Structure answers using: Definition -> Real-world Example -> Edge Case / Complexity.
   - Speak in crisp, active voice sentences without verbal crutches ("like", "you know", "basically", "actually").`
  },
  {
    id: "doc-dsa-trees-graphs",
    title: "Non-Linear Data Structures: Trees, BST, Heaps, and Graph Traversals",
    branch_id: "branch-cse",
    subject_id: "sub-dsa",
    company_id: "comp-google",
    category: "CONCEPT",
    keywords: [
      "binary tree", "bst", "binary search tree", "inorder", "preorder", "postorder",
      "heap", "priority queue", "graph", "bfs", "dfs", "dijkstra",
      "topological sort", "kahn algorithm", "cycle detection"
    ],
    summary: "Complete guide on binary tree traversals, BST properties, priority queues, and graph search algorithms for software engineering interviews.",
    content: `Hierarchical & Graph Algorithms for Technical Interviews:
1. Binary Tree Traversals:
   - Inorder (Left, Root, Right): Produces sorted order for Binary Search Trees!
   - Preorder (Root, Left, Right): Useful for tree cloning and serialization.
   - Postorder (Left, Right, Root): Useful for bottom-up computation (e.g., tree height, deletion).
   - Level Order (BFS): Uses a FIFO queue to visit nodes level-by-level in O(N) time and O(W) space where W is max width.

2. Binary Search Tree (BST):
   - Invariant: Every node in left subtree < root < every node in right subtree.
   - Search / Insert / Delete: O(h) where h is tree height (O(log N) for balanced trees, O(N) worst-case skewed).
   - Self-Balancing Trees (AVL & Red-Black Trees): Guarantee O(log N) height via tree rotations.

3. Heaps & Priority Queues:
   - Complete binary tree where parent satisfies heap invariant (parent <= children for min-heap; parent >= children for max-heap).
   - Represented compactly in arrays: Parent at i, Left child at 2i + 1, Right child at 2i + 2.
   - Build Heap: O(N) linear time using bottom-up sift-down.
   - Insert and Extract-Min: O(log N).

4. Graph Algorithms:
   - Breadth-First Search (BFS): Computes shortest path in unweighted graphs in O(V + E) time.
   - Depth-First Search (DFS): Connectivity, topological sorting, connected components.
   - Dijkstra's Algorithm: Single-source shortest path on graphs with non-negative edge weights using a min-heap in O((V + E) log V).
   - Topological Sorting (Kahn's Algorithm): Directed Acyclic Graph (DAG) linear ordering using in-degree array and queue. Cycle exists if processed count < V.`
  },
  {
    id: "doc-dsa-dp-greedy",
    title: "Algorithmic Paradigms: Dynamic Programming, Memoization & Greedy Methods",
    branch_id: "branch-cse",
    subject_id: "sub-dsa",
    company_id: "comp-amazon",
    category: "CONCEPT",
    keywords: [
      "dynamic programming", "dp", "memoization", "tabulation", "optimal substructure",
      "overlapping subproblems", "0 1 knapsack", "lcs", "lis", "coin change",
      "greedy algorithm", "fractional knapsack", "huffman coding", "interval scheduling"
    ],
    summary: "Recognizing DP patterns, state definition, recurrence transitions, bottom-up tabulation, and Greedy vs DP trade-offs.",
    content: `Dynamic Programming vs Greedy Algorithms:
1. When to Use Dynamic Programming:
   - Optimal Substructure: Optimal solution to the problem incorporates optimal solutions to subproblems.
   - Overlapping Subproblems: The same subproblems are solved repeatedly in a naive recursion tree.

2. Two Implementation Approaches:
   - Top-Down (Memoization): Recursion with an auxiliary hash table or array cache.
   - Bottom-Up (Tabulation): Iterative table filling from base cases to final state. Avoids recursion stack overhead.

3. Standard Placement DP Patterns:
   - 0/1 Knapsack: dp[i][w] = max(dp[i-1][w], val[i] + dp[i-1][w - wt[i]]). Space optimizable to 1D array O(W).
   - Longest Common Subsequence (LCS): Character match -> 1 + dp[i-1][j-1]; Mismatch -> max(dp[i-1][j], dp[i][j-1]).
   - Longest Increasing Subsequence (LIS): O(N^2) using DP, or O(N log N) using patience sorting and binary search (std::lower_bound).
   - Coin Change: Minimum coins to make amount A: dp[a] = min(dp[a - coin] + 1).

4. Greedy Choice Property:
   - A globally optimal solution can be reached by making locally optimal choices without backtracking.
   - Classic Problems: Fractional Knapsack (sort by value/weight ratio), Activity Selection (sort by finish times), Huffman Coding.`
  },
  {
    id: "doc-dsa-search-sort",
    title: "Sorting & Searching Algorithms: Complexities, Invariants & Trade-offs",
    branch_id: "branch-cse",
    subject_id: "sub-dsa",
    company_id: "comp-tcs",
    category: "CONCEPT",
    keywords: [
      "sorting", "searching", "binary search", "quicksort", "mergesort",
      "heapsort", "two pointers", "sliding window", "kadane", "time complexity",
      "stable sorting", "in place"
    ],
    summary: "Comprehensive comparative matrix for Quicksort, Mergesort, Heapsort, binary search on answer spaces, and array traversal patterns.",
    content: `Sorting & Searching Complexity Matrix:
| Algorithm | Best Time | Average Time | Worst Time | Space | Stable? | In-Place? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **MergeSort** | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes | No |
| **QuickSort** | O(n log n) | O(n log n) | O(n^2) | O(log n) | No | Yes |
| **HeapSort** | O(n log n) | O(n log n) | O(n log n) | O(1) | No | Yes |
| **Counting Sort** | O(n + k) | O(n + k) | O(n + k) | O(k) | Yes | No |
| **Binary Search** | O(1) | O(log n) | O(log n) | O(1) | N/A | Yes |

Core Placement Insights:
- Why QuickSort is preferred in practice: Superior CPU cache locality and small constant factors compared to MergeSort.
- Why MergeSort is preferred for Linked Lists: Linked lists can be merged in O(1) auxiliary space without random access.
- Binary Search Invariant: mid = low + (high - low) / 2 prevents 32-bit integer overflow.`
  },
  {
    id: "doc-oops-design-patterns",
    title: "Object-Oriented Programming (OOP), SOLID Principles & Design Patterns",
    branch_id: "branch-cse",
    subject_id: "sub-oops",
    company_id: "comp-microsoft",
    category: "CONCEPT",
    keywords: [
      "oops", "object oriented", "encapsulation", "abstraction", "inheritance",
      "polymorphism", "solid principles", "single responsibility", "open closed",
      "liskov substitution", "interface segregation", "dependency inversion",
      "design patterns", "singleton", "factory", "observer", "strategy"
    ],
    summary: "Mastering the 4 OOP pillars, 5 SOLID architectural principles, and Gang of Four design patterns tested in technical interviews.",
    content: `OOP & Software Engineering Placement Essentials:
1. The Four Pillars of OOP:
   - Encapsulation: Bundling data and methods into a single class and restricting direct access to internal state via private access modifiers and public getters/setters.
   - Abstraction: Hiding internal complexity and exposing only essential interfaces (using Abstract Classes and Interfaces).
   - Inheritance: Mechanism where a child class inherits properties and behaviors from a parent class for code reuse.
   - Polymorphism: Ability of an entity to take multiple forms.
     * Compile-Time (Static): Method Overloading and Operator Overloading.
     * Runtime (Dynamic): Method Overriding resolved via Virtual Method Tables (vtable).

2. SOLID Design Principles:
   - S (Single Responsibility): A class should have one, and only one, reason to change.
   - O (Open/Closed): Software entities should be open for extension, but closed for modification.
   - L (Liskov Substitution): Subtypes must be substitutable for their base types without altering correctness.
   - I (Interface Segregation): Clients should not be forced to depend on methods they do not use. Prefer small, focused interfaces.
   - D (Dependency Inversion): High-level modules should depend on abstractions, not on low-level concrete implementations.

3. Core Design Patterns:
   - Singleton: Ensures a class has only one instance with a global point of access (use double-checked locking in multithreading).
   - Factory Method: Defines an interface for creating objects, delegating instantiation to subclasses.
   - Observer: Defines a 1-to-many dependency where state changes automatically notify all subscribed observers.
   - Strategy: Encapsulates interchangeable algorithms inside separate strategy classes.`
  },
  {
    id: "doc-sql-database-deepdive",
    title: "SQL Query Mastery, Joins, Window Functions & Index Optimization",
    branch_id: "branch-it",
    subject_id: "sub-dbms",
    company_id: "comp-deloitte",
    category: "CONCEPT",
    keywords: [
      "sql", "dbms", "joins", "inner join", "left join", "window functions",
      "row_number", "rank", "dense_rank", "group by", "having",
      "indexing", "b+ tree", "subquery", "cte", "stored procedure"
    ],
    summary: "Authoritative SQL interview preparation: Joins, Window Functions (ROW_NUMBER vs RANK vs DENSE_RANK), B+ Tree indexing, and execution planning.",
    content: `SQL & Query Optimization Placement Master Guide:
1. SQL Joins:
   - INNER JOIN: Returns records that have matching values in both tables.
   - LEFT (OUTER) JOIN: Returns all records from left table and matched records from right table (NULL if no match).
   - RIGHT (OUTER) JOIN: Returns all records from right table and matched records from left table.
   - FULL OUTER JOIN: Returns all records when there is a match in either left or right table.
   - CROSS JOIN: Cartesian product of all rows (M * N records).

2. Window Functions:
   - Applied using the OVER (PARTITION BY ... ORDER BY ...) clause without collapsing rows like GROUP BY.
   - ROW_NUMBER(): Assigns consecutive unique integers (1, 2, 3, 4) regardless of ties.
   - RANK(): Assigns same rank to ties and skips subsequent ranks (1, 2, 2, 4).
   - DENSE_RANK(): Assigns same rank to ties without skipping numbers (1, 2, 2, 3).
   - Placement Classic: "Find the 2nd Highest Salary":
     SELECT salary FROM (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) as rnk FROM employees) t WHERE rnk = 2;

3. Index Optimization:
   - B+ Trees store all actual table record pointers at leaf nodes linked in a bidirectional doubly linked list, enabling fast range scans in O(log N).
   - Clustered Index: Determines physical sorting of rows on disk (only one per table, usually Primary Key).
   - Non-Clustered Index: Separate structure containing key values and pointers to data pages.`
  },
  {
    id: "doc-system-design-basics",
    title: "System Design & Modern Web Architecture: High-Scale Infrastructure Principles",
    branch_id: "branch-it",
    subject_id: "sub-cn",
    company_id: "comp-google",
    category: "CONCEPT",
    keywords: [
      "system design", "rest api", "graphql", "load balancing", "caching",
      "redis", "cap theorem", "microservices", "cdn", "horizontal scaling",
      "acid vs base", "database sharding"
    ],
    summary: "System design basics for entry-level SDE rounds: Horizontal scaling, Caching (Redis), Load Balancers, CAP Theorem, and database sharding.",
    content: `System Design Foundations for Campus Placements:
1. Scaling Strategies:
   - Vertical Scaling (Scale Up): Adding more CPU, RAM, or storage to a single server. Limited by physical hardware boundaries and single point of failure.
   - Horizontal Scaling (Scale Out): Adding more commodity machines to the pool. Requires stateless application servers and load balancers.

2. Load Balancing Algorithms:
   - Round Robin: Cycles requests sequentially among healthy nodes.
   - Least Connections: Directs traffic to the server with fewest active client sessions.
   - Consistent Hashing: Minimizes key redistribution when cluster servers are added or removed.

3. Caching Strategies:
   - In-memory key-value stores (Redis / Memcached) provide sub-millisecond reads in O(1).
   - Cache Eviction Policies: LRU (Least Recently Used), LFU (Least Frequently Used), FIFO.
   - Caching Patterns: Cache-Aside, Read-Through, Write-Through, Write-Behind.

4. The CAP Theorem:
   In any distributed data store, you can guarantee at most TWO out of three properties:
   - Consistency (C): Every read receives the most recent write or an error.
   - Availability (A): Every non-failing node returns a response, without guarantee it is latest.
   - Partition Tolerance (P): System operates despite arbitrary packet drops or network partitions.
   - In practice, network partitions (P) are unavoidable; systems must choose between CP (e.g., MongoDB, Spanner) or AP (e.g., Cassandra, DynamoDB).`
  },
  {
    id: "doc-infosys-blueprint",
    title: "Infosys Campus Recruitment Blueprint: InfyTQ, Pseudocode & Viva Rubric",
    branch_id: "branch-cse",
    subject_id: "sub-dsa",
    company_id: "comp-infosys",
    category: "INTERVIEW_PATTERN",
    keywords: [
      "infosys", "infytq", "hackwithinfy", "specialist programmer",
      "pseudocode", "algorithmic logic", "round pattern", "recruitment"
    ],
    summary: "Detailed breakdown of Infosys assessment rounds: Pseudocode logic, hands-on coding tests, and core CS technical viva questions.",
    content: `Infosys Placement Pattern & Selection Guide:
1. Hiring Tracks:
   - Systems Engineer (SE): ~3.6 - 4 LPA.
   - Digital Specialist Engineer (DSE): ~6.5 LPA.
   - Specialist Programmer (SP): ~9.5 LPA via HackWithInfy competition.

2. Assessment Sections:
   - Reasoning Ability & Pseudocode: Tracing loop bounds, bitwise operations, recursion call stacks, and data structure operations.
   - Mathematical Ability: Numbers, arithmetic progression, arrangements, speed problems.
   - Technical Coding: 2-3 algorithmic problems (String manipulation, Dynamic Programming, Graphs).

3. Technical Interview Rounds:
   - Deep dive into OOP fundamentals (Polymorphism vs Inheritance).
   - DBMS: Writing complex SQL queries with GROUP BY and HAVING clauses.
   - Project Architecture and candidate role explanation.`
  },
  {
    id: "doc-wipro-blueprint",
    title: "Wipro Elite NTH Placement Blueprint: Cognitive, Coding & Technical Viva",
    branch_id: "branch-cse",
    subject_id: "sub-dsa",
    company_id: "comp-wipro",
    category: "INTERVIEW_PATTERN",
    keywords: [
      "wipro", "elite nth", "turbo", "national talent hunt", "essay writing",
      "coding pattern", "technical interview", "recruitment"
    ],
    summary: "Assessment blueprint for Wipro Elite NTH and Turbo drives: Aptitude, Written Communication, Coding questions, and HR rounds.",
    content: `Wipro Elite National Talent Hunt (NTH) Blueprint:
1. Assessment Format:
   - Aptitude Test (48 mins): Quantitative, Logical Reasoning, and Verbal English.
   - Written Communication Test (20 mins): Essay writing on a contemporary technological or ethical topic. Evaluated for grammar, vocabulary, and paragraph structure.
   - Online Coding Test (60 mins): 2 programming challenges in C, C++, Java, or Python (Array manipulation, Number theory, Pattern printing).

2. Technical & HR Interview:
   - Fundamentals of C/Java/Python (Pointers vs References, Garbage Collection).
   - Data Structures: Arrays, Linked Lists, Stack applications (infix to postfix).
   - Final Discussion: Willingness to relocate, project challenges, and adaptability.`
  },
  {
    id: "doc-accenture-blueprint",
    title: "Accenture Cognitive & Technical Assessment Blueprint: Cloud, Security & Coding",
    branch_id: "branch-cse",
    subject_id: "sub-dsa",
    company_id: "comp-accenture",
    category: "INTERVIEW_PATTERN",
    keywords: [
      "accenture", "cognitive assessment", "technical assessment", "pseudo code",
      "cloud fundamentals", "network security", "communication assessment"
    ],
    summary: "Accenture placement format: Cognitive MCQ, Technical pseudocode, Cloud & Security basics, and Coding assessment.",
    content: `Accenture Placement Framework & Round Structure:
1. Stage 1: Cognitive & Technical Assessment (90 mins, elimination round):
   - Cognitive: English Ability, Critical Reasoning, Abstract Reasoning.
   - Technical: Pseudocode (recursion, bitwise operators, nested loops), Common Application & MS Office, Cloud Fundamentals (IaaS, PaaS, SaaS), Network Security fundamentals.

2. Stage 2: Coding Assessment (45 mins):
   - 2 Programming challenges evaluated on public and hidden test cases. Focus areas: Array permutations, String parsing, Hash maps.

3. Stage 3: Communication Assessment:
   - Automated interactive voice assessment testing pronunciation, listening comprehension, sentence repeats, and impromptu storytelling.`
  },
  {
    id: "doc-capgemini-blueprint",
    title: "Capgemini Campus Selection Blueprint: Pseudocode, Game Aptitude & Tech Interview",
    branch_id: "branch-cse",
    subject_id: "sub-dsa",
    company_id: "comp-capgemini",
    category: "INTERVIEW_PATTERN",
    keywords: [
      "capgemini", "pseudocode", "game based aptitude", "technical viva",
      "core cs", "coding round", "selection pattern"
    ],
    summary: "Guide to Capgemini recruitment: Pseudocode test, Game-Based Aptitude rounds, Spoken English assessment, and Technical Interview.",
    content: `Capgemini Campus Recruitment Guide:
1. Selection Rounds:
   - Technical Pseudocode: 30 questions in 30 mins testing algorithms, data structures, recursion, and bitwise logic.
   - English Communication: Grammar, vocabulary, sentence correction.
   - Game-Based Aptitude: Visual challenges testing short-term memory, inductive reasoning, motion planning, and reaction speed.
   - Behavioral Profiling: Work style and psychometric questions.

2. Technical Interview:
   - Core Programming: OOP pillars, exception handling, multithreading basics.
   - Database: SQL constraints, Primary Key vs Unique Key, Normalization up to 3NF.
   - Web / Projects: Explanation of technologies used in college academic projects.`
  }
];

export default EXTENDED_KNOWLEDGE_DOCS;
