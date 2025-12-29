import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withErrorHandler } from '@/lib/middleware/api-error-handler';

export const POST = withErrorHandler(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { patientId, action } = body;

    if (!patientId || action !== 'APPROVE') {
      return NextResponse.json(
        { success: false, error: 'Invalid request parameters' },
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

    // Approve patient by clearing invite token
    await prisma.patient.update({
      where: { id: patientId },
      data: {
        inviteToken: null,
        updatedAt: new Date(),
      }
    });

    // Here you would send approval email notification
    // Implementation depends on your email service setup

    return NextResponse.json({
      success: true,
      message: 'Patient approved successfully',
    });
  } catch (error) {
    console.error('Error approving patient:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to approve patient' },
      { status: 500 }
    );
  }
});
