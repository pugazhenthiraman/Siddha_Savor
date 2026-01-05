'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DoctorRegistrationForm } from '@/components/auth/DoctorRegistrationForm';
import { PatientRegistrationForm } from '@/components/auth/PatientRegistrationForm';
import { Alert } from '@/components/ui/Alert';
import { logger } from '@/lib/utils/logger';

function RegisterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [inviteData, setInviteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      // Allow registration without token (for home page registration)
      // Show patient registration form with doctorID field
      setInviteData({ role: 'PATIENT', allowManualDoctorID: true });
      setLoading(false);
      return;
    }

    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await fetch(`/api/auth/validate-token?token=${token}`);
      const result = await response.json();

      if (result.success) {
        console.log('🔍 DEBUG: Register page received inviteData:', {
          role: result.data.role,
          createdBy: result.data.createdBy,
          doctorUID: result.data.doctorUID,
          hasDoctorUID: 'doctorUID' in result.data
        });
        setInviteData(result.data);
        logger.info('Token validated successfully', { role: result.data.role });
      } else {
        setError(result.error || 'Invalid or expired registration link.');
      }
    } catch (error) {
      logger.error('Token validation error', error);
      setError('Failed to validate registration link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating registration link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="error" message={error} className="mb-6" />
          <div className="text-center">
            <button
              onClick={() => router.push('/')}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Siddha Savor Healthcare
          </h1>
          <p className="text-gray-600">
            Complete your {inviteData?.role?.toLowerCase()} registration
          </p>
        </div>

        {/* Registration Form */}
        <div className="max-w-2xl mx-auto">
          {inviteData?.role === 'DOCTOR' ? (
            <DoctorRegistrationForm 
              token={token!} 
              inviteData={inviteData}
            />
          ) : (
            <PatientRegistrationForm 
              token={token || undefined} 
              inviteData={inviteData}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function RegisterFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading registration...</p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterContent />
    </Suspense>
  );
}
