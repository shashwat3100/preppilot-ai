import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { initDb, saveDb } from '../src/database/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURES_FILE = path.join(__dirname, '../src/database/static_fixtures.json');

const APTITUDE_TOPICS = [
  {
    id: 'top-quant',
    subject_id: 'sub-aptitude',
    name: 'Quantitative Aptitude',
    description: 'Arithmetic, speed math, time & work, percentages, profit & loss, ratios, numbers, probability, and algebra.',
    importance_weight: 1.0
  },
  {
    id: 'top-logic',
    subject_id: 'sub-aptitude',
    name: 'Logical Reasoning',
    description: 'Number/letter series, syllogisms, blood relations, seating arrangements, coding-decoding, clocks, and direction sense.',
    importance_weight: 1.0
  },
  {
    id: 'top-verbal',
    subject_id: 'sub-aptitude',
    name: 'Verbal Ability',
    description: 'Reading comprehension, error spotting, sentence correction, synonyms, antonyms, cloze test, and para-jumbles.',
    importance_weight: 0.95
  },
  {
    id: 'top-di',
    subject_id: 'sub-aptitude',
    name: 'Data Interpretation',
    description: 'Tabular data, bar graphs, pie charts, line graphs, percentage growth analysis, and business caselets.',
    importance_weight: 0.95
  }
];

// Mapping existing q-tcs-apt questions to their correct topic
const EXISTING_APT_TOPIC_FIXES = {
  'q-tcs-apt-1': 'top-quant',
  'q-tcs-apt-2': 'top-quant',
  'q-tcs-apt-3': 'top-quant',
  'q-tcs-apt-4': 'top-quant',
  'q-tcs-apt-5': 'top-logic',
  'q-tcs-apt-6': 'top-logic',
  'q-tcs-apt-7': 'top-logic',
  'q-tcs-apt-8': 'top-quant',
  'q-tcs-apt-9': 'top-quant',
  'q-tcs-apt-10': 'top-quant',
  'q-tcs-apt-11': 'top-logic',
  'q-tcs-apt-12': 'top-logic',
  'q-tcs-apt-13': 'top-quant',
  'q-tcs-apt-14': 'top-quant',
  'q-tcs-apt-15': 'top-quant',
  'q-tcs-apt-16': 'top-logic',
  'q-tcs-apt-17': 'top-logic',
  'q-tcs-apt-18': 'top-quant',
  'q-tcs-apt-19': 'top-logic',
  'q-tcs-apt-20': 'top-quant'
};

const NEW_APTITUDE_QUESTIONS = [
  // ==================== QUANTITATIVE APTITUDE ====================
  {
    id: 'q-apt-quant-1',
    question: 'A shopkeeper marks his goods 30% above the cost price and allows a discount of 15% on the marked price. What is his overall gain percentage?',
    topic_id: 'top-quant',
    difficulty: 'Medium',
    company_id: 'comp-infosys',
    correct_answer: 'B',
    explanation: 'Let CP = 100. Marked Price (MP) = 130. Discount = 15% of 130 = 19.50. Selling Price (SP) = 130 - 19.50 = 110.50. Profit = SP - CP = 110.50 - 100 = 10.5%. Formula: Net % = M - D - (M * D / 100) = 30 - 15 - 4.5 = 10.5%.',
    tags: ['sub-aptitude', 'Quantitative Aptitude', 'Profit & Loss', 'Infosys'],
    expected_time: 45,
    xp_value: 25,
    options: [
      { key: 'A', text: '9.5%', is_correct: false },
      { key: 'B', text: '10.5%', is_correct: true, explanation: 'Correct! Net profit percentage is 30 - 15 - (30 * 15 / 100) = 10.5%.' },
      { key: 'C', text: '12%', is_correct: false },
      { key: 'D', text: '15%', is_correct: false }
    ]
  },
  {
    id: 'q-apt-quant-2',
    question: 'Two trains of length 140 m and 160 m run on parallel tracks. When running in the same direction, the faster crosses the slower in 30 seconds. When running in opposite directions, they pass each other in 6 seconds. What is the speed of the faster train in km/h?',
    topic_id: 'top-quant',
    difficulty: 'Hard',
    company_id: 'comp-tcs',
    correct_answer: 'C',
    explanation: 'Total distance = 140 + 160 = 300 m. Relative speed same direction (u - v) = 300 / 30 = 10 m/s. Relative speed opposite direction (u + v) = 300 / 6 = 50 m/s. Adding both: 2u = 60 => u = 30 m/s. Convert to km/h: 30 * (18 / 5) = 108 km/h.',
    tags: ['sub-aptitude', 'Quantitative Aptitude', 'Speed Time Distance', 'TCS NQT'],
    expected_time: 60,
    xp_value: 30,
    options: [
      { key: 'A', text: '72 km/h', is_correct: false },
      { key: 'B', text: '90 km/h', is_correct: false },
      { key: 'C', text: '108 km/h', is_correct: true, explanation: 'Correct! u = (50 + 10) / 2 = 30 m/s = 30 * 18/5 = 108 km/h.' },
      { key: 'D', text: '126 km/h', is_correct: false }
    ]
  },
  {
    id: 'q-apt-quant-3',
    question: 'The difference between simple interest and compound interest compounded annually on a certain sum of money for 2 years at 10% per annum is ₹150. What is the principal sum?',
    topic_id: 'top-quant',
    difficulty: 'Medium',
    company_id: 'comp-accenture',
    correct_answer: 'A',
    explanation: 'For 2 years, the difference between CI and SI is given by: D = P * (R / 100)^2. Here D = 150, R = 10%. 150 = P * (10 / 100)^2 = P * (1 / 100). P = 150 * 100 = ₹15,000.',
    tags: ['sub-aptitude', 'Quantitative Aptitude', 'Simple & Compound Interest', 'Accenture'],
    expected_time: 40,
    xp_value: 20,
    options: [
      { key: 'A', text: '₹15,000', is_correct: true, explanation: 'Correct! P = D * (100 / R)^2 = 150 * 100 = ₹15,000.' },
      { key: 'B', text: '₹12,500', is_correct: false },
      { key: 'C', text: '₹18,000', is_correct: false },
      { key: 'D', text: '₹20,000', is_correct: false }
    ]
  },
  {
    id: 'q-apt-quant-4',
    question: 'A vessel contains 60 liters of milk. 12 liters of milk is taken out and replaced with water. This process is repeated one more time. What is the amount of pure milk remaining in the vessel?',
    topic_id: 'top-quant',
    difficulty: 'Medium',
    company_id: 'comp-wipro',
    correct_answer: 'B',
    explanation: 'Quantity of pure liquid remaining = Initial * [1 - (x / V)]^n = 60 * [1 - (12 / 60)]^2 = 60 * (4 / 5)^2 = 60 * (16 / 25) = 38.4 liters.',
    tags: ['sub-aptitude', 'Quantitative Aptitude', 'Mixtures & Alligations', 'Wipro'],
    expected_time: 50,
    xp_value: 25,
    options: [
      { key: 'A', text: '36 liters', is_correct: false },
      { key: 'B', text: '38.4 liters', is_correct: true, explanation: 'Correct! Formula: Q = V * (1 - x/V)^n = 60 * (0.8)^2 = 38.4 liters.' },
      { key: 'C', text: '40.2 liters', is_correct: false },
      { key: 'D', text: '42 liters', is_correct: false }
    ]
  },
  {
    id: 'q-apt-quant-5',
    question: 'In a lottery of 50 tickets numbered 1 to 50, one ticket is drawn at random. What is the probability that the number drawn is a multiple of 3 or 7?',
    topic_id: 'top-quant',
    difficulty: 'Easy',
    company_id: 'comp-cognizant',
    correct_answer: 'D',
    explanation: 'Multiples of 3 between 1 and 50 = floor(50 / 3) = 16. Multiples of 7 = floor(50 / 7) = 7. Multiples of LCM(3, 7) = 21 = floor(50 / 21) = 2. Total favorable = 16 + 7 - 2 = 21. Probability = 21 / 50.',
    tags: ['sub-aptitude', 'Quantitative Aptitude', 'Probability', 'Cognizant'],
    expected_time: 40,
    xp_value: 20,
    options: [
      { key: 'A', text: '19/50', is_correct: false },
      { key: 'B', text: '23/50', is_correct: false },
      { key: 'C', text: '2/5', is_correct: false },
      { key: 'D', text: '21/50', is_correct: true, explanation: 'Correct! n(3 U 7) = n(3) + n(7) - n(21) = 16 + 7 - 2 = 21, so P = 21/50.' }
    ]
  },
  {
    id: 'q-apt-quant-6',
    question: 'If the radius of a circle is increased by 20%, by what percentage does its area increase?',
    topic_id: 'top-quant',
    difficulty: 'Easy',
    company_id: 'comp-tcs',
    correct_answer: 'C',
    explanation: 'Area is proportional to r^2. Using successive percentage formula: Net increase = x + y + (x * y / 100) = 20 + 20 + (20 * 20 / 100) = 44%.',
    tags: ['sub-aptitude', 'Quantitative Aptitude', 'Percentages & Geometry', 'TCS Ninja'],
    expected_time: 30,
    xp_value: 20,
    options: [
      { key: 'A', text: '20%', is_correct: false },
      { key: 'B', text: '40%', is_correct: false },
      { key: 'C', text: '44%', is_correct: true, explanation: 'Correct! (1.20)^2 = 1.44 => 44% increase.' },
      { key: 'D', text: '48%', is_correct: false }
    ]
  },

  // ==================== LOGICAL REASONING ====================
  {
    id: 'q-apt-logic-1',
    question: 'Find the missing number in the sequence: 7, 14, 42, 210, 1470, ?',
    topic_id: 'top-logic',
    difficulty: 'Medium',
    company_id: 'comp-tcs',
    correct_answer: 'B',
    explanation: 'Pattern of multipliers: 7 * 2 = 14; 14 * 3 = 42; 42 * 5 = 210; 210 * 7 = 1470; Multipliers are consecutive prime numbers: 2, 3, 5, 7, 11. Next term = 1470 * 11 = 16170.',
    tags: ['sub-aptitude', 'Logical Reasoning', 'Number Series', 'TCS Prime'],
    expected_time: 45,
    xp_value: 25,
    options: [
      { key: 'A', text: '14700', is_correct: false },
      { key: 'B', text: '16170', is_correct: true, explanation: 'Correct! Multiplied by consecutive primes: x2, x3, x5, x7, x11 => 1470 * 11 = 16170.' },
      { key: 'C', text: '17640', is_correct: false },
      { key: 'D', text: '13230', is_correct: false }
    ]
  },
  {
    id: 'q-apt-logic-2',
    question: 'Statements: 1. All engineers are innovators. 2. Some innovators are leaders. 3. All leaders are visionaries.\nConclusions:\nI. Some engineers are visionaries.\nII. Some visionaries are innovators.',
    topic_id: 'top-logic',
    difficulty: 'Medium',
    company_id: 'comp-infosys',
    correct_answer: 'B',
    explanation: 'From statements 2 and 3: Some innovators are leaders, and all leaders are visionaries. Therefore, the leaders who are innovators must also be visionaries. This directly implies "Some visionaries are innovators" (Conclusion II follows). However, there is no necessary overlap established between engineers and leaders/visionaries, so Conclusion I does not necessarily follow.',
    tags: ['sub-aptitude', 'Logical Reasoning', 'Syllogism', 'Infosys'],
    expected_time: 50,
    xp_value: 25,
    options: [
      { key: 'A', text: 'Only conclusion I follows', is_correct: false },
      { key: 'B', text: 'Only conclusion II follows', is_correct: true, explanation: 'Correct! Since some innovators are leaders and all leaders are visionaries, those innovators are visionaries.' },
      { key: 'C', text: 'Both I and II follow', is_correct: false },
      { key: 'D', text: 'Neither follows', is_correct: false }
    ]
  },
  {
    id: 'q-apt-logic-3',
    question: 'Pointing to a photograph of a woman, Karan said, "Her daughter is the only granddaughter of my mother." How is Karan related to the woman in the photograph (assuming Karan has no siblings)?',
    topic_id: 'top-logic',
    difficulty: 'Easy',
    company_id: 'comp-accenture',
    correct_answer: 'A',
    explanation: 'Karan\'s mother\'s only granddaughter must be Karan\'s own daughter (since Karan has no siblings). The woman\'s daughter is Karan\'s daughter, which means the woman in the photograph is Karan\'s wife. Therefore, Karan is the woman\'s husband.',
    tags: ['sub-aptitude', 'Logical Reasoning', 'Blood Relations', 'Accenture'],
    expected_time: 40,
    xp_value: 20,
    options: [
      { key: 'A', text: 'Husband', is_correct: true, explanation: 'Correct! Mother\'s only granddaughter is Karan\'s daughter; woman is mother of his daughter, hence his wife, making Karan her husband.' },
      { key: 'B', text: 'Brother', is_correct: false },
      { key: 'C', text: 'Father', is_correct: false },
      { key: 'D', text: 'Uncle', is_correct: false }
    ]
  },
  {
    id: 'q-apt-logic-4',
    question: 'A clock shows 8:30. What is the angle between the hour hand and the minute hand?',
    topic_id: 'top-logic',
    difficulty: 'Easy',
    company_id: 'comp-wipro',
    correct_answer: 'C',
    explanation: 'Angle formula: |30*H - (11/2)*M|. For H = 8, M = 30: |30*8 - (11/2)*30| = |240 - 165| = 75 degrees.',
    tags: ['sub-aptitude', 'Logical Reasoning', 'Clocks', 'Wipro'],
    expected_time: 35,
    xp_value: 20,
    options: [
      { key: 'A', text: '60°', is_correct: false },
      { key: 'B', text: '70°', is_correct: false },
      { key: 'C', text: '75°', is_correct: true, explanation: 'Correct! Formula: |30*H - 5.5*M| = |240 - 165| = 75°.' },
      { key: 'D', text: '80°', is_correct: false }
    ]
  },
  {
    id: 'q-apt-logic-5',
    question: 'A person walks 10 km towards North. From there he walks 6 km towards South. Then, he walks 3 km towards East. How far and in which direction is he with reference to his starting point?',
    topic_id: 'top-logic',
    difficulty: 'Medium',
    company_id: 'comp-cognizant',
    correct_answer: 'D',
    explanation: 'Net displacement in North-South = 10 - 6 = 4 km North. Displacement in East-West = 3 km East. Resultant distance = sqrt(4^2 + 3^2) = sqrt(16 + 9) = sqrt(25) = 5 km North-East.',
    tags: ['sub-aptitude', 'Logical Reasoning', 'Direction Sense', 'Cognizant'],
    expected_time: 45,
    xp_value: 20,
    options: [
      { key: 'A', text: '7 km North', is_correct: false },
      { key: 'B', text: '5 km South-East', is_correct: false },
      { key: 'C', text: '4 km North-East', is_correct: false },
      { key: 'D', text: '5 km North-East', is_correct: true, explanation: 'Correct! By Pythagorean theorem: sqrt(4^2 + 3^2) = 5 km North-East.' }
    ]
  },

  // ==================== VERBAL ABILITY ====================
  {
    id: 'q-apt-verbal-1',
    question: 'Identify the sentence with correct subject-verb agreement and grammatical structure:',
    topic_id: 'top-verbal',
    difficulty: 'Easy',
    company_id: 'comp-tcs',
    correct_answer: 'C',
    explanation: 'When subjects are joined by "neither... nor", the verb agrees with the closer subject ("the students", which is plural). Therefore, "were" is correct. "Neither the professor nor the students were able to solve the anomalous bug."',
    tags: ['sub-aptitude', 'Verbal Ability', 'Grammar & Subject-Verb Agreement', 'TCS NQT'],
    expected_time: 35,
    xp_value: 20,
    options: [
      { key: 'A', text: 'Neither the professor nor the students was able to solve the anomalous bug.', is_correct: false },
      { key: 'B', text: 'Either of the two candidates have submitted their credentials.', is_correct: false },
      { key: 'C', text: 'Neither the professor nor the students were able to solve the anomalous bug.', is_correct: true, explanation: 'Correct! When joined by neither... nor, the verb agrees with the subject closest to it ("students" -> were).' },
      { key: 'D', text: 'The group of microservices are causing latency spikes.', is_correct: false }
    ]
  },
  {
    id: 'q-apt-verbal-2',
    question: 'Select the word that is most nearly OPPOSITE in meaning (ANTONYM) to "MITIGATE":',
    topic_id: 'top-verbal',
    difficulty: 'Easy',
    company_id: 'comp-infosys',
    correct_answer: 'B',
    explanation: '"Mitigate" means to make something less severe, harmful, or painful. The antonym is "Exacerbate", which means to make a problem or negative feeling worse.',
    tags: ['sub-aptitude', 'Verbal Ability', 'Vocabulary & Antonyms', 'Infosys'],
    expected_time: 30,
    xp_value: 20,
    options: [
      { key: 'A', text: 'Alleviate', is_correct: false },
      { key: 'B', text: 'Exacerbate', is_correct: true, explanation: 'Correct! Mitigate means to ease or lessen severity; exacerbate means to aggravate or worsen.' },
      { key: 'C', text: 'Ameliorate', is_correct: false },
      { key: 'D', text: 'Palliate', is_correct: false }
    ]
  },
  {
    id: 'q-apt-verbal-3',
    question: 'Rearrange the following sentences to form a coherent, logical paragraph:\n(P) This rapid transition has sparked intense debate over data privacy and digital monopolies.\n(Q) Over the past decade, cloud computing has revolutionized how modern enterprises operate.\n(R) As a result, regulatory frameworks are evolving globally to govern artificial intelligence and data custody.\n(S) By delegating physical infrastructure, corporations achieve agility and global scalability.',
    topic_id: 'top-verbal',
    difficulty: 'Medium',
    company_id: 'comp-accenture',
    correct_answer: 'A',
    explanation: 'Sentence (Q) introduces the main topic (cloud computing over the past decade). Sentence (S) explains the primary mechanism of this change (delegating physical infrastructure for agility). Sentence (P) introduces the consequence/conflict (rapid transition sparking debate over privacy). Sentence (R) provides the final resolution/outcome (as a result, regulatory frameworks evolve). Coherent sequence: Q - S - P - R.',
    tags: ['sub-aptitude', 'Verbal Ability', 'Para Jumbles', 'Accenture'],
    expected_time: 60,
    xp_value: 25,
    options: [
      { key: 'A', text: 'Q - S - P - R', is_correct: true, explanation: 'Correct! Topic intro (Q) -> Elaboration of mechanism (S) -> Rising dilemma (P) -> Regulatory conclusion (R).' },
      { key: 'B', text: 'S - Q - R - P', is_correct: false },
      { key: 'C', text: 'Q - P - S - R', is_correct: false },
      { key: 'D', text: 'P - Q - S - R', is_correct: false }
    ]
  },
  {
    id: 'q-apt-verbal-4',
    question: 'Fill in the blank with the appropriate preposition/idiom: "The senior software architect refused to accede _____ the client’s request for compromising the zero-trust security architecture."',
    topic_id: 'top-verbal',
    difficulty: 'Easy',
    company_id: 'comp-cognizant',
    correct_answer: 'C',
    explanation: 'The verb "accede" takes the fixed preposition "to" (meaning to agree to a demand, request, or treaty).',
    tags: ['sub-aptitude', 'Verbal Ability', 'Prepositions', 'Cognizant'],
    expected_time: 30,
    xp_value: 20,
    options: [
      { key: 'A', text: 'with', is_correct: false },
      { key: 'B', text: 'for', is_correct: false },
      { key: 'C', text: 'to', is_correct: true, explanation: 'Correct! "Accede to" is the correct grammatical collocation.' },
      { key: 'D', text: 'at', is_correct: false }
    ]
  },

  // ==================== DATA INTERPRETATION ====================
  {
    id: 'q-apt-di-1',
    question: 'A college placement report presents the following candidate statistics across three branches:\n- CSE: 240 eligible, 204 placed\n- IT: 180 eligible, 144 placed\n- ECE: 150 eligible, 105 placed\nWhat is the overall average placement percentage across all three branches combined?',
    topic_id: 'top-di',
    difficulty: 'Medium',
    company_id: 'comp-tcs',
    correct_answer: 'B',
    explanation: 'Total eligible students = 240 + 180 + 150 = 570. Total placed students = 204 + 144 + 105 = 453. Overall placement percentage = (453 / 570) * 100 = 79.47%. Rounding to nearest integer gives ~79.5% (or 79.5%).',
    tags: ['sub-aptitude', 'Data Interpretation', 'Tabular Analysis', 'TCS NQT'],
    expected_time: 50,
    xp_value: 25,
    options: [
      { key: 'A', text: '76.2%', is_correct: false },
      { key: 'B', text: '79.5%', is_correct: true, explanation: 'Correct! Total placed = 453 out of 570 total candidates => (453 / 570) * 100 = 79.47% ~ 79.5%.' },
      { key: 'C', text: '82.0%', is_correct: false },
      { key: 'D', text: '85.1%', is_correct: false }
    ]
  },
  {
    id: 'q-apt-di-2',
    question: 'A tech startup\'s annual R&D budget of ₹50 Crore is distributed in a pie chart as follows:\n- Generative AI & LLMs: 36% (129.6°)\n- Cloud Infrastructure: 28% (100.8°)\n- Cybersecurity & Zero Trust: 20% (72.0°)\n- Mobile & Frontend UI: 16% (57.6°)\nWhat is the difference in budget allocation between Generative AI and Cybersecurity?',
    topic_id: 'top-di',
    difficulty: 'Easy',
    company_id: 'comp-infosys',
    correct_answer: 'D',
    explanation: 'Difference in percentage = 36% - 20% = 16%. Total budget = ₹50 Crore. Difference in rupees = 16% of 50 Crore = 0.16 * 50 = ₹8 Crore.',
    tags: ['sub-aptitude', 'Data Interpretation', 'Pie Chart', 'Infosys'],
    expected_time: 40,
    xp_value: 20,
    options: [
      { key: 'A', text: '₹4 Crore', is_correct: false },
      { key: 'B', text: '₹6 Crore', is_correct: false },
      { key: 'C', text: '₹7.5 Crore', is_correct: false },
      { key: 'D', text: '₹8 Crore', is_correct: true, explanation: 'Correct! (36% - 20%) * 50 Crore = 16% * 50 = ₹8 Crore.' }
    ]
  },
  {
    id: 'q-apt-di-3',
    question: 'A bar chart shows the quarterly revenue of an enterprise SaaS platform (in $ Millions):\nQ1: $12M | Q2: $15M | Q3: $18M | Q4: $22.5M\nWhat is the compound quarterly growth rate (CQGR) or percentage increase from Q1 to Q4?',
    topic_id: 'top-di',
    difficulty: 'Medium',
    company_id: 'comp-accenture',
    correct_answer: 'A',
    explanation: 'Total percentage increase from Q1 to Q4 = [(22.5 - 12) / 12] * 100 = (10.5 / 12) * 100 = 87.5%.',
    tags: ['sub-aptitude', 'Data Interpretation', 'Bar Chart', 'Accenture'],
    expected_time: 45,
    xp_value: 25,
    options: [
      { key: 'A', text: '87.5%', is_correct: true, explanation: 'Correct! [(22.5 - 12) / 12] * 100 = 10.5 / 12 * 100 = 87.5%.' },
      { key: 'B', text: '75.0%', is_correct: false },
      { key: 'C', text: '92.5%', is_correct: false },
      { key: 'D', text: '105.0%', is_correct: false }
    ]
  }
];

export async function runAptitudeSeed() {
  await initDb();
  console.log('[Aptitude Seed] Starting aptitude enrichment...');

  // 1. Ensure topics exist in db
  for (const topic of APTITUDE_TOPICS) {
    const existing = db.get('topics', topic.id);
    if (!existing) {
      db.insert('topics', topic);
      console.log(`[Aptitude Seed] Inserted topic: ${topic.id} - ${topic.name}`);
    } else {
      db.update('topics', topic.id, { ...existing, ...topic });
      console.log(`[Aptitude Seed] Updated topic: ${topic.id} - ${topic.name}`);
    }
  }

  // 2. Fix existing q-tcs-apt questions topic IDs
  for (const [qid, correctTopicId] of Object.entries(EXISTING_APT_TOPIC_FIXES)) {
    const q = db.get('questions', qid);
    if (q) {
      q.topic_id = correctTopicId;
      db.update('questions', qid, q);
    }
  }
  console.log(`[Aptitude Seed] Normalized existing aptitude question topics.`);

  // 3. Insert new questions and their options
  let newQCount = 0;
  for (const qData of NEW_APTITUDE_QUESTIONS) {
    const { options, ...questionFields } = qData;
    const existing = db.get('questions', questionFields.id);
    if (!existing) {
      db.insert('questions', {
        ...questionFields,
        question_type: 'MCQ',
        branch_id: null,
        job_role_id: 'role-sde',
        subject_id: 'sub-aptitude'
      });
      newQCount++;

      // Insert options
      for (const opt of options) {
        db.insert('questionOptions', {
          id: `opt-${questionFields.id}-${opt.key}`,
          question_id: questionFields.id,
          option_key: opt.key,
          option_text: opt.text,
          is_correct: opt.is_correct,
          explanation: opt.explanation || (opt.is_correct ? 'Correct answer.' : 'Incorrect option.')
        });
      }
    }
  }
  console.log(`[Aptitude Seed] Inserted ${newQCount} new aptitude questions with options.`);

  saveDb();

  // 4. Update static_fixtures.json
  if (fs.existsSync(FIXTURES_FILE)) {
    try {
      const raw = fs.readFileSync(FIXTURES_FILE, 'utf-8');
      const fixtures = JSON.parse(raw);

      // Ensure topics
      for (const top of APTITUDE_TOPICS) {
        const idx = (fixtures.topics || []).findIndex(t => t.id === top.id);
        if (idx >= 0) {
          fixtures.topics[idx] = { ...fixtures.topics[idx], ...top };
        } else {
          fixtures.topics.push(top);
        }
      }

      // Fix existing question topics in fixtures
      if (fixtures.questions) {
        for (const q of fixtures.questions) {
          if (EXISTING_APT_TOPIC_FIXES[q.id]) {
            q.topic_id = EXISTING_APT_TOPIC_FIXES[q.id];
          }
        }
      }

      // Add new questions to fixtures if missing
      fixtures.questions = fixtures.questions || [];
      fixtures.questionOptions = fixtures.questionOptions || [];

      for (const qData of NEW_APTITUDE_QUESTIONS) {
        const { options, ...qFields } = qData;
        const exists = fixtures.questions.find(q => q.id === qFields.id);
        if (!exists) {
          fixtures.questions.push({
            ...qFields,
            question_type: 'MCQ',
            branch_id: null,
            job_role_id: 'role-sde',
            subject_id: 'sub-aptitude'
          });
          for (const opt of options) {
            fixtures.questionOptions.push({
              id: `opt-${qFields.id}-${opt.key}`,
              question_id: qFields.id,
              option_key: opt.key,
              option_text: opt.text,
              is_correct: opt.is_correct,
              explanation: opt.explanation || (opt.is_correct ? 'Correct answer.' : 'Incorrect option.')
            });
          }
        }
      }

      fs.writeFileSync(FIXTURES_FILE, JSON.stringify(fixtures, null, 2), 'utf-8');
      console.log('[Aptitude Seed] static_fixtures.json updated successfully.');
    } catch (err) {
      console.error('[Aptitude Seed] Failed to update static_fixtures.json:', err.message);
    }
  }

  console.log('[Aptitude Seed] Completed successfully!');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runAptitudeSeed().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
