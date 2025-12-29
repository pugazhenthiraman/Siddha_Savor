import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Find user in any table
    const admin = await prisma.admin.findUnique({ where: { email } });
    const doctor = await prisma.doctor.findUnique({ where: { email } });
    const patient = await prisma.patient.findUnique({ where: { email } });

    if (!admin && !doctor && !patient) {
      return NextResponse.json({ success: false, error: 'Email not found' }, { status: 404 });
    }

    const userRole = admin ? 'admin' : doctor ? 'doctor' : 'patient';
    const token = crypto.randomUUID();
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Clean old tokens
    await prisma.passwordReset.deleteMany({
      where: { email, expiresAt: { lt: new Date() } }
    });

    // Create reset token
    await prisma.passwordReset.create({
      data: {
        email,
        token,
        code,
        userRole,
        data: {},
        expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      }
    });

    // Send email
    const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/smtp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: 'Password Reset - Siddha Savor',
        template: 'password-reset',
        data: { code, email }
      })
    });

    if (!emailResponse.ok) {
      throw new Error('Failed to send email');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Verification code sent to your email',
      token 
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process request' 
    }, { status: 500 });
  }
}
