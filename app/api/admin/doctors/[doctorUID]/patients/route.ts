import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ doctorUID: string }> }
) {
  try {
    const { doctorUID } = await params;

    // Get patients assigned to this doctor
    const patients = await prisma.patient.findMany({
      where: { doctorUID },
      select: {
        id: true,
        patientUID: true,
        email: true,
        formData: true,
        createdAt: true,
        updatedAt: true,
        // Include vitals count for each patient
        vitals: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to include vitals count
    interface PatientWithVitals {
      id: number;
      patientUID: string | null;
      email: string;
      formData: any;
      createdAt: Date;
      updatedAt: Date;
      vitals: { id: number }[];
    }

    const patientsWithStats = (patients as unknown as PatientWithVitals[]).map(patient => ({
      ...patient,
      vitalsCount: patient.vitals.length,
      vitals: undefined // Remove the vitals array from response
    }));

    return NextResponse.json({
      success: true,
      data: patientsWithStats
    });

  } catch (error) {
    console.error('Error fetching doctor patients:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch doctor patients' },
      { status: 500 }
    );
  }
}
