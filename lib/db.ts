import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { env } from "./env";

// PrismaClient singleton for Next.js
// Prevents multiple instances in development hot-reload

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Enhance connection string for Neon/cloud databases
// Add connect_timeout if not already present (helps with suspended databases)
let connectionString = env.DATABASE_URL;
if (!connectionString.includes('connect_timeout')) {
  const separator = connectionString.includes('?') ? '&' : '?';
  connectionString = `${connectionString}${separator}connect_timeout=60`;
}

// Create adapter for Prisma 7.x with connection pooling
// Optimized for cloud databases (Neon, Supabase, etc.)
const pool = new Pool({
  connectionString,
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 20000, // Increased to 20 seconds for cloud databases (Neon can take time to resume)
  // SSL configuration for cloud databases
  ssl: connectionString.includes('sslmode=require') || connectionString.includes('sslmode=prefer') 
    ? { rejectUnauthorized: false } 
    : undefined,
});

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: env.isDevelopment() ? ["query", "error", "warn"] : ["error"],
  });

// Connection health check helper
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

// Graceful shutdown handler
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
    await pool.end();
  });
}

if (!env.isProduction()) {
  globalForPrisma.prisma = prisma;
}

