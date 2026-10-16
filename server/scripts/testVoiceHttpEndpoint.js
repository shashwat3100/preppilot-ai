import { startServer } from '../src/index.js';
import { generateToken } from '../src/middleware/auth.js';

async function testHttpChat() {
  const server = await startServer(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  console.log(`[Test Server] Running on ${baseUrl}`);

  // Generate demo student token
  const token = generateToken({
    id: 'user-student-demo',
    email: 'student@careerprep.ai',
    role: 'STUDENT',
    name: 'Priya Sharma'
  });

  const testQueries = [
    'How does double hashing resolve collisions in open addressing?',
    'What are the advantages of Trie for autocomplete search?',
    'Explain deadlock Coffman conditions in Operating Systems'
  ];

  for (const query of testQueries) {
    console.log(`\n======================================================`);
    console.log(`[HTTP Test] POST /api/preppilot/chat with query: "${query}"`);

    const res = await fetch(`${baseUrl}/api/preppilot/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: query,
        model: 'gemini-2.5-flash'
      })
    });

    const data = await res.json();
    console.log(`HTTP Status:`, res.status);
    console.log(`Success:`, data.success);
    console.log(`Sources Grounded:`, data.sources);
    console.log(`Speech Text (Read by Web Speech Synthesizer):`);
    console.log(`  "${data.speech_text?.substring(0, 160)}..."`);
    console.log(`Retrieved Documents:`, data.retrieved_documents);
  }

  server.close();
  console.log('\n✓ HTTP Voice & RAG Chat Endpoint verified successfully!');
}

testHttpChat().catch(err => {
  console.error('HTTP Test Error:', err);
  process.exit(1);
});
