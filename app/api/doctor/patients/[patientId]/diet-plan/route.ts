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

    // Get patient's latest vitals to determine diagnosis
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

    // Get diet plan based on diagnosis
    const dietPlan = getDietPlanByDiagnosis(latestVitals.diagnosis);
    
    if (!dietPlan) {
      return NextResponse.json({
        success: false,
        error: `No diet plan available for ${latestVitals.diagnosis}`
      }, { status: 404 });
    }

    // Get current day (1-7, Monday-Sunday)
    const today = new Date();
    const currentDay = today.getDay() === 0 ? 7 : today.getDay();

    return NextResponse.json({
      success: true,
      data: {
        dietPlan,
        currentDay,
        diagnosis: latestVitals.diagnosis
      }
    });

  } catch (error) {
    console.error('Error fetching diet plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch diet plan' },
      { status: 500 }
    );
  }
}
