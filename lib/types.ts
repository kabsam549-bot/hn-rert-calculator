import type { RPAResult } from './rpaClassification';
import type { OARResult } from './oarConstraints';

export interface PatientData {
  // Demographics
  age: number | undefined;
  tumorLocation: string;
  performance: number | undefined;
  
  // Prior radiation data
  priorDose: number | undefined;
  priorFractions: number | undefined;
  
  // Planned radiation data
  plannedDose: number | undefined;
  plannedFractions: number | undefined;
  
  // Time interval
  timeSinceRT: number | undefined; // in months
  
  // RPA factors
  hadSalvageSurgery: boolean;
  hasOrganDysfunction: boolean;
  
  // Selected OARs to evaluate
  selectedOARs: string[]; // organ names
}

export interface CalculationResult {
  // RPA classification
  rpa: RPAResult;
  
  // OAR constraint results
  oarResults: OARResult[];
  
  // Overall summary
  overallRisk: 'Low' | 'Moderate' | 'High';
  
  // Clinical interpretation
  interpretation: string;
  recommendations: string[];
}

// Legacy interface for backwards compatibility (if needed)
export interface RiskFactor {
  name: string;
  weight: number;
  condition: (data: PatientData) => boolean;
}
