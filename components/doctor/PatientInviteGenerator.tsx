'use client';

import { useState } from 'react';
import { doctorService } from '@/lib/services/doctorService';
import { authService } from '@/lib/services/auth';
import { DOCTOR_BUTTONS } from '@/lib/constants/doctor';
import { FORM_LABELS } from '@/lib/constants/messages';
import { useToast } from '@/lib/hooks/useToast';
import { logger } from '@/lib/utils/logger';

export function PatientInviteGenerator() {
  const { success, error } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleGenerateInvite = async () => {
    try {
      setIsGenerating(true);
      const user = authService.getCurrentUser();
      
      if (!user?.doctorUID) {
        error('Doctor UID not found. Please contact support.');
        return;
      }

      const response = await doctorService.generatePatientInvite(
        user.doctorUID,
        recipientEmail || undefined,
        recipientName || undefined
      );

      if (response.success && response.data) {
        const baseUrl = window.location.origin;
        const inviteUrl = `${baseUrl}/register?token=${response.data.token}&role=patient`;
        setGeneratedLink(inviteUrl);
        success('Patient invite link generated successfully!');
        
        // Reset form
        setRecipientEmail('');
        setRecipientName('');
        setShowForm(false);
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

  const sendEmail = () => {
    if (!recipientEmail) {
      error('Please provide recipient email to send invitation');
      return;
    }
    
    const subject = 'Invitation to Join Siddha Savor Healthcare Platform';
    const body = `Hello ${recipientName || 'there'},

You have been invited to join Siddha Savor healthcare platform as a patient.

Please click the following link to complete your registration:
${generatedLink}

This link will expire in 7 days.

Best regards,
Siddha Savor Team`;

    const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Patient Invite Generator</h3>
          <p className="text-sm text-gray-600">Generate invitation links for new patients</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          {DOCTOR_BUTTONS.GENERATE_INVITE}
        </button>
      </div>

      {showForm && (
        <div className="border-t border-gray-200 pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {FORM_LABELS.FIRST_NAME} (Optional)
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Patient's name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {FORM_LABELS.EMAIL_ADDRESS} (Optional)
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="patient@example.com"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              {DOCTOR_BUTTONS.CANCEL}
            </button>
            <button
              onClick={handleGenerateInvite}
              disabled={isGenerating}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating...' : 'Generate Link'}
            </button>
          </div>
        </div>
      )}

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

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={sendEmail}
              disabled={!recipientEmail}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {DOCTOR_BUTTONS.SEND_EMAIL}
            </button>
            
            <div className="text-xs text-gray-500 flex items-center">
              <span className="mr-2">⏰</span>
              This link will expire in 7 days
            </div>
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
