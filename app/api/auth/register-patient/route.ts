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

    // Check if email already exists in Admin/Doctor tables only
    // For patients, allow multiple registrations with same email (family members)
    const [existingAdmin, existingDoctor] = await Promise.all([
      retryQuery(async () => {
        return await query('SELECT id FROM "Admin" WHERE email = $1', [normalizedEmail]);
      }),
      retryQuery(async () => {
        return await query('SELECT id, status FROM "Doctor" WHERE email = $1', [normalizedEmail]);
      })
    ]);

    // Block if email exists in Admin
    if (existingAdmin.rows.length > 0) {
      logger.warn('Registration attempt with existing admin email', { email: normalizedEmail });
      return NextResponse.json({
        success: false,
        error: 'This email is already registered as an admin. Please use a different email or try logging in.'
      }, { status: 400 });
    }

    // Block if email exists in Doctor table and is approved/pending
    if (existingDoctor.rows.length > 0 && existingDoctor.rows[0].status !== 'REJECTED') {
      logger.warn('Registration attempt with existing doctor email', { email: normalizedEmail });
      return NextResponse.json({
        success: false,
        error: 'This email is already registered as a doctor. Please use a different email or try logging in.'
      }, { status: 400 });
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
        age: formData.age,
        gender: formData.gender,
        occupation: formData.occupation,
        customOccupation: formData.customOccupation,
        workType: formData.workType
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
         (email, password, status, "formData", "inviteToken", "doctorUID", "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) 
         RETURNING id, email`,
        [
          normalizedEmail,
          hashedPassword,
          'PENDING',  // Set initial status as PENDING
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
