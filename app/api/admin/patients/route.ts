import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ERROR_MESSAGES } from '@/lib/constants/messages';

export async function GET(request: NextRequest) {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        doctor: {
          select: {
            doctorUID: true,
            email: true,
            formData: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: patients,
    });

  } catch (error) {
    console.error('Admin patients API error:', error);

    return NextResponse.json(
      { 
        success: false,
        error: ERROR_MESSAGES.SERVER_ERROR 
      },
      { status: 500 }
    );
  }
}
