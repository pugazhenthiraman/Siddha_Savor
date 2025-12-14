import { NextRequest, NextResponse } from 'next/server';
import { getSmtpConfig, getAdmin, updateAdminSmtpConfig } from '@/lib/db';
import { logger } from '@/lib/utils/logger';

export async function GET() {
  try {
    logger.info('Fetching SMTP configuration from database');
    
    const smtpConfig = await getSmtpConfig();
    logger.info('SMTP config retrieved', { 
      hasConfig: !!smtpConfig, 
      isActive: smtpConfig?.isActive,
      host: smtpConfig?.host,
      hasUsername: !!smtpConfig?.username 
    });
    
    return NextResponse.json({
      success: true,
      data: smtpConfig,
      message: smtpConfig ? 'SMTP configuration retrieved successfully' : 'No SMTP configuration found'
    });

  } catch (error) {
    logger.error('SMTP config error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch SMTP configuration'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { host, port, username, password, fromEmail, fromName, isActive } = body;

    const smtpConfig = {
      host: host || 'smtp.gmail.com',
      port: port || 587,
      username,
      password,
      fromEmail,
      fromName: fromName || 'Siddha Savor',
      isActive: isActive || false,
      updatedAt: new Date().toISOString()
    };

    const admin = await getAdmin();
    
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'No admin found'
      }, { status: 404 });
    }

    await updateAdminSmtpConfig(admin.id, smtpConfig);

    logger.info('SMTP configuration saved successfully', { 
      host: smtpConfig.host, 
      fromEmail: smtpConfig.fromEmail,
      isActive: smtpConfig.isActive 
    });

    return NextResponse.json({
      success: true,
      data: smtpConfig,
      message: 'SMTP configuration saved successfully'
    });

  } catch (error) {
    logger.error('SMTP save error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to save SMTP configuration'
    }, { status: 500 });
  }
}
