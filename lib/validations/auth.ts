import { z } from 'zod';
import { ERROR_MESSAGES } from '@/lib/constants/messages';

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_FIELD)
    .email(ERROR_MESSAGES.INVALID_EMAIL),
  password: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_FIELD)
    .min(6, ERROR_MESSAGES.PASSWORD_MIN_LENGTH),
});

// Registration validation schema
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_FIELD)
    .email(ERROR_MESSAGES.INVALID_EMAIL),
  password: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_FIELD)
    .min(6, ERROR_MESSAGES.PASSWORD_MIN_LENGTH)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      ERROR_MESSAGES.PASSWORD_WEAK
    ),
  confirmPassword: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_FIELD),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Change password validation schema
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_FIELD),
  newPassword: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_FIELD)
    .min(6, ERROR_MESSAGES.PASSWORD_MIN_LENGTH)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      ERROR_MESSAGES.PASSWORD_WEAK
    ),
  confirmNewPassword: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_FIELD),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'New passwords do not match',
  path: ['confirmNewPassword'],
});

// Export types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
