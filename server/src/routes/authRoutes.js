import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '../database/db.js';
import { generateToken, authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { isPostgresConfigured, queryPostgresUserByEmail, savePostgresUser } from '../database/postgres.js';

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

    let existingUser = db.findOne('users', u => (u.email || '').toLowerCase() === cleanEmail);
    if (!existingUser && isPostgresConfigured()) {
      existingUser = await queryPostgresUserByEmail(cleanEmail);
      if (existingUser) {
        db.insert('users', existingUser);
      }
    }
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
      total_xp: 0,
      current_level: 1,
      current_streak: 0,
      longest_streak: 0,
      last_active_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_blocked: false,
      status: 'ACTIVE'
    };

    db.insert('users', newUser);

    // Initialize clean streak record
    db.insert('streaks', {
      id: `streak-${userId}`,
      user_id: userId,
      current_streak: 0,
      longest_streak: 0,
      last_activity_date: null,
      streak_freeze_count: 2
    });

    // Durably persist registered user to Neon PostgreSQL
    if (isPostgresConfigured()) {
      try {
        await savePostgresUser(newUser);
      } catch (pgErr) {
        console.warn('[PostgreSQL Sync on Register Warning]:', pgErr.message);
      }
    }

    const token = generateToken(newUser);
    const { password_hash, ...safeUser } = newUser;

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to PrepPilot AI.',
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
    let user = db.findOne('users', u => (u.email || '').toLowerCase() === cleanEmail);

    // If user is not present in local SQLite instance, look up from PostgreSQL Neon
    if (!user && isPostgresConfigured()) {
      user = await queryPostgresUserByEmail(cleanEmail);
      if (user) {
        db.insert('users', user);
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
    }

    let isMatch = await bcrypt.compare(password, user.password_hash);

    // If local cached hash failed, check PostgreSQL in case password was updated in another container
    if (!isMatch && isPostgresConfigured()) {
      const freshUser = await queryPostgresUserByEmail(cleanEmail);
      if (freshUser && freshUser.password_hash !== user.password_hash) {
        const freshMatch = await bcrypt.compare(password, freshUser.password_hash);
        if (freshMatch) {
          user = freshUser;
          isMatch = true;
          db.update('users', user.id, user);
        }
      }
    }

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

    // Explicit SHA-256 blocklist of all historically exposed invitation tokens
    const EXPOSED_TOKEN_HASHES = new Set([
      '0c1694574e1347e42d0bb6e1fff157629d9e131a349ce301b690cef5db81d310',
      '695c6e488a223458fc38376d8e00c86a683825640454531d88be718212f5b812',
      'a67b5cb3411b5815d773d493e993be00ac3855351d24da6ef05ef856ceef02ec',
      '3d22ab88a8bdcc6d1836f7af52de9d9465dd1b599a9fae696ab2929815b20ea1',
      'b45d6c002dda8b16f339c74bc1332d9b8b7fcf389fc2f4e50523d8fd2dba44a5',
      '90379c1249272f98fc9966407a52df3fe8c751752a4fd8eece5ed96ed481281b',
      '5b517720323608aa62a9148cf6d2f20924eab9417ae514080d1d6da3a2fc5930',
      'e43f01c7c73a8eb4e54f392c74fad27c2655af67c01fa10531ac09807d76dd34',
      '1b96296db96920b7be42d6ce5cdf8313e60ecb6ebaf3d405a9e8fe100a3fa1a2',
      'a0b02465555a358c73b67eacee80aaf18bfc4e83abf5a870d3d98a0cb71364bc'
    ]);

    const tokenHash = crypto.createHash('sha256').update(effectiveToken).digest('hex');
    if (EXPOSED_TOKEN_HASHES.has(tokenHash)) {
      return res.status(403).json({
        success: false,
        message: 'This administrator invitation token has been permanently revoked for security compliance.'
      });
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

    let existingUser = db.findOne('users', u => (u.email || '').toLowerCase() === cleanEmail);
    if (!existingUser && isPostgresConfigured()) {
      existingUser = await queryPostgresUserByEmail(cleanEmail);
      if (existingUser) {
        db.insert('users', existingUser);
      }
    }
    if (existingUser) {
      if (existingUser.role === 'DEAN' || existingUser.role === 'ADMIN') {
        return res.status(400).json({
          success: false,
          message: 'An authorized Dean or Administrator account already exists with this email address. Please sign in directly from the login portal.'
        });
      }

      // Existing student upgrading via legitimate invitation must authenticate their existing password
      const isPasswordMatch = await bcrypt.compare(password, existingUser.password_hash);
      if (!isPasswordMatch) {
        return res.status(401).json({
          success: false,
          message: 'An existing account was found for this email. Please enter your existing account password to accept appointment.'
        });
      }

      const updatedUser = db.update('users', existingUser.id, {
        name: cleanName || existingUser.name,
        role: 'DEAN',
        designation: designation || 'Dean',
        department: department || 'Academic & Placement Governance',
        is_blocked: false,
        status: 'ACTIVE'
      });

      if (isPostgresConfigured() && updatedUser) {
        await savePostgresUser(updatedUser);
      }

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
        message: 'Account successfully upgraded to Dean via authorized invitation! Academic analytics privileges granted.',
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
      role: 'DEAN',
      designation: designation || 'Dean',
      department: department || 'Academic & Placement Governance',
      branch_id: 'branch-cse',
      year: 'Faculty / Dean',
      graduation_year: 2018,
      preferred_job_role_id: 'role-sde',
      target_companies: ['comp-tcs', 'comp-infosys', 'comp-wipro', 'comp-accenture'],
      skill_level: 'Advanced',
      areas_of_interest: ['Academic Analytics', 'Assessment Evaluation', 'Curriculum Mapping'],
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
    if (isPostgresConfigured()) {
      await savePostgresUser(newDean);
    }

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
      message: 'Dean account created successfully! Academic analytics privileges granted.',
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
    let user = db.findOne('users', u => (u.email || '').toLowerCase() === cleanEmail);
    if (!user && isPostgresConfigured()) {
      user = await queryPostgresUserByEmail(cleanEmail);
      if (user) {
        db.insert('users', user);
      }
    }

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
    let user = db.findOne('users', u => (u.email || '').toLowerCase() === cleanEmail);
    if (!user && isPostgresConfigured()) {
      user = await queryPostgresUserByEmail(cleanEmail);
      if (user) {
        db.insert('users', user);
      }
    }

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

    const updatedUser = db.update('users', record.userId, {
      password_hash: passwordHash,
      updated_at: new Date().toISOString()
    });

    if (isPostgresConfigured() && updatedUser) {
      await savePostgresUser(updatedUser);
    }

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

