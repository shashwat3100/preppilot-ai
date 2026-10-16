import assert from 'assert';
import RagService from '../src/services/ragService.js';

async function runRagQATests() {
  console.log('==================================================================');
  console.log('PrepPilot AI — RAG Targeted Question-Answering Test Suite');
  console.log('==================================================================');

  // Test 1: Convoy Effect query from user screenshot ("what effect is")
  const q1 = await RagService.answerStudentQuery('what effect is');
  assert(q1.answer.includes('Convoy Effect'), 'Answers what effect is with Convoy Effect');
  assert(!q1.answer.startsWith('### Operating Systems: Process Scheduling'), 'Does NOT dump raw document title');
  assert(q1.speechText.includes('Convoy Effect'), 'Voice synthesis speechText directly answers the question asked');
  assert(!q1.speechText.includes('###'), 'Voice speechText has no markdown syntax');
  console.log('  ✓ Query "what effect is" returns targeted Convoy Effect answer and speech');

  // Test 2: Belady Anomaly query
  const q2 = await RagService.answerStudentQuery('what is belady anomaly');
  assert(q2.answer.includes("Belady's Anomaly"), 'Answers with Belady Anomaly');
  assert(q2.speechText.includes("Belady's Anomaly"), 'SpeechText answers Belady Anomaly');
  console.log('  ✓ Query "what is belady anomaly" returns targeted Belady Anomaly answer');

  // Test 3: Thrashing in Virtual Memory
  const q3 = await RagService.answerStudentQuery('what is thrashing');
  assert(q3.answer.includes('Thrashing in Operating Systems Virtual Memory'), 'Answers with Thrashing');
  assert(q3.speechText.includes('Thrashing occurs'), 'SpeechText answers Thrashing directly');
  console.log('  ✓ Query "what is thrashing" returns targeted Thrashing answer');

  // Test 4: Trie data structure
  const q4 = await RagService.answerStudentQuery('what is a trie');
  assert(q4.answer.includes('Trie (Prefix Tree)'), 'Answers with Trie');
  assert(q4.speechText.includes('Trie or prefix tree'), 'SpeechText answers Trie directly');
  console.log('  ✓ Query "what is a trie" returns targeted Trie answer');

  // Test 5: Disjoint Set Union (DSU)
  const q5 = await RagService.answerStudentQuery('what is dsu');
  assert(q5.answer.includes('Disjoint Set Union'), 'Answers with DSU');
  assert(q5.speechText.includes('Disjoint Set Union'), 'SpeechText answers DSU directly');
  console.log('  ✓ Query "what is dsu" returns targeted DSU answer');

  // Test 6: Double Hashing
  const q6 = await RagService.answerStudentQuery('what is double hashing');
  assert(q6.answer.includes('Double Hashing'), 'Answers with Double Hashing');
  assert(q6.speechText.includes('Double Hashing'), 'SpeechText answers Double Hashing directly');
  console.log('  ✓ Query "what is double hashing" returns targeted Double Hashing answer');

  // Test 7: Extractive answering for general RAG document match
  const q7 = await RagService.answerStudentQuery('explain cpu scheduling algorithms');
  assert(q7.answer.includes('CPU Scheduling'), 'Extracts CPU scheduling topic');
  assert(q7.speechText.length > 20, 'Generates clean spoken speech text');
  console.log('  ✓ Extractive answering works cleanly for general curriculum queries');

  console.log('\n==================================================================');
  console.log('ALL 7 RAG TARGETED QA TESTS PASSED CLEANLY');
  console.log('==================================================================\n');
}

runRagQATests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
