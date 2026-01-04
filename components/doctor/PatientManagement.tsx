'use client';

import { useState, useEffect } from 'react';
import { doctorService } from '@/lib/services/doctorService';
import { authService } from '@/lib/services/auth';
import { Patient } from '@/lib/types';
import { useToast } from '@/lib/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { VitalsDebug } from './VitalsDebug';

interface PatientManagementProps {
  onPatientSelect?: (patient: Patient) => void;
}

export function PatientManagement({ onPatientSelect }: PatientManagementProps) {
  const { success, error } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<'approve' | 'reject' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showVitalsManager, setShowVitalsManager] = useState<Patient | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const user = authService.getCurrentUser() as any;
      if (!user?.doctorUID) {
        error('Doctor UID not found');
        setIsLoading(false);
        return;
      }

      const response = await doctorService.getPatients(user.doctorUID);
      if (response.success && response.data) {
        setPatients(response.data);
      }
    } catch (err) {
      error('Failed to load patients');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovePatient = async (patient: Patient) => {
    try {
      setActionLoading(patient.id);
      const response = await doctorService.approvePatient({
        patientId: patient.id,
        action: 'APPROVE'
      });
      
      if (response.success) {
        success('Patient approved successfully');
        fetchPatients();
      } else {
        error(response.error || 'Failed to approve patient');
      }
    } catch (err) {
      error('Failed to approve patient');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectPatient = async () => {
    if (!selectedPatient || !rejectReason.trim()) {
      error('Please provide a rejection reason');
      return;
    }

    try {
      setActionLoading(selectedPatient.id);
      const response = await doctorService.rejectPatient({ 
        patientId: selectedPatient.id, 
        action: 'REJECT',
        reason: rejectReason 
      });
      
      if (response.success) {
        success('Patient rejected successfully');
        setShowConfirmation(null);
        setRejectReason('');
        setSelectedPatient(null);
        fetchPatients();
      } else {
        error(response.error || 'Failed to reject patient');
      }
    } catch (err) {
      error('Failed to reject patient');
    } finally {
      setActionLoading(null);
    }
  };

  const confirmAction = () => {
    if (showConfirmation === 'approve' && selectedPatient) {
      handleApprovePatient(selectedPatient);
    } else if (showConfirmation === 'reject') {
      handleRejectPatient();
    }
    setShowConfirmation(null);
    setRejectReason('');
  };

  const getStatusBadge = (patient: Patient) => {
    const status = patient.status || 'PENDING';
    
    const statusConfig = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending Approval' },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active Treatment' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getFilteredPatients = () => {
    let filtered = patients;

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(patient => {
        if (statusFilter === 'PENDING') return (patient.status as string) === 'PENDING';
        if (statusFilter === 'REJECTED') return (patient.status as string) === 'REJECTED';
        if (statusFilter === 'ACTIVE') return (patient.status as string) === 'APPROVED';
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
        
        return fullName.includes(search) || email.includes(search);
      });
    }

    return filtered;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
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

  const filteredPatients = getFilteredPatients();

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
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

        {/* Search and Filter */}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="ACTIVE">Active</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Patients List */}
        {filteredPatients.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'ALL' ? 'No patients found' : 'No patients available'}
            </h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'ALL' 
                ? 'Try adjusting your search or filter criteria'
                : 'Start by inviting patients to join your practice.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((patient) => {
              const formData = patient.formData as any;
              const personalInfo = formData?.personalInfo || {};
              const fullName = `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim() || patient.email;

              return (
                <div key={patient.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  {/* Patient Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {fullName.split(' ').map(n => n[0]).join('').toUpperCase() || 'P'}
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-gray-900">{fullName}</h4>
                        <p className="text-sm text-gray-600">{patient.email}</p>
                      </div>
                    </div>
                    {getStatusBadge(patient)}
                  </div>

                  {/* Patient Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium mr-2">Phone:</span>
                      <span>{personalInfo.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium mr-2">Age:</span>
                      <span>{personalInfo.age || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => onPatientSelect?.(patient)}
                      variant="outline"
                      className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                      size="sm"
                    >
                      👁️ View Details
                    </Button>

                    {(patient.status as string) === 'APPROVED' && (
                      <Button
                        onClick={() => router.push(`/dashboard/doctor/patient/${patient.id}`)}
                        variant="outline"
                        className="w-full border-green-300 text-green-600 hover:bg-green-50"
                        size="sm"
                      >
                        📊 Manage Vitals
                      </Button>
                    )}

                    {(patient.status as string) === 'PENDING' && (
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => {
                            setSelectedPatient(patient);
                            setShowConfirmation('approve');
                          }}
                          disabled={actionLoading === patient.id}
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                          isLoading={actionLoading === patient.id}
                        >
                          ✅ Approve
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedPatient(patient);
                            setShowConfirmation('reject');
                          }}
                          disabled={actionLoading === patient.id}
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          size="sm"
                        >
                          ❌ Reject
                        </Button>
                      </div>
                    )}

                    {(patient.status as string) === 'REJECTED' && (
                      <Button
                        onClick={() => handleApprovePatient(patient)}
                        disabled={actionLoading === patient.id}
                        className="w-full bg-green-600 hover:bg-green-700"
                        size="sm"
                        isLoading={actionLoading === patient.id}
                      >
                        🔄 Re-approve
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal - Same pattern as admin */}
      {showConfirmation && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {showConfirmation === 'approve' ? 'Approve Patient' : 'Reject Patient'}
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              {showConfirmation === 'approve' 
                ? `Are you sure you want to approve this patient's registration?`
                : `Please provide a reason for rejecting this patient's registration:`
              }
            </p>
            
            {showConfirmation === 'reject' && (
              <div className="mb-4">
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 text-sm text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
                {!rejectReason.trim() && (
                  <p className="text-xs text-red-600 mt-1">Rejection reason is required</p>
                )}
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConfirmation(null);
                  setRejectReason('');
                  setSelectedPatient(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={showConfirmation === 'reject' && !rejectReason.trim()}
                className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                  showConfirmation === 'approve' 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
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
                  showConfirmation === 'approve' ? 'Approve Patient' : 'Reject Patient'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
