/**
 * Admin Dashboard Constants
 * Centralized constants for admin-related components and functionality
 */

// Admin Navigation Tabs
export interface AdminTab {
  id: string;
  name: string;
  icon: string;
  mobileIcon?: string;
}

export const ADMIN_TABS: AdminTab[] = [
  { id: 'overview', name: 'Overview', icon: '📊', mobileIcon: '📊' },
  { id: 'approvals', name: 'Approvals', icon: '👨‍⚕️', mobileIcon: '✅' },
  { id: 'invites', name: 'Invites', icon: '🔗', mobileIcon: '🔗' },
  { id: 'doctors', name: 'Doctors', icon: '👥', mobileIcon: '👥' },
  { id: 'patients', name: 'Patients', icon: '🏥', mobileIcon: '🏥' },
  { id: 'settings', name: 'Settings', icon: '⚙️', mobileIcon: '⚙️' },
];

// Confirmation Modal Configuration
export interface ConfirmationModalConfig {
  title: string;
  message: string;
  description: string;
  confirmText: string;
  confirmClass: string;
  bgClass: string;
}

export const CONFIRMATION_MODAL_CONFIG: Record<'approve' | 'reject' | 'revert', ConfirmationModalConfig> = {
  approve: {
    title: '✅ Confirm Approval',
    message: 'Are you sure you want to approve Dr. {name}?',
    description: 'This will send a welcome email and grant dashboard access.',
    confirmText: 'Yes, Approve',
    confirmClass: 'bg-green-600 hover:bg-green-700',
    bgClass: 'bg-green-50 border-green-200'
  },
  reject: {
    title: '❌ Confirm Rejection',
    message: 'Are you sure you want to reject Dr. {name}?',
    description: 'This will send a rejection email with your remarks.',
    confirmText: 'Yes, Reject',
    confirmClass: 'bg-red-600 hover:bg-red-700',
    bgClass: 'bg-red-50 border-red-200'
  },
  revert: {
    title: '🔄 Confirm Status Change',
    message: 'Change status for Dr. {name}?',
    description: 'This will update their status and send a notification email.',
    confirmText: 'Yes, Change Status',
    confirmClass: 'bg-blue-600 hover:bg-blue-700',
    bgClass: 'bg-blue-50 border-blue-200'
  }
};

// Doctor Status Options
export const DOCTOR_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type DoctorStatus = typeof DOCTOR_STATUS[keyof typeof DOCTOR_STATUS];

export const DOCTOR_STATUS_OPTIONS = [
  { value: DOCTOR_STATUS.PENDING, label: 'Pending', color: 'yellow' },
  { value: DOCTOR_STATUS.APPROVED, label: 'Approved', color: 'green' },
  { value: DOCTOR_STATUS.REJECTED, label: 'Rejected', color: 'red' },
] as const;

// Admin Dashboard Labels
export const ADMIN_LABELS = {
  DASHBOARD_TITLE: 'Admin Dashboard',
  DASHBOARD_SUBTITLE: 'Healthcare Management',
  USER_ROLE: 'Admin',
  USER_ROLE_MOBILE: 'Administrator',
} as const;

// Filter Options
export const DOCTOR_FILTER_ALL = 'ALL';
export const DOCTOR_FILTER_OPTIONS = [
  { value: DOCTOR_FILTER_ALL, label: 'All Status' },
  { value: DOCTOR_STATUS.PENDING, label: 'Pending' },
  { value: DOCTOR_STATUS.APPROVED, label: 'Approved' },
  { value: DOCTOR_STATUS.REJECTED, label: 'Rejected' },
] as const;

// Helper function to get status badge color classes
export const getStatusBadgeClasses = (status: string): string => {
  switch (status) {
    case DOCTOR_STATUS.PENDING:
      return 'bg-yellow-100 text-yellow-800';
    case DOCTOR_STATUS.APPROVED:
      return 'bg-green-100 text-green-800';
    case DOCTOR_STATUS.REJECTED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Button Labels
export const BUTTON_LABELS = {
  // Common Actions
  CANCEL: 'Cancel',
  CLOSE: 'Close',
  SAVE: 'Save',
  DELETE: 'Delete',
  EDIT: 'Edit',
  VIEW: 'View',
  SUBMIT: 'Submit',
  CONFIRM: 'Confirm',
  
  // Doctor Actions
  APPROVE_DOCTOR: '✅ Approve Doctor',
  REJECT_APPLICATION: '❌ Reject Application',
  QUICK_APPROVE: '✅ Quick Approve',
  VIEW_DETAILS: '👁️ View Details',
  REVERT_TO_PENDING: '🔄 Revert to Pending',
  CHANGE_TO_REJECTED: '❌ Change to Rejected',
  CHANGE_TO_APPROVED: '✅ Change to Approved',
  REAPPROVE_DOCTOR: '✅ Reapprove Doctor',
  DEACTIVATE_DOCTOR: 'Deactivate Doctor',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  DOCTOR_APPROVED: 'Doctor approved successfully! Welcome email sent.',
  DOCTOR_REJECTED: 'Doctor application rejected. Notification email sent.',
  DOCTOR_STATUS_CHANGED: (status: string) => `Doctor status changed to ${status}. Notification email sent.`,
  CONFIGURATION_SAVED: 'Configuration saved successfully',
  EMAIL_SENT: 'Email sent successfully',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  APPROVE_DOCTOR_FAILED: 'Failed to approve doctor',
  REJECT_DOCTOR_FAILED: 'Failed to reject doctor',
  CHANGE_STATUS_FAILED: 'Failed to change doctor status',
  LOAD_DOCTORS_FAILED: 'Failed to load doctors',
  GENERIC_ERROR: 'An error occurred. Please try again.',
} as const;

// Form Labels & Placeholders
export const FORM_LABELS = {
  REASON_FOR_REJECTION: 'Reason for Rejection *',
  REJECTION_REASON_PLACEHOLDER: 'Please provide a detailed reason for rejection...',
  REJECTION_REASON_REQUIRED: 'Rejection reason is required',
  PREVIEW: 'Preview:',
  SEARCH_PLACEHOLDER: 'Search by name, email, qualification, or license...',
} as const;

// Section Titles
export const SECTION_TITLES = {
  PERSONAL_INFORMATION: 'Personal Information',
  PROFESSIONAL_INFORMATION: 'Professional Information',
  PRACTICE_INFORMATION: 'Practice Information',
  ACCOUNT_SECURITY: 'Account Security',
} as const;

// Empty State Messages
export const EMPTY_STATE_MESSAGES = {
  NO_DOCTORS: 'No Doctors Yet',
  NO_RESULTS: 'No Results Found',
  NO_PENDING_APPROVALS: 'No pending approvals',
  LOADING: 'Loading doctors...',
} as const;

// Status Action Labels
export const STATUS_ACTION_LABELS: Record<string, Record<string, string>> = {
  [DOCTOR_STATUS.PENDING]: {
    action: 'Approve or Reject',
    description: 'Review and take action on this application',
  },
  [DOCTOR_STATUS.APPROVED]: {
    action: 'Change Status',
    description: 'Doctor is approved and active',
  },
  [DOCTOR_STATUS.REJECTED]: {
    action: 'Change Status',
    description: 'Doctor application was rejected',
  },
} as const;

// Invite Generator Constants
export const INVITE_GENERATOR = {
  TITLE: 'Generate Invite Link',
  DESCRIPTION: 'Create secure registration links for new users',
  GENERATE_BUTTON: (role: string) => `Generate ${role} Invite Link`,
  GENERATING: 'Generating...',
  SEND_EMAIL: '📧 Send Email',
  CANCEL: 'Cancel',
  EMAIL_LABEL: 'Recipient Email',
  NAME_LABEL: 'Recipient Name',
} as const;

// Admin Action Messages
export const ADMIN_ACTION_MESSAGES = {
  STATUS_CHANGED_BY_ADMIN: 'Status changed by admin',
} as const;

