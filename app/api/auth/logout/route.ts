import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    logger.info('Logout API called');
    
    // In a real app, you might:
    // - Invalidate JWT tokens
    // - Clear server-side sessions
    // - Log the logout event
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error('Logout API error', error);
    
    // Even if logout fails on server, return success
    // because client-side logout should always work
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  }
}
