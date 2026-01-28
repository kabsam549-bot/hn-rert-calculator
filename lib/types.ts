import type { RPAResult } from './rpaClassification';
import type { OARResult } from './oarConstraints';

export interface RTCourse {
  dose: number | undefined;
  fractions: number | undefined;
}

export interface PatientData {
  // Demographics
  age: number | undefined;
  tumorLocation: string;
  performance: number | undefined;
  
  // Prior radiation data
  priorCourses: RTCourse[];
  
  // Planned radiation data
  plannedDose: number | undefined;
  plannedFractions: number | undefined;
  
  // Time interval
  timeSinceRT: number | undefined; // in months from most recent course
  
  // RPA factors
  hadSalvageSurgery: boolean;
  hasOrganDysfunction: boolean;
  
  // Selected OARs to evaluate
  selectedOARs: string[]; // organ names
  
  // Optional OAR-specific doses (if user has actual dose data)
  // Key is OAR name, value is { priorDose, plannedDose } in Gy
  // If not provided for an OAR, assumes prescription dose
  oarDoses?: {
    [oarName: string]: {
      priorDose?: number;      // Actual prior dose to this OAR (Gy)
      priorFractions?: number; // Fractions for prior OAR dose
      plannedDose?: number;    // Actual planned dose to this OAR (Gy)
      plannedFractions?: number; // Fractions for planned OAR dose
    };
  };
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
