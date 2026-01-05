import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId: patientIdStr } = await params;
    const patientId = parseInt(patientIdStr);

    if (isNaN(patientId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid patient ID' },
        { status: 400 }
      );
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { formData: true, email: true }
    });

    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Update patient formData to mark as cured
    const formData = patient.formData as any;
    const updatedFormData = {
      ...formData,
      status: 'CURED',
      curedAt: new Date().toISOString(),
      personalInfo: {
        ...(formData?.personalInfo || {}),
        status: 'CURED'
      }
    };

    await prisma.patient.update({
      where: { id: patientId },
      data: {
        formData: updatedFormData,
        updatedAt: new Date()
      }
    });

    logger.info('Patient marked as cured', { patientId });

    return NextResponse.json({
      success: true,
      message: 'Patient marked as cured successfully',
      data: {
        patientId,
        status: 'CURED',
        curedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Error marking patient as cured:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark patient as cured' },
      { status: 500 }
    );
  }
}

