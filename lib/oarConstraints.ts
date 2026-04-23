/**
 * Organ-at-Risk (OAR) Constraint System for Head & Neck Re-Irradiation
 * 
 * Based on MIRI study (Phan et al., 2025) and established dose constraints
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
    priorEQD2s: number[];
    totalPriorEQD2: number;
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
    limitEQD2: 70,
    alphaBeta: 2,
    complication: "Myelopathy",
    description: "Sahgal HyTEC: cumulative thecal sac EQD2₂ Dmax ≤70 Gy. Nieder risk score: low risk <65 Gy, interval ≥6 mo. Re-RT course: Dmax <12 Gy (2mm PRV) per Diao et al."
  },
  {
    name: "Brainstem",
    tier: 1,
    limitEQD2: 100,
    alphaBeta: 2,
    complication: "Brainstem necrosis",
    description: "Cumulative EQD2₂ <100 Gy considered safe (Zurich 2021, n=76; Rades 2024). No toxicity reported below this threshold. Re-RT course: Dmax <13 Gy per Diao et al."
  },
  {
    name: "Optic chiasm",
    tier: 1,
    limitEQD2: 55,
    alphaBeta: 2,
    complication: "Blindness",
    description: "Cumulative EQD2₂ <55 Gy (single-course QUANTEC). Re-RT course: Dmax <12 Gy (1mm PRV) per Diao et al. 5 fx limit typically ~25 Gy."
  },
  {
    name: "Optic nerves",
    tier: 1,
    limitEQD2: 55,
    alphaBeta: 2,
    complication: "Blindness",
    description: "Cumulative EQD2₂ <55 Gy (single-course QUANTEC). Re-RT course: ipsilateral Dmax <12-15 Gy, contralateral <4 Gy per Phan PD. 5 fx limit typically ~25 Gy."
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
    name: "Lingual artery",
    tier: 2,
    limitEQD2: 120,
    alphaBeta: 3,
    complication: "Lingual artery bleed",
    description: "Use carotid constraints. Re-RT course: <5mm from target Dmax <30 Gy no hotspot; >5mm Dmax <20 Gy (5fx), <18 Gy (3fx). Per Diao et al and Phan PD."
  },
  {
    name: "Temporal lobe",
    tier: 2,
    limitEQD2: 120,
    alphaBeta: 2,
    complication: "Temporal lobe necrosis",
    description: "Zurich 2021: brain cumulative EQD2₂ up to 120 Gy tolerated. D1cc brain correlated with acute toxicity."
  },
  {
    name: "Mandible",
    tier: 2,
    limitEQD2: 120,
    alphaBeta: 3,
    complication: "Osteoradionecrosis",
    description: "Lindvall 2021: D1cc cutoff 119 Gy for ORN (AUC 0.74). Phan composite: V70 <10%, V60 <30%."
  },
  {
    name: "Brachial plexus",
    tier: 2,
    limitEQD2: 75,
    alphaBeta: 3,
    complication: "Brachial plexopathy",
    description: "QUANTEC: <66 Gy single course. Re-RT cumulative estimated ~75 Gy with recovery."
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
    limitEQD2: 46,
    alphaBeta: 3,
    complication: "Xerostomia",
    description: "QUANTEC cumulative ~46 Gy mean for significant xerostomia. Per course: mean <25-30 Gy."
  },
  {
    name: "Larynx",
    tier: 3,
    limitEQD2: 70,
    alphaBeta: 3,
    complication: "Voice changes, aspiration, chondronecrosis",
    description: "Risk of chondronecrosis at high cumulative doses. Diao: Dmax <12 Gy per re-RT course (non-laryngeal target)."
  },
  {
    name: "Esophagus",
    tier: 3,
    limitEQD2: 68,
    alphaBeta: 3,
    complication: "Stricture, perforation",
    description: "QUANTEC + RTOG. Phan: neopharynx <30 Gy point with sharp drop-off."
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
 * @param priorCourses - Array of prior courses (dose in Gy, fractions)
 * @param plannedDose - Total dose for planned re-irradiation in Gy
 * @param plannedFractions - Number of fractions for planned treatment
 * @param intervalMonths - Time interval between treatments (for documentation)
 * @returns OAR evaluation result with warning level and message
 */
export function checkOARConstraint(
  oar: OARConstraint,
  priorCourses: { dose: number; fractions: number }[],
  plannedDose: number,
  plannedFractions: number,
  intervalMonths: number
): OARResult {
  // Input validation
  // priorCourses validation happens in calculateCumulativeDose
  if (plannedDose < 0) {
    throw new Error('Planned dose cannot be negative');
  }
  if (intervalMonths < 0) {
    throw new Error('Interval cannot be negative');
  }

  // Calculate cumulative doses using the OAR-specific alpha/beta ratio
  const doses = calculateCumulativeDose(
    priorCourses,
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
      priorEQD2s: doses.priorEQD2s,
      totalPriorEQD2: doses.totalPriorEQD2,
      plannedEQD2: doses.plannedEQD2,
      cumulativeEQD2: doses.cumulativeEQD2,
    },
  };
}

/**
 * Check all OAR constraints for a given treatment scenario
 * 
 * @param priorCourses - Array of prior courses (dose in Gy, fractions)
 * @param plannedDose - Total dose for planned re-irradiation in Gy
 * @param plannedFractions - Number of fractions for planned treatment
 * @param intervalMonths - Time interval between treatments
 * @returns Array of results for all OARs, sorted by tier and warning level
 */
export function checkAllOARConstraints(
  priorCourses: { dose: number; fractions: number }[],
  plannedDose: number,
  plannedFractions: number,
  intervalMonths: number
): OARResult[] {
  const results = OAR_CONSTRAINTS.map(oar =>
    checkOARConstraint(oar, priorCourses, plannedDose, plannedFractions, intervalMonths)
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
