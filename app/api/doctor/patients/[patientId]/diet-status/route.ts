import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDietPlanByDiagnosis } from '@/lib/dietPlans';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId: patientIdStr } = await params;
    const patientId = parseInt(patientIdStr);

    // Get today's date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Get patient's latest diagnosis
    const latestVitals = await prisma.patientVitals.findFirst({
      where: { patientId },
      orderBy: { recordedAt: 'desc' }
    });

    if (!latestVitals?.diagnosis) {
      return NextResponse.json({
        success: false,
        error: 'No diagnosis found for patient'
      }, { status: 404 });
    }

    // Get diet plan
    const dietPlan = getDietPlanByDiagnosis(latestVitals.diagnosis);
    if (!dietPlan) {
      return NextResponse.json({
        success: false,
        error: `No diet plan available for ${latestVitals.diagnosis}`
      }, { status: 404 });
    }

    // Get current day plan
    const currentDay = today.getDay() === 0 ? 7 : today.getDay();
    const dayPlan = dietPlan.days[currentDay - 1];

    // Get meal statuses for today
    const mealStatuses = await prisma.mealStatus.findMany({
      where: {
        patientId,
        date: new Date(todayStr)
      }
    });

    // Create diet entries based on diet plan and meal statuses
    const dietEntries = [];
    const mealTypes = ['breakfast', 'lunch', 'dinner'];

    mealTypes.forEach((mealType) => {
      const mealStatus = mealStatuses.find(m => m.mealType === mealType);
      const mealItems = dayPlan?.meals[mealType as keyof typeof dayPlan.meals] || [];
      
      if (Array.isArray(mealItems) && mealItems.length > 0) {
        dietEntries.push({
          id: dietEntries.length + 1,
          date: todayStr,
          mealType,
          foodItems: mealItems,
          completed: mealStatus?.status === 'completed' || false,
          calories: calculateMealCalories(mealType)
        });
      }
    });

    // Calculate compliance stats
    const completedMeals = dietEntries.filter(entry => entry.completed).length;
    const totalMeals = dietEntries.length;
    const compliancePercentage = totalMeals > 0 ? Math.round((completedMeals / totalMeals) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        dietEntries,
        stats: {
          completedMeals,
          totalMeals,
          compliancePercentage
        },
        diagnosis: latestVitals.diagnosis,
        currentDay
      }
    });

  } catch (error) {
    console.error('Error fetching diet status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch diet status' },
      { status: 500 }
    );
  }
}

function calculateMealCalories(mealType: string): number {
  // Estimated calories based on meal type
  const calorieMap: Record<string, number> = {
    breakfast: 350,
    lunch: 450,
    dinner: 400
  };
  return calorieMap[mealType] || 300;
}
