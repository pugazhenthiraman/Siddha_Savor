'use client';

import { useState, useEffect } from 'react';
import { Patient } from '@/lib/types';
import { useToast } from '@/lib/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authService } from '@/lib/services/auth';
import { doctorService } from '@/lib/services/doctorService';

interface VitalsData {
  pulseRate?: number;
  heartRate?: number;
  temperature?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  naadi?: string;
  thegi?: string;
  weight?: number;
  height?: number;
  bmi?: number;
  bmr?: number;
  tdee?: number;
}

interface VitalsFormProps {
  patient: Patient;
}

export function VitalsForm({ patient }: VitalsFormProps) {
  const { success, error } = useToast();
  const [vitals, setVitals] = useState<VitalsData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [savedVitals, setSavedVitals] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  const formData = patient.formData as any;
  const personalInfo = formData?.personalInfo || {};
  const patientAge = personalInfo.age || 25;
  const patientGender = personalInfo.gender || 'male';
  const patientWorkType = personalInfo.workType || 'medium';

  // Load existing vitals on component mount
  useEffect(() => {
    const loadVitals = async () => {
      try {
        const response = await doctorService.getPatientVitals(patient.id);
        if (response.success && response.vitals && response.vitals.length > 0) {
          const latest = response.vitals[0];
          setSavedVitals(latest);
        }
      } catch (error) {
        console.error('Failed to load vitals:', error);
      }
    };
    
    loadVitals();
  }, [patient.id]);

  // BMR Calculation
  const calculateBMR = (weight: number, height: number, age: number, gender: string): number => {
    const isMale = gender.toLowerCase() === 'male';
    
    if (age >= 18 && age <= 30) {
      return isMale ? (0.0669 * weight + 2.28) : (0.0546 * weight + 2.33);
    } else if (age > 30 && age <= 60) {
      return isMale ? (0.0592 * weight + 2.48) : (0.0407 * weight + 2.90);
    } else {
      return isMale ? (0.0563 * weight + 2.15) : (0.0424 * weight + 2.38);
    }
  };

  // TDEE Calculation
  const calculateTDEE = (bmr: number, workType: string, gender: string): number => {
    const isMale = gender.toLowerCase() === 'male';
    const factors = {
      soft: isMale ? 1.55 : 1.56,
      medium: isMale ? 1.76 : 1.64,
      heavy: isMale ? 2.10 : 1.82
    };
    
    const factor = factors[workType as keyof typeof factors] || factors.medium;
    return bmr * factor;
  };

  const handleInputChange = (field: keyof VitalsData, value: any) => {
    setVitals(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate BMI, BMR, TDEE when weight/height changes
      if ((field === 'weight' || field === 'height') && updated.weight && updated.height) {
        const bmi = parseFloat((updated.weight / Math.pow(updated.height / 100, 2)).toFixed(1));
        const bmr = parseFloat(calculateBMR(updated.weight, updated.height, patientAge, patientGender).toFixed(2));
        const tdee = parseFloat(calculateTDEE(bmr, patientWorkType, patientGender).toFixed(2));
        
        updated.bmi = bmi;
        updated.bmr = bmr;
        updated.tdee = tdee;
      }
      
      return updated;
    });
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      if (!vitals.weight) {
        error('Weight is required');
        return;
      }

      if (!vitals.bloodPressureSystolic || !vitals.bloodPressureDiastolic) {
        error('Blood pressure is required');
        return;
      }

      if (!vitals.naadi && !vitals.thegi) {
        error('Either Naadi or Thegi assessment is required');
        return;
      }

      const user = authService.getCurrentUser() as any;
      if (!user?.doctorUID) {
        error('Doctor UID not found');
        return;
      }

      const vitalsData = {
        patientId: patient.id,
        doctorUID: user.doctorUID,
        pulseRate: vitals.pulseRate || null,
        heartRate: vitals.heartRate || null,
        temperature: vitals.temperature || null,
        bloodPressureSystolic: vitals.bloodPressureSystolic || null,
        bloodPressureDiastolic: vitals.bloodPressureDiastolic || null,
        weight: vitals.weight,
        height: vitals.height || null,
        bmi: vitals.bmi || null,
        bmr: vitals.bmr || null,
        tdee: vitals.tdee || null,
        naadi: vitals.naadi || null,
        thegi: vitals.thegi || null,
        assessmentType: vitals.naadi ? 'naadi' : 'thegi',
        medicines: [],
        notes: null,
        recordedBy: `${personalInfo.firstName} ${personalInfo.lastName}`.trim() || user.email
      };

      const response = isEditing 
        ? await doctorService.updatePatientVitals(vitalsData)
        : await doctorService.savePatientVitals(vitalsData);
      
      if (response && response.success) {
        success(isEditing ? 'Vitals updated successfully' : 'Vitals saved successfully');
        setSavedVitals(response.vitals?.[0] || response.data || vitalsData);
        setIsEditing(false);
        setVitals({});
      } else {
        error(response?.error || 'Failed to save vitals');
      }
    } catch (err) {
      error(`Failed to save vitals: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Saved Vitals Display */}
      {savedVitals && !isEditing && (
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-green-900">Latest Vitals</h3>
            <Button
              onClick={() => {
                setVitals(savedVitals);
                setIsEditing(true);
              }}
              variant="outline"
              size="sm"
            >
              Edit
            </Button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold">{savedVitals.pulseRate}</div>
              <div className="text-xs text-gray-500">Pulse (bpm)</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{savedVitals.heartRate}</div>
              <div className="text-xs text-gray-500">Heart Rate (bpm)</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{savedVitals.temperature}°F</div>
              <div className="text-xs text-gray-500">Temperature</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{savedVitals.bloodPressureSystolic}/{savedVitals.bloodPressureDiastolic}</div>
              <div className="text-xs text-gray-500">Blood Pressure</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{savedVitals.weight} kg</div>
              <div className="text-xs text-gray-500">Weight</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{savedVitals.height} cm</div>
              <div className="text-xs text-gray-500">Height</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-900">{savedVitals.bmi}</div>
              <div className="text-xs text-gray-500">BMI</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-900">{savedVitals.bmr}</div>
              <div className="text-xs text-gray-500">BMR (MJ/day)</div>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded border">
              <div className="text-sm font-medium text-gray-700 mb-1">Naadi Assessment</div>
              <div className="text-lg font-semibold text-indigo-900">{savedVitals.naadi || 'Not assessed'}</div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="text-sm font-medium text-gray-700 mb-1">Thegi Assessment</div>
              <div className="text-lg font-semibold text-indigo-900">{savedVitals.thegi || 'Not assessed'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Vitals Form */}
      {(!savedVitals || isEditing) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium mb-4">Patient Vitals</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Pulse Rate (bpm)</label>
              <Input
                type="number"
                value={vitals.pulseRate || ''}
                onChange={(e) => handleInputChange('pulseRate', parseInt(e.target.value) || undefined)}
                placeholder="72"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Heart Rate (bpm)</label>
              <Input
                type="number"
                value={vitals.heartRate || ''}
                onChange={(e) => handleInputChange('heartRate', parseInt(e.target.value) || undefined)}
                placeholder="75"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Temperature (°F)</label>
              <Input
                type="number"
                step="0.1"
                value={vitals.temperature || ''}
                onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value) || undefined)}
                placeholder="98.6"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Blood Pressure Systolic *</label>
              <Input
                type="number"
                value={vitals.bloodPressureSystolic || ''}
                onChange={(e) => handleInputChange('bloodPressureSystolic', parseInt(e.target.value) || undefined)}
                placeholder="120"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Blood Pressure Diastolic *</label>
              <Input
                type="number"
                value={vitals.bloodPressureDiastolic || ''}
                onChange={(e) => handleInputChange('bloodPressureDiastolic', parseInt(e.target.value) || undefined)}
                placeholder="80"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Weight (kg) *</label>
              <Input
                type="number"
                value={vitals.weight || ''}
                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || undefined)}
                placeholder="70"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Height (cm)</label>
              <Input
                type="number"
                value={vitals.height || ''}
                onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || undefined)}
                placeholder="170"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Naadi Assessment *</label>
              <select
                value={vitals.naadi || ''}
                onChange={(e) => handleInputChange('naadi', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select Naadi</option>
                <option value="vatha">Vatha</option>
                <option value="pitha">Pitha</option>
                <option value="kapha">Kapha</option>
                <option value="vatha-pitha">Vatha-Pitha</option>
                <option value="pitha-kapha">Pitha-Kapha</option>
                <option value="vatha-kapha">Vatha-Kapha</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Thegi Assessment *</label>
              <select
                value={vitals.thegi || ''}
                onChange={(e) => handleInputChange('thegi', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select Thegi</option>
                <option value="vatha-thegi">Vatha Thegi</option>
                <option value="pitha-thegi">Pitha Thegi</option>
                <option value="kapha-thegi">Kapha Thegi</option>
              </select>
            </div>
          </div>

          {/* Calculations Display */}
          {vitals.bmi && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Calculated Values</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-900">{vitals.bmi}</div>
                  <div className="text-sm font-medium text-blue-700 mb-1">BMI</div>
                  <div className="text-xs text-blue-600">
                    {vitals.bmi < 18.5 ? 'Underweight' : 
                     vitals.bmi < 25 ? 'Normal' : 
                     vitals.bmi < 30 ? 'Overweight' : 'Obese'}
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-900">{vitals.bmr}</div>
                  <div className="text-sm font-medium text-green-700 mb-1">BMR (MJ/day)</div>
                  <div className="text-xs text-green-600">
                    Age: {patientAge <= 30 ? '18-30' : patientAge <= 60 ? '30-60' : '60+'} years
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-900">{vitals.tdee}</div>
                  <div className="text-sm font-medium text-purple-700 mb-1">TDEE (MJ/day)</div>
                  <div className="text-xs text-purple-600">
                    Activity: {patientWorkType === 'soft' ? 'Mild' : patientWorkType === 'medium' ? 'Moderate' : 'Heavy'}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={isLoading || !vitals.weight || (!vitals.naadi && !vitals.thegi) || !vitals.bloodPressureSystolic || !vitals.bloodPressureDiastolic}
              className="flex-1"
            >
              {isEditing ? 'Update Vitals' : 'Save Vitals'}
            </Button>
            {isEditing && (
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setVitals({});
                }}
                variant="outline"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
