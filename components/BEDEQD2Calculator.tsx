'use client';

import { useMemo, useState } from 'react';
import {
  ALPHA_BETA_RATIOS,
  calculateBEDAndEQD2,
  getDosePerFraction,
} from '@/lib/bedCalculations';
import Tooltip from './Tooltip';

type RegimenCategory = 'sbrt' | 'conventional' | 'palliative' | 'custom';

interface Regimen {
  id: string;
  label: string;
  dose: number;
  fractions: number;
  category: RegimenCategory;
  note: string;
}

interface CalculationCard extends Regimen {
  alphaBeta: number;
}

interface CalculatedCard extends CalculationCard {
  dosePerFraction: number;
  bed: number;
  eqd2: number;
}

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

const CATEGORY_STYLES: Record<
  RegimenCategory,
  {
    dot: string;
  }
> = {
  sbrt: {
    dot: 'bg-teal-500',
  },
  conventional: {
    dot: 'bg-blue-500',
  },
  palliative: {
    dot: 'bg-amber-500',
  },
  custom: {
    dot: 'bg-gray-400',
  },
};

const ALPHA_BETA_REFERENCE = (
  <div className="space-y-2">
    <div className="font-semibold text-white">Common alpha/beta values</div>
    <div className="space-y-1.5 text-gray-100">
      <div className="flex justify-between gap-4">
        <span>Tumor / early tissue</span>
        <span className="font-semibold text-white">10 Gy</span>
      </div>
      <div className="flex justify-between gap-4">
        <span>CNS / optic / cord</span>
        <span className="font-semibold text-white">2 Gy</span>
      </div>
      <div className="flex justify-between gap-4">
        <span>Most late H&N OARs</span>
        <span className="font-semibold text-white">3 Gy</span>
      </div>
      <div className="flex justify-between gap-4">
        <span>Salivary / larynx / pharynx</span>
        <span className="font-semibold text-white">~3 Gy</span>
      </div>
    </div>
  </div>
);

function parsePositiveNumber(value: string): number | undefined {
  if (value.trim() === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function isValidRegimen(dose?: number, fractions?: number): boolean {
  return (
    dose !== undefined &&
    dose > 0 &&
    fractions !== undefined &&
    Number.isInteger(fractions) &&
    fractions > 0
  );
}

function calculateCard(card: CalculationCard): CalculatedCard {
  const { bed, eqd2 } = calculateBEDAndEQD2(
    card.dose,
    card.fractions,
    card.alphaBeta,
  );
  return {
    ...card,
    dosePerFraction: getDosePerFraction(card.dose, card.fractions),
    bed,
    eqd2,
  };
}

function formatDose(value: number): string {
  return value.toFixed(value >= 10 ? 1 : 2);
}

function formatAlphaBeta(value: number): string {
  return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1);
}

function createCardId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function BEDEQD2Calculator() {
  const [dose, setDose] = useState<number | undefined>(36);
  const [fractions, setFractions] = useState<number | undefined>(4);
  const [alphaBeta, setAlphaBeta] = useState<number>(
    ALPHA_BETA_RATIOS.TUMOR_EARLY,
  );
  const [cards, setCards] = useState<CalculationCard[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState(
    STANDARD_REGIMENS[2].id,
  );
  const [showFormula, setShowFormula] = useState(false);

  const currentCard = useMemo<CalculationCard | undefined>(() => {
    if (
      !isValidRegimen(dose, fractions) ||
      alphaBeta <= 0 ||
      dose === undefined ||
      fractions === undefined
    ) {
      return undefined;
    }

    return {
      id: 'current-regimen',
      label: `${formatDose(dose)} Gy / ${fractions} fx`,
      dose,
      fractions,
      category: 'custom',
      note: 'Live Calculator',
      alphaBeta,
    };
  }, [alphaBeta, dose, fractions]);

  const currentResult = useMemo(() => {
    if (!currentCard) {
      return undefined;
    }

    try {
      return calculateCard(currentCard);
    } catch {
      return undefined;
    }
  }, [currentCard]);

  const calculatedCards = useMemo(
    () => cards.map((card) => calculateCard(card)),
    [cards],
  );

  const selectedPreset = useMemo(
    () =>
      STANDARD_REGIMENS.find((regimen) => regimen.id === selectedPresetId) ??
      STANDARD_REGIMENS[0],
    [selectedPresetId],
  );

  const addCurrentCard = () => {
    if (!currentCard) {
      return;
    }

    setCards((prev) => [
      {
        ...currentCard,
        id: createCardId('custom'),
        note: 'Added from calculator',
      },
      ...prev,
    ]);
  };

  const addPresetCard = () => {
    if (alphaBeta <= 0) {
      return;
    }

    setCards((prev) => [
      {
        ...selectedPreset,
        id: createCardId(selectedPreset.id),
        alphaBeta,
      },
      ...prev,
    ]);
  };

  const removeCard = (cardId: string) => {
    setCards((prev) => prev.filter((card) => card.id !== cardId));
  };

  const renderMetric = (
    label: string,
    value: string,
    unit: string,
    tone: 'gray' | 'teal' | 'blue',
  ) => {
    const toneClass =
      tone === 'teal'
        ? 'bg-teal-50 text-teal-900 border-teal-200'
        : tone === 'blue'
          ? 'bg-blue-50 text-blue-900 border-blue-200'
          : 'bg-gray-50 text-gray-900 border-gray-200';
    const labelClass =
      tone === 'teal'
        ? 'text-teal-700'
        : tone === 'blue'
          ? 'text-blue-700'
          : 'text-gray-500';

    return (
      <div className={`rounded-xl border p-3 text-center ${toneClass}`}>
        <div className={`text-[11px] font-bold uppercase ${labelClass}`}>
          {label}
        </div>
        <div className="mt-1 text-xl font-bold leading-none">{value}</div>
        <div className={`mt-1 text-[11px] font-semibold ${labelClass}`}>
          {unit}
        </div>
      </div>
    );
  };

  const renderCalculationCard = (card: CalculatedCard) => {
    const categoryStyle = CATEGORY_STYLES[card.category];

    return (
      <article
        key={card.id}
        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 bg-white px-4 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${categoryStyle.dot}`}
              />
              <h4 className="truncate text-sm font-bold text-gray-900">
                {card.label}
              </h4>
            </div>
            <div className="mt-1 min-w-0 truncate text-xs text-gray-500">
              {card.note}
            </div>
          </div>
          <button
            type="button"
            onClick={() => removeCard(card.id)}
            aria-label={`Remove ${card.label}`}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 12H4"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-3 p-4">
          <div className="grid grid-cols-3 gap-2">
            {renderMetric(
              'Dose/Fx',
              formatDose(card.dosePerFraction),
              'Gy',
              'gray',
            )}
            {renderMetric('BED', formatDose(card.bed), 'Gy', 'teal')}
            {renderMetric('EQD2', formatDose(card.eqd2), 'Gy', 'blue')}
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-xl bg-gray-50 p-3 text-center text-xs">
            <div>
              <div className="font-bold text-gray-900">
                {formatDose(card.dose)}
              </div>
              <div className="text-gray-500">Gy</div>
            </div>
            <div>
              <div className="font-bold text-gray-900">{card.fractions}</div>
              <div className="text-gray-500">fractions</div>
            </div>
            <div>
              <div className="font-bold text-gray-900">
                {formatAlphaBeta(card.alphaBeta)}
              </div>
              <div className="text-gray-500">alpha/beta</div>
            </div>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="rounded-lg bg-gradient-to-r from-teal-600 to-teal-700 p-6 text-white shadow-lg">
        <h1 className="mb-2 text-3xl font-bold">BED / EQD2 Calculator</h1>
        <p className="text-teal-100">
          Convert dose and fractionation into biologically effective dose and
          equivalent 2 Gy dose.
        </p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Live Calculator
            </h3>
            <p className="text-sm text-gray-500">
              Enter dose, fractions, and alpha/beta. Save the current
              calculation as a card when needed.
            </p>
          </div>
          <div className="text-xs font-semibold text-gray-500">
            {cards.length} saved
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid gap-3 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-500">
                Total Dose
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={dose ?? ''}
                  onChange={(event) =>
                    setDose(parsePositiveNumber(event.target.value))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-3 pr-12 text-base focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
                  min="0"
                  max="200"
                  step="0.1"
                  inputMode="decimal"
                />
                <span className="pointer-events-none absolute right-3 top-3.5 text-sm text-gray-500">
                  Gy
                </span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-500">
                Fractions
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={fractions ?? ''}
                  onChange={(event) =>
                    setFractions(parsePositiveNumber(event.target.value))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-3 pr-12 text-base focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
                  min="1"
                  max="99"
                  step="1"
                  inputMode="numeric"
                />
                <span className="pointer-events-none absolute right-3 top-3.5 text-sm text-gray-500">
                  fx
                </span>
              </div>
            </div>

            <div>
              <label className="mb-1 flex items-center text-[11px] font-bold uppercase tracking-wide text-gray-500">
                alpha/beta
                <Tooltip content={ALPHA_BETA_REFERENCE} />
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={alphaBeta > 0 ? alphaBeta : ''}
                  onChange={(event) => {
                    setAlphaBeta(parsePositiveNumber(event.target.value) ?? 0);
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-3 pr-12 text-base focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
                  min="0.1"
                  max="30"
                  step="0.1"
                  inputMode="decimal"
                />
                <span className="pointer-events-none absolute right-3 top-3.5 text-sm text-gray-500">
                  Gy
                </span>
              </div>
            </div>
          </div>

          {currentResult ? (
            <div className="rounded-2xl border border-teal-200 bg-teal-50/70 p-3 shadow-sm sm:p-4">
              <div className="grid gap-2 sm:grid-cols-3">
                {renderMetric(
                  'Dose/Fx',
                  formatDose(currentResult.dosePerFraction),
                  'Gy',
                  'gray',
                )}
                {renderMetric('BED', formatDose(currentResult.bed), 'Gy', 'teal')}
                {renderMetric(
                  'EQD2',
                  formatDose(currentResult.eqd2),
                  'Gy',
                  'blue',
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Enter a positive dose, whole-number fractions, and alpha/beta
              above 0.
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={addCurrentCard}
              disabled={!currentResult}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold transition-colors ${
                currentResult
                  ? 'bg-teal-600 text-white hover:bg-teal-700'
                  : 'cursor-not-allowed bg-gray-200 text-gray-500'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add current calculation
            </button>
            <button
              type="button"
              onClick={() => setShowFormula((value) => !value)}
              className="rounded-full border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 sm:w-48"
            >
              Detailed Information
            </button>
          </div>

          {showFormula && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <div className="space-y-1 font-mono text-xs">
                <div>d = total dose / fractions</div>
                <div>BED = D x (1 + d / (alpha/beta))</div>
                <div>EQD2 = BED / (1 + 2 / (alpha/beta))</div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Calculation cards
            </h3>
            <p className="text-sm text-gray-500">
              Add predefined or custom calculations, then use the cards to scan
              BED and EQD2 values.
            </p>
          </div>
          {cards.length > 0 && (
            <button
              type="button"
              onClick={() => setCards([])}
              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              Clear cards
            </button>
          )}
        </div>

        <div className="mb-4 rounded-2xl border border-gray-200 bg-gray-50 p-3">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-500">
                Predefined dose
              </label>
              <select
                value={selectedPresetId}
                onChange={(event) => setSelectedPresetId(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm font-semibold text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
              >
                {STANDARD_REGIMENS.map((regimen) => (
                  <option key={regimen.id} value={regimen.id}>
                    {regimen.label} - {regimen.note}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={addPresetCard}
              disabled={alphaBeta <= 0}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold transition-colors ${
                alphaBeta > 0
                  ? 'bg-teal-600 text-white hover:bg-teal-700'
                  : 'cursor-not-allowed bg-gray-200 text-gray-500'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add preset
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Presets use the current alpha/beta value:{' '}
            {alphaBeta > 0 ? `${formatAlphaBeta(alphaBeta)} Gy` : 'enter a value above 0'}.
          </div>
        </div>

        {calculatedCards.length > 0 ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {calculatedCards.map((card) => renderCalculationCard(card))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
            No calculation cards yet. Add the working calculation or choose a
            predefined dose from the dropdown.
          </div>
        )}
      </section>

      <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 text-xs text-gray-600">
        <p className="mb-2 font-semibold">Clinical Disclaimer</p>
        <p>
          BED and EQD2 are linear-quadratic model estimates. They do not account
          for dose heterogeneity, volume, retreatment interval, tissue recovery,
          concurrent systemic therapy, or patient-specific risk. Use alongside
          anatomy-specific OAR review and multidisciplinary clinical judgment.
        </p>
      </div>
    </div>
  );
}
