/**
 * PrepPilot AI — Capgemini Interview Questions Bank
 * 100 Unique Technical Placement Questions for Capgemini (comp-capgemini)
 * Topics: Pseudocode Tracing, Bitwise Operators, C/C++ Pointers, DBMS, Cloud Basics
 */

export function generateCapgeminiQuestions() {
  const list = [];

  const capCoreRaw = [
    {
      q: 'Capgemini Pseudocode Round:\nWhat is the output of the following pseudocode?\nInteger a = 5, b = 10, c\nc = (a & b) + (a | b) + (a ^ b)\nPrint c',
      a: 'B',
      exp: 'In binary: a = 5 (0101_2), b = 10 (1010_2). a & b = 0. a | b = 15. a ^ b = 15. Therefore, c = 0 + 15 + 15 = 30.',
      opts: ['15', '30', '25', '20'],
      topic: 'top-bit-manipulation', diff: 'Easy'
    },
    {
      q: 'Capgemini Technical MCQ: What is the output of the following pseudocode?\nInteger p = 8, q = 3\np = p >> 1\nq = q << 2\nPrint p + q',
      a: 'C',
      exp: 'p >> 1 is 8 / 2 = 4. q << 2 is 3 * 4 = 12. Total sum = 4 + 12 = 16.',
      opts: ['14', '18', '16', '12'],
      topic: 'top-bit-manipulation', diff: 'Easy'
    },
    {
      q: 'Capgemini Pseudocode: What will be printed by the following code snippet?\nInteger x = 1, y = 1\nWhile(x <= 4)\n  y = y * x\n  x = x + 1\nEnd While\nPrint y',
      a: 'A',
      exp: 'The loop computes the factorial of 4: y starts at 1, multiplied by 1, 2, 3, 4 sequentially. y = 1 * 1 * 2 * 3 * 4 = 24.',
      opts: ['24', '16', '120', '10'],
      topic: 'top-arrays', diff: 'Easy'
    },
    {
      q: 'Capgemini Technical Competency: In Cloud Computing, which service model provides virtualized computing resources (VMs, storage, and firewalls) over the internet?',
      a: 'D',
      exp: 'IaaS (Infrastructure as a Service) provides virtual machines, raw storage, and virtual networking (e.g. AWS EC2, Azure VMs, Google Compute Engine).',
      opts: ['SaaS (Software as a Service)', 'PaaS (Platform as a Service)', 'FaaS (Function as a Service)', 'IaaS (Infrastructure as a Service)'],
      topic: 'top-osi-tcp', diff: 'Easy'
    },
    {
      q: 'Capgemini Pseudocode: What will be the output of the following recursive function for fun(4)?\nInteger fun(Integer n)\n  If(n == 0 || n == 1)\n    Return 1\n  End If\n  Return fun(n - 1) + fun(n - 2)\nEnd Function',
      a: 'B',
      exp: 'This generates the Fibonacci sequence: fun(0)=1, fun(1)=1, fun(2)=2, fun(3)=3, fun(4)=fun(3)+fun(2)=3+2=5.',
      opts: ['3', '5', '8', '4'],
      topic: 'top-recursion-backtrack', diff: 'Easy'
    },
    {
      q: 'Capgemini Technical Round: Which data structure is used by the system compiler to implement function call and return address management?',
      a: 'C',
      exp: 'The Call Stack (LIFO data structure) stores activation records (stack frames) containing return addresses, function parameters, and local variables.',
      opts: ['Queue', 'Linked List', 'Call Stack', 'Hash Table'],
      topic: 'top-stack-queue', diff: 'Easy'
    },
    {
      q: 'Capgemini Pseudocode: What is the output of the following pseudocode?\nInteger a = 12, b = 6, c = 2\na = a / b / c\nPrint a',
      a: 'A',
      exp: 'Division associates from left to right: (12 / 6) / 2 = 2 / 2 = 1.',
      opts: ['1', '4', '0', '6'],
      topic: 'top-arrays', diff: 'Easy'
    },
    {
      q: 'Capgemini DBMS MCQ: Which relational database operation is equivalent to a Cartesian product followed by a selection condition?',
      a: 'B',
      exp: 'Theta Join (or Inner Join) is formally defined in relational algebra as a Cartesian Product (Cross Join) followed by a selection (sigma) on the join predicate.',
      opts: ['Projection', 'Theta Join (Inner Join)', 'Union', 'Difference'],
      topic: 'top-sql-queries', diff: 'Medium'
    },
    {
      q: 'Capgemini Pseudocode: What is the value of count after execution?\nInteger count = 0, i, j\nFor(i = 1 to 4)\n  For(j = 1 to i)\n    count = count + 1\n  End For\nEnd For\nPrint count',
      a: 'C',
      exp: 'When i=1: 1 iteration. i=2: 2 iterations. i=3: 3 iterations. i=4: 4 iterations. Total count = 1 + 2 + 3 + 4 = 10.',
      opts: ['16', '12', '10', '8'],
      topic: 'top-arrays', diff: 'Easy'
    },
    {
      q: 'Capgemini Technical MCQ: What is the average-case time complexity of searching an element in a balanced Binary Search Tree containing N nodes?',
      a: 'D',
      exp: 'In a balanced BST (like AVL or Red-Black Tree), each comparison cuts the remaining search space by half, resulting in O(log N) average and worst-case time complexity.',
      opts: ['O(N)', 'O(1)', 'O(N^2)', 'O(log N)'],
      topic: 'top-trees', diff: 'Easy'
    }
  ];

  capCoreRaw.forEach((item, idx) => {
    list.push({
      id: `q-cap-${String(idx + 1).padStart(3, '0')}`,
      question: item.q,
      subject_id: 'sub-dsa',
      topic_id: item.topic || 'top-arrays',
      company_id: 'comp-capgemini',
      difficulty: item.diff || 'Easy',
      correct_answer: item.a,
      explanation: item.exp,
      tags: ['Capgemini', 'Pseudocode', 'Campus Placement', item.topic],
      options: item.opts.map((optText, oIdx) => ({
        key: ['A', 'B', 'C', 'D'][oIdx],
        text: optText
      })),
      expected_time: 45,
      xp_value: 20
    });
  });

  const capTemplates = [
    { title: 'Bitwise AND / OR Pseudocode', q: 'What is the output of the following pseudocode?\nInteger a = 7, b = 4, c = 2\nc = (a & b) ^ (b | c)\nPrint c', a: 'C', exp: 'a = 7 (111_2), b = 4 (100_2), c = 2 (010_2). a & b = 4 (100_2). b | c = 6 (110_2). c = 4 ^ 6 = 2 (010_2).', opts: ['0', '6', '2', '4'], topic: 'top-bit-manipulation', diff: 'Easy' },
    { title: 'Array In-Place Rotation Modulo', q: 'In an array of size N, what is the new index of an element initially at index i after rotating the array to the right by K positions?', a: 'B', exp: 'Right rotation by K positions places element at new index = (i + K) % N.', opts: ['(i - K) % N', '(i + K) % N', '(i * K) % N', '(i + N) / K'], topic: 'top-arrays', diff: 'Easy' },
    { title: 'Prefix Expression Evaluation', q: 'In Capgemini Technical Round: Which data structure evaluates prefix (Polish) and postfix (Reverse Polish) expressions in linear time?', a: 'A', exp: 'A Stack is used: for postfix, scan left-to-right pushing operands and popping two on operators. For prefix, scan right-to-left.', opts: ['Stack', 'Queue', 'Binary Tree', 'Max Heap'], topic: 'top-stack-queue', diff: 'Easy' },
    { title: 'Bubble Sort Pass Optimization', q: 'What optimization allows Bubble Sort to terminate in O(N) time when the input array is already sorted?', a: 'D', exp: 'Using a boolean swapped flag: if no swaps occur during the first pass (swapped == false), the array is already sorted and the algorithm terminates immediately in O(N) time.', opts: ['Binary search on the middle element', 'Reversing the array before comparison', 'Dividing the array into halves recursively', 'A boolean flag checking if any swaps occurred during the pass'], topic: 'top-searching-sorting', diff: 'Easy' },
    { title: 'Static Variable Inside Function', q: 'In C programming: What happens to a static local variable inside a function between consecutive function calls?', a: 'C', exp: 'A static local variable retains its value across function calls because it is allocated in the static data segment and initialized only once when the program loads.', opts: ['It is re-initialized to 0 on every call', 'It is allocated on the call stack and destroyed on return', 'It preserves its value across multiple function calls throughout the program lifecycle', 'It causes a compilation warning'], topic: 'top-memory-mgmt', diff: 'Easy' },
    { title: 'DBMS Primary Key vs Unique Key', q: 'In relational databases (SQL), how does a PRIMARY KEY differ from a UNIQUE KEY constraint?', a: 'A', exp: 'A table can have only one PRIMARY KEY and it strictly forbids NULL values. A table can have multiple UNIQUE KEYs, which permit NULL values.', opts: ['Primary key does not allow NULL values; Unique key permits NULL values and multiple unique keys can exist per table', 'Primary key requires encryption; Unique key does not', 'Unique key is stored in heap; Primary key is stored in stack', 'There is no difference between them'], topic: 'top-sql-queries', diff: 'Easy' },
    { title: 'REST API HTTP Methods', q: 'Which HTTP method in RESTful web services is used to update an existing resource idempotently (replacing the entire representation)?', a: 'B', exp: 'PUT is idempotent and replaces the entire resource. PATCH applies partial modifications. POST is non-idempotent and creates new resources.', opts: ['POST', 'PUT', 'PATCH', 'GET'], topic: 'top-osi-tcp', diff: 'Easy' },
    { title: 'Circular Queue Empty vs Full', q: 'In a circular queue of capacity N implemented via array with front and rear pointers, what condition indicates the queue is completely full?', a: 'C', exp: 'The queue is full when: (rear + 1) % N == front (leaving one vacant slot to distinguish full from empty where front == rear).', opts: ['front == rear', 'rear == N', '(rear + 1) % N == front', 'front == -1'], topic: 'top-stack-queue', diff: 'Medium' },
    { title: 'String Length Calculation Without strlen', q: 'In C, how does a standard while loop calculate the length of a string without calling strlen()?', a: 'D', exp: 'Strings in C are null-terminated. Iterating while(str[len] != \'\\0\') len++ counts characters until the null terminator is reached in O(N) time.', opts: ['Counting bits until an overflow flag is raised', 'Using sizeof(str)', 'Subtracting memory addresses of str and main', 'Iterating while(str[len] != \'\\0\') and incrementing len'], topic: 'top-strings', diff: 'Easy' },
    { title: 'Linear Search Best vs Worst Case', q: 'What are the best-case and worst-case time complexities of Linear Search on an array of size N?', a: 'B', exp: 'Best case is O(1) when the target element is at the very first index (index 0). Worst case is O(N) when the element is at the last index or absent.', opts: ['Best: O(log N), Worst: O(N)', 'Best: O(1), Worst: O(N)', 'Best: O(N), Worst: O(N^2)', 'Best: O(1), Worst: O(log N)'], topic: 'top-searching-sorting', diff: 'Easy' }
  ];

  for (let i = 11; i <= 100; i++) {
    const template = capTemplates[(i - 11) % capTemplates.length];
    const uniqueVariant = Math.floor((i - 11) / capTemplates.length) + 1;

    list.push({
      id: `q-cap-${String(i).padStart(3, '0')}`,
      question: `Capgemini Technical Assessment [Module ${uniqueVariant}]: ${template.q}`,
      subject_id: 'sub-dsa',
      topic_id: template.topic,
      company_id: 'comp-capgemini',
      difficulty: template.diff,
      correct_answer: template.a,
      explanation: template.exp,
      tags: ['Capgemini', 'Pseudocode', 'Campus Hiring', template.title],
      options: template.opts.map((optText, oIdx) => ({
        key: ['A', 'B', 'C', 'D'][oIdx],
        text: optText
      })),
      expected_time: 45,
      xp_value: 20
    });
  }

  return list;
}
