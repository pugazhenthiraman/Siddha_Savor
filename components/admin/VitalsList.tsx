'use client';

interface VitalsListProps {
  vitals: any[];
}

export function VitalsList({ vitals }: VitalsListProps) {
  if (vitals.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📊</span>
        </div>
        <p className="text-gray-600">No vitals recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-black">Medical Records ({vitals.length})</h4>
      <div className="space-y-3">
        {vitals.map((vital) => (
          <div key={vital.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-black">Recorded Date</p>
                <p className="text-xs text-gray-500">{new Date(vital.recordedAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-black">Recorded By</p>
                <p className="text-xs text-gray-500">{vital.recordedBy}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-black">Assessment Type</p>
                <p className="text-xs text-gray-500">{vital.assessmentType || 'General'}</p>
              </div>
              
              {vital.pulseRate && (
                <div>
                  <p className="text-sm font-medium text-black">Pulse Rate</p>
                  <p className="text-xs text-gray-500">{vital.pulseRate} bpm</p>
                </div>
              )}
              
              {vital.bloodPressureSystolic && vital.bloodPressureDiastolic && (
                <div>
                  <p className="text-sm font-medium text-black">Blood Pressure</p>
                  <p className="text-xs text-gray-500">{vital.bloodPressureSystolic}/{vital.bloodPressureDiastolic} mmHg</p>
                </div>
              )}
              
              {vital.temperature && (
                <div>
                  <p className="text-sm font-medium text-black">Temperature</p>
                  <p className="text-xs text-gray-500">{vital.temperature}°F</p>
                </div>
              )}
              
              {vital.weight && (
                <div>
                  <p className="text-sm font-medium text-black">Weight</p>
                  <p className="text-xs text-gray-500">{vital.weight} kg</p>
                </div>
              )}
              
              {vital.height && (
                <div>
                  <p className="text-sm font-medium text-black">Height</p>
                  <p className="text-xs text-gray-500">{vital.height} cm</p>
                </div>
              )}
              
              {vital.bmi && (
                <div>
                  <p className="text-sm font-medium text-black">BMI</p>
                  <p className="text-xs text-gray-500">{vital.bmi}</p>
                </div>
              )}
            </div>
            
            {vital.notes && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-black">Notes</p>
                <p className="text-xs text-gray-600 mt-1">{vital.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
