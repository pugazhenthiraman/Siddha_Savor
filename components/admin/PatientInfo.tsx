'use client';

import { Patient } from '@/lib/types';

interface InfoSectionProps {
  title: string;
  children: React.ReactNode;
}

function InfoSection({ title, children }: InfoSectionProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-base font-semibold text-black border-b border-gray-200 pb-2">{title}</h4>
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 space-y-4 border border-gray-200">
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
    <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
      <span className="text-sm font-medium text-gray-700">{label}:</span>
      <span className="text-sm text-black font-semibold bg-white px-3 py-1 rounded-lg shadow-sm">{displayValue}</span>
    </div>
  );
}

interface PatientInfoProps {
  patient: Patient;
}

export function PatientInfo({ patient }: PatientInfoProps) {
  // Parse formData if it's a string (from database JSON)
  const formData = typeof patient.formData === 'string' 
    ? JSON.parse(patient.formData) 
    : patient.formData;

  const personalInfo = formData?.personalInfo || {};
  const addressInfo = formData?.addressInfo || {};
  const emergencyContact = formData?.emergencyContact || {};

  return (
    <div className="space-y-8">
      <InfoSection title="👤 Personal Information">
        <InfoRow label="Full Name" value={`${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`} />
        <InfoRow label="Email" value={personalInfo.email || patient.email || ''} />
        <InfoRow label="Phone" value={personalInfo.phone || ''} />
        <InfoRow label="Date of Birth" value={personalInfo.dateOfBirth || ''} />
        <InfoRow label="Age" value={personalInfo.age || ''} />
        <InfoRow label="Gender" value={personalInfo.gender || ''} />
        <InfoRow label="Occupation" value={personalInfo.occupation || ''} />
        <InfoRow label="Work Type" value={personalInfo.workType || ''} />
      </InfoSection>

      <InfoSection title="🏠 Address Information">
        <InfoRow label="Address" value={addressInfo.address || ''} />
        <InfoRow label="City" value={addressInfo.city || ''} />
        <InfoRow label="State" value={addressInfo.state || ''} />
        <InfoRow label="Pincode" value={addressInfo.pincode || ''} />
      </InfoSection>

      <InfoSection title="🚨 Emergency Contact">
        <InfoRow label="Name" value={emergencyContact.name || ''} />
        <InfoRow label="Phone" value={emergencyContact.phone || ''} />
        <InfoRow label="Relationship" value={emergencyContact.relationship || ''} />
      </InfoSection>

      <InfoSection title="🏥 Medical Information">
        <InfoRow label="Patient ID" value={String(patient.patientUID || patient.id)} />
        <InfoRow label="Assigned Doctor" value={patient.doctorUID || 'Not assigned'} />
        <InfoRow label="Registration Date" value={new Date(patient.createdAt).toLocaleDateString()} />
        <InfoRow label="Status" value={patient.status || 'Unknown'} />
      </InfoSection>
    </div>
  );
}
