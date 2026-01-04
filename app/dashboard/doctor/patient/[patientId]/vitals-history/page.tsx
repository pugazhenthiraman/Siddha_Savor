'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/lib/hooks/useToast';

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
  doctor?: any;
}

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export default function PatientVitalsHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const { error } = useToast();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [vitalsHistory, setVitalsHistory] = useState<VitalsRecord[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<VitalsRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.patientId) {
      fetchPatientAndVitals();
    }
  }, [params.patientId]);

  useEffect(() => {
    filterHistory();
  }, [vitalsHistory, searchTerm]);

  const fetchPatientAndVitals = async () => {
    try {
      setIsLoading(true);
      
      // Fetch patient details and vitals in parallel
      const [patientResponse, vitalsResponse] = await Promise.all([
        fetch(`/api/doctor/patients/${params.patientId}`),
        fetch(`/api/doctor/vitals?patientId=${params.patientId}`)
      ]);

      const patientData = await patientResponse.json();
      const vitalsData = await vitalsResponse.json();

      if (patientData.success) {
        setPatient(patientData.data);
      }

      if (vitalsData.success) {
        setVitalsHistory(vitalsData.vitals || []);
        setFilteredHistory(vitalsData.vitals || []);
      } else {
        error('Failed to load vitals history');
      }
    } catch (err) {
      error('Failed to load patient data');
    } finally {
      setIsLoading(false);
    }
  };

  const filterHistory = () => {
    if (!searchTerm.trim()) {
      setFilteredHistory(vitalsHistory);
      return;
    }

    const filtered = vitalsHistory.filter(record => {
      const searchLower = searchTerm.toLowerCase();
      const recordDate = new Date(record.recordedAt).toLocaleDateString();
      const doctorName = (record.doctor?.name || record.recordedBy || '').toLowerCase();
      
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patient vitals history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
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
                  {patient?.name} - Vitals History
                </h1>
                <p className="text-sm text-gray-500">Complete medical vitals and metabolic data</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {filteredHistory.length} of {vitalsHistory.length} records
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
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
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Vitals Records */}
        <div className="space-y-6">
          {filteredHistory.map((record) => (
            <div key={record.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Record Header */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
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
                        Recorded by {record.doctor?.name || record.recordedBy} at {new Date(record.recordedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* TDEE & BMR Stats - Prominent Display */}
                {(record.bmr || record.tdee) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-xs text-gray-500 mb-2 font-medium">Pulse Rate</div>
                    <div className="text-lg font-semibold text-gray-900">{record.pulseRate || 'N/A'}</div>
                    <div className="text-xs text-gray-500">bpm</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-xs text-gray-500 mb-2 font-medium">Heart Rate</div>
                    <div className="text-lg font-semibold text-gray-900">{record.heartRate || 'N/A'}</div>
                    <div className="text-xs text-gray-500">bpm</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-xs text-gray-500 mb-2 font-medium">Temperature</div>
                    <div className="text-lg font-semibold text-gray-900">{record.temperature || 'N/A'}</div>
                    <div className="text-xs text-gray-500">°F</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-xs text-gray-500 mb-2 font-medium">Blood Pressure</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {record.bloodPressureSystolic && record.bloodPressureDiastolic 
                        ? `${record.bloodPressureSystolic}/${record.bloodPressureDiastolic}`
                        : 'N/A'
                      }
                    </div>
                    <div className="text-xs text-gray-500">mmHg</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-xs text-gray-500 mb-2 font-medium">Weight</div>
                    <div className="text-lg font-semibold text-gray-900">{record.weight || 'N/A'}</div>
                    <div className="text-xs text-gray-500">kg</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-xs text-gray-500 mb-2 font-medium">BMI</div>
                    <div className="text-lg font-semibold text-gray-900">{record.bmi?.toFixed(1) || 'N/A'}</div>
                    <div className="text-xs text-gray-500">kg/m²</div>
                  </div>
                </div>

                {/* Additional Notes */}
                {record.notes && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-600 font-medium mb-2">Notes</div>
                    <div className="text-sm text-blue-900">{record.notes}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty States */}
        {filteredHistory.length === 0 && vitalsHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
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
    </div>
  );
}
