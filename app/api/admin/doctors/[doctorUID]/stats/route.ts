import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { doctorUID: string } }
) {
  try {
    const { doctorUID } = params;

    // Get doctor stats
    const [totalPatients, activePatients, curedPatients, totalVitals] = await Promise.all([
      // Total patients assigned to this doctor
      prisma.patient.count({
        where: { doctorUID }
      }),
      
      // Active patients (assuming patients without status or with ACTIVE status are active)
      prisma.patient.count({
        where: { 
          doctorUID,
          // Add status filter when available in schema
        }
      }),
      
      // Cured patients (this would need a status field in Patient model)
      prisma.patient.count({
        where: { 
          doctorUID,
          // Add status: 'CURED' when available
        }
      }),
      
      // Total vitals recorded by this doctor
      prisma.patientVitals.count({
        where: { doctorUID }
      })
    ]);

    // Get doctor info for join date
    const doctor = await prisma.doctor.findUnique({
      where: { doctorUID },
      select: { createdAt: true }
    });

    const stats = {
      totalPatients,
      activePatients, // For now, same as total since we don't have status field
      curedPatients: 0, // Will be 0 until status field is added
      totalVitals,
      recentActivity: new Date().toISOString(), // Could be last vitals recorded date
      joinedDate: doctor?.createdAt || new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching doctor stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch doctor statistics' },
      { status: 500 }
    );
  }
}
