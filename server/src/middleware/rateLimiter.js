// In-memory sliding window rate limiter
export function createRateLimiter({ windowMs = 60 * 1000, maxRequests = 60, message = 'Too many requests, please try again later.' } = {}) {
  const requests = new Map();

  // Periodically clean up old IP records to prevent memory leak
  setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of requests.entries()) {
      const validTimestamps = timestamps.filter(ts => now - ts < windowMs);
      if (validTimestamps.length === 0) {
        requests.delete(key);
      } else {
        requests.set(key, validTimestamps);
      }
    }
  }, windowMs * 2);

  return (req, res, next) => {
    const rawIp = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const isLocalhost = (
      rawIp === '127.0.0.1' ||
      rawIp === '::1' ||
      rawIp === '::ffff:127.0.0.1' ||
      rawIp === 'localhost' ||
      String(rawIp).includes('127.0.0.1')
    );

    // In development or local loopback, allow high capacity so dev and tests never get blocked
    const isDev = process.env.NODE_ENV !== 'production';
    const effectiveMax = (isDev || isLocalhost) ? Math.max(maxRequests, 1000) : maxRequests;

    // Use distinct user ID or IP for tracking
    const key = req.user?.id ? `user:${req.user.id}` : `ip:${rawIp}`;
    const now = Date.now();

    const clientTimestamps = requests.get(key) || [];
    const validTimestamps = clientTimestamps.filter(ts => now - ts < windowMs);

    if (validTimestamps.length >= effectiveMax) {
      const retryAfterSec = Math.ceil((windowMs - (now - validTimestamps[0])) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      return res.status(429).json({
        success: false,
        message,
        error: message,
        retryAfter: retryAfterSec
      });
    }

    validTimestamps.push(now);
    requests.set(key, validTimestamps);
    next();
  };
}

// Preconfigured limiters
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 50,          // generous 50 attempts per 15 min
  message: 'Too many authentication attempts. Please wait a moment before trying again.'
});

export const codeExecutionLimiter = createRateLimiter({
  windowMs: 60 * 1000,      // 1 minute
  maxRequests: 30,          // max 30 executions per minute
  message: 'Code execution rate limit exceeded. Please wait a moment before running more code.'
});

export const assessmentSubmissionLimiter = createRateLimiter({
  windowMs: 60 * 1000,      // 1 minute
  maxRequests: 20,          // max 20 submission requests per minute
  message: 'Assessment submission rate limit reached. Please wait before submitting again.'
});

