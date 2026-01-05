import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId: patientIdStr } = await params;
    const patientId = parseInt(patientIdStr);

    // Get patient meal status for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const mealStatuses = await prisma.mealStatus.findMany({
      where: {
        patientId,
        date: {
          gte: sevenDaysAgo
        }
      },
      orderBy: [
        { date: 'desc' },
        { mealType: 'asc' }
      ]
    });

    // Group by date
    const groupedByDate: Record<string, any> = {};
    
    mealStatuses.forEach(meal => {
      const dateKey = meal.date.toISOString().split('T')[0];
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = {
          date: dateKey,
          breakfast: null,
          lunch: null,
          dinner: null
        };
      }
      groupedByDate[dateKey][meal.mealType] = meal.status;
    });

    const mealHistory = Object.values(groupedByDate).sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json({
      success: true,
      data: mealHistory
    });

  } catch (error) {
    console.error('Error fetching patient meal history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch meal history' },
      { status: 500 }
    );
  }
}
