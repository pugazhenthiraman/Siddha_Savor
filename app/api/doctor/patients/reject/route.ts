import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { ERROR_MESSAGES } from '@/lib/constants/messages';
import { withErrorHandler } from '@/lib/middleware/api-error-handler';

export const POST = withErrorHandler(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { patientId, action, reason } = body;

    if (!patientId || action !== 'REJECT' || !reason) {
      return NextResponse.json(
        { success: false, error: 'Patient ID, action, and reason are required' },
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

    // Mark patient as rejected (soft delete) instead of hard delete
    const updatedFormData = {
      ...(patient.formData as any),
      registrationInfo: {
        ...((patient.formData as any)?.registrationInfo || {}),
        rejected: true,
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason,
        rejectedBy: 'DOCTOR'
      }
    };

    const rejectionToken = `rejected_${patientId}_${Date.now()}`;
    
    const updatedPatient = await prisma.patient.update({
      where: { id: patientId },
      data: {
        status: 'REJECTED',
        inviteToken: rejectionToken,
        formData: updatedFormData,
        updatedAt: new Date(),
      }
    });

    logger.info('Patient rejected successfully', { patientId, patientEmail, doctorUID: patient.doctorUID, reason });

    // Only send email AFTER successful database update
    setImmediate(async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const supportEmail = process.env.ADMIN_EMAIL || 'support@siddhasavor.com';

        const emailResponse = await fetch(`${baseUrl}/api/admin/smtp/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: patientEmail,
            subject: 'Patient Registration Update - Siddha Savor',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc2626;">Registration Status Update</h2>
                <p>Dear ${patientName || 'Patient'},</p>
                <p>We regret to inform you that your patient registration has not been approved at this time.</p>
                <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>Reason:</strong></p>
                  <p style="margin: 5px 0 0 0;">${reason}</p>
                </div>
                <p>If you believe this is an error or would like to discuss your registration, please contact your doctor or our support team.</p>
                
                <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0; color: #1e40af;"><strong>Want to try again?</strong></p>
                  <p style="margin: 10px 0; color: #374151;">You can register again with updated information. Please make the necessary changes and submit a new registration to join us.</p>
                  <p style="margin: 15px 0 0 0; text-align: center;">
                    <a href="${baseUrl}/register?role=patient&email=${encodeURIComponent(patientEmail)}" 
                       style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                      Update & Re-register
                    </a>
                  </p>
                </div>
                
                <p style="margin-top: 30px; color: #666; font-size: 14px;">
                  For support, please email: <a href="mailto:${supportEmail}">${supportEmail}</a>
                </p>
              </div>
            `,
            text: `Your patient registration has not been approved. Reason: ${reason}. For support, contact ${supportEmail}.`
          })
        });

        if (emailResponse.ok) {
          logger.info('Rejection email sent successfully', { patientEmail });
        } else {
          logger.warn('Failed to send rejection email', { patientEmail, status: emailResponse.status });
        }
      } catch (emailError) {
        logger.error('Error sending rejection email', emailError, { patientEmail });
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Patient rejected successfully',
    });
  } catch (error) {
    logger.error('Error rejecting patient', error, { 
      url: request.url,
      method: request.method 
    });
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    );
  }
});
