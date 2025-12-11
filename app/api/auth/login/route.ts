import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/db';
import { loginSchema } from '@/lib/validations/auth';
import { ERROR_MESSAGES } from '@/lib/constants/messages';
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
          error: 'Invalid input data',
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;
    const normalizedEmail = email.toLowerCase();

    logger.info('Attempting login', { email: normalizedEmail });

    // Try to find user in all tables
    let user = null;
    let userRole = '';

    // Check Admin table
    const admin = await prisma.admin.findUnique({
      where: { email: normalizedEmail },
    });

    if (admin) {
      user = admin;
      userRole = 'admin';
      logger.debug('User found in admin table', { email: normalizedEmail });
    }

    // Check Doctor table if not found in admin
    if (!user) {
      const doctor = await prisma.doctor.findUnique({
        where: { email: normalizedEmail },
      });

      if (doctor && doctor.status === 'APPROVED' && doctor.password) {
        user = doctor;
        userRole = 'doctor';
        logger.debug('User found in doctor table', { 
          email: normalizedEmail, 
          status: doctor.status,
          doctorUID: doctor.doctorUID 
        });
      } else if (doctor) {
        logger.warn('Doctor found but not approved or no password', { 
          email: normalizedEmail, 
          status: doctor.status,
          hasPassword: !!doctor.password 
        });
      }
    }

    // Check Patient table if not found in doctor
    if (!user) {
      const patient = await prisma.patient.findUnique({
        where: { email: normalizedEmail },
      });

      if (patient && patient.password) {
        user = patient;
        userRole = 'patient';
        logger.debug('User found in patient table', { 
          email: normalizedEmail,
          doctorUID: patient.doctorUID 
        });
      } else if (patient) {
        logger.warn('Patient found but no password', { email: normalizedEmail });
      }
    }

    if (!user || !user.password) {
      logger.warn('Login failed - user not found or no password', { 
        email: normalizedEmail,
        userFound: !!user,
        hasPassword: user ? !!user.password : false 
      });
      
      return NextResponse.json(
        { 
          success: false,
          error: ERROR_MESSAGES.INVALID_CREDENTIALS 
        },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      logger.warn('Login failed - invalid password', { 
        email: normalizedEmail,
        role: userRole 
      });
      
      return NextResponse.json(
        { 
          success: false,
          error: ERROR_MESSAGES.INVALID_CREDENTIALS 
        },
        { status: 401 }
      );
    }

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;

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
      message: 'Login successful',
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
          error: 'Database connection error. Please try again later.' 
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
