'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/auth';
import { MealTracker } from '@/components/MealTracker';
import { ThegiCard } from '@/components/ThegiCard';
import { PatientHealthChart } from '@/components/PatientHealthChart';

interface User {
  id: number;
  email: string;
  role: string;
  formData?: any;
}

interface PatientStats {
  doctorName: string;
  bmr?: number;
  tdee?: number;
  weight?: number;
  diagnosis?: string;
  thegi?: string;
  lastUpdated?: string;
}

interface TodayMealStatus {
  breakfast: 'completed' | 'pending' | null;
  lunch: 'completed' | 'pending' | null;
  dinner: 'completed' | 'pending' | null;
}

export default function PatientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<PatientStats | null>(null);
  const [todayMeals, setTodayMeals] = useState<TodayMealStatus>({
    breakfast: null,
    lunch: null,
    dinner: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      const userData = authService.getCurrentUser();
      if (!userData || userData.role !== 'patient') {
        router.push('/login');
        return;
      }
      setUser(userData);
      await fetchPatientStats(userData.id);
    };
    initializeUser();
  }, [router]);

  const fetchPatientStats = async (patientId: number) => {
    try {
      const [statsResponse, mealsResponse] = await Promise.all([
        fetch(`/api/patient/stats?patientId=${patientId}`),
        fetch(`/api/patient/meals?patientId=${patientId}&date=${new Date().toISOString().split('T')[0]}`)
      ]);
      
      const statsData = await statsResponse.json();
      const mealsData = await mealsResponse.json();
      
      if (statsData.success) {
        setStats(statsData.stats);
      }
      
      if (mealsData.success) {
        const mealStatus: TodayMealStatus = {
          breakfast: null,
          lunch: null,
          dinner: null
        };
        
        mealsData.data.forEach((meal: any) => {
          mealStatus[meal.mealType as keyof TodayMealStatus] = meal.status;
        });
        
        setTodayMeals(mealStatus);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  if (!user) return null;

  const patientName = user.formData?.personalInfo?.firstName 
    ? `${user.formData.personalInfo.firstName} ${user.formData.personalInfo.lastName || ''}`
    : 'Patient';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">{patientName.charAt(0)}</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Welcome, {patientName}</h1>
                <p className="text-sm text-gray-500">Patient Dashboard</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'diet', label: 'Diet Plan', icon: '🍽️' },
                { id: 'profile', label: 'Profile', icon: '👤' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Doctor Name */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">👨‍⚕️</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Your Doctor</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {stats?.doctorName || 'Not Assigned'}
                    </p>
                  </div>
                </div>
              </div>

              {/* BMR */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">BMR</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {stats?.bmr ? `${stats.bmr.toFixed(2)} MJ/day` : 'Not Available'}
                    </p>
                  </div>
                </div>
              </div>

              {/* TDEE */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🔥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">TDEE</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {stats?.tdee ? `${stats.tdee.toFixed(2)} MJ/day` : 'Not Available'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Weight */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">⚖️</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Weight</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {stats?.weight ? `${stats.weight} kg` : 'Not Available'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Diagnosis */}
            {stats?.diagnosis && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Diagnosis</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🩺</span>
                    <div>
                      <p className="text-lg font-semibold text-red-900">{stats.diagnosis}</p>
                      <p className="text-sm text-red-600">
                        Last updated: {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Thegi (Body Constitution) */}
            {stats?.thegi && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Body Constitution (Thegi)</h3>
                <ThegiCard thegi={stats.thegi} />
              </div>
            )}

            {/* Recent Updates */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Updates from Doctor</h3>
              <div className="space-y-4">
                {stats?.lastUpdated ? (
                  <div className="border-l-4 border-green-400 pl-4">
                    <p className="text-sm font-medium text-gray-900">Health Record Updated</p>
                    <p className="text-sm text-gray-600">
                      Your doctor updated your health information on {new Date(stats.lastUpdated).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">No recent updates from your doctor.</p>
                )}
              </div>
            </div>

            {/* Today's Meal Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Meal Status</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`text-center p-4 rounded-lg ${
                  todayMeals.breakfast === 'completed' ? 'bg-green-50 border-2 border-green-200' : 
                  todayMeals.breakfast === 'pending' ? 'bg-red-50 border-2 border-red-200' : 
                  'bg-orange-50 border border-orange-200'
                }`}>
                  <div className="text-2xl mb-2">🌅</div>
                  <div className="text-sm font-medium text-gray-700">Breakfast</div>
                  <div className="text-xs text-gray-500 mt-1">8:00 AM</div>
                  <div className={`text-xs font-medium mt-2 ${
                    todayMeals.breakfast === 'completed' ? 'text-green-600' :
                    todayMeals.breakfast === 'pending' ? 'text-red-600' :
                    'text-orange-600'
                  }`}>
                    {todayMeals.breakfast === 'completed' ? '✓ Completed' :
                     todayMeals.breakfast === 'pending' ? '✗ Not Eaten' :
                     'Not Tracked'}
                  </div>
                </div>
                <div className={`text-center p-4 rounded-lg ${
                  todayMeals.lunch === 'completed' ? 'bg-green-50 border-2 border-green-200' : 
                  todayMeals.lunch === 'pending' ? 'bg-red-50 border-2 border-red-200' : 
                  'bg-yellow-50 border border-yellow-200'
                }`}>
                  <div className="text-2xl mb-2">☀️</div>
                  <div className="text-sm font-medium text-gray-700">Lunch</div>
                  <div className="text-xs text-gray-500 mt-1">12:30 PM</div>
                  <div className={`text-xs font-medium mt-2 ${
                    todayMeals.lunch === 'completed' ? 'text-green-600' :
                    todayMeals.lunch === 'pending' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {todayMeals.lunch === 'completed' ? '✓ Completed' :
                     todayMeals.lunch === 'pending' ? '✗ Not Eaten' :
                     'Not Tracked'}
                  </div>
                </div>
                <div className={`text-center p-4 rounded-lg ${
                  todayMeals.dinner === 'completed' ? 'bg-green-50 border-2 border-green-200' : 
                  todayMeals.dinner === 'pending' ? 'bg-red-50 border-2 border-red-200' : 
                  'bg-purple-50 border border-purple-200'
                }`}>
                  <div className="text-2xl mb-2">🌙</div>
                  <div className="text-sm font-medium text-gray-700">Dinner</div>
                  <div className="text-xs text-gray-500 mt-1">8:00 PM</div>
                  <div className={`text-xs font-medium mt-2 ${
                    todayMeals.dinner === 'completed' ? 'text-green-600' :
                    todayMeals.dinner === 'pending' ? 'text-red-600' :
                    'text-purple-600'
                  }`}>
                    {todayMeals.dinner === 'completed' ? '✓ Completed' :
                     todayMeals.dinner === 'pending' ? '✗ Not Eaten' :
                     'Not Tracked'}
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-blue-600">
                  Go to Diet Plan tab to track your meals and mark them as eaten.
                </p>
              </div>
            </div>

            {/* Health Progress Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Health Progress</h3>
              <PatientHealthChart patientId={user.id} />
            </div>
          </div>
        )}

        {activeTab === 'diet' && (
          <div className="space-y-6">
            {stats?.diagnosis ? (
              <MealTracker 
                patientId={user.id} 
                diagnosis={stats.diagnosis}
                onMealUpdate={() => fetchPatientStats(user.id)}
              />
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-8">
                  <span className="text-4xl mb-4 block">📋</span>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Diagnosis Available</h3>
                  <p className="text-gray-600">
                    Please visit your doctor to get a diagnosis and receive your personalized diet plan.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-sm text-gray-900">{patientName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-sm text-gray-900">
                  {user.formData?.personalInfo?.phone || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <p className="mt-1 text-sm text-gray-900">
                  {user.formData?.personalInfo?.dateOfBirth || 'Not provided'}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
