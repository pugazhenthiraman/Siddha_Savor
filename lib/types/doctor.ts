import { Doctor, Patient } from './index';

export interface DoctorStats {
  totalPatients: number;
  activePatients: number;
  curedPatients: number;
  totalVitals: number;
  recentActivity: string;
  joinedDate: string;
}

export interface DoctorWithStats extends Doctor {
  stats?: DoctorStats;
  patients?: Patient[];
}
