'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/auth';
import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { DoctorApprovals } from '@/components/admin/DoctorApprovals';
import { InviteGenerator } from '@/components/ui/InviteGenerator';
import { SMTPSettings } from '@/components/admin/SMTPSettings';

interface User {
  id: number;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const userData = authService.getCurrentUser();
    if (!userData || userData.role !== 'admin') {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-16 lg:pb-0">
      {/* Navigation */}
      <AdminNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userEmail={user.email}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="max-w-full mx-auto px-3 lg:px-8 xl:px-12 py-4 lg:py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6 lg:space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
              <p className="text-sm lg:text-base text-gray-600">Monitor your healthcare platform's key metrics and activities.</p>
            </div>
            
            <DashboardStats />

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 lg:gap-6 xl:gap-8">
              <button 
                onClick={() => setActiveTab('approvals')}
                className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all transform hover:scale-105 text-left lg:rounded-2xl lg:p-6"
              >
                <div className="flex items-center space-x-3 lg:space-x-4">
                  <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-white text-lg lg:w-12 lg:h-12 lg:rounded-xl lg:text-xl">
                    ⏳
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm lg:text-base">Review Doctors</h3>
                    <p className="text-xs text-gray-600 truncate lg:text-sm">Approve pending applications</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => setActiveTab('invites')}
                className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all transform hover:scale-105 text-left lg:rounded-2xl lg:p-6"
              >
                <div className="flex items-center space-x-3 lg:space-x-4">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white text-lg lg:w-12 lg:h-12 lg:rounded-xl lg:text-xl">
                    🔗
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm lg:text-base">Generate Invites</h3>
                    <p className="text-xs text-gray-600 truncate lg:text-sm">Create registration links</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => setActiveTab('doctors')}
                className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all transform hover:scale-105 text-left lg:rounded-2xl lg:p-6"
              >
                <div className="flex items-center space-x-3 lg:space-x-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white text-lg lg:w-12 lg:h-12 lg:rounded-xl lg:text-xl">
                    👥
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm lg:text-base">Manage Doctors</h3>
                    <p className="text-xs text-gray-600 truncate lg:text-sm">View all medical professionals</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => setActiveTab('patients')}
                className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all transform hover:scale-105 text-left lg:rounded-2xl lg:p-6"
              >
                <div className="flex items-center space-x-3 lg:space-x-4">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white text-lg lg:w-12 lg:h-12 lg:rounded-xl lg:text-xl">
                    🏥
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm lg:text-base">Manage Patients</h3>
                    <p className="text-xs text-gray-600 truncate lg:text-sm">View all registered patients</p>
                  </div>
                </div>
              </button>

              <button className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all transform hover:scale-105 text-left lg:rounded-2xl lg:p-6">
                <div className="flex items-center space-x-3 lg:space-x-4">
                  <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-lg lg:w-12 lg:h-12 lg:rounded-xl lg:text-xl">
                    📊
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm lg:text-base">Analytics</h3>
                    <p className="text-xs text-gray-600 truncate lg:text-sm">View detailed reports</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Doctor Approvals Tab */}
        {activeTab === 'approvals' && (
          <div className="space-y-4 lg:space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Doctor Approvals</h2>
              <p className="text-sm lg:text-base text-gray-600">Review and approve doctor registration applications.</p>
            </div>
            <DoctorApprovals />
          </div>
        )}

        {/* Generate Invites Tab */}
        {activeTab === 'invites' && (
          <div className="space-y-4 lg:space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Generate Invite Links</h2>
              <p className="text-sm lg:text-base text-gray-600">Create secure registration links for doctors and patients.</p>
            </div>
            <div className="max-w-2xl mx-auto lg:mx-0">
              <InviteGenerator
                title="Create Registration Links"
                description="Generate secure invite links for new users to join the platform"
                defaultRole="DOCTOR"
                onLinkGenerated={(link, role) => {
                  logger.info(`Generated ${role} invite`, { link });
                }}
              />
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-4 lg:space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">System Settings</h2>
              <p className="text-sm lg:text-base text-gray-600">Configure SMTP and other system settings.</p>
            </div>
            <div className="max-w-4xl mx-auto lg:mx-0">
              <SMTPSettings />
            </div>
          </div>
        )}

        {/* Placeholder for other tabs */}
        {(activeTab === 'doctors' || activeTab === 'patients') && (
          <div className="text-center py-12 lg:py-16">
            <div className="w-16 h-16 lg:w-24 lg:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl lg:text-4xl">🚧</span>
            </div>
            <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-sm lg:text-base text-gray-600">This section is under development.</p>
          </div>
        )}
      </main>
    </div>
  );
}
