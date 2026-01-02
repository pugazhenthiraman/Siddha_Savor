'use client';

import { useState, useEffect } from 'react';
import { Patient } from '@/lib/types';
import { doctorService } from '@/lib/services/doctorService';
import { PatientVitals } from './PatientVitals';
import { useToast } from '@/lib/hooks/useToast';
import { logger } from '@/lib/utils/logger';

interface ActivePatientsProps {
  doctorUID: string;
}

export function ActivePatients({ doctorUID }: ActivePatientsProps) {
  const { error } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<'patients' | 'vitals'>('patients');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchActivePatients();
  }, [doctorUID]);

  const fetchActivePatients = async () => {
    try {
      setIsLoading(true);
      const response = await doctorService.getPatients(doctorUID);
      
      if (response.success && response.data) {
        const activePatients = response.data.filter(patient => {
          if (patient.status !== 'APPROVED') return false;
          const formData = patient.formData as any;
          const status = formData?.status || formData?.personalInfo?.status;
          return status !== 'CURED';
        });
        
        setPatients(activePatients);
      } else {
        error('Failed to fetch active patients');
      }
    } catch (err) {
      logger.error('Failed to fetch active patients', err);
      error('Failed to fetch active patients');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const formData = patient.formData as any;
    const personalInfo = formData?.personalInfo || {};
    const fullName = `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.toLowerCase();
    const email = patient.email.toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return fullName.includes(search) || email.includes(search);
  });

  const getPatientStatus = (patient: Patient) => {
    const formData = patient.formData as any;
    const status = formData?.status || formData?.personalInfo?.status;
    return status || 'ACTIVE';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'CURED': return 'bg-blue-100 text-blue-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setActiveTab('vitals');
  };

  const handleBackToPatients = () => {
    setSelectedPatient(null);
    setActiveTab('patients');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">Loading active patients...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('patients')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'patients'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center space-x-2">
              <span>👥</span>
              <span>Active Patients ({filteredPatients.length})</span>
            </span>
          </button>
          
          {selectedPatient && (
            <button
              onClick={() => setActiveTab('vitals')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'vitals'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>🩺</span>
                <span>Patient Vitals</span>
              </span>
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'patients' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Active Patients</h2>
              <p className="text-gray-600">Manage vitals and diagnosis for patients you have approved</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Patients Grid */}
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active patients found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Try adjusting your search terms.' : 'Active patients are those you have approved and are currently under treatment.'}
              </p>
              <p className="text-sm text-gray-400">
                Patients appear here only after you approve them from the "Patients" tab.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPatients.map((patient) => {
                const formData = patient.formData as any;
                const personalInfo = formData?.personalInfo || {};
                const addressInfo = formData?.addressInfo || {};
                const status = getPatientStatus(patient);
                
                return (
                  <div
                    key={patient.id}
                    className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {personalInfo.firstName} {personalInfo.lastName}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">{patient.email}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            {personalInfo.age && (
                              <span>{personalInfo.age} years</span>
                            )}
                            {personalInfo.gender && (
                              <>
                                <span>•</span>
                                <span className="capitalize">{personalInfo.gender}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        {personalInfo.occupation && (
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6" />
                            </svg>
                            <span className="capitalize">
                              {personalInfo.occupation === 'other' && personalInfo.customOccupation
                                ? personalInfo.customOccupation
                                : personalInfo.occupation}
                            </span>
                          </div>
                        )}
                        {personalInfo.workType && (
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              personalInfo.workType === 'soft' ? 'bg-green-100 text-green-700' :
                              personalInfo.workType === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              personalInfo.workType === 'hard' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {personalInfo.workType === 'soft' ? 'Mild Activity' :
                               personalInfo.workType === 'medium' ? 'Moderate Activity' :
                               personalInfo.workType === 'hard' ? 'Heavy Activity' :
                               personalInfo.workType}
                            </span>
                          </div>
                        )}
                        {addressInfo.city && (
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{addressInfo.city}, {addressInfo.state}</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handlePatientSelect(patient)}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                      >
                        Update Vitals & Diagnosis
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'vitals' && selectedPatient && (
        <PatientVitals 
          patient={selectedPatient} 
          isOpen={true}
          onClose={handleBackToPatients}
        />
      )}
    </div>
  );
}
