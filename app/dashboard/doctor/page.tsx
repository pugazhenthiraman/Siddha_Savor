'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/auth';

interface User {
  id: number;
  email: string;
  role: string;
  createdAt: string;
}

export default function DoctorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    await authService.logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Doctor Dashboard</h1>
                <p className="text-sm text-gray-500">Patient Care Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome, Doctor!</h2>
          <p className="text-gray-600">Manage your patients and appointments.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'My Patients', value: '0', color: 'bg-green-500', icon: '👥' },
            { title: 'Today\'s Appointments', value: '0', color: 'bg-blue-500', icon: '📅' },
            { title: 'Pending Reviews', value: '0', color: 'bg-yellow-500', icon: '📋' },
            { title: 'Completed Today', value: '0', color: 'bg-purple-500', icon: '✅' },
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                  {stat.icon}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Doctor Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
              <div className="text-center">
                <div className="text-3xl mb-2">👥</div>
                <p className="font-medium text-gray-900">My Patients</p>
                <p className="text-sm text-gray-500">View and manage patient records</p>
              </div>
            </button>
            
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <div className="text-center">
                <div className="text-3xl mb-2">📅</div>
                <p className="font-medium text-gray-900">Appointments</p>
                <p className="text-sm text-gray-500">Schedule and manage appointments</p>
              </div>
            </button>
            
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
              <div className="text-center">
                <div className="text-3xl mb-2">💊</div>
                <p className="font-medium text-gray-900">Prescriptions</p>
                <p className="text-sm text-gray-500">Create and manage prescriptions</p>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
