import { NextRequest, NextResponse } from 'next/server';
import { query, getSmtpConfig } from '@/lib/db';
import nodemailer from 'nodemailer';
import { ERROR_MESSAGES } from '@/lib/constants/messages';
import { logger } from '@/lib/utils/logger';

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

    logger.info('Approving doctor', { doctorId });

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
    const professionalInfo = formData?.professionalInfo || {};

    // Generate doctor UID
    const doctorUID = `DOC${String(doctorId).padStart(5, '0')}`;

    // Update doctor status to APPROVED and set doctorUID
    const result = await query(
      'UPDATE "Doctor" SET status = $1, "doctorUID" = $2, "updatedAt" = NOW() WHERE id = $3 RETURNING *',
      ['APPROVED', doctorUID, doctorId]
    );

    const approvedDoctor = result.rows[0];

    // Send welcome email if SMTP is configured
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

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #10b981; margin: 0;">Welcome to Siddha Savor!</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Healthcare Management Platform</p>
            </div>
            
            <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h2 style="color: #10b981; margin: 0 0 15px 0;">🎉 Application Approved!</h2>
              <p>Dear Dr. ${personalInfo.firstName} ${personalInfo.lastName},</p>
              
              <p>Congratulations! Your application to join Siddha Savor Healthcare Platform has been approved.</p>
              
              <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #374151; margin: 0 0 15px 0;">Your Account Details:</h3>
                <p><strong>Doctor ID:</strong> ${doctorUID}</p>
                <p><strong>Email:</strong> ${doctor.email}</p>
                <p><strong>Specialization:</strong> ${professionalInfo.specialization}</p>
                <p><strong>Status:</strong> <span style="color: #10b981;">APPROVED</span></p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" 
                   style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block;">
                  Access Your Dashboard
                </a>
              </div>
              
              <p>You can now log in and start managing your patients!</p>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: `${smtpConfig.fromName} <${smtpConfig.fromEmail}>`,
          to: doctor.email,
          subject: '🎉 Welcome to Siddha Savor - Application Approved!',
          html: emailHtml
        });

        logger.info('Welcome email sent successfully', { doctorId, doctorUID, email: doctor.email });
      }
    } catch (emailError) {
      logger.error('Failed to send welcome email', emailError, { doctorId });
    }

    logger.info('Doctor approved successfully', { doctorId, doctorUID });

    return NextResponse.json({
      success: true,
      data: approvedDoctor,
      message: 'Doctor approved successfully'
    });

  } catch (error) {
    logger.error('Doctor approval error', error);

    return NextResponse.json({
      success: false,
      error: ERROR_MESSAGES.SERVER_ERROR
    }, { status: 500 });
  }
}
