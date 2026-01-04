// Vitals-related TypeScript interfaces

export interface VitalsRecord {
  id: number;
  patientId: number;
  doctorUID: string;
  pulseRate?: number;
  heartRate?: number;
  temperature?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  randomBloodSugar?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  bmr?: number;
  tdee?: number;
  naadi?: string;
  thegi?: string;
  assessmentType?: 'naadi' | 'thegi';
  medicines?: any[];
  notes?: string;
  recordedAt: string;
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
  doctor?: {
    doctorUID: string;
    formData: any;
  };
}

export interface VitalsFormData {
  pulseRate?: number;
  heartRate?: number;
  temperature?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  randomBloodSugar?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  naadi?: string;
  thegi?: string;
  assessmentType?: 'naadi' | 'thegi';
  medicines?: string[];
  notes?: string;
}

export interface PatientPersonalInfo {
  firstName?: string;
  lastName?: string;
  age?: number;
  gender?: 'male' | 'female';
  workType?: 'soft' | 'medium' | 'heavy';
  email?: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface PatientFormData {
  personalInfo?: PatientPersonalInfo;
  [key: string]: any;
}

export type VitalsFilterType = 'all' | 'updated' | 'pending';
export type VitalsViewMode = 'list' | 'edit' | 'new';
