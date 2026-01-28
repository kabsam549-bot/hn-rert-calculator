'use client';

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

export default function GuidelinesTab() {
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'base',
      themeVariables: {
        primaryColor: '#0d9488',
        primaryTextColor: '#fff',
        primaryBorderColor: '#0f766e',
        lineColor: '#6b7280',
        secondaryColor: '#fbbf24',
        tertiaryColor: '#f0fdfa',
      },
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
      },
    });

    if (mermaidRef.current) {
      mermaid.contentLoaded();
    }
  }, []);

  const decisionTreeCode = `
flowchart TD
    A[🏥 <b>Patient with Recurrent H&N Cancer</b><br/>Previously Irradiated] --> B{Re-irradiation<br/>Interval ≥ 2 years?}
    
    B -->|Yes| C{Prior Salvage<br/>Surgery?}
    B -->|No| D{Organ<br/>Dysfunction?}
    
    C -->|Yes| E[✅ <b>RPA Class I</b><br/>Favorable Prognosis<br/>2-yr OS: 61.9%<br/>Median: 28 months]
    C -->|No| F[⚠️ <b>RPA Class II</b><br/>Intermediate Prognosis<br/>2-yr OS: 40%<br/>Median: 16 months]
    
    D -->|Yes| G[❌ <b>RPA Class III</b><br/>Poor Prognosis<br/>2-yr OS: 16.8%<br/>Median: 9 months]
    D -->|No| F
    
    E --> H[Consider Full-Dose Re-RT<br/>with Modern Techniques]
    F --> I[Consider Dose De-escalation<br/>MDT Discussion Essential]
    G --> J[Consider Alternatives<br/>Palliative Care Consult]
    
    style E fill:#059669,stroke:#047857,color:#fff
    style F fill:#d97706,stroke:#b45309,color:#fff
    style G fill:#dc2626,stroke:#b91c1c,color:#fff
    style H fill:#d1fae5,stroke:#059669,color:#065f46
    style I fill:#fef3c7,stroke:#d97706,color:#78350f
    style J fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-teal-900 mb-2">
          Re-Irradiation Decision Framework
        </h2>
        <p className="text-sm text-teal-700">
          Based on the Multi-Institutional Re-Irradiation (MIRI) study by Phan et al. (2025).
          This RPA model stratifies patients into prognostic groups for head and neck re-irradiation.
        </p>
      </div>

      {/* Mermaid Decision Tree */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          MIRI RPA Decision Algorithm
        </h3>
        <div ref={mermaidRef} className="mermaid overflow-x-auto">
          {decisionTreeCode}
        </div>
      </div>

      {/* Key Prognostic Factors */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Key Prognostic Factors</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⏱️</span>
              <h4 className="font-semibold text-gray-800">Re-RT Interval</h4>
            </div>
            <p className="text-sm text-gray-600">
              <strong>Critical threshold: 2 years</strong><br/>
              Longer intervals allow tissue recovery and are associated with better outcomes.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🔪</span>
              <h4 className="font-semibold text-gray-800">Salvage Surgery</h4>
            </div>
            <p className="text-sm text-gray-600">
              Prior surgical resection of recurrence improves prognosis, moving patients from Class II to Class I.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🫁</span>
              <h4 className="font-semibold text-gray-800">Organ Dysfunction</h4>
            </div>
            <p className="text-sm text-gray-600">
              Feeding tube or tracheostomy dependence indicates poor baseline status and worse outcomes.
            </p>
          </div>
        </div>
      </div>

      {/* RPA Classes Summary Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm overflow-x-auto">
        <h3 className="text-lg font-bold text-gray-800 mb-4">RPA Classification Summary</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 font-semibold text-gray-700">Class</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Criteria</th>
              <th className="px-4 py-3 font-semibold text-gray-700">2-Year OS</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Median Survival</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Recommendation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                  Class I
                </span>
              </td>
              <td className="px-4 py-3 text-gray-700">Interval ≥2 years + Salvage surgery</td>
              <td className="px-4 py-3 font-semibold text-green-700">61.9%</td>
              <td className="px-4 py-3 text-gray-700">28 months</td>
              <td className="px-4 py-3 text-gray-600">Full-dose re-RT reasonable</td>
            </tr>
            <tr>
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  Class II
                </span>
              </td>
              <td className="px-4 py-3 text-gray-700">
                (Interval ≥2yr, no surgery) OR<br/>
                (Interval &lt;2yr, no dysfunction)
              </td>
              <td className="px-4 py-3 font-semibold text-amber-700">40.0%</td>
              <td className="px-4 py-3 text-gray-700">16 months</td>
              <td className="px-4 py-3 text-gray-600">Consider dose de-escalation</td>
            </tr>
            <tr>
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                  Class III
                </span>
              </td>
              <td className="px-4 py-3 text-gray-700">Interval &lt;2 years + Organ dysfunction</td>
              <td className="px-4 py-3 font-semibold text-red-700">16.8%</td>
              <td className="px-4 py-3 text-gray-700">9 months</td>
              <td className="px-4 py-3 text-gray-600">Consider alternatives to re-RT</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Technical Considerations */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Re-Irradiation Technical Considerations</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-teal-700 mb-2">Dose Regimens</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Full dose:</strong> 60-70 Gy @ 2 Gy/fx or equivalent</li>
              <li>• <strong>Hypofractionated:</strong> 40 Gy in 5 fx, 32 Gy in 4 fx</li>
              <li>• <strong>Palliative:</strong> 27 Gy in 3 fx, 20 Gy in 5 fx</li>
              <li>• Choice depends on RPA class & OAR constraints</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-teal-700 mb-2">Technique Requirements</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• IMRT or VMAT strongly recommended</li>
              <li>• Proton therapy if available for critical OARs</li>
              <li>• Image guidance (IGRT) essential</li>
              <li>• Prior plan fusion mandatory</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Reference */}
      <div className="border-t border-gray-200 pt-4">
        <p className="text-xs text-gray-500">
          <strong>Reference:</strong> Phan J, Spiotto MT, Goodman CD, et al. 
          Reirradiation for Locally Recurrent Head and Neck Cancer: State-of-the-Art and Future Directions. 
          <em> Semin Radiat Oncol.</em> 2025.
        </p>
      </div>
    </div>
  );
}
