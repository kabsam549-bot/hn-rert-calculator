'use client';

import { useState } from 'react';
import type { CalculationResult } from '@/lib/types';
import type { OARResult } from '@/lib/oarConstraints';
import ExpandableSection from './ExpandableSection';
import ReferencesSection from './ReferencesSection';

interface ResultsSectionProps {
  results: CalculationResult;
}

export default function ResultsSection({ results }: ResultsSectionProps) {
  const [showCalculations, setShowCalculations] = useState(false);

  const getWarningColor = (warningLevel: 'safe' | 'caution' | 'exceeds') => {
    switch (warningLevel) {
      case 'safe':
        return {
          bg: 'bg-white',
          border: 'border-l-4 border-l-[#2d5f3f]',
          text: 'text-gray-700',
          label: 'ACCEPTABLE',
          labelColor: 'text-[#2d5f3f] bg-green-50',
          barColor: 'bg-[#2d5f3f]'
        };
      case 'caution':
        return {
          bg: 'bg-white',
          border: 'border-l-4 border-l-[#9b6b23]',
          text: 'text-gray-700',
          label: 'CAUTION',
          labelColor: 'text-[#9b6b23] bg-amber-50',
          barColor: 'bg-[#9b6b23]'
        };
      case 'exceeds':
        return {
          bg: 'bg-white',
          border: 'border-l-4 border-l-[#8b2635]',
          text: 'text-gray-700',
          label: 'EXCEEDS',
          labelColor: 'text-[#8b2635] bg-red-50',
          barColor: 'bg-[#8b2635]'
        };
    }
  };

  const getRPAClassColor = (rpaClass: 'I' | 'II' | 'III') => {
    switch (rpaClass) {
      case 'I':
        return 'bg-white border-l-4 border-l-[#2d5f3f] border border-gray-300';
      case 'II':
        return 'bg-white border-l-4 border-l-[#9b6b23] border border-gray-300';
      case 'III':
        return 'bg-white border-l-4 border-l-[#8b2635] border border-gray-300';
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
        className={`p-4 rounded-md ${colors.border} ${colors.bg} border border-gray-300 shadow-sm`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900">{oarResult.oar.name}</h4>
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${colors.labelColor}`}>
                {colors.label}
              </span>
            </div>
          </div>
          <div className="text-right ml-4">
            <div className="text-sm font-semibold text-gray-900">
              {oarResult.cumulativeEQD2.toFixed(1)} Gy
            </div>
            <div className="text-xs text-gray-600">
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
          <div className="w-full bg-gray-200 rounded-sm h-1.5">
            <div
              className={`h-1.5 rounded-sm transition-all ${colors.barColor}`}
              style={{ width: `${Math.min(oarResult.percentOfLimit, 100)}%` }}
            ></div>
          </div>
        </div>

        <p className="text-xs text-gray-600 mt-2 italic">
          {oarResult.oar.description}
        </p>

        {/* Calculation Details (if enabled) */}
        {showCalculations && (
          <div className="mt-4 pt-3 border-t border-gray-300">
            <h5 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Calculation Details:</h5>
            <div className="bg-white p-3 rounded border border-gray-200 space-y-2">
              {/* Prior RT Calculation */}
              <div>
                <p className="text-xs font-semibold text-gray-700">Prior RT:</p>
                <p className="font-mono text-xs text-gray-600 ml-2">
                  BED = n × d × [1 + d/(α/β)]
                </p>
                <p className="font-mono text-xs text-gray-600 ml-2">
                  EQD2 = BED / [1 + 2/(α/β)]
                </p>
                <p className="text-xs text-gray-600 ml-2 mt-1">
                  Result: <strong>{oarResult.doseBreakdown.priorEQD2.toFixed(1)} Gy</strong>
                </p>
              </div>

              {/* Planned RT Calculation */}
              <div>
                <p className="text-xs font-semibold text-gray-700">Planned RT:</p>
                <p className="font-mono text-xs text-gray-600 ml-2">
                  BED = n × d × [1 + d/(α/β)]
                </p>
                <p className="font-mono text-xs text-gray-600 ml-2">
                  EQD2 = BED / [1 + 2/(α/β)]
                </p>
                <p className="text-xs text-gray-600 ml-2 mt-1">
                  Result: <strong>{oarResult.doseBreakdown.plannedEQD2.toFixed(1)} Gy</strong>
                </p>
              </div>

              {/* Cumulative */}
              <div className="pt-2 border-t border-gray-300">
                <p className="text-xs font-semibold text-gray-700">Cumulative EQD2:</p>
                <p className="font-mono text-xs text-gray-600 ml-2">
                  {oarResult.doseBreakdown.priorEQD2.toFixed(1)} + {oarResult.doseBreakdown.plannedEQD2.toFixed(1)} 
                  = {oarResult.doseBreakdown.cumulativeEQD2.toFixed(1)} Gy
                </p>
                <p className="text-xs text-gray-600 ml-2 mt-1">
                  Constraint: {oarResult.oar.limitEQD2} Gy (α/β = {oarResult.oar.alphaBeta})
                </p>
                <p className="text-xs text-gray-600 ml-2">
                  Percentage: <strong>{oarResult.percentOfLimit.toFixed(1)}%</strong> of limit
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-8 pt-8 border-t border-gray-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--navy-primary)' }}>Assessment Results</h2>
        
        {/* Calculation Details Toggle */}
        <button
          onClick={() => setShowCalculations(!showCalculations)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-400 rounded-md hover:bg-gray-50 transition-colors"
          style={{ color: 'var(--gray-dark)' }}
        >
          <span className="text-xs">{showCalculations ? '▼' : '▶'}</span>
          <span>{showCalculations ? 'Hide' : 'Show'} Calculation Details</span>
        </button>
      </div>
      
      {showCalculations && (
        <div className="mb-6">
          <ExpandableSection
            title="How to Read These Calculations"
            defaultExpanded={true}
            bgColor="bg-gray-50"
            borderColor="border-gray-400"
            textColor="text-gray-800"
          >
            <div className="space-y-3">
              <p className="text-sm">
                Each organ-at-risk (OAR) result shows both the <strong>raw dose data</strong> and the 
                <strong> calculated biological dose</strong> using the Linear-Quadratic (LQ) model.
              </p>
              
              <div className="bg-white p-3 rounded border border-gray-300">
                <h4 className="font-semibold text-sm mb-2">Step 1: Calculate BED (Biologically Effective Dose)</h4>
                <p className="font-mono text-xs mb-1">BED = n × d × [1 + d/(α/β)]</p>
                <p className="text-xs">
                  This accounts for the biological effect of different fraction sizes. 
                  Each tissue has its own α/β ratio reflecting its sensitivity to fraction size.
                </p>
              </div>

              <div className="bg-white p-3 rounded border border-gray-300">
                <h4 className="font-semibold text-sm mb-2">Step 2: Convert to EQD2</h4>
                <p className="font-mono text-xs mb-1">EQD2 = BED / [1 + 2/(α/β)]</p>
                <p className="text-xs">
                  This normalizes everything to "equivalent 2 Gy per fraction" doses, 
                  allowing direct comparison to published constraints.
                </p>
              </div>

              <div className="bg-white p-3 rounded border border-gray-300">
                <h4 className="font-semibold text-sm mb-2">Step 3: Sum Cumulative EQD2</h4>
                <p className="font-mono text-xs mb-1">Cumulative EQD2 = Prior EQD2 + Planned EQD2</p>
                <p className="text-xs">
                  The cumulative dose is compared against published tolerance thresholds 
                  (from HyTEC, QUANTEC, and institutional data).
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-md border border-gray-300 mt-3">
                <p className="text-xs">
                  <strong>NOTE:</strong> A constraint of "100 Gy" means 100 Gy delivered 
                  at 2 Gy per fraction. If using different fractionation, the calculator converts 
                  your dose to this standard before comparing.
                </p>
              </div>
            </div>
          </ExpandableSection>
        </div>
      )}
      
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
              <div className="mb-3 pb-2 border-b-2 border-[#8b2635]">
                <h4 className="text-base font-semibold uppercase tracking-wide" style={{ color: '#8b2635' }}>
                  Tier 1 | Life-Threatening Toxicities
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
              <div className="mb-3 pb-2 border-b-2 border-[#9b6b23]">
                <h4 className="text-base font-semibold uppercase tracking-wide" style={{ color: '#9b6b23' }}>
                  Tier 2 | Critical Toxicities
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
              <div className="mb-3 pb-2 border-b-2 border-[#2c7873]">
                <h4 className="text-base font-semibold uppercase tracking-wide" style={{ color: '#2c7873' }}>
                  Tier 3 | Quality of Life Toxicities
                </h4>
              </div>
              <div className="space-y-3">
                {tier3OARs.map(renderOARCard)}
              </div>
            </div>
          )}
        </div>

        {/* Clinical Recommendations */}
        <div className="bg-white border border-gray-300 border-l-4 border-l-[#2c7873] rounded-md p-6 shadow-sm">
          <h3 className="text-base font-semibold uppercase tracking-wide mb-4" style={{ color: 'var(--accent-teal)' }}>
            Clinical Recommendations
          </h3>
          <ul className="space-y-2">
            {results.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2 mt-1 font-bold" style={{ color: 'var(--accent-teal)' }}>•</span>
                <span className="text-gray-700 text-sm leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Medical Disclaimer */}
        <div className="bg-white border-2 border-gray-400 rounded-md p-6 shadow-sm">
          <h4 className="font-semibold text-sm uppercase tracking-wide mb-3" style={{ color: 'var(--gray-dark)' }}>
            Important Medical Disclaimer
          </h4>
          <p className="text-sm text-gray-700 leading-relaxed">
            This calculator provides educational estimates based on published literature (MIRI study, 
            HyTEC guidelines) and should not replace clinical judgment. Treatment decisions must be 
            made by qualified radiation oncologists considering the complete clinical picture, 
            individual patient factors, detailed treatment planning, and institutional protocols. 
            The dose constraints shown represent general thresholds and may need to be adjusted based 
            on specific clinical circumstances. Always consult with a multidisciplinary tumor board 
            for complex re-irradiation cases.
          </p>
        </div>

        {/* References Section */}
        <ReferencesSection />
      </div>
    </div>
  );
}
