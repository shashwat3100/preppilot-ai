import assert from 'assert';
import RagService from '../src/services/ragService.js';
import db from '../src/database/db.js';

async function runRagQATests() {
  console.log('==================================================================');
  console.log('PrepPilot AI — RAG Targeted Question-Answering Test Suite');
  console.log('==================================================================');

  // Test 1: Array query ("what is array" from user screenshot)
  const qArray = await RagService.answerStudentQuery('what is array');
  assert(qArray.answer.includes('What is an Array?'), 'Answers what is array with What is an Array');
  assert(!qArray.answer.includes('Top Repeated Coding Patterns in TCS'), 'Does NOT dump TCS coding patterns for array definition');
  assert(qArray.answer.includes('Contiguous Memory Allocation'), 'Includes core contiguous memory characteristic');
  assert(qArray.speechText.includes('An array is a linear data structure'), 'Spoken speechText directly explains what an array is');
  console.log('  ✓ Query "what is array" returns targeted Gemini-grade Array definition & speech');

  // Test 2: Linked list query
  const qList = await RagService.answerStudentQuery('what is linked list');
  assert(qList.answer.includes('What is a Linked List?'), 'Answers with Linked List');
  assert(qList.speechText.includes('A linked list is a linear data structure'), 'Spoken speech explains linked list');
  console.log('  ✓ Query "what is linked list" returns targeted Linked List answer');

  // Test 3: Stack query
  const qStack = await RagService.answerStudentQuery('what is stack');
  assert(qStack.answer.includes('What is a Stack?'), 'Answers with Stack');
  assert(qStack.speechText.includes('Last-In, First-Out'), 'Spoken speech explains LIFO');
  console.log('  ✓ Query "what is stack" returns targeted Stack answer');

  // Test 4: Tree query
  const qTree = await RagService.answerStudentQuery('what is tree');
  assert(qTree.answer.includes('Binary Tree & Binary Search Tree'), 'Answers with Tree / BST');
  assert(qTree.speechText.includes('Binary Search Tree'), 'Spoken speech explains BST');
  console.log('  ✓ Query "what is tree" returns targeted Tree answer');

  // Test 5: Graph query
  const qGraph = await RagService.answerStudentQuery('what is graph');
  assert(qGraph.answer.includes('What is a Graph Data Structure?'), 'Answers with Graph');
  assert(qGraph.speechText.includes('vertices and edges'), 'Spoken speech explains Graph');
  console.log('  ✓ Query "what is graph" returns targeted Graph answer');

  // Test 6: OOP query
  const qOOP = await RagService.answerStudentQuery('what is oop');
  assert(qOOP.answer.includes('The Four Pillars'), 'Answers with OOP pillars');
  assert(qOOP.speechText.includes('four pillars of Object-Oriented Programming'), 'Spoken speech explains OOP');
  console.log('  ✓ Query "what is oop" returns targeted OOP answer');

  // Test 7: Convoy Effect query from user screenshot ("what effect is")
  const q1 = await RagService.answerStudentQuery('what effect is');
  assert(q1.answer.includes('Convoy Effect'), 'Answers what effect is with Convoy Effect');
  assert(!q1.answer.startsWith('### Operating Systems: Process Scheduling'), 'Does NOT dump raw document title');
  assert(q1.speechText.includes('Convoy Effect'), 'Voice synthesis speechText directly answers the question asked');
  assert(!q1.speechText.includes('###'), 'Voice speechText has no markdown syntax');
  console.log('  ✓ Query "what effect is" returns targeted Convoy Effect answer and speech');

  // Test 8: Belady Anomaly query
  const q2 = await RagService.answerStudentQuery('what is belady anomaly');
  assert(q2.answer.includes("Belady's Anomaly"), 'Answers with Belady Anomaly');
  assert(q2.speechText.includes("Belady's Anomaly"), 'SpeechText answers Belady Anomaly');
  console.log('  ✓ Query "what is belady anomaly" returns targeted Belady Anomaly answer');

  // Test 9: Thrashing in Virtual Memory
  const q3 = await RagService.answerStudentQuery('what is thrashing');
  assert(q3.answer.includes('Thrashing in Operating Systems Virtual Memory'), 'Answers with Thrashing');
  assert(q3.speechText.includes('Thrashing occurs'), 'SpeechText answers Thrashing directly');
  console.log('  ✓ Query "what is thrashing" returns targeted Thrashing answer');

  // Test 10: Trie data structure
  const q4 = await RagService.answerStudentQuery('what is a trie');
  assert(q4.answer.includes('Trie (Prefix Tree)'), 'Answers with Trie');
  assert(q4.speechText.includes('Trie or prefix tree'), 'SpeechText answers Trie directly');
  console.log('  ✓ Query "what is a trie" returns targeted Trie answer');

  // Test 11: Disjoint Set Union (DSU)
  const q5 = await RagService.answerStudentQuery('what is dsu');
  assert(q5.answer.includes('Disjoint Set Union'), 'Answers with DSU');
  assert(q5.speechText.includes('Disjoint Set Union'), 'SpeechText answers DSU directly');
  console.log('  ✓ Query "what is dsu" returns targeted DSU answer');

  // Test 12: Double Hashing
  const q6 = await RagService.answerStudentQuery('what is double hashing');
  assert(q6.answer.includes('Double Hashing'), 'Answers with Double Hashing');
  assert(q6.speechText.includes('Double Hashing'), 'SpeechText answers Double Hashing directly');
  console.log('  ✓ Query "what is double hashing" returns targeted Double Hashing answer');

  // Test 13: Extractive answering for general RAG document match
  const q7 = await RagService.answerStudentQuery('explain cpu scheduling algorithms');
  assert(q7.answer.includes('CPU Scheduling'), 'Extracts CPU scheduling topic');
  assert(q7.speechText.length > 20, 'Generates clean spoken speech text');
  console.log('  ✓ Extractive answering works cleanly for general curriculum queries');

  // Test 14: Question serving intent ("give me five question")
  const qQuestions = await RagService.answerStudentQuery('give me five question');
  assert(qQuestions.answer.includes('Practice Placement Questions'), 'Returns practice placement questions');
  assert(qQuestions.answer.includes('Question 1'), 'Includes Question 1');
  assert(qQuestions.answer.includes('Question 5'), 'Includes Question 5');
  assert(qQuestions.answer.includes('Correct Answer:'), 'Includes answer key and explanations');
  assert(qQuestions.speechText.includes('placement questions'), 'SpeechText explains questions');
  console.log('  ✓ Query "give me five question" delivers 5 questions with options and explanations');

  // Test 15: TCS Ninja 20-Day roadmap intent
  const qRoadmap = await RagService.answerStudentQuery('2 minute 20 days a questions for a TCS Ninja placement interview ground by easy medium and hard');
  assert(qRoadmap.answer.includes('20-Day TCS Ninja Placement Preparation Roadmap'), 'Returns 20-day roadmap');
  assert(qRoadmap.answer.includes('Phase 1: Days 1–6 (Easy'), 'Includes Easy phase');
  assert(qRoadmap.answer.includes('Phase 2: Days 7–14 (Medium'), 'Includes Medium phase');
  assert(qRoadmap.answer.includes('Phase 3: Days 15–20 (Hard'), 'Includes Hard phase');
  assert(qRoadmap.speechText.includes('20-day TCS Ninja preparation plan'), 'SpeechText summarizes roadmap');
  console.log('  ✓ Query "20 days TCS Ninja... easy medium hard" returns structured preparation roadmap');

  // Test 16: Platform access without login intent
  const qLogin = await RagService.answerStudentQuery('can I access the student that would without login in');
  assert(qLogin.answer.includes('PrepPilot Platform Access: Public vs. Student Login'), 'Answers login access query');
  assert(qLogin.answer.includes('What You Can Access Without Logging In:'), 'Explains public access');
  assert(qLogin.answer.includes('Features Requiring a Student Login:'), 'Explains student login requirements');
  assert(qLogin.speechText.includes('logging into your student account is required'), 'SpeechText clarifies login requirement');
  // Test 17: Company targeting intent ("how can I target Google")
  const qGoogle = await RagService.answerStudentQuery('how can I target Google');
  assert(qGoogle.answer.includes('How to Target and Crack Google'), 'Answers how to target Google');
  assert(qGoogle.answer.includes('Google Online Challenge'), 'Includes Google hiring pipeline');
  assert(qGoogle.answer.includes('Segment Trees, Trie & Dynamic Programming'), 'Includes technical focus areas');
  assert(qGoogle.speechText.includes('To target Google'), 'SpeechText explains targeting Google');
  console.log('  ✓ Query "how can I target Google" returns structured hiring blueprint & 4-step action plan');

  // Test 18: All companies query from user screenshot ("listed on your platform and tell me about each and every company which are listed on your platform")
  const qAllComps = await RagService.answerStudentQuery('listed on your platform and tell me about each and every company which are listed on your platform');
  assert(qAllComps.answer.includes('Recruitment Companies Listed on PrepPilot AI'), 'Answers with all companies directory');
  assert(qAllComps.answer.includes('Google'), 'Includes Google');
  assert(qAllComps.answer.includes('Amazon'), 'Includes Amazon');
  assert(qAllComps.answer.includes('TCS'), 'Includes TCS');
  assert(qAllComps.answer.includes('Infosys'), 'Includes Infosys');
  assert(!qAllComps.answer.includes('First Normal Form (1NF)'), 'Does NOT dump database normalization 1NF!');
  assert(qAllComps.speechText.includes('PrepPilot AI features 10 recruitment company blueprints'), 'SpeechText summarizes companies cleanly');
  console.log('  ✓ Query "listed on your platform and tell me about each and every company..." returns all 10 companies directory');

  // Test 19: Direct company overview ("tell me about Amazon")
  const qAboutAmazon = await RagService.answerStudentQuery('tell me about Amazon');
  assert(qAboutAmazon.answer.includes('How to Target and Crack Amazon'), 'Returns Amazon blueprint');
  assert(qAboutAmazon.answer.includes('Leadership Principles'), 'Includes Amazon specifics');
  assert(qAboutAmazon.speechText.includes('To target Amazon'), 'SpeechText directly addresses Amazon');
  console.log('  ✓ Query "tell me about Amazon" triggers company blueprint directly');

  // Test 20: Supported engineering branches query ("what branches are supported")
  const qBranches = await RagService.answerStudentQuery('what branches are supported on this platform');
  assert(qBranches.answer.includes('Supported Engineering Branches on PrepPilot AI'), 'Returns branches');
  assert(qBranches.answer.includes('Computer Science and Engineering (CSE)'), 'Includes CSE');
  assert(qBranches.answer.includes('Mechanical Engineering'), 'Includes Mechanical Engineering');
  assert(qBranches.answer.includes('Civil Engineering'), 'Includes Civil Engineering');
  assert(qBranches.answer.includes('Robotics and Artificial Intelligence'), 'Includes Robotics and AI');
  assert(qBranches.speechText.includes('12 engineering branches'), 'SpeechText mentions 12 branches');
  console.log('  ✓ Query "what branches are supported..." returns 12 engineering disciplines');


  // Test 21: Coding arena query ("tell me about the coding arena")
  const qCoding = await RagService.answerStudentQuery('tell me about the coding arena and what problems can I practice');
  assert(qCoding.answer.includes('PrepPilot Interactive Coding Arena'), 'Returns coding arena overview');
  assert(qCoding.answer.includes('18 Algorithmic Challenges'), 'Mentions 18 challenges');
  assert(qCoding.speechText.includes('18 curated algorithmic problems'), 'SpeechText explains coding problems');
  console.log('  ✓ Query "tell me about the coding arena..." returns coding platform features');

  // Test 22: Platform overview ("what can PrepPilot do")
  const qOverview = await RagService.answerStudentQuery('what can PrepPilot do');
  assert(qOverview.answer.includes('PrepPilot AI: B.Tech Placement & Curriculum Copilot'), 'Returns platform overview');
  assert(qOverview.speechText.includes('B.Tech placement copilot'), 'SpeechText summarizes PrepPilot');
  console.log('  ✓ Query "what can PrepPilot do" returns comprehensive platform features');

  // Test 23: Quantitative Aptitude ("time and work formulas")
  const qWork = await RagService.answerStudentQuery('explain time and work formulas with LCM method');
  assert(qWork.answer.includes('Time & Work (The LCM Rate Method)'), 'Answers with LCM method');
  assert(qWork.speechText.includes('LCM method'), 'SpeechText mentions LCM method');
  console.log('  ✓ Query "explain time and work formulas..." returns targeted Aptitude LCM framework & speech');

  // Test 24: Relative Speed & Distance ("how to calculate relative speed for trains")
  const qSpeed = await RagService.answerStudentQuery('how to calculate relative speed for trains');
  assert(qSpeed.answer.includes('Speed, Distance & Time Master Guide'), 'Answers with speed distance guide');
  assert(qSpeed.speechText.includes('speed, distance, and time'), 'SpeechText includes speed and distance');
  console.log('  ✓ Query "how to calculate relative speed for trains" returns relative motion principles');

  // Test 25: Syllogisms in Logical Reasoning ("explain syllogisms rules")
  const qSyll = await RagService.answerStudentQuery('explain syllogisms rules and either or cases');
  assert(qSyll.answer.includes('Syllogisms & Deductive Logic'), 'Answers with syllogisms framework');
  assert(qSyll.speechText.includes('syllogisms'), 'SpeechText directly addresses syllogisms');
  console.log('  ✓ Query "explain syllogisms rules..." returns deductive rules & Either/Or conditions');

  // Test 26: SOLID Principles ("what are solid principles")
  const qSolid = await RagService.answerStudentQuery('what are solid principles in oops');
  assert(qSolid.answer.includes('SOLID Principles of Object-Oriented Design'), 'Answers with SOLID principles');
  assert(qSolid.speechText.includes('SOLID principles'), 'SpeechText explains SOLID');
  console.log('  ✓ Query "what are solid principles..." returns 5 SOLID architecture principles');

  // Test 27: Binary Search ("how does binary search work")
  const qBinary = await RagService.answerStudentQuery('how does binary search work and what is the time complexity');
  assert(qBinary.answer.includes('Binary Search Algorithm'), 'Answers with binary search');
  assert(qBinary.speechText.includes('Binary Search is a divide-and-conquer algorithm'), 'SpeechText explains binary search');
  console.log('  ✓ Query "how does binary search work..." returns binary search mechanics & overflow prevention');

  // Test 28: System Design & Caching ("explain system design and load balancing")
  const qSys = await RagService.answerStudentQuery('explain system design and load balancing');
  assert(qSys.answer.includes('System Design & High-Scale Web Architecture Essentials'), 'Answers with system design');
  assert(qSys.speechText.includes('System design'), 'SpeechText explains system design');
  console.log('  ✓ Query "explain system design..." returns load balancing, caching, and CAP theorem');

  // Test 29: Dean/Admin Institutional Performance & Diagrams
  const deanUser = db.find('users', u => u.role === 'DEAN')[0] || { id: 'dean-01', role: 'DEAN', name: 'Dean' };
  const qDeanDiagram = await RagService.answerStudentQuery('how students performace is going on with diagram', deanUser);
  assert(qDeanDiagram.answer.includes('Institutional Student Performance'), 'Dean receives institutional performance report');
  assert(qDeanDiagram.answer.includes('```mermaid'), 'Dean report includes Mermaid diagram');
  assert(qDeanDiagram.answer.includes('Department Performance Benchmark'), 'Dean report includes 12 department benchmarks');
  assert(qDeanDiagram.answer.includes('844'), 'Dean report monitors full 844 student cohort');
  assert(qDeanDiagram.speechText.includes('Dean and Academic Administrator Briefing'), 'Dean speech provides executive oral briefing');
  console.log('  ✓ Query "how students performace is going on with diagram" delivers institutional metrics & diagram for Dean');

  // Test 30: Student Personal Stats & Genuine Tips
  const stdUser = db.find('users', u => u.role === 'STUDENT' && u.email === 'student@preppilot.ai')[0] || { id: 'std-01', role: 'STUDENT', name: 'Aditya Sharma', email: 'student@preppilot.ai' };
  const qStudentPersonal = await RagService.answerStudentQuery('show my states and area of improvement with geniun tip', stdUser);
  assert(qStudentPersonal.answer.includes('Your Personal Performance Scorecard'), 'Student receives private scorecard');
  assert(qStudentPersonal.answer.includes('Your Subject Mastery Diagram'), 'Student receives personal mastery progress bar diagram');
  assert(qStudentPersonal.answer.includes('Identified Areas of Improvement'), 'Student receives identified learning gaps');
  assert(qStudentPersonal.answer.includes('Genuine Pedagogical Tip:'), 'Student receives concrete genuine tips');
  assert(qStudentPersonal.answer.includes('Recommended 7-Day Action Plan'), 'Student receives recommended study plan');
  assert(!qStudentPersonal.answer.includes('844 enrolled students'), 'Student is isolated from institutional department benchmarks');
  console.log('  ✓ Query "show my states and area of improvement with geniun tip" delivers private stats & genuine tips for Student');

  // Test 31: Student Restricted from Institutional Data (Strict Data Isolation)
  const qStudentBlocked = await RagService.answerStudentQuery('how students performace is going on with diagram', stdUser);
  assert(qStudentBlocked.answer.includes('Institutional Data Privacy Restriction'), 'Student privacy notice triggered on institutional query');
  assert(qStudentBlocked.answer.includes('restricted strictly to Dean and Academic Administration credentials'), 'Clarifies credential segregation');
  assert(qStudentBlocked.answer.includes('Your Personal Performance Scorecard'), 'Pivots to student private scorecard');
  assert(qStudentBlocked.speechText.includes('restricted to Dean and Academic Administration credentials'), 'Speech clarifies data isolation');
  console.log('  ✓ Query "how students performace is going on with diagram" strictly isolates student from college-wide data');

  // Test 32: Unauthenticated Query Access Guidance
  const qGuest = await RagService.answerStudentQuery('show my stats and area of improvement with genuine tip', null);
  assert(qGuest.answer.includes('Student Performance & Scorecard Access'), 'Guest receives login prompt for personal scorecard');
  console.log('  ✓ Unauthenticated query provides clear login guidance for scorecard access');

  console.log('\n==================================================================');
  console.log('ALL 32 RAG TARGETED QA TESTS PASSED CLEANLY (100%)');
  console.log('==================================================================\n');
}

runRagQATests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
