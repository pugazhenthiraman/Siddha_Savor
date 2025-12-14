import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { query } from '@/lib/db';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, ...formData } = body;

    logger.info('Patient registration attempt', { email: formData.email });

    // Validate token first
    const tokenResult = await query(
      'SELECT * FROM "InviteLink" WHERE token = $1 AND "expiresAt" > NOW() AND "isUsed" = false AND role = $2',
      [token, 'PATIENT']
    );

    if (tokenResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired registration link'
      }, { status: 400 });
    }

    const inviteData = tokenResult.rows[0];

    // Check if email already exists
    const existingPatient = await query(
      'SELECT id FROM "Patient" WHERE email = $1',
      [formData.email]
    );

    if (existingPatient.rows.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'A patient with this email already exists'
      }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(formData.password, 12);

    // Prepare patient data
    const patientFormData = {
      personalInfo: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
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
        inviteToken: token,
        createdBy: inviteData.createdBy
      }
    };

    // Insert patient
    const patientResult = await query(
      `INSERT INTO "Patient" 
       (email, password, "formData", "inviteToken", "doctorUID", "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
       RETURNING id, email`,
      [
        formData.email,
        hashedPassword,
        JSON.stringify(patientFormData),
        token,
        inviteData.doctorUID || null
      ]
    );

    const newPatient = patientResult.rows[0];

    // Mark invite link as used
    await query(
      'UPDATE "InviteLink" SET "isUsed" = true, "usedAt" = NOW() WHERE token = $1',
      [token]
    );

    logger.info('Patient registered successfully', { 
      patientId: newPatient.id,
      email: newPatient.email,
      doctorUID: inviteData.doctorUID 
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newPatient.id,
        email: newPatient.email
      },
      message: 'Registration successful! You can now log in.'
    });

  } catch (error) {
    logger.error('Patient registration error', error);
    
    return NextResponse.json({
      success: false,
      error: 'Registration failed. Please try again.'
    }, { status: 500 });
  }
}
