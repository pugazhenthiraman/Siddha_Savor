'use client';

import { useState, useEffect } from 'react';

interface ComplianceData {
  date: string;
  dayName: string;
  compliance: number;
  completedMeals: number;
  totalMeals: number;
}

interface Summary {
  overallCompliance: number;
  totalCompletedMeals: number;
  totalPossibleMeals: number;
  averageDailyCompliance: number;
}

interface DietComplianceChartProps {
  patientId: string;
}

export function DietComplianceChart({ patientId }: DietComplianceChartProps) {
  const [complianceData, setComplianceData] = useState<ComplianceData[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (patientId) {
        await fetchComplianceData();
      }
    };
    fetchData();
  }, [patientId]);

  const fetchComplianceData = async () => {
    try {
      const response = await fetch(`/api/doctor/patients/${patientId}/diet-compliance`);
      const data = await response.json();
      
      if (data.success) {
        setComplianceData(data.data.weeklyData);
        setSummary(data.data.summary);
      }
    } catch (error) {
      console.error('Error fetching compliance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading compliance data...</p>
        </div>
      </div>
    );
  }

  if (!complianceData.length) {
    return (
      <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-600 font-medium">No compliance data available</p>
          <p className="text-sm text-gray-500 mt-1">Patient needs to start tracking meals</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Overall Compliance</div>
            <div className="text-2xl font-bold text-green-900">{summary.overallCompliance}%</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Meals Completed</div>
            <div className="text-2xl font-bold text-blue-900">{summary.totalCompletedMeals}/{summary.totalPossibleMeals}</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
            <div className="text-sm text-purple-600 font-medium">Daily Average</div>
            <div className="text-2xl font-bold text-purple-900">{summary.averageDailyCompliance}%</div>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-end justify-between h-32 space-x-2">
          {complianceData.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gray-200 rounded-t relative" style={{ height: '100px' }}>
                <div 
                  className={`w-full rounded-t transition-all duration-500 ${
                    day.compliance >= 80 ? 'bg-green-500' :
                    day.compliance >= 60 ? 'bg-yellow-500' :
                    day.compliance >= 40 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ 
                    height: `${day.compliance}%`,
                    position: 'absolute',
                    bottom: 0
                  }}
                />
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700">
                  {day.compliance}%
                </div>
              </div>
              <div className="mt-2 text-xs text-center">
                <div className="font-medium text-gray-900">{day.dayName}</div>
                <div className="text-gray-500">{day.completedMeals}/{day.totalMeals}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span>Excellent (80%+)</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-yellow-500 rounded" />
          <span>Good (60-79%)</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-orange-500 rounded" />
          <span>Fair (40-59%)</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-500 rounded" />
          <span>Poor (&lt;40%)</span>
        </div>
      </div>
    </div>
  );
}
