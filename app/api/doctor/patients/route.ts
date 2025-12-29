import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
    const patients = await prisma.patient.findMany({
      where: { doctorUID },
      orderBy: { createdAt: 'desc' },
      include: {
        doctor: {
          select: {
            doctorUID: true,
            email: true,
            formData: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: patients,
    });
  } catch (error) {
    console.error('Error fetching doctor patients:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch patients' },
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

    if (action === 'APPROVE') {
      // For approval, we might want to send an email notification
      // For now, just update the patient status or clear invite token
      await prisma.patient.update({
        where: { id: patientId },
        data: {
          // Clear invite token to indicate approval
          inviteToken: null,
          updatedAt: new Date(),
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Patient approved successfully',
      });
    } else if (action === 'REJECT') {
      if (!reason) {
        return NextResponse.json(
          { success: false, error: 'Rejection reason is required' },
          { status: 400 }
        );
      }

      // Delete the patient record for rejection
      await prisma.patient.delete({
        where: { id: patientId }
      });

      // Here you would typically send an email with the rejection reason
      // Implementation depends on your email service setup

      return NextResponse.json({
        success: true,
        message: 'Patient rejected successfully',
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error processing patient action:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process patient action' },
      { status: 500 }
    );
  }
});
