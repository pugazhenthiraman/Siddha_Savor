import { NextRequest, NextResponse } from 'next/server';
import { withRetry } from '@/lib/db-retry';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    // Get session token from cookies
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('next-auth.session-token')?.value;
    
    if (!sessionToken) {
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
