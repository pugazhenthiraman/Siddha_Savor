interface TemplateData {
  inviteLink: string;
  expiresAt: string;
  recipientName?: string;
  expiryHours: number;
}

export class EmailTemplateService {
  /**
   * Generate doctor invite email template
   */
  static generateDoctorInvite(data: TemplateData): { subject: string; html: string; text: string } {
    const { inviteLink, recipientName = 'Doctor', expiryHours } = data;
    const expiryTime = new Date(data.expiresAt).toLocaleString();

    const subject = 'Invitation to Join Siddha Savor Healthcare Platform';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Healthcare Platform Invitation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
          .button { display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .button:hover { background: #059669; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; border-radius: 0 0 10px 10px; }
          .expiry { color: #dc2626; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🏥 Siddha Savor</div>
            <h1>Welcome to Our Healthcare Platform</h1>
          </div>
          
          <div class="content">
            <h2>Dear ${recipientName},</h2>
            
            <p>You have been invited to join <strong>Siddha Savor</strong>, our comprehensive healthcare management platform. As a medical professional, you'll have access to:</p>
            
            <ul>
              <li>📋 Patient management system</li>
              <li>📅 Appointment scheduling</li>
              <li>💊 Digital prescription tools</li>
              <li>📊 Healthcare analytics</li>
              <li>🔒 Secure patient records</li>
            </ul>
            
            <div class="warning">
              <strong>⏰ Time-Sensitive Invitation</strong><br>
              This invitation link will expire in <span class="expiry">${expiryHours} hours</span> on <strong>${expiryTime}</strong>
            </div>
            
            <div style="text-align: center;">
              <a href="${inviteLink}" class="button">Complete Registration</a>
            </div>
            
            <p><strong>Important Security Notes:</strong></p>
            <ul>
              <li>This link is for your use only</li>
              <li>The link can only be used once</li>
              <li>If the link expires, contact our support team for a new invitation</li>
            </ul>
            
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br>
            <strong>Siddha Savor Admin Team</strong></p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>If you did not expect this invitation, please ignore this email.</p>
            <p>© 2024 Siddha Savor Healthcare Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Dear ${recipientName},

You have been invited to join Siddha Savor Healthcare Platform.

Registration Link: ${inviteLink}

IMPORTANT: This link expires in ${expiryHours} hours on ${expiryTime}

As a medical professional, you'll have access to:
- Patient management system
- Appointment scheduling  
- Digital prescription tools
- Healthcare analytics
- Secure patient records

Security Notes:
- This link is for your use only
- The link can only be used once
- If expired, contact support for a new invitation

Best regards,
Siddha Savor Admin Team

This is an automated message. Please do not reply.
    `;

    return { subject, html, text };
  }

  /**
   * Generate patient invite email template
   */
  static generatePatientInvite(data: TemplateData): { subject: string; html: string; text: string } {
    const { inviteLink, recipientName = 'Patient', expiryHours } = data;
    const expiryTime = new Date(data.expiresAt).toLocaleString();

    const subject = 'Welcome to Siddha Savor - Complete Your Registration';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Patient Registration Invitation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
          .button { display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; border-radius: 0 0 10px 10px; }
          .expiry { color: #dc2626; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🏥 Siddha Savor</div>
            <h1>Welcome to Better Healthcare</h1>
          </div>
          
          <div class="content">
            <h2>Hello ${recipientName},</h2>
            
            <p>Welcome to <strong>Siddha Savor</strong>! You've been invited to join our patient portal where you can:</p>
            
            <ul>
              <li>📅 Book appointments with doctors</li>
              <li>📋 Access your medical records</li>
              <li>💊 View prescriptions and medications</li>
              <li>💬 Communicate with your healthcare team</li>
              <li>📊 Track your health progress</li>
            </ul>
            
            <div class="warning">
              <strong>⏰ Complete Registration Soon</strong><br>
              This invitation expires in <span class="expiry">${expiryHours} hours</span> on <strong>${expiryTime}</strong>
            </div>
            
            <div style="text-align: center;">
              <a href="${inviteLink}" class="button">Start Registration</a>
            </div>
            
            <p><strong>What happens next?</strong></p>
            <ol>
              <li>Click the registration link above</li>
              <li>Fill out your basic information</li>
              <li>Set up your secure account</li>
              <li>Start managing your healthcare online</li>
            </ol>
            
            <p>If you have any questions or need assistance, our support team is here to help.</p>
            
            <p>Best regards,<br>
            <strong>Siddha Savor Team</strong></p>
          </div>
          
          <div class="footer">
            <p>This invitation was sent by your healthcare provider.</p>
            <p>If you did not expect this invitation, please contact us.</p>
            <p>© 2024 Siddha Savor Healthcare Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Hello ${recipientName},

Welcome to Siddha Savor Healthcare Platform!

Registration Link: ${inviteLink}

IMPORTANT: This link expires in ${expiryHours} hours on ${expiryTime}

You can:
- Book appointments with doctors
- Access your medical records
- View prescriptions and medications  
- Communicate with your healthcare team
- Track your health progress

What's next?
1. Click the registration link
2. Fill out your information
3. Set up your account
4. Start managing your healthcare

Best regards,
Siddha Savor Team

If you need help, contact our support team.
    `;

    return { subject, html, text };
  }
}
