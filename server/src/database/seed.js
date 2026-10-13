import bcrypt from 'bcryptjs';
import db, { initDb, saveDb } from './db.js';

export const seedDatabase = async (force = false) => {
  await initDb();
  const currentUsers = db.getAll('users');
  if (currentUsers.length > 0 && !force) {
    console.log('[Seed] Database already contains data. Skipping re-seed.');
    return;
  }

  console.log('[Seed] Seeding comprehensive B.Tech placement data...');

  // 1. BRANCHES
  const branches = [
    { id: 'branch-cse', name: 'Computer Science Engineering (CSE)', code: 'CSE', description: 'Core Computing, Algorithms, Systems & Software' },
    { id: 'branch-it', name: 'Information Technology (IT)', code: 'IT', description: 'Enterprise Software, Networks, Web & Database Systems' },
    { id: 'branch-ece', name: 'Electronics & Telecommunication (ENTC/ECE)', code: 'ECE', description: 'Digital/Analog Circuits, VLSI, Embedded & Signals' },
    { id: 'branch-ee', name: 'Electrical Engineering (EE)', code: 'EE', description: 'Power Systems, Control Systems, Machines & Power Electronics' },
    { id: 'branch-me', name: 'Mechanical Engineering (ME)', code: 'ME', description: 'Thermodynamics, Fluid Mechanics, Design & Manufacturing' },
    { id: 'branch-ce', name: 'Civil Engineering (CE)', code: 'CE', description: 'Structural Engineering, Geotechnical, Transportation & Concrete' },
    { id: 'branch-che', name: 'Chemical Engineering (CHE)', code: 'CHE', description: 'Reaction Engineering, Mass Transfer & Process Operations' },
    { id: 'branch-aids', name: 'AI & Data Science (AIDS)', code: 'AIDS', description: 'Machine Learning, Deep Learning, Big Data & Analytics' },
    { id: 'branch-aiml', name: 'AI & Machine Learning (AIML)', code: 'AIML', description: 'Applied AI, Neural Networks, Computer Vision & NLP' }
  ];

  // 2. COMPANIES
  const companies = [
    {
      id: 'comp-tcs',
      name: 'TCS',
      tier: 'Service/IT Services',
      pattern_description: 'TCS NQT: Foundation Section (Cognitive), Advanced Section (Coding + Tech MCQs), Technical & Managerial Interview.',
      website: 'https://www.tcs.com',
      logo_icon: 'Building2',
      hiring_rounds: ['Online NQT Cognitive', 'Technical MCQ + Coding', 'Technical Interview', 'HR / MR Interview']
    },
    {
      id: 'comp-infosys',
      name: 'Infosys',
      tier: 'Service/IT Services',
      pattern_description: 'InfyTQ / HackWithInfy: Pseudocode, Mathematical Ability, Hands-on DSA Coding, Core CS Interview.',
      website: 'https://www.infosys.com',
      logo_icon: 'Laptop',
      hiring_rounds: ['Online Assessment (Pseudocode & Logic)', 'Hands-on Coding Assessment', 'Technical Viva & Interview', 'HR Interview']
    },
    {
      id: 'comp-wipro',
      name: 'Wipro',
      tier: 'Service/IT Services',
      pattern_description: 'Wipro Elite NTH: Aptitude, Written Communication, Coding (2 questions), Technical Interview.',
      website: 'https://www.wipro.com',
      logo_icon: 'Cpu',
      hiring_rounds: ['National Talent Hunt Online Test', 'Coding Round', 'Technical Interview', 'HR Discussion']
    },
    {
      id: 'comp-accenture',
      name: 'Accenture',
      tier: 'Consulting & IT Services',
      pattern_description: 'Cognitive & Technical Assessment, Pseudo-code, Cloud & Security basics, Coding round, Interview.',
      website: 'https://www.accenture.com',
      logo_icon: 'Zap',
      hiring_rounds: ['Cognitive & Technical MCQ', 'Coding Assessment', 'Communication Assessment', 'Virtual Interview']
    },
    {
      id: 'comp-capgemini',
      name: 'Capgemini',
      tier: 'Consulting & IT Services',
      pattern_description: 'Pseudocode, English Communication, Game-based Aptitude, Technical and HR interview.',
      website: 'https://www.capgemini.com',
      logo_icon: 'Layers',
      hiring_rounds: ['Pseudocode Round', 'Game-based Aptitude Test', 'Technical Interview', 'HR Interview']
    },
    {
      id: 'comp-cognizant',
      name: 'Cognizant',
      tier: 'IT Services',
      pattern_description: 'GenC & GenC Next: Programming Logic, Coding, CS Fundamentals, Solution Design.',
      website: 'https://www.cognizant.com',
      logo_icon: 'Briefcase',
      hiring_rounds: ['Aptitude & Technical Logic', 'Coding Assessment (GenC Next)', 'Technical Interview', 'HR Discussion']
    },
    {
      id: 'comp-deloitte',
      name: 'Deloitte',
      tier: 'Consulting / Product',
      pattern_description: 'Quantitative, Logical, Verbal, Computer Programming MCQs, Case Study & Technical Interview.',
      website: 'https://www.deloitte.com',
      logo_icon: 'Shield',
      hiring_rounds: ['Online Aptitude & Tech MCQs', 'Case Study Assessment', 'Technical Interview', 'Partner / Director Round']
    },
    {
      id: 'comp-amazon',
      name: 'Amazon',
      tier: 'Product (FAANG / Tier-1)',
      pattern_description: 'Online Assessment (DSA Coding + Work Style Assessment / Leadership Principles), 3-4 Rounds of System Design & DSA.',
      website: 'https://amazon.jobs',
      logo_icon: 'Globe',
      hiring_rounds: ['Online Coding OA (2 DSA questions)', 'Work Style Simulation', 'Technical Round 1 (DSA)', 'Technical Round 2 (System Design)', 'Bar Raiser']
    },
    {
      id: 'comp-microsoft',
      name: 'Microsoft',
      tier: 'Product (Tier-1)',
      pattern_description: 'Codility OA, Multiple Technical Rounds focusing on Problem Solving, Architecture, Operating Systems & Data Structures.',
      website: 'https://careers.microsoft.com',
      logo_icon: 'Monitor',
      hiring_rounds: ['Online Codility Test', 'Technical Round 1 (DSA & Problem Solving)', 'Technical Round 2 (CS Fundamentals & Design)', 'Managerial Round / AA']
    },
    {
      id: 'comp-google',
      name: 'Google',
      tier: 'Product (FAANG / Tier-1)',
      pattern_description: 'Google Online Challenge, 45-min Phone Screen, 4-5 Onsite Technical Interviews assessing Googleyness, DSA & Complexity.',
      website: 'https://careers.google.com',
      logo_icon: 'Sparkles',
      hiring_rounds: ['Google Online Challenge', 'Phone Technical Screen', '3x Onsite Technical DSA Interviews', 'Googliness & Leadership Round']
    }
  ];

  // 3. JOB ROLES
  const jobRoles = [
    { id: 'role-sde', title: 'Software Development Engineer (SDE)', branch_id: 'branch-cse', description: 'Design, develop and maintain core software applications, algorithms and services.' },
    { id: 'role-systems', title: 'Systems Engineer', branch_id: 'branch-it', description: 'Enterprise systems configuration, infrastructure support, and software integration.' },
    { id: 'role-data-eng', title: 'Data Engineer / Analyst', branch_id: 'branch-aids', description: 'Data pipelines, SQL data warehouses, ETL processes and analytical dashboards.' },
    { id: 'role-embedded', title: 'Embedded Systems Engineer', branch_id: 'branch-ece', description: 'Firmware development, microcontroller programming and hardware-software interfacing.' },
    { id: 'role-get', title: 'Graduate Engineer Trainee (GET)', branch_id: 'branch-me', description: 'Rotational technical engineering training across operations, manufacturing, and design.' },
    { id: 'role-cloud', title: 'Cloud & DevOps Associate', branch_id: 'branch-it', description: 'Cloud infrastructure (AWS/Azure), CI/CD automation and container orchestration.' },
    { id: 'role-ai-engineer', title: 'AI/ML Engineer', branch_id: 'branch-aiml', description: 'Model training, neural network deployment, feature engineering and evaluation.' }
  ];

  // 4. SUBJECTS
  const subjects = [
    // CSE/IT
    { id: 'sub-dsa', name: 'Data Structures & Algorithms', code: 'CS-DSA', branch_id: 'branch-cse', icon: 'Code2', description: 'Arrays, Trees, Graphs, Sorting, Hashing, Dynamic Programming' },
    { id: 'sub-dbms', name: 'Database Management Systems (DBMS)', code: 'CS-DBMS', branch_id: 'branch-it', icon: 'Database', description: 'Relational Model, SQL, Normalization, ACID Transactions, Indexing' },
    { id: 'sub-os', name: 'Operating Systems', code: 'CS-OS', branch_id: 'branch-cse', icon: 'Cpu', description: 'Processes, CPU Scheduling, Memory Management, Deadlocks, Paging' },
    { id: 'sub-cn', name: 'Computer Networks', code: 'CS-CN', branch_id: 'branch-it', icon: 'Network', description: 'OSI 7 Layers, TCP/IP, Routing Algorithms, DNS, HTTP/HTTPS, Subnetting' },
    { id: 'sub-oop', name: 'Object Oriented Programming', code: 'CS-OOP', branch_id: 'branch-cse', icon: 'Box', description: 'Classes, Objects, Polymorphism, Inheritance, Encapsulation, SOLID' },
    { id: 'sub-aptitude', name: 'General Aptitude & Reasoning', code: 'GEN-APT', branch_id: 'branch-cse', icon: 'Calculator', description: 'Quantitative Aptitude, Logical Reasoning, Verbal Ability' },

    // ECE / ENTC
    { id: 'sub-digital-elec', name: 'Digital Electronics', code: 'EC-DE', branch_id: 'branch-ece', icon: 'Binary', description: 'Logic Gates, Flip-Flops, Combinational & Sequential Circuits, Karnaugh Maps' },
    { id: 'sub-microproc', name: 'Microprocessors & Embedded Systems', code: 'EC-MP', branch_id: 'branch-ece', icon: 'Microchip', description: '8085/8086 Architecture, Interrupts, Timers, Embedded C' },

    // EE
    { id: 'sub-power-sys', name: 'Power Systems & Machines', code: 'EE-PS', branch_id: 'branch-ee', icon: 'Zap', description: 'Transformers, Synchronous Motors, Transmission Lines, Fault Analysis' },
    { id: 'sub-ctrl-sys', name: 'Control Systems', code: 'EE-CS', branch_id: 'branch-ee', icon: 'Sliders', description: 'Transfer Functions, Bode Plots, Nyquist Stability, State Space' },

    // ME
    { id: 'sub-thermo', name: 'Thermodynamics & Heat Transfer', code: 'ME-TH', branch_id: 'branch-me', icon: 'Flame', description: 'Laws of Thermodynamics, Carnot Cycle, Entropy, Conduction & Convection' },
    { id: 'sub-som', name: 'Strength of Materials', code: 'ME-SOM', branch_id: 'branch-me', icon: 'ShieldAlert', description: 'Stress, Strain, Bending Moment, Shear Force, Torsion' },

    // CE
    { id: 'sub-structural', name: 'Structural Engineering', code: 'CE-SE', branch_id: 'branch-ce', icon: 'Building', description: 'Concrete Technology, Trusses, RCC Design, Soil Mechanics' }
  ];

  // 5. TOPICS
  const topics = [
    // DSA
    { id: 'top-arrays', subject_id: 'sub-dsa', name: 'Arrays & Two Pointers', importance_weight: 1.0 },
    { id: 'top-linked-lists', subject_id: 'sub-dsa', name: 'Linked Lists & Pointers', importance_weight: 0.9 },
    { id: 'top-trees', subject_id: 'sub-dsa', name: 'Binary Trees & BSTs', importance_weight: 1.0 },
    { id: 'top-dp', subject_id: 'sub-dsa', name: 'Dynamic Programming', importance_weight: 1.0 },
    { id: 'top-graphs', subject_id: 'sub-dsa', name: 'Graphs & BFS/DFS', importance_weight: 0.95 },

    // DBMS
    { id: 'top-normalization', subject_id: 'sub-dbms', name: 'Normalization (1NF to BCNF)', importance_weight: 1.0 },
    { id: 'top-sql-queries', subject_id: 'sub-dbms', name: 'SQL Queries & Joins', importance_weight: 1.0 },
    { id: 'top-acid', subject_id: 'sub-dbms', name: 'Transactions & ACID Properties', importance_weight: 0.9 },
    { id: 'top-indexing', subject_id: 'sub-dbms', name: 'B-Trees & Database Indexing', importance_weight: 0.85 },

    // OS
    { id: 'top-cpu-sched', subject_id: 'sub-os', name: 'CPU Scheduling Algorithms', importance_weight: 0.95 },
    { id: 'top-memory-mgmt', subject_id: 'sub-os', name: 'Virtual Memory & Paging', importance_weight: 0.95 },
    { id: 'top-deadlocks', subject_id: 'sub-os', name: 'Deadlock Detection & Prevention', importance_weight: 0.9 },

    // CN
    { id: 'top-osi-tcp', subject_id: 'sub-cn', name: 'OSI vs TCP/IP Protocol Suite', importance_weight: 1.0 },
    { id: 'top-routing', subject_id: 'sub-cn', name: 'IP Addressing & Subnetting', importance_weight: 0.9 },

    // OOP
    { id: 'top-pillars', subject_id: 'sub-oop', name: 'Core Pillars (Polymorphism & Abstraction)', importance_weight: 1.0 },
    { id: 'top-design-pat', subject_id: 'sub-oop', name: 'Creational & Structural Patterns', importance_weight: 0.85 },

    // Aptitude
    { id: 'top-quant', subject_id: 'sub-aptitude', name: 'Quantitative & Speed Math', importance_weight: 0.9 },
    { id: 'top-logic', subject_id: 'sub-aptitude', name: 'Logical Deduction & Puzzles', importance_weight: 0.9 },

    // ECE
    { id: 'top-logic-gates', subject_id: 'sub-digital-elec', name: 'Logic Minimization & Flip Flops', importance_weight: 0.9 },
    { id: 'top-8085', subject_id: 'sub-microproc', name: '8085 Instruction Set & Architecture', importance_weight: 0.9 },

    // EE
    { id: 'top-transformers', subject_id: 'sub-power-sys', name: 'Transformers & Induction Motors', importance_weight: 0.9 },

    // ME
    { id: 'top-thermo-laws', subject_id: 'sub-thermo', name: 'First & Second Laws of Thermodynamics', importance_weight: 0.9 },
    { id: 'top-stress-strain', subject_id: 'sub-som', name: 'Stress-Strain Diagrams & Hooke Law', importance_weight: 0.9 },

    // CE
    { id: 'top-concrete', subject_id: 'sub-structural', name: 'RCC Beam Design & Concrete Curing', importance_weight: 0.9 }
  ];

  // 6. QUESTIONS & QUESTION OPTIONS
  const rawQuestions = [
    // DBMS - Normalization (TCS / Infosys Pattern)
    {
      id: 'q-dbms-1',
      question: 'Which normal form is specifically designed to eliminate transitive functional dependencies (i.e., non-prime attribute determining another non-prime attribute)?',
      question_type: 'MCQ',
      branch_id: 'branch-it',
      company_id: 'comp-tcs',
      job_role_id: 'role-sde',
      subject_id: 'sub-dbms',
      topic_id: 'top-normalization',
      difficulty: 'Medium',
      correct_answer: 'B',
      explanation: 'Third Normal Form (3NF) requires the relation to already be in 2NF, and no non-prime attribute is transitively dependent on any candidate key (X -> A where X is a superkey or A is a prime attribute).',
      tags: ['Normalization', 'DBMS', 'TCS Pattern', 'Candidate Keys'],
      expected_time: 45,
      xp_value: 25,
      options: [
        { option_key: 'A', option_text: 'First Normal Form (1NF)' },
        { option_key: 'B', option_text: 'Third Normal Form (3NF)' },
        { option_key: 'C', option_text: 'Second Normal Form (2NF)' },
        { option_key: 'D', option_text: 'Boyce-Codd Normal Form (BCNF)' }
      ]
    },
    {
      id: 'q-dbms-2',
      question: 'In a relation R(A, B, C, D) with functional dependencies {A -> B, B -> C, C -> D}, what is the highest normal form satisfied by R, given candidate key is {A}?',
      question_type: 'MCQ',
      branch_id: 'branch-it',
      company_id: 'comp-infosys',
      job_role_id: 'role-sde',
      subject_id: 'sub-dbms',
      topic_id: 'top-normalization',
      difficulty: 'Hard',
      correct_answer: 'B',
      explanation: 'Since A is the candidate key and every non-prime attribute depends on the whole key, it is in 2NF. However, B -> C and C -> D are transitive dependencies between non-primes, so it violates 3NF. Thus, the highest normal form is 2NF.',
      tags: ['Normalization', 'Functional Dependencies', 'Infosys Pattern'],
      expected_time: 60,
      xp_value: 35,
      options: [
        { option_key: 'A', option_text: '1NF' },
        { option_key: 'B', option_text: '2NF' },
        { option_key: 'C', option_text: '3NF' },
        { option_key: 'D', option_text: 'BCNF' }
      ]
    },
    {
      id: 'q-dbms-3',
      question: 'Which ACID property guarantees that multiple transactions executing concurrently will leave the database in the same state as if they were executed sequentially?',
      question_type: 'MCQ',
      branch_id: 'branch-it',
      company_id: 'comp-accenture',
      job_role_id: 'role-sde',
      subject_id: 'sub-dbms',
      topic_id: 'top-acid',
      difficulty: 'Easy',
      correct_answer: 'C',
      explanation: 'Isolation ensures that concurrent transactions do not interfere with each other, preventing dirty reads, non-repeatable reads, and phantom reads depending on the isolation level.',
      tags: ['ACID', 'Transactions', 'Accenture Pattern', 'Concurrency'],
      expected_time: 30,
      xp_value: 20,
      options: [
        { option_key: 'A', option_text: 'Atomicity' },
        { option_key: 'B', option_text: 'Consistency' },
        { option_key: 'C', option_text: 'Isolation' },
        { option_key: 'D', option_text: 'Durability' }
      ]
    },
    {
      id: 'q-dbms-4',
      question: 'Given an SQL table `Employees(id, name, department_id, salary)`. Which query accurately retrieves the second highest salary without using LIMIT or TOP?',
      question_type: 'MCQ',
      branch_id: 'branch-it',
      company_id: 'comp-cognizant',
      job_role_id: 'role-sde',
      subject_id: 'sub-dbms',
      topic_id: 'top-sql-queries',
      difficulty: 'Medium',
      correct_answer: 'A',
      explanation: 'SELECT MAX(salary) FROM Employees WHERE salary < (SELECT MAX(salary) FROM Employees) accurately filters out the top salary and selects the maximum from the remaining values.',
      tags: ['SQL', 'Subqueries', 'Cognizant GenC Next', 'High Frequency'],
      expected_time: 60,
      xp_value: 30,
      options: [
        { option_key: 'A', option_text: 'SELECT MAX(salary) FROM Employees WHERE salary < (SELECT MAX(salary) FROM Employees);' },
        { option_key: 'B', option_text: 'SELECT salary FROM Employees ORDER BY salary DESC OFFSET 1;' },
        { option_key: 'C', option_text: 'SELECT MIN(salary) FROM Employees WHERE salary > (SELECT MIN(salary) FROM Employees);' },
        { option_key: 'D', option_text: 'SELECT salary FROM Employees WHERE ROWNUM = 2;' }
      ]
    },

    // DSA - Dynamic Programming / Trees (Amazon / TCS / Microsoft Pattern)
    {
      id: 'q-dsa-1',
      question: 'What is the optimal time and auxiliary space complexity for finding the Longest Common Subsequence (LCS) of two strings of lengths m and n using standard bottom-up Tabulation DP?',
      question_type: 'MCQ',
      branch_id: 'branch-cse',
      company_id: 'comp-amazon',
      job_role_id: 'role-sde',
      subject_id: 'sub-dsa',
      topic_id: 'top-dp',
      difficulty: 'Medium',
      correct_answer: 'C',
      explanation: 'Standard 2D DP matrix requires O(m * n) time to compute subproblems and O(m * n) space. Note that space can be optimized to O(min(m, n)) by keeping only two rows.',
      tags: ['DSA', 'Dynamic Programming', 'Amazon OA', 'Strings'],
      expected_time: 50,
      xp_value: 30,
      options: [
        { option_key: 'A', option_text: 'Time: O(2^(m+n)), Space: O(m+n)' },
        { option_key: 'B', option_text: 'Time: O(m + n), Space: O(1)' },
        { option_key: 'C', option_text: 'Time: O(m * n), Space: O(m * n)' },
        { option_key: 'D', option_text: 'Time: O(n log m), Space: O(log n)' }
      ]
    },
    {
      id: 'q-dsa-2',
      question: 'In an In-Order traversal of a strictly valid Binary Search Tree (BST), the nodes will ALWAYS be visited in which sequence?',
      question_type: 'MCQ',
      branch_id: 'branch-cse',
      company_id: 'comp-tcs',
      job_role_id: 'role-sde',
      subject_id: 'sub-dsa',
      topic_id: 'top-trees',
      difficulty: 'Easy',
      correct_answer: 'A',
      explanation: 'By BST definition: Left Subtree < Root < Right Subtree. In-Order visits Left, Root, then Right, always yielding monotonically ascending (sorted) order.',
      tags: ['BST', 'Trees', 'TCS NQT', 'CS Fundamentals'],
      expected_time: 30,
      xp_value: 20,
      options: [
        { option_key: 'A', option_text: 'Strictly ascending (sorted) order' },
        { option_key: 'B', option_text: 'Strictly descending order' },
        { option_key: 'C', option_text: 'Level by level from root to leaf' },
        { option_key: 'D', option_text: 'Reverse chronological order' }
      ]
    },
    {
      id: 'q-dsa-3',
      question: 'Which cycle detection algorithm detects a cycle in a singly linked list in O(N) time and O(1) auxiliary space without modifying the list structure?',
      question_type: 'MCQ',
      branch_id: 'branch-cse',
      company_id: 'comp-microsoft',
      job_role_id: 'role-sde',
      subject_id: 'sub-dsa',
      topic_id: 'top-linked-lists',
      difficulty: 'Easy',
      correct_answer: 'D',
      explanation: 'Floyd\'s Tortoise and Hare Cycle-Finding Algorithm uses two pointers moving at speeds 1x and 2x. If a cycle exists, fast meets slow in at most one full loop with O(1) space.',
      tags: ['Linked Lists', 'Two Pointers', 'Microsoft OA', 'Pointers'],
      expected_time: 40,
      xp_value: 25,
      options: [
        { option_key: 'A', option_text: 'Dijkstra Shortest Path' },
        { option_key: 'B', option_text: 'Kruskal Algorithm with Disjoint Sets' },
        { option_key: 'C', option_text: 'Kadane Dynamic Subarray Scan' },
        { option_key: 'D', option_text: 'Floyd\'s Cycle Finding (Tortoise and Hare)' }
      ]
    },

    // Operating Systems (Wipro / Capgemini / Google Pattern)
    {
      id: 'q-os-1',
      question: 'Which of the following is NOT one of the four necessary Coffman conditions required for a Deadlock to occur in an operating system?',
      question_type: 'MCQ',
      branch_id: 'branch-cse',
      company_id: 'comp-wipro',
      job_role_id: 'role-sde',
      subject_id: 'sub-os',
      topic_id: 'top-deadlocks',
      difficulty: 'Medium',
      correct_answer: 'B',
      explanation: 'The four Coffman conditions are: 1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, 4. Circular Wait. Preemptive Allocation is a technique to PREVENT deadlocks, not cause them.',
      tags: ['Operating Systems', 'Deadlocks', 'Wipro Elite', 'Coffman'],
      expected_time: 45,
      xp_value: 25,
      options: [
        { option_key: 'A', option_text: 'Mutual Exclusion' },
        { option_key: 'B', option_text: 'Preemptive Resource Allocation' },
        { option_key: 'C', option_text: 'Hold and Wait' },
        { option_key: 'D', option_text: 'Circular Wait' }
      ]
    },
    {
      id: 'q-os-2',
      question: 'When a page fault occurs, what component of the CPU / OS transfers execution to the page fault handler routine?',
      question_type: 'MCQ',
      branch_id: 'branch-cse',
      company_id: 'comp-google',
      job_role_id: 'role-sde',
      subject_id: 'sub-os',
      topic_id: 'top-memory-mgmt',
      difficulty: 'Hard',
      correct_answer: 'A',
      explanation: 'When the MMU (Memory Management Unit) looks up a virtual address and finds the valid bit is 0, it raises a hardware interrupt (page fault exception trap), causing context switch to the OS kernel trap table.',
      tags: ['OS', 'Virtual Memory', 'Google SDE', 'Hardware Interface'],
      expected_time: 60,
      xp_value: 35,
      options: [
        { option_key: 'A', option_text: 'Memory Management Unit (MMU) generates a hardware trap/interrupt' },
        { option_key: 'B', option_text: 'The DMA Controller pauses all bus traffic' },
        { option_key: 'C', option_text: 'The Compiler injects a fallback subroutine' },
        { option_key: 'D', option_text: 'The Application Thread restarts from entry point' }
      ]
    },

    // Computer Networks (Accenture / Capgemini / Deloitte Pattern)
    {
      id: 'q-cn-1',
      question: 'What is the exact sequence of flag packets exchanged during the standard TCP 3-Way Handshake connection establishment?',
      question_type: 'MCQ',
      branch_id: 'branch-it',
      company_id: 'comp-capgemini',
      job_role_id: 'role-sde',
      subject_id: 'sub-cn',
      topic_id: 'top-osi-tcp',
      difficulty: 'Easy',
      correct_answer: 'C',
      explanation: 'The 3-way handshake process is: Client sends [SYN], Server responds with [SYN-ACK], and Client confirms with [ACK]. Connection is then ESTABLISHED.',
      tags: ['Computer Networks', 'TCP Handshake', 'Capgemini Pattern', 'OSI'],
      expected_time: 30,
      xp_value: 20,
      options: [
        { option_key: 'A', option_text: 'ACK -> SYN -> SYN-ACK' },
        { option_key: 'B', option_text: 'FIN -> ACK -> FIN-ACK' },
        { option_key: 'C', option_text: 'SYN -> SYN-ACK -> ACK' },
        { option_key: 'D', option_text: 'RST -> PSH -> SYN' }
      ]
    },

    // OOP (Deloitte / TCS Pattern)
    {
      id: 'q-oop-1',
      question: 'In C++ and Java, which OOP mechanism allows a subclass to provide a specific implementation of a method that is already declared in its superclass, resolved at runtime?',
      question_type: 'MCQ',
      branch_id: 'branch-cse',
      company_id: 'comp-deloitte',
      job_role_id: 'role-sde',
      subject_id: 'sub-oop',
      topic_id: 'top-pillars',
      difficulty: 'Easy',
      correct_answer: 'B',
      explanation: 'Method Overriding (Dynamic Polymorphism) resolved at runtime via Virtual Method Table (vtable), whereas Method Overloading is resolved at compile time (Static Polymorphism).',
      tags: ['OOP', 'Polymorphism', 'Deloitte Tech Round', 'VTable'],
      expected_time: 35,
      xp_value: 20,
      options: [
        { option_key: 'A', option_text: 'Method Overloading (Compile-Time)' },
        { option_key: 'B', option_text: 'Method Overriding (Runtime Dynamic Binding)' },
        { option_key: 'C', option_text: 'Operator Overloading' },
        { option_key: 'D', option_text: 'Encapsulation Wrapping' }
      ]
    },

    // ENTC / ECE - Digital Electronics & Microprocessors
    {
      id: 'q-ece-1',
      question: 'In an 8085 microprocessor, which pin is used to demultiplex the lower order address bus and data bus (AD0 - AD7)?',
      question_type: 'MCQ',
      branch_id: 'branch-ece',
      company_id: 'comp-tcs',
      job_role_id: 'role-embedded',
      subject_id: 'sub-microproc',
      topic_id: 'top-8085',
      difficulty: 'Medium',
      correct_answer: 'C',
      explanation: 'The ALE (Address Latch Enable) signal goes high during the first clock cycle (T1 state) of a machine cycle, indicating that AD0-AD7 lines hold the lower 8 bits of the memory address, which are latched via IC 74LS373.',
      tags: ['8085', 'Microprocessors', 'ECE Core', 'ALE Pin'],
      expected_time: 40,
      xp_value: 25,
      options: [
        { option_key: 'A', option_text: 'READY' },
        { option_key: 'B', option_text: 'HOLD' },
        { option_key: 'C', option_text: 'ALE (Address Latch Enable)' },
        { option_key: 'D', option_text: 'RESET IN' }
      ]
    },
    {
      id: 'q-ece-2',
      question: 'How many select lines are required for a 32-to-1 Multiplexer (MUX)?',
      question_type: 'MCQ',
      branch_id: 'branch-ece',
      company_id: 'comp-infosys',
      job_role_id: 'role-embedded',
      subject_id: 'sub-digital-elec',
      topic_id: 'top-logic-gates',
      difficulty: 'Easy',
      correct_answer: 'B',
      explanation: 'For a 2^n to 1 MUX, n select lines are required. Since 32 = 2^5, exactly 5 select lines are needed.',
      tags: ['Digital Electronics', 'MUX', 'Logic Minimization', 'ECE'],
      expected_time: 25,
      xp_value: 20,
      options: [
        { option_key: 'A', option_text: '4 select lines' },
        { option_key: 'B', option_text: '5 select lines' },
        { option_key: 'C', option_text: '6 select lines' },
        { option_key: 'D', option_text: '8 select lines' }
      ]
    },

    // Mechanical Engineering - Thermodynamics
    {
      id: 'q-me-1',
      question: 'The efficiency of a Carnot heat engine operating between absolute temperatures T_hot and T_cold depends ONLY on:',
      question_type: 'MCQ',
      branch_id: 'branch-me',
      company_id: 'comp-tcs',
      job_role_id: 'role-get',
      subject_id: 'sub-thermo',
      topic_id: 'top-thermo-laws',
      difficulty: 'Easy',
      correct_answer: 'A',
      explanation: 'Carnot efficiency is defined as eta = 1 - (T_cold / T_hot), which depends exclusively on the source and sink temperatures and is independent of the working fluid.',
      tags: ['Thermodynamics', 'Mechanical Core', 'Carnot Cycle', 'Efficiency'],
      expected_time: 30,
      xp_value: 20,
      options: [
        { option_key: 'A', option_text: 'The temperatures of the source and the sink' },
        { option_key: 'B', option_text: 'The specific heat capacity of the working fluid' },
        { option_key: 'C', option_text: 'The volume expansion coefficient of the cylinder' },
        { option_key: 'D', option_text: 'The mass flow rate of fuel' }
      ]
    },

    // Electrical Engineering - Power Systems & Transformers
    {
      id: 'q-ee-1',
      question: 'In an ideal electrical transformer with primary turns N1 and secondary turns N2, what happens to the secondary voltage V2 if N2 is double N1?',
      question_type: 'MCQ',
      branch_id: 'branch-ee',
      company_id: 'comp-tcs',
      job_role_id: 'role-get',
      subject_id: 'sub-power-sys',
      topic_id: 'top-transformers',
      difficulty: 'Easy',
      correct_answer: 'B',
      explanation: 'From the transformer turn ratio V2/V1 = N2/N1, if N2 = 2 * N1, then V2 = 2 * V1 (step-up transformer doubles secondary voltage).',
      tags: ['Transformers', 'Electrical Core', 'Turn Ratio', 'Power Systems'],
      expected_time: 30,
      xp_value: 20,
      options: [
        { option_key: 'A', option_text: 'Secondary voltage is halved' },
        { option_key: 'B', option_text: 'Secondary voltage is doubled' },
        { option_key: 'C', option_text: 'Secondary voltage remains identical' },
        { option_key: 'D', option_text: 'Secondary voltage drops to zero' }
      ]
    },

    // Aptitude - TCS & Wipro Speed Math / Logical
    {
      id: 'q-apt-1',
      question: 'A train 180 meters long is running at a uniform speed of 54 km/hr. How many seconds will it take to pass a stationary telegraph post?',
      question_type: 'MCQ',
      branch_id: 'branch-cse',
      company_id: 'comp-tcs',
      job_role_id: 'role-sde',
      subject_id: 'sub-aptitude',
      topic_id: 'top-quant',
      difficulty: 'Easy',
      correct_answer: 'C',
      explanation: 'Speed in m/s = 54 * (5/18) = 15 m/s. Time to cross post = Distance / Speed = 180 m / 15 m/s = 12 seconds.',
      tags: ['Aptitude', 'Speed Time Distance', 'TCS NQT', 'Wipro NTH'],
      expected_time: 45,
      xp_value: 20,
      options: [
        { option_key: 'A', option_text: '9 seconds' },
        { option_key: 'B', option_text: '10 seconds' },
        { option_key: 'C', option_text: '12 seconds' },
        { option_key: 'D', option_text: '15 seconds' }
      ]
    }
  ];

  // Flatten questions and options
  const questions = [];
  const questionOptions = [];

  for (const q of rawQuestions) {
    const { options, ...qData } = q;
    questions.push(qData);
    for (const opt of options) {
      questionOptions.push({
        id: `opt-${q.id}-${opt.option_key}`,
        question_id: q.id,
        option_key: opt.option_key,
        option_text: opt.option_text,
        is_correct: opt.option_key === q.correct_answer
      });
    }
  }

  // 7. PRE-SEEDED USERS (Password hashed with bcrypt)
  const salt = await bcrypt.genSalt(10);
  const studentPasswordHash = await bcrypt.hash('password123', salt);
  const adminPasswordHash = await bcrypt.hash('admin123', salt);

  const users = [
    {
      id: 'user-student-demo',
      name: 'Aditya Sharma',
      email: 'student@careerprep.ai',
      password_hash: studentPasswordHash,
      role: 'STUDENT',
      branch_id: 'branch-it',
      year: '4th Year',
      graduation_year: 2026,
      preferred_job_role_id: 'role-sde',
      target_companies: ['comp-tcs', 'comp-infosys', 'comp-amazon'],
      skill_level: 'Intermediate',
      areas_of_interest: ['DBMS', 'DSA', 'Operating Systems', 'System Design'],
      total_xp: 420,
      current_level: 3,
      current_streak: 5,
      longest_streak: 9,
      last_active_date: new Date().toISOString().split('T')[0]
    },
    {
      id: 'user-admin-demo',
      name: 'Dr. Ramesh Kulkarni (Placement Dean)',
      email: 'admin@careerprep.ai',
      password_hash: adminPasswordHash,
      role: 'ADMIN',
      branch_id: 'branch-cse',
      year: 'Faculty / Admin',
      graduation_year: 2020,
      preferred_job_role_id: 'role-sde',
      target_companies: ['comp-tcs', 'comp-infosys', 'comp-wipro', 'comp-accenture'],
      skill_level: 'Advanced',
      areas_of_interest: ['Campus Placement Drives', 'Assessment Evaluation', 'Curriculum Mapping'],
      total_xp: 2500,
      current_level: 10,
      current_streak: 30,
      longest_streak: 45,
      last_active_date: new Date().toISOString().split('T')[0]
    }
  ];

  // 8. STUDENT PERFORMANCE TRACKING (Weak & Strong Topics)
  const studentPerformance = [
    {
      id: 'perf-1',
      user_id: 'user-student-demo',
      topic_id: 'top-normalization',
      subject_id: 'sub-dbms',
      attempts_count: 5,
      correct_count: 2,
      accuracy_rate: 40.0,
      weakness_score: 0.75, // High weakness score -> Recommended for Adaptive Quiz!
      last_attempted_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'perf-2',
      user_id: 'user-student-demo',
      topic_id: 'top-trees',
      subject_id: 'sub-dsa',
      attempts_count: 6,
      correct_count: 5,
      accuracy_rate: 83.3,
      weakness_score: 0.18, // Strong topic
      last_attempted_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
    },
    {
      id: 'perf-3',
      user_id: 'user-student-demo',
      topic_id: 'top-deadlocks',
      subject_id: 'sub-os',
      attempts_count: 4,
      correct_count: 2,
      accuracy_rate: 50.0,
      weakness_score: 0.60,
      last_attempted_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
    },
    {
      id: 'perf-4',
      user_id: 'user-student-demo',
      topic_id: 'top-osi-tcp',
      subject_id: 'sub-cn',
      attempts_count: 4,
      correct_count: 4,
      accuracy_rate: 100.0,
      weakness_score: 0.05,
      last_attempted_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString()
    }
  ];

  // 9. ACHIEVEMENTS
  const achievements = [
    { id: 'ach-first-step', title: 'First Flight', description: 'Complete your first practice quiz on CareerPrep AI.', badge_icon: 'Rocket', category: 'PRACTICE', xp_reward: 50, condition_type: 'QUIZ_COUNT', threshold: 1 },
    { id: 'ach-streak-3', title: 'Consistent Flyer', description: 'Maintain an uninterrupted 3-day study streak.', badge_icon: 'Flame', category: 'STREAK', xp_reward: 100, condition_type: 'STREAK', threshold: 3 },
    { id: 'ach-streak-7', title: 'Week Warrior', description: 'Keep a 7-day placement preparation streak alive.', badge_icon: 'Award', category: 'STREAK', xp_reward: 250, condition_type: 'STREAK', threshold: 7 },
    { id: 'ach-dbms-ace', title: 'Normalization Ninja', description: 'Score above 80% accuracy in Database Normalization.', badge_icon: 'Database', category: 'SUBJECT', xp_reward: 150, condition_type: 'TOPIC_ACCURACY', threshold: 80 },
    { id: 'ach-pilot-friend', title: 'PrepPilot Navigator', description: 'Ask PrepPilot 5 technical viva questions using Voice Assistant.', badge_icon: 'Mic', category: 'PREPPILOT', xp_reward: 120, condition_type: 'VOICE_QUERIES', threshold: 5 },
    { id: 'ach-tcs-ready', title: 'TCS NQT Ready', description: 'Complete 3 company pattern quizzes with >= 75% accuracy.', badge_icon: 'Briefcase', category: 'COMPANY', xp_reward: 200, condition_type: 'COMPANY_QUIZZES', threshold: 3 }
  ];

  const userAchievements = [
    { id: 'uach-1', user_id: 'user-student-demo', achievement_id: 'ach-first-step', unlocked_at: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id: 'uach-2', user_id: 'user-student-demo', achievement_id: 'ach-streak-3', unlocked_at: new Date(Date.now() - 86400000).toISOString() }
  ];

  // 10. KNOWLEDGE DOCUMENTS FOR PREPPILOT RAG
  const knowledgeDocuments = [
    {
      id: 'doc-norm-guide',
      title: 'Mastering Database Normalization (1NF, 2NF, 3NF, BCNF) for Placement Interviews',
      branch_id: 'branch-it',
      subject_id: 'sub-dbms',
      company_id: 'comp-tcs',
      category: 'CONCEPT',
      keywords: ['normalization', '1nf', '2nf', '3nf', 'bcnf', 'functional dependencies', 'redundancy', 'transitive', 'candidate key'],
      summary: 'Comprehensive viva guide on eliminating anomalies (insertion, deletion, update) in relational schemas with clear interview examples.',
      content: `
Database Normalization is the systematic technique of organizing data in a relational database to minimize redundancy and eliminate anomalous dependencies (Insertion, Update, and Deletion anomalies).

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
Candidate key vs Super key: A superkey is any set of attributes that uniquely identifies a row; a candidate key is a minimal superkey containing no redundant attributes.
      `
    },
    {
      id: 'doc-acid-transactions',
      title: 'ACID Properties, Isolation Levels and Deadlock Handling in Production DBMS',
      branch_id: 'branch-it',
      subject_id: 'sub-dbms',
      company_id: 'comp-infosys',
      category: 'CONCEPT',
      keywords: ['acid', 'atomicity', 'consistency', 'isolation', 'durability', 'dirty read', 'phantom read', 'serializability', '2pl'],
      summary: 'Interview-ready breakdown of transaction management, isolation anomalies and Two-Phase Locking (2PL).',
      content: `
A database transaction is a logical unit of work that must satisfy ACID properties:
- Atomicity: "All or nothing" execution. Managed via Write-Ahead Logging (WAL) and Undo logs.
- Consistency: The database must transition from one valid state to another, preserving all integrity constraints and foreign keys.
- Isolation: Concurrent transactions must execute without mutual interference.
- Durability: Once a transaction commits, its modifications are permanently recorded even in the event of power outage or system crash (via Redo logs and checkpointing).

SQL Isolation Levels & Prevented Read Phenomena:
1. Read Uncommitted: Suffers from Dirty Reads, Non-Repeatable Reads, Phantom Reads.
2. Read Committed (Postgres default): Prevents Dirty Reads.
3. Repeatable Read (MySQL default): Prevents Dirty Reads and Non-Repeatable Reads.
4. Serializable: Prevents all anomalies including Phantom Reads via strict 2-Phase Locking (2PL) or SSI.
      `
    },
    {
      id: 'doc-tcs-pattern',
      title: 'TCS NQT & Digital Interview Blueprint – Frequently Tested Patterns',
      branch_id: 'branch-cse',
      subject_id: 'sub-dsa',
      company_id: 'comp-tcs',
      category: 'INTERVIEW_PATTERN',
      keywords: ['tcs', 'nqt', 'digital', 'ninja', 'prime', 'pattern', 'coding round', 'technical viva', 'pointers'],
      summary: 'Complete recruitment breakdown for TCS Ninja, Digital and Prime roles, common coding patterns, and HR questions.',
      content: `
TCS Recruitment Structure (NQT Ninja & Digital/Prime):
1. Foundation Section (Cognitive): Numerical Ability (20 Qs), Verbal Ability (25 Qs), Reasoning Ability (20 Qs).
2. Advanced Section: Advanced Quantitative & Reasoning (15 Qs), Hands-on Coding (2 Questions - 1 Easy/Medium, 1 Medium/Hard).

Top Repeated Coding Patterns in TCS:
- String manipulation without built-in library functions (Anagrams, Palindromes, Word Reversals).
- Array rotations, Sliding Window maximum, Subarray with given sum.
- Number theory: GCD/LCM, Prime factor factorization, Matrix spiral printing.

Technical Viva Expectations for TCS:
- Explain your final year project architecture, your specific contribution, and database schema.
- Difference between Process and Thread, Stack vs Heap memory allocation.
- OOP: Difference between Abstract Class and Interface, Virtual Destructors.
- DBMS: Write SQL query for Nth highest salary and explain Inner vs Left Outer Join.
      `
    },
    {
      id: 'doc-os-paging',
      title: 'Operating Systems: Virtual Memory, Paging, Page Fault Handling & Thrashing',
      branch_id: 'branch-cse',
      subject_id: 'sub-os',
      company_id: 'comp-amazon',
      category: 'CONCEPT',
      keywords: ['virtual memory', 'paging', 'tlb', 'page fault', 'thrashing', 'belady anomaly', 'lru', 'os'],
      summary: 'Virtual memory concepts explained with memory management unit (MMU), Translation Lookaside Buffer (TLB), and Belady\'s anomaly.',
      content: `
Virtual Memory maps large virtual address spaces onto smaller physical RAM frames using Paging.
- Logical Address is divided into: Page Number (p) and Offset (d).
- TLB (Translation Lookaside Buffer): High-speed hardware associative cache that stores recently accessed page-to-frame translations to avoid memory access penalties.
- Page Fault: Occurs when a referenced page is not currently resident in physical RAM (valid bit = 0 in Page Table). The CPU triggers a trap to OS kernel.
- Thrashing: Occurs when an OS spends more CPU cycles paging data in and out of swap space than executing productive process instructions. Occurs when sum of working sets exceeds total physical RAM.
- Belady\'s Anomaly: In FIFO page replacement, increasing the number of physical page frames can paradoxically increase the number of page faults. Optimal and LRU page replacement policies never exhibit Belady\'s Anomaly.
      `
    },
    {
      id: 'doc-amazon-principles',
      title: 'Cracking FAANG & Amazon Technical Interviews: DSA & STAR Method',
      branch_id: 'branch-cse',
      subject_id: 'sub-dsa',
      company_id: 'comp-amazon',
      category: 'INTERVIEW_PATTERN',
      keywords: ['amazon', 'faang', 'leadership principles', 'star method', 'dsa', 'system design', 'coding round'],
      summary: 'Preparation guide for Amazon SDE-1: Problem solving on dynamic programming, trees, and behavioral behavioral alignment with Leadership Principles.',
      content: `
Amazon SDE-1 Recruitment Framework:
1. Online Assessment (OA): 2 DSA questions (Graphs/DP/Priority Queues) + Work Style Assessment.
2. Technical Rounds: Live coding on binary search, two pointers, trees, DFS/BFS, topological sort.
3. Leadership Principles Integration: Every Amazon technical interviewer spends 15-20 minutes evaluating 2 Leadership Principles using the STAR method (Situation, Task, Action, Result).
   - "Customer Obsession"
   - "Ownership"
   - "Bias for Action"
   - "Earn Trust"
Always speak your thought process out loud before typing any code. State time and space complexity upfront.
      `
    },
    {
      id: 'doc-ece-embedded',
      title: 'ENTC / ECE Placement Core Guide: 8085 Architecture, Interrupts and Embedded C',
      branch_id: 'branch-ece',
      subject_id: 'sub-microproc',
      company_id: 'comp-tcs',
      category: 'CONCEPT',
      keywords: ['8085', 'microprocessor', 'embedded', 'interrupts', 'trap', 'rst', 'ece', 'entc', 'ale'],
      summary: 'Core technical questions for electronics engineers appearing for embedded hardware and IT technical rounds.',
      content: `
Core ECE Technical Viva Questions:
1. 8085 Microprocessor Highlights:
   - 8-bit data bus, 16-bit address bus (can address up to 64 KB of memory).
   - Clock frequency: typically 3 MHz (internal clock generated by dividing crystal frequency by 2).
   - Flags: Sign (S), Zero (Z), Auxiliary Carry (AC), Parity (P), Carry (CY).

2. 8085 Interrupt Hierarchy (Highest to Lowest Priority):
   - TRAP (Non-Maskable, Vectored at 0024H)
   - RST 7.5 (Maskable, Edge-triggered, Vectored at 003CH)
   - RST 6.5 (Maskable, Level-triggered, Vectored at 0034H)
   - RST 5.5 (Maskable, Level-triggered, Vectored at 002CH)
   - INTR (Maskable, Non-vectored)

3. Difference between Microprocessor and Microcontroller:
   - Microprocessor contains ALU, Registers and Control Unit; external RAM, ROM and I/O ports must be connected.
   - Microcontroller has CPU, RAM, ROM, Timers and I/O ports integrated onto a single monolithic IC (e.g. 8051, ATmega328P, STM32).
      `
    },
    {
      id: 'doc-thermo-me',
      title: 'Mechanical Engineering Core Interview: Laws of Thermodynamics & Heat Transfer',
      branch_id: 'branch-me',
      subject_id: 'sub-thermo',
      company_id: 'comp-tcs',
      category: 'CONCEPT',
      keywords: ['thermodynamics', 'carnot', 'first law', 'second law', 'heat transfer', 'mechanical', 'entropy'],
      summary: 'Mechanical technical interview questions for GET (Graduate Engineer Trainee) drives.',
      content: `
Essential Mechanical Engineering Placement Concepts:
1. Zeroth Law: Establishes thermal equilibrium and temperature measurement.
2. First Law: Conservation of energy (dQ = dU + dW for closed systems).
3. Second Law:
   - Kelvin-Planck statement: Impossible to construct an engine operating in a cycle that absorbs heat from a single reservoir and produces an equivalent amount of work.
   - Clausius statement: Impossible to construct a cyclic device that transfers heat from a lower temperature body to a higher temperature body without external work input.
4. Modes of Heat Transfer:
   - Conduction (Fourier\'s Law: Q = -k * A * dT/dx)
   - Convection (Newton\'s Law of Cooling: Q = h * A * (Ts - Tinf))
   - Radiation (Stefan-Boltzmann Law: E = epsilon * sigma * A * T^4)
      `
    }
  ];

  // Store in database
  db.setStore({
    users,
    branches,
    companies,
    jobRoles,
    subjects,
    topics,
    questions,
    questionOptions,
    attempts: [],
    quizSessions: [],
    quizQuestions: [],
    studentPerformance,
    xpHistory: [
      { id: 'xp-1', user_id: 'user-student-demo', amount: 100, action_type: 'DAILY_STREAK_BONUS', created_at: new Date().toISOString() },
      { id: 'xp-2', user_id: 'user-student-demo', amount: 320, action_type: 'ADAPTIVE_QUIZ_COMPLETED', created_at: new Date().toISOString() }
    ],
    streaks: [
      {
        id: 'streak-1',
        user_id: 'user-student-demo',
        current_streak: 5,
        longest_streak: 9,
        last_activity_date: new Date().toISOString().split('T')[0],
        streak_freeze_count: 2
      }
    ],
    achievements,
    userAchievements,
    knowledgeDocuments
  });

  console.log('[Seed] Database successfully populated with 9 Branches, 10 Companies, 7 Roles, 13 Subjects, 19 Topics, 14 Rich Questions, Demo Users and RAG Knowledge Base!');
};

// If run directly from CLI
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase(true).then(() => {
    console.log('[Seed] Execution finished.');
    process.exit(0);
  });
}
