import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { mealReminderService } from '@/lib/services/mealReminderService';
import { getDietPlanByDiagnosis } from '@/lib/dietPlans';

export async function POST(request: NextRequest) {
  try {
    const { mealType } = await request.json();

    if (!['breakfast', 'lunch', 'dinner'].includes(mealType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid meal type' },
        { status: 400 }
      );
    }

    // Get all patients with diagnosis
    const patients = await prisma.patient.findMany({
      where: {
        status: 'APPROVED'
      },
      include: {
        vitals: {
          orderBy: { recordedAt: 'desc' },
          take: 1
        }
      }
    });

    const remindersSent = [];

    for (const patient of patients) {
      const latestVital = patient.vitals[0];
      if (!latestVital?.diagnosis) continue;

      const dietPlan = getDietPlanByDiagnosis(latestVital.diagnosis);
      if (!dietPlan) continue;

      // Get current day plan - JavaScript: 0=Sunday, 1=Monday, etc.
      // Diet plan: 1=Monday, 2=Tuesday, ..., 7=Sunday
      const today = new Date().getDay(); // 0-6
      const currentDay = today === 0 ? 7 : today; // Convert Sunday (0) to 7
      const dayPlan = dietPlan.days[currentDay - 1]; // Array is 0-indexed

      if (!dayPlan) continue;

      const patientData = patient.formData as any;
      const patientName = `${patientData?.personalInfo?.firstName || ''} ${patientData?.personalInfo?.lastName || ''}`.trim();

      const mealItems = dayPlan.meals[mealType as keyof typeof dayPlan.meals] as string[] || [];

      const reminderSent = await mealReminderService.sendMealReminder({
        patientName: patientName || 'Patient',
        patientEmail: patient.email,
        diagnosis: latestVital.diagnosis,
        mealType: mealType as 'breakfast' | 'lunch' | 'dinner',
        mealItems,
        siddhaNotes: dayPlan.meals.notes
      });

      if (reminderSent) {
        remindersSent.push({
          patientId: patient.id,
          email: patient.email,
          mealType
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${remindersSent.length} ${mealType} reminders`,
      data: remindersSent
    });

  } catch (error) {
    console.error('Error sending meal reminders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send meal reminders' },
      { status: 500 }
    );
  }
}
