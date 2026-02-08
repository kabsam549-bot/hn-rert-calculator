'use client';

import Mermaid from './Mermaid';

export default function PatientPathway() {
  const chart = `
graph TD
    Start[Diagnosis of Recurrent Head & Neck Cancer] --> PriorRT[Prior Radiation Treatment]
    PriorRT --> PriorSurg[Prior Surgery]
    
    PriorSurg --> PlanSurg{Is Surgery Planned?}
    
    PlanSurg -- Yes --> Flap{Reconstruction: Flap or No Flap?}
    Flap -- Flap --> Eval[Clinical Factors & Organ Evaluation]
    Flap -- No Flap --> Eval
    
    PlanSurg -- No --> Salvage{Other Treatment Options}
    Salvage -- Re-irradiation --> Eval
    Salvage -- Systemic Therapy (Chemo/Immuno) --> Eval
    Salvage -- Palliative Care --> Eval
    
    Eval --> Decision[Multidisciplinary Team Decision]

    style Start fill:#f9f,stroke:#333,stroke-width:2px
    style Decision fill:#00b5ad,stroke:#fff,stroke-width:2px,color:#fff
    style PlanSurg fill:#fff4dd,stroke:#d4a017,stroke-width:2px
    style Flap fill:#fff4dd,stroke:#d4a017,stroke-width:2px
    style Salvage fill:#fff4dd,stroke:#d4a017,stroke-width:2px
  `;

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-6 lg:p-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
        <div className="border-l-4 border-teal-600 pl-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Patient Treatment Journey</h2>
          <p className="text-gray-600 mt-1">
            Understanding the typical decision-making process for managing cancer recurrence after prior radiation.
          </p>
        </div>

        <div className="mb-10 overflow-hidden rounded-xl border border-gray-50">
          <Mermaid chart={chart} />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-50 rounded-xl p-5">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H9m0 0V2h2v3M9 5h2m7 12H7" />
              </svg>
              Key Terms Explained
            </h3>
            <ul className="space-y-4">
              <li>
                <span className="font-bold text-teal-700 block text-sm uppercase">Recurrence</span>
                <span className="text-sm text-gray-600">When cancer returns in the same area after initial treatment.</span>
              </li>
              <li>
                <span className="font-bold text-teal-700 block text-sm uppercase">Flap Reconstruction</span>
                <span className="text-sm text-gray-600">Moving healthy tissue from another part of the body to repair the surgical site.</span>
              </li>
              <li>
                <span className="font-bold text-teal-700 block text-sm uppercase">Systemic Therapy</span>
                <span className="text-sm text-gray-600">Treatments like chemotherapy or immunotherapy that travel through the whole body.</span>
              </li>
              <li>
                <span className="font-bold text-teal-700 block text-sm uppercase">Palliative Care</span>
                <span className="text-sm text-gray-600">Specialized medical care focused on providing relief from symptoms and stress.</span>
              </li>
            </ul>
          </div>

          <div className="bg-teal-50 rounded-xl p-5 border border-teal-100">
            <h3 className="font-bold text-teal-800 mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Why Organ Evaluation Matters
            </h3>
            <p className="text-sm text-teal-900 leading-relaxed mb-4">
              Before proceeding with further aggressive treatment, doctors must evaluate how well your organs (like your heart, lungs, and swallowing muscles) are functioning.
            </p>
            <ul className="space-y-2 text-sm text-teal-800 italic">
              <li>• Can the body handle a second course of radiation?</li>
              <li>• Is there enough healthy tissue for healing?</li>
              <li>• What will swallowing and speech look like after treatment?</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
