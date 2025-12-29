import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withErrorHandler } from '@/lib/middleware/api-error-handler';

export const POST = withErrorHandler(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { doctorUID, recipientEmail, recipientName, role } = body;

    if (!doctorUID || !role) {
      return NextResponse.json(
        { success: false, error: 'Doctor UID and role are required' },
        { status: 400 }
      );
    }

    if (role !== 'PATIENT') {
      return NextResponse.json(
        { success: false, error: 'Only patient invites are supported' },
        { status: 400 }
      );
    }

    // Generate unique token
    const token = `patient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Set expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invite link
    const inviteLink = await prisma.inviteLink.create({
      data: {
        token,
        role: 'PATIENT',
        doctorUID,
        createdBy: doctorUID,
        recipientEmail: recipientEmail || null,
        recipientName: recipientName || null,
        expiresAt,
      }
    });

    return NextResponse.json({
      success: true,
      data: inviteLink,
      message: 'Patient invite generated successfully',
    });
  } catch (error) {
    console.error('Error generating patient invite:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate patient invite' },
      { status: 500 }
    );
  }
});
