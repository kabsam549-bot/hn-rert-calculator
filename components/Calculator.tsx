'use client';

import { useState, useEffect } from 'react';
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Effect to auto-calculate when valid data is present
  useEffect(() => {
    if (isValidForCalculation(patientData)) {
      calculateResults(patientData);
    } else {
      setResults(null);
    }
  }, [patientData]);

  const isValidForCalculation = (data: PatientData) => {
    return (
      data.priorDose !== undefined &&
      data.priorFractions !== undefined &&
      data.plannedDose !== undefined &&
      data.plannedFractions !== undefined &&
      data.timeSinceRT !== undefined &&
      (data.selectedOARs?.length ?? 0) > 0
    );
  };

  const calculateResults = (data: PatientData) => {
    try {
      // Calculate RPA classification
      const rpaResult = classifyRPA({
        reirradiationIntervalYears: monthsToYears(data.timeSinceRT!),
        hadSalvageSurgery: data.hadSalvageSurgery,
        hasOrganDysfunction: data.hasOrganDysfunction,
      });

      // Calculate OAR constraints
      const oarResults: OARResult[] = [];
      
      for (const oarName of data.selectedOARs) {
        const oarConstraint = getOARConstraint(oarName);
        if (!oarConstraint) continue;

        const oarResult = checkOARConstraint(
          oarConstraint,
          data.priorDose!,
          data.priorFractions!,
          data.plannedDose!,
          data.plannedFractions!,
          data.timeSinceRT!
        );

        oarResults.push(oarResult);
      }

      // Sort OAR results
      oarResults.sort((a, b) => {
        if (a.oar.tier !== b.oar.tier) return a.oar.tier - b.oar.tier;
        const warningOrder = { exceeds: 0, caution: 1, safe: 2 };
        return warningOrder[a.warningLevel] - warningOrder[b.warningLevel];
      });

      // Determine overall risk
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

      // Interpretation
      let interpretation = '';
      if (overallRisk === 'High') {
        interpretation = 'HIGH RISK CASE. ';
        if (hasExceeds) {
          const exceedCount = oarResults.filter(r => r.warningLevel === 'exceeds').length;
          interpretation += `${exceedCount} organ(s) exceed dose constraints. `;
        }
        interpretation += 'Multidisciplinary review mandatory.';
      } else if (overallRisk === 'Moderate') {
        interpretation = 'MODERATE RISK CASE. ';
        interpretation += 'Feasible with careful planning.';
      } else {
        interpretation = 'FAVORABLE RISK PROFILE. ';
        interpretation += 'Proceed with standard protocols.';
      }

      // Recommendations
      const recommendations = getRecommendationsByClass(rpaResult.class);
      if (hasExceeds) {
        const tier1Exceeds = oarResults.filter(r => r.oar.tier === 1 && r.warningLevel === 'exceeds');
        if (tier1Exceeds.length > 0) {
          recommendations.unshift(
            `CRITICAL: ${tier1Exceeds.length} Tier 1 organ(s) exceed absolute limits.`
          );
        }
      }

      setResults({
        rpa: rpaResult,
        oarResults,
        overallRisk,
        interpretation,
        recommendations,
      });
    } catch (err) {
      console.error(err);
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
  };

  if (!isClient) return null;

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Inputs (40%) */}
        <div className="w-full lg:w-[40%] flex-shrink-0">
          <InputSection
            patientData={patientData}
            setPatientData={setPatientData}
            onReset={handleReset}
          />
        </div>

        {/* Right Column: Results (60%) */}
        <div className="w-full lg:w-[60%]">
          <div className="lg:sticky lg:top-8 transition-all duration-300">
            {results ? (
              <ResultsSection results={results} />
            ) : (
              <div className="h-full min-h-[400px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-white/50 text-gray-400">
                <div className="text-center">
                  <p className="text-lg font-medium">Awaiting Clinical Data</p>
                  <p className="text-sm">Complete the input form to generate assessment</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
