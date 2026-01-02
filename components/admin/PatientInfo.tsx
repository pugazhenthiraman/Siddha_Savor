'use client';

import { Patient } from '@/lib/types';

interface InfoSectionProps {
  title: string;
  children: React.ReactNode;
}

function InfoSection({ title, children }: InfoSectionProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-black">{title}</h4>
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        {children}
      </div>
    </div>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value || 'Not provided');
  
  return (
    <div className="flex justify-between">
      <span className="text-sm text-gray-600">{label}:</span>
      <span className="text-sm text-black font-medium">{displayValue}</span>
    </div>
  );
}

interface PatientInfoProps {
  patient: Patient;
}

export function PatientInfo({ patient }: PatientInfoProps) {
  const { formData } = patient;

  return (
    <div className="space-y-6">
      <InfoSection title="Personal Information">
        <InfoRow label="Full Name" value={`${formData.firstName || ''} ${formData.lastName || ''}`} />
        <InfoRow label="Email" value={patient.email} />
        <InfoRow label="Phone" value={formData.phone || ''} />
        <InfoRow label="Gender" value={formData.gender || ''} />
        <InfoRow label="Date of Birth" value={formData.dateOfBirth || ''} />
      </InfoSection>

      <InfoSection title="Contact Details">
        <InfoRow label="Patient ID" value={patient.patientUID || ''} />
        <InfoRow label="Address" value={formData.address || ''} />
        <InfoRow label="City" value={formData.city || ''} />
        <InfoRow label="State" value={formData.state || ''} />
        <InfoRow label="Pincode" value={formData.pincode || ''} />
      </InfoSection>

      <InfoSection title="Emergency Contact">
        <InfoRow label="Emergency Contact" value={formData.emergencyContact || ''} />
        <InfoRow label="Emergency Phone" value={formData.emergencyPhone || ''} />
        <InfoRow label="Registered Date" value={new Date(patient.createdAt).toLocaleDateString()} />
        <InfoRow label="Assigned Doctor" value={patient.doctorUID || 'Not assigned'} />
      </InfoSection>
    </div>
  );
}
