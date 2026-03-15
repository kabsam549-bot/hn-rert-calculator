/**
 * OAR Dose Budget Calculations for Re-Irradiation Planning
 * 
 * Calculates remaining dose "room" for organs at risk when planning re-RT,
 * accounting for prior doses, tissue recovery over time, and lifetime tolerances.
 * 
 * Based on:
 * - HyTEC guidelines for cumulative dose limits
 * - Tissue recovery models (6-24+ month intervals)
 * - Linear-quadratic model (EQD2 normalization)
 */

import { calculateBED, calculateEQD2 } from './bedCalculations';

/**
 * OAR-specific data for dose budget calculations
 */
export interface OARBudgetData {
  name: string;
  /** Lifetime cumulative tolerance in EQD2 (Gy) */
  lifetimeToleranceEQD2: number;
  /** Alpha/beta ratio for this tissue */
  alphaBeta: number;
  /** Primary complication if tolerance exceeded */
  complication: string;
  /** Special warning/note for this OAR */
  specialNote?: string;
}

/**
 * Input data for a single OAR budget calculation
 */
export interface OARBudgetInput {
  oar: OARBudgetData;
  /** Actual prior dose to THIS organ (Gy) */
  priorDose: number;
  /** Number of fractions for prior treatment */
  priorFractions: number;
  /** Time since prior RT in months */
  timeSinceRT: number;
}

/**
 * Result of dose budget calculation for one OAR
 */
export interface OARBudgetResult {
  oar: OARBudgetData;
  /** Prior dose in EQD2 before recovery */
  priorEQD2: number;
  /** Recovery percentage applied (0-50%) */
  recoveryPercent: number;
  /** Effective prior EQD2 after tissue recovery */
  effectivePriorEQD2: number;
  /** Remaining dose budget in EQD2 */
  remainingBudgetEQD2: number;
  /** Percentage of lifetime budget remaining (0-100+) */
  percentRemaining: number;
  /** Physical dose budgets for common fractionation schemes */
  physicalDoseBudgets: {
    twoFractions: number;
    threeFractions: number;
    fourFractions: number;
    fiveFractions: number;
  };
  /** Risk level: safe (>50%), caution (25-50%), warning (10-25%), critical (<10%) */
  riskLevel: 'safe' | 'caution' | 'warning' | 'critical';
  /** Warning message if applicable */
  warningMessage?: string;
}

/**
 * OAR tolerance database for dose budget planning
 * Based on HyTEC cumulative dose limits for re-irradiation
 */
export const OAR_BUDGET_DATA: OARBudgetData[] = [
  {
    name: 'Brainstem',
    lifetimeToleranceEQD2: 64,
    alphaBeta: 3,
    complication: 'Brainstem necrosis',
    specialNote: 'Brainstem necrosis risk <5% if cumulative BED <120 Gy₃'
  },
  {
    name: 'Spinal cord',
    lifetimeToleranceEQD2: 100,
    alphaBeta: 3,
    complication: 'Myelopathy',
    specialNote: 'Initial tolerance ~50 Gy EQD2; with tissue recovery (12-24+ mo), cumulative re-RT tolerance ~100 Gy EQD2. Re-RT course Dmax <12 Gy (2mm PRV).'
  },
  {
    name: 'Brachial plexus',
    lifetimeToleranceEQD2: 66,
    alphaBeta: 3,
    complication: 'Brachial plexopathy',
    specialNote: 'Risk <5% if BED <120, 5-10% at BED 120-150, >10% if BED >150 Gy₃'
  },
  {
    name: 'Optic chiasm',
    lifetimeToleranceEQD2: 54,
    alphaBeta: 3,
    complication: 'Optic neuropathy / blindness'
  },
  {
    name: 'Optic nerves',
    lifetimeToleranceEQD2: 54,
    alphaBeta: 3,
    complication: 'Optic neuropathy / blindness'
  },
  {
    name: 'Cochlea',
    lifetimeToleranceEQD2: 45,
    alphaBeta: 3,
    complication: 'Hearing loss'
  },
  {
    name: 'Mandible',
    lifetimeToleranceEQD2: 70,
    alphaBeta: 3,
    complication: 'Osteoradionecrosis'
  },
  {
    name: 'Temporal lobe',
    lifetimeToleranceEQD2: 60,
    alphaBeta: 3,
    complication: 'Temporal lobe necrosis'
  },
  {
    name: 'Carotid vessels',
    lifetimeToleranceEQD2: 120,
    alphaBeta: 3,
    complication: 'Carotid blowout',
    specialNote: 'Consider IR consult for prophylactic intervention if bleed risk >5%'
  },
  {
    name: 'Pharyngeal constrictors',
    lifetimeToleranceEQD2: 50,
    alphaBeta: 3,
    complication: 'Severe dysphagia'
  },
  {
    name: 'Parotid gland',
    lifetimeToleranceEQD2: 26,
    alphaBeta: 3,
    complication: 'Xerostomia'
  },
  {
    name: 'Larynx',
    lifetimeToleranceEQD2: 50,
    alphaBeta: 3,
    complication: 'Voice changes / aspiration'
  },
  {
    name: 'Esophagus',
    lifetimeToleranceEQD2: 55,
    alphaBeta: 3,
    complication: 'Stricture / dysphagia'
  },
];

/**
 * Get OAR budget data by name
 */
export function getOARBudgetData(name: string): OARBudgetData | undefined {
  return OAR_BUDGET_DATA.find(
    oar => oar.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Calculate tissue recovery factor based on time interval
 * 
 * Based on empirical evidence and clinical guidelines:
 * - <6 months: No meaningful recovery (0%)
 * - 6-12 months: Partial recovery begins (25%)
 * - 12-24 months: Progressive recovery (40%)
 * - >24 months: Substantial recovery (50%)
 * 
 * Note: This is a simplified model. Actual recovery varies by tissue type,
 * dose, volume, and patient factors. Conservative estimates are used.
 * 
 * @param months - Time since prior RT in months
 * @returns Recovery percentage (0.0 to 0.5)
 */
export function calculateRecoveryFactor(months: number): number {
  if (months < 6) {
    return 0.0; // No recovery
  } else if (months < 12) {
    return 0.25; // 25% recovery
  } else if (months < 24) {
    return 0.40; // 40% recovery (middle of 25-50% range)
  } else {
    return 0.50; // 50% recovery
  }
}

/**
 * Convert EQD2 to physical dose for a given fractionation scheme
 * 
 * From EQD2 formula: EQD2 = D × (d + α/β) / (2 + α/β)
 * Solving for D: D = EQD2 × (2 + α/β) / (d + α/β)
 * 
 * @param eqd2 - Target EQD2 in Gy
 * @param fractions - Number of fractions
 * @param alphaBeta - Alpha/beta ratio
 * @returns Physical total dose in Gy
 */
export function eqd2ToPhysicalDose(
  eqd2: number,
  fractions: number,
  alphaBeta: number
): number {
  // Iterative solver for better accuracy
  // We want: eqd2 = D * (d + α/β) / (2 + α/β)
  // Where d = D/n
  
  let totalDose = eqd2; // Initial guess
  
  // Newton's method iteration (usually converges in 2-3 iterations)
  for (let i = 0; i < 10; i++) {
    const d = totalDose / fractions;
    const currentEQD2 = totalDose * (d + alphaBeta) / (2 + alphaBeta);
    const error = currentEQD2 - eqd2;
    
    if (Math.abs(error) < 0.001) break;
    
    // Derivative: d(EQD2)/d(D) = (d + α/β)/(2 + α/β) + D/(n(2 + α/β))
    const derivative = (d + alphaBeta) / (2 + alphaBeta) + totalDose / (fractions * (2 + alphaBeta));
    
    totalDose -= error / derivative;
  }
  
  return Math.max(0, totalDose); // Ensure non-negative
}

/**
 * Determine risk level based on percentage of budget remaining
 */
export function determineRiskLevel(percentRemaining: number): 'safe' | 'caution' | 'warning' | 'critical' {
  if (percentRemaining > 50) return 'safe';
  if (percentRemaining > 25) return 'caution';
  if (percentRemaining > 10) return 'warning';
  return 'critical';
}

/**
 * Generate warning message based on risk level and OAR
 */
export function generateWarningMessage(
  oar: OARBudgetData,
  percentRemaining: number,
  effectivePriorEQD2: number
): string | undefined {
  const riskLevel = determineRiskLevel(percentRemaining);
  
  if (riskLevel === 'critical') {
    return `⚠️ CRITICAL: Only ${percentRemaining.toFixed(1)}% of lifetime tolerance remaining. Risk of ${oar.complication} is substantially elevated. Exercise extreme caution.`;
  }
  
  if (riskLevel === 'warning') {
    return `⚠️ WARNING: ${percentRemaining.toFixed(1)}% of lifetime tolerance remaining. Approaching threshold for ${oar.complication}.`;
  }
  
  if (riskLevel === 'caution') {
    return `⚠️ CAUTION: ${percentRemaining.toFixed(1)}% of lifetime tolerance remaining. Monitor closely for ${oar.complication}.`;
  }
  
  // Special warnings for specific OARs
  if (oar.name === 'Carotid vessels' && percentRemaining < 30) {
    return `Consider IR consult for prophylactic stenting/coiling if bleed risk >5%`;
  }
  
  // Brachial plexus BED-based risk
  if (oar.name === 'Brachial plexus') {
    const bed = effectivePriorEQD2 * (2 + oar.alphaBeta) / (2 + oar.alphaBeta); // Approximate BED
    const cumulativeBED = bed; // For simplicity, using effective prior
    
    if (cumulativeBED > 150) {
      return `⚠️ CRITICAL: Cumulative BED >150 Gy₃. Plexopathy risk >10%.`;
    } else if (cumulativeBED > 120) {
      return `⚠️ WARNING: Cumulative BED 120-150 Gy₃. Plexopathy risk 5-10%.`;
    }
  }
  
  return undefined;
}

/**
 * Calculate dose budget for a single OAR
 */
export function calculateOARBudget(input: OARBudgetInput): OARBudgetResult {
  const { oar, priorDose, priorFractions, timeSinceRT } = input;
  
  // Validate inputs
  if (priorDose < 0 || priorFractions < 1 || timeSinceRT < 0) {
    throw new Error('Invalid input values for dose budget calculation');
  }
  
  // Step 1: Convert prior dose to EQD2
  const priorBED = calculateBED(priorDose, priorFractions, oar.alphaBeta);
  const priorEQD2 = calculateEQD2(priorBED, oar.alphaBeta);
  
  // Step 2: Apply tissue recovery
  const recoveryPercent = calculateRecoveryFactor(timeSinceRT) * 100;
  const recoveryFraction = recoveryPercent / 100;
  const effectivePriorEQD2 = priorEQD2 * (1 - recoveryFraction);
  
  // Step 3: Calculate remaining budget
  const remainingBudgetEQD2 = Math.max(0, oar.lifetimeToleranceEQD2 - effectivePriorEQD2);
  const percentRemaining = (remainingBudgetEQD2 / oar.lifetimeToleranceEQD2) * 100;
  
  // Step 4: Convert to physical doses for common fractionation schemes
  const physicalDoseBudgets = {
    twoFractions: eqd2ToPhysicalDose(remainingBudgetEQD2, 2, oar.alphaBeta),
    threeFractions: eqd2ToPhysicalDose(remainingBudgetEQD2, 3, oar.alphaBeta),
    fourFractions: eqd2ToPhysicalDose(remainingBudgetEQD2, 4, oar.alphaBeta),
    fiveFractions: eqd2ToPhysicalDose(remainingBudgetEQD2, 5, oar.alphaBeta),
  };
  
  // Determine risk level and warnings
  const riskLevel = determineRiskLevel(percentRemaining);
  const warningMessage = generateWarningMessage(oar, percentRemaining, effectivePriorEQD2);
  
  return {
    oar,
    priorEQD2,
    recoveryPercent,
    effectivePriorEQD2,
    remainingBudgetEQD2,
    percentRemaining,
    physicalDoseBudgets,
    riskLevel,
    warningMessage,
  };
}

/**
 * Calculate dose budgets for multiple OARs
 */
export function calculateMultipleOARBudgets(
  inputs: OARBudgetInput[]
): OARBudgetResult[] {
  return inputs.map(input => calculateOARBudget(input));
}

/**
 * Get color class for risk level (Tailwind CSS)
 */
export function getRiskColorClass(riskLevel: 'safe' | 'caution' | 'warning' | 'critical'): {
  bg: string;
  border: string;
  text: string;
  badge: string;
} {
  switch (riskLevel) {
    case 'safe':
      return {
        bg: 'bg-green-50',
        border: 'border-green-300',
        text: 'text-green-900',
        badge: 'bg-green-100 text-green-800'
      };
    case 'caution':
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-300',
        text: 'text-yellow-900',
        badge: 'bg-yellow-100 text-yellow-800'
      };
    case 'warning':
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-300',
        text: 'text-orange-900',
        badge: 'bg-orange-100 text-orange-800'
      };
    case 'critical':
      return {
        bg: 'bg-red-50',
        border: 'border-red-300',
        text: 'text-red-900',
        badge: 'bg-red-100 text-red-800'
      };
  }
}
