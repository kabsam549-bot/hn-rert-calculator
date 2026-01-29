'use client';

import { useState } from 'react';

// Types
interface PatientEvaluation {
  // Step 1: TCP Factors
  histology: 'scc' | 'non-scc' | '';
  surgicalStatus: 'intact' | 'postop' | '';
  recurrencePattern: 'in-field' | 'marginal' | 'out-of-field' | '';
  recurrenceSite: 'mucosal-op' | 'mucosal-np' | 'mucosal-larynx' | 'mucosal-oc' | 'neck-small' | 'neck-large' | 'skull-base' | 'pns' | '';
  gtvVolume: number | undefined;
  
  // Step 2: NTCP Factors
  reirradiationInterval: number | undefined; // months
  priorDose: number | undefined;
  priorFractions: number | undefined;
  criticalOARsNearby: string[];
  carotidInvolvement: 'none' | 'adjacent' | 'encased' | '';
  
  // Step 3: Technical
  plannedModality: 'sbrt' | 'imrt' | 'pbt' | '';
  plannedDose: number | undefined;
  plannedFractions: number | undefined;
  
  // Step 4: Clinical
  treatmentGoal: 'curative' | 'palliative' | '';
  performanceStatus: 0 | 1 | 2 | 3 | undefined;
  alternativesConsidered: boolean;
}

const initialEvaluation: PatientEvaluation = {
  histology: '',
  surgicalStatus: '',
  recurrencePattern: '',
  recurrenceSite: '',
  gtvVolume: undefined,
  reirradiationInterval: undefined,
  priorDose: undefined,
  priorFractions: undefined,
  criticalOARsNearby: [],
  carotidInvolvement: '',
  plannedModality: '',
  plannedDose: undefined,
  plannedFractions: undefined,
  treatmentGoal: '',
  performanceStatus: undefined,
  alternativesConsidered: false,
};

// Outcome data from MDACC series
const SITE_OUTCOMES = {
  'mucosal-op': { lc: 77, rr: 13, dm: 12, os: 51, pfs: 38, g3Tox: 43 },
  'mucosal-np': { lc: 76, rr: 29, dm: 12, os: 71, pfs: 63, g3Tox: 43 },
  'mucosal-larynx': { lc: 77, rr: 13, dm: 12, os: 51, pfs: 38, g3Tox: 43 },
  'mucosal-oc': { lc: 77, rr: 13, dm: 12, os: 51, pfs: 38, g3Tox: 43 },
  'neck-small': { lc: 89, rr: 18, dm: 18, os: 79, pfs: 57, g3Tox: 15 },
  'neck-large': { lc: 68, rr: 54, dm: 79, os: 36, pfs: 19, g3Tox: 20 },
  'skull-base': { lc: 86, rr: 8, dm: 26, os: 83, pfs: 67, g3Tox: 11 },
  'pns': { lc: 73, rr: 15, dm: 17, os: 72, pfs: 47, g3Tox: 11 },
};

// Volume thresholds (cc) - used in UI text
// favorable: <20cc, moderate: 20-50cc, high: >50cc

export default function MDACCPathway() {
  const [currentStep, setCurrentStep] = useState(1);
  const [evaluation, setEvaluation] = useState<PatientEvaluation>(initialEvaluation);
  const [showResults, setShowResults] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateEvaluation = (field: keyof PatientEvaluation, value: any) => {
    setEvaluation(prev => ({ ...prev, [field]: value }));
  };

  const toggleOAR = (oar: string) => {
    setEvaluation(prev => ({
      ...prev,
      criticalOARsNearby: prev.criticalOARsNearby.includes(oar)
        ? prev.criticalOARsNearby.filter(o => o !== oar)
        : [...prev.criticalOARsNearby, oar]
    }));
  };

  const calculateViability = () => {
    let score = 0;
    const concerns: string[] = [];
    const recommendations: string[] = [];

    // RI Assessment
    if (evaluation.reirradiationInterval !== undefined) {
      if (evaluation.reirradiationInterval < 6) {
        concerns.push('RI <6 months: Generally not recommended');
        score -= 30;
      } else if (evaluation.reirradiationInterval < 12) {
        concerns.push('RI 6-12 months: Caution advised');
        score -= 10;
      } else if (evaluation.reirradiationInterval >= 24) {
        recommendations.push('RI ≥24 months: Favorable for re-RT');
        score += 20;
      }
    }

    // Volume Assessment
    if (evaluation.gtvVolume !== undefined) {
      if (evaluation.gtvVolume <= 20) {
        recommendations.push('GTV ≤20cc: SBRT candidate with good outcomes');
        score += 20;
      } else if (evaluation.gtvVolume <= 50) {
        recommendations.push('GTV 20-50cc: Consider IMRT or careful SBRT');
        score += 5;
      } else {
        concerns.push('GTV >50cc: Higher toxicity risk (>57% G3+)');
        score -= 20;
      }
    }

    // Site Assessment
    if (evaluation.recurrenceSite) {
      const outcomes = SITE_OUTCOMES[evaluation.recurrenceSite as keyof typeof SITE_OUTCOMES];
      if (outcomes) {
        if (outcomes.os >= 70) {
          recommendations.push(`Site: ${outcomes.os}% 2yr OS expected`);
          score += 15;
        } else if (outcomes.os >= 50) {
          score += 5;
        } else {
          concerns.push(`Site: ${outcomes.os}% 2yr OS - consider goals of care`);
          score -= 10;
        }

        if (outcomes.g3Tox > 30) {
          concerns.push(`High toxicity site: ${outcomes.g3Tox}% G3+ expected`);
        }
      }
    }

    // Histology
    if (evaluation.histology === 'non-scc') {
      recommendations.push('Non-SCC histology: Better prognosis (HR 0.24 vs SCC)');
      score += 15;
    } else if (evaluation.histology === 'scc') {
      concerns.push('SCC histology: HR 4.2 for mortality vs non-SCC');
    }

    // Carotid
    if (evaluation.carotidInvolvement === 'encased') {
      concerns.push('Carotid encasement: CBS/BE risk elevated');
      score -= 15;
    } else if (evaluation.carotidInvolvement === 'adjacent') {
      recommendations.push('Carotid adjacent: Apply MDACC constraints (Dmax <30Gy, V27 <0.5cc)');
    }

    // Surgical status
    if (evaluation.surgicalStatus === 'postop') {
      recommendations.push('Postop: Lower dose may suffice (27.5 Gy/5fx for TCP >80%)');
      score += 10;
    }

    // Determine overall viability
    let viability: 'favorable' | 'moderate' | 'unfavorable';
    if (score >= 20) viability = 'favorable';
    else if (score >= -10) viability = 'moderate';
    else viability = 'unfavorable';

    return { score, concerns, recommendations, viability };
  };

  const handleComplete = () => {
    setShowResults(true);
  };

  const handleReset = () => {
    setEvaluation(initialEvaluation);
    setCurrentStep(1);
    setShowResults(false);
  };

  const renderStepIndicator = () => (
    <div className="flex justify-between items-center mb-8 px-4">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <button
            onClick={() => setCurrentStep(step)}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              currentStep === step
                ? 'bg-teal-600 text-white shadow-lg'
                : currentStep > step
                ? 'bg-teal-100 text-teal-700'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {step}
          </button>
          <span className={`ml-2 text-xs font-medium hidden md:block ${
            currentStep === step ? 'text-teal-700' : 'text-gray-500'
          }`}>
            {step === 1 && 'TCP'}
            {step === 2 && 'NTCP'}
            {step === 3 && 'Technical'}
            {step === 4 && 'Clinical'}
          </span>
          {step < 4 && <div className={`w-8 md:w-16 h-1 mx-2 rounded ${currentStep > step ? 'bg-teal-400' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-teal-50 p-4 rounded-lg border-l-4 border-teal-600">
        <h3 className="text-lg font-bold text-teal-900 mb-2">Step 1: Estimate Tumor Control Probability (TCP)</h3>
        <p className="text-sm text-teal-700">Assess factors that influence likelihood of local control</p>
      </div>

      {/* Histology */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Histology</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'scc', label: 'Squamous Cell Carcinoma', sublabel: 'HR 4.2 vs non-SCC' },
            { value: 'non-scc', label: 'Non-SCC', sublabel: 'ACC, SNUC, NPC, etc.' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => updateEvaluation('histology', option.value)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                evaluation.histology === option.value
                  ? 'border-teal-600 bg-teal-50'
                  : 'border-gray-200 hover:border-teal-300'
              }`}
            >
              <span className="font-medium">{option.label}</span>
              <span className="block text-xs text-gray-500 mt-1">{option.sublabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Surgical Status */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Surgical Status</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'intact', label: 'Intact Disease', sublabel: 'No prior resection' },
            { value: 'postop', label: 'Postoperative', sublabel: 'Prior salvage surgery' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => updateEvaluation('surgicalStatus', option.value)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                evaluation.surgicalStatus === option.value
                  ? 'border-teal-600 bg-teal-50'
                  : 'border-gray-200 hover:border-teal-300'
              }`}
            >
              <span className="font-medium">{option.label}</span>
              <span className="block text-xs text-gray-500 mt-1">{option.sublabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recurrence Site */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Recurrence Site</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { value: 'mucosal-op', label: 'Oropharynx', group: 'Mucosal' },
            { value: 'mucosal-np', label: 'Nasopharynx', group: 'Mucosal' },
            { value: 'mucosal-larynx', label: 'Larynx', group: 'Mucosal' },
            { value: 'mucosal-oc', label: 'Oral Cavity', group: 'Mucosal' },
            { value: 'neck-small', label: 'Neck ≤3cm', group: 'Nodal' },
            { value: 'neck-large', label: 'Neck >3cm', group: 'Nodal' },
            { value: 'skull-base', label: 'Skull Base', group: 'Skull Base' },
            { value: 'pns', label: 'Paranasal Sinus', group: 'Skull Base' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => updateEvaluation('recurrenceSite', option.value)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                evaluation.recurrenceSite === option.value
                  ? 'border-teal-600 bg-teal-50'
                  : 'border-gray-200 hover:border-teal-300'
              }`}
            >
              <span className="font-medium text-sm">{option.label}</span>
              <span className={`block text-xs mt-1 ${
                option.group === 'Mucosal' ? 'text-amber-600' :
                option.group === 'Nodal' ? 'text-blue-600' : 'text-green-600'
              }`}>{option.group}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Volume */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">GTV Volume (cc)</label>
        <input
          type="number"
          value={evaluation.gtvVolume ?? ''}
          onChange={(e) => updateEvaluation('gtvVolume', e.target.value ? Number(e.target.value) : undefined)}
          placeholder="e.g., 15"
          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span className="text-green-600">≤20cc: Favorable</span>
          <span className="text-amber-600">20-50cc: Moderate</span>
          <span className="text-red-600">&gt;50cc: High Risk</span>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-600">
        <h3 className="text-lg font-bold text-amber-900 mb-2">Step 2: Assess Normal Tissue Complication Probability (NTCP)</h3>
        <p className="text-sm text-amber-700">Evaluate risks to adjacent critical structures</p>
      </div>

      {/* Reirradiation Interval */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Reirradiation Interval (months)</label>
        <input
          type="number"
          value={evaluation.reirradiationInterval ?? ''}
          onChange={(e) => updateEvaluation('reirradiationInterval', e.target.value ? Number(e.target.value) : undefined)}
          placeholder="Months since prior RT"
          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span className="text-red-600">&lt;6mo: Not recommended</span>
          <span className="text-amber-600">6-12mo: Caution</span>
          <span className="text-green-600">≥24mo: Favorable</span>
        </div>
      </div>

      {/* Prior Dose */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Prior RT Dose (Gy)</label>
          <input
            type="number"
            value={evaluation.priorDose ?? ''}
            onChange={(e) => updateEvaluation('priorDose', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="e.g., 70"
            max={99}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Prior Fractions</label>
          <input
            type="number"
            value={evaluation.priorFractions ?? ''}
            onChange={(e) => updateEvaluation('priorFractions', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="e.g., 35"
            max={99}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 outline-none"
          />
        </div>
      </div>

      {/* Carotid Involvement */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Carotid Involvement</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'none', label: 'None', sublabel: 'CBS risk: baseline' },
            { value: 'adjacent', label: 'Adjacent', sublabel: 'Apply constraints' },
            { value: 'encased', label: 'Encased >180°', sublabel: 'Elevated CBS risk' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => updateEvaluation('carotidInvolvement', option.value)}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                evaluation.carotidInvolvement === option.value
                  ? option.value === 'encased' ? 'border-red-500 bg-red-50' : 'border-teal-600 bg-teal-50'
                  : 'border-gray-200 hover:border-teal-300'
              }`}
            >
              <span className="font-medium text-sm">{option.label}</span>
              <span className="block text-xs text-gray-500 mt-1">{option.sublabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Critical OARs */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Critical Structures Near Target (Tier 1-2)</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            { id: 'brainstem', label: 'Brainstem', tier: 1, limit: '<13 Gy' },
            { id: 'cord', label: 'Spinal Cord', tier: 1, limit: '<12 Gy' },
            { id: 'chiasm', label: 'Optic Chiasm', tier: 1, limit: '<12 Gy' },
            { id: 'carotid', label: 'Carotid', tier: 2, limit: '<30 Gy' },
            { id: 'cochlea', label: 'Cochlea', tier: 2, limit: '<18 Gy' },
            { id: 'larynx', label: 'Larynx', tier: 2, limit: '<13 Gy' },
          ].map((oar) => (
            <button
              key={oar.id}
              onClick={() => toggleOAR(oar.id)}
              className={`p-2 rounded border-2 text-left text-sm transition-all ${
                evaluation.criticalOARsNearby.includes(oar.id)
                  ? oar.tier === 1 ? 'border-red-500 bg-red-50' : 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="font-medium">{oar.label}</span>
              <span className={`block text-xs ${oar.tier === 1 ? 'text-red-600' : 'text-amber-600'}`}>
                Tier {oar.tier}: {oar.limit}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
        <h3 className="text-lg font-bold text-blue-900 mb-2">Step 3: Evaluate Technical Feasibility</h3>
        <p className="text-sm text-blue-700">Determine achievable dose-gradient and modality selection</p>
      </div>

      {/* Modality */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Planned Modality</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'sbrt', label: 'SBRT', sublabel: 'Best for GTV <25cc', recommend: evaluation.gtvVolume && evaluation.gtvVolume <= 25 },
            { value: 'imrt', label: 'IMRT', sublabel: 'Larger volumes, postop', recommend: evaluation.gtvVolume && evaluation.gtvVolume > 25 },
            { value: 'pbt', label: 'Proton', sublabel: 'Skull base, complex', recommend: evaluation.recurrenceSite?.includes('skull') },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => updateEvaluation('plannedModality', option.value)}
              className={`p-4 rounded-lg border-2 text-center transition-all relative ${
                evaluation.plannedModality === option.value
                  ? 'border-teal-600 bg-teal-50'
                  : 'border-gray-200 hover:border-teal-300'
              }`}
            >
              {option.recommend && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                  Recommended
                </span>
              )}
              <span className="font-bold">{option.label}</span>
              <span className="block text-xs text-gray-500 mt-1">{option.sublabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Planned Dose */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Planned Dose (Gy)</label>
          <input
            type="number"
            value={evaluation.plannedDose ?? ''}
            onChange={(e) => updateEvaluation('plannedDose', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="e.g., 45"
            max={99}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Planned Fractions</label>
          <input
            type="number"
            value={evaluation.plannedFractions ?? ''}
            onChange={(e) => updateEvaluation('plannedFractions', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="e.g., 5"
            max={99}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 outline-none"
          />
        </div>
      </div>

      {/* SBRT Dose Recommendations */}
      {evaluation.plannedModality === 'sbrt' && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-bold text-gray-800 mb-3">MDACC SBRT Dose Options</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Regimen</th>
                  <th className="text-left py-2">EQD2</th>
                  <th className="text-left py-2">LC</th>
                  <th className="text-left py-2">Context</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr className={evaluation.plannedDose === 45 && evaluation.plannedFractions === 5 ? 'bg-teal-50' : ''}>
                  <td className="py-2 font-medium">45 Gy / 5 fx</td>
                  <td className="py-2">71-80 Gy</td>
                  <td className="py-2 text-green-600">~90%</td>
                  <td className="py-2 text-xs">Non-mucosal, high-grade</td>
                </tr>
                <tr className={evaluation.plannedDose === 40 && evaluation.plannedFractions === 5 ? 'bg-teal-50' : ''}>
                  <td className="py-2 font-medium">40 Gy / 5 fx</td>
                  <td className="py-2">60-67 Gy</td>
                  <td className="py-2 text-green-600">75-85%</td>
                  <td className="py-2 text-xs">Moderate-dose, nodal</td>
                </tr>
                <tr className={evaluation.plannedDose === 36 && evaluation.plannedFractions === 4 ? 'bg-teal-50' : ''}>
                  <td className="py-2 font-medium">36 Gy / 4 fx</td>
                  <td className="py-2">57-64 Gy</td>
                  <td className="py-2 text-amber-600">70-80%</td>
                  <td className="py-2 text-xs">Small tumors, non-SCC</td>
                </tr>
                <tr className={evaluation.plannedDose === 27 && evaluation.plannedFractions === 3 ? 'bg-teal-50' : ''}>
                  <td className="py-2 font-medium">27 Gy / 3 fx</td>
                  <td className="py-2">43-48 Gy</td>
                  <td className="py-2 text-amber-600">65-73%</td>
                  <td className="py-2 text-xs">High-risk mucosal, palliative</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Technical Notes */}
      <div className="bg-blue-50 p-3 rounded text-sm">
        <p className="font-medium text-blue-800">Technical Considerations:</p>
        <ul className="list-disc list-inside text-blue-700 mt-1 space-y-1">
          <li>LINAC/VMAT: ~8% dose reduction per mm achievable</li>
          <li>GK/CK: Best conformity for tumors &lt;15cc</li>
          <li>PTV expansion: Typically 2mm for setup uncertainty</li>
        </ul>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
        <h3 className="text-lg font-bold text-purple-900 mb-2">Step 4: Integrate Clinical Judgment</h3>
        <p className="text-sm text-purple-700">Final assessment of treatment goals and alternatives</p>
      </div>

      {/* Treatment Goal */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Treatment Goal</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'curative', label: 'Curative Intent', sublabel: 'Long-term local control' },
            { value: 'palliative', label: 'Palliative', sublabel: 'Symptom control, QOL' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => updateEvaluation('treatmentGoal', option.value)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                evaluation.treatmentGoal === option.value
                  ? 'border-teal-600 bg-teal-50'
                  : 'border-gray-200 hover:border-teal-300'
              }`}
            >
              <span className="font-medium">{option.label}</span>
              <span className="block text-xs text-gray-500 mt-1">{option.sublabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Performance Status */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">ECOG Performance Status</label>
        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((ps) => (
            <button
              key={ps}
              onClick={() => updateEvaluation('performanceStatus', ps as 0 | 1 | 2 | 3)}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                evaluation.performanceStatus === ps
                  ? ps <= 1 ? 'border-green-500 bg-green-50' : 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="font-bold">{ps}</span>
              <span className="block text-xs text-gray-500 mt-1">
                {ps === 0 && 'Fully active'}
                {ps === 1 && 'Restricted'}
                {ps === 2 && 'Ambulatory'}
                {ps === 3 && 'Limited self-care'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Alternatives Considered */}
      <div>
        <label className="flex items-center p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
          <input
            type="checkbox"
            checked={evaluation.alternativesConsidered}
            onChange={(e) => updateEvaluation('alternativesConsidered', e.target.checked)}
            className="h-5 w-5 text-teal-600 rounded"
          />
          <div className="ml-3">
            <span className="font-medium text-gray-700">Alternatives Discussed</span>
            <span className="block text-xs text-gray-500">Surgery, systemic therapy, observation considered in MDT</span>
          </div>
        </label>
      </div>
    </div>
  );

  const renderResults = () => {
    const results = calculateViability();
    const outcomes = evaluation.recurrenceSite ? SITE_OUTCOMES[evaluation.recurrenceSite as keyof typeof SITE_OUTCOMES] : null;

    return (
      <div className="space-y-6">
        {/* Viability Summary */}
        <div className={`p-6 rounded-lg border-2 ${
          results.viability === 'favorable' ? 'bg-green-50 border-green-500' :
          results.viability === 'moderate' ? 'bg-amber-50 border-amber-500' :
          'bg-red-50 border-red-500'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">
                Re-Irradiation Viability: {' '}
                <span className={
                  results.viability === 'favorable' ? 'text-green-700' :
                  results.viability === 'moderate' ? 'text-amber-700' :
                  'text-red-700'
                }>
                  {results.viability.toUpperCase()}
                </span>
              </h3>
              <p className="text-sm text-gray-600 mt-1">Based on MDACC evaluation criteria</p>
            </div>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
              results.viability === 'favorable' ? 'bg-green-500 text-white' :
              results.viability === 'moderate' ? 'bg-amber-500 text-white' :
              'bg-red-500 text-white'
            }`}>
              {results.viability === 'favorable' ? '✓' : results.viability === 'moderate' ? '?' : '!'}
            </div>
          </div>
        </div>

        {/* Expected Outcomes */}
        {outcomes && (
          <div className="bg-white p-5 rounded-lg border shadow-sm">
            <h4 className="font-bold text-gray-800 mb-4">Expected 2-Year Outcomes (MDACC Data)</h4>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { label: 'Local Control', value: outcomes.lc, color: 'teal' },
                { label: 'Regional Recurrence', value: outcomes.rr, color: 'amber', invert: true },
                { label: 'Distant Mets', value: outcomes.dm, color: 'amber', invert: true },
                { label: 'Overall Survival', value: outcomes.os, color: 'blue' },
                { label: 'PFS', value: outcomes.pfs, color: 'purple' },
                { label: 'G3+ Toxicity', value: outcomes.g3Tox, color: 'red', invert: true },
              ].map((metric) => (
                <div key={metric.label} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className={`text-2xl font-bold ${
                    metric.invert 
                      ? (metric.value > 30 ? 'text-red-600' : metric.value > 15 ? 'text-amber-600' : 'text-green-600')
                      : (metric.value >= 70 ? 'text-green-600' : metric.value >= 50 ? 'text-amber-600' : 'text-red-600')
                  }`}>
                    {metric.value}%
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {results.recommendations.length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-bold text-green-800 mb-2">Favorable Factors</h4>
            <ul className="space-y-1">
              {results.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start text-sm text-green-700">
                  <span className="mr-2">✓</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Concerns */}
        {results.concerns.length > 0 && (
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h4 className="font-bold text-amber-800 mb-2">Concerns / Considerations</h4>
            <ul className="space-y-1">
              {results.concerns.map((concern, i) => (
                <li key={i} className="flex items-start text-sm text-amber-700">
                  <span className="mr-2">⚠</span>
                  {concern}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* MDACC Constraints Reminder */}
        {evaluation.plannedModality === 'sbrt' && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-bold text-blue-800 mb-2">MDACC SBRT Constraints to Apply</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-blue-700">
                <span className="font-medium">Tier 1 (Go/No-Go):</span>
                <ul className="list-disc list-inside ml-2">
                  <li>Brainstem: Dmax &lt;13 Gy</li>
                  <li>Cord: Dmax &lt;12 Gy</li>
                  <li>Chiasm: Dmax &lt;12 Gy</li>
                </ul>
              </div>
              <div className="text-blue-700">
                <span className="font-medium">Tier 2 (Critical):</span>
                <ul className="list-disc list-inside ml-2">
                  <li>Carotid: Dmax &lt;30 Gy, V27 &lt;0.5cc</li>
                  <li>Cochlea: Dmax &lt;18 Gy</li>
                  <li>Larynx: Dmax &lt;13 Gy</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleReset}
            className="flex-1 py-3 px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Start New Evaluation
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
          >
            Print Summary
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {!showResults ? (
        <>
          {renderStepIndicator()}
          
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              Previous
            </button>
            
            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors shadow-lg"
              >
                Generate Assessment
              </button>
            )}
          </div>
        </>
      ) : (
        renderResults()
      )}
    </div>
  );
}
