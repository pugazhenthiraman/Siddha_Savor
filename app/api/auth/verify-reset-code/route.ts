import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { ERROR_MESSAGES } from '@/lib/constants/messages';
import { z } from 'zod';

const verifyCodeSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Code must be 6 digits'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = verifyCodeSchema.parse(body);

    // Find valid reset request
    const resetRequest = await prisma.passwordReset.findFirst({
      where: {
        email,
        code,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!resetRequest) {
      logger.warn('Verify reset code failed - invalid or expired', { email });
      return NextResponse.json(
        { success: false, error: 'Invalid or expired code' },
        { status: 400 }
      );
    }

    // Update the reset request with verification data
    await prisma.passwordReset.update({
      where: { id: resetRequest.id },
      data: {
        data: {
          ...resetRequest.data as object,
          verifiedAt: new Date().toISOString(),
          verificationIp: request.headers.get('x-forwarded-for') || 'unknown',
        },
      },
    });

    logger.info('Reset code verified successfully', { email });

    return NextResponse.json({
      success: true,
      message: 'Code verified successfully',
    });

  } catch (error) {
    logger.error('Verify reset code API error', error, { 
      url: request.url,
      method: request.method 
    });
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    );
  }
}
