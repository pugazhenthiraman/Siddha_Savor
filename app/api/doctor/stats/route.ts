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
    // Get total patients for this doctor
    const totalPatients = await prisma.patient.count({
      where: { doctorUID }
    });

    // Get active patients (those with password set and not cured)
    const activePatients = await prisma.patient.count({
      where: { 
        doctorUID,
        password: { not: null },
        // Add status filter when status field is available
      }
    });

    // Get pending approvals (patients without password)
    const pendingApprovals = await prisma.patient.count({
      where: { 
        doctorUID,
        password: null,
        inviteToken: { not: null }
      }
    });

    // Mock data for other stats (implement based on your schema)
    const curedPatients = Math.floor(totalPatients * 0.25); // 25% cured
    const thisMonthVisits = Math.floor(totalPatients * 2.5); // Average 2.5 visits per patient
    const averageRating = 4.8; // Mock rating

    const stats = {
      totalPatients,
      activePatients,
      curedPatients,
      pendingApprovals,
      thisMonthVisits,
      averageRating,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching doctor stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch doctor statistics' },
      { status: 500 }
    );
  }
});
