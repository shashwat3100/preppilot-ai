/**
 * 105+ Unique Data Interpretation Questions with comprehensive calculations and analytical tables.
 */
export const DI_QUESTIONS = [
  {
    id: 'q-di-001',
    question: 'A software firm tracks its department headcounts and female employee percentages:\n- Engineering: 500 employees (30% Female)\n- Product & Design: 120 employees (50% Female)\n- Sales & Operations: 180 employees (40% Female)\nWhat is the total number of female employees in the entire firm?',
    subtopic: 'Tabular Data Analysis',
    difficulty: 'Easy',
    company_id: 'comp-tcs',
    correct_answer: 'B',
    explanation: 'Female count:\n- Engineering: 30% of 500 = 150\n- Product: 50% of 120 = 60\n- Sales: 40% of 180 = 72\nTotal female employees = 150 + 60 + 72 = 282.',
    options: [
      { key: 'A', text: '260', is_correct: false },
      { key: 'B', text: '282', is_correct: true, explanation: 'Total = 0.30*500 + 0.50*120 + 0.40*180 = 150 + 60 + 72 = 282.' },
      { key: 'C', text: '295', is_correct: false },
      { key: 'D', text: '310', is_correct: false }
    ]
  },
  {
    id: 'q-di-002',
    question: 'In a company expense breakdown presented in a pie chart:\n- Cloud Infrastructure: 90°\n- Salaries & Payroll: 144°\n- Marketing: 72°\n- Miscellaneous: 54°\nIf the total annual budget is ₹20 Crore, what is the expenditure on Cloud Infrastructure?',
    subtopic: 'Pie Charts & Degrees',
    difficulty: 'Easy',
    company_id: 'comp-infosys',
    correct_answer: 'C',
    explanation: 'Total degrees in a circle = 360°. Cloud infrastructure represents 90° out of 360°, which is 90 / 360 = 1/4 = 25%. Budget = 25% of ₹20 Crore = ₹5 Crore.',
    options: [
      { key: 'A', text: '₹3.5 Crore', is_correct: false },
      { key: 'B', text: '₹4.2 Crore', is_correct: false },
      { key: 'C', text: '₹5.0 Crore', is_correct: true, explanation: 'Fraction = 90° / 360° = 1/4. Expenditure = 0.25 * 20 Crore = ₹5.0 Crore.' },
      { key: 'D', text: '₹6.5 Crore', is_correct: false }
    ]
  },
  {
    id: 'q-di-003',
    question: 'A bar chart shows annual cloud migration revenue (in $ Millions) across 3 years:\n2022: $40M | 2023: $52M | 2024: $65M\nWhat was the percentage growth in revenue from 2022 to 2024?',
    subtopic: 'Bar Graphs & Trends',
    difficulty: 'Medium',
    company_id: 'comp-accenture',
    correct_answer: 'D',
    explanation: 'Growth = [(Final - Initial) / Initial] * 100 = [(65 - 40) / 40] * 100 = (25 / 40) * 100 = 62.5%.',
    options: [
      { key: 'A', text: '50.0%', is_correct: false },
      { key: 'B', text: '57.5%', is_correct: false },
      { key: 'C', text: '60.0%', is_correct: false },
      { key: 'D', text: '62.5%', is_correct: true, explanation: 'Percentage increase = ((65 - 40) / 40) * 100 = 25/40 * 100 = 62.5%.' }
    ]
  },
  {
    id: 'q-di-004',
    question: 'A line graph records the average daily web server latency (in milliseconds) over 4 quarters:\nQ1: 180 ms | Q2: 150 ms | Q3: 120 ms | Q4: 90 ms\nWhat was the average reduction in latency per quarter from Q1 to Q4?',
    subtopic: 'Line Graphs & Telemetry',
    difficulty: 'Easy',
    company_id: 'comp-wipro',
    correct_answer: 'A',
    explanation: 'Total reduction = 180 - 90 = 90 ms over 3 quarterly transitions (Q1 to Q2, Q2 to Q3, Q3 to Q4). Average reduction per quarterly interval = 90 / 3 = 30 ms.',
    options: [
      { key: 'A', text: '30 ms per quarter', is_correct: true, explanation: 'Latency reduced steadily from 180 to 90 ms (delta = 90 ms over 3 quarterly steps = 30 ms/quarter).' },
      { key: 'B', text: '22.5 ms per quarter', is_correct: false },
      { key: 'C', text: '45 ms per quarter', is_correct: false },
      { key: 'D', text: '50 ms per quarter', is_correct: false }
    ]
  }
];

const DI_TEMPLATES = [
  {
    sub: 'Tabular Data Analysis',
    gen: (i) => {
      const b1 = 80 + (i * 5);
      const b2 = 90 + (i * 6);
      const b3 = 70 + (i * 4);
      const total = b1 + b2 + b3;
      const passRate = 80;
      const passed = Math.round((total * passRate) / 100);
      return {
        question: `A campus recruitment drive evaluates three colleges:\n- College Alpha: ${b1} candidates\n- College Beta: ${b2} candidates\n- College Gamma: ${b3} candidates\nIf the collective placement conversion rate is ${passRate}%, exactly how many candidates were hired?`,
        explanation: `Total candidates = ${b1} + ${b2} + ${b3} = ${total}. Placed candidates = ${passRate}% of ${total} = (${passRate} * ${total}) / 100 = ${passed}.`,
        options: [
          { key: 'A', text: `${passed} candidates`, is_correct: true, explanation: `Total candidates = ${total}. Hired = 0.${passRate} * ${total} = ${passed}.` },
          { key: 'B', text: `${passed + 12} candidates`, is_correct: false },
          { key: 'C', text: `${passed - 9} candidates`, is_correct: false },
          { key: 'D', text: `${passed + 24} candidates`, is_correct: false }
        ],
        ans: 'A'
      };
    }
  },
  {
    sub: 'Pie Charts & Degrees',
    gen: (i) => {
      const budget = 40 + (i * 10);
      const degrees = 72; // exactly 20%
      const amount = (budget * degrees) / 360;
      return {
        question: `A technology enterprise budgets ₹${budget} Crore annually. In the departmental pie chart, the Information Security division spans an angle of ${degrees}°. What is its allocated budget?`,
        explanation: `Percentage share = ${degrees}° / 360° = 1/5 = 20%. Budget = 20% of ₹${budget} Crore = ₹${amount.toFixed(1)} Crore.`,
        options: [
          { key: 'A', text: `₹${(amount + 2).toFixed(1)} Crore`, is_correct: false },
          { key: 'B', text: `₹${amount.toFixed(1)} Crore`, is_correct: true, explanation: `(${degrees} / 360) * ${budget} = (1/5) * ${budget} = ₹${amount.toFixed(1)} Crore.` },
          { key: 'C', text: `₹${(amount - 1.5).toFixed(1)} Crore`, is_correct: false },
          { key: 'D', text: `₹${(amount * 1.5).toFixed(1)} Crore`, is_correct: false }
        ],
        ans: 'B'
      };
    }
  },
  {
    sub: 'Bar Graphs & Trends',
    gen: (i) => {
      const v1 = 200 + (i * 20);
      const inc = 25;
      const v2 = Math.round(v1 * (1 + inc / 100));
      return {
        question: `A bar chart plots active microservices deployed in Production:\nYear 1: ${v1} services\nYear 2: ${v2} services\nWhat is the annual growth percentage of the microservices infrastructure?`,
        explanation: `Growth % = [(${v2} - ${v1}) / ${v1}] * 100 = [${v2 - v1} / ${v1}] * 100 = ${inc}%.`,
        options: [
          { key: 'A', text: `${inc}%`, is_correct: true, explanation: `Growth = ((${v2} - ${v1}) / ${v1}) * 100 = ${inc}%.` },
          { key: 'B', text: `${inc + 5}%`, is_correct: false },
          { key: 'C', text: `${inc - 4}%`, is_correct: false },
          { key: 'D', text: `${inc + 10}%`, is_correct: false }
        ],
        ans: 'A'
      };
    }
  },
  {
    sub: 'Caselets & Ratio Analysis',
    gen: (i) => {
      const m = 300 + (i * 25);
      const w = 200 + (i * 15);
      const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
      const g = gcd(m, w);
      const rM = m / g;
      const rW = w / g;
      return {
        question: `In a campus hackathon, ${m} male students and ${w} female students qualified for the final round. In simplest form, what is the ratio of male to female qualifiers?`,
        explanation: `Ratio = ${m} : ${w}. Dividing by greatest common divisor (${g}) yields ${rM} : ${rW}.`,
        options: [
          { key: 'A', text: `${rM + 1} : ${rW}`, is_correct: false },
          { key: 'B', text: `${rM} : ${rW}`, is_correct: true, explanation: `${m}/${w} simplified by dividing both by ${g} = ${rM} : ${rW}.` },
          { key: 'C', text: `${rW} : ${rM}`, is_correct: false },
          { key: 'D', text: `${rM} : ${rW + 2}`, is_correct: false }
        ],
        ans: 'B'
      };
    }
  }
];

export function generateFullDIBank() {
  const bank = [...DI_QUESTIONS];
  let seq = bank.length + 1;
  const companies = ['comp-tcs', 'comp-infosys', 'comp-accenture', 'comp-wipro', 'comp-cognizant'];
  const diffs = ['Easy', 'Medium', 'Hard'];

  let tIdx = 0;
  while (bank.length < 108) {
    const t = DI_TEMPLATES[tIdx % DI_TEMPLATES.length];
    const generated = t.gen(seq);
    const id = `q-di-${String(seq).padStart(3, '0')}`;
    const diff = diffs[seq % diffs.length];
    const comp = companies[seq % companies.length];

    bank.push({
      id,
      question: generated.question,
      subtopic: t.sub,
      difficulty: diff,
      company_id: comp,
      correct_answer: generated.ans,
      explanation: generated.explanation,
      options: generated.options
    });

    seq++;
    tIdx++;
  }

  return bank;
}
