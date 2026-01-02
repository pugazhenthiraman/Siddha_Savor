'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/lib/services/adminService';
import { useToast } from '@/lib/hooks/useToast';
import { DoctorDetailsModal } from './DoctorDetailsModal';
import { Doctor, Patient } from '@/lib/types';
import { DoctorStats } from '@/lib/types/doctor';

export function DoctorManagement() {
  const { error } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [doctorStats, setDoctorStats] = useState<DoctorStats | null>(null);
  const [doctorPatients, setDoctorPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadApprovedDoctors();
  }, []);

  const loadApprovedDoctors = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await adminService.getDoctors();
      if (response.success) {
        const approvedDoctors = response.data.filter((doctor: Doctor) => doctor.status === 'APPROVED');
        setDoctors(approvedDoctors);
      }
    } catch (err) {
      error('Failed to load doctors');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDoctorDetails = async (doctor: Doctor): Promise<void> => {
    try {
      setIsLoadingDetails(true);
      setSelectedDoctor(doctor);
      setIsModalOpen(true);
      
      const [statsResponse, patientsResponse] = await Promise.all([
        adminService.getDoctorStats(doctor.doctorUID!),
        adminService.getDoctorPatients(doctor.doctorUID!)
      ]);

      if (statsResponse.success) {
        setDoctorStats(statsResponse.data);
      }
      
      if (patientsResponse.success) {
        setDoctorPatients(patientsResponse.data);
      }
    } catch (err) {
      error('Failed to load doctor details');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const closeModal = (): void => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
    setDoctorStats(null);
    setDoctorPatients([]);
  };

  const filteredDoctors = doctors.filter(doctor => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${doctor.formData.personalInfo?.firstName || ''} ${doctor.formData.personalInfo?.lastName || ''}`.toLowerCase();
    return fullName.includes(searchLower) || 
           doctor.email.toLowerCase().includes(searchLower) ||
           doctor.doctorUID?.toLowerCase().includes(searchLower) ||
           doctor.formData.professionalInfo?.specialization?.toLowerCase().includes(searchLower);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Loading doctors...</span>
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
              <h3 className="text-lg font-semibold text-black">Approved Doctors</h3>
              <p className="text-sm text-gray-600 mt-1">
                {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="bg-white rounded-xl shadow-sm">
          {filteredDoctors.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👨‍⚕️</span>
              </div>
              <h3 className="text-lg font-medium text-black mb-2">No Doctors Found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'No doctors match your search criteria.' : 'No approved doctors available.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  onClick={() => loadDoctorDetails(doctor)}
                  className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200 hover:border-green-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold">
                        {doctor.formData.personalInfo?.firstName?.[0]}{doctor.formData.personalInfo?.lastName?.[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-black truncate">
                        Dr. {doctor.formData.personalInfo?.firstName} {doctor.formData.personalInfo?.lastName}
                      </h4>
                      <p className="text-xs text-gray-600 truncate">{doctor.email}</p>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {doctor.formData.professionalInfo?.specialization}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {doctor.doctorUID}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(doctor.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Doctor Details Modal */}
      <DoctorDetailsModal
        doctor={selectedDoctor}
        stats={doctorStats}
        patients={doctorPatients}
        isOpen={isModalOpen}
        onClose={closeModal}
        isLoading={isLoadingDetails}
      />
    </>
  );
}
