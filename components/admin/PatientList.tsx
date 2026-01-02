'use client';

import { Patient } from '@/lib/types';

interface PatientListProps {
  patients: Patient[];
}

export function PatientList({ patients }: PatientListProps) {
  if (patients.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">👥</span>
        </div>
        <p className="text-gray-600">No patients assigned yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-black">Assigned Patients ({patients.length})</h4>
      <div className="space-y-3">
        {patients.map((patient) => (
          <div key={patient.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-sm font-medium">
                  {patient.formData.firstName?.[0]}{patient.formData.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm font-medium text-black">
                      {patient.formData.firstName} {patient.formData.lastName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Patient Name</p>
                  </div>
                  <div>
                    <p className="text-sm text-black">{patient.patientUID}</p>
                    <p className="text-xs text-gray-500 mt-1">Patient ID</p>
                  </div>
                  <div>
                    <p className="text-sm text-black truncate">{patient.email}</p>
                    <p className="text-xs text-gray-500 mt-1">Email</p>
                  </div>
                  <div>
                    <p className="text-sm text-black">{new Date(patient.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Appointed Date</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
