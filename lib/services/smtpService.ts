import { apiClient, ApiResponse } from './api';
import { logger } from '@/lib/utils/logger';

export interface SMTPConfig {
  id?: number;
  host: string;
  port: number;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmailRequest {
  to: string;
  subject: string;
  template: 'doctor_invite' | 'patient_invite';
  data: {
    inviteLink: string;
    expiresAt: string;
    recipientName?: string;
  };
}

export interface EmailResponse {
  messageId: string;
  accepted: string[];
  rejected: string[];
  pending: string[];
}

class SMTPService {
  private readonly ENDPOINTS = {
    CONFIG: '/api/admin/smtp/config',
    TEST: '/api/admin/smtp/test',
    SEND: '/api/admin/smtp/send',
    TEST_SEND: '/api/admin/smtp/test-send',
    VERIFY_2FA: '/api/admin/smtp/verify-2fa',
  } as const;

  /**
   * Get SMTP configuration
   */
  async getConfig(): Promise<ApiResponse<SMTPConfig>> {
    try {
      logger.info('Fetching SMTP configuration');
      return await apiClient.get<SMTPConfig>(this.ENDPOINTS.CONFIG);
    } catch (error) {
      logger.error('Failed to fetch SMTP config', error);
      throw error;
    }
  }

  /**
   * Save SMTP configuration
   */
  async saveConfig(config: Omit<SMTPConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<SMTPConfig>> {
    try {
      logger.info('Saving SMTP configuration', { host: config.host, fromEmail: config.fromEmail });
      return await apiClient.post<SMTPConfig>(this.ENDPOINTS.CONFIG, config);
    } catch (error) {
      logger.error('Failed to save SMTP config', error);
      throw error;
    }
  }

  /**
   * Test SMTP connection
   */
  async testConnection(): Promise<ApiResponse<{ success: boolean; message: string }>> {
    try {
      logger.info('Testing SMTP connection');
      return await apiClient.post<{ success: boolean; message: string }>(this.ENDPOINTS.TEST);
    } catch (error) {
      logger.error('SMTP connection test failed', error);
      throw error;
    }
  }

  /**
   * Send email with invite link
   */
  async sendInviteEmail(emailRequest: EmailRequest): Promise<ApiResponse<EmailResponse>> {
    try {
      logger.info('Sending invite email', { 
        to: emailRequest.to, 
        template: emailRequest.template,
        expiresAt: emailRequest.data.expiresAt 
      });
      
      return await apiClient.post<EmailResponse>(this.ENDPOINTS.SEND, emailRequest);
    } catch (error) {
      logger.error('Failed to send invite email', error, { to: emailRequest.to });
      throw error;
    }
  }

  /**
   * Verify recipient has 2FA enabled
   */
  async verify2FA(email: string): Promise<ApiResponse<{ has2FA: boolean; provider?: string }>> {
    try {
      logger.info('Verifying 2FA status', { email });
      return await apiClient.post<{ has2FA: boolean; provider?: string }>(
        this.ENDPOINTS.VERIFY_2FA, 
        { email }
      );
    } catch (error) {
      logger.error('Failed to verify 2FA status', error, { email });
      throw error;
    }
  }

  /**
   * Send test email to specified address
   */
  async sendTestEmail(testEmail: string): Promise<ApiResponse<{ message: string }>> {
    try {
      logger.info('Sending test email', { testEmail });
      return await apiClient.post<{ message: string }>(
        this.ENDPOINTS.TEST_SEND,
        { testEmail }
      );
    } catch (error) {
      logger.error('Failed to send test email', error, { testEmail });
      throw error;
    }
  }
}

export const smtpService = new SMTPService();
