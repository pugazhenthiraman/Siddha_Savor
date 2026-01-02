import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ERROR_MESSAGES } from '@/lib/constants/messages';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    logger.info('Admin patients API called');

    // Only get APPROVED patients for admin
    const result = await query('SELECT * FROM "Patient" WHERE status = $1 ORDER BY "createdAt" DESC', ['APPROVED']);
    const patients = result.rows;

    logger.info('Approved patients retrieved successfully', { count: patients.length });

    return NextResponse.json({
      success: true,
      data: patients,
      message: 'Patients retrieved successfully',
    });

  } catch (error) {
    logger.error('Admin patients API error', error);

    return NextResponse.json(
      {
        success: false,
        error: ERROR_MESSAGES.SERVER_ERROR,
      },
      { status: 500 }
    );
  }
}
