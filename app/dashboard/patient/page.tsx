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
      // Show success message briefly before redirect
      setTimeout(() => {
        router.push('/login');
      }, 500);
    } catch (error) {
      // Even if logout fails, redirect to login
      logger.warn('Logout error (ignored)', error);
      router.push('/login');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patient dashboard...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-16 lg:pb-0">
      {/* Navigation */}
      <PatientNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userEmail={user.email}
        patientName={patientName}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="max-w-full mx-auto px-3 lg:px-8 xl:px-12 py-4 lg:py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6 lg:space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {patientName.split(' ')[0]}!
              </h2>
              <p className="text-sm lg:text-base text-gray-600">
                Here's your health overview for today, {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <PatientStats />

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <button 
                  onClick={() => setActiveTab('appointments')}
                  className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 hover:from-blue-100 hover:to-blue-200 transition-all transform hover:scale-105 text-left"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl">
                      📅
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">My Appointments</h4>
                      <p className="text-sm text-gray-600">View and manage appointments</p>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => setActiveTab('prescriptions')}
                  className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 hover:from-purple-100 hover:to-purple-200 transition-all transform hover:scale-105 text-left"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xl">
                      💊
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">My Prescriptions</h4>
                      <p className="text-sm text-gray-600">View prescriptions and medicines</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-6">Recent Activity</h3>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📋</span>
                  </div>
                  <p className="text-gray-600">No recent activity to display</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder for other tabs */}
        {activeTab !== 'overview' && (
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
    </div>
  );
}
