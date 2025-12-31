import { apiClient, ApiResponse } from './api';
import { logger } from '@/lib/utils/logger';

// Admin Dashboard Types
export interface DashboardStats {
  totalDoctors: number;
  totalPatients: number;
  curedPatients: number;
  pendingApprovals: number;
  activeInvites: number;
  systemHealth: number;
}

export interface Doctor {
  id: number;
  doctorUID: string | null;
  email: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  formData: any;
  inviteToken: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: number;
  patientUID: string | null;
  email: string;
  formData: any;
  doctorUID: string | null;
  doctor?: Doctor;
  status?: 'ACTIVE' | 'CURED' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface InviteLink {
  id: number;
  token: string;
  role: 'DOCTOR' | 'PATIENT';
  doctorUID: string | null;
  expiresAt: string;
  createdAt: string;
}

class AdminService {
  private readonly ENDPOINTS = {
    STATS: '/api/admin/stats',
    DOCTORS: '/api/admin/doctors',
    PATIENTS: '/api/admin/patients',
    INVITES: '/api/admin/invites',
    APPROVE_DOCTOR: '/api/admin/doctors/approve',
    REJECT_DOCTOR: '/api/admin/doctors/reject',
    REVERT_DOCTOR: '/api/admin/doctors/revert',
  } as const;

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      logger.info('Fetching dashboard statistics');
      
      // Use longer timeout for stats API (20 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      
      const response = await fetch('/api/admin/stats', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      logger.info('Dashboard statistics fetched successfully', { stats: result.data });
      
      return result;
    } catch (error) {
      logger.error('Failed to fetch dashboard statistics', error);
      throw error;
    }
  }

  /**
   * Get all doctors with filters
   */
  async getDoctors(status?: string): Promise<ApiResponse<Doctor[]>> {
    try {
      const params = status ? `?status=${status}` : '';
      logger.info('Fetching doctors', { status, endpoint: `${this.ENDPOINTS.DOCTORS}${params}` });
      
      const response = await apiClient.get<Doctor[]>(`${this.ENDPOINTS.DOCTORS}${params}`);
      logger.info('Doctors fetched successfully', { count: response.data?.length });
      return response;
    } catch (error) {
      logger.error('Failed to fetch doctors', error, { status });
      throw error;
    }
  }

  /**
   * Get pending doctor approvals
   */
  async getPendingDoctors(): Promise<ApiResponse<Doctor[]>> {
    try {
      logger.info('Fetching pending doctor approvals');
      return this.getDoctors('PENDING');
    } catch (error) {
      logger.error('Failed to fetch pending doctors', error);
      throw error;
    }
  }

  /**
   * Approve doctor
   */
  async approveDoctor(doctorId: number): Promise<ApiResponse<Doctor>> {
    try {
      logger.info('Approving doctor', { doctorId });
      
      // Use longer timeout for approval (30 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(`${this.ENDPOINTS.APPROVE_DOCTOR}/${doctorId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      logger.info('Doctor approved successfully', { doctorId, doctorUID: result.data?.doctorUID });
      
      return result;
    } catch (error) {
      logger.error('Failed to approve doctor', error, { doctorId });
      throw error;
    }
  }

  /**
   * Reject doctor
   */
  async rejectDoctor(doctorId: number, reason?: string): Promise<ApiResponse<Doctor>> {
    try {
      logger.info('Rejecting doctor', { doctorId, reason });
      
      // Use longer timeout for rejection (30 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      // Send as 'remark' to match API expectation (API accepts both 'remark' and 'reason')
      const response = await fetch(`${this.ENDPOINTS.REJECT_DOCTOR}/${doctorId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remark: reason }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      logger.info('Doctor rejected successfully', { doctorId });
      
      return result;
    } catch (error) {
      logger.error('Failed to reject doctor', error, { doctorId, reason });
      throw error;
    }
  }

  /**
   * Revert doctor status
   */
  async deactivateDoctor(doctorId: number): Promise<ApiResponse<Doctor>> {
    try {
      logger.info('Deactivating doctor', { doctorId });
      const response = await apiClient.post<Doctor>(`${this.ENDPOINTS.DOCTORS}/deactivate/${doctorId}`);
      return response;
    } catch (error) {
      logger.error('Failed to deactivate doctor', error);
      throw error;
    }
  }

  async revertDoctor(doctorId: number, newStatus: string, reason?: string): Promise<ApiResponse<Doctor>> {
    try {
      logger.info('Reverting doctor status', { doctorId, newStatus, reason });
      
      // Use longer timeout for revert (30 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(`${this.ENDPOINTS.REVERT_DOCTOR}/${doctorId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStatus, reason }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      logger.info('Doctor status reverted successfully', { doctorId, newStatus });
      
      return result;
    } catch (error) {
      logger.error('Failed to revert doctor status', error, { doctorId, newStatus, reason });
      throw error;
    }
  }

  /**
   * Get all patients
   */
  async getPatients(): Promise<ApiResponse<Patient[]>> {
    try {
      logger.info('Fetching patients');
      const response = await apiClient.get<Patient[]>(this.ENDPOINTS.PATIENTS);
      logger.info('Patients fetched successfully', { count: response.data?.length });
      return response;
    } catch (error) {
      logger.error('Failed to fetch patients', error);
      throw error;
    }
  }

  /**
   * Get patient by ID
   */
  async getPatient(patientId: number): Promise<ApiResponse<Patient>> {
    try {
      logger.info('Fetching patient', { patientId });
      const response = await apiClient.get<Patient>(`${this.ENDPOINTS.PATIENTS}/${patientId}`);
      logger.info('Patient fetched successfully', { patientId });
      return response;
    } catch (error) {
      logger.error('Failed to fetch patient', error, { patientId });
      throw error;
    }
  }

  /**
   * Get all invite links
   */
  async getInvites(): Promise<ApiResponse<InviteLink[]>> {
    try {
      logger.info('Fetching invite links');
      const response = await apiClient.get<InviteLink[]>(this.ENDPOINTS.INVITES);
      logger.info('Invite links fetched successfully', { count: response.data?.length });
      return response;
    } catch (error) {
      logger.error('Failed to fetch invite links', error);
      throw error;
    }
  }

  /**
   * Create new invite link
   */
  async createInvite(role: 'DOCTOR' | 'PATIENT', doctorUID?: string): Promise<ApiResponse<InviteLink>> {
    try {
      logger.info('Creating invite link', { role, doctorUID });
      const response = await apiClient.post<InviteLink>(this.ENDPOINTS.INVITES, { role, doctorUID });
      logger.info('Invite link created successfully', { role, token: response.data?.token });
      return response;
    } catch (error) {
      logger.error('Failed to create invite link', error, { role, doctorUID });
      throw error;
    }
  }

  /**
   * Delete invite link
   */
  async deleteInvite(inviteId: number): Promise<ApiResponse<void>> {
    try {
      logger.info('Deleting invite link', { inviteId });
      const response = await apiClient.delete<void>(`${this.ENDPOINTS.INVITES}/${inviteId}`);
      logger.info('Invite link deleted successfully', { inviteId });
      return response;
    } catch (error) {
      logger.error('Failed to delete invite link', error, { inviteId });
      throw error;
    }
  }
}

export const adminService = new AdminService();
