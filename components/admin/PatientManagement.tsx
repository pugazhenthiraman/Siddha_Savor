'use client';

import { useState, useEffect } from 'react';
import { adminService, type Patient } from '@/lib/services/adminService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/lib/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { 
  CONFIRMATION_MODAL_CONFIG,
  BUTTON_LABELS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  FORM_LABELS,
  SECTION_TITLES,
  EMPTY_STATE_MESSAGES,
} from '@/lib/constants/admin';
import { logger } from '@/lib/utils/logger';

interface ConfirmationModalProps {
  isOpen: boolean;
  type: 'approve' | 'reject';
  patientName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
  children?: React.ReactNode;
}

function ConfirmationModal({ isOpen, type, patientName, onConfirm, onCancel, isLoading, children }: ConfirmationModalProps) {
  if (!isOpen) return null;

  const baseConfig = CONFIRMATION_MODAL_CONFIG[type];
  const config = {
    ...baseConfig,
    message: baseConfig.message.replace('{name}', patientName),
  };

  return (
    <div 
      className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-[110] p-4"
      onClick={onCancel}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`${config.bgClass} border rounded-t-2xl p-6`}>
          <h3 className="text-lg font-semibold text-gray-900">{config.title}</h3>
          <p className="text-gray-700 mt-2">{config.message}</p>
          <p className="text-sm text-gray-600 mt-1">{config.description}</p>
        </div>
        
        <div className="p-6">
          {children}
          
          <div className="flex gap-3 mt-6">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1"
              disabled={isLoading}
            >
              {BUTTON_LABELS.CANCEL}
            </Button>
            <Button
              onClick={onConfirm}
              isLoading={isLoading}
              className={`flex-1 ${config.confirmClass}`}
            >
              {config.confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PatientViewModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (patientId: number) => void;
  onReject: (patientId: number, remark?: string) => void;
  isLoading: boolean;
}

function PatientViewModal({ patient, isOpen, onClose, onApprove, onReject, isLoading }: PatientViewModalProps) {
  const [rejectRemark, setRejectRemark] = useState('');
  const [showConfirmation, setShowConfirmation] = useState<'approve' | 'reject' | null>(null);

  if (!isOpen || !patient) return null;

  const formData = patient.formData as any;
  const personalInfo = formData?.personalInfo || {};
  const addressInfo = formData?.addressInfo || {};
  const emergencyContact = formData?.emergencyContact || {};
  const registrationInfo = formData?.registrationInfo || {};

  const handleApproveClick = () => {
    setShowConfirmation('approve');
  };

  const handleRejectClick = () => {
    setShowConfirmation('reject');
  };

  const confirmAction = () => {
    if (showConfirmation === 'approve') {
      onApprove(patient.id);
    } else if (showConfirmation === 'reject') {
      if (!rejectRemark.trim()) {
        const textarea = document.querySelector('textarea');
        if (textarea) {
          textarea.focus();
          textarea.classList.add('border-red-500', 'ring-2', 'ring-red-500');
          setTimeout(() => {
            textarea.classList.remove('border-red-500', 'ring-2', 'ring-red-500');
          }, 2000);
        }
        return;
      }
      onReject(patient.id, rejectRemark);
    }
    setShowConfirmation(null);
    setRejectRemark('');
  };

  const getStatusBadge = () => {
    const isRejected = formData?.registrationInfo?.rejected === true || 
      (patient.inviteToken && patient.inviteToken.startsWith('rejected_'));
    const isDeactivated = formData?.registrationInfo?.deactivated === true ||
      (patient.inviteToken && patient.inviteToken.startsWith('deactivated_'));
    const isPending = patient.inviteToken !== null && !isRejected && !isDeactivated;

    if (isRejected) {
      return <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">Rejected</span>;
    }
    if (isDeactivated) {
      return <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">Pending Approval</span>;
    }
    if (isPending) {
      return <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">Pending Approval</span>;
    }
    return <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">Active Treatment</span>;
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {personalInfo.firstName?.[0] || patient.email[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {personalInfo.firstName} {personalInfo.lastName}
                  </h2>
                  <p className="text-gray-600">{patient.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusBadge()}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{SECTION_TITLES.PERSONAL_INFO}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">First Name</p>
                  <p className="text-base font-medium text-gray-900">{personalInfo.firstName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Name</p>
                  <p className="text-base font-medium text-gray-900">{personalInfo.lastName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-base font-medium text-gray-900">{patient.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="text-base font-medium text-gray-900">{personalInfo.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="text-base font-medium text-gray-900">{personalInfo.dateOfBirth || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="text-base font-medium text-gray-900">{personalInfo.gender || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="text-base font-medium text-gray-900">{addressInfo.address || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">City</p>
                  <p className="text-base font-medium text-gray-900">{addressInfo.city || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">State</p>
                  <p className="text-base font-medium text-gray-900">{addressInfo.state || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pincode</p>
                  <p className="text-base font-medium text-gray-900">{addressInfo.pincode || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Contact Name</p>
                  <p className="text-base font-medium text-gray-900">{emergencyContact.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contact Phone</p>
                  <p className="text-base font-medium text-gray-900">{emergencyContact.phone || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Registration Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Doctor UID</p>
                  <p className="text-base font-medium text-gray-900">{patient.doctorUID || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Registration Method</p>
                  <p className="text-base font-medium text-gray-900">{registrationInfo.registrationMethod || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            {patient.inviteToken === null && !formData?.registrationInfo?.rejected ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={onClose} variant="outline" className="sm:w-auto" disabled={isLoading}>
                  {BUTTON_LABELS.CLOSE}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleApproveClick}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {BUTTON_LABELS.APPROVE_DOCTOR.replace('Doctor', 'Patient')}
                </Button>
                <Button
                  onClick={handleRejectClick}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  disabled={isLoading}
                >
                  {BUTTON_LABELS.REJECT_APPLICATION.replace('Application', 'Patient')}
                </Button>
                <Button onClick={onClose} variant="outline" className="sm:w-auto" disabled={isLoading}>
                  {BUTTON_LABELS.CLOSE}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!showConfirmation}
        type={showConfirmation || 'approve'}
        patientName={`${personalInfo.firstName} ${personalInfo.lastName}`.trim() || patient.email}
        onConfirm={confirmAction}
        onCancel={() => {
          setShowConfirmation(null);
          setRejectRemark('');
        }}
        isLoading={isLoading}
      >
        {showConfirmation === 'reject' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {FORM_LABELS.REASON_FOR_REJECTION}
            </label>
            <textarea
              value={rejectRemark}
              onChange={(e) => setRejectRemark(e.target.value)}
              placeholder={FORM_LABELS.REJECTION_REASON_PLACEHOLDER}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 text-sm text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>
        )}
      </ConfirmationModal>
    </>
  );
}

export function PatientManagement() {
  const { toasts, removeToast, success, error } = useToast();
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadAllPatients();
  }, []);

  const loadAllPatients = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getPatients();
      if (response.success && response.data) {
        setAllPatients(response.data);
      }
    } catch (err) {
      logger.error('Failed to load patients', err);
      error(ERROR_MESSAGES.LOAD_DOCTORS_FAILED.replace('doctors', 'patients'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (patientId: number) => {
    try {
      setActionLoading(patientId);
      const response = await fetch(`/api/admin/patients/approve/${patientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      
      if (result.success) {
        success('Patient approved successfully');
        await loadAllPatients();
        setShowModal(false);
      } else {
        error(result.error || 'Failed to approve patient');
      }
    } catch (err) {
      logger.error('Failed to approve patient', err);
      error('Failed to approve patient');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (patientId: number, remark?: string) => {
    try {
      setActionLoading(patientId);
      const response = await fetch(`/api/admin/patients/reject/${patientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: remark }),
      });
      const result = await response.json();
      
      if (result.success) {
        success('Patient rejected successfully');
        await loadAllPatients();
        setShowModal(false);
      } else {
        error(result.error || 'Failed to reject patient');
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
    const isDeactivated = formData?.registrationInfo?.deactivated === true ||
      (patient.inviteToken && patient.inviteToken.startsWith('deactivated_'));
    const isPending = patient.inviteToken !== null && !isRejected && !isDeactivated;

    if (isRejected) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
    }
    if (isDeactivated || isPending) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
  };

  const getFilteredPatients = () => {
    let filtered = allPatients;

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(patient => {
        const formData = patient.formData as any;
        const isRejected = formData?.registrationInfo?.rejected === true || 
          (patient.inviteToken && patient.inviteToken.startsWith('rejected_'));
        const isDeactivated = formData?.registrationInfo?.deactivated === true ||
          (patient.inviteToken && patient.inviteToken.startsWith('deactivated_'));
        const isPending = patient.inviteToken !== null && !isRejected && !isDeactivated;

        if (statusFilter === 'PENDING') return isPending || isDeactivated;
        if (statusFilter === 'REJECTED') return isRejected;
        if (statusFilter === 'ACTIVE') return !isPending && !isRejected && !isDeactivated;
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      <div className="space-y-6">
        {/* Header with Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Patient Management ({filteredPatients.length})
            </h3>
            <p className="text-gray-600">Search, filter, and manage patient registrations</p>
          </div>
          <Button onClick={loadAllPatients} variant="outline" size="sm">
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
              {searchTerm || statusFilter !== 'ALL' ? EMPTY_STATE_MESSAGES.NO_RESULTS : 'No patients registered'}
            </h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'ALL' 
                ? 'Try adjusting your search or filter criteria'
                : 'Patients will appear here once they register'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((patient) => {
              const formData = patient.formData as any;
              const personalInfo = formData?.personalInfo || {};
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
                        <h4 className="text-base font-semibold text-gray-900 truncate">{fullName}</h4>
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
                      <span className="font-medium mr-2">Doctor:</span>
                      <span>{patient.doctorUID || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium mr-2">Registered:</span>
                      <span>{registrationDate}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedPatient(patient);
                      setShowModal(true);
                    }}
                    variant="outline"
                    className="w-full border-green-300 text-green-600 hover:bg-green-50"
                    size="sm"
                  >
                    👁️ {BUTTON_LABELS.VIEW_DETAILS}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Patient View Modal */}
      <PatientViewModal
        patient={selectedPatient}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onApprove={handleApprove}
        onReject={handleReject}
        isLoading={actionLoading === selectedPatient?.id}
      />
    </>
  );
}

