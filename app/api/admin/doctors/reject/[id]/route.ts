import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { query, getSmtpConfig } from '@/lib/db';
import nodemailer from 'nodemailer';
import { ERROR_MESSAGES } from '@/lib/constants/messages';
import { logger } from '@/lib/utils/logger';
import crypto from 'crypto';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const doctorId = parseInt(id);
    const body = await request.json();
    // Accept both 'remark' and 'reason' for backward compatibility
    const remark = body.remark || body.reason || '';

    if (isNaN(doctorId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid doctor ID' },
        { status: 400 }
      );
    }

    logger.info('Rejecting doctor', { doctorId, hasRemark: !!remark });

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

    // Update doctor status to REJECTED
    const result = await query(
      'UPDATE "Doctor" SET status = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *',
      ['REJECTED', doctorId]
    );

    const rejectedDoctor = result.rows[0];

    // Create an invite link for re-registration (with recipientEmail to identify the original doctor)
    let inviteToken = null;
    let inviteUrl = null;

    try {
      // Generate unique token for re-registration
      inviteToken = crypto.randomBytes(32).toString('hex');

      // Set expiration to 7 days from now (longer for re-registration)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Create invite link with recipientEmail to identify the original doctor
      const inviteResult = await query(
        `INSERT INTO "InviteLink" 
         (token, role, "createdBy", "recipientEmail", "recipientName", "expiresAt", "createdAt") 
         VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
         RETURNING *`,
        [
          inviteToken,
          'DOCTOR',
          'ADMIN',
          doctor.email, // Store original email to identify the doctor
          `${personalInfo.firstName} ${personalInfo.lastName}`.trim(),
          expiresAt
        ]
      );

      inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/register?token=${inviteToken}`;

      logger.info('Re-registration invite link created', {
        doctorId,
        email: doctor.email,
        token: inviteToken.substring(0, 8) + '...',
        expiresAt
      });
    } catch (inviteError) {
      logger.error('Failed to create invite link for re-registration', inviteError, { doctorId });
      // Continue even if invite link creation fails
    }

    // Send rejection email if SMTP is configured
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
              <h1 style="color: #dc2626; margin: 0;">Application Status Update</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Siddha Savor Healthcare Platform</p>
            </div>
            
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h2 style="color: #dc2626; margin: 0 0 15px 0;">Application Not Approved</h2>
              <p>Dear Dr. ${personalInfo.firstName} ${personalInfo.lastName},</p>
              
              <p>Thank you for your interest in joining Siddha Savor Healthcare Platform. After careful review of your application, we regret to inform you that we cannot approve your registration at this time.</p>
              
              <div style="background: white; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #dc2626;">Reason for Rejection:</h4>
                <p style="margin: 0; color: #374151;">
                  ${remark.trim() || 'No specific reason provided. Please contact our support team for more information.'}
                </p>
              </div>
              
              <p>If you believe this decision was made in error or if you have additional information to provide, please feel free to contact our support team.</p>
              
              <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #1e40af;"><strong>Want to try again?</strong></p>
                <p style="margin: 10px 0; color: #374151;">You can register again with updated information. Please make the necessary changes and submit a new application to join us.</p>
                <p style="margin: 15px 0 0 0; text-align: center;">
                  <a href="${inviteUrl || `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/register?role=doctor&email=${encodeURIComponent(doctor.email)}`}" 
                     style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                    Update & Re-register
                  </a>
                </p>
                ${inviteUrl ? `
                  <p style="margin: 10px 0 0 0; text-align: center; color: #6b7280; font-size: 12px;">
                    This link expires in 7 days
                  </p>
                ` : ''}
              </div>
              
              <p>We appreciate your understanding and wish you the best in your medical practice.</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #666; font-size: 12px; margin: 0;">
                This email was sent from Siddha Savor Healthcare Management System<br>
                If you have questions, please contact our support team.
              </p>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: `${smtpConfig.fromName} <${smtpConfig.fromEmail}>`,
          to: doctor.email,
          subject: 'Application Status - Siddha Savor Healthcare',
          html: emailHtml
        });

        logger.info('Rejection email sent successfully', {
          doctorId,
          email: doctor.email,
          hasInviteLink: !!inviteUrl
        });
      }
    } catch (emailError) {
      logger.error('Failed to send rejection email', emailError, { doctorId });
      // Don't fail the rejection if email fails
    }

    logger.info('Doctor rejected successfully', { doctorId });

    return NextResponse.json({
      success: true,
      data: rejectedDoctor,
      message: 'Doctor application rejected successfully'
    });

  } catch (error) {
    logger.error('Doctor rejection error', error);

    return NextResponse.json({
      success: false,
      error: ERROR_MESSAGES.SERVER_ERROR
    }, { status: 500 });
  }
}
