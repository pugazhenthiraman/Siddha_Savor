import { ApiClient } from './api';
import { logger } from '@/lib/utils/logger';

const apiClient = new ApiClient();

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

class PatientService {
  async getMyVitals(patientId: number): Promise<ApiResponse> {
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

export const patientService = new PatientService();
