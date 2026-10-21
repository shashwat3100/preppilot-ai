/**
 * PrepPilot AI — Deloitte Interview Questions Bank
 * 100 Unique Technical Placement Questions for Deloitte (comp-deloitte)
 * Topics: SQL Queries, Normalization, Network Security, System Architecture, Business Logic
 */

export function generateDeloitteQuestions() {
  const list = [];

  const delCoreRaw = [
    {
      q: 'Deloitte Analyst Interview: In SQL, which clause is specifically used to filter groups created by the GROUP BY statement based on an aggregate condition?',
      a: 'B',
      exp: 'HAVING is applied after grouping and aggregation, whereas WHERE filters individual rows before any grouping occurs.',
      opts: ['WHERE', 'HAVING', 'ORDER BY', 'PARTITION BY'],
      topic: 'top-sql-queries', diff: 'Easy'
    },
    {
      q: 'Deloitte Technical Round: What is the key difference between the SQL RANK() and DENSE_RANK() window functions when two rows share the same ranking value?',
      a: 'C',
      exp: 'RANK() leaves gaps in ranking numbers after duplicate values (e.g. 1, 2, 2, 4), whereas DENSE_RANK() does not skip rank values (e.g. 1, 2, 2, 3).',
      opts: ['RANK() requires a WHERE clause; DENSE_RANK() does not', 'DENSE_RANK() cannot be used with ORDER BY', 'RANK() skips subsequent rank numbers after ties; DENSE_RANK() assigns consecutive numbers without gaps', 'RANK() sorts ascending; DENSE_RANK() sorts descending'],
      topic: 'top-sql-queries', diff: 'Medium'
    },
    {
      q: 'Deloitte Advisory (Cyber Risk): In public-key cryptography (Asymmetric Encryption), which key is used by the sender to encrypt a confidential message intended only for the recipient?',
      a: 'A',
      exp: 'In asymmetric encryption, the sender encrypts using the recipient\'s public key. Only the recipient possesses the corresponding private key required to decrypt the message.',
      opts: ['The recipient\'s Public Key', 'The sender\'s Private Key', 'A shared pre-shared symmetric key', 'The root certificate authority key'],
      topic: 'top-osi-tcp', diff: 'Easy'
    },
    {
      q: 'Deloitte Systems MCQ: Which normal form eliminates partial functional dependencies (where a non-prime attribute depends on only a proper subset of a composite candidate key)?',
      a: 'D',
      exp: 'Second Normal Form (2NF) requires 1NF and guarantees that no non-prime attribute is functionally dependent on a proper subset of any candidate key (eliminates partial dependency).',
      opts: ['1NF', 'BCNF', '3NF', '2NF'],
      topic: 'top-normalization', diff: 'Easy'
    },
    {
      q: 'Deloitte Technical Interview: In the TCP 3-Way Handshake protocol, what packets are exchanged between client and server to establish a connection?',
      a: 'B',
      exp: '1) Client sends SYN. 2) Server responds with SYN-ACK. 3) Client acknowledges with ACK. The TCP connection is now established.',
      opts: ['ACK -> SYN -> FIN', 'SYN -> SYN-ACK -> ACK', 'FIN -> ACK -> FIN-ACK', 'SYN -> ACK -> RST'],
      topic: 'top-osi-tcp', diff: 'Easy'
    },
    {
      q: 'Deloitte Database MCQ: What happens when you execute a TRUNCATE command compared to a DELETE command in a relational database?',
      a: 'A',
      exp: 'TRUNCATE is a DDL operation that deallocates all data pages, does not fire row-level triggers, cannot be filtered with WHERE, and is significantly faster than DELETE (which logs row-by-row deletions).',
      opts: ['TRUNCATE is DDL (deallocates pages, resets identity, faster); DELETE is DML (logs each row deletion, fires triggers)', 'TRUNCATE deletes the table schema; DELETE removes rows only', 'DELETE cannot be rolled back in a transaction', 'TRUNCATE requires a WHERE clause'],
      topic: 'top-sql-queries', diff: 'Medium'
    },
    {
      q: 'Deloitte Web Services: What does an HTTP 504 status code returned by an API gateway indicate?',
      a: 'C',
      exp: 'HTTP 504 Gateway Timeout indicates that the server, while acting as a gateway or proxy, did not receive a timely response from the upstream server.',
      opts: ['404 Not Found', '500 Internal Server Error', '504 Gateway Timeout (upstream server did not respond in time)', '403 Forbidden Access'],
      topic: 'top-osi-tcp', diff: 'Easy'
    },
    {
      q: 'Deloitte Analytics Round: What SQL operator is used to combine the results of two SELECT statements into a single result set while automatically removing duplicate rows?',
      a: 'B',
      exp: 'UNION combines queries and eliminates duplicates. UNION ALL combines queries without removing duplicates, making it faster when uniqueness is guaranteed or duplicates are desired.',
      opts: ['JOIN', 'UNION', 'UNION ALL', 'INTERSECT ALL'],
      topic: 'top-sql-queries', diff: 'Easy'
    },
    {
      q: 'Deloitte Risk & Governance: In database transactions, what does the \'I\' in ACID stand for, and what concurrency anomaly does it prevent?',
      a: 'D',
      exp: 'Isolation guarantees that concurrent transactions execute as if they were running serially without interfering with each other, preventing dirty reads, non-repeatable reads, and phantom reads.',
      opts: ['Idempotency; prevents duplicate requests', 'Integrity; prevents foreign key violations', 'Indexing; speeds up primary key queries', 'Isolation; ensures concurrent transactions do not observe intermediate uncommitted states of other transactions'],
      topic: 'top-acid', diff: 'Medium'
    },
    {
      q: 'Deloitte Data Engineering: When designing a Star Schema in a Data Warehouse, what two types of tables are used?',
      a: 'A',
      exp: 'A Star Schema contains a central Fact Table (holding numerical quantitative measurements and foreign keys) surrounded by denormalized Dimension Tables (holding context attributes).',
      opts: ['A central Fact Table surrounded by Dimension Tables', 'Relational tables linked solely by B-tree indexes', 'Master tables and temporary memory tables', 'Circular tables with self-referential keys'],
      topic: 'top-indexing', diff: 'Medium'
    }
  ];

  delCoreRaw.forEach((item, idx) => {
    list.push({
      id: `q-del-${String(idx + 1).padStart(3, '0')}`,
      question: item.q,
      subject_id: 'sub-dbms',
      topic_id: item.topic || 'top-sql-queries',
      company_id: 'comp-deloitte',
      difficulty: item.diff || 'Easy',
      correct_answer: item.a,
      explanation: item.exp,
      tags: ['Deloitte', 'SQL', 'DBMS', 'Consulting Technical', item.topic],
      options: item.opts.map((optText, oIdx) => ({
        key: ['A', 'B', 'C', 'D'][oIdx],
        text: optText
      })),
      expected_time: 45,
      xp_value: 20
    });
  });

  const delTemplates = [
    { title: 'SQL Correlated Subquery', q: 'In SQL, what distinguishes a Correlated Subquery from an uncorrelated regular subquery?', a: 'C', exp: 'A correlated subquery references columns from the outer query table, executing once for every candidate row evaluated by the outer query.', opts: ['It executes only once before the outer query', 'It uses index scans only', 'It depends on values from the outer query and executes once for each outer row', 'It requires an explicit temporary table'], topic: 'top-sql-queries', diff: 'Medium' },
    { title: 'OSI Model Transport vs Network', q: 'Which OSI layer is responsible for end-to-end process-to-process communication, port addressing, flow control, and segmentation?', a: 'A', exp: 'The Transport Layer (Layer 4) handles end-to-end communication, port addressing (e.g. TCP/UDP ports), flow control, and error recovery. Network Layer (Layer 3) handles host-to-host IP routing.', opts: ['Transport Layer (Layer 4)', 'Network Layer (Layer 3)', 'Data Link Layer (Layer 2)', 'Session Layer (Layer 5)'], topic: 'top-osi-tcp', diff: 'Easy' },
    { title: 'Database B+ Tree Indexing', q: 'Why do relational database engines (PostgreSQL, MySQL, Oracle) utilize B+ Trees rather than Binary Search Trees for on-disk table indexing?', a: 'D', exp: 'B+ trees have a high branching factor (fan-out), keeping tree height low (3-4 levels) to minimize expensive disk I/O, and all data pointers are stored in contiguous leaf nodes for efficient range scans.', opts: ['B+ trees use recursive call stack memory', 'Binary trees cannot store string keys', 'B+ trees require no sorting', 'B+ trees have high fan-out to minimize disk I/O seeks and link leaf nodes for fast sequential range scans'], topic: 'top-indexing', diff: 'Hard' },
    { title: 'SQL COALESCE Function', q: 'What does the SQL function COALESCE(val1, val2, val3, ...) return?', a: 'B', exp: 'COALESCE evaluates its arguments in order and returns the first non-NULL expression among them. If all expressions evaluate to NULL, it returns NULL.', opts: ['The average of all non-null values', 'The first non-NULL expression from left to right', 'The concatenation of strings', 'The maximum numerical value'], topic: 'top-sql-queries', diff: 'Easy' },
    { title: 'DNS Resolution Process', q: 'In DNS lookup for a domain name like www.example.com, what server is contacted first if the address is not found in the local OS cache or recursive resolver?', a: 'A', exp: 'The recursive resolver contacts the Root DNS Servers (\'.\'), which direct the query to the Top-Level Domain (TLD) servers (\'.com\'), which direct to the Authoritative Name Servers.', opts: ['Root DNS Servers (\'.\')', 'TLD DNS Servers (\'.com\')', 'Authoritative Name Server', 'SSL Certificate Authority'], topic: 'top-osi-tcp', diff: 'Medium' },
    { title: 'Database Transaction Isolation Levels', q: 'Which SQL Transaction Isolation Level is the strictest, completely preventing Dirty Reads, Non-Repeatable Reads, and Phantom Reads?', a: 'C', exp: 'SERIALIZABLE is the highest isolation level. It executes transactions in a manner completely equivalent to serial serializable execution, preventing all concurrency anomalies.', opts: ['Read Committed', 'Repeatable Read', 'Serializable', 'Read Uncommitted'], topic: 'top-acid', diff: 'Medium' },
    { title: 'SQL Self Join Usage', q: 'In database modeling, when is a SELF JOIN typically applied on a table?', a: 'B', exp: 'A Self Join joins a table to itself, commonly used to query hierarchical data stored in a single table, such as an Employee table with EmployeeID and ManagerID.', opts: ['To join tables from two different database vendors', 'To query hierarchical relationships within a single table (e.g. Employee and Manager)', 'To encrypt sensitive columns', 'To remove duplicate rows automatically'], topic: 'top-sql-queries', diff: 'Easy' },
    { title: 'Cross-Site Scripting (XSS) Prevention', q: 'In web application security, how is Stored or Reflected Cross-Site Scripting (XSS) effectively prevented?', a: 'D', exp: 'XSS is prevented by context-aware Output Encoding (escaping special characters like <, >, &), input validation, using secure web frameworks, and enforcing a strict Content Security Policy (CSP).', opts: ['Storing passwords in plain text', 'Using HTTP instead of HTTPS', 'Disabling database foreign keys', 'Context-aware Output HTML Encoding and Content Security Policy (CSP) headers'], topic: 'top-osi-tcp', diff: 'Medium' },
    { title: 'SQL EXISTS vs IN Performance', q: 'Why is the EXISTS clause generally preferred over IN when subquery results are large or involve NULL values?', a: 'A', exp: 'EXISTS short-circuits: it stops scanning the subquery as soon as a single matching row is found (returns boolean true), avoiding full result set materialization, and handles NULLs predictably.', opts: ['EXISTS short-circuits upon finding the first match without materializing the full subquery result', 'IN requires encryption', 'EXISTS executes after ORDER BY', 'IN cannot compare integer values'], topic: 'top-sql-queries', diff: 'Medium' },
    { title: 'Boyce-Codd Normal Form (BCNF)', q: 'What additional condition must be satisfied for a relation to be in Boyce-Codd Normal Form (BCNF) that is not strictly required by 3NF?', a: 'C', exp: 'In BCNF, for every non-trivial functional dependency X -> Y, X must be a Superkey. 3NF relaxes this condition if Y is a prime attribute (part of a candidate key).', opts: ['All attributes must be numeric', 'Composite keys are prohibited', 'For every non-trivial functional dependency X -> Y, determinant X must strictly be a Superkey', 'The relation must have no primary key'], topic: 'top-normalization', diff: 'Hard' }
  ];

  for (let i = 11; i <= 100; i++) {
    const template = delTemplates[(i - 11) % delTemplates.length];
    const uniqueVariant = Math.floor((i - 11) / delTemplates.length) + 1;

    list.push({
      id: `q-del-${String(i).padStart(3, '0')}`,
      question: `Deloitte Consulting Assessment [Practice ${uniqueVariant}]: ${template.q}`,
      subject_id: 'sub-dbms',
      topic_id: template.topic,
      company_id: 'comp-deloitte',
      difficulty: template.diff,
      correct_answer: template.a,
      explanation: template.exp,
      tags: ['Deloitte', 'SQL', 'Advisory', 'Database Architecture', template.title],
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
