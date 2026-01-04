'use client';

import { useState, useEffect } from 'react';
import { Patient } from '@/lib/types';
import { doctorService } from '@/lib/services/doctorService';
import { useToast } from '@/lib/hooks/useToast';

interface VitalsHistoryProps {
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVitalsHistory();
  }, [patient.id]);

  const fetchVitalsHistory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/doctor/vitals?patientId=${patient.id}`);
      const data = await response.json();
      
      if (data.success) {
        setVitalsHistory(data.vitals || []);
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
          <h2 className="text-lg font-medium text-gray-900">Vitals History</h2>
          <p className="text-sm text-gray-500">Previous vitals and diagnosis records</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {vitalsHistory.map((record) => (
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
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Pulse Rate</div>
                  <div className="text-sm font-medium text-gray-900">{(record as any).pulseRate} bpm</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Heart Rate</div>
                  <div className="text-sm font-medium text-gray-900">{(record as any).heartRate} bpm</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Temperature</div>
                  <div className="text-sm font-medium text-gray-900">{(record as any).temperature}°F</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Blood Pressure</div>
                  <div className="text-sm font-medium text-gray-900">{(record as any).bloodPressure}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Weight</div>
                  <div className="text-sm font-medium text-gray-900">{(record as any).weight} kg</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">BMI</div>
                  <div className="text-sm font-medium text-gray-900">{(record as any).bmi}</div>
                </div>
              </div>
              
              {(record as any).diagnosis && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-xs text-blue-600 mb-1">Diagnosis</div>
                  <div className="text-sm text-blue-900">{(record as any).diagnosis}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
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
