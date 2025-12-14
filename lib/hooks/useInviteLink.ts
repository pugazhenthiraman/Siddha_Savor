import { useState } from 'react';
import { adminService, type InviteLink } from '@/lib/services/adminService';
import { logger } from '@/lib/utils/logger';

export type InviteRole = 'DOCTOR' | 'PATIENT';

interface UseInviteLinkReturn {
  isGenerating: boolean;
  generatedLink: string | null;
  error: string | null;
  generateInvite: (role: InviteRole, doctorUID?: string) => Promise<void>;
  copyToClipboard: () => Promise<boolean>;
  clearLink: () => void;
  clearError: () => void;
}

export function useInviteLink(): UseInviteLinkReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateInvite = async (role: InviteRole, doctorUID?: string) => {
    try {
      setIsGenerating(true);
      setError(null);
      
      logger.info('Generating invite link', { role, doctorUID });
      
      const response = await adminService.createInvite(role, doctorUID);
      
      if (response.success && response.data) {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const inviteUrl = `${baseUrl}/register?token=${response.data.token}&role=${role.toLowerCase()}`;
        
        setGeneratedLink(inviteUrl);
        logger.info('Invite link generated successfully', { 
          role, 
          token: response.data.token,
          expiresAt: response.data.expiresAt 
        });
      } else {
        throw new Error('Failed to generate invite link');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate invite link';
      setError(errorMessage);
      logger.error('Failed to generate invite link', error, { role, doctorUID });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (): Promise<boolean> => {
    if (!generatedLink) return false;

    try {
      await navigator.clipboard.writeText(generatedLink);
      logger.info('Invite link copied to clipboard');
      return true;
    } catch (error) {
      logger.error('Failed to copy to clipboard', error);
      return false;
    }
  };

  const clearLink = () => {
    setGeneratedLink(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  return {
    isGenerating,
    generatedLink,
    error,
    generateInvite,
    copyToClipboard,
    clearLink,
    clearError,
  };
}
