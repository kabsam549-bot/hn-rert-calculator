'use client';

import type { CalculationResult } from '@/lib/types';
import type { OARResult } from '@/lib/oarConstraints';

interface ResultsSectionProps {
  results: CalculationResult;
}

export default function ResultsSection({ results }: ResultsSectionProps) {
  const getWarningColor = (warningLevel: 'safe' | 'caution' | 'exceeds') => {
    switch (warningLevel) {
      case 'safe':
        return {
          bg: 'bg-green-50',
          border: 'border-green-300',
          text: 'text-green-800',
          icon: '✓',
          iconColor: 'text-green-600'
        };
      case 'caution':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-300',
          text: 'text-yellow-900',
          icon: '⚠️',
          iconColor: 'text-yellow-600'
        };
      case 'exceeds':
        return {
          bg: 'bg-red-50',
          border: 'border-red-400',
          text: 'text-red-900',
          icon: '⚠️',
          iconColor: 'text-red-600'
        };
    }
  };

  const getRPAClassColor = (rpaClass: 'I' | 'II' | 'III') => {
    switch (rpaClass) {
      case 'I':
        return 'bg-green-100 border-green-500 text-green-900';
      case 'II':
        return 'bg-yellow-100 border-yellow-500 text-yellow-900';
      case 'III':
        return 'bg-red-100 border-red-500 text-red-900';
    }
  };

  // Group OARs by tier
  const tier1OARs = results.oarResults.filter(r => r.oar.tier === 1);
  const tier2OARs = results.oarResults.filter(r => r.oar.tier === 2);
  const tier3OARs = results.oarResults.filter(r => r.oar.tier === 3);

  // Sort each tier by warning level (exceeds > caution > safe)
  const sortByWarning = (a: OARResult, b: OARResult) => {
    const order = { exceeds: 0, caution: 1, safe: 2 };
    return order[a.warningLevel] - order[b.warningLevel];
  };

  tier1OARs.sort(sortByWarning);
  tier2OARs.sort(sortByWarning);
  tier3OARs.sort(sortByWarning);

  const renderOARCard = (oarResult: OARResult) => {
    const colors = getWarningColor(oarResult.warningLevel);
    
    return (
      <div
        key={oarResult.oar.name}
        className={`p-4 rounded-lg border-l-4 ${colors.bg} ${colors.border}`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`text-xl ${colors.iconColor}`}>{colors.icon}</span>
            <h4 className="font-semibold text-gray-900">{oarResult.oar.name}</h4>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-900">
              {oarResult.cumulativeEQD2.toFixed(1)} Gy
            </div>
            <div className={`text-xs font-medium ${colors.text}`}>
              {oarResult.percentOfLimit.toFixed(0)}% of limit
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-700 mb-2">
          <strong>Complication:</strong> {oarResult.oar.complication}
        </div>

        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Prior EQD2:</span>
            <span className="font-medium">{oarResult.doseBreakdown.priorEQD2.toFixed(1)} Gy</span>
          </div>
          <div className="flex justify-between">
            <span>Planned EQD2:</span>
            <span className="font-medium">{oarResult.doseBreakdown.plannedEQD2.toFixed(1)} Gy</span>
          </div>
          <div className="flex justify-between border-t pt-1">
            <span>Cumulative EQD2:</span>
            <span className="font-semibold">{oarResult.doseBreakdown.cumulativeEQD2.toFixed(1)} Gy</span>
          </div>
          <div className="flex justify-between">
            <span>Constraint:</span>
            <span className="font-medium">{oarResult.oar.limitEQD2} Gy (α/β={oarResult.oar.alphaBeta})</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                oarResult.warningLevel === 'exceeds'
                  ? 'bg-red-600'
                  : oarResult.warningLevel === 'caution'
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(oarResult.percentOfLimit, 100)}%` }}
            ></div>
          </div>
        </div>

        <p className="text-xs text-gray-600 mt-2 italic">
          {oarResult.oar.description}
        </p>
      </div>
    );
  };

  return (
    <div className="mt-8 pt-8 border-t-2 border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Assessment Results</h2>
      
      <div className="space-y-8">
        {/* RPA Classification */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            MIRI RPA Prognostic Classification
          </h3>
          <div className={`p-6 rounded-lg border-l-4 ${getRPAClassColor(results.rpa.class)}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-2xl font-bold">Class {results.rpa.class}</h4>
                <p className="text-sm font-medium">{results.rpa.description}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{results.rpa.survivalEstimate2Year.toFixed(1)}%</div>
                <div className="text-xs">2-year survival</div>
                <div className="text-sm mt-1">Median: {results.rpa.medianSurvivalMonths} months</div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-white bg-opacity-50 rounded">
              <p className="text-sm leading-relaxed">
                {results.rpa.interpretation}
              </p>
            </div>

            <div className="mt-4">
              <h5 className="text-sm font-semibold mb-2">Classification Factors:</h5>
              <ul className="space-y-1">
                {results.rpa.classificationFactors.map((factor, idx) => (
                  <li key={idx} className="text-sm flex items-start">
                    <span className="mr-2">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* OAR Constraint Results */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Organ-at-Risk Dose Constraints
          </h3>

          {/* Tier 1: Life-Threatening */}
          {tier1OARs.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded">
                  TIER 1
                </span>
                <h4 className="text-lg font-semibold text-red-800">
                  Life-Threatening Toxicities
                </h4>
              </div>
              <div className="space-y-3">
                {tier1OARs.map(renderOARCard)}
              </div>
            </div>
          )}

          {/* Tier 2: Critical */}
          {tier2OARs.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded">
                  TIER 2
                </span>
                <h4 className="text-lg font-semibold text-orange-800">
                  Critical Toxicities
                </h4>
              </div>
              <div className="space-y-3">
                {tier2OARs.map(renderOARCard)}
              </div>
            </div>
          )}

          {/* Tier 3: Quality of Life */}
          {tier3OARs.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                  TIER 3
                </span>
                <h4 className="text-lg font-semibold text-blue-800">
                  Quality of Life Toxicities
                </h4>
              </div>
              <div className="space-y-3">
                {tier3OARs.map(renderOARCard)}
              </div>
            </div>
          )}
        </div>

        {/* Clinical Recommendations */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
            <span className="mr-2">💡</span>
            Clinical Recommendations
          </h3>
          <ul className="space-y-2">
            {results.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 mr-2 mt-1">→</span>
                <span className="text-blue-900 text-sm">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Medical Disclaimer */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-6">
          <h4 className="font-semibold text-amber-900 mb-2 flex items-center">
            <span className="mr-2">⚠️</span>
            Important Medical Disclaimer
          </h4>
          <p className="text-sm text-amber-900 leading-relaxed">
            This calculator provides educational estimates based on published literature (MIRI study, 
            HyTEC guidelines) and should not replace clinical judgment. Treatment decisions must be 
            made by qualified radiation oncologists considering the complete clinical picture, 
            individual patient factors, detailed treatment planning, and institutional protocols. 
            The dose constraints shown represent general thresholds and may need to be adjusted based 
            on specific clinical circumstances. Always consult with a multidisciplinary tumor board 
            for complex re-irradiation cases.
          </p>
        </div>
      </div>
    </div>
  );
}
