/**
 * Patient Dashboard Constants
 * Centralized constants for patient-related components and functionality
 */

// Patient Registration Form Fields
export interface PatientFormField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'password' | 'textarea';
  required?: boolean;
  placeholder?: string;
  section: 'personal' | 'contact' | 'emergency' | 'security';
}

export const PATIENT_FORM_FIELDS: PatientFormField[] = [
  // Personal Information
  { key: 'firstName', label: 'First Name', type: 'text', required: true, section: 'personal' },
  { key: 'lastName', label: 'Last Name', type: 'text', required: true, section: 'personal' },
  { key: 'email', label: 'Email Address', type: 'email', required: true, section: 'personal' },
  { key: 'phone', label: 'Phone Number', type: 'tel', required: true, section: 'personal' },
  { key: 'dateOfBirth', label: 'Date of Birth', type: 'date', section: 'personal' },
  { key: 'gender', label: 'Gender', type: 'select', section: 'personal' },
  
  // Contact Information
  { key: 'address', label: 'Address', type: 'textarea', section: 'contact' },
  { key: 'city', label: 'City', type: 'text', section: 'contact' },
  { key: 'state', label: 'State', type: 'text', section: 'contact' },
  { key: 'pincode', label: 'Pincode', type: 'text', section: 'contact' },
  
  // Emergency Contact
  { key: 'emergencyContact', label: 'Emergency Contact Name', type: 'text', section: 'emergency' },
  { key: 'emergencyPhone', label: 'Emergency Contact Phone', type: 'tel', section: 'emergency' },
  
  // Account Security
  { key: 'password', label: 'Password', type: 'password', required: true, section: 'security' },
  { key: 'confirmPassword', label: 'Confirm Password', type: 'password', required: true, section: 'security' },
];

// Gender Options (shared with doctor)
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
] as const;

// Validation Rules
export const PATIENT_VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PHONE_REGEX: /^[+]?[0-9]{10,15}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// Patient Status Options
export const PATIENT_STATUS = {
  ACTIVE: 'ACTIVE',
  CURED: 'CURED',
  INACTIVE: 'INACTIVE',
} as const;

export type PatientStatus = typeof PATIENT_STATUS[keyof typeof PATIENT_STATUS];

export const PATIENT_STATUS_OPTIONS = [
  { value: PATIENT_STATUS.ACTIVE, label: 'Active', color: 'green' },
  { value: PATIENT_STATUS.CURED, label: 'Cured', color: 'blue' },
  { value: PATIENT_STATUS.INACTIVE, label: 'Inactive', color: 'gray' },
] as const;

// Form Sections
export const PATIENT_FORM_SECTIONS = {
  PERSONAL: 'Personal Information',
  CONTACT: 'Contact Information',
  EMERGENCY: 'Emergency Contact',
  SECURITY: 'Account Security',
} as const;

// Patient Navigation Tabs
export interface PatientTab {
  id: string;
  label: string;
  icon: string;
}

export const PATIENT_TABS: PatientTab[] = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'appointments', label: 'Appointments', icon: '📅' },
  { id: 'prescriptions', label: 'Prescriptions', icon: '💊' },
  { id: 'profile', label: 'Profile', icon: '👤' },
];

// Patient Dashboard Labels
export const PATIENT_LABELS = {
  DASHBOARD_TITLE: 'Welcome, {name}',
  DASHBOARD_SUBTITLE: 'Patient Portal • Siddha Savor',
  USER_ROLE: 'Patient',
} as const;

