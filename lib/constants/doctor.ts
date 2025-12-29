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

// Patient Management Constants
export const PATIENT_STATUS = {
  ACTIVE: 'ACTIVE',
  CURED: 'CURED',
  INACTIVE: 'INACTIVE',
} as const;

export const PATIENT_STATUS_LABELS = {
  [PATIENT_STATUS.ACTIVE]: 'Active Treatment',
  [PATIENT_STATUS.CURED]: 'Cured',
  [PATIENT_STATUS.INACTIVE]: 'Inactive',
} as const;

export const PATIENT_ACTIONS = {
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  VIEW_DETAILS: 'VIEW_DETAILS',
  UPDATE_DIAGNOSIS: 'UPDATE_DIAGNOSIS',
  SCHEDULE_VISIT: 'SCHEDULE_VISIT',
} as const;

// Doctor Stats Labels
export const DOCTOR_STATS_LABELS = {
  TOTAL_PATIENTS: 'Total Patients',
  ACTIVE_TREATMENTS: 'Active Treatments',
  CURED_PATIENTS: 'Cured Patients',
  PENDING_APPROVALS: 'Pending Approvals',
  THIS_MONTH_VISITS: 'This Month Visits',
  AVERAGE_RATING: 'Average Rating',
} as const;

// Patient Form Fields
export const PATIENT_FORM_FIELDS = [
  { key: 'firstName', label: 'First Name', type: 'text', required: true },
  { key: 'lastName', label: 'Last Name', type: 'text', required: true },
  { key: 'email', label: 'Email Address', type: 'email', required: true },
  { key: 'phone', label: 'Phone Number', type: 'tel', required: true },
  { key: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
  { key: 'gender', label: 'Gender', type: 'select', required: true },
  { key: 'address', label: 'Address', type: 'textarea', required: true },
  { key: 'city', label: 'City', type: 'text', required: true },
  { key: 'state', label: 'State', type: 'text', required: true },
  { key: 'pincode', label: 'PIN Code', type: 'text', required: true },
  { key: 'emergencyContact', label: 'Emergency Contact Name', type: 'text', required: true },
  { key: 'emergencyPhone', label: 'Emergency Contact Phone', type: 'tel', required: true },
] as const;

// Treatment & Diagnosis Constants
export const TREATMENT_TYPES = [
  { value: 'CONSULTATION', label: 'Consultation' },
  { value: 'MEDICINE', label: 'Medicine Prescription' },
  { value: 'THERAPY', label: 'Therapy Session' },
  { value: 'FOLLOW_UP', label: 'Follow-up Visit' },
] as const;

export const FOOD_CATEGORIES = [
  { value: 'GRAINS', label: 'Grains & Cereals' },
  { value: 'VEGETABLES', label: 'Vegetables' },
  { value: 'FRUITS', label: 'Fruits' },
  { value: 'DAIRY', label: 'Dairy Products' },
  { value: 'PROTEINS', label: 'Proteins' },
  { value: 'SPICES', label: 'Spices & Herbs' },
  { value: 'BEVERAGES', label: 'Beverages' },
] as const;

export const ACTIVITY_TYPES = [
  { value: 'YOGA', label: 'Yoga' },
  { value: 'MEDITATION', label: 'Meditation' },
  { value: 'WALKING', label: 'Walking' },
  { value: 'EXERCISE', label: 'Exercise' },
  { value: 'BREATHING', label: 'Breathing Exercises' },
  { value: 'MASSAGE', label: 'Massage Therapy' },
] as const;

// Button Labels
export const DOCTOR_BUTTONS = {
  GENERATE_INVITE: 'Generate Patient Invite',
  APPROVE_PATIENT: 'Approve Patient',
  REJECT_PATIENT: 'Reject Patient',
  VIEW_DETAILS: 'View Details',
  UPDATE_DIAGNOSIS: 'Update Diagnosis',
  SCHEDULE_VISIT: 'Schedule Visit',
  SAVE_CHANGES: 'Save Changes',
  CANCEL: 'Cancel',
  SEND_EMAIL: 'Send Email',
} as const;

// Empty States
export const DOCTOR_EMPTY_STATES = {
  NO_PATIENTS: 'No patients found',
  NO_PATIENTS_DESC: 'Generate invite links to add patients to your practice',
  NO_VISITS: 'No visits recorded',
  NO_DIAGNOSIS: 'No diagnosis available',
  NO_ACTIVITIES: 'No activities assigned',
  NO_FOODS: 'No food recommendations',
} as const;
