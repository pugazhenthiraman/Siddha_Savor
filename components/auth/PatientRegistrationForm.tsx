'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/lib/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { PATIENT_VALIDATION, GENDER_OPTIONS, PATIENT_FORM_SECTIONS } from '@/lib/constants/patient';
import { authService } from '@/lib/services/auth';
import { InviteData } from '@/lib/types';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, FORM_LABELS, FORM_PLACEHOLDERS, VALIDATION_MESSAGES, REGISTRATION_LABELS } from '@/lib/constants/messages';
import { logger } from '@/lib/utils/logger';

interface PatientRegistrationFormProps {
  token: string;
  inviteData: InviteData;
}

export function PatientRegistrationForm({ token, inviteData }: PatientRegistrationFormProps) {
  const router = useRouter();
  const { toasts, removeToast, success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: inviteData?.recipientEmail || '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    emergencyContact: '',
    emergencyPhone: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    // Personal Information
    if (!formData.firstName.trim()) {
      error(VALIDATION_MESSAGES.REQUIRED_FIRST_NAME);
      return false;
    }
    
    if (!formData.lastName.trim()) {
      error(VALIDATION_MESSAGES.REQUIRED_LAST_NAME);
      return false;
    }
    
    if (!formData.email.trim()) {
      error(VALIDATION_MESSAGES.REQUIRED_EMAIL);
      return false;
    }
    
    // Email validation
    if (!PATIENT_VALIDATION.EMAIL_REGEX.test(formData.email)) {
      error(VALIDATION_MESSAGES.INVALID_EMAIL);
      return false;
    }
    
    if (!formData.phone.trim()) {
      error(VALIDATION_MESSAGES.REQUIRED_PHONE);
      return false;
    }
    
    // Mobile number validation
    if (!PATIENT_VALIDATION.PHONE_REGEX.test(formData.phone.replace(/\s/g, ''))) {
      error(VALIDATION_MESSAGES.INVALID_PHONE);
      return false;
    }
    
    // Password validation
    if (!formData.password) {
      error(VALIDATION_MESSAGES.REQUIRED_PASSWORD);
      return false;
    }
    
    if (formData.password.length < PATIENT_VALIDATION.PASSWORD_MIN_LENGTH) {
      error(VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH(PATIENT_VALIDATION.PASSWORD_MIN_LENGTH));
      return false;
    }
    
    if (!formData.confirmPassword) {
      error(VALIDATION_MESSAGES.REQUIRED_CONFIRM_PASSWORD);
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      error(VALIDATION_MESSAGES.PASSWORD_MISMATCH);
      return false;
    }
    
    if (!formData.termsAccepted) {
      error(VALIDATION_MESSAGES.REQUIRED_TERMS);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await authService.registerPatient(token, formData);
      
      if (response.success) {
        success(SUCCESS_MESSAGES.REGISTRATION_SUCCESS_PATIENT);
        setTimeout(() => {
          router.push('/login?registered=true');
        }, 2000);
      } else {
        error(response.error || ERROR_MESSAGES.SOMETHING_WENT_WRONG);
      }
    } catch (err) {
      logger.error('Patient registration failed', err);
      error(ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setIsSubmitting(false);
    }
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

      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
        <div className="text-center mb-6 lg:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-xl sm:text-2xl">👤</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Patient Registration</h2>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Join our Siddha Ayurveda platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{PATIENT_FORM_SECTIONS.PERSONAL}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.FIRST_NAME} *</label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder={FORM_PLACEHOLDERS.FIRST_NAME}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.LAST_NAME} *</label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder={FORM_PLACEHOLDERS.LAST_NAME}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.EMAIL_ADDRESS} *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder={FORM_PLACEHOLDERS.EMAIL_PATIENT}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.PHONE_NUMBER} *</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder={FORM_PLACEHOLDERS.PHONE}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.DATE_OF_BIRTH}</label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.GENDER}</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200"
                  disabled={isSubmitting}
                >
                  <option value="" className="text-gray-500">{REGISTRATION_LABELS.SELECT_GENDER}</option>
                  {GENDER_OPTIONS.map((gender) => (
                    <option key={gender.value} value={gender.value} className="text-gray-900">
                      {gender.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{PATIENT_FORM_SECTIONS.CONTACT}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.ADDRESS}</label>
                <Input
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder={FORM_PLACEHOLDERS.ADDRESS}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.CITY}</label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder={FORM_PLACEHOLDERS.CITY}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.STATE}</label>
                <Input
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder={FORM_PLACEHOLDERS.STATE}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.PIN_CODE}</label>
                <Input
                  value={formData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  placeholder={FORM_PLACEHOLDERS.PIN_CODE}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{PATIENT_FORM_SECTIONS.EMERGENCY}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.EMERGENCY_CONTACT_NAME}</label>
                <Input
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  placeholder={FORM_PLACEHOLDERS.EMERGENCY_CONTACT_NAME}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.EMERGENCY_CONTACT_PHONE}</label>
                <Input
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  placeholder={FORM_PLACEHOLDERS.EMERGENCY_CONTACT_PHONE}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Security</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.PASSWORD} *</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder={FORM_PLACEHOLDERS.PASSWORD_CREATE}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.CONFIRM_PASSWORD} *</label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder={FORM_PLACEHOLDERS.PASSWORD_CONFIRM}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={formData.termsAccepted}
                onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                disabled={isSubmitting}
              />
              <span className="text-sm text-gray-700">
                {REGISTRATION_LABELS.TERMS_TEXT} <a href="#" className="text-green-600 hover:underline">{REGISTRATION_LABELS.TERMS_LINK}</a> and 
                <a href="#" className="text-green-600 hover:underline ml-1">{REGISTRATION_LABELS.PRIVACY_LINK}</a>.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            className="w-full py-3 text-lg"
          >
            {isSubmitting ? REGISTRATION_LABELS.SUBMITTING : REGISTRATION_LABELS.SUBMIT_BUTTON}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account? 
            <a href="/login" className="text-green-600 hover:underline ml-1">Sign in here</a>
          </p>
        </div>
      </div>
    </>
  );
}
