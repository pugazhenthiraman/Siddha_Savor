import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ERROR_MESSAGES } from '@/lib/constants/messages';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const whereClause = status ? { status: status as any } : {};

    const doctors = await prisma.doctor.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: doctors,
    });

  } catch (error) {
    console.error('Admin doctors API error:', error);

    return NextResponse.json(
      { 
        success: false,
        error: ERROR_MESSAGES.SERVER_ERROR 
      },
      { status: 500 }
    );
  }
}
