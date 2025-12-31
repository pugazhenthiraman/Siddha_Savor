import { NextRequest, NextResponse } from 'next/server';
import { query, getSmtpConfig } from '@/lib/db';
import { logger } from '@/lib/utils/logger';
import { ERROR_MESSAGES } from '@/lib/constants/messages';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const doctorId = parseInt(id);
    
    if (isNaN(doctorId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid doctor ID' },
        { status: 400 }
      );
    }

    logger.info('Deactivating doctor', { doctorId });

    // Get doctor details first
    const doctorResult = await query(
      'SELECT * FROM "Doctor" WHERE id = $1',
      [doctorId]
    );

    if (doctorResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Doctor not found' },
        { status: 404 }
      );
    }

    const doctor = doctorResult.rows[0];
    const formData = doctor.formData;
    const personalInfo = formData?.personalInfo || {};

    // Deactivate doctor by setting status to PENDING
    const updatedFormData = {
      ...formData,
      registrationInfo: {
        ...(formData?.registrationInfo || {}),
        deactivated: true,
        deactivatedAt: new Date().toISOString(),
        previousStatus: doctor.status,
      }
    };

    await query(
      'UPDATE "Doctor" SET status = $1, "formData" = $2, "updatedAt" = NOW() WHERE id = $3 RETURNING *',
      ['PENDING', JSON.stringify(updatedFormData), doctorId]
    );

    logger.info('Doctor deactivated successfully', { doctorId, email: doctor.email });

    // Send deactivation email using admin SMTP configuration (non-blocking)
    const sendEmailPromise = (async () => {
      try {
        const smtpConfig = await getSmtpConfig();
        
        if (!smtpConfig || !smtpConfig.isConfigured) {
          logger.warn('SMTP not configured, skipping deactivation email', { email: doctor.email });
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
          to: doctor.email,
          subject: 'Account Deactivated - Siddha Savor',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f59e0b;">Account Deactivated</h2>
              <p>Dear Dr. ${personalInfo.firstName} ${personalInfo.lastName},</p>
              <p>Your doctor account has been deactivated by the administrator.</p>
              <p>Your account is now in pending status and requires re-approval to regain access.</p>
              <p>Please contact the administrator if you have any questions or need assistance.</p>
              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                If you believe this was done in error, please contact our support team.
              </p>
            </div>
          `,
          text: `Your doctor account has been deactivated. Please contact the administrator for more information.`
        });

        logger.info('Deactivation email sent successfully', { email: doctor.email });
      } catch (emailError) {
        logger.error('Error sending deactivation email', emailError, { email: doctor.email });
      }
    })();

    sendEmailPromise.catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Doctor deactivated successfully',
    });
  } catch (error) {
    logger.error('Error deactivating doctor', error, { 
      url: request.url,
      method: request.method 
    });
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    );
  }
}


