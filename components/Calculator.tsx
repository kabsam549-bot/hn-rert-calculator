'use client';

import { useState } from 'react';
import InputSection from './InputSection';
import ResultsSection from './ResultsSection';
import { calculateRiskScore } from '@/lib/calculations';
import type { PatientData, CalculationResult } from '@/lib/types';

export default function Calculator() {
  const [patientData, setPatientData] = useState<PatientData>({
    age: undefined,
    priorDose: undefined,
    timeSinceRT: undefined,
    tumorLocation: '',
    performance: undefined,
  });

  const [results, setResults] = useState<CalculationResult | null>(null);

  const handleCalculate = () => {
    const calculatedResults = calculateRiskScore(patientData);
    setResults(calculatedResults);
  };

  const handleReset = () => {
    setPatientData({
      age: undefined,
      priorDose: undefined,
      timeSinceRT: undefined,
      tumorLocation: '',
      performance: undefined,
    });
    setResults(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        <InputSection
          patientData={patientData}
          setPatientData={setPatientData}
          onCalculate={handleCalculate}
          onReset={handleReset}
        />
        
        {results && (
          <ResultsSection results={results} />
        )}
      </div>
    </div>
  );
}
