import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { getAdminByEmail, query } from '@/lib/db';
import { loginSchema } from '@/lib/validations/auth';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants/messages';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    logger.info('Login API called');
    
    const body = await request.json();
    logger.debug('Login request received', { email: body.email });
    
    // Validate request body
    const validationResult = loginSchema.safeParse(body);
    
    if (!validationResult.success) {
      logger.warn('Login validation failed', { 
        errors: validationResult.error.errors,
        email: body.email 
      });
      
      return NextResponse.json(
        { 
          success: false,
          error: ERROR_MESSAGES.INVALID_EMAIL_FORMAT,
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;
    const normalizedEmail = email.toLowerCase().trim();
    // Trim password to handle any accidental whitespace
    const trimmedPassword = password.trim();

    logger.info('Attempting login', { email: normalizedEmail });

    // Try to find user in all tables with specific error messages
    let user = null;
    let userRole = '';
    let specificError = '';
    let doctorResult = null;
    let patientResult = null;

    // Check Admin table
    const admin = await getAdminByEmail(normalizedEmail);
    if (admin) {
      // Ensure password field exists and is not null/empty
      if (!admin.password || admin.password.trim().length === 0) {
        logger.error('Admin found but password field is empty', { email: normalizedEmail, adminId: admin.id });
        specificError = ERROR_MESSAGES.ACCOUNT_DISABLED;
      } else {
        const isValidPassword = await bcrypt.compare(trimmedPassword, admin.password);
        if (isValidPassword) {
          user = admin;
          userRole = 'admin';
          logger.debug('Admin login successful', { email: normalizedEmail });
        } else {
          specificError = ERROR_MESSAGES.ADMIN_INVALID_PASSWORD;
          logger.warn('Admin login failed - invalid password', { 
            email: normalizedEmail,
            hasPassword: !!admin.password,
            passwordLength: admin.password?.length
          });
        }
      }
    }

    // Check Doctor table if not found in admin
    if (!user && !admin) {
      doctorResult = await query('SELECT * FROM "Doctor" WHERE email = $1', [normalizedEmail]);
      const doctor = doctorResult.rows[0];

      if (doctor) {
        if (doctor.status === 'PENDING') {
          logger.warn('Login attempt by pending doctor', { 
            email: normalizedEmail,
            status: doctor.status 
          });
          
          return NextResponse.json(
            { 
              success: false,
              error: ERROR_MESSAGES.DOCTOR_PENDING_APPROVAL,
              redirect: '/login?pending=true'
            },
            { status: 403 }
          );
        }
        
        if (doctor.status === 'REJECTED') {
          logger.warn('Login attempt by rejected doctor', { 
            email: normalizedEmail,
            status: doctor.status 
          });
          
      return NextResponse.json(
        { 
          success: false,
              error: ERROR_MESSAGES.DOCTOR_REJECTED
            },
            { status: 403 }
          );
        }
        
        if (doctor.status === 'APPROVED' && doctor.password) {
          // Ensure password is valid
          if (doctor.password.trim().length === 0) {
            logger.error('Doctor approved but password is empty', { email: normalizedEmail, doctorId: doctor.id });
            specificError = ERROR_MESSAGES.PATIENT_NOT_REGISTERED;
          } else {
            const isValidPassword = await bcrypt.compare(trimmedPassword, doctor.password);
            if (isValidPassword) {
              user = doctor;
              userRole = 'doctor';
              logger.debug('Doctor login successful', { 
                email: normalizedEmail, 
                status: doctor.status,
                doctorUID: doctor.doctorUID 
              });
            } else {
              specificError = ERROR_MESSAGES.DOCTOR_INVALID_PASSWORD;
              logger.warn('Doctor login failed - invalid password', { 
                email: normalizedEmail,
                hasPassword: !!doctor.password,
                passwordLength: doctor.password?.length
              });
            }
          }
        } else if (doctor.status === 'APPROVED' && !doctor.password) {
          specificError = ERROR_MESSAGES.PATIENT_NOT_REGISTERED;
          logger.warn('Doctor approved but no password set', { email: normalizedEmail });
        } else {
          specificError = ERROR_MESSAGES.DOCTOR_NOT_APPROVED;
          logger.warn('Doctor not approved', { email: normalizedEmail, status: doctor.status });
        }
      }
    }

    // Check Patient table if not found in doctor
    if (!user && !admin && !specificError.includes('DOCTOR')) {
      patientResult = await query('SELECT * FROM "Patient" WHERE email = $1', [normalizedEmail]);
      const patient = patientResult.rows[0];

      if (patient && patient.password) {
        // Ensure password is valid
        if (patient.password.trim().length === 0) {
          logger.error('Patient found but password is empty', { email: normalizedEmail, patientId: patient.id });
          specificError = ERROR_MESSAGES.PATIENT_NOT_REGISTERED;
        } else {
          const isValidPassword = await bcrypt.compare(trimmedPassword, patient.password);
          if (isValidPassword) {
            user = patient;
            userRole = 'patient';
            logger.debug('Patient login successful', { 
              email: normalizedEmail,
              doctorUID: patient.doctorUID 
            });
          } else {
            specificError = ERROR_MESSAGES.PATIENT_INVALID_PASSWORD;
            logger.warn('Patient login failed - invalid password', { 
              email: normalizedEmail,
              hasPassword: !!patient.password,
              passwordLength: patient.password?.length
            });
          }
        }
      } else if (patient) {
        specificError = ERROR_MESSAGES.PATIENT_NOT_REGISTERED;
        logger.warn('Patient found but no password', { email: normalizedEmail });
      }
    }

    // Handle login failure with specific error messages
    if (!user) {
      let errorMessage = ERROR_MESSAGES.INVALID_CREDENTIALS;
      
      if (specificError) {
        errorMessage = specificError;
      } else if (!admin && !doctorResult?.rows[0] && !patientResult?.rows[0]) {
        errorMessage = ERROR_MESSAGES.EMAIL_NOT_FOUND;
      }
      
      logger.warn('Login failed', { 
        email: normalizedEmail,
        error: errorMessage,
        hasAdmin: !!admin,
        hasDoctor: !!doctorResult?.rows[0],
        hasPatient: !!patientResult?.rows[0]
      });
      
      return NextResponse.json(
        { 
          success: false,
          error: errorMessage
        },
        { status: 401 }
      );
    }

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;

    // Get role-specific success message
    const successMessage = userRole === 'admin' ? SUCCESS_MESSAGES.ADMIN_LOGIN_SUCCESS :
                          userRole === 'doctor' ? SUCCESS_MESSAGES.DOCTOR_LOGIN_SUCCESS :
                          SUCCESS_MESSAGES.PATIENT_LOGIN_SUCCESS;

    logger.info('Login successful', { 
      email: normalizedEmail,
      role: userRole,
      userId: user.id 
    });

    return NextResponse.json({
      success: true,
      data: {
        user: {
          ...userWithoutPassword,
          role: userRole,
        },
      },
      message: successMessage,
    });

  } catch (error) {
    logger.error('Login API error', error, { 
      url: request.url,
      method: request.method 
    });

    // Database connection error
    if (error instanceof Error && error.message.includes('connect')) {
      return NextResponse.json(
        { 
          success: false,
          error: ERROR_MESSAGES.DATABASE_ERROR
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: ERROR_MESSAGES.SERVER_ERROR 
      },
      { status: 500 }
    );
  }
}
