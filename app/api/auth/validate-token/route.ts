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
    
    console.log('🔍 DEBUG: Original invite data from DB:', {
      role: inviteData.role,
      createdBy: inviteData.createdBy,
      doctorUID: inviteData.doctorUID,
      token: inviteData.token.substring(0, 8) + '...'
    });
    
    // For admin-generated patient invites, remove doctorUID to prevent prefilling
    if (inviteData.role === 'PATIENT' && inviteData.createdBy === 'ADMIN') {
      delete inviteData.doctorUID;
      console.log('🛠️ DEBUG: Removed doctorUID for admin patient invite');
    }
    
    console.log('📤 DEBUG: Final invite data being sent:', {
      role: inviteData.role,
      createdBy: inviteData.createdBy,
      doctorUID: inviteData.doctorUID,
      hasDoctorUID: 'doctorUID' in inviteData
    });
    
    logger.info('Token validated successfully', { 
      role: inviteData.role,
      createdBy: inviteData.createdBy,
      hasDoctorUID: !!inviteData.doctorUID
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
