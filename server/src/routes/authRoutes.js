import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '../database/db.js';
import { generateToken, authenticate } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      branch_id,
      year,
      graduation_year,
      preferred_job_role_id,
      target_companies = [],
      skill_level = 'Intermediate',
      areas_of_interest = []
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existingUser = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = `user-${crypto.randomUUID()}`;

    const newUser = {
      id: userId,
      name,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      role: 'STUDENT',
      branch_id: branch_id || 'branch-cse',
      year: year || '4th Year',
      graduation_year: graduation_year ? parseInt(graduation_year) : 2026,
      preferred_job_role_id: preferred_job_role_id || 'role-sde',
      target_companies: Array.isArray(target_companies) ? target_companies : [target_companies],
      skill_level: skill_level || 'Intermediate',
      areas_of_interest: Array.isArray(areas_of_interest) ? areas_of_interest : [areas_of_interest],
      total_xp: 50, // Welcome bonus XP!
      current_level: 1,
      current_streak: 1,
      longest_streak: 1,
      last_active_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.insert('users', newUser);

    // Initialize streak record
    db.insert('streaks', {
      id: `streak-${userId}`,
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_activity_date: new Date().toISOString().split('T')[0],
      streak_freeze_count: 2
    });

    // Record welcome XP
    db.insert('xpHistory', {
      id: `xph-${crypto.randomUUID()}`,
      user_id: userId,
      amount: 50,
      action_type: 'WELCOME_BONUS',
      created_at: new Date().toISOString()
    });

    const token = generateToken(newUser);
    const { password_hash, ...safeUser } = newUser;

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to CareerPrep AI.',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('[Auth Register Error]:', err);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
    }

    if (user.is_blocked || user.status === 'BLOCKED') {
      return res.status(403).json({
        success: false,
        message: 'Your student profile has been blocked/suspended by the Placement Administrator. Please contact the placement cell.'
      });
    }

    const token = generateToken(user);
    const { password_hash, ...safeUser } = user;

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('[Auth Login Error]:', err);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// In-memory password resets store
const passwordResets = new Map();

// POST /api/auth/register-dean
router.post('/register-dean', async (req, res) => {
  try {
    const { name, email, password, passcode, designation, department } = req.body;

    if (!name || !email || !password || !passcode) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and institutional passcode are required.' });
    }

    // Verify institutional dean authorization passcode
    const VALID_PASSCODES = ['DEAN2026', 'CAMPUS-ADMIN', 'TPO2026'];
    if (!VALID_PASSCODES.includes(passcode.trim().toUpperCase())) {
      return res.status(403).json({
        success: false,
        message: 'Invalid Institutional Security Passcode. Only authorized faculty and placement deans can register with this code (Hint: DEAN2026).'
      });
    }

    const existingUser = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      if (existingUser.role === 'ADMIN') {
        return res.status(400).json({
          success: false,
          message: 'A Placement Dean account already exists with this email address. Please sign in directly from the Dean portal.'
        });
      }

      // Upgrade existing student account to Placement Dean
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const updatedUser = db.update('users', existingUser.id, {
        name: name || existingUser.name,
        role: 'ADMIN',
        password_hash: passwordHash,
        designation: designation || 'Placement Dean & Officer',
        department: department || 'Training & Placement Cell',
        is_blocked: false,
        status: 'ACTIVE'
      });

      const token = generateToken(updatedUser);
      const { password_hash, ...safeUser } = updatedUser;

      return res.status(200).json({
        success: true,
        message: 'Account successfully upgraded to Placement Dean! Full administrative privileges granted.',
        token,
        user: safeUser
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = `user-dean-${crypto.randomUUID()}`;

    const newDean = {
      id: userId,
      name,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      role: 'ADMIN',
      designation: designation || 'Placement Dean & Officer',
      department: department || 'Training & Placement Cell',
      branch_id: 'branch-cse',
      year: 'Faculty / Admin',
      graduation_year: 2018,
      preferred_job_role_id: 'role-sde',
      target_companies: ['comp-tcs', 'comp-infosys', 'comp-wipro', 'comp-accenture'],
      skill_level: 'Advanced',
      areas_of_interest: ['Campus Placement Drives', 'Assessment Evaluation', 'Curriculum Mapping'],
      total_xp: 2500,
      current_level: 10,
      current_streak: 30,
      longest_streak: 45,
      last_active_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_blocked: false,
      status: 'ACTIVE'
    };

    db.insert('users', newDean);

    const token = generateToken(newDean);
    const { password_hash, ...safeUser } = newDean;

    return res.status(201).json({
      success: true,
      message: 'Placement Dean / Officer account created successfully! Full administrative privileges granted.',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('[Dean Register Error]:', err);
    return res.status(500).json({ success: false, message: 'Server error during Dean account registration.' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your registered email address.' });
    }

    const user = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered account found with this email address.' });
    }

    // Generate 6-digit verification code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

    passwordResets.set(email.toLowerCase(), {
      code: resetCode,
      userId: user.id,
      expiresAt
    });

    return res.json({
      success: true,
      message: `Password reset verification PIN generated for ${email}.`,
      verification_pin: resetCode,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    console.error('[Forgot Password Error]:', err);
    return res.status(500).json({ success: false, message: 'Server error processing password reset.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, verification_pin, new_password } = req.body;

    if (!email || !verification_pin || !new_password) {
      return res.status(400).json({ success: false, message: 'Email, verification PIN, and new password are required.' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const record = passwordResets.get(email.toLowerCase());
    if (!record) {
      return res.status(400).json({ success: false, message: 'No active password reset request found or request expired. Please request a new PIN.' });
    }

    if (Date.now() > record.expiresAt) {
      passwordResets.delete(email.toLowerCase());
      return res.status(400).json({ success: false, message: 'Verification PIN has expired. Please request a new one.' });
    }

    if (record.code !== verification_pin.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid verification PIN. Please enter the correct 6-digit code.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(new_password, salt);

    db.update('users', record.userId, {
      password_hash: passwordHash,
      updated_at: new Date().toISOString()
    });

    passwordResets.delete(email.toLowerCase());

    return res.json({
      success: true,
      message: 'Password successfully updated! You can now log in with your new password.'
    });
  } catch (err) {
    console.error('[Reset Password Error]:', err);
    return res.status(500).json({ success: false, message: 'Server error updating password.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  const { password_hash, ...safeUser } = req.user;
  const branch = safeUser.branch_id ? db.get('branches', safeUser.branch_id) : null;
  const role = safeUser.preferred_job_role_id ? db.get('jobRoles', safeUser.preferred_job_role_id) : null;

  return res.json({
    success: true,
    user: {
      ...safeUser,
      branch_name: branch?.name,
      branch_code: branch?.code,
      job_role_title: role?.title
    }
  });
});

export default router;
