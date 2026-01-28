import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId: patientIdStr } = await params;
    const patientId = parseInt(patientIdStr);

    if (isNaN(patientId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid patient ID' },
        { status: 400 }
      );
    }

    // Get ALL meal statuses for this patient (no date limit)
    const mealStatuses = await prisma.mealStatus.findMany({
      where: {
        patientId
      },
      orderBy: [
        { date: 'desc' },
        { mealType: 'asc' }
      ]
    });

    // Group by date
    const groupedByDate: Record<string, any> = {};

    interface MealStatusItem {
      date: Date;
      mealType: string;
      status: string;
    }

    (mealStatuses as unknown as MealStatusItem[]).forEach(meal => {
      const dateKey = meal.date.toISOString().split('T')[0];
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = {
          date: dateKey,
          breakfast: null,
          lunch: null,
          dinner: null
        };
      }
      groupedByDate[dateKey][meal.mealType as 'breakfast' | 'lunch' | 'dinner'] = meal.status;
    });

    const mealHistory = Object.values(groupedByDate).sort((a: any, b: any) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    logger.info('Fetched full meal history', { patientId, totalDays: mealHistory.length });

    return NextResponse.json({
      success: true,
      data: mealHistory,
      totalDays: mealHistory.length
    });

  } catch (error) {
    logger.error('Error fetching full meal history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch meal history' },
      { status: 500 }
    );
  }
}

