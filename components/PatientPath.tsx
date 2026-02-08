'use client';

import Mermaid from './Mermaid';

export default function PatientPath() {
  const chart = `
graph TD
    Start[New Tumor Finding] --> PriorRT{Have you had<br/>Radiation here before?}
    PriorRT -- No --> Standard[Standard Care Path]
    PriorRT -- Yes --> PriorSurg{Have you had<br/>Surgery here before?}
    
    PriorSurg -- No/Yes --> PlanSurg{Is Surgery<br/>an option now?}
    
    PlanSurg -- Yes --> Flap{Will a 'Flap' or<br/>reconstruction be used?}
    Flap -- Yes --> SurgFlap[Surgery with<br/>Tissue Transfer]
    Flap -- No --> SurgNoFlap[Surgery alone]
    
    PlanSurg -- No --> OtherSalvage{Are there other<br/>treatment options?}
    OtherSalvage -- Yes --> Salvage[Re-Irradiation<br/>or Drug Therapy]
    OtherSalvage -- No --> Palliative[Supportive Care<br/>& Quality of Life]
    
    SurgFlap --> Eval[Health Check &<br/>Organ Evaluation]
    SurgNoFlap --> Eval
    Salvage --> Eval
    
    Eval --> Multi[Multidisciplinary Team<br/>Review & Discussion]
    
    style Start fill:#f9f9f9,stroke:#333,stroke-width:2px
    style Standard fill:#e1f5fe,stroke:#01579b
    style SurgFlap fill:#e8f5e9,stroke:#2e7d32
    style SurgNoFlap fill:#e8f5e9,stroke:#2e7d32
    style Salvage fill:#fff3e0,stroke:#ef6c00
    style Palliative fill:#f3e5f5,stroke:#7b1fa2
    style Multi fill:#ede7f6,stroke:#4527a0,stroke-width:2px
  `;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-6 text-white">
          <h2 className="text-2xl font-bold">Understanding Your Care Path</h2>
          <p className="text-teal-50 mt-2 opacity-90 text-sm md:text-base">
            A guide for patients and families navigating recurrent head and neck cancer treatment options.
          </p>
        </div>
        
        <div className="p-6 md:p-8">
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              The Decision Pathway
            </h3>
            <div className="bg-gray-50 rounded-xl p-2 md:p-6">
              <Mermaid chart={chart} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900">Key Considerations</h4>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</div>
                  <p className="text-sm text-gray-600 pt-0.5">
                    <strong>Prior Treatment:</strong> Understanding exactly what radiation and surgery you've had before is the first step in planning what's safe now.
                  </p>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</div>
                  <p className="text-sm text-gray-600 pt-0.5">
                    <strong>Tissue Transfer (Flaps):</strong> When surgery is an option, using healthy tissue from another part of the body can help healing, especially in areas that had prior radiation.
                  </p>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</div>
                  <p className="text-sm text-gray-600 pt-0.5">
                    <strong>Organ Function:</strong> We evaluate how treatment might affect important functions like swallowing, speaking, and breathing.
                  </p>
                </li>
              </ul>
            </div>

            <div className="bg-amber-50 rounded-xl p-5 border border-amber-100 self-start">
              <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Important Note
              </h4>
              <p className="text-sm text-amber-800 leading-relaxed">
                This pathway is a general guide. Every patient's situation is unique. Your doctors will discuss these options in a <strong>Multidisciplinary Team (MDT)</strong> meeting to create the best possible plan for you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
