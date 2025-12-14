import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table') || 'all';

    logger.info('Database view request', { table });

    let result: any = {};

    if (table === 'all' || table === 'Admin') {
      const adminResult = await query('SELECT id, email, "createdAt", "smtpConfig" FROM "Admin" ORDER BY id');
      result.Admin = adminResult.rows;
    }

    if (table === 'all' || table === 'Doctor') {
      const doctorResult = await query('SELECT id, email, status, "doctorUID", "createdAt", "updatedAt" FROM "Doctor" ORDER BY "createdAt" DESC');
      result.Doctor = doctorResult.rows;
    }

    if (table === 'all' || table === 'Patient') {
      const patientResult = await query('SELECT id, email, "doctorUID", "createdAt", "updatedAt" FROM "Patient" ORDER BY "createdAt" DESC');
      result.Patient = patientResult.rows;
    }

    if (table === 'all' || table === 'InviteLink') {
      const inviteResult = await query(`
        SELECT 
          id, token, role, "doctorUID", "createdBy", "recipientEmail", 
          "isUsed", "expiresAt", "createdAt",
          CASE 
            WHEN "expiresAt" > NOW() THEN 'ACTIVE'
            ELSE 'EXPIRED'
          END as status
        FROM "InviteLink" 
        ORDER BY "createdAt" DESC 
        LIMIT 50
      `);
      result.InviteLink = inviteResult.rows;
    }

    // Get table counts
    const counts: any = {};
    if (table === 'all') {
      const adminCount = await query('SELECT COUNT(*) as count FROM "Admin"');
      const doctorCount = await query('SELECT COUNT(*) as count FROM "Doctor"');
      const patientCount = await query('SELECT COUNT(*) as count FROM "Patient"');
      const inviteCount = await query('SELECT COUNT(*) as count FROM "InviteLink"');
      
      counts.Admin = parseInt(adminCount.rows[0].count);
      counts.Doctor = parseInt(doctorCount.rows[0].count);
      counts.Patient = parseInt(patientCount.rows[0].count);
      counts.InviteLink = parseInt(inviteCount.rows[0].count);
    }

    return NextResponse.json({
      success: true,
      data: result,
      counts: counts,
      message: `Database ${table} data retrieved successfully`
    });

  } catch (error) {
    logger.error('Database view error', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve database data'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, table, id } = body;

    if (action === 'delete' && table && id) {
      logger.info('Database delete request', { table, id });
      
      // Only allow deletion of invite links for safety
      if (table === 'InviteLink') {
        await query('DELETE FROM "InviteLink" WHERE id = $1', [id]);
        return NextResponse.json({
          success: true,
          message: 'Invite link deleted successfully'
        });
      } else {
        return NextResponse.json({
          success: false,
          error: 'Deletion only allowed for InviteLink table'
        }, { status: 403 });
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action or missing parameters'
    }, { status: 400 });

  } catch (error) {
    logger.error('Database action error', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to perform database action'
    }, { status: 500 });
  }
}
