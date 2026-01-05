'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/lib/hooks/useToast';

interface ProfileUpdateModalProps {
  user: {
    id: number;
    email: string;
    role: 'doctor' | 'patient';
    formData?: any;
  };
  onClose: () => void;
  onUpdate: () => void;
}

export function ProfileUpdateModal({ user, onClose, onUpdate }: ProfileUpdateModalProps) {
  const { success, error } = useToast();
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.formData?.personalInfo?.phone || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [emailChanged, setEmailChanged] = useState(false);

  useEffect(() => {
    setEmailChanged(email.toLowerCase() !== user.email.toLowerCase());
  }, [email, user.email]);

  const handleSendVerificationCode = async () => {
    if (!email || !email.includes('@')) {
      error('Please enter a valid email address');
      return;
    }

    setIsSendingCode(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (data.success) {
        success('Verification code sent to your email');
        setShowEmailVerification(true);
      } else {
        error(data.error || 'Failed to send verification code');
      }
    } catch (err) {
      error('Failed to send verification code');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      error('Please enter a valid 6-digit code');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode })
      });

      const data = await response.json();
      if (data.success) {
        success('Email verified successfully');
        await handleUpdateProfile();
      } else {
        error(data.error || 'Invalid verification code');
      }
    } catch (err) {
      error('Failed to verify code');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      const endpoint = user.role === 'doctor' 
        ? `/api/doctor/profile/update`
        : `/api/patient/profile/update`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: emailChanged ? email : undefined,
          phone: phone || undefined,
          verificationCode: emailChanged && showEmailVerification ? verificationCode : undefined
        })
      });

      const data = await response.json();
      if (data.success) {
        success('Profile updated successfully');
        
        // Update localStorage with new email if changed
        if (emailChanged) {
          try {
            const currentUserStr = localStorage.getItem('siddha_user');
            if (currentUserStr) {
              const currentUser = JSON.parse(currentUserStr);
              currentUser.email = email.toLowerCase();
              localStorage.setItem('siddha_user', JSON.stringify(currentUser));
            }
          } catch (e) {
            console.error('Failed to update localStorage:', e);
          }
        }
        
        onUpdate();
        onClose();
      } else {
        error(data.error || 'Failed to update profile');
      }
    } catch (err) {
      error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (emailChanged) {
      // If email changed, require verification
      if (!showEmailVerification) {
        await handleSendVerificationCode();
        return;
      }
      if (!verificationCode) {
        error('Please enter verification code');
        return;
      }
      await handleVerifyCode();
    } else {
      // Just update phone if email didn't change
      await handleUpdateProfile();
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={onClose}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    ✏️ Update Profile
                  </h1>
                  <p className="text-sm text-gray-600">Update your contact information</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                  {emailChanged && !showEmailVerification && (
                    <button
                      type="button"
                      onClick={handleSendVerificationCode}
                      disabled={isSendingCode}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSendingCode ? 'Sending...' : 'Verify Email'}
                    </button>
                  )}
                </div>
                {emailChanged && (
                  <p className="mt-2 text-sm text-blue-600">
                    Email changed. Verification code will be sent to the new email address.
                  </p>
                )}
              </div>

              {/* Email Verification Code */}
              {showEmailVerification && emailChanged && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-blue-900 mb-2">
                    Verification Code *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleSendVerificationCode}
                      disabled={isSendingCode}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {isSendingCode ? 'Sending...' : 'Resend'}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-blue-700">
                    Check your email for the verification code. Code expires in 15 minutes.
                  </p>
                </div>
              )}

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter phone number"
                />
              </div>

              {/* Read-only Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Name
                  </label>
                  <p className="text-sm text-gray-900">
                    {user.formData?.personalInfo?.firstName || ''} {user.formData?.personalInfo?.lastName || ''}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Date of Birth
                  </label>
                  <p className="text-sm text-gray-900">
                    {user.formData?.personalInfo?.dateOfBirth || 'Not provided'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={isUpdating || isVerifying}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isUpdating || isVerifying || isSendingCode}
                >
                  {isUpdating || isVerifying ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

