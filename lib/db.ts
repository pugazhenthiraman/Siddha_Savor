import { prisma } from './prisma';
import { Pool } from 'pg';
import { logger } from './utils/logger';

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_PM1myou5zhZp@ep-summer-bread-ad0a52d0-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

// Connection pool for better performance
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString,
      max: 10, // Maximum connections
      min: 2, // Minimum connections to keep alive
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 30000, // Wait 30 seconds for connection (increased for cloud DBs)
      statement_timeout: 30000, // 30 seconds for statement execution
      query_timeout: 30000, // 30 seconds for query execution
      ssl: {
        rejectUnauthorized: false, // Required for Neon and other cloud providers
      },
    });

    // Handle pool errors
    pool.on('error', (err) => {
      logger.error('Unexpected database pool error', err);
    });
  }
  return pool;
}

// Retry configuration for transient errors
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Check if error is retryable (transient connection errors)
function isRetryableError(error: any): boolean {
  if (!error) return false;

  const errorMessage = error.message?.toLowerCase() || '';
  const retryablePatterns = [
    'connection terminated',
    'connection timeout',
    'connection closed',
    'econnreset',
    'etimedout',
    'enotfound',
    'socket hang up',
    'server closed the connection',
  ];

  return retryablePatterns.some(pattern => errorMessage.includes(pattern));
}

// Retry wrapper for database queries
export async function retryQuery<T>(
  queryFn: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await queryFn();
  } catch (error: any) {
    if (isRetryableError(error) && retries > 0) {
      logger.warn(`Database query failed, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`, {
        error: error.message,
        remainingRetries: retries - 1,
      });
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (MAX_RETRIES - retries + 1)));
      
      return retryQuery(queryFn, retries - 1);
    }
    throw error;
  }
}

export async function query(text: string, params?: any[]) {
  const pool = getPool();
  
  return retryQuery(async () => {
    try {
      logger.debug('Executing database query', { query: text.substring(0, 100) });
      const result = await pool.query(text, params);
      return result;
    } catch (error: any) {
      logger.dbError(text, error, { params: params?.length });
      
      // Re-throw with more context
      if (error.message?.includes('timeout')) {
        throw new Error(`Database query timeout: ${error.message}`);
      }
      if (error.message?.includes('connection')) {
        throw new Error(`Database connection error: ${error.message}`);
      }
      throw error;
    }
  });
}

export async function getAdmin() {
  const result = await query('SELECT * FROM "Admin" LIMIT 1');
  return result.rows[0] || null;
}

export async function getAdminByEmail(email: string) {
  const result = await query('SELECT * FROM "Admin" WHERE email = $1', [email]);
  return result.rows[0] || null;
}

export async function updateAdminSmtpConfig(adminId: number, smtpConfig: any) {
  await query(
    'UPDATE "Admin" SET "smtpConfig" = $1 WHERE id = $2',
    [JSON.stringify(smtpConfig), adminId]
  );
}

export async function getSmtpConfig() {
  const result = await query('SELECT "smtpConfig" FROM "Admin" LIMIT 1');
  return result.rows[0]?.smtpConfig || null;
}
