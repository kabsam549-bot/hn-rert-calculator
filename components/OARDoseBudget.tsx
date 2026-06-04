'use client';

import { useMemo, useState, type ReactNode } from 'react';
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
  additionalCourses: {
    dose?: number;
    fractions?: number;
    timeSinceRT?: number;
  }[];
  customAlphaBeta?: number;
  customLifetimeTolerance?: number;
}

type DoseMode = 'conservative' | 'recovery';

function buildBudgetInput(item: OARInput): OARBudgetInput | undefined {
  if (
    item.priorDose === undefined ||
    item.priorFractions === undefined ||
    item.timeSinceRT === undefined ||
    item.priorDose <= 0 ||
    item.priorFractions <= 0 ||
    item.timeSinceRT < 0
  ) {
    return undefined;
  }

  let oar = item.oar;
  if (item.customAlphaBeta !== undefined && item.customAlphaBeta > 0) {
    oar = { ...oar, alphaBeta: item.customAlphaBeta };
  }
  if (
    item.customLifetimeTolerance !== undefined &&
    item.customLifetimeTolerance > 0
  ) {
    oar = { ...oar, lifetimeToleranceEQD2: item.customLifetimeTolerance };
  }

  return {
    oar,
    priorDose: item.priorDose,
    priorFractions: item.priorFractions,
    timeSinceRT: item.timeSinceRT,
    additionalCourses: item.additionalCourses
      .filter(
        (course) =>
          course.dose !== undefined &&
          course.fractions !== undefined &&
          course.timeSinceRT !== undefined &&
          course.dose > 0 &&
          course.fractions > 0,
      )
      .map(
        (course) =>
          ({
            dose: course.dose!,
            fractions: course.fractions!,
            timeSinceRT: course.timeSinceRT!,
          }) as PriorRTCourse,
      ),
  };
}

function getBudgetTone(percentRemaining: number, remainingEQD2: number) {
  if (remainingEQD2 <= 0) {
    return {
      dot: 'bg-red-500',
      bg: 'bg-red-50/80',
      border: 'border-red-200',
      centerBg: 'bg-white/80',
      softText: 'text-red-700',
    };
  }

  if (percentRemaining <= 15) {
    return {
      dot: 'bg-orange-500',
      bg: 'bg-orange-50/80',
      border: 'border-orange-200',
      centerBg: 'bg-white/80',
      softText: 'text-orange-700',
    };
  }

  if (percentRemaining <= 35) {
    return {
      dot: 'bg-amber-500',
      bg: 'bg-amber-50/80',
      border: 'border-amber-200',
      centerBg: 'bg-white/80',
      softText: 'text-amber-700',
    };
  }

  return {
    dot: 'bg-teal-500',
    bg: 'bg-teal-50/70',
    border: 'border-teal-200',
    centerBg: 'bg-white/80',
    softText: 'text-teal-700',
  };
}

function PriorEQD2Icon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v18" />
      <path d="M5 8h14" />
      <path d="M7 13h2" />
      <path d="M15 13h2" />
      <path d="M7 18h2" />
      <path d="M15 18h2" />
    </svg>
  );
}

function AlphaBetaIcon() {
  return (
    <span
      className="flex h-5 w-7 items-center justify-center rounded-full bg-white text-[10px] font-black leading-none text-gray-700 shadow-sm ring-1 ring-gray-200"
      aria-hidden="true"
    >
      α/β
    </span>
  );
}

function ToleranceIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-5" />
    </svg>
  );
}

function RiskIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12h4l2-6 4 12 2-6h6" />
    </svg>
  );
}

function MetricLabel({
  children,
  icon,
}: {
  children: ReactNode;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-500">
      {icon}
      <span>{children}</span>
    </div>
  );
}

export default function OARDoseBudget() {
  const { content } = useEditableContent();
  const [selectedOARs, setSelectedOARs] = useState<OARInput[]>([]);
  const [doseMode, setDoseMode] = useState<DoseMode>('conservative');
  const [customFractions, setCustomFractions] = useState<
    Record<string, number | undefined>
  >({});

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
    if (selectedOARs.some((item) => item.oar.name === oar.name)) {
      return; // Already added
    }
    setSelectedOARs([...selectedOARs, { oar, additionalCourses: [] }]);
  };

  const handleRemoveOAR = (oarName: string) => {
    setSelectedOARs(selectedOARs.filter((item) => item.oar.name !== oarName));
  };

  const handleUpdateOAR = (
    oarName: string,
    field: 'priorDose' | 'priorFractions' | 'timeSinceRT',
    value: number | undefined,
  ) => {
    setSelectedOARs(
      selectedOARs.map((item) =>
        item.oar.name === oarName ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleReset = () => {
    setSelectedOARs([]);
    setCustomFractions({});
  };

  const completedOARCount = selectedOARs.filter(
    (item) => buildBudgetInput(item) !== undefined,
  ).length;

  const renderOARSelector = () => {
    if (availableOARData.length === 0) {
      return (
        <div className="text-center py-4 text-sm text-gray-500">
          No OAR constraints are available.
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {availableOARData.map((oar) => {
          const selectedItem = selectedOARs.find(
            (item) => item.oar.name === oar.name,
          );
          const isSelected = selectedItem !== undefined;
          const displayedTolerance =
            selectedItem?.customLifetimeTolerance ?? oar.lifetimeToleranceEQD2;
          const displayedAlphaBeta =
            selectedItem?.customAlphaBeta ?? oar.alphaBeta;

          return (
            <div
              key={oar.name}
              className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-colors ${
                isSelected
                  ? 'border-teal-300'
                  : 'border-gray-200 hover:border-teal-200'
              }`}
            >
              <button
                type="button"
                onClick={() =>
                  isSelected ? handleRemoveOAR(oar.name) : handleAddOAR(oar)
                }
                aria-expanded={isSelected}
                className={`flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition-colors sm:px-4 ${
                  isSelected ? 'bg-teal-50/70' : 'bg-white hover:bg-gray-50'
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${isSelected ? 'bg-teal-600' : 'bg-gray-300'}`}
                    />
                    <span className="truncate text-sm font-bold text-gray-900 sm:text-base">
                      {oar.name}
                    </span>
                  </span>
                  <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span>Tolerance {displayedTolerance} Gy</span>
                    <span>α/β {displayedAlphaBeta}</span>
                    <span className="min-w-0 truncate">{oar.complication}</span>
                  </span>
                </span>
                <span
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                    isSelected
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                  aria-hidden="true"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {isSelected ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 12H4"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    )}
                  </svg>
                </span>
              </button>

              {selectedItem && (
                <div className="border-t border-teal-100 bg-white p-3 sm:p-4">
                  {renderOARInputCard(selectedItem)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderOARInputCard = (item: OARInput) => {
    const hasCustomSettings =
      item.customAlphaBeta !== undefined ||
      item.customLifetimeTolerance !== undefined;
    const budgetInput = buildBudgetInput(item);
    const budgetResult = budgetInput
      ? calculateOARBudget(budgetInput)
      : undefined;

    return (
      <div key={item.oar.name} className="space-y-4">
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <label className="rounded-xl bg-gray-50 p-2.5 text-center">
            <MetricLabel icon={<ToleranceIcon />}>Tolerance</MetricLabel>
            <div className="relative mt-1">
              <input
                type="number"
                value={
                  item.customLifetimeTolerance ?? item.oar.lifetimeToleranceEQD2
                }
                onChange={(e) => {
                  const val =
                    e.target.value === '' ? undefined : Number(e.target.value);
                  setSelectedOARs((prev) =>
                    prev.map((o) =>
                      o.oar.name === item.oar.name
                        ? {
                            ...o,
                            customLifetimeTolerance:
                              val === item.oar.lifetimeToleranceEQD2
                                ? undefined
                                : val,
                          }
                        : o,
                    ),
                  );
                }}
                className="w-full rounded-lg border border-gray-200 bg-white px-7 py-2 text-center text-sm font-bold text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
                min="1"
                max="200"
                step="0.1"
              />
              <span className="absolute right-2 top-2 text-[10px] font-semibold text-gray-500 pointer-events-none">
                Gy
              </span>
            </div>
          </label>
          <label className="rounded-xl bg-gray-50 p-2.5 text-center">
            <div className="flex justify-center">
              <AlphaBetaIcon />
              <span className="sr-only">α/β</span>
            </div>
            <div className="relative mt-1">
              <input
                type="number"
                value={item.customAlphaBeta ?? item.oar.alphaBeta}
                onChange={(e) => {
                  const val =
                    e.target.value === '' ? undefined : Number(e.target.value);
                  setSelectedOARs((prev) =>
                    prev.map((o) =>
                      o.oar.name === item.oar.name
                        ? {
                            ...o,
                            customAlphaBeta:
                              val === item.oar.alphaBeta ? undefined : val,
                          }
                        : o,
                    ),
                  );
                }}
                className="w-full rounded-lg border border-gray-200 bg-white px-7 py-2 text-center text-sm font-bold text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
                min="0.1"
                max="20"
                step="0.1"
              />
              <span className="absolute right-2 top-2 text-[10px] font-semibold text-gray-500 pointer-events-none">
                Gy
              </span>
            </div>
          </label>
          <div className="col-span-2 flex min-w-0 flex-col items-center justify-center rounded-xl bg-gray-50 p-2.5 text-center sm:col-span-1">
            <MetricLabel icon={<RiskIcon />}>Risk</MetricLabel>
            <div
              className="mt-1 max-w-full text-balance text-xs font-semibold leading-snug text-gray-800"
              title={item.oar.complication}
            >
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
                onChange={(e) =>
                  handleUpdateOAR(
                    item.oar.name,
                    'priorDose',
                    e.target.value === '' ? undefined : Number(e.target.value),
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-2 py-2.5 pr-8 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
                placeholder="0"
                min="0"
                max="200"
                step="0.1"
              />
              <span className="absolute right-2 top-2.5 text-xs text-gray-500 pointer-events-none">
                Gy
              </span>
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
                onChange={(e) =>
                  handleUpdateOAR(
                    item.oar.name,
                    'priorFractions',
                    e.target.value === '' ? undefined : Number(e.target.value),
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-2 py-2.5 pr-8 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
                placeholder="0"
                min="1"
                max="99"
                step="1"
              />
              <span className="absolute right-2 top-2.5 text-xs text-gray-500 pointer-events-none">
                fx
              </span>
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
                onChange={(e) =>
                  handleUpdateOAR(
                    item.oar.name,
                    'timeSinceRT',
                    e.target.value === '' ? undefined : Number(e.target.value),
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-2 py-2.5 pr-8 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
                placeholder="0"
                min="0"
                max="999"
                step="1"
              />
              <span className="absolute right-2 top-2.5 text-xs text-gray-500 pointer-events-none">
                mo
              </span>
            </div>
          </div>
        </div>

        {item.additionalCourses.map((course, idx) => (
          <div
            key={idx}
            className="mt-3 rounded-xl border border-amber-100 bg-amber-50/60 p-3"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-amber-800">
                Prior course {idx + 2}
              </span>
              <button
                onClick={() => {
                  const updated = [...selectedOARs];
                  const oarIdx = updated.findIndex(
                    (o) => o.oar.name === item.oar.name,
                  );
                  if (oarIdx >= 0) {
                    updated[oarIdx] = {
                      ...updated[oarIdx],
                      additionalCourses: updated[
                        oarIdx
                      ].additionalCourses.filter((_, i) => i !== idx),
                    };
                    setSelectedOARs(updated);
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
                    const oarIdx = updated.findIndex(
                      (o) => o.oar.name === item.oar.name,
                    );
                    if (oarIdx >= 0) {
                      const courses = [...updated[oarIdx].additionalCourses];
                      courses[idx] = {
                        ...courses[idx],
                        dose:
                          e.target.value === ''
                            ? undefined
                            : Number(e.target.value),
                      };
                      updated[oarIdx] = {
                        ...updated[oarIdx],
                        additionalCourses: courses,
                      };
                      setSelectedOARs(updated);
                    }
                  }}
                  className="w-full rounded-lg border border-amber-200 bg-white px-2 py-2 pr-8 text-xs focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
                  placeholder="Gy"
                  min="0"
                  max="200"
                />
                <span className="absolute right-1.5 top-1.5 text-[10px] text-gray-400 pointer-events-none">
                  Gy
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={course.fractions ?? ''}
                  onChange={(e) => {
                    const updated = [...selectedOARs];
                    const oarIdx = updated.findIndex(
                      (o) => o.oar.name === item.oar.name,
                    );
                    if (oarIdx >= 0) {
                      const courses = [...updated[oarIdx].additionalCourses];
                      courses[idx] = {
                        ...courses[idx],
                        fractions:
                          e.target.value === ''
                            ? undefined
                            : Number(e.target.value),
                      };
                      updated[oarIdx] = {
                        ...updated[oarIdx],
                        additionalCourses: courses,
                      };
                      setSelectedOARs(updated);
                    }
                  }}
                  className="w-full rounded-lg border border-amber-200 bg-white px-2 py-2 pr-8 text-xs focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
                  placeholder="fx"
                  min="1"
                  max="99"
                />
                <span className="absolute right-1.5 top-1.5 text-[10px] text-gray-400 pointer-events-none">
                  fx
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={course.timeSinceRT ?? ''}
                  onChange={(e) => {
                    const updated = [...selectedOARs];
                    const oarIdx = updated.findIndex(
                      (o) => o.oar.name === item.oar.name,
                    );
                    if (oarIdx >= 0) {
                      const courses = [...updated[oarIdx].additionalCourses];
                      courses[idx] = {
                        ...courses[idx],
                        timeSinceRT:
                          e.target.value === ''
                            ? undefined
                            : Number(e.target.value),
                      };
                      updated[oarIdx] = {
                        ...updated[oarIdx],
                        additionalCourses: courses,
                      };
                      setSelectedOARs(updated);
                    }
                  }}
                  className="w-full rounded-lg border border-amber-200 bg-white px-2 py-2 pr-8 text-xs focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
                  placeholder="mo"
                  min="0"
                  max="999"
                />
                <span className="absolute right-1.5 top-1.5 text-[10px] text-gray-400 pointer-events-none">
                  mo
                </span>
              </div>
            </div>
          </div>
        ))}

        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              const updated = [...selectedOARs];
              const oarIdx = updated.findIndex(
                (o) => o.oar.name === item.oar.name,
              );
              if (oarIdx >= 0) {
                updated[oarIdx] = {
                  ...updated[oarIdx],
                  additionalCourses: [
                    ...updated[oarIdx].additionalCourses,
                    {
                      dose: undefined,
                      fractions: undefined,
                      timeSinceRT: undefined,
                    },
                  ],
                };
                setSelectedOARs(updated);
              }
            }}
            className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-teal-50 hover:text-teal-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Prior course
          </button>

          {hasCustomSettings && (
            <button
              onClick={() => {
                setSelectedOARs((prev) =>
                  prev.map((o) =>
                    o.oar.name === item.oar.name
                      ? {
                          ...o,
                          customAlphaBeta: undefined,
                          customLifetimeTolerance: undefined,
                        }
                      : o,
                  ),
                );
              }}
              className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200"
            >
              Reset defaults
            </button>
          )}
        </div>

        {budgetResult ? (
          renderInlineBudget(budgetResult)
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
            Enter dose, fractions, and months to show the budget.
          </div>
        )}
      </div>
    );
  };

  const renderInlineBudget = (result: OARBudgetResult) => {
    const isConservative = doseMode === 'conservative';
    const displayPrior = isConservative
      ? result.priorEQD2
      : result.effectivePriorEQD2;
    const displayRemaining = Math.max(
      0,
      result.oar.lifetimeToleranceEQD2 - displayPrior,
    );
    const displayPercent =
      (displayRemaining / result.oar.lifetimeToleranceEQD2) * 100;
    const overage = Math.max(
      0,
      displayPrior - result.oar.lifetimeToleranceEQD2,
    );
    const tone = getBudgetTone(displayPercent, displayRemaining);
    const sourceReference = getConstraintReference(
      result.oar.name,
      result.oar.lifetimeToleranceEQD2,
      result.oar.alphaBeta,
    );
    const fractionBudgets = [3, 4, 5].map((fx) => {
      const totalDose = eqd2ToPhysicalDose(
        displayRemaining,
        fx,
        result.oar.alphaBeta,
      );
      return {
        fractions: fx,
        totalDose,
        dosePerFraction: totalDose / fx,
      };
    });
    const customFx = customFractions[result.oar.name];
    const customPhysicalDose =
      customFx && customFx >= 1
        ? eqd2ToPhysicalDose(displayRemaining, customFx, result.oar.alphaBeta)
        : undefined;

    return (
      <div
        className={`rounded-2xl border ${tone.border} ${tone.bg} p-3 shadow-sm sm:p-4`}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} />
              <div className="text-sm font-bold text-gray-900">Dose budget</div>
            </div>
            <div className="mt-1 text-xs text-gray-600">
              Remaining EQD2 and physical dose estimate.
            </div>
          </div>
          {overage > 0 && (
            <div className="text-xs font-semibold text-red-700">
              Over tolerance by {overage.toFixed(1)} Gy EQD2
            </div>
          )}
        </div>

        <div
          className={`rounded-2xl border ${tone.border} ${tone.centerBg} px-4 py-5 text-center`}
        >
          <div
            className={`text-[11px] font-bold uppercase tracking-wide ${tone.softText}`}
          >
            Remaining Dose Budget{' '}
            {isConservative ? '(EQD2)' : '(With Recovery)'}
          </div>
          <div
            className={`mt-1 text-4xl font-bold leading-none ${overage > 0 ? 'text-red-800' : 'text-gray-950'}`}
          >
            {displayRemaining.toFixed(1)}
          </div>
          <div className="mt-1 text-sm font-semibold text-gray-600">
            Gy EQD2
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {displayPercent.toFixed(0)}% of lifetime tolerance
          </div>
          {isConservative && result.recoveryPercent > 0 && (
            <div className="mt-2 text-xs font-semibold text-teal-700">
              With recovery: {result.remainingBudgetEQD2.toFixed(1)} Gy EQD2
              remaining
            </div>
          )}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-white/80 p-3 text-center">
            <MetricLabel icon={<PriorEQD2Icon />}>Prior EQD2</MetricLabel>
            <div className="mt-1 text-base font-bold text-gray-900">
              {displayPrior.toFixed(1)}
            </div>
            <div className="text-[11px] text-gray-500">Gy</div>
          </div>
          {!isConservative ? (
            <div className="rounded-xl bg-white/80 p-3 text-center">
              <MetricLabel icon={<PriorEQD2Icon />}>
                Effective Prior
              </MetricLabel>
              <div className="mt-1 text-base font-bold text-gray-900">
                {result.effectivePriorEQD2.toFixed(1)}
              </div>
              <div className="text-[11px] text-gray-500">Gy</div>
            </div>
          ) : (
            <div className="rounded-xl bg-white/80 p-3 text-center">
              <div className="flex justify-center">
                <AlphaBetaIcon />
                <span className="sr-only">α/β</span>
              </div>
              <div className="mt-1 text-base font-bold text-gray-900">
                {result.oar.alphaBeta}
              </div>
              <div className="text-[11px] text-gray-500">Gy</div>
            </div>
          )}
          <div className="rounded-xl bg-white/80 p-3 text-center">
            <MetricLabel icon={<ToleranceIcon />}>Tolerance</MetricLabel>
            <div className="mt-1 text-base font-bold text-gray-900">
              {result.oar.lifetimeToleranceEQD2}
            </div>
            <div className="text-[11px] text-gray-500">Gy</div>
          </div>
        </div>

        {!isConservative && result.recoveryPercent > 0 && (
          <div className="mt-3 rounded-xl bg-white/80 px-3 py-2 text-xs text-gray-700">
            Recovery factor: {result.recoveryPercent.toFixed(0)}%
          </div>
        )}

        <div className="mt-4">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-gray-500">
            Physical dose budget
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white/80">
            <table className="w-full table-fixed text-sm">
              <thead>
                <tr className="bg-white/90 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                  <th className="px-3 py-2 text-left">Fractions</th>
                  <th className="px-3 py-2 text-left">Total Dose</th>
                  <th className="px-3 py-2 text-left">Dose/Fx</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {fractionBudgets.map((budget) => (
                  <tr key={budget.fractions}>
                    <td className="px-3 py-2 font-bold text-gray-800">
                      {budget.fractions} fx
                    </td>
                    <td className="px-3 py-2 font-bold text-gray-900">
                      {budget.totalDose.toFixed(1)} Gy
                    </td>
                    <td className="px-3 py-2 text-gray-600">
                      {budget.dosePerFraction.toFixed(1)} Gy/fx
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={customFx ?? ''}
                        onChange={(e) =>
                          setCustomFractions((prev) => ({
                            ...prev,
                            [result.oar.name]: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          }))
                        }
                        className="w-12 rounded-md border border-gray-300 px-1.5 py-1 text-center text-xs focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        placeholder="#"
                        min="1"
                        max="50"
                      />
                      <span className="text-xs font-bold text-gray-700">
                        fx
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 font-bold text-gray-900">
                    {customPhysicalDose !== undefined
                      ? `${customPhysicalDose.toFixed(1)} Gy`
                      : '-'}
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    {customPhysicalDose !== undefined && customFx
                      ? `${(customPhysicalDose / customFx).toFixed(1)} Gy/fx`
                      : 'custom'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <details className="mt-4 rounded-xl border border-gray-200 bg-white/80">
          <summary className="cursor-pointer px-3 py-2 text-xs font-bold text-gray-600">
            Calculation
          </summary>
          <div className="space-y-3 border-t border-gray-200 px-3 py-3 text-xs text-gray-600">
            {result.oar.specialNote && (
              <div className="rounded-lg bg-blue-50 p-3 text-blue-800">
                <strong>Note:</strong> {result.oar.specialNote}
              </div>
            )}
            <div className="rounded-lg bg-white p-3 font-mono">
              <p>Prior EQD2 = {result.priorEQD2.toFixed(1)} Gy</p>
              {!isConservative && result.recoveryPercent > 0 && (
                <p>
                  Effective EQD2 = {result.effectivePriorEQD2.toFixed(1)} Gy
                  after {result.recoveryPercent.toFixed(0)}% recovery
                </p>
              )}
              <p>
                Remaining = {result.oar.lifetimeToleranceEQD2} -{' '}
                {displayPrior.toFixed(1)} = {displayRemaining.toFixed(1)} Gy
              </p>
              <p>α/β = {result.oar.alphaBeta} Gy</p>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
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
          Calculate remaining radiation dose tolerance for organs at risk during
          re-irradiation planning
        </p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Organs at risk</h3>
            <p className="text-sm text-gray-500">
              Tap plus to open an organ card. The budget appears when dose,
              fractions, and months are filled.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {completedOARCount > 0 && (
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
            )}
            <div className="text-xs font-semibold text-gray-500">
              {selectedOARs.length} open · {completedOARCount} with budget
            </div>
            {selectedOARs.length > 0 && (
              <button
                onClick={handleReset}
                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
        {renderOARSelector()}
      </section>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 text-xs text-gray-600">
        <p className="font-semibold mb-2">Clinical Disclaimer</p>
        <p>
          This calculator provides estimates based on standard tissue recovery
          models and cumulative dose constraints. Actual tissue recovery varies
          by organ type, dose distribution, patient factors, and clinical
          context. Results should be used as a{' '}
          <strong>planning guide only</strong> and not as absolute limits. All
          re-irradiation decisions must be made by qualified radiation
          oncologists considering the full clinical picture.
        </p>
      </div>
    </div>
  );
}
