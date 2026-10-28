import { initDb, db } from '../src/database/db.js';

async function printFirstAttempts() {
  await initDb();
  const attempts = db.find('attempts', a => a.user_id === 'user-013e20ae-b037-4c3e-98eb-fccd3449bef1');
  console.log(`First 14 attempts for Shashwat:`);
  for (const a of attempts.slice(0, 14)) {
    console.log(JSON.stringify(a, null, 2));
  }
}

printFirstAttempts();
