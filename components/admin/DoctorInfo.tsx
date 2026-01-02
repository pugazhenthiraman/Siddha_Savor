'use client';

import { Doctor } from '@/lib/types';

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
  return (
    <div className="flex justify-between">
      <span className="text-sm text-gray-600">{label}:</span>
      <span className="text-sm text-black font-medium">{value || 'Not provided'}</span>
    </div>
  );
}

interface DoctorInfoProps {
  doctor: Doctor;
}

export function DoctorInfo({ doctor }: DoctorInfoProps) {
  const { personalInfo, professionalInfo, practiceInfo } = doctor.formData;

  return (
    <div className="space-y-6">
      <InfoSection title="Personal Information">
        <InfoRow label="Full Name" value={`${personalInfo?.firstName || ''} ${personalInfo?.lastName || ''}`} />
        <InfoRow label="Email" value={doctor.email} />
        <InfoRow label="Phone" value={personalInfo?.phone || ''} />
        <InfoRow label="Gender" value={personalInfo?.gender || ''} />
        <InfoRow label="Date of Birth" value={personalInfo?.dateOfBirth || ''} />
      </InfoSection>

      <InfoSection title="Professional Details">
        <InfoRow label="Doctor ID" value={doctor.doctorUID || ''} />
        <InfoRow label="Medical License" value={professionalInfo?.medicalLicense || ''} />
        <InfoRow label="Specialization" value={professionalInfo?.specialization || ''} />
        <InfoRow label="Experience" value={professionalInfo?.experience || ''} />
        <InfoRow label="Qualification" value={professionalInfo?.qualification || ''} />
      </InfoSection>

      <InfoSection title="Practice Information">
        <InfoRow label="Clinic Name" value={practiceInfo?.clinicName || ''} />
        <InfoRow label="Clinic Number" value={practiceInfo?.clinicNumber || ''} />
        <InfoRow label="Address" value={practiceInfo?.clinicAddress || ''} />
        <InfoRow label="City" value={practiceInfo?.city || ''} />
        <InfoRow label="State" value={practiceInfo?.state || ''} />
        <InfoRow label="Pincode" value={practiceInfo?.pincode || ''} />
        <InfoRow label="Joined Date" value={new Date(doctor.createdAt).toLocaleDateString()} />
      </InfoSection>
    </div>
  );
}
