import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { initDb, saveDb } from '../src/database/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURES_FILE = path.join(__dirname, '../src/database/static_fixtures.json');

const newOsQuestions = [
  {
    id: 'q-os-11',
    question: 'In Round Robin CPU scheduling, what happens if the time quantum is set extremely large?',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-google',
    job_role_id: 'role-sde',
    subject_id: 'sub-os',
    topic_id: 'top-cpu-sched',
    difficulty: 'Easy',
    correct_answer: 'A',
    explanation: 'If the time quantum in Round Robin scheduling is arbitrarily large, every process completes its CPU burst without being preempted, degenerating into First-Come-First-Served (FCFS) scheduling.',
    tags: ['Operating Systems', 'CPU Scheduling', 'Round Robin', 'FCFS'],
    expected_time: 40,
    xp_value: 20,
    options: [
      { key: 'A', text: 'It degenerates into First-Come-First-Served (FCFS) scheduling', correct: true },
      { key: 'B', text: 'It degenerates into Shortest Job First (SJF) scheduling', correct: false },
      { key: 'C', text: 'Context switching overhead reaches maximum CPU utilization', correct: false },
      { key: 'D', text: 'Starvation of long processes occurs immediately', correct: false }
    ]
  },
  {
    id: 'q-os-12',
    question: 'Which page replacement algorithm suffers from Belady’s Anomaly, where increasing the number of page frames leads to more page faults?',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-amazon',
    job_role_id: 'role-sde',
    subject_id: 'sub-os',
    topic_id: 'top-memory-mgmt',
    difficulty: 'Medium',
    correct_answer: 'C',
    explanation: 'First-In, First-Out (FIFO) page replacement exhibits Belady\'s Anomaly because it is not a stack algorithm. LRU and Optimal algorithms belong to the class of stack algorithms and never suffer from Belady\'s Anomaly.',
    tags: ['Operating Systems', 'Virtual Memory', 'Belady Anomaly', 'FIFO'],
    expected_time: 45,
    xp_value: 25,
    options: [
      { key: 'A', text: 'Least Recently Used (LRU)', correct: false },
      { key: 'B', text: 'Optimal Page Replacement (OPT)', correct: false },
      { key: 'C', text: 'First-In, First-Out (FIFO)', correct: true },
      { key: 'D', text: 'Least Frequently Used (LFU)', correct: false }
    ]
  },
  {
    id: 'q-os-13',
    question: 'In the Banker\'s Algorithm for deadlock avoidance, a system is in a safe state if:',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-microsoft',
    job_role_id: 'role-sde',
    subject_id: 'sub-os',
    topic_id: 'top-deadlocks',
    difficulty: 'Medium',
    correct_answer: 'B',
    explanation: 'A system state is safe if there exists a safe sequence <P1, P2, ..., Pn> such that for each Pi, the resources that Pi can still request can be satisfied by currently available resources plus resources held by all Pj with j < i.',
    tags: ['Operating Systems', 'Deadlocks', 'Bankers Algorithm', 'Safe State'],
    expected_time: 50,
    xp_value: 25,
    options: [
      { key: 'A', text: 'Deadlocks can never occur under any circumstance in the future', correct: false },
      { key: 'B', text: 'There exists at least one safe sequence of process execution that avoids deadlock', correct: true },
      { key: 'C', text: 'All resource allocation requests are granted immediately without blocking', correct: false },
      { key: 'D', text: 'The number of allocated resources equals total available resources', correct: false }
    ]
  },
  {
    id: 'q-os-14',
    question: 'What is the primary role of the Translation Lookaside Buffer (TLB) in virtual memory management?',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-google',
    job_role_id: 'role-sde',
    subject_id: 'sub-os',
    topic_id: 'top-memory-mgmt',
    difficulty: 'Easy',
    correct_answer: 'B',
    explanation: 'The TLB is a high-speed hardware associative cache that stores recent virtual-to-physical page number translations, reducing memory access latency by bypassing the full page table lookup on TLB hits.',
    tags: ['Operating Systems', 'TLB', 'Paging', 'Virtual Memory'],
    expected_time: 40,
    xp_value: 20,
    options: [
      { key: 'A', text: 'To store recently executed machine instructions', correct: false },
      { key: 'B', text: 'To cache recent page table translations (virtual to physical frame mapping)', correct: true },
      { key: 'C', text: 'To hold dirty pages awaiting disk write-back', correct: false },
      { key: 'D', text: 'To store process control blocks in hardware registers', correct: false }
    ]
  },
  {
    id: 'q-os-15',
    question: 'What is thrashing in the context of Operating Systems virtual memory?',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-tcs',
    job_role_id: 'role-sde',
    subject_id: 'sub-os',
    topic_id: 'top-memory-mgmt',
    difficulty: 'Medium',
    correct_answer: 'D',
    explanation: 'Thrashing occurs when the system spends more time swapping pages into and out of memory than executing actual instructions, caused by insufficient total memory frames to support the sum of processes\' working sets.',
    tags: ['Operating Systems', 'Virtual Memory', 'Thrashing', 'Paging'],
    expected_time: 45,
    xp_value: 20,
    options: [
      { key: 'A', text: 'Repeated cache misses in L1 and L2 CPU caches', correct: false },
      { key: 'B', text: 'A deadlock condition involving multiple threads requesting memory locks', correct: false },
      { key: 'C', text: 'Overwriting kernel memory pages due to a buffer overflow', correct: false },
      { key: 'D', text: 'A state where the CPU spends more time paging (swapping) than executing instructions', correct: true }
    ]
  },
  {
    id: 'q-os-16',
    question: 'Which CPU scheduling algorithm provides the theoretical minimum average waiting time for a given set of stationary processes?',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-infosys',
    job_role_id: 'role-sde',
    subject_id: 'sub-os',
    topic_id: 'top-cpu-sched',
    difficulty: 'Medium',
    correct_answer: 'C',
    explanation: 'Shortest Job First (SJF) is provably optimal because scheduling shorter jobs earlier reduces the cumulative waiting time for all subsequent processes in the queue.',
    tags: ['Operating Systems', 'CPU Scheduling', 'SJF', 'Optimal'],
    expected_time: 40,
    xp_value: 20,
    options: [
      { key: 'A', text: 'First-Come-First-Served (FCFS)', correct: false },
      { key: 'B', text: 'Round Robin with small quantum', correct: false },
      { key: 'C', text: 'Shortest Job First (SJF)', correct: true },
      { key: 'D', text: 'Priority Scheduling with aging', correct: false }
    ]
  },
  {
    id: 'q-os-17',
    question: 'What is the purpose of the "Dirty Bit" (Modify Bit) in a page table entry?',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-wipro',
    job_role_id: 'role-sde',
    subject_id: 'sub-os',
    topic_id: 'top-memory-mgmt',
    difficulty: 'Easy',
    correct_answer: 'A',
    explanation: 'The dirty bit is set by hardware whenever a page is modified. When replacing the page, the OS checks this bit: if set, the page must be written back to disk; if clear, it can simply be overwritten without disk I/O.',
    tags: ['Operating Systems', 'Virtual Memory', 'Dirty Bit', 'Paging'],
    expected_time: 40,
    xp_value: 20,
    options: [
      { key: 'A', text: 'To indicate whether the page has been modified since being loaded into RAM', correct: true },
      { key: 'B', text: 'To track whether the page is shared between multiple processes', correct: false },
      { key: 'C', text: 'To verify whether the page is corrupted or infected with malware', correct: false },
      { key: 'D', text: 'To indicate if the page is currently locked in physical memory', correct: false }
    ]
  },
  {
    id: 'q-os-18',
    question: 'In process synchronization, how does a counting semaphore initialized to value K differ from a binary semaphore?',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-accenture',
    job_role_id: 'role-sde',
    subject_id: 'sub-os',
    topic_id: 'top-deadlocks',
    difficulty: 'Medium',
    correct_answer: 'B',
    explanation: 'A counting semaphore initialized to K allows up to K concurrent threads to enter the critical section simultaneously, controlling access to a finite pool of identical resource instances.',
    tags: ['Operating Systems', 'Synchronization', 'Semaphores', 'Concurrency'],
    expected_time: 45,
    xp_value: 25,
    options: [
      { key: 'A', text: 'It can only be modified by the OS kernel, not user threads', correct: false },
      { key: 'B', text: 'It controls access to a resource pool with up to K identical available units', correct: true },
      { key: 'C', text: 'It automatically detects and breaks deadlocks after K seconds', correct: false },
      { key: 'D', text: 'It eliminates the need for atomic wait() and signal() operations', correct: false }
    ]
  },
  {
    id: 'q-os-19',
    question: 'Which phenomenon occurs when a high-priority process is indirectly blocked by a low-priority process holding a shared lock, because a medium-priority process preempts the low-priority process?',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-microsoft',
    job_role_id: 'role-sde',
    subject_id: 'sub-os',
    topic_id: 'top-cpu-sched',
    difficulty: 'Hard',
    correct_answer: 'C',
    explanation: 'Priority Inversion occurs when a lower-priority task holds a resource required by a higher-priority task, and intermediate-priority tasks prevent the lower-priority task from running. It is solved using Priority Inheritance protocol.',
    tags: ['Operating Systems', 'Priority Inversion', 'Scheduling', 'Real-Time'],
    expected_time: 50,
    xp_value: 30,
    options: [
      { key: 'A', text: 'Convoy Effect', correct: false },
      { key: 'B', text: 'Starvation', correct: false },
      { key: 'C', text: 'Priority Inversion', correct: true },
      { key: 'D', text: 'Deadlock Livelock Transition', correct: false }
    ]
  },
  {
    id: 'q-os-20',
    question: 'What is the main advantage of Inverted Page Tables over traditional hierarchical multi-level page tables?',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-google',
    job_role_id: 'role-sde',
    subject_id: 'sub-os',
    topic_id: 'top-memory-mgmt',
    difficulty: 'Hard',
    correct_answer: 'B',
    explanation: 'An inverted page table has only one entry for each real physical memory frame rather than each virtual page, drastically reducing physical memory consumed by page tables, especially on 64-bit systems.',
    tags: ['Operating Systems', 'Memory Management', 'Inverted Page Table', 'Paging'],
    expected_time: 50,
    xp_value: 30,
    options: [
      { key: 'A', text: 'It eliminates the need for a Translation Lookaside Buffer (TLB)', correct: false },
      { key: 'B', text: 'Memory overhead is proportional to physical RAM size rather than virtual address space', correct: true },
      { key: 'C', text: 'Virtual address translation requires zero hash table lookups', correct: false },
      { key: 'D', text: 'It completely eliminates internal fragmentation in pages', correct: false }
    ]
  },
  {
    id: 'q-os-21',
    question: 'In disk scheduling, which algorithm moves the disk arm across cylinders in one direction servicing requests, and then reverses direction at the boundary?',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-capgemini',
    job_role_id: 'role-sde',
    subject_id: 'sub-os',
    topic_id: 'top-cpu-sched',
    difficulty: 'Medium',
    correct_answer: 'B',
    explanation: 'The SCAN algorithm (also known as the Elevator algorithm) moves the read/write head toward one end of the disk servicing requests, then reverses direction at the edge and services requests moving the opposite way.',
    tags: ['Operating Systems', 'Disk Scheduling', 'SCAN', 'Elevator'],
    expected_time: 45,
    xp_value: 20,
    options: [
      { key: 'A', text: 'Shortest Seek Time First (SSTF)', correct: false },
      { key: 'B', text: 'SCAN (Elevator Algorithm)', correct: true },
      { key: 'C', text: 'C-SCAN (Circular SCAN)', correct: false },
      { key: 'D', text: 'First-Come-First-Served (FCFS)', correct: false }
    ]
  },
  {
    id: 'q-os-22',
    question: 'What is the purpose of the "fork()" system call in Unix/Linux operating systems?',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-cognizant',
    job_role_id: 'role-sde',
    subject_id: 'sub-os',
    topic_id: 'top-cpu-sched',
    difficulty: 'Easy',
    correct_answer: 'A',
    explanation: 'fork() creates a new child process that is an exact duplicate of the calling parent process, returning 0 in the child process and the child\'s PID in the parent process.',
    tags: ['Operating Systems', 'Processes', 'fork', 'Unix'],
    expected_time: 40,
    xp_value: 20,
    options: [
      { key: 'A', text: 'Creates a new child process that duplicates the parent process address space', correct: true },
      { key: 'B', text: 'Replaces the current process image with a new executable binary', correct: false },
      { key: 'C', text: 'Spawns a lightweight kernel thread within the same process context', correct: false },
      { key: 'D', text: 'Terminates the currently running process and reaps zombie status', correct: false }
    ]
  },
  {
    id: 'q-os-23',
    question: 'What is a "Zombie Process" in Unix-like operating systems?',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-deloitte',
    job_role_id: 'role-sde',
    subject_id: 'sub-os',
    topic_id: 'top-cpu-sched',
    difficulty: 'Medium',
    correct_answer: 'C',
    explanation: 'A zombie process is a process that has completed execution via exit(), but its entry remains in the process table so its parent can read its exit status via wait(). Once the parent reads the status, the zombie entry is removed.',
    tags: ['Operating Systems', 'Processes', 'Zombie Process', 'wait'],
    expected_time: 45,
    xp_value: 25,
    options: [
      { key: 'A', text: 'A process that is stuck in an infinite CPU loop consuming 100% core cycles', correct: false },
      { key: 'B', text: 'A process whose parent terminated, leaving it adopted by init/systemd', correct: false },
      { key: 'C', text: 'A terminated process whose exit status has not yet been read by its parent via wait()', correct: true },
      { key: 'D', text: 'A process blocked waiting indefinitely on an unavailable I/O device', correct: false }
    ]
  },
  {
    id: 'q-os-24',
    question: 'Which technique is used by modern OS kernels to allow fork() to copy a process memory space instantly without duplicating all pages?',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-amazon',
    job_role_id: 'role-sde',
    subject_id: 'sub-os',
    topic_id: 'top-memory-mgmt',
    difficulty: 'Medium',
    correct_answer: 'B',
    explanation: 'Copy-On-Write (COW) allows the parent and child processes to initially share the same physical pages marked read-only. A private copy of a page is created only when either process attempts to write to it.',
    tags: ['Operating Systems', 'Memory Management', 'Copy-On-Write', 'fork'],
    expected_time: 45,
    xp_value: 25,
    options: [
      { key: 'A', text: 'Virtual Page Swapping', correct: false },
      { key: 'B', text: 'Copy-On-Write (COW)', correct: true },
      { key: 'C', text: 'Demand Paging with Zero Fill', correct: false },
      { key: 'D', text: 'Dynamic Relocation Registers', correct: false }
    ]
  },
  {
    id: 'q-os-25',
    question: 'What is the main difference between internal fragmentation and external fragmentation?',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-tcs',
    job_role_id: 'role-sde',
    subject_id: 'sub-os',
    topic_id: 'top-memory-mgmt',
    difficulty: 'Easy',
    correct_answer: 'A',
    explanation: 'Internal fragmentation occurs when allocated memory blocks are larger than requested (wasted space inside the block). External fragmentation occurs when total free memory is sufficient but non-contiguous (scattered holes).',
    tags: ['Operating Systems', 'Memory Management', 'Fragmentation', 'Paging'],
    expected_time: 40,
    xp_value: 20,
    options: [
      { key: 'A', text: 'Internal is wasted space inside an allocated block; external is non-contiguous free space outside blocks', correct: true },
      { key: 'B', text: 'Internal occurs only in paging; external occurs only in virtual cache architectures', correct: false },
      { key: 'C', text: 'Internal fragmentation can be resolved by compaction, while external cannot', correct: false },
      { key: 'D', text: 'Internal fragmentation affects disk drives, while external fragmentation affects RAM', correct: false }
    ]
  }
];

const newCnQuestions = [
  {
    id: 'q-cn-9',
    question: 'In the TCP 3-way handshake used to establish a reliable connection, which sequence of flags is exchanged between client and server?',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-google',
    job_role_id: 'role-sde',
    subject_id: 'sub-cn',
    topic_id: 'top-osi-tcp',
    difficulty: 'Easy',
    correct_answer: 'A',
    explanation: 'The TCP connection establishment sequence is: 1. Client sends SYN (Synchronize), 2. Server responds with SYN-ACK (Synchronize-Acknowledge), 3. Client acknowledges with ACK.',
    tags: ['Computer Networks', 'TCP', 'Handshake', 'Transport Layer'],
    expected_time: 40,
    xp_value: 20,
    options: [
      { key: 'A', text: 'SYN -> SYN-ACK -> ACK', correct: true },
      { key: 'B', text: 'ACK -> SYN -> SYN-ACK', correct: false },
      { key: 'C', text: 'SYN -> ACK -> DATA', correct: false },
      { key: 'D', text: 'FIN -> ACK -> FIN-ACK', correct: false }
    ]
  },
  {
    id: 'q-cn-10',
    question: 'Given an IPv4 subnet mask of 255.255.255.224 (/27), how many usable host IP addresses are available in each subnet?',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-amazon',
    job_role_id: 'role-sde',
    subject_id: 'sub-cn',
    topic_id: 'top-routing',
    difficulty: 'Medium',
    correct_answer: 'B',
    explanation: 'In a /27 subnet, 32 - 27 = 5 host bits are available. Total addresses = 2^5 = 32. Subtracting 2 (network ID and broadcast address) yields 30 usable host addresses.',
    tags: ['Computer Networks', 'Subnetting', 'IPv4', 'CIDR'],
    expected_time: 45,
    xp_value: 25,
    options: [
      { key: 'A', text: '32', correct: false },
      { key: 'B', text: '30', correct: true },
      { key: 'C', text: '62', correct: false },
      { key: 'D', text: '14', correct: false }
    ]
  },
  {
    id: 'q-cn-11',
    question: 'Which OSI model layer is responsible for logical IP addressing, packet forwarding, and path determination?',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-tcs',
    job_role_id: 'role-sde',
    subject_id: 'sub-cn',
    topic_id: 'top-osi-tcp',
    difficulty: 'Easy',
    correct_answer: 'C',
    explanation: 'The Network Layer (Layer 3) handles logical addressing (IPv4/IPv6), packet routing, and packet forwarding across heterogeneous networks.',
    tags: ['Computer Networks', 'OSI Model', 'Network Layer', 'Routing'],
    expected_time: 40,
    xp_value: 20,
    options: [
      { key: 'A', text: 'Data Link Layer (Layer 2)', correct: false },
      { key: 'B', text: 'Transport Layer (Layer 4)', correct: false },
      { key: 'C', text: 'Network Layer (Layer 3)', correct: true },
      { key: 'D', text: 'Session Layer (Layer 5)', correct: false }
    ]
  },
  {
    id: 'q-cn-12',
    question: 'What is the primary function of the Address Resolution Protocol (ARP)?',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-infosys',
    job_role_id: 'role-sde',
    subject_id: 'sub-cn',
    topic_id: 'top-routing',
    difficulty: 'Easy',
    correct_answer: 'B',
    explanation: 'ARP resolves a known logical IP address (Layer 3) to a physical hardware MAC address (Layer 2) on a local network segment.',
    tags: ['Computer Networks', 'ARP', 'MAC Address', 'Network Layer'],
    expected_time: 40,
    xp_value: 20,
    options: [
      { key: 'A', text: 'To translate domain names into IP addresses', correct: false },
      { key: 'B', text: 'To map a known IPv4 address to its physical hardware MAC address', correct: true },
      { key: 'C', text: 'To dynamically allocate IP addresses to network hosts', correct: false },
      { key: 'D', text: 'To encrypt packets transmitted over insecure public Wi-Fi', correct: false }
    ]
  },
  {
    id: 'q-cn-13',
    question: 'In TCP congestion control, what happens during the "Slow Start" phase upon receiving each successful ACK?',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-microsoft',
    job_role_id: 'role-sde',
    subject_id: 'sub-cn',
    topic_id: 'top-osi-tcp',
    difficulty: 'Medium',
    correct_answer: 'C',
    explanation: 'During TCP Slow Start, for every ACK received, the congestion window (cwnd) increases by 1 MSS. Thus, for each full round-trip time (RTT), cwnd doubles exponentially until it reaches the slow-start threshold (ssthresh).',
    tags: ['Computer Networks', 'TCP', 'Congestion Control', 'Slow Start'],
    expected_time: 45,
    xp_value: 25,
    options: [
      { key: 'A', text: 'The congestion window increases linearly by 1 MSS per RTT', correct: false },
      { key: 'B', text: 'The transmission timeout timer is halved', correct: false },
      { key: 'C', text: 'The congestion window increases exponentially, doubling every round-trip time (RTT)', correct: true },
      { key: 'D', text: 'The receiver advertisement window is reset to maximum buffer capacity', correct: false }
    ]
  },
  {
    id: 'q-cn-14',
    question: 'Which transport protocol and port number does the Domain Name System (DNS) primarily use for standard client name resolution queries?',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-wipro',
    job_role_id: 'role-sde',
    subject_id: 'sub-cn',
    topic_id: 'top-osi-tcp',
    difficulty: 'Easy',
    correct_answer: 'A',
    explanation: 'Standard DNS queries and responses use UDP on port 53 for low latency and zero connection overhead. TCP port 53 is used for zone transfers between DNS servers and responses exceeding 512 bytes.',
    tags: ['Computer Networks', 'DNS', 'UDP', 'Application Layer'],
    expected_time: 40,
    xp_value: 20,
    options: [
      { key: 'A', text: 'UDP Port 53', correct: true },
      { key: 'B', text: 'TCP Port 80', correct: false },
      { key: 'C', text: 'TCP Port 443', correct: false },
      { key: 'D', text: 'UDP Port 67', correct: false }
    ]
  },
  {
    id: 'q-cn-15',
    question: 'What is the "Count to Infinity" problem in computer networking, and which routing protocol class does it affect?',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-google',
    job_role_id: 'role-sde',
    subject_id: 'sub-cn',
    topic_id: 'top-routing',
    difficulty: 'Hard',
    correct_answer: 'B',
    explanation: 'The Count-to-Infinity problem affects Distance Vector routing protocols (e.g. RIP) when a link failure causes routing loops where nodes iteratively increment their distance to the failed destination until reaching an arbitrary threshold (e.g. 16 in RIP). Split Horizon and Poison Reverse are used to mitigate this.',
    tags: ['Computer Networks', 'Routing', 'Distance Vector', 'RIP', 'Count to Infinity'],
    expected_time: 50,
    xp_value: 30,
    options: [
      { key: 'A', text: 'Buffer exhaustion in Link-State protocols like OSPF', correct: false },
      { key: 'B', text: 'Routing loops in Distance Vector protocols like RIP due to slow convergence after a link failure', correct: true },
      { key: 'C', text: 'Exponential window expansion in TCP Reno during congestion avoidance', correct: false },
      { key: 'D', text: 'Exhaustion of available private IPv4 addresses in NAT gateways', correct: false }
    ]
  },
  {
    id: 'q-cn-16',
    question: 'How does Go-Back-N ARQ differ from Selective Repeat ARQ in sliding window flow control when a packet is lost?',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-amazon',
    job_role_id: 'role-sde',
    subject_id: 'sub-cn',
    topic_id: 'top-osi-tcp',
    difficulty: 'Medium',
    correct_answer: 'A',
    explanation: 'In Go-Back-N, the receiver discards all subsequent packets after a lost packet, forcing the sender to retransmit the lost packet and all subsequent packets in the window. In Selective Repeat, the receiver buffers subsequent packets and requests only the specific missing packet.',
    tags: ['Computer Networks', 'Flow Control', 'Go-Back-N', 'Selective Repeat'],
    expected_time: 45,
    xp_value: 25,
    options: [
      { key: 'A', text: 'Go-Back-N retransmits all packets from the lost frame onward; Selective Repeat retransmits only the lost packet', correct: true },
      { key: 'B', text: 'Go-Back-N requires receiver buffering, while Selective Repeat requires zero receiver buffer', correct: false },
      { key: 'C', text: 'Go-Back-N uses negative acknowledgments (NACK), while Selective Repeat uses positive ACKs only', correct: false },
      { key: 'D', text: 'Selective Repeat operates at Layer 2, while Go-Back-N operates exclusively at Layer 4', correct: false }
    ]
  },
  {
    id: 'q-cn-17',
    question: 'What is the purpose of Network Address Translation (NAT)?',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-accenture',
    job_role_id: 'role-sde',
    subject_id: 'sub-cn',
    topic_id: 'top-routing',
    difficulty: 'Easy',
    correct_answer: 'B',
    explanation: 'NAT modifies IP address headers in transit across a router, mapping multiple private IP addresses inside a local network to one or few public IP addresses, slowing IPv4 address exhaustion.',
    tags: ['Computer Networks', 'NAT', 'IP Addressing', 'Network Layer'],
    expected_time: 40,
    xp_value: 20,
    options: [
      { key: 'A', text: 'To convert IPv4 packets into IPv6 format', correct: false },
      { key: 'B', text: 'To map multiple private IP addresses to a single public IP address for internet routing', correct: true },
      { key: 'C', text: 'To encrypt transport payloads using symmetric keys', correct: false },
      { key: 'D', text: 'To assign dynamic DNS names to local hosts', correct: false }
    ]
  },
  {
    id: 'q-cn-18',
    question: 'Which HTTP version introduced multiplexing over a single TCP connection, HPACK header compression, and binary framing?',
    question_type: 'MCQ',
    branch_id: 'branch-cse',
    company_id: 'comp-google',
    job_role_id: 'role-sde',
    subject_id: 'sub-cn',
    topic_id: 'top-osi-tcp',
    difficulty: 'Medium',
    correct_answer: 'B',
    explanation: 'HTTP/2 introduced binary framing, multiplexing multiple concurrent requests over a single TCP connection without head-of-line blocking at the HTTP layer, server push, and HPACK header compression.',
    tags: ['Computer Networks', 'HTTP/2', 'Protocols', 'Application Layer'],
    expected_time: 45,
    xp_value: 25,
    options: [
      { key: 'A', text: 'HTTP/1.1', correct: false },
      { key: 'B', text: 'HTTP/2', correct: true },
      { key: 'C', text: 'HTTP/3 (QUIC)', correct: false },
      { key: 'D', text: 'SPDY/1.0', correct: false }
    ]
  }
];

async function run() {
  await initDb();
  console.log('[Expansion] Reading static_fixtures.json...');
  const raw = fs.readFileSync(FIXTURES_FILE, 'utf-8');
  const fixtures = JSON.parse(raw);

  let addedQuestions = 0;
  let addedOptions = 0;

  const allToAdd = [...newOsQuestions, ...newCnQuestions];

  for (const item of allToAdd) {
    const existing = db.get('questions', item.id);
    if (!existing) {
      const qRecord = {
        id: item.id,
        question: item.question,
        question_type: item.question_type,
        branch_id: item.branch_id,
        company_id: item.company_id,
        job_role_id: item.job_role_id,
        subject_id: item.subject_id,
        topic_id: item.topic_id,
        difficulty: item.difficulty,
        correct_answer: item.correct_answer,
        explanation: item.explanation,
        tags: item.tags,
        expected_time: item.expected_time,
        xp_value: item.xp_value
      };

      db.insert('questions', qRecord);
      fixtures.questions.push(qRecord);
      addedQuestions++;

      for (const opt of item.options) {
        const optRecord = {
          id: `opt-${item.id}-${opt.key}`,
          question_id: item.id,
          option_key: opt.key,
          option_text: opt.text,
          is_correct: opt.correct
        };
        db.insert('questionOptions', optRecord);
        fixtures.questionOptions.push(optRecord);
        addedOptions++;
      }
    }
  }

  saveDb();
  fs.writeFileSync(FIXTURES_FILE, JSON.stringify(fixtures, null, 2), 'utf-8');
  console.log(`[Expansion] Successfully added ${addedQuestions} questions and ${addedOptions} options to SQLite and static_fixtures.json.`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
