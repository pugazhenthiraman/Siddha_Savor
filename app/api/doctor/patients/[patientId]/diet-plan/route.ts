import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
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

    console.log(`[DietPlan Debug] Patient ID: ${patientId}`);
    console.log(`[DietPlan Debug] Latest Vitals Diagnosis: ${latestVitals?.diagnosis}`);

    if (!latestVitals?.diagnosis) {
      return NextResponse.json({
        success: false,
        error: 'No diagnosis found for patient'
      }, { status: 404 });
    }

    // Try to get custom diet plan first
    let dietPlan;
    let isCustomPlan = false;

    const customDietPlan = await prisma.customDietPlan.findUnique({
      where: { patientId }
    });

    if (customDietPlan && customDietPlan.planData) {
      // Use custom diet plan
      dietPlan = customDietPlan.planData as any;
      isCustomPlan = true;
    } else {
      // Fall back to default plan based on diagnosis
      try {
        console.log(`[DietPlan Debug] Searching for plan with diagnosis key: "${latestVitals.diagnosis}"`);
        dietPlan = getDietPlanByDiagnosis(latestVitals.diagnosis);
        console.log(`[DietPlan Debug] Plan found: ${dietPlan ? 'Yes' : 'No'}`);
      } catch (error) {
        // If default plan not found, return error
        return NextResponse.json({
          success: false,
          error: `No diet plan available for ${latestVitals.diagnosis}`
        }, { status: 404 });
      }
    }

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
        diagnosis: latestVitals.diagnosis,
        isCustomPlan
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
