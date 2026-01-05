import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { patientId, mealType, date, status } = await request.json();

    // Update or create meal status
    const mealStatus = await prisma.mealStatus.upsert({
      where: {
        patientId_date_mealType: {
          patientId: parseInt(patientId),
          date: new Date(date),
          mealType
        }
      },
      update: {
        status,
        updatedAt: new Date()
      },
      create: {
        patientId: parseInt(patientId),
        date: new Date(date),
        mealType,
        status
      }
    });

    return NextResponse.json({
      success: true,
      data: mealStatus
    });

  } catch (error) {
    console.error('Error updating meal status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update meal status' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const date = searchParams.get('date');

    if (!patientId) {
      return NextResponse.json(
        { success: false, error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    const whereClause: any = {
      patientId: parseInt(patientId)
    };

    if (date) {
      whereClause.date = new Date(date);
    }

    const mealStatuses = await prisma.mealStatus.findMany({
      where: whereClause,
      orderBy: { date: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: mealStatuses
    });

  } catch (error) {
    console.error('Error fetching meal status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch meal status' },
      { status: 500 }
    );
  }
}
