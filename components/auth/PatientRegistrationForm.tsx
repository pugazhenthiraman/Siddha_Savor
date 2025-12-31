'use client';

import { useState, useEffect } from 'react';
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
  token?: string;
  inviteData?: InviteData & { allowManualDoctorID?: boolean };
}

export function PatientRegistrationForm({ token, inviteData }: PatientRegistrationFormProps) {
  const router = useRouter();
  const { toasts, removeToast, success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Initialize formData with inviteData if available
  const initialDoctorID = inviteData?.doctorUID || '';
  
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
    doctorID: initialDoctorID, // Pre-fill from invite or allow manual entry
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });
  
  // Update doctorID when inviteData changes (in case it loads asynchronously)
  useEffect(() => {
    if (inviteData?.doctorUID && formData.doctorID !== inviteData.doctorUID) {
      setFormData(prev => ({ ...prev, doctorID: inviteData.doctorUID }));
    }
  }, [inviteData?.doctorUID]);
  
  // Check if doctorID field should be shown and if it's editable
  // Always show the field, but:
  // - If there's a token (from doctor invite): show as read-only with pre-filled doctorID
  // - If no token (home page registration): show as editable for manual entry
  const showDoctorIDField = true; // Always show
  const isDoctorIDEditable = !token || token === '' || inviteData?.allowManualDoctorID === true;

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
    
    // Validate doctorID if required (when editable - no token or manual entry allowed)
    if (isDoctorIDEditable && !formData.doctorID.trim()) {
      error(ERROR_MESSAGES.DOCTOR_ID_REQUIRED);
      return false;
    }
    
    // If there's a token but no doctorID in formData, use the one from inviteData
    if (token && inviteData?.doctorUID && !formData.doctorID.trim()) {
      setFormData(prev => ({ ...prev, doctorID: inviteData.doctorUID }));
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      // If no token, register without token but with doctorID
      const response = token 
        ? await authService.registerPatient(token, formData)
        : await authService.registerPatientWithoutToken(formData);
      
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

          {/* Doctor ID Field - Always show, but editable only when no token */}
          {showDoctorIDField && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Doctor Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="doctorID" className="block text-sm font-medium text-gray-700 mb-2">
                    {FORM_LABELS.DOCTOR_ID} {isDoctorIDEditable ? '*' : ''}
                  </label>
                  <div className="relative">
                    <Input
                      id="doctorID"
                      value={formData.doctorID || inviteData?.doctorUID || ''}
                      onChange={(e) => {
                        if (isDoctorIDEditable) {
                          handleInputChange('doctorID', e.target.value.toUpperCase());
                        }
                      }}
                      placeholder={FORM_PLACEHOLDERS.DOCTOR_ID}
                      disabled={isSubmitting || !isDoctorIDEditable}
                      readOnly={!isDoctorIDEditable}
                      required={isDoctorIDEditable}
                      className={!isDoctorIDEditable ? 'bg-gray-100 cursor-not-allowed pr-10' : ''}
                      title={!isDoctorIDEditable ? 'Doctor ID is pre-filled from your invitation link' : 'Enter your doctor ID'}
                    />
                    {!isDoctorIDEditable && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    {isDoctorIDEditable 
                      ? 'Enter the Doctor ID provided by your doctor.'
                      : '✓ This Doctor ID is pre-filled from your invitation link and cannot be changed. You will be registered under this doctor.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

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
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.PASSWORD} *</label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder={FORM_PLACEHOLDERS.PASSWORD_CREATE}
                    disabled={isSubmitting}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                    disabled={isSubmitting}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.CONFIRM_PASSWORD} *</label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder={FORM_PLACEHOLDERS.PASSWORD_CONFIRM}
                    disabled={isSubmitting}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                    disabled={isSubmitting}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
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
