'use client';

import { useState, useEffect } from 'react';
import { Patient } from '@/lib/types';
import { doctorService } from '@/lib/services/doctorService';
import { useToast } from '@/lib/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { logger } from '@/lib/utils/logger';
import { calculateAge, formatAge } from '@/lib/utils/dateUtils';

interface PatientVitals {
  id?: number;
  patientId: number;
  pulseRate?: number;
  heartRate?: number;
  temperature?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  randomBloodSugar?: number;
  naadi?: string;
  thegi?: string;
  assessmentType?: string; // 'naadi' or 'thegi'
  weight?: number;
  height?: number;
  bmi?: number;
  bmr?: number;
  tdee?: number;
  diagnosis?: string;
  treatment?: string;
  medicines?: string[];
  notes?: string;
  recordedAt: string;
  recordedBy: string;
}

interface PatientVitalsTabProps {
  patient: Patient;
  onBack: () => void;
}

// BMR Calculation Functions - Age-based formula
const calculateBMR = (weight: number, height: number, age: number, gender: string): number => {
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

const calculateTDEE = (bmr: number, workType: string, gender: string): number => {
  const activityFactors = {
    male: { soft: 1.55, medium: 1.76, heavy: 2.10 },
    female: { soft: 1.56, medium: 1.64, heavy: 1.82 }
  };
  
  const genderKey = gender.toLowerCase() === 'male' ? 'male' : 'female';
  const activityKey = workType as keyof typeof activityFactors.male;
  const factor = activityFactors[genderKey][activityKey] || 1.55;
  
  return bmr * factor;
};

const calculateBMI = (weight: number, height: number): number => {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

export function PatientVitalsTab({ patient, onBack }: PatientVitalsTabProps) {
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'vitals' | 'diagnosis'>('vitals');
  
  const formData = patient.formData as any;
  const personalInfo = formData?.personalInfo || {};
  const patientAge = personalInfo.age || 0;
  const patientGender = personalInfo.gender || 'male';
  const patientWorkType = personalInfo.workType || 'soft';

  const [vitals, setVitals] = useState<PatientVitals>({
    patientId: patient.id,
    recordedAt: new Date().toISOString(),
    recordedBy: 'doctor',
    medicines: [''],
    assessmentType: '' // 'naadi' or 'thegi'
  });

  // Calculate BMI, BMR, TDEE when weight/height changes
  useEffect(() => {
    if (vitals.weight && vitals.height && patientAge) {
      const bmi = calculateBMI(vitals.weight, vitals.height);
      const bmr = calculateBMR(vitals.weight, vitals.height, patientAge, patientGender);
      const tdee = calculateTDEE(bmr, patientWorkType, patientGender);
      
      setVitals(prev => ({
        ...prev,
        bmi: Math.round(bmi * 100) / 100,
        bmr: Math.round(bmr * 100) / 100,
        tdee: Math.round(tdee * 100) / 100
      }));
    }
  }, [vitals.weight, vitals.height, patientAge, patientGender, patientWorkType]);

  const handleInputChange = (field: keyof PatientVitals, value: any) => {
    setVitals(prev => ({ ...prev, [field]: value }));
  };

  const handleMedicineChange = (index: number, value: string) => {
    const newMedicines = [...(vitals.medicines || [''])];
    newMedicines[index] = value;
    setVitals(prev => ({ ...prev, medicines: newMedicines }));
  };

  const addMedicine = () => {
    setVitals(prev => ({ 
      ...prev, 
      medicines: [...(prev.medicines || ['']), ''] 
    }));
  };

  const removeMedicine = (index: number) => {
    const newMedicines = (vitals.medicines || ['']).filter((_, i) => i !== index);
    setVitals(prev => ({ ...prev, medicines: newMedicines.length ? newMedicines : [''] }));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      if (!vitals.weight || !vitals.height) {
        error('Weight and height are required for BMR calculation');
        return;
      }

      const vitalsData = {
        patientId: patient.id,
        vitals: {
          pulseRate: vitals.pulseRate,
          heartRate: vitals.heartRate,
          temperature: vitals.temperature,
          bloodPressureSystolic: vitals.bloodPressureSystolic,
          bloodPressureDiastolic: vitals.bloodPressureDiastolic,
          randomBloodSugar: vitals.randomBloodSugar,
          naadi: vitals.naadi,
          thegi: vitals.thegi,
          weight: vitals.weight,
          height: vitals.height,
          bmi: vitals.bmi,
          bmr: vitals.bmr,
          tdee: vitals.tdee
        },
        diagnosis: vitals.diagnosis,
        treatment: vitals.treatment,
        medicines: vitals.medicines?.filter(m => m.trim()),
        notes: vitals.notes
      };

      const response = await doctorService.savePatientVitals(vitalsData);
      
      if (response.success) {
        success('Patient vitals updated successfully. Email notification sent to patient.');
        onBack();
      } else {
        error(response.error || 'Failed to save patient vitals');
      }
    } catch (err) {
      logger.error('Failed to save patient vitals', err);
      error('Failed to save patient vitals');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {personalInfo.firstName} {personalInfo.lastName}
              </h2>
              <p className="text-gray-600">
                Age: {patientAge} • Gender: {patientGender} • Activity: {patientWorkType}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Patient ID</p>
            <p className="font-medium text-gray-900">{patient.id}</p>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveSubTab('vitals')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeSubTab === 'vitals'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>🩺</span>
                <span>Vitals & Measurements</span>
              </span>
            </button>
            
            <button
              onClick={() => setActiveSubTab('diagnosis')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeSubTab === 'diagnosis'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>📋</span>
                <span>Diagnosis & Treatment</span>
              </span>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeSubTab === 'vitals' && (
            <div className="space-y-8">
              {/* Vitals Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vital Signs</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pulse Rate (bpm)</label>
                    <Input
                      type="number"
                      value={vitals.pulseRate || ''}
                      onChange={(e) => handleInputChange('pulseRate', parseInt(e.target.value) || undefined)}
                      placeholder="72"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Heart Rate (bpm)</label>
                    <Input
                      type="number"
                      value={vitals.heartRate || ''}
                      onChange={(e) => handleInputChange('heartRate', parseInt(e.target.value) || undefined)}
                      placeholder="75"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Temperature (°F)</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={vitals.temperature || ''}
                      onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value) || undefined)}
                      placeholder="98.6"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blood Pressure (Systolic)</label>
                    <Input
                      type="number"
                      value={vitals.bloodPressureSystolic || ''}
                      onChange={(e) => handleInputChange('bloodPressureSystolic', parseInt(e.target.value) || undefined)}
                      placeholder="120"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blood Pressure (Diastolic)</label>
                    <Input
                      type="number"
                      value={vitals.bloodPressureDiastolic || ''}
                      onChange={(e) => handleInputChange('bloodPressureDiastolic', parseInt(e.target.value) || undefined)}
                      placeholder="80"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Random Blood Sugar (mg/dL)</label>
                    <Input
                      type="number"
                      value={vitals.randomBloodSugar || ''}
                      onChange={(e) => handleInputChange('randomBloodSugar', parseInt(e.target.value) || undefined)}
                      placeholder="100"
                    />
                  </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Siddha Assessment</label>
                <select
                  value={vitals.assessmentType || ''}
                  onChange={(e) => handleInputChange('assessmentType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Assessment</option>
                  <option value="naadi">Naadi</option>
                  <option value="thegi">Thegi</option>
                </select>
              </div>
                </div>
              </div>

              {/* Measurements */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Body Measurements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg) *</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={vitals.weight || ''}
                      onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || undefined)}
                      placeholder="70"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm) *</label>
                    <Input
                      type="number"
                      value={vitals.height || ''}
                      onChange={(e) => handleInputChange('height', parseInt(e.target.value) || undefined)}
                      placeholder="170"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Calculated Values */}
              {vitals.bmi && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Calculated Values</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-blue-700 mb-1">BMI</label>
                      <p className="text-2xl font-bold text-blue-900">{vitals.bmi}</p>
                      <p className="text-xs text-blue-600">
                        {vitals.bmi < 18.5 ? 'Underweight' : 
                         vitals.bmi < 25 ? 'Normal' : 
                         vitals.bmi < 30 ? 'Overweight' : 'Obese'}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-green-700 mb-1">BMR (MJ/day)</label>
                      <p className="text-2xl font-bold text-green-900">{vitals.bmr}</p>
                      <p className="text-xs text-green-600">
                        Age-based formula: {patientAge <= 30 ? '18-30' : patientAge <= 60 ? '30-60' : '60+'} years
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-purple-700 mb-1">TDEE (MJ/day)</label>
                      <p className="text-2xl font-bold text-purple-900">{vitals.tdee}</p>
                      <p className="text-xs text-purple-600">
                        BMR × Activity Factor ({patientWorkType === 'soft' ? 'Mild' : patientWorkType === 'medium' ? 'Moderate' : 'Heavy'})
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'diagnosis' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
                <textarea
                  value={vitals.diagnosis || ''}
                  onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                  placeholder="Enter diagnosis..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Treatment Plan</label>
                <textarea
                  value={vitals.treatment || ''}
                  onChange={(e) => handleInputChange('treatment', e.target.value)}
                  placeholder="Enter treatment plan..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Medicines</label>
                {(vitals.medicines || ['']).map((medicine, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={medicine}
                      onChange={(e) => handleMedicineChange(index, e.target.value)}
                      placeholder="Medicine name and dosage"
                      className="flex-1"
                    />
                    {vitals.medicines && vitals.medicines.length > 1 && (
                      <button
                        onClick={() => removeMedicine(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addMedicine}
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  + Add Medicine
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={vitals.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={onBack}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={isLoading}
          >
            Save & Notify Patient
          </Button>
        </div>
      </div>
    </div>
  );
}
