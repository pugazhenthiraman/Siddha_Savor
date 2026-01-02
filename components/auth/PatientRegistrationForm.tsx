'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/lib/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { PATIENT_VALIDATION, GENDER_OPTIONS, OCCUPATION_OPTIONS, WORK_TYPE_OPTIONS, PATIENT_FORM_SECTIONS } from '@/lib/constants/patient';
import { authService } from '@/lib/services/auth';
import { InviteData } from '@/lib/types';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, FORM_LABELS, FORM_PLACEHOLDERS, VALIDATION_MESSAGES, REGISTRATION_LABELS } from '@/lib/constants/messages';
import { logger } from '@/lib/utils/logger';
import { calculateAge, formatAge } from '@/lib/utils/dateUtils';

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
    age: 0,
    gender: '',
    occupation: '',
    customOccupation: '',
    workType: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    emergencyContact: '',
    emergencyPhone: '',
    doctorID: initialDoctorID,
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });
  
  // Update doctorID when inviteData changes
  useEffect(() => {
    if (inviteData?.doctorUID && formData.doctorID !== inviteData.doctorUID) {
      setFormData(prev => ({ ...prev, doctorID: inviteData.doctorUID }));
    }
  }, [inviteData?.doctorUID]);

  // Calculate age when date of birth changes
  useEffect(() => {
    if (formData.dateOfBirth) {
      const calculatedAge = calculateAge(formData.dateOfBirth);
      setFormData(prev => ({ ...prev, age: calculatedAge }));
    }
  }, [formData.dateOfBirth]);
  
  const showDoctorIDField = true;
  const isDoctorIDEditable = !token || token === '' || inviteData?.allowManualDoctorID === true;

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
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
    
    if (!PATIENT_VALIDATION.EMAIL_REGEX.test(formData.email)) {
      error(VALIDATION_MESSAGES.INVALID_EMAIL);
      return false;
    }
    
    if (!formData.phone.trim()) {
      error(VALIDATION_MESSAGES.REQUIRED_PHONE);
      return false;
    }
    
    if (!PATIENT_VALIDATION.PHONE_REGEX.test(formData.phone.replace(/\s/g, ''))) {
      error(VALIDATION_MESSAGES.INVALID_PHONE);
      return false;
    }

    if (!formData.dateOfBirth.trim()) {
      error('Date of birth is required');
      return false;
    }

    if (!formData.gender.trim()) {
      error('Gender is required');
      return false;
    }

    if (!formData.address.trim()) {
      error('Address is required');
      return false;
    }

    if (!formData.city.trim()) {
      error('City is required');
      return false;
    }

    if (!formData.state.trim()) {
      error('State is required');
      return false;
    }

    if (!formData.pincode.trim()) {
      error('Pincode is required');
      return false;
    }

    if (!formData.emergencyContact.trim()) {
      error('Emergency contact name is required');
      return false;
    }

    if (!formData.emergencyPhone.trim()) {
      error('Emergency contact phone is required');
      return false;
    }

    if (!PATIENT_VALIDATION.PHONE_REGEX.test(formData.emergencyPhone.replace(/\s/g, ''))) {
      error('Please enter a valid emergency contact phone number');
      return false;
    }
    
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
    
    if (isDoctorIDEditable && !formData.doctorID.trim()) {
      error(ERROR_MESSAGES.DOCTOR_ID_REQUIRED);
      return false;
    }
    
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
      
      const response = token 
        ? await authService.registerPatient(token, formData)
        : await authService.registerPatientWithoutToken(formData);
      
      if (response.success) {
        success('Registration successful! Redirecting to login...');
        setTimeout(() => {
          router.push('/login?registered=true');
        }, 1500);
      } else {
        error(response.error || ERROR_MESSAGES.SOMETHING_WENT_WRONG);
      }
    } catch (err: any) {
      logger.error('Patient registration failed', err);
      // Show the actual error message from API, not generic network error
      const errorMessage = err.message || ERROR_MESSAGES.NETWORK_ERROR;
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

      <div className="bg-white rounded-2xl shadow-xl p-3 sm:p-4 md:p-6 lg:p-8 mx-2 sm:mx-0">
        <div className="text-center mb-4 sm:mb-6 lg:mb-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <span className="text-lg sm:text-xl md:text-2xl">👤</span>
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Patient Registration</h2>
          <p className="text-gray-600 mt-2 text-xs sm:text-sm md:text-base">Join our Siddha Ayurveda platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">{PATIENT_FORM_SECTIONS.PERSONAL}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.FIRST_NAME} *</label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder={FORM_PLACEHOLDERS.FIRST_NAME}
                  disabled={isSubmitting}
                  className="text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.LAST_NAME} *</label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder={FORM_PLACEHOLDERS.LAST_NAME}
                  disabled={isSubmitting}
                  className="text-sm sm:text-base"
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
                  className="text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.PHONE_NUMBER} *</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder={FORM_PLACEHOLDERS.PHONE}
                  disabled={isSubmitting}
                  className="text-sm sm:text-base"
                  pattern="[0-9]{10}"
                  maxLength={10}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.DATE_OF_BIRTH} *</label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  disabled={isSubmitting}
                  required
                  className="text-sm sm:text-base"
                />
                {formData.age > 0 && (
                  <p className="mt-1 text-sm text-green-600 font-medium">
                    Age: {formatAge(formData.age)}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.GENDER} *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base"
                  disabled={isSubmitting}
                  required
                >
                  <option value="">{REGISTRATION_LABELS.SELECT_GENDER}</option>
                  {GENDER_OPTIONS.map((gender) => (
                    <option key={gender.value} value={gender.value}>
                      {gender.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                <select
                  value={formData.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base"
                  disabled={isSubmitting}
                >
                  <option value="">Select Occupation</option>
                  {OCCUPATION_OPTIONS.map((occupation) => (
                    <option key={occupation.value} value={occupation.value}>
                      {occupation.label}
                    </option>
                  ))}
                </select>
                {formData.occupation === 'other' && (
                  <div className="mt-2">
                    <Input
                      value={formData.customOccupation || ''}
                      onChange={(e) => handleInputChange('customOccupation', e.target.value)}
                      placeholder="Please specify your occupation"
                      disabled={isSubmitting}
                      className="text-sm sm:text-base"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Work Type</label>
                <select
                  value={formData.workType}
                  onChange={(e) => handleInputChange('workType', e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base"
                  disabled={isSubmitting}
                >
                  <option value="">Select Work Type</option>
                  {WORK_TYPE_OPTIONS.map((workType) => (
                    <option key={workType.value} value={workType.value}>
                      {workType.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  This helps doctors plan your Siddha treatment based on your physical activity level
                </p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">{PATIENT_FORM_SECTIONS.CONTACT}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.ADDRESS}</label>
                <Input
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder={FORM_PLACEHOLDERS.ADDRESS}
                  disabled={isSubmitting}
                  className="text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.CITY}</label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder={FORM_PLACEHOLDERS.CITY}
                  disabled={isSubmitting}
                  className="text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.STATE}</label>
                <Input
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder={FORM_PLACEHOLDERS.STATE}
                  disabled={isSubmitting}
                  className="text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.PIN_CODE}</label>
                <Input
                  value={formData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  placeholder={FORM_PLACEHOLDERS.PIN_CODE}
                  disabled={isSubmitting}
                  className="text-sm sm:text-base"
                />
              </div>
            </div>
          </div>

          {/* Doctor ID Field */}
          {showDoctorIDField && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Doctor Information</h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div>
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
                      className={`text-sm sm:text-base ${!isDoctorIDEditable ? 'bg-gray-100 cursor-not-allowed pr-10' : ''}`}
                    />
                    {!isDoctorIDEditable && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    {isDoctorIDEditable 
                      ? 'Enter the Doctor ID provided by your doctor.'
                      : '✓ This Doctor ID is pre-filled from your invitation link and cannot be changed.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Contact */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">{PATIENT_FORM_SECTIONS.EMERGENCY}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.EMERGENCY_CONTACT_NAME} *</label>
                <Input
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  placeholder={FORM_PLACEHOLDERS.EMERGENCY_CONTACT_NAME}
                  disabled={isSubmitting}
                  required
                  className="text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{FORM_LABELS.EMERGENCY_CONTACT_PHONE} *</label>
                <Input
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  placeholder={FORM_PLACEHOLDERS.EMERGENCY_CONTACT_PHONE}
                  disabled={isSubmitting}
                  required
                  className="text-sm sm:text-base"
                  pattern="[0-9]{10}"
                  maxLength={10}
                />
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Account Security</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                    className="pr-10 text-sm sm:text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isSubmitting}
                  >
                    {showPassword ? '👁️‍🗨️' : '👁️'}
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
                    className="pr-10 text-sm sm:text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? '👁️‍🗨️' : '👁️'}
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
            className="w-full py-2 sm:py-3 text-base sm:text-lg"
          >
            {isSubmitting ? REGISTRATION_LABELS.SUBMITTING : REGISTRATION_LABELS.SUBMIT_BUTTON}
          </Button>
        </form>

        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            Already have an account? 
            <a href="/login" className="text-green-600 hover:underline ml-1">Sign in here</a>
          </p>
        </div>
      </div>
    </>
  );
}
