import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, VALIDATION_MESSAGES } from '@/lib/constants/messages';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    logger.debug('Reset password request received');
    
    const { token, code, newPassword, confirmPassword } = body;

    // Trim whitespace
    const trimmedToken = token?.trim();
    const trimmedCode = code?.trim();
    const trimmedNewPassword = newPassword?.trim();
    const trimmedConfirmPassword = confirmPassword?.trim();

    if (!trimmedToken || !trimmedCode || !trimmedNewPassword || !trimmedConfirmPassword) {
      logger.warn('Reset password validation failed - missing fields');
      return NextResponse.json({ 
        success: false, 
        error: ERROR_MESSAGES.ALL_FIELDS_REQUIRED 
      }, { status: 400 });
    }

    if (trimmedNewPassword !== trimmedConfirmPassword) {
      logger.warn('Reset password validation failed - passwords do not match');
      return NextResponse.json({ 
        success: false, 
        error: VALIDATION_MESSAGES.PASSWORD_MISMATCH 
      }, { status: 400 });
    }

    if (trimmedNewPassword.length < 6) {
      logger.warn('Reset password validation failed - password too short');
      return NextResponse.json({ 
        success: false, 
        error: ERROR_MESSAGES.PASSWORD_MIN_LENGTH 
      }, { status: 400 });
    }

    // Find valid reset token
    const resetToken = await prisma.passwordReset.findFirst({
      where: {
        token: trimmedToken,
        code: trimmedCode,
        isUsed: false,
        expiresAt: { gt: new Date() }
      }
    });

    if (!resetToken) {
      logger.warn('Reset password failed - invalid or expired token', { 
        hasToken: !!trimmedToken,
        hasCode: !!trimmedCode 
      });
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid or expired verification code' 
      }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(trimmedNewPassword, 10);

    // Update password based on user role
    if (resetToken.userRole === 'admin') {
      await prisma.admin.update({
        where: { email: resetToken.email },
        data: { password: hashedPassword }
      });
    } else if (resetToken.userRole === 'doctor') {
      await prisma.doctor.update({
        where: { email: resetToken.email },
        data: { password: hashedPassword }
      });
    } else if (resetToken.userRole === 'patient') {
      await prisma.patient.update({
        where: { email: resetToken.email },
        data: { password: hashedPassword }
      });
    }

    // Mark token as used
    await prisma.passwordReset.update({
      where: { id: resetToken.id },
      data: { isUsed: true }
    });

    logger.info('Password reset successful', { 
      email: resetToken.email,
      userRole: resetToken.userRole 
    });

    return NextResponse.json({ 
      success: true, 
      message: SUCCESS_MESSAGES.PASSWORD_CHANGED 
    });

  } catch (error) {
    logger.error('Reset password API error', error, { 
      url: request.url,
      method: request.method 
    });
    
    return NextResponse.json({ 
      success: false, 
      error: ERROR_MESSAGES.SERVER_ERROR 
    }, { status: 500 });
  }
}
