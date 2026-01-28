import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { query, getSmtpConfig } from '@/lib/db';
import nodemailer from 'nodemailer';
import { ERROR_MESSAGES } from '@/lib/constants/messages';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const doctorId = parseInt(id);
    const body = await request.json();
    const { newStatus, reason } = body;

    if (isNaN(doctorId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid doctor ID' },
        { status: 400 }
      );
    }

    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(newStatus)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    logger.info('Reverting doctor status', { doctorId, newStatus, reason });

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

    // Update doctor status
    let updateQuery = '';
    let updateParams = [];

    if (newStatus === 'APPROVED') {
      const doctorUID = doctor.doctorUID || `DOC${String(doctorId).padStart(5, '0')}`;
      updateQuery = 'UPDATE "Doctor" SET status = $1, "doctorUID" = $2, "updatedAt" = NOW() WHERE id = $3 RETURNING *';
      updateParams = [newStatus, doctorUID, doctorId];
    } else {
      updateQuery = 'UPDATE "Doctor" SET status = $1, "doctorUID" = NULL, "updatedAt" = NOW() WHERE id = $2 RETURNING *';
      updateParams = [newStatus, doctorId];
    }

    const result = await query(updateQuery, updateParams);
    const updatedDoctor = result.rows[0];

    // Send notification email if SMTP is configured
    try {
      const smtpConfig = await getSmtpConfig();

      if (smtpConfig && smtpConfig.isActive) {
        const transporter = nodemailer.createTransport({
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: false,
          auth: {
            user: smtpConfig.username,
            pass: smtpConfig.password,
          },
        });

        let emailHtml = '';
        let subject = '';

        if (newStatus === 'APPROVED') {
          subject = '🎉 Application Approved - Siddha Savor';
          emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #10b981; margin: 0;">Welcome to Siddha Savor!</h1>
                <p style="color: #666; margin: 5px 0 0 0;">Healthcare Management Platform</p>
              </div>
              
              <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h2 style="color: #10b981; margin: 0 0 15px 0;">🎉 Status Updated - Approved!</h2>
                <p>Dear Dr. ${personalInfo.firstName} ${personalInfo.lastName},</p>
                
                <p>Your application status has been updated to <strong>APPROVED</strong>.</p>
                
                <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <h3 style="color: #374151; margin: 0 0 15px 0;">Your Account Details:</h3>
                  <p><strong>Doctor ID:</strong> ${updatedDoctor.doctorUID}</p>
                  <p><strong>Email:</strong> ${doctor.email}</p>
                  <p><strong>Status:</strong> <span style="color: #10b981;">APPROVED</span></p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" 
                     style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block;">
                    Access Your Dashboard
                  </a>
                </div>
              </div>
            </div>
          `;
        } else if (newStatus === 'REJECTED') {
          subject = 'Application Status Update - Siddha Savor';
          emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #dc2626; margin: 0;">Application Status Update</h1>
                <p style="color: #666; margin: 5px 0 0 0;">Siddha Savor Healthcare Platform</p>
              </div>
              
              <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h2 style="color: #dc2626; margin: 0 0 15px 0;">Status Updated - Not Approved</h2>
                <p>Dear Dr. ${personalInfo.firstName} ${personalInfo.lastName},</p>
                
                <p>Your application status has been updated to <strong>REJECTED</strong>.</p>
                
                ${reason ? `
                  <div style="background: white; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
                    <h4 style="margin: 0 0 10px 0; color: #dc2626;">Reason:</h4>
                    <p style="margin: 0; color: #374151;">${reason}</p>
                  </div>
                ` : ''}
                
                <p>If you have questions, please contact our support team.</p>
              </div>
            </div>
          `;
        } else if (newStatus === 'PENDING') {
          subject = 'Application Status Update - Under Review';
          emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #f59e0b; margin: 0;">Application Under Review</h1>
                <p style="color: #666; margin: 5px 0 0 0;">Siddha Savor Healthcare Platform</p>
              </div>
              
              <div style="background: #fffbeb; border: 1px solid #fed7aa; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h2 style="color: #f59e0b; margin: 0 0 15px 0;">⏳ Status Updated - Under Review</h2>
                <p>Dear Dr. ${personalInfo.firstName} ${personalInfo.lastName},</p>
                
                <p>Your application status has been updated to <strong>PENDING</strong> and is currently under review.</p>
                
                <p>Our team will review your application and notify you once a decision is made.</p>
                
                <p>Thank you for your patience.</p>
              </div>
            </div>
          `;
        }

        await transporter.sendMail({
          from: `${smtpConfig.fromName} <${smtpConfig.fromEmail}>`,
          to: doctor.email,
          subject: subject,
          html: emailHtml
        });

        logger.info('Status revert email sent successfully', { doctorId, newStatus, email: doctor.email });
      }
    } catch (emailError) {
      logger.error('Failed to send status revert email', emailError, { doctorId, newStatus });
    }

    logger.info('Doctor status reverted successfully', { doctorId, newStatus });

    return NextResponse.json({
      success: true,
      data: updatedDoctor,
      message: `Doctor status changed to ${newStatus} successfully`
    });

  } catch (error) {
    logger.error('Doctor status revert error', error);

    return NextResponse.json({
      success: false,
      error: ERROR_MESSAGES.SERVER_ERROR
    }, { status: 500 });
  }
}
