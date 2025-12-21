/**
 * Barrel Export - Main Library Entry Point
 * Import commonly used items from here
 * 
 * Note: Use specific imports to avoid naming conflicts
 * Example: import { User, Doctor } from '@/lib/types'
 */

// Types - Import from '@/lib/types' directly
export type {
  ApiResponse,
  ApiError,
  User,
  UserRole,
  LoginCredentials,
  LoginResponse,
  Doctor,
  DoctorStatus,
  DoctorFormData,
  Patient,
  PatientStatus,
  PatientFormData,
  InviteLink,
  InviteRole,
  DashboardStats,
  SMTPConfig,
  EmailRequest,
} from './types';

// Services
export { apiClient } from './services/api';
export type { ApiResponse as ApiResponseType } from './services/api';
export { adminService } from './services/adminService';
export { authService } from './services/auth';
export { smtpService } from './services/smtpService';

// Constants - Import from specific files to avoid conflicts
export {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  INFO_MESSAGES,
} from './constants/messages';

export {
  ADMIN_TABS,
  CONFIRMATION_MODAL_CONFIG,
  DOCTOR_STATUS,
  DOCTOR_STATUS_OPTIONS,
  DOCTOR_FILTER_ALL,
  DOCTOR_FILTER_OPTIONS,
  ADMIN_LABELS,
  BUTTON_LABELS,
  SUCCESS_MESSAGES as ADMIN_SUCCESS_MESSAGES,
  ERROR_MESSAGES as ADMIN_ERROR_MESSAGES,
  FORM_LABELS,
  SECTION_TITLES,
  EMPTY_STATE_MESSAGES,
  getStatusBadgeClasses,
} from './constants/admin';

export {
  DOCTOR_TABS,
  DOCTOR_FORM_FIELDS,
  GENDER_OPTIONS,
  DOCTOR_VALIDATION,
  DOCTOR_LABELS,
  DOCTOR_FORM_SECTIONS,
} from './constants/doctor';

export {
  PATIENT_FORM_FIELDS,
  PATIENT_VALIDATION,
  PATIENT_STATUS,
  PATIENT_STATUS_OPTIONS,
  PATIENT_FORM_SECTIONS,
  PATIENT_LABELS,
} from './constants/patient';

// Utilities
export { cn } from './utils';
export { logger } from './utils/logger';

// Database
export { prisma } from './prisma';
// Note: checkDatabaseConnection is in lib/db.ts (if using Prisma adapter)
// For now, import prisma directly from './prisma'

// Config
export {
  API_CONFIG,
  PAGINATION,
  CACHE_CONFIG,
  UPLOAD_CONFIG,
  SESSION_CONFIG,
  EMAIL_CONFIG,
  VALIDATION_RULES,
  FEATURES,
} from './config';

// Middleware
export {
  AppError,
  handleApiError,
  withErrorHandler,
} from './middleware/api-error-handler';

export {
  requireAuth,
  requireRole,
  getUserByEmail,
} from './middleware/auth';
export type { AuthContext } from './middleware/auth';

// Hooks
export { useToast } from './hooks/useToast';
export { useErrorHandler } from './hooks/useErrorHandler';
export { useInviteLink } from './hooks/useInviteLink';

