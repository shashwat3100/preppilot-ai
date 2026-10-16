import jwt from 'jsonwebtoken';
import db from '../database/db.js';

// Enforce strong JWT secret in production
const isProduction = process.env.NODE_ENV === 'production';
const JWT_SECRET = process.env.JWT_SECRET;

if (isProduction && (!JWT_SECRET || JWT_SECRET === 'careerprep-ai-super-secret-key-2026')) {
  console.error('FATAL: A strong, unique JWT_SECRET environment variable is mandatory in production.');
  process.exit(1);
}

const EFFECTIVE_JWT_SECRET = JWT_SECRET || 'careerprep-ai-super-secret-key-2026';

if (!JWT_SECRET) {
  console.warn('[Security Notice] No JWT_SECRET detected in environment. Using development fallback.');
}

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    EFFECTIVE_JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, EFFECTIVE_JWT_SECRET);
    const user = db.get('users', decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid session or user not found.' });
    }
    if (user.is_blocked || user.status === 'BLOCKED') {
      return res.status(403).json({
        success: false,
        message: 'Your student account has been suspended by the Placement Administrator. Access denied.'
      });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid token.' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Access denied. Administrator privilege required.' });
  }
  next();
};

export const requireDean = (req, res, next) => {
  if (!req.user || req.user.role !== 'DEAN') {
    return res.status(403).json({ success: false, message: 'Access denied. Dean privilege required.' });
  }
  next();
};

export const requireDeanOrAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'DEAN')) {
    return res.status(403).json({ success: false, message: 'Access denied. Dean or Administrator privilege required.' });
  }
  next();
};

