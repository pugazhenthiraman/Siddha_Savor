export const ERROR_MESSAGES = {
  // Validation Errors
  REQUIRED_FIELD: 'This field is required',
  ALL_FIELDS_REQUIRED: 'All fields are required',
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters',
  PASSWORD_WEAK: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  
  // Authentication Errors - Generic
  INVALID_CREDENTIALS: 'Email or password is incorrect',
  INVALID_EMAIL_FORMAT: 'Please enter a valid email address',
  INVALID_PASSWORD: 'Password is incorrect',
  EMAIL_NOT_FOUND: 'No account found with this email address',
  EMAIL_ALREADY_EXISTS: 'This email is already registered. Please use a different email or try logging in.',
  ACCOUNT_LOCKED: 'Account has been locked due to multiple failed attempts',
  ACCOUNT_DISABLED: 'Your account has been disabled. Please contact support',
  SESSION_EXPIRED: 'Your session has expired. Please login again',
  UNAUTHORIZED: 'You are not authorized to access this resource',
  
  // Role-specific Authentication Errors
  ADMIN_NOT_FOUND: 'Admin account not found with this email',
  ADMIN_INVALID_PASSWORD: 'Incorrect admin password',
  DOCTOR_NOT_FOUND: 'Doctor account not found with this email',
  DOCTOR_INVALID_PASSWORD: 'Incorrect doctor password',
  DOCTOR_PENDING_APPROVAL: 'Your doctor account is pending admin approval',
  DOCTOR_REJECTED: 'Your doctor account has been rejected. Contact admin for details',
  DOCTOR_REJECTED_REREGISTER: 'Your application was rejected. Please update your information and register with new link through email for approval.',
  DOCTOR_NOT_APPROVED: 'Your doctor account is not approved yet',
  PATIENT_NOT_FOUND: 'Patient account not found with this email',
  PATIENT_INVALID_PASSWORD: 'Incorrect patient password',
  PATIENT_NOT_REGISTERED: 'Please complete your registration first',
  PATIENT_PENDING_APPROVAL: 'Your patient registration is pending doctor approval. Please wait for your doctor to approve your registration.',
  PATIENT_REJECTED: 'Your patient registration has been rejected. Please contact your doctor for details',
  PATIENT_REJECTED_REREGISTER: 'Your application was rejected. Please update your information and register again.',
  DOCTOR_ID_NOT_FOUND: 'Doctor ID not found. Please check and try again.',
  DOCTOR_ID_REQUIRED: 'Doctor ID is required for registration',
  
  // Network Errors
  NETWORK_ERROR: 'Network error. Please check your connection and try again',
  SERVER_ERROR: 'Server error. Please try again later',
  TIMEOUT_ERROR: 'Request timeout. Please try again',
  DATABASE_ERROR: 'Database connection error. Please try again later',
  
  // Generic Errors
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again',
  MAINTENANCE_MODE: 'System is under maintenance. Please try again later',
} as const;

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful! Redirecting to dashboard...',
  ADMIN_LOGIN_SUCCESS: 'Welcome back, Admin! Redirecting to admin dashboard...',
  DOCTOR_LOGIN_SUCCESS: 'Welcome back, Doctor! Redirecting to your practice dashboard...',
  PATIENT_LOGIN_SUCCESS: 'Welcome back! Redirecting to your patient portal...',
  LOGOUT_SUCCESS: 'You have been logged out successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  REGISTRATION_SUCCESS: 'Registration successful! Please wait for admin approval.',
  REGISTRATION_SUCCESS_PATIENT: 'Registration successful! You can now log in.',
} as const;

export const INFO_MESSAGES = {
  LOADING: 'Loading...',
  PROCESSING: 'Processing your request...',
  SAVING: 'Saving changes...',
  REDIRECTING: 'Redirecting...',
  SIGN_IN: 'Sign In',
} as const;

// Validation Error Messages
export const VALIDATION_MESSAGES = {
  REQUIRED_FIRST_NAME: 'Please enter your first name',
  REQUIRED_LAST_NAME: 'Please enter your last name',
  REQUIRED_EMAIL: 'Please enter your email address',
  INVALID_EMAIL: 'Please enter a valid email address',
  REQUIRED_PHONE: 'Please enter your phone number',
  INVALID_PHONE: 'Please enter a valid phone number (10-15 digits)',
  REQUIRED_MEDICAL_LICENSE: 'Please enter your medical license number',
  REQUIRED_QUALIFICATION: 'Please select your Siddha qualification',
  REQUIRED_PASSWORD: 'Please create a password',
  REQUIRED_CONFIRM_PASSWORD: 'Please confirm your password',
  PASSWORD_MISMATCH: 'Passwords do not match',
  REQUIRED_TERMS: 'Please accept the terms and conditions to continue',
  PASSWORD_MIN_LENGTH: (min: number) => `Password must be at least ${min} characters long`,
} as const;

// Registration Form Labels
export const REGISTRATION_LABELS = {
  DOCTOR_TITLE: 'Doctor Registration',
  DOCTOR_SUBTITLE: 'Join our Siddha Ayurveda network',
  SUBMIT_BUTTON: 'Complete Registration',
  SUBMITTING: 'Submitting Registration...',
  ALREADY_HAVE_ACCOUNT: 'Already have an account?',
  SIGN_IN_LINK: 'Sign in here',
  SELECT_GENDER: 'Select Gender',
  SELECT_QUALIFICATION: 'Select Qualification',
  PASSWORD_REQUIREMENTS: 'Password must be at least 8 characters long and include letters and numbers.',
  TERMS_TEXT: 'I agree to the',
  TERMS_LINK: 'Terms and Conditions',
  PRIVACY_LINK: 'Privacy Policy',
  TERMS_CONFIRMATION: 'I confirm that all information provided is accurate and I have the right to practice medicine.',
} as const;

// Form Labels
export const FORM_LABELS = {
  EMAIL_ADDRESS: 'Email Address',
  PASSWORD: 'Password',
  FIRST_NAME: 'First Name',
  LAST_NAME: 'Last Name',
  PHONE_NUMBER: 'Phone Number',
  DATE_OF_BIRTH: 'Date of Birth',
  GENDER: 'Gender',
  CONFIRM_PASSWORD: 'Confirm Password',
  ADDRESS: 'Address',
  CITY: 'City',
  STATE: 'State',
  PIN_CODE: 'PIN Code',
  EMERGENCY_CONTACT_NAME: 'Emergency Contact Name',
  EMERGENCY_CONTACT_PHONE: 'Emergency Contact Phone',
  MEDICAL_LICENSE_NUMBER: 'Medical License Number',
  SPECIALIZATION: 'Specialization',
  YEARS_OF_EXPERIENCE: 'Years of Experience',
  SIDDHA_QUALIFICATION: 'Siddha Qualification',
  CLINIC_NAME: 'Clinic/Hospital Name',
  CLINIC_PHONE: 'Clinic Phone Number',
  CLINIC_ADDRESS: 'Clinic Address',
  DOCTOR_ID: 'Doctor ID',
} as const;

// Form Placeholders
export const FORM_PLACEHOLDERS = {
  EMAIL: 'admin@siddhasavor.com',
  EMAIL_DOCTOR: 'doctor@example.com',
  EMAIL_PATIENT: 'your.email@example.com',
  PASSWORD: 'Enter your password',
  PASSWORD_CREATE: 'Create a strong password',
  PASSWORD_CONFIRM: 'Confirm your password',
  FIRST_NAME: 'Enter your first name',
  LAST_NAME: 'Enter your last name',
  PHONE: '+91 9876543210',
  ADDRESS: 'Enter your address',
  CITY: 'e.g., Chennai, Mumbai, Bangalore',
  CITY_CLINIC: 'e.g., Chennai, Coimbatore',
  STATE: 'e.g., Tamil Nadu, Maharashtra',
  PIN_CODE: 'e.g., 600001',
  EMERGENCY_CONTACT_NAME: 'Enter emergency contact name',
  EMERGENCY_CONTACT_PHONE: 'Enter emergency contact phone',
  MEDICAL_LICENSE: 'e.g., BSMS/12345/2020',
  SPECIALIZATION: 'e.g., Siddha Medicine, Panchakosha Chikitsa',
  EXPERIENCE: 'Years in Siddha practice',
  CLINIC_NAME: 'e.g., Siddha Wellness Center, Ayush Clinic',
  CLINIC_PHONE: 'e.g., +91 9876543210',
  CLINIC_ADDRESS: 'Enter complete clinic address',
  RECIPIENT_EMAIL: 'doctor@example.com',
  DOCTOR_ID: 'Enter your doctor ID (e.g., DOC001)',
  RECIPIENT_NAME: 'Dr. John Smith',
} as const;

// Empty State Messages
export const EMPTY_STATE = {
  NOT_PROVIDED: 'Not provided',
  NOT_SPECIFIED: 'Not specified',
  YEARS: 'years',
} as const;

// Qualification Display Mapping
export const QUALIFICATION_LABELS: Record<string, string> = {
  'BACHELORS': 'Bachelor\'s (BSMS)',
  'MASTERS': 'Master\'s (MD/MS/M.Phil)',
} as const;

// SMTP Settings Labels & Placeholders
export const SMTP_LABELS = {
  HOST: 'SMTP Host (Gmail Pre-configured)',
  PORT: 'Port (587 - Free Gmail)',
  GMAIL_ADDRESS: 'Gmail Address',
  GMAIL_APP_PASSWORD: 'Gmail App Password',
  FROM_EMAIL: 'From Email (Same as Gmail)',
  FROM_NAME: 'From Name',
  TEST_EMAIL: 'Test Email Address',
  GENERATE_APP_PASSWORD: '🔑 Generate Gmail App Password',
} as const;

export const SMTP_PLACEHOLDERS = {
  HOST: 'smtp.gmail.com',
  PORT: '587',
  GMAIL_ADDRESS: 'your-email@gmail.com',
  APP_PASSWORD: '16-character app password',
  FROM_EMAIL: 'your-email@gmail.com',
  FROM_NAME: 'Siddha Savor',
  TEST_EMAIL: 'Enter email to test (e.g., your-email@gmail.com)',
} as const;

export const SMTP_HELP_TEXT = {
  HOST: 'Gmail is recommended for free usage',
  PORT: 'Port 587 works with free Gmail accounts',
  GMAIL_ADDRESS: 'Your Gmail address',
  FROM_EMAIL: 'Must match your Gmail address',
  TEST_CONNECTION_STEP: 'Test Connection: Click "Test Connection" button',
  ENABLE_SENDING_STEP: 'Enable Sending: Check "Enable email sending"',
} as const;

export const SMTP_BUTTONS = {
  TEST_CONNECTION: '🔍 Test Connection',
  TESTING: 'Testing...',
  SAVE_CONFIG: '💾 Save Configuration',
  SAVING: 'Saving...',
  SEND_TEST_EMAIL: '📤 Send Test Email',
  SENDING: 'Sending...',
} as const;

// Invite Generator Buttons
export const INVITE_BUTTONS = {
  SEND_EMAIL: '📧 Send Invitation Email',
  SENDING_EMAIL: 'Sending Email...',
} as const;

// Dashboard Stats Titles
export const STAT_TITLES = {
  TOTAL_DOCTORS: 'Total Doctors',
  TOTAL_PATIENTS: 'Total Patients',
  CURED_PATIENTS: 'Cured Patients',
  PENDING_APPROVALS: 'Pending Approvals',
  TODAY_APPOINTMENTS: "Today's Appointments",
  PENDING_REVIEWS: 'Pending Reviews',
  COMPLETED_TODAY: 'Completed Today',
  THIS_WEEK_PATIENTS: 'This Week Patients',
  MONTHLY_REVENUE: 'Monthly Revenue',
} as const;

// Role Selector Labels
export const ROLE_LABELS = {
  DOCTOR: 'Doctor',
  DOCTOR_DESCRIPTION: 'Medical Professional',
  PATIENT: 'Patient',
  PATIENT_DESCRIPTION: 'Healthcare Recipient',
} as const;

// Error Messages
export const ERROR_PAGE_MESSAGES = {
  DEFAULT_TITLE: "Oops! Something went wrong",
  DEFAULT_MESSAGE: "We're having trouble connecting to our servers. Please check your connection and try again.",
  TRY_AGAIN: 'Try Again',
  RETRYING: 'Retrying...',
  APPLICATION_ERROR_TITLE: 'Application Error',
  APPLICATION_ERROR_MESSAGE: 'Something went wrong in the application. Please try refreshing the page.',
} as const;

// Doctor Approvals Empty States
export const DOCTOR_APPROVALS_EMPTY = {
  ADJUST_SEARCH: 'Try adjusting your search or filter criteria',
  NO_APPLICATIONS: 'Doctor applications will appear here once submitted',
  FAILED_LOAD_DOCTORS: 'Failed to load doctors',
} as const;
// Login Help Messages
export const LOGIN_HELP_MESSAGES = {
  ADMIN_HELP: 'Use your admin email and password to access the admin dashboard',
  DOCTOR_HELP: 'Use your registered doctor email and password. Account must be approved by admin',
  PATIENT_HELP: 'Use your registered patient email and password to access your health records',
  FORGOT_PASSWORD: 'Forgot your password? Contact support for assistance',
  REGISTRATION_HELP: 'Don\'t have an account? You need an invitation link to register',
} as const;

// Role-specific Login Instructions
export const ROLE_LOGIN_INSTRUCTIONS = {
  ADMIN: {
    TITLE: 'Admin Login',
    DESCRIPTION: 'Access the administrative dashboard',
    DEFAULT_EMAIL: 'admin@siddhasavor.com',
    HELP_TEXT: 'Use your admin credentials to manage the platform',
  },
  DOCTOR: {
    TITLE: 'Doctor Login', 
    DESCRIPTION: 'Access your practice dashboard',
    HELP_TEXT: 'Your account must be approved by admin before you can login',
  },
  PATIENT: {
    TITLE: 'Patient Login',
    DESCRIPTION: 'Access your health records and appointments',
    HELP_TEXT: 'Login with the credentials you created during registration',
  },
} as const;

// Authentication Status Messages
export const AUTH_STATUS_MESSAGES = {
  CHECKING_CREDENTIALS: 'Verifying your credentials...',
  LOGGING_IN: 'Logging you in...',
  REDIRECTING: 'Redirecting to your dashboard...',
  INVALID_ATTEMPT: 'Login attempt failed. Please check your credentials.',
} as const;
