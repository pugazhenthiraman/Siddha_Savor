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
    interface VitalWithDoctor {
      id: number;
      patientId: number;
      doctorUID: string;
      recordedBy: string;
      recordedAt: Date;
      doctor: {
        formData: any;
      };
      // Keep other fields if needed, but for mapping these are enough
      [key: string]: any;
    }

    const vitalsWithDoctorName = (vitals as unknown as VitalWithDoctor[]).map(vital => {
      const formData = typeof vital.doctor?.formData === 'object' ? vital.doctor.formData as any : null;
      return {
        ...vital,
        doctorName: formData?.personalInfo
          ? `Dr. ${formData.personalInfo.firstName} ${formData.personalInfo.lastName}`
          : vital.recordedBy
      };
    });

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
