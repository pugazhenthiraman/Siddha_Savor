'use client';

import { useState, useEffect } from 'react';
import { getDietPlanByDiagnosis } from '@/lib/dietPlans';

interface DietPlanProps {
  diagnosis: string;
  patientId?: number;
}

export function PatientDietPlan({ diagnosis, patientId }: DietPlanProps) {
  const [selectedDay, setSelectedDay] = useState(1);
  const [dietPlan, setDietPlan] = useState<any>(null);

  useEffect(() => {
    const loadDietPlan = async () => {
      if (patientId) {
        // Try to load custom plan first
        try {
          const response = await fetch(`/api/doctor/patients/${patientId}/custom-diet-plan`);
          const data = await response.json();
          
          if (data.success && data.data) {
            setDietPlan({ ...data.data, diagnosis });
          } else {
            // Fall back to default plan
            const plan = getDietPlanByDiagnosis(diagnosis);
            setDietPlan(plan);
          }
        } catch (error) {
          // Fall back to default plan
          const plan = getDietPlanByDiagnosis(diagnosis);
          setDietPlan(plan);
        }
      } else {
        // Use default plan
        const plan = getDietPlanByDiagnosis(diagnosis);
        setDietPlan(plan);
      }
      
      // Set current day based on today
      const today = new Date().getDay();
      const currentDay = today === 0 ? 7 : today;
      setSelectedDay(currentDay);
    };

    loadDietPlan();
  }, [diagnosis, patientId]);

  if (!dietPlan) {
    return (
      <div className="text-center py-8">
        <span className="text-4xl mb-4 block">📋</span>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Diet Plan Available</h3>
        <p className="text-gray-600">Diet plan for {diagnosis} is not available yet.</p>
      </div>
    );
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const currentDayPlan = dietPlan.days[selectedDay - 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-green-50 rounded-lg p-6 border border-green-200">
        <h2 className="text-xl font-bold text-green-900 mb-2">{dietPlan.diagnosis} Diet Plan</h2>
        <p className="text-green-700">{dietPlan.description}</p>
        <div className="mt-3 bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
          Today: {days[selectedDay - 1]} - Day {selectedDay}
        </div>
      </div>

      {/* Day Selector */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Day</h3>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }, (_, i) => i + 1).map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                selectedDay === day
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="text-xs">{days[day - 1]}</div>
              <div>Day {day}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Today's Meals */}
      {currentDayPlan && (
        <div className="bg-white rounded-lg border-2 border-green-300 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm mr-3">TODAY</span>
              {days[currentDayPlan.day - 1]}
            </h3>
          </div>

          {/* Meals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <h4 className="font-semibold text-orange-900 mb-3 flex items-center">
                <span className="text-lg mr-2">🌅</span> Breakfast
              </h4>
              <ul className="space-y-2">
                {currentDayPlan.meals.breakfast.map((item: string, index: number) => (
                  <li key={index} className="text-orange-800 text-sm">{item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h4 className="font-semibold text-yellow-900 mb-3 flex items-center">
                <span className="text-lg mr-2">☀️</span> Lunch
              </h4>
              <ul className="space-y-2">
                {currentDayPlan.meals.lunch.map((item: string, index: number) => (
                  <li key={index} className="text-yellow-800 text-sm">{item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
                <span className="text-lg mr-2">🌙</span> Dinner
              </h4>
              <ul className="space-y-2">
                {currentDayPlan.meals.dinner.map((item: string, index: number) => (
                  <li key={index} className="text-purple-800 text-sm">{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Siddha Notes */}
          {currentDayPlan.meals.notes && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                <span className="text-lg mr-2">📝</span> Siddha Medicine Notes
              </h4>
              <p className="text-blue-800 text-sm">{currentDayPlan.meals.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* General Guidelines */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <span className="text-xl mr-2">📋</span> General Guidelines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dietPlan.generalInstructions.slice(0, 8).map((instruction: string, index: number) => (
            <div key={index} className="flex items-start space-x-2">
              <span className="text-green-600 mt-1">•</span>
              <span className="text-gray-700 text-sm">{instruction}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
