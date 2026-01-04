import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { withErrorHandler } from '@/lib/middleware/api-error-handler';

export const POST = withErrorHandler(async (request: NextRequest) => {
  let doctorUID: string | undefined;
  
  try {
    const body = await request.json();
    const { doctorUID: extractedDoctorUID, recipientEmail, recipientName, role } = body;
    doctorUID = extractedDoctorUID;

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

    logger.info('Patient invite generated successfully', { 
      doctorUID, 
      token: inviteLink.token.substring(0, 8) + '...',
      expiresAt: inviteLink.expiresAt 
    });

    return NextResponse.json({
      success: true,
      data: inviteLink,
      message: 'Patient invite generated successfully',
    });
  } catch (error) {
    logger.error('Error generating patient invite', error, { doctorUID });
    return NextResponse.json(
      { success: false, error: 'Failed to generate patient invite' },
      { status: 500 }
    );
  }
});
