import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ERROR_MESSAGES } from '@/lib/constants/messages';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const invites = await prisma.inviteLink.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

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
    const { role, doctorUID } = body;

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

    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await prisma.inviteLink.create({
      data: {
        token,
        role: role as 'DOCTOR' | 'PATIENT',
        doctorUID: doctorUID || null,
        expiresAt,
      }
    });

    return NextResponse.json({
      success: true,
      data: invite,
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
