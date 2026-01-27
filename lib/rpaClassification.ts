/**
 * MIRI Recursive Partitioning Analysis (RPA) Classification
 * 
 * Based on the Multi-Institutional Re-Irradiation (MIRI) study by Phan et al. (2010)
 * This RPA model stratifies patients into prognostic groups for head and neck re-irradiation.
 * 
 * Key prognostic factors:
 * 1. Re-irradiation interval (<2 years vs ≥2 years)
 * 2. Prior salvage surgery (yes vs no)
 * 3. Organ dysfunction (feeding tube or tracheostomy dependence)
 * 
 * Reference:
 * Phan J, et al. Retreatment of Head and Neck Cancers With Intensity Modulated 
 * Radiation Therapy: Outcomes From a Multi-Institutional Study. 
 * Int J Radiat Oncol Biol Phys. 2010.
 */

/**
 * RPA prognostic class (I = best, III = worst)
 */
export type RPAClass = "I" | "II" | "III";

/**
 * Input parameters for RPA classification
 */
export interface RPAInputs {
  /**
   * Time interval between initial radiation and re-irradiation (years)
   * Critical threshold: 2 years
   */
  reirradiationIntervalYears: number;

  /**
   * Whether patient underwent salvage surgery between RT courses
   * Resection of recurrent tumor improves prognosis in Class I patients
   */
  hadSalvageSurgery: boolean;

  /**
   * Whether patient has major organ dysfunction
   * Defined as: feeding tube dependent OR tracheostomy dependent
   */
  hasOrganDysfunction: boolean;
}

/**
 * RPA classification result with survival estimates
 */
export interface RPAResult {
  /** RPA prognostic class */
  class: RPAClass;

  /** Estimated 2-year overall survival (percentage) */
  survivalEstimate2Year: number;

  /** Median survival in months (approximate from MIRI data) */
  medianSurvivalMonths: number;

  /** Human-readable description of the classification */
  description: string;

  /** Clinical interpretation and recommendations */
  interpretation: string;

  /** Factors that led to this classification */
  classificationFactors: string[];
}

/**
 * Classify patient according to MIRI RPA model
 * 
 * Classification logic:
 * - Class I: ≥2 years interval AND had salvage surgery → Best prognosis (61.9% 2-yr OS)
 * - Class II: (≥2 years unresected) OR (<2 years without dysfunction) → Intermediate (40.0% 2-yr OS)
 * - Class III: <2 years interval AND has organ dysfunction → Poor prognosis (16.8% 2-yr OS)
 * 
 * @param inputs - Patient characteristics for classification
 * @returns RPA classification with survival estimates and interpretation
 * @throws Error if inputs are invalid
 */
export function classifyRPA(inputs: RPAInputs): RPAResult {
  // Input validation
  if (inputs.reirradiationIntervalYears < 0) {
    throw new Error('Re-irradiation interval cannot be negative');
  }
  if (inputs.reirradiationIntervalYears > 50) {
    throw new Error('Re-irradiation interval seems unrealistic (>50 years)');
  }

  const { reirradiationIntervalYears, hadSalvageSurgery, hasOrganDysfunction } = inputs;
  const classificationFactors: string[] = [];

  // Document the classification factors
  if (reirradiationIntervalYears >= 2) {
    classificationFactors.push(`Re-irradiation interval ≥2 years (${reirradiationIntervalYears.toFixed(1)} years)`);
  } else {
    classificationFactors.push(`Re-irradiation interval <2 years (${reirradiationIntervalYears.toFixed(1)} years)`);
  }

  if (hadSalvageSurgery) {
    classificationFactors.push('Prior salvage surgery performed');
  } else {
    classificationFactors.push('No salvage surgery');
  }

  if (hasOrganDysfunction) {
    classificationFactors.push('Organ dysfunction present (feeding tube or tracheostomy)');
  } else {
    classificationFactors.push('No major organ dysfunction');
  }

  // Apply RPA classification algorithm
  let rpaClass: RPAClass;
  let survivalEstimate2Year: number;
  let medianSurvivalMonths: number;
  let description: string;
  let interpretation: string;

  // Class I: ≥2 years + salvage surgery
  if (reirradiationIntervalYears >= 2 && hadSalvageSurgery) {
    rpaClass = "I";
    survivalEstimate2Year = 61.9;
    medianSurvivalMonths = 28;
    description = "Favorable prognosis: Long interval with surgical salvage";
    interpretation = 
      "This patient falls into the MOST FAVORABLE prognostic group (RPA Class I). " +
      "The combination of a longer interval (≥2 years) allowing tissue recovery and " +
      "successful salvage surgery with subsequent re-irradiation is associated with " +
      "the best outcomes. These patients have a 2-year survival of approximately 62%. " +
      "Re-irradiation is reasonable to consider with appropriate patient selection and technique.";
  }
  // Class III: <2 years + organ dysfunction
  else if (reirradiationIntervalYears < 2 && hasOrganDysfunction) {
    rpaClass = "III";
    survivalEstimate2Year = 16.8;
    medianSurvivalMonths = 9;
    description = "Poor prognosis: Short interval with organ dysfunction";
    interpretation = 
      "This patient falls into the LEAST FAVORABLE prognostic group (RPA Class III). " +
      "The combination of short re-irradiation interval (<2 years) and existing organ " +
      "dysfunction (feeding tube or tracheostomy dependence) is associated with poor outcomes. " +
      "These patients have only a 17% 2-year survival rate. Alternative treatment approaches " +
      "such as best supportive care, palliative chemotherapy, or clinical trial enrollment " +
      "should be strongly considered. If re-irradiation is pursued, reduced dose regimens " +
      "and palliative intent should be discussed with the patient and family.";
  }
  // Class II: All other combinations
  else {
    rpaClass = "II";
    survivalEstimate2Year = 40.0;
    medianSurvivalMonths = 16;
    description = "Intermediate prognosis: Mixed prognostic factors";
    
    // Provide more specific interpretation based on which factors apply
    if (reirradiationIntervalYears >= 2 && !hadSalvageSurgery) {
      interpretation = 
        "This patient falls into an INTERMEDIATE prognostic group (RPA Class II). " +
        "While the interval since prior radiation is favorable (≥2 years), the lack of " +
        "surgical salvage places them in a moderate risk category. These patients have " +
        "approximately 40% 2-year survival. Re-irradiation can be considered, particularly " +
        "with modern highly conformal techniques (IMRT/proton therapy) and appropriate dose constraints.";
    } else if (reirradiationIntervalYears < 2 && !hasOrganDysfunction) {
      interpretation = 
        "This patient falls into an INTERMEDIATE prognostic group (RPA Class II). " +
        "The short interval since prior radiation (<2 years) is concerning, but the absence " +
        "of major organ dysfunction is favorable. These patients have approximately 40% 2-year " +
        "survival. Re-irradiation requires careful consideration with emphasis on strict OAR " +
        "constraints and possibly reduced dose regimens to minimize toxicity risk.";
    } else {
      interpretation = 
        "This patient falls into an INTERMEDIATE prognostic group (RPA Class II) with " +
        "approximately 40% 2-year survival. Careful multidisciplinary evaluation is needed " +
        "to weigh potential benefits against toxicity risks.";
    }
  }

  return {
    class: rpaClass,
    survivalEstimate2Year,
    medianSurvivalMonths,
    description,
    interpretation,
    classificationFactors,
  };
}

/**
 * Validate RPA inputs for common issues
 * 
 * @param inputs - RPA input parameters
 * @returns Validation result with any warnings or suggestions
 */
export function validateRPAInputs(inputs: RPAInputs): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for errors
  if (inputs.reirradiationIntervalYears < 0) {
    errors.push('Re-irradiation interval cannot be negative');
  }
  if (inputs.reirradiationIntervalYears > 50) {
    errors.push('Re-irradiation interval exceeds 50 years - please verify');
  }

  // Check for clinically important scenarios
  if (inputs.reirradiationIntervalYears < 0.5) {
    warnings.push(
      'Very short interval (<6 months): Consider if re-irradiation is appropriate vs. other treatments'
    );
  }

  if (inputs.reirradiationIntervalYears >= 10) {
    warnings.push(
      'Long interval (≥10 years): Tissue repair may be substantial; original RPA data had fewer such patients'
    );
  }

  if (inputs.hasOrganDysfunction && inputs.hadSalvageSurgery) {
    warnings.push(
      'Patient has both surgery and organ dysfunction: Carefully assess baseline function and goals of care'
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get recommended considerations based on RPA class
 * 
 * @param rpaClass - The RPA classification
 * @returns Array of clinical recommendations specific to this class
 */
export function getRecommendationsByClass(rpaClass: RPAClass): string[] {
  switch (rpaClass) {
    case "I":
      return [
        "Patient is in favorable prognostic group - re-irradiation reasonable to pursue",
        "Use modern highly conformal techniques (IMRT, VMAT, or proton therapy)",
        "Maintain strict OAR dose constraints per HyTEC guidelines",
        "Consider moderate to full-dose re-irradiation if OAR constraints permit",
        "Close multidisciplinary follow-up for early toxicity detection",
        "Aggressive supportive care during and after treatment",
      ];

    case "II":
      return [
        "Patient in intermediate risk group - careful patient selection essential",
        "Multidisciplinary tumor board discussion strongly recommended",
        "Consider dose de-escalation strategies (e.g., 50-60 Gy vs. 70 Gy)",
        "Use most advanced RT technique available",
        "Detailed informed consent regarding realistic benefit vs. toxicity risk",
        "Consider concurrent systemic therapy if appropriate",
        "Weekly on-treatment assessments for toxicity management",
        "May consider clinical trial enrollment if available",
      ];

    case "III":
      return [
        "Patient in poor prognostic group - strongly consider alternatives to re-RT",
        "Mandatory multidisciplinary evaluation before proceeding",
        "Discuss goals of care (curative intent vs. palliation) with patient/family",
        "If re-RT pursued, use palliative approach with reduced doses",
        "Consider alternative systemic therapy, immunotherapy, or clinical trials",
        "Palliative care consultation recommended",
        "Very close monitoring - consider admission or daily assessment during treatment",
        "Maximize supportive care resources (nutrition, pain management, social work)",
        "Document extensive informed consent discussion regarding poor prognosis",
      ];
  }
}

/**
 * Calculate years from months (helper function)
 * 
 * @param months - Time interval in months
 * @returns Time interval in years
 */
export function monthsToYears(months: number): number {
  return months / 12;
}

/**
 * Calculate months from years (helper function)
 * 
 * @param years - Time interval in years
 * @returns Time interval in months
 */
export function yearsToMonths(years: number): number {
  return years * 12;
}
