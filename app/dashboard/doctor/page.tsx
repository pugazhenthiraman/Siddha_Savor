'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/auth';
import { DoctorNavigation } from '@/components/doctor/DoctorNavigation';
import { DoctorStats } from '@/components/doctor/DoctorStats';
import { PatientManagement } from '@/components/doctor/PatientManagement';
import { PatientInviteGenerator } from '@/components/doctor/PatientInviteGenerator';
import { PatientDetails } from '@/components/doctor/PatientDetails';
import { ActivePatients } from '@/components/doctor/ActivePatients';
import { ProfileUpdateModal } from '@/components/ProfileUpdateModal';
import { Patient } from '@/lib/types';

interface User {
  id: number;
  email: string;
  role: string;
  doctorUID?: string;
  formData?: any;
  createdAt: string;
}

export default function DoctorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const userData = authService.getCurrentUser();
    if (!userData || userData.role !== 'doctor') {
      router.push('/login');
      return;
    }
    setUser(userData);
    setIsLoading(false);
  }, [router]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      // Show success message briefly before redirect
      setTimeout(() => {
        router.push('/login');
      }, 500);
    } catch (error) {
      // Even if logout fails, redirect to login
      console.warn('Logout error (ignored):', error);
      router.push('/login');
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctor dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const doctorName = user.formData?.personalInfo?.firstName && user.formData?.personalInfo?.lastName
    ? `${user.formData.personalInfo.firstName} ${user.formData.personalInfo.lastName}`
    : 'Doctor';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-16 lg:pb-0">
      {/* Navigation */}
      <DoctorNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userEmail={user.email}
        doctorName={doctorName}
        doctorUID={user.doctorUID || 'DOC-PENDING'}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="max-w-full mx-auto px-3 lg:px-8 xl:px-12 py-4 lg:py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6 lg:space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                Welcome back, Dr. {doctorName.split(' ')[0]}!
              </h2>
              <p className="text-sm lg:text-base text-gray-600">
                Here&apos;s your practice overview for today, {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <DoctorStats />

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <button
                  onClick={() => setActiveTab('patients')}
                  className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 hover:from-blue-100 hover:to-blue-200 transition-all transform hover:scale-105 text-left"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl">
                      👥
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">My Patients</h4>
                      <p className="text-sm text-gray-600">Manage patient records</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('patients')}
                  className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 hover:from-green-100 hover:to-green-200 transition-all transform hover:scale-105 text-left"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl">
                      ➕
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Add Patient</h4>
                      <p className="text-sm text-gray-600">Generate invite links</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="space-y-6 lg:space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Patient Management</h2>
              <p className="text-sm lg:text-base text-gray-600">Manage your patients, approvals, and treatments.</p>
            </div>

            <PatientInviteGenerator />
            <PatientManagement onPatientSelect={handlePatientSelect} />
          </div>
        )}

        {/* Active Patients Tab */}
        {activeTab === 'active-patients' && (
          <ActivePatients doctorUID={user.doctorUID || ''} />
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6 lg:space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Profile Information</h2>
              <p className="text-sm lg:text-base text-gray-600">Manage your profile and contact information.</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900">Personal Details</h3>
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                >
                  ✏️ Edit Profile
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-sm text-gray-900">
                    {doctorName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-sm text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <p className="text-sm text-gray-900">
                    {user.formData?.personalInfo?.phone || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <p className="text-sm text-gray-900">
                    {user.formData?.personalInfo?.dateOfBirth || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doctor UID</label>
                  <p className="text-sm text-gray-900">{user.doctorUID || 'Pending'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs will be implemented later */}
        {!['overview', 'patients', 'active-patients', 'profile'].includes(activeTab) && (
          <div className="text-center py-12 lg:py-16">
            <div className="w-16 h-16 lg:w-24 lg:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl lg:text-4xl">🚧</span>
            </div>
            <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} - Coming Soon
            </h3>
            <p className="text-sm lg:text-base text-gray-600">This section is under development.</p>
          </div>
        )}
      </main>

      {/* Patient Details Modal */}
      {selectedPatient && (
        <PatientDetails
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}

      {/* Profile Update Modal */}
      {showProfileModal && user && (
        <ProfileUpdateModal
          user={{
            id: user.id,
            email: user.email,
            role: 'doctor',
            formData: user.formData
          }}
          onClose={() => setShowProfileModal(false)}
          onUpdate={async () => {
            const userData = authService.getCurrentUser();
            if (userData) {
              setUser(userData);
            }
          }}
        />
      )}
    </div>
  );
}
