/**
 * Organ-at-Risk (OAR) Constraint System for Head & Neck Re-Irradiation
 * 
 * Based on MIRI study (Phan et al., 2010) and established dose constraints
 * for re-irradiation scenarios. Constraints are organized by toxicity tier.
 * 
 * References:
 * - Phan et al. (2010) Multi-Institutional Radiotherapy Interventions (MIRI)
 * - QUANTEC guidelines
 * - HyTEC guidelines for re-irradiation
 */

import { calculateCumulativeDose } from './bedCalculations';

/**
 * Warning level for OAR dose assessment
 * - safe: <80% of dose limit (green)
 * - caution: 80-100% of dose limit (yellow) 
 * - exceeds: >100% of dose limit (red)
 */
export type WarningLevel = "safe" | "caution" | "exceeds";

/**
 * Toxicity tier classification
 * Tier 1: Life-threatening complications
 * Tier 2: Critical complications affecting major functions
 * Tier 3: Quality of life complications
 */
export type ToxicityTier = 1 | 2 | 3;

/**
 * OAR constraint definition
 */
export interface OARConstraint {
  /** Organ-at-risk name */
  name: string;
  
  /** Toxicity tier (1=life-threatening, 2=critical, 3=QOL) */
  tier: ToxicityTier;
  
  /** Dose limit in EQD2 (Gy) */
  limitEQD2: number;
  
  /** Alpha/beta ratio for this tissue (Gy) */
  alphaBeta: number;
  
  /** Primary complication of concern */
  complication: string;
  
  /** Additional description (dose metric, context) */
  description: string;
}

/**
 * Result of OAR constraint check
 */
export interface OARResult {
  /** The OAR that was evaluated */
  oar: OARConstraint;
  
  /** Cumulative EQD2 dose to this structure (Gy) */
  cumulativeEQD2: number;
  
  /** Percentage of dose limit (0-200+) */
  percentOfLimit: number;
  
  /** Warning level based on dose */
  warningLevel: WarningLevel;
  
  /** Human-readable message */
  message: string;
  
  /** Detailed breakdown of prior and planned doses */
  doseBreakdown: {
    priorEQD2: number;
    plannedEQD2: number;
    cumulativeEQD2: number;
  };
}

/**
 * Comprehensive OAR constraint database for H&N re-irradiation
 * 
 * These constraints are based on cumulative EQD2 doses and represent
 * clinically established thresholds for toxicity in re-irradiation scenarios.
 */
export const OAR_CONSTRAINTS: OARConstraint[] = [
  // ============================================================================
  // TIER 1: LIFE-THREATENING TOXICITIES
  // ============================================================================
  {
    name: "Spinal cord",
    tier: 1,
    limitEQD2: 50,
    alphaBeta: 2,
    complication: "Myelopathy",
    description: "Max point dose; myelopathy risk <1% at 50 Gy EQD2, increases significantly above this threshold"
  },
  {
    name: "Brainstem",
    tier: 1,
    limitEQD2: 54,
    alphaBeta: 2,
    complication: "Brainstem necrosis",
    description: "Max point dose; necrosis risk <5% at 54 Gy, substantially higher above 60 Gy"
  },
  {
    name: "Optic chiasm",
    tier: 1,
    limitEQD2: 50,
    alphaBeta: 2,
    complication: "Blindness",
    description: "Max point dose; optic neuropathy risk <3% at 50 Gy, increases rapidly above"
  },
  {
    name: "Optic nerves",
    tier: 1,
    limitEQD2: 55,
    alphaBeta: 2,
    complication: "Blindness",
    description: "Max point dose to either nerve; slightly higher tolerance than chiasm"
  },

  // ============================================================================
  // TIER 2: CRITICAL TOXICITIES
  // ============================================================================
  {
    name: "Carotid vessels",
    tier: 2,
    limitEQD2: 120,
    alphaBeta: 3,
    complication: "Carotid blowout",
    description: "Max dose to vessel wall; risk increases with prior surgery and high cumulative dose"
  },
  {
    name: "Temporal lobe",
    tier: 2,
    limitEQD2: 60,
    alphaBeta: 3,
    complication: "Temporal lobe necrosis",
    description: "Max dose; necrosis risk increases significantly above 60 Gy EQD2"
  },
  {
    name: "Mandible",
    tier: 2,
    limitEQD2: 70,
    alphaBeta: 3,
    complication: "Osteoradionecrosis",
    description: "Max dose to bone; risk increases with dental extractions and poor healing"
  },
  {
    name: "Brachial plexus",
    tier: 2,
    limitEQD2: 60,
    alphaBeta: 2,
    complication: "Brachial plexopathy",
    description: "Max point dose; neuropathy risk <5% at 60 Gy"
  },

  // ============================================================================
  // TIER 3: QUALITY OF LIFE TOXICITIES
  // ============================================================================
  {
    name: "Pharyngeal constrictors",
    tier: 3,
    limitEQD2: 55,
    alphaBeta: 3,
    complication: "Dysphagia",
    description: "Mean dose; severe dysphagia risk increases above 55 Gy mean dose"
  },
  {
    name: "Cranial nerves (IX, X, XI, XII)",
    tier: 3,
    limitEQD2: 60,
    alphaBeta: 3,
    complication: "Neuropathy (swallowing, voice, shoulder)",
    description: "Max dose; lower cranial nerve dysfunction impacts swallowing and voice"
  },
  {
    name: "Parotid gland",
    tier: 3,
    limitEQD2: 26,
    alphaBeta: 3,
    complication: "Xerostomia",
    description: "Mean dose to at least one gland; keep <26 Gy to preserve salivary function"
  },
  {
    name: "Larynx",
    tier: 3,
    limitEQD2: 50,
    alphaBeta: 3,
    complication: "Voice changes, aspiration",
    description: "Mean dose; voice quality deteriorates above 50 Gy mean dose"
  },
  {
    name: "Esophagus",
    tier: 3,
    limitEQD2: 55,
    alphaBeta: 3,
    complication: "Stricture, dysphagia",
    description: "Mean dose; stricture risk increases above 55 Gy"
  },
];

/**
 * Get OAR constraint by name
 * 
 * @param name - Name of the organ at risk
 * @returns OAR constraint object or undefined if not found
 */
export function getOARConstraint(name: string): OARConstraint | undefined {
  return OAR_CONSTRAINTS.find(
    oar => oar.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get all OARs in a specific tier
 * 
 * @param tier - Toxicity tier (1, 2, or 3)
 * @returns Array of OAR constraints in that tier
 */
export function getOARsByTier(tier: ToxicityTier): OARConstraint[] {
  return OAR_CONSTRAINTS.filter(oar => oar.tier === tier);
}

/**
 * Determine warning level based on percentage of dose limit
 * 
 * @param percentOfLimit - Percentage of the dose constraint (0-200+)
 * @returns Warning level classification
 */
export function determineWarningLevel(percentOfLimit: number): WarningLevel {
  if (percentOfLimit > 100) {
    return "exceeds";
  } else if (percentOfLimit >= 80) {
    return "caution";
  } else {
    return "safe";
  }
}

/**
 * Check if an OAR constraint is met given prior and planned radiation doses
 * 
 * This function calculates cumulative EQD2 dose and compares it to the
 * established constraint for the organ at risk.
 * 
 * @param oar - The organ-at-risk constraint to check
 * @param priorDose - Total dose from prior radiation in Gy
 * @param priorFractions - Number of fractions in prior treatment
 * @param plannedDose - Total dose for planned re-irradiation in Gy
 * @param plannedFractions - Number of fractions for planned treatment
 * @param intervalMonths - Time interval between treatments (for documentation)
 * @returns OAR evaluation result with warning level and message
 */
export function checkOARConstraint(
  oar: OARConstraint,
  priorDose: number,
  priorFractions: number,
  plannedDose: number,
  plannedFractions: number,
  intervalMonths: number
): OARResult {
  // Input validation
  if (priorDose < 0) {
    throw new Error('Prior dose cannot be negative');
  }
  if (plannedDose < 0) {
    throw new Error('Planned dose cannot be negative');
  }
  if (intervalMonths < 0) {
    throw new Error('Interval cannot be negative');
  }

  // Calculate cumulative doses using the OAR-specific alpha/beta ratio
  const doses = calculateCumulativeDose(
    priorDose,
    priorFractions,
    plannedDose,
    plannedFractions,
    oar.alphaBeta
  );

  const cumulativeEQD2 = doses.cumulativeEQD2;
  const percentOfLimit = (cumulativeEQD2 / oar.limitEQD2) * 100;
  const warningLevel = determineWarningLevel(percentOfLimit);

  // Generate appropriate message based on warning level
  let message: string;
  const tierLabel = oar.tier === 1 ? "LIFE-THREATENING" : 
                    oar.tier === 2 ? "CRITICAL" : "QUALITY OF LIFE";

  if (warningLevel === "exceeds") {
    message = `⚠️ EXCEEDS LIMIT: ${oar.name} dose of ${cumulativeEQD2.toFixed(1)} Gy exceeds ` +
              `the ${oar.limitEQD2} Gy constraint by ${(percentOfLimit - 100).toFixed(0)}%. ` +
              `Risk of ${oar.complication} is significantly elevated. [${tierLabel}]`;
  } else if (warningLevel === "caution") {
    message = `⚠️ CAUTION: ${oar.name} dose of ${cumulativeEQD2.toFixed(1)} Gy is at ` +
              `${percentOfLimit.toFixed(0)}% of the ${oar.limitEQD2} Gy limit. ` +
              `Approaching threshold for ${oar.complication}. [${tierLabel}]`;
  } else {
    message = `✓ SAFE: ${oar.name} dose of ${cumulativeEQD2.toFixed(1)} Gy is ` +
              `${percentOfLimit.toFixed(0)}% of the ${oar.limitEQD2} Gy limit. ` +
              `Within acceptable range. [${tierLabel}]`;
  }

  return {
    oar,
    cumulativeEQD2,
    percentOfLimit,
    warningLevel,
    message,
    doseBreakdown: {
      priorEQD2: doses.priorEQD2,
      plannedEQD2: doses.plannedEQD2,
      cumulativeEQD2: doses.cumulativeEQD2,
    },
  };
}

/**
 * Check all OAR constraints for a given treatment scenario
 * 
 * @param priorDose - Total dose from prior radiation in Gy
 * @param priorFractions - Number of fractions in prior treatment
 * @param plannedDose - Total dose for planned re-irradiation in Gy
 * @param plannedFractions - Number of fractions for planned treatment
 * @param intervalMonths - Time interval between treatments
 * @returns Array of results for all OARs, sorted by tier and warning level
 */
export function checkAllOARConstraints(
  priorDose: number,
  priorFractions: number,
  plannedDose: number,
  plannedFractions: number,
  intervalMonths: number
): OARResult[] {
  const results = OAR_CONSTRAINTS.map(oar =>
    checkOARConstraint(oar, priorDose, priorFractions, plannedDose, plannedFractions, intervalMonths)
  );

  // Sort by tier first, then by warning level (exceeds > caution > safe)
  const warningOrder = { exceeds: 0, caution: 1, safe: 2 };
  
  return results.sort((a, b) => {
    if (a.oar.tier !== b.oar.tier) {
      return a.oar.tier - b.oar.tier;
    }
    return warningOrder[a.warningLevel] - warningOrder[b.warningLevel];
  });
}

/**
 * Get summary statistics for OAR constraint checking
 * 
 * @param results - Array of OAR results from checkAllOARConstraints
 * @returns Summary counts by warning level and tier
 */
export function getOARSummary(results: OARResult[]): {
  total: number;
  safe: number;
  caution: number;
  exceeds: number;
  byTier: {
    tier1: { safe: number; caution: number; exceeds: number };
    tier2: { safe: number; caution: number; exceeds: number };
    tier3: { safe: number; caution: number; exceeds: number };
  };
} {
  const summary = {
    total: results.length,
    safe: 0,
    caution: 0,
    exceeds: 0,
    byTier: {
      tier1: { safe: 0, caution: 0, exceeds: 0 },
      tier2: { safe: 0, caution: 0, exceeds: 0 },
      tier3: { safe: 0, caution: 0, exceeds: 0 },
    },
  };

  results.forEach(result => {
    // Overall counts
    summary[result.warningLevel]++;

    // Tier-specific counts
    const tierKey = `tier${result.oar.tier}` as 'tier1' | 'tier2' | 'tier3';
    summary.byTier[tierKey][result.warningLevel]++;
  });

  return summary;
}
