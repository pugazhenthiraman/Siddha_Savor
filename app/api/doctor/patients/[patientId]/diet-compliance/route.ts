import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId: patientIdStr } = await params;
    const patientId = parseInt(patientIdStr);

    // Get last 7 days of meal data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const mealStatuses = await prisma.mealStatus.findMany({
      where: {
        patientId,
        date: {
          gte: sevenDaysAgo
        }
      },
      orderBy: { date: 'desc' }
    });

    // Group by date and calculate compliance
    const complianceData: Record<string, any> = {};
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      complianceData[dateStr] = {
        date: dateStr,
        dayName,
        totalMeals: 3, // breakfast, lunch, dinner
        completedMeals: 0,
        compliance: 0,
        meals: {
          breakfast: false,
          lunch: false,
          dinner: false
        }
      };
    }

    // Fill in actual data
    mealStatuses.forEach(meal => {
      const dateStr = meal.date.toISOString().split('T')[0];
      if (complianceData[dateStr] && meal.mealType in complianceData[dateStr].meals) {
        if (meal.status === 'completed') {
          complianceData[dateStr].completedMeals++;
          (complianceData[dateStr].meals as Record<string, boolean>)[meal.mealType] = true;
        }
      }
    });

    // Calculate compliance percentages
    Object.keys(complianceData).forEach(dateStr => {
      const data = complianceData[dateStr];
      data.compliance = Math.round((data.completedMeals / data.totalMeals) * 100);
    });

    const weeklyData = Object.values(complianceData).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate overall weekly compliance
    const totalPossibleMeals = weeklyData.length * 3;
    const totalCompletedMeals = weeklyData.reduce((sum: number, day: any) => sum + day.completedMeals, 0);
    const overallCompliance = Math.round((totalCompletedMeals / totalPossibleMeals) * 100);

    return NextResponse.json({
      success: true,
      data: {
        weeklyData,
        summary: {
          totalPossibleMeals,
          totalCompletedMeals,
          overallCompliance,
          averageDailyCompliance: Math.round(weeklyData.reduce((sum: number, day: any) => sum + day.compliance, 0) / weeklyData.length)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching weekly compliance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch weekly compliance data' },
      { status: 500 }
    );
  }
}
