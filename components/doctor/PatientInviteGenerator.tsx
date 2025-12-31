'use client';

import { useState } from 'react';
import { doctorService } from '@/lib/services/doctorService';
import { authService } from '@/lib/services/auth';
import { DOCTOR_BUTTONS } from '@/lib/constants/doctor';
import { useToast } from '@/lib/hooks/useToast';
import { logger } from '@/lib/utils/logger';

export function PatientInviteGenerator() {
  const { success, error } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');

  const handleGenerateInvite = async () => {
    try {
      setIsGenerating(true);
      const user = authService.getCurrentUser() as any; // User type may include doctorUID from API
      
      if (!user?.doctorUID) {
        error('Doctor UID not found. Please contact support.');
        return;
      }

      // Generate invite link directly without form fields
      const response = await doctorService.generatePatientInvite(
        (user as any).doctorUID,
        undefined, // No recipient email
        undefined  // No recipient name
      );

      if (response.success && response.data) {
        const baseUrl = window.location.origin;
        const inviteUrl = `${baseUrl}/register?token=${response.data.token}&role=patient`;
        setGeneratedLink(inviteUrl);
        success('Patient invite link generated successfully!');
      }
    } catch (err) {
      logger.error('Failed to generate patient invite', err);
      error('Failed to generate invite link');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      success('Invite link copied to clipboard!');
    } catch (err) {
      logger.error('Failed to copy to clipboard', err);
      error('Failed to copy link');
    }
  };

  const resetLink = () => {
    setGeneratedLink('');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Patient Invite Generator</h3>
          <p className="text-sm text-gray-600">Generate invitation links for new patients</p>
        </div>
        {!generatedLink && (
          <button
            onClick={handleGenerateInvite}
            disabled={isGenerating}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating...' : DOCTOR_BUTTONS.GENERATE_INVITE}
          </button>
        )}
      </div>

      {generatedLink && (
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Generated Invite Link</h4>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <code className="text-sm text-gray-800 break-all flex-1 mr-4">
                {generatedLink}
              </code>
              <button
                onClick={copyToClipboard}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Copy Link
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 flex items-center">
              <span className="mr-2">⏰</span>
              This link will expire in 7 days
            </div>
            <button
              onClick={resetLink}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              Generate New Link
            </button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Instructions for patient:</strong> The patient should click this link to register. 
              They will be automatically assigned to your practice upon successful registration.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
