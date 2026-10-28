import { initDb, db } from '../src/database/db.js';

async function deepAuditQuestions() {
  await initDb();

  const questions = db.getAll('questions') || [];
  const options = db.getAll('questionOptions') || [];

  const flagged = [];

  for (const q of questions) {
    const qOpts = options.filter(o => o.question_id === q.id);
    const correctOpt = qOpts.find(o => (o.option_key || '').toUpperCase() === (q.correct_answer || '').toUpperCase());

    if (!correctOpt) {
      flagged.push({ id: q.id, type: 'MISSING_CORRECT_OPTION', question: q.question, correct_answer: q.correct_answer });
      continue;
    }

    const expl = q.explanation || '';
    const qText = q.question || '';
    const correctText = correctOpt.option_text || '';

    // Check if correctText is suspiciously short or placeholder
    if (correctText.trim().length === 0) {
      flagged.push({ id: q.id, type: 'EMPTY_CORRECT_TEXT', question: qText });
    }

    // Check for negative questions: "NOT", "EXCEPT", "INCORRECT", "FALSE"
    // Sometimes the creator forgot it was a negative question and marked the TRUE statement as correct!
    const isNegative = /\b(NOT|EXCEPT|FALSE|INCORRECT|CANNOT|CAN NOT)\b/i.test(qText);

    // Check if explanation says "Therefore, Option X is correct" or "Answer is X"
    const match = expl.match(/(?:therefore|hence|so|thus|correct answer is|correct option is|answer is|option)\s*:?\s*\(?([A-D])\)?/i);
    if (match) {
      const statedLetter = match[1].toUpperCase();
      if (statedLetter !== q.correct_answer.toUpperCase()) {
        flagged.push({
          id: q.id,
          type: 'EXPLANATION_LETTER_MISMATCH',
          question: qText.substring(0, 80),
          correct_answer: q.correct_answer,
          statedInExplanation: statedLetter,
          explanation: expl.substring(0, 150)
        });
      }
    }

    // Check if correctText is mentioned in explanation vs other options
    // For quantitative questions with numbers: e.g. "30", "684", "252"
    for (const opt of qOpts) {
      if (opt.option_key !== q.correct_answer) {
        // If the explanation explicitly says "Option X is the answer" for a wrong option
        const wrongOptionMatch = new RegExp(`Option\\s+\\(?${opt.option_key}\\)?\\s+is\\s+(?:the\\s+)?correct`, 'i');
        if (wrongOptionMatch.test(expl)) {
          flagged.push({
            id: q.id,
            type: 'EXPLANATION_SAYS_OTHER_OPTION_CORRECT',
            question: qText.substring(0, 80),
            correct_answer: q.correct_answer,
            wrongOptionReferenced: opt.option_key,
            explanation: expl.substring(0, 150)
          });
        }
      }
    }
  }

  console.log(`Deep audit found ${flagged.length} potential issues:`);
  console.log(JSON.stringify(flagged, null, 2));
}

deepAuditQuestions();
