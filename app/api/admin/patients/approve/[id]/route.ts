import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants/messages';
import { getSmtpConfig } from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const patientId = parseInt(id);
    
    if (isNaN(patientId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid patient ID' },
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

    // Generate patient UID
    const patientUID = `PAT${String(patientId).padStart(5, '0')}`;

    // Approve patient by clearing inviteToken and setting patientUID
    const updatedFormData = {
      ...patientFormData,
      registrationInfo: {
        ...(patientFormData?.registrationInfo || {}),
        rejected: false,
        deactivated: false,
        approved: true,
        approvedAt: new Date().toISOString(),
        approvedBy: 'ADMIN',
      }
    };

    await prisma.patient.update({
      where: { id: patientId },
      data: {
        patientUID: patientUID,
        inviteToken: null, // Clear token to mark as approved
        formData: updatedFormData,
        updatedAt: new Date(),
      }
    });

    logger.info('Patient approved by admin', { patientId, patientUID, patientEmail, doctorUID: patient.doctorUID });

    // Send approval email (non-blocking)
    const sendEmailPromise = (async () => {
      try {
        const smtpConfig = await getSmtpConfig(patient.doctorUID || '');
        
        if (!smtpConfig || !smtpConfig.isConfigured) {
          logger.warn('SMTP not configured, skipping approval email', { patientEmail });
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
          subject: 'Patient Registration Approved - Siddha Savor',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #16a34a;">Registration Approved</h2>
              <p>Dear ${patientName || 'Patient'},</p>
              <p>Your patient registration has been approved by the administrator.</p>
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
          text: `Your patient registration has been approved. You can now log in at ${loginUrl}.`
        });

        logger.info('Approval email sent successfully', { patientEmail });
      } catch (emailError) {
        logger.error('Error sending approval email', emailError, { patientEmail });
      }
    })();

    sendEmailPromise.catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Patient approved successfully',
    });
  } catch (error) {
    logger.error('Error approving patient', error, { 
      url: request.url,
      method: request.method 
    });
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    );
  }
}


