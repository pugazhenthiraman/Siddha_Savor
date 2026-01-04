import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants/messages';
import { withErrorHandler } from '@/lib/middleware/api-error-handler';
import { retryQuery } from '@/lib/db';

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

    // Use retry logic for database queries
    const patient = await retryQuery(async () => {
      return await prisma.patient.findUnique({
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

    // Reapprove patient by clearing rejection/deactivation flags and setting inviteToken to null
    const updatedFormData = {
      ...patientFormData,
      registrationInfo: {
        ...(patientFormData?.registrationInfo || {}),
        rejected: false,
        deactivated: false,
        reapproved: true,
        reapprovedAt: new Date().toISOString(),
        previousStatus: patientFormData?.registrationInfo?.rejected ? 'REJECTED' : 
                       (patientFormData?.registrationInfo?.deactivated ? 'DEACTIVATED' : null),
      }
    };

    // Use retry logic for database update
    await retryQuery(async () => {
      return await prisma.patient.update({
        where: { id: patientId },
        data: {
          inviteToken: null, // Clear token to mark as approved
          formData: updatedFormData,
          updatedAt: new Date(),
        }
      });
    });

    logger.info('Patient reapproved', { patientId, patientEmail, doctorUID: patient.doctorUID });

    // Send reapproval email using admin SMTP configuration (non-blocking)
    // Use Promise.race to prevent timeout - send email in background
    const sendEmailPromise = (async () => {
      try {
        const { getSmtpConfig } = await import('@/lib/db');
        const smtpConfig = await getSmtpConfig();
        
        if (!smtpConfig || !smtpConfig.isConfigured) {
          logger.warn('SMTP not configured, skipping reapproval email', { patientEmail });
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
        const loginUrl = `${baseUrl}/login`;

        await transporter.sendMail({
          from: `${smtpConfig.fromName} <${smtpConfig.fromEmail}>`,
          to: patientEmail,
          subject: 'Patient Registration Reapproved - Siddha Savor',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #16a34a;">Registration Reapproved</h2>
              <p>Dear ${patientName || 'Patient'},</p>
              <p>Your patient registration has been reapproved by your doctor.</p>
              <p>You can now log in to your patient portal using your registered email and password.</p>
              <p style="margin-top: 30px;">
                <a href="${loginUrl}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Login to Patient Portal
                </a>
              </p>
              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                If you have any questions, please contact your doctor or our support team.
              </p>
            </div>
          `,
          text: `Your patient registration has been reapproved. You can now log in at ${loginUrl}.`
        });

        logger.info('Reapproval email sent successfully', { patientEmail });
      } catch (emailError) {
        // Log error but don't fail the reapproval
        logger.error('Error sending reapproval email', emailError, { patientEmail });
      }
    })();

    // Don't wait for email - return response immediately
    // Email will be sent in background
    sendEmailPromise.catch(() => {}); // Suppress unhandled promise rejection

    return NextResponse.json({
      success: true,
      message: 'Patient reapproved successfully',
      data: {
        id: patientId,
        email: patientEmail,
      }
    });
  } catch (error) {
    logger.error('Error reapproving patient', error, { 
      url: request.url,
      method: request.method 
    });
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    );
  }
});

