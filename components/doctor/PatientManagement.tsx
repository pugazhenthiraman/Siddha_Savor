'use client';

import { useState, useEffect } from 'react';
import { doctorService } from '@/lib/services/doctorService';
import { authService } from '@/lib/services/auth';
import { Patient } from '@/lib/types';
import { DOCTOR_BUTTONS, DOCTOR_EMPTY_STATES, PATIENT_STATUS_LABELS } from '@/lib/constants/doctor';
import { useToast } from '@/lib/hooks/useToast';
import { logger } from '@/lib/utils/logger';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const user = authService.getCurrentUser() as any; // User type may include doctorUID from API
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

      const response = await doctorService.getPatients((user as any).doctorUID);
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
      setActionLoading(patient.id);
      const formData = patient.formData as any;
      const isRejected = formData?.registrationInfo?.rejected === true || 
        (patient.inviteToken && patient.inviteToken.startsWith('rejected_'));
      
      // If patient was rejected, use reapprove endpoint
      if (isRejected) {
        const response = await doctorService.reapprovePatient(patient.id);
        if (response.success) {
          success('Patient reapproved successfully');
          await fetchPatients();
        } else {
          error(response.error || 'Failed to reapprove patient');
        }
      } else {
        // Normal approval for pending patients
        const response = await doctorService.approvePatient({
          patientId: patient.id,
          action: 'APPROVE',
        });

        if (response.success) {
          success('Patient approved successfully');
          await fetchPatients();
        } else {
          error(response.error || 'Failed to approve patient');
        }
      }
    } catch (err) {
      logger.error('Failed to approve/reapprove patient', err);
      error('Failed to approve patient');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectPatient = async () => {
    if (!selectedPatient || !rejectReason.trim()) {
      error('Please provide a reason for rejection');
      return;
    }

    try {
      setActionLoading(selectedPatient.id);
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
    } finally {
      setActionLoading(null);
    }
  };


  const getStatusBadge = (patient: Patient) => {
    const formData = patient.formData as any;
    const isRejected = formData?.registrationInfo?.rejected === true || 
      (patient.inviteToken && patient.inviteToken.startsWith('rejected_'));
    
    // Patient is pending if they have an inviteToken (not yet approved by doctor)
    // But not if they're rejected
    const isPending = patient.inviteToken !== null && !isRejected && 
      !(patient.inviteToken && patient.inviteToken.startsWith('rejected_'));
    
    // Check if patient was rejected
    if (isRejected) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Rejected
        </span>
      );
    }
    
    // Only show "Active Treatment" for approved patients (no inviteToken)
    // Pending patients should show "Pending Approval"
    const status = isPending ? 'PENDING' : (patient.status || 'ACTIVE');
    
    const statusConfig = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending Approval' },
      ACTIVE: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active Treatment' },
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

  const getFilteredPatients = () => {
    let filtered = patients;

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(patient => {
        const formData = patient.formData as any;
        const isRejected = formData?.registrationInfo?.rejected === true || 
          (patient.inviteToken && patient.inviteToken.startsWith('rejected_'));
        const isPending = patient.inviteToken !== null && !isRejected;

        if (statusFilter === 'PENDING') return isPending;
        if (statusFilter === 'REJECTED') return isRejected;
        if (statusFilter === 'ACTIVE') return !isPending && !isRejected;
        return true;
      });
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(patient => {
        const formData = patient.formData as any;
        const personalInfo = formData?.personalInfo || {};
        const fullName = `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.toLowerCase();
        const email = patient.email.toLowerCase();
        const phone = personalInfo.phone?.toLowerCase() || '';
        const doctorUID = patient.doctorUID?.toLowerCase() || '';

        return fullName.includes(search) || 
               email.includes(search) || 
               phone.includes(search) ||
               doctorUID.includes(search);
      });
    }

    return filtered;
  };

  const filteredPatients = getFilteredPatients();

  return (
    <>
      <div className="space-y-6">
        {/* Header with Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              My Patients ({filteredPatients.length})
            </h3>
            <p className="text-gray-600">Search, filter, and manage patient registrations</p>
          </div>
          <Button onClick={fetchPatients} variant="outline" size="sm">
            🔄 Refresh
          </Button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by name, email, phone, or doctor UID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by status"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                style={{ color: '#111827' }}
              >
                <option value="ALL" style={{ color: '#111827' }}>All Status</option>
                <option value="PENDING" style={{ color: '#111827' }}>Pending</option>
                <option value="ACTIVE" style={{ color: '#111827' }}>Active</option>
                <option value="REJECTED" style={{ color: '#111827' }}>Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Patients List */}
        {filteredPatients.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'ALL' ? 'No patients found' : DOCTOR_EMPTY_STATES.NO_PATIENTS}
            </h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'ALL' 
                ? 'Try adjusting your search or filter criteria'
                : DOCTOR_EMPTY_STATES.NO_PATIENTS_DESC}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((patient) => {
              const formData = patient.formData as any;
              const isRejected = formData?.registrationInfo?.rejected === true || 
                (patient.inviteToken && patient.inviteToken.startsWith('rejected_'));
              const isPending = patient.inviteToken !== null && !isRejected && 
                !(patient.inviteToken && patient.inviteToken.startsWith('rejected_'));
              const isActive = !isPending && !isRejected;
              const personalInfo = formData?.personalInfo || {};
              const addressInfo = formData?.addressInfo || {};
              const emergencyContact = formData?.emergencyContact || {};
              const fullName = `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim() || patient.email;
              const registrationInfo = formData?.registrationInfo || {};
              const registrationDate = registrationInfo.registeredAt 
                ? new Date(registrationInfo.registeredAt).toLocaleDateString()
                : new Date(patient.createdAt).toLocaleDateString();

              return (
                <div key={patient.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                        {fullName.split(' ').map(n => n[0]).join('').toUpperCase() || 'P'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-semibold text-gray-900 truncate">{fullName || 'Unknown Patient'}</h4>
                        <p className="text-sm text-gray-600 truncate">{patient.email}</p>
                      </div>
                    </div>
                    <div className="ml-2">
                      {getStatusBadge(patient)}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium mr-2">Phone:</span>
                      <span>{personalInfo.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium mr-2">Location:</span>
                      <span>{addressInfo.city || 'N/A'}, {addressInfo.state || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium mr-2">Registered:</span>
                      <span>{registrationDate}</span>
                    </div>
                    {emergencyContact.name && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium mr-2">Emergency:</span>
                        <span>{emergencyContact.name} ({emergencyContact.phone || 'N/A'})</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {/* View Details - Common for all statuses */}
                    <Button
                      onClick={() => onPatientSelect?.(patient)}
                      variant="outline"
                      className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                      size="sm"
                    >
                      👁️ {DOCTOR_BUTTONS.VIEW_DETAILS}
                    </Button>

                    {/* Status-specific action buttons */}
                    {isPending ? (
                      // Pending: Show Approve and Reject buttons
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => handleApprovePatient(patient)}
                          disabled={actionLoading === patient.id}
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                          isLoading={actionLoading === patient.id}
                        >
                          {DOCTOR_BUTTONS.APPROVE_PATIENT}
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedPatient(patient);
                            setShowRejectModal(true);
                          }}
                          disabled={actionLoading === patient.id}
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          size="sm"
                        >
                          {DOCTOR_BUTTONS.REJECT_PATIENT}
                        </Button>
                      </div>
                    ) : isActive ? (
                      // Active: No action buttons (approved patients cannot be modified)
                      null
                    ) : isRejected ? (
                      // Rejected: Show Reapprove button
                      <Button
                        onClick={() => handleApprovePatient(patient)}
                        disabled={actionLoading === patient.id}
                        className="w-full bg-green-600 hover:bg-green-700"
                        size="sm"
                        isLoading={actionLoading === patient.id}
                      >
                        {DOCTOR_BUTTONS.REAPPROVE_PATIENT}
                      </Button>
                    ) : (
                      // Other statuses: Show Update Diagnosis button
                      <Button
                        onClick={() => onPatientSelect?.(patient)}
                        variant="outline"
                        className="w-full border-purple-300 text-purple-600 hover:bg-purple-50"
                        size="sm"
                      >
                        {DOCTOR_BUTTONS.UPDATE_DIAGNOSIS}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedPatient && (
        <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Patient Registration</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting {(() => {
                const formData = selectedPatient.formData as any;
                const personalInfo = formData?.personalInfo || {};
                return `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim() || 'this patient';
              })()}'s registration:
            </p>
            
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 text-sm text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                disabled={actionLoading === selectedPatient.id}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading === selectedPatient.id ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  DOCTOR_BUTTONS.REJECT_PATIENT
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
