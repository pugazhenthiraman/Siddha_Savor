/**
 * Centralized Type Definitions
 * All shared TypeScript types and interfaces
 */

// =====================
// API Types
// =====================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: any;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

// =====================
// User & Auth Types
// =====================

export type UserRole = 'admin' | 'doctor' | 'patient';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  createdAt: string;
  [key: string]: any; // Allow additional fields
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token?: string;
}

// =====================
// Doctor Types
// =====================

export type DoctorStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Doctor {
  id: number;
  doctorUID: string | null;
  email: string;
  status: DoctorStatus;
  formData: DoctorFormData;
  inviteToken: string | null;
  createdAt: string;
  updatedAt: string;
  patients?: Patient[];
}

export interface DoctorFormData {
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
  };
  professionalInfo?: {
    medicalLicense?: string;
    specialization?: string;
    experience?: string;
    qualification?: string;
  };
  practiceInfo?: {
    clinicName?: string;
    clinicNumber?: string;
    clinicAddress?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
}

// =====================
// Patient Types
// =====================

export type PatientStatus = 'ACTIVE' | 'CURED' | 'INACTIVE';

export interface Patient {
  id: number;
  email: string;
  password?: string | null;
  formData: PatientFormData;
  inviteToken: string | null;
  doctorUID: string | null;
  doctor?: Doctor;
  status?: PatientStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PatientFormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

// =====================
// Invite Types
// =====================

export type InviteRole = 'DOCTOR' | 'PATIENT';

export interface InviteLink {
  id: number;
  token: string;
  role: InviteRole;
  doctorUID: string | null;
  createdBy: string;
  recipientEmail?: string | null;
  recipientName?: string | null;
  isUsed: boolean;
  usedAt?: string | null;
  expiresAt: string;
  createdAt: string;
}

export interface InviteData {
  recipientEmail?: string;
  recipientName?: string;
  role?: InviteRole;
  [key: string]: unknown;
}

// =====================
// Admin Types
// =====================

export interface DashboardStats {
  totalDoctors: number;
  totalPatients: number;
  curedPatients: number;
  pendingApprovals: number;
  activeInvites: number;
  systemHealth: number;
}

// =====================
// SMTP Types
// =====================

export interface SMTPConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  isActive: boolean;
  updatedAt?: string;
}

export interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

// =====================
// Form Types
// =====================

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'password' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

// =====================
// Utility Types
// =====================

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

