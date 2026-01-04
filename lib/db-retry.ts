import { prisma } from './prisma';
import { logger } from './utils/logger';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

function isRetryableError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message?.toLowerCase() || '';
  const code = error.code;
  
  return (
    code === 'P1001' || // Can't reach database server
    code === 'P1017' || // Server has closed the connection
    errorMessage.includes('connection terminated') ||
    errorMessage.includes('connection timeout') ||
    errorMessage.includes('econnreset') ||
    errorMessage.includes('etimedout')
  );
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (isRetryableError(error) && retries > 0) {
      logger.warn(`Database operation failed, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`, {
        error: error.message,
        code: error.code,
        remainingRetries: retries - 1,
      });
      
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (MAX_RETRIES - retries + 1)));
      return withRetry(operation, retries - 1);
    }
    throw error;
  }
}

export const db = {
  patient: {
    findMany: (args?: any) => withRetry(() => prisma.patient.findMany(args)),
    findUnique: (args: any) => withRetry(() => prisma.patient.findUnique(args)),
    create: (args: any) => withRetry(() => prisma.patient.create(args)),
    update: (args: any) => withRetry(() => prisma.patient.update(args)),
    delete: (args: any) => withRetry(() => prisma.patient.delete(args)),
  },
  vitals: {
    findMany: (args?: any) => withRetry(() => prisma.vitals.findMany(args)),
    create: (args: any) => withRetry(() => prisma.vitals.create(args)),
  },
  doctor: {
    findUnique: (args: any) => withRetry(() => prisma.doctor.findUnique(args)),
  }
};
