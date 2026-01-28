import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { ERROR_MESSAGES } from '@/lib/constants/messages';
import { withErrorHandler } from '@/lib/middleware/api-error-handler';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const doctorUID = searchParams.get('doctorUID');

  if (!doctorUID) {
    return NextResponse.json(
      { success: false, error: 'Doctor UID is required' },
      { status: 400 }
    );
  }

  try {
    // Use direct query to get status field
    const result = await query(`
      SELECT p.*, d."doctorUID", d.email as doctor_email, d."formData" as doctor_form_data
      FROM "Patient" p
      LEFT JOIN "Doctor" d ON p."doctorUID" = d."doctorUID"
      WHERE p."doctorUID" = $1
      ORDER BY p."createdAt" DESC
    `, [doctorUID]);

    const patients = (result.rows as any[]).map(row => ({
      id: row.id,
      patientUID: row.patientUID,
      email: row.email,
      password: row.password,
      status: row.status,  // Include status field
      formData: row.formData,
      inviteToken: row.inviteToken,
      doctorUID: row.doctorUID,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      doctor: {
        doctorUID: row.doctorUID,
        email: row.doctor_email,
        formData: row.doctor_form_data
      }
    }));

    logger.info('Fetched doctor patients with status', { doctorUID, count: patients.length });

    return NextResponse.json({
      success: true,
      data: patients,
    });
  } catch (error) {
    logger.error('Error fetching doctor patients', error, { doctorUID });
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    );
  }
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { action, patientId, reason } = body;

    if (!action || !patientId) {
      return NextResponse.json(
        { success: false, error: 'Action and patient ID are required' },
        { status: 400 }
      );
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Note: This POST endpoint is deprecated in favor of separate /approve and /reject endpoints
    // Redirect to use the proper endpoints that handle email notifications
    logger.warn('Using deprecated POST /api/doctor/patients endpoint', { action, patientId });

    if (action === 'APPROVE') {
      // Redirect to approve endpoint
      const approveResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/doctor/patients/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, action: 'APPROVE' })
      });
      return await approveResponse.json();
    } else if (action === 'REJECT') {
      if (!reason) {
        return NextResponse.json(
          { success: false, error: 'Rejection reason is required' },
          { status: 400 }
        );
      }

      // Redirect to reject endpoint
      const rejectResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/doctor/patients/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, action: 'REJECT', reason })
      });
      return await rejectResponse.json();
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    logger.error('Error processing patient action', error, {
      url: request.url,
      method: request.method
    });
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    );
  }
});
