import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { initDb, saveDb, CANONICAL_BRANCHES } from '../src/database/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURES_FILE = path.join(__dirname, '../src/database/static_fixtures.json');

// Standard bcrypt hash for password "Password123" with salt rounds = 10
const DEFAULT_PASSWORD_HASH = '$2b$10$HrT5izLhjOv1LR4nw7bAsOQEbopY/viseoDaL1duWUbKUvdmU0agK';

// Authentic Indian First Names (45 Male, 45 Female)
const FIRST_NAMES_MALE = [
  'Aarav', 'Vihaan', 'Aditya', 'Rohan', 'Ishaan', 'Tanmay', 'Ayush', 'Parth',
  'Om', 'Kunal', 'Pranav', 'Nikhil', 'Harshit', 'Yash', 'Atharva', 'Vedant',
  'Shreyas', 'Aniket', 'Tejas', 'Harsh', 'Mayank', 'Saurabh', 'Sahil', 'Varun',
  'Gaurav', 'Abhinav', 'Rishabh', 'Chinmay', 'Sanket', 'Suyash', 'Tushar', 'Alok',
  'Mohit', 'Rohit', 'Vivek', 'Shubham', 'Akshay', 'Chetan', 'Deepak', 'Devendra',
  'Hemant', 'Jayesh', 'Kiran', 'Manish', 'Nilesh'
];

const FIRST_NAMES_FEMALE = [
  'Ananya', 'Sneha', 'Priya', 'Diya', 'Ishita', 'Riya', 'Tanvi', 'Shreya',
  'Pooja', 'Neha', 'Sakshi', 'Aditi', 'Shruti', 'Meera', 'Rashi', 'Rutuja',
  'Vaishnavi', 'Prachi', 'Simran', 'Nikita', 'Komal', 'Payal', 'Mansi', 'Diksha',
  'Kalyani', 'Sanjana', 'Shivani', 'Swati', 'Divya', 'Aishwarya', 'Ashwini',
  'Bhagyashree', 'Chetana', 'Dhanashree', 'Gayatri', 'Harshada', 'Jagruti', 'Madhuri',
  'Pallavi', 'Pranali', 'Radhika', 'Rashmi', 'Samruddhi', 'Sayali', 'Tejaswini'
];

// Authentic Indian Surnames
const LAST_NAMES = [
  'Sharma', 'Deshmukh', 'Patil', 'Kulkarni', 'Joshi', 'Nair', 'Verma', 'Gupta',
  'Iyer', 'Rao', 'Reddy', 'Mehra', 'Choudhary', 'Singh', 'Bhat', 'Sawant',
  'Shinde', 'Jadhav', 'More', 'Wagh', 'Balamwar', 'Gaikwad', 'Pawar', 'Kamble',
  'Kale', 'Kadam', 'Tambe', 'Chavan', 'Salunkhe', 'Mhatre', 'Thakre', 'Gadkari',
  'Agrawal', 'Bansal', 'Mittal', 'Jain', 'Shah', 'Mehta', 'Trivedi', 'Dave',
  'Shukla', 'Tiwari', 'Mishra', 'Pandey', 'Dubey', 'Tripathi', 'Saxena', 'Sinha'
];

// Department profile differentiation (so each branch has realistic, distinctive score & XP distributions)
const BRANCH_PROFILES = {
  'branch-cse': { scoreDelta: +3.2, xpBonus: 180, codingBias: 1.25 },
  'branch-ai': { scoreDelta: +2.6, xpBonus: 150, codingBias: 1.20 },
  'branch-cs-ds': { scoreDelta: +2.0, xpBonus: 130, codingBias: 1.15 },
  'branch-it': { scoreDelta: +1.4, xpBonus: 110, codingBias: 1.10 },
  'branch-csbs': { scoreDelta: +0.8, xpBonus: 90, codingBias: 1.05 },
  'branch-cs-cyber': { scoreDelta: +0.2, xpBonus: 80, codingBias: 1.00 },
  'branch-robotics-ai': { scoreDelta: -0.6, xpBonus: 50, codingBias: 0.95 },
  'branch-iiot': { scoreDelta: -1.2, xpBonus: 30, codingBias: 0.90 },
  'branch-etc': { scoreDelta: -1.9, xpBonus: 10, codingBias: 0.85 },
  'branch-ee': { scoreDelta: -2.6, xpBonus: -20, codingBias: 0.80 },
  'branch-me': { scoreDelta: -3.3, xpBonus: -40, codingBias: 0.75 },
  'branch-ce': { scoreDelta: -4.0, xpBonus: -60, codingBias: 0.70 }
};

const TARGET_COMPANIES_POOL = [
  'comp-tcs', 'comp-infosys', 'comp-wipro', 'comp-accenture',
  'comp-capgemini', 'comp-cognizant', 'comp-deloitte', 'comp-amazon',
  'comp-microsoft', 'comp-google'
];

const CODING_PROBLEMS_POOL = [
  'prob-two-sum', 'prob-valid-parentheses', 'prob-binary-search',
  'prob-max-subarray', 'prob-palindrome-string', 'prob-longest-substring',
  'prob-buy-sell-stock', 'prob-climbing-stairs', 'prob-container-with-most-water'
];

const ASSESSMENT_TYPES = [
  { type: 'core-cs', title: 'Core Engineering Fundamentals Assessment' },
  { type: 'tcs-nqt', title: 'TCS NQT Placement Qualifier Test' },
  { type: 'cognizant-genc', title: 'Cognizant GenC Technical Assessment' },
  { type: 'infosys-sp', title: 'Infosys Specialist Programmer Assessment' },
  { type: 'aptitude-speed', title: 'Quantitative & Logical Aptitude Test' }
];

export const NEW_DISCIPLINE_TOPICS = [
  // Civil Engineering (sub-structural, sub-som)
  { id: 'top-soil-mechanics', subject_id: 'sub-structural', name: 'Soil Mechanics & Foundation Engineering', importance_weight: 0.9 },
  { id: 'top-structural-analysis', subject_id: 'sub-structural', name: 'Structural Analysis & Trusses', importance_weight: 0.95 },
  { id: 'top-bending-torsion', subject_id: 'sub-som', name: 'Bending Moments & Torsional Shear Stress', importance_weight: 0.9 },

  // Mechanical Engineering (sub-thermo, sub-som)
  { id: 'top-fluid-mechanics', subject_id: 'sub-thermo', name: 'Fluid Mechanics & Bernoulli Applications', importance_weight: 0.9 },
  { id: 'top-heat-transfer', subject_id: 'sub-thermo', name: 'Conduction, Convection & Radiation Heat Transfer', importance_weight: 0.9 },

  // Electrical Engineering (sub-power-sys, sub-ctrl-sys)
  { id: 'top-transmission-lines', subject_id: 'sub-power-sys', name: 'Transmission Lines & Power Grid Stability', importance_weight: 0.9 },
  { id: 'top-transfer-functions', subject_id: 'sub-ctrl-sys', name: 'Transfer Functions & Bode Plots', importance_weight: 0.9 },
  { id: 'top-stability-analysis', subject_id: 'sub-ctrl-sys', name: 'State Space & Nyquist Stability', importance_weight: 0.85 },

  // Electronics & Telecom (sub-digital-elec, sub-microproc)
  { id: 'top-sequential-circuits', subject_id: 'sub-digital-elec', name: 'Sequential Circuits, Counters & Registers', importance_weight: 0.9 },
  { id: 'top-embedded-c', subject_id: 'sub-microproc', name: 'Embedded C & Microcontroller Interfacing', importance_weight: 0.9 },

  // Artificial Intelligence (sub-ai-ml)
  { id: 'top-neural-nets', subject_id: 'sub-ai-ml', name: 'Deep Learning & Neural Network Architectures', importance_weight: 1 },
  { id: 'top-supervised-learning', subject_id: 'sub-ai-ml', name: 'Supervised Learning & Model Evaluation', importance_weight: 0.95 },

  // Data Science (sub-data-science)
  { id: 'top-big-data', subject_id: 'sub-data-science', name: 'Feature Engineering & Data Wrangling', importance_weight: 1 },
  { id: 'top-statistical-inference', subject_id: 'sub-data-science', name: 'Statistical Inference & Hypothesis Testing', importance_weight: 0.95 },

  // Cyber Security (sub-cyber-sec)
  { id: 'top-cryptography', subject_id: 'sub-cyber-sec', name: 'Cryptographic Protocols & Public Key Infrastructure', importance_weight: 1 },
  { id: 'top-network-defense', subject_id: 'sub-cyber-sec', name: 'Network Defense, Firewalls & Threat Mitigation', importance_weight: 0.95 },

  // CSBS - TCS (sub-csbs-systems)
  { id: 'top-enterprise-systems', subject_id: 'sub-csbs-systems', name: 'Enterprise Resource Planning & Business Processes', importance_weight: 1 },
  { id: 'top-financial-analytics', subject_id: 'sub-csbs-systems', name: 'Financial Analytics & Corporate IT Systems', importance_weight: 0.9 },

  // Industrial IoT (sub-iiot-sensors)
  { id: 'top-mqtt-edge', subject_id: 'sub-iiot-sensors', name: 'MQTT/CoAP Protocols & Edge Processing', importance_weight: 1 },
  { id: 'top-scada-plc', subject_id: 'sub-iiot-sensors', name: 'SCADA, PLCs & Industrial Automation', importance_weight: 0.95 },

  // Robotics & AI (sub-robotics-ai)
  { id: 'top-robot-kinematics', subject_id: 'sub-robotics-ai', name: 'Kinematics & Trajectory Planning', importance_weight: 1 },
  { id: 'top-ros-slam', subject_id: 'sub-robotics-ai', name: 'Robot Operating System (ROS) & SLAM', importance_weight: 0.95 }
];

export const BRANCH_CURRICULUM_PROFILES = {
  'branch-ce': {
    code: 'CE',
    name: 'Civil Engineering',
    strongTopics: [
      { id: 'top-structural-analysis', sub: 'sub-structural', name: 'Structural Analysis & Trusses', delta: +0.14 },
      { id: 'top-concrete', sub: 'sub-structural', name: 'RCC Beam Design & Concrete Curing', delta: +0.12 },
      { id: 'top-soil-mechanics', sub: 'sub-structural', name: 'Soil Mechanics & Foundation Engineering', delta: +0.10 },
      { id: 'top-stress-strain', sub: 'sub-som', name: 'Stress-Strain Diagrams & Hooke Law', delta: +0.05 },
      { id: 'top-bending-torsion', sub: 'sub-som', name: 'Bending Moments & Torsional Shear Stress', delta: +0.04 }
    ],
    moderateTopics: [
      { id: 'top-quant', sub: 'sub-aptitude', name: 'Quantitative Aptitude', delta: +0.01 },
      { id: 'top-logic', sub: 'sub-aptitude', name: 'Logical Reasoning', delta: +0.02 },
      { id: 'top-verbal', sub: 'sub-aptitude', name: 'Verbal Ability', delta: -0.04 },
      { id: 'top-searching-sorting', sub: 'sub-dsa', name: 'Searching & Sorting', delta: -0.08 }
    ],
    gapTopic: { id: 'top-arrays', sub: 'sub-dsa', name: 'Arrays & Two Pointers', delta: -0.22 }
  },

  'branch-me': {
    code: 'ME',
    name: 'Mechanical Engineering',
    strongTopics: [
      { id: 'top-thermo-laws', sub: 'sub-thermo', name: 'First & Second Laws of Thermodynamics', delta: +0.14 },
      { id: 'top-heat-transfer', sub: 'sub-thermo', name: 'Conduction, Convection & Radiation Heat Transfer', delta: +0.12 },
      { id: 'top-fluid-mechanics', sub: 'sub-thermo', name: 'Fluid Mechanics & Bernoulli Applications', delta: +0.10 },
      { id: 'top-stress-strain', sub: 'sub-som', name: 'Stress-Strain Diagrams & Hooke Law', delta: +0.05 },
      { id: 'top-bending-torsion', sub: 'sub-som', name: 'Bending Moments & Torsional Shear Stress', delta: +0.04 }
    ],
    moderateTopics: [
      { id: 'top-quant', sub: 'sub-aptitude', name: 'Quantitative Aptitude', delta: +0.02 },
      { id: 'top-logic', sub: 'sub-aptitude', name: 'Logical Reasoning', delta: +0.01 },
      { id: 'top-verbal', sub: 'sub-aptitude', name: 'Verbal Ability', delta: -0.04 },
      { id: 'top-arrays', sub: 'sub-dsa', name: 'Arrays & Two Pointers', delta: -0.08 }
    ],
    gapTopic: { id: 'top-searching-sorting', sub: 'sub-dsa', name: 'Searching & Sorting (Binary Search, Merge/Quick Sort)', delta: -0.22 }
  },

  'branch-ee': {
    code: 'EE',
    name: 'Electrical Engineering',
    strongTopics: [
      { id: 'top-transformers', sub: 'sub-power-sys', name: 'Transformers & Induction Motors', delta: +0.14 },
      { id: 'top-transmission-lines', sub: 'sub-power-sys', name: 'Transmission Lines & Power Grid Stability', delta: +0.12 },
      { id: 'top-transfer-functions', sub: 'sub-ctrl-sys', name: 'Transfer Functions & Bode Plots', delta: +0.05 },
      { id: 'top-stability-analysis', sub: 'sub-ctrl-sys', name: 'State Space & Nyquist Stability', delta: +0.04 },
      { id: 'top-logic-gates', sub: 'sub-digital-elec', name: 'Logic Minimization & Flip Flops', delta: +0.03 }
    ],
    moderateTopics: [
      { id: 'top-quant', sub: 'sub-aptitude', name: 'Quantitative Aptitude', delta: +0.02 },
      { id: 'top-logic', sub: 'sub-aptitude', name: 'Logical Reasoning', delta: +0.01 },
      { id: 'top-cpu-sched', sub: 'sub-os', name: 'CPU Scheduling Algorithms', delta: -0.06 }
    ],
    gapTopic: { id: 'top-memory-mgmt', sub: 'sub-os', name: 'Virtual Memory & Paging', delta: -0.22 }
  },

  'branch-etc': {
    code: 'ETC',
    name: 'Electronics & Telecommunication Engineering',
    strongTopics: [
      { id: 'top-logic-gates', sub: 'sub-digital-elec', name: 'Logic Minimization & Flip Flops', delta: +0.14 },
      { id: 'top-sequential-circuits', sub: 'sub-digital-elec', name: 'Sequential Circuits, Counters & Registers', delta: +0.12 },
      { id: 'top-8085', sub: 'sub-microproc', name: '8085 Instruction Set & Architecture', delta: +0.06 },
      { id: 'top-embedded-c', sub: 'sub-microproc', name: 'Embedded C & Microcontroller Interfacing', delta: +0.05 },
      { id: 'top-osi-tcp', sub: 'sub-cn', name: 'OSI vs TCP/IP Protocol Suite', delta: +0.03 }
    ],
    moderateTopics: [
      { id: 'top-routing', sub: 'sub-cn', name: 'IP Addressing & Subnetting', delta: +0.01 },
      { id: 'top-quant', sub: 'sub-aptitude', name: 'Quantitative Aptitude', delta: +0.02 },
      { id: 'top-cpu-sched', sub: 'sub-os', name: 'CPU Scheduling Algorithms', delta: -0.05 }
    ],
    gapTopic: { id: 'top-deadlocks', sub: 'sub-os', name: 'Deadlock Detection & Prevention', delta: -0.22 }
  },

  'branch-cse': {
    code: 'CSE',
    name: 'Computer Science and Engineering (CSE)',
    strongTopics: [
      { id: 'top-sql-queries', sub: 'sub-dbms', name: 'SQL Queries & Joins', delta: +0.14 },
      { id: 'top-normalization', sub: 'sub-dbms', name: 'Normalization (1NF to BCNF)', delta: +0.13 },
      { id: 'top-acid', sub: 'sub-dbms', name: 'Transactions & ACID Properties', delta: +0.11 },
      { id: 'top-pillars', sub: 'sub-oop', name: 'Core Pillars (Polymorphism & Abstraction)', delta: +0.06 },
      { id: 'top-trees', sub: 'sub-dsa', name: 'Binary Trees & BSTs', delta: +0.05 }
    ],
    moderateTopics: [
      { id: 'top-osi-tcp', sub: 'sub-cn', name: 'OSI vs TCP/IP Protocol Suite', delta: +0.03 },
      { id: 'top-cpu-sched', sub: 'sub-os', name: 'CPU Scheduling Algorithms', delta: +0.02 },
      { id: 'top-hashing', sub: 'sub-dsa', name: 'Hashing & Hash Tables', delta: +0.02 },
      { id: 'top-quant', sub: 'sub-aptitude', name: 'Quantitative Aptitude', delta: +0.01 },
      { id: 'top-graphs', sub: 'sub-dsa', name: 'Graphs & BFS/DFS', delta: -0.06 }
    ],
    gapTopic: { id: 'top-dp', sub: 'sub-dsa', name: 'Dynamic Programming', delta: -0.22 }
  },

  'branch-it': {
    code: 'IT',
    name: 'Information Technology',
    strongTopics: [
      { id: 'top-osi-tcp', sub: 'sub-cn', name: 'OSI vs TCP/IP Protocol Suite', delta: +0.14 },
      { id: 'top-routing', sub: 'sub-cn', name: 'IP Addressing & Subnetting', delta: +0.12 },
      { id: 'top-sql-queries', sub: 'sub-dbms', name: 'SQL Queries & Joins', delta: +0.05 },
      { id: 'top-acid', sub: 'sub-dbms', name: 'Transactions & ACID Properties', delta: +0.04 },
      { id: 'top-pillars', sub: 'sub-oop', name: 'Core Pillars (Polymorphism & Abstraction)', delta: +0.03 }
    ],
    moderateTopics: [
      { id: 'top-arrays', sub: 'sub-dsa', name: 'Arrays & Two Pointers', delta: +0.02 },
      { id: 'top-hashing', sub: 'sub-dsa', name: 'Hashing & Hash Tables', delta: +0.02 },
      { id: 'top-quant', sub: 'sub-aptitude', name: 'Quantitative Aptitude', delta: +0.01 },
      { id: 'top-searching-sorting', sub: 'sub-dsa', name: 'Searching & Sorting', delta: -0.05 }
    ],
    gapTopic: { id: 'top-sliding-window', sub: 'sub-dsa', name: 'Sliding Window & Subarray Algorithms', delta: -0.22 }
  },

  'branch-ai': {
    code: 'AI',
    name: 'Artificial Intelligence (AI)',
    strongTopics: [
      { id: 'top-neural-nets', sub: 'sub-ai-ml', name: 'Deep Learning & Neural Network Architectures', delta: +0.14 },
      { id: 'top-supervised-learning', sub: 'sub-ai-ml', name: 'Supervised Learning & Model Evaluation', delta: +0.12 },
      { id: 'top-trees', sub: 'sub-dsa', name: 'Binary Trees & BSTs', delta: +0.05 },
      { id: 'top-heaps-priority', sub: 'sub-dsa', name: 'Heaps & Priority Queues', delta: +0.04 },
      { id: 'top-logic', sub: 'sub-aptitude', name: 'Logical Reasoning', delta: +0.03 }
    ],
    moderateTopics: [
      { id: 'top-sql-queries', sub: 'sub-dbms', name: 'SQL Queries & Joins', delta: +0.02 },
      { id: 'top-di', sub: 'sub-aptitude', name: 'Data Interpretation', delta: +0.03 },
      { id: 'top-arrays', sub: 'sub-dsa', name: 'Arrays & Two Pointers', delta: +0.01 },
      { id: 'top-recursion-backtrack', sub: 'sub-dsa', name: 'Recursion, Backtracking & Subsets', delta: -0.05 }
    ],
    gapTopic: { id: 'top-asymptotic', sub: 'sub-dsa', name: 'Asymptotic Analysis & Recurrences', delta: -0.22 }
  },

  'branch-cs-ds': {
    code: 'CSE-DS',
    name: 'Computer Science & Engineering (Data Science)',
    strongTopics: [
      { id: 'top-big-data', sub: 'sub-data-science', name: 'Feature Engineering & Data Wrangling', delta: +0.14 },
      { id: 'top-statistical-inference', sub: 'sub-data-science', name: 'Statistical Inference & Hypothesis Testing', delta: +0.12 },
      { id: 'top-di', sub: 'sub-aptitude', name: 'Data Interpretation', delta: +0.06 },
      { id: 'top-sql-queries', sub: 'sub-dbms', name: 'SQL Queries & Joins', delta: +0.05 },
      { id: 'top-hashing', sub: 'sub-dsa', name: 'Hashing & Hash Tables', delta: +0.04 }
    ],
    moderateTopics: [
      { id: 'top-quant', sub: 'sub-aptitude', name: 'Quantitative Aptitude', delta: +0.03 },
      { id: 'top-arrays', sub: 'sub-dsa', name: 'Arrays & Two Pointers', delta: +0.01 },
      { id: 'top-acid', sub: 'sub-dbms', name: 'Transactions & ACID Properties', delta: +0.02 },
      { id: 'top-strings', sub: 'sub-dsa', name: 'Strings & Two-Pointers', delta: -0.05 }
    ],
    gapTopic: { id: 'top-indexing', sub: 'sub-dbms', name: 'B-Trees & Database Indexing', delta: -0.22 }
  },

  'branch-cs-cyber': {
    code: 'CSE-CY',
    name: 'Computer Science & Engineering (Cyber Security)',
    strongTopics: [
      { id: 'top-cryptography', sub: 'sub-cyber-sec', name: 'Cryptographic Protocols & Public Key Infrastructure', delta: +0.14 },
      { id: 'top-network-defense', sub: 'sub-cyber-sec', name: 'Network Defense, Firewalls & Threat Mitigation', delta: +0.12 },
      { id: 'top-osi-tcp', sub: 'sub-cn', name: 'OSI vs TCP/IP Protocol Suite', delta: +0.06 },
      { id: 'top-routing', sub: 'sub-cn', name: 'IP Addressing & Subnetting', delta: +0.05 },
      { id: 'top-bit-manipulation', sub: 'sub-dsa', name: 'Bit Manipulation & Bitwise Algorithms', delta: +0.03 }
    ],
    moderateTopics: [
      { id: 'top-cpu-sched', sub: 'sub-os', name: 'CPU Scheduling Algorithms', delta: +0.01 },
      { id: 'top-sql-queries', sub: 'sub-dbms', name: 'SQL Queries & Joins', delta: +0.02 },
      { id: 'top-quant', sub: 'sub-aptitude', name: 'Quantitative Aptitude', delta: +0.01 },
      { id: 'top-deadlocks', sub: 'sub-os', name: 'Deadlock Detection & Prevention', delta: -0.06 }
    ],
    gapTopic: { id: 'top-graphs', sub: 'sub-dsa', name: 'Graphs & BFS/DFS', delta: -0.22 }
  },

  'branch-csbs': {
    code: 'CSBS',
    name: 'Computer Science and Business Systems (in partnership with TCS)',
    strongTopics: [
      { id: 'top-enterprise-systems', sub: 'sub-csbs-systems', name: 'Enterprise Resource Planning & Business Processes', delta: +0.14 },
      { id: 'top-financial-analytics', sub: 'sub-csbs-systems', name: 'Financial Analytics & Corporate IT Systems', delta: +0.12 },
      { id: 'top-design-pat', sub: 'sub-oop', name: 'Creational & Structural Patterns', delta: +0.05 },
      { id: 'top-pillars', sub: 'sub-oop', name: 'Core Pillars (Polymorphism & Abstraction)', delta: +0.04 },
      { id: 'top-di', sub: 'sub-aptitude', name: 'Data Interpretation', delta: +0.04 }
    ],
    moderateTopics: [
      { id: 'top-sql-queries', sub: 'sub-dbms', name: 'SQL Queries & Joins', delta: +0.03 },
      { id: 'top-quant', sub: 'sub-aptitude', name: 'Quantitative Aptitude', delta: +0.02 },
      { id: 'top-logic', sub: 'sub-aptitude', name: 'Logical Reasoning', delta: +0.02 },
      { id: 'top-verbal', sub: 'sub-aptitude', name: 'Verbal Ability', delta: -0.05 }
    ],
    gapTopic: { id: 'top-heaps-priority', sub: 'sub-dsa', name: 'Heaps, Priority Queues & Top-K Elements', delta: -0.22 }
  },

  'branch-iiot': {
    code: 'IIOT',
    name: 'Industrial IoT',
    strongTopics: [
      { id: 'top-mqtt-edge', sub: 'sub-iiot-sensors', name: 'MQTT/CoAP Protocols & Edge Processing', delta: +0.14 },
      { id: 'top-scada-plc', sub: 'sub-iiot-sensors', name: 'SCADA, PLCs & Industrial Automation', delta: +0.12 },
      { id: 'top-embedded-c', sub: 'sub-microproc', name: 'Embedded C & Microcontroller Interfacing', delta: +0.06 },
      { id: 'top-8085', sub: 'sub-microproc', name: '8085 Instruction Set & Architecture', delta: +0.05 },
      { id: 'top-logic-gates', sub: 'sub-digital-elec', name: 'Logic Minimization & Flip Flops', delta: +0.03 }
    ],
    moderateTopics: [
      { id: 'top-osi-tcp', sub: 'sub-cn', name: 'OSI vs TCP/IP Protocol Suite', delta: +0.02 },
      { id: 'top-quant', sub: 'sub-aptitude', name: 'Quantitative Aptitude', delta: +0.01 },
      { id: 'top-arrays', sub: 'sub-dsa', name: 'Arrays & Two Pointers', delta: -0.05 }
    ],
    gapTopic: { id: 'top-routing', sub: 'sub-cn', name: 'IP Addressing & Subnetting', delta: -0.22 }
  },

  'branch-robotics-ai': {
    code: 'ROBOTICS-AI',
    name: 'Robotics and Artificial Intelligence',
    strongTopics: [
      { id: 'top-robot-kinematics', sub: 'sub-robotics-ai', name: 'Kinematics & Trajectory Planning', delta: +0.14 },
      { id: 'top-ros-slam', sub: 'sub-robotics-ai', name: 'Robot Operating System (ROS) & SLAM', delta: +0.12 },
      { id: 'top-transfer-functions', sub: 'sub-ctrl-sys', name: 'Transfer Functions & Bode Plots', delta: +0.05 },
      { id: 'top-neural-nets', sub: 'sub-ai-ml', name: 'Deep Learning & Neural Network Architectures', delta: +0.04 },
      { id: 'top-trees', sub: 'sub-dsa', name: 'Binary Trees & BSTs', delta: +0.03 }
    ],
    moderateTopics: [
      { id: 'top-quant', sub: 'sub-aptitude', name: 'Quantitative Aptitude', delta: +0.02 },
      { id: 'top-logic', sub: 'sub-aptitude', name: 'Logical Reasoning', delta: +0.02 },
      { id: 'top-arrays', sub: 'sub-dsa', name: 'Arrays & Two Pointers', delta: +0.01 },
      { id: 'top-searching-sorting', sub: 'sub-dsa', name: 'Searching & Sorting', delta: -0.05 }
    ],
    gapTopic: { id: 'top-recursion-backtrack', sub: 'sub-dsa', name: 'Recursion, Backtracking & Subsets', delta: -0.22 }
  }
};

export async function seedAllDepartmentStudents() {
  await initDb();
  console.log('[Seed Department Students]: Initializing 70 authentic students per branch...');

  // Ensure all discipline curriculum topics are registered in topics table
  const existingTopics = db.getAll('topics') || [];
  const existingTopicIds = new Set(existingTopics.map(t => t.id));
  const mergedTopics = [...existingTopics];
  let topicsAdded = 0;
  for (const newTop of NEW_DISCIPLINE_TOPICS) {
    if (!existingTopicIds.has(newTop.id)) {
      mergedTopics.push(newTop);
      existingTopicIds.add(newTop.id);
      topicsAdded++;
    }
  }
  if (topicsAdded > 0) {
    console.log(`[Seed Department Students]: Adding ${topicsAdded} missing discipline topics to SQLite...`);
    db.replaceAll('topics', mergedTopics);
  }

  // Ensure all 19 discipline subjects from fixtures are loaded into SQLite
  if (fs.existsSync(FIXTURES_FILE)) {
    try {
      const fixtures = JSON.parse(fs.readFileSync(FIXTURES_FILE, 'utf-8'));
      if (Array.isArray(fixtures.subjects)) {
        const currentSubjects = db.getAll('subjects') || [];
        if (currentSubjects.length < fixtures.subjects.length) {
          console.log(`[Seed Department Students]: Syncing all ${fixtures.subjects.length} subjects to SQLite...`);
          db.replaceAll('subjects', fixtures.subjects);
        }
      }
    } catch {}
  }

  const branches = db.getAll('branches');
  console.log(`[Seed Department Students]: Found ${branches.length} active branches in database.`);

  const allQuestions = db.getAll('questions') || [];
  const subjects = db.getAll('subjects') || [];

  const existingUsers = db.getAll('users');
  const reservedEmails = new Set([
    'student@college.edu', 'admin@college.edu', 'dean@college.edu',
    'student@preppilot.ai', 'admin@preppilot.ai'
  ]);

  // Clean out previously seeded cohort students to prevent duplicates
  const usersToKeep = existingUsers.filter(u =>
    reservedEmails.has(u.email) ||
    u.role === 'ADMIN' ||
    u.role === 'DEAN' ||
    u.id === 'user-student-college' ||
    u.id === 'user-student-demo'
  );

  console.log(`[Seed Department Students]: Preserving ${usersToKeep.length} core admin/dean/demo user accounts.`);

  const newUsers = [...usersToKeep];
  const newQuizSessions = [];
  const newAttempts = [];
  const newStudentPerformance = [];
  const newCodingSubmissions = [];
  const newStreaks = [];

  let globalStudentCounter = 0;
  const now = Date.now();

  // Create a pool of 840 unique, non-repeating name pairs
  const uniqueNamePairs = [];
  for (let m = 0; m < FIRST_NAMES_MALE.length; m++) {
    for (let l = 0; l < LAST_NAMES.length; l++) {
      uniqueNamePairs.push({ first: FIRST_NAMES_MALE[m], last: LAST_NAMES[l], isFemale: false });
    }
  }
  for (let f = 0; f < FIRST_NAMES_FEMALE.length; f++) {
    for (let l = 0; l < LAST_NAMES.length; l++) {
      uniqueNamePairs.push({ first: FIRST_NAMES_FEMALE[f], last: LAST_NAMES[l], isFemale: true });
    }
  }

  // Shuffle name pool deterministically
  const selectedNames = [];
  const step = 17;
  for (let i = 0; i < 840; i++) {
    const idx = (i * step) % uniqueNamePairs.length;
    selectedNames.push(uniqueNamePairs[idx]);
  }

  for (let bIdx = 0; bIdx < branches.length; bIdx++) {
    const branch = branches[bIdx];
    const branchCodeSlug = branch.code.toLowerCase().replace(/[^a-z0-9]/g, '');
    const profile = BRANCH_PROFILES[branch.id] || { scoreDelta: 0, xpBonus: 0, codingBias: 1.0 };

    // Applicable subjects for this branch
    const branchSubjects = subjects.filter(s => s.branch_id === branch.id);
    const applicableSubjectIds = branchSubjects.length > 0
      ? branchSubjects.map(s => s.id)
      : ['sub-dsa', 'sub-dbms', 'sub-os', 'sub-aptitude'];

    const branchQuestions = allQuestions.filter(q =>
      applicableSubjectIds.includes(q.subject_id) || q.subject_id === 'sub-aptitude'
    );
    const questionsPool = branchQuestions.length >= 20 ? branchQuestions : allQuestions;

    for (let i = 1; i <= 70; i++) {
      const nameObj = selectedNames[globalStudentCounter];
      globalStudentCounter++;

      const fullName = `${nameObj.first} ${nameObj.last}`;
      const email = `${nameObj.first.toLowerCase()}.${nameObj.last.toLowerCase()}.${branchCodeSlug}${i}@college.edu`;
      const userId = `std-${branchCodeSlug}-${String(i).padStart(3, '0')}`;

      // Calculate distinct individual score, XP, streak, and tier per student
      let tier = 'AVERAGE';
      let skillLevel = 'Intermediate';
      let accuracyBase = 0.70;
      let xp = 1100;
      let streak = 4;
      let completedTestsCount = 2;
      let codingAttemptsCount = 2;

      if (i <= 10) {
        // TOP PERFORMERS (1..10 per branch)
        // Differentiated scores between 86% and 98%
        tier = 'TOP';
        skillLevel = 'Advanced';
        const rawScore = 97.5 - ((i - 1) * 1.25) + profile.scoreDelta + (((i * 17 + bIdx) % 7) * 0.35 - 1.0);
        accuracyBase = Math.max(0.85, Math.min(0.99, rawScore / 100));
        xp = Math.round(2600 - ((i - 1) * 60) + profile.xpBonus + ((i * 23 + bIdx * 11) % 45));
        streak = 10 + ((i * 3 + bIdx * 2) % 15); // 10 to 24 days streak
        completedTestsCount = (i <= 4) ? 4 : 3;
        codingAttemptsCount = (i <= 5) ? 4 : 3;
      } else if (i >= 50) {
        // DEVELOPING STUDENTS (50..70 per branch)
        // Differentiated scores between 35% and 58%
        tier = 'DEVELOPING';
        skillLevel = 'Beginner';
        const rawScore = 57.5 - ((i - 50) * 1.05) + profile.scoreDelta + (((i * 29 + bIdx) % 9) * 0.4 - 1.6);
        accuracyBase = Math.max(0.35, Math.min(0.58, rawScore / 100));
        xp = Math.round(780 - ((i - 50) * 23) + ((i * 7 + bIdx) % 25));
        streak = (i % 3 === 0) ? 1 : 0;
        completedTestsCount = 1;
        codingAttemptsCount = (i % 2 === 0) ? 1 : 0;
      } else {
        // AVERAGE CORE STUDENTS (11..49 per branch)
        // Differentiated scores between 60% and 84%
        tier = 'AVERAGE';
        skillLevel = 'Intermediate';
        const rawScore = 83.0 - ((i - 11) * 0.58) + profile.scoreDelta + (((i * 19 + bIdx) % 11) * 0.45 - 2.2);
        accuracyBase = Math.max(0.60, Math.min(0.84, rawScore / 100));
        xp = Math.round(1850 - ((i - 11) * 27) + profile.xpBonus + ((i * 13 + bIdx * 5) % 35));
        streak = 2 + ((i + bIdx) % 6);
        completedTestsCount = (i % 4 === 0) ? 3 : 2;
        codingAttemptsCount = 1 + ((i + bIdx) % 3);
      }

      // Last active date
      const daysAgo = (i % 7 === 0) ? 8 + ((i + bIdx) % 6) : 1 + ((i + bIdx) % 5);
      const lastActiveDate = new Date(now - daysAgo * 24 * 3600 * 1000).toISOString().split('T')[0];

      // Target companies (3 companies per student)
      const targetComps = [
        TARGET_COMPANIES_POOL[(i + bIdx) % TARGET_COMPANIES_POOL.length],
        TARGET_COMPANIES_POOL[(i + bIdx + 3) % TARGET_COMPANIES_POOL.length],
        TARGET_COMPANIES_POOL[(i + bIdx + 6) % TARGET_COMPANIES_POOL.length]
      ];

      const userRecord = {
        id: userId,
        name: fullName,
        email: email,
        password_hash: DEFAULT_PASSWORD_HASH,
        role: 'STUDENT',
        branch_id: branch.id,
        branch_name: branch.name,
        branch_code: branch.code,
        year: i % 3 === 0 ? '3rd Year' : '4th Year',
        graduation_year: i % 3 === 0 ? 2027 : 2026,
        preferred_job_role_id: (i % 2 === 0) ? 'role-sde' : 'role-systems',
        target_companies: targetComps,
        skill_level: skillLevel,
        areas_of_interest: ['DBMS', 'DSA', 'Operating Systems', 'Aptitude'],
        total_xp: xp,
        current_level: Math.max(1, Math.min(10, Math.floor(xp / 350) + 1)),
        current_streak: streak,
        longest_streak: streak + ((i % 5) + 1),
        last_active_date: lastActiveDate,
        is_blocked: false,
        status: 'ACTIVE'
      };
      newUsers.push(userRecord);

      // Streak record
      newStreaks.push({
        id: `streak-${userId}`,
        user_id: userId,
        current_streak: streak,
        longest_streak: streak + ((i % 5) + 1),
        last_activity_date: lastActiveDate,
        streak_freeze_count: 2
      });

      // Generate completed quizSessions for this student with distinct test scores
      for (let sIdx = 1; sIdx <= completedTestsCount; sIdx++) {
        const sessionId = `sess-${userId}-${sIdx}`;
        const totalQ = 20;

        // Individual progression variance across tests (e.g. test 2 may be higher or lower)
        const testProgressionDelta = (sIdx === 1 ? -0.03 : sIdx === 2 ? +0.02 : +0.05);
        const studentTestAccuracy = Math.max(0.30, Math.min(1.0, accuracyBase + testProgressionDelta + (((i * sIdx) % 5) * 0.015 - 0.03)));
        const correctQ = Math.max(4, Math.min(20, Math.round(totalQ * studentTestAccuracy)));
        const scorePercent = Math.round((correctQ / totalQ) * 100);
        const timeTaken = 420 + (sIdx * 110) + ((i * 13 + bIdx * 7) % 280);
        const sessionDate = new Date(now - (daysAgo + sIdx * 2) * 24 * 3600 * 1000).toISOString();

        const testTemplate = ASSESSMENT_TYPES[(sIdx - 1 + bIdx) % ASSESSMENT_TYPES.length];

        newQuizSessions.push({
          id: sessionId,
          user_id: userId,
          mode: 'TIMED_ASSESSMENT',
          assessment_type: testTemplate.type,
          assessment_title: testTemplate.title,
          category: 'Placement Assessment',
          duration_minutes: 25,
          status: 'COMPLETED',
          total_questions: totalQ,
          correct_count: correctQ,
          score: scorePercent,
          xp_earned: Math.round(correctQ * 15 + ((i % 3) * 5)),
          time_taken_seconds: timeTaken,
          created_at: sessionDate,
          completed_at: sessionDate,
          updated_at: sessionDate
        });

        // Generate sample question attempts for this session from diverse topics
        const startIdx = ((i * 7 + sIdx * 11 + bIdx * 13) % Math.max(1, questionsPool.length - 10));
        const sessionQuestions = questionsPool.slice(startIdx, startIdx + 10);
        sessionQuestions.forEach((q, qIndex) => {
          const isCorrect = qIndex < Math.round(10 * (correctQ / totalQ));
          newAttempts.push({
            id: `att-${sessionId}-${qIndex}`,
            user_id: userId,
            question_id: q.id,
            session_id: sessionId,
            chosen_answer: isCorrect ? (q.correct_answer || 'A') : 'B',
            is_correct: isCorrect,
            time_spent: 30 + ((qIndex * 7 + i) % 45),
            created_at: sessionDate
          });
        });
      }

      // Generate StudentPerformance metrics based on department-specific curriculum and genuine discipline focus
      const deptCurriculum = BRANCH_CURRICULUM_PROFILES[branch.id] || {
        strongTopics: [
          { id: 'top-sql-queries', sub: 'sub-dbms', name: 'SQL Queries & Joins', delta: +0.13 },
          { id: 'top-normalization', sub: 'sub-dbms', name: 'Normalization (1NF to BCNF)', delta: +0.12 }
        ],
        moderateTopics: [
          { id: 'top-quant', sub: 'sub-aptitude', name: 'Quantitative Aptitude', delta: +0.02 },
          { id: 'top-logic', sub: 'sub-aptitude', name: 'Logical Reasoning', delta: +0.01 }
        ],
        gapTopic: { id: 'top-dp', sub: 'sub-dsa', name: 'Dynamic Programming', delta: -0.22 }
      };

      // Each student practices:
      // 1. Their department's hallmark discipline strength topics
      // 2. Discipline and aptitude foundational topics
      // 3. Their department's priority focus / learning gap topic
      const studentPracticeTopics = [
        ...deptCurriculum.strongTopics,
        ...deptCurriculum.moderateTopics,
        deptCurriculum.gapTopic
      ];

      studentPracticeTopics.forEach((topic, tIdx) => {
        const topicAttempts = 6 + ((i + tIdx) % 8);
        const topicAccBase = Math.max(0.30, Math.min(0.96, accuracyBase + topic.delta + (((i + tIdx) % 5) * 0.02 - 0.04)));
        const topicCorrect = Math.max(1, Math.min(topicAttempts, Math.round(topicAttempts * topicAccBase)));
        const topicAccuracy = Math.round((topicCorrect / topicAttempts) * 100);

        newStudentPerformance.push({
          id: `perf-${userId}-${topic.id}`,
          user_id: userId,
          topic_id: topic.id,
          subject_id: topic.sub,
          attempts_count: topicAttempts,
          correct_count: topicCorrect,
          accuracy_rate: topicAccuracy,
          weakness_score: parseFloat(((100 - topicAccuracy) / 100).toFixed(2)),
          last_attempted_at: new Date(now - (daysAgo + (tIdx % 3)) * 24 * 3600 * 1000).toISOString()
        });
      });

      // Generate Coding Submissions
      for (let cIdx = 0; cIdx < codingAttemptsCount; cIdx++) {
        const probId = CODING_PROBLEMS_POOL[(i + cIdx + bIdx) % CODING_PROBLEMS_POOL.length];
        const isAccepted = tier === 'TOP'
          ? (cIdx < codingAttemptsCount - (i % 4 === 0 ? 1 : 0))
          : (tier === 'AVERAGE' && cIdx === 0);

        const passed = isAccepted ? 5 : (tier === 'AVERAGE' ? 3 : 1);
        const language = (i + cIdx) % 3 === 0 ? 'python' : ((i + cIdx) % 3 === 1 ? 'cpp' : 'java');

        newCodingSubmissions.push({
          id: `sub-${userId}-${cIdx}`,
          user_id: userId,
          problem_id: probId,
          language: language,
          status: isAccepted ? 'ACCEPTED' : 'WRONG_ANSWER',
          passed_count: passed,
          total_count: 5,
          execution_time: 180 + ((i * 11 + cIdx * 37) % 150),
          submitted_at: new Date(now - (daysAgo + cIdx) * 24 * 3600 * 1000).toISOString()
        });
      }
    }
  }

  console.log(`[Seed Department Students]: Generated ${newUsers.length} total users (${branches.length * 70} students across 12 branches).`);
  console.log(`[Seed Department Students]: Generated ${newQuizSessions.length} completed quiz sessions.`);
  console.log(`[Seed Department Students]: Generated ${newAttempts.length} individual question attempts.`);
  console.log(`[Seed Department Students]: Generated ${newStudentPerformance.length} topic performance records.`);
  console.log(`[Seed Department Students]: Generated ${newCodingSubmissions.length} coding challenge submissions.`);
  console.log(`[Seed Department Students]: Generated ${newStreaks.length} streak records.`);

  // Write to SQLite database
  console.log('[Seed Department Students]: Writing to SQLite database...');
  try {
    db.replaceAll('users', newUsers);
    db.replaceAll('quizSessions', newQuizSessions);
    db.replaceAll('attempts', newAttempts);
    db.replaceAll('studentPerformance', newStudentPerformance);
    db.replaceAll('codingSubmissions', newCodingSubmissions);
    db.replaceAll('streaks', newStreaks);
    console.log('[Seed Department Students]: Database replaceAll successful!');
  } catch (dbErr) {
    console.error('[Seed Department Students]: SQLite insertion error:', dbErr);
  }

  saveDb();

  // Sync static_fixtures.json so that Vercel serverless deployments inherit all 840 students
  if (fs.existsSync(FIXTURES_FILE)) {
    try {
      const fixtures = JSON.parse(fs.readFileSync(FIXTURES_FILE, 'utf-8'));
      fixtures.topics = mergedTopics;
      fixtures.users = newUsers;
      fixtures.quizSessions = newQuizSessions;
      fixtures.attempts = newAttempts;
      fixtures.studentPerformance = newStudentPerformance;
      fixtures.codingSubmissions = newCodingSubmissions;
      fixtures.streaks = newStreaks;
      fs.writeFileSync(FIXTURES_FILE, JSON.stringify(fixtures, null, 2), 'utf-8');
      console.log('[Seed Department Students]: Successfully synced static_fixtures.json for Vercel production deployment!');
    } catch (fixErr) {
      console.warn('[Seed Department Students]: Could not update static_fixtures.json:', fixErr.message);
    }
  }

  console.log('[Seed Department Students]: Seeding complete!');

  // Generate Reference markdown log for Dean / Testing verification
  const summaryMarkdownPath = path.join(__dirname, '../../docs/STUDENT_CREDENTIALS_AND_ANALYTICS.md');
  const sampleLogins = [];

  for (const b of branches) {
    const branchStudents = newUsers
      .filter(u => u.branch_id === b.id && u.role === 'STUDENT' && u.id.startsWith('std-'))
      .sort((a, b) => (b.total_xp || 0) - (a.total_xp || 0));
    const topStudent = branchStudents[0];
    const avgStudent = branchStudents[25];
    const devStudent = branchStudents[60];

    sampleLogins.push({
      branch: b.name,
      code: b.code,
      totalStudents: branchStudents.length,
      topSample: topStudent ? `${topStudent.name} (\`${topStudent.email}\` - ${topStudent.total_xp} XP)` : 'N/A',
      avgSample: avgStudent ? `${avgStudent.name} (\`${avgStudent.email}\` - ${avgStudent.total_xp} XP)` : 'N/A',
      devSample: devStudent ? `${devStudent.name} (\`${devStudent.email}\` - ${devStudent.total_xp} XP)` : 'N/A'
    });
  }

  const tableRows = sampleLogins.map(l =>
    `| **${l.branch}** (${l.code}) | **70** | ${l.topSample} | ${l.avgSample} | ${l.devSample} |`
  ).join('\n');

  const report = `# PrepPilot AI — Department Student Cohorts & Credentials Directory

Total Enrolled Students: **840 Students** (Exactly 70 students across 12 B.Tech Engineering branches)
Universal Portal Login Password: **\`Password123\`**

---

### Department Roster & Sample 1-Click Login Accounts per Branch

| Branch / Department | Total Students | Top Performer Sample (86-98% Score) | Core Average Sample (60-84% Score) | Developing Sample (35-58% Score) |
| :--- | :---: | :--- | :--- | :--- |
${tableRows}

---

### Performance Tiers per Department (70 Students each)
- **Top Performers (10 students per branch)**: 86% - 98% accuracy, 2,100 - 2,750+ XP, 3-4 assessments completed, 3-4 coding problems solved with 100% test pass rate, 10-24 days streak.
- **Average Core Students (39 students per branch)**: 60% - 84% accuracy, 850 - 1,850 XP, 2-3 assessments completed, 1-3 coding problems solved, 2-7 days streak.
- **Developing Students (21 students per branch)**: 35% - 58% accuracy, 250 - 780 XP, 1 assessment completed, beginner coding attempts, 0-2 days streak.

---

### Administrative / Demo Accounts
| Account Type | Email | Password | Role | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Demo Student** | \`student@college.edu\` | \`Password123\` | Standard Student | Candidate Portal, Mock Interviews & Tests |
| **Placement Dean** | \`admin@college.edu\` / \`dean@college.edu\` | \`AdminPass123\` | Placement Dean | Dean Oversight & 12 Department Analytics |
`;

  fs.writeFileSync(summaryMarkdownPath, report, 'utf8');
  console.log(`[Seed Department Students]: Generated credentials guide at: ${summaryMarkdownPath}`);
}

if (process.argv[1] && process.argv[1].endsWith('seedDepartmentStudents.js')) {
  seedAllDepartmentStudents();
}
