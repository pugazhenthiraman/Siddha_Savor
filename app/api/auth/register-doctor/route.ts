import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { query } from '@/lib/db';
import { logger } from '@/lib/utils/logger';
import { ERROR_MESSAGES } from '@/lib/constants/messages';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, ...formData } = body;

    const normalizedEmail = formData.email.toLowerCase();
    logger.info('Doctor registration attempt', { email: normalizedEmail });

    // Validate token first
    const tokenResult = await query(
      'SELECT * FROM "InviteLink" WHERE token = $1 AND "expiresAt" > NOW() AND "isUsed" = false AND role = $2',
      [token, 'DOCTOR']
    );

    if (tokenResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired registration link'
      }, { status: 400 });
    }

    const inviteData = tokenResult.rows[0];

    // Check if email already exists in ANY table (Admin, Doctor, Patient)
    
    // Check Admin table
    const existingAdmin = await query(
      'SELECT id FROM "Admin" WHERE email = $1',
      [normalizedEmail]
    );

    // Check Doctor table
    const existingDoctor = await query(
      'SELECT id FROM "Doctor" WHERE email = $1',
      [normalizedEmail]
    );

    // Check Patient table
    const existingPatient = await query(
      'SELECT id FROM "Patient" WHERE email = $1',
      [normalizedEmail]
    );

    if (existingAdmin.rows.length > 0 || existingDoctor.rows.length > 0 || existingPatient.rows.length > 0) {
      logger.warn('Registration attempt with existing email', { email: normalizedEmail });
      return NextResponse.json({
        success: false,
        error: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS
      }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(formData.password, 12);

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

    // Insert doctor with PENDING status
    const doctorResult = await query(
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

    const newDoctor = doctorResult.rows[0];

    // Mark invite link as used
    await query(
      'UPDATE "InviteLink" SET "isUsed" = true, "usedAt" = NOW() WHERE token = $1',
      [token]
    );

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
