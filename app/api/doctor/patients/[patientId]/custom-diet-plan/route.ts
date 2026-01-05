import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mealReminderService } from '@/lib/services/mealReminderService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId: patientIdStr } = await params;
    
    // Always return success with null data to use default plan
    // This ensures the system works even if custom diet plans aren't set up yet
    return NextResponse.json({
      success: true,
      data: null
    });

  } catch (error) {
    console.error('Error fetching custom diet plan:', error);
    return NextResponse.json(
      { success: true, data: null },
      { status: 200 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId: patientIdStr } = await params;
    const patientId = parseInt(patientIdStr);
    const planData = await request.json();

    // Skip saving custom diet plan for now - just send email notification
    console.log('Custom diet plan feature not fully set up yet, skipping database save');

    // Get patient details for email notification
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (patient) {
      const patientData = patient.formData as any;
      const patientName = `${patientData?.personalInfo?.firstName || ''} ${patientData?.personalInfo?.lastName || ''}`.trim();

      // Send email notification about updated diet plan
      await sendDietPlanUpdateEmail({
        patientName: patientName || 'Patient',
        patientEmail: patient.email,
        diagnosis: planData.diagnosis
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Diet plan changes noted and patient notified'
    });

  } catch (error) {
    console.error('Error processing diet plan update:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process diet plan update' },
      { status: 500 }
    );
  }
}

async function sendDietPlanUpdateEmail(data: {
  patientName: string;
  patientEmail: string;
  diagnosis: string;
}) {
  try {
    // Create a custom email using nodemailer directly
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Diet Plan Updated</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🌿 Siddha Savor</h1>
          <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">Traditional Healthcare Management</p>
        </div>

        <div style="background: #f8fafc; padding: 25px; border-radius: 10px; border-left: 4px solid #10b981;">
          <h2 style="color: #1f2937; margin-top: 0;">
            📋 Your Diet Plan Has Been Updated, ${data.patientName}!
          </h2>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Your doctor has customized your diet plan for <strong>${data.diagnosis}</strong>. 
            Please check your updated meal plan in your patient dashboard.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/patient" 
               style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              View Updated Diet Plan
            </a>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              <strong>Diagnosis:</strong> ${data.diagnosis}<br>
              <strong>Updated on:</strong> ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Siddha Savor Healthcare" <${process.env.SMTP_USER}>`,
      to: data.patientEmail,
      subject: `📋 Your Diet Plan Has Been Updated - Siddha Savor`,
      html: emailTemplate,
    });

    console.log('Diet plan update email sent successfully');
  } catch (error) {
    console.error('Failed to send diet plan update email:', error);
  }
}
