'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DoctorStatsGrid } from './DoctorStatsGrid';
import { DoctorInfo } from './DoctorInfo';
import { PatientList } from './PatientList';
import { Doctor, Patient } from '@/lib/types';
import { DoctorStats } from '@/lib/types/doctor';

interface DoctorDetailsModalProps {
  doctor: Doctor | null;
  stats: DoctorStats | null;
  patients: Patient[];
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
}

export function DoctorDetailsModal({ 
  doctor, 
  stats, 
  patients, 
  isOpen, 
  onClose, 
  isLoading 
}: DoctorDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'info' | 'patients'>('overview');

  if (!doctor) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'info', label: 'Information', icon: '👨‍⚕️' },
    { id: 'patients', label: 'Patients', icon: '👥' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Dr. ${doctor.formData.personalInfo?.firstName} ${doctor.formData.personalInfo?.lastName}`}
      size="xl"
    >
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Doctor Header */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-6 pb-6 border-b border-gray-200">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-green-600 font-semibold text-xl sm:text-2xl">
              {doctor.formData.personalInfo?.firstName?.[0]}{doctor.formData.personalInfo?.lastName?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl sm:text-2xl font-semibold text-black">
              Dr. {doctor.formData.personalInfo?.firstName} {doctor.formData.personalInfo?.lastName}
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">{doctor.formData.professionalInfo?.specialization}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">
                {doctor.doctorUID}
              </span>
              <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                Approved
              </span>
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-3 text-gray-600">Loading details...</span>
          </div>
        ) : (
          <div className="min-h-[400px]">
            {activeTab === 'overview' && stats && (
              <div className="space-y-8">
                <DoctorStatsGrid stats={stats} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-base font-medium text-black">Quick Information</h4>
                    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="text-sm text-black font-medium">{doctor.email}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Specialization:</span>
                        <span className="text-sm text-black font-medium">{doctor.formData.professionalInfo?.specialization}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Experience:</span>
                        <span className="text-sm text-black font-medium">{doctor.formData.professionalInfo?.experience}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Joined:</span>
                        <span className="text-sm text-black font-medium">{new Date(doctor.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-base font-medium text-black">Recent Activity</h4>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <p className="text-sm text-gray-600">Last activity: {new Date(stats.recentActivity).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'info' && (
              <DoctorInfo doctor={doctor} />
            )}

            {activeTab === 'patients' && (
              <PatientList patients={patients} />
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
