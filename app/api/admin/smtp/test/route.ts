import { NextRequest, NextResponse } from 'next/server';
import { getSmtpConfig } from '@/lib/db';
import nodemailer from 'nodemailer';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    logger.info('SMTP test connection API called');

    // Get SMTP config from database
    const config = await getSmtpConfig();
    
    if (!config) {
      return NextResponse.json({
        success: false,
        data: { success: false, message: 'No SMTP configuration found. Please save configuration first.' }
      });
    }

    // Create transporter with config
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: false, // Always false for port 587
      auth: {
        user: config.username,
        pass: config.password,
      },
    });

    // Test the connection
    await transporter.verify();
    
    logger.info('SMTP connection test successful', { 
      host: config.host, 
      port: config.port,
      username: config.username 
    });

    return NextResponse.json({
      success: true,
      data: { 
        success: true, 
        message: `✅ Connection successful! Connected to ${config.host}:${config.port} with ${config.username}` 
      }
    });

  } catch (error) {
    logger.error('SMTP connection test failed', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      success: true,
      data: { 
        success: false, 
        message: `❌ Connection failed: ${errorMessage}. Check your Gmail app password and settings.` 
      }
    });
  }
}
