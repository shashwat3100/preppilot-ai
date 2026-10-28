import { initDb, db } from '../src/database/db.js';

async function checkOptionIsCorrectFlag() {
  await initDb();

  const questions = db.getAll('questions') || [];
  const options = db.getAll('questionOptions') || [];

  let flagMismatchCount = 0;
  const flagMismatches = [];

  for (const q of questions) {
    const qOpts = options.filter(o => o.question_id === q.id);
    for (const opt of qOpts) {
      if (opt.is_correct !== undefined && opt.is_correct !== null) {
        const shouldBeCorrect = (opt.option_key || '').toUpperCase() === (q.correct_answer || '').toUpperCase();
        if (Boolean(opt.is_correct) !== shouldBeCorrect) {
          flagMismatchCount++;
          flagMismatches.push({
            qId: q.id,
            question: q.question.substring(0, 60),
            optKey: opt.option_key,
            optText: opt.option_text,
            optIsCorrect: opt.is_correct,
            questionCorrectAnswer: q.correct_answer
          });
        }
      }
    }
  }

  console.log(`Total questions checked: ${questions.length}`);
  console.log(`Flag mismatches (opt.is_correct vs q.correct_answer): ${flagMismatchCount}`);
  if (flagMismatches.length > 0) {
    console.log('Examples of flag mismatches:', JSON.stringify(flagMismatches.slice(0, 15), null, 2));
  }
}

checkOptionIsCorrectFlag();
