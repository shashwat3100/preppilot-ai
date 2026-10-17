import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let pool = null;
let isInitialized = false;
let initPromise = null;

/**
 * Checks if DATABASE_URL is configured and points to a PostgreSQL host.
 */
export const isPostgresConfigured = () => {
  const url = process.env.DATABASE_URL;
  return Boolean(url && (url.startsWith('postgres://') || url.startsWith('postgresql://')));
};

/**
 * Resolves or initializes the PostgreSQL connection pool singleton.
 */
export const getPgPool = () => {
  if (pool) return pool;
  if (!isPostgresConfigured()) return null;

  const connectionString = process.env.DATABASE_URL;
  const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

  pool = new pg.Pool({
    connectionString,
    ssl: isLocalhost ? false : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 5000,
    allowExitOnIdle: true // Ensures test suites and lambdas can exit cleanly
  });

  pool.on('error', (err) => {
    console.warn('[PostgreSQL Pool Warning]:', err.message);
  });

  return pool;
};

/**
 * Closes the PostgreSQL pool cleanly (useful for tests and graceful shutdown).
 */
export const closePgPool = async () => {
  if (pool) {
    try {
      await pool.end();
    } catch {}
    pool = null;
    isInitialized = false;
    initPromise = null;
  }
};

/**
 * Ensures that the access_logs table exists in PostgreSQL.
 */
export const ensurePostgresAccessTable = async () => {
  if (isInitialized) return true;
  if (!initPromise) {
    initPromise = (async () => {
      const activePool = getPgPool();
      if (!activePool) return false;

      try {
        await activePool.query(`
          CREATE TABLE IF NOT EXISTS access_logs (
            id VARCHAR(50) PRIMARY KEY,
            ip VARCHAR(100),
            method VARCHAR(10) NOT NULL,
            path TEXT NOT NULL,
            status_code INT NOT NULL,
            response_time_ms INT DEFAULT 0,
            user_agent TEXT,
            user_id VARCHAR(50),
            referrer TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
          CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON access_logs(created_at DESC);
          CREATE INDEX IF NOT EXISTS idx_access_logs_ip ON access_logs(ip);
        `);
        isInitialized = true;
        console.log('[PostgreSQL] access_logs table verified and ready.');
        return true;
      } catch (err) {
        console.warn('[PostgreSQL Table Init Warning]:', err.message);
        return false;
      }
    })();
  }
  return initPromise;
};

/**
 * Inserts an access log into PostgreSQL asynchronously.
 * Safe fire-and-forget: will never throw unhandled rejections or block request lifecycles.
 */
export const insertPostgresAccessLog = async (logData) => {
  const activePool = getPgPool();
  if (!activePool) return false;

  try {
    await ensurePostgresAccessTable();
    const query = `
      INSERT INTO access_logs (
        id, ip, method, path, status_code, response_time_ms, user_agent, user_id, referrer, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;
    const values = [
      logData.id,
      logData.ip || null,
      logData.method || 'GET',
      logData.path || '/',
      logData.statusCode || 200,
      logData.responseTimeMs || 0,
      logData.userAgent || null,
      logData.userId || null,
      logData.referrer || null,
      logData.createdAt ? new Date(logData.createdAt) : new Date()
    ];
    await activePool.query(query, values);
    return true;
  } catch (err) {
    // Non-fatal warning — log storage issue should never degrade API availability
    console.warn('[PostgreSQL Access Logger Warning]:', err.message);
    return false;
  }
};

/**
 * Queries access logs from PostgreSQL (with fallback to null if offline or not configured).
 */
export const getPostgresAccessStats = async (limit = 50) => {
  const activePool = getPgPool();
  if (!activePool) return null;

  try {
    await ensurePostgresAccessTable();
    const [recentLogs, totalRes, uniqueIps, avgLatency] = await Promise.all([
      activePool.query('SELECT * FROM access_logs ORDER BY created_at DESC LIMIT $1', [limit]),
      activePool.query('SELECT COUNT(*)::int as count FROM access_logs'),
      activePool.query('SELECT COUNT(DISTINCT ip)::int as count FROM access_logs'),
      activePool.query('SELECT COALESCE(ROUND(AVG(response_time_ms)), 0)::int as avg_ms FROM access_logs')
    ]);

    return {
      source: 'PostgreSQL',
      recent_logs: recentLogs.rows,
      total_visits: totalRes.rows[0]?.count || 0,
      unique_ips: uniqueIps.rows[0]?.count || 0,
      avg_response_time_ms: avgLatency.rows[0]?.avg_ms || 0
    };
  } catch (err) {
    console.warn('[PostgreSQL Access Stats Warning]:', err.message);
    return null;
  }
};

/**
 * Queries a user by ID from PostgreSQL.
 */
export const queryPostgresUser = async (userId) => {
  const activePool = getPgPool();
  if (!activePool || !userId) return null;

  try {
    const res = await activePool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      branch_id: row.branch_id,
      status: row.status || 'ACTIVE',
      is_blocked: row.is_blocked || false,
      total_xp: row.total_xp || 50
    };
  } catch (err) {
    console.warn('[PostgreSQL queryPostgresUser Warning]:', err.message);
    return null;
  }
};

export default {
  isPostgresConfigured,
  getPgPool,
  closePgPool,
  ensurePostgresAccessTable,
  insertPostgresAccessLog,
  getPostgresAccessStats,
  queryPostgresUser
};
