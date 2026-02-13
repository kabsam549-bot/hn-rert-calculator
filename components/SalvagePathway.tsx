'use client';

import { useState } from 'react';
import Mermaid from './Mermaid';

interface SalvageEvaluation {
  // Step 1: Patient Overview
  priorRadiation: boolean | null;
  timeAgo: '<6mo' | '6-12mo' | '1-2yr' | '>2yr' | '';
  locations: string[];
  salvageSurgery: boolean | null;
  withFlap: boolean | null;

  // Step 2: Quick Assessment
  performanceStatus: 'good' | 'moderate' | 'poor' | '';
  feedingTube: boolean | null;
  tumorSize: 'small' | 'medium' | 'large' | 'unknown' | '';
  organDysfunction: string[];
}

const initialEvaluation: SalvageEvaluation = {
  priorRadiation: null,
  timeAgo: '',
  locations: [],
  salvageSurgery: null,
  withFlap: null,
  performanceStatus: '',
  feedingTube: null,
  tumorSize: '',
  organDysfunction: [],
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

  const calculateAssessment = () => {
    let score = 50; // Start at neutral
    const considerations: string[] = [];

    // Prior radiation is required
    if (evaluation.priorRadiation === false) {
      return {
        outcome: 'not-applicable',
        message: 'For patients without prior radiation history, standard treatment protocols apply. This re-irradiation assessment tool is not applicable.',
        color: 'gray',
        score: 0,
        considerations: [],
        recommendations: []
      };
    }

    // Time since prior radiation (critical factor)
    if (evaluation.timeAgo === '<6mo') {
      score -= 30;
      considerations.push('Very recent prior radiation (<6 months) significantly increases toxicity risk');
    } else if (evaluation.timeAgo === '6-12mo') {
      score -= 10;
      considerations.push('Time since prior radiation (6-12 months) may limit dose tolerance');
    } else if (evaluation.timeAgo === '1-2yr') {
      score += 10;
      considerations.push('Adequate time since prior radiation (1-2 years) allows for tissue recovery');
    } else if (evaluation.timeAgo === '>2yr') {
      score += 20;
      considerations.push('Longer interval since prior radiation (>2 years) is favorable for re-treatment');
    }

    // Salvage surgery with flap
    if (evaluation.salvageSurgery === true && evaluation.withFlap === true) {
      score += 15;
      considerations.push('Flap reconstruction improves wound healing and tissue coverage, reducing re-irradiation toxicity');
    } else if (evaluation.salvageSurgery === true && evaluation.withFlap === false) {
      score -= 5;
      considerations.push('Surgery without flap — consider flap reconstruction to improve tissue tolerance for re-irradiation');
    }

    // Performance status
    if (evaluation.performanceStatus === 'poor') {
      score -= 20;
      considerations.push('Poor performance status (ECOG 3+) associated with poor treatment tolerance');
    } else if (evaluation.performanceStatus === 'moderate') {
      score -= 5;
      considerations.push('Moderate performance status requires careful assessment');
    } else if (evaluation.performanceStatus === 'good') {
      score += 10;
      considerations.push('Good performance status (ECOG 0-1) is favorable');
    }

    // Feeding tube
    if (evaluation.feedingTube === true) {
      score -= 10;
      considerations.push('Pre-existing feeding tube indicates baseline swallowing dysfunction');
    }

    // Organ dysfunction (new)
    if (evaluation.organDysfunction.length >= 3) {
      score -= 15;
      considerations.push(`Multiple organ dysfunctions (${evaluation.organDysfunction.length}) substantially limit re-irradiation options`);
    } else if (evaluation.organDysfunction.length > 0) {
      score -= (evaluation.organDysfunction.length * 5);
      evaluation.organDysfunction.forEach(organ => {
        considerations.push(`Pre-existing ${organ} dysfunction limits re-irradiation options for nearby structures`);
      });
    }

    // Tumor size
    if (evaluation.tumorSize === 'large') {
      score -= 10;
      considerations.push('Large tumor volume (>50cc) may require higher doses with increased toxicity');
    } else if (evaluation.tumorSize === 'small') {
      score += 5;
      considerations.push('Smaller tumor volume (<25cc) is favorable for dose delivery');
    }

    // Determine outcome (3 tiers)
    let outcome: 'green' | 'yellow' | 'red';
    let message: string;
    let color: string;

    if (score >= 55) {
      outcome = 'green';
      message = 'Based on the clinical factors assessed, this patient appears to be a reasonable candidate for re-irradiation evaluation.';
      color = 'green';
    } else if (score >= 30) {
      outcome = 'yellow';
      message = 'Re-irradiation may be considered but significant risk factors are present. Detailed evaluation by a radiation oncologist is essential.';
      color = 'yellow';
    } else {
      outcome = 'red';
      message = 'Based on the clinical factors assessed, re-irradiation carries substantial risk and may not be appropriate. Alternative treatment strategies should be discussed.';
      color = 'red';
    }

    const recommendations = [
      'A comprehensive evaluation by a radiation oncologist is recommended to determine final treatment feasibility',
      'Radiation oncology will assess dosimetric feasibility and organ-at-risk constraints',
      'Multidisciplinary tumor board discussion recommended',
    ];

    if (evaluation.timeAgo === '<6mo') {
      recommendations.push('Consider delaying re-irradiation if clinically feasible to allow tissue recovery');
    }

    if (evaluation.salvageSurgery === true && evaluation.withFlap === true) {
      recommendations.push('Coordinate surgical and radiation oncology planning for timing and sequencing');
    }

    if (evaluation.performanceStatus === 'poor') {
      recommendations.push('Optimize performance status and nutritional support before treatment');
    }

    if (evaluation.organDysfunction.length >= 2) {
      recommendations.push('Pre-existing organ dysfunction may significantly impact treatment tolerance and should be thoroughly evaluated');
    }

    return { outcome, message, color, score, considerations, recommendations };
  };

  const getMermaidChart = () => {
    return `graph TD
    Start([Patient with H&N Recurrence]):::startNode
    Start --> PriorRT{Prior Radiation<br/>to Head & Neck?}
    
    PriorRT -->|No| NoReRT[Standard Radiation<br/>Protocols Apply]:::grayNode
    PriorRT -->|Yes| TimeAgo{Time Since<br/>Prior RT?}
    
    TimeAgo -->|"< 6 months"| ShortInterval[HIGH RISK<br/>Insufficient Recovery]:::redNode
    TimeAgo -->|"6-12 months"| MedInterval[MODERATE RISK<br/>Limited Recovery]:::yellowNode
    TimeAgo -->|"1-2 years"| GoodInterval[ACCEPTABLE<br/>Adequate Recovery]:::yellowNode
    TimeAgo -->|"> 2 years"| LongInterval[FAVORABLE<br/>Good Recovery]:::greenNode
    
    ShortInterval --> PS{Performance<br/>Status?}
    MedInterval --> PS
    GoodInterval --> PS
    LongInterval --> PS
    
    PS -->|"ECOG 0-1<br/>(Good)"| Surgery{Salvage<br/>Surgery?}
    PS -->|"ECOG 2<br/>(Moderate)"| SurgeryMod{Salvage<br/>Surgery?}
    PS -->|"ECOG 3+<br/>(Poor)"| PoorPS[HIGH RISK<br/>Poor Tolerance]:::redNode
    
    Surgery -->|"Yes + Flap"| LowTox[FAVORABLE<br/>Flap Improves Tolerance]:::greenNode
    Surgery -->|"Yes, No Flap"| ModTox[CONSIDER<br/>Flap May Improve Outcomes]:::yellowNode
    Surgery -->|No| NoSurg[CONSIDER<br/>Re-RT Primary]:::yellowNode
    
    SurgeryMod -->|"Yes + Flap"| ModToxMod[CAUTION<br/>Flap Helps but Other Risks]:::yellowNode
    SurgeryMod -->|"Yes, No Flap"| HighToxMod[CAUTION<br/>Consider Flap Reconstruction]:::yellowNode
    SurgeryMod -->|No| NoSurgMod[CAUTION<br/>Re-RT with Concerns]:::yellowNode
    
    HighTox --> Refer[Refer to Radiation Oncology<br/>for Detailed Evaluation]:::actionNode
    ModTox --> Refer
    NoSurg --> Refer
    HighToxMod --> Refer
    ModToxMod --> Refer
    NoSurgMod --> Refer
    PoorPS --> Refer
    
    classDef startNode fill:#3b82f6,stroke:#1e40af,stroke-width:3px,color:#fff
    classDef greenNode fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff
    classDef yellowNode fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000
    classDef redNode fill:#ef4444,stroke:#dc2626,stroke-width:2px,color:#fff
    classDef grayNode fill:#6b7280,stroke:#4b5563,stroke-width:2px,color:#fff
    classDef actionNode fill:#8b5cf6,stroke:#7c3aed,stroke-width:2px,color:#fff`;
  };

  const renderStepIndicator = () => (
    <div className="bg-white border-b">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quick Referral Assessment</span>
            <span className="text-xs text-gray-400">Step {currentStep} of 3</span>
          </div>
          <div className="relative h-1 bg-gray-200 rounded-full mb-4">
            <div 
              className="absolute h-1 bg-teal-500 rounded-full transition-all duration-300" 
              style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { num: 1, label: 'Overview' },
              { num: 2, label: 'Assessment' },
              { num: 3, label: 'Result' },
            ].map((step) => (
              <button
                key={step.num}
                onClick={() => step.num <= currentStep && setCurrentStep(step.num)}
                disabled={step.num > currentStep && !showResults}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all ${
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
                <span className={`text-sm font-bold ${
                  currentStep === step.num ? 'text-teal-700' : 'text-gray-500'
                }`}>{step.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="border-l-4 border-blue-600 pl-4">
        <h2 className="text-xl font-bold text-gray-900">Patient Overview</h2>
        <p className="text-gray-600 mt-1">Basic information about the patient&apos;s treatment history</p>
      </div>

      {/* Prior Radiation */}
      <div>
        <label className="block text-base font-semibold text-gray-800 mb-3">
          Prior radiation to head & neck?
        </label>
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: true, label: 'Yes', note: 'Patient received prior head & neck RT' },
            { value: false, label: 'No', note: 'No prior radiation therapy' },
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => updateEvaluation('priorRadiation', opt.value)}
              className={`p-5 rounded-xl border-2 text-left transition-all ${
                evaluation.priorRadiation === opt.value
                  ? 'border-teal-500 bg-teal-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="font-bold text-lg text-gray-900">{opt.label}</div>
              <div className="text-sm text-gray-500 mt-1">{opt.note}</div>
            </button>
          ))}
        </div>
      </div>

      {evaluation.priorRadiation === false && (
        <div className="mt-6 p-6 rounded-2xl bg-gray-100 border-2 border-gray-300">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Not Applicable</h3>
            <p className="text-gray-700 text-base mb-4">
              This calculator is designed for patients who have previously received radiation therapy to the 
              head and neck region. If the patient has not received prior radiation, this tool does not apply.
            </p>
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>Recommendation:</strong> For patients without prior radiation history, standard treatment 
                protocols apply. This re-irradiation assessment tool is not applicable.
              </p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={() => updateEvaluation('priorRadiation', null)}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      )}

      {evaluation.priorRadiation === true && (
        <>
          {/* Time Since Prior RT */}
          <div>
            <label className="block text-base font-semibold text-gray-800 mb-3">
              How long ago was the prior radiation?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { value: '<6mo', label: '<6 months', color: 'red' },
                { value: '6-12mo', label: '6-12 months', color: 'amber' },
                { value: '1-2yr', label: '1-2 years', color: 'yellow' },
                { value: '>2yr', label: '>2 years', color: 'green' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateEvaluation('timeAgo', opt.value)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    evaluation.timeAgo === opt.value
                      ? opt.color === 'red' ? 'border-red-500 bg-red-50 shadow-md' :
                        opt.color === 'amber' ? 'border-amber-500 bg-amber-50 shadow-md' :
                        opt.color === 'yellow' ? 'border-yellow-500 bg-yellow-50 shadow-md' :
                        'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-bold text-gray-900">{opt.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Location - Multiple Selection */}
          <div>
            <label className="block text-base font-semibold text-gray-800 mb-3">
              Recurrence location(s) <span className="text-sm text-gray-500 font-normal">(select all that apply)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                'Oropharynx', 'Larynx', 'Oral Cavity', 'Nasopharynx',
                'Skull Base', 'Neck', 'Paranasal Sinus', 'Other'
              ].map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    const newLocations = evaluation.locations.includes(loc)
                      ? evaluation.locations.filter(l => l !== loc)
                      : [...evaluation.locations, loc];
                    updateEvaluation('locations', newLocations);
                  }}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    evaluation.locations.includes(loc)
                      ? 'border-teal-500 bg-teal-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-900">{loc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Salvage Surgery */}
          <div>
            <label className="block text-base font-semibold text-gray-800 mb-3">
              Is salvage surgery planned?
            </label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: true, label: 'Yes', note: 'Surgery is part of treatment plan' },
                { value: false, label: 'No', note: 'No surgery planned' },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => updateEvaluation('salvageSurgery', opt.value)}
                  className={`p-5 rounded-xl border-2 text-left transition-all ${
                    evaluation.salvageSurgery === opt.value
                      ? 'border-teal-500 bg-teal-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-bold text-lg text-gray-900">{opt.label}</div>
                  <div className="text-sm text-gray-500 mt-1">{opt.note}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Flap Reconstruction */}
          {evaluation.salvageSurgery === true && (
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-3">
                Will surgery include flap reconstruction?
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: true, label: 'Yes, with flap', note: 'Flap reconstruction planned' },
                  { value: false, label: 'No flap', note: 'No flap reconstruction' },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => updateEvaluation('withFlap', opt.value)}
                    className={`p-5 rounded-xl border-2 text-left transition-all ${
                      evaluation.withFlap === opt.value
                        ? opt.value === true ? 'border-amber-500 bg-amber-50 shadow-md' : 'border-teal-500 bg-teal-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-bold text-lg text-gray-900">{opt.label}</div>
                    <div className="text-sm text-gray-500 mt-1">{opt.note}</div>
                  </button>
                ))}
              </div>
              {evaluation.withFlap === true && (
                <div className="mt-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> Flap reconstruction is favorable — improves wound healing and tissue tolerance for re-irradiation
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="border-l-4 border-purple-600 pl-4">
        <h2 className="text-xl font-bold text-gray-900">Quick Assessment</h2>
        <p className="text-gray-600 mt-1">Patient factors affecting treatment tolerance</p>
      </div>

      {/* Performance Status */}
      <div>
        <label className="block text-base font-semibold text-gray-800 mb-3">
          Performance status
        </label>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'good', label: 'Good', note: 'ECOG 0-1: Fully active or light work', color: 'green' },
            { value: 'moderate', label: 'Moderate', note: 'ECOG 2: Ambulatory, self-care', color: 'yellow' },
            { value: 'poor', label: 'Poor', note: 'ECOG 3+: Limited self-care', color: 'red' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateEvaluation('performanceStatus', opt.value)}
              className={`p-5 rounded-xl border-2 text-center transition-all ${
                evaluation.performanceStatus === opt.value
                  ? opt.color === 'green' ? 'border-green-500 bg-green-50 shadow-md' :
                    opt.color === 'yellow' ? 'border-yellow-500 bg-yellow-50 shadow-md' :
                    'border-red-500 bg-red-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="font-bold text-lg text-gray-900">{opt.label}</div>
              <div className="text-xs text-gray-600 mt-2">{opt.note}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Feeding Tube */}
      <div>
        <label className="block text-base font-semibold text-gray-800 mb-3">
          Current feeding tube?
        </label>
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: true, label: 'Yes', note: 'Patient has feeding tube' },
            { value: false, label: 'No', note: 'No feeding tube' },
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => updateEvaluation('feedingTube', opt.value)}
              className={`p-5 rounded-xl border-2 text-left transition-all ${
                evaluation.feedingTube === opt.value
                  ? 'border-teal-500 bg-teal-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="font-bold text-lg text-gray-900">{opt.label}</div>
              <div className="text-sm text-gray-500 mt-1">{opt.note}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Organ Dysfunction - Multiple Selection */}
      <div>
        <label className="block text-base font-semibold text-gray-800 mb-3">
          Any current organ dysfunction? <span className="text-sm text-gray-500 font-normal">(select all that apply)</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            'Swallowing/Dysphagia',
            'Speech',
            'Vision',
            'Hearing',
            'Airway/Breathing',
            'Spinal Cord',
            'Brain/Cognitive'
          ].map((organ) => (
            <button
              key={organ}
              onClick={() => {
                const newDysfunction = evaluation.organDysfunction.includes(organ)
                  ? evaluation.organDysfunction.filter(o => o !== organ)
                  : [...evaluation.organDysfunction, organ];
                updateEvaluation('organDysfunction', newDysfunction);
              }}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                evaluation.organDysfunction.includes(organ)
                  ? 'border-red-500 bg-red-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-sm font-medium text-gray-900">{organ}</div>
            </button>
          ))}
        </div>
        {evaluation.organDysfunction.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">No organ dysfunction selected</p>
        )}
      </div>

      {/* Tumor Size */}
      <div>
        <label className="block text-base font-semibold text-gray-800 mb-3">
          Tumor size estimate
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { value: 'small', label: 'Small', note: '<25cc', color: 'green' },
            { value: 'medium', label: 'Medium', note: '25-50cc', color: 'yellow' },
            { value: 'large', label: 'Large', note: '>50cc', color: 'red' },
            { value: 'unknown', label: 'Unknown', note: 'Not sure', color: 'gray' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateEvaluation('tumorSize', opt.value)}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                evaluation.tumorSize === opt.value
                  ? opt.color === 'green' ? 'border-green-500 bg-green-50 shadow-md' :
                    opt.color === 'yellow' ? 'border-yellow-500 bg-yellow-50 shadow-md' :
                    opt.color === 'red' ? 'border-red-500 bg-red-50 shadow-md' :
                    'border-gray-500 bg-gray-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="font-bold text-gray-900">{opt.label}</div>
              <div className="text-xs text-gray-600 mt-1">{opt.note}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderResults = () => {
    const assessment = calculateAssessment();
    
    // Handle not-applicable case
    if (assessment.outcome === 'not-applicable') {
      return (
        <div className="space-y-6">
          <div className="p-8 rounded-2xl bg-gray-100 border-2 border-gray-300">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Not Applicable</h2>
              <p className="text-gray-700 text-lg">{assessment.message}</p>
            </div>
          </div>

          <button
            onClick={() => { setShowResults(false); setCurrentStep(1); setEvaluation(initialEvaluation); }}
            className="w-full py-4 px-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors"
          >
            Start New Assessment
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Decision Tree - Now shown BEFORE results */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Decision Pathway</h3>
          <Mermaid chart={getMermaidChart()} />
        </div>

        {/* Main Result Card */}
        <div className={`p-8 rounded-2xl shadow-xl ${
          assessment.color === 'green' ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' :
          assessment.color === 'yellow' ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-gray-900' :
          'bg-gradient-to-br from-red-500 to-rose-600 text-white'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-sm font-semibold opacity-90 mb-2 uppercase tracking-wide">
                Assessment Result
              </div>
              <div className="text-3xl sm:text-4xl font-bold mb-4">
                {assessment.color === 'green' ? 'RECOMMENDED FOR EVALUATION' :
                 assessment.color === 'yellow' ? 'PROCEED WITH CAUTION' :
                 'NOT RECOMMENDED'}
              </div>
              <p className="text-base sm:text-lg leading-relaxed opacity-95">
                {assessment.message}
              </p>
              <p className="text-sm mt-4 opacity-90 font-medium">
                A comprehensive evaluation by a radiation oncologist is recommended to determine final treatment feasibility.
              </p>
            </div>
          </div>
        </div>

        {/* Considerations */}
        {assessment.considerations.length > 0 && (
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <h4 className="font-bold text-blue-900 mb-4">Clinical Considerations</h4>
            <ul className="space-y-2">
              {assessment.considerations.map((consideration, i) => (
                <li key={i} className="text-blue-800 text-sm flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  {consideration}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
          <h4 className="font-bold text-purple-900 mb-4">Recommendations</h4>
          <ul className="space-y-2">
            {assessment.recommendations.map((rec, i) => (
              <li key={i} className="text-purple-800 text-sm flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">→</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>

        {/* Patient Summary */}
        <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
          <h4 className="font-bold text-gray-900 mb-4">Patient Summary</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500 font-medium">Prior Radiation:</span>
              <span className="ml-2 text-gray-900">{evaluation.priorRadiation ? 'Yes' : 'No'}</span>
            </div>
            {evaluation.timeAgo && (
              <div>
                <span className="text-gray-500 font-medium">Time Since RT:</span>
                <span className="ml-2 text-gray-900">{
                  evaluation.timeAgo === '<6mo' ? '<6 months' :
                  evaluation.timeAgo === '6-12mo' ? '6-12 months' :
                  evaluation.timeAgo === '1-2yr' ? '1-2 years' : '>2 years'
                }</span>
              </div>
            )}
            {evaluation.locations.length > 0 && (
              <div>
                <span className="text-gray-500 font-medium">Location(s):</span>
                <span className="ml-2 text-gray-900">{evaluation.locations.join(', ')}</span>
              </div>
            )}
            {evaluation.salvageSurgery !== null && (
              <div>
                <span className="text-gray-500 font-medium">Surgery Planned:</span>
                <span className="ml-2 text-gray-900">
                  {evaluation.salvageSurgery ? (evaluation.withFlap ? 'Yes (with flap)' : 'Yes (no flap)') : 'No'}
                </span>
              </div>
            )}
            {evaluation.performanceStatus && (
              <div>
                <span className="text-gray-500 font-medium">Performance Status:</span>
                <span className="ml-2 text-gray-900 capitalize">{evaluation.performanceStatus}</span>
              </div>
            )}
            {evaluation.feedingTube !== null && (
              <div>
                <span className="text-gray-500 font-medium">Feeding Tube:</span>
                <span className="ml-2 text-gray-900">{evaluation.feedingTube ? 'Yes' : 'No'}</span>
              </div>
            )}
            {evaluation.organDysfunction.length > 0 && (
              <div className="sm:col-span-2">
                <span className="text-gray-500 font-medium">Organ Dysfunction:</span>
                <span className="ml-2 text-gray-900">{evaluation.organDysfunction.join(', ')}</span>
              </div>
            )}
            {evaluation.tumorSize && (
              <div>
                <span className="text-gray-500 font-medium">Tumor Size:</span>
                <span className="ml-2 text-gray-900 capitalize">{evaluation.tumorSize}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => { setShowResults(false); setCurrentStep(1); setEvaluation(initialEvaluation); }}
            className="flex-1 py-4 px-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors"
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
            Step {currentStep} of 2
          </div>
          
          {currentStep < 2 ? (
            <button
              onClick={() => evaluation.priorRadiation === true && setCurrentStep(2)}
              disabled={evaluation.priorRadiation !== true}
              className={`px-6 py-3 font-semibold rounded-xl transition-colors shadow-lg ${
                evaluation.priorRadiation === true
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => { setShowResults(true); setCurrentStep(3); }}
              className="px-8 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg"
            >
              Get Assessment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
