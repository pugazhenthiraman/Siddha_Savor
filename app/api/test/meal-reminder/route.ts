import { NextRequest, NextResponse } from 'next/server';
import { mealReminderService } from '@/lib/services/mealReminderService';

export async function POST(request: NextRequest) {
  try {
    const { patientEmail, patientName, mealType } = await request.json();

    const testReminderSent = await mealReminderService.sendMealReminder({
      patientName: patientName || 'Test Patient',
      patientEmail,
      diagnosis: 'Test Diagnosis',
      mealType: mealType || 'breakfast',
      mealItems: ['Test meal item 1', 'Test meal item 2'],
      siddhaNotes: 'This is a test reminder'
    });

    return NextResponse.json({
      success: testReminderSent,
      message: testReminderSent ? 'Test reminder sent successfully' : 'Failed to send test reminder'
    });

  } catch (error) {
    console.error('Error sending test reminder:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send test reminder' },
      { status: 500 }
    );
  }
}
