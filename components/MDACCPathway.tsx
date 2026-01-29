'use client';

import { useState } from 'react';

// Types
interface PatientEvaluation {
  // Step 1: TCP Factors
  histology: 'scc' | 'non-scc' | '';
  surgicalStatus: 'intact' | 'postop' | '';
  recurrenceSite: 'mucosal-op' | 'mucosal-np' | 'mucosal-larynx' | 'mucosal-oc' | 'neck-small' | 'neck-large' | 'skull-base' | 'pns' | '';
  gtvVolume: number | undefined;
  ctvVolume: number | undefined;
  
  // Step 2: NTCP Factors
  reirradiationInterval: number | undefined;
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
}

const initialEvaluation: PatientEvaluation = {
  histology: '',
  surgicalStatus: '',
  recurrenceSite: '',
  gtvVolume: undefined,
  ctvVolume: undefined,
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
};

// MDACC Outcome Data
const SITE_OUTCOMES = {
  'mucosal-op': { lc: 77, rr: 13, dm: 12, os: 51, pfs: 38, g3Tox: 43, label: 'Oropharynx' },
  'mucosal-np': { lc: 76, rr: 29, dm: 12, os: 71, pfs: 63, g3Tox: 43, label: 'Nasopharynx' },
  'mucosal-larynx': { lc: 77, rr: 13, dm: 12, os: 51, pfs: 38, g3Tox: 43, label: 'Larynx' },
  'mucosal-oc': { lc: 77, rr: 13, dm: 12, os: 51, pfs: 38, g3Tox: 43, label: 'Oral Cavity' },
  'neck-small': { lc: 89, rr: 18, dm: 18, os: 79, pfs: 57, g3Tox: 15, label: 'Neck ≤3cm' },
  'neck-large': { lc: 68, rr: 54, dm: 79, os: 36, pfs: 19, g3Tox: 20, label: 'Neck >3cm' },
  'skull-base': { lc: 86, rr: 8, dm: 26, os: 83, pfs: 67, g3Tox: 11, label: 'Skull Base' },
  'pns': { lc: 73, rr: 15, dm: 17, os: 72, pfs: 47, g3Tox: 11, label: 'Paranasal Sinus' },
};

// Volume thresholds from MDACC data
const VOLUME_DATA = {
  gtv: [
    { threshold: '<15 cc', modality: 'IMRT', outcome: 'Improved LC', toxicity: 'Less acute/late', ref: 'Ward et al' },
    { threshold: '<25 cc', modality: 'SBRT', outcome: 'Improved LC & OS', toxicity: 'Less severe', ref: 'Vargo et al' },
    { threshold: '>20 cc', modality: 'SBRT', outcome: 'Reduced OS', toxicity: 'No difference', ref: 'Diao et al' },
  ],
  ctv: [
    { threshold: '<25 cc', modality: 'IMRT/PBT', outcome: 'NS', toxicity: 'No G3+', ref: 'Holliday et al' },
    { threshold: '<50 cc', modality: 'IMRT/PBT', outcome: 'NS', toxicity: 'G3+ <21%', ref: 'Takiar, Phan' },
    { threshold: '>50 cc', modality: 'Any', outcome: 'Reduced', toxicity: 'G3+ >57%', ref: 'MDACC Series' },
  ],
};

// SVG Icons
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const CheckIconSmall = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

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

  const getVolumeRisk = () => {
    const gtv = evaluation.gtvVolume;
    const ctv = evaluation.ctvVolume;
    
    if (gtv !== undefined) {
      if (gtv <= 15) return { level: 'low', text: 'Favorable', color: 'green' };
      if (gtv <= 25) return { level: 'moderate', text: 'Acceptable', color: 'amber' };
      return { level: 'high', text: 'Elevated Risk', color: 'red' };
    }
    if (ctv !== undefined) {
      if (ctv <= 25) return { level: 'low', text: 'Favorable', color: 'green' };
      if (ctv <= 50) return { level: 'moderate', text: 'Acceptable', color: 'amber' };
      return { level: 'high', text: 'High Risk (G3+ >57%)', color: 'red' };
    }
    return null;
  };

  const calculateViability = () => {
    let score = 0;
    const concerns: string[] = [];
    const recommendations: string[] = [];

    // RI Assessment
    if (evaluation.reirradiationInterval !== undefined) {
      if (evaluation.reirradiationInterval < 6) {
        concerns.push('Reirradiation interval <6 months is generally not recommended');
        score -= 30;
      } else if (evaluation.reirradiationInterval < 12) {
        concerns.push('Reirradiation interval 6-12 months requires careful consideration');
        score -= 10;
      } else if (evaluation.reirradiationInterval >= 24) {
        recommendations.push('Reirradiation interval >=24 months is favorable (MIRI Class I eligible)');
        score += 20;
      } else {
        recommendations.push('Reirradiation interval 12-24 months is acceptable');
        score += 10;
      }
    }

    // Volume Assessment
    const volumeRisk = getVolumeRisk();
    if (volumeRisk) {
      if (volumeRisk.level === 'low') {
        recommendations.push('Tumor volume is favorable for re-irradiation');
        score += 20;
      } else if (volumeRisk.level === 'high') {
        concerns.push('Large tumor volume associated with higher toxicity (>57% G3+ when CTV >50cc)');
        score -= 20;
      }
    }

    // Site Assessment
    if (evaluation.recurrenceSite) {
      const outcomes = SITE_OUTCOMES[evaluation.recurrenceSite as keyof typeof SITE_OUTCOMES];
      if (outcomes) {
        if (outcomes.os >= 70) {
          recommendations.push(`${outcomes.label}: Favorable site with ${outcomes.os}% 2-year OS expected`);
          score += 15;
        } else if (outcomes.os < 50) {
          concerns.push(`${outcomes.label}: ${outcomes.os}% 2-year OS - careful patient selection advised`);
          score -= 10;
        }
        if (outcomes.g3Tox > 30) {
          concerns.push(`${outcomes.label}: High toxicity expected (${outcomes.g3Tox}% G3+)`);
        }
      }
    }

    // Histology
    if (evaluation.histology === 'non-scc') {
      recommendations.push('Non-SCC histology associated with better outcomes (HR 0.24 vs SCC)');
      score += 15;
    } else if (evaluation.histology === 'scc') {
      concerns.push('SCC histology: HR 4.2 for mortality compared to non-SCC');
    }

    // Carotid
    if (evaluation.carotidInvolvement === 'encased') {
      concerns.push('Carotid encasement >180 deg increases CBS/BE risk significantly');
      score -= 15;
    } else if (evaluation.carotidInvolvement === 'adjacent') {
      recommendations.push('Carotid adjacent to target: Apply MDACC constraints (Dmax <30Gy, V27 <0.5cc)');
    }

    // Surgical status
    if (evaluation.surgicalStatus === 'postop') {
      recommendations.push('Postoperative setting may allow lower doses (27.5 Gy/5fx for TCP >80% after GTR)');
      score += 10;
    }

    // Performance Status
    if (evaluation.performanceStatus !== undefined) {
      if (evaluation.performanceStatus >= 2) {
        concerns.push('ECOG PS >=2 associated with poorer outcomes');
        score -= 10;
      }
    }

    let viability: 'favorable' | 'conditional' | 'unfavorable';
    if (score >= 15) viability = 'favorable';
    else if (score >= -10) viability = 'conditional';
    else viability = 'unfavorable';

    return { score, concerns, recommendations, viability };
  };

  const renderStepIndicator = () => (
    <div className="bg-white border-b">
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Progress bar background */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">MDACC 4-Step Evaluation</span>
            <span className="text-xs text-gray-400">Step {currentStep} of 4</span>
          </div>
          {/* Track */}
          <div className="relative h-1 bg-gray-200 rounded-full mb-4">
            <div 
              className="absolute h-1 bg-teal-500 rounded-full transition-all duration-300" 
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            />
          </div>
          {/* Step buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { num: 1, label: 'TCP', fullLabel: 'Tumor Control' },
              { num: 2, label: 'NTCP', fullLabel: 'Normal Tissue' },
              { num: 3, label: 'Technical', fullLabel: 'Feasibility' },
              { num: 4, label: 'Clinical', fullLabel: 'Judgment' },
            ].map((step) => (
              <button
                key={step.num}
                onClick={() => setCurrentStep(step.num)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all ${
                  currentStep === step.num
                    ? 'bg-teal-50 border-2 border-teal-500'
                    : currentStep > step.num
                    ? 'bg-teal-50/50 border border-teal-200'
                    : 'bg-gray-50 border border-gray-200 opacity-60 hover:opacity-80'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  currentStep === step.num
                    ? 'bg-teal-600 text-white'
                    : currentStep > step.num
                    ? 'bg-teal-200 text-teal-700'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {currentStep > step.num ? <CheckIcon /> : step.num}
                </div>
                <div className="min-w-0">
                  <span className={`text-xs font-bold block truncate ${
                    currentStep === step.num ? 'text-teal-700' : 'text-gray-500'
                  }`}>{step.label}</span>
                  <span className="text-[10px] text-gray-400 hidden md:block truncate">{step.fullLabel}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-l-4 border-teal-600 pl-4">
        <h2 className="text-xl font-bold text-gray-900">Step 1: Estimate Tumor Control Probability</h2>
        <p className="text-gray-600 mt-1">Assess factors that influence likelihood of local control</p>
      </div>

      {/* Histology */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">Tumor Histology</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { value: 'scc', label: 'Squamous Cell Carcinoma', note: 'HR 4.2 for mortality vs non-SCC' },
            { value: 'non-scc', label: 'Non-Squamous', note: 'ACC, SNUC, NPC, Adenocarcinoma' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateEvaluation('histology', opt.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                evaluation.histology === opt.value
                  ? 'border-teal-500 bg-teal-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="font-semibold text-gray-900">{opt.label}</div>
              <div className="text-xs text-gray-500 mt-1">{opt.note}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Surgical Status */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">Disease Status</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { value: 'intact', label: 'Gross Disease', note: 'Intact, unresected tumor' },
            { value: 'postop', label: 'Postoperative', note: 'Prior salvage surgery' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateEvaluation('surgicalStatus', opt.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                evaluation.surgicalStatus === opt.value
                  ? 'border-teal-500 bg-teal-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="font-semibold text-gray-900">{opt.label}</div>
              <div className="text-xs text-gray-500 mt-1">{opt.note}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recurrence Site */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">Recurrence Location</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: 'skull-base', label: 'Skull Base', cat: 'skull', catColor: 'emerald' },
            { value: 'pns', label: 'Paranasal Sinus', cat: 'skull', catColor: 'emerald' },
            { value: 'neck-small', label: 'Neck <=3cm', cat: 'nodal', catColor: 'blue' },
            { value: 'neck-large', label: 'Neck >3cm', cat: 'nodal', catColor: 'blue' },
            { value: 'mucosal-op', label: 'Oropharynx', cat: 'mucosal', catColor: 'amber' },
            { value: 'mucosal-np', label: 'Nasopharynx', cat: 'mucosal', catColor: 'amber' },
            { value: 'mucosal-larynx', label: 'Larynx', cat: 'mucosal', catColor: 'amber' },
            { value: 'mucosal-oc', label: 'Oral Cavity', cat: 'mucosal', catColor: 'amber' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateEvaluation('recurrenceSite', opt.value)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                evaluation.recurrenceSite === opt.value
                  ? 'border-teal-500 bg-teal-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-sm text-gray-900">{opt.label}</div>
              <div className={`text-xs mt-1 ${
                opt.catColor === 'emerald' ? 'text-emerald-600' :
                opt.catColor === 'blue' ? 'text-blue-600' : 'text-amber-600'
              }`}>
                {opt.cat === 'skull' ? 'Skull Base' : opt.cat === 'nodal' ? 'Nodal' : 'Mucosal'}
              </div>
            </button>
          ))}
        </div>
        {evaluation.recurrenceSite && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-2">Expected 2-Year Outcomes (MDACC Data)</div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-teal-600">
                  {SITE_OUTCOMES[evaluation.recurrenceSite as keyof typeof SITE_OUTCOMES]?.lc}%
                </div>
                <div className="text-xs text-gray-500">Local Control</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {SITE_OUTCOMES[evaluation.recurrenceSite as keyof typeof SITE_OUTCOMES]?.os}%
                </div>
                <div className="text-xs text-gray-500">Overall Survival</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${
                  (SITE_OUTCOMES[evaluation.recurrenceSite as keyof typeof SITE_OUTCOMES]?.g3Tox || 0) > 30 
                    ? 'text-red-500' : 'text-green-600'
                }`}>
                  {SITE_OUTCOMES[evaluation.recurrenceSite as keyof typeof SITE_OUTCOMES]?.g3Tox}%
                </div>
                <div className="text-xs text-gray-500">G3+ Toxicity</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Volume */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">Tumor Volume</label>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">GTV (cc)</label>
            <input
              type="number"
              value={evaluation.gtvVolume ?? ''}
              onChange={(e) => updateEvaluation('gtvVolume', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="e.g., 15"
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">CTV (cc) - optional</label>
            <input
              type="number"
              value={evaluation.ctvVolume ?? ''}
              onChange={(e) => updateEvaluation('ctvVolume', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="e.g., 35"
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>
        
        {/* Volume Risk Indicator */}
        {getVolumeRisk() && (
          <div className={`p-3 rounded-lg ${
            getVolumeRisk()?.color === 'green' ? 'bg-green-50 border border-green-200' :
            getVolumeRisk()?.color === 'amber' ? 'bg-amber-50 border border-amber-200' :
            'bg-red-50 border border-red-200'
          }`}>
            <div className={`font-semibold ${
              getVolumeRisk()?.color === 'green' ? 'text-green-700' :
              getVolumeRisk()?.color === 'amber' ? 'text-amber-700' : 'text-red-700'
            }`}>
              Volume Risk: {getVolumeRisk()?.text}
            </div>
          </div>
        )}

        {/* Volume Reference Table */}
        <details className="mt-4">
          <summary className="text-sm text-teal-600 font-medium cursor-pointer hover:text-teal-700">
            View Volume Thresholds Reference
          </summary>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Volume</th>
                  <th className="p-2 text-left">Modality</th>
                  <th className="p-2 text-left">Outcome</th>
                  <th className="p-2 text-left">Toxicity</th>
                  <th className="p-2 text-left">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[...VOLUME_DATA.gtv, ...VOLUME_DATA.ctv].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-2 font-medium">{row.threshold}</td>
                    <td className="p-2">{row.modality}</td>
                    <td className="p-2">{row.outcome}</td>
                    <td className="p-2">{row.toxicity}</td>
                    <td className="p-2 text-gray-500">{row.ref}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8">
      <div className="border-l-4 border-amber-500 pl-4">
        <h2 className="text-xl font-bold text-gray-900">Step 2: Assess Normal Tissue Complication Probability</h2>
        <p className="text-gray-600 mt-1">Evaluate risks to adjacent critical structures</p>
      </div>

      {/* Reirradiation Interval */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">Reirradiation Interval</label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={evaluation.reirradiationInterval ?? ''}
            onChange={(e) => updateEvaluation('reirradiationInterval', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Months"
            className="flex-1 p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
          />
          <span className="text-gray-500 font-medium shrink-0">months</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
          {[
            { min: 0, max: 6, label: '<6m', color: 'red', note: 'Not rec.' },
            { min: 6, max: 12, label: '6-12m', color: 'amber', note: 'Caution' },
            { min: 12, max: 24, label: '12-24m', color: 'yellow', note: 'OK' },
            { min: 24, max: Infinity, label: '>=24m', color: 'green', note: 'Favorable' },
          ].map((range) => {
            const ri = evaluation.reirradiationInterval;
            const isActive = ri !== undefined && ri >= range.min && ri < range.max;
            return (
              <div key={range.label} className={`p-2 rounded text-center ${
                isActive
                  ? range.color === 'red' ? 'bg-red-100 border-2 border-red-400' :
                    range.color === 'amber' ? 'bg-amber-100 border-2 border-amber-400' :
                    range.color === 'yellow' ? 'bg-yellow-100 border-2 border-yellow-400' :
                    'bg-green-100 border-2 border-green-400'
                  : 'bg-gray-100 border border-gray-200'
              }`}>
                <div className="font-semibold text-xs sm:text-sm">{range.label}</div>
                <div className="text-gray-500 text-[10px] sm:text-xs">{range.note}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prior RT Dose */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">Prior Radiation Course</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Total Dose (Gy)</label>
            <input
              type="number"
              value={evaluation.priorDose ?? ''}
              onChange={(e) => updateEvaluation('priorDose', e.target.value ? Math.min(99, Number(e.target.value)) : undefined)}
              placeholder="e.g., 70"
              max={99}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Fractions</label>
            <input
              type="number"
              value={evaluation.priorFractions ?? ''}
              onChange={(e) => updateEvaluation('priorFractions', e.target.value ? Math.min(99, Number(e.target.value)) : undefined)}
              placeholder="e.g., 35"
              max={99}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Carotid Involvement */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">Carotid Artery Involvement</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { value: 'none', label: 'No Involvement', note: 'CBS/BE risk: ~1.5%' },
            { value: 'adjacent', label: 'Adjacent (<1cm)', note: 'Apply constraints' },
            { value: 'encased', label: 'Encased >180 deg', note: 'Elevated CBS risk' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateEvaluation('carotidInvolvement', opt.value)}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                evaluation.carotidInvolvement === opt.value
                  ? opt.value === 'encased' ? 'border-red-500 bg-red-50' : 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold text-gray-900 text-sm">{opt.label}</div>
              <div className="text-xs text-gray-500 mt-1">{opt.note}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Critical OARs */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">Critical Structures Near Target</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { id: 'brainstem', label: 'Brainstem', tier: 1, limit: 'Dmax <13 Gy' },
            { id: 'cord', label: 'Spinal Cord', tier: 1, limit: 'Dmax <12 Gy' },
            { id: 'chiasm', label: 'Optic Pathway', tier: 1, limit: 'Dmax <12 Gy' },
            { id: 'carotid', label: 'Carotid', tier: 2, limit: 'Dmax <30 Gy' },
            { id: 'cochlea', label: 'Cochlea', tier: 2, limit: 'Dmax <18 Gy' },
            { id: 'larynx', label: 'Larynx', tier: 2, limit: 'Dmax <13 Gy' },
            { id: 'mandible', label: 'Mandible', tier: 2, limit: 'V25 <1cc' },
            { id: 'temporal', label: 'Temporal Lobe', tier: 3, limit: 'Dmax <27 Gy' },
            { id: 'constrictors', label: 'Constrictors', tier: 3, limit: 'Dmean <10 Gy' },
          ].map((oar) => (
            <button
              key={oar.id}
              onClick={() => toggleOAR(oar.id)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                evaluation.criticalOARsNearby.includes(oar.id)
                  ? oar.tier === 1 ? 'border-red-400 bg-red-50' : 
                    oar.tier === 2 ? 'border-amber-400 bg-amber-50' : 'border-blue-400 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{oar.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  oar.tier === 1 ? 'bg-red-100 text-red-700' :
                  oar.tier === 2 ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                }`}>T{oar.tier}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">{oar.limit}</div>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 mt-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-100 rounded border border-red-300"></span> Tier 1: Go/No-Go</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-100 rounded border border-amber-300"></span> Tier 2: Critical</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-100 rounded border border-blue-300"></span> Tier 3: QOL</span>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8">
      <div className="border-l-4 border-blue-500 pl-4">
        <h2 className="text-xl font-bold text-gray-900">Step 3: Evaluate Technical Feasibility</h2>
        <p className="text-gray-600 mt-1">Determine achievable dose distribution and modality selection</p>
      </div>

      {/* Modality Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">Planned Treatment Modality</label>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { value: 'sbrt', label: 'SBRT', note: 'GTV <25cc', icon: 'S' },
            { value: 'imrt', label: 'IMRT', note: 'Larger vols', icon: 'I' },
            { value: 'pbt', label: 'Proton', note: 'Skull base', icon: 'P' },
          ].map((opt) => {
            const isRecommended = 
              (opt.value === 'sbrt' && evaluation.gtvVolume && evaluation.gtvVolume <= 25) ||
              (opt.value === 'pbt' && evaluation.recurrenceSite?.includes('skull'));
            return (
              <button
                key={opt.value}
                onClick={() => updateEvaluation('plannedModality', opt.value)}
                className={`p-4 sm:p-5 rounded-xl border-2 text-center transition-all relative ${
                  evaluation.plannedModality === opt.value
                    ? 'border-teal-500 bg-teal-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {isRecommended && (
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                    Rec
                  </span>
                )}
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2 text-lg font-bold text-gray-600">{opt.icon}</div>
                <div className="font-bold text-gray-900 text-sm sm:text-base">{opt.label}</div>
                <div className="text-xs text-gray-500 mt-1 hidden sm:block">{opt.note}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Planned Dose */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">Planned Dose & Fractionation</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Total Dose (Gy)</label>
            <input
              type="number"
              value={evaluation.plannedDose ?? ''}
              onChange={(e) => updateEvaluation('plannedDose', e.target.value ? Math.min(99, Number(e.target.value)) : undefined)}
              placeholder="e.g., 45"
              max={99}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Number of Fractions</label>
            <input
              type="number"
              value={evaluation.plannedFractions ?? ''}
              onChange={(e) => updateEvaluation('plannedFractions', e.target.value ? Math.min(99, Number(e.target.value)) : undefined)}
              placeholder="e.g., 5"
              max={99}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* SBRT Dose Guide */}
      {evaluation.plannedModality === 'sbrt' && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-5 rounded-xl">
          <h4 className="font-bold text-gray-800 mb-4">MDACC SBRT Dose Selection Guide</h4>
          <div className="space-y-2">
            {[
              { dose: '45 Gy / 5 fx', eqd2: '71-80', lc: '~90%', context: 'Non-mucosal, high-grade', risk: 'Higher toxicity' },
              { dose: '42.5 Gy / 5 fx', eqd2: '65-73', lc: '~85%', context: 'Standard curative', risk: 'Moderate' },
              { dose: '40 Gy / 5 fx', eqd2: '60-67', lc: '75-85%', context: 'Large nodal, moderate-dose', risk: 'Moderate' },
              { dose: '36 Gy / 4 fx', eqd2: '57-64', lc: '70-80%', context: 'Small tumors, non-SCC', risk: 'Lower' },
              { dose: '27 Gy / 3 fx', eqd2: '43-48', lc: '65-73%', context: 'High-risk mucosal, palliative', risk: 'Lowest' },
            ].map((row) => {
              const isSelected = 
                (row.dose === '45 Gy / 5 fx' && evaluation.plannedDose === 45 && evaluation.plannedFractions === 5) ||
                (row.dose === '42.5 Gy / 5 fx' && evaluation.plannedDose === 42.5 && evaluation.plannedFractions === 5) ||
                (row.dose === '40 Gy / 5 fx' && evaluation.plannedDose === 40 && evaluation.plannedFractions === 5) ||
                (row.dose === '36 Gy / 4 fx' && evaluation.plannedDose === 36 && evaluation.plannedFractions === 4) ||
                (row.dose === '27 Gy / 3 fx' && evaluation.plannedDose === 27 && evaluation.plannedFractions === 3);
              return (
                <div key={row.dose} className={`p-3 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${
                  isSelected ? 'bg-teal-100 border-2 border-teal-400' : 'bg-white border border-gray-200'
                }`}>
                  <div>
                    <span className="font-bold text-gray-900">{row.dose}</span>
                    <span className="text-gray-400 mx-2">-</span>
                    <span className="text-gray-600">EQD2: {row.eqd2} Gy</span>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-sm font-medium text-teal-700">{row.lc} LC</span>
                    <span className="text-xs text-gray-500 ml-2">{row.context}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Technical Notes */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-2">Technical Considerations</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>- LINAC/VMAT achieves ~8% dose reduction per mm from target</li>
          <li>- GK/CK: Best conformity for tumors &lt;15cc (superior gradient)</li>
          <li>- PTV expansion: Typically 2mm (skull base), 3mm (mucosal), 3.5mm (neck)</li>
          <li>- SBRT QOD fractionation reduces CBS/BE risk vs daily treatment</li>
        </ul>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-8">
      <div className="border-l-4 border-purple-500 pl-4">
        <h2 className="text-xl font-bold text-gray-900">Step 4: Integrate Clinical Judgment</h2>
        <p className="text-gray-600 mt-1">Final assessment of treatment goals and patient factors</p>
      </div>

      {/* Treatment Goal */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">Treatment Intent</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { value: 'curative', label: 'Curative', note: 'Goal: Long-term local control and survival', icon: 'C' },
            { value: 'palliative', label: 'Palliative', note: 'Goal: Symptom control, quality of life', icon: 'P' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateEvaluation('treatmentGoal', opt.value)}
              className={`p-5 rounded-xl border-2 text-left transition-all ${
                evaluation.treatmentGoal === opt.value
                  ? 'border-teal-500 bg-teal-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2 text-xl font-bold text-gray-600">{opt.icon}</div>
              <div className="font-bold text-gray-900">{opt.label}</div>
              <div className="text-xs text-gray-500 mt-1">{opt.note}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Performance Status */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">ECOG Performance Status</label>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {[
            { value: 0, label: 'PS 0', note: 'Fully active' },
            { value: 1, label: 'PS 1', note: 'Light work' },
            { value: 2, label: 'PS 2', note: 'Ambulatory' },
            { value: 3, label: 'PS 3', note: 'Limited' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateEvaluation('performanceStatus', opt.value as 0 | 1 | 2 | 3)}
              className={`p-3 sm:p-4 rounded-xl border-2 text-center transition-all ${
                evaluation.performanceStatus === opt.value
                  ? opt.value <= 1 ? 'border-green-500 bg-green-50' : 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-bold text-lg text-gray-900">{opt.value}</div>
              <div className="text-[10px] sm:text-xs text-gray-500">{opt.note}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Clinical Questions */}
      <div className="bg-purple-50 p-5 rounded-xl border border-purple-200">
        <h4 className="font-semibold text-purple-800 mb-3">Key Clinical Questions</h4>
        <ul className="space-y-2 text-sm text-purple-700">
          <li className="flex items-start gap-2">
            <span className="text-purple-400">-</span>
            Is meaningful dose achievable while respecting OAR constraints?
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400">-</span>
            Is the associated toxicity risk acceptable to the patient?
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400">-</span>
            Have alternatives been discussed in MDT (surgery, systemic, observation)?
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400">-</span>
            Does patient have realistic expectations about outcomes?
          </li>
        </ul>
      </div>
    </div>
  );

  const renderResults = () => {
    const results = calculateViability();
    const outcomes = evaluation.recurrenceSite ? SITE_OUTCOMES[evaluation.recurrenceSite as keyof typeof SITE_OUTCOMES] : null;

    return (
      <div className="space-y-6">
        {/* Main Result Card */}
        <div className={`p-6 rounded-2xl shadow-lg ${
          results.viability === 'favorable' ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' :
          results.viability === 'conditional' ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white' :
          'bg-gradient-to-br from-red-500 to-rose-600 text-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium opacity-90 mb-1">Re-Irradiation Assessment</div>
              <h2 className="text-2xl sm:text-3xl font-bold">
                {results.viability === 'favorable' ? 'FAVORABLE' :
                 results.viability === 'conditional' ? 'CONDITIONAL' : 'UNFAVORABLE'}
              </h2>
              <p className="text-sm opacity-90 mt-2">Based on MDACC 4-Step Evaluation</p>
            </div>
            <div className="text-5xl sm:text-6xl opacity-30 font-bold">
              {results.viability === 'favorable' ? '+' :
               results.viability === 'conditional' ? '~' : '-'}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border">
            <div className="text-xs text-gray-500 mb-1">Site</div>
            <div className="font-bold text-gray-900 text-sm sm:text-base">{outcomes?.label || 'Not specified'}</div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border">
            <div className="text-xs text-gray-500 mb-1">Volume</div>
            <div className="font-bold text-gray-900 text-sm sm:text-base">
              {evaluation.gtvVolume ? `GTV ${evaluation.gtvVolume}cc` : evaluation.ctvVolume ? `CTV ${evaluation.ctvVolume}cc` : 'Not specified'}
            </div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border">
            <div className="text-xs text-gray-500 mb-1">Interval</div>
            <div className="font-bold text-gray-900 text-sm sm:text-base">
              {evaluation.reirradiationInterval ? `${evaluation.reirradiationInterval} mo` : 'Not specified'}
            </div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border">
            <div className="text-xs text-gray-500 mb-1">Modality</div>
            <div className="font-bold text-gray-900 text-sm sm:text-base uppercase">{evaluation.plannedModality || 'Not specified'}</div>
          </div>
        </div>

        {/* Expected Outcomes */}
        {outcomes && (
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border">
            <h3 className="font-bold text-gray-900 mb-4">Expected 2-Year Outcomes (MDACC Data)</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
              {[
                { label: 'Local Control', value: outcomes.lc, good: true },
                { label: 'Regional Rec', value: outcomes.rr, good: false },
                { label: 'Distant Mets', value: outcomes.dm, good: false },
                { label: 'OS', value: outcomes.os, good: true },
                { label: 'PFS', value: outcomes.pfs, good: true },
                { label: 'G3+ Tox', value: outcomes.g3Tox, good: false },
              ].map((m) => (
                <div key={m.label} className="text-center">
                  <div className={`text-xl sm:text-3xl font-bold ${
                    m.good ? (m.value >= 70 ? 'text-green-600' : m.value >= 50 ? 'text-amber-600' : 'text-red-500') :
                            (m.value <= 15 ? 'text-green-600' : m.value <= 30 ? 'text-amber-600' : 'text-red-500')
                  }`}>{m.value}%</div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-1">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {results.recommendations.length > 0 && (
          <div className="bg-green-50 p-4 sm:p-5 rounded-xl border border-green-200">
            <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm"><CheckIconSmall /></span>
              Favorable Factors
            </h4>
            <ul className="space-y-2">
              {results.recommendations.map((rec, i) => (
                <li key={i} className="text-green-700 text-sm flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">-</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Concerns */}
        {results.concerns.length > 0 && (
          <div className="bg-amber-50 p-4 sm:p-5 rounded-xl border border-amber-200">
            <h4 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">!</span>
              Considerations
            </h4>
            <ul className="space-y-2">
              {results.concerns.map((c, i) => (
                <li key={i} className="text-amber-700 text-sm flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">-</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* MDACC Constraints */}
        {evaluation.plannedModality === 'sbrt' && (
          <div className="bg-blue-50 p-4 sm:p-5 rounded-xl border border-blue-200">
            <h4 className="font-bold text-blue-800 mb-3">MDACC SBRT Dose Constraints</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-semibold text-blue-700 mb-2">Tier 1 (Go/No-Go)</div>
                <ul className="text-blue-600 space-y-1">
                  <li>Brainstem: Dmax &lt;13 Gy</li>
                  <li>Spinal Cord: Dmax &lt;12 Gy</li>
                  <li>Optic Chiasm: Dmax &lt;12 Gy</li>
                </ul>
              </div>
              <div>
                <div className="font-semibold text-blue-700 mb-2">Tier 2 (Critical)</div>
                <ul className="text-blue-600 space-y-1">
                  <li>Carotid: Dmax &lt;30 Gy, V27 &lt;0.5cc</li>
                  <li>Cochlea: Dmax &lt;18 Gy</li>
                  <li>Larynx: Dmax &lt;13 Gy</li>
                </ul>
              </div>
              <div>
                <div className="font-semibold text-blue-700 mb-2">Tier 3 (QOL)</div>
                <ul className="text-blue-600 space-y-1">
                  <li>Temporal: Dmax &lt;27 Gy</li>
                  <li>Constrictors: Dmean &lt;10 Gy</li>
                  <li>Parotid: Dmax &lt;23 Gy</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={() => { setShowResults(false); setCurrentStep(1); setEvaluation(initialEvaluation); }}
            className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-sm sm:text-base"
          >
            New Evaluation
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors shadow-lg text-sm sm:text-base"
          >
            Print Summary
          </button>
        </div>
      </div>
    );
  };

  if (showResults) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {renderResults()}
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {renderStepIndicator()}
      
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 mb-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className={`px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all text-sm sm:text-base ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          
          <div className="text-sm text-gray-400">
            Step {currentStep} of 4
          </div>
          
          {currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-4 sm:px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors shadow-lg text-sm sm:text-base"
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => setShowResults(true)}
              className="px-4 sm:px-8 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg text-sm sm:text-base"
            >
              Generate Report
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
