'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/lib/services/adminService';
import { useToast } from '@/lib/hooks/useToast';
import { PatientDetailsModal } from './PatientDetailsModal';
import { Patient } from '@/lib/types';
import { PatientStats } from '@/lib/types/patient';

export function PatientManagementNew() {
  const { error } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientStats, setPatientStats] = useState<PatientStats | null>(null);
  const [patientVitals, setPatientVitals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await adminService.getPatients();
      if (response.success) {
        setPatients(response.data);
      }
    } catch (err) {
      error('Failed to load patients');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPatientDetails = async (patient: Patient): Promise<void> => {
    try {
      setIsLoadingDetails(true);
      setSelectedPatient(patient);
      setIsModalOpen(true);
      
      const [statsResponse, vitalsResponse] = await Promise.all([
        adminService.getPatientStats(patient.id),
        adminService.getPatientVitals(patient.id)
      ]);

      if (statsResponse.success) {
        setPatientStats(statsResponse.data);
      }
      
      if (vitalsResponse.success) {
        setPatientVitals(vitalsResponse.data);
      }
    } catch (err) {
      error('Failed to load patient details');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const closeModal = (): void => {
    setIsModalOpen(false);
    setSelectedPatient(null);
    setPatientStats(null);
    setPatientVitals([]);
  };

  const filteredPatients = patients.filter(patient => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${patient.formData.firstName || ''} ${patient.formData.lastName || ''}`.toLowerCase();
    return fullName.includes(searchLower) || 
           patient.email.toLowerCase().includes(searchLower) ||
           patient.patientUID?.toLowerCase().includes(searchLower) ||
           patient.doctorUID?.toLowerCase().includes(searchLower);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading patients...</span>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-black">All Patients</h3>
              <p className="text-sm text-gray-600 mt-1">
                {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Patients Grid */}
        <div className="bg-white rounded-xl shadow-sm">
          {filteredPatients.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👤</span>
              </div>
              <h3 className="text-lg font-medium text-black mb-2">No Patients Found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'No patients match your search criteria.' : 'No patients registered yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => loadPatientDetails(patient)}
                  className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200 hover:border-blue-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {patient.formData.firstName?.[0]}{patient.formData.lastName?.[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-black truncate">
                        {patient.formData.firstName} {patient.formData.lastName}
                      </h4>
                      <p className="text-xs text-gray-600 truncate">{patient.email}</p>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {patient.doctorUID ? `Dr. ${patient.doctorUID}` : 'No doctor assigned'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {patient.patientUID}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(patient.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Patient Details Modal */}
      <PatientDetailsModal
        patient={selectedPatient}
        stats={patientStats}
        vitals={patientVitals}
        isOpen={isModalOpen}
        onClose={closeModal}
        isLoading={isLoadingDetails}
      />
    </>
  );
}
