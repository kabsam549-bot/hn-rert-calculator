'use client';

import Mermaid from './Mermaid';

export default function PublicPathway() {
  const chart = `
graph TD
    A[<b>Prior Radiation Treatment</b><br/>History of radiation to head/neck] --> B[<b>Prior Surgery</b><br/>Has the area been operated on before?]
    
    B --> C{<b>Planned Surgery?</b><br/>Is salvage surgery feasible?}
    
    C -- Yes --> D{<b>Flap Required?</b><br/>Does the site need tissue reconstruction?}
    C -- No --> E[<b>Other Salvage Options</b><br/>Evaluating non-surgical pathways]
    
    D -- Flap --> F[<b>Post-Operative Evaluation</b><br/>Clinical factors and organ function]
    D -- No Flap --> F
    
    E --> G[<b>Re-Irradiation Assessment</b><br/>Considering radiation as primary salvage]
    G --> F
    
    F --> H[<b>Multidisciplinary Review</b><br/>Expert consensus on best next steps]

    style A fill:#f9fafb,stroke:#374151,stroke-width:2px
    style B fill:#f9fafb,stroke:#374151,stroke-width:2px
    style C fill:#eff6ff,stroke:#2563eb,stroke-width:2px
    style D fill:#eff6ff,stroke:#2563eb,stroke-width:2px
    style E fill:#fef2f2,stroke:#dc2626,stroke-width:2px
    style F fill:#f0fdf4,stroke:#16a34a,stroke-width:2px
    style G fill:#fff7ed,stroke:#ea580c,stroke-width:2px
    style H fill:#faf5ff,stroke:#9333ea,stroke-width:4px
  `;

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-6 lg:p-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 border border-gray-100">
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Understanding Your Care Pathway</h2>
          <p className="text-lg text-gray-600 leading-relaxed italic">
            This guide helps patients and families understand the decision-making process for recurrent head and neck cancers. 
            Every case is unique and requires expert medical evaluation.
          </p>
        </div>

        <div className="mb-12">
          <Mermaid chart={chart} />
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-12 pt-12 border-t border-gray-100">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm">1</span>
              Prior Treatment Review
            </h3>
            <p className="text-gray-600 leading-relaxed">
              We look at your complete history of radiation and surgery. 
              The interval of time since your last treatment is a critical factor in determining if re-irradiation is safe.
            </p>
            
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm">2</span>
              Salvage Surgery
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Surgery is often the first consideration for recurrent disease. 
              If a flap (tissue transfer) is required, it changes how we plan for potential follow-up radiation.
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm">3</span>
              Organ Evaluation
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Clinical factors like your nutrition, breathing, and swallowing are carefully evaluated. 
              We prioritize preserving your quality of life and organ function throughout treatment.
            </p>

            <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
              <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Patient Tip
              </h4>
              <p className="text-sm text-amber-700 italic">
                Ask your medical team: "How does my prior treatment history affect the current plan?" 
                Understanding the trade-offs between surgery and radiation is key to shared decision-making.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
