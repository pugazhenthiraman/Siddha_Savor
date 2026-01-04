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
    // Get current month start and end dates
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get all patients for this doctor
    const allPatients = await prisma.patient.findMany({
      where: { doctorUID },
      select: {
        id: true,
        password: true,
        inviteToken: true,
        formData: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Calculate stats using database status field
    const totalPatients = allPatients.filter(p => p.status === 'APPROVED').length;
    const pendingApprovals = allPatients.filter(p => p.status === 'PENDING').length;
    
    // Active patients: approved and not cured
    const activePatients = allPatients.filter(p => {
      if (p.status !== 'APPROVED') return false;
      const formData = p.formData as any;
      const status = formData?.status || formData?.personalInfo?.status;
      return status !== 'CURED';
    }).length;

    // Cured patients: approved and marked as cured
    const curedPatients = allPatients.filter(p => {
      if (p.status !== 'APPROVED') return false;
      const formData = p.formData as any;
      const status = formData?.status || formData?.personalInfo?.status;
      return status === 'CURED';
    }).length;

    // This month visits - not implemented yet
    const thisMonthVisits = 0;

    // Average rating - not implemented yet  
    const averageRating = 0;

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
