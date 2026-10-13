import jwt from 'jsonwebtoken';
import db from '../database/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'careerprep-ai-super-secret-key-2026';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
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
    const decoded = jwt.verify(token, JWT_SECRET);
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
