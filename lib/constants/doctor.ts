/**
 * Doctor Dashboard Constants
 * Centralized constants for doctor-related components and functionality
 */

// Doctor Navigation Tabs
export interface DoctorTab {
  id: string;
  label: string;
  icon: string;
}

export const DOCTOR_TABS: DoctorTab[] = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'patients', label: 'Patients', icon: '👥' },
  { id: 'appointments', label: 'Appointments', icon: '📅' },
  { id: 'prescriptions', label: 'Prescriptions', icon: '💊' },
  { id: 'profile', label: 'Profile', icon: '👤' },
];

// Doctor Registration Form Fields
export interface DoctorFormField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'password' | 'textarea';
  required?: boolean;
  placeholder?: string;
  section: 'personal' | 'professional' | 'practice' | 'security';
}

export const DOCTOR_FORM_FIELDS: DoctorFormField[] = [
  // Personal Information
  { key: 'firstName', label: 'First Name', type: 'text', required: true, section: 'personal' },
  { key: 'lastName', label: 'Last Name', type: 'text', required: true, section: 'personal' },
  { key: 'email', label: 'Email Address', type: 'email', required: true, section: 'personal' },
  { key: 'phone', label: 'Phone Number', type: 'tel', required: true, section: 'personal' },
  { key: 'dateOfBirth', label: 'Date of Birth', type: 'date', section: 'personal' },
  { key: 'gender', label: 'Gender', type: 'select', section: 'personal' },
  
  // Professional Information
  { key: 'medicalLicense', label: 'Medical License Number', type: 'text', required: true, section: 'professional' },
  { key: 'specialization', label: 'Specialization', type: 'text', required: true, section: 'professional' },
  { key: 'experience', label: 'Years of Experience', type: 'text', section: 'professional' },
  { key: 'qualification', label: 'Qualification', type: 'text', section: 'professional' },
  
  // Practice Information
  { key: 'clinicName', label: 'Clinic Name', type: 'text', section: 'practice' },
  { key: 'clinicNumber', label: 'Clinic Phone', type: 'tel', section: 'practice' },
  { key: 'clinicAddress', label: 'Clinic Address', type: 'textarea', section: 'practice' },
  { key: 'city', label: 'City', type: 'text', section: 'practice' },
  { key: 'state', label: 'State', type: 'text', section: 'practice' },
  { key: 'pincode', label: 'Pincode', type: 'text', section: 'practice' },
  
  // Account Security
  { key: 'password', label: 'Password', type: 'password', required: true, section: 'security' },
  { key: 'confirmPassword', label: 'Confirm Password', type: 'password', required: true, section: 'security' },
];

// Gender Options
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
] as const;

// Siddha Qualification Options
export const SIDDHA_QUALIFICATIONS = [
  { value: 'BACHELORS', label: 'Bachelor\'s (BSMS)' },
  { value: 'MASTERS', label: 'Master\'s (MD/MS/M.Phil)' },
] as const;

// Validation Rules
export const DOCTOR_VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PHONE_REGEX: /^[+]?[0-9]{10,15}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// Doctor Dashboard Labels
export const DOCTOR_LABELS = {
  DASHBOARD_TITLE: 'Dr. {name}',
  DASHBOARD_SUBTITLE: '{doctorUID} • Siddha Savor',
  USER_ROLE: 'Healthcare Professional',
} as const;

// Form Sections
export const DOCTOR_FORM_SECTIONS = {
  PERSONAL: 'Personal Information',
  PROFESSIONAL: 'Professional Information',
  PRACTICE: 'Practice Information',
  SECURITY: 'Account Security',
} as const;

