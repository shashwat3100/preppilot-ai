import assert from 'assert';
import RagService from '../src/services/ragService.js';

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
  assert(qBranches.answer.includes('Computer Science Engineering (CSE)'), 'Includes CSE');
  assert(qBranches.answer.includes('Mechanical Engineering (ME)'), 'Includes ME');
  assert(qBranches.speechText.includes('9 engineering branches'), 'SpeechText mentions 9 branches');
  console.log('  ✓ Query "what branches are supported..." returns 9 engineering disciplines');

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

  console.log('\n==================================================================');
  console.log('ALL 22 RAG TARGETED QA TESTS PASSED CLEANLY');
  console.log('==================================================================\n');
}

runRagQATests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
