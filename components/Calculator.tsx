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
    priorCourses: [{ dose: undefined, fractions: undefined }],
    plannedDose: undefined,
    plannedFractions: undefined,
    timeSinceRT: undefined,
    hadSalvageSurgery: false,
    hasOrganDysfunction: false,
    selectedOARs: [],
  });

  const [results, setResults] = useState<CalculationResult | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const accepted = localStorage.getItem('disclaimerAccepted');
    if (accepted === 'true') {
      setDisclaimerAccepted(true);
    }
  }, []);

  const handleAcceptDisclaimer = () => {
    localStorage.setItem('disclaimerAccepted', 'true');
    setDisclaimerAccepted(true);
  };

  const handleLoadSampleCase = () => {
    setPatientData({
      age: 60, // Arbitrary, not used in calc but good for completeness
      tumorLocation: 'Oropharynx',
      performance: 0,
      priorCourses: [{ dose: 70, fractions: 35 }],
      plannedDose: 60,
      plannedFractions: 30,
      timeSinceRT: 36,
      hadSalvageSurgery: true,
      hasOrganDysfunction: false,
      selectedOARs: ['Spinal cord', 'Brainstem', 'Carotid vessels', 'Parotid gland'],
    });
  };

  // Manual calculate function - called when user clicks Calculate button
  const handleCalculate = () => {
    if (isValidForCalculation(patientData)) {
      calculateResults(patientData);
    }
  };

  const isValidForCalculation = (data: PatientData) => {
    const isPriorValid = data.priorCourses && 
      data.priorCourses.length > 0 && 
      data.priorCourses.every(c => 
        c.dose !== undefined && c.dose > 0 && 
        c.fractions !== undefined && c.fractions > 0
      );

    return (
      isPriorValid &&
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
      
      // Clean up prior courses for calculation (ensure no undefineds)
      const cleanPriorCourses = data.priorCourses.map(c => ({
        dose: c.dose!,
        fractions: c.fractions!
      }));

      for (const oarName of data.selectedOARs) {
        const oarConstraint = getOARConstraint(oarName);
        if (!oarConstraint) continue;

        const oarResult = checkOARConstraint(
          oarConstraint,
          cleanPriorCourses,
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
        interpretation = 'High Risk Scenario. ';
        if (hasExceeds) {
          const exceedCount = oarResults.filter(r => r.warningLevel === 'exceeds').length;
          interpretation += `${exceedCount} organ(s) exceed reference dose constraints. `;
        }
        interpretation += 'Comprehensive review recommended.';
      } else if (overallRisk === 'Moderate') {
        interpretation = 'Moderate Risk Scenario. ';
        interpretation += 'Feasible with careful planning.';
      } else {
        interpretation = 'Favorable Risk Profile. ';
        interpretation += 'Proceed with standard protocols.';
      }

      // Recommendations
      const recommendations = getRecommendationsByClass(rpaResult.class);
      if (hasExceeds) {
        const tier1Exceeds = oarResults.filter(r => r.oar.tier === 1 && r.warningLevel === 'exceeds');
        if (tier1Exceeds.length > 0) {
          recommendations.unshift(
            `Caution: ${tier1Exceeds.length} Tier 1 organ(s) exceed absolute reference limits.`
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
      priorCourses: [{ dose: undefined, fractions: undefined }],
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
    <div className="relative">
      {/* Disclaimer Modal */}
      {!disclaimerAccepted && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-8 text-center border-t-4 border-teal-600">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Important Notice</h2>
            <div className="prose prose-sm text-gray-600 mb-8 text-left bg-gray-50 p-4 rounded border border-gray-100">
              <p className="mb-2">
                This tool is intended solely for <strong>educational and research purposes</strong>. 
                It is not validated for clinical use and must not be used to guide patient care decisions.
              </p>
              <p>
                By proceeding, you acknowledge that this tool does not constitute medical advice and 
                should not replace professional clinical judgment.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.href = 'about:blank'}
                className="px-6 py-2.5 rounded text-gray-600 hover:bg-gray-100 transition-colors font-medium border border-gray-200"
              >
                Exit
              </button>
              <button
                onClick={handleAcceptDisclaimer}
                className="px-6 py-2.5 rounded bg-teal-primary hover:bg-teal-dark text-white font-medium transition-all shadow-lg shadow-teal-500/30"
              >
                I Understand - Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 transition-all duration-500 ${!disclaimerAccepted ? 'blur-md opacity-30 pointer-events-none' : ''}`}>
        
        {/* Intro & Sample Case Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-6">
          <div className="max-w-3xl">
            <p className="text-lg text-gray-600 leading-relaxed">
              Enter prior and planned radiation parameters to assess re-irradiation feasibility. 
              Select organs at risk to evaluate cumulative dose constraints.
            </p>
          </div>
          <button 
            onClick={handleLoadSampleCase}
            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-teal-primary text-teal-700 font-semibold hover:bg-teal-50 transition-colors"
            title="Sample: Favorable re-irradiation scenario (RPA Class I)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
            </svg>
            Load Sample Case
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Inputs (40%) */}
          <div className="w-full lg:w-[40%] flex-shrink-0">
            <InputSection
              patientData={patientData}
              setPatientData={setPatientData}
              onReset={handleReset}
              onCalculate={handleCalculate}
              isReadyToCalculate={isValidForCalculation(patientData)}
            />
          </div>

          {/* Right Column: Results (60%) */}
          <div className="w-full lg:w-[60%]">
            <div className="lg:sticky lg:top-8 transition-all duration-300">
              {results ? (
                <ResultsSection results={results} />
              ) : (
                <div className="h-full min-h-[400px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-teal-50/50 text-teal-800/60">
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg font-medium">Awaiting Data</p>
                    <p className="text-sm">Complete the steps on the left to generate assessment</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
