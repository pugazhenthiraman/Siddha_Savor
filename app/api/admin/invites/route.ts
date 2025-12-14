import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ERROR_MESSAGES } from '@/lib/constants/messages';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const result = await query('SELECT * FROM "InviteLink" ORDER BY "createdAt" DESC');
    const invites = result.rows;

    return NextResponse.json({
      success: true,
      data: invites,
    });

  } catch (error) {
    console.error('Get invites API error:', error);

    return NextResponse.json(
      { 
        success: false,
        error: ERROR_MESSAGES.SERVER_ERROR 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role, doctorUID, recipientEmail, recipientName, createdBy } = body;

    if (!role || !['DOCTOR', 'PATIENT'].includes(role)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid role. Must be DOCTOR or PATIENT' 
        },
        { status: 400 }
      );
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');

    // Set expiration to 3 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 3);

    const result = await query(
      `INSERT INTO "InviteLink" 
       (token, role, "doctorUID", "createdBy", "recipientEmail", "recipientName", "expiresAt", "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
       RETURNING *`,
      [
        token, 
        role, 
        doctorUID || null, 
        createdBy || 'ADMIN',
        recipientEmail || null,
        recipientName || null,
        expiresAt
      ]
    );

    const invite = result.rows[0];

    // Auto-cleanup expired links older than 24 hours
    await query(`
      DELETE FROM "InviteLink" 
      WHERE "expiresAt" < NOW() - INTERVAL '24 hours'
    `);

    return NextResponse.json({
      success: true,
      data: {
        ...invite,
        inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/register?token=${token}`
      },
      message: 'Invite link created successfully'
    });

  } catch (error) {
    console.error('Create invite API error:', error);

    return NextResponse.json(
      { 
        success: false,
        error: ERROR_MESSAGES.SERVER_ERROR 
      },
      { status: 500 }
    );
  }
}
