import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json(
        { success: false, error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    // Get last 7 days of meal data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const mealStatuses = await prisma.mealStatus.findMany({
      where: {
        patientId: parseInt(patientId),
        date: {
          gte: sevenDaysAgo
        }
      },
      orderBy: { date: 'desc' }
    });

    // Initialize last 7 days
    const healthData: Record<string, any> = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

      healthData[dateStr] = {
        date: dateStr,
        dayName,
        totalMeals: 3,
        completedMeals: 0,
        compliance: 0,
        healthScore: 0
      };
    }

    // Fill in actual data
    interface MealStatusItem {
      date: Date;
      status: string;
    }

    (mealStatuses as unknown as MealStatusItem[]).forEach(meal => {
      const dateStr = meal.date.toISOString().split('T')[0];
      if (healthData[dateStr] && meal.status === 'completed') {
        healthData[dateStr].completedMeals++;
      }
    });

    // Calculate compliance and health scores
    Object.keys(healthData).forEach(dateStr => {
      const data = healthData[dateStr];
      data.compliance = Math.round((data.completedMeals / data.totalMeals) * 100);

      // Health score calculation based on compliance and consistency
      let healthScore = data.compliance;

      // Bonus for perfect compliance
      if (data.compliance === 100) {
        healthScore = Math.min(100, healthScore + 10);
      }

      // Penalty for very low compliance
      if (data.compliance < 50) {
        healthScore = Math.max(0, healthScore - 10);
      }

      data.healthScore = Math.round(healthScore);
    });

    const weeklyData = Object.values(healthData).sort((a: any, b: any) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate summary stats
    const totalPossibleMeals = weeklyData.length * 3;
    const totalCompletedMeals = weeklyData.reduce((sum: number, day: any) => sum + day.completedMeals, 0);
    const overallCompliance = Math.round((totalCompletedMeals / totalPossibleMeals) * 100);
    const averageHealthScore = Math.round(weeklyData.reduce((sum: number, day: any) => sum + day.healthScore, 0) / weeklyData.length);

    // Calculate current streak (consecutive days with >80% compliance)
    let currentStreak = 0;
    for (let i = weeklyData.length - 1; i >= 0; i--) {
      if (weeklyData[i].compliance >= 80) {
        currentStreak++;
      } else {
        break;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        weeklyData,
        summary: {
          totalPossibleMeals,
          totalCompletedMeals,
          overallCompliance,
          averageHealthScore,
          currentStreak
        }
      }
    });

  } catch (error) {
    console.error('Error fetching health progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch health progress data' },
      { status: 500 }
    );
  }
}
