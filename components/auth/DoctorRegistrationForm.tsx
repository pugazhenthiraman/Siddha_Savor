'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { useToast } from '@/lib/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { DOCTOR_VALIDATION, GENDER_OPTIONS, SIDDHA_QUALIFICATIONS, DOCTOR_FORM_SECTIONS } from '@/lib/constants/doctor';
import { authService } from '@/lib/services/auth';
import { InviteData } from '@/lib/types';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, FORM_LABELS, FORM_PLACEHOLDERS, VALIDATION_MESSAGES, REGISTRATION_LABELS } from '@/lib/constants/messages';
import { logger } from '@/lib/utils/logger';

interface DoctorRegistrationFormProps {
  token: string;
  inviteData: InviteData;
}

export function DoctorRegistrationForm({ token, inviteData }: DoctorRegistrationFormProps) {
  const router = useRouter();
  const { toasts, removeToast, success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: inviteData?.recipientEmail || '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    
    // Professional Information
    medicalLicense: '',
    experience: '',
    qualification: '',
    
    // Practice Information
    clinicName: '',
    clinicNumber: '',
    clinicAddress: '',
    city: '',
    state: '',
    pincode: '',
    
    // Account Security
    password: '',
    confirmPassword: '',
    
    // Agreement
    termsAccepted: false,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    // Handle number-only fields
    if (field === 'phone' || field === 'clinicNumber' || field === 'pincode') {
      if (typeof value === 'string') {
        // Only allow digits
        value = value.replace(/\D/g, '');
      }
    }
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
    if (!DOCTOR_VALIDATION.EMAIL_REGEX.test(formData.email)) {
      error(VALIDATION_MESSAGES.INVALID_EMAIL);
      return false;
    }
    
    if (!formData.phone.trim()) {
      error(VALIDATION_MESSAGES.REQUIRED_PHONE);
      return false;
    }
    
    // Mobile number validation
    if (!DOCTOR_VALIDATION.PHONE_REGEX.test(formData.phone.replace(/\s/g, ''))) {
      error(VALIDATION_MESSAGES.INVALID_PHONE);
      return false;
    }
    
    // Professional Information
    if (!formData.medicalLicense.trim()) {
      error(VALIDATION_MESSAGES.REQUIRED_MEDICAL_LICENSE);
      return false;
    }
    
    if (!formData.qualification.trim()) {
      error(VALIDATION_MESSAGES.REQUIRED_QUALIFICATION);
      return false;
    }
    
    // Password validation
    if (!formData.password) {
      error(VALIDATION_MESSAGES.REQUIRED_PASSWORD);
      return false;
    }
    
    if (formData.password.length < DOCTOR_VALIDATION.PASSWORD_MIN_LENGTH) {
      error(VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH(DOCTOR_VALIDATION.PASSWORD_MIN_LENGTH));
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
      
      const response = await authService.registerDoctor(token, formData);
      
      if (response.success) {
        success('Registration successful! Redirecting to login...');
        setTimeout(() => {
          router.push('/login?registered=true');
        }, 1500);
      } else {
        error(response.error || ERROR_MESSAGES.SOMETHING_WENT_WRONG);
      }
    } catch (err: any) {
      logger.error('Doctor registration failed', err);
      // Extract error message from ApiException or use generic error
      const errorMessage = err?.message || err?.error || ERROR_MESSAGES.NETWORK_ERROR;
      error(errorMessage);
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
            <span className="text-xl sm:text-2xl">👨‍⚕️</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{REGISTRATION_LABELS.DOCTOR_TITLE}</h2>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">{REGISTRATION_LABELS.DOCTOR_SUBTITLE}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
          {/* Personal Information */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xs sm:text-sm font-bold mr-2 sm:mr-3">1</span>
              {DOCTOR_FORM_SECTIONS.PERSONAL}
            </h3>
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
                  placeholder={FORM_PLACEHOLDERS.EMAIL_DOCTOR}
                  disabled={isSubmitting || !!inviteData?.recipientEmail}
                  className={inviteData?.recipientEmail ? 'bg-gray-50 cursor-not-allowed' : ''}
                />
                {inviteData?.recipientEmail && (
                  <p className="mt-1 text-xs text-gray-500">
                    Email is pre-filled from your invitation link and cannot be changed
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.PHONE_NUMBER} *</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder={FORM_PLACEHOLDERS.PHONE}
                  disabled={isSubmitting}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength={10}
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
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.GENDER}</label>
                <select
                  id="gender"
                  title="Select gender"
                  aria-label="Select gender"
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200"
                  style={{ color: '#111827' }}
                  disabled={isSubmitting}
                >
                  <option value="" style={{ color: '#6b7280' }}>{REGISTRATION_LABELS.SELECT_GENDER}</option>
                  {GENDER_OPTIONS.map((gender) => (
                    <option key={gender.value} value={gender.value} style={{ color: '#111827' }}>
                      {gender.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm font-bold mr-3">2</span>
              {DOCTOR_FORM_SECTIONS.PROFESSIONAL}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.MEDICAL_LICENSE_NUMBER} *</label>
                <Input
                  value={formData.medicalLicense}
                  onChange={(e) => handleInputChange('medicalLicense', e.target.value)}
                  placeholder={FORM_PLACEHOLDERS.MEDICAL_LICENSE}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="qualification" className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.SIDDHA_QUALIFICATION} *</label>
                <select
                  id="qualification"
                  title="Select Siddha qualification"
                  aria-label="Select Siddha qualification"
                  value={formData.qualification}
                  onChange={(e) => handleInputChange('qualification', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200"
                  style={{ color: '#111827' }}
                  disabled={isSubmitting}
                  required
                >
                  <option value="" style={{ color: '#6b7280' }}>{REGISTRATION_LABELS.SELECT_QUALIFICATION}</option>
                  {SIDDHA_QUALIFICATIONS.map((qual) => (
                    <option key={qual.value} value={qual.value} style={{ color: '#111827' }}>
                      {qual.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.YEARS_OF_EXPERIENCE}</label>
                <Input
                  type="number"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  placeholder={FORM_PLACEHOLDERS.EXPERIENCE}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Practice Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm font-bold mr-3">3</span>
              {DOCTOR_FORM_SECTIONS.PRACTICE}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.CLINIC_NAME}</label>
                <Input
                  value={formData.clinicName}
                  onChange={(e) => handleInputChange('clinicName', e.target.value)}
                  placeholder={FORM_PLACEHOLDERS.CLINIC_NAME}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.CLINIC_PHONE}</label>
                <Input
                  type="tel"
                  value={formData.clinicNumber}
                  onChange={(e) => handleInputChange('clinicNumber', e.target.value)}
                  placeholder={FORM_PLACEHOLDERS.CLINIC_PHONE}
                  disabled={isSubmitting}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength={10}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.CLINIC_ADDRESS}</label>
                <Input
                  value={formData.clinicAddress}
                  onChange={(e) => handleInputChange('clinicAddress', e.target.value)}
                  placeholder={FORM_PLACEHOLDERS.CLINIC_ADDRESS}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.CITY}</label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder={FORM_PLACEHOLDERS.CITY_CLINIC}
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
                  type="tel"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  placeholder={FORM_PLACEHOLDERS.PIN_CODE}
                  disabled={isSubmitting}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength={6}
                />
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm font-bold mr-3">4</span>
              {DOCTOR_FORM_SECTIONS.SECURITY}
            </h3>
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
            <p className="text-xs text-gray-500 mt-2">
              {REGISTRATION_LABELS.PASSWORD_REQUIREMENTS}
            </p>
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
                {REGISTRATION_LABELS.TERMS_CONFIRMATION}
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
            {REGISTRATION_LABELS.ALREADY_HAVE_ACCOUNT} 
            <a href="/login" className="text-green-600 hover:underline ml-1">{REGISTRATION_LABELS.SIGN_IN_LINK}</a>
          </p>
        </div>
      </div>
    </>
  );
}
