'use client';

import { useState } from 'react';

// Types
interface PriorCourse {
  dose: number | undefined;
  fractions: number | undefined;
}

interface PatientEvaluation {
  // Step 1: TCP Factors
  histology: 'scc' | 'non-scc' | 'melanoma-sarcoma' | '';
  surgicalStatus: 'intact' | 'postop' | '';
  flapReconstruction: 'yes' | 'no' | '';
  recurrenceType: 'recurrent' | 'new-primary' | '';
  fieldRelationship: 'in-field' | 'marginal' | 'out-of-field' | '';
  recurrenceSite: 'mucosal-op' | 'mucosal-np' | 'mucosal-larynx' | 'mucosal-oc' | 'neck-small' | 'neck-large' | 'skull-base' | 'pns' | '';
  tumorVolume: number | undefined;
  
  // Step 2: NTCP Factors
  reirradiationInterval: number | undefined;
  priorDose: number | undefined;
  priorFractions: number | undefined;
  priorCourses: PriorCourse[];
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
  flapReconstruction: '',
  recurrenceType: '',
  fieldRelationship: '',
  recurrenceSite: '',
  tumorVolume: undefined,
  reirradiationInterval: undefined,
  priorDose: undefined,
  priorFractions: undefined,
  priorCourses: [],
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
  const [showMethodology, setShowMethodology] = useState(false);

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
    const volume = evaluation.tumorVolume;
    
    if (volume !== undefined) {
      if (volume < 15) return { level: 'low', text: 'Favorable', color: 'green' };
      if (volume >= 15 && volume < 25) return { level: 'acceptable', text: 'Acceptable', color: 'yellow' };
      if (volume >= 25 && volume < 50) return { level: 'moderate', text: 'Moderately Elevated', color: 'amber' };
      return { level: 'high', text: 'High Risk', color: 'red' };
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
        recommendations.push('Tumor volume <15cc is favorable for re-irradiation');
        score += 20;
      } else if (volumeRisk.level === 'acceptable') {
        recommendations.push('Tumor volume 15-25cc is acceptable');
        score += 10;
      } else if (volumeRisk.level === 'moderate') {
        concerns.push('Tumor volume 25-50cc: Moderately elevated toxicity risk');
        score -= 10;
      } else if (volumeRisk.level === 'high') {
        concerns.push('Large tumor volume (>50cc) associated with higher toxicity');
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
        
        // Systemic Therapy Recommendation based on out-of-field recurrence risk
        const outOfFieldRisk = outcomes.rr + outcomes.dm;
        if (outOfFieldRisk > 40) {
          recommendations.push('⚠️ Systemic therapy strongly recommended given elevated out-of-field recurrence risk (>40%)');
        } else if (outOfFieldRisk > 20) {
          recommendations.push('Consider maintenance systemic therapy / immunotherapy given elevated out-of-field recurrence risk (>20%)');
        }
      }
    }

    // Histology
    if (evaluation.histology === 'non-scc') {
      recommendations.push('Non-SCC histology (excluding mel/sarc) associated with better outcomes');
      score += 15;
    } else if (evaluation.histology === 'scc') {
      concerns.push('SCC histology: Higher mortality risk compared to non-SCC');
      score -= 5;
    } else if (evaluation.histology === 'melanoma-sarcoma') {
      concerns.push('Melanoma/Sarcoma: Poor outcomes, requires aggressive approach');
      score -= 15;
    }

    // Recurrence Type
    if (evaluation.recurrenceType === 'new-primary') {
      recommendations.push('New primary tumor: Different prognostic considerations than true recurrence');
      score += 5;
    } else if (evaluation.recurrenceType === 'recurrent') {
      concerns.push('Recurrent tumor at same site: Consider radioresistance');
    }

    // Field Relationship
    if (evaluation.fieldRelationship === 'in-field') {
      concerns.push('In-field recurrence: Full dose overlap region, maximum toxicity risk');
      score -= 15;
    } else if (evaluation.fieldRelationship === 'marginal') {
      concerns.push('Marginal recurrence: Partial overlap with prior field');
      score -= 5;
    } else if (evaluation.fieldRelationship === 'out-of-field') {
      recommendations.push('Out-of-field recurrence: Minimal prior dose overlap, lower toxicity risk');
      score += 10;
    }

    // Carotid
    if (evaluation.carotidInvolvement === 'encased') {
      concerns.push('Carotid encasement >180 deg increases CBS/BE risk significantly');
      score -= 15;
    } else if (evaluation.carotidInvolvement === 'adjacent') {
      recommendations.push('Carotid adjacent to target: Apply MDACC constraints (Dmax <30Gy, V27 <0.5cc)');
    }

    // Surgical status + Flap
    if (evaluation.surgicalStatus === 'postop') {
      recommendations.push('Postoperative setting: Recommend 32 Gy in 4 fractions');
      score += 10;
      
      if (evaluation.flapReconstruction === 'yes') {
        recommendations.push('Flap reconstruction present: May reduce toxicity risk with improved tissue vascularity');
        score += 5;
      } else if (evaluation.flapReconstruction === 'no') {
        concerns.push('No flap reconstruction: Increased wound healing complications possible');
      }
    } else if (evaluation.surgicalStatus === 'intact') {
      recommendations.push('Gross disease: Recommend 36 Gy in 4 fractions for tumor control');
    }

    // Performance Status
    if (evaluation.performanceStatus !== undefined) {
      if (evaluation.performanceStatus >= 2) {
        concerns.push('ECOG PS >=2 associated with poorer outcomes');
        score -= 10;
      }
    }

    // If no meaningful inputs were provided, default to unfavorable (incomplete)
    const hasMinimumInputs = 
      evaluation.histology !== '' ||
      evaluation.recurrenceSite !== '' ||
      evaluation.reirradiationInterval !== undefined ||
      evaluation.tumorVolume !== undefined;

    let viability: 'favorable' | 'conditional' | 'unfavorable';
    if (!hasMinimumInputs) viability = 'unfavorable';
    else if (score >= 15) viability = 'favorable';
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
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">MDACC 3-Step Evaluation</span>
            <span className="text-xs text-gray-400">Step {currentStep} of 3</span>
          </div>
          {/* Track */}
          <div className="relative h-1 bg-gray-200 rounded-full mb-4">
            <div 
              className="absolute h-1 bg-teal-500 rounded-full transition-all duration-300" 
              style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            />
          </div>
          {/* Step buttons */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { num: 1, label: 'TCP', fullLabel: 'Tumor Control' },
              { num: 2, label: 'NTCP', fullLabel: 'Normal Tissue' },
              { num: 3, label: 'Technical', fullLabel: 'Feasibility' },
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { value: 'scc', label: 'SCC', note: 'Includes NPC' },
            { value: 'non-scc', label: 'Non-SCC (excluding mel/sarc)', note: 'ACC, salivary gland, better outcomes' },
            { value: 'melanoma-sarcoma', label: 'Melanoma/Sarcoma', note: 'Poor outcomes, aggressive approach needed' },
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

      {/* Recurrence Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">Recurrence Type</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { value: 'recurrent', label: 'Recurrent Tumor', note: 'Same histology, same site' },
            { value: 'new-primary', label: 'New Primary', note: 'Different histology or separate origin' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateEvaluation('recurrenceType', opt.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                evaluation.recurrenceType === opt.value
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

      {/* Field Relationship */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">Relationship to Prior RT Field</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { value: 'in-field', label: 'In-Field', note: 'Within prior high-dose region, full overlap' },
            { value: 'marginal', label: 'Marginal', note: 'At edge of prior field, partial overlap' },
            { value: 'out-of-field', label: 'Out-of-Field', note: 'Outside prior treatment volume' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateEvaluation('fieldRelationship', opt.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                evaluation.fieldRelationship === opt.value
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
            { value: 'postop', label: 'Post-Salvage Surgery', note: 'After surgical resection' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                updateEvaluation('surgicalStatus', opt.value);
                if (opt.value === 'intact') updateEvaluation('flapReconstruction', '');
              }}
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

      {/* Flap Reconstruction (conditional) */}
      {evaluation.surgicalStatus === 'postop' && (
        <div className="ml-4 border-l-4 border-teal-200 pl-4">
          <label className="block text-sm font-semibold text-gray-800 mb-3">Flap Reconstruction?</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { value: 'yes', label: 'Yes', note: 'Flap reconstruction performed' },
              { value: 'no', label: 'No', note: 'Primary closure or no flap' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateEvaluation('flapReconstruction', opt.value)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  evaluation.flapReconstruction === opt.value
                    ? 'border-teal-500 bg-teal-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-semibold text-gray-900 text-sm">{opt.label}</div>
                <div className="text-xs text-gray-500 mt-1">{opt.note}</div>
              </button>
            ))}
          </div>
        </div>
      )}

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

      </div>

      {/* Volume */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <label className="block text-sm font-semibold text-gray-800">Tumor Volume</label>
          <div className="group relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
              Estimated gross tumor volume. For SBRT, CTV margins are typically minimal.
            </div>
          </div>
        </div>
        <div className="mb-4">
          <input
            type="number"
            value={evaluation.tumorVolume ?? ''}
            onChange={(e) => updateEvaluation('tumorVolume', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Enter tumor volume in cc (e.g., 15)"
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
          />
          <div className="text-xs text-gray-500 mt-1">Volume in cubic centimeters (cc)</div>
        </div>
        
        {/* Volume Risk Indicator */}
        {getVolumeRisk() && (
          <div className={`p-3 rounded-lg ${
            getVolumeRisk()?.color === 'green' ? 'bg-green-50 border border-green-200' :
            getVolumeRisk()?.color === 'yellow' ? 'bg-yellow-50 border border-yellow-200' :
            getVolumeRisk()?.color === 'amber' ? 'bg-amber-50 border border-amber-200' :
            'bg-red-50 border border-red-200'
          }`}>
            <div className={`font-semibold ${
              getVolumeRisk()?.color === 'green' ? 'text-green-700' :
              getVolumeRisk()?.color === 'yellow' ? 'text-yellow-700' :
              getVolumeRisk()?.color === 'amber' ? 'text-amber-700' : 'text-red-700'
            }`}>
              Volume Risk: {getVolumeRisk()?.text}
            </div>
            <div className={`text-xs mt-1 ${
              getVolumeRisk()?.color === 'green' ? 'text-green-600' :
              getVolumeRisk()?.color === 'yellow' ? 'text-yellow-600' :
              getVolumeRisk()?.color === 'amber' ? 'text-amber-600' : 'text-red-600'
            }`}>
              {getVolumeRisk()?.level === 'low' && '<15 cc: Favorable for re-irradiation'}
              {getVolumeRisk()?.level === 'acceptable' && '15-25 cc: Acceptable risk'}
              {getVolumeRisk()?.level === 'moderate' && '25-50 cc: Moderately elevated toxicity risk'}
              {getVolumeRisk()?.level === 'high' && '>50 cc: High toxicity risk'}
            </div>
          </div>
        )}


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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { value: 3, label: '< 6 months', color: 'red', note: 'Not recommended' },
            { value: 9, label: '6-12 months', color: 'amber', note: 'Caution required' },
            { value: 18, label: '12-24 months', color: 'yellow', note: 'Acceptable' },
            { value: 30, label: '> 24 months', color: 'green', note: 'Favorable' },
          ].map((opt) => {
            const isActive = evaluation.reirradiationInterval === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => updateEvaluation('reirradiationInterval', opt.value)}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  isActive
                    ? opt.color === 'red' ? 'border-red-500 bg-red-50 shadow-md' :
                      opt.color === 'amber' ? 'border-amber-500 bg-amber-50 shadow-md' :
                      opt.color === 'yellow' ? 'border-yellow-500 bg-yellow-50 shadow-md' :
                      'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-semibold text-gray-900 text-sm">{opt.label}</div>
                <div className="text-xs text-gray-500 mt-1">{opt.note}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Prior RT Dose */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-semibold text-gray-800">Prior Radiation Courses</label>
        </div>
        
        {/* Primary prior course */}
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-2 font-medium">Course 1 (Primary)</div>
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

        {/* Additional prior courses */}
        {evaluation.priorCourses.map((course, index) => (
          <div key={index} className="mb-3 border-l-4 border-amber-200 pl-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-gray-500 font-medium">Course {index + 2}</div>
              <button
                onClick={() => {
                  const updated = evaluation.priorCourses.filter((_, i) => i !== index);
                  setEvaluation(prev => ({ ...prev, priorCourses: updated }));
                }}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Total Dose (Gy)</label>
                <input
                  type="number"
                  value={course.dose ?? ''}
                  onChange={(e) => {
                    const updated = [...evaluation.priorCourses];
                    updated[index] = { ...updated[index], dose: e.target.value ? Math.min(99, Number(e.target.value)) : undefined };
                    setEvaluation(prev => ({ ...prev, priorCourses: updated }));
                  }}
                  placeholder="e.g., 45"
                  max={99}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Fractions</label>
                <input
                  type="number"
                  value={course.fractions ?? ''}
                  onChange={(e) => {
                    const updated = [...evaluation.priorCourses];
                    updated[index] = { ...updated[index], fractions: e.target.value ? Math.min(99, Number(e.target.value)) : undefined };
                    setEvaluation(prev => ({ ...prev, priorCourses: updated }));
                  }}
                  placeholder="e.g., 5"
                  max={99}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        ))}

        {/* Add course button */}
        <button
          onClick={() => {
            setEvaluation(prev => ({
              ...prev,
              priorCourses: [...prev.priorCourses, { dose: undefined, fractions: undefined }]
            }));
          }}
          className="mt-2 text-sm text-teal-600 hover:text-teal-800 font-medium flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Prior RT Course
        </button>
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
            { id: 'lingual', label: 'Lingual Art.', tier: 2, limit: 'Dmax <30 Gy' },
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            { value: 'sbrt', label: 'SBRT', note: 'Volume <25cc (includes GK/CK)', icon: 'S' },
            { value: 'imrt', label: 'IMRT', note: 'Larger volumes', icon: 'I' },
            { value: 'pbt', label: 'Proton', note: 'Skull base', icon: 'P' },
          ].map((opt) => {
            const isRecommended = 
              (opt.value === 'sbrt' && evaluation.tumorVolume && evaluation.tumorVolume <= 25) ||
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

      {/* Dose Prescription Recommendation - Modality-Specific */}
      {(evaluation.surgicalStatus === 'intact' || evaluation.surgicalStatus === 'postop') && evaluation.plannedModality && (
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-4 rounded-xl border-2 border-teal-200">
          <h4 className="font-bold text-teal-800 mb-2">Recommended Dose Prescription</h4>
          {evaluation.plannedModality === 'sbrt' && evaluation.surgicalStatus === 'intact' && (
            <div className="bg-white p-3 rounded-lg">
              <div className="text-lg font-bold text-gray-900">36 Gy in 4 fractions (SBRT)</div>
              <div className="text-sm text-gray-600 mt-1">For gross disease tumor control</div>
            </div>
          )}
          {evaluation.plannedModality === 'sbrt' && evaluation.surgicalStatus === 'postop' && (
            <div className="bg-white p-3 rounded-lg">
              <div className="text-lg font-bold text-gray-900">32 Gy in 4 fractions (SBRT)</div>
              <div className="text-sm text-gray-600 mt-1">Post-operative adjuvant re-irradiation</div>
            </div>
          )}
          {evaluation.plannedModality === 'imrt' && evaluation.surgicalStatus === 'intact' && (
            <div className="bg-white p-3 rounded-lg">
              <div className="text-lg font-bold text-gray-900">66-70 Gy (IMRT)</div>
              <div className="text-sm text-gray-600 mt-1">Curative intent for gross disease (current institutional practice)</div>
            </div>
          )}
          {evaluation.plannedModality === 'imrt' && evaluation.surgicalStatus === 'postop' && (
            <div className="bg-white p-3 rounded-lg">
              <div className="text-lg font-bold text-gray-900">64 Gy (IMRT)</div>
              <div className="text-sm text-gray-600 mt-1">Post-operative adjuvant re-irradiation, standard fractionation</div>
            </div>
          )}
          {evaluation.plannedModality === 'pbt' && (
            <div className="bg-white p-3 rounded-lg">
              <div className="text-lg font-bold text-gray-900">Dose per institutional protocol (Protons)</div>
              <div className="text-sm text-gray-600 mt-1">Proton dose depends on target, proximity to OARs, and prior dose</div>
            </div>
          )}
        </div>
      )}

      {/* Dose Recommendations - Check for borderline cases */}
      {(() => {
        const isBorderline = evaluation.recurrenceSite?.includes('mucosal') || (evaluation.tumorVolume && evaluation.tumorVolume > 25);
        const showBoth = isBorderline && (evaluation.plannedModality === 'imrt' || evaluation.plannedModality === 'sbrt');
        
        return (
          <>
            {/* Borderline case warning with detailed comparison */}
            {showBoth && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h4 className="font-bold text-amber-800">Borderline Case — Technique Selection Guide</h4>
                </div>
                <p className="text-sm text-amber-700 mb-4">
                  {evaluation.recurrenceSite?.includes('mucosal') ? 'Mucosal site recurrence' : 'Large tumor volume (>25cc)'} — Consider both IMRT and SBRT approaches.
                </p>
                
                {/* IMRT vs SBRT Comparison Cards */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  {/* SBRT Card */}
                  <div className="bg-white rounded-lg border-2 border-teal-200 p-4">
                    <h5 className="font-bold text-teal-700 mb-2 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      SBRT Approach
                    </h5>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="font-semibold text-gray-700">Advantages:</p>
                        <ul className="text-gray-600 space-y-1 ml-4 mt-1">
                          <li className="flex items-start gap-1">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span>Steep dose gradient (~10%/mm)</span>
                          </li>
                          <li className="flex items-start gap-1">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span>Short treatment course (3-5 fractions)</span>
                          </li>
                          <li className="flex items-start gap-1">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span>QOD fractionation reduces CBS/BE risk</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700">Considerations:</p>
                        <ul className="text-gray-600 space-y-1 ml-4 mt-1">
                          {evaluation.recurrenceSite?.includes('mucosal') && (
                            <li className="flex items-start gap-1">
                              <span className="text-amber-500 mt-0.5">⚠</span>
                              <span>Mucosal hotspots can increase toxicity risk</span>
                            </li>
                          )}
                          {evaluation.tumorVolume && evaluation.tumorVolume > 25 && (
                            <li className="flex items-start gap-1">
                              <span className="text-amber-500 mt-0.5">⚠</span>
                              <span>Large volumes (&gt;25cc) associated with higher toxicity</span>
                            </li>
                          )}
                          <li className="flex items-start gap-1">
                            <span className="text-amber-500 mt-0.5">⚠</span>
                            <span>Requires precise immobilization and IGRT</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* IMRT Card */}
                  <div className="bg-white rounded-lg border-2 border-blue-200 p-4">
                    <h5 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                      </svg>
                      IMRT Approach
                    </h5>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="font-semibold text-gray-700">Advantages:</p>
                        <ul className="text-gray-600 space-y-1 ml-4 mt-1">
                          {evaluation.recurrenceSite?.includes('mucosal') && (
                            <li className="flex items-start gap-1">
                              <span className="text-green-500 mt-0.5">✓</span>
                              <span>Dose homogeneity reduces mucosal hotspots</span>
                            </li>
                          )}
                          {evaluation.tumorVolume && evaluation.tumorVolume > 25 && (
                            <li className="flex items-start gap-1">
                              <span className="text-green-500 mt-0.5">✓</span>
                              <span>Better suited for large volumes and complex fields</span>
                            </li>
                          )}
                          <li className="flex items-start gap-1">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span>Lower per-fraction dose reduces acute toxicity</span>
                          </li>
                          <li className="flex items-start gap-1">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span>More flexibility for irregular target shapes</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700">Considerations:</p>
                        <ul className="text-gray-600 space-y-1 ml-4 mt-1">
                          <li className="flex items-start gap-1">
                            <span className="text-amber-500 mt-0.5">⚠</span>
                            <span>Longer treatment course (standard fractionation)</span>
                          </li>
                          <li className="flex items-start gap-1">
                            <span className="text-amber-500 mt-0.5">⚠</span>
                            <span>Less steep dose gradient (~8%/mm)</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="bg-white rounded-lg border border-amber-300 p-3">
                  <p className="text-sm text-gray-700 flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>
                      <strong>Recommendation:</strong> Discuss in multidisciplinary tumor board for optimal technique selection based on individual patient anatomy, prior dose distribution, and treatment goals.
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* SBRT Dose Guide */}
            {(evaluation.plannedModality === 'sbrt' || showBoth) && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-5 rounded-xl">
                <h4 className="font-bold text-gray-800 mb-4">MDACC SBRT Dose Selection Guide</h4>
                <div className="space-y-2">
                  {[
                    { dose: '45 Gy / 5 fx', eqd2: '71-80', context: 'Non-mucosal, high-grade', risk: 'Higher toxicity' },
                    { dose: '42.5 Gy / 5 fx', eqd2: '65-73', context: 'Standard curative', risk: 'Moderate' },
                    { dose: '40 Gy / 5 fx', eqd2: '60-67', context: 'Large nodal, moderate-dose', risk: 'Moderate' },
                    { dose: '36 Gy / 4 fx', eqd2: '57-64', context: 'Gross disease (recommended)', risk: 'Lower', recommended: evaluation.surgicalStatus === 'intact' },
                    { dose: '32 Gy / 4 fx', eqd2: '49-56', context: 'Post-op (recommended)', risk: 'Lower', recommended: evaluation.surgicalStatus === 'postop' },
                    { dose: '27 Gy / 3 fx', eqd2: '43-48', context: 'High-risk mucosal, palliative', risk: 'Lowest' },
                  ].map((row) => {
                    const isSelected = 
                      (row.dose === '45 Gy / 5 fx' && evaluation.plannedDose === 45 && evaluation.plannedFractions === 5) ||
                      (row.dose === '42.5 Gy / 5 fx' && evaluation.plannedDose === 42.5 && evaluation.plannedFractions === 5) ||
                      (row.dose === '40 Gy / 5 fx' && evaluation.plannedDose === 40 && evaluation.plannedFractions === 5) ||
                      (row.dose === '36 Gy / 4 fx' && evaluation.plannedDose === 36 && evaluation.plannedFractions === 4) ||
                      (row.dose === '32 Gy / 4 fx' && evaluation.plannedDose === 32 && evaluation.plannedFractions === 4) ||
                      (row.dose === '27 Gy / 3 fx' && evaluation.plannedDose === 27 && evaluation.plannedFractions === 3);
                    return (
                      <div key={row.dose} className={`p-3 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 relative ${
                        isSelected ? 'bg-teal-100 border-2 border-teal-400' : 
                        row.recommended ? 'bg-emerald-50 border-2 border-emerald-300' :
                        'bg-white border border-gray-200'
                      }`}>
                        {row.recommended && !isSelected && (
                          <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                            RECOMMENDED
                          </span>
                        )}
                        <div>
                          <span className="font-bold text-gray-900">{row.dose}</span>
                          <span className="text-gray-400 mx-2">-</span>
                          <span className="text-gray-600">EQD2: {row.eqd2} Gy</span>
                        </div>
                        <div className="sm:text-right">
                          <span className="text-xs text-gray-500">{row.context}</span>
                          <span className="text-xs text-gray-400 ml-2">Toxicity: {row.risk}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* IMRT Dose Guide */}
            {(evaluation.plannedModality === 'imrt' || showBoth) && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-5 rounded-xl">
                <h4 className="font-bold text-gray-800 mb-4">IMRT Fractionation Options</h4>
                <div className="space-y-2">
                  {[
                    { dose: '33 Gy', context: 'Palliative / Limited intent', note: 'Lower toxicity risk' },
                    { dose: '35 Gy', context: 'Moderate dose', note: 'Acceptable risk-benefit' },
                    { dose: '66-70 Gy', context: 'Gross disease (current institutional practice)', note: 'Curative intent', recommended: evaluation.surgicalStatus === 'intact' },
                    { dose: '64 Gy', context: 'Other indications', note: 'Standard fractionation' },
                  ].map((row) => {
                    return (
                      <div key={row.dose} className={`p-3 rounded-lg relative ${
                        row.recommended ? 'bg-emerald-50 border-2 border-emerald-300' :
                        'bg-white border border-gray-200'
                      }`}>
                        {row.recommended && (
                          <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                            RECOMMENDED
                          </span>
                        )}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <span className="font-bold text-gray-900">{row.dose}</span>
                            <span className="text-gray-400 mx-2">-</span>
                            <span className="text-gray-600">{row.context}</span>
                          </div>
                          <div className="sm:text-right">
                            <span className="text-xs text-gray-500">{row.note}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Proton Recommendations */}
            {evaluation.plannedModality === 'pbt' && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 sm:p-5 rounded-xl">
                <h4 className="font-bold text-gray-800 mb-3">Proton Therapy Considerations</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">•</span>
                    <span>Imaging verification every 1-2 weeks recommended</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">•</span>
                    <span>Caution with air interface regions (paranasal sinuses, nasopharynx)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">•</span>
                    <span>CBCT/IGRT when available strongly recommended</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">•</span>
                    <span>Monitor for hot spots in high-gradient regions</span>
                  </li>
                </ul>
              </div>
            )}
          </>
        );
      })()}

      {/* Technical Considerations - Dynamic based on modality */}
      {evaluation.plannedModality && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">Technical Considerations</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            {(evaluation.plannedModality === 'imrt') && (
              <>
                <li>- Dose gradient ~8% per millimeter</li>
                <li>- Margin considerations for target coverage and OAR sparing</li>
                <li>- See Catherine & Shane Meskel, Red Journal</li>
              </>
            )}
            {(evaluation.plannedModality === 'sbrt') && (
              <>
                <li>- Dose gradient ~10% per millimeter</li>
                <li>- PTV expansion: Typically 2mm (skull base), 3mm (mucosal), 3.5mm (neck)</li>
                <li>- QOD fractionation reduces CBS/BE risk vs daily treatment</li>
                <li>- Rx to 90-98% IDL; hotspots 105-110% within target (Diao et al, 2022)</li>
                <li>- Skull base: Rx to 80-90% IDL, allow &gt;120% hotspots in GTV</li>
                <li>- Mucosal: Rx to 95-98% IDL, mucosal hotspots &lt;107%, avoid hotspots in bone/cartilage/vessels</li>
                <li>- Gamma Knife: Prescription typically 50% IDL (range 40-60%)</li>
                <li>- CyberKnife: Prescription typically 80% IDL</li>
                <li>- Use avoidance structures + &quot;preferred isodose line fall off&quot; volume to guide arc placement (ALARA)</li>
              </>
            )}
            {(evaluation.plannedModality === 'pbt') && (
              <>
                <li>- Imaging verification every 1-2 weeks recommended</li>
                <li>- Caution with air interface regions (paranasal sinuses, nasopharynx)</li>
                <li>- CBCT/IGRT when available strongly recommended</li>
                <li>- Monitor for hot spots in high-gradient regions</li>
              </>
            )}
          </ul>
        </div>
      )}
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
              <p className="text-sm opacity-90 mt-2">Based on MDACC 3-Step Evaluation</p>
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
            <div className="text-xs text-gray-500 mb-1">Tumor Volume</div>
            <div className="font-bold text-gray-900 text-sm sm:text-base">
              {evaluation.tumorVolume ? `${evaluation.tumorVolume} cc` : 'Not specified'}
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

        {/* High-Risk Subsite Warning */}
        {evaluation.recurrenceSite && ['mucosal-larynx', 'mucosal-op'].includes(evaluation.recurrenceSite) && (
          <div className="bg-red-50 p-4 sm:p-5 rounded-xl border border-red-200">
            <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">!</span>
              High-Risk Subsite Considerations
            </h4>
            <p className="text-sm text-red-700 mb-3">
              The following anatomic features increase re-irradiation toxicity risk and require careful planning:
            </p>
            <ul className="space-y-2 text-sm text-red-700">
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">-</span>
                <span><strong>Tumor adjacent to hyoid bone:</strong> Increased risk of osteoradionecrosis and cartilage necrosis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">-</span>
                <span><strong>Posterior pharyngeal wall involvement:</strong> Risk of mucosal ulceration and carotid exposure</span>
              </li>
              {evaluation.recurrenceSite === 'mucosal-larynx' && (
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">-</span>
                  <span><strong>Supraglottic tumors:</strong> Higher toxicity profile than glottic; consider laryngeal substructure-specific constraints</span>
                </li>
              )}
              {evaluation.recurrenceSite === 'mucosal-op' && (
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">-</span>
                  <span><strong>Hypopharynx/piriform involvement:</strong> Elevated risk of lingual artery bleed and severe dysphagia</span>
                </li>
              )}
            </ul>
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

        {/* MDACC Constraints - SBRT */}
        {evaluation.plannedModality === 'sbrt' && (
          <div className="bg-blue-50 p-4 sm:p-5 rounded-xl border border-blue-200">
            <h4 className="font-bold text-blue-800 mb-3">MDACC SBRT Dose Constraints</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-semibold text-blue-700 mb-2">Tier 1 (Go/No-Go)</div>
                <ul className="text-blue-600 space-y-1">
                  <li>Brainstem: Dmax &lt;13 Gy</li>
                  <li>Spinal Cord: Dmax &lt;12 Gy (2mm PRV)</li>
                  <li>Optic Chiasm: Dmax &lt;12 Gy (1mm PRV)</li>
                </ul>
              </div>
              <div>
                <div className="font-semibold text-blue-700 mb-2">Tier 2 (Critical)</div>
                <ul className="text-blue-600 space-y-1">
                  <li>Carotid/Lingual: Dmax &lt;30 Gy, V27 &lt;0.5cc (&lt;1cm)</li>
                  <li>Cochlea: Dmax &lt;18 Gy</li>
                  <li>Larynx: Dmax &lt;12 Gy (non-laryngeal)</li>
                  <li>Mandible/Hyoid: V25 &lt;3cc</li>
                  <li>Temporal Lobe: Dmax &lt;27 Gy, V20 &lt;0.5cc</li>
                </ul>
              </div>
              <div>
                <div className="font-semibold text-blue-700 mb-2">Tier 3 (QOL)</div>
                <ul className="text-blue-600 space-y-1">
                  <li>Mucosal: Dmax &lt;15 Gy</li>
                  <li>Constrictors: Dmean &lt;10 Gy</li>
                  <li>Parotid: Dmax &lt;25 Gy, V15 &lt;1cc</li>
                  <li>Mastoid/EAC: ALARA</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-blue-200 text-xs text-blue-700">
              <strong>References:</strong> Diao et al, Head & Neck 2022;44:289-291 | Phan institutional planning directives
            </div>
          </div>
        )}

        {/* MDACC Guidance - IMRT */}
        {evaluation.plannedModality === 'imrt' && (
          <div className="bg-indigo-50 p-4 sm:p-5 rounded-xl border border-indigo-200">
            <h4 className="font-bold text-indigo-800 mb-3">IMRT Re-Irradiation Technical Guidance</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-semibold text-indigo-700 mb-2">Dose & Fractionation</div>
                <ul className="text-indigo-600 space-y-1">
                  <li>Curative gross disease: 66-70 Gy (institutional practice)</li>
                  <li>Other curative: 64 Gy standard fractionation</li>
                  <li>Palliative: 33-35 Gy</li>
                  <li>Dose gradient: ~8% per mm</li>
                </ul>
              </div>
              <div>
                <div className="font-semibold text-indigo-700 mb-2">Key Considerations</div>
                <ul className="text-indigo-600 space-y-1">
                  <li>Composite dose review with prior RT plan essential</li>
                  <li>Margin optimization for target coverage + OAR sparing</li>
                  <li>Preferred for mucosal tumors and large volumes (&gt;25cc)</li>
                  <li>Consider dose homogeneity to reduce hotspots</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-indigo-200 text-xs text-indigo-700">
              <strong>Reference:</strong> MDACC institutional practice
            </div>
          </div>
        )}

        {/* Proton Guidance */}
        {evaluation.plannedModality === 'pbt' && (
          <div className="bg-purple-50 p-4 sm:p-5 rounded-xl border border-purple-200">
            <h4 className="font-bold text-purple-800 mb-3">Proton Therapy Re-Irradiation Guidance</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-semibold text-purple-700 mb-2">Technical Requirements</div>
                <ul className="text-purple-600 space-y-1">
                  <li>Imaging verification every 1-2 weeks</li>
                  <li>CBCT/IGRT when available</li>
                  <li>Monitor for hot spots in high-gradient regions</li>
                </ul>
              </div>
              <div>
                <div className="font-semibold text-purple-700 mb-2">Cautions</div>
                <ul className="text-purple-600 space-y-1">
                  <li>Air interface regions require extra vigilance</li>
                  <li>Range uncertainty in re-irradiated tissue</li>
                  <li>Best suited for skull base and well-defined targets</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Clinical Judgment Section (formerly Step 4) */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border mt-2">
          <div className="border-l-4 border-purple-500 pl-4 mb-6">
            <h3 className="text-lg font-bold text-gray-900">Clinical Judgment</h3>
            <p className="text-gray-600 text-sm mt-1">Final assessment of treatment goals and patient factors</p>
          </div>

          {/* Treatment Goal */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-800 mb-3">Treatment Intent</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { value: 'curative', label: 'Curative', note: 'Goal: Long-term local control and survival', icon: 'C' },
                { value: 'palliative', label: 'Palliative', note: 'Goal: Symptom control, quality of life', icon: 'P' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateEvaluation('treatmentGoal', opt.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    evaluation.treatmentGoal === opt.value
                      ? 'border-teal-500 bg-teal-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mb-2 text-lg font-bold text-gray-600">{opt.icon}</div>
                  <div className="font-bold text-gray-900">{opt.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{opt.note}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Performance Status */}
          <div className="mb-6">
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
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
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
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
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

        {/* Show Our Work */}
        <div className="border rounded-xl overflow-hidden">
          <button
            onClick={() => setShowMethodology(!showMethodology)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="font-semibold text-gray-700 text-sm">Show Our Work</span>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform ${showMethodology ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showMethodology && (
            <div className="p-4 bg-white border-t text-sm text-gray-700 space-y-4">
              <div>
                <h5 className="font-semibold text-gray-800 mb-1">Assessment Methodology</h5>
                <p>This tool uses the MDACC 3-step evaluation framework for H&amp;N re-irradiation candidacy assessment, incorporating tumor control probability (TCP), normal tissue complication probability (NTCP), and technical feasibility factors.</p>
              </div>
              <div>
                <h5 className="font-semibold text-gray-800 mb-1">Scoring</h5>
                <ul className="space-y-1 text-gray-600">
                  <li>- Re-irradiation interval: +20 (&gt;24mo), +10 (12-24mo), -10 (6-12mo), -30 (&lt;6mo)</li>
                  <li>- Volume: +20 (&lt;15cc), +10 (15-25cc), -10 (25-50cc), -20 (&gt;50cc)</li>
                  <li>- Histology: +15 (non-SCC), -5 (SCC), -15 (melanoma/sarcoma)</li>
                  <li>- Field relationship: +10 (out-of-field), -5 (marginal), -15 (in-field)</li>
                  <li>- Carotid: -15 (encased &gt;180 deg)</li>
                  <li>- Surgical status: +10 (post-op), +5 (with flap)</li>
                  <li>- Performance status: -10 (ECOG &gt;=2)</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-gray-800 mb-1">Classification</h5>
                <ul className="space-y-1 text-gray-600">
                  <li>- <strong>Favorable</strong>: Score &gt;= 15</li>
                  <li>- <strong>Conditional</strong>: Score -10 to 14</li>
                  <li>- <strong>Unfavorable</strong>: Score &lt; -10</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-gray-800 mb-1">Dose Constraints</h5>
                <p>SBRT constraints based on Diao et al (Head &amp; Neck, 2022) and MDACC institutional planning directives (Phan). Organized by 3-tier toxicity classification.</p>
              </div>
              <div>
                <h5 className="font-semibold text-gray-800 mb-1">Outcome Data</h5>
                <p>2-year outcomes (LC, RR, DM, OS, PFS, G3+ toxicity) from MDACC institutional SBRT re-irradiation series, stratified by anatomic subsite.</p>
              </div>
              <div className="text-xs text-gray-400 pt-2 border-t">
                This tool is for clinical decision support only. All treatment decisions should be made in a multidisciplinary setting. Not an official MD Anderson tool.
              </div>
            </div>
          )}
        </div>

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
            Step {currentStep} of 3
          </div>
          
          {currentStep < 3 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-4 sm:px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors shadow-lg text-sm sm:text-base"
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => setShowResults(true)}
              disabled={
                evaluation.histology === '' &&
                evaluation.recurrenceSite === '' &&
                evaluation.reirradiationInterval === undefined &&
                evaluation.tumorVolume === undefined
              }
              className={`px-4 sm:px-8 py-3 font-bold rounded-xl transition-all text-sm sm:text-base ${
                evaluation.histology === '' &&
                evaluation.recurrenceSite === '' &&
                evaluation.reirradiationInterval === undefined &&
                evaluation.tumorVolume === undefined
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg'
              }`}
            >
              Generate Report
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
