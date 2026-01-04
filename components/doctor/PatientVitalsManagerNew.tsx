'use client';

import { useState, useEffect } from 'react';
import { Patient } from '@/lib/types';
import { useToast } from '@/lib/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { PatientDashboard } from './PatientDashboard';

interface PatientVitalsManagerProps {
  patient: Patient;
  onClose: () => void;
}

export function PatientVitalsManager({ patient, onClose }: PatientVitalsManagerProps) {
  // Use the new comprehensive dashboard instead
  return <PatientDashboard patient={patient} onClose={onClose} />;
}
