'use client';

import { useState, useEffect } from 'react';
import { getDietPlanByDiagnosis } from '@/lib/dietPlans';

interface CustomDietPlan {
  patientId: number;
  diagnosis: string;
  days: Array<{
    day: number;
    meals: {
      breakfast: string[];
      lunch: string[];
      dinner: string[];
      notes?: string;
    };
  }>;
}

interface DietPlanEditorProps {
  patientId: number;
  diagnosis: string;
  onClose: () => void;
  onSave: () => void;
}

export function DietPlanEditor({ patientId, diagnosis, onClose, onSave }: DietPlanEditorProps) {
  const [originalPlan, setOriginalPlan] = useState<CustomDietPlan | null>(null);
  const [customPlan, setCustomPlan] = useState<CustomDietPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [completedMeals, setCompletedMeals] = useState<Record<string, any>>({});

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    loadDietPlan();
    loadCompletedMeals();
  }, [patientId, diagnosis]);

  const loadCompletedMeals = async () => {
    try {
      // Get last 7 days of completed meals
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const response = await fetch(`/api/doctor/patients/${patientId}/meals`);
      const data = await response.json();
      
      if (data.success) {
        const completed: Record<string, any> = {};
        data.data.forEach((meal: any) => {
          const dateKey = meal.date.split('T')[0];
          if (!completed[dateKey]) completed[dateKey] = {};
          completed[dateKey][meal.mealType] = meal.status === 'completed';
        });
        setCompletedMeals(completed);
      }
    } catch (error) {
      console.error('Error loading completed meals:', error);
    }
  };

  const isMealCompleted = (dayIndex: number, mealType: string) => {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - (today.getDay() === 0 ? 7 : today.getDay()) + dayIndex + 1);
    const dateKey = targetDate.toISOString().split('T')[0];
    
    return completedMeals[dateKey]?.[mealType] === true;
  };

  useEffect(() => {
    loadDietPlan();
  }, [patientId, diagnosis]);

  const loadDietPlan = async () => {
    setIsLoading(true);
    try {
      // Try to load custom plan first
      const response = await fetch(`/api/doctor/patients/${patientId}/custom-diet-plan`);
      const data = await response.json();
      
      let planToUse;
      if (data.success && data.data) {
        planToUse = data.data;
      } else {
        // Load default plan
        const defaultPlan = getDietPlanByDiagnosis(diagnosis);
        if (defaultPlan) {
          planToUse = {
            patientId,
            diagnosis,
            days: defaultPlan.days
          };
        }
      }
      
      if (planToUse) {
        // Create deep copies to avoid reference issues
        setOriginalPlan(JSON.parse(JSON.stringify(planToUse)));
        setCustomPlan(JSON.parse(JSON.stringify(planToUse)));
      }
    } catch (error) {
      console.error('Error loading diet plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original plan
    if (originalPlan) {
      setCustomPlan(JSON.parse(JSON.stringify(originalPlan)));
    }
    onClose();
  };

  const updateMealItem = (dayIndex: number, mealType: 'breakfast' | 'lunch' | 'dinner', itemIndex: number, value: string) => {
    if (!customPlan) return;
    
    const updatedPlan = { ...customPlan };
    updatedPlan.days[dayIndex].meals[mealType][itemIndex] = value;
    setCustomPlan(updatedPlan);
  };

  const addMealItem = (dayIndex: number, mealType: 'breakfast' | 'lunch' | 'dinner') => {
    if (!customPlan) return;
    
    const updatedPlan = { ...customPlan };
    updatedPlan.days[dayIndex].meals[mealType].push('');
    setCustomPlan(updatedPlan);
  };

  const removeMealItem = (dayIndex: number, mealType: 'breakfast' | 'lunch' | 'dinner', itemIndex: number) => {
    if (!customPlan) return;
    
    const updatedPlan = { ...customPlan };
    updatedPlan.days[dayIndex].meals[mealType].splice(itemIndex, 1);
    setCustomPlan(updatedPlan);
  };

  const updateNotes = (dayIndex: number, notes: string) => {
    if (!customPlan) return;
    
    const updatedPlan = { ...customPlan };
    updatedPlan.days[dayIndex].meals.notes = notes;
    setCustomPlan(updatedPlan);
  };

  const saveDietPlan = async () => {
    if (!customPlan) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/doctor/patients/${patientId}/custom-diet-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customPlan)
      });

      if (response.ok) {
        onSave();
        onClose();
      }
    } catch (error) {
      console.error('Error saving diet plan:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto" />
          <p className="text-center mt-2">Loading diet plan...</p>
        </div>
      </div>
    );
  }

  if (!customPlan) return null;

  const currentDay = customPlan.days[selectedDay - 1];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Edit Diet Plan - {diagnosis}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Day Selector */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Select Day to Edit</h3>
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDay(index + 1)}
                  className={`p-2 rounded text-sm font-medium transition-colors ${
                    selectedDay === index + 1
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Meal Editor */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">
              Editing: {days[selectedDay - 1]} (Day {selectedDay})
            </h3>

            {/* Breakfast */}
            <div className={`bg-orange-50 border rounded-lg p-4 ${
              isMealCompleted(selectedDay - 1, 'breakfast') ? 'border-green-300 bg-green-50' : 'border-orange-200'
            }`}>
              <h4 className="font-semibold text-orange-900 mb-3 flex items-center justify-between">
                🌅 Breakfast
                {isMealCompleted(selectedDay - 1, 'breakfast') && (
                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">Completed</span>
                )}
              </h4>
              {isMealCompleted(selectedDay - 1, 'breakfast') ? (
                <div className="space-y-2">
                  {currentDay.meals.breakfast.map((item, index) => (
                    <div key={index} className="p-2 bg-green-100 border border-green-300 rounded text-sm text-green-800">
                      {item} (Patient completed - cannot edit)
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {currentDay.meals.breakfast.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateMealItem(selectedDay - 1, 'breakfast', index, e.target.value)}
                        className="flex-1 p-2 border border-orange-300 rounded text-sm"
                        placeholder="Enter meal item..."
                      />
                      <button
                        onClick={() => removeMealItem(selectedDay - 1, 'breakfast', index)}
                        className="text-red-600 hover:text-red-800 px-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addMealItem(selectedDay - 1, 'breakfast')}
                    className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                  >
                    + Add Item
                  </button>
                </div>
              )}
            </div>

            {/* Lunch */}
            <div className={`bg-yellow-50 border rounded-lg p-4 ${
              isMealCompleted(selectedDay - 1, 'lunch') ? 'border-green-300 bg-green-50' : 'border-yellow-200'
            }`}>
              <h4 className="font-semibold text-yellow-900 mb-3 flex items-center justify-between">
                ☀️ Lunch
                {isMealCompleted(selectedDay - 1, 'lunch') && (
                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">Completed</span>
                )}
              </h4>
              {isMealCompleted(selectedDay - 1, 'lunch') ? (
                <div className="space-y-2">
                  {currentDay.meals.lunch.map((item, index) => (
                    <div key={index} className="p-2 bg-green-100 border border-green-300 rounded text-sm text-green-800">
                      {item} (Patient completed - cannot edit)
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {currentDay.meals.lunch.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateMealItem(selectedDay - 1, 'lunch', index, e.target.value)}
                        className="flex-1 p-2 border border-yellow-300 rounded text-sm"
                        placeholder="Enter meal item..."
                      />
                      <button
                        onClick={() => removeMealItem(selectedDay - 1, 'lunch', index)}
                        className="text-red-600 hover:text-red-800 px-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addMealItem(selectedDay - 1, 'lunch')}
                    className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                  >
                    + Add Item
                  </button>
                </div>
              )}
            </div>

            {/* Dinner */}
            <div className={`bg-purple-50 border rounded-lg p-4 ${
              isMealCompleted(selectedDay - 1, 'dinner') ? 'border-green-300 bg-green-50' : 'border-purple-200'
            }`}>
              <h4 className="font-semibold text-purple-900 mb-3 flex items-center justify-between">
                🌙 Dinner
                {isMealCompleted(selectedDay - 1, 'dinner') && (
                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">Completed</span>
                )}
              </h4>
              {isMealCompleted(selectedDay - 1, 'dinner') ? (
                <div className="space-y-2">
                  {currentDay.meals.dinner.map((item, index) => (
                    <div key={index} className="p-2 bg-green-100 border border-green-300 rounded text-sm text-green-800">
                      {item} (Patient completed - cannot edit)
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {currentDay.meals.dinner.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateMealItem(selectedDay - 1, 'dinner', index, e.target.value)}
                        className="flex-1 p-2 border border-purple-300 rounded text-sm"
                        placeholder="Enter meal item..."
                      />
                      <button
                        onClick={() => removeMealItem(selectedDay - 1, 'dinner', index)}
                        className="text-red-600 hover:text-red-800 px-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addMealItem(selectedDay - 1, 'dinner')}
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                  >
                    + Add Item
                  </button>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-3">📝 Siddha Medicine Notes</h4>
              <textarea
                value={currentDay.meals.notes || ''}
                onChange={(e) => updateNotes(selectedDay - 1, e.target.value)}
                className="w-full p-2 border border-blue-300 rounded text-sm"
                rows={3}
                placeholder="Enter special instructions or Siddha medicine notes..."
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={saveDietPlan}
            disabled={isSaving}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save & Notify Patient'}
          </button>
        </div>
      </div>
    </div>
  );
}
