export const DIAGNOSIS_OPTIONS = [
  'Hypertension',
  'Hemorrhoids', 
  'Anemia',
  'Diabetes Mellitus'
] as const;

export type DiagnosisType = typeof DIAGNOSIS_OPTIONS[number];
