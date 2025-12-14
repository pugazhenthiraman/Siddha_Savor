import { NextRequest, NextResponse } from 'next/server';
import { ERROR_MESSAGES } from '@/lib/constants/messages';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    logger.info('2FA verification API called');
    
    const body = await request.json();
    const { email } = body;

    logger.info('2FA verification request', { email });

    // For now, simulate 2FA check
    // In production, you'd check with email provider APIs
    const has2FA = email.includes('gmail') || email.includes('outlook'); // Simulate based on provider
    
    const result = {
      has2FA,
      provider: has2FA ? (email.includes('gmail') ? 'Google' : 'Microsoft') : undefined
    };

    logger.info('2FA verification completed', { email, has2FA });

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    logger.error('2FA verification API error', error);

    return NextResponse.json(
      { 
        success: false,
        error: ERROR_MESSAGES.SERVER_ERROR 
      },
      { status: 500 }
    );
  }
}
