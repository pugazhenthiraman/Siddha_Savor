'use client';

import { useState } from 'react';
import { Patient } from '@/lib/types';
import { useToast } from '@/lib/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { authService } from '@/lib/services/auth';
import { DIAGNOSIS_OPTIONS } from '@/lib/constants/diagnosis';

interface VitalsFormData {
  pulseRate?: number;
  heartRate?: number;
  temperature?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  randomBloodSugar?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  naadi?: string;
  thegi?: string;
  diagnosis?: string;
  medicines?: string[];
  notes?: string;
}

interface NewVitalsFormProps {
  patient: Patient;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewVitalsForm({ patient, onClose, onSuccess }: NewVitalsFormProps) {
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<VitalsFormData>({
    medicines: ['']
  });

  const calculateBMR = (weight: number, age: number, gender: string): number => {
    const isMale = gender.toLowerCase() === 'male';
    
    if (age >= 18 && age <= 30) {
      return isMale ? (0.0669 * weight + 2.28) : (0.0546 * weight + 2.33);
    } else if (age > 30 && age <= 60) {
      return isMale ? (0.0592 * weight + 2.48) : (0.0407 * weight + 2.90);
    } else if (age > 60) {
      return isMale ? (0.0563 * weight + 2.15) : (0.0424 * weight + 2.38);
    } else {
      return isMale ? (0.0669 * weight + 2.28) : (0.0546 * weight + 2.33);
    }
  };

  const calculateTDEE = (bmr: number, workType: string): number => {
    const activityFactors = {
      soft: 1.55,
      medium: 1.76,
      heavy: 2.10
    };
    
    const factor = activityFactors[workType as keyof typeof activityFactors] || 1.55;
    return bmr * factor;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const user = authService.getCurrentUser() as any;
      
      if (!user?.doctorUID) {
        error('Doctor information not found');
        return;
      }

      const personalInfo = patient.formData?.personalInfo || {};
      const age = personalInfo.age || 25;
      const gender = personalInfo.gender || 'male';
      const workType = personalInfo.workType || 'soft';

      let calculatedData = { ...formData };

      // Calculate BMR, TDEE if weight is provided
      if (formData.weight) {
        const bmr = calculateBMR(formData.weight, age, gender);
        const tdee = calculateTDEE(bmr, workType);

        calculatedData = {
          ...calculatedData,
          bmr: parseFloat(bmr.toFixed(2)),
          tdee: parseFloat(tdee.toFixed(2))
        };
      }

      const payload = {
        ...calculatedData,
        patientId: patient.id,
        doctorUID: user.doctorUID,
        recordedBy: `${personalInfo.firstName || 'Doctor'} ${personalInfo.lastName || ''}`
      };

      const response = await fetch('/api/doctor/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.success) {
        success('Vitals recorded successfully');
        onSuccess();
        onClose();
      } else {
        error(data.error || 'Failed to record vitals');
      }
    } catch (err) {
      error('Failed to record vitals');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: keyof VitalsFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div 
      className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-[110] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Record New Vitals</h2>
              <p className="text-sm text-gray-500">
                {patient.formData?.personalInfo?.firstName} {patient.formData?.personalInfo?.lastName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* Basic Vitals */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Vitals</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pulse Rate (bpm)</label>
                <input
                  type="number"
                  value={formData.pulseRate || ''}
                  onChange={(e) => updateFormData('pulseRate', parseInt(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white text-gray-900 placeholder-gray-500"
                  placeholder="e.g., 72"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Heart Rate (bpm)</label>
                <input
                  type="number"
                  value={formData.heartRate || ''}
                  onChange={(e) => updateFormData('heartRate', parseInt(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="e.g., 75"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°F)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature || ''}
                  onChange={(e) => updateFormData('temperature', parseFloat(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="e.g., 98.6"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Systolic BP (mmHg)</label>
                <input
                  type="number"
                  value={formData.bloodPressureSystolic || ''}
                  onChange={(e) => updateFormData('bloodPressureSystolic', parseInt(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="e.g., 120"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diastolic BP (mmHg)</label>
                <input
                  type="number"
                  value={formData.bloodPressureDiastolic || ''}
                  onChange={(e) => updateFormData('bloodPressureDiastolic', parseInt(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="e.g., 80"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight || ''}
                  onChange={(e) => updateFormData('weight', parseFloat(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white text-gray-900 placeholder-gray-500"
                  placeholder="e.g., 70.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Random Blood Sugar (mg/dL)</label>
                <input
                  type="number"
                  value={formData.randomBloodSugar || ''}
                  onChange={(e) => updateFormData('randomBloodSugar', parseInt(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white text-gray-900 placeholder-gray-500"
                  placeholder="e.g., 120"
                />
              </div>
            </div>
          </div>

          {/* Diagnosis */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Diagnosis</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient Diagnosis</label>
              <select
                value={formData.diagnosis || ''}
                onChange={(e) => updateFormData('diagnosis', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white text-gray-900"
              >
                <option value="">Select Diagnosis</option>
                {DIAGNOSIS_OPTIONS.map((diagnosis) => (
                  <option key={diagnosis} value={diagnosis}>
                    {diagnosis}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Siddha Assessment */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Siddha Assessment</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Naadi Assessment</label>
                <input
                  type="text"
                  value={formData.naadi || ''}
                  onChange={(e) => updateFormData('naadi', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Enter naadi assessment"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thegi Assessment</label>
                <select
                  value={formData.thegi || ''}
                  onChange={(e) => updateFormData('thegi', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white text-gray-900"
                >
                  <option value="">Select Thegi Type</option>
                  <option value="VATHAM">VATHAM</option>
                  <option value="PITHAM">PITHAM</option>
                  <option value="KABAM">KABAM</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
            <textarea
              rows={4}
              value={formData.notes || ''}
              onChange={(e) => updateFormData('notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white text-gray-900 placeholder-gray-500"
              placeholder="Add treatment notes, observations, recommendations..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Recording...' : 'Record Vitals'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
