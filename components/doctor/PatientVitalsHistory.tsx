'use client';

import { useState, useEffect } from 'react';
import { Patient } from '@/lib/types';
import { useToast } from '@/lib/hooks/useToast';
import { NewVitalsForm } from './NewVitalsForm';
import { VitalsRecord, VitalsFilterType, VitalsViewMode } from '@/lib/types/vitals';

interface PatientVitalsHistoryProps {
  patient: Patient;
  onClose: () => void;
}

export function PatientVitalsHistory({ patient, onClose }: PatientVitalsHistoryProps) {
  const { success, error } = useToast();
  const [vitalsHistory, setVitalsHistory] = useState<VitalsRecord[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<VitalsRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<VitalsFilterType>('all');
  const [selectedRecord, setSelectedRecord] = useState<VitalsRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<Partial<VitalsRecord>>({});
  const [viewMode, setViewMode] = useState<VitalsViewMode>('list');
  const [showNewForm, setShowNewForm] = useState(false);

  useEffect(() => {
    fetchVitalsHistory();
  }, [patient.id]);

  useEffect(() => {
    filterHistory();
  }, [vitalsHistory, searchTerm, filter]);

  const fetchVitalsHistory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/doctor/vitals?patientId=${patient.id}`);
      const data = await response.json();
      
      if (data.success) {
        setVitalsHistory(data.vitals || []);
      } else {
        error('Failed to load vitals history');
      }
    } catch (err) {
      error('Failed to load vitals history');
    } finally {
      setIsLoading(false);
    }
  };

  const filterHistory = () => {
    let filtered = vitalsHistory;

    // Apply filter
    if (filter === 'updated') {
      filtered = filtered.filter(record => record.createdAt !== record.updatedAt);
    } else if (filter === 'pending') {
      filtered = filtered.filter(record => !record.notes || record.notes.trim() === '');
    }

    // Apply search
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.recordedAt).toLocaleDateString();
        const doctorName = (record.recordedBy || '').toLowerCase();
        
        return recordDate.includes(searchLower) ||
               doctorName.includes(searchLower) ||
               (record.pulseRate && record.pulseRate.toString().includes(searchLower)) ||
               (record.heartRate && record.heartRate.toString().includes(searchLower)) ||
               (record.temperature && record.temperature.toString().includes(searchLower)) ||
               (record.weight && record.weight.toString().includes(searchLower)) ||
               (record.bmi && record.bmi.toString().includes(searchLower));
      });
    }
    
    setFilteredHistory(filtered);
  };

  const handleEdit = (record: VitalsRecord) => {
    setSelectedRecord(record);
    setEditingRecord({ ...record });
    setViewMode('edit');
  };

  const handleSave = async () => {
    if (!selectedRecord || !editingRecord) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/doctor/vitals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRecord)
      });

      const data = await response.json();
      if (data.success) {
        success('Vitals updated successfully');
        setViewMode('list');
        setSelectedRecord(null);
        setEditingRecord({});
        fetchVitalsHistory();
      } else {
        error(data.error || 'Failed to update vitals');
      }
    } catch (err) {
      error('Failed to update vitals');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (record: VitalsRecord) => {
    const isUpdated = record.createdAt !== record.updatedAt;
    const hasNotes = record.notes && record.notes.trim() !== '';
    
    if (isUpdated && hasNotes) {
      return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Complete</span>;
    }
    if (isUpdated) {
      return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Updated</span>;
    }
    if (!hasNotes) {
      return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
    }
    return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Initial</span>;
  };

  if (viewMode === 'edit' && selectedRecord) {
    return (
      <div 
        className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-[110] p-4"
        onClick={() => setViewMode('list')}
      >
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Edit Vitals Record</h2>
            <div className="flex space-x-2">
              <button 
                onClick={handleSave} 
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setViewMode('list')}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold px-2"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Vital Signs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pulse Rate (bpm)</label>
                <input
                  type="number"
                  value={editingRecord.pulseRate || ''}
                  onChange={(e) => setEditingRecord(prev => ({ ...prev, pulseRate: parseInt(e.target.value) || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Heart Rate (bpm)</label>
                <input
                  type="number"
                  value={editingRecord.heartRate || ''}
                  onChange={(e) => setEditingRecord(prev => ({ ...prev, heartRate: parseInt(e.target.value) || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°F)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingRecord.temperature || ''}
                  onChange={(e) => setEditingRecord(prev => ({ ...prev, temperature: parseFloat(e.target.value) || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingRecord.weight || ''}
                  onChange={(e) => setEditingRecord(prev => ({ ...prev, weight: parseFloat(e.target.value) || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={editingRecord.height || ''}
                  onChange={(e) => setEditingRecord(prev => ({ ...prev, height: parseInt(e.target.value) || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                rows={4}
                value={editingRecord.notes || ''}
                onChange={(e) => setEditingRecord(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add diagnosis, treatment notes..."
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Patient Vitals History</h2>
              <p className="text-sm text-gray-500">
                {(patient.formData as any)?.personalInfo?.firstName} {(patient.formData as any)?.personalInfo?.lastName}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <button 
                onClick={() => setShowNewForm(true)} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors"
              >
                + New Vitals
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold px-2 self-end sm:self-auto"
              >
                ×
              </button>
            </div>
          </div>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by date, doctor, or vital values..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
              <svg className="absolute left-3 top-3.5 h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="sm:w-56">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as VitalsFilterType)}
                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium"
              >
                <option value="all">All Records ({vitalsHistory.length})</option>
                <option value="updated">Updated ({vitalsHistory.filter(r => r.createdAt !== r.updatedAt).length})</option>
                <option value="pending">Pending ({vitalsHistory.filter(r => !r.notes || r.notes.trim() === '').length})</option>
              </select>
            </div>
          </div>
          
          <div className="mt-3 text-sm font-medium text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
            Showing {filteredHistory.length} of {vitalsHistory.length} records
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchTerm || filter !== 'all' 
                  ? 'No vitals records match your search criteria.' 
                  : 'No vitals records found for this patient.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredHistory.map((record) => (
                <div key={record.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {new Date(record.recordedAt).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Recorded by {record.recordedBy} at {new Date(record.recordedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(record)}
                      <button 
                        onClick={() => handleEdit(record)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* TDEE & BMR Stats - Prominent Display */}
                  {(record.bmr || record.tdee) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {record.bmr && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl border border-green-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="text-sm text-green-600 font-semibold mb-2">BMR (Basal Metabolic Rate)</div>
                              <div className="text-4xl font-bold text-green-900 mb-2">{record.bmr.toFixed(2)}</div>
                              <div className="text-sm text-green-700 font-medium">MJ/day</div>
                              <div className="text-xs text-green-600 mt-2">Energy needed at complete rest</div>
                            </div>
                            <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center ml-4">
                              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {record.tdee && (
                        <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-6 rounded-xl border border-purple-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="text-sm text-purple-600 font-semibold mb-2">TDEE (Total Daily Energy Expenditure)</div>
                              <div className="text-4xl font-bold text-purple-900 mb-2">{record.tdee.toFixed(2)}</div>
                              <div className="text-sm text-purple-700 font-medium">MJ/day</div>
                              <div className="text-xs text-purple-600 mt-2">Total energy needed including activity</div>
                            </div>
                            <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center ml-4">
                              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Vital Signs Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                    {record.pulseRate && (
                      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                        <div className="text-xs text-blue-600 font-medium mb-1">Pulse Rate</div>
                        <div className="text-sm font-semibold text-blue-900">{record.pulseRate} bpm</div>
                      </div>
                    )}
                    {record.heartRate && (
                      <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                        <div className="text-xs text-red-600 font-medium mb-1">Heart Rate</div>
                        <div className="text-sm font-semibold text-red-900">{record.heartRate} bpm</div>
                      </div>
                    )}
                    {record.temperature && (
                      <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                        <div className="text-xs text-orange-600 font-medium mb-1">Temperature</div>
                        <div className="text-sm font-semibold text-orange-900">{record.temperature}°F</div>
                      </div>
                    )}
                    {record.weight && (
                      <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                        <div className="text-xs text-green-600 font-medium mb-1">Weight</div>
                        <div className="text-sm font-semibold text-green-900">{record.weight} kg</div>
                      </div>
                    )}
                    {record.bmi && (
                      <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
                        <div className="text-xs text-purple-600 font-medium mb-1">BMI</div>
                        <div className="text-sm font-semibold text-purple-900">{record.bmi.toFixed(1)}</div>
                      </div>
                    )}
                    {record.naadi && (
                      <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-lg">
                        <div className="text-xs text-indigo-600 font-medium mb-1">Naadi</div>
                        <div className="text-sm font-semibold text-indigo-900">{record.naadi}</div>
                      </div>
                    )}
                  </div>
                  
                  {record.notes && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="text-xs text-blue-600 mb-1">Notes</div>
                      <div className="text-sm text-blue-900">{record.notes}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Vitals Form */}
      {showNewForm && (
        <NewVitalsForm
          patient={patient}
          onClose={() => setShowNewForm(false)}
          onSuccess={() => {
            fetchVitalsHistory();
            setShowNewForm(false);
          }}
        />
      )}
    </div>
  );
}
