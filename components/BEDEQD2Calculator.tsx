'use client';

import { Fragment, useMemo, useState } from 'react';
import {
  ALPHA_BETA_RATIOS,
  calculateBEDAndEQD2,
  getDosePerFraction,
} from '@/lib/bedCalculations';

type RegimenCategory = 'sbrt' | 'conventional' | 'palliative' | 'custom';
type RegimenFilter = RegimenCategory | 'all';
type AlphaBetaPreset = 'tumor' | 'late' | 'cns' | 'custom';
type ComparisonView = 'selected' | 'matrix';

interface Regimen {
  id: string;
  label: string;
  dose: number;
  fractions: number;
  category: RegimenCategory;
  note: string;
}

interface CalculatedRegimen extends Regimen {
  dosePerFraction: number;
  bed: number;
  eqd2: number;
}

interface AlphaBetaComparison {
  id: string;
  label: string;
  value: number;
  helper: string;
}

interface RegimenMatrixRow extends Regimen {
  dosePerFraction: number;
  comparisons: {
    alphaBetaId: string;
    bed: number;
    eqd2: number;
  }[];
}

const CATEGORY_LABELS: Record<RegimenFilter, string> = {
  all: 'All',
  sbrt: 'SBRT',
  conventional: 'Conventional',
  palliative: 'Palliative',
  custom: 'Custom',
};

const CATEGORY_STYLES: Record<RegimenCategory, string> = {
  sbrt: 'bg-teal-50 text-teal-700 border-teal-200',
  conventional: 'bg-blue-50 text-blue-700 border-blue-200',
  palliative: 'bg-amber-50 text-amber-700 border-amber-200',
  custom: 'bg-purple-50 text-purple-700 border-purple-200',
};

const COMPARISON_VIEW_LABELS: Record<ComparisonView, string> = {
  selected: 'Selected alpha/beta',
  matrix: 'Multi alpha/beta',
};

const STANDARD_REGIMENS: Regimen[] = [
  {
    id: 'sbrt-27-3',
    label: '27 Gy / 3 fx',
    dose: 27,
    fractions: 3,
    category: 'sbrt',
    note: 'Short-course SBRT reference',
  },
  {
    id: 'sbrt-32-4',
    label: '32 Gy / 4 fx',
    dose: 32,
    fractions: 4,
    category: 'sbrt',
    note: 'Post-operative SBRT reference',
  },
  {
    id: 'sbrt-36-4',
    label: '36 Gy / 4 fx',
    dose: 36,
    fractions: 4,
    category: 'sbrt',
    note: 'Gross disease SBRT reference',
  },
  {
    id: 'sbrt-40-5',
    label: '40 Gy / 5 fx',
    dose: 40,
    fractions: 5,
    category: 'sbrt',
    note: 'Hypofractionated re-RT reference',
  },
  {
    id: 'conv-60-30',
    label: '60 Gy / 30 fx',
    dose: 60,
    fractions: 30,
    category: 'conventional',
    note: 'Moderate conventional re-RT',
  },
  {
    id: 'conv-64-32',
    label: '64 Gy / 32 fx',
    dose: 64,
    fractions: 32,
    category: 'conventional',
    note: 'Standard fractionation reference',
  },
  {
    id: 'conv-66-33',
    label: '66 Gy / 33 fx',
    dose: 66,
    fractions: 33,
    category: 'conventional',
    note: 'Definitive re-RT reference',
  },
  {
    id: 'conv-70-35',
    label: '70 Gy / 35 fx',
    dose: 70,
    fractions: 35,
    category: 'conventional',
    note: 'Prior definitive RT reference',
  },
  {
    id: 'pall-20-5',
    label: '20 Gy / 5 fx',
    dose: 20,
    fractions: 5,
    category: 'palliative',
    note: 'Palliative reference',
  },
  {
    id: 'pall-30-10',
    label: '30 Gy / 10 fx',
    dose: 30,
    fractions: 10,
    category: 'palliative',
    note: 'Common palliative reference',
  },
  {
    id: 'pall-37-5-15',
    label: '37.5 Gy / 15 fx',
    dose: 37.5,
    fractions: 15,
    category: 'palliative',
    note: 'Protracted palliative reference',
  },
];

const ALPHA_BETA_OPTIONS: {
  key: AlphaBetaPreset;
  label: string;
  value: number;
  helper: string;
}[] = [
  {
    key: 'tumor',
    label: 'Tumor / early',
    value: ALPHA_BETA_RATIOS.TUMOR_EARLY,
    helper: '10 Gy',
  },
  {
    key: 'late',
    label: 'Late normal',
    value: ALPHA_BETA_RATIOS.LATE_GENERAL,
    helper: '3 Gy',
  },
  {
    key: 'cns',
    label: 'CNS / optic',
    value: ALPHA_BETA_RATIOS.CNS_LATE,
    helper: '2 Gy',
  },
  {
    key: 'custom',
    label: 'Custom',
    value: ALPHA_BETA_RATIOS.TUMOR_EARLY,
    helper: 'Manual',
  },
];

const BASE_ALPHA_BETA_COMPARISONS: AlphaBetaComparison[] = [
  {
    id: 'tumor-10',
    label: 'Tumor / early',
    value: ALPHA_BETA_RATIOS.TUMOR_EARLY,
    helper: 'alpha/beta 10 Gy',
  },
  {
    id: 'late-3',
    label: 'Late normal',
    value: ALPHA_BETA_RATIOS.LATE_GENERAL,
    helper: 'alpha/beta 3 Gy',
  },
  {
    id: 'cns-2',
    label: 'CNS / optic',
    value: ALPHA_BETA_RATIOS.CNS_LATE,
    helper: 'alpha/beta 2 Gy',
  },
];

function parsePositiveNumber(value: string): number | undefined {
  if (value.trim() === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function isValidRegimen(dose?: number, fractions?: number): boolean {
  return dose !== undefined && dose > 0 && fractions !== undefined && Number.isInteger(fractions) && fractions > 0;
}

function calculateRegimen(regimen: Regimen, alphaBeta: number): CalculatedRegimen {
  const { bed, eqd2 } = calculateBEDAndEQD2(regimen.dose, regimen.fractions, alphaBeta);
  return {
    ...regimen,
    dosePerFraction: getDosePerFraction(regimen.dose, regimen.fractions),
    bed,
    eqd2,
  };
}

function calculateMatrixRow(regimen: Regimen, alphaBetaComparisons: AlphaBetaComparison[]): RegimenMatrixRow {
  return {
    ...regimen,
    dosePerFraction: getDosePerFraction(regimen.dose, regimen.fractions),
    comparisons: alphaBetaComparisons.map((comparison) => {
      const { bed, eqd2 } = calculateBEDAndEQD2(regimen.dose, regimen.fractions, comparison.value);
      return {
        alphaBetaId: comparison.id,
        bed,
        eqd2,
      };
    }),
  };
}

function formatDose(value: number): string {
  return value.toFixed(value >= 10 ? 1 : 2);
}

function formatAlphaBeta(value: number): string {
  return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1);
}

function isSameAlphaBeta(first: number, second: number): boolean {
  return Math.abs(first - second) < 0.001;
}

function getAlphaBetaComparisons(alphaBeta: number): AlphaBetaComparison[] {
  const comparisons = [...BASE_ALPHA_BETA_COMPARISONS];

  if (alphaBeta > 0 && !comparisons.some((comparison) => isSameAlphaBeta(comparison.value, alphaBeta))) {
    comparisons.push({
      id: 'selected-custom',
      label: 'Selected custom',
      value: alphaBeta,
      helper: `alpha/beta ${formatAlphaBeta(alphaBeta)} Gy`,
    });
  }

  return comparisons;
}

export default function BEDEQD2Calculator() {
  const [dose, setDose] = useState<number | undefined>(36);
  const [fractions, setFractions] = useState<number | undefined>(4);
  const [alphaBeta, setAlphaBeta] = useState<number>(ALPHA_BETA_RATIOS.TUMOR_EARLY);
  const [alphaBetaPreset, setAlphaBetaPreset] = useState<AlphaBetaPreset>('tumor');
  const [activeFilter, setActiveFilter] = useState<RegimenFilter>('all');
  const [comparisonView, setComparisonView] = useState<ComparisonView>('selected');
  const [customRows, setCustomRows] = useState<Regimen[]>([]);

  const currentRegimen = useMemo<Regimen | undefined>(() => {
    if (!isValidRegimen(dose, fractions) || alphaBeta <= 0 || dose === undefined || fractions === undefined) {
      return undefined;
    }

    return {
      id: 'current-regimen',
      label: `${dose} Gy / ${fractions} fx`,
      dose,
      fractions,
      category: 'custom',
      note: 'Working calculation',
    };
  }, [alphaBeta, dose, fractions]);

  const currentResult = useMemo(() => {
    if (!currentRegimen) {
      return undefined;
    }

    try {
      return calculateRegimen(currentRegimen, alphaBeta);
    } catch {
      return undefined;
    }
  }, [alphaBeta, currentRegimen]);

  const filteredRegimens = useMemo(() => {
    const rows = [...STANDARD_REGIMENS, ...customRows];
    return activeFilter === 'all'
      ? rows
      : rows.filter((row) => row.category === activeFilter);
  }, [activeFilter, customRows]);

  const tableRows = useMemo(() => {
    if (alphaBeta <= 0) {
      return [];
    }

    return filteredRegimens.map((row) => calculateRegimen(row, alphaBeta));
  }, [alphaBeta, filteredRegimens]);

  const alphaBetaComparisons = useMemo(() => getAlphaBetaComparisons(alphaBeta), [alphaBeta]);

  const matrixRows = useMemo(() => {
    return filteredRegimens.map((row) => calculateMatrixRow(row, alphaBetaComparisons));
  }, [alphaBetaComparisons, filteredRegimens]);

  const counts = useMemo(() => {
    const rows = [...STANDARD_REGIMENS, ...customRows];
    return rows.reduce<Record<RegimenFilter, number>>((acc, row) => {
      acc.all += 1;
      acc[row.category] += 1;
      return acc;
    }, {
      all: 0,
      sbrt: 0,
      conventional: 0,
      palliative: 0,
      custom: 0,
    });
  }, [customRows]);

  const handleAlphaBetaPreset = (preset: AlphaBetaPreset) => {
    setAlphaBetaPreset(preset);
    const option = ALPHA_BETA_OPTIONS.find((item) => item.key === preset);
    if (option && preset !== 'custom') {
      setAlphaBeta(option.value);
    }
  };

  const addCurrentToTable = () => {
    if (!currentRegimen) {
      return;
    }

    const nextIndex = customRows.length + 1;
    setCustomRows((prev) => [
      ...prev,
      {
        ...currentRegimen,
        id: `custom-${Date.now()}`,
        label: `Custom ${nextIndex}: ${currentRegimen.label}`,
        note: 'Added from calculator',
      },
    ]);
    setActiveFilter('all');
  };

  const applyRegimenToCalculator = (regimen: Regimen) => {
    setDose(regimen.dose);
    setFractions(regimen.fractions);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg p-6 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">BED / EQD2 Calculator</h1>
        <p className="text-teal-100">
          Convert dose and fractionation into biologically effective dose and equivalent 2 Gy dose.
        </p>
      </div>

      <section className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="border-b border-gray-200 p-5">
            <h2 className="text-lg font-bold text-gray-900">Single Regimen</h2>
            <p className="text-sm text-gray-500 mt-1">Enter a dose schedule and select the tissue alpha/beta ratio.</p>
          </div>

          <div className="p-5 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Total Dose</label>
                <div className="relative">
                  <input
                    type="number"
                    value={dose ?? ''}
                    onChange={(event) => setDose(parsePositiveNumber(event.target.value))}
                    className="w-full px-3 py-3 pr-12 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    min="0"
                    max="200"
                    step="0.1"
                    inputMode="decimal"
                  />
                  <span className="absolute right-3 top-3.5 text-sm text-gray-500 pointer-events-none">Gy</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Fractions</label>
                <div className="relative">
                  <input
                    type="number"
                    value={fractions ?? ''}
                    onChange={(event) => setFractions(parsePositiveNumber(event.target.value))}
                    className="w-full px-3 py-3 pr-12 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    min="1"
                    max="99"
                    step="1"
                    inputMode="numeric"
                  />
                  <span className="absolute right-3 top-3.5 text-sm text-gray-500 pointer-events-none">fx</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <label className="block text-xs font-bold text-gray-600 uppercase">Alpha/Beta</label>
                <div className="text-xs text-gray-500">Gy</div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {ALPHA_BETA_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => handleAlphaBetaPreset(option.key)}
                    className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                      alphaBetaPreset === option.key
                        ? 'border-teal-600 bg-teal-50 text-teal-800'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span className="block text-sm font-semibold">{option.label}</span>
                    <span className="block text-xs">{option.helper}</span>
                  </button>
                ))}
              </div>

              <div className="mt-3 relative max-w-[180px]">
                <input
                  type="number"
                  value={alphaBeta}
                  onChange={(event) => {
                    setAlphaBetaPreset('custom');
                    setAlphaBeta(parsePositiveNumber(event.target.value) ?? 0);
                  }}
                  className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  min="0.1"
                  max="30"
                  step="0.1"
                  inputMode="decimal"
                />
                <span className="absolute right-3 top-2.5 text-xs text-gray-500 pointer-events-none">Gy</span>
              </div>
            </div>

            {currentResult ? (
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Dose/Fx</div>
                  <div className="text-xl font-bold text-gray-900">{formatDose(currentResult.dosePerFraction)}</div>
                  <div className="text-xs text-gray-500">Gy</div>
                </div>
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                  <div className="text-xs text-teal-700 mb-1">BED</div>
                  <div className="text-xl font-bold text-teal-900">{formatDose(currentResult.bed)}</div>
                  <div className="text-xs text-teal-700">Gy</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-xs text-blue-700 mb-1">EQD2</div>
                  <div className="text-xl font-bold text-blue-900">{formatDose(currentResult.eqd2)}</div>
                  <div className="text-xs text-blue-700">Gy</div>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                Enter a positive dose, whole-number fractions, and alpha/beta above 0.
              </div>
            )}

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-700">
              <div className="font-bold text-slate-900 mb-2">Formula</div>
              <div className="space-y-1 font-mono text-xs">
                <div>d = total dose / fractions</div>
                <div>BED = D x (1 + d / (alpha/beta))</div>
                <div>EQD2 = BED / (1 + 2 / (alpha/beta))</div>
              </div>
            </div>

            <button
              onClick={addCurrentToTable}
              disabled={!currentResult}
              className={`w-full py-3 px-4 rounded-lg font-bold transition-colors ${
                currentResult
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              Add Current Regimen to Table
            </button>
          </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Regimen Comparison</h2>
              <p className="text-sm text-gray-500 mt-1">
                Review one alpha/beta ratio or compare common ratios side by side.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                {(Object.keys(COMPARISON_VIEW_LABELS) as ComparisonView[]).map((view) => (
                  <button
                    key={view}
                    onClick={() => setComparisonView(view)}
                    className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                      comparisonView === view
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {COMPARISON_VIEW_LABELS[view]}
                  </button>
                ))}
              </div>
              {(Object.keys(CATEGORY_LABELS) as RegimenFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                    activeFilter === filter
                      ? 'border-teal-600 bg-teal-600 text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {CATEGORY_LABELS[filter]}
                  <span className={`ml-2 text-xs ${activeFilter === filter ? 'text-teal-100' : 'text-gray-400'}`}>
                    {counts[filter]}
                  </span>
                </button>
              ))}
              {customRows.length > 0 && (
                <button
                  onClick={() => setCustomRows([])}
                  className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                >
                  Clear Custom
                </button>
              )}
            </div>
          </div>
        </div>

        {comparisonView === 'selected' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[860px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-bold text-gray-700">Regimen</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-700">Type</th>
                  <th className="text-right px-4 py-3 font-bold text-gray-700">Total Dose</th>
                  <th className="text-right px-4 py-3 font-bold text-gray-700">Fractions</th>
                  <th className="text-right px-4 py-3 font-bold text-gray-700">Dose/Fx</th>
                  <th className="text-right px-4 py-3 font-bold text-gray-700">BED</th>
                  <th className="text-right px-4 py-3 font-bold text-gray-700">EQD2</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-700">Context</th>
                  <th className="text-right px-4 py-3 font-bold text-gray-700">Use</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {alphaBeta <= 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-amber-700">
                      Enter an alpha/beta value above 0 to calculate the selected-ratio table.
                    </td>
                  </tr>
                )}
                {alphaBeta > 0 && tableRows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">{row.label}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex border rounded-full px-2.5 py-1 text-xs font-bold ${CATEGORY_STYLES[row.category]}`}>
                        {CATEGORY_LABELS[row.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatDose(row.dose)} Gy</td>
                    <td className="px-4 py-3 text-right text-gray-700">{row.fractions}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatDose(row.dosePerFraction)} Gy</td>
                    <td className="px-4 py-3 text-right font-semibold text-teal-800">{formatDose(row.bed)} Gy</td>
                    <td className="px-4 py-3 text-right font-semibold text-blue-800">{formatDose(row.eqd2)} Gy</td>
                    <td className="px-4 py-3 text-gray-600">{row.note}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => applyRegimenToCalculator(row)}
                        className="text-xs font-bold text-teal-700 hover:text-teal-900"
                      >
                        Load
                      </button>
                    </td>
                  </tr>
                ))}
                {alphaBeta > 0 && tableRows.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
                      No regimens in this category yet. Add a custom regimen from the calculator.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1120px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th rowSpan={2} className="text-left px-4 py-3 font-bold text-gray-700 align-bottom">Regimen</th>
                  <th rowSpan={2} className="text-left px-4 py-3 font-bold text-gray-700 align-bottom">Type</th>
                  <th rowSpan={2} className="text-right px-4 py-3 font-bold text-gray-700 align-bottom">Total Dose</th>
                  <th rowSpan={2} className="text-right px-4 py-3 font-bold text-gray-700 align-bottom">Fractions</th>
                  <th rowSpan={2} className="text-right px-4 py-3 font-bold text-gray-700 align-bottom">Dose/Fx</th>
                  {alphaBetaComparisons.map((comparison) => (
                    <th
                      key={comparison.id}
                      colSpan={2}
                      className="text-center px-4 py-3 font-bold text-gray-700 border-l border-gray-200"
                    >
                      <span className="block">{comparison.label}</span>
                      <span className="block text-xs font-medium text-gray-500">{comparison.helper}</span>
                    </th>
                  ))}
                  <th rowSpan={2} className="text-right px-4 py-3 font-bold text-gray-700 align-bottom">Use</th>
                </tr>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {alphaBetaComparisons.map((comparison) => (
                    <Fragment key={comparison.id}>
                      <th
                        key={`${comparison.id}-bed`}
                        className="text-right px-4 py-2 text-xs font-bold uppercase text-teal-700 border-l border-gray-200"
                      >
                        BED
                      </th>
                      <th
                        key={`${comparison.id}-eqd2`}
                        className="text-right px-4 py-2 text-xs font-bold uppercase text-blue-700"
                      >
                        EQD2
                      </th>
                    </Fragment>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {matrixRows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">{row.label}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex border rounded-full px-2.5 py-1 text-xs font-bold ${CATEGORY_STYLES[row.category]}`}>
                        {CATEGORY_LABELS[row.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatDose(row.dose)} Gy</td>
                    <td className="px-4 py-3 text-right text-gray-700">{row.fractions}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatDose(row.dosePerFraction)} Gy</td>
                    {row.comparisons.map((comparison) => (
                      <Fragment key={`${row.id}-${comparison.alphaBetaId}`}>
                        <td
                          key={`${row.id}-${comparison.alphaBetaId}-bed`}
                          className="px-4 py-3 text-right font-semibold text-teal-800 border-l border-gray-100"
                        >
                          {formatDose(comparison.bed)} Gy
                        </td>
                        <td
                          key={`${row.id}-${comparison.alphaBetaId}-eqd2`}
                          className="px-4 py-3 text-right font-semibold text-blue-800"
                        >
                          {formatDose(comparison.eqd2)} Gy
                        </td>
                      </Fragment>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => applyRegimenToCalculator(row)}
                        className="text-xs font-bold text-teal-700 hover:text-teal-900"
                      >
                        Load
                      </button>
                    </td>
                  </tr>
                ))}
                {matrixRows.length === 0 && (
                  <tr>
                    <td colSpan={6 + alphaBetaComparisons.length * 2} className="px-4 py-10 text-center text-gray-500">
                      No regimens in this category yet. Add a custom regimen from the calculator.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 text-xs text-gray-600">
        <p className="font-semibold mb-2">Clinical Disclaimer</p>
        <p>
          BED and EQD2 are linear-quadratic model estimates. They do not account for dose heterogeneity, volume,
          retreatment interval, tissue recovery, concurrent systemic therapy, or patient-specific risk. Use alongside
          anatomy-specific OAR review and multidisciplinary clinical judgment.
        </p>
      </div>
    </div>
  );
}
