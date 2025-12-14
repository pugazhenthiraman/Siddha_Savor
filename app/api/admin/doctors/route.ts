import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ERROR_MESSAGES } from '@/lib/constants/messages';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    logger.info('Admin doctors API called');

    const result = await query('SELECT * FROM "Doctor" ORDER BY "createdAt" DESC');
    const doctors = result.rows;

    logger.info('Doctors retrieved successfully', { count: doctors.length });

    return NextResponse.json({
      success: true,
      data: doctors,
      message: 'Doctors retrieved successfully',
    });

  } catch (error) {
    logger.error('Admin doctors API error', error);

    return NextResponse.json(
      {
        success: false,
        error: ERROR_MESSAGES.SERVER_ERROR,
      },
      { status: 500 }
    );
  }
}
