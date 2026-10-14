import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDbFilePath } from '../src/database/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = getDbFilePath();

const raw = fs.readFileSync(DB_FILE, 'utf-8');
const data = JSON.parse(raw);

const existingQIds = new Set(data.questions.map(q => q.id));

// Questions for Core Computer Science (OS, DBMS, CN, OOP)
const coreCsQuestions = [
  {
    id: 'q-os-sem-1',
    question: 'What is the primary difference between a binary semaphore and a mutex in operating systems?',
    subject_id: 'sub-os',
    topic_id: 'top-deadlocks',
    difficulty: 'Medium',
    correct_answer: 'C',
    explanation: 'A mutex includes ownership semantics: only the thread that locked the mutex can unlock it. A binary semaphore has no ownership and can be signaled (unlocked) by any thread.',
    options: [
      { key: 'A', text: 'A mutex can count up to N, whereas a binary semaphore is strictly 0 or 1' },
      { key: 'B', text: 'Binary semaphores are implemented in hardware, while mutexes are purely software' },
      { key: 'C', text: 'A mutex has ownership and can only be unlocked by the locking thread, while a semaphore can be signaled by any thread' },
      { key: 'D', text: 'There is no difference; they are synonymous terms in POSIX' }
    ]
  },
  {
    id: 'q-os-belady-1',
    question: 'Which page replacement algorithm can suffer from Belady\'s Anomaly (where increasing the number of page frames leads to more page faults)?',
    subject_id: 'sub-os',
    topic_id: 'top-memory-mgmt',
    difficulty: 'Medium',
    correct_answer: 'B',
    explanation: 'First-In-First-Out (FIFO) page replacement is susceptible to Belady\'s Anomaly. Stack algorithms like LRU and Optimal do not suffer from Belady\'s Anomaly.',
    options: [
      { key: 'A', text: 'Least Recently Used (LRU)' },
      { key: 'B', text: 'First-In, First-Out (FIFO)' },
      { key: 'C', text: 'Optimal Page Replacement (OPT)' },
      { key: 'D', text: 'Least Frequently Used (LFU)' }
    ]
  },
  {
    id: 'q-os-thrashing-1',
    question: 'What causes "thrashing" in an operating system?',
    subject_id: 'sub-os',
    topic_id: 'top-memory-mgmt',
    difficulty: 'Easy',
    correct_answer: 'A',
    explanation: 'Thrashing occurs when the system spends more time servicing page faults and swapping pages in and out of memory than executing actual process instructions.',
    options: [
      { key: 'A', text: 'The system spends excessive time paging/swapping rather than executing instructions' },
      { key: 'B', text: 'A CPU scheduling algorithm enters an infinite round-robin loop' },
      { key: 'C', text: 'Multiple threads attempt to write to the same cache line simultaneously' },
      { key: 'D', text: 'Hardware DMA controllers overwhelm the system bus' }
    ]
  },
  {
    id: 'q-os-context-1',
    question: 'Which component is NOT saved during a process context switch by the OS kernel?',
    subject_id: 'sub-os',
    topic_id: 'top-cpu-sched',
    difficulty: 'Medium',
    correct_answer: 'D',
    explanation: 'The context switch preserves the Program Counter, CPU registers, and Stack Pointer. The complete physical disk block mapping table is not saved per process context switch.',
    options: [
      { key: 'A', text: 'Program Counter (PC)' },
      { key: 'B', text: 'CPU General-Purpose Register states' },
      { key: 'C', text: 'Stack Pointer (SP)' },
      { key: 'D', text: 'Underlying physical hard disk sector cache' }
    ]
  },
  {
    id: 'q-dbms-btree-1',
    question: 'Why are B+ Trees preferred over B Trees for relational database indexing on disk?',
    subject_id: 'sub-dbms',
    topic_id: 'top-indexing',
    difficulty: 'Hard',
    correct_answer: 'A',
    explanation: 'In a B+ Tree, non-leaf nodes store only indexing keys (maximizing fan-out and reducing tree height), and all data pointers reside in leaf nodes, which are linked sequentially for efficient range queries.',
    options: [
      { key: 'A', text: 'All data records are stored in linked leaf nodes, enabling fast sequential range scans' },
      { key: 'B', text: 'B+ Trees consume significantly less memory than Binary Search Trees' },
      { key: 'C', text: 'B+ Trees allow duplicate keys in the root node' },
      { key: 'D', text: 'B+ Trees eliminate the need for write-ahead logging' }
    ]
  },
  {
    id: 'q-dbms-wal-1',
    question: 'What is the purpose of Write-Ahead Logging (WAL) in database management systems?',
    subject_id: 'sub-dbms',
    topic_id: 'top-acid',
    difficulty: 'Medium',
    correct_answer: 'B',
    explanation: 'Write-Ahead Logging dictates that log records must be written to stable non-volatile storage before the corresponding modified data pages are written to disk, ensuring Atomicity and Durability during a crash.',
    options: [
      { key: 'A', text: 'To compress tables before committing transactions' },
      { key: 'B', text: 'To ensure log records are flushed to non-volatile storage before actual data pages are modified on disk' },
      { key: 'C', text: 'To automatically generate SQL indexes for slow queries' },
      { key: 'D', text: 'To maintain foreign key cascade deletions across replicas' }
    ]
  },
  {
    id: 'q-dbms-lossless-1',
    question: 'In relational decomposition, a decomposition of relation R into R1 and R2 is lossless-join if and only if:',
    subject_id: 'sub-dbms',
    topic_id: 'top-normalization',
    difficulty: 'Hard',
    correct_answer: 'C',
    explanation: 'A decomposition is lossless if R1 ∩ R2 contains a candidate key for either R1 or R2 (i.e. (R1 ∩ R2) -> R1 or (R1 ∩ R2) -> R2 in F+).',
    options: [
      { key: 'A', text: 'R1 and R2 have completely disjoint attributes' },
      { key: 'B', text: 'R1 ∪ R2 contains every primary key in the enterprise schema' },
      { key: 'C', text: 'The common attributes (R1 ∩ R2) form a superkey of either R1 or R2' },
      { key: 'D', text: 'Both R1 and R2 are in Boyce-Codd Normal Form' }
    ]
  },
  {
    id: 'q-cn-tcp3way-1',
    question: 'What is the correct sequence of TCP flag packets exchanged during the initial 3-way connection handshake?',
    subject_id: 'sub-cn',
    topic_id: 'top-osi-tcp',
    difficulty: 'Easy',
    correct_answer: 'A',
    explanation: 'The client sends SYN, the server responds with SYN-ACK, and the client acknowledges with ACK to establish a full-duplex connection.',
    options: [
      { key: 'A', text: 'SYN -> SYN-ACK -> ACK' },
      { key: 'B', text: 'SYN -> ACK -> SYN-ACK' },
      { key: 'C', text: 'ACK -> SYN -> ACK' },
      { key: 'D', text: 'FIN -> FIN-ACK -> ACK' }
    ]
  },
  {
    id: 'q-cn-subnet-1',
    question: 'How many usable host IP addresses are available in an IPv4 subnet with a /27 prefix?',
    subject_id: 'sub-cn',
    topic_id: 'top-routing',
    difficulty: 'Medium',
    correct_answer: 'B',
    explanation: 'A /27 subnet leaves 32 - 27 = 5 host bits. 2^5 = 32 total addresses. Subtracting network address (all 0s) and broadcast address (all 1s) yields 30 usable host addresses.',
    options: [
      { key: 'A', text: '32' },
      { key: 'B', text: '30' },
      { key: 'C', text: '62' },
      { key: 'D', text: '14' }
    ]
  },
  {
    id: 'q-cn-dns-1',
    question: 'Which transport layer protocol and default port does DNS primarily use for standard client query resolution?',
    subject_id: 'sub-cn',
    topic_id: 'top-osi-tcp',
    difficulty: 'Easy',
    correct_answer: 'D',
    explanation: 'DNS uses UDP on port 53 for standard hostname lookup queries because of low overhead and statelessness. (TCP port 53 is used for zone transfers and responses > 512 bytes).',
    options: [
      { key: 'A', text: 'TCP port 80' },
      { key: 'B', text: 'TCP port 443' },
      { key: 'C', text: 'UDP port 67' },
      { key: 'D', text: 'UDP port 53' }
    ]
  },
  {
    id: 'q-cn-dhcp-1',
    question: 'Which protocol dynamically assigns IP addresses, subnet masks, and default gateways to client devices joining a network?',
    subject_id: 'sub-cn',
    topic_id: 'top-osi-tcp',
    difficulty: 'Easy',
    correct_answer: 'C',
    explanation: 'Dynamic Host Configuration Protocol (DHCP) operates via DORA (Discover, Offer, Request, Acknowledge) using UDP ports 67/68 to allocate network parameters.',
    options: [
      { key: 'A', text: 'ARP' },
      { key: 'B', text: 'ICMP' },
      { key: 'C', text: 'DHCP' },
      { key: 'D', text: 'SNMP' }
    ]
  },
  {
    id: 'q-oop-poly-1',
    question: 'In C++ and Java, what is the primary mechanism that enables runtime (dynamic) polymorphism?',
    subject_id: 'sub-oop',
    topic_id: 'top-pillars',
    difficulty: 'Medium',
    correct_answer: 'B',
    explanation: 'Method overriding with virtual functions (vtable/vptr in C++, dynamic dispatch in Java) enables runtime polymorphism by resolving method calls based on the actual object type at runtime.',
    options: [
      { key: 'A', text: 'Method overloading and operator overloading' },
      { key: 'B', text: 'Method overriding with virtual functions and dynamic dispatch' },
      { key: 'C', text: 'Static member variables and template specialization' },
      { key: 'D', text: 'Private constructor instantiation' }
    ]
  },
  {
    id: 'q-oop-diamond-1',
    question: 'How is the "Diamond Problem" of multiple inheritance resolved in C++?',
    subject_id: 'sub-oop',
    topic_id: 'top-pillars',
    difficulty: 'Medium',
    correct_answer: 'A',
    explanation: 'Using virtual base classes (e.g., `class B : virtual public A`) ensures only a single shared instance of the common base class is included in the most derived class.',
    options: [
      { key: 'A', text: 'By declaring base class inheritance as virtual (`virtual public Base`)' },
      { key: 'B', text: 'By marking all methods in the derived class as static' },
      { key: 'C', text: 'By using private access specifiers on all constructors' },
      { key: 'D', text: 'C++ does not allow multiple inheritance under any circumstances' }
    ]
  },
  {
    id: 'q-oop-solid-1',
    question: 'Which SOLID design principle states that software entities should be open for extension but closed for modification?',
    subject_id: 'sub-oop',
    topic_id: 'top-pillars',
    difficulty: 'Easy',
    correct_answer: 'C',
    explanation: 'The Open/Closed Principle (OCP) states that classes should allow their behavior to be extended via inheritance or composition without modifying their existing source code.',
    options: [
      { key: 'A', text: 'Single Responsibility Principle (SRP)' },
      { key: 'B', text: 'Liskov Substitution Principle (LSP)' },
      { key: 'C', text: 'Open/Closed Principle (OCP)' },
      { key: 'D', text: 'Interface Segregation Principle (ISP)' }
    ]
  },
  {
    id: 'q-os-fork-1',
    question: 'In Unix-like systems, what does the `fork()` system call return to the parent process upon success?',
    subject_id: 'sub-os',
    topic_id: 'top-cpu-sched',
    difficulty: 'Medium',
    correct_answer: 'C',
    explanation: 'Upon success, `fork()` returns 0 to the child process and returns the Process ID (PID) of the newly created child process to the parent process.',
    options: [
      { key: 'A', text: '0' },
      { key: 'B', text: '-1' },
      { key: 'C', text: 'The positive Process ID (PID) of the child process' },
      { key: 'D', text: 'The parent process\'s own PID' }
    ]
  }
];

// Questions for TCS-Style Assessment (Aptitude, Reasoning, CS Foundations)
const tcsQuestions = [
  {
    id: 'q-tcs-apt-1',
    question: 'A train 180 meters long is traveling at a speed of 72 km/h. How many seconds will it take to cross an electric pole?',
    subject_id: 'sub-aptitude',
    topic_id: 'top-normalization',
    difficulty: 'Easy',
    correct_answer: 'B',
    explanation: 'Convert 72 km/h to m/s: 72 * (5/18) = 20 m/s. Time to cross pole = distance / speed = 180 m / 20 m/s = 9 seconds.',
    options: [
      { key: 'A', text: '7.5 seconds' },
      { key: 'B', text: '9 seconds' },
      { key: 'C', text: '10.5 seconds' },
      { key: 'D', text: '12 seconds' }
    ]
  },
  {
    id: 'q-tcs-apt-2',
    question: 'If 12 men or 18 women can finish a piece of work in 14 days, in how many days can 8 men and 16 women complete the same work?',
    subject_id: 'sub-aptitude',
    topic_id: 'top-normalization',
    difficulty: 'Medium',
    correct_answer: 'C',
    explanation: '12 men = 18 women => 1 man = 1.5 women. 8 men + 16 women = (8 * 1.5) + 16 = 28 women. 18 women take 14 days => total work = 18 * 14 = 252 women-days. Days required = 252 / 28 = 9 days.',
    options: [
      { key: 'A', text: '7 days' },
      { key: 'B', text: '8 days' },
      { key: 'C', text: '9 days' },
      { key: 'D', text: '10 days' }
    ]
  },
  {
    id: 'q-tcs-apt-3',
    question: 'A shopkeeper sells an article at a discount of 20% on the marked price and still makes a profit of 25%. If the cost price is ₹480, what is the marked price?',
    subject_id: 'sub-aptitude',
    topic_id: 'top-normalization',
    difficulty: 'Medium',
    correct_answer: 'D',
    explanation: 'Selling Price = Cost Price * 1.25 = ₹480 * 1.25 = ₹600. Marked Price * 0.80 = ₹600 => Marked Price = 600 / 0.80 = ₹750.',
    options: [
      { key: 'A', text: '₹650' },
      { key: 'B', text: '₹700' },
      { key: 'C', text: '₹720' },
      { key: 'D', text: '₹750' }
    ]
  },
  {
    id: 'q-tcs-apt-4',
    question: 'Two pipes A and B can fill a tank in 20 minutes and 30 minutes respectively. If both pipes are opened together, how long will it take to fill the tank?',
    subject_id: 'sub-aptitude',
    topic_id: 'top-normalization',
    difficulty: 'Easy',
    correct_answer: 'A',
    explanation: 'In 1 minute, Pipe A fills 1/20 and Pipe B fills 1/30. Combined rate = (1/20) + (1/30) = 5/60 = 1/12 per minute. Time required = 12 minutes.',
    options: [
      { key: 'A', text: '12 minutes' },
      { key: 'B', text: '15 minutes' },
      { key: 'C', text: '18 minutes' },
      { key: 'D', text: '25 minutes' }
    ]
  },
  {
    id: 'q-tcs-apt-5',
    question: 'Find the next number in the series: 4, 9, 25, 49, 121, 169, ?',
    subject_id: 'sub-aptitude',
    topic_id: 'top-normalization',
    difficulty: 'Medium',
    correct_answer: 'B',
    explanation: 'The numbers are squares of consecutive prime numbers: 2^2=4, 3^2=9, 5^2=25, 7^2=49, 11^2=121, 13^2=169. The next prime number is 17, and 17^2 = 289.',
    options: [
      { key: 'A', text: '225' },
      { key: 'B', text: '289' },
      { key: 'C', text: '324' },
      { key: 'D', text: '361' }
    ]
  },
  {
    id: 'q-tcs-apt-6',
    question: 'In a code language, if "COMPUTER" is written as "RFUVQNPC", how will "MEDICINE" be written in that code?',
    subject_id: 'sub-aptitude',
    topic_id: 'top-normalization',
    difficulty: 'Hard',
    correct_answer: 'C',
    explanation: 'First and last letters are swapped (C <-> R becomes R...C). Each middle letter is incremented by 1 (O->P, M->N, P->Q, U->V, T->U, E->F) and written in reverse. Applying to MEDICINE gives EOJDJEFM.',
    options: [
      { key: 'A', text: 'MFEDJJOE' },
      { key: 'B', text: 'EOJDEJFM' },
      { key: 'C', text: 'EOJDJEFM' },
      { key: 'D', text: 'MFEJDJOE' }
    ]
  },
  {
    id: 'q-tcs-apt-7',
    question: 'Pointing to a gentleman, Deepak said, "His only brother is the father of my daughter\'s father." How is the gentleman related to Deepak?',
    subject_id: 'sub-aptitude',
    topic_id: 'top-normalization',
    difficulty: 'Medium',
    correct_answer: 'A',
    explanation: '"My daughter\'s father" is Deepak himself. So the gentleman\'s only brother is Deepak\'s father. Therefore, the gentleman is Deepak\'s paternal uncle.',
    options: [
      { key: 'A', text: 'Uncle' },
      { key: 'B', text: 'Father' },
      { key: 'C', text: 'Brother' },
      { key: 'D', text: 'Grandfather' }
    ]
  },
  {
    id: 'q-tcs-apt-8',
    question: 'A sum of ₹12,500 invested under compound interest compounded annually amounts to ₹15,125 in 2 years. What is the rate of interest per annum?',
    subject_id: 'sub-aptitude',
    topic_id: 'top-normalization',
    difficulty: 'Medium',
    correct_answer: 'D',
    explanation: 'A = P(1 + r/100)^2 => 15125 / 12500 = 1.21. Taking the square root of 1.21 yields 1.10. Thus 1 + r/100 = 1.10 => r = 10%.',
    options: [
      { key: 'A', text: '7%' },
      { key: 'B', text: '8%' },
      { key: 'C', text: '9%' },
      { key: 'D', text: '10%' }
    ]
  },
  {
    id: 'q-tcs-cs-1',
    question: 'In C programming, what will be the output of `printf("%d", sizeof(\'a\'));` on a standard 32/64-bit architecture?',
    subject_id: 'sub-oop',
    topic_id: 'top-pillars',
    difficulty: 'Medium',
    correct_answer: 'B',
    explanation: 'In C, character literals like \'a\' are of type `int`, so `sizeof(\'a\')` evaluates to `sizeof(int)`, which is typically 4 bytes. (In C++, it is of type `char` and evaluates to 1).',
    options: [
      { key: 'A', text: '1' },
      { key: 'B', text: '4' },
      { key: 'C', text: '2' },
      { key: 'D', text: 'Compilation Error' }
    ]
  },
  {
    id: 'q-tcs-cs-2',
    question: 'What is the time complexity of building a Binary Heap from an unordered array of N elements using the bottom-up `heapify` procedure?',
    subject_id: 'sub-dsa',
    topic_id: 'top-arrays',
    difficulty: 'Medium',
    correct_answer: 'B',
    explanation: 'Building a heap in bottom-up fashion runs in O(N) linear time, because the sum of node depths multiplied by the number of nodes at each level converges to O(N), not O(N log N).',
    options: [
      { key: 'A', text: 'O(N log N)' },
      { key: 'B', text: 'O(N)' },
      { key: 'C', text: 'O(log N)' },
      { key: 'D', text: 'O(N^2)' }
    ]
  },
  {
    id: 'q-tcs-cs-3',
    question: 'Which of the following sorting algorithms is inherently stable and operates with O(N log N) worst-case time complexity?',
    subject_id: 'sub-dsa',
    topic_id: 'top-arrays',
    difficulty: 'Easy',
    correct_answer: 'C',
    explanation: 'Merge Sort guarantees O(N log N) time complexity in all cases (best, average, and worst) and is a stable sorting algorithm.',
    options: [
      { key: 'A', text: 'Quick Sort' },
      { key: 'B', text: 'Heap Sort' },
      { key: 'C', text: 'Merge Sort' },
      { key: 'D', text: 'Selection Sort' }
    ]
  },
  {
    id: 'q-tcs-cs-4',
    question: 'What will be the output of the following C code snippet?\n`int x = 5; printf("%d %d %d", x, x++, ++x);`',
    subject_id: 'sub-oop',
    topic_id: 'top-pillars',
    difficulty: 'Medium',
    correct_answer: 'D',
    explanation: 'Modifying a variable more than once between sequence points causes Undefined Behavior in C standards (ISO C99/C11). The output is compiler-dependent.',
    options: [
      { key: 'A', text: '5 5 7' },
      { key: 'B', text: '7 6 6' },
      { key: 'C', text: '7 6 7' },
      { key: 'D', text: 'Undefined Behavior' }
    ]
  },
  {
    id: 'q-tcs-cs-5',
    question: 'Which SQL clause is used to filter aggregate group results produced by a `GROUP BY` statement?',
    subject_id: 'sub-dbms',
    topic_id: 'top-sql-queries',
    difficulty: 'Easy',
    correct_answer: 'B',
    explanation: '`HAVING` filters group-level aggregates (e.g., `HAVING COUNT(*) > 5`). `WHERE` filters individual rows before aggregation occurs.',
    options: [
      { key: 'A', text: 'WHERE' },
      { key: 'B', text: 'HAVING' },
      { key: 'C', text: 'ORDER BY' },
      { key: 'D', text: 'FILTER BY' }
    ]
  },
  {
    id: 'q-tcs-apt-9',
    question: 'In a simultaneous throw of a pair of fair dice, what is the probability of getting a sum of 8?',
    subject_id: 'sub-aptitude',
    topic_id: 'top-normalization',
    difficulty: 'Easy',
    correct_answer: 'B',
    explanation: 'Total outcomes = 6 * 6 = 36. Favorable outcomes for sum 8: (2,6), (3,5), (4,4), (5,3), (6,2) = 5 outcomes. Probability = 5/36.',
    options: [
      { key: 'A', text: '1/6' },
      { key: 'B', text: '5/36' },
      { key: 'C', text: '7/36' },
      { key: 'D', text: '1/9' }
    ]
  },
  {
    id: 'q-tcs-apt-10',
    question: 'The average age of a class of 30 students is 15 years. If the teacher\'s age is included, the average age increases by 1 year. What is the teacher\'s age?',
    subject_id: 'sub-aptitude',
    topic_id: 'top-normalization',
    difficulty: 'Easy',
    correct_answer: 'C',
    explanation: 'Total age of 30 students = 30 * 15 = 450. Total age with teacher (31 persons) = 31 * 16 = 496. Teacher\'s age = 496 - 450 = 46 years.',
    options: [
      { key: 'A', text: '42 years' },
      { key: 'B', text: '44 years' },
      { key: 'C', text: '46 years' },
      { key: 'D', text: '48 years' }
    ]
  },
  {
    id: 'q-tcs-apt-11',
    question: 'At what angle do the hands of a clock meet at 3:40?',
    subject_id: 'sub-aptitude',
    topic_id: 'top-normalization',
    difficulty: 'Medium',
    correct_answer: 'A',
    explanation: 'Angle = |30 * H - (11/2) * M| = |30 * 3 - (11/2) * 40| = |90 - 220| = |-130| = 130 degrees.',
    options: [
      { key: 'A', text: '130 degrees' },
      { key: 'B', text: '140 degrees' },
      { key: 'C', text: '125 degrees' },
      { key: 'D', text: '135 degrees' }
    ]
  },
  {
    id: 'q-tcs-apt-12',
    question: 'Statements: 1. All apples are fruits. 2. Some fruits are sweet. Conclusions: I. Some apples are sweet. II. All fruits are apples.',
    subject_id: 'sub-aptitude',
    topic_id: 'top-normalization',
    difficulty: 'Medium',
    correct_answer: 'D',
    explanation: 'All apples are fruits (A c F). Some fruits are sweet (F ∩ S != 0). This does not guarantee that the sweet fruits include any apples, nor that all fruits are apples. Neither conclusion follows.',
    options: [
      { key: 'A', text: 'Only conclusion I follows' },
      { key: 'B', text: 'Only conclusion II follows' },
      { key: 'C', text: 'Either I or II follows' },
      { key: 'D', text: 'Neither I nor II follows' }
    ]
  },
  {
    id: 'q-tcs-apt-13',
    question: 'A boat travels 24 km upstream in 6 hours and 28 km downstream in 4 hours. What is the speed of the current?',
    subject_id: 'sub-aptitude',
    topic_id: 'top-normalization',
    difficulty: 'Medium',
    correct_answer: 'B',
    explanation: 'Upstream speed (u) = 24/6 = 4 km/h. Downstream speed (v) = 28/4 = 7 km/h. Current speed = (v - u) / 2 = (7 - 4) / 2 = 1.5 km/h.',
    options: [
      { key: 'A', text: '1.0 km/h' },
      { key: 'B', text: '1.5 km/h' },
      { key: 'C', text: '2.0 km/h' },
      { key: 'D', text: '2.5 km/h' }
    ]
  },
  {
    id: 'q-tcs-apt-14',
    question: 'In how many different ways can the letters of the word "LEADING" be arranged such that the vowels always come together?',
    subject_id: 'sub-aptitude',
    topic_id: 'top-normalization',
    difficulty: 'Hard',
    correct_answer: 'C',
    explanation: 'Vowels: E, A, I (3 vowels). Consonants: L, D, N, G (4 consonants). Treat (E,A,I) as 1 entity => 5 entities can be arranged in 5! = 120 ways. The 3 vowels can be arranged among themselves in 3! = 6 ways. Total = 120 * 6 = 720 ways.',
    options: [
      { key: 'A', text: '360' },
      { key: 'B', text: '480' },
      { key: 'C', text: '720' },
      { key: 'D', text: '5040' }
    ]
  },
  {
    id: 'q-tcs-apt-15',
    question: 'If A : B = 3 : 4 and B : C = 8 : 9, find the ratio A : C.',
    subject_id: 'sub-aptitude',
    topic_id: 'top-normalization',
    difficulty: 'Easy',
    correct_answer: 'A',
    explanation: 'A/C = (A/B) * (B/C) = (3/4) * (8/9) = 24/36 = 2/3. So A : C = 2 : 3.',
    options: [
      { key: 'A', text: '2 : 3' },
      { key: 'B', text: '1 : 2' },
      { key: 'C', text: '3 : 5' },
      { key: 'D', text: '4 : 5' }
    ]
  },
  {
    id: 'q-tcs-apt-16',
    question: 'Find the odd one out from the following group: 27, 64, 125, 144, 216, 343.',
    subject_id: 'sub-aptitude',
    topic_id: 'top-normalization',
    difficulty: 'Easy',
    correct_answer: 'C',
    explanation: '27=3^3, 64=4^3, 125=5^3, 216=6^3, 343=7^3 are all perfect cubes. 144 is 12^2 (a perfect square, not a cube of an integer).',
    options: [
      { key: 'A', text: '64' },
      { key: 'B', text: '125' },
      { key: 'C', text: '144' },
      { key: 'D', text: '216' }
    ]
  },
  {
    id: 'q-tcs-apt-17',
    question: 'Six friends A, B, C, D, E, F are seated in a row facing north. C is between A and E. D is not at the end. B is sitting immediately right to E. F is not at the right end. Who is on the extreme right?',
    subject_id: 'sub-aptitude',
    topic_id: 'top-normalization',
    difficulty: 'Hard',
    correct_answer: 'B',
    explanation: 'From the clues: A - C - E - B. Since F is not at right end, F sits left of A, and D fits in the row: F, D, A, C, E, B. Therefore B is at the extreme right.',
    options: [
      { key: 'A', text: 'E' },
      { key: 'B', text: 'B' },
      { key: 'C', text: 'C' },
      { key: 'D', text: 'D' }
    ]
  },
  {
    id: 'q-tcs-apt-18',
    question: 'A can do a piece of work in 8 days, and B can do it in 12 days. If they work on alternate days starting with A, in how many days will the work be finished?',
    subject_id: 'sub-aptitude',
    topic_id: 'top-normalization',
    difficulty: 'Hard',
    correct_answer: 'D',
    explanation: 'LCM of 8 and 12 = 24 units. A\'s rate = 3 units/day, B\'s rate = 2 units/day. In 2 days (A+B) = 5 units. In 8 days (4 cycles) = 20 units done, 4 units remaining. On day 9, A does 3 units (23 done, 1 left). On day 10, B needs 1/2 day. Total = 9.5 days.',
    options: [
      { key: 'A', text: '9 days' },
      { key: 'B', text: '9.2 days' },
      { key: 'C', text: '10 days' },
      { key: 'D', text: '9.5 days' }
    ]
  },
  {
    id: 'q-tcs-apt-19',
    question: 'In a group of 100 students, 60 like tea, 50 like coffee, and 20 like both. How many students like neither tea nor coffee?',
    subject_id: 'sub-aptitude',
    topic_id: 'top-normalization',
    difficulty: 'Easy',
    correct_answer: 'B',
    explanation: '|T ∪ C| = |T| + |C| - |T ∩ C| = 60 + 50 - 20 = 90. Students liking neither = 100 - 90 = 10 students.',
    options: [
      { key: 'A', text: '5' },
      { key: 'B', text: '10' },
      { key: 'C', text: '15' },
      { key: 'D', text: '20' }
    ]
  },
  {
    id: 'q-tcs-apt-20',
    question: 'What is the sum of all natural numbers between 100 and 200 that are divisible by 7?',
    subject_id: 'sub-aptitude',
    topic_id: 'top-normalization',
    difficulty: 'Medium',
    correct_answer: 'A',
    explanation: 'First term a = 105 (7*15), last term l = 196 (7*28). Number of terms n = 28 - 15 + 1 = 14 terms. Sum = (n/2) * (a + l) = (14/2) * (105 + 196) = 7 * 301 = 2107.',
    options: [
      { key: 'A', text: '2107' },
      { key: 'B', text: '2100' },
      { key: 'C', text: '2058' },
      { key: 'D', text: '2156' }
    ]
  }
];

// Questions for Data Structures & Algorithms Assessment
const dsaQuestions = [
  {
    id: 'q-dsa-hash-1',
    question: 'What is the average and worst-case time complexity for search operations in a Hash Table with collision handling?',
    subject_id: 'sub-dsa',
    topic_id: 'top-arrays',
    difficulty: 'Easy',
    correct_answer: 'B',
    explanation: 'With a good hash function and low load factor, search is O(1) on average. In the worst case where all keys hash to the same bucket (chaining into a single linked list), it degrades to O(N).',
    options: [
      { key: 'A', text: 'Average O(log N), Worst O(N)' },
      { key: 'B', text: 'Average O(1), Worst O(N)' },
      { key: 'C', text: 'Average O(1), Worst O(log N)' },
      { key: 'D', text: 'Average O(N), Worst O(N^2)' }
    ]
  },
  {
    id: 'q-dsa-cycle-1',
    question: 'Which two-pointer algorithm is used to detect a cycle in a singly linked list in O(N) time and O(1) auxiliary space?',
    subject_id: 'sub-dsa',
    topic_id: 'top-linked-lists',
    difficulty: 'Easy',
    correct_answer: 'A',
    explanation: 'Floyd\'s Cycle-Finding Algorithm (Tortoise and Hare) uses slow and fast pointers. If a cycle exists, the fast pointer eventually laps and meets the slow pointer.',
    options: [
      { key: 'A', text: 'Floyd\'s Tortoise and Hare Algorithm' },
      { key: 'B', text: 'Dijkstra\'s Shortest Path Algorithm' },
      { key: 'C', text: 'Kadane\'s Algorithm' },
      { key: 'D', text: 'Boyer-Moore Voting Algorithm' }
    ]
  },
  {
    id: 'q-dsa-bst-1',
    question: 'An in-order traversal of a valid Binary Search Tree (BST) will always visit the node keys in:',
    subject_id: 'sub-dsa',
    topic_id: 'top-trees',
    difficulty: 'Easy',
    correct_answer: 'C',
    explanation: 'In a BST, all keys in the left subtree are smaller and all keys in the right subtree are larger than the root. In-order traversal (Left, Root, Right) therefore yields keys in strictly sorted ascending order.',
    options: [
      { key: 'A', text: 'Reverse descending order' },
      { key: 'B', text: 'Level-by-level breadth-first order' },
      { key: 'C', text: 'Strictly sorted ascending order' },
      { key: 'D', text: 'Random heap order' }
    ]
  },
  {
    id: 'q-dsa-graph-bfs-1',
    question: 'Which fundamental data structure is used to implement Breadth-First Search (BFS) on an unweighted graph?',
    subject_id: 'sub-dsa',
    topic_id: 'top-graphs',
    difficulty: 'Easy',
    correct_answer: 'B',
    explanation: 'BFS uses a First-In, First-Out Queue to process vertices level by level. (DFS uses a LIFO Stack or recursion).',
    options: [
      { key: 'A', text: 'Stack' },
      { key: 'B', text: 'Queue (FIFO)' },
      { key: 'C', text: 'Priority Queue / Min-Heap' },
      { key: 'D', text: 'Disjoint Set Union (DSU)' }
    ]
  },
  {
    id: 'q-dsa-dp-coin-1',
    question: 'What is the minimum time complexity to solve the 0/1 Knapsack Problem with N items and maximum weight capacity W using Dynamic Programming?',
    subject_id: 'sub-dsa',
    topic_id: 'top-dp',
    difficulty: 'Medium',
    correct_answer: 'C',
    explanation: 'The standard dynamic programming solution for 0/1 Knapsack builds a table of size (N+1) x (W+1), running in O(N * W) pseudo-polynomial time.',
    options: [
      { key: 'A', text: 'O(N log W)' },
      { key: 'B', text: 'O(2^N)' },
      { key: 'C', text: 'O(N * W)' },
      { key: 'D', text: 'O(N^2)' }
    ]
  },
  {
    id: 'q-dsa-tree-height-1',
    question: 'What is the maximum number of nodes in a full binary tree of height H (where height of a single root node is 1)?',
    subject_id: 'sub-dsa',
    topic_id: 'top-trees',
    difficulty: 'Easy',
    correct_answer: 'D',
    explanation: 'A binary tree of height H has at most 2^H - 1 nodes (e.g. for height 1: 2^1 - 1 = 1; for height 3: 2^3 - 1 = 7).',
    options: [
      { key: 'A', text: '2 * H' },
      { key: 'B', text: '2^H' },
      { key: 'C', text: 'H^2' },
      { key: 'D', text: '2^H - 1' }
    ]
  },
  {
    id: 'q-dsa-topological-1',
    question: 'Topological sorting is defined only for which class of graphs?',
    subject_id: 'sub-dsa',
    topic_id: 'top-graphs',
    difficulty: 'Medium',
    correct_answer: 'A',
    explanation: 'Topological sorting linearly orders vertices such that for every directed edge u -> v, u comes before v. This is only possible in a Directed Acyclic Graph (DAG). If a cycle exists, no valid linear order exists.',
    options: [
      { key: 'A', text: 'Directed Acyclic Graphs (DAG)' },
      { key: 'B', text: 'Undirected Bipartite Graphs' },
      { key: 'C', text: 'Complete Graphs with negative edge weights' },
      { key: 'D', text: 'Any connected multigraph' }
    ]
  },
  {
    id: 'q-dsa-amortized-1',
    question: 'What is the amortized time complexity of the `push_back()` operation in a dynamic array (such as C++ `std::vector` or Python `list`) when capacity is doubled?',
    subject_id: 'sub-dsa',
    topic_id: 'top-arrays',
    difficulty: 'Easy',
    correct_answer: 'A',
    explanation: 'Although resizing takes O(N) when capacity is exhausted, geometric doubling ensures that the aggregate cost across N insertions is O(N), yielding an amortized O(1) time per operation.',
    options: [
      { key: 'A', text: 'O(1) Amortized' },
      { key: 'B', text: 'O(log N) Amortized' },
      { key: 'C', text: 'O(N) Amortized' },
      { key: 'D', text: 'O(N log N) Amortized' }
    ]
  }
];

const allNew = [...coreCsQuestions, ...tcsQuestions, ...dsaQuestions];
let addedQ = 0;
let addedOpt = 0;

allNew.forEach(q => {
  if (!existingQIds.has(q.id)) {
    data.questions.push({
      id: q.id,
      question: q.question,
      question_type: 'MCQ',
      branch_id: 'branch-cse',
      company_id: q.id.includes('tcs') ? 'comp-tcs' : null,
      job_role_id: 'role-sde',
      subject_id: q.subject_id,
      topic_id: q.topic_id,
      difficulty: q.difficulty,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      tags: [q.subject_id, 'Assessment Bank'],
      expected_time: 45,
      xp_value: 25
    });
    addedQ++;

    q.options.forEach(opt => {
      data.questionOptions.push({
        id: `opt-${q.id}-${opt.key}`,
        question_id: q.id,
        option_key: opt.key,
        option_text: opt.text,
        is_correct: opt.key === q.correct_answer
      });
      addedOpt++;
    });
  }
});

fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
console.log(`Successfully expanded question bank! Added ${addedQ} questions and ${addedOpt} options. Total questions now: ${data.questions.length}`);
