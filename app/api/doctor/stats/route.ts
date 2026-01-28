export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db-retry';
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
    interface PatientStatsItem {
      id: number;
      status: string;
      formData: any;
      [key: string]: any;
    }

    // Get all patients for this doctor
    const allPatients = (await db.patient.findMany({
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
    })) as unknown as PatientStatsItem[];

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

    const stats = {
      totalPatients,
      activePatients,
      curedPatients,
      pendingApprovals,
      thisMonthVisits: 0,
      averageRating: 0,
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
