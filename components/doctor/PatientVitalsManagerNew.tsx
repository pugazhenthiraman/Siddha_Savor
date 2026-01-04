'use client';

import { useState, useEffect } from 'react';
import { Patient } from '@/lib/types';
import { useToast } from '@/lib/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { NewVitalsForm } from './NewVitalsForm';
import { VitalsRecord, VitalsFilterType, VitalsViewMode } from '@/lib/types/vitals';

interface PatientVitalsManagerProps {
  patient: Patient;
  onClose: () => void;
}

export function PatientVitalsManager({ patient, onClose }: PatientVitalsManagerProps) {
  const { success, error } = useToast();
  const [vitalsHistory, setVitalsHistory] = useState<VitalsRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<VitalsFilterType>('all');
  const [viewMode, setViewMode] = useState<VitalsViewMode>('list');
  const [selectedRecord, setSelectedRecord] = useState<VitalsRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<Partial<VitalsRecord>>({});
  const [showNewForm, setShowNewForm] = useState(false);

  useEffect(() => {
    fetchVitalsHistory();
  }, [patient.id]);

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

  const filteredRecords = vitalsHistory.filter(record => {
    if (filter === 'all') return true;
    if (filter === 'updated') return record.createdAt !== record.updatedAt;
    if (filter === 'pending') return !record.notes || record.notes.trim() === '';
    return true;
  });

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
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
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

            {/* Siddha Assessment */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Siddha Assessment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Type</label>
                  <select
                    value={editingRecord.assessmentType || ''}
                    onChange={(e) => setEditingRecord(prev => ({ ...prev, assessmentType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    <option value="naadi">Naadi</option>
                    <option value="thegi">Thegi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Naadi</label>
                  <input
                    type="text"
                    value={editingRecord.naadi || ''}
                    onChange={(e) => setEditingRecord(prev => ({ ...prev, naadi: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">Patient Vitals History</h2>
              <p className="text-sm text-gray-500 truncate">
                {patient.formData?.personalInfo?.firstName} {patient.formData?.personalInfo?.lastName}
              </p>
            </div>
            <div className="flex space-x-2 flex-shrink-0">
              <Button onClick={() => setShowNewForm(true)} className="text-sm">
                <span className="hidden sm:inline">+ New Vitals</span>
                <span className="sm:hidden">+ New</span>
              </Button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold px-2"
              >
                ×
              </button>
            </div>
          </div>
          
          {/* Filter Dropdown */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search vitals records..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="sm:w-48">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as VitalsFilterType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Records ({vitalsHistory.length})</option>
                <option value="updated">Updated ({vitalsHistory.filter(r => r.createdAt !== r.updatedAt).length})</option>
                <option value="pending">Pending ({vitalsHistory.filter(r => !r.notes || r.notes.trim() === '').length})</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No vitals records found for the selected filter.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((record) => (
                <div key={record.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {new Date(record.recordedAt).toLocaleDateString()} 
                          <span className="hidden sm:inline"> at {new Date(record.recordedAt).toLocaleTimeString()}</span>
                        </h3>
                        <p className="text-sm text-gray-500 truncate">Recorded by {record.recordedBy}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {getStatusBadge(record)}
                      <Button size="sm" onClick={() => handleEdit(record)}>
                        Edit
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-4">
                    {record.pulseRate && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Pulse Rate</div>
                        <div className="text-sm font-medium text-gray-900">{record.pulseRate} bpm</div>
                      </div>
                    )}
                    {record.heartRate && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Heart Rate</div>
                        <div className="text-sm font-medium text-gray-900">{record.heartRate} bpm</div>
                      </div>
                    )}
                    {record.temperature && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Temperature</div>
                        <div className="text-sm font-medium text-gray-900">{record.temperature}°F</div>
                      </div>
                    )}
                    {record.weight && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Weight</div>
                        <div className="text-sm font-medium text-gray-900">{record.weight} kg</div>
                      </div>
                    )}
                    {record.bmi && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">BMI</div>
                        <div className="text-sm font-medium text-gray-900">{record.bmi.toFixed(1)}</div>
                      </div>
                    )}
                    {record.naadi && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-xs text-green-600 mb-1">Naadi</div>
                        <div className="text-sm font-medium text-green-900">{record.naadi}</div>
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
