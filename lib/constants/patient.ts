// Gender Options (shared with doctor)
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
] as const;

// Occupation Options
export const OCCUPATION_OPTIONS = [
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'business', label: 'Business' },
  { value: 'other', label: 'Other' },
] as const;

// Work Type Options (for Siddha treatment planning)
export const WORK_TYPE_OPTIONS = [
  { value: 'soft', label: 'Soft Work (Mild Activity - Desk job, minimal physical activity)' },
  { value: 'medium', label: 'Medium Work (Moderate Activity - Regular physical activity)' },
  { value: 'hard', label: 'Hard Work (Heavy Activity - Intense physical labor)' },
] as const;

// Form Sections
export const PATIENT_FORM_SECTIONS = {
  PERSONAL: 'Personal Information',
  CONTACT: 'Contact Information',
  EMERGENCY: 'Emergency Contact',
  SECURITY: 'Account Security',
} as const;

// Validation Rules
export const PATIENT_VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PHONE_REGEX: /^[+]?[0-9]{10,15}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;
