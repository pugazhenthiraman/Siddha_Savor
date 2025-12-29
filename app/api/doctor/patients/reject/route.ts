import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withErrorHandler } from '@/lib/middleware/api-error-handler';

export const POST = withErrorHandler(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { patientId, action, reason } = body;

    if (!patientId || action !== 'REJECT' || !reason) {
      return NextResponse.json(
        { success: false, error: 'Patient ID, action, and reason are required' },
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

    // Delete the patient record for rejection
    await prisma.patient.delete({
      where: { id: patientId }
    });

    // Here you would send rejection email with reason
    // Implementation depends on your email service setup
    // Example:
    // await emailService.sendRejectionEmail(patient.email, reason);

    return NextResponse.json({
      success: true,
      message: 'Patient rejected successfully',
    });
  } catch (error) {
    console.error('Error rejecting patient:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reject patient' },
      { status: 500 }
    );
  }
});
