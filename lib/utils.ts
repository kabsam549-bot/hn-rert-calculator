/**
 * Utility functions for the H&N Re-Irradiation Calculator
 */

/**
 * Format a number to a specific decimal place
 */
export function formatNumber(num: number, decimals: number = 1): string {
  return num.toFixed(decimals);
}

/**
 * Convert months to years and months display
 */
export function formatTimePeriod(months: number): string {
  if (months < 12) {
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  }
  
  return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
}

/**
 * Get ECOG performance status description
 */
export function getECOGDescription(score: number): string {
  const descriptions: { [key: number]: string } = {
    0: 'Fully active, able to carry on all pre-disease performance without restriction',
    1: 'Restricted in physically strenuous activity but ambulatory and able to carry out work of a light or sedentary nature',
    2: 'Ambulatory and capable of all selfcare but unable to carry out any work activities; up and about more than 50% of waking hours',
    3: 'Capable of only limited selfcare; confined to bed or chair more than 50% of waking hours',
    4: 'Completely disabled; cannot carry on any selfcare; totally confined to bed or chair',
  };
  
  return descriptions[score] || 'Unknown';
}

/**
 * Format tumor location for display
 */
export function formatTumorLocation(location: string): string {
  const locationMap: { [key: string]: string } = {
    nasopharynx: 'Nasopharynx',
    oropharynx: 'Oropharynx',
    larynx: 'Larynx',
    hypopharynx: 'Hypopharynx',
    oral_cavity: 'Oral Cavity',
    salivary: 'Salivary Glands',
    other: 'Other',
  };
  
  return locationMap[location] || location;
}

/**
 * Generate a summary string of patient data
 */
export function generatePatientSummary(data: {
  age?: number;
  priorDose?: number;
  timeSinceRT?: number;
  tumorLocation: string;
  performance?: number;
}): string {
  const parts: string[] = [];
  
  if (data.age) parts.push(`${data.age}-year-old patient`);
  if (data.tumorLocation) parts.push(`${formatTumorLocation(data.tumorLocation)} tumor`);
  if (data.priorDose) parts.push(`prior dose ${data.priorDose} Gy`);
  if (data.timeSinceRT) parts.push(`${formatTimePeriod(data.timeSinceRT)} since RT`);
  if (data.performance !== undefined) parts.push(`ECOG ${data.performance}`);
  
  return parts.join(', ');
}

/**
 * Check if browser supports local storage
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clamp a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
