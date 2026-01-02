import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants/messages';
import { withErrorHandler } from '@/lib/middleware/api-error-handler';

export const POST = withErrorHandler(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { patientId, action } = body;

    if (!patientId || action !== 'APPROVE') {
      return NextResponse.json(
        { success: false, error: 'Invalid request parameters' },
        { status: 400 }
      );
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        doctor: {
          select: {
            doctorUID: true,
            formData: true,
          }
        }
      }
    });

    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }

    const patientFormData = patient.formData as any;
    const patientEmail = patient.email;
    const patientName = patientFormData?.personalInfo 
      ? `${patientFormData.personalInfo.firstName || ''} ${patientFormData.personalInfo.lastName || ''}`.trim()
      : patientEmail;

    // Generate patient UID
    const patientUID = `PAT${String(patientId).padStart(5, '0')}`;

    // Approve patient by clearing invite token and setting patientUID
    const updatedPatient = await prisma.patient.update({
      where: { id: patientId },
      data: {
        status: 'APPROVED',
        patientUID: patientUID,
        inviteToken: null,
        updatedAt: new Date(),
      }
    });

    logger.info('Patient approved successfully', { patientId, patientUID, patientEmail, doctorUID: patient.doctorUID });

    // Only send email AFTER successful database update
    setImmediate(async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const loginUrl = `${baseUrl}/login`;

        const emailResponse = await fetch(`${baseUrl}/api/admin/smtp/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: patientEmail,
            subject: 'Patient Registration Approved - Siddha Savor',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #16a34a;">Registration Approved</h2>
                <p>Dear ${patientName || 'Patient'},</p>
                <p>Your patient registration has been approved by your doctor.</p>
                <p>You can now log in to your patient portal using your registered email and password.</p>
                <p style="margin-top: 30px;">
                  <a href="${loginUrl}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Login to Patient Portal
                  </a>
                </p>
                <p style="margin-top: 30px; color: #666; font-size: 14px;">
                  If you have any questions, please contact your doctor or our support team.
                </p>
              </div>
            `,
            text: `Your patient registration has been approved. You can now log in at ${loginUrl}.`
          })
        });

        if (emailResponse.ok) {
          logger.info('Approval email sent successfully', { patientEmail });
        } else {
          logger.warn('Failed to send approval email', { patientEmail, status: emailResponse.status });
        }
      } catch (emailError) {
        logger.error('Error sending approval email', emailError, { patientEmail });
      }
    });

    return NextResponse.json({
      success: true,
      message: SUCCESS_MESSAGES.PROFILE_UPDATED,
    });
  } catch (error) {
    logger.error('Error approving patient', error, { 
      url: request.url,
      method: request.method 
    });
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    );
  }
});
