import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ERROR_MESSAGES } from '@/lib/constants/messages';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    logger.info('Admin stats API called');

    // Get total doctors
    const totalDoctors = await prisma.doctor.count();
    logger.debug('Total doctors counted', { totalDoctors });

    // Get total patients
    const totalPatients = await prisma.patient.count();
    logger.debug('Total patients counted', { totalPatients });

    // Get pending doctor approvals
    const pendingApprovals = await prisma.doctor.count({
      where: { status: 'PENDING' }
    });
    logger.debug('Pending approvals counted', { pendingApprovals });

    // Get active invites (not expired)
    const activeInvites = await prisma.inviteLink.count({
      where: {
        expiresAt: {
          gt: new Date()
        }
      }
    });
    logger.debug('Active invites counted', { activeInvites });

    // For now, we'll simulate cured patients (you can add this field to patient model later)
    const curedPatients = Math.floor(totalPatients * 0.3); // 30% assumed cured

    const stats = {
      totalDoctors,
      totalPatients,
      curedPatients,
      pendingApprovals,
      activeInvites,
      systemHealth: 100 // Always 100% for now
    };

    logger.info('Admin stats retrieved successfully', stats);

    return NextResponse.json({
      success: true,
      data: stats,
    });

  } catch (error) {
    logger.error('Admin stats API error', error, { 
      url: request.url,
      method: request.method 
    });

    return NextResponse.json(
      { 
        success: false,
        error: ERROR_MESSAGES.SERVER_ERROR 
      },
      { status: 500 }
    );
  }
}
