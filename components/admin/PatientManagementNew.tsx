'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/lib/services/adminService';
import { useToast } from '@/lib/hooks/useToast';
import { PatientDetailsModal } from './PatientDetailsModal';
import { Patient } from '@/lib/types';
import { PatientStats } from '@/lib/types/patient';

// Helper function to parse formData
const parseFormData = (formData: any) => {
  try {
    const parsed = typeof formData === 'string' ? JSON.parse(formData) : formData;
    return parsed || {};
  } catch (error) {
    console.error('Error parsing formData:', error);
    return {};
  }
};

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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await adminService.getPatients();
      if (response.success && response.data) {
        setPatients(response.data as Patient[]);
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
      
      if (vitalsResponse.success && vitalsResponse.data) {
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
    const formData = parseFormData(patient.formData);
    const firstName = formData?.personalInfo?.firstName || '';
    const lastName = formData?.personalInfo?.lastName || '';
    const fullName = `${firstName} ${lastName}`.toLowerCase();
    const email = patient.email || '';
    const patientUID = patient.patientUID || '';
    const doctorUID = patient.doctorUID || '';
    
    return fullName.includes(searchLower) || 
           email.toLowerCase().includes(searchLower) ||
           patientUID.toLowerCase().includes(searchLower) ||
           doctorUID.toLowerCase().includes(searchLower);
  });

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Loading patients...</span>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-green-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">👥</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Active Patients</h3>
                <p className="text-sm text-gray-600">
                  {filteredPatients.length} active patient{filteredPatients.length !== 1 ? 's' : ''} • Page {currentPage} of {totalPages}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-80 pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white text-gray-900 transition-all"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {filteredPatients.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No Patients Found</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchTerm ? 'No patients match your search criteria. Try adjusting your search terms.' : 'No patients are currently registered in the system.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {paginatedPatients.map((patient) => {
                  const formData = parseFormData(patient.formData);
                  const firstName = formData?.personalInfo?.firstName || 'Unknown';
                  const lastName = formData?.personalInfo?.lastName || 'Patient';
                  const phone = formData?.personalInfo?.phone || 'No phone';
                  const initials = `${firstName[0] || 'U'}${lastName[0] || 'P'}`;
                  
                  return (
                    <div
                      key={patient.id}
                      onClick={() => loadPatientDetails(patient)}
                      className="bg-white rounded-xl p-5 hover:shadow-md cursor-pointer transition-all duration-200 border border-gray-200 hover:border-green-300 hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-white font-bold text-lg">
                            {initials}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-semibold text-gray-900 truncate">
                            {firstName} {lastName}
                          </h4>
                          <p className="text-sm text-gray-600 truncate">{patient.email || 'No email'}</p>
                          <p className="text-xs text-gray-500 truncate mt-1">
                            📞 {phone}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                            Active
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(patient.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium">
                            ID: {patient.patientUID || patient.id}
                          </span>
                          {patient.doctorUID && (
                            <span className="text-xs text-gray-500">
                              👨‍⚕️ Dr. {patient.doctorUID}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredPatients.length)} of {filteredPatients.length}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1 text-sm rounded-lg ${
                              currentPage === pageNum
                                ? 'bg-green-600 text-white'
                                : 'border border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      {totalPages > 5 && (
                        <>
                          <span className="text-gray-400">...</span>
                          <button
                            onClick={() => setCurrentPage(totalPages)}
                            className={`px-3 py-1 text-sm rounded-lg ${
                              currentPage === totalPages
                                ? 'bg-green-600 text-white'
                                : 'border border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

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
