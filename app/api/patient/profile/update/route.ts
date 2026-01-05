import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { query, retryQuery } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, phone, verificationCode } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get current patient data
    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(userId) },
      select: { email: true, formData: true }
    });

    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }

    const formData = patient.formData as any;
    const updates: any = {};

    // Update email if provided and changed
    if (email && email.toLowerCase() !== patient.email.toLowerCase()) {
      // Verify code if email is changing
      if (!verificationCode) {
        return NextResponse.json(
          { success: false, error: 'Verification code is required to change email' },
          { status: 400 }
        );
      }

      // Verify the code
      const resetRequest = await prisma.passwordReset.findFirst({
        where: {
          email: email.toLowerCase(),
          code: verificationCode,
          isUsed: false,
          expiresAt: { gt: new Date() }
        }
      });

      if (!resetRequest) {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired verification code' },
          { status: 400 }
        );
      }

      // Mark code as used
      await prisma.passwordReset.update({
        where: { id: resetRequest.id },
        data: { isUsed: true }
      });

      // Update email in database
      await retryQuery(async () => {
        return await query(
          'UPDATE "Patient" SET email = $1, "updatedAt" = NOW() WHERE id = $2',
          [email.toLowerCase(), parseInt(userId)]
        );
      });

      logger.info('Patient email updated', { userId, oldEmail: patient.email, newEmail: email });
    }

    // Update phone if provided
    if (phone !== undefined) {
      const updatedFormData = {
        ...formData,
        personalInfo: {
          ...(formData?.personalInfo || {}),
          phone: phone || null
        }
      };

      await retryQuery(async () => {
        return await query(
          'UPDATE "Patient" SET "formData" = $1, "updatedAt" = NOW() WHERE id = $2',
          [JSON.stringify(updatedFormData), parseInt(userId)]
        );
      });

      logger.info('Patient phone updated', { userId });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    logger.error('Error updating patient profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

