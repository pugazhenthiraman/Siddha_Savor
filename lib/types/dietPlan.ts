// Diet plan structure for each diagnosis
export interface MealPlan {
  breakfast: string[];
  lunch: string[];
  dinner: string[];
  snacks?: string[];
  notes?: string;
}

export interface DayPlan {
  day: number;
  meals: MealPlan;
  instructions?: string;
}

export interface DiagnosisDietPlan {
  diagnosis: string;
  description: string;
  duration: number; // days
  days: DayPlan[];
  generalInstructions: string[];
}
