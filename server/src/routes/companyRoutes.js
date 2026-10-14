import express from 'express';
import db from '../database/db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET /api/companies
router.get('/', (req, res) => {
  const companies = db.getAll('companies');
  const allQuestions = db.getAll('questions');
  const allSubjects = db.getAll('subjects');
  const allCodingProblems = db.getAll('codingProblems') || [];

  const enriched = companies.map(c => {
    const compQuestions = allQuestions.filter(q => q.company_id === c.id);
    const compCoding = allCodingProblems.filter(p => 
      p.company_id === c.id || (p.tags && p.tags.some(t => t.toLowerCase().includes(c.name.toLowerCase())))
    );
    const subjectIds = new Set(compQuestions.map(q => q.subject_id));
    const availableSubjects = allSubjects
      .filter(s => subjectIds.has(s.id))
      .map(s => s.name);

    return {
      ...c,
      question_count: compQuestions.length,
      coding_problem_count: compCoding.length,
      available_subjects: availableSubjects.length > 0 ? availableSubjects : ['Core DSA', 'DBMS', 'OOP', 'Aptitude'],
      difficulty_level: c.tier.includes('FAANG') ? 'Advanced' : 'Moderate to High'
    };
  });

  return res.json({ success: true, companies: enriched });
});

// GET /api/companies/:id
router.get('/:id', (req, res) => {
  const company = db.get('companies', req.params.id);
  if (!company) {
    return res.status(404).json({ success: false, message: 'Company not found.' });
  }

  const allQuestions = db.getAll('questions');
  const allOptions = db.getAll('questionOptions');
  const allSubjects = db.getAll('subjects');
  const allTopics = db.getAll('topics');

  const compQuestions = allQuestions.filter(q => q.company_id === company.id);
  const subjectIds = new Set(compQuestions.map(q => q.subject_id));
  const relevantSubjects = allSubjects.filter(s => subjectIds.has(s.id));

  const questionsWithDetails = compQuestions.map(q => {
    const subject = allSubjects.find(s => s.id === q.subject_id);
    const topic = allTopics.find(t => t.id === q.topic_id);
    const options = allOptions.filter(o => o.question_id === q.id);
    return {
      ...q,
      subject_name: subject?.name,
      topic_name: topic?.name,
      options: options.map(o => ({ option_key: o.option_key, option_text: o.option_text }))
    };
  });

  const allCodingProblems = db.getAll('codingProblems') || [];
  const compCodingProblems = allCodingProblems.filter(p => 
    p.company_id === company.id || 
    (p.tags && p.tags.some(t => t.toLowerCase().includes(company.name.toLowerCase())))
  );

  return res.json({
    success: true,
    company: {
      ...company,
      questions: questionsWithDetails,
      coding_problems: compCodingProblems,
      relevant_subjects: relevantSubjects,
      total_pattern_questions: compQuestions.length,
      total_coding_problems: compCodingProblems.length
    }
  });
});

export default router;
