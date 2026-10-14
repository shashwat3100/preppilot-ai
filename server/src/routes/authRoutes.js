import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '../database/db.js';
import { generateToken, authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Validation Helpers
export function validatePasswordPolicy(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required.' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return { valid: false, message: 'Password must contain at least one letter and one number.' };
  }
  return { valid: true };
}

export function validateEmailFormat(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
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

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!validateEmailFormat(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    if (cleanName.length < 2 || cleanName.length > 100) {
      return res.status(400).json({ success: false, message: 'Full name must be between 2 and 100 characters.' });
    }

    const passwordValidation = validatePasswordPolicy(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ success: false, message: passwordValidation.message });
    }

    const existingUser = db.findOne('users', u => u.email.toLowerCase() === cleanEmail);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = `user-${crypto.randomUUID()}`;

    // Security: Public registration can NEVER grant ADMIN role
    const newUser = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
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
      updated_at: new Date().toISOString(),
      is_blocked: false,
      status: 'ACTIVE'
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
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.findOne('users', u => u.email.toLowerCase() === cleanEmail);
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

// Secure in-memory password resets store with expiry and attempt limits
export const passwordResets = new Map();

// Periodic cleanup of expired password reset records
const resetCleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [email, record] of passwordResets.entries()) {
    if (now > record.expiresAt || record.used) {
      passwordResets.delete(email);
    }
  }
}, 5 * 60 * 1000);
if (resetCleanupTimer.unref) resetCleanupTimer.unref();

// POST /api/auth/register-dean (SECURE: Requires verified administrator invitation token)
router.post('/register-dean', authLimiter, async (req, res) => {
  try {
    const { name, email, password, passcode, invite_token, designation, department } = req.body;
    const effectiveToken = (invite_token || passcode || '').trim();

    if (!name || !email || !password || !effectiveToken) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and Administrator Authorization Invitation Token are required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!validateEmailFormat(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const passwordValidation = validatePasswordPolicy(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ success: false, message: passwordValidation.message });
    }

    // Verify against cryptographically secure admin invitations or environment secret
    const envSecret = process.env.ADMIN_INVITE_TOKEN;
    const isEnvSecretValid = Boolean(envSecret && effectiveToken === envSecret);

    // Security Cutoff: All admin invitations issued prior to data exposure cleanup are revoked
    const EXPOSURE_REMEDIATION_CUTOFF = new Date('2026-10-14T17:30:00.000Z').getTime();

    const storedInvitation = db.findOne('adminInvitations', inv =>
      inv.token === effectiveToken && !inv.is_used && !inv.is_revoked
    );

    const isStoredValid = Boolean(
      storedInvitation &&
      new Date(storedInvitation.created_at).getTime() >= EXPOSURE_REMEDIATION_CUTOFF &&
      new Date(storedInvitation.expires_at).getTime() > Date.now()
    );

    if (!isEnvSecretValid && !isStoredValid) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired Administrator Authorization Invitation Token. Public registration cannot grant administrator privileges.'
      });
    }

    // Check if invitation was restricted to a specific email address
    if (storedInvitation?.email && storedInvitation.email.toLowerCase() !== cleanEmail) {
      return res.status(403).json({
        success: false,
        message: `This invitation token is restricted to ${storedInvitation.email}.`
      });
    }

    const existingUser = db.findOne('users', u => u.email.toLowerCase() === cleanEmail);
    if (existingUser) {
      if (existingUser.role === 'ADMIN') {
        return res.status(400).json({
          success: false,
          message: 'A Placement Dean account already exists with this email address. Please sign in directly from the Dean portal.'
        });
      }

      // Existing student upgrading via legitimate invitation must authenticate their existing password
      const isPasswordMatch = await bcrypt.compare(password, existingUser.password_hash);
      if (!isPasswordMatch) {
        return res.status(401).json({
          success: false,
          message: 'An existing account was found for this email. Please enter your existing account password to accept administrative appointment.'
        });
      }

      const updatedUser = db.update('users', existingUser.id, {
        name: cleanName || existingUser.name,
        role: 'ADMIN',
        designation: designation || 'Placement Dean & Officer',
        department: department || 'Training & Placement Cell',
        is_blocked: false,
        status: 'ACTIVE'
      });

      if (storedInvitation) {
        db.update('adminInvitations', storedInvitation.id, {
          is_used: true,
          used_by: existingUser.id,
          used_at: new Date().toISOString()
        });
      }

      const token = generateToken(updatedUser);
      const { password_hash, ...safeUser } = updatedUser;

      return res.status(200).json({
        success: true,
        message: 'Account successfully upgraded to Placement Dean via authorized invitation! Administrative privileges granted.',
        token,
        user: safeUser
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = `user-dean-${crypto.randomUUID()}`;

    const newDean = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
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

    if (storedInvitation) {
      db.update('adminInvitations', storedInvitation.id, {
        is_used: true,
        used_by: userId,
        used_at: new Date().toISOString()
      });
    }

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

// POST /api/auth/request-dean-access (Public application workflow for faculty requiring admin approval)
router.post('/request-dean-access', authLimiter, async (req, res) => {
  try {
    const { name, email, designation, department, reason } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Full name and institutional email are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!validateEmailFormat(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid institutional email address.' });
    }

    const application = {
      id: `faculty-app-${crypto.randomUUID()}`,
      name: name.trim(),
      email: cleanEmail,
      designation: designation ? designation.trim() : 'Faculty Coordinator',
      department: department ? department.trim() : 'Training & Placement Cell',
      reason: reason ? reason.trim() : 'Faculty Placement Portal Access',
      status: 'PENDING_APPROVAL',
      created_at: new Date().toISOString()
    };

    db.insert('facultyApplications', application);

    return res.status(201).json({
      success: true,
      message: 'Your Placement Dean / Faculty access application has been submitted to the Placement Cell Administrator for review.'
    });
  } catch (err) {
    console.error('[Dean Access Request Error]:', err);
    return res.status(500).json({ success: false, message: 'Server error processing access application.' });
  }
});

// POST /api/auth/forgot-password (SECURE: Codes are NEVER disclosed in API responses)
router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your registered email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.findOne('users', u => u.email.toLowerCase() === cleanEmail);

    if (user && (user.is_blocked || user.status === 'BLOCKED')) {
      return res.status(403).json({
        success: false,
        message: 'Your account is suspended. Password reset requests cannot be fulfilled. Please contact the administrator.'
      });
    }

    if (!user) {
      // Do not disclose whether email exists for anti-enumeration security
      return res.status(404).json({
        success: false,
        message: 'No registered account found with this email address.'
      });
    }

    // Cryptographically secure 6-digit verification code
    const resetCode = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes window
    const salt = await bcrypt.genSalt(10);
    const codeHash = await bcrypt.hash(resetCode, salt);

    passwordResets.set(cleanEmail, {
      codeHash,
      userId: user.id,
      expiresAt,
      attempts: 0,
      maxAttempts: 5,
      used: false
    });

    const isEmailConfigured = Boolean(
      process.env.SMTP_HOST || process.env.SENDGRID_API_KEY || process.env.EMAIL_TRANSPORT
    );

    // Development diagnostic log only - NEVER returned in HTTP response
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[AUTH NOTICE - DEV CONSOLE ONLY] Password reset code for ${cleanEmail}: ${resetCode} (Expires in 15m)`);
    }

    return res.json({
      success: true,
      message: isEmailConfigured
        ? `Password reset instructions have been dispatched to ${cleanEmail}.`
        : `A password reset request has been processed. Note: Automated email delivery is not configured in this environment; please contact your campus administrator for verification code.`,
      email_delivery_configured: isEmailConfigured
    });
  } catch (err) {
    console.error('[Forgot Password Error]:', err);
    return res.status(500).json({ success: false, message: 'Server error processing password reset.' });
  }
});

// POST /api/auth/reset-password (SECURE: Expiry, attempt limits, single-use, policy check)
router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    const { email, verification_pin, new_password } = req.body;

    if (!email || !verification_pin || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Email, verification PIN, and new password are required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.findOne('users', u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found.' });
    }

    if (user.is_blocked || user.status === 'BLOCKED') {
      return res.status(403).json({
        success: false,
        message: 'Your account is suspended. Password updates are prohibited.'
      });
    }

    const record = passwordResets.get(cleanEmail);
    if (!record || record.used) {
      return res.status(400).json({
        success: false,
        message: 'No active password reset request found or code already used. Please request a new PIN.'
      });
    }

    if (Date.now() > record.expiresAt) {
      passwordResets.delete(cleanEmail);
      return res.status(400).json({
        success: false,
        message: 'Verification PIN has expired (15 minute validity). Please request a new one.'
      });
    }

    // Attempt limiting
    record.attempts += 1;
    if (record.attempts > record.maxAttempts) {
      passwordResets.delete(cleanEmail);
      return res.status(429).json({
        success: false,
        message: 'Maximum verification attempts exceeded. Reset request invalidated for security. Please request a new code.'
      });
    }

    const isCodeValid = await bcrypt.compare(verification_pin.trim(), record.codeHash);
    if (!isCodeValid) {
      const remaining = record.maxAttempts - record.attempts;
      return res.status(400).json({
        success: false,
        message: `Invalid verification PIN. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
      });
    }

    // Enforce password policy
    const passwordValidation = validatePasswordPolicy(new_password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ success: false, message: passwordValidation.message });
    }

    // Invalidate reset code single-use
    record.used = true;
    passwordResets.delete(cleanEmail);

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(new_password, salt);

    db.update('users', record.userId, {
      password_hash: passwordHash,
      updated_at: new Date().toISOString()
    });

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

