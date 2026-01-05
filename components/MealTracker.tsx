'use client';

import { useState, useEffect } from 'react';
import { getDietPlanByDiagnosis } from '@/lib/dietPlans';

interface MealTrackerProps {
  patientId: number;
  diagnosis: string;
  onMealUpdate?: () => void;
}

interface MealStatus {
  breakfast: 'completed' | 'pending' | null;
  lunch: 'completed' | 'pending' | null;
  dinner: 'completed' | 'pending' | null;
}

export function MealTracker({ patientId, diagnosis, onMealUpdate }: MealTrackerProps) {
  const [selectedDay, setSelectedDay] = useState(1);
  const [dietPlan, setDietPlan] = useState<any>(null);
  const [mealStatus, setMealStatus] = useState<MealStatus>({
    breakfast: null,
    lunch: null,
    dinner: null
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initializeMealTracker = async () => {
      const plan = getDietPlanByDiagnosis(diagnosis);
      setDietPlan(plan);
      
      // Set current day
      const today = new Date().getDay();
      const currentDay = today === 0 ? 7 : today;
      setSelectedDay(currentDay);
      
      // Fetch today's meal status
      await fetchMealStatus();
    };
    initializeMealTracker();
  }, [diagnosis, patientId]);

  const fetchMealStatus = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/patient/meals?patientId=${patientId}&date=${today}`);
      const data = await response.json();
      
      if (data.success) {
        const statusMap: MealStatus = {
          breakfast: null,
          lunch: null,
          dinner: null
        };
        
        data.data.forEach((meal: any) => {
          statusMap[meal.mealType as keyof MealStatus] = meal.status;
        });
        
        setMealStatus(statusMap);
      }
    } catch (error) {
      console.error('Failed to fetch meal status:', error);
    }
  };

  const updateMealStatus = async (mealType: string, status: 'completed' | 'pending') => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch('/api/patient/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          mealType,
          date: today,
          status
        })
      });

      if (response.ok) {
        setMealStatus(prev => ({
          ...prev,
          [mealType]: status
        }));
        // Notify parent component to refresh data
        if (onMealUpdate) {
          onMealUpdate();
        }
      }
    } catch (error) {
      console.error('Failed to update meal status:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const getMealStatusButton = (mealType: keyof MealStatus, mealName: string) => {
    const status = mealStatus[mealType];
    
    return (
      <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
        <div className="text-sm font-medium text-gray-700 mb-3 text-center">
          Did you eat this {mealName.toLowerCase()}?
        </div>
        <div className="flex space-x-3 justify-center">
          <button
            onClick={() => updateMealStatus(mealType, 'completed')}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-w-[80px] ${
              status === 'completed'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-700 border-2 border-green-200 hover:bg-green-50 hover:border-green-400'
            }`}
          >
            ✓ Eaten
          </button>
          <button
            onClick={() => updateMealStatus(mealType, 'pending')}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-w-[80px] ${
              status === 'pending'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white text-gray-700 border-2 border-red-200 hover:bg-red-50 hover:border-red-400'
            }`}
          >
            ✗ Not Eaten
          </button>
        </div>
        {status && (
          <div className={`text-center mt-2 text-xs font-medium ${
            status === 'completed' ? 'text-green-600' : 'text-red-600'
          }`}>
            Status: {status === 'completed' ? 'Completed ✓' : 'Not Eaten ✗'}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-green-50 rounded-lg p-4 sm:p-6 border border-green-200">
        <h2 className="text-lg sm:text-xl font-bold text-green-900 mb-2">{dietPlan.diagnosis} Diet Plan</h2>
        <p className="text-green-700 text-sm sm:text-base">{dietPlan.description}</p>
        <div className="mt-3 flex items-center space-x-3">
          <div className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
            Today: {days[selectedDay - 1]} - Day {selectedDay}
          </div>
          <div className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Today's Meals */}
      {currentDayPlan && (
        <div className="bg-white rounded-lg border-2 border-green-300 p-4 sm:p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
              <span className="bg-green-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm mr-2 sm:mr-3">TODAY</span>
              {days[currentDayPlan.day - 1]}
            </h3>
          </div>

          {/* Meals Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* Breakfast */}
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <h4 className="font-semibold text-orange-900 mb-3 flex items-center text-sm sm:text-base">
                <span className="text-base sm:text-lg mr-2">🌅</span> Breakfast
              </h4>
              <ul className="space-y-2 mb-3">
                {currentDayPlan.meals.breakfast.map((item: string, index: number) => (
                  <li key={index} className="text-orange-800 text-xs sm:text-sm">{item}</li>
                ))}
              </ul>
              {getMealStatusButton('breakfast', 'Breakfast')}
            </div>

            {/* Lunch */}
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h4 className="font-semibold text-yellow-900 mb-3 flex items-center text-sm sm:text-base">
                <span className="text-base sm:text-lg mr-2">☀️</span> Lunch
              </h4>
              <ul className="space-y-2 mb-3">
                {currentDayPlan.meals.lunch.map((item: string, index: number) => (
                  <li key={index} className="text-yellow-800 text-xs sm:text-sm">{item}</li>
                ))}
              </ul>
              {getMealStatusButton('lunch', 'Lunch')}
            </div>

            {/* Dinner */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-3 flex items-center text-sm sm:text-base">
                <span className="text-base sm:text-lg mr-2">🌙</span> Dinner
              </h4>
              <ul className="space-y-2 mb-3">
                {currentDayPlan.meals.dinner.map((item: string, index: number) => (
                  <li key={index} className="text-purple-800 text-xs sm:text-sm">{item}</li>
                ))}
              </ul>
              {getMealStatusButton('dinner', 'Dinner')}
            </div>
          </div>

          {/* Siddha Notes */}
          {currentDayPlan.meals.notes && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center text-sm sm:text-base">
                <span className="text-base sm:text-lg mr-2">📝</span> Siddha Medicine Notes
              </h4>
              <p className="text-blue-800 text-xs sm:text-sm">{currentDayPlan.meals.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Meal Reminders Info */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center text-sm sm:text-base">
          <span className="text-base sm:text-lg mr-2">⏰</span> Daily Meal Reminders
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
          <div className="text-blue-800">
            <span className="font-medium">Breakfast:</span> 8:00 AM
          </div>
          <div className="text-blue-800">
            <span className="font-medium">Lunch:</span> 12:30 PM
          </div>
          <div className="text-blue-800">
            <span className="font-medium">Dinner:</span> 8:00 PM
          </div>
        </div>
        <p className="text-blue-700 text-xs mt-2">You will receive email reminders at these times with your meal plan.</p>
      </div>
    </div>
  );
}
