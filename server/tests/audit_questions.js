import { initDb, db } from '../src/database/db.js';
import { seedDatabase } from '../src/database/seed.js';

async function auditQuestions() {
  await initDb();
  await seedDatabase(false);

  const questions = db.getAll('questions') || [];
  const options = db.getAll('questionOptions') || [];

  console.log(`Total questions in database: ${questions.length}`);
  console.log(`Total options in database: ${options.length}`);

  let noOptionsCount = 0;
  let invalidCorrectAnswerCount = 0;
  let mismatchedExplanationCount = 0;
  let unorderedOptionsCount = 0;
  let duplicateOptionKeyCount = 0;

  const issues = [];

  for (const q of questions) {
    const qOptions = options.filter(o => o.question_id === q.id);
    const validKeys = qOptions.map(o => (o.option_key || '').toUpperCase());

    if (qOptions.length === 0) {
      noOptionsCount++;
      issues.push({ id: q.id, issue: 'NO_OPTIONS', question: q.question });
      continue;
    }

    // Check duplicate option keys
    const uniqueKeys = new Set(validKeys);
    if (uniqueKeys.size !== validKeys.length) {
      duplicateOptionKeyCount++;
      issues.push({ id: q.id, issue: 'DUPLICATE_KEYS', keys: validKeys, question: q.question });
    }

    // Check if correct_answer matches any option_key
    const correctUpper = (q.correct_answer || '').trim().toUpperCase();
    if (!validKeys.includes(correctUpper)) {
      invalidCorrectAnswerCount++;
      issues.push({
        id: q.id,
        issue: 'CORRECT_ANSWER_NOT_IN_KEYS',
        correct_answer: q.correct_answer,
        validKeys,
        question: q.question
      });
    }

    // Check if explanation explicitly mentions a different option letter:
    // e.g. explanation says "Option B is correct", but correct_answer is 'A'
    const expl = q.explanation || '';
    const match = expl.match(/\b(?:Option|option|choice|answer)\s+([A-D])\b/i);
    if (match) {
      const explLetter = match[1].toUpperCase();
      if (explLetter !== correctUpper) {
        mismatchedExplanationCount++;
        issues.push({
          id: q.id,
          issue: 'EXPLANATION_MISMATCH',
          correct_answer: q.correct_answer,
          explanationLetter: explLetter,
          explanation: expl,
          question: q.question
        });
      }
    }
  }

  console.log(`\nAudit Results:`);
  console.log(`- Questions with no options: ${noOptionsCount}`);
  console.log(`- Questions with invalid correct_answer: ${invalidCorrectAnswerCount}`);
  console.log(`- Questions with duplicate option keys: ${duplicateOptionKeyCount}`);
  console.log(`- Questions with explanation letter mismatch: ${mismatchedExplanationCount}`);

  if (issues.length > 0) {
    console.log(`\nFound ${issues.length} total issues:`);
    console.log(JSON.stringify(issues.slice(0, 30), null, 2));
  } else {
    console.log('All questions have valid option keys and matching correct_answer!');
  }
}

auditQuestions().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
