/**
 * Application Configuration
 * Centralized configuration values
 */

import { env } from '@/lib/env';

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || '',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  STATS_TTL: 60 * 1000, // 1 minute
  DOCTOR_LIST_TTL: 5 * 60 * 1000, // 5 minutes
  PATIENT_LIST_TTL: 5 * 60 * 1000, // 5 minutes
} as const;

// File Upload Configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword'],
} as const;

// Session Configuration
export const SESSION_CONFIG = {
  COOKIE_NAME: 'siddha_session',
  MAX_AGE: 7 * 24 * 60 * 60, // 7 days
  HTTP_ONLY: true,
  SECURE: env.isProduction(),
  SAME_SITE: 'lax' as const,
} as const;

// Email Configuration
export const EMAIL_CONFIG = {
  FROM_NAME: 'Siddha Savor',
  FROM_EMAIL: env.ADMIN_EMAIL,
  INVITE_EXPIRY_HOURS: 72,
  PASSWORD_RESET_EXPIRY_HOURS: 24,
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  EMAIL_MAX_LENGTH: 255,
  NAME_MAX_LENGTH: 100,
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 15,
} as const;

// Feature Flags
export const FEATURES = {
  ENABLE_2FA: false,
  ENABLE_EMAIL_VERIFICATION: true,
  ENABLE_PASSWORD_RESET: true,
  ENABLE_INVITE_SYSTEM: true,
} as const;

