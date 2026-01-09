'use client';

import { useState, useEffect } from 'react';
import { Patient } from '@/lib/types';
import { useToast } from '@/lib/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { doctorService } from '@/lib/services/doctorService';

interface DiagnosisData {
  diagnosis: string;
  treatment: string;
  medicines: string[];
  notes: string;
}

interface DiagnosisFormProps {
  patient: Patient;
}

export function DiagnosisForm({ patient }: DiagnosisFormProps) {
  const { success, error } = useToast();
  const [diagnosis, setDiagnosis] = useState<DiagnosisData>({
    diagnosis: '',
    treatment: '',
    medicines: [''],
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [latestVitals, setLatestVitals] = useState<any>(null);

  // Load latest vitals on component mount
  useEffect(() => {
    const loadVitals = async () => {
      try {
        const response = await doctorService.getPatientVitals(patient.id);
        if (response.success && (response as any).vitals && (response as any).vitals.length > 0) {
          const vitals = (response as any).vitals[0];
          console.log('[DiagnosisForm Debug] Loaded latest vitals:', vitals);
          setLatestVitals(vitals);
          if (vitals.diagnosis) {
            console.log('[DiagnosisForm Debug] Pre-filling diagnosis:', vitals.diagnosis);
            setDiagnosis(prev => ({ ...prev, diagnosis: vitals.diagnosis }));
          }
        }
      } catch (error) {
        console.error('Failed to load vitals:', error);
      }
    };

    loadVitals();
  }, [patient.id]);

  const handleMedicineChange = (index: number, value: string) => {
    const updated = [...diagnosis.medicines];
    updated[index] = value;
    setDiagnosis(prev => ({ ...prev, medicines: updated }));
  };

  const addMedicine = () => {
    setDiagnosis(prev => ({
      ...prev,
      medicines: [...prev.medicines, '']
    }));
  };

  const removeMedicine = (index: number) => {
    if (diagnosis.medicines.length > 1) {
      const updated = diagnosis.medicines.filter((_, i) => i !== index);
      setDiagnosis(prev => ({ ...prev, medicines: updated }));
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      if (!diagnosis.diagnosis.trim()) {
        error('Diagnosis is required');
        return;
      }

      if (!latestVitals || !latestVitals.id) {
        error('No vitals record found to update diagnosis');
        return;
      }

      const user = (window as any).currentUser; // Fallback or use auth service if available
      // Ideally use authService.getCurrentUser() but it might need import.
      // Based on VitalsForm, we can use doctorService.updatePatientVitals

      const payload = {
        ...latestVitals,
        diagnosis: diagnosis.diagnosis,
        treatment: diagnosis.treatment,
        medicines: diagnosis.medicines.filter(m => m.trim()),
        notes: diagnosis.notes ?
          (latestVitals.notes ? latestVitals.notes + '\n\n' + diagnosis.notes : diagnosis.notes)
          : latestVitals.notes
      };

      console.log('[DiagnosisForm Debug] Submitting update payload:', payload);

      const response = await doctorService.updatePatientVitals(payload);

      if (response && response.success) {
        success('Diagnosis updated successfully');
        // Update local state to reflect changes
        setLatestVitals((prev: any) => ({ ...prev, ...payload }));
      } else {
        error(response?.error || 'Failed to update diagnosis');
      }
    } catch (err) {
      console.error(err);
      error('Failed to save diagnosis');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Vitals Summary */}
      {latestVitals && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4">
          <h2 className="text-lg font-medium text-blue-900 mb-4">Patient Vitals Summary</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded border text-center">
              <div className="text-xl font-bold text-blue-900">{latestVitals.bmi || 'N/A'}</div>
              <div className="text-xs text-gray-500">BMI</div>
              {latestVitals.bmi && (
                <div className="text-xs text-blue-600 mt-1">
                  {latestVitals.bmi < 18.5 ? 'Underweight' :
                    latestVitals.bmi < 25 ? 'Normal' :
                      latestVitals.bmi < 30 ? 'Overweight' : 'Obese'}
                </div>
              )}
            </div>

            <div className="bg-white p-3 rounded border text-center">
              <div className="text-xl font-bold text-green-900">{latestVitals.bmr || 'N/A'}</div>
              <div className="text-xs text-gray-500">BMR (MJ/day)</div>
              <div className="text-xs text-green-600 mt-1">Basal Metabolic Rate</div>
            </div>

            <div className="bg-white p-3 rounded border text-center">
              <div className="text-xl font-bold text-purple-900">{latestVitals.tdee || 'N/A'}</div>
              <div className="text-xs text-gray-500">TDEE (MJ/day)</div>
              <div className="text-xs text-purple-600 mt-1">Total Daily Energy</div>
            </div>

            <div className="bg-white p-3 rounded border text-center">
              <div className="text-lg font-bold text-indigo-900">{latestVitals.naadi || latestVitals.thegi || 'N/A'}</div>
              <div className="text-xs text-gray-500">Siddha Assessment</div>
              <div className="text-xs text-indigo-600 mt-1">{latestVitals.assessmentType || 'N/A'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Diagnosis Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Diagnosis & Treatment</h2>

        <div className="space-y-4">
          {/* Diagnosis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagnosis <span className="text-red-500">*</span>
            </label>
            <textarea
              value={diagnosis.diagnosis}
              onChange={(e) => setDiagnosis(prev => ({ ...prev, diagnosis: e.target.value }))}
              placeholder="Enter patient diagnosis..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              required
            />
          </div>

          {/* Treatment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Treatment Plan</label>
            <textarea
              value={diagnosis.treatment}
              onChange={(e) => setDiagnosis(prev => ({ ...prev, treatment: e.target.value }))}
              placeholder="Enter treatment plan..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Medicines */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Medicines</label>
            <div className="space-y-2">
              {diagnosis.medicines.map((medicine, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={medicine}
                    onChange={(e) => handleMedicineChange(index, e.target.value)}
                    placeholder={`Medicine ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {diagnosis.medicines.length > 1 && (
                    <button
                      onClick={() => removeMedicine(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addMedicine}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                <span>+</span> Add Medicine
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
            <textarea
              value={diagnosis.notes}
              onChange={(e) => setDiagnosis(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes or observations..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>
        </div>

        <div className="mt-6">
          <Button
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={isLoading || !diagnosis.diagnosis.trim()}
            className="w-full sm:w-auto"
          >
            Save Diagnosis
          </Button>
        </div>
      </div>
    </div>
  );
}
