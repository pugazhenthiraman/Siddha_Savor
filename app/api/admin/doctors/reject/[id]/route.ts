import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ERROR_MESSAGES } from '@/lib/constants/messages';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const doctorId = parseInt(params.id);
    
    if (isNaN(doctorId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid doctor ID' },
        { status: 400 }
      );
    }

    logger.info('Rejecting doctor', { doctorId });

    const result = await query(
      'UPDATE "Doctor" SET status = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *',
      ['REJECTED', doctorId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Doctor not found' },
        { status: 404 }
      );
    }

    const doctor = result.rows[0];

    logger.info('Doctor rejected successfully', { doctorId });

    return NextResponse.json({
      success: true,
      data: doctor,
      message: 'Doctor rejected successfully',
    });

  } catch (error) {
    logger.error('Doctor rejection error', error);

    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    );
  }
}
