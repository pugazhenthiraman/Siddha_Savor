'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/auth';
import { DoctorNavigation } from '@/components/doctor/DoctorNavigation';
import { DoctorStats } from '@/components/doctor/DoctorStats';
import { PatientManagement } from '@/components/doctor/PatientManagement';
import { PatientInviteGenerator } from '@/components/doctor/PatientInviteGenerator';
import { PatientDetails } from '@/components/doctor/PatientDetails';
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
                Here's your practice overview for today, {new Date().toLocaleDateString('en-US', { 
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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

                <button 
                  onClick={() => setActiveTab('appointments')}
                  className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 hover:from-purple-100 hover:to-purple-200 transition-all transform hover:scale-105 text-left"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xl">
                      📅
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Appointments</h4>
                      <p className="text-sm text-gray-600">Schedule visits</p>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => setActiveTab('profile')}
                  className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl p-6 hover:from-indigo-100 hover:to-indigo-200 transition-all transform hover:scale-105 text-left"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-xl">
                      👤
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">My Profile</h4>
                      <p className="text-sm text-gray-600">Update information</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {[
                  { time: '10:30 AM', action: 'Patient consultation completed', patient: 'John Doe', type: 'success' },
                  { time: '09:15 AM', action: 'Diagnosis updated', patient: 'Sarah Smith', type: 'info' },
                  { time: '08:45 AM', action: 'New patient registered', patient: 'Mike Johnson', type: 'warning' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'info' ? 'bg-blue-500' : 'bg-yellow-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.patient}</p>
                    </div>
                    <div className="text-sm text-gray-500">{activity.time}</div>
                  </div>
                ))}
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

        {/* Placeholder for other tabs */}
        {!['overview', 'patients'].includes(activeTab) && (
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
    </div>
  );
}
