import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId: patientIdStr } = await params;
    const patientId = parseInt(patientIdStr);

    // Get patient vitals
    const vitals = await prisma.patientVitals.findMany({
      where: { patientId },
      orderBy: { recordedAt: 'desc' },
      include: {
        doctor: {
          select: {
            formData: true
          }
        }
      }
    });

    // Transform vitals to include doctor name
    const vitalsWithDoctorName = vitals.map(vital => ({
      ...vital,
      doctorName: vital.doctor?.formData?.personalInfo 
        ? `Dr. ${vital.doctor.formData.personalInfo.firstName} ${vital.doctor.formData.personalInfo.lastName}`
        : vital.recordedBy
    }));

    return NextResponse.json({
      success: true,
      data: vitalsWithDoctorName
    });

  } catch (error) {
    console.error('Error fetching patient vitals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch patient vitals' },
      { status: 500 }
    );
  }
}
