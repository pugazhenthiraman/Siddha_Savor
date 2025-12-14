import { NextRequest, NextResponse } from 'next/server';
import { getSmtpConfig } from '@/lib/db';
import nodemailer from 'nodemailer';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    logger.info('Testing SMTP email sending');
    
    const body = await request.json();
    const { testEmail } = body;

    if (!testEmail) {
      return NextResponse.json({
        success: false,
        error: 'Test email address is required'
      }, { status: 400 });
    }

    // Get SMTP config from database
    const config = await getSmtpConfig();
    
    if (!config || !config.isActive) {
      return NextResponse.json({
        success: false,
        error: 'SMTP not configured or not active. Please configure email settings first.'
      });
    }

    // Create transporter with config
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: false,
      auth: {
        user: config.username,
        pass: config.password,
      },
    });

    // Test connection first
    await transporter.verify();
    logger.info('SMTP connection verified');

    // Send test email
    const emailResult = await transporter.sendMail({
      from: `${config.fromName} <${config.fromEmail}>`,
      to: testEmail,
      subject: 'Test Email from Siddha Savor',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10b981;">✅ Email Configuration Test Successful!</h2>
          <p>This is a test email to verify that your SMTP configuration is working correctly.</p>
          
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0369a1; margin: 0 0 10px 0;">Configuration Details:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li><strong>SMTP Host:</strong> ${config.host}</li>
              <li><strong>Port:</strong> ${config.port}</li>
              <li><strong>From Email:</strong> ${config.fromEmail}</li>
              <li><strong>From Name:</strong> ${config.fromName}</li>
            </ul>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            <strong>Next Steps:</strong><br>
            • Your email configuration is working properly<br>
            • You can now send invite links via email<br>
            • Recipients will receive professional invitation emails
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            This test email was sent from Siddha Savor Healthcare Management System<br>
            Time: ${new Date().toLocaleString()}
          </p>
        </div>
      `
    });

    logger.info('Test email sent successfully', { 
      to: testEmail, 
      messageId: emailResult.messageId 
    });

    return NextResponse.json({
      success: true,
      data: {
        messageId: emailResult.messageId,
        accepted: emailResult.accepted,
        rejected: emailResult.rejected,
        testEmail: testEmail,
        smtpHost: config.host,
        fromEmail: config.fromEmail
      },
      message: `✅ Test email sent successfully to ${testEmail}! Check your inbox.`
    });

  } catch (error) {
    logger.error('Test email sending failed', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      success: false,
      error: `❌ Test email failed: ${errorMessage}. Check your SMTP configuration.`
    });
  }
}
