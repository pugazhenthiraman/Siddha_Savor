import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { withRetry } from '@/lib/db-retry';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import { logger } from '@/lib/utils/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    // Get authentication from Authorization header or cookies
    const authHeader = request.headers.get('authorization');
    let isAuthenticated = false;
    let userRole = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const tokenData = JSON.parse(atob(authHeader.substring(7)));
        isAuthenticated = !!tokenData.id;
        userRole = tokenData.role;
      } catch (e) {
        logger.warn('Failed to parse Authorization header', e);
      }
    }

    // Fallback to cookie-based auth if header auth fails
    if (!isAuthenticated) {
      const cookieStore = await cookies();
      const sessionToken = cookieStore.get('next-auth.session-token')?.value;
      if (sessionToken) {
        isAuthenticated = true;
      }
    }

    if (!isAuthenticated) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const patientId = parseInt(resolvedParams.patientId);
    if (isNaN(patientId)) {
      return NextResponse.json({ success: false, error: 'Invalid patient ID' }, { status: 400 });
    }

    // Get patient data using retry wrapper
    const patientQuery = `
      SELECT p.*, 
             p."doctorUID",
             d."formData" as "doctorFormData"
      FROM "Patient" p
      LEFT JOIN "Doctor" d ON p."doctorUID" = d."doctorUID"
      WHERE p.id = $1
      LIMIT 1
    `;

    const result = await withRetry(() => query(patientQuery, [patientId]));

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Patient not found' }, { status: 404 });
    }

    const patient = result.rows[0];

    // Parse formData if it exists
    if (patient.formData) {
      try {
        if (typeof patient.formData === 'string') {
          patient.formData = JSON.parse(patient.formData);
        }
      } catch (e) {
        patient.formData = {};
      }
    }

    return NextResponse.json({
      success: true,
      data: patient
    });

  } catch (error) {
    console.error('Error fetching patient:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch patient' },
      { status: 500 }
    );
  }
}
