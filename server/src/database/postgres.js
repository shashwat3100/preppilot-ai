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
    connectionTimeoutMillis: 3000,
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
 * Helper to normalize a PostgreSQL user row into standard application format.
 */
const mapPostgresUserRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password_hash: row.password_hash,
    role: row.role || 'STUDENT',
    branch_id: row.branch_id || 'branch-cse',
    year: row.year || '4th Year',
    graduation_year: row.graduation_year || 2026,
    preferred_job_role_id: row.preferred_job_role_id || 'role-sde',
    target_companies: typeof row.target_companies === 'string'
      ? (() => { try { return JSON.parse(row.target_companies); } catch { return []; } })()
      : (row.target_companies || []),
    skill_level: row.skill_level || 'Intermediate',
    areas_of_interest: typeof row.areas_of_interest === 'string'
      ? (() => { try { return JSON.parse(row.areas_of_interest); } catch { return []; } })()
      : (row.areas_of_interest || []),
    status: row.status || 'ACTIVE',
    is_blocked: Boolean(row.is_blocked),
    placement_status: row.placement_status || 'NOT_PLACED',
    placed_company: row.placed_company || null,
    placement_package: row.placement_package || null,
    placed_date: row.placed_date instanceof Date ? row.placed_date.toISOString().split('T')[0] : (row.placed_date || null),
    total_xp: row.total_xp !== null && row.total_xp !== undefined ? Number(row.total_xp) : 0,
    current_level: row.current_level || 1,
    current_streak: row.current_streak !== null && row.current_streak !== undefined ? Number(row.current_streak) : 0,
    longest_streak: row.longest_streak !== null && row.longest_streak !== undefined ? Number(row.longest_streak) : 0,
    last_active_date: row.last_active_date instanceof Date ? row.last_active_date.toISOString().split('T')[0] : (row.last_active_date || null),
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at ? String(row.created_at) : new Date().toISOString()),
    updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : (row.updated_at ? String(row.updated_at) : new Date().toISOString())
  };
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
    return mapPostgresUserRow(res.rows[0]);
  } catch (err) {
    console.warn('[PostgreSQL queryPostgresUser Warning]:', err.message);
    return null;
  }
};

/**
 * Queries a user by Email from PostgreSQL (case-insensitive).
 */
export const queryPostgresUserByEmail = async (email) => {
  const activePool = getPgPool();
  if (!activePool || !email) return null;

  try {
    const cleanEmail = email.trim().toLowerCase();
    const res = await activePool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [cleanEmail]);
    if (res.rows.length === 0) return null;
    return mapPostgresUserRow(res.rows[0]);
  } catch (err) {
    console.warn('[PostgreSQL queryPostgresUserByEmail Warning]:', err.message);
    return null;
  }
};

/**
 * Persists (inserts or updates) a user record in PostgreSQL.
 * Ensures user registrations and profile/password updates are permanent across serverless lifecycles.
 */
export const savePostgresUser = async (user) => {
  const activePool = getPgPool();
  if (!activePool || !user || !user.id || !user.email) return false;

  try {
    const query = `
      INSERT INTO users (
        id, name, email, password_hash, role, branch_id, year, graduation_year,
        preferred_job_role_id, target_companies, skill_level, areas_of_interest,
        total_xp, current_level, current_streak, longest_streak, is_blocked, status,
        placement_status, placed_company, placement_package, placed_date, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12,
        $13, $14, $15, $16, $17, $18,
        $19, $20, $21, $22, NOW()
      )
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        password_hash = COALESCE(EXCLUDED.password_hash, users.password_hash),
        role = EXCLUDED.role,
        branch_id = EXCLUDED.branch_id,
        year = EXCLUDED.year,
        graduation_year = EXCLUDED.graduation_year,
        preferred_job_role_id = EXCLUDED.preferred_job_role_id,
        target_companies = EXCLUDED.target_companies,
        skill_level = EXCLUDED.skill_level,
        areas_of_interest = EXCLUDED.areas_of_interest,
        total_xp = EXCLUDED.total_xp,
        current_level = EXCLUDED.current_level,
        current_streak = EXCLUDED.current_streak,
        longest_streak = EXCLUDED.longest_streak,
        is_blocked = EXCLUDED.is_blocked,
        status = EXCLUDED.status,
        placement_status = EXCLUDED.placement_status,
        placed_company = EXCLUDED.placed_company,
        placement_package = EXCLUDED.placement_package,
        placed_date = EXCLUDED.placed_date,
        updated_at = NOW()
    `;

    const values = [
      user.id,
      user.name || 'Candidate',
      user.email.trim().toLowerCase(),
      user.password_hash,
      user.role || 'STUDENT',
      user.branch_id || 'branch-cse',
      user.year || '4th Year',
      user.graduation_year ? parseInt(user.graduation_year) : 2026,
      user.preferred_job_role_id || 'role-sde',
      JSON.stringify(Array.isArray(user.target_companies) ? user.target_companies : []),
      user.skill_level || 'Intermediate',
      JSON.stringify(Array.isArray(user.areas_of_interest) ? user.areas_of_interest : []),
      user.total_xp !== null && user.total_xp !== undefined ? Number(user.total_xp) : 0,
      user.current_level || 1,
      user.current_streak !== null && user.current_streak !== undefined ? Number(user.current_streak) : 0,
      user.longest_streak !== null && user.longest_streak !== undefined ? Number(user.longest_streak) : 0,
      Boolean(user.is_blocked),
      user.status || 'ACTIVE',
      user.placement_status || 'NOT_PLACED',
      user.placed_company || null,
      user.placement_package || null,
      user.placed_date || null
    ];

    await activePool.query(query, values);
    return true;
  } catch (err) {
    console.warn('[PostgreSQL savePostgresUser Warning]:', err.message);
    return false;
  }
};

export default {
  isPostgresConfigured,
  getPgPool,
  closePgPool,
  ensurePostgresAccessTable,
  insertPostgresAccessLog,
  getPostgresAccessStats,
  queryPostgresUser,
  queryPostgresUserByEmail,
  savePostgresUser
};
