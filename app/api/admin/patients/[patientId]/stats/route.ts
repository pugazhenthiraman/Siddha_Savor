import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId: patientIdStr } = await params;
    const patientId = parseInt(patientIdStr);

    // Get patient with doctor info
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
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

    // Get patient stats
    const [totalVitals, totalAppointments] = await Promise.all([
      // Total vitals recorded for this patient
      prisma.patientVitals.count({
        where: { patientId }
      }),
      
      // Total appointments (using vitals as proxy for appointments)
      prisma.patientVitals.count({
        where: { patientId }
      })
    ]);

    // Get last visit date
    const lastVital = await prisma.patientVitals.findFirst({
      where: { patientId },
      orderBy: { recordedAt: 'desc' },
      select: { recordedAt: true }
    });

    // Extract doctor name from formData
    const formData = typeof patient.doctor?.formData === 'object' ? patient.doctor.formData as any : null;
    const doctorName = formData?.personalInfo 
      ? `Dr. ${formData.personalInfo.firstName} ${formData.personalInfo.lastName}`
      : null;

    const stats = {
      totalVitals,
      lastVisit: lastVital?.recordedAt || null,
      doctorName,
      status: 'ACTIVE', // Default status, can be enhanced with actual status field
      joinedDate: patient.createdAt,
      totalAppointments
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching patient stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch patient statistics' },
      { status: 500 }
    );
  }
}
