'use client';

import { Patient } from '@/lib/types';

interface PatientDetailsProps {
  patient: Patient;
  onClose: () => void;
}

export function PatientDetails({ patient, onClose }: PatientDetailsProps) {
  const formData = patient.formData as any;
  const personalInfo = formData?.personalInfo || {};
  const addressInfo = formData?.addressInfo || {};
  const emergencyContact = formData?.emergencyContact || {};
  const fullName = `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim();

  return (
    <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border-2 border-gray-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-semibold">
              {fullName.split(' ').map(n => n[0]).join('').toUpperCase() || 'P'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{fullName}</h2>
              <p className="text-sm text-gray-600">{patient.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-gray-900">{fullName || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{patient.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900">{personalInfo.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                    <p className="text-gray-900">{personalInfo.dateOfBirth || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Gender</label>
                    <p className="text-gray-900 capitalize">{personalInfo.gender || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Age</label>
                    <p className="text-gray-900">{personalInfo.age ? `${personalInfo.age} years old` : 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Occupation</label>
                    <p className="text-gray-900 capitalize">
                      {personalInfo.occupation === 'other' && personalInfo.customOccupation
                        ? personalInfo.customOccupation
                        : personalInfo.occupation || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Work Type</label>
                    <p className="text-gray-900">
                      {personalInfo.workType ? (
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          personalInfo.workType === 'soft' ? 'bg-green-100 text-green-800' :
                          personalInfo.workType === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          personalInfo.workType === 'hard' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {personalInfo.workType === 'soft' ? 'Soft Work (Mild Activity)' :
                           personalInfo.workType === 'medium' ? 'Medium Work (Moderate Activity)' :
                           personalInfo.workType === 'hard' ? 'Hard Work (Heavy Activity)' :
                           personalInfo.workType}
                        </span>
                      ) : 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-gray-900">{addressInfo.address || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">City, State</label>
                    <p className="text-gray-900">
                      {addressInfo.city && addressInfo.state 
                        ? `${addressInfo.city}, ${addressInfo.state}` 
                        : 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">PIN Code</label>
                    <p className="text-gray-900">{addressInfo.pincode || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Emergency Contact</label>
                    <p className="text-gray-900">
                      {emergencyContact.name 
                        ? `${emergencyContact.name} (${emergencyContact.phone || 'N/A'})`
                        : 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
