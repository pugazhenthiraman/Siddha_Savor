'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/auth';
import { MealTracker } from '@/components/MealTracker';
import { ThegiCard } from '@/components/ThegiCard';
import { ProfileUpdateModal } from '@/components/ProfileUpdateModal';

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
  const [mealHistory, setMealHistory] = useState<any[]>([]);
  const [dietPlanData, setDietPlanData] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
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
      const [statsResponse, mealsResponse, mealHistoryResponse] = await Promise.all([
        fetch(`/api/patient/stats?patientId=${patientId}`),
        fetch(`/api/patient/meals?patientId=${patientId}&date=${new Date().toISOString().split('T')[0]}`),
        fetch(`/api/doctor/patients/${patientId}/meal-history`)
      ]);
      
      const statsData = await statsResponse.json();
      const mealsData = await mealsResponse.json();
      const mealHistoryData = await mealHistoryResponse.json();
      
      if (statsData.success) {
        setStats(statsData.stats);
        // Load diet plan if diagnosis is available
        if (statsData.stats?.diagnosis) {
          try {
            const dietPlanResponse = await fetch(`/api/doctor/patients/${patientId}/diet-plan`);
            const dietPlanData = await dietPlanResponse.json();
            if (dietPlanData.success && dietPlanData.data?.dietPlan) {
              setDietPlanData(dietPlanData.data.dietPlan);
            }
          } catch (e) {
            // Ignore error
          }
        }
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

      if (mealHistoryData.success) {
        setMealHistory(mealHistoryData.data || []);
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
                { id: 'history', label: 'Full History', icon: '📋' },
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

          {/* (Health Progress chart removed as requested) */}
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

        {activeTab === 'history' && (
          <div className="space-y-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">🍽️ Meal History</h3>
            
            {mealHistory.length > 0 ? (
              <div className="space-y-4">
                {mealHistory.map((dayMeals: any, index: number) => {
                  const mealDate = new Date(dayMeals.date);
                  const dayOfWeek = mealDate.getDay() === 0 ? 7 : mealDate.getDay();
                  const dayPlan = dietPlanData?.days?.[dayOfWeek - 1] || null;
                  const mealTypes = ['breakfast', 'lunch', 'dinner'];
                  const mealIcons = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' };

                  return (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {mealDate.toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {dayPlan ? `${dayPlan.meals?.breakfast?.length || 0} breakfast items, ${dayPlan.meals?.lunch?.length || 0} lunch items, ${dayPlan.meals?.dinner?.length || 0} dinner items` : 'Diet plan details'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {mealTypes.map((mealType) => {
                            const status = dayMeals[mealType];
                            const isCompleted = status === 'completed';
                            return (
                              <div
                                key={mealType}
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  isCompleted ? 'bg-green-100' : status === 'pending' ? 'bg-red-100' : 'bg-gray-100'
                                }`}
                                title={`${mealType}: ${isCompleted ? 'Completed' : status === 'pending' ? 'Pending' : 'Not tracked'}`}
                              >
                                <span className="text-xs">{mealIcons[mealType as keyof typeof mealIcons]}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {mealTypes.map((mealType) => {
                          const status = dayMeals[mealType];
                          const isCompleted = status === 'completed';
                          const mealItems = dayPlan?.meals?.[mealType as keyof typeof dayPlan.meals] || [];

                          return (
                            <div
                              key={mealType}
                              className={`${
                                mealType === 'breakfast' ? 'bg-orange-50 border-orange-200' :
                                mealType === 'lunch' ? 'bg-yellow-50 border-yellow-200' :
                                'bg-purple-50 border-purple-200'
                              } border-2 rounded-lg p-4 ${
                                isCompleted ? 'border-green-300' : status === 'pending' ? 'border-red-300' : 'border-gray-200'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h5 className={`font-semibold flex items-center ${
                                  mealType === 'breakfast' ? 'text-orange-900' :
                                  mealType === 'lunch' ? 'text-yellow-900' :
                                  'text-purple-900'
                                }`}>
                                  <span className="mr-2">{mealIcons[mealType as keyof typeof mealIcons]}</span>
                                  {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                                </h5>
                                <span
                                  className={`text-xs font-medium px-2 py-1 rounded ${
                                    isCompleted
                                      ? 'bg-green-100 text-green-700'
                                      : status === 'pending'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {isCompleted ? '✓ Completed' : status === 'pending' ? '✗ Pending' : 'Not tracked'}
                                </span>
                              </div>
                              {mealItems.length > 0 ? (
                                <ul className="space-y-1 mt-2">
                                  {mealItems.map((item: string, idx: number) => (
                                    <li key={idx} className={`text-sm ${
                                      mealType === 'breakfast' ? 'text-orange-800' :
                                      mealType === 'lunch' ? 'text-yellow-800' :
                                      'text-purple-800'
                                    }`}>
                                      • {item}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-gray-500 mt-2">No items planned</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🍽️</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No meal history</h3>
                <p className="text-gray-500">You haven't tracked any meals yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
              <button
                onClick={() => setShowProfileModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              >
                ✏️ Edit Profile
              </button>
            </div>
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

      {/* Profile Update Modal */}
      {showProfileModal && user && (
        <ProfileUpdateModal
          user={{
            id: user.id,
            email: user.email,
            role: 'patient',
            formData: user.formData
          }}
          onClose={() => setShowProfileModal(false)}
          onUpdate={async () => {
            const userData = authService.getCurrentUser();
            if (userData) {
              setUser(userData);
              await fetchPatientStats(userData.id);
            }
          }}
        />
      )}
    </div>
  );
}
