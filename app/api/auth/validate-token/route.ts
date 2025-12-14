import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Token is required'
      }, { status: 400 });
    }

    logger.info('Validating registration token', { token: token.substring(0, 8) + '...' });

    // Check if token exists and is not expired
    const result = await query(
      'SELECT * FROM "InviteLink" WHERE token = $1 AND "expiresAt" > NOW() AND "isUsed" = false',
      [token]
    );

    if (result.rows.length === 0) {
      logger.warn('Invalid or expired token', { token: token.substring(0, 8) + '...' });
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired registration link'
      }, { status: 404 });
    }

    const inviteData = result.rows[0];
    
    logger.info('Token validated successfully', { 
      role: inviteData.role,
      createdBy: inviteData.createdBy 
    });

    return NextResponse.json({
      success: true,
      data: inviteData,
      message: 'Token is valid'
    });

  } catch (error) {
    logger.error('Token validation error', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to validate token'
    }, { status: 500 });
  }
}
