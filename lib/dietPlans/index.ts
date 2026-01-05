import { DiagnosisDietPlan } from '@/lib/types/dietPlan';
import { hypertensionDietPlan } from './hypertension';
import { hemorrhoidsDietPlan } from './hemorrhoids';
import { anemiaDietPlan } from './anemia';
import { diabetesDietPlan } from './diabetes';

export const dietPlans: Record<string, DiagnosisDietPlan> = {
  'Hypertension': hypertensionDietPlan,
  'Hemorrhoids': hemorrhoidsDietPlan,
  'Anemia': anemiaDietPlan,
  'Diabetes Mellitus': diabetesDietPlan
};

export function getDietPlanByDiagnosis(diagnosis: string): DiagnosisDietPlan | null {
  return dietPlans[diagnosis] || null;
}

export function getDayPlan(diagnosis: string, dayNumber: number) {
  const plan = getDietPlanByDiagnosis(diagnosis);
  if (!plan || dayNumber < 1 || dayNumber > plan.duration) {
    return null;
  }
  return plan.days[dayNumber - 1];
}
