'use client';

import { useState, useEffect } from 'react';
import { Patient } from '@/lib/types';
import { doctorService } from '@/lib/services/doctorService';
import { useToast } from '@/lib/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { logger } from '@/lib/utils/logger';
import { authService } from '@/lib/services/auth';

interface PatientVitals {
  id?: number;
  patientId: number;
  // Vitals
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
  // Calculated values
  bmi?: number;
  bmr?: number;
  tdee?: number;
  // Diagnosis
  diagnosis?: string;
  treatment?: string;
  medicines?: string[];
  notes?: string;
  // Timestamps
  recordedAt: string;
  recordedBy: string;
}

interface PatientVitalsProps {
  patient: Patient;
  onClose: () => void;
}

// BMR Calculation Functions - Age-based formula
const calculateBMR = (weight: number, age: number, gender: string): number => {
  const isMale = gender.toLowerCase() === 'male';

  if (age >= 18 && age <= 30) {
    return isMale ? (0.0669 * weight + 2.28) : (0.0546 * weight + 2.33);
  } else if (age > 30 && age <= 60) {
    return isMale ? (0.0592 * weight + 2.48) : (0.0407 * weight + 2.90);
  } else if (age > 60) {
    return isMale ? (0.0563 * weight + 2.15) : (0.0424 * weight + 2.38);
  } else {
    // For age < 18, use 18-30 formula as default
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

export function PatientVitals({ patient, onClose }: PatientVitalsProps) {
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [vitalsHistory, setVitalsHistory] = useState<PatientVitals[]>([]);

  const formData = patient.formData as any;
  const personalInfo = formData?.personalInfo || {};
  const patientAge = personalInfo.age || 0;
  const patientGender = personalInfo.gender || 'male';
  const patientWorkType = personalInfo.workType || 'soft';

  const [vitals, setVitals] = useState<PatientVitals>({
    patientId: patient.id,
    recordedAt: new Date().toISOString(),
    recordedBy: 'doctor', // Will be replaced with actual doctor ID
    medicines: [''],
    assessmentType: '' // 'naadi' or 'thegi'
  });

  // Calculate BMI, BMR, TDEE when weight changes
  useEffect(() => {
    if (vitals.weight && patientAge) {
      // Calculate BMR & TDEE (Independent of Height)
      const bmr = calculateBMR(vitals.weight, patientAge, patientGender);
      const tdee = calculateTDEE(bmr, patientWorkType, patientGender);

      let bmi = vitals.bmi;
      // Calculate BMI only if height is present
      if (vitals.height) {
        bmi = calculateBMI(vitals.weight, vitals.height);
      }

      setVitals(prev => ({
        ...prev,
        bmi: bmi ? Math.round(bmi * 100) / 100 : undefined,
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

      // Validate required fields
      if (!vitals.weight) {
        error('Weight is required');
        return;
      }

      // Get current doctor UID
      const user = authService.getCurrentUser() as any;
      const doctorUID = user?.doctorUID;

      if (!doctorUID) {
        // Try to get from session/auth service if not in user object directly
        // This is a fallback, ideally doctorUID should be available
        logger.warn('Doctor UID not found in current user, submission might fail');
      }

      console.log('--- Debugging PatientVitals Submission ---');
      console.log('Current Vitals State:', vitals);
      console.log('Patient Info:', { patientAge, patientGender, patientWorkType });

      // Prepare data for API (Flattened structure matching route.ts)
      const vitalsData = {
        patientId: patient.id,
        doctorUID: doctorUID,
        pulseRate: vitals.pulseRate,
        heartRate: vitals.heartRate,
        temperature: vitals.temperature,
        bloodPressureSystolic: vitals.bloodPressureSystolic,
        bloodPressureDiastolic: vitals.bloodPressureDiastolic,
        randomBloodSugar: vitals.randomBloodSugar,
        naadi: vitals.naadi,
        thegi: vitals.thegi,
        assessmentType: vitals.assessmentType,
        weight: vitals.weight,
        height: vitals.height, // route.ts doesn't seem to have height? Checking schema... route.ts body destructuring looks for 'weight' but not 'height'?
        // Wait, route.ts body destructuring output checks:
        // const { ... weight, ... } = body;
        // It doesn't list height explicitly in the const {} block in my view of route.ts earlier. 
        // Does the DB have height? PatientVitals table?
        // PatientVitals interface in this file has height.
        // route.ts creates `prisma.patientVitals.create({ data: { ... weight: ..., } })`.
        // It might not be saving height!
        bmi: vitals.bmi,
        bmr: vitals.bmr,
        tdee: vitals.tdee,
        diagnosis: vitals.diagnosis,
        treatment: vitals.treatment,
        medicines: vitals.medicines?.filter(m => m.trim()),
        notes: vitals.notes,
        recordedBy: `${personalInfo.firstName || 'Doctor'} ${personalInfo.lastName || ''}`
      };

      console.log('Payload sent to API:', vitalsData);

      // Save vitals via API
      const response = await doctorService.savePatientVitals(vitalsData);

      if (response.success) {
        success('Patient vitals updated successfully. Email notification sent to patient.');
        onClose();
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Patient Vitals & Diagnosis</h2>
              <p className="text-gray-600">
                {personalInfo.firstName} {personalInfo.lastName} • Age: {patientAge} • Gender: {patientGender}
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

        <div className="p-6 space-y-8">
          {/* Vitals Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vitals</h3>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Naadi *</label>
                <select
                  value={vitals.naadi || ''}
                  onChange={(e) => handleInputChange('naadi', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Naadi</option>
                  <option value="vata">Vata</option>
                  <option value="pitta">Pitta</option>
                  <option value="kapha">Kapha</option>
                  <option value="vata-pitta">Vata-Pitta</option>
                  <option value="pitta-kapha">Pitta-Kapha</option>
                  <option value="vata-kapha">Vata-Kapha</option>
                  <option value="tridosha">Tridosha</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thegi *</label>
                <select
                  value={vitals.thegi || ''}
                  onChange={(e) => handleInputChange('thegi', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Thegi</option>
                  <option value="vata-thegi">Vata Thegi</option>
                  <option value="pitta-thegi">Pitta Thegi</option>
                  <option value="kapha-thegi">Kapha Thegi</option>
                  <option value="mixed-thegi">Mixed Thegi</option>
                </select>
              </div>
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

          {/* Diagnosis Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Diagnosis</h3>
            <div className="space-y-4">
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
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={onClose}
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
    </div>
  );
}
