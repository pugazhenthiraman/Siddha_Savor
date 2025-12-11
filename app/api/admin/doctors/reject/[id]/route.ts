import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ERROR_MESSAGES } from '@/lib/constants/messages';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const doctorId = parseInt(params.id);

    if (isNaN(doctorId)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid doctor ID' 
        },
        { status: 400 }
      );
    }

    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        status: 'REJECTED',
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedDoctor,
      message: 'Doctor application rejected'
    });

  } catch (error) {
    console.error('Reject doctor API error:', error);

    return NextResponse.json(
      { 
        success: false,
        error: ERROR_MESSAGES.SERVER_ERROR 
      },
      { status: 500 }
    );
  }
}
