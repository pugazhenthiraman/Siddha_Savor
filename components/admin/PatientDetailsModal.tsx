'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { PatientStatsGrid } from './PatientStatsGrid';
import { PatientInfo } from './PatientInfo';
import { VitalsList } from './VitalsList';
import { Patient } from '@/lib/types';
import { PatientStats } from '@/lib/types/patient';

interface PatientDetailsModalProps {
  patient: Patient | null;
  stats: PatientStats | null;
  vitals: any[];
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
}

export function PatientDetailsModal({ 
  patient, 
  stats, 
  vitals, 
  isOpen, 
  onClose, 
  isLoading 
}: PatientDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'info' | 'vitals'>('overview');

  if (!patient) return null;

  // Parse formData to get patient info
  const parseFormData = (formData: any) => {
    try {
      return typeof formData === 'string' ? JSON.parse(formData) : formData;
    } catch {
      return {};
    }
  };

  const formData = parseFormData(patient.formData);
  const firstName = formData?.personalInfo?.firstName || 'Unknown';
  const lastName = formData?.personalInfo?.lastName || 'Patient';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'info', label: 'Information', icon: '👤' },
    { id: 'vitals', label: 'Medical Records', icon: '🏥' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'CURED': return 'bg-blue-100 text-blue-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${firstName} ${lastName}`}
    >
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Patient Header */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-6 pb-6 border-b border-gray-200">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 font-semibold text-xl sm:text-2xl">
              {firstName[0]}{lastName[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl sm:text-2xl font-semibold text-black">
              {firstName} {lastName}
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">{patient.email}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {patient.patientUID}
              </span>
              {stats && (
                <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(stats.status)}`}>
                  {stats.status}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading details...</span>
          </div>
        ) : (
          <div className="min-h-[400px]">
            {activeTab === 'overview' && stats && (
              <div className="space-y-8">
                <PatientStatsGrid stats={stats} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-base font-medium text-black">Quick Information</h4>
                    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="text-sm text-black font-medium">{patient.email}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Phone:</span>
                        <span className="text-sm text-black font-medium">{formData?.personalInfo?.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Doctor:</span>
                        <span className="text-sm text-black font-medium">{stats.doctorName || 'Not assigned'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Joined:</span>
                        <span className="text-sm text-black font-medium">{new Date(patient.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-base font-medium text-black">Recent Activity</h4>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <p className="text-sm text-gray-600">
                        Last visit: {stats.lastVisit ? new Date(stats.lastVisit).toLocaleDateString() : 'No visits yet'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'info' && (
              <PatientInfo patient={patient} />
            )}

            {activeTab === 'vitals' && (
              <VitalsList vitals={vitals} />
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
