'use client';

import { useState, useEffect } from 'react';
import { Patient } from '@/lib/types';
import { patientService } from '@/lib/services/patientService';
import { useToast } from '@/lib/hooks/useToast';

interface PatientVitalsViewProps {
  patient: Patient;
}

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
  bmr?: number;
  tdee?: number;
  naadi?: string;
  thegi?: string;
  diagnosis?: string;
  notes?: string;
  recordedBy: string;
}

export function PatientVitalsView({ patient }: PatientVitalsViewProps) {
  const { error } = useToast();
  const [vitalsHistory, setVitalsHistory] = useState<VitalsRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMyVitals();
  }, [patient.id]);

  const fetchMyVitals = async () => {
    try {
      setIsLoading(true);
      const response = await patientService.getMyVitals(patient.id);
      
      if (response.success) {
        setVitalsHistory(response.data?.vitals || []);
      } else {
        error('Failed to load your vitals');
      }
    } catch (err) {
      error('Failed to load your vitals');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your vitals...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">My Health Records</h2>
          <p className="text-sm text-gray-500">Your vitals and health measurements history</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {vitalsHistory.map((record) => (
            <div key={record.id} className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {new Date(record.recordedAt).toLocaleDateString()}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">Recorded by {record.recordedBy}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {record.pulseRate && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-xs text-blue-600 mb-1">Pulse Rate</div>
                    <div className="text-sm font-medium text-blue-900">{record.pulseRate} bpm</div>
                  </div>
                )}
                {record.heartRate && (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="text-xs text-red-600 mb-1">Heart Rate</div>
                    <div className="text-sm font-medium text-red-900">{record.heartRate} bpm</div>
                  </div>
                )}
                {record.temperature && (
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="text-xs text-yellow-600 mb-1">Temperature</div>
                    <div className="text-sm font-medium text-yellow-900">{record.temperature}°F</div>
                  </div>
                )}
                {record.bloodPressureSystolic && record.bloodPressureDiastolic && (
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-xs text-purple-600 mb-1">Blood Pressure</div>
                    <div className="text-sm font-medium text-purple-900">
                      {record.bloodPressureSystolic}/{record.bloodPressureDiastolic}
                    </div>
                  </div>
                )}
                {record.weight && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-xs text-green-600 mb-1">Weight</div>
                    <div className="text-sm font-medium text-green-900">{record.weight} kg</div>
                  </div>
                )}
                {record.bmr && (
                  <div className="bg-pink-50 p-3 rounded-lg">
                    <div className="text-xs text-pink-600 mb-1">BMR</div>
                    <div className="text-sm font-medium text-pink-900">{record.bmr} MJ/day</div>
                  </div>
                )}
                {record.tdee && (
                  <div className="bg-teal-50 p-3 rounded-lg">
                    <div className="text-xs text-teal-600 mb-1">TDEE</div>
                    <div className="text-sm font-medium text-teal-900">{record.tdee} MJ/day</div>
                  </div>
                )}
              </div>
              
              {(record.naadi || record.thegi) && (
                <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                  <div className="text-xs text-orange-600 mb-1">Siddha Assessment</div>
                  <div className="text-sm text-orange-900">
                    {record.naadi ? `Naadi: ${record.naadi}` : `Thegi: ${record.thegi}`}
                  </div>
                </div>
              )}
              
              {record.diagnosis && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <div className="text-xs text-red-600 mb-1">Diagnosis</div>
                  <div className="text-sm text-red-900">{record.diagnosis}</div>
                </div>
              )}
              
              {record.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">Doctor's Notes</div>
                  <div className="text-sm text-gray-900">{record.notes}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {vitalsHistory.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No health records yet</h3>
          <p className="text-gray-500">Your doctor will record your vitals during consultations.</p>
        </div>
      )}
    </div>
  );
}
