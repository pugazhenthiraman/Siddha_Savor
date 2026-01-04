'use client';

import { useState, useEffect } from 'react';
import { Patient } from '@/lib/types';
import { useToast } from '@/lib/hooks/useToast';

interface VitalsDebugProps {
  patient: Patient;
  onClose: () => void;
}

export function VitalsDebug({ patient, onClose }: VitalsDebugProps) {
  const { success, error } = useToast();
  const [vitalsData, setVitalsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVitals();
  }, [patient.id]);

  const fetchVitals = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching vitals for patient:', patient.id);
      
      const response = await fetch(`/api/doctor/vitals?patientId=${patient.id}`);
      const data = await response.json();
      
      console.log('Vitals API Response:', data);
      setVitalsData(data);
      
      if (!data.success) {
        error('Failed to load vitals');
      }
    } catch (err) {
      console.error('Error fetching vitals:', err);
      error('Failed to load vitals');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Vitals Debug - Patient {patient.id}</h2>
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading vitals...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">API Response:</h3>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(vitalsData, null, 2)}
                </pre>
              </div>
              
              {vitalsData?.vitals && vitalsData.vitals.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Vitals Records ({vitalsData.vitals.length}):</h3>
                  {vitalsData.vitals.map((record: any, index: number) => (
                    <div key={record.id || index} className="border p-4 rounded mb-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><strong>ID:</strong> {record.id}</div>
                        <div><strong>Recorded:</strong> {new Date(record.recordedAt).toLocaleString()}</div>
                        <div><strong>Pulse:</strong> {record.pulseRate || 'N/A'}</div>
                        <div><strong>Weight:</strong> {record.weight || 'N/A'}</div>
                        <div><strong>BMI:</strong> {record.bmi || 'N/A'}</div>
                        <div><strong>Naadi:</strong> {record.naadi || 'N/A'}</div>
                        <div><strong>Notes:</strong> {record.notes || 'N/A'}</div>
                        <div><strong>Doctor:</strong> {record.recordedBy}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <button 
                onClick={fetchVitals}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Refresh Data
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
