import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { query, retryQuery } from '@/lib/db';
import { logger } from '@/lib/utils/logger';
import { ERROR_MESSAGES } from '@/lib/constants/messages';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, ...formData } = body;

    // CRITICAL: Doctors MUST register through invite link (token required)
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Registration token is required. Please use the invite link provided by the admin to register.'
      }, { status: 400 });
    }

    const normalizedEmail = formData.email.toLowerCase();
    logger.info('Doctor registration attempt', { email: normalizedEmail, hasToken: !!token });

    // Validate token first (with retry)
    const tokenResult = await retryQuery(async () => {
      return await query(
        'SELECT * FROM "InviteLink" WHERE token = $1 AND "expiresAt" > NOW() AND "isUsed" = false AND role = $2',
        [token, 'DOCTOR']
      );
    });

    if (tokenResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired registration link. Please request a new invite link from the admin.'
      }, { status: 400 });
    }

    const inviteData = tokenResult.rows[0];

    // IMPORTANT: For re-registration, we need to identify the doctor by the invite link's recipientEmail
    // This allows us to find the original doctor even if they change their email in the form
    let originalDoctorEmail: string | null = null;
    let existingRejectedDoctor: any = null;

    // If invite link has recipientEmail, use it to find the original doctor (for re-registration)
    if (inviteData.recipientEmail) {
      const originalEmail = inviteData.recipientEmail.toLowerCase();
      const originalDoctorResult = await retryQuery(async () => {
        return await query('SELECT id, email, status FROM "Doctor" WHERE email = $1', [originalEmail]);
      });
      
      if (originalDoctorResult.rows.length > 0 && originalDoctorResult.rows[0].status === 'REJECTED') {
        originalDoctorEmail = originalEmail;
        existingRejectedDoctor = originalDoctorResult.rows[0];
        logger.info('Found original rejected doctor via invite link', { 
          originalEmail, 
          doctorId: existingRejectedDoctor.id,
          newEmail: normalizedEmail 
        });
      }
    }

    // Check if email already exists in ANY table (Admin, Doctor, Patient)
    // Email must be globally unique across all roles
    // BUT: Allow re-registration if user was previously rejected
    // Use retry logic for all database queries
    const [existingAdmin, existingDoctor, existingPatient] = await Promise.all([
      retryQuery(async () => {
        return await query('SELECT id FROM "Admin" WHERE email = $1', [normalizedEmail]);
      }),
      retryQuery(async () => {
        return await query('SELECT id, status FROM "Doctor" WHERE email = $1', [normalizedEmail]);
      }),
      retryQuery(async () => {
        return await query('SELECT id FROM "Patient" WHERE email = $1', [normalizedEmail]);
      })
    ]);

    // Check if doctor was previously rejected (can re-register ONLY with rejection invite link)
    // Priority: 1) Original doctor from invite link (with recipientEmail matching rejected doctor)
    const isRejectedDoctor = existingRejectedDoctor || 
      (existingDoctor.rows.length > 0 && existingDoctor.rows[0].status === 'REJECTED');

    // CRITICAL: Rejected doctors can ONLY register using the rejection invite link (with recipientEmail)
    // Block rejected doctors from using normal invite links
    if (existingDoctor.rows.length > 0 && existingDoctor.rows[0].status === 'REJECTED' && !existingRejectedDoctor) {
      logger.warn('Rejected doctor attempting to register with normal invite link instead of rejection link', { 
        email: normalizedEmail,
        hasRecipientEmail: !!inviteData.recipientEmail,
        recipientEmail: inviteData.recipientEmail
      });
      return NextResponse.json({
        success: false,
        error: 'Your previous registration was rejected. Please use the re-registration link sent to your email to register again. Normal invite links cannot be used for re-registration.'
      }, { status: 400 });
    }

    // Block if email exists in Admin (admin cannot be rejected/re-registered)
    if (existingAdmin.rows.length > 0) {
      logger.warn('Registration attempt with existing admin email', { email: normalizedEmail });
      return NextResponse.json({
        success: false,
        error: 'This email is already registered as an admin. Please use a different email or try logging in.'
      }, { status: 400 });
    }

    // CRITICAL VALIDATION: When using invite link (token), check email status
    // Rule: If email exists and is NOT rejected, block registration (duplicate)
    // Rule: If email exists and IS rejected, allow re-registration (via rejection invite link only)
    
    // Check if email exists in Doctor table and NOT rejected
    if (existingDoctor.rows.length > 0 && !isRejectedDoctor) {
      const existingStatus = existingDoctor.rows[0].status;
      logger.warn('Registration attempt with existing non-rejected doctor email via invite link', { 
        email: normalizedEmail,
        status: existingStatus 
      });
      
      // Provide specific error message based on status
      let errorMessage = '';
      if (existingStatus === 'PENDING') {
        errorMessage = 'This email is already registered and your application is pending approval. You cannot register again while your application is being reviewed. Please wait for admin approval or contact support if you have questions.';
      } else if (existingStatus === 'APPROVED') {
        errorMessage = 'This email is already registered and approved. Please log in instead of registering again.';
      } else {
        errorMessage = 'This email is already registered as a doctor. If you were previously rejected, please use the re-registration link sent to your email. Otherwise, please use a different email or try logging in.';
      }
      
      return NextResponse.json({
        success: false,
        error: errorMessage
      }, { status: 400 });
    }

    // Check if email exists in Patient table (block duplicate)
    if (existingPatient.rows.length > 0) {
      logger.warn('Registration attempt with existing patient email via doctor invite link', { email: normalizedEmail });
      return NextResponse.json({
        success: false,
        error: 'This email is already registered as a patient. Please use a different email or try logging in.'
      }, { status: 400 });
    }

    // If doctor was previously rejected, update existing record to PENDING instead of creating new one
    if (isRejectedDoctor) {
      // Use the original doctor record (from invite link) or the one found by new email
      const doctorToUpdate = existingRejectedDoctor || existingDoctor.rows[0];
      const doctorId = doctorToUpdate.id;
      
      logger.info('Re-registration of previously rejected doctor', { 
        originalEmail: originalDoctorEmail || doctorToUpdate.email,
        newEmail: normalizedEmail,
        doctorId: doctorId,
        emailChanged: originalDoctorEmail && originalDoctorEmail !== normalizedEmail
      });
      
      // Update existing doctor record with new registration data
      // Use rounds=10 for faster hashing (still secure, ~100-200ms vs 300-500ms)
      const hashedPassword = await bcrypt.hash(formData.password, 10);
      const doctorFormData = {
        personalInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: normalizedEmail,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender
        },
        professionalInfo: {
          medicalLicense: formData.medicalLicense,
          experience: formData.experience,
          qualification: formData.qualification
        },
        practiceInfo: {
          clinicName: formData.clinicName,
          clinicNumber: formData.clinicNumber,
          clinicAddress: formData.clinicAddress,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        },
        registrationInfo: {
          registeredAt: new Date().toISOString(),
          inviteToken: token,
          createdBy: inviteData.createdBy,
          reRegistered: true, // Mark as re-registration
          previousRejectionDate: new Date().toISOString(),
          previousEmail: originalDoctorEmail && originalDoctorEmail !== normalizedEmail ? originalDoctorEmail : undefined
        }
      };

      // If email changed, update the email field in the database as well
      const updateQuery = originalDoctorEmail && normalizedEmail !== originalDoctorEmail
        ? `UPDATE "Doctor" 
           SET email = $1, password = $2, status = $3, "formData" = $4, "inviteToken" = $5, "updatedAt" = NOW() 
           WHERE id = $6 
           RETURNING id, email, status`
        : `UPDATE "Doctor" 
           SET password = $1, status = $2, "formData" = $3, "inviteToken" = $4, "updatedAt" = NOW() 
           WHERE id = $5 
           RETURNING id, email, status`;

      const updateParams = originalDoctorEmail && normalizedEmail !== originalDoctorEmail
        ? [normalizedEmail, hashedPassword, 'PENDING', JSON.stringify(doctorFormData), token, doctorId]
        : [hashedPassword, 'PENDING', JSON.stringify(doctorFormData), token, doctorId];

      const updateResult = await retryQuery(async () => {
        return await query(updateQuery, updateParams);
      });

      const updatedDoctor = updateResult.rows[0];

      // Mark invite link as used (with retry)
      await retryQuery(async () => {
        return await query(
          'UPDATE "InviteLink" SET "isUsed" = true, "usedAt" = NOW() WHERE token = $1',
          [token]
        );
      });

      logger.info('Rejected doctor re-registered successfully', { 
        doctorId: updatedDoctor.id,
        email: updatedDoctor.email,
        status: updatedDoctor.status 
      });

      return NextResponse.json({
        success: true,
        data: {
          id: updatedDoctor.id,
          email: updatedDoctor.email,
          status: updatedDoctor.status
        },
        message: 'Registration successful! Your updated information has been submitted. Please wait for admin approval.'
      });
    }

    // Hash password (use rounds=10 for faster hashing while maintaining security)
    const hashedPassword = await bcrypt.hash(formData.password, 10);

    // Prepare doctor data
    const doctorFormData = {
      personalInfo: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: normalizedEmail,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender
      },
      professionalInfo: {
        medicalLicense: formData.medicalLicense,
        experience: formData.experience,
        qualification: formData.qualification
      },
      practiceInfo: {
        clinicName: formData.clinicName,
        clinicNumber: formData.clinicNumber,
        clinicAddress: formData.clinicAddress,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode
      },
      registrationInfo: {
        registeredAt: new Date().toISOString(),
        inviteToken: token,
        createdBy: inviteData.createdBy
      }
    };

    // Insert doctor with PENDING status (with retry)
    const doctorResult = await retryQuery(async () => {
      return await query(
        `INSERT INTO "Doctor" 
         (email, password, status, "formData", "inviteToken", "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
         RETURNING id, email, status`,
        [
          normalizedEmail,
          hashedPassword,
          'PENDING',
          JSON.stringify(doctorFormData),
          token
        ]
      );
    });

    const newDoctor = doctorResult.rows[0];

    // Mark invite link as used (with retry)
    await retryQuery(async () => {
      return await query(
        'UPDATE "InviteLink" SET "isUsed" = true, "usedAt" = NOW() WHERE token = $1',
        [token]
      );
    });

    logger.info('Doctor registered successfully', { 
      doctorId: newDoctor.id,
      email: newDoctor.email,
      status: newDoctor.status 
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newDoctor.id,
        email: newDoctor.email,
        status: newDoctor.status
      },
      message: 'Registration successful! Please wait for admin approval.'
    });

  } catch (error) {
    logger.error('Doctor registration error', error);
    
    return NextResponse.json({
      success: false,
      error: 'Registration failed. Please try again.'
    }, { status: 500 });
  }
}
