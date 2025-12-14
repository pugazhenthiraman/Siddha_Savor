import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    logger.info('Fetching invite links for debug');
    
    const result = await query(`
      SELECT 
        id,
        token,
        role,
        "doctorUID",
        "expiresAt",
        "createdAt",
        CASE 
          WHEN "expiresAt" > NOW() THEN 'ACTIVE'
          ELSE 'EXPIRED'
        END as status,
        EXTRACT(EPOCH FROM ("expiresAt" - NOW())) / 3600 as hours_remaining
      FROM "InviteLink" 
      ORDER BY "createdAt" DESC 
      LIMIT 10
    `);
    
    const invites = result.rows.map(row => ({
      ...row,
      hours_remaining: row.hours_remaining > 0 ? Math.round(row.hours_remaining * 100) / 100 : 0,
      invite_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/register?token=${row.token}`
    }));

    return NextResponse.json({
      success: true,
      data: invites,
      message: 'Invite links retrieved for debugging'
    });

  } catch (error) {
    logger.error('Debug invites error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch invite links'
    }, { status: 500 });
  }
}
