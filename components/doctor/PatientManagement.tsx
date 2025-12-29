'use client';

import { useState, useEffect } from 'react';
import { doctorService } from '@/lib/services/doctorService';
import { authService } from '@/lib/services/auth';
import { Patient } from '@/lib/types';
import { DOCTOR_BUTTONS, DOCTOR_EMPTY_STATES, PATIENT_STATUS_LABELS } from '@/lib/constants/doctor';
import { useToast } from '@/lib/hooks/useToast';
import { logger } from '@/lib/utils/logger';

interface PatientManagementProps {
  onPatientSelect?: (patient: Patient) => void;
}

export function PatientManagement({ onPatientSelect }: PatientManagementProps) {
  const { success, error } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user?.doctorUID) {
        // Mock data for doctors without UID
        setPatients([
          {
            id: 1,
            email: 'patient1@example.com',
            formData: {
              firstName: 'John',
              lastName: 'Doe',
              phone: '+91-9876543210',
              dateOfBirth: '1985-05-15',
              gender: 'male',
              address: '123 Main St, City',
              city: 'Mumbai',
              state: 'Maharashtra',
              pincode: '400001',
              emergencyContact: 'Jane Doe',
              emergencyPhone: '+91-9876543211',
            },
            doctorUID: 'DOC001',
            inviteToken: null,
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-15T10:30:00Z',
            status: 'ACTIVE',
          },
          {
            id: 2,
            email: 'patient2@example.com',
            formData: {
              firstName: 'Sarah',
              lastName: 'Smith',
              phone: '+91-9876543212',
              dateOfBirth: '1990-08-22',
              gender: 'female',
              address: '456 Oak Ave, City',
              city: 'Delhi',
              state: 'Delhi',
              pincode: '110001',
              emergencyContact: 'Mike Smith',
              emergencyPhone: '+91-9876543213',
            },
            doctorUID: 'DOC001',
            inviteToken: 'pending-token',
            createdAt: '2024-01-20T14:15:00Z',
            updatedAt: '2024-01-20T14:15:00Z',
            status: 'ACTIVE',
          },
        ]);
        setIsLoading(false);
        return;
      }

      const response = await doctorService.getPatients(user.doctorUID);
      if (response.success && response.data) {
        setPatients(response.data);
      }
    } catch (err) {
      logger.error('Failed to fetch patients', err);
      error('Failed to load patients');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovePatient = async (patient: Patient) => {
    try {
      const response = await doctorService.approvePatient({
        patientId: patient.id,
        action: 'APPROVE',
      });

      if (response.success) {
        success('Patient approved successfully');
        fetchPatients();
      }
    } catch (err) {
      logger.error('Failed to approve patient', err);
      error('Failed to approve patient');
    }
  };

  const handleRejectPatient = async () => {
    if (!selectedPatient || !rejectReason.trim()) {
      error('Please provide a reason for rejection');
      return;
    }

    try {
      const response = await doctorService.rejectPatient({
        patientId: selectedPatient.id,
        action: 'REJECT',
        reason: rejectReason,
      });

      if (response.success) {
        success('Patient rejected successfully');
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedPatient(null);
        fetchPatients();
      }
    } catch (err) {
      logger.error('Failed to reject patient', err);
      error('Failed to reject patient');
    }
  };

  const getStatusBadge = (patient: Patient) => {
    const isPending = patient.inviteToken && !patient.password;
    const status = isPending ? 'PENDING' : (patient.status || 'ACTIVE');
    
    const statusConfig = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending Approval' },
      ACTIVE: { bg: 'bg-green-100', text: 'text-green-800', label: PATIENT_STATUS_LABELS.ACTIVE },
      CURED: { bg: 'bg-blue-100', text: 'text-blue-800', label: PATIENT_STATUS_LABELS.CURED },
      INACTIVE: { bg: 'bg-gray-100', text: 'text-gray-800', label: PATIENT_STATUS_LABELS.INACTIVE },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">👥</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{DOCTOR_EMPTY_STATES.NO_PATIENTS}</h3>
        <p className="text-gray-600 mb-4">{DOCTOR_EMPTY_STATES.NO_PATIENTS_DESC}</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">My Patients</h3>
          <p className="text-sm text-gray-600">Manage your patient registrations and treatments</p>
        </div>

        <div className="divide-y divide-gray-200">
          {patients.map((patient) => {
            const isPending = patient.inviteToken && !patient.password;
            const fullName = `${patient.formData.firstName || ''} ${patient.formData.lastName || ''}`.trim();
            
            return (
              <div key={patient.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {fullName.split(' ').map(n => n[0]).join('').toUpperCase() || 'P'}
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{fullName || 'Unknown Patient'}</h4>
                      <p className="text-sm text-gray-600">{patient.email}</p>
                      <p className="text-xs text-gray-500">
                        {patient.formData.phone} • {patient.formData.city}, {patient.formData.state}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {getStatusBadge(patient)}
                    
                    {isPending ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprovePatient(patient)}
                          className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition-colors"
                        >
                          {DOCTOR_BUTTONS.APPROVE_PATIENT}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPatient(patient);
                            setShowRejectModal(true);
                          }}
                          className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition-colors"
                        >
                          {DOCTOR_BUTTONS.REJECT_PATIENT}
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onPatientSelect?.(patient)}
                          className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                        >
                          {DOCTOR_BUTTONS.VIEW_DETAILS}
                        </button>
                        <button
                          onClick={() => onPatientSelect?.(patient)}
                          className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-purple-700 transition-colors"
                        >
                          {DOCTOR_BUTTONS.UPDATE_DIAGNOSIS}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {patient.formData.emergencyContact && (
                  <div className="mt-3 text-xs text-gray-500">
                    Emergency: {patient.formData.emergencyContact} ({patient.formData.emergencyPhone})
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Patient Registration</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting {selectedPatient.formData.firstName} {selectedPatient.formData.lastName}'s registration:
            </p>
            
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 text-sm"
            />
            
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedPatient(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                {DOCTOR_BUTTONS.CANCEL}
              </button>
              <button
                onClick={handleRejectPatient}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                {DOCTOR_BUTTONS.REJECT_PATIENT}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
