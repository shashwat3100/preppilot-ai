import { initDb, db } from '../src/database/db.js';
import RagService from '../src/services/ragService.js';
import pg from 'pg';

async function testRag() {
  await initDb();
  const allDocs = db.getAll('knowledgeDocuments');
  console.log(`\n======================================================`);
  console.log(`[1] SQLite Knowledge Documents Check: Total = ${allDocs.length}`);
  allDocs.forEach(d => console.log(`  - [${d.id}] ${d.title}`));

  // Check Postgres RAG Documents
  try {
    const client = new pg.Client({ connectionString: 'postgres://postgres:Pranjal%4025@localhost:1111/careerprep' });
    await client.connect();
    const pgDocs = await client.query('SELECT id, title, category FROM knowledge_documents');
    console.log(`\n======================================================`);
    console.log(`[2] PostgreSQL 18 Knowledge Documents Check: Total = ${pgDocs.rows.length}`);
    pgDocs.rows.forEach(d => console.log(`  - [${d.id}] ${d.title}`));

    // Test PostgreSQL Full-Text Vector Search
    const searchTerms = ['hashing', 'trie', 'dsu', 'normalization', 'deadlock', 'virtual memory'];
    console.log(`\n======================================================`);
    console.log(`[3] PostgreSQL 18 tsvector Full-Text Searches:`);
    for (const term of searchTerms) {
      const fts = await client.query(`
        SELECT id, title, ts_rank(search_vector, plainto_tsquery('english', $1)) as rank
        FROM knowledge_documents
        WHERE search_vector @@ plainto_tsquery('english', $1)
        ORDER BY rank DESC
        LIMIT 1;
      `, [term]);
      if (fts.rows.length > 0) {
        console.log(`  ✓ Query "${term}" -> Matched: "${fts.rows[0].title}" (Rank: ${fts.rows[0].rank})`);
      } else {
        console.log(`  ✗ Query "${term}" -> No match`);
      }
    }
    await client.end();
  } catch (err) {
    console.log('PostgreSQL check skipped/error:', err.message);
  }

  // Test Voice & RAG Service Grounding
  console.log(`\n======================================================`);
  console.log(`[4] RagService.answerStudentQuery (Voice & Content Grounding):`);

  const testQueries = [
    'How does double hashing solve collision in hash tables?',
    'Explain Trie prefix tree time complexity and search',
    'What is path compression in Disjoint Set Union DSU?',
    'Explain 1NF to BCNF normalization in DBMS'
  ];

  for (const q of testQueries) {
    const res = await RagService.answerStudentQuery(q);
    console.log(`\n------------------------------------------------------`);
    console.log(`Query: "${q}"`);
    console.log(`Sources Found:`, res.sources);
    console.log(`Speech Text:`, res.speechText?.substring(0, 140) + '...');
    console.log(`Reply Preview:`, res.answer.substring(0, 160).replace(/\n/g, ' ') + '...');
  }
}

testRag().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
