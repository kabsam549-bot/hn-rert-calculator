export interface PatientData {
  age: number | undefined;
  priorDose: number | undefined;
  timeSinceRT: number | undefined;
  tumorLocation: string;
  performance: number | undefined;
}

export interface CalculationResult {
  score: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  interpretation: string;
  factors: string[];
  recommendations: string[];
}

export interface RiskFactor {
  name: string;
  weight: number;
  condition: (data: PatientData) => boolean;
}
