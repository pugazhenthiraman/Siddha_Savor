import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { ERROR_MESSAGES } from '@/lib/constants/messages';
import { getSmtpConfig } from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const patientId = parseInt(id);
    const body = await request.json();
    const { reason } = body;
    
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

    // Reject patient
    const rejectionToken = `rejected_${patientId}_${Date.now()}`;
    const updatedFormData = {
      ...patientFormData,
      registrationInfo: {
        ...(patientFormData?.registrationInfo || {}),
        rejected: true,
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason,
        rejectedBy: 'ADMIN'
      }
    };

    await prisma.patient.update({
      where: { id: patientId },
      data: {
        inviteToken: rejectionToken,
        formData: updatedFormData,
        updatedAt: new Date(),
      }
    });

    logger.info('Patient rejected by admin', { patientId, patientEmail, doctorUID: patient.doctorUID, reason });

    // Send rejection email (non-blocking)
    const sendEmailPromise = (async () => {
      try {
        const smtpConfig = await getSmtpConfig();
        
        if (!smtpConfig || !smtpConfig.isConfigured) {
          logger.warn('SMTP not configured, skipping rejection email', { patientEmail });
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

        await transporter.sendMail({
          from: `${smtpConfig.fromName} <${smtpConfig.fromEmail}>`,
          to: patientEmail,
          subject: 'Patient Registration Rejected - Siddha Savor',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Registration Rejected</h2>
              <p>Dear ${patientName || 'Patient'},</p>
              <p>We regret to inform you that your patient registration has been rejected by the administrator.</p>
              ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
              <p>Want to try again? You can register again with updated information. Please make the necessary changes and submit a new registration to join us.</p>
              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                If you have questions, please contact our support team.
              </p>
            </div>
          `,
          text: `Your patient registration has been rejected.${reason ? ` Reason: ${reason}` : ''} You can register again with updated information.`
        });

        logger.info('Rejection email sent successfully', { patientEmail });
      } catch (emailError) {
        logger.error('Error sending rejection email', emailError, { patientEmail });
      }
    })();

    sendEmailPromise.catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Patient rejected successfully',
    });
  } catch (error) {
    logger.error('Error rejecting patient', error, { 
      url: request.url,
      method: request.method 
    });
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    );
  }
}


