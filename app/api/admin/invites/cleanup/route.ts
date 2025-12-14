import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    logger.info('Starting invite links cleanup');
    
    // Delete links expired for more than 24 hours
    const result = await query(`
      DELETE FROM "InviteLink" 
      WHERE "expiresAt" < NOW() - INTERVAL '24 hours'
      RETURNING id, token, role, "expiresAt"
    `);
    
    const deletedCount = result.rows.length;
    
    logger.info('Cleanup completed', { deletedCount });
    
    return NextResponse.json({
      success: true,
      data: {
        deletedCount,
        deletedLinks: result.rows
      },
      message: `Cleaned up ${deletedCount} expired invite links`
    });

  } catch (error) {
    logger.error('Cleanup error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to cleanup expired links'
    }, { status: 500 });
  }
}

// Auto-cleanup when getting invite links
export async function GET(request: NextRequest) {
  try {
    // First, auto-cleanup expired links older than 24 hours
    await query(`
      DELETE FROM "InviteLink" 
      WHERE "expiresAt" < NOW() - INTERVAL '24 hours'
    `);
    
    // Then return current active and recently expired links
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
    `);
    
    return NextResponse.json({
      success: true,
      data: result.rows,
      message: 'Invite links retrieved (auto-cleanup performed)'
    });

  } catch (error) {
    logger.error('Get invites with cleanup error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch invite links'
    }, { status: 500 });
  }
}
