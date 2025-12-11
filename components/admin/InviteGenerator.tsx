'use client';

import { useState } from 'react';
import { adminService } from '@/lib/services/adminService';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

export function InviteGenerator() {
  const [selectedRole, setSelectedRole] = useState<'DOCTOR' | 'PATIENT'>('DOCTOR');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateInvite = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminService.createInvite(selectedRole);
      if (response.success && response.data) {
        const baseUrl = window.location.origin;
        const inviteUrl = `${baseUrl}/register?token=${response.data.token}&role=${selectedRole.toLowerCase()}`;
        setGeneratedLink(inviteUrl);
      }
    } catch (error) {
      setError('Failed to generate invite link');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (generatedLink) {
      try {
        await navigator.clipboard.writeText(generatedLink);
        // You could add a toast notification here
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-xl">🔗</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Generate Invite Link</h3>
          <p className="text-sm text-gray-600">Create registration links for new users</p>
        </div>
      </div>

      {error && <Alert variant="error" message={error} className="mb-4" />}

      {/* Role Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select User Role
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setSelectedRole('DOCTOR')}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              selectedRole === 'DOCTOR'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">👨‍⚕️</div>
              <p className="font-medium">Doctor</p>
              <p className="text-xs text-gray-500">Medical Professional</p>
            </div>
          </button>
          
          <button
            onClick={() => setSelectedRole('PATIENT')}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              selectedRole === 'PATIENT'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🏥</div>
              <p className="font-medium">Patient</p>
              <p className="text-xs text-gray-500">Healthcare Recipient</p>
            </div>
          </button>
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerateInvite}
        isLoading={isLoading}
        className="w-full mb-4"
        size="lg"
      >
        {isLoading ? 'Generating...' : `Generate ${selectedRole} Invite Link`}
      </Button>

      {/* Generated Link Display */}
      {generatedLink && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Generated Invite Link
            </label>
            <span className="text-xs text-green-600 font-medium">✅ Ready to Share</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={generatedLink}
              readOnly
              className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-mono"
            />
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
              className="shrink-0"
            >
              📋 Copy
            </Button>
          </div>
          
          <div className="mt-3 text-xs text-gray-500">
            <p>• This link expires in 7 days</p>
            <p>• Share this link with the intended {selectedRole.toLowerCase()}</p>
            <p>• The link can only be used once</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-3">
          <button className="p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <div className="text-sm font-medium text-gray-900">📧 Email Invite</div>
            <div className="text-xs text-gray-500">Send via email</div>
          </button>
          <button className="p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <div className="text-sm font-medium text-gray-900">📱 SMS Invite</div>
            <div className="text-xs text-gray-500">Send via SMS</div>
          </button>
        </div>
      </div>
    </div>
  );
}
