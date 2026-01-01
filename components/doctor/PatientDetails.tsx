'use client';

import { useState, useEffect } from 'react';
import { doctorService, PatientDiagnosis } from '@/lib/services/doctorService';
import { Patient } from '@/lib/types';
import { 
  DOCTOR_BUTTONS, 
  DOCTOR_EMPTY_STATES, 
  TREATMENT_TYPES, 
  FOOD_CATEGORIES, 
  ACTIVITY_TYPES 
} from '@/lib/constants/doctor';
import { useToast } from '@/lib/hooks/useToast';
import { logger } from '@/lib/utils/logger';

interface PatientDetailsProps {
  patient: Patient;
  onClose: () => void;
}

export function PatientDetails({ patient, onClose }: PatientDetailsProps) {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<'details' | 'diagnosis' | 'visits'>('details');
  const [visits, setVisits] = useState<PatientDiagnosis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDiagnosisForm, setShowDiagnosisForm] = useState(false);
  
  const [diagnosisForm, setDiagnosisForm] = useState({
    diagnosis: '',
    treatment: '',
    medicines: [''],
    foods: [''],
    activities: [''],
    visitDate: new Date().toISOString().split('T')[0],
    nextVisit: '',
    notes: '',
  });

  useEffect(() => {
    if (activeTab === 'visits') {
      fetchVisits();
    }
  }, [activeTab]);

  const fetchVisits = async () => {
    try {
      setIsLoading(true);
      // Mock data for now
      setVisits([
        {
          id: 1,
          patientId: patient.id,
          diagnosis: 'Digestive issues, Vata imbalance',
          treatment: 'Ayurvedic medicines and dietary changes',
          medicines: ['Triphala Churna', 'Hingvastak Churna', 'Dadimadi Ghrita'],
          foods: ['Warm cooked foods', 'Ginger tea', 'Avoid cold drinks'],
          activities: ['Morning walk', 'Pranayama', 'Abhyanga massage'],
          visitDate: '2024-01-15',
          nextVisit: '2024-02-15',
          notes: 'Patient showing improvement in digestion. Continue current treatment.',
        },
        {
          id: 2,
          patientId: patient.id,
          diagnosis: 'Follow-up visit - Vata balancing',
          treatment: 'Continued Ayurvedic treatment',
          medicines: ['Triphala Churna', 'Ashwagandha'],
          foods: ['Warm milk with turmeric', 'Cooked vegetables'],
          activities: ['Yoga', 'Meditation'],
          visitDate: '2024-02-15',
          notes: 'Good progress. Patient feels more energetic.',
        },
      ]);
    } catch (err) {
      logger.error('Failed to fetch patient visits', err);
      error('Failed to load patient visits');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiagnosisSubmit = async () => {
    try {
      const diagnosisData: PatientDiagnosis = {
        id: 0, // Will be set by backend
        patientId: patient.id,
        ...diagnosisForm,
        medicines: diagnosisForm.medicines.filter(m => m.trim()),
        foods: diagnosisForm.foods.filter(f => f.trim()),
        activities: diagnosisForm.activities.filter(a => a.trim()),
      };

      const response = await doctorService.updateDiagnosis(diagnosisData);
      if (response.success) {
        success('Diagnosis updated successfully');
        setShowDiagnosisForm(false);
        fetchVisits();
        // Reset form
        setDiagnosisForm({
          diagnosis: '',
          treatment: '',
          medicines: [''],
          foods: [''],
          activities: [''],
          visitDate: new Date().toISOString().split('T')[0],
          nextVisit: '',
          notes: '',
        });
      }
    } catch (err) {
      logger.error('Failed to update diagnosis', err);
      error('Failed to update diagnosis');
    }
  };

  const addArrayField = (field: 'medicines' | 'foods' | 'activities') => {
    setDiagnosisForm(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateArrayField = (field: 'medicines' | 'foods' | 'activities', index: number, value: string) => {
    setDiagnosisForm(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeArrayField = (field: 'medicines' | 'foods' | 'activities', index: number) => {
    setDiagnosisForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const formData = patient.formData as any;
  const personalInfo = formData?.personalInfo || {};
  const addressInfo = formData?.addressInfo || {};
  const emergencyContact = formData?.emergencyContact || {};
  const fullName = `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim();

  return (
    <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border-2 border-gray-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-semibold">
              {fullName.split(' ').map(n => n[0]).join('').toUpperCase() || 'P'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{fullName}</h2>
              <p className="text-sm text-gray-600">{patient.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'details', label: 'Patient Details', icon: '👤' },
            { id: 'diagnosis', label: 'Diagnosis & Treatment', icon: '🩺' },
            { id: 'visits', label: 'Visit History', icon: '📋' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Patient Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-gray-900">{fullName || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{patient.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-gray-900">{personalInfo.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                      <p className="text-gray-900">{personalInfo.dateOfBirth || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Gender</label>
                      <p className="text-gray-900 capitalize">{personalInfo.gender || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Age</label>
                      <p className="text-gray-900">{personalInfo.age ? `${personalInfo.age} years old` : 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Occupation</label>
                      <p className="text-gray-900 capitalize">
                        {personalInfo.occupation === 'other' && personalInfo.customOccupation
                          ? personalInfo.customOccupation
                          : personalInfo.occupation || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Work Type</label>
                      <p className="text-gray-900">
                        {personalInfo.workType ? (
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            personalInfo.workType === 'soft' ? 'bg-green-100 text-green-800' :
                            personalInfo.workType === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            personalInfo.workType === 'hard' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {personalInfo.workType === 'soft' ? 'Soft Work (Mild Activity)' :
                             personalInfo.workType === 'medium' ? 'Medium Work (Moderate Activity)' :
                             personalInfo.workType === 'hard' ? 'Hard Work (Heavy Activity)' :
                             personalInfo.workType}
                          </span>
                        ) : 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Address</label>
                      <p className="text-gray-900">{addressInfo.address || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">City, State</label>
                      <p className="text-gray-900">
                        {addressInfo.city && addressInfo.state 
                          ? `${addressInfo.city}, ${addressInfo.state}` 
                          : 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">PIN Code</label>
                      <p className="text-gray-900">{addressInfo.pincode || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Emergency Contact</label>
                      <p className="text-gray-900">
                        {emergencyContact.name 
                          ? `${emergencyContact.name} (${emergencyContact.phone || 'N/A'})`
                          : 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Diagnosis Tab */}
          {activeTab === 'diagnosis' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Diagnosis & Treatment</h3>
                <button
                  onClick={() => setShowDiagnosisForm(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  {DOCTOR_BUTTONS.UPDATE_DIAGNOSIS}
                </button>
              </div>

              {showDiagnosisForm && (
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
                      <textarea
                        value={diagnosisForm.diagnosis}
                        onChange={(e) => setDiagnosisForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter diagnosis..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Treatment Plan</label>
                      <textarea
                        value={diagnosisForm.treatment}
                        onChange={(e) => setDiagnosisForm(prev => ({ ...prev, treatment: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter treatment plan..."
                      />
                    </div>
                  </div>

                  {/* Medicines */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-700">Medicines</label>
                      <button
                        onClick={() => addArrayField('medicines')}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Add Medicine
                      </button>
                    </div>
                    {diagnosisForm.medicines.map((medicine, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={medicine}
                          onChange={(e) => updateArrayField('medicines', index, e.target.value)}
                          className="flex-1 p-2 border border-gray-300 rounded"
                          placeholder="Medicine name..."
                        />
                        {diagnosisForm.medicines.length > 1 && (
                          <button
                            onClick={() => removeArrayField('medicines', index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Foods */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-700">Food Recommendations</label>
                      <button
                        onClick={() => addArrayField('foods')}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Add Food
                      </button>
                    </div>
                    {diagnosisForm.foods.map((food, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={food}
                          onChange={(e) => updateArrayField('foods', index, e.target.value)}
                          className="flex-1 p-2 border border-gray-300 rounded"
                          placeholder="Food recommendation..."
                        />
                        {diagnosisForm.foods.length > 1 && (
                          <button
                            onClick={() => removeArrayField('foods', index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Activities */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-700">Activities</label>
                      <button
                        onClick={() => addArrayField('activities')}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Add Activity
                      </button>
                    </div>
                    {diagnosisForm.activities.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={activity}
                          onChange={(e) => updateArrayField('activities', index, e.target.value)}
                          className="flex-1 p-2 border border-gray-300 rounded"
                          placeholder="Activity recommendation..."
                        />
                        {diagnosisForm.activities.length > 1 && (
                          <button
                            onClick={() => removeArrayField('activities', index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Visit Date</label>
                      <input
                        type="date"
                        value={diagnosisForm.visitDate}
                        onChange={(e) => setDiagnosisForm(prev => ({ ...prev, visitDate: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Next Visit (Optional)</label>
                      <input
                        type="date"
                        value={diagnosisForm.nextVisit}
                        onChange={(e) => setDiagnosisForm(prev => ({ ...prev, nextVisit: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={diagnosisForm.notes}
                      onChange={(e) => setDiagnosisForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none h-20 text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Additional notes..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowDiagnosisForm(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      {DOCTOR_BUTTONS.CANCEL}
                    </button>
                    <button
                      onClick={handleDiagnosisSubmit}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      {DOCTOR_BUTTONS.SAVE_CHANGES}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Visits Tab */}
          {activeTab === 'visits' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Visit History</h3>
              
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-4 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : visits.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📋</span>
                  </div>
                  <p className="text-gray-600">{DOCTOR_EMPTY_STATES.NO_VISITS}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {visits.map((visit) => (
                    <div key={visit.id} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900">{visit.diagnosis}</h4>
                          <p className="text-sm text-gray-600">Visit Date: {visit.visitDate}</p>
                          {visit.nextVisit && (
                            <p className="text-sm text-blue-600">Next Visit: {visit.nextVisit}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2">Medicines</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {visit.medicines.map((medicine, index) => (
                              <li key={index}>• {medicine}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2">Food Recommendations</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {visit.foods.map((food, index) => (
                              <li key={index}>• {food}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2">Activities</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {visit.activities.map((activity, index) => (
                              <li key={index}>• {activity}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {visit.notes && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h5 className="font-medium text-gray-700 mb-2">Notes</h5>
                          <p className="text-sm text-gray-600">{visit.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
