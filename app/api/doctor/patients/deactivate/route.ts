import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants/messages';
import { withErrorHandler } from '@/lib/middleware/api-error-handler';

export const POST = withErrorHandler(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { patientId } = body;

    if (!patientId) {
      return NextResponse.json(
        { success: false, error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        doctor: {
          select: {
            doctorUID: true,
            formData: true,
          }
        }
      }
    });

    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }

    const patientFormData = patient.formData as any;
    const patientEmail = patient.email;
    const patientName = patientFormData?.personalInfo 
      ? `${patientFormData.personalInfo.firstName || ''} ${patientFormData.personalInfo.lastName || ''}`.trim()
      : patientEmail;

    // Deactivate patient by setting a pending token (moves back to pending state)
    const pendingToken = `deactivated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const updatedFormData = {
      ...patientFormData,
      registrationInfo: {
        ...(patientFormData?.registrationInfo || {}),
        deactivated: true,
        deactivatedAt: new Date().toISOString(),
        previousStatus: 'APPROVED',
      }
    };

    await prisma.patient.update({
      where: { id: patientId },
      data: {
        inviteToken: pendingToken, // Set token to mark as pending
        formData: updatedFormData,
        updatedAt: new Date(),
      }
    });

    logger.info('Patient deactivated', { patientId, patientEmail, doctorUID: patient.doctorUID });

    // Send deactivation email using admin SMTP configuration (non-blocking)
    const sendEmailPromise = (async () => {
      try {
        const { getSmtpConfig } = await import('@/lib/db');
        const smtpConfig = await getSmtpConfig(patient.doctorUID || '');
        
        if (!smtpConfig || !smtpConfig.isConfigured) {
          logger.warn('SMTP not configured, skipping deactivation email', { patientEmail });
          return;
        }

        const nodemailer = (await import('nodemailer')).default;
        const transporter = nodemailer.createTransport({
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: smtpConfig.port === 465,
          auth: {
            user: smtpConfig.fromEmail,
            pass: smtpConfig.appPassword,
          },
        });

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        await transporter.sendMail({
          from: `${smtpConfig.fromName} <${smtpConfig.fromEmail}>`,
          to: patientEmail,
          subject: 'Account Deactivated - Siddha Savor',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f59e0b;">Account Deactivated</h2>
              <p>Dear ${patientName || 'Patient'},</p>
              <p>Your patient account has been deactivated by your doctor.</p>
              <p>Your account is now in pending status and requires re-approval to regain access.</p>
              <p>Please contact your doctor if you have any questions or need assistance.</p>
              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                If you believe this was done in error, please contact your doctor or our support team.
              </p>
            </div>
          `,
          text: `Your patient account has been deactivated. Please contact your doctor for more information.`
        });

        logger.info('Deactivation email sent successfully', { patientEmail });
      } catch (emailError) {
        logger.error('Error sending deactivation email', emailError, { patientEmail });
      }
    })();

    sendEmailPromise.catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Patient deactivated successfully',
    });
  } catch (error) {
    logger.error('Error deactivating patient', error, { 
      url: request.url,
      method: request.method 
    });
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    );
  }
});


