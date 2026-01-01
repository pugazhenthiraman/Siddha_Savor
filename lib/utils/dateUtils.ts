/**
 * Date utility functions
 */

/**
 * Calculate age from date of birth
 * @param dateOfBirth - Date of birth in YYYY-MM-DD format
 * @returns Age in years
 */
export function calculateAge(dateOfBirth: string): number {
  if (!dateOfBirth) return 0;
  
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Format age display text
 * @param age - Age in years
 * @returns Formatted age string
 */
export function formatAge(age: number): string {
  if (age === 0) return '';
  if (age === 1) return '1 year old';
  return `${age} years old`;
}
