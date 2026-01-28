export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

// Simple scheduler endpoint that can be called by external cron services
export async function GET() {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  let mealType = null;

  // Check if it's meal time (with 5-minute window)
  if (hour === 8 && minute <= 5) {
    mealType = 'breakfast';
  } else if (hour === 12 && minute >= 25 && minute <= 35) {
    mealType = 'lunch';
  } else if (hour === 20 && minute <= 5) { // 8 PM
    mealType = 'dinner';
  }

  if (!mealType) {
    return NextResponse.json({
      success: false,
      message: 'Not meal time',
      currentTime: now.toISOString()
    });
  }

  try {
    // Call the meal reminder endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/cron/meal-reminders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mealType })
    });

    const result = await response.json();

    return NextResponse.json({
      success: true,
      mealType,
      currentTime: now.toISOString(),
      reminderResult: result
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to trigger meal reminders',
      mealType,
      currentTime: now.toISOString()
    }, { status: 500 });
  }
}
