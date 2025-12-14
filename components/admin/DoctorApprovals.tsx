'use client';

import { useState, useEffect } from 'react';
import { adminService, type Doctor } from '@/lib/services/adminService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/lib/hooks/useToast';
import { Toast } from '@/components/ui/Toast';

interface ConfirmationModalProps {
  isOpen: boolean;
  type: 'approve' | 'reject' | 'revert';
  doctorName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
  children?: React.ReactNode;
}

function ConfirmationModal({ isOpen, type, doctorName, onConfirm, onCancel, isLoading, children }: ConfirmationModalProps) {
  if (!isOpen) return null;

  const config = {
    approve: {
      title: '✅ Confirm Approval',
      message: `Are you sure you want to approve Dr. ${doctorName}?`,
      description: 'This will send a welcome email and grant dashboard access.',
      confirmText: 'Yes, Approve',
      confirmClass: 'bg-green-600 hover:bg-green-700',
      bgClass: 'bg-green-50 border-green-200'
    },
    reject: {
      title: '❌ Confirm Rejection',
      message: `Are you sure you want to reject Dr. ${doctorName}?`,
      description: 'This will send a rejection email with your remarks.',
      confirmText: 'Yes, Reject',
      confirmClass: 'bg-red-600 hover:bg-red-700',
      bgClass: 'bg-red-50 border-red-200'
    },
    revert: {
      title: '🔄 Confirm Status Change',
      message: `Change status for Dr. ${doctorName}?`,
      description: 'This will update their status and send a notification email.',
      confirmText: 'Yes, Change Status',
      confirmClass: 'bg-blue-600 hover:bg-blue-700',
      bgClass: 'bg-blue-50 border-blue-200'
    }
  }[type];

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4"
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
              Cancel
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

interface DoctorViewModalProps {
  doctor: Doctor | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (doctorId: number) => void;
  onReject: (doctorId: number, remark?: string) => void;
  onRevert: (doctorId: number, newStatus: string) => void;
  isLoading: boolean;
}

function DoctorViewModal({ doctor, isOpen, onClose, onApprove, onReject, onRevert, isLoading }: DoctorViewModalProps) {
  const [rejectRemark, setRejectRemark] = useState('');
  const [showConfirmation, setShowConfirmation] = useState<'approve' | 'reject' | 'revert' | null>(null);
  const [revertStatus, setRevertStatus] = useState('');

  if (!isOpen || !doctor) return null;

  const formData = doctor.formData as any;
  const personalInfo = formData?.personalInfo || {};
  const professionalInfo = formData?.professionalInfo || {};
  const practiceInfo = formData?.practiceInfo || {};

  const handleApprove = () => {
    setShowConfirmation('approve');
  };

  const handleReject = () => {
    setShowConfirmation('reject');
  };

  const handleRevert = (newStatus: string) => {
    setRevertStatus(newStatus);
    setShowConfirmation('revert');
  };

  const confirmAction = () => {
    if (showConfirmation === 'approve') {
      onApprove(doctor.id);
    } else if (showConfirmation === 'reject') {
      if (!rejectRemark.trim()) {
        // Show visual feedback that reason is required
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
      onReject(doctor.id, rejectRemark);
    } else if (showConfirmation === 'revert') {
      onRevert(doctor.id, revertStatus);
    }
    setShowConfirmation(null);
    setRejectRemark('');
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {personalInfo.firstName?.[0] || doctor.email[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Dr. {personalInfo.firstName} {personalInfo.lastName}
                  </h2>
                  <p className="text-gray-600">{professionalInfo.specialization}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-sm text-gray-500">{doctor.email}</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      doctor.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      doctor.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {doctor.status}
                    </span>
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

          {/* Content - Same as before */}
          <div className="p-6 space-y-8">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold mr-3">1</span>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-gray-900">{personalInfo.firstName} {personalInfo.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{personalInfo.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900">{personalInfo.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                  <p className="text-gray-900">{personalInfo.dateOfBirth || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm font-bold mr-3">2</span>
                Professional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Medical License</label>
                  <p className="text-gray-900 font-mono">{professionalInfo.medicalLicense || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Specialization</label>
                  <p className="text-gray-900">{professionalInfo.specialization || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Experience</label>
                  <p className="text-gray-900">{professionalInfo.experience || 'Not specified'} years</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Qualification</label>
                  <p className="text-gray-900">{professionalInfo.qualification || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Practice Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm font-bold mr-3">3</span>
                Practice Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Clinic Name</label>
                  <p className="text-gray-900">{practiceInfo.clinicName || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Clinic Phone</label>
                  <p className="text-gray-900">{practiceInfo.clinicNumber || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">City</label>
                  <p className="text-gray-900">{practiceInfo.city || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            {doctor.status === 'PENDING' ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleApprove}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  ✅ Approve Doctor
                </Button>
                <Button
                  onClick={handleReject}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  disabled={isLoading}
                >
                  ❌ Reject Application
                </Button>
                <Button onClick={onClose} variant="outline" className="sm:w-auto" disabled={isLoading}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => handleRevert('PENDING')}
                  variant="outline"
                  className="flex-1 border-yellow-300 text-yellow-600 hover:bg-yellow-50"
                  isLoading={isLoading && revertStatus === 'PENDING'}
                  disabled={isLoading}
                >
                  🔄 Revert to Pending
                </Button>
                {doctor.status === 'APPROVED' && (
                  <Button
                    onClick={() => handleRevert('REJECTED')}
                    variant="outline"
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                    isLoading={isLoading && revertStatus === 'REJECTED'}
                    disabled={isLoading}
                  >
                    ❌ Change to Rejected
                  </Button>
                )}
                {doctor.status === 'REJECTED' && (
                  <Button
                    onClick={() => handleRevert('APPROVED')}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    isLoading={isLoading && revertStatus === 'APPROVED'}
                    disabled={isLoading}
                  >
                    ✅ Change to Approved
                  </Button>
                )}
                <Button onClick={onClose} variant="outline" className="sm:w-auto" disabled={isLoading}>
                  Close
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
        doctorName={`${personalInfo.firstName} ${personalInfo.lastName}`}
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
              Reason for Rejection *
            </label>
            <textarea
              value={rejectRemark}
              onChange={(e) => setRejectRemark(e.target.value)}
              placeholder="Please provide a detailed reason for rejection..."
              className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={3}
              required
            />
            {!rejectRemark.trim() && (
              <p className="text-xs text-red-600 mt-1">Rejection reason is required</p>
            )}
            {rejectRemark.trim() && (
              <div className="bg-gray-50 rounded-lg p-3 mt-3">
                <p className="text-sm font-medium text-gray-700">Preview:</p>
                <p className="text-sm text-gray-600 mt-1">{rejectRemark}</p>
              </div>
            )}
          </div>
        )}
      </ConfirmationModal>
    </>
  );
}

interface DoctorCardProps {
  doctor: Doctor;
  onView: (doctor: Doctor) => void;
  onQuickApprove: (doctorId: number) => void;
  isLoading: boolean;
}

function DoctorCard({ doctor, onView, onQuickApprove, isLoading }: DoctorCardProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const formData = doctor.formData as any;
  const personalInfo = formData?.personalInfo || {};
  const professionalInfo = formData?.professionalInfo || {};

  const handleQuickApprove = () => {
    setShowConfirmation(true);
  };

  const confirmApprove = () => {
    onQuickApprove(doctor.id);
    setShowConfirmation(false);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {personalInfo.firstName?.[0] || doctor.email[0].toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Dr. {personalInfo.firstName} {personalInfo.lastName}
                </h3>
                <p className="text-sm text-gray-600">{doctor.email}</p>
                <p className="text-sm text-green-600 font-medium">{professionalInfo.specialization}</p>
              </div>
            </div>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              doctor.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
              doctor.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {doctor.status}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs font-medium text-gray-500">Experience</p>
              <p className="text-sm text-gray-900">{professionalInfo.experience || 'Not specified'} years</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Applied</p>
              <p className="text-sm text-gray-900">{new Date(doctor.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={() => onView(doctor)}
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={isLoading}
            >
              👁️ View Details
            </Button>
            {doctor.status === 'PENDING' && (
              <Button
                onClick={handleQuickApprove}
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700"
                isLoading={isLoading}
                disabled={isLoading}
              >
                ✅ Quick Approve
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Approve Confirmation */}
      <ConfirmationModal
        isOpen={showConfirmation}
        type="approve"
        doctorName={`${personalInfo.firstName} ${personalInfo.lastName}`}
        onConfirm={confirmApprove}
        onCancel={() => setShowConfirmation(false)}
        isLoading={isLoading}
      />
    </>
  );
}

export function DoctorApprovals() {
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    loadAllDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [allDoctors, searchTerm, statusFilter]);

  const loadAllDoctors = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getDoctors();
      if (response.success && response.data) {
        setAllDoctors(response.data);
      }
    } catch (err) {
      error('Failed to load doctors');
    } finally {
      setIsLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = allDoctors;

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(doctor => doctor.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(doctor => {
        const formData = doctor.formData as any;
        const personalInfo = formData?.personalInfo || {};
        const professionalInfo = formData?.professionalInfo || {};
        
        return (
          doctor.email.toLowerCase().includes(term) ||
          personalInfo.firstName?.toLowerCase().includes(term) ||
          personalInfo.lastName?.toLowerCase().includes(term) ||
          professionalInfo.specialization?.toLowerCase().includes(term) ||
          professionalInfo.medicalLicense?.toLowerCase().includes(term)
        );
      });
    }

    setFilteredDoctors(filtered);
  };

  const handleViewDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowModal(true);
  };

  const handleApprove = async (doctorId: number) => {
    try {
      setActionLoading(doctorId);
      
      const response = await adminService.approveDoctor(doctorId);
      if (response.success) {
        success('Doctor approved successfully! Welcome email sent.');
        await loadAllDoctors();
        setShowModal(false);
      }
    } catch (err) {
      error('Failed to approve doctor');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (doctorId: number, remark?: string) => {
    try {
      setActionLoading(doctorId);
      
      const response = await adminService.rejectDoctor(doctorId, remark);
      if (response.success) {
        success('Doctor application rejected. Notification email sent.');
        await loadAllDoctors();
        setShowModal(false);
      }
    } catch (err) {
      error('Failed to reject doctor');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevert = async (doctorId: number, newStatus: string) => {
    try {
      setActionLoading(doctorId);
      
      const response = await adminService.revertDoctor(doctorId, newStatus, 'Status changed by admin');
      
      if (response.success) {
        success(`Doctor status changed to ${newStatus}. Notification email sent.`);
        await loadAllDoctors();
        setShowModal(false);
      }
    } catch (err) {
      error('Failed to change doctor status');
    } finally {
      setActionLoading(null);
    }
  };

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
              Doctor Management ({filteredDoctors.length})
            </h3>
            <p className="text-gray-600">Search, filter, and manage doctor applications</p>
          </div>
          <Button onClick={loadAllDoctors} variant="outline" size="sm">
            🔄 Refresh
          </Button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by name, email, specialization, or license..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'ALL' ? 'No Results Found' : 'No Doctors Yet'}
            </h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'ALL' 
                ? 'Try adjusting your search or filter criteria'
                : 'Doctor applications will appear here once submitted'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onView={handleViewDoctor}
                onQuickApprove={handleApprove}
                isLoading={actionLoading === doctor.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Doctor View Modal */}
      <DoctorViewModal
        doctor={selectedDoctor}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onApprove={handleApprove}
        onReject={handleReject}
        onRevert={handleRevert}
        isLoading={actionLoading === selectedDoctor?.id}
      />
    </>
  );
}
