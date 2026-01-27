'use client';

import { useState } from 'react';
import InputSection from './InputSection';
import ResultsSection from './ResultsSection';
import { checkOARConstraint, getOARConstraint } from '@/lib/oarConstraints';
import { classifyRPA, getRecommendationsByClass, monthsToYears } from '@/lib/rpaClassification';
import type { PatientData, CalculationResult } from '@/lib/types';
import type { OARResult } from '@/lib/oarConstraints';

export default function Calculator() {
  const [patientData, setPatientData] = useState<PatientData>({
    age: undefined,
    tumorLocation: '',
    performance: undefined,
    priorDose: undefined,
    priorFractions: undefined,
    plannedDose: undefined,
    plannedFractions: undefined,
    timeSinceRT: undefined,
    hadSalvageSurgery: false,
    hasOrganDysfunction: false,
    selectedOARs: [],
  });

  const [results, setResults] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = () => {
    setError(null);

    try {
      // Validate required fields
      if (
        !patientData.priorDose ||
        !patientData.priorFractions ||
        !patientData.plannedDose ||
        !patientData.plannedFractions ||
        patientData.timeSinceRT === undefined ||
        !patientData.selectedOARs ||
        patientData.selectedOARs.length === 0
      ) {
        setError('Please fill in all required fields');
        return;
      }

      // Calculate RPA classification
      const rpaResult = classifyRPA({
        reirradiationIntervalYears: monthsToYears(patientData.timeSinceRT),
        hadSalvageSurgery: patientData.hadSalvageSurgery,
        hasOrganDysfunction: patientData.hasOrganDysfunction,
      });

      // Calculate OAR constraints for selected organs
      const oarResults: OARResult[] = [];
      
      for (const oarName of patientData.selectedOARs) {
        const oarConstraint = getOARConstraint(oarName);
        if (!oarConstraint) {
          console.warn(`OAR constraint not found for: ${oarName}`);
          continue;
        }

        const oarResult = checkOARConstraint(
          oarConstraint,
          patientData.priorDose,
          patientData.priorFractions,
          patientData.plannedDose,
          patientData.plannedFractions,
          patientData.timeSinceRT
        );

        oarResults.push(oarResult);
      }

      // Sort OAR results by tier and warning level
      oarResults.sort((a, b) => {
        if (a.oar.tier !== b.oar.tier) {
          return a.oar.tier - b.oar.tier;
        }
        const warningOrder = { exceeds: 0, caution: 1, safe: 2 };
        return warningOrder[a.warningLevel] - warningOrder[b.warningLevel];
      });

      // Determine overall risk based on RPA class and OAR violations
      let overallRisk: 'Low' | 'Moderate' | 'High';
      const hasExceeds = oarResults.some(r => r.warningLevel === 'exceeds');
      const hasTier1Caution = oarResults.some(r => r.oar.tier === 1 && r.warningLevel === 'caution');

      if (rpaResult.class === 'III' || hasExceeds) {
        overallRisk = 'High';
      } else if (rpaResult.class === 'II' || hasTier1Caution) {
        overallRisk = 'Moderate';
      } else {
        overallRisk = 'Low';
      }

      // Generate clinical interpretation
      let interpretation = '';
      if (overallRisk === 'High') {
        interpretation = 'This case presents HIGH RISK for re-irradiation. ';
        if (hasExceeds) {
          const exceedCount = oarResults.filter(r => r.warningLevel === 'exceeds').length;
          interpretation += `${exceedCount} organ(s) exceed dose constraints. `;
        }
        interpretation += 'Careful multidisciplinary review required before proceeding.';
      } else if (overallRisk === 'Moderate') {
        interpretation = 'This case presents MODERATE RISK for re-irradiation. ';
        interpretation += 'Re-irradiation may be feasible with careful planning and modern techniques.';
      } else {
        interpretation = 'This case presents FAVORABLE characteristics for re-irradiation. ';
        interpretation += 'Proceed with appropriate patient selection and dose constraints.';
      }

      // Get RPA-based recommendations
      const recommendations = getRecommendationsByClass(rpaResult.class);

      // Add OAR-specific recommendations
      if (hasExceeds) {
        const tier1Exceeds = oarResults.filter(r => r.oar.tier === 1 && r.warningLevel === 'exceeds');
        if (tier1Exceeds.length > 0) {
          recommendations.unshift(
            `⚠️ CRITICAL: ${tier1Exceeds.length} Tier 1 organ(s) exceed dose limits - strongly reconsider treatment or modify plan`
          );
        }
      }

      if (hasTier1Caution && !hasExceeds) {
        recommendations.push(
          'Tier 1 organs approaching limits - consider dose reduction or alternative fractionation'
        );
      }

      // Create calculation result
      const calculationResult: CalculationResult = {
        rpa: rpaResult,
        oarResults,
        overallRisk,
        interpretation,
        recommendations,
      };

      setResults(calculationResult);
    } catch (err) {
      console.error('Calculation error:', err);
      setError(
        err instanceof Error ? err.message : 'An error occurred during calculation'
      );
    }
  };

  const handleReset = () => {
    setPatientData({
      age: undefined,
      tumorLocation: '',
      performance: undefined,
      priorDose: undefined,
      priorFractions: undefined,
      plannedDose: undefined,
      plannedFractions: undefined,
      timeSinceRT: undefined,
      hadSalvageSurgery: false,
      hasOrganDysfunction: false,
      selectedOARs: [],
    });
    setResults(null);
    setError(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        <InputSection
          patientData={patientData}
          setPatientData={setPatientData}
          onCalculate={handleCalculate}
          onReset={handleReset}
        />
        
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm font-medium">Error: {error}</p>
          </div>
        )}
        
        {results && !error && (
          <ResultsSection results={results} />
        )}
      </div>
    </div>
  );
}
