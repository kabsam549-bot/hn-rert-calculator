'use client';

import { useState } from 'react';
import Mermaid from './Mermaid';

interface SalvageEvaluation {
  // Step 1: Prior Treatment
  priorRadiation: boolean | null;
  priorDose: number | undefined;
  priorFractions: number | undefined;
  priorSite: string;
  diseaseIntervalMonths: number | undefined; // disease-free interval
  reirradiationIntervalMonths: number | undefined; // time since RT (tissue recovery)
  priorSurgery: boolean | null;
  priorSystemic: boolean | null;
  priorSystemicType: string[];

  // Step 2: Current Disease
  recurrenceType: 'recurrent' | 'new-primary' | '';
  fieldStatus: 'in-field' | 'marginal' | 'out-field' | '';
  histology: 'scc' | 'non-scc' | 'melanoma-sarcoma' | '';
  location: string;
  tumorVolume: number | undefined;

  // Step 3: Planned Salvage
  plannedSurgery: boolean | null;
  surgeryWithFlap: boolean | null;
  plannedReRT: boolean | null;
  plannedSystemic: boolean | null;

  // Step 4: Clinical Factors
  dysphagia: 0 | 1 | 2 | 3 | 4 | null;
  feedingTube: boolean | null;
  trismus: boolean | null;
  organDysfunction: string[];
  ecog: 0 | 1 | 2 | 3 | 4 | null;
}

const initialEvaluation: SalvageEvaluation = {
  priorRadiation: null,
  priorDose: undefined,
  priorFractions: undefined,
  priorSite: '',
  diseaseIntervalMonths: undefined,
  reirradiationIntervalMonths: undefined,
  priorSurgery: null,
  priorSystemic: null,
  priorSystemicType: [],

  recurrenceType: '',
  fieldStatus: '',
  histology: '',
  location: '',
  tumorVolume: undefined,

  plannedSurgery: null,
  surgeryWithFlap: null,
  plannedReRT: null,
  plannedSystemic: null,

  dysphagia: null,
  feedingTube: null,
  trismus: null,
  organDysfunction: [],
  ecog: null,
};

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export default function SalvagePathway() {
  const [currentStep, setCurrentStep] = useState(1);
  const [evaluation, setEvaluation] = useState<SalvageEvaluation>(initialEvaluation);
  const [showResults, setShowResults] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateEvaluation = (field: keyof SalvageEvaluation, value: any) => {
    setEvaluation(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: 'priorSystemicType' | 'organDysfunction', value: string) => {
    setEvaluation(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v: string) => v !== value)
        : [...prev[field], value]
    }));
  };

  const calculateAssessment = () => {
    let feasibilityScore = 0;
    const risks: string[] = [];
    const favorable: string[] = [];
    const recommendations: string[] = [];

    // Disease-free interval (critical prognostic factor from MIRI + Safario)
    if (evaluation.diseaseIntervalMonths !== undefined) {
      if (evaluation.diseaseIntervalMonths < 24) {
        risks.push(`Disease-free interval <2yr (${evaluation.diseaseIntervalMonths} months) is associated with poor prognosis per MIRI data`);
        feasibilityScore -= 20;
      } else {
        favorable.push(`Disease-free interval ≥2yr (${evaluation.diseaseIntervalMonths} months) is favorable`);
        feasibilityScore += 15;
      }
    }

    // Re-irradiation interval (tissue recovery)
    if (evaluation.reirradiationIntervalMonths !== undefined) {
      if (evaluation.reirradiationIntervalMonths < 6) {
        risks.push('Re-irradiation interval <6 months - tissue recovery insufficient, generally NOT recommended');
        feasibilityScore -= 30;
      } else if (evaluation.reirradiationIntervalMonths < 12) {
        risks.push('Re-irradiation interval 6-12 months - requires careful assessment of tissue recovery');
        feasibilityScore -= 10;
      } else if (evaluation.reirradiationIntervalMonths >= 24) {
        favorable.push('Re-irradiation interval ≥24 months allows significant tissue recovery');
        feasibilityScore += 20;
      } else {
        favorable.push('Re-irradiation interval 12-24 months is acceptable');
        feasibilityScore += 10;
      }
    }

    // Recurrence type
    if (evaluation.recurrenceType === 'new-primary') {
      favorable.push('New primary tumor (not recurrence) has better prognosis');
      feasibilityScore += 10;
    } else if (evaluation.recurrenceType === 'recurrent') {
      risks.push('Recurrent disease requires careful assessment');
      feasibilityScore -= 5;
    }

    // Field status (critical for re-RT planning)
    if (evaluation.fieldStatus === 'out-field') {
      favorable.push('Out-of-field recurrence allows higher re-RT doses with lower toxicity risk');
      feasibilityScore += 15;
      // Out-of-field recurrence risk assessment
      const outFieldRisk = calculateOutFieldRisk();
      if (outFieldRisk > 40) {
        recommendations.push('OUT-OF-FIELD RECURRENCE RISK >40%: Systemic therapy strongly recommended');
      } else if (outFieldRisk > 30) {
        recommendations.push('OUT-of-field recurrence risk 30-40%: Consider systemic therapy/IO');
      } else if (outFieldRisk > 20) {
        recommendations.push('Out-of-field recurrence risk 20-30%: Consider maintenance systemic therapy/IO');
      }
    } else if (evaluation.fieldStatus === 'in-field') {
      risks.push('In-field recurrence (full overlap with prior RT) increases toxicity risk significantly');
      feasibilityScore -= 15;
    } else if (evaluation.fieldStatus === 'marginal') {
      risks.push('Marginal recurrence (partial overlap) requires careful dose planning');
      feasibilityScore -= 5;
    }

    // Histology
    if (evaluation.histology === 'melanoma-sarcoma') {
      risks.push('Melanoma/Sarcoma histology associated with poor outcomes with re-RT');
      feasibilityScore -= 20;
    } else if (evaluation.histology === 'non-scc') {
      favorable.push('Non-SCC histology (excluding melanoma/sarcoma) generally responds better');
      feasibilityScore += 10;
    } else if (evaluation.histology === 'scc') {
      // Neutral - most common, no score change
    }

    // Surgery + flap (affects toxicity)
    if (evaluation.plannedSurgery === true) {
      if (evaluation.surgeryWithFlap === true) {
        risks.push('Planned surgery with flap reconstruction increases acute toxicity risk significantly');
        feasibilityScore -= 15;
      } else {
        favorable.push('Planned salvage surgery without flap may reduce tumor burden before re-RT');
        feasibilityScore += 5;
      }
    }

    // Re-RT + Surgery combination
    if (evaluation.plannedReRT === true && evaluation.plannedSurgery === true) {
      risks.push('Combined surgery + re-RT requires careful coordination and toxicity assessment');
    }

    // Organ dysfunction
    if (evaluation.organDysfunction.length > 0) {
      risks.push(`Pre-existing organ dysfunction: ${evaluation.organDysfunction.join(', ')}`);
      feasibilityScore -= evaluation.organDysfunction.length * 5;
    }

    // Feeding tube (pre-existing)
    if (evaluation.feedingTube === true) {
      risks.push('Pre-existing feeding tube indicates baseline dysphagia - re-RT will worsen');
      feasibilityScore -= 10;
    }

    // Trismus
    if (evaluation.trismus === true) {
      risks.push('Pre-existing trismus may worsen with re-RT');
      feasibilityScore -= 5;
    }

    // ECOG
    if (evaluation.ecog !== null && evaluation.ecog >= 2) {
      risks.push(`ECOG PS ${evaluation.ecog} (≥2) associated with poorer tolerance and outcomes`);
      feasibilityScore -= 10;
    } else if (evaluation.ecog !== null && evaluation.ecog <= 1) {
      favorable.push(`Good performance status (ECOG ${evaluation.ecog}) is favorable`);
      feasibilityScore += 10;
    }

    // Determine overall feasibility
    let feasibility: 'favorable' | 'conditional' | 'unfavorable' | 'not-recommended';
    if (feasibilityScore >= 20) {
      feasibility = 'favorable';
    } else if (feasibilityScore >= 0) {
      feasibility = 'conditional';
    } else if (feasibilityScore >= -20) {
      feasibility = 'unfavorable';
    } else {
      feasibility = 'not-recommended';
    }

    // Automatic recommendations
    recommendations.push('Refer to radiation oncology for multidisciplinary evaluation');
    if (evaluation.plannedReRT === true || evaluation.plannedReRT === null) {
      recommendations.push('Radiation oncology will assess dosimetric feasibility and OAR constraints');
    }
    if (risks.some(r => r.includes('tissue recovery insufficient'))) {
      recommendations.push('Consider delaying re-RT if possible to allow tissue recovery');
    }
    if (evaluation.fieldStatus === 'in-field' || evaluation.fieldStatus === 'marginal') {
      recommendations.push('Advanced planning techniques (IMRT, SBRT, or proton therapy) likely needed');
    }

    return { feasibility, feasibilityScore, risks, favorable, recommendations };
  };

  const calculateOutFieldRisk = (): number => {
    // Simple heuristic for out-of-field recurrence risk
    let risk = 20; // baseline
    if (evaluation.diseaseIntervalMonths !== undefined && evaluation.diseaseIntervalMonths < 12) risk += 15;
    if (evaluation.histology === 'melanoma-sarcoma') risk += 20;
    if (evaluation.ecog !== null && evaluation.ecog >= 2) risk += 10;
    return Math.min(100, risk);
  };

  const getMermaidChart = () => {
    return `graph TD
    Start([Patient with H&N Recurrence]):::startNode
    Start --> PriorRT{Prior Radiation?}
    
    PriorRT -->|No| NoRT[Not a Re-RT Candidate<br/>Standard RT Protocols Apply]:::endNode
    PriorRT -->|Yes| RecType{Recurrent vs<br/>New Primary?}
    
    RecType -->|New Primary| Field{Field Status?}
    RecType -->|Recurrent| Field
    
    Field -->|Out-of-Field| HistOut{Histology?}
    Field -->|Marginal| HistMarg{Histology?}
    Field -->|In-Field| HistIn{Histology?}
    
    HistOut -->|SCC| SurgOut{Surgery<br/>Candidate?}
    HistOut -->|Non-SCC| SurgOut
    HistOut -->|Melanoma/Sarcoma| UnfavHist[UNFAVORABLE<br/>Melanoma/Sarcoma<br/>poor outcomes]:::unfavNode
    
    HistMarg -->|SCC| SurgMarg{Surgery<br/>Candidate?}
    HistMarg -->|Non-SCC| SurgMarg
    HistMarg -->|Melanoma/Sarcoma| UnfavHist
    
    HistIn -->|SCC| SurgIn{Surgery<br/>Candidate?}
    HistIn -->|Non-SCC| SurgIn
    HistIn -->|Melanoma/Sarcoma| UnfavHist
    
    SurgOut -->|Yes| FlapOut{With Flap?}
    SurgOut -->|No| ReRTOut{Re-RT<br/>Feasible?}
    
    SurgMarg -->|Yes| FlapMarg{With Flap?}
    SurgMarg -->|No| ReRTMarg{Re-RT<br/>Feasible?}
    
    SurgIn -->|Yes| FlapIn{With Flap?}
    SurgIn -->|No| ReRTIn{Re-RT<br/>Feasible?}
    
    FlapOut -->|No Flap| ReRTOut
    FlapOut -->|Flap| ToxRiskFlap[CONDITIONAL<br/>Flap increases toxicity<br/>requires careful assessment]:::condNode
    
    FlapMarg -->|No Flap| ReRTMarg
    FlapMarg -->|Flap| ToxRiskFlap
    
    FlapIn -->|No Flap| ReRTIn
    FlapIn -->|Flap| ToxRiskFlap
    
    ToxRiskFlap --> AssessOut
    
    ReRTOut -->|Yes| AssessOut[FAVORABLE<br/>Out-field + Re-RT<br/>Best scenario]:::favNode
    ReRTOut -->|No| ConsiderSys[CONDITIONAL<br/>Consider systemic<br/>therapy/observation]:::condNode
    
    ReRTMarg -->|Yes| AssessMarg[CONDITIONAL<br/>Marginal field<br/>Advanced planning needed]:::condNode
    ReRTMarg -->|No| ConsiderSys
    
    ReRTIn -->|Yes| AssessIn[UNFAVORABLE<br/>In-field recurrence<br/>High toxicity risk]:::unfavNode
    ReRTIn -->|No| ConsiderSys
    
    AssessOut --> ReferRadOnc[Refer to Radiation Oncology]:::actionNode
    AssessMarg --> ReferRadOnc
    AssessIn --> ReferRadOnc
    ConsiderSys --> ReferRadOnc
    
    classDef startNode fill:#3b82f6,stroke:#1e40af,stroke-width:3px,color:#fff
    classDef favNode fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff
    classDef condNode fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff
    classDef unfavNode fill:#ef4444,stroke:#dc2626,stroke-width:2px,color:#fff
    classDef endNode fill:#6b7280,stroke:#4b5563,stroke-width:2px,color:#fff
    classDef actionNode fill:#8b5cf6,stroke:#7c3aed,stroke-width:2px,color:#fff`;
  };

  const renderStepIndicator = () => (
    <div className="bg-white border-b">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Salvage Decision Tool</span>
            <span className="text-xs text-gray-400">Step {currentStep} of 5</span>
          </div>
          <div className="relative h-1 bg-gray-200 rounded-full mb-4">
            <div 
              className="absolute h-1 bg-teal-500 rounded-full transition-all duration-300" 
              style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
            />
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[
              { num: 1, label: 'Prior Tx', fullLabel: 'Treatment History' },
              { num: 2, label: 'Disease', fullLabel: 'Current Disease' },
              { num: 3, label: 'Salvage', fullLabel: 'Planned Treatment' },
              { num: 4, label: 'Clinical', fullLabel: 'Patient Factors' },
              { num: 5, label: 'Results', fullLabel: 'Assessment' },
            ].map((step) => (
              <button
                key={step.num}
                onClick={() => step.num <= currentStep && setCurrentStep(step.num)}
                disabled={step.num > currentStep && !showResults}
                className={`flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-all ${
                  currentStep === step.num
                    ? 'bg-teal-50 border-2 border-teal-500'
                    : currentStep > step.num || showResults
                    ? 'bg-teal-50/50 border border-teal-200'
                    : 'bg-gray-50 border border-gray-200 opacity-60'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  currentStep === step.num
                    ? 'bg-teal-600 text-white'
                    : currentStep > step.num || showResults
                    ? 'bg-teal-200 text-teal-700'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {currentStep > step.num || showResults ? <CheckIcon /> : step.num}
                </div>
                <div className="min-w-0 hidden sm:block">
                  <span className={`text-xs font-bold block truncate ${
                    currentStep === step.num ? 'text-teal-700' : 'text-gray-500'
                  }`}>{step.label}</span>
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
      <div className="border-l-4 border-blue-600 pl-4">
        <h2 className="text-xl font-bold text-gray-900">Step 1: Prior Treatment History</h2>
        <p className="text-gray-600 mt-1">Understanding previous treatments is critical for re-irradiation assessment</p>
      </div>

      {/* Prior Radiation */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">Prior Radiation Treatment?</label>
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: true, label: 'Yes', note: 'Patient received prior RT' },
            { value: false, label: 'No', note: 'No prior radiation' },
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => updateEvaluation('priorRadiation', opt.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                evaluation.priorRadiation === opt.value
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

      {evaluation.priorRadiation === true && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Prior Dose (Gy)</label>
              <input
                type="number"
                value={evaluation.priorDose ?? ''}
                onChange={(e) => updateEvaluation('priorDose', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g., 70"
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Prior Fractions</label>
              <input
                type="number"
                value={evaluation.priorFractions ?? ''}
                onChange={(e) => updateEvaluation('priorFractions', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g., 35"
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Prior RT Site</label>
            <input
              type="text"
              value={evaluation.priorSite}
              onChange={(e) => updateEvaluation('priorSite', e.target.value)}
              placeholder="e.g., Oropharynx, Larynx"
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
            />
          </div>
        </>
      )}

      {/* Disease-Free Interval */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">
          Disease-Free Interval (months)
          <span className="ml-2 text-xs font-normal text-amber-600">KEY PROGNOSTIC FACTOR</span>
        </label>
        <p className="text-sm text-gray-600 mb-3">Time from initial treatment to recurrence detection</p>
        <input
          type="number"
          value={evaluation.diseaseIntervalMonths ?? ''}
          onChange={(e) => updateEvaluation('diseaseIntervalMonths', e.target.value ? Number(e.target.value) : undefined)}
          placeholder="Months since initial treatment"
          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
        />
        <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> DFI &lt;2 years is associated with poor prognosis per MIRI + Safario data
          </p>
        </div>
      </div>

      {/* Re-irradiation Interval */}
      {evaluation.priorRadiation === true && (
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Re-irradiation Interval (months)
          </label>
          <p className="text-sm text-gray-600 mb-3">Time since completion of prior radiation (tissue recovery)</p>
          <input
            type="number"
            value={evaluation.reirradiationIntervalMonths ?? ''}
            onChange={(e) => updateEvaluation('reirradiationIntervalMonths', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Months since prior RT"
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
          />
          {evaluation.reirradiationIntervalMonths !== undefined && (
            <div className={`mt-3 p-3 rounded-lg border ${
              evaluation.reirradiationIntervalMonths < 6 ? 'bg-red-50 border-red-200' :
              evaluation.reirradiationIntervalMonths < 12 ? 'bg-amber-50 border-amber-200' :
              evaluation.reirradiationIntervalMonths < 24 ? 'bg-yellow-50 border-yellow-200' :
              'bg-green-50 border-green-200'
            }`}>
              <p className={`text-sm ${
                evaluation.reirradiationIntervalMonths < 6 ? 'text-red-800' :
                evaluation.reirradiationIntervalMonths < 12 ? 'text-amber-800' :
                evaluation.reirradiationIntervalMonths < 24 ? 'text-yellow-800' :
                'text-green-800'
              }`}>
                {evaluation.reirradiationIntervalMonths < 6 ? '⚠️ <6 months: Generally NOT recommended - insufficient tissue recovery' :
                 evaluation.reirradiationIntervalMonths < 12 ? '⚠️ 6-12 months: Requires careful assessment' :
                 evaluation.reirradiationIntervalMonths < 24 ? '✓ 12-24 months: Acceptable' :
                 '✓ ≥24 months: Favorable - significant tissue recovery'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Prior Surgery */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">Prior Surgery?</label>
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: true, label: 'Yes', note: 'Prior surgical resection' },
            { value: false, label: 'No', note: 'No prior surgery' },
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => updateEvaluation('priorSurgery', opt.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                evaluation.priorSurgery === opt.value
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

      {/* Prior Systemic Therapy */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">Prior Systemic Therapy?</label>
        <div className="grid grid-cols-2 gap-4 mb-3">
          {[
            { value: true, label: 'Yes', note: 'Received systemic therapy' },
            { value: false, label: 'No', note: 'No prior systemic therapy' },
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => updateEvaluation('priorSystemic', opt.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                evaluation.priorSystemic === opt.value
                  ? 'border-teal-500 bg-teal-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="font-semibold text-gray-900">{opt.label}</div>
              <div className="text-xs text-gray-500 mt-1">{opt.note}</div>
            </button>
          ))}
        </div>
        {evaluation.priorSystemic === true && (
          <div className="grid grid-cols-3 gap-3">
            {['Chemotherapy', 'Immunotherapy', 'Targeted Therapy'].map((type) => (
              <button
                key={type}
                onClick={() => toggleArrayField('priorSystemicType', type)}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  evaluation.priorSystemicType.includes(type)
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-medium">{type}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8">
      <div className="border-l-4 border-purple-600 pl-4">
        <h2 className="text-xl font-bold text-gray-900">Step 2: Current Disease Characteristics</h2>
        <p className="text-gray-600 mt-1">Disease biology and extent affect treatment approach</p>
      </div>

      {/* Recurrence Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">
          Recurrence Type
          <span className="ml-2 text-xs font-normal text-blue-600">IMPORTANT DISTINCTION</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: 'recurrent', label: 'Recurrent Disease', note: 'Same histology/site as original tumor' },
            { value: 'new-primary', label: 'New Primary', note: 'Different histology/site - new cancer' },
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
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            New primary tumors generally have better prognosis than recurrent disease
          </p>
        </div>
      </div>

      {/* Field Status */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">
          Field Status
          <span className="ml-2 text-xs font-normal text-red-600">CRITICAL FOR RE-RT PLANNING</span>
        </label>
        <p className="text-sm text-gray-600 mb-3">Relationship to prior radiation field</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'in-field', label: 'In-Field', note: 'Full overlap with prior RT', color: 'red' },
            { value: 'marginal', label: 'Marginal', note: 'Partial overlap', color: 'amber' },
            { value: 'out-field', label: 'Out-of-Field', note: 'Minimal dose overlap', color: 'green' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateEvaluation('fieldStatus', opt.value)}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                evaluation.fieldStatus === opt.value
                  ? opt.color === 'red' ? 'border-red-500 bg-red-50 shadow-md' :
                    opt.color === 'amber' ? 'border-amber-500 bg-amber-50 shadow-md' :
                    'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="font-semibold text-gray-900">{opt.label}</div>
              <div className="text-xs text-gray-500 mt-1">{opt.note}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Histology */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">Tumor Histology</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'scc', label: 'SCC', fullLabel: 'Squamous Cell Carcinoma', note: 'Most common' },
            { value: 'non-scc', label: 'Non-SCC', fullLabel: 'Non-Squamous (non-melanoma/sarcoma)', note: 'ACC, SNUC, NPC, Adenoca' },
            { value: 'melanoma-sarcoma', label: 'Melanoma/Sarcoma', fullLabel: 'Melanoma or Sarcoma', note: 'Poor prognosis' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateEvaluation('histology', opt.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                evaluation.histology === opt.value
                  ? opt.value === 'melanoma-sarcoma' ? 'border-red-500 bg-red-50 shadow-md' : 'border-teal-500 bg-teal-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="font-semibold text-gray-900">{opt.label}</div>
              <div className="text-xs text-gray-500 mt-1">{opt.note}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">Recurrence Location</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            'Nasopharynx', 'Oropharynx', 'Larynx', 'Oral Cavity',
            'Skull Base', 'Neck', 'Paranasal Sinus', 'Other'
          ].map((loc) => (
            <button
              key={loc}
              onClick={() => updateEvaluation('location', loc)}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                evaluation.location === loc
                  ? 'border-teal-500 bg-teal-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium">{loc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Tumor Volume */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">Tumor Volume Estimate (optional)</label>
        <input
          type="number"
          value={evaluation.tumorVolume ?? ''}
          onChange={(e) => updateEvaluation('tumorVolume', e.target.value ? Number(e.target.value) : undefined)}
          placeholder="Estimated GTV in cc (if known)"
          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8">
      <div className="border-l-4 border-green-600 pl-4">
        <h2 className="text-xl font-bold text-gray-900">Step 3: Planned Salvage Treatment</h2>
        <p className="text-gray-600 mt-1">What treatment modalities are being considered?</p>
      </div>

      {/* Planned Surgery */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">Salvage Surgery Planned?</label>
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: true, label: 'Yes', note: 'Surgical salvage planned' },
            { value: false, label: 'No', note: 'No surgery planned' },
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => updateEvaluation('plannedSurgery', opt.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                evaluation.plannedSurgery === opt.value
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

      {/* Flap Reconstruction */}
      {evaluation.plannedSurgery === true && (
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Flap Reconstruction?
            <span className="ml-2 text-xs font-normal text-amber-600">AFFECTS TOXICITY SIGNIFICANTLY</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: true, label: 'With Flap', note: 'Flap reconstruction planned - higher toxicity' },
              { value: false, label: 'No Flap', note: 'No flap reconstruction' },
            ].map((opt) => (
              <button
                key={opt.label}
                onClick={() => updateEvaluation('surgeryWithFlap', opt.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  evaluation.surgeryWithFlap === opt.value
                    ? opt.value === true ? 'border-amber-500 bg-amber-50 shadow-md' : 'border-teal-500 bg-teal-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-semibold text-gray-900">{opt.label}</div>
                <div className="text-xs text-gray-500 mt-1">{opt.note}</div>
              </button>
            ))}
          </div>
          <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Combined surgery with flap + re-RT increases acute toxicity risk significantly
            </p>
          </div>
        </div>
      )}

      {/* Planned Re-RT */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">Planned Re-irradiation?</label>
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: true, label: 'Yes', note: 'Re-RT being considered' },
            { value: false, label: 'No', note: 'Re-RT not planned' },
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => updateEvaluation('plannedReRT', opt.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                evaluation.plannedReRT === opt.value
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

      {/* Planned Systemic/IO */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">Planned Systemic Therapy or Immunotherapy?</label>
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: true, label: 'Yes', note: 'Systemic therapy/IO planned' },
            { value: false, label: 'No', note: 'No systemic therapy' },
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => updateEvaluation('plannedSystemic', opt.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                evaluation.plannedSystemic === opt.value
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
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-8">
      <div className="border-l-4 border-amber-600 pl-4">
        <h2 className="text-xl font-bold text-gray-900">Step 4: Clinical Factors & Organ Dysfunction</h2>
        <p className="text-gray-600 mt-1">Baseline toxicity and performance status</p>
      </div>

      {/* Dysphagia */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">Current Dysphagia Grade</label>
        <div className="grid grid-cols-5 gap-2">
          {[
            { value: 0, label: 'Grade 0', note: 'Normal' },
            { value: 1, label: 'Grade 1', note: 'Mild' },
            { value: 2, label: 'Grade 2', note: 'Moderate' },
            { value: 3, label: 'Grade 3', note: 'Severe' },
            { value: 4, label: 'Grade 4', note: 'Life-threatening' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateEvaluation('dysphagia', opt.value as 0 | 1 | 2 | 3 | 4)}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                evaluation.dysphagia === opt.value
                  ? opt.value <= 1 ? 'border-green-500 bg-green-50' : opt.value <= 2 ? 'border-amber-500 bg-amber-50' : 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-bold text-sm">{opt.value}</div>
              <div className="text-xs text-gray-500 mt-1">{opt.note}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Feeding Tube */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">Pre-existing Feeding Tube?</label>
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: true, label: 'Yes', note: 'Feeding tube present' },
            { value: false, label: 'No', note: 'No feeding tube' },
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => updateEvaluation('feedingTube', opt.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                evaluation.feedingTube === opt.value
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

      {/* Trismus */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">Trismus Present?</label>
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: true, label: 'Yes', note: 'Limited jaw opening' },
            { value: false, label: 'No', note: 'Normal jaw opening' },
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => updateEvaluation('trismus', opt.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                evaluation.trismus === opt.value
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

      {/* Organ Dysfunction */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">Organ Dysfunction (select all that apply)</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {['Dysphagia G3+', 'Aspiration', 'Airway compromise', 'Carotid blowout history', 'Bone necrosis', 'Soft tissue necrosis'].map((dysfunction) => (
            <button
              key={dysfunction}
              onClick={() => toggleArrayField('organDysfunction', dysfunction)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                evaluation.organDysfunction.includes(dysfunction)
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium">{dysfunction}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ECOG/KPS */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">ECOG Performance Status</label>
        <div className="grid grid-cols-5 gap-2">
          {[
            { value: 0, label: 'PS 0', note: 'Fully active' },
            { value: 1, label: 'PS 1', note: 'Light work' },
            { value: 2, label: 'PS 2', note: 'Ambulatory' },
            { value: 3, label: 'PS 3', note: 'Limited' },
            { value: 4, label: 'PS 4', note: 'Bedbound' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateEvaluation('ecog', opt.value as 0 | 1 | 2 | 3 | 4)}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                evaluation.ecog === opt.value
                  ? opt.value <= 1 ? 'border-green-500 bg-green-50' : opt.value === 2 ? 'border-amber-500 bg-amber-50' : 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-bold text-sm">{opt.value}</div>
              <div className="text-xs text-gray-500 mt-1 hidden md:block">{opt.note}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderResults = () => {
    const assessment = calculateAssessment();
    
    return (
      <div className="space-y-6">
        {/* Main Assessment Card */}
        <div className={`p-6 rounded-2xl shadow-lg ${
          assessment.feasibility === 'favorable' ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' :
          assessment.feasibility === 'conditional' ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white' :
          assessment.feasibility === 'unfavorable' ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white' :
          'bg-gradient-to-br from-red-600 to-rose-700 text-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium opacity-90 mb-1">Re-Irradiation Assessment</div>
              <h2 className="text-2xl sm:text-3xl font-bold uppercase">
                {assessment.feasibility === 'favorable' ? 'Favorable' :
                 assessment.feasibility === 'conditional' ? 'Conditional' :
                 assessment.feasibility === 'unfavorable' ? 'Unfavorable' :
                 'Not Recommended'}
              </h2>
              <p className="text-sm opacity-90 mt-2">
                {assessment.feasibility === 'favorable' ? 'Patient appears suitable for re-irradiation evaluation' :
                 assessment.feasibility === 'conditional' ? 'Re-irradiation may be feasible with careful planning' :
                 assessment.feasibility === 'unfavorable' ? 'Significant concerns present - detailed evaluation needed' :
                 'Multiple contraindications present'}
              </p>
            </div>
            <div className="text-5xl sm:text-6xl opacity-30 font-bold">
              {assessment.feasibility === 'favorable' ? '+' :
               assessment.feasibility === 'conditional' ? '~' :
               assessment.feasibility === 'unfavorable' ? '±' : '−'}
            </div>
          </div>
        </div>

        {/* Favorable Factors */}
        {assessment.favorable.length > 0 && (
          <div className="bg-green-50 p-5 rounded-xl border border-green-200">
            <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">
                <CheckIcon />
              </span>
              Favorable Factors
            </h4>
            <ul className="space-y-2">
              {assessment.favorable.map((factor, i) => (
                <li key={i} className="text-green-700 text-sm flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">+</span>
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Risk Factors */}
        {assessment.risks.length > 0 && (
          <div className="bg-amber-50 p-5 rounded-xl border border-amber-200">
            <h4 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">!</span>
              Key Risk Factors
            </h4>
            <ul className="space-y-2">
              {assessment.risks.map((risk, i) => (
                <li key={i} className="text-amber-700 text-sm flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">−</span>
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
          <h4 className="font-bold text-blue-800 mb-3">Recommendations</h4>
          <ul className="space-y-2">
            {assessment.recommendations.map((rec, i) => (
              <li key={i} className="text-blue-700 text-sm flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">→</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>

        {/* Decision Tree Visualization */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Salvage Decision Pathway</h3>
          <Mermaid chart={getMermaidChart()} />
        </div>

        {/* Summary Table */}
        <div className="bg-white p-5 rounded-xl border">
          <h4 className="font-bold text-gray-900 mb-4">Patient Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {evaluation.priorRadiation !== null && (
              <div>
                <span className="text-gray-500">Prior Radiation:</span>
                <span className="ml-2 font-medium">{evaluation.priorRadiation ? 'Yes' : 'No'}</span>
              </div>
            )}
            {evaluation.diseaseIntervalMonths !== undefined && (
              <div>
                <span className="text-gray-500">Disease-Free Interval:</span>
                <span className="ml-2 font-medium">{evaluation.diseaseIntervalMonths} months</span>
              </div>
            )}
            {evaluation.recurrenceType && (
              <div>
                <span className="text-gray-500">Disease Type:</span>
                <span className="ml-2 font-medium capitalize">{evaluation.recurrenceType.replace('-', ' ')}</span>
              </div>
            )}
            {evaluation.fieldStatus && (
              <div>
                <span className="text-gray-500">Field Status:</span>
                <span className="ml-2 font-medium capitalize">{evaluation.fieldStatus.replace('-', ' ')}</span>
              </div>
            )}
            {evaluation.histology && (
              <div>
                <span className="text-gray-500">Histology:</span>
                <span className="ml-2 font-medium uppercase">{evaluation.histology === 'melanoma-sarcoma' ? 'Melanoma/Sarcoma' : evaluation.histology}</span>
              </div>
            )}
            {evaluation.location && (
              <div>
                <span className="text-gray-500">Location:</span>
                <span className="ml-2 font-medium">{evaluation.location}</span>
              </div>
            )}
            {evaluation.plannedSurgery !== null && (
              <div>
                <span className="text-gray-500">Surgery Planned:</span>
                <span className="ml-2 font-medium">
                  {evaluation.plannedSurgery ? (evaluation.surgeryWithFlap ? 'Yes (with flap)' : 'Yes (no flap)') : 'No'}
                </span>
              </div>
            )}
            {evaluation.ecog !== null && (
              <div>
                <span className="text-gray-500">ECOG PS:</span>
                <span className="ml-2 font-medium">{evaluation.ecog}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={() => { setShowResults(false); setCurrentStep(1); setEvaluation(initialEvaluation); }}
            className="flex-1 py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
          >
            New Assessment
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 py-4 px-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors shadow-lg"
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
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
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
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
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
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors shadow-lg"
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => { setShowResults(true); setCurrentStep(5); }}
              className="px-8 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg"
            >
              Generate Assessment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
