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

    logger.info('Approving doctor', { doctorId });

    // Generate doctor UID
    const doctorUID = `DOC${String(doctorId).padStart(5, '0')}`;

    const result = await query(
      'UPDATE "Doctor" SET status = $1, "doctorUID" = $2, "updatedAt" = NOW() WHERE id = $3 RETURNING *',
      ['APPROVED', doctorUID, doctorId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Doctor not found' },
        { status: 404 }
      );
    }

    const doctor = result.rows[0];

    logger.info('Doctor approved successfully', { doctorId, doctorUID });

    return NextResponse.json({
      success: true,
      data: doctor,
      message: 'Doctor approved successfully',
    });

  } catch (error) {
    logger.error('Doctor approval error', error);

    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    );
  }
}
