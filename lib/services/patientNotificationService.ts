import nodemailer from 'nodemailer';

interface PatientUpdateEmailData {
  patientName: string;
  patientEmail: string;
  doctorName: string;
  diagnosis?: string;
  updateType: 'vitals' | 'diagnosis' | 'both';
  updatedAt: string;
}

export class PatientNotificationService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendPatientUpdateNotification(data: PatientUpdateEmailData): Promise<boolean> {
    try {
      const emailTemplate = this.generateUpdateEmailTemplate(data);
      
      await this.transporter.sendMail({
        from: `"Siddha Savor Healthcare" <${process.env.SMTP_USER}>`,
        to: data.patientEmail,
        subject: 'Health Record Updated - Siddha Savor',
        html: emailTemplate,
      });

      return true;
    } catch (error) {
      console.error('Failed to send patient notification:', error);
      return false;
    }
  }

  private generateUpdateEmailTemplate(data: PatientUpdateEmailData): string {
    const updateMessage = data.updateType === 'vitals' 
      ? 'Your health vitals have been updated'
      : data.updateType === 'diagnosis'
      ? 'Your diagnosis has been updated'
      : 'Your health records have been updated';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Health Record Update</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🌿 Siddha Savor</h1>
          <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">Traditional Healthcare Management</p>
        </div>

        <div style="background: #f8fafc; padding: 25px; border-radius: 10px; border-left: 4px solid #10b981;">
          <h2 style="color: #1f2937; margin-top: 0;">Hello ${data.patientName},</h2>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            ${updateMessage} by <strong>Dr. ${data.doctorName}</strong>.
          </p>

          ${data.diagnosis ? `
          <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #dc2626; margin: 0 0 10px 0; font-size: 16px;">📋 Current Diagnosis</h3>
            <p style="color: #991b1b; margin: 0; font-weight: 600;">${data.diagnosis}</p>
          </div>
          ` : ''}

          <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #065f46; margin: 0 0 10px 0; font-size: 16px;">🍽️ Your Siddha Diet Plan</h3>
            <p style="color: #047857; margin: 0;">
              A personalized traditional diet plan is now available based on your diagnosis. 
              Login to view your daily meal recommendations.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" 
               style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              View My Dashboard
            </a>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              <strong>Updated on:</strong> ${new Date(data.updatedAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            This is an automated notification from Siddha Savor Healthcare System.<br>
            For any questions, please contact your healthcare provider.
          </p>
        </div>
      </body>
      </html>
    `;
  }
}

export const patientNotificationService = new PatientNotificationService();
