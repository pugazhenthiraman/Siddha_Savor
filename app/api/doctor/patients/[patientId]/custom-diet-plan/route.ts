import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { getSmtpConfig } from '@/lib/db';
import nodemailer from 'nodemailer';
import { logger } from '@/lib/utils/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId: patientIdStr } = await params;
    const patientId = parseInt(patientIdStr);

    // Try to get custom diet plan from database
    const customPlan = await prisma.customDietPlan.findUnique({
      where: { patientId },
      select: {
        planData: true,
        updatedAt: true,
        createdAt: true
      }
    });

    if (customPlan) {
      return NextResponse.json({
        success: true,
        data: {
          ...(customPlan.planData as object),
          updatedAt: customPlan.updatedAt.toISOString(),
          createdAt: customPlan.createdAt.toISOString()
        }
      });
    }

    // Return null if no custom plan exists (will use default plan)
    return NextResponse.json({
      success: true,
      data: null
    });

  } catch (error) {
    logger.error('Error fetching custom diet plan:', error);
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

    // Get patient details for email notification
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { email: true, formData: true }
    });

    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Save or update custom diet plan in database
    const customDietPlan = await prisma.customDietPlan.upsert({
      where: { patientId },
      update: {
        planData: planData,
        updatedAt: new Date()
      },
      create: {
        patientId: patientId,
        planData: planData,
        startDate: new Date()
      }
    });

    logger.info('Custom diet plan saved successfully', { patientId });

    // Get patient name for email
    const patientData = patient.formData as any;
    const patientName = `${patientData?.personalInfo?.firstName || ''} ${patientData?.personalInfo?.lastName || ''}`.trim();

    // Send email notification about updated diet plan in background
    sendDietPlanUpdateEmail({
      patientName: patientName || 'Patient',
      patientEmail: patient.email,
      diagnosis: planData.diagnosis || 'your condition'
    }).catch(error => {
      logger.error('Failed to send diet plan update email:', error);
    });

    return NextResponse.json({
      success: true,
      message: 'Diet plan saved successfully and patient notified',
      data: customDietPlan
    });

  } catch (error) {
    logger.error('Error processing diet plan update:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process diet plan update' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId: patientIdStr } = await params;
    const patientId = parseInt(patientIdStr);

    await prisma.customDietPlan.delete({
      where: { patientId }
    });

    logger.info('Custom diet plan deleted successfully', { patientId });

    return NextResponse.json({
      success: true,
      message: 'Custom diet plan reset to default'
    });

  } catch (error) {
    logger.error('Error deleting custom diet plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset diet plan' },
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
    // Get SMTP config from admin settings
    const smtpConfig = await getSmtpConfig();

    if (!smtpConfig || !smtpConfig.isActive) {
      logger.warn('SMTP not configured or inactive, skipping diet plan update email');
      return;
    }

    const { host, port, username, password, fromEmail, fromName } = smtpConfig;

    if (!host || !port || !username || !password || !fromEmail || !fromName) {
      logger.warn('SMTP configuration is incomplete, skipping diet plan update email');
      return;
    }

    // Create transporter with admin SMTP config
    const transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: false,
      auth: {
        user: username,
        pass: password,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const dashboardUrl = `${baseUrl}/dashboard/patient`;

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
            <a href="${dashboardUrl}" 
               style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              View Updated Diet Plan
            </a>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              <strong>Diagnosis:</strong> ${data.diagnosis}<br>
              <strong>Updated on:</strong> ${new Date().toLocaleDateString('en-US', {
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

    await transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to: data.patientEmail,
      subject: `📋 Your Diet Plan Has Been Updated - Siddha Savor`,
      html: emailTemplate,
    });

    logger.info('Diet plan update email sent successfully', { patientEmail: data.patientEmail });
  } catch (error) {
    logger.error('Failed to send diet plan update email:', error);
    throw error;
  }
}
