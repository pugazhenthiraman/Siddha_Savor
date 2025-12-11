export const ERROR_MESSAGES = {
  // Validation Errors
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters',
  PASSWORD_WEAK: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  
  // Authentication Errors
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_LOCKED: 'Account has been locked due to multiple failed attempts',
  ACCOUNT_DISABLED: 'Your account has been disabled. Please contact support',
  SESSION_EXPIRED: 'Your session has expired. Please login again',
  UNAUTHORIZED: 'You are not authorized to access this resource',
  
  // Network Errors
  NETWORK_ERROR: 'Network error. Please check your connection and try again',
  SERVER_ERROR: 'Server error. Please try again later',
  TIMEOUT_ERROR: 'Request timeout. Please try again',
  
  // Generic Errors
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again',
  MAINTENANCE_MODE: 'System is under maintenance. Please try again later',
} as const;

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful! Redirecting to dashboard...',
  LOGOUT_SUCCESS: 'You have been logged out successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
} as const;

export const INFO_MESSAGES = {
  LOADING: 'Loading...',
  PROCESSING: 'Processing your request...',
  SAVING: 'Saving changes...',
  REDIRECTING: 'Redirecting...',
} as const;
