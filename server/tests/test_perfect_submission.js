import { initDb, db } from '../src/database/db.js';
import { seedDatabase } from '../src/database/seed.js';
import QuizEngine from '../src/services/quizEngine.js';

async function testPerfectSubmission() {
  await initDb();
  await seedDatabase(false);

  const student = db.findOne('users', u => u.role === 'STUDENT');
  console.log('Testing with student:', student.id, student.name);

  // Generate Adaptive Quiz
  const quiz = QuizEngine.generateAdaptiveDailyQuiz(student.id, 5);
  console.log(`Generated quiz: ${quiz.session_id} with ${quiz.questions.length} questions`);

  const answers = quiz.questions.map(q => {
    // Get full question from DB to know the true correct_answer
    const fullQ = db.get('questions', q.id);
    console.log(`\nQ: ${q.question.substring(0, 60)}...`);
    console.log(`  Expected correct_answer in DB: Option (${fullQ.correct_answer})`);
    
    // Choose the EXACT correct_answer
    const chosen = fullQ.correct_answer;
    const chosenOpt = q.options.find(o => o.option_key === chosen);
    console.log(`  Submitting chosen answer: Option (${chosen}) "${chosenOpt?.option_text}"`);

    return {
      question_id: q.id,
      answer: chosen,
      time_spent: 25
    };
  });

  const result = QuizEngine.submitQuiz(quiz.session_id, student.id, answers, 125);
  console.log('\n================ SCORECARD ================');
  console.log(`Score: ${result.accuracy_rate}%`);
  console.log(`Correct count: ${result.correct_count} / ${result.total_questions}`);
  console.log(`XP Earned: ${result.xp_earned}`);

  for (const g of result.graded_questions) {
    console.log(`\nQuestion: ${g.question.substring(0, 50)}...`);
    console.log(`  Chosen: ${g.chosen_answer} ("${g.chosen_text}")`);
    console.log(`  Correct: ${g.correct_answer} ("${g.correct_text}")`);
    console.log(`  is_correct: ${g.is_correct}`);
    console.log(`  Why: ${g.is_correct ? g.why_correct : g.why_incorrect}`);
  }
}

testPerfectSubmission();
