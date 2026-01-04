'use client';

import { useState } from 'react';
import { Patient } from '@/lib/types';
import { VitalsForm } from './VitalsForm';
import { DiagnosisForm } from './DiagnosisForm';
import { VitalsHistory } from './VitalsHistory';

interface PatientVitalsPageProps {
  patient: Patient;
  onBack: () => void;
}

export function PatientVitalsPage({ patient, onBack }: PatientVitalsPageProps) {
  const [activeTab, setActiveTab] = useState<'vitals' | 'diagnosis' | 'history'>('vitals');

  const formData = patient.formData as any;
  const personalInfo = formData?.personalInfo || {};
  const fullName = `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim();

  const tabs = [
    { id: 'vitals', label: 'Vitals', icon: '📊' },
    { id: 'diagnosis', label: 'Diagnosis', icon: '🩺' },
    { id: 'history', label: 'History', icon: '📋' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-First Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBack}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{fullName}</h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Patient Vitals & Diagnosis</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs sm:text-sm">
              <span className="text-gray-500 hidden sm:inline">ID:</span>
              <span className="font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded text-xs">
                {patient.patientUID}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-14 sm:top-16 z-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-0 overflow-x-auto">
            <style jsx>{`
              nav::-webkit-scrollbar {
                display: none;
              }
              nav {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}</style>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center justify-center space-x-2 py-3 px-4 sm:px-6 border-b-2 font-medium text-sm whitespace-nowrap min-w-0 flex-1 sm:flex-none ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-base sm:text-sm">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden text-xs">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content with Mobile Padding */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-20 sm:pb-6">
        {activeTab === 'vitals' && <VitalsForm patient={patient} />}
        {activeTab === 'diagnosis' && <DiagnosisForm patient={patient} />}
        {activeTab === 'history' && <VitalsHistory patient={patient} />}
      </div>
    </div>
  );
}
