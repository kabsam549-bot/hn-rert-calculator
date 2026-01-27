/**
 * H&N Re-RT Calculator - Core Calculation Modules
 * 
 * Central export point for all calculation modules
 */

// BED/EQD2 Calculations
export {
  calculateBED,
  calculateEQD2,
  calculateBEDAndEQD2,
  calculateCumulativeDose,
  getDosePerFraction,
  ALPHA_BETA_RATIOS,
} from './bedCalculations';

// OAR Constraints
export {
  checkOARConstraint,
  checkAllOARConstraints,
  getOARConstraint,
  getOARsByTier,
  determineWarningLevel,
  getOARSummary,
  OAR_CONSTRAINTS,
  type OARConstraint,
  type OARResult,
  type WarningLevel,
  type ToxicityTier,
} from './oarConstraints';

// RPA Classification
export {
  classifyRPA,
  validateRPAInputs,
  getRecommendationsByClass,
  monthsToYears,
  yearsToMonths,
  type RPAClass,
  type RPAInputs,
  type RPAResult,
} from './rpaClassification';
