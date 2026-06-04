'use client';

import { useMemo, useState } from 'react';
import {
  OAR_BUDGET_DATA,
  calculateOARBudget,
  eqd2ToPhysicalDose,
  getOARBudgetData,
  type OARBudgetInput,
  type OARBudgetResult,
  type OARBudgetData,
  type PriorRTCourse,
} from '@/lib/oarDoseBudget';
import { getConstraintReference } from '@/lib/constraintReferences';
import { useEditableContent } from '@/lib/hooks/useEditableContent';
import Tooltip from './Tooltip';

interface OARInput {
  oar: OARBudgetData;
  priorDose?: number;
  priorFractions?: number;
  timeSinceRT?: number;
  additionalCourses: { dose?: number; fractions?: number; timeSinceRT?: number }[];
  customAlphaBeta?: number;
  customLifetimeTolerance?: number;
}

type DoseMode = 'conservative' | 'recovery';

function getBudgetStatus(percentRemaining: number, remainingEQD2: number) {
  if (remainingEQD2 <= 0) {
    return {
      label: 'Exceeded',
      dot: 'bg-red-500',
      text: 'text-red-700',
      bar: 'bg-red-500',
    };
  }

  if (percentRemaining <= 15) {
    return {
      label: 'Low',
      dot: 'bg-orange-500',
      text: 'text-orange-700',
      bar: 'bg-orange-500',
    };
  }

  if (percentRemaining <= 35) {
    return {
      label: 'Limited',
      dot: 'bg-amber-500',
      text: 'text-amber-700',
      bar: 'bg-amber-500',
    };
  }

  return {
    label: 'Available',
    dot: 'bg-green-500',
    text: 'text-green-700',
    bar: 'bg-green-500',
  };
}

export default function OARDoseBudget() {
  const { content } = useEditableContent();
  const [selectedOARs, setSelectedOARs] = useState<OARInput[]>([]);
  const [results, setResults] = useState<OARBudgetResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [customFractions, setCustomFractions] = useState<Record<string, number | undefined>>({});
  const [doseMode, setDoseMode] = useState<DoseMode>('conservative');

  const availableOARData = useMemo<OARBudgetData[]>(() => {
    if (!content?.oarConstraints?.length) {
      return OAR_BUDGET_DATA;
    }
    return content.oarConstraints.map((oar) => {
      const staticOAR = getOARBudgetData(oar.name);

      return {
        name: oar.name,
        lifetimeToleranceEQD2: oar.limitEQD2,
        alphaBeta: oar.alphaBeta,
        complication: oar.complication,
        specialNote: staticOAR?.specialNote,
      };
    });
  }, [content]);

  const handleAddOAR = (oar: OARBudgetData) => {
    if (selectedOARs.some(item => item.oar.name === oar.name)) {
      return; // Already added
    }
    setSelectedOARs([...selectedOARs, { oar, additionalCourses: [] }]);
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
      .map(item => {
        let oar = item.oar;
        if (item.customAlphaBeta !== undefined) {
          oar = { ...oar, alphaBeta: item.customAlphaBeta };
        }
        if (item.customLifetimeTolerance !== undefined && item.customLifetimeTolerance > 0) {
          oar = { ...oar, lifetimeToleranceEQD2: item.customLifetimeTolerance };
        }
        return ({
        oar,
        priorDose: item.priorDose!,
        priorFractions: item.priorFractions!,
        timeSinceRT: item.timeSinceRT!,
        additionalCourses: item.additionalCourses
          .filter(c => c.dose !== undefined && c.fractions !== undefined && c.timeSinceRT !== undefined && c.dose > 0 && c.fractions > 0)
          .map(c => ({ dose: c.dose!, fractions: c.fractions!, timeSinceRT: c.timeSinceRT! } as PriorRTCourse)),
        });
      });

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

  const completedOARCount = selectedOARs.filter(item =>
    item.priorDose !== undefined &&
    item.priorDose > 0 &&
    item.priorFractions !== undefined &&
    item.priorFractions > 0 &&
    item.timeSinceRT !== undefined &&
    item.timeSinceRT >= 0
  ).length;

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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {availableOARs.map(oar => (
          <button
            key={oar.name}
            onClick={() => handleAddOAR(oar)}
            className="group flex min-h-[52px] items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-sm shadow-sm transition-all hover:border-teal-300 hover:bg-teal-50"
          >
            <span className="font-medium text-gray-900">{oar.name}</span>
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors group-hover:bg-teal-600 group-hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </span>
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
      <div key={item.oar.name} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${isComplete ? 'bg-green-500' : 'bg-gray-300'}`} />
              <h4 className="truncate text-base font-bold text-gray-900">{item.oar.name}</h4>
            </div>
          </div>
          <button
            onClick={() => handleRemoveOAR(item.oar.name)}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
            title="Remove OAR"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-gray-50 p-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Tol</div>
            <div className="mt-0.5 text-sm font-bold text-gray-900">
              {item.customLifetimeTolerance ?? item.oar.lifetimeToleranceEQD2}
              <span className="ml-0.5 text-[10px] font-semibold text-gray-500">Gy</span>
            </div>
          </div>
          <div className="rounded-xl bg-gray-50 p-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wide text-gray-500">&#945;/&#946;</div>
            <div className="mt-0.5 text-sm font-bold text-gray-900">
              {item.customAlphaBeta ?? item.oar.alphaBeta}
              <span className="ml-0.5 text-[10px] font-semibold text-gray-500">Gy</span>
            </div>
          </div>
          <div className="min-w-0 rounded-xl bg-gray-50 p-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Risk</div>
            <div className="mt-0.5 truncate text-xs font-semibold text-gray-800" title={item.oar.complication}>
              {item.oar.complication}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-1">
              Dose
              <Tooltip content="Actual dose THIS organ received (not prescription dose)" />
            </label>
            <div className="relative">
              <input
                type="number"
                value={item.priorDose ?? ''}
                onChange={(e) => handleUpdateOAR(item.oar.name, 'priorDose', e.target.value === '' ? undefined : Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-2 py-2.5 pr-8 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
                placeholder="0"
                min="0"
                max="200"
                step="0.1"
              />
              <span className="absolute right-2 top-2.5 text-xs text-gray-500 pointer-events-none">Gy</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-1">
              Fx
              <Tooltip content="Number of fractions for prior treatment" />
            </label>
            <div className="relative">
              <input
                type="number"
                value={item.priorFractions ?? ''}
                onChange={(e) => handleUpdateOAR(item.oar.name, 'priorFractions', e.target.value === '' ? undefined : Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-2 py-2.5 pr-8 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
                placeholder="0"
                min="1"
                max="99"
                step="1"
              />
              <span className="absolute right-2 top-2.5 text-xs text-gray-500 pointer-events-none">fx</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-1">
              Months
              <Tooltip content="Months since completion of prior treatment (affects tissue recovery)" />
            </label>
            <div className="relative">
              <input
                type="number"
                value={item.timeSinceRT ?? ''}
                onChange={(e) => handleUpdateOAR(item.oar.name, 'timeSinceRT', e.target.value === '' ? undefined : Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-2 py-2.5 pr-8 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
                placeholder="0"
                min="0"
                max="999"
                step="1"
              />
              <span className="absolute right-2 top-2.5 text-xs text-gray-500 pointer-events-none">mo</span>
            </div>
          </div>
        </div>

        {item.additionalCourses.map((course, idx) => (
          <div key={idx} className="mt-3 rounded-xl border border-amber-100 bg-amber-50/60 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-amber-800">Prior course {idx + 2}</span>
              <button
                onClick={() => {
                  const updated = [...selectedOARs];
                  const oarIdx = updated.findIndex(o => o.oar.name === item.oar.name);
                  if (oarIdx >= 0) {
                    updated[oarIdx] = {
                      ...updated[oarIdx],
                      additionalCourses: updated[oarIdx].additionalCourses.filter((_, i) => i !== idx)
                    };
                    setSelectedOARs(updated);
                    setShowResults(false);
                  }
                }}
                className="text-xs font-semibold text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="relative">
                <input
                  type="number"
                  value={course.dose ?? ''}
                  onChange={(e) => {
                    const updated = [...selectedOARs];
                    const oarIdx = updated.findIndex(o => o.oar.name === item.oar.name);
                    if (oarIdx >= 0) {
                      const courses = [...updated[oarIdx].additionalCourses];
                      courses[idx] = { ...courses[idx], dose: e.target.value === '' ? undefined : Number(e.target.value) };
                      updated[oarIdx] = { ...updated[oarIdx], additionalCourses: courses };
                      setSelectedOARs(updated);
                      setShowResults(false);
                    }
                  }}
                  className="w-full rounded-lg border border-amber-200 bg-white px-2 py-2 pr-8 text-xs focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
                  placeholder="Gy"
                  min="0"
                  max="200"
                />
                <span className="absolute right-1.5 top-1.5 text-[10px] text-gray-400 pointer-events-none">Gy</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={course.fractions ?? ''}
                  onChange={(e) => {
                    const updated = [...selectedOARs];
                    const oarIdx = updated.findIndex(o => o.oar.name === item.oar.name);
                    if (oarIdx >= 0) {
                      const courses = [...updated[oarIdx].additionalCourses];
                      courses[idx] = { ...courses[idx], fractions: e.target.value === '' ? undefined : Number(e.target.value) };
                      updated[oarIdx] = { ...updated[oarIdx], additionalCourses: courses };
                      setSelectedOARs(updated);
                      setShowResults(false);
                    }
                  }}
                  className="w-full rounded-lg border border-amber-200 bg-white px-2 py-2 pr-8 text-xs focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
                  placeholder="fx"
                  min="1"
                  max="99"
                />
                <span className="absolute right-1.5 top-1.5 text-[10px] text-gray-400 pointer-events-none">fx</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={course.timeSinceRT ?? ''}
                  onChange={(e) => {
                    const updated = [...selectedOARs];
                    const oarIdx = updated.findIndex(o => o.oar.name === item.oar.name);
                    if (oarIdx >= 0) {
                      const courses = [...updated[oarIdx].additionalCourses];
                      courses[idx] = { ...courses[idx], timeSinceRT: e.target.value === '' ? undefined : Number(e.target.value) };
                      updated[oarIdx] = { ...updated[oarIdx], additionalCourses: courses };
                      setSelectedOARs(updated);
                      setShowResults(false);
                    }
                  }}
                  className="w-full rounded-lg border border-amber-200 bg-white px-2 py-2 pr-8 text-xs focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
                  placeholder="mo"
                  min="0"
                  max="999"
                />
                <span className="absolute right-1.5 top-1.5 text-[10px] text-gray-400 pointer-events-none">mo</span>
              </div>
            </div>
          </div>
        ))}

        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              const updated = [...selectedOARs];
              const oarIdx = updated.findIndex(o => o.oar.name === item.oar.name);
              if (oarIdx >= 0) {
                updated[oarIdx] = {
                  ...updated[oarIdx],
                  additionalCourses: [...updated[oarIdx].additionalCourses, { dose: undefined, fractions: undefined, timeSinceRT: undefined }]
                };
                setSelectedOARs(updated);
                setShowResults(false);
              }
            }}
            className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-teal-50 hover:text-teal-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Prior course
          </button>

          <details className="text-right">
            <summary className="cursor-pointer list-none rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200">
              Advanced
            </summary>
            <div className="mt-3 w-[260px] max-w-[calc(100vw-3rem)] rounded-xl border border-gray-200 bg-white p-3 text-left shadow-lg">
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs font-bold text-gray-600">
                  <span className="block mb-1">&#945;/&#946;</span>
                  <input
                    type="number"
                    value={item.customAlphaBeta ?? item.oar.alphaBeta}
                    onChange={(e) => {
                      const val = e.target.value === '' ? undefined : Number(e.target.value);
                      setSelectedOARs(prev => prev.map(o => o.oar.name === item.oar.name ? { ...o, customAlphaBeta: val } : o));
                      setShowResults(false);
                    }}
                    className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
                    min="0.1"
                    max="20"
                    step="0.1"
                  />
                </label>
                <label className="text-xs font-bold text-gray-600">
                  <span className="block mb-1">Tolerance</span>
                  <input
                    type="number"
                    value={item.customLifetimeTolerance ?? item.oar.lifetimeToleranceEQD2}
                    onChange={(e) => {
                      const val = e.target.value === '' ? undefined : Number(e.target.value);
                      setSelectedOARs(prev => prev.map(o => o.oar.name === item.oar.name ? { ...o, customLifetimeTolerance: val } : o));
                      setShowResults(false);
                    }}
                    className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
                    min="1"
                    max="200"
                    step="0.1"
                  />
                </label>
              </div>
              <button
                onClick={() => {
                  setSelectedOARs(prev => prev.map(o => o.oar.name === item.oar.name ? { ...o, customAlphaBeta: undefined, customLifetimeTolerance: undefined } : o));
                  setShowResults(false);
                }}
                className="mt-3 text-xs font-semibold text-red-500 hover:text-red-700"
              >
                Reset advanced values
              </button>
            </div>
          </details>
        </div>
      </div>
    );
  };

  const renderResultCard = (result: OARBudgetResult) => {
    // In conservative mode, use raw cumulative EQD2 (no recovery)
    const isConservative = doseMode === 'conservative';
    const displayPrior = isConservative ? result.priorEQD2 : result.effectivePriorEQD2;
    const displayRemaining = Math.max(0, result.oar.lifetimeToleranceEQD2 - displayPrior);
    const displayPercent = (displayRemaining / result.oar.lifetimeToleranceEQD2) * 100;
    const status = getBudgetStatus(displayPercent, displayRemaining);
    const sourceReference = getConstraintReference(
      result.oar.name,
      result.oar.lifetimeToleranceEQD2,
      result.oar.alphaBeta
    );
    const fractionBudgets = [3, 4, 5].map((fx) => {
      const totalDose = eqd2ToPhysicalDose(displayRemaining, fx, result.oar.alphaBeta);
      return {
        fractions: fx,
        totalDose,
        dosePerFraction: totalDose / fx,
      };
    });
    const customFx = customFractions[result.oar.name];
    const customPhysicalDose = customFx && customFx >= 1
      ? eqd2ToPhysicalDose(displayRemaining, customFx, result.oar.alphaBeta)
      : undefined;

    return (
      <div key={result.oar.name} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${status.dot}`} />
              <h4 className="truncate text-lg font-bold text-gray-900">{result.oar.name}</h4>
            </div>
            <p className="mt-1 text-xs text-gray-500">{result.oar.complication}</p>
          </div>
          <div className={`rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold ${status.text}`}>
            {status.label}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-gray-50 p-3">
            <div className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Prior EQD2</div>
            <div className="mt-1 text-base font-bold text-gray-900">{displayPrior.toFixed(1)}</div>
            <div className="text-[11px] text-gray-500">Gy</div>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <div className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Tolerance</div>
            <div className="mt-1 text-base font-bold text-gray-900">{result.oar.lifetimeToleranceEQD2}</div>
            <div className="text-[11px] text-gray-500">Gy</div>
          </div>
          <div className="rounded-xl bg-teal-50 p-3">
            <div className="text-[11px] font-bold uppercase tracking-wide text-teal-700">Remaining</div>
            <div className="mt-1 text-xl font-bold text-teal-950">{displayRemaining.toFixed(1)}</div>
            <div className="text-[11px] text-teal-700">Gy EQD2</div>
          </div>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full ${status.bar}`}
            style={{ width: `${Math.max(0, Math.min(100, displayPercent))}%` }}
          />
        </div>
        <div className="mt-1 text-right text-[11px] text-gray-500">
          {displayPercent.toFixed(0)}% of tolerance remaining
        </div>

        {isConservative && result.recoveryPercent > 0 && (
          <div className="mt-3 rounded-xl bg-teal-50/70 px-3 py-2 text-xs text-teal-800">
            With recovery: {result.remainingBudgetEQD2.toFixed(1)} Gy EQD2 remaining.
          </div>
        )}

        <div className="mt-4">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-gray-500">Physical dose budget</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {fractionBudgets.map((budget) => (
              <div key={budget.fractions} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <div className="text-xs font-bold text-gray-700">{budget.fractions} fx</div>
                <div className="mt-1 text-sm font-bold text-gray-900">{budget.totalDose.toFixed(1)} Gy</div>
                <div className="text-[11px] text-gray-500">{budget.dosePerFraction.toFixed(1)} Gy/fx</div>
              </div>
            ))}
            <div className="rounded-xl border border-gray-200 bg-white p-3">
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={customFx ?? ''}
                  onChange={(e) => setCustomFractions(prev => ({ ...prev, [result.oar.name]: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-12 rounded-md border border-gray-300 px-1.5 py-1 text-center text-xs focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  placeholder="#"
                  min="1"
                  max="50"
                />
                <span className="text-xs font-bold text-gray-700">fx</span>
              </div>
              <div className="mt-1 text-sm font-bold text-gray-900">
                {customPhysicalDose !== undefined ? `${customPhysicalDose.toFixed(1)} Gy` : '-'}
              </div>
              <div className="text-[11px] text-gray-500">
                {customPhysicalDose !== undefined && customFx ? `${(customPhysicalDose / customFx).toFixed(1)} Gy/fx` : 'custom'}
              </div>
            </div>
          </div>
        </div>

        <details className="mt-4 rounded-xl border border-gray-200 bg-gray-50">
          <summary className="cursor-pointer px-3 py-2 text-xs font-bold text-gray-600">
            Details
          </summary>
          <div className="space-y-3 border-t border-gray-200 px-3 py-3 text-xs text-gray-600">
            {result.warningMessage && (
              <div className="rounded-lg bg-white p-3 text-gray-700">
                {result.warningMessage}
              </div>
            )}
            {result.oar.specialNote && (
              <div className="rounded-lg bg-blue-50 p-3 text-blue-800">
                <strong>Note:</strong> {result.oar.specialNote}
              </div>
            )}
            <div className="rounded-lg bg-white p-3 font-mono">
              <p>Prior EQD2 = {result.priorEQD2.toFixed(1)} Gy</p>
              {!isConservative && result.recoveryPercent > 0 && (
                <p>Effective EQD2 = {result.effectivePriorEQD2.toFixed(1)} Gy after {result.recoveryPercent.toFixed(0)}% recovery</p>
              )}
              <p>Remaining = {result.oar.lifetimeToleranceEQD2} - {displayPrior.toFixed(1)} = {displayRemaining.toFixed(1)} Gy</p>
              <p>&#945;/&#946; = {result.oar.alphaBeta} Gy</p>
            </div>
            {sourceReference && (
              <a
                href={sourceReference.url}
                target="_blank"
                rel="noreferrer"
                title={sourceReference.note}
                className="inline-flex items-center gap-1 font-semibold text-blue-700 underline decoration-blue-300 underline-offset-2 hover:text-blue-900"
              >
                Source: {sourceReference.sourceLabel}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
              </a>
            )}
          </div>
        </details>
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

      {/* Show Results or Input Mode */}
      {!showResults ? (
        <>
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedOARs.length === 0 ? 'Select organs' : 'Add organs'}
                </h3>
                <p className="text-sm text-gray-500">Choose the OARs to compare. Each selected organ gets its own dose-budget card.</p>
              </div>
              {selectedOARs.length > 0 && (
                <div className="text-xs font-semibold text-gray-500">
                  {selectedOARs.length} selected
                </div>
              )}
            </div>
            {renderOARSelector()}
          </section>

          {selectedOARs.length > 0 && (
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Dose budget cards</h3>
                  <p className="text-sm text-gray-500">
                    {completedOARCount} of {selectedOARs.length} organs are ready to calculate.
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="self-start sm:self-auto rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  Clear All
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {selectedOARs.map(item => renderOARInputCard(item))}
              </div>
            </section>
          )}

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
                  Calculate {completedOARCount} OAR {completedOARCount === 1 ? 'budget' : 'budgets'}
                </span>
              ) : (
                selectedOARs.length === 0 ? 'Select OARs to calculate' : 'Fill at least one OAR to calculate'
              )}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Results Section */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Dose Budget Results</h2>
              <p className="text-sm text-gray-500">Remaining EQD2 and estimated physical dose budgets by organ.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-full border border-gray-200 bg-white p-1 shadow-sm">
                {(['conservative', 'recovery'] as DoseMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setDoseMode(mode)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                      doseMode === mode
                        ? 'bg-teal-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {mode === 'conservative' ? 'EQD2' : 'Recovery'}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowResults(false)}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
              >
                Modify inputs
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-700">Dose Calculation Mode</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {doseMode === 'conservative' 
                    ? 'Showing raw cumulative EQD2 against lifetime tolerance -- no tissue recovery applied'
                    : 'Showing effective dose after tissue recovery modeling (25-50% based on time interval)'}
                </p>
              </div>
              <div className="text-xs font-semibold text-gray-500">
                {results.length} {results.length === 1 ? 'organ' : 'organs'}
              </div>
            </div>
          </div>

          {/* Result Cards */}
          <div className="grid gap-4 lg:grid-cols-2">
            {results.map(result => renderResultCard(result))}
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
