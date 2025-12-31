import { NextRequest, NextResponse } from 'next/server';
import { getSmtpConfig, retryQuery } from '@/lib/db';
import nodemailer from 'nodemailer';
import { ERROR_MESSAGES } from '@/lib/constants/messages';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    logger.info('SMTP send email API called');
    
    // Get SMTP config from database (with retry)
    const config = await retryQuery(async () => {
      return await getSmtpConfig();
    });
    
    if (!config || !config.isActive) {
      logger.warn('SMTP configuration not found or not active');
      return NextResponse.json({
        success: false,
        error: 'SMTP not configured or not active. Please configure email settings in admin panel first.'
      }, { status: 400 });
    }
    
    const body = await request.json();
    const { to, subject, template, data, html, text } = body;

    logger.info('Email send request', { to, subject, template, hasCustomHtml: !!html });

    // Create transporter with config
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: false, // Always false for port 587
      auth: {
        user: config.username,
        pass: config.password,
      },
    });

    // If custom HTML is provided, use it directly
    let emailHtml = html;
    let emailText = text;
    
    // Otherwise, generate email HTML based on template
    if (!emailHtml && template === 'password-reset') {
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981; margin: 0;">Siddha Savor Healthcare</h1>
            <p style="color: #666; margin: 5px 0 0 0;">Healthcare Management Platform</p>
          </div>
          
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello,</p>
          
          <p>You requested to reset your password. Use the verification code below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background: #f8f9fa; border: 2px solid #10b981; padding: 20px; border-radius: 8px; display: inline-block;">
              <h1 style="margin: 0; color: #10b981; font-size: 32px; letter-spacing: 4px;">${data.code}</h1>
            </div>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>⏰ Important:</strong> This code expires in 15 minutes for security reasons.
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #666; font-size: 12px; text-align: center;">
            If you didn't request this password reset, please ignore this email.<br>
            This email was sent from Siddha Savor Healthcare Management System.
          </p>
        </div>
      `;
    } else if (!emailHtml) {
      // Default invite template
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981; margin: 0;">Siddha Savor Healthcare</h1>
            <p style="color: #666; margin: 5px 0 0 0;">Healthcare Management Platform</p>
          </div>
          
          <h2 style="color: #333;">You're Invited to Join!</h2>
          ${data.recipientName ? `<p>Hello ${data.recipientName},</p>` : '<p>Hello,</p>'}
          
          <p>You have been invited to join our healthcare management platform. Click the button below to complete your registration:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.inviteLink}" style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Complete Registration
            </a>
          </div>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              <strong>⏰ Important:</strong> This invitation link expires on<br>
              <strong>${new Date(data.expiresAt).toLocaleString()}</strong>
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #666; font-size: 12px; text-align: center;">
            If you didn't expect this invitation, please ignore this email.<br>
            This email was sent from Siddha Savor Healthcare Management System.
          </p>
        </div>
      `;
    }

    // Send email
    const emailResult = await transporter.sendMail({
      from: `${config.fromName} <${config.fromEmail}>`,
      to: to,
      subject: subject,
      html: emailHtml,
      text: emailText || undefined
    });

    logger.info('Email sent successfully', { to, messageId: emailResult.messageId });

    return NextResponse.json({
      success: true,
      data: {
        messageId: emailResult.messageId,
        accepted: emailResult.accepted,
        rejected: emailResult.rejected,
        pending: emailResult.pending || []
      },
      message: `Email sent successfully to ${to}`
    });

  } catch (error) {
    logger.error('SMTP send email API error', error);

    return NextResponse.json(
      { 
        success: false,
        error: `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`
      },
      { status: 500 }
    );
  }
}
