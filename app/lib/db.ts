import { Pool, PoolConfig } from 'pg';

/**
 * PRODUCTION-GRADE NEON DATABASE ADAPTER
 * Implements an optimized singleton connection pooler with
 * extended timeouts for serverless cold-start resilience.
 */

const connectionString = process.env.DATABASE_URL;

if (!connectionString && process.env.NODE_ENV === 'production') {
  throw new Error('CRITICAL: DATABASE_URL is missing in production environment');
}

// Optimized for Neon Serverless Cold Starts
const poolConfig: PoolConfig = {
  connectionString,
  ssl: connectionString?.includes('localhost') ? false : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased to 10s for resilience
  maxUses: 7500,
};

let pool: Pool;

if (process.env.NODE_ENV === 'production') {
  pool = new Pool(poolConfig);
} else {
  if (!(global as any).pgPool) {
    (global as any).pgPool = new Pool(poolConfig);
  }
  pool = (global as any).pgPool;
}

/**
 * HARDENED QUERY WRAPPER
 * Standardizes async execution and semantic error recovery.
 */
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error: any) {
    console.error('[DB_FAULT]:', {
      msg: error.message,
      code: error.code,
      query: text.substring(0, 50)
    });

    // Handle standard Postgres connection faults
    if (error.code === 'ECONNREFUSED' || error.message?.includes('timeout')) {
       throw new Error('DATABASE_OFFLINE: The academic core is temporarily unreachable.');
    }

    // Handle missing infrastructure
    if (error.code === '42P01') {
       throw new Error('INFRASTRUCTURE_DESYNC: Academic tables are pending synchronization.');
    }

    throw error;
  }
};

export default pool;
