'use client';

import { useState, useEffect } from 'react';
import { Patient } from '@/lib/types';
import { useToast } from '@/lib/hooks/useToast';
import { NewVitalsForm } from './NewVitalsForm';
import { PatientVitalsHistory } from './PatientVitalsHistory';

// Helper functions for BMR/TDEE calculation
const calculateBMR = (weight: number, age: number, gender: string): number => {
  const isMale = gender.toLowerCase() === 'male';

  if (age >= 18 && age <= 30) {
    return isMale ? (0.0669 * weight + 2.28) : (0.0546 * weight + 2.33);
  } else if (age > 30 && age <= 60) {
    return isMale ? (0.0592 * weight + 2.48) : (0.0407 * weight + 2.90);
  } else {
    return isMale ? (0.0563 * weight + 2.15) : (0.0424 * weight + 2.38);
  }
};

const calculateTDEE = (bmr: number, workType: string, gender: string): number => {
  const factors = {
    soft: gender.toLowerCase() === 'male' ? 1.55 : 1.56,
    medium: gender.toLowerCase() === 'male' ? 1.76 : 1.64,
    heavy: gender.toLowerCase() === 'male' ? 2.10 : 1.82
  };

  const factor = factors[workType as keyof typeof factors] || factors.medium;
  return bmr * factor;
};

interface PatientStats {
  bmr?: number;
  tdee?: number;
  bmi?: number;
  lastWeight?: number;
  lastHeight?: number;
  lastRecordedAt?: string;
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

interface PatientDashboardProps {
  patient: Patient;
  onClose: () => void;
}

export function PatientDashboard({ patient, onClose }: PatientDashboardProps) {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'vitals' | 'diet' | 'history'>('overview');
  const [patientStats, setPatientStats] = useState<PatientStats>({});
  const [dietEntries, setDietEntries] = useState<DietEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewVitals, setShowNewVitals] = useState(false);
  const [latestVitals, setLatestVitals] = useState<any>(null);
  const [showVitalsHistory, setShowVitalsHistory] = useState(false);

  useEffect(() => {
    fetchPatientData();
  }, [patient.id]);

  const fetchPatientData = async () => {
    try {
      setIsLoading(true);

      // Fetch latest vitals for stats
      const vitalsResponse = await fetch(`/api/doctor/vitals?patientId=${patient.id}&limit=1`);
      const vitalsData = await vitalsResponse.json();

      if (vitalsData.success && vitalsData.vitals?.length > 0) {
        const latest = vitalsData.vitals[0];

        // Calculate missing BMR/TDEE
        let bmr = latest.bmr;
        let tdee = latest.tdee;

        if ((!bmr || !tdee) && latest.weight) {
          const personalInfo = (patient.formData as any)?.personalInfo || {};
          const age = personalInfo.age || 25; // Default age if missing
          const gender = personalInfo.gender || 'male';
          const workType = personalInfo.workType || 'medium';

          if (!bmr) {
            bmr = calculateBMR(latest.weight, age, gender);
          }
          if (!tdee && bmr) {
            tdee = calculateTDEE(bmr, workType, gender);
          }
        }

        // Update latest object with calculated values for display
        latest.bmr = bmr;
        latest.tdee = tdee;

        setLatestVitals(latest);
        setPatientStats({
          bmr: bmr,
          tdee: tdee,
          bmi: latest.bmi,
          lastWeight: latest.weight,
          lastHeight: latest.height,
          lastRecordedAt: latest.recordedAt
        });
      }

      // Mock diet data - replace with actual API call
      setDietEntries([
        { id: 1, date: '2026-01-04', mealType: 'breakfast', foodItem: 'Oatmeal with fruits', quantity: '1 bowl', calories: 350, completed: true },
        { id: 2, date: '2026-01-04', mealType: 'lunch', foodItem: 'Grilled chicken salad', quantity: '1 plate', calories: 450, completed: false },
        { id: 3, date: '2026-01-04', mealType: 'dinner', foodItem: 'Brown rice with vegetables', quantity: '1 cup', calories: 400, completed: false }
      ]);

    } catch (err) {
      error('Failed to load patient data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAge = () => {
    if (!(patient.formData as any)?.personalInfo?.dateOfBirth) return 'N/A';
    const dob = new Date((patient.formData as any).personalInfo.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    return age;
  };

  const getBMIStatus = (bmi?: number) => {
    if (!bmi) return { status: 'Unknown', color: 'gray' };
    if (bmi < 18.5) return { status: 'Underweight', color: 'blue' };
    if (bmi < 25) return { status: 'Normal', color: 'green' };
    if (bmi < 30) return { status: 'Overweight', color: 'yellow' };
    return { status: 'Obese', color: 'red' };
  };

  const todaysDiet = dietEntries.filter(entry => entry.date === new Date().toISOString().split('T')[0]);
  const completedMeals = todaysDiet.filter(entry => entry.completed).length;
  const totalMeals = todaysDiet.length;

  if (showVitalsHistory) {
    return <PatientVitalsHistory patient={patient} onClose={() => setShowVitalsHistory(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {(patient.formData as any)?.personalInfo?.firstName} {(patient.formData as any)?.personalInfo?.lastName}
                </h1>
                <p className="text-sm text-gray-600">
                  Age: {calculateAge()} • Phone: {(patient.formData as any)?.personalInfo?.phone}
                </p>
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
                onClick={() => {
                  if (tab.id === 'history') {
                    setShowVitalsHistory(true);
                  } else {
                    setActiveTab(tab.id as any);
                  }
                }}
                className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2 sm:py-3 rounded-md text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-none justify-center ${activeTab === tab.id
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
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="ml-4 text-gray-600">Loading patient data...</p>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Current Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                          {totalMeals > 0 ? Math.round((completedMeals / totalMeals) * 100) : 0}%
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
                      onClick={() => setActiveTab('diet')}
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      <span>🍽️</span>
                      <span className="text-sm sm:text-base">Update Diet Plan</span>
                    </button>
                    <button
                      onClick={() => setShowVitalsHistory(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      <span>📋</span>
                      <span className="text-sm sm:text-base">View Full History</span>
                    </button>
                  </div>
                </div>

                {/* Health Graph Placeholder */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Progress</h3>
                  <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-300">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <p className="text-blue-600 font-medium">Health progress charts will be displayed here</p>
                      <p className="text-sm text-blue-500 mt-2">Based on diet compliance and vital trends</p>
                    </div>
                  </div>
                </div>
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
                          <div className="bg-green-50 border border-green-200 p-3 sm:p-4 rounded-lg">
                            <div className="text-xs sm:text-sm text-green-600 font-medium mb-1">Height</div>
                            <div className="text-base sm:text-lg font-semibold text-green-900">{latestVitals.height || 'N/A'} cm</div>
                          </div>
                          <div className="bg-purple-50 border border-purple-200 p-3 sm:p-4 rounded-lg">
                            <div className="text-xs sm:text-sm text-purple-600 font-medium mb-1">BMI</div>
                            <div className="text-base sm:text-lg font-semibold text-purple-900">{latestVitals.bmi?.toFixed(1) || 'N/A'}</div>
                          </div>
                          <div className="bg-orange-50 border border-orange-200 p-3 sm:p-4 rounded-lg">
                            <div className="text-xs sm:text-sm text-orange-600 font-medium mb-1">Temperature</div>
                            <div className="text-base sm:text-lg font-semibold text-orange-900">{latestVitals.temperature || 'N/A'}°F</div>
                          </div>
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
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-colors">
                    📅 Weekly Plan
                  </button>
                </div>

                {/* Today's Diet */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Today's Meals</h4>
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
                </div>

                {/* Diet Compliance Chart Placeholder */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Weekly Diet Compliance</h4>
                  <div className="h-48 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg flex items-center justify-center border-2 border-dashed border-green-300">
                    <p className="text-green-600 font-medium">Diet compliance chart will be displayed here</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* New Vitals Form Modal */}
      {showNewVitals && (
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
    </div>
  );
}
