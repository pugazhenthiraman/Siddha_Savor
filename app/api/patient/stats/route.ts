export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json(
        { success: false, error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    // Get patient with doctor info
    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(patientId) },
      include: {
        doctor: {
          select: {
            formData: true
          }
        }
      }
    });

    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Get latest vitals
    const latestVitals = await prisma.patientVitals.findFirst({
      where: { patientId: parseInt(patientId) },
      orderBy: { recordedAt: 'desc' }
    });

    // Extract doctor name
    const doctorData = patient.doctor?.formData as any;
    const doctorName = doctorData?.personalInfo
      ? `Dr. ${doctorData.personalInfo.firstName} ${doctorData.personalInfo.lastName}`
      : 'Not Assigned';

    const stats = {
      doctorName,
      bmr: latestVitals?.bmr || null,
      tdee: latestVitals?.tdee || null,
      weight: latestVitals?.weight || null,
      diagnosis: latestVitals?.diagnosis || null,
      thegi: latestVitals?.thegi || null,
      lastUpdated: latestVitals?.recordedAt || null
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching patient stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch patient statistics' },
      { status: 500 }
    );
  }
}
