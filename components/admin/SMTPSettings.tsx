'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { smtpService, type SMTPConfig } from '@/lib/services/smtpService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants/messages';
import { logger } from '@/lib/utils/logger';

export function SMTPSettings() {
  const router = useRouter();
  const [config, setConfig] = useState<Partial<SMTPConfig>>({
    host: 'smtp.gmail.com',
    port: 587,
    username: '',
    password: '',
    fromEmail: '',
    fromName: 'Siddha Savor',
    isActive: false,
  });
  const [originalConfig, setOriginalConfig] = useState<Partial<SMTPConfig>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    // Check for unsaved changes
    const hasChanges = JSON.stringify(config) !== JSON.stringify(originalConfig);
    setHasUnsavedChanges(hasChanges);
  }, [config, originalConfig]);

  useEffect(() => {
    // Warn before leaving page with unsaved changes
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const response = await smtpService.getConfig();
      if (response.success && response.data) {
        setConfig(response.data);
        setOriginalConfig(response.data);
      } else {
        setOriginalConfig(config);
      }
    } catch (error) {
      logger.error('Failed to load SMTP config', error);
      setOriginalConfig(config);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setMessage(null);
      
      const response = await smtpService.saveConfig(config as Omit<SMTPConfig, 'id' | 'createdAt' | 'updatedAt'>);
      
      if (response.success) {
        setMessage({ type: 'success', text: 'SMTP configuration saved successfully!' });
        setConfig(response.data!);
        setOriginalConfig(response.data!);
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save SMTP configuration' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      setIsTesting(true);
      setMessage(null);
      
      const response = await smtpService.testConnection();
      
      if (response.success && response.data?.success) {
        setMessage({ type: 'success', text: response.data.message });
      } else {
        setMessage({ type: 'error', text: response.data?.message || 'SMTP connection test failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to test SMTP connection' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      setMessage({ type: 'error', text: 'Please enter a test email address' });
      return;
    }

    try {
      setIsSendingTest(true);
      setMessage(null);
      
      const response = await smtpService.sendTestEmail(testEmail);
      
      if (response.success && response.data) {
        setMessage({ type: 'success', text: response.data.message });
        setTestEmail(''); // Clear the input
      } else {
        setMessage({ type: 'error', text: response.error || ERROR_MESSAGES.SOMETHING_WENT_WRONG });
      }
    } catch (error) {
      logger.error('Failed to send test email', error);
      setMessage({ type: 'error', text: ERROR_MESSAGES.NETWORK_ERROR });
    } finally {
      setIsSendingTest(false);
    }
  };

  const updateConfig = (field: keyof SMTPConfig, value: string | number | boolean) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    if (message) setMessage(null);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 lg:rounded-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 lg:rounded-2xl lg:p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6 lg:space-x-4">
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center lg:w-12 lg:h-12 lg:rounded-xl">
          <span className="text-white text-lg lg:text-xl">📧</span>
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900 lg:text-lg">SMTP Configuration</h3>
          <p className="text-xs text-gray-600 lg:text-sm">Configure email settings for sending invitations</p>
        </div>
      </div>

      {message && (
        <Alert 
          variant={message.type} 
          message={message.text} 
          className="mb-6" 
        />
      )}

      <div className="space-y-6">
        {/* SMTP Server Settings */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SMTP Host (Gmail Pre-configured)
            </label>
            <Input
              type="text"
              value={config.host || ''}
              onChange={(e) => updateConfig('host', e.target.value)}
              placeholder="smtp.gmail.com"
              disabled={isSaving || isTesting}
            />
            <p className="text-xs text-gray-500 mt-1">Gmail is recommended for free usage</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Port (587 - Free Gmail)
            </label>
            <Input
              type="number"
              value={config.port || 587}
              onChange={(e) => updateConfig('port', parseInt(e.target.value))}
              placeholder="587"
              disabled={isSaving || isTesting}
            />
            <p className="text-xs text-gray-500 mt-1">Port 587 works with free Gmail accounts</p>
          </div>
        </div>

        {/* Authentication */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gmail Address
            </label>
            <Input
              type="email"
              value={config.username || ''}
              onChange={(e) => {
                updateConfig('username', e.target.value);
                // Auto-fill fromEmail when username changes
                if (e.target.value && !config.fromEmail) {
                  updateConfig('fromEmail', e.target.value);
                }
              }}
              placeholder="your-email@gmail.com"
              disabled={isSaving || isTesting}
            />
            <p className="text-xs text-gray-500 mt-1">Your Gmail address</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gmail App Password
            </label>
            <Input
              type="password"
              value={config.password || ''}
              onChange={(e) => updateConfig('password', e.target.value)}
              placeholder="16-character app password"
              disabled={isSaving || isTesting}
            />
            <div className="mt-2">
              <button
                type="button"
                onClick={() => window.open('https://myaccount.google.com/apppasswords', '_blank')}
                className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors"
              >
                🔑 Generate Gmail App Password
              </button>
            </div>
          </div>
        </div>

        {/* From Settings */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Email (Same as Gmail)
            </label>
            <Input
              type="email"
              value={config.fromEmail || ''}
              onChange={(e) => updateConfig('fromEmail', e.target.value)}
              placeholder="your-email@gmail.com"
              disabled={isSaving || isTesting}
            />
            <p className="text-xs text-gray-500 mt-1">Must match your Gmail address</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Name
            </label>
            <Input
              type="text"
              value={config.fromName || ''}
              onChange={(e) => updateConfig('fromName', e.target.value)}
              placeholder="Siddha Savor"
              disabled={isSaving || isTesting}
            />
            <p className="text-xs text-gray-500 mt-1">Display name for recipients</p>
          </div>
        </div>

        {/* Security Options */}
        <div className="space-y-4">
          {hasUnsavedChanges && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>You have unsaved changes!</strong> Don't forget to save your configuration.
              </p>
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="active"
              checked={config.isActive || false}
              onChange={(e) => updateConfig('isActive', e.target.checked)}
              disabled={isSaving || isTesting}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-700">
              Enable email sending
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={handleTest}
            variant="outline"
            isLoading={isTesting}
            disabled={isSaving || isSendingTest || !config.host || !config.username}
            className="flex-1"
          >
            {isTesting ? 'Testing...' : '🔍 Test Connection'}
          </Button>
          
          <Button
            onClick={handleSave}
            isLoading={isSaving}
            disabled={isTesting || isSendingTest || !config.host || !config.username}
            className="flex-1"
          >
            {isSaving ? 'Saving...' : '💾 Save Configuration'}
          </Button>
        </div>

        {/* Test Email Section */}
        {config.isActive && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-3">📧 Send Test Email</h4>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <Input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Enter email to test (e.g., your-email@gmail.com)"
                  disabled={isSendingTest}
                />
              </div>
              <Button
                onClick={handleSendTestEmail}
                isLoading={isSendingTest}
                disabled={!testEmail || isSendingTest || isTesting || isSaving}
                variant="outline"
              >
                {isSendingTest ? 'Sending...' : '📤 Send Test Email'}
              </Button>
            </div>
            <p className="text-xs text-blue-700 mt-2">
              This will send a test email to verify your configuration is working correctly.
            </p>
          </div>
        )}

        {/* Help Text */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="text-sm font-medium text-green-900 mb-3">📧 Free Gmail Setup Guide:</h4>
          
          <div className="space-y-4 text-xs text-green-800 lg:text-sm">
            <div>
              <h5 className="font-medium mb-2">🔧 Quick Setup (Pre-configured for Gmail):</h5>
              <ol className="space-y-1 ml-4 list-decimal">
                <li><strong>Gmail Address:</strong> Enter your Gmail address (e.g., admin@gmail.com)</li>
                <li><strong>Enable 2FA:</strong> Go to Google Account → Security → 2-Step Verification</li>
                <li><strong>Generate App Password:</strong> Click the blue button above</li>
                <li><strong>Copy App Password:</strong> Paste the 16-character password</li>
                <li><strong>Test Connection:</strong> Click "Test Connection" button</li>
                <li><strong>Enable Sending:</strong> Check "Enable email sending"</li>
              </ol>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <h5 className="font-medium text-yellow-900 mb-1">📊 Free Gmail Limits:</h5>
              <ul className="space-y-1 ml-4 text-yellow-800">
                <li>• <strong>500 emails per day</strong> - Perfect for small practices</li>
                <li>• <strong>100 emails per hour</strong> - Rate limited</li>
                <li>• <strong>$0 cost</strong> - Completely free</li>
                <li>• <strong>Reliable delivery</strong> - High success rate</li>
              </ul>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <h5 className="font-medium text-red-900 mb-1">⚠️ Important Notes:</h5>
              <ul className="space-y-1 ml-4 text-red-800">
                <li>• Never use your regular Gmail password</li>
                <li>• App passwords are 16 characters without spaces</li>
                <li>• From Email must match your Gmail address</li>
                <li>• Test connection before enabling email sending</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
