'use client';

import { useState, useEffect } from 'react';
import { adminService, type Doctor } from '@/lib/services/adminService';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

interface ApprovalCardProps {
  doctor: Doctor;
  onApprove: (doctorId: number) => void;
  onReject: (doctorId: number) => void;
  isLoading: boolean;
}

function ApprovalCard({ doctor, onApprove, onReject, isLoading }: ApprovalCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const formData = doctor.formData || {};

  return (
    <div 
      className={`bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transform transition-all duration-500 hover:shadow-xl lg:rounded-2xl ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-100 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0 flex-1 lg:space-x-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 lg:w-12 lg:h-12 lg:text-lg">
              {formData.firstName?.[0] || doctor.email[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-gray-900 truncate lg:text-lg">
                Dr. {formData.firstName} {formData.lastName}
              </h3>
              <p className="text-xs text-gray-600 truncate lg:text-sm">{doctor.email}</p>
              <p className="text-xs text-blue-600 font-medium truncate">{formData.specialization}</p>
            </div>
          </div>
          <div className="shrink-0">
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full lg:px-3">
              Pending Review
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-2 lg:gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500 lg:text-sm">Experience</p>
            <p className="text-sm text-gray-900 lg:text-base">{formData.experience || 'Not specified'} years</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 lg:text-sm">License Number</p>
            <p className="text-sm text-gray-900 truncate lg:text-base">{formData.licenseNumber || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 lg:text-sm">Phone</p>
            <p className="text-sm text-gray-900 lg:text-base">{formData.phone || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 lg:text-sm">Applied</p>
            <p className="text-sm text-gray-900 lg:text-base">{new Date(doctor.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Toggle Details */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-blue-600 hover:text-blue-700 text-xs font-medium mb-4 flex items-center lg:text-sm"
        >
          {showDetails ? 'Hide' : 'Show'} Details
          <svg 
            className={`w-3 h-3 ml-1 transform transition-transform lg:w-4 lg:h-4 ${showDetails ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Expandable Details */}
        <div className={`overflow-hidden transition-all duration-300 ${showDetails ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-gray-50 rounded-lg p-3 mb-4 lg:p-4">
            <h4 className="font-medium text-gray-900 mb-2 text-sm lg:text-base">Additional Information</h4>
            <div className="space-y-2 text-xs lg:text-sm">
              <p><span className="font-medium">Education:</span> {formData.education || 'Not provided'}</p>
              <p><span className="font-medium">Hospital:</span> {formData.hospital || 'Not provided'}</p>
              <p><span className="font-medium">Bio:</span> {formData.bio || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={() => onApprove(doctor.id)}
            variant="primary"
            size="sm"
            isLoading={isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-sm lg:text-base"
          >
            ✅ Approve
          </Button>
          <Button
            onClick={() => onReject(doctor.id)}
            variant="outline"
            size="sm"
            isLoading={isLoading}
            className="flex-1 border-red-300 text-red-600 hover:bg-red-50 text-sm lg:text-base"
          >
            ❌ Reject
          </Button>
        </div>
      </div>
    </div>
  );
}

export function DoctorApprovals() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadPendingDoctors();
  }, []);

  const loadPendingDoctors = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getPendingDoctors();
      if (response.success && response.data) {
        setDoctors(response.data);
      }
    } catch (error) {
      setError('Failed to load pending doctors');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (doctorId: number) => {
    try {
      setActionLoading(doctorId);
      setError(null);
      
      const response = await adminService.approveDoctor(doctorId);
      if (response.success) {
        setSuccess('Doctor approved successfully!');
        setDoctors(doctors.filter(d => d.id !== doctorId));
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error) {
      setError('Failed to approve doctor');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (doctorId: number) => {
    try {
      setActionLoading(doctorId);
      setError(null);
      
      const response = await adminService.rejectDoctor(doctorId);
      if (response.success) {
        setSuccess('Doctor application rejected');
        setDoctors(doctors.filter(d => d.id !== doctorId));
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error) {
      setError('Failed to reject doctor');
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
            <div className="flex space-x-3">
              <div className="h-8 bg-gray-200 rounded flex-1"></div>
              <div className="h-8 bg-gray-200 rounded flex-1"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && <Alert variant="error" message={error} />}
      {success && <Alert variant="success" message={success} />}
      
      {doctors.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✅</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
          <p className="text-gray-600">No pending doctor approvals at the moment.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Pending Doctor Approvals ({doctors.length})
            </h3>
            <button
              onClick={loadPendingDoctors}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              🔄 Refresh
            </button>
          </div>
          
          {doctors.map((doctor, index) => (
            <ApprovalCard
              key={doctor.id}
              doctor={doctor}
              onApprove={handleApprove}
              onReject={handleReject}
              isLoading={actionLoading === doctor.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
