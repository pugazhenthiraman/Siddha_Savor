import { apiClient, ApiResponse, ApiClient } from './api';
import { Patient, InviteLink } from '@/lib/types';
import { logger } from '@/lib/utils/logger';

export interface DoctorStats {
  totalPatients: number;
  activePatients: number;
  curedPatients: number;
  pendingApprovals: number;
  thisMonthVisits: number;
  averageRating: number;
}

export interface PatientDiagnosis {
  id: number;
  patientId: number;
  diagnosis: string;
  treatment: string;
  medicines: string[];
  foods: string[];
  activities: string[];
  visitDate: string;
  nextVisit?: string;
  notes?: string;
}

export interface PatientApprovalData {
  patientId: number;
  action: 'APPROVE' | 'REJECT';
  reason?: string;
}

class DoctorService {
  private readonly ENDPOINTS = {
    STATS: '/api/doctor/stats',
    PATIENTS: '/api/doctor/patients',
    PATIENT_APPROVE: '/api/doctor/patients/approve',
    PATIENT_REJECT: '/api/doctor/patients/reject',
    PATIENT_DIAGNOSIS: '/api/doctor/patients/diagnosis',
    GENERATE_INVITE: '/api/doctor/invites/generate',
    VISITS: '/api/doctor/visits',
  } as const;

  async getStats(doctorUID: string): Promise<ApiResponse<DoctorStats>> {
    try {
      logger.info('Fetching doctor stats', { doctorUID });
      const response = await apiClient.get<DoctorStats>(
        `${this.ENDPOINTS.STATS}?doctorUID=${doctorUID}`
      );
      return response;
    } catch (error) {
      logger.error('Failed to fetch doctor stats', error);
      throw error;
    }
  }

  async getPatients(doctorUID: string): Promise<ApiResponse<Patient[]>> {
    try {
      logger.info('Fetching doctor patients', { doctorUID });
      const response = await apiClient.get<Patient[]>(
        `${this.ENDPOINTS.PATIENTS}?doctorUID=${doctorUID}`
      );
      return response;
    } catch (error) {
      logger.error('Failed to fetch patients', error);
      throw error;
    }
  }

  async approvePatient(data: PatientApprovalData): Promise<ApiResponse> {
    try {
      logger.info('Approving patient', data);
      // Use longer timeout for approval requests (30 seconds)
      const approvalClient = new ApiClient('', 30000);
      const response = await approvalClient.post(this.ENDPOINTS.PATIENT_APPROVE, data);
      return response;
    } catch (error) {
      logger.error('Failed to approve patient', error);
      throw error;
    }
  }

  async rejectPatient(data: PatientApprovalData): Promise<ApiResponse> {
    try {
      logger.info('Rejecting patient', data);
      const response = await apiClient.post(this.ENDPOINTS.PATIENT_REJECT, data);
      return response;
    } catch (error) {
      logger.error('Failed to reject patient', error);
      throw error;
    }
  }

  async reapprovePatient(patientId: number): Promise<ApiResponse> {
    try {
      logger.info('Reapproving patient', { patientId });
      const response = await apiClient.post('/api/doctor/patients/reapprove', { patientId });
      return response;
    } catch (error) {
      logger.error('Failed to reapprove patient', error);
      throw error;
    }
  }

  async deactivatePatient(patientId: number): Promise<ApiResponse> {
    try {
      logger.info('Deactivating patient', { patientId });
      const response = await apiClient.post('/api/doctor/patients/deactivate', { patientId });
      return response;
    } catch (error) {
      logger.error('Failed to deactivate patient', error);
      throw error;
    }
  }

  async updateDiagnosis(diagnosis: PatientDiagnosis): Promise<ApiResponse> {
    try {
      logger.info('Updating patient diagnosis', { patientId: diagnosis.patientId });
      const response = await apiClient.post(this.ENDPOINTS.PATIENT_DIAGNOSIS, diagnosis);
      return response;
    } catch (error) {
      logger.error('Failed to update diagnosis', error);
      throw error;
    }
  }

  async generatePatientInvite(doctorUID: string, recipientEmail?: string, recipientName?: string): Promise<ApiResponse<InviteLink>> {
    try {
      logger.info('Generating patient invite', { doctorUID, recipientEmail });
      const response = await apiClient.post<InviteLink>(this.ENDPOINTS.GENERATE_INVITE, {
        doctorUID,
        recipientEmail,
        recipientName,
        role: 'PATIENT',
      });
      return response;
    } catch (error) {
      logger.error('Failed to generate patient invite', error);
      throw error;
    }
  }

  async getPatientVisits(patientId: number): Promise<ApiResponse<PatientDiagnosis[]>> {
    try {
      logger.info('Fetching patient visits', { patientId });
      const response = await apiClient.get<PatientDiagnosis[]>(
        `${this.ENDPOINTS.VISITS}?patientId=${patientId}`
      );
      return response;
    } catch (error) {
      logger.error('Failed to fetch patient visits', error);
      throw error;
    }
  }

  async savePatientVitals(vitalsData: any): Promise<ApiResponse> {
    try {
      logger.info('Saving patient vitals', { patientId: vitalsData.patientId });
      const response = await apiClient.post('/api/doctor/vitals', vitalsData);
      return response;
    } catch (error) {
      logger.error('Failed to save patient vitals', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save vitals'
      };
    }
  }

  async updatePatientVitals(vitalsData: any): Promise<ApiResponse> {
    try {
      logger.info('Updating patient vitals', { id: vitalsData.id, patientId: vitalsData.patientId });
      const response = await apiClient.put('/api/doctor/vitals', vitalsData);
      return response;
    } catch (error) {
      logger.error('Failed to update patient vitals', error);
      throw error;
    }
  }

  async getPatientVitals(patientId: number): Promise<ApiResponse> {
    try {
      logger.info('Fetching patient vitals', { patientId });
      const response = await apiClient.get(`/api/doctor/vitals?patientId=${patientId}`);
      return response;
    } catch (error) {
      logger.error('Failed to fetch patient vitals', error);
      throw error;
    }
  }
}

export const doctorService = new DoctorService();
