import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { query, retryQuery } from '@/lib/db';
import { logger } from '@/lib/utils/logger';
import { ERROR_MESSAGES } from '@/lib/constants/messages';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, doctorID, ...formData } = body;

    const normalizedEmail = formData.email.toLowerCase();
    logger.info('Patient registration attempt', { email: normalizedEmail, hasToken: !!token, hasDoctorID: !!doctorID });

    let doctorUID: string | null = null;
    let inviteData: any = null;

    // Handle registration with token (invite link)
    if (token) {
      const tokenResult = await retryQuery(async () => {
        return await query(
          'SELECT * FROM "InviteLink" WHERE token = $1 AND "expiresAt" > NOW() AND "isUsed" = false AND role = $2',
          [token, 'PATIENT']
        );
      });

      if (tokenResult.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Invalid or expired registration link'
        }, { status: 400 });
      }

      inviteData = tokenResult.rows[0];
      doctorUID = inviteData.doctorUID || null;
    } 
    // Handle registration without token (manual doctorID entry)
    else if (doctorID) {
      const normalizedDoctorID = doctorID.trim().toUpperCase();
      
      // Verify doctorID exists in database (with retry)
      const doctorResult = await retryQuery(async () => {
        return await query(
          'SELECT "doctorUID", status FROM "Doctor" WHERE "doctorUID" = $1 AND status = $2',
          [normalizedDoctorID, 'APPROVED']
        );
      });

      if (doctorResult.rows.length === 0) {
        logger.warn('Registration attempt with invalid doctorID', { doctorID: normalizedDoctorID });
        return NextResponse.json({
          success: false,
          error: ERROR_MESSAGES.DOCTOR_ID_NOT_FOUND
        }, { status: 400 });
      }

      doctorUID = normalizedDoctorID;
      logger.info('DoctorID verified', { doctorUID });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Either a valid registration token or Doctor ID is required'
      }, { status: 400 });
    }

    // Check if email already exists in ANY table (Admin, Doctor, Patient)
    // Email must be globally unique across all roles
    // BUT: Allow re-registration if user was previously rejected
    // Run all email checks in parallel for better performance
    const [existingAdmin, existingDoctor, existingPatient] = await Promise.all([
      retryQuery(async () => {
        return await query('SELECT id FROM "Admin" WHERE email = $1', [normalizedEmail]);
      }),
      retryQuery(async () => {
        return await query('SELECT id, status FROM "Doctor" WHERE email = $1', [normalizedEmail]);
      }),
      retryQuery(async () => {
        return await query('SELECT id, "inviteToken", "formData" FROM "Patient" WHERE email = $1', [normalizedEmail]);
      })
    ]);

    // Check if patient was previously rejected (can re-register)
    // Rejected patients have rejection info in formData.registrationInfo.rejected = true
    // OR have inviteToken starting with "rejected_"
    const existingPatientData = existingPatient.rows.length > 0 ? existingPatient.rows[0] : null;
    const isRejectedPatient = existingPatientData && (
      existingPatientData.formData?.registrationInfo?.rejected === true ||
      (existingPatientData.inviteToken && existingPatientData.inviteToken.startsWith('rejected_'))
    );

    // Check if doctor was previously rejected (can re-register)
    const isRejectedDoctor = existingDoctor.rows.length > 0 && 
      existingDoctor.rows[0].status === 'REJECTED';

    // CRITICAL VALIDATION RULES:
    // 1. If email exists and is REJECTED → MUST use token (re-registration only via invite link)
    // 2. If email exists and NOT rejected → Block (duplicate)
    // 3. New emails → Can register without token (general form) OR with token

    // Block if email exists in Admin (admin cannot be rejected/re-registered)
    if (existingAdmin.rows.length > 0) {
      logger.warn('Registration attempt with existing admin email', { email: normalizedEmail });
      return NextResponse.json({
        success: false,
        error: 'This email is already registered as an admin. Please use a different email or try logging in.'
      }, { status: 400 });
    }

    // Block if email exists in Doctor table and NOT rejected
    if (existingDoctor.rows.length > 0 && !isRejectedDoctor) {
      logger.warn('Registration attempt with existing doctor email', { email: normalizedEmail });
      return NextResponse.json({
        success: false,
        error: 'This email is already registered as a doctor. Please use a different email or try logging in.'
      }, { status: 400 });
    }

    // CRITICAL: If patient email exists and is REJECTED, MUST use token (invite link)
    if (isRejectedPatient && !token) {
      logger.warn('Rejected patient attempting to register without token', { email: normalizedEmail });
      return NextResponse.json({
        success: false,
        error: 'Your previous registration was rejected. Please use the re-registration link sent to your email to register again. If you don\'t have the link, please contact your doctor or admin for a new invitation.'
      }, { status: 400 });
    }

    // Block if email exists in Patient table and NOT rejected
    if (existingPatient.rows.length > 0 && !isRejectedPatient) {
      logger.warn('Registration attempt with existing non-rejected patient email', { email: normalizedEmail });
      return NextResponse.json({
        success: false,
        error: 'This email is already registered as a patient. Please use a different email or try logging in.'
      }, { status: 400 });
    }

    // CRITICAL: If using token and email exists but is NOT rejected, block (duplicate)
    if (token && existingPatient.rows.length > 0 && !isRejectedPatient) {
      logger.warn('Registration attempt with existing non-rejected patient email via invite link', { 
        email: normalizedEmail,
        hasToken: true 
      });
      return NextResponse.json({
        success: false,
        error: 'This email is already registered as a patient. If you were previously rejected, please use the correct re-registration link. Otherwise, please use a different email or try logging in.'
      }, { status: 400 });
    }

    // If patient was previously rejected, update existing record to PENDING instead of creating new one
    if (isRejectedPatient) {
      logger.info('Re-registration of previously rejected patient', { 
        email: normalizedEmail,
        patientId: existingPatient.rows[0].id 
      });
      
      // Update existing patient record with new registration data
      // Use rounds=10 for faster hashing (still secure, ~100-200ms vs 300-500ms)
      const hashedPassword = await bcrypt.hash(formData.password, 10);
      const patientFormData = {
        personalInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: normalizedEmail,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender
        },
        addressInfo: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        },
        emergencyContact: {
          name: formData.emergencyContact,
          phone: formData.emergencyPhone
        },
        registrationInfo: {
          registeredAt: new Date().toISOString(),
          inviteToken: token || null,
          createdBy: inviteData?.createdBy || doctorUID || 'PATIENT',
          registrationMethod: token ? 'INVITE_LINK' : 'MANUAL_DOCTOR_ID',
          reRegistered: true, // Mark as re-registration
          previousRejectionDate: new Date().toISOString()
        }
      };

      // For re-registration, set inviteToken to mark as pending
      // If token provided, use it; otherwise create a unique pending marker
      const pendingToken = token || `pending_reapproval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const updateResult = await retryQuery(async () => {
        return await query(
          `UPDATE "Patient" 
           SET password = $1, "formData" = $2, "inviteToken" = $3, "doctorUID" = $4, "updatedAt" = NOW() 
           WHERE id = $5 
           RETURNING id, email`,
          [
            hashedPassword,
            JSON.stringify(patientFormData),
            pendingToken, // Set token to mark as pending for approval
            doctorUID,
            existingPatient.rows[0].id
          ]
        );
      });

      const updatedPatient = updateResult.rows[0];

      // Mark invite link as used (if token was provided, with retry)
      if (token && inviteData) {
        await retryQuery(async () => {
          return await query(
            'UPDATE "InviteLink" SET "isUsed" = true, "usedAt" = NOW() WHERE token = $1',
            [token]
          );
        });
      }

      logger.info('Rejected patient re-registered successfully', { 
        patientId: updatedPatient.id,
        email: updatedPatient.email,
        doctorUID: doctorUID,
        registrationMethod: token ? 'INVITE_LINK' : 'MANUAL_DOCTOR_ID'
      });

      return NextResponse.json({
        success: true,
        data: {
          id: updatedPatient.id,
          email: updatedPatient.email
        },
        message: 'Registration successful! Your updated information has been submitted. Your doctor will review your application. You will receive an email once approved.'
      });
    }

    // Hash password (use rounds=10 for faster hashing while maintaining security)
    const hashedPassword = await bcrypt.hash(formData.password, 10);

    // Prepare patient data
    const patientFormData = {
      personalInfo: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: normalizedEmail,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender
      },
      addressInfo: {
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode
      },
      emergencyContact: {
        name: formData.emergencyContact,
        phone: formData.emergencyPhone
      },
      registrationInfo: {
        registeredAt: new Date().toISOString(),
        inviteToken: token || null,
        createdBy: inviteData?.createdBy || doctorUID || 'PATIENT',
        registrationMethod: token ? 'INVITE_LINK' : 'MANUAL_DOCTOR_ID'
      }
    };

    // Insert patient (with retry)
    const patientResult = await retryQuery(async () => {
      return await query(
        `INSERT INTO "Patient" 
         (email, password, "formData", "inviteToken", "doctorUID", "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
         RETURNING id, email`,
        [
          normalizedEmail,
          hashedPassword,
          JSON.stringify(patientFormData),
          token || null,
          doctorUID
        ]
      );
    });

    const newPatient = patientResult.rows[0];

    // Mark invite link as used (if token was provided, with retry)
    if (token && inviteData) {
      await retryQuery(async () => {
        return await query(
          'UPDATE "InviteLink" SET "isUsed" = true, "usedAt" = NOW() WHERE token = $1',
          [token]
        );
      });
    }

    logger.info('Patient registered successfully', { 
      patientId: newPatient.id,
      email: newPatient.email,
      doctorUID: doctorUID,
      registrationMethod: token ? 'INVITE_LINK' : 'MANUAL_DOCTOR_ID'
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newPatient.id,
        email: newPatient.email
      },
      message: 'Registration successful! Your doctor will review your application. You will receive an email once approved.'
    });

  } catch (error) {
    logger.error('Patient registration error', error);
    
    return NextResponse.json({
      success: false,
      error: 'Registration failed. Please try again.'
    }, { status: 500 });
  }
}
