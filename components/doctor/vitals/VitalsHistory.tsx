'use client';

import { useState, useEffect } from 'react';
import { Patient } from '@/lib/types';
import { doctorService } from '@/lib/services/doctorService';
import { useToast } from '@/lib/hooks/useToast';

interface VitalsHistoryProps {
  patient: Patient;
}

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

interface VitalsRecord {
  id: number;
  recordedAt: string;
  pulseRate?: number;
  heartRate?: number;
  temperature?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  randomBloodSugar?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  bmr?: number;
  tdee?: number;
  naadi?: string;
  thegi?: string;
  notes?: string;
  recordedBy: string;
  doctor?: {
    doctorUID: string;
    formData: any;
  };
}

export function VitalsHistory({ patient }: VitalsHistoryProps) {
  const { error } = useToast();
  const [vitalsHistory, setVitalsHistory] = useState<VitalsRecord[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<VitalsRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVitalsHistory();
  }, [patient.id]);

  useEffect(() => {
    filterHistory();
  }, [vitalsHistory, searchTerm]);

  const filterHistory = () => {
    if (!searchTerm.trim()) {
      setFilteredHistory(vitalsHistory);
      return;
    }

    const filtered = vitalsHistory.filter(record => {
      const searchLower = searchTerm.toLowerCase();
      const recordDate = new Date((record as any).recordedAt || (record as any).createdAt).toLocaleDateString();
      const doctorName = ((record as any).doctorName || record.doctor || '').toLowerCase();

      return recordDate.includes(searchLower) ||
        doctorName.includes(searchLower) ||
        (record.pulseRate && record.pulseRate.toString().includes(searchLower)) ||
        (record.heartRate && record.heartRate.toString().includes(searchLower)) ||
        (record.temperature && record.temperature.toString().includes(searchLower)) ||
        (record.weight && record.weight.toString().includes(searchLower)) ||
        (record.bmi && record.bmi.toString().includes(searchLower));
    });

    setFilteredHistory(filtered);
  };

  const fetchVitalsHistory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/doctor/vitals?patientId=${patient.id}`);
      const data = await response.json();

      if (data.success) {
        setVitalsHistory(data.vitals || []);
        setFilteredHistory(data.vitals || []);
      } else {
        error('Failed to load vitals history');
      }
    } catch (err) {
      error('Failed to load vitals history');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading vitals history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Vitals History</h2>
              <p className="text-sm text-gray-500">Previous vitals and diagnosis records</p>
            </div>
            <div className="text-sm text-gray-500">
              {filteredHistory.length} of {vitalsHistory.length} records
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by date, doctor, or vital values..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredHistory.map((record) => {
            // Calculate missing BMR/TDEE for display
            let displayBMR = record.bmr;
            let displayTDEE = record.tdee;

            if ((!displayBMR || !displayTDEE) && record.weight) {
              const personalInfo = (patient.formData as any)?.personalInfo || {};
              const age = personalInfo.age || 25;
              const gender = personalInfo.gender || 'male';
              const workType = personalInfo.workType || 'medium';

              if (!displayBMR) {
                displayBMR = calculateBMR(record.weight, age, gender);
              }
              if (!displayTDEE && displayBMR) {
                displayTDEE = calculateTDEE(displayBMR, workType, gender);
              }
            }

            return (
              <div key={record.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{new Date((record as any).recordedAt || (record as any).createdAt).toLocaleDateString()}</h3>
                      <p className="text-sm text-gray-500">Recorded by {(record as any).doctorName || record.doctor}</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View Details
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Pulse Rate</div>
                    <div className="text-sm font-medium text-gray-900">{(record as any).pulseRate || 'N/A'} bpm</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Heart Rate</div>
                    <div className="text-sm font-medium text-gray-900">{(record as any).heartRate || 'N/A'} bpm</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Temperature</div>
                    <div className="text-sm font-medium text-gray-900">{(record as any).temperature || 'N/A'}°F</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Blood Pressure</div>
                    <div className="text-sm font-medium text-gray-900">{(record as any).bloodPressure || 'N/A'}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Weight</div>
                    <div className="text-sm font-medium text-gray-900">{(record as any).weight || 'N/A'} kg</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">BMI</div>
                    <div className="text-sm font-medium text-gray-900">{(record as any).bmi || 'N/A'}</div>
                  </div>
                </div>

                {/* TDEE & BMR Stats Section */}
                {(displayBMR || displayTDEE) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {displayBMR && (
                      <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-green-600 font-medium mb-1">BMR (Basal Metabolic Rate)</div>
                            <div className="text-2xl font-bold text-green-900">{displayBMR.toFixed(2)} MJ/day</div>
                            <div className="text-xs text-green-700 mt-1">Energy needed at rest</div>
                          </div>
                          <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}

                    {displayTDEE && (
                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-purple-600 font-medium mb-1">TDEE (Total Daily Energy Expenditure)</div>
                            <div className="text-2xl font-bold text-purple-900">{displayTDEE.toFixed(2)} MJ/day</div>
                            <div className="text-xs text-purple-700 mt-1">Total energy needed daily</div>
                          </div>
                          <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {(record as any).diagnosis && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-xs text-blue-600 mb-1">Diagnosis</div>
                    <div className="text-sm text-blue-900">{(record as any).diagnosis}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {filteredHistory.length === 0 && vitalsHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No matching records</h3>
          <p className="text-gray-500">Try adjusting your search terms to find vitals records.</p>
        </div>
      )}

      {vitalsHistory.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No vitals history</h3>
          <p className="text-gray-500">Start by recording the first set of vitals for this patient.</p>
        </div>
      )}
    </div>
  );
}
