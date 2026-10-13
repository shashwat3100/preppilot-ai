import express from 'express';
import db from '../database/db.js';

const router = express.Router();

// GET /api/branches
router.get('/branches', (req, res) => {
  const branches = db.getAll('branches');
  const allSubjects = db.getAll('subjects');

  const enriched = branches.map(b => {
    const branchSubjects = allSubjects.filter(s => s.branch_id === b.id);
    return {
      ...b,
      subjects: branchSubjects
    };
  });

  return res.json({ success: true, branches: enriched });
});

// GET /api/branches/subjects
router.get('/subjects', (req, res) => {
  const branchId = req.query.branch_id;
  let subjects = db.getAll('subjects');
  if (branchId) {
    subjects = subjects.filter(s => s.branch_id === branchId);
  }
  return res.json({ success: true, subjects });
});

// GET /api/branches/topics
router.get('/topics', (req, res) => {
  const subjectId = req.query.subject_id;
  let topics = db.getAll('topics');
  if (subjectId) {
    topics = topics.filter(t => t.subject_id === subjectId);
  }
  return res.json({ success: true, topics });
});

// GET /api/branches/roles
router.get('/roles', (req, res) => {
  const roles = db.getAll('jobRoles');
  return res.json({ success: true, roles });
});

export default router;
