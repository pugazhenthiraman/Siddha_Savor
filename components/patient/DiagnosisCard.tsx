'use client';

import { useState, useEffect } from 'react';
import { patientService } from '@/lib/services/patientService';
import { useToast } from '@/lib/hooks/useToast';

interface DiagnosisCardProps {
  patientId: number;
}

export function DiagnosisCard({ patientId }: DiagnosisCardProps) {
  const { error } = useToast();
  const [diagnosis, setDiagnosis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLatestDiagnosis();
  }, [patientId]);

  const fetchLatestDiagnosis = async () => {
    try {
      setIsLoading(true);
      const response = await patientService.getMyVitals(patientId);
      
      if (response.success && response.data?.vitals?.length > 0) {
        const latestVital = response.data.vitals[0];
        setDiagnosis(latestVital.diagnosis || null);
      }
    } catch (err) {
      error('Failed to load diagnosis');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-pink-100 rounded-xl p-4 sm:p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-red-200 rounded w-1/3 mb-2"></div>
          <div className="h-6 bg-red-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!diagnosis) {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 sm:p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-600 mb-1">Current Diagnosis</div>
            <div className="text-lg font-bold text-gray-500">No diagnosis recorded</div>
            <div className="text-xs text-gray-500">Visit your doctor for assessment</div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center ml-4">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-red-400 to-pink-500 rounded-xl p-4 sm:p-6 shadow-lg text-white">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-sm font-semibold mb-1 text-red-100">Current Diagnosis</div>
          <div className="text-xl font-bold">{diagnosis}</div>
          <div className="text-xs text-red-100">Latest assessment from your doctor</div>
        </div>
        <div className="w-12 h-12 bg-red-300 rounded-full flex items-center justify-center ml-4">
          <svg className="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
