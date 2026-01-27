/**
 * BED/EQD2 Calculations for Re-Irradiation
 * 
 * Based on the Linear-Quadratic (LQ) model for radiation biology.
 * References:
 * - Phan et al. (2010) MIRI study on H&N re-irradiation
 * - Fowler JF. The linear-quadratic formula and progress in fractionated radiotherapy.
 */

/**
 * Calculate Biologically Effective Dose (BED)
 * 
 * Formula: BED = n * d * (1 + d/(α/β))
 * where:
 *   n = number of fractions
 *   d = dose per fraction (Gy)
 *   α/β = tissue-specific radiosensitivity ratio (Gy)
 * 
 * @param totalDose - Total prescribed dose in Gy
 * @param fractions - Number of fractions
 * @param alphaBeta - Alpha/beta ratio in Gy (typically 2-10)
 * @returns BED in Gy
 * @throws Error if inputs are invalid
 */
export function calculateBED(
  totalDose: number,
  fractions: number,
  alphaBeta: number
): number {
  // Input validation
  if (totalDose <= 0) {
    throw new Error('Total dose must be positive');
  }
  if (fractions < 1 || !Number.isInteger(fractions)) {
    throw new Error('Number of fractions must be a positive integer');
  }
  if (alphaBeta <= 0) {
    throw new Error('Alpha/beta ratio must be positive');
  }

  const dosePerFraction = totalDose / fractions;
  
  // BED = n * d * (1 + d/(α/β))
  const bed = fractions * dosePerFraction * (1 + dosePerFraction / alphaBeta);
  
  return bed;
}

/**
 * Calculate Equivalent Dose in 2 Gy fractions (EQD2)
 * 
 * Formula: EQD2 = BED / (1 + 2/(α/β))
 * 
 * EQD2 normalizes different fractionation schedules to a standard 2 Gy/fraction regimen,
 * allowing comparison of different treatment approaches.
 * 
 * @param bed - Biologically Effective Dose in Gy
 * @param alphaBeta - Alpha/beta ratio in Gy
 * @returns EQD2 in Gy
 * @throws Error if inputs are invalid
 */
export function calculateEQD2(bed: number, alphaBeta: number): number {
  // Input validation
  if (bed <= 0) {
    throw new Error('BED must be positive');
  }
  if (alphaBeta <= 0) {
    throw new Error('Alpha/beta ratio must be positive');
  }

  // EQD2 = BED / (1 + 2/(α/β))
  const eqd2 = bed / (1 + 2 / alphaBeta);
  
  return eqd2;
}

/**
 * Calculate BED and EQD2 from dose and fractionation
 * 
 * Convenience function that combines calculateBED and calculateEQD2
 * 
 * @param totalDose - Total prescribed dose in Gy
 * @param fractions - Number of fractions
 * @param alphaBeta - Alpha/beta ratio in Gy
 * @returns Object with BED and EQD2 values
 */
export function calculateBEDAndEQD2(
  totalDose: number,
  fractions: number,
  alphaBeta: number
): { bed: number; eqd2: number } {
  const bed = calculateBED(totalDose, fractions, alphaBeta);
  const eqd2 = calculateEQD2(bed, alphaBeta);
  
  return { bed, eqd2 };
}

/**
 * Calculate cumulative BED and EQD2 from prior and planned radiation
 * 
 * This is critical for re-irradiation planning to assess total biological dose
 * to organs at risk and tumor. Assumes no repair between courses (worst case).
 * 
 * Note: This is a simplified model that assumes:
 * - Complete tissue repair has not occurred (conservative approach)
 * - The same α/β ratio applies to both treatments
 * - No dose heterogeneity (uses mean/max doses)
 * 
 * Clinical judgment should consider:
 * - Time interval between treatments (>6 months allows some repair)
 * - Volume of overlap between prior and planned fields
 * - Tissue type and repair capacity
 * 
 * @param priorCourses - Array of prior courses (dose in Gy, fractions)
 * @param plannedDose - Total dose for planned re-irradiation in Gy
 * @param plannedFractions - Number of fractions for planned treatment
 * @param alphaBeta - Alpha/beta ratio in Gy (should match tissue type)
 * @returns Cumulative BED and EQD2 values, including breakdown
 * @throws Error if inputs are invalid
 */
export function calculateCumulativeDose(
  priorCourses: { dose: number; fractions: number }[],
  plannedDose: number,
  plannedFractions: number,
  alphaBeta: number
): {
  priorBEDs: number[];
  priorEQD2s: number[];
  totalPriorBED: number;
  totalPriorEQD2: number;
  plannedBED: number;
  plannedEQD2: number;
  cumulativeBED: number;
  cumulativeEQD2: number;
} {
  // Validate planned inputs
  if (plannedDose <= 0) {
    throw new Error('Planned dose must be positive');
  }
  if (plannedFractions < 1 || !Number.isInteger(plannedFractions)) {
    throw new Error('Planned fractions must be a positive integer');
  }
  if (alphaBeta <= 0) {
    throw new Error('Alpha/beta ratio must be positive');
  }

  const priorBEDs: number[] = [];
  const priorEQD2s: number[] = [];
  let totalPriorBED = 0;
  let totalPriorEQD2 = 0;

  // Process each prior course
  priorCourses.forEach((course, index) => {
    if (course.dose <= 0) {
      throw new Error(`Prior course ${index + 1} dose must be positive`);
    }
    if (course.fractions < 1 || !Number.isInteger(course.fractions)) {
      throw new Error(`Prior course ${index + 1} fractions must be a positive integer`);
    }

    const bed = calculateBED(course.dose, course.fractions, alphaBeta);
    const eqd2 = calculateEQD2(bed, alphaBeta);

    priorBEDs.push(bed);
    priorEQD2s.push(eqd2);
    totalPriorBED += bed;
    totalPriorEQD2 += eqd2;
  });

  // Calculate BED for planned treatment
  const plannedBED = calculateBED(plannedDose, plannedFractions, alphaBeta);
  const plannedEQD2 = calculateEQD2(plannedBED, alphaBeta);

  // Cumulative doses (simple addition - assumes no repair)
  const cumulativeBED = totalPriorBED + plannedBED;
  const cumulativeEQD2 = totalPriorEQD2 + plannedEQD2;

  return {
    priorBEDs,
    priorEQD2s,
    totalPriorBED,
    totalPriorEQD2,
    plannedBED,
    plannedEQD2,
    cumulativeBED,
    cumulativeEQD2,
  };
}

/**
 * Calculate dose per fraction from total dose and number of fractions
 * 
 * Helper function for clarity in calculations
 * 
 * @param totalDose - Total prescribed dose in Gy
 * @param fractions - Number of fractions
 * @returns Dose per fraction in Gy
 */
export function getDosePerFraction(totalDose: number, fractions: number): number {
  if (totalDose <= 0) {
    throw new Error('Total dose must be positive');
  }
  if (fractions < 1 || !Number.isInteger(fractions)) {
    throw new Error('Number of fractions must be a positive integer');
  }
  
  return totalDose / fractions;
}

/**
 * Common alpha/beta ratios for reference
 * 
 * These are typical values used in clinical practice:
 * - Early-responding tissues and tumors: ~10 Gy
 * - Late-responding normal tissues: ~2-3 Gy
 */
export const ALPHA_BETA_RATIOS = {
  /** Tumors and early-responding tissues (mucosa, skin) */
  TUMOR_EARLY: 10,
  
  /** Late-responding CNS tissues (brain, spinal cord, optic structures) */
  CNS_LATE: 2,
  
  /** Late-responding tissues (general) */
  LATE_GENERAL: 3,
  
  /** Larynx and pharyngeal structures */
  LARYNX_PHARYNX: 3,
  
  /** Salivary glands */
  SALIVARY: 3,
} as const;
