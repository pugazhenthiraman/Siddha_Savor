'use client';

import { useState } from 'react';
import { useInviteLink, type InviteRole } from '@/lib/hooks/useInviteLink';
import { useToast } from '@/lib/hooks/useToast';
import { smtpService } from '@/lib/services/smtpService';
import { logger } from '@/lib/utils/logger';
import { INVITE_GENERATOR } from '@/lib/constants/admin';
import { FORM_PLACEHOLDERS } from '@/lib/constants/messages';
import { RoleSelector } from './RoleSelector';
import { GeneratedLinkDisplay } from './GeneratedLinkDisplay';
import { Button } from './Button';
import { Input } from './Input';
import { Toast } from './Toast';

interface InviteGeneratorProps {
  title?: string;
  description?: string;
  defaultRole?: InviteRole;
  onLinkGenerated?: (link: string, role: InviteRole) => void;
  className?: string;
}

export function InviteGenerator({
  title = INVITE_GENERATOR.TITLE,
  description = INVITE_GENERATOR.DESCRIPTION,
  defaultRole = 'DOCTOR',
  onLinkGenerated,
  className = ""
}: InviteGeneratorProps) {
  const [selectedRole, setSelectedRole] = useState<InviteRole>(defaultRole);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [isEmailMode, setIsEmailMode] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const { toasts, removeToast, success, error, warning } = useToast();

  const {
    isGenerating,
    generatedLink,
    error: linkError,
    generateInvite,
    copyToClipboard,
    clearLink,
    clearError
  } = useInviteLink();

  const handleGenerateInvite = async () => {
    await generateInvite(selectedRole);
    
    if (generatedLink && onLinkGenerated) {
      onLinkGenerated(generatedLink, selectedRole);
    }
  };

  const handleRoleChange = (role: InviteRole) => {
    setSelectedRole(role);
    if (linkError) clearError();
  };

  const sendEmailAfterValidation = async () => {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 3);

      const emailResponse = await smtpService.sendInviteEmail({
        to: recipientEmail,
        subject: `Invitation to Join Siddha Savor Healthcare Platform`,
        template: selectedRole === 'DOCTOR' ? 'doctor_invite' : 'patient_invite',
        data: {
          inviteLink: generatedLink!,
          expiresAt: expiresAt.toISOString(),
          recipientName: recipientName || undefined,
        }
      });

      if (emailResponse.success) {
        success(`Invitation email sent successfully to ${recipientEmail}! Link expires in 3 hours.`);
        setRecipientEmail('');
        setRecipientName('');
        setIsEmailMode(false);
      }
    } catch (err) {
      error(`Failed to send email: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleSendEmail = async () => {
    if (!generatedLink || !recipientEmail) return;

    try {
      setIsSendingEmail(true);

      // Check if SMTP database config exists
      const smtpConfigResponse = await smtpService.getConfig();
      
      if (!smtpConfigResponse.success || !smtpConfigResponse.data) {
        error('SMTP not configured. Please configure email settings in the Settings tab first.');
        return;
      }

      const smtpConfig = smtpConfigResponse.data;
      
      if (!smtpConfig.host || !smtpConfig.username || !smtpConfig.password || !smtpConfig.isActive) {
        error('SMTP configuration incomplete. Please complete email setup in Settings tab.');
        return;
      }

      try {
        const verify2FAResponse = await smtpService.verify2FA(recipientEmail);
        
        if (verify2FAResponse.success && !verify2FAResponse.data?.has2FA) {
          warning(`${recipientEmail} doesn't have 2FA enabled. We recommend 2FA for better security.`);
          setTimeout(() => {
            sendEmailAfterValidation();
          }, 2000);
          return;
        }
      } catch (error) {
        logger.warn('2FA verification failed, continuing with email send', error);
      }

      await sendEmailAfterValidation();

    } catch (err) {
      error(`Failed to send email: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const calculateExpiryTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 3);
    return now.toLocaleString();
  };

  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      <div className={`bg-white rounded-xl shadow-lg p-4 border border-gray-100 lg:rounded-2xl lg:p-6 ${className}`}>
        <div className="flex items-center space-x-3 mb-6 lg:space-x-4">
          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center lg:w-12 lg:h-12 lg:rounded-xl">
            <span className="text-white text-lg lg:text-xl">🔗</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 lg:text-lg">{title}</h3>
            <p className="text-xs text-gray-600 lg:text-sm">{description}</p>
          </div>
        </div>

        {linkError && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{linkError}</p>
          </div>
        )}

        <div className="mb-6">
          <RoleSelector
            selectedRole={selectedRole}
            onRoleChange={handleRoleChange}
            disabled={isGenerating || isSendingEmail}
          />
        </div>

        <Button
          onClick={handleGenerateInvite}
          isLoading={isGenerating}
          className="w-full mb-6"
          size="lg"
          disabled={isSendingEmail}
        >
          {isGenerating ? INVITE_GENERATOR.GENERATING : INVITE_GENERATOR.GENERATE_BUTTON(selectedRole)}
        </Button>

        {generatedLink && (
          <>
            <GeneratedLinkDisplay
              link={generatedLink}
              onCopy={copyToClipboard}
              onClear={clearLink}
              expiryHours={3}
            />

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-700 lg:text-base">Send via Email</h4>
                <button
                  onClick={() => setIsEmailMode(!isEmailMode)}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  {isEmailMode ? INVITE_GENERATOR.CANCEL : INVITE_GENERATOR.SEND_EMAIL}
                </button>
              </div>

              {isEmailMode && (
                <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {INVITE_GENERATOR.EMAIL_LABEL} *
                      </label>
                      <Input
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder={FORM_PLACEHOLDERS.RECIPIENT_EMAIL}
                        disabled={isSendingEmail}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {INVITE_GENERATOR.NAME_LABEL} (Optional)
                      </label>
                      <Input
                        type="text"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder={FORM_PLACEHOLDERS.RECIPIENT_NAME}
                        disabled={isSendingEmail}
                      />
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      ⏰ <strong>Link expires in 3 hours</strong> ({calculateExpiryTime()})
                    </p>
                  </div>

                  <Button
                    onClick={handleSendEmail}
                    isLoading={isSendingEmail}
                    disabled={!recipientEmail || isSendingEmail}
                    className="w-full"
                  >
                    {isSendingEmail ? 'Sending Email...' : '📧 Send Invitation Email'}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3 lg:text-base">Security Features</h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <div>
                <p className="text-xs font-medium text-gray-900 lg:text-sm">3-Hour Expiry</p>
                <p className="text-xs text-gray-500">Links expire automatically</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <div>
                <p className="text-xs font-medium text-gray-900 lg:text-sm">2FA Verification</p>
                <p className="text-xs text-gray-500">Checks recipient security</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <div>
                <p className="text-xs font-medium text-gray-900 lg:text-sm">Single Use</p>
                <p className="text-xs text-gray-500">Each link works only once</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <div>
                <p className="text-xs font-medium text-gray-900 lg:text-sm">Email Templates</p>
                <p className="text-xs text-gray-500">Professional formatting</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
