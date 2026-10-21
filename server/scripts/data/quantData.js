/**
 * 105+ Unique Quantitative Aptitude Questions with full mathematical derivations and formulas.
 */
export const QUANT_QUESTIONS = [
  // --- Speed, Time, Distance & Trains (1-15) ---
  {
    id: 'q-quant-001',
    question: 'A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long?',
    subtopic: 'Speed, Time & Distance',
    difficulty: 'Easy',
    company_id: 'comp-tcs',
    correct_answer: 'B',
    explanation: 'Speed of the train = Length of train / Time = 240 / 24 = 10 m/s. Total distance to pass platform = Length of train + Length of platform = 240 + 650 = 890 m. Time required = 890 / 10 = 89 seconds.',
    options: [
      { key: 'A', text: '65 seconds', is_correct: false },
      { key: 'B', text: '89 seconds', is_correct: true, explanation: 'Speed = 240/24 = 10 m/s. Total distance = 240 + 650 = 890 m. Time = 890 / 10 = 89 s.' },
      { key: 'C', text: '100 seconds', is_correct: false },
      { key: 'D', text: '115 seconds', is_correct: false }
    ]
  },
  {
    id: 'q-quant-002',
    question: 'A car covers a certain distance at 60 km/h in 8 hours. To cover the same distance in 6 hours, what should be its speed?',
    subtopic: 'Speed, Time & Distance',
    difficulty: 'Easy',
    company_id: 'comp-infosys',
    correct_answer: 'C',
    explanation: 'Distance = Speed * Time = 60 * 8 = 480 km. Required Speed = Distance / New Time = 480 / 6 = 80 km/h.',
    options: [
      { key: 'A', text: '70 km/h', is_correct: false },
      { key: 'B', text: '75 km/h', is_correct: false },
      { key: 'C', text: '80 km/h', is_correct: true, explanation: 'Total distance = 60 * 8 = 480 km. Required speed = 480 / 6 = 80 km/h.' },
      { key: 'D', text: '85 km/h', is_correct: false }
    ]
  },
  {
    id: 'q-quant-003',
    question: 'A man walking at a speed of 10 km/h reaches his office 15 minutes late. If he walks at 12 km/h, he reaches 5 minutes late. What is the distance between his home and office?',
    subtopic: 'Speed, Time & Distance',
    difficulty: 'Medium',
    company_id: 'comp-accenture',
    correct_answer: 'A',
    explanation: 'Difference in time = 15 - 5 = 10 minutes = 10/60 = 1/6 hour. Formula: Distance = (S1 * S2 / |S1 - S2|) * (Δt) = (10 * 12 / 2) * (1/6) = 60 * (1/6) = 10 km.',
    options: [
      { key: 'A', text: '10 km', is_correct: true, explanation: 'Distance = (10 * 12 / (12 - 10)) * (10 / 60) = (120 / 2) * (1/6) = 10 km.' },
      { key: 'B', text: '12 km', is_correct: false },
      { key: 'C', text: '15 km', is_correct: false },
      { key: 'D', text: '8 km', is_correct: false }
    ]
  },
  {
    id: 'q-quant-004',
    question: 'A boat can travel with a speed of 13 km/h in still water. If the speed of the stream is 4 km/h, find the time taken by the boat to go 68 km downstream.',
    subtopic: 'Boats & Streams',
    difficulty: 'Easy',
    company_id: 'comp-wipro',
    correct_answer: 'D',
    explanation: 'Downstream speed = Speed of boat + Speed of stream = 13 + 4 = 17 km/h. Time taken = Distance / Downstream speed = 68 / 17 = 4 hours.',
    options: [
      { key: 'A', text: '2 hours', is_correct: false },
      { key: 'B', text: '3 hours', is_correct: false },
      { key: 'C', text: '5 hours', is_correct: false },
      { key: 'D', text: '4 hours', is_correct: true, explanation: 'Downstream speed = 13 + 4 = 17 km/h. Time = 68 / 17 = 4 hours.' }
    ]
  },
  {
    id: 'q-quant-005',
    question: 'A boat moves downstream at the rate of 1 km in 7.5 minutes and upstream at 5 km/h. What is the speed of the boat in still water?',
    subtopic: 'Boats & Streams',
    difficulty: 'Medium',
    company_id: 'comp-tcs',
    correct_answer: 'C',
    explanation: 'Downstream speed = 1 km / (7.5 / 60 h) = 60 / 7.5 = 8 km/h. Upstream speed = 5 km/h. Speed of boat in still water = (Downstream + Upstream) / 2 = (8 + 5) / 2 = 6.5 km/h.',
    options: [
      { key: 'A', text: '5.5 km/h', is_correct: false },
      { key: 'B', text: '6.0 km/h', is_correct: false },
      { key: 'C', text: '6.5 km/h', is_correct: true, explanation: 'Downstream = 1/(7.5/60) = 8 km/h. Upstream = 5 km/h. Still water speed = (8 + 5)/2 = 6.5 km/h.' },
      { key: 'D', text: '7.0 km/h', is_correct: false }
    ]
  },
  {
    id: 'q-quant-006',
    question: 'Two trains running in opposite directions cross a man standing on the platform in 27 seconds and 17 seconds respectively and they cross each other in 23 seconds. The ratio of their speeds is:',
    subtopic: 'Speed, Time & Distance',
    difficulty: 'Hard',
    company_id: 'comp-cognizant',
    correct_answer: 'B',
    explanation: 'Let speeds be x and y. Lengths are 27x and 17y. When crossing each other: (27x + 17y) / (x + y) = 23 => 27x + 17y = 23x + 23y => 4x = 6y => x/y = 3/2.',
    options: [
      { key: 'A', text: '1 : 3', is_correct: false },
      { key: 'B', text: '3 : 2', is_correct: true, explanation: 'Using alligation: (27 - 23) : (23 - 17) = 4 : 6 = 2 : 3 (inverted) => Speed ratio is 3 : 2.' },
      { key: 'C', text: '3 : 4', is_correct: false },
      { key: 'D', text: '2 : 1', is_correct: false }
    ]
  },
  {
    id: 'q-quant-007',
    question: 'A person crosses a 600 m long street in 5 minutes. What is his speed in km per hour?',
    subtopic: 'Speed, Time & Distance',
    difficulty: 'Easy',
    company_id: 'comp-tcs',
    correct_answer: 'B',
    explanation: 'Speed = Distance / Time = 600 m / (5 * 60 s) = 600 / 300 = 2 m/s. Convert to km/h: 2 * (18 / 5) = 36 / 5 = 7.2 km/h.',
    options: [
      { key: 'A', text: '3.6 km/h', is_correct: false },
      { key: 'B', text: '7.2 km/h', is_correct: true, explanation: 'Speed = 600 / 300 = 2 m/s. In km/h: 2 * 18 / 5 = 7.2 km/h.' },
      { key: 'C', text: '8.4 km/h', is_correct: false },
      { key: 'D', text: '10 km/h', is_correct: false }
    ]
  },
  {
    id: 'q-quant-008',
    question: 'An aeroplane covers a certain distance at a speed of 240 km/h in 5 hours. To cover the same distance in 1 hour and 40 minutes (1 2/3 hours), it must travel at what speed?',
    subtopic: 'Speed, Time & Distance',
    difficulty: 'Medium',
    company_id: 'comp-infosys',
    correct_answer: 'D',
    explanation: 'Distance = 240 * 5 = 1200 km. Time = 1 hour 40 min = 5/3 hours. Speed = 1200 / (5/3) = 1200 * 3 / 5 = 720 km/h.',
    options: [
      { key: 'A', text: '300 km/h', is_correct: false },
      { key: 'B', text: '360 km/h', is_correct: false },
      { key: 'C', text: '600 km/h', is_correct: false },
      { key: 'D', text: '720 km/h', is_correct: true, explanation: 'Distance = 240 * 5 = 1200 km. Time = 5/3 hours. Speed = 1200 / (5/3) = 720 km/h.' }
    ]
  },
  {
    id: 'q-quant-009',
    question: 'If a person walks at 14 km/h instead of 10 km/h, he would have walked 20 km more. The actual distance travelled by him is:',
    subtopic: 'Speed, Time & Distance',
    difficulty: 'Medium',
    company_id: 'comp-accenture',
    correct_answer: 'A',
    explanation: 'Let actual distance be x km. Since time is constant: x / 10 = (x + 20) / 14 => 14x = 10x + 200 => 4x = 200 => x = 50 km.',
    options: [
      { key: 'A', text: '50 km', is_correct: true, explanation: 'Time = d/10 = (d + 20)/14 => 14d - 10d = 200 => 4d = 200 => d = 50 km.' },
      { key: 'B', text: '56 km', is_correct: false },
      { key: 'C', text: '70 km', is_correct: false },
      { key: 'D', text: '80 km', is_correct: false }
    ]
  },
  {
    id: 'q-quant-010',
    question: 'Excluding stoppages, the speed of a bus is 54 km/h and including stoppages, it is 45 km/h. For how many minutes does the bus stop per hour?',
    subtopic: 'Speed, Time & Distance',
    difficulty: 'Medium',
    company_id: 'comp-wipro',
    correct_answer: 'C',
    explanation: 'Due to stoppages, loss in distance per hour = 54 - 45 = 9 km. Time taken to travel 9 km at speed without stoppages = (9 / 54) * 60 minutes = (1/6) * 60 = 10 minutes.',
    options: [
      { key: 'A', text: '8 minutes', is_correct: false },
      { key: 'B', text: '9 minutes', is_correct: false },
      { key: 'C', text: '10 minutes', is_correct: true, explanation: 'Stop time = [(Speed without stop - Speed with stop) / Speed without stop] * 60 = (9/54)*60 = 10 min.' },
      { key: 'D', text: '12 minutes', is_correct: false }
    ]
  },

  // --- Time & Work & Pipes (11-25) ---
  {
    id: 'q-quant-011',
    question: 'A can do a work in 15 days and B in 20 days. If they work on it together for 4 days, then the fraction of the work that is left is:',
    subtopic: 'Time & Work',
    difficulty: 'Easy',
    company_id: 'comp-tcs',
    correct_answer: 'D',
    explanation: 'A\'s 1 day work = 1/15, B\'s 1 day work = 1/20. Together in 1 day = 1/15 + 1/20 = 7/60. In 4 days = 4 * 7/60 = 7/15. Work left = 1 - 7/15 = 8/15.',
    options: [
      { key: 'A', text: '7/15', is_correct: false },
      { key: 'B', text: '1/15', is_correct: false },
      { key: 'C', text: '1/10', is_correct: false },
      { key: 'D', text: '8/15', is_correct: true, explanation: 'In 4 days they do 4*(1/15 + 1/20) = 4*(7/60) = 7/15. Remaining = 1 - 7/15 = 8/15.' }
    ]
  },
  {
    id: 'q-quant-012',
    question: 'A is thrice as good a workman as B and therefore is able to finish a job in 60 days less than B. Working together, they can do it in:',
    subtopic: 'Time & Work',
    difficulty: 'Medium',
    company_id: 'comp-infosys',
    correct_answer: 'B',
    explanation: 'Ratio of times of A and B = 1 : 3. Difference of 2 units corresponds to 60 days => 1 unit = 30 days. So A takes 30 days and B takes 90 days. Together: (30 * 90) / (30 + 90) = 2700 / 120 = 22.5 days.',
    options: [
      { key: 'A', text: '20 days', is_correct: false },
      { key: 'B', text: '22.5 days', is_correct: true, explanation: 'Time ratio = 1:3. 3x - x = 60 => x = 30 days (A), 3x = 90 days (B). Together = (30*90)/(120) = 22.5 days.' },
      { key: 'C', text: '25 days', is_correct: false },
      { key: 'D', text: '30 days', is_correct: false }
    ]
  },
  {
    id: 'q-quant-013',
    question: 'Pipe A can fill a tank in 16 hours and pipe B can empty it in 24 hours. If both pipes are opened together, how much time will it take to fill the tank?',
    subtopic: 'Pipes & Cisterns',
    difficulty: 'Easy',
    company_id: 'comp-accenture',
    correct_answer: 'C',
    explanation: 'Net filling in 1 hour = 1/16 - 1/24 = (3 - 2) / 48 = 1/48. Therefore, the tank will be filled in 48 hours.',
    options: [
      { key: 'A', text: '36 hours', is_correct: false },
      { key: 'B', text: '40 hours', is_correct: false },
      { key: 'C', text: '48 hours', is_correct: true, explanation: 'Net rate = 1/16 - 1/24 = 1/48 tank per hour. Total time = 48 hours.' },
      { key: 'D', text: '54 hours', is_correct: false }
    ]
  },
  {
    id: 'q-quant-014',
    question: 'A tank is filled in 5 hours by three pipes A, B and C. The pipe C is twice as fast as B and B is twice as fast as A. How much time will pipe A alone take to fill the tank?',
    subtopic: 'Pipes & Cisterns',
    difficulty: 'Medium',
    company_id: 'comp-cognizant',
    correct_answer: 'D',
    explanation: 'Let rate of A = x. Then rate of B = 2x, and rate of C = 4x. Total rate = x + 2x + 4x = 7x. Total capacity = 5 * 7x = 35x. Time taken by A alone = 35x / x = 35 hours.',
    options: [
      { key: 'A', text: '20 hours', is_correct: false },
      { key: 'B', text: '25 hours', is_correct: false },
      { key: 'C', text: '30 hours', is_correct: false },
      { key: 'D', text: '35 hours', is_correct: true, explanation: 'Rates: A = 1, B = 2, C = 4 => Combined = 7. Total work = 7 * 5 = 35. Time for A = 35 / 1 = 35 hours.' }
    ]
  },
  {
    id: 'q-quant-015',
    question: '10 men can complete a project in 15 days, working 8 hours a day. How many men are needed to complete the same work in 10 days, working 6 hours a day?',
    subtopic: 'Time & Work',
    difficulty: 'Easy',
    company_id: 'comp-wipro',
    correct_answer: 'B',
    explanation: 'Using formula M1 * D1 * H1 = M2 * D2 * H2: 10 * 15 * 8 = M2 * 10 * 6 => 1200 = M2 * 60 => M2 = 20 men.',
    options: [
      { key: 'A', text: '18 men', is_correct: false },
      { key: 'B', text: '20 men', is_correct: true, explanation: 'M1*D1*H1 = M2*D2*H2 => 10*15*8 = M2*10*6 => 1200 = 60*M2 => M2 = 20.' },
      { key: 'C', text: '24 men', is_correct: false },
      { key: 'D', text: '25 men', is_correct: false }
    ]
  },
  {
    id: 'q-quant-016',
    question: 'A and B undertake to do a piece of work for ₹600. A alone can do it in 6 days while B alone can do it in 8 days. With the help of C, they finish it in 3 days. Find the share of C.',
    subtopic: 'Time & Work',
    difficulty: 'Medium',
    company_id: 'comp-tcs',
    correct_answer: 'A',
    explanation: 'A\'s share for 3 days = 3 * (1/6) = 1/2 of work. B\'s share for 3 days = 3 * (1/8) = 3/8 of work. Work done by C = 1 - (1/2 + 3/8) = 1 - 7/8 = 1/8. C\'s wage = (1/8) * 600 = ₹75.',
    options: [
      { key: 'A', text: '₹75', is_correct: true, explanation: 'Work done by C = 1 - 3/6 - 3/8 = 1 - 1/2 - 3/8 = 1/8. C gets (1/8)*600 = ₹75.' },
      { key: 'B', text: '₹100', is_correct: false },
      { key: 'C', text: '₹120', is_correct: false },
      { key: 'D', text: '₹150', is_correct: false }
    ]
  },

  // --- Profit, Loss & Discount (17-30) ---
  {
    id: 'q-quant-017',
    question: 'A dealer sells an article for ₹840 at a gain of 20%. What was its cost price?',
    subtopic: 'Profit, Loss & Discount',
    difficulty: 'Easy',
    company_id: 'comp-infosys',
    correct_answer: 'C',
    explanation: 'Selling Price = CP * (1 + Profit%/100) => 840 = CP * 1.2 => CP = 840 / 1.2 = ₹700.',
    options: [
      { key: 'A', text: '₹650', is_correct: false },
      { key: 'B', text: '₹680', is_correct: false },
      { key: 'C', text: '₹700', is_correct: true, explanation: 'CP = SP / 1.20 = 840 / 1.2 = ₹700.' },
      { key: 'D', text: '₹720', is_correct: false }
    ]
  },
  {
    id: 'q-quant-018',
    question: 'If the cost price of 12 pens is equal to the selling price of 8 pens, the gain percentage is:',
    subtopic: 'Profit, Loss & Discount',
    difficulty: 'Easy',
    company_id: 'comp-accenture',
    correct_answer: 'D',
    explanation: '12 * CP = 8 * SP => SP / CP = 12 / 8 = 3 / 2. Gain % = [(SP - CP) / CP] * 100 = [(3 - 2) / 2] * 100 = 50%.',
    options: [
      { key: 'A', text: '25%', is_correct: false },
      { key: 'B', text: '33.33%', is_correct: false },
      { key: 'C', text: '40%', is_correct: false },
      { key: 'D', text: '50%', is_correct: true, explanation: 'Profit % = (12 - 8) / 8 * 100 = 4 / 8 * 100 = 50%.' }
    ]
  },
  {
    id: 'q-quant-019',
    question: 'A dishonest merchant uses a weight of 800 g for a kg weight and sells his goods at cost price. What is his percentage profit?',
    subtopic: 'Profit, Loss & Discount',
    difficulty: 'Medium',
    company_id: 'comp-tcs',
    correct_answer: 'B',
    explanation: 'Formula for false weight profit: [(Error) / (True Value - Error)] * 100 = [200 / (1000 - 200)] * 100 = (200 / 800) * 100 = 25%.',
    options: [
      { key: 'A', text: '20%', is_correct: false },
      { key: 'B', text: '25%', is_correct: true, explanation: 'Profit = (1000 - 800) / 800 * 100 = 200 / 800 * 100 = 25%.' },
      { key: 'C', text: '30%', is_correct: false },
      { key: 'D', text: '16.67%', is_correct: false }
    ]
  },
  {
    id: 'q-quant-020',
    question: 'A single discount equivalent to a discount series of 20%, 10% and 5% is:',
    subtopic: 'Profit, Loss & Discount',
    difficulty: 'Medium',
    company_id: 'comp-cognizant',
    correct_answer: 'A',
    explanation: 'Net multiplier = (1 - 0.20) * (1 - 0.10) * (1 - 0.05) = 0.80 * 0.90 * 0.95 = 0.72 * 0.95 = 0.684. Equivalent discount = 1 - 0.684 = 0.316 = 31.6%.',
    options: [
      { key: 'A', text: '31.6%', is_correct: true, explanation: 'Final price = 100 * 0.8 * 0.9 * 0.95 = 68.4 => Discount = 100 - 68.4 = 31.6%.' },
      { key: 'B', text: '35%', is_correct: false },
      { key: 'C', text: '32.4%', is_correct: false },
      { key: 'D', text: '30%', is_correct: false }
    ]
  },

  // --- Simple & Compound Interest (21-35) ---
  {
    id: 'q-quant-021',
    question: 'A sum of money at simple interest doubles in 7 years. In how many years will it become 4 times of itself?',
    subtopic: 'Simple & Compound Interest',
    difficulty: 'Easy',
    company_id: 'comp-infosys',
    correct_answer: 'C',
    explanation: 'In simple interest, (N - 1) is proportional to time. For doubling, N - 1 = 1 in 7 years. For 4 times, N - 1 = 3. Time = 3 * 7 = 21 years.',
    options: [
      { key: 'A', text: '14 years', is_correct: false },
      { key: 'B', text: '18 years', is_correct: false },
      { key: 'C', text: '21 years', is_correct: true, explanation: 'Interest = P in 7 yrs. For 4P, interest needed = 3P => 3 * 7 = 21 years.' },
      { key: 'D', text: '28 years', is_correct: false }
    ]
  },
  {
    id: 'q-quant-022',
    question: 'Find the compound interest on ₹10,000 for 2 years at 10% per annum, compounded annually.',
    subtopic: 'Simple & Compound Interest',
    difficulty: 'Easy',
    company_id: 'comp-tcs',
    correct_answer: 'B',
    explanation: 'Amount = P * (1 + R/100)^2 = 10,000 * (1.1)^2 = 10,000 * 1.21 = ₹12,100. CI = Amount - Principal = 12,100 - 10,000 = ₹2,100.',
    options: [
      { key: 'A', text: '₹2,000', is_correct: false },
      { key: 'B', text: '₹2,100', is_correct: true, explanation: 'CI = 10000 * [(1.1)^2 - 1] = 10000 * 0.21 = ₹2,100.' },
      { key: 'C', text: '₹2,200', is_correct: false },
      { key: 'D', text: '₹2,400', is_correct: false }
    ]
  },
  {
    id: 'q-quant-023',
    question: 'The difference between simple and compound interest on ₹1,200 for one year at 10% per annum reckoned half-yearly is:',
    subtopic: 'Simple & Compound Interest',
    difficulty: 'Hard',
    company_id: 'comp-accenture',
    correct_answer: 'A',
    explanation: 'For half-yearly, R = 5%, n = 2 periods. Difference D = P * (R/100)^2 = 1200 * (5/100)^2 = 1200 * (1/400) = ₹3.',
    options: [
      { key: 'A', text: '₹3', is_correct: true, explanation: 'SI for 1 yr = 120. CI half-yearly: R=5%, 2 periods => 1200*(1.05)^2 - 1200 = 123 => Diff = ₹3.' },
      { key: 'B', text: '₹4.5', is_correct: false },
      { key: 'C', text: '₹6', is_correct: false },
      { key: 'D', text: '₹12', is_correct: false }
    ]
  },

  // --- Percentages, Ratios & Alligations (24-40) ---
  {
    id: 'q-quant-024',
    question: 'Two numbers are respectively 20% and 50% more than a third number. The ratio of the two numbers is:',
    subtopic: 'Percentages & Ratios',
    difficulty: 'Easy',
    company_id: 'comp-wipro',
    correct_answer: 'C',
    explanation: 'Let third number = 100. First = 120, Second = 150. Ratio = 120 : 150 = 4 : 5.',
    options: [
      { key: 'A', text: '2 : 5', is_correct: false },
      { key: 'B', text: '3 : 5', is_correct: false },
      { key: 'C', text: '4 : 5', is_correct: true, explanation: '120 : 150 = 4 : 5.' },
      { key: 'D', text: '6 : 7', is_correct: false }
    ]
  },
  {
    id: 'q-quant-025',
    question: 'In a mixture of 60 liters, the ratio of milk and water is 2 : 1. If this ratio is to be 1 : 2, then the quantity of water to be further added is:',
    subtopic: 'Mixtures & Alligations',
    difficulty: 'Medium',
    company_id: 'comp-tcs',
    correct_answer: 'D',
    explanation: 'Milk = (2/3) * 60 = 40 L. Water = 20 L. For 1 : 2 ratio: Milk is 1 part = 40 L, so Water must be 2 parts = 80 L. Water to add = 80 - 20 = 60 liters.',
    options: [
      { key: 'A', text: '20 liters', is_correct: false },
      { key: 'B', text: '30 liters', is_correct: false },
      { key: 'C', text: '40 liters', is_correct: false },
      { key: 'D', text: '60 liters', is_correct: true, explanation: 'Milk remains 40 L. New water needed for 1:2 is 40 * 2 = 80 L. Added = 80 - 20 = 60 L.' }
    ]
  },
  {
    id: 'q-quant-026',
    question: 'If 20% of an electricity bill is deducted, ₹100 is still to be paid. How much was the original bill?',
    subtopic: 'Percentages & Ratios',
    difficulty: 'Easy',
    company_id: 'comp-cognizant',
    correct_answer: 'B',
    explanation: 'Remaining bill = 100% - 20% = 80%. 80% = ₹100 => Original Bill (100%) = 100 * (100 / 80) = ₹125.',
    options: [
      { key: 'A', text: '₹120', is_correct: false },
      { key: 'B', text: '₹125', is_correct: true, explanation: '0.80 * Bill = 100 => Bill = 100 / 0.8 = ₹125.' },
      { key: 'C', text: '₹130', is_correct: false },
      { key: 'D', text: '₹140', is_correct: false }
    ]
  },
  {
    id: 'q-quant-027',
    question: 'In an examination, 35% of candidates fail in Mathematics and 25% in English. If 10% fail in both, the percentage of candidates who pass in both subjects is:',
    subtopic: 'Percentages & Ratios',
    difficulty: 'Medium',
    company_id: 'comp-infosys',
    correct_answer: 'A',
    explanation: 'Percentage failed in at least one = n(M U E) = 35 + 25 - 10 = 50%. Therefore, percentage who passed both = 100% - 50% = 50%.',
    options: [
      { key: 'A', text: '50%', is_correct: true, explanation: 'Total failing at least one = 35 + 25 - 10 = 50%. Passed both = 100 - 50 = 50%.' },
      { key: 'B', text: '55%', is_correct: false },
      { key: 'C', text: '60%', is_correct: false },
      { key: 'D', text: '65%', is_correct: false }
    ]
  },
  {
    id: 'q-quant-028',
    question: 'Seats for Mathematics, Physics and Biology in a school are in the ratio 5 : 7 : 8. There is a proposal to increase these seats by 40%, 50% and 75% respectively. What will be the ratio of increased seats?',
    subtopic: 'Percentages & Ratios',
    difficulty: 'Medium',
    company_id: 'comp-accenture',
    correct_answer: 'A',
    explanation: 'New seats = 5 * 1.40 : 7 * 1.50 : 8 * 1.75 = 7 : 10.5 : 14. Multiplying by 2 to clear decimals = 14 : 21 : 28 = 2 : 3 : 4.',
    options: [
      { key: 'A', text: '2 : 3 : 4', is_correct: true, explanation: '5*(1.4) : 7*(1.5) : 8*(1.75) = 7 : 10.5 : 14 = 14 : 21 : 28 = 2 : 3 : 4.' },
      { key: 'B', text: '6 : 7 : 8', is_correct: false },
      { key: 'C', text: '6 : 8 : 9', is_correct: false },
      { key: 'D', text: '1 : 2 : 3', is_correct: false }
    ]
  },

  // --- Permutations, Combinations & Probability (29-45) ---
  {
    id: 'q-quant-029',
    question: 'How many 3-digit numbers can be formed from the digits 2, 3, 5, 6, 7 and 9, which are divisible by 5 and none of the digits is repeated?',
    subtopic: 'Permutations & Probability',
    difficulty: 'Medium',
    company_id: 'comp-tcs',
    correct_answer: 'B',
    explanation: 'For a number to be divisible by 5, the unit digit must be 5 (1 choice). Remaining 5 digits can fill the hundreds and tens places in 5 * 4 = 20 ways. Total numbers = 20 * 1 = 20.',
    options: [
      { key: 'A', text: '15', is_correct: false },
      { key: 'B', text: '20', is_correct: true, explanation: 'Unit place = 5 (1 way). Hundred and ten places = 5P2 = 5 * 4 = 20 ways.' },
      { key: 'C', text: '25', is_correct: false },
      { key: 'D', text: '30', is_correct: false }
    ]
  },
  {
    id: 'q-quant-030',
    question: 'In how many ways can a group of 5 men and 2 women be made out of a total of 7 men and 3 women?',
    subtopic: 'Permutations & Probability',
    difficulty: 'Medium',
    company_id: 'comp-wipro',
    correct_answer: 'C',
    explanation: 'Ways = 7C5 * 3C2 = 7C2 * 3 = (7 * 6 / 2) * 3 = 21 * 3 = 63.',
    options: [
      { key: 'A', text: '45', is_correct: false },
      { key: 'B', text: '54', is_correct: false },
      { key: 'C', text: '63', is_correct: true, explanation: '7C5 * 3C2 = 21 * 3 = 63 ways.' },
      { key: 'D', text: '72', is_correct: false }
    ]
  },
  {
    id: 'q-quant-031',
    question: 'Two dice are thrown together. What is the probability that the sum of the numbers obtained is a prime number?',
    subtopic: 'Permutations & Probability',
    difficulty: 'Hard',
    company_id: 'comp-infosys',
    correct_answer: 'B',
    explanation: 'Possible prime sums are 2, 3, 5, 7, 11. Sum 2: (1,1) [1]; Sum 3: (1,2),(2,1) [2]; Sum 5: (1,4),(2,3),(3,2),(4,1) [4]; Sum 7: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) [6]; Sum 11: (5,6),(6,5) [2]. Total favorable = 1 + 2 + 4 + 6 + 2 = 15. Total outcomes = 36. Probability = 15 / 36 = 5 / 12.',
    options: [
      { key: 'A', text: '1/3', is_correct: false },
      { key: 'B', text: '5/12', is_correct: true, explanation: 'Favorable outcomes = 15. Total = 36. Probability = 15/36 = 5/12.' },
      { key: 'C', text: '7/12', is_correct: false },
      { key: 'D', text: '1/2', is_correct: false }
    ]
  },
  {
    id: 'q-quant-032',
    question: 'A bag contains 6 black and 8 white balls. One ball is drawn at random. What is the probability that the ball drawn is white?',
    subtopic: 'Permutations & Probability',
    difficulty: 'Easy',
    company_id: 'comp-cognizant',
    correct_answer: 'C',
    explanation: 'Total balls = 6 + 8 = 14. Number of white balls = 8. Probability = 8 / 14 = 4 / 7.',
    options: [
      { key: 'A', text: '3/7', is_correct: false },
      { key: 'B', text: '1/2', is_correct: false },
      { key: 'C', text: '4/7', is_correct: true, explanation: 'Probability = 8 / 14 = 4/7.' },
      { key: 'D', text: '5/7', is_correct: false }
    ]
  },

  // --- Number Systems & Averages (33-50) ---
  {
    id: 'q-quant-033',
    question: 'What is the unit digit in the product (7^95 - 3^58)?',
    subtopic: 'Number Systems',
    difficulty: 'Hard',
    company_id: 'comp-tcs',
    correct_answer: 'B',
    explanation: 'Cyclicity of 7 is 4: 95 mod 4 = 3 => 7^3 ends in 3. Cyclicity of 3 is 4: 58 mod 4 = 2 => 3^2 ends in 9. Unit digit = (13 - 9) = 4.',
    options: [
      { key: 'A', text: '0', is_correct: false },
      { key: 'B', text: '4', is_correct: true, explanation: '7^95 ends in 3, 3^58 ends in 9. Unit digit = 13 - 9 = 4.' },
      { key: 'C', text: '6', is_correct: false },
      { key: 'D', text: '7', is_correct: false }
    ]
  },
  {
    id: 'q-quant-034',
    question: 'The average of 20 numbers is zero. Of them, at the most, how many may be greater than zero?',
    subtopic: 'Number Systems',
    difficulty: 'Easy',
    company_id: 'comp-accenture',
    correct_answer: 'D',
    explanation: 'Average of 20 numbers = 0 => Sum of 20 numbers = 0. It is possible that 19 numbers are positive and their sum is balanced by a single large negative number. Maximum positive numbers = 19.',
    options: [
      { key: 'A', text: '0', is_correct: false },
      { key: 'B', text: '1', is_correct: false },
      { key: 'C', text: '10', is_correct: false },
      { key: 'D', text: '19', is_correct: true, explanation: '19 numbers can be positive, balanced by 1 negative number equaling the negative sum.' }
    ]
  },
  {
    id: 'q-quant-035',
    question: 'The sum of ages of 5 children born at intervals of 3 years each is 50 years. What is the age of the youngest child?',
    subtopic: 'Number Systems',
    difficulty: 'Easy',
    company_id: 'comp-infosys',
    correct_answer: 'A',
    explanation: 'Let ages be x, x+3, x+6, x+9, x+12. Sum = 5x + 30 = 50 => 5x = 20 => x = 4 years.',
    options: [
      { key: 'A', text: '4 years', is_correct: true, explanation: '5x + 30 = 50 => 5x = 20 => x = 4.' },
      { key: 'B', text: '6 years', is_correct: false },
      { key: 'C', text: '8 years', is_correct: false },
      { key: 'D', text: '10 years', is_correct: false }
    ]
  }
];

// Helper to expand and complete up to 105 distinct, high-quality questions
const SUBTOPIC_DISTRIBUTION = [
  'Speed, Time & Distance',
  'Time & Work',
  'Pipes & Cisterns',
  'Profit, Loss & Discount',
  'Simple & Compound Interest',
  'Percentages & Ratios',
  'Mixtures & Alligations',
  'Permutations & Probability',
  'Number Systems',
  'Geometry & Mensuration'
];

const COMPANIES = ['comp-tcs', 'comp-infosys', 'comp-accenture', 'comp-wipro', 'comp-cognizant'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

// Systematic expansion to guarantee 105+ unique Quantitative questions
export function generateFullQuantBank() {
  const bank = [...QUANT_QUESTIONS];
  let seq = bank.length + 1;

  const templates = [
    {
      sub: 'Speed, Time & Distance',
      gen: (i) => {
        const d = 150 + i * 25;
        const s = 15 + (i % 6) * 5;
        const t = Math.round(d / s);
        return {
          question: `A cyclist covers a distance of ${d} meters in ${t} seconds. What is his speed in kilometers per hour?`,
          explanation: `Speed in m/s = ${d} / ${t} = ${(d/t).toFixed(1)} m/s. In km/h: ${(d/t).toFixed(1)} * (18 / 5) = ${((d/t)*3.6).toFixed(1)} km/h.`,
          options: [
            { key: 'A', text: `${((d/t)*3.6).toFixed(1)} km/h`, is_correct: true, explanation: `Speed = (${d}/${t}) * 3.6 = ${((d/t)*3.6).toFixed(1)} km/h.` },
            { key: 'B', text: `${(((d/t)*3.6) + 5).toFixed(1)} km/h`, is_correct: false },
            { key: 'C', text: `${(((d/t)*3.6) - 4).toFixed(1)} km/h`, is_correct: false },
            { key: 'D', text: `${(((d/t)*3.6) * 1.2).toFixed(1)} km/h`, is_correct: false }
          ],
          ans: 'A'
        };
      }
    },
    {
      sub: 'Time & Work',
      gen: (i) => {
        const da = 10 + i;
        const db = 16 + i * 2;
        const tog = ((da * db) / (da + db)).toFixed(1);
        return {
          question: `Worker A can finish a software sprint in ${da} days and Worker B can finish it in ${db} days. How many days will they take working concurrently?`,
          explanation: `Combined rate = 1/${da} + 1/${db} = (${da + db})/(${da * db}). Time taken = (${da * db})/(${da + db}) = ${tog} days.`,
          options: [
            { key: 'A', text: `${(parseFloat(tog) + 2).toFixed(1)} days`, is_correct: false },
            { key: 'B', text: `${tog} days`, is_correct: true, explanation: `Combined time = (A * B) / (A + B) = (${da} * ${db}) / (${da + db}) = ${tog} days.` },
            { key: 'C', text: `${(parseFloat(tog) - 1.5).toFixed(1)} days`, is_correct: false },
            { key: 'D', text: `${(parseFloat(tog) * 1.4).toFixed(1)} days`, is_correct: false }
          ],
          ans: 'B'
        };
      }
    },
    {
      sub: 'Profit, Loss & Discount',
      gen: (i) => {
        const cp = 500 + i * 75;
        const p = 12 + (i % 6) * 3;
        const sp = Math.round(cp * (1 + p / 100));
        return {
          question: `An electronics retail unit purchases a device for ₹${cp} and sells it for ₹${sp}. What is the percentage profit gained on this transaction?`,
          explanation: `Profit = SP - CP = ${sp} - ${cp} = ₹${sp - cp}. Profit % = (${sp - cp} / ${cp}) * 100 = ${p}%.`,
          options: [
            { key: 'A', text: `${p - 2}%`, is_correct: false },
            { key: 'B', text: `${p + 3}%`, is_correct: false },
            { key: 'C', text: `${p}%`, is_correct: true, explanation: `Profit % = ((${sp} - ${cp}) / ${cp}) * 100 = ${p}%.` },
            { key: 'D', text: `${p + 5}%`, is_correct: false }
          ],
          ans: 'C'
        };
      }
    },
    {
      sub: 'Simple & Compound Interest',
      gen: (i) => {
        const p = 5000 + i * 1500;
        const r = 5 + (i % 5);
        const t = 2 + (i % 3);
        const si = (p * r * t) / 100;
        return {
          question: `Calculate the simple interest accumulated on a principal sum of ₹${p.toLocaleString()} invested at an annual interest rate of ${r}% for ${t} years.`,
          explanation: `Simple Interest = (P * R * T) / 100 = (${p} * ${r} * ${t}) / 100 = ₹${si}.`,
          options: [
            { key: 'A', text: `₹${si + 150}`, is_correct: false },
            { key: 'B', text: `₹${si - 100}`, is_correct: false },
            { key: 'C', text: `₹${si}`, is_correct: true, explanation: `SI = (P * R * T) / 100 = (${p} * ${r} * ${t}) / 100 = ₹${si}.` },
            { key: 'D', text: `₹${si + 250}`, is_correct: false }
          ],
          ans: 'C'
        };
      }
    },
    {
      sub: 'Percentages & Ratios',
      gen: (i) => {
        const val = 120 + i * 35;
        const inc = 10 + (i % 5) * 5;
        const finalVal = Math.round(val * (1 + inc / 100));
        return {
          question: `The server requests count of a microservice increased from ${val} req/sec to ${finalVal} req/sec. What is the percentage increase in load?`,
          explanation: `Increase = ${finalVal} - ${val} = ${finalVal - val}. Percentage increase = (${finalVal - val} / ${val}) * 100 = ${inc}%.`,
          options: [
            { key: 'A', text: `${inc}%`, is_correct: true, explanation: `Percentage increase = ((${finalVal} - ${val}) / ${val}) * 100 = ${inc}%.` },
            { key: 'B', text: `${inc + 5}%`, is_correct: false },
            { key: 'C', text: `${inc - 3}%`, is_correct: false },
            { key: 'D', text: `${inc + 8}%`, is_correct: false }
          ],
          ans: 'A'
        };
      }
    },
    {
      sub: 'Permutations & Probability',
      gen: (i) => {
        const n = 5 + i;
        const r = 2;
        const comb = (n * (n - 1)) / 2;
        return {
          question: `In how many different ways can a placement committee select a sub-team of 2 campus representatives from a pool of ${n} candidates?`,
          explanation: `Combinations formula: nCr = n! / (r! * (n - r)!). Here ${n}C2 = (${n} * ${n - 1}) / 2 = ${comb} ways.`,
          options: [
            { key: 'A', text: `${comb - 3} ways`, is_correct: false },
            { key: 'B', text: `${comb} ways`, is_correct: true, explanation: `${n}C2 = (${n} * ${n - 1}) / 2 = ${comb} ways.` },
            { key: 'C', text: `${comb + 4} ways`, is_correct: false },
            { key: 'D', text: `${comb * 2} ways`, is_correct: false }
          ],
          ans: 'B'
        };
      }
    },
    {
      sub: 'Number Systems',
      gen: (i) => {
        const num = 12 + i;
        const sum = (num * (num + 1)) / 2;
        return {
          question: `What is the sum of the first ${num} consecutive natural numbers (1 + 2 + 3 + ... + ${num})?`,
          explanation: `Sum of first n natural numbers = [n * (n + 1)] / 2 = [${num} * ${num + 1}] / 2 = ${sum}.`,
          options: [
            { key: 'A', text: `${sum + 6}`, is_correct: false },
            { key: 'B', text: `${sum}`, is_correct: true, explanation: `Sum = [n * (n + 1)] / 2 = (${num} * ${num + 1}) / 2 = ${sum}.` },
            { key: 'C', text: `${sum - 5}`, is_correct: false },
            { key: 'D', text: `${sum + 12}`, is_correct: false }
          ],
          ans: 'B'
        };
      }
    }
  ];

  let tIdx = 0;
  while (bank.length < 108) {
    const t = templates[tIdx % templates.length];
    const generated = t.gen(seq);
    const id = `q-quant-${String(seq).padStart(3, '0')}`;
    const diff = DIFFICULTIES[seq % DIFFICULTIES.length];
    const comp = COMPANIES[seq % COMPANIES.length];

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
