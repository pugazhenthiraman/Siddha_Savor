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

  // Prepare data for a compact, modern line chart
  const maxHealthScore = 100;
  // Virtual SVG size – actual pixels will scale with container
  const chartWidth = 100;
  const chartHeight = 60;
  const pointCount = healthData.length;
  const xStep = pointCount > 1 ? chartWidth / (pointCount - 1) : 0;

  const points = healthData.map((day, index) => {
    const x = xStep * index;
    // Invert Y so higher scores are visually higher on the chart, keep small top padding
    const normalized = Math.min(Math.max(day.healthScore, 0), maxHealthScore);
    const usableHeight = chartHeight - 10; // 10 units top padding
    const y = 5 + (1 - normalized / maxHealthScore) * usableHeight;
    return { x, y, ...day };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

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

      <div className="bg-white p-3 sm:p-4 rounded-lg border">
        <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-2 sm:mb-3">7-Day Health Progress</h4>
        <div className="h-32 sm:h-36 flex flex-col">
          <div className="flex-1 relative">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="none"
              className="w-full h-full"
            >
              {/* Background gradient */}
              <defs>
                <linearGradient id="health-line-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ecfdf5" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Subtle horizontal grid */}
              {[25, 50, 75].map((val) => (
                <line
                  key={val}
                  x1={0}
                  y1={chartHeight - (val / maxHealthScore) * chartHeight}
                  x2={chartWidth}
                  y2={chartHeight - (val / maxHealthScore) * chartHeight}
                  stroke="#E5E7EB"
                  strokeWidth={0.5}
                />
              ))}

              {/* Area under the line */}
              {points.length > 1 && (
                <polygon
                  fill="url(#health-line-gradient)"
                  points={`0,${chartHeight} ${polylinePoints} ${chartWidth},${chartHeight}`}
                />
              )}

              {/* Line path */}
              <polyline
                fill="none"
                stroke="#10B981"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylinePoints}
              />

              {/* Points */}
              {points.map((p) => (
                <circle
                  key={p.date}
                  cx={p.x}
                  cy={p.y}
                  r={1.8}
                  fill="#10B981"
                  stroke="#064E3B"
                  strokeWidth={0.4}
                />
              ))}
            </svg>

          </div>

          {/* X-axis labels under chart */}
          <div className="mt-1 sm:mt-2 flex justify-between text-[10px] sm:text-xs">
            {healthData.map((day) => (
              <div key={day.date} className="flex-1 text-center">
                <div className="font-medium text-gray-900">{day.dayName}</div>
                <div className="text-gray-500">{day.compliance}%</div>
              </div>
            ))}
          </div>
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
