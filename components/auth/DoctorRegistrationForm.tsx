'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { useToast } from '@/lib/hooks/useToast';
import { Toast } from '@/components/ui/Toast';

interface DoctorRegistrationFormProps {
  token: string;
  inviteData: any;
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
    specialization: '',
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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    // Personal Information
    if (!formData.firstName.trim()) {
      error('Please enter your first name');
      return false;
    }
    
    if (!formData.lastName.trim()) {
      error('Please enter your last name');
      return false;
    }
    
    if (!formData.email.trim()) {
      error('Please enter your email address');
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      error('Please enter a valid email address');
      return false;
    }
    
    if (!formData.phone.trim()) {
      error('Please enter your phone number');
      return false;
    }
    
    // Mobile number validation
    const phoneRegex = /^[+]?[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      error('Please enter a valid phone number (10-15 digits)');
      return false;
    }
    
    // Professional Information
    if (!formData.medicalLicense.trim()) {
      error('Please enter your medical license number');
      return false;
    }
    
    if (!formData.specialization.trim()) {
      error('Please enter your specialization');
      return false;
    }
    
    // Password validation
    if (!formData.password) {
      error('Please create a password');
      return false;
    }
    
    if (formData.password.length < 8) {
      error('Password must be at least 8 characters long');
      return false;
    }
    
    if (!formData.confirmPassword) {
      error('Please confirm your password');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      error('Passwords do not match');
      return false;
    }
    
    if (!formData.termsAccepted) {
      error('Please accept the terms and conditions to continue');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/auth/register-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          ...formData
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        success('Registration successful! Please wait for admin approval.');
        setTimeout(() => {
          router.push('/login?registered=true');
        }, 2000);
      } else {
        error(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      error('Registration failed. Please check your connection and try again.');
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
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Doctor Registration</h2>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Join our Siddha Ayurveda network</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
          {/* Personal Information */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xs sm:text-sm font-bold mr-2 sm:mr-3">1</span>
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter your last name"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="doctor@example.com"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+91 9876543210"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200"
                  disabled={isSubmitting}
                >
                  <option value="" className="text-gray-500">Select Gender</option>
                  <option value="Male" className="text-gray-900">Male</option>
                  <option value="Female" className="text-gray-900">Female</option>
                  <option value="Other" className="text-gray-900">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm font-bold mr-3">2</span>
              Professional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Medical License Number *</label>
                <Input
                  value={formData.medicalLicense}
                  onChange={(e) => handleInputChange('medicalLicense', e.target.value)}
                  placeholder="e.g., BSMS/12345/2020"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialization *</label>
                <Input
                  value={formData.specialization}
                  onChange={(e) => handleInputChange('specialization', e.target.value)}
                  placeholder="e.g., Siddha Medicine, Panchakosha Chikitsa"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                <Input
                  type="number"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  placeholder="Years in Siddha practice"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Qualification</label>
                <Input
                  value={formData.qualification}
                  onChange={(e) => handleInputChange('qualification', e.target.value)}
                  placeholder="e.g., BSMS, MD(Siddha), PhD"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Practice Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm font-bold mr-3">3</span>
              Practice Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Clinic/Hospital Name</label>
                <Input
                  value={formData.clinicName}
                  onChange={(e) => handleInputChange('clinicName', e.target.value)}
                  placeholder="e.g., Siddha Wellness Center, Ayush Clinic"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Phone Number</label>
                <Input
                  value={formData.clinicNumber}
                  onChange={(e) => handleInputChange('clinicNumber', e.target.value)}
                  placeholder="e.g., +91 9876543210"
                  disabled={isSubmitting}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Address</label>
                <Input
                  value={formData.clinicAddress}
                  onChange={(e) => handleInputChange('clinicAddress', e.target.value)}
                  placeholder="Enter complete clinic address"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="e.g., Chennai, Coimbatore"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <Input
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="e.g., Tamil Nadu, Kerala"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code</label>
                <Input
                  value={formData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  placeholder="e.g., 600001"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm font-bold mr-3">4</span>
              Account Security
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Create a strong password"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Password must be at least 8 characters long and include letters and numbers.
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
                I agree to the <a href="#" className="text-green-600 hover:underline">Terms and Conditions</a> and 
                <a href="#" className="text-green-600 hover:underline ml-1">Privacy Policy</a>. 
                I confirm that all information provided is accurate and I have the right to practice medicine.
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
            {isSubmitting ? 'Submitting Registration...' : 'Complete Registration'}
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
