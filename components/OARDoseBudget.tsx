'use client';

import { useMemo, useState } from 'react';
import {
  OAR_BUDGET_DATA,
  calculateOARBudget,
  getRiskColorClass,
  type OARBudgetInput,
  type OARBudgetResult,
  type OARBudgetData,
} from '@/lib/oarDoseBudget';
import { useEditableContent } from '@/lib/hooks/useEditableContent';
import Tooltip from './Tooltip';

interface OARInput {
  oar: OARBudgetData;
  priorDose?: number;
  priorFractions?: number;
  timeSinceRT?: number;
}

export default function OARDoseBudget() {
  const { content } = useEditableContent();
  const [selectedOARs, setSelectedOARs] = useState<OARInput[]>([]);
  const [results, setResults] = useState<OARBudgetResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const availableOARData = useMemo<OARBudgetData[]>(() => {
    if (!content?.oarConstraints?.length) {
      return OAR_BUDGET_DATA;
    }
    return content.oarConstraints.map((oar) => ({
      name: oar.name,
      lifetimeToleranceEQD2: oar.limitEQD2,
      alphaBeta: oar.alphaBeta,
      complication: oar.complication,
    }));
  }, [content]);

  const handleAddOAR = (oar: OARBudgetData) => {
    if (selectedOARs.some(item => item.oar.name === oar.name)) {
      return; // Already added
    }
    setSelectedOARs([...selectedOARs, { oar, priorDose: undefined, priorFractions: undefined, timeSinceRT: undefined }]);
    setShowResults(false); // Hide results when adding new OAR
  };

  const handleRemoveOAR = (oarName: string) => {
    setSelectedOARs(selectedOARs.filter(item => item.oar.name !== oarName));
    setShowResults(false);
  };

  const handleUpdateOAR = (oarName: string, field: 'priorDose' | 'priorFractions' | 'timeSinceRT', value: number | undefined) => {
    setSelectedOARs(selectedOARs.map(item => 
      item.oar.name === oarName 
        ? { ...item, [field]: value }
        : item
    ));
    setShowResults(false);
  };

  const handleCalculate = () => {
    const inputs: OARBudgetInput[] = selectedOARs
      .filter(item => 
        item.priorDose !== undefined && 
        item.priorFractions !== undefined && 
        item.timeSinceRT !== undefined &&
        item.priorDose > 0 &&
        item.priorFractions > 0 &&
        item.timeSinceRT >= 0
      )
      .map(item => ({
        oar: item.oar,
        priorDose: item.priorDose!,
        priorFractions: item.priorFractions!,
        timeSinceRT: item.timeSinceRT!,
      }));

    if (inputs.length === 0) {
      alert('Please enter valid dose, fractions, and time for at least one OAR');
      return;
    }

    const calculatedResults = inputs.map(input => calculateOARBudget(input));
    
    // Sort by risk level (critical first)
    const riskOrder = { critical: 0, warning: 1, caution: 2, safe: 3 };
    calculatedResults.sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel]);
    
    setResults(calculatedResults);
    setShowResults(true);
  };

  const handleReset = () => {
    setSelectedOARs([]);
    setResults([]);
    setShowResults(false);
  };

  const isReadyToCalculate = selectedOARs.some(item => 
    item.priorDose !== undefined && 
    item.priorDose > 0 &&
    item.priorFractions !== undefined && 
    item.priorFractions > 0 &&
    item.timeSinceRT !== undefined &&
    item.timeSinceRT >= 0
  );

  const renderOARSelector = () => {
    const availableOARs = availableOARData.filter(
      oar => !selectedOARs.some(item => item.oar.name === oar.name)
    );

    if (availableOARs.length === 0) {
      return (
        <div className="text-center py-4 text-sm text-gray-500">
          All available OARs have been added
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {availableOARs.map(oar => (
          <button
            key={oar.name}
            onClick={() => handleAddOAR(oar)}
            className="text-left p-3 border-2 border-dashed border-teal-200 rounded-md hover:border-teal-400 hover:bg-teal-50 transition-all text-sm"
          >
            <div className="font-medium text-gray-900">{oar.name}</div>
            <div className="text-xs text-gray-500 mt-0.5">
              Tolerance: {oar.lifetimeToleranceEQD2} Gy
            </div>
          </button>
        ))}
      </div>
    );
  };

  const renderOARInputCard = (item: OARInput) => {
    const isComplete = 
      item.priorDose !== undefined && 
      item.priorFractions !== undefined && 
      item.timeSinceRT !== undefined;

    return (
      <div key={item.oar.name} className="bg-white border-2 border-gray-200 rounded-lg p-4 relative">
        {/* Remove button */}
        <button
          onClick={() => handleRemoveOAR(item.oar.name)}
          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
          title="Remove OAR"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* OAR Header */}
        <div className="mb-3 pr-8">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-gray-900">{item.oar.name}</h4>
            {isComplete && (
              <span className="text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Lifetime tolerance: <span className="font-semibold">{item.oar.lifetimeToleranceEQD2} Gy EQD2</span>
            {' • '}
            Risk: {item.oar.complication}
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-3 gap-3">
          {/* Prior Dose */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">
              Prior Dose
              <Tooltip content="Actual dose THIS organ received (not prescription dose)" />
            </label>
            <div className="relative">
              <input
                type="number"
                value={item.priorDose ?? ''}
                onChange={(e) => handleUpdateOAR(item.oar.name, 'priorDose', e.target.value === '' ? undefined : Number(e.target.value))}
                className="w-full px-2 py-2 pr-10 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="0"
                min="0"
                max="200"
                step="0.1"
              />
              <span className="absolute right-2 top-2 text-xs text-gray-500 pointer-events-none">Gy</span>
            </div>
          </div>

          {/* Prior Fractions */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">
              Fractions
              <Tooltip content="Number of fractions for prior treatment" />
            </label>
            <div className="relative">
              <input
                type="number"
                value={item.priorFractions ?? ''}
                onChange={(e) => handleUpdateOAR(item.oar.name, 'priorFractions', e.target.value === '' ? undefined : Number(e.target.value))}
                className="w-full px-2 py-2 pr-10 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="0"
                min="1"
                max="99"
                step="1"
              />
              <span className="absolute right-2 top-2 text-xs text-gray-500 pointer-events-none">fx</span>
            </div>
          </div>

          {/* Time Since RT */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">
              Time Since RT
              <Tooltip content="Months since completion of prior treatment (affects tissue recovery)" />
            </label>
            <div className="relative">
              <input
                type="number"
                value={item.timeSinceRT ?? ''}
                onChange={(e) => handleUpdateOAR(item.oar.name, 'timeSinceRT', e.target.value === '' ? undefined : Number(e.target.value))}
                className="w-full px-2 py-2 pr-10 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="0"
                min="0"
                max="999"
                step="1"
              />
              <span className="absolute right-2 top-2 text-xs text-gray-500 pointer-events-none">mo</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderResultCard = (result: OARBudgetResult) => {
    const colors = getRiskColorClass(result.riskLevel);
    const riskLabel = result.riskLevel.toUpperCase();

    return (
      <div key={result.oar.name} className={`${colors.bg} border-2 ${colors.border} rounded-lg p-5`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="text-lg font-bold text-gray-900">{result.oar.name}</h4>
            <p className="text-xs text-gray-600 mt-0.5">Risk: {result.oar.complication}</p>
          </div>
          <span className={`${colors.badge} px-3 py-1 rounded-full text-xs font-bold`}>
            {riskLabel}
          </span>
        </div>

        {/* Calculation Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-300">
          <div>
            <div className="text-xs text-gray-600 mb-1">Prior EQD2</div>
            <div className="text-lg font-bold text-gray-900">{result.priorEQD2.toFixed(1)} Gy</div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Recovery Factor</div>
            <div className="text-lg font-bold text-gray-900">{result.recoveryPercent.toFixed(0)}%</div>
            <div className="text-xs text-gray-500 mt-0.5">
              {result.recoveryPercent === 0 && '(<6 months)'}
              {result.recoveryPercent === 25 && '(6-12 months)'}
              {result.recoveryPercent === 40 && '(12-24 months)'}
              {result.recoveryPercent === 50 && '(>24 months)'}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Effective Prior</div>
            <div className="text-lg font-bold text-gray-900">{result.effectivePriorEQD2.toFixed(1)} Gy</div>
            <div className="text-xs text-gray-500 mt-0.5">(after recovery)</div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Lifetime Tolerance</div>
            <div className="text-lg font-bold text-gray-900">{result.oar.lifetimeToleranceEQD2} Gy</div>
          </div>
        </div>

        {/* Remaining Budget - Prominently Displayed */}
        <div className="bg-white bg-opacity-70 rounded-lg p-4 mb-4">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1 font-semibold">REMAINING DOSE BUDGET</div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {result.remainingBudgetEQD2.toFixed(1)} Gy
            </div>
            <div className="text-sm text-gray-600">
              EQD2 ({result.percentRemaining.toFixed(1)}% of lifetime tolerance)
            </div>
            
            {/* Visual Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mt-3 overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  result.riskLevel === 'safe' ? 'bg-green-500' :
                  result.riskLevel === 'caution' ? 'bg-yellow-500' :
                  result.riskLevel === 'warning' ? 'bg-orange-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, result.percentRemaining)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Physical Dose Budgets Table */}
        <div className="mb-4">
          <h5 className="text-xs font-bold text-gray-700 mb-2 uppercase">Physical Dose Budget by Fractionation</h5>
          <div className="bg-white bg-opacity-50 rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 bg-opacity-70">
                  <th className="text-left py-2 px-3 font-bold text-gray-700">Fractions</th>
                  <th className="text-left py-2 px-3 font-bold text-gray-700">Total Dose</th>
                  <th className="text-left py-2 px-3 font-bold text-gray-700">Dose/Fx</th>
                  <th className="text-left py-2 px-3 font-bold text-gray-700">Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-2 px-3 font-medium">2 fx</td>
                  <td className="py-2 px-3">{result.physicalDoseBudgets.twoFractions.toFixed(1)} Gy</td>
                  <td className="py-2 px-3">{(result.physicalDoseBudgets.twoFractions / 2).toFixed(1)} Gy</td>
                  <td className="py-2 px-3 text-xs text-gray-600">Hypofractionated</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">3 fx</td>
                  <td className="py-2 px-3">{result.physicalDoseBudgets.threeFractions.toFixed(1)} Gy</td>
                  <td className="py-2 px-3">{(result.physicalDoseBudgets.threeFractions / 3).toFixed(1)} Gy</td>
                  <td className="py-2 px-3 text-xs text-gray-600">Phan newer protocol</td>
                </tr>
                <tr className="bg-teal-50 bg-opacity-30">
                  <td className="py-2 px-3 font-medium">4 fx</td>
                  <td className="py-2 px-3 font-semibold">{result.physicalDoseBudgets.fourFractions.toFixed(1)} Gy</td>
                  <td className="py-2 px-3 font-semibold">{(result.physicalDoseBudgets.fourFractions / 4).toFixed(1)} Gy</td>
                  <td className="py-2 px-3 text-xs font-semibold text-teal-700">Phan standard (32-36 Gy)</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">5 fx</td>
                  <td className="py-2 px-3">{result.physicalDoseBudgets.fiveFractions.toFixed(1)} Gy</td>
                  <td className="py-2 px-3">{(result.physicalDoseBudgets.fiveFractions / 5).toFixed(1)} Gy</td>
                  <td className="py-2 px-3 text-xs text-gray-600">Alternative scheme</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Warning Message */}
        {result.warningMessage && (
          <div className={`${
            result.riskLevel === 'critical' ? 'bg-red-100 border-red-400 text-red-800' :
            result.riskLevel === 'warning' ? 'bg-orange-100 border-orange-400 text-orange-800' :
            'bg-yellow-100 border-yellow-400 text-yellow-800'
          } border-2 rounded-lg p-3 text-sm font-medium`}>
            {result.warningMessage}
          </div>
        )}

        {/* Special Note */}
        {result.oar.specialNote && (
          <div className="mt-3 bg-blue-50 border border-blue-300 rounded-lg p-3 text-xs text-blue-800">
            <strong>Note:</strong> {result.oar.specialNote}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg p-6 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">OAR Dose Budget Calculator</h1>
        <p className="text-teal-100">
          Calculate remaining radiation dose tolerance for organs at risk during re-irradiation planning
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div className="flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">How to use:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Select organs at risk from the list below</li>
              <li>Enter the <strong>actual prior dose</strong> each organ received (not prescription dose)</li>
              <li>Enter prior fractions and time since treatment</li>
              <li>Click Calculate to see remaining dose budgets for common re-RT fractionation schemes</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Show Results or Input Mode */}
      {!showResults ? (
        <>
          {/* OAR Input Section */}
          {selectedOARs.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Selected Organs ({selectedOARs.length})</h3>
                <button
                  onClick={handleReset}
                  className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                >
                  Clear All
                </button>
              </div>
              {selectedOARs.map(item => renderOARInputCard(item))}
            </div>
          )}

          {/* Add More OARs */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              {selectedOARs.length === 0 ? 'Select Organs at Risk' : 'Add More OARs'}
            </h3>
            {renderOARSelector()}
          </div>

          {/* Calculate Button */}
          <div className="sticky bottom-6 z-10">
            <button
              onClick={handleCalculate}
              disabled={!isReadyToCalculate}
              className={`w-full py-4 text-lg font-bold uppercase tracking-wider rounded-lg transition-all shadow-lg ${
                isReadyToCalculate 
                  ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/30 cursor-pointer' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
              }`}
            >
              {isReadyToCalculate ? (
                <span className="flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  CALCULATE DOSE BUDGETS
                </span>
              ) : (
                'ENTER DOSE DATA TO CALCULATE'
              )}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Results Section */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Dose Budget Results</h2>
            <button
              onClick={() => setShowResults(false)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
            >
              ← Back to Input
            </button>
          </div>

          {/* Summary Alert */}
          <div className={`rounded-lg p-4 ${
            results.some(r => r.riskLevel === 'critical') 
              ? 'bg-red-100 border-2 border-red-400' 
              : results.some(r => r.riskLevel === 'warning')
              ? 'bg-orange-100 border-2 border-orange-400'
              : 'bg-green-100 border-2 border-green-400'
          }`}>
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 flex-shrink-0 ${
                results.some(r => r.riskLevel === 'critical') ? 'text-red-600' :
                results.some(r => r.riskLevel === 'warning') ? 'text-orange-600' :
                'text-green-600'
              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className={`text-sm font-medium ${
                results.some(r => r.riskLevel === 'critical') ? 'text-red-900' :
                results.some(r => r.riskLevel === 'warning') ? 'text-orange-900' :
                'text-green-900'
              }`}>
                {results.some(r => r.riskLevel === 'critical') && (
                  <p><strong>CRITICAL:</strong> Some organs have minimal remaining tolerance. Exercise extreme caution.</p>
                )}
                {!results.some(r => r.riskLevel === 'critical') && results.some(r => r.riskLevel === 'warning') && (
                  <p><strong>WARNING:</strong> Some organs are approaching tolerance limits. Careful dose planning required.</p>
                )}
                {!results.some(r => r.riskLevel === 'critical') && !results.some(r => r.riskLevel === 'warning') && (
                  <p><strong>SAFE:</strong> All evaluated organs have reasonable dose budget remaining.</p>
                )}
              </div>
            </div>
          </div>

          {/* Result Cards */}
          <div className="space-y-6">
            {results.map(result => renderResultCard(result))}
          </div>

          {/* Back Button (Bottom) */}
          <div className="text-center pt-4">
            <button
              onClick={() => setShowResults(false)}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold transition-colors"
            >
              ← Modify Inputs
            </button>
          </div>
        </>
      )}

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 text-xs text-gray-600">
        <p className="font-semibold mb-2">⚠️ Clinical Disclaimer</p>
        <p>
          This calculator provides estimates based on standard tissue recovery models and cumulative dose constraints.
          Actual tissue recovery varies by organ type, dose distribution, patient factors, and clinical context.
          Results should be used as a <strong>planning guide only</strong> and not as absolute limits.
          All re-irradiation decisions must be made by qualified radiation oncologists considering the full clinical picture.
        </p>
      </div>
    </div>
  );
}
