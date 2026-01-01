'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/auth';
import { PatientNavigation } from '@/components/patient/PatientNavigation';
import { PatientStats } from '@/components/patient/PatientStats';
import { logger } from '@/lib/utils/logger';

interface User {
  id: number;
  email: string;
  role: string;
  formData?: any;
  createdAt: string;
}

export default function PatientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const userData = authService.getCurrentUser();
    if (!userData || userData.role !== 'patient') {
      logger.warn('Unauthorized access attempt to patient dashboard', { 
        role: userData?.role 
      });
      router.push('/login');
      return;
    }
    setUser(userData);
    setIsLoading(false);
  }, [router]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setTimeout(() => {
        router.push('/login');
      }, 500);
    } catch (error) {
      logger.warn('Logout error (ignored)', error);
      router.push('/login');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading patient dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const patientName = user.formData?.personalInfo?.firstName && user.formData?.personalInfo?.lastName
    ? `${user.formData.personalInfo.firstName} ${user.formData.personalInfo.lastName}`
    : 'Patient';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20 lg:pb-4">
      {/* Navigation */}
      <PatientNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userEmail={user.email}
        patientName={patientName}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="max-w-full mx-auto px-3 sm:px-4 lg:px-8 xl:px-12 py-4 sm:py-6 lg:py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Welcome Section */}
            <div className="text-center lg:text-left">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {patientName.split(' ')[0]}!
              </h2>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                Here&apos;s your health overview for today, {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            {/* Stats Cards */}
            <PatientStats />

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                <button 
                  onClick={() => setActiveTab('appointments')}
                  className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 sm:p-6 hover:from-blue-100 hover:to-blue-200 transition-all transform hover:scale-105 text-left"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-lg sm:text-xl">
                      📅
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">My Appointments</h4>
                      <p className="text-xs sm:text-sm text-gray-600">View and manage appointments</p>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => setActiveTab('prescriptions')}
                  className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 sm:p-6 hover:from-purple-100 hover:to-purple-200 transition-all transform hover:scale-105 text-left"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white text-lg sm:text-xl">
                      💊
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">My Prescriptions</h4>
                      <p className="text-xs sm:text-sm text-gray-600">View prescriptions and medicines</p>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => setActiveTab('profile')}
                  className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 sm:p-6 hover:from-green-100 hover:to-green-200 transition-all transform hover:scale-105 text-left"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-lg sm:text-xl">
                      👤
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">My Profile</h4>
                      <p className="text-xs sm:text-sm text-gray-600">View and update profile</p>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => setActiveTab('vitals')}
                  className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 sm:p-6 hover:from-orange-100 hover:to-orange-200 transition-all transform hover:scale-105 text-left"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white text-lg sm:text-xl">
                      🩺
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">My Vitals</h4>
                      <p className="text-xs sm:text-sm text-gray-600">View latest vitals and BMR</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Health Summary */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Health Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Latest Vitals */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm">
                      🩺
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm">Latest Vitals</h4>
                  </div>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weight:</span>
                      <span className="font-medium">--</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">BMI:</span>
                      <span className="font-medium">--</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="font-medium">--</span>
                    </div>
                  </div>
                </div>

                {/* Treatment Status */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-sm">
                      ✅
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm">Treatment Status</h4>
                  </div>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-green-600">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Doctor:</span>
                      <span className="font-medium">Dr. {user.formData?.doctorName || 'Assigned'}</span>
                    </div>
                  </div>
                </div>

                {/* Next Appointment */}
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white text-sm">
                      📅
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm">Next Appointment</h4>
                  </div>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">Not scheduled</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">--</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Recent Activity</h3>
              <div className="text-center py-6 sm:py-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl sm:text-2xl">📋</span>
                </div>
                <p className="text-gray-600 text-sm sm:text-base">No recent activity to display</p>
                <p className="text-gray-500 text-xs sm:text-sm mt-2">Your appointments and treatments will appear here</p>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder for other tabs */}
        {activeTab !== 'overview' && (
          <div className="text-center py-8 sm:py-12 lg:py-16">
            <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-24 lg:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl sm:text-2xl lg:text-4xl">🚧</span>
            </div>
            <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 mb-2">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} - Coming Soon
            </h3>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600">This section is under development.</p>
          </div>
        )}
      </main>
    </div>
  );
}
