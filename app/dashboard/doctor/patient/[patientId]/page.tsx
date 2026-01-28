'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/lib/hooks/useToast';
import { NewVitalsForm } from '@/components/doctor/NewVitalsForm';
import { PatientDietPlan } from '@/components/PatientDietPlan';
import { DietComplianceChart } from '@/components/DietComplianceChart';
import { DietPlanEditor } from '@/components/DietPlanEditor';
import { TDEEChart } from '@/components/doctor/TDEEChart';

interface PatientStats {
  bmr?: number;
  tdee?: number;
  lastWeight?: number;
  lastRecordedAt?: string;
}

interface DietStats {
  completedMeals: number;
  totalMeals: number;
  compliancePercentage: number;
}

interface DietEntry {
  id: number;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodItem: string;
  quantity: string;
  calories?: number;
  completed: boolean;
}

export default function PatientDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'vitals' | 'diet' | 'history'>('overview');
  const [patient, setPatient] = useState<any>(null);
  const [patientStats, setPatientStats] = useState<PatientStats>({});
  const [latestVitals, setLatestVitals] = useState<any>(null);
  const [vitalsHistory, setVitalsHistory] = useState<any[]>([]);
  const [dietEntries, setDietEntries] = useState<DietEntry[]>([]);
  const [dietStats, setDietStats] = useState<DietStats>({ completedMeals: 0, totalMeals: 0, compliancePercentage: 0 });
  const [mealHistory, setMealHistory] = useState<any[]>([]);
  const [dietPlanData, setDietPlanData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewVitals, setShowNewVitals] = useState(false);
  const [showDietEditor, setShowDietEditor] = useState(false);
  const [showWeeklyPlan, setShowWeeklyPlan] = useState(false);
  const [weeklyPlanData, setWeeklyPlanData] = useState<any>(null);
  const [showFullMealHistory, setShowFullMealHistory] = useState(false);
  const [fullMealHistory, setFullMealHistory] = useState<any[]>([]);
  const [showCuredConfirm, setShowCuredConfirm] = useState(false);
  const [isMarkingCured, setIsMarkingCured] = useState(false);

  // Helper function to add auth headers to fetch requests
  const getAuthHeaders = (): HeadersInit => {
    let authHeader = '';
    try {
      const userDataStr = localStorage.getItem('siddha_user');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        authHeader = `Bearer ${btoa(JSON.stringify({ id: userData.id, role: userData.role }))}`;
      }
    } catch (e) {
      console.error('Failed to get auth header:', e);
    }
    
    return {
      'Content-Type': 'application/json',
      ...(authHeader && { 'Authorization': authHeader })
    };
  };

  useEffect(() => {
    const loadData = async () => {
      if (params.patientId) {
        await fetchPatientData();
      }
    };
    loadData();
  }, [params.patientId]);

  const fetchPatientData = async () => {
    try {
      setIsLoading(true);
      const headers = getAuthHeaders();
      
      // Fetch patient details, vitals, diet data, and meal history in parallel
      const [patientResponse, vitalsResponse, dietResponse, mealHistoryResponse] = await Promise.all([
        fetch(`/api/doctor/patients/${params.patientId}`, { headers }),
        fetch(`/api/doctor/vitals?patientId=${params.patientId}`, { headers }),
        fetch(`/api/doctor/patients/${params.patientId}/diet-status`, { headers }),
        fetch(`/api/doctor/patients/${params.patientId}/meals`, { headers })
      ]);

      const patientData = await patientResponse.json();
      const vitalsData = await vitalsResponse.json();
      const dietData = await dietResponse.json();
      const mealHistoryData = await mealHistoryResponse.json();

      if (patientData.success) {
        setPatient(patientData.data);
      }

      if (vitalsData.success && vitalsData.vitals?.length > 0) {
        const vitals = vitalsData.vitals;
        setVitalsHistory(vitals);
        const latest = vitals[0];
        setLatestVitals(latest);
        setPatientStats({
          bmr: latest.bmr,
          tdee: latest.tdee,
          lastWeight: latest.weight,
          lastRecordedAt: latest.recordedAt
        });
      }

      // Set real diet data
      if (dietData.success) {
        const transformedEntries = dietData.data.dietEntries.map((entry: any) => ({
          id: entry.id,
          date: entry.date,
          mealType: entry.mealType,
          foodItem: entry.foodItems.join(', '),
          quantity: '1 serving',
          calories: entry.calories,
          completed: entry.completed
        }));
        setDietEntries(transformedEntries);
        setDietStats(dietData.data.stats);
      }

      // Set meal history
      if (mealHistoryData.success) {
        setMealHistory(mealHistoryData.data || []);
      }

      // Fetch diet plan for meal history display
      if (latestVitals?.diagnosis) {
        try {
          const dietPlanResponse = await fetch(`/api/doctor/patients/${params.patientId}/diet-plan`, { headers: getAuthHeaders() });
          const dietPlanResult = await dietPlanResponse.json();
          if (dietPlanResult.success && dietPlanResult.data?.dietPlan) {
            setDietPlanData(dietPlanResult.data.dietPlan);
          }
        } catch (e) {
          // Ignore error
        }
      }
      
    } catch (err) {
      error('Failed to load patient data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAge = () => {
    if (!patient?.formData?.personalInfo?.dateOfBirth) return 'N/A';
    const dob = new Date(patient.formData.personalInfo.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    return age;
  };

  const handleUpdateDietPlan = async () => {
    if (!latestVitals?.diagnosis) {
      error('No diagnosis found. Please record vitals first.');
      return;
    }
    
    try {
      const response = await fetch(`/api/doctor/patients/${params.patientId}/diet-plan`, { headers: getAuthHeaders() });
      const data = await response.json();
      
      if (data.success) {
        success('Diet plan updated successfully');
        setActiveTab('diet');
        // Refresh diet data
        fetchPatientData();
      } else {
        error(data.error || 'Failed to update diet plan');
      }
    } catch (err) {
      error('Failed to update diet plan');
    }
  };

  const handleViewWeeklyPlan = async () => {
    if (!latestVitals?.diagnosis) {
      error('No diagnosis found. Please record vitals first.');
      return;
    }
    
    try {
      const response = await fetch(`/api/doctor/patients/${params.patientId}/diet-plan`);
      const data = await response.json();
      
      if (data.success) {
        setWeeklyPlanData(data.data);
        setShowWeeklyPlan(true);
        success('Weekly diet plan loaded');
      } else {
        error(data.error || 'Failed to load weekly plan');
      }
    } catch (err) {
      error('Failed to load weekly plan');
    }
  };

  const handleViewFullMealHistory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/doctor/patients/${params.patientId}/meal-history`, { headers: getAuthHeaders() });
      const data = await response.json();
      
      if (data.success) {
        setFullMealHistory(data.data || []);
        setShowFullMealHistory(true);
        success(`Loaded ${data.totalDays || 0} days of meal history`);
      } else {
        error(data.error || 'Failed to load meal history');
      }
    } catch (err) {
      error('Failed to load meal history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsCured = async () => {
    try {
      setIsMarkingCured(true);
      const response = await fetch(`/api/doctor/patients/${params.patientId}/mark-cured`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      
      if (data.success) {
        success('Patient marked as cured successfully');
        setShowCuredConfirm(false);
        // Refresh patient data
        await fetchPatientData();
      } else {
        error(data.error || 'Failed to mark patient as cured');
      }
    } catch (err) {
      error('Failed to mark patient as cured');
    } finally {
      setIsMarkingCured(false);
    }
  };

  const todaysDiet = dietEntries.filter(entry => entry.date === new Date().toISOString().split('T')[0]);
  const completedMeals = dietStats.completedMeals;
  const totalMeals = dietStats.totalMeals;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Patient not found</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {patient.formData?.personalInfo?.firstName} {patient.formData?.personalInfo?.lastName}
                </h1>
                <div className="flex items-center space-x-4">
                  <p className="text-sm text-gray-600">
                    Age: {calculateAge()} • Phone: {patient.formData?.personalInfo?.phone}
                  </p>
                  {latestVitals?.diagnosis && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {latestVitals.diagnosis}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-1 bg-gray-100 rounded-lg p-1 mb-4">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'vitals', label: 'Vitals', icon: '🩺' },
              { id: 'diet', label: 'Diet Plan', icon: '🍽️' },
              { id: 'history', label: 'Full History', icon: '📋' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2 sm:py-3 rounded-md text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-none justify-center ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-white'
                }`}
              >
                <span className="text-sm sm:text-base">{tab.icon}</span>
                <span className="hidden xs:inline sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Current Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Current Diagnosis Card */}
              {latestVitals?.diagnosis && (
                <div className="bg-gradient-to-br from-red-400 to-pink-500 p-4 sm:p-6 rounded-xl shadow-lg text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-xs sm:text-sm font-semibold mb-1 text-red-100">Current Diagnosis</div>
                      <div className="text-lg sm:text-xl font-bold">
                        {latestVitals.diagnosis}
                      </div>
                      <div className="text-xs text-red-100">Latest assessment</div>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-300 rounded-full flex items-center justify-center ml-2">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* BMR Card */}
              <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-4 sm:p-6 rounded-xl shadow-lg text-white">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-xs sm:text-sm font-semibold mb-1 text-green-100">BMR</div>
                    <div className="text-2xl sm:text-3xl font-bold">
                      {patientStats.bmr ? patientStats.bmr.toFixed(2) : 'N/A'}
                    </div>
                    <div className="text-xs text-green-100">MJ/day</div>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-300 rounded-full flex items-center justify-center ml-2">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* TDEE Card */}
              <div className="bg-gradient-to-br from-purple-400 to-violet-500 p-4 sm:p-6 rounded-xl shadow-lg text-white">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-xs sm:text-sm font-semibold mb-1 text-purple-100">TDEE</div>
                    <div className="text-2xl sm:text-3xl font-bold">
                      {patientStats.tdee ? patientStats.tdee.toFixed(2) : 'N/A'}
                    </div>
                    <div className="text-xs text-purple-100">MJ/day</div>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-300 rounded-full flex items-center justify-center ml-2">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Diet Compliance Card */}
              <div className="bg-gradient-to-br from-orange-400 to-amber-500 p-4 sm:p-6 rounded-xl shadow-lg text-white">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-xs sm:text-sm font-semibold mb-1 text-orange-100">Diet Today</div>
                    <div className="text-2xl sm:text-3xl font-bold">
                      {dietStats.compliancePercentage}%
                    </div>
                    <div className="text-xs text-orange-100">
                      {completedMeals}/{totalMeals} meals
                    </div>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-300 rounded-full flex items-center justify-center ml-2">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <button 
                  onClick={() => setShowNewVitals(true)} 
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  <span>🩺</span>
                  <span className="text-sm sm:text-base">Record New Vitals</span>
                </button>
                <button 
                  onClick={() => handleUpdateDietPlan()} 
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  <span>🍽️</span>
                  <span className="text-sm sm:text-base">Update Diet Plan</span>
                </button>
                <button 
                  onClick={() => setActiveTab('history')} 
                  className="bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  <span>📋</span>
                  <span className="text-sm sm:text-base">View Full History</span>
                </button>
              </div>
            </div>

            {/* TDEE Trend Chart */}
            {vitalsHistory.length > 0 && (
              <div className="mt-8">
                <TDEEChart vitalsHistory={vitalsHistory} />
              </div>
            )}

          {/* (Health Progress graph removed as per requirement) */}
          </div>
        )}

        {/* Vitals Tab */}
        {activeTab === 'vitals' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Vitals Management</h3>
              <button 
                onClick={() => setShowNewVitals(true)} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-colors"
              >
                + Record New Vitals
              </button>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Latest Vitals</h4>
              {latestVitals ? (
                <div className="space-y-6">
                  {/* Basic Measurements */}
                  <div>
                    <h5 className="text-md font-medium text-gray-800 mb-3">Basic Measurements</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      <div className="bg-blue-50 border border-blue-200 p-3 sm:p-4 rounded-lg">
                        <div className="text-xs sm:text-sm text-blue-600 font-medium mb-1">Weight</div>
                        <div className="text-base sm:text-lg font-semibold text-blue-900">{latestVitals.weight || 'N/A'} kg</div>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 p-3 sm:p-4 rounded-lg">
                        <div className="text-xs sm:text-sm text-orange-600 font-medium mb-1">Temperature</div>
                        <div className="text-base sm:text-lg font-semibold text-orange-900">{latestVitals.temperature || 'N/A'}°F</div>
                      </div>
                      {latestVitals.diagnosis && (
                        <div className="bg-red-50 border border-red-200 p-3 sm:p-4 rounded-lg">
                          <div className="text-xs sm:text-sm text-red-600 font-medium mb-1">Diagnosis</div>
                          <div className="text-base sm:text-lg font-semibold text-red-900">{latestVitals.diagnosis}</div>
                        </div>
                      )}
                      {latestVitals.randomBloodSugar && (
                        <div className="bg-purple-50 border border-purple-200 p-3 sm:p-4 rounded-lg">
                          <div className="text-xs sm:text-sm text-purple-600 font-medium mb-1">Blood Sugar</div>
                          <div className="text-base sm:text-lg font-semibold text-purple-900">{latestVitals.randomBloodSugar} mg/dL</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cardiovascular */}
                  <div>
                    <h5 className="text-md font-medium text-gray-800 mb-3">Cardiovascular</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      <div className="bg-red-50 border border-red-200 p-3 sm:p-4 rounded-lg">
                        <div className="text-xs sm:text-sm text-red-600 font-medium mb-1">Pulse Rate</div>
                        <div className="text-base sm:text-lg font-semibold text-red-900">{latestVitals.pulseRate || 'N/A'} bpm</div>
                      </div>
                      <div className="bg-pink-50 border border-pink-200 p-3 sm:p-4 rounded-lg">
                        <div className="text-xs sm:text-sm text-pink-600 font-medium mb-1">Heart Rate</div>
                        <div className="text-base sm:text-lg font-semibold text-pink-900">{latestVitals.heartRate || 'N/A'} bpm</div>
                      </div>
                      <div className="bg-rose-50 border border-rose-200 p-3 sm:p-4 rounded-lg">
                        <div className="text-xs sm:text-sm text-rose-600 font-medium mb-1">Blood Pressure</div>
                        <div className="text-base sm:text-lg font-semibold text-rose-900">
                          {latestVitals.bloodPressureSystolic && latestVitals.bloodPressureDiastolic 
                            ? `${latestVitals.bloodPressureSystolic}/${latestVitals.bloodPressureDiastolic}` 
                            : 'N/A'
                          } mmHg
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Metabolic Data */}
                  <div>
                    <h5 className="text-md font-medium text-gray-800 mb-3">Metabolic Data</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      <div className="bg-emerald-50 border border-emerald-200 p-3 sm:p-4 rounded-lg">
                        <div className="text-xs sm:text-sm text-emerald-600 font-medium mb-1">BMR</div>
                        <div className="text-base sm:text-lg font-semibold text-emerald-900">{latestVitals.bmr?.toFixed(2) || 'N/A'} MJ/day</div>
                      </div>
                      <div className="bg-violet-50 border border-violet-200 p-3 sm:p-4 rounded-lg">
                        <div className="text-xs sm:text-sm text-violet-600 font-medium mb-1">TDEE</div>
                        <div className="text-base sm:text-lg font-semibold text-violet-900">{latestVitals.tdee?.toFixed(2) || 'N/A'} MJ/day</div>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 p-3 sm:p-4 rounded-lg">
                        <div className="text-xs sm:text-sm text-amber-600 font-medium mb-1">Blood Sugar</div>
                        <div className="text-base sm:text-lg font-semibold text-amber-900">{latestVitals.randomBloodSugar || 'N/A'} mg/dL</div>
                      </div>
                    </div>
                  </div>

                  {/* Diagnosis */}
                  {latestVitals.diagnosis && (
                    <div>
                      <h5 className="text-md font-medium text-gray-800 mb-3">Current Diagnosis</h5>
                      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                        <div className="text-lg font-semibold text-red-900">{latestVitals.diagnosis}</div>
                        <div className="text-sm text-red-600 mt-1">Latest medical assessment</div>
                      </div>
                    </div>
                  )}

                  {/* Siddha Assessment */}
                  {(latestVitals.naadi || latestVitals.thegi) && (
                    <div>
                      <h5 className="text-md font-medium text-gray-800 mb-3">Siddha Assessment</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {latestVitals.naadi && (
                          <div className="bg-indigo-50 border border-indigo-200 p-3 sm:p-4 rounded-lg">
                            <div className="text-xs sm:text-sm text-indigo-600 font-medium mb-1">Naadi</div>
                            <div className="text-base sm:text-lg font-semibold text-indigo-900">{latestVitals.naadi}</div>
                          </div>
                        )}
                        {latestVitals.thegi && (
                          <div className="bg-teal-50 border border-teal-200 p-3 sm:p-4 rounded-lg">
                            <div className="text-xs sm:text-sm text-teal-600 font-medium mb-1">Thegi</div>
                            <div className="text-base sm:text-lg font-semibold text-teal-900">{latestVitals.thegi}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Diagnosis */}
                  {latestVitals.diagnosis && (
                    <div>
                      <h5 className="text-md font-medium text-gray-800 mb-3">Diagnosis</h5>
                      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                        <div className="text-sm font-medium text-red-900">{latestVitals.diagnosis}</div>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {latestVitals.notes && (
                    <div>
                      <h5 className="text-md font-medium text-gray-800 mb-3">Notes</h5>
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <div className="text-sm text-blue-900">{latestVitals.notes}</div>
                      </div>
                    </div>
                  )}

                  {/* Last Recorded */}
                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                    <div className="text-xs text-gray-600 font-medium mb-1">Last Recorded</div>
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(latestVitals.recordedAt).toLocaleDateString()} at {new Date(latestVitals.recordedAt).toLocaleTimeString()}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Recorded by {latestVitals.recordedBy || 'Unknown'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-600">No vitals recorded yet. Click "Record New Vitals" to start.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Diet Tab */}
        {activeTab === 'diet' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Diet Plan & Tracking</h3>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setShowDietEditor(true)} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-colors"
                >
                  ✏️ Edit Plan
                </button>
                <button 
                  onClick={() => handleViewWeeklyPlan()} 
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-colors"
                >
                  📅 Weekly Plan
                </button>
                <button 
                  onClick={handleViewFullMealHistory} 
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-colors"
                >
                  📊 Full Meal History
                </button>
                <button 
                  onClick={() => setShowCuredConfirm(true)} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-colors"
                >
                  ✅ Mark as Cured
                </button>
              </div>
            </div>

            {/* Diagnosis-based Diet Plan Info */}
            {latestVitals?.diagnosis && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h4 className="text-lg font-medium text-green-900 mb-2">
                  Diet Plan for {latestVitals.diagnosis}
                </h4>
                <p className="text-green-700 text-sm">
                  This personalized diet plan is based on the patient's current diagnosis and follows Siddha medicine principles.
                </p>
              </div>
            )}

            {/* Today's Diet */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">Today's Meals</h4>
                <div className="text-sm text-gray-600">
                  Compliance: <span className="font-semibold text-green-600">{dietStats.compliancePercentage}%</span>
                </div>
              </div>
              
              {todaysDiet.length > 0 ? (
                <div className="space-y-3">
                  {todaysDiet.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-4">
                        <div className={`w-4 h-4 rounded-full ${entry.completed ? 'bg-green-500' : 'bg-red-400'}`}></div>
                        <div>
                          <div className="font-medium text-gray-900 capitalize">{entry.mealType}</div>
                          <div className="text-sm text-gray-600">{entry.foodItem} - {entry.quantity}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{entry.calories} cal</div>
                        <div className={`text-xs font-medium ${entry.completed ? 'text-green-600' : 'text-red-500'}`}>
                          {entry.completed ? 'Completed' : 'Pending'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-600">
                    {latestVitals?.diagnosis 
                      ? 'No diet plan available for today. The patient may need to check their meal tracking.'
                      : 'Please record patient vitals with a diagnosis to generate a diet plan.'
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Diet Plan Component */}
            {latestVitals?.diagnosis && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Weekly Diet Plan</h4>
                <PatientDietPlan 
                  diagnosis={latestVitals.diagnosis} 
                  patientId={parseInt(params.patientId as string)}
                />
              </div>
            )}

            {/* Diet Compliance Chart */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Weekly Diet Compliance</h4>
              <DietComplianceChart patientId={params.patientId as string} />
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Vitals History</h3>
              <button 
                onClick={() => setShowNewVitals(true)} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-colors"
              >
                + Record New Vitals
              </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by date, doctor, or vital values..."
                  className="block w-full pl-10 pr-3 py-3 border-2 border-blue-200 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
            </div>

            {/* Vitals Records */}
            <div className="space-y-6">
              {vitalsHistory.map((record: any) => (
                <div key={record.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {new Date(record.recordedAt).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Recorded by {record.recordedBy} at {new Date(record.recordedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors">
                      Edit
                    </button>
                  </div>

                  {/* TDEE & BMR Stats */}
                  {(record.bmr || record.tdee) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {record.bmr && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl border border-green-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="text-sm text-green-600 font-semibold mb-2">BMR (Basal Metabolic Rate)</div>
                              <div className="text-4xl font-bold text-green-900 mb-2">{record.bmr.toFixed(2)}</div>
                              <div className="text-sm text-green-700 font-medium">MJ/day</div>
                              <div className="text-xs text-green-600 mt-2">Energy needed at complete rest</div>
                            </div>
                            <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center ml-4">
                              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {record.tdee && (
                        <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-6 rounded-xl border border-purple-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="text-sm text-purple-600 font-semibold mb-2">TDEE (Total Daily Energy Expenditure)</div>
                              <div className="text-4xl font-bold text-purple-900 mb-2">{record.tdee.toFixed(2)}</div>
                              <div className="text-sm text-purple-700 font-medium">MJ/day</div>
                              <div className="text-xs text-purple-600 mt-2">Total energy needed including activity</div>
                            </div>
                            <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center ml-4">
                              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Vital Signs Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                    {record.pulseRate && (
                      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                        <div className="text-xs text-blue-600 font-medium mb-1">Pulse Rate</div>
                        <div className="text-sm font-semibold text-blue-900">{record.pulseRate} bpm</div>
                      </div>
                    )}
                    {record.heartRate && (
                      <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                        <div className="text-xs text-red-600 font-medium mb-1">Heart Rate</div>
                        <div className="text-sm font-semibold text-red-900">{record.heartRate} bpm</div>
                      </div>
                    )}
                    {record.temperature && (
                      <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                        <div className="text-xs text-orange-600 font-medium mb-1">Temperature</div>
                        <div className="text-sm font-semibold text-orange-900">{record.temperature}°F</div>
                      </div>
                    )}
                    {record.weight && (
                      <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                        <div className="text-xs text-green-600 font-medium mb-1">Weight</div>
                        <div className="text-sm font-semibold text-green-900">{record.weight} kg</div>
                      </div>
                    )}
                    {record.naadi && (
                      <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-lg">
                        <div className="text-xs text-indigo-600 font-medium mb-1">Naadi</div>
                        <div className="text-sm font-semibold text-indigo-900">{record.naadi}</div>
                      </div>
                    )}
                    {record.diagnosis && (
                      <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                        <div className="text-xs text-red-600 font-medium mb-1">Diagnosis</div>
                        <div className="text-sm font-semibold text-red-900">{record.diagnosis}</div>
                      </div>
                    )}
                  </div>
                  
                  {/* Diagnosis Section - Prominent Display */}
                  {record.diagnosis && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <div className="text-sm font-medium text-red-800">Medical Diagnosis</div>
                          <div className="text-lg font-semibold text-red-900">{record.diagnosis}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {record.notes && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-xs text-blue-600 font-medium mb-1">Notes</div>
                      <div className="text-sm text-blue-900">{record.notes}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {vitalsHistory.length === 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No vitals history</h3>
                <p className="text-gray-500">Start by recording the first set of vitals for this patient.</p>
              </div>
            )}

            {/* Meal History Section */}
            <div className="mt-8">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">🍽️ Meal History (Last 7 Days)</h3>
              
              {mealHistory.length > 0 ? (
                <div className="space-y-4">
                  {mealHistory.map((dayMeals: any, index: number) => {
                    const mealDate = new Date(dayMeals.date);
                    const dayOfWeek = mealDate.getDay() === 0 ? 7 : mealDate.getDay();
                    
                    // Get diet plan for this day
                    const dayPlan = dietPlanData?.days?.[dayOfWeek - 1] || null;

                    const mealTypes = ['breakfast', 'lunch', 'dinner'];
                    const mealIcons = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' };
                    const mealColors = {
                      breakfast: 'orange',
                      lunch: 'yellow',
                      dinner: 'purple'
                    };

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
                            const colorClass = mealType === 'breakfast' ? 'orange' : mealType === 'lunch' ? 'yellow' : 'purple';

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
                  <p className="text-gray-500">Patient hasn't tracked any meals yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Weekly Plan Full-Screen Modal */}
      {showWeeklyPlan && weeklyPlanData && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="min-h-screen">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setShowWeeklyPlan(false)}
                      className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div>
                      <h1 className="text-xl font-semibold text-gray-900">
                        📅 Weekly Diet Plan - {weeklyPlanData.diagnosis}
                      </h1>
                      <p className="text-sm text-gray-600">{weeklyPlanData.dietPlan.description}</p>
                    </div>
                  </div>
                  {weeklyPlanData.isCustomPlan && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      Custom Plan
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="space-y-6">
                {weeklyPlanData.dietPlan.days.map((day: any, index: number) => (
                  <div key={index} className={`border rounded-xl p-6 shadow-sm ${
                    index + 1 === weeklyPlanData.currentDay 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-gray-200 bg-white'
                  }`}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">
                        Day {day.day} - {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index]}
                      </h3>
                      {index + 1 === weeklyPlanData.currentDay && (
                        <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Today
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-900 mb-3 text-lg">🌅 Breakfast</h4>
                        <ul className="space-y-2">
                          {day.meals.breakfast.map((item: string, idx: number) => (
                            <li key={idx} className="text-orange-800">{item}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-semibold text-yellow-900 mb-3 text-lg">☀️ Lunch</h4>
                        <ul className="space-y-2">
                          {day.meals.lunch.map((item: string, idx: number) => (
                            <li key={idx} className="text-yellow-800">{item}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-3 text-lg">🌙 Dinner</h4>
                        <ul className="space-y-2">
                          {day.meals.dinner.map((item: string, idx: number) => (
                            <li key={idx} className="text-purple-800">{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {day.meals.notes && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2 text-lg">📝 Siddha Medicine Notes</h4>
                        <p className="text-blue-800">{day.meals.notes}</p>
                      </div>
                    )}
                  </div>
                ))}

                {/* General Instructions */}
                {weeklyPlanData.dietPlan.generalInstructions && weeklyPlanData.dietPlan.generalInstructions.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">📋 General Guidelines</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {weeklyPlanData.dietPlan.generalInstructions.map((instruction: string, index: number) => (
                        <div key={index} className="flex items-start space-x-3">
                          <span className="text-green-600 mt-1">•</span>
                          <span className="text-gray-700">{instruction}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Diet Plan Editor Full-Screen Modal */}
      {showDietEditor && patient && latestVitals?.diagnosis && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="min-h-screen">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setShowDietEditor(false)}
                      className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div>
                      <h1 className="text-xl font-semibold text-gray-900">
                        ✏️ Edit Diet Plan - {latestVitals.diagnosis}
                      </h1>
                      <p className="text-sm text-gray-600">Customize the meal plan for this patient</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <DietPlanEditor
                patientId={parseInt(params.patientId as string)}
                diagnosis={latestVitals.diagnosis}
                onClose={() => setShowDietEditor(false)}
                onSave={() => {
                  fetchPatientData();
                  setShowDietEditor(false);
                  success('Diet plan updated and patient notified');
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* New Vitals Form Modal */}
      {showNewVitals && patient && (
        <NewVitalsForm
          patient={patient}
          onClose={() => setShowNewVitals(false)}
          onSuccess={() => {
            fetchPatientData();
            setShowNewVitals(false);
            success('Vitals recorded successfully');
          }}
        />
      )}

      {/* Full Meal History - Full Screen View (no dark overlay) */}
      {showFullMealHistory && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="min-h-screen">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setShowFullMealHistory(false)}
                      className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div>
                      <h1 className="text-xl font-semibold text-gray-900">
                        📊 Full Meal History
                      </h1>
                      <p className="text-sm text-gray-600">
                        Complete meal tracking history for {patient?.formData?.personalInfo?.firstName || 'Patient'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {fullMealHistory.length > 0 ? (
                <div className="space-y-4">
                  {fullMealHistory.map((dayMeals: any, index: number) => {
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
                <div className="text-center py-12">
                  <span className="text-5xl mb-4 block">🍽️</span>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No meal history</h3>
                  <p className="text-gray-500">Patient hasn't tracked any meals yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mark as Cured - Full Screen View (no dark overlay) */}
      {showCuredConfirm && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full">
                <span className="text-3xl">✅</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Mark Patient as Cured?</h2>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to mark{' '}
                <strong>{patient?.formData?.personalInfo?.firstName || 'this patient'}</strong> as cured? This action
                will update their status in the system.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowCuredConfirm(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
                  disabled={isMarkingCured}
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkAsCured}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isMarkingCured}
                >
                  {isMarkingCured ? 'Marking...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
