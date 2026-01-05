'use client';

import { useState, useEffect } from 'react';

interface HealthData {
  date: string;
  dayName: string;
  compliance: number;
  completedMeals: number;
  totalMeals: number;
  healthScore: number;
}

interface PatientHealthChartProps {
  patientId: number;
}

export function PatientHealthChart({ patientId }: PatientHealthChartProps) {
  const [healthData, setHealthData] = useState<HealthData[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (patientId) {
        await fetchHealthData();
      }
    };
    fetchData();
  }, [patientId]);

  const fetchHealthData = async () => {
    try {
      const response = await fetch(`/api/patient/health-progress?patientId=${patientId}`);
      const data = await response.json();
      
      if (data.success) {
        setHealthData(data.data.weeklyData);
        setSummary(data.data.summary);
      }
    } catch (error) {
      console.error('Error fetching health data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">Loading health progress...</p>
        </div>
      </div>
    );
  }

  if (!healthData.length) {
    return (
      <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
        <div className="text-center">
          <div className="text-4xl mb-2">📈</div>
          <p className="text-gray-600 font-medium">Start tracking meals to see your health progress</p>
          <p className="text-sm text-gray-500 mt-1">Your diet compliance affects your health score</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Health Score</div>
            <div className="text-2xl font-bold text-green-900">{summary.averageHealthScore}/100</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Diet Compliance</div>
            <div className="text-2xl font-bold text-blue-900">{summary.overallCompliance}%</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
            <div className="text-sm text-purple-600 font-medium">Streak</div>
            <div className="text-2xl font-bold text-purple-900">{summary.currentStreak} days</div>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg border">
        <h4 className="text-lg font-medium text-gray-900 mb-4">7-Day Health Progress</h4>
        <div className="flex items-end justify-between h-32 space-x-2">
          {healthData.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gray-200 rounded-t relative" style={{ height: '100px' }}>
                <div 
                  className={`w-full rounded-t transition-all duration-500 ${
                    day.healthScore >= 80 ? 'bg-green-500' :
                    day.healthScore >= 60 ? 'bg-yellow-500' :
                    day.healthScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ 
                    height: `${day.healthScore}%`,
                    position: 'absolute',
                    bottom: 0
                  }}
                />
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700">
                  {day.healthScore}
                </div>
              </div>
              <div className="mt-2 text-xs text-center">
                <div className="font-medium text-gray-900">{day.dayName}</div>
                <div className="text-gray-500">{day.compliance}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h5 className="font-medium text-blue-900 mb-2">💡 Health Tips</h5>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• Maintain 80%+ diet compliance for optimal health</p>
          <p>• Consistent meal timing improves digestion</p>
          <p>• Follow Siddha medicine principles for better results</p>
        </div>
      </div>
    </div>
  );
}
