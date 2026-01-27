import type { PatientData, CalculationResult } from './types';

/**
 * Calculate re-irradiation risk score based on patient factors
 * This is a simplified educational model and should not be used for actual clinical decisions
 */
export function calculateRiskScore(data: PatientData): CalculationResult {
  let score = 0;
  const factors: string[] = [];
  const recommendations: string[] = [];

  // Age factor (older age = higher risk)
  if (data.age !== undefined) {
    if (data.age > 70) {
      score += 15;
      factors.push('Age >70 years increases risk of toxicity');
    } else if (data.age > 60) {
      score += 10;
      factors.push('Age >60 years moderately increases risk');
    } else {
      score += 5;
      factors.push('Age <60 years is relatively favorable');
    }
  }

  // Prior dose factor (higher dose = higher risk)
  if (data.priorDose !== undefined) {
    if (data.priorDose > 70) {
      score += 25;
      factors.push('High prior radiation dose (>70 Gy) significantly increases risk');
    } else if (data.priorDose > 60) {
      score += 15;
      factors.push('Moderate prior radiation dose (60-70 Gy) increases risk');
    } else {
      score += 5;
      factors.push('Lower prior dose (<60 Gy) is more favorable');
    }
  }

  // Time since prior RT (shorter interval = higher risk)
  if (data.timeSinceRT !== undefined) {
    if (data.timeSinceRT < 6) {
      score += 25;
      factors.push('Very short interval (<6 months) carries highest risk');
    } else if (data.timeSinceRT < 12) {
      score += 20;
      factors.push('Short interval (6-12 months) significantly increases risk');
    } else if (data.timeSinceRT < 24) {
      score += 10;
      factors.push('Moderate interval (1-2 years) presents moderate risk');
    } else {
      score += 5;
      factors.push('Longer interval (>2 years) allows for tissue recovery');
    }
  }

  // Performance status (worse status = higher risk)
  if (data.performance !== undefined) {
    if (data.performance >= 3) {
      score += 20;
      factors.push('Poor performance status (ECOG 3-4) may limit tolerance');
    } else if (data.performance === 2) {
      score += 15;
      factors.push('Moderate performance status (ECOG 2) requires careful consideration');
    } else if (data.performance === 1) {
      score += 8;
      factors.push('Good performance status (ECOG 1) is favorable');
    } else {
      score += 3;
      factors.push('Excellent performance status (ECOG 0) is most favorable');
    }
  }

  // Tumor location factor (some locations have higher risk)
  const highRiskLocations = ['nasopharynx', 'hypopharynx'];
  const moderateRiskLocations = ['oropharynx', 'larynx'];
  
  if (highRiskLocations.includes(data.tumorLocation)) {
    score += 15;
    factors.push('Tumor location carries higher risk for critical structure toxicity');
  } else if (moderateRiskLocations.includes(data.tumorLocation)) {
    score += 10;
    factors.push('Tumor location requires careful normal tissue consideration');
  } else if (data.tumorLocation) {
    score += 5;
    factors.push('Tumor location identified for treatment planning');
  }

  // Determine risk level
  let riskLevel: 'Low' | 'Moderate' | 'High';
  let interpretation: string;

  if (score <= 40) {
    riskLevel = 'Low';
    interpretation = 'Patient may be a reasonable candidate for re-irradiation with appropriate technique and dose constraints.';
    recommendations.push('Consider modern radiation techniques (IMRT/proton therapy) to minimize toxicity');
    recommendations.push('Implement strict normal tissue dose constraints');
    recommendations.push('Close follow-up for early toxicity detection');
    recommendations.push('Patient should be evaluated by multidisciplinary tumor board');
  } else if (score <= 65) {
    riskLevel = 'Moderate';
    interpretation = 'Re-irradiation carries substantial risk. Careful patient selection and advanced techniques are essential.';
    recommendations.push('Strongly consider proton therapy or highly conformal techniques');
    recommendations.push('Implement aggressive supportive care measures');
    recommendations.push('Consider dose de-escalation strategies');
    recommendations.push('Extensive informed consent discussion regarding toxicity risks');
    recommendations.push('Weekly assessment during treatment');
  } else {
    riskLevel = 'High';
    interpretation = 'Re-irradiation carries very high risk. Alternative treatments should be strongly considered.';
    recommendations.push('Multidisciplinary evaluation mandatory before proceeding');
    recommendations.push('Consider alternative treatments (surgery, systemic therapy, palliative care)');
    recommendations.push('If re-RT pursued, use most advanced techniques available');
    recommendations.push('Reduced dose regimens may be necessary');
    recommendations.push('Very close monitoring and aggressive supportive care required');
    recommendations.push('Detailed discussion of potential severe toxicities with patient/family');
  }

  return {
    score,
    riskLevel,
    interpretation,
    factors,
    recommendations,
  };
}

/**
 * Validate patient data before calculation
 */
export function validatePatientData(data: PatientData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (data.age === undefined || data.age < 0 || data.age > 120) {
    errors.push('Age must be between 0 and 120 years');
  }

  if (data.priorDose === undefined || data.priorDose < 0 || data.priorDose > 150) {
    errors.push('Prior dose must be between 0 and 150 Gy');
  }

  if (data.timeSinceRT === undefined || data.timeSinceRT < 0) {
    errors.push('Time since prior RT must be a positive number');
  }

  if (!data.tumorLocation) {
    errors.push('Tumor location must be selected');
  }

  if (data.performance === undefined || data.performance < 0 || data.performance > 4) {
    errors.push('Performance status must be between 0 and 4');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
