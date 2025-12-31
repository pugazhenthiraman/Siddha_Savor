/**
 * Authentication Middleware
 * Handles authentication and authorization for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { UserRole } from '@/lib/types';

export interface AuthContext {
  userId: number;
  email: string;
  role: UserRole;
}

/**
 * Extract and verify authentication token from request
 */
export async function getAuthContext(
  request: NextRequest
): Promise<AuthContext | null> {
  try {
    // Get token from header or cookie
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || 
                  request.cookies.get('auth_token')?.value;

    if (!token) {
      return null;
    }

    // TODO: Implement JWT verification
    // For now, we'll use session-based auth
    // In production, verify JWT token here

    // This is a placeholder - implement actual token verification
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Middleware to require authentication
 */
export function requireAuth(
  handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const authContext = await getAuthContext(request);

    if (!authContext) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    return handler(request, authContext);
  };
}

/**
 * Middleware to require specific role(s)
 */
export function requireRole(
  allowedRoles: UserRole[],
  handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse>
) {
  return requireAuth(async (request, context) => {
    if (!allowedRoles.includes(context.role)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient permissions',
        },
        { status: 403 }
      );
    }

    return handler(request, context);
  });
}

/**
 * Get user from database by email
 */
export async function getUserByEmail(email: string) {
  try {
    // Try admin first
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (admin) {
      return { ...admin, role: 'admin' as UserRole };
    }

    // Try doctor
    const doctor = await prisma.doctor.findUnique({ where: { email } });
    if (doctor && doctor.status === 'APPROVED') {
      return { ...doctor, role: 'doctor' as UserRole };
    }

    // Try patient
    const patient = await prisma.patient.findFirst({ where: { email } });
    if (patient) {
      return { ...patient, role: 'patient' as UserRole };
    }

    return null;
  } catch (error) {
    return null;
  }
}

