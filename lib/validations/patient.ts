import { z } from 'zod';

// Patient Registration Schema
export const PatientRegistrationSchema = z.object({
  // Personal Information (Required)
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string()
    .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits')
    .transform(val => val.replace(/\D/g, '')), // Remove non-digits
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'Please select a gender' })
  }),
  
  // Contact Information (Optional)
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string()
    .regex(/^\d{6}$/, 'Pincode must be exactly 6 digits')
    .optional()
    .or(z.literal('')),
  
  // Emergency Contact (Required)
  emergencyContact: z.string().min(1, 'Emergency contact name is required').max(100, 'Name too long'),
  emergencyPhone: z.string()
    .regex(/^\d{10}$/, 'Emergency phone must be exactly 10 digits')
    .transform(val => val.replace(/\D/g, '')), // Remove non-digits
  
  // Account Security (Required)
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
  
  // Doctor Assignment
  doctorID: z.string().optional(),
  
  // Optional fields
  age: z.number().optional(),
  occupation: z.string().optional(),
  customOccupation: z.string().optional(),
  workType: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export type PatientRegistrationData = z.infer<typeof PatientRegistrationSchema>;
