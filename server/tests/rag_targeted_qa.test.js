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

  console.log('\n==================================================================');
  console.log('ALL 13 RAG TARGETED QA TESTS PASSED CLEANLY');
  console.log('==================================================================\n');
}

runRagQATests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
