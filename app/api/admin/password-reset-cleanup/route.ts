import { NextRequest, NextResponse } from 'next/server';
import { PasswordResetService } from '@/lib/services/passwordResetService';

export async function POST(request: NextRequest) {
  try {
    // Clean up expired tokens
    const cleanedCount = await PasswordResetService.cleanupExpiredTokens();
    
    // Get current stats
    const stats = await PasswordResetService.getResetStats();

    return NextResponse.json({
      success: true,
      data: {
        cleanedTokens: cleanedCount,
        stats,
      },
      message: `Cleaned up ${cleanedCount} expired tokens`,
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cleanup tokens' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const stats = await PasswordResetService.getResetStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });

  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get stats' },
      { status: 500 }
    );
  }
}
