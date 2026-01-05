import nodemailer from 'nodemailer';
import { getSmtpConfig } from '@/lib/db';
import { logger } from '@/lib/utils/logger';
import { getDietPlanByDiagnosis } from '@/lib/dietPlans';

interface MealReminderData {
  patientName: string;
  patientEmail: string;
  diagnosis: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  mealItems: string[];
  siddhaNotes?: string;
}

type ActiveSmtpConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
};

export class MealReminderService {
  private transporter: nodemailer.Transporter | null = null;
  private configSignature: string | null = null;

  /**
   * Load active SMTP config from Admin panel and validate it
   */
  private async getActiveConfig(): Promise<ActiveSmtpConfig> {
    const config = await getSmtpConfig();

    if (!config || !config.isActive) {
      throw new Error('SMTP not configured or inactive');
    }

    const { host, port, username, password, fromEmail, fromName } = config;

    if (!host || !port || !username || !password || !fromEmail || !fromName) {
      throw new Error('SMTP configuration is incomplete');
    }

    return { host, port, username, password, fromEmail, fromName };
  }

  /**
   * Reuse transporter while SMTP config stays the same
   */
  private async getTransporter(): Promise<{ transporter: nodemailer.Transporter; config: ActiveSmtpConfig }> {
    const config = await this.getActiveConfig();
    const signature = [
      config.host,
      config.port,
      config.username,
      config.fromEmail,
      config.fromName
    ].join('|');

    if (!this.transporter || this.configSignature !== signature) {
      this.transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: false,
        auth: {
          user: config.username,
          pass: config.password,
        },
      });
      this.configSignature = signature;
    }

    return { transporter: this.transporter, config };
  }

  async sendMealReminder(data: MealReminderData): Promise<boolean> {
    try {
      const { transporter, config } = await this.getTransporter();
      const emailTemplate = this.generateMealReminderTemplate(data);
      
      await transporter.sendMail({
        from: `${config.fromName} <${config.fromEmail}>`,
        to: data.patientEmail,
        subject: `🍽️ ${this.getMealEmoji(data.mealType)} ${this.capitalize(data.mealType)} Reminder - Siddha Savor`,
        html: emailTemplate,
      });

      logger.info('Meal reminder sent', {
        to: data.patientEmail,
        mealType: data.mealType,
      });

      return true;
    } catch (error) {
      logger.error('Failed to send meal reminder', error);
      return false;
    }
  }

  private getMealEmoji(mealType: string): string {
    const emojis = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙'
    };
    return emojis[mealType as keyof typeof emojis] || '🍽️';
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private generateMealReminderTemplate(data: MealReminderData): string {
    const mealTime = {
      breakfast: '8:00 AM',
      lunch: '12:30 PM',
      dinner: '8:00 PM'
    }[data.mealType];

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Meal Reminder</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🌿 Siddha Savor</h1>
          <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">Traditional Healthcare Management</p>
        </div>

        <div style="background: #f8fafc; padding: 25px; border-radius: 10px; border-left: 4px solid #10b981;">
          <h2 style="color: #1f2937; margin-top: 0;">
            ${this.getMealEmoji(data.mealType)} ${this.capitalize(data.mealType)} Time, ${data.patientName}!
          </h2>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            It's ${mealTime} - time for your ${data.mealType}! Here's your personalized Siddha diet plan for today.
          </p>

          <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #065f46; margin: 0 0 15px 0; font-size: 18px;">
              ${this.getMealEmoji(data.mealType)} Today's ${this.capitalize(data.mealType)}
            </h3>
            <ul style="color: #047857; margin: 0; padding-left: 20px;">
              ${data.mealItems.map(item => `<li style="margin-bottom: 8px;">${item}</li>`).join('')}
            </ul>
          </div>

          ${data.siddhaNotes ? `
          <div style="background: #dbeafe; border: 1px solid #93c5fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px;">📝 Siddha Medicine Notes</h4>
            <p style="color: #1e3a8a; margin: 0; font-size: 14px;">${data.siddhaNotes}</p>
          </div>
          ` : ''}

          <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">⏰ Daily Meal Schedule</h4>
            <div style="color: #78350f; font-size: 14px;">
              <p style="margin: 5px 0;">🌅 Breakfast: 8:00 AM</p>
              <p style="margin: 5px 0;">☀️ Lunch: 12:30 PM</p>
              <p style="margin: 5px 0;">🌙 Dinner: 8:00 PM</p>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/patient" 
               style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              Mark as Eaten
            </a>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              <strong>Diagnosis:</strong> ${data.diagnosis}<br>
              <strong>Reminder sent at:</strong> ${new Date().toLocaleString()}
            </p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            This is an automated meal reminder from Siddha Savor Healthcare System.<br>
            Follow your personalized diet plan for better health outcomes.
          </p>
        </div>
      </body>
      </html>
    `;
  }
}

export const mealReminderService = new MealReminderService();
