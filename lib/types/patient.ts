import { Patient } from './index';

export interface PatientStats {
  totalVitals: number;
  lastVisit: string;
  doctorName: string;
  status: 'ACTIVE' | 'CURED' | 'INACTIVE';
  joinedDate: string;
  totalAppointments: number;
}

export interface PatientWithStats extends Patient {
  stats?: PatientStats;
  vitals?: any[];
}
