import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import db from '../database/db.js';
import { insertPostgresAccessLog, isPostgresConfigured } from '../database/postgres.js';

const STATIC_EXTENSIONS = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map|json)$/i;

/**
 * Extracts candidate user ID from JWT if present in authorization header.
 */
const extractUserIdFromAuthHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.decode(token);
    return decoded?.id || null;
  } catch {
    return null;
  }
};

/**
 * Express middleware that automatically tracks website visits and API accesses,
 * persisting telemetry to both PostgreSQL and the local database.
 */
export const accessLogger = (req, res, next) => {
  const urlPath = req.originalUrl || req.url || '';

  // Skip static assets to prevent database bloat
  if (STATIC_EXTENSIONS.test(urlPath.split('?')[0])) {
    return next();
  }

  const startTime = Date.now();
  const rawIp = req.headers['x-forwarded-for']
    ? req.headers['x-forwarded-for'].split(',')[0].trim()
    : (req.socket?.remoteAddress || req.ip || '127.0.0.1');

  // Normalize IPv6 localhost
  const ip = rawIp === '::1' ? '127.0.0.1' : rawIp;
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const referrer = req.headers['referer'] || req.headers['referrer'] || null;
  const extractedUserId = extractUserIdFromAuthHeader(req.headers['authorization']);

  res.on('finish', () => {
    try {
      const responseTimeMs = Date.now() - startTime;
      const statusCode = res.statusCode;
      const method = req.method;
      const userId = req.user?.id || extractedUserId || null;
      const id = `log-${uuidv4().slice(0, 13)}`;
      const createdAt = new Date().toISOString();

      const logRecord = {
        id,
        ip,
        method,
        path: urlPath,
        statusCode,
        responseTimeMs,
        userAgent: userAgent.slice(0, 255),
        userId,
        referrer: referrer ? referrer.slice(0, 255) : null,
        createdAt
      };

      // 1. Store in active database (SQLite local / Vercel tmp)
      try {
        db.insert('accessLogs', {
          ...logRecord,
          status_code: statusCode,
          response_time_ms: responseTimeMs,
          user_agent: logRecord.userAgent,
          user_id: userId,
          created_at: createdAt
        });
      } catch (sqliteErr) {
        // Safe capture, does not affect HTTP response
      }

      // 2. Stream to PostgreSQL in Cloud if configured
      if (isPostgresConfigured()) {
        insertPostgresAccessLog(logRecord).catch(() => {});
      }
    } catch (err) {
      // Access logging errors are non-critical
    }
  });

  next();
};

export default accessLogger;
