'use client';

import { useState } from 'react';

type Section = 'overview' | 'constraints' | 'outcomes' | 'cbs' | 'references';

export default function GuidelinesTab() {
  const [activeSection, setActiveSection] = useState<Section>('overview');

  const sections: { id: Section; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'constraints', label: 'OAR Constraints' },
    { id: 'outcomes', label: 'Outcomes by Site' },
    { id: 'cbs', label: 'CBS/BE Risk' },
    { id: 'references', label: 'References' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === section.id
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">MDACC 4-Step Evaluation Framework</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { step: 1, title: 'Estimate TCP', desc: 'Histology, surgical status, site, volume', color: 'teal' },
                { step: 2, title: 'Assess NTCP', desc: 'RI, prior dose, carotid, critical OARs', color: 'amber' },
                { step: 3, title: 'Technical Feasibility', desc: 'Modality selection, dose gradient, constraints', color: 'blue' },
                { step: 4, title: 'Clinical Judgment', desc: 'Goals, PS, alternatives, patient expectations', color: 'purple' },
              ].map((s) => (
                <div key={s.step} className={`p-4 rounded-lg border-l-4 ${
                  s.color === 'teal' ? 'border-teal-500 bg-teal-50' :
                  s.color === 'amber' ? 'border-amber-500 bg-amber-50' :
                  s.color === 'blue' ? 'border-blue-500 bg-blue-50' :
                  'border-purple-500 bg-purple-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      s.color === 'teal' ? 'bg-teal-600' :
                      s.color === 'amber' ? 'bg-amber-600' :
                      s.color === 'blue' ? 'bg-blue-600' : 'bg-purple-600'
                    }`}>{s.step}</span>
                    <div>
                      <div className="font-semibold text-gray-900">{s.title}</div>
                      <div className="text-sm text-gray-600">{s.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Key Volume Thresholds</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-3 text-left font-semibold">Volume</th>
                    <th className="p-3 text-left font-semibold">Modality</th>
                    <th className="p-3 text-left font-semibold">Outcome</th>
                    <th className="p-3 text-left font-semibold">Toxicity</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr><td className="p-3 font-medium">GTV &lt;15 cc</td><td className="p-3">IMRT</td><td className="p-3 text-green-600">Improved LC</td><td className="p-3">Less acute/late</td></tr>
                  <tr><td className="p-3 font-medium">GTV &lt;25 cc</td><td className="p-3">SBRT</td><td className="p-3 text-green-600">Improved LC & OS</td><td className="p-3">Less severe</td></tr>
                  <tr><td className="p-3 font-medium">CTV &lt;50 cc</td><td className="p-3">IMRT/PBT</td><td className="p-3">NS</td><td className="p-3 text-green-600">G3+ &lt;21%</td></tr>
                  <tr className="bg-red-50"><td className="p-3 font-medium">CTV &gt;50 cc</td><td className="p-3">Any</td><td className="p-3 text-red-600">Reduced</td><td className="p-3 text-red-600">G3+ &gt;57%</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Reirradiation Interval (RI)</h2>
            <div className="grid grid-cols-4 gap-3">
              {[
                { range: '<6 months', status: 'Not recommended', color: 'red', note: 'Insufficient tissue recovery' },
                { range: '6-12 months', status: 'Caution', color: 'amber', note: 'Minimum based on cord recovery' },
                { range: '12-24 months', status: 'Acceptable', color: 'yellow', note: 'Normal tissue healing' },
                { range: '≥24 months', status: 'Favorable', color: 'green', note: 'MIRI Class I eligible' },
              ].map((r) => (
                <div key={r.range} className={`p-4 rounded-lg text-center ${
                  r.color === 'red' ? 'bg-red-50 border border-red-200' :
                  r.color === 'amber' ? 'bg-amber-50 border border-amber-200' :
                  r.color === 'yellow' ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-green-50 border border-green-200'
                }`}>
                  <div className="font-bold text-gray-900">{r.range}</div>
                  <div className={`text-sm font-medium ${
                    r.color === 'red' ? 'text-red-600' :
                    r.color === 'amber' ? 'text-amber-600' :
                    r.color === 'yellow' ? 'text-yellow-600' : 'text-green-600'
                  }`}>{r.status}</div>
                  <div className="text-xs text-gray-500 mt-1">{r.note}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">SBRT Dose Selection</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-3 text-left font-semibold">Regimen</th>
                    <th className="p-3 text-left font-semibold">EQD2 (Gy)</th>
                    <th className="p-3 text-left font-semibold">Expected LC</th>
                    <th className="p-3 text-left font-semibold">Clinical Context</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr><td className="p-3 font-medium">45 Gy / 5 fx</td><td className="p-3">71-80</td><td className="p-3 text-green-600">~90%</td><td className="p-3">Non-mucosal, high-grade (higher toxicity)</td></tr>
                  <tr><td className="p-3 font-medium">42.5 Gy / 5 fx</td><td className="p-3">65-73</td><td className="p-3 text-green-600">~85%</td><td className="p-3">Standard curative intent</td></tr>
                  <tr><td className="p-3 font-medium">40 Gy / 5 fx</td><td className="p-3">60-67</td><td className="p-3">75-85%</td><td className="p-3">Large nodal, moderate-dose re-RT</td></tr>
                  <tr><td className="p-3 font-medium">36 Gy / 4 fx</td><td className="p-3">57-64</td><td className="p-3">70-80%</td><td className="p-3">Small tumors, non-SCC</td></tr>
                  <tr><td className="p-3 font-medium">27 Gy / 3 fx</td><td className="p-3">43-48</td><td className="p-3 text-amber-600">65-73%</td><td className="p-3">High-risk mucosal, palliative</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-3">Dose rate ≥8 Gy per fraction in 5 fx associated with improved LC. QOD fractionation reduces CBS/BE risk.</p>
          </div>
        </div>
      )}

      {/* OAR Constraints */}
      {activeSection === 'constraints' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">MDACC RSS Tiered Constraint System</h2>
            <p className="text-gray-600 mb-6">SBRT dose constraints for head and neck reirradiation</p>

            {/* Tier 1 */}
            <div className="mb-6">
              <h3 className="font-bold text-red-700 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">1</span>
                Tier 1: Critical Structures (Go/No-Go Decision)
              </h3>
              <div className="bg-red-50 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-red-100">
                      <th className="p-3 text-left font-semibold">Structure</th>
                      <th className="p-3 text-left font-semibold">Constraint</th>
                      <th className="p-3 text-left font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-100">
                    <tr><td className="p-3 font-medium">Brainstem</td><td className="p-3">Dmax &lt;13 Gy</td><td className="p-3">2mm PRV expansion</td></tr>
                    <tr><td className="p-3 font-medium">Medulla/Spinal Cord</td><td className="p-3">Dmax &lt;12 Gy</td><td className="p-3">1mm PRV expansion</td></tr>
                    <tr><td className="p-3 font-medium">Optic Chiasm/Apparatus</td><td className="p-3">Dmax &lt;12 Gy</td><td className="p-3">Optic pathway: 5 fx = 22 Gy, 3 fx = 17 Gy</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tier 2 */}
            <div className="mb-6">
              <h3 className="font-bold text-amber-700 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs">2</span>
                Tier 2: Critical Structures with Less Established Constraints
              </h3>
              <div className="bg-amber-50 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-amber-100">
                      <th className="p-3 text-left font-semibold">Structure</th>
                      <th className="p-3 text-left font-semibold">Constraint</th>
                      <th className="p-3 text-left font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100">
                    <tr><td className="p-3 font-medium">Carotid + Lingual Arteries</td><td className="p-3">Dmax &lt;30 Gy; V27 &lt;0.5cc</td><td className="p-3">If within 1cm of target; 2mm PRV</td></tr>
                    <tr><td className="p-3 font-medium">Cochlea</td><td className="p-3">Dmax &lt;18 Gy</td><td className="p-3"></td></tr>
                    <tr><td className="p-3 font-medium">Larynx</td><td className="p-3">Dmax &lt;13 Gy (non-laryngeal target)</td><td className="p-3">Dmean &lt;10 Gy if laryngeal target</td></tr>
                    <tr><td className="p-3 font-medium">Mandible + Hyoid</td><td className="p-3">V25 &lt;1cc</td><td className="p-3">Contour 1cm from target; avoid hotspots</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tier 3 */}
            <div>
              <h3 className="font-bold text-blue-700 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">3</span>
                Tier 3: Quality of Life Structures
              </h3>
              <div className="bg-blue-50 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="p-3 text-left font-semibold">Structure</th>
                      <th className="p-3 text-left font-semibold">Constraint</th>
                      <th className="p-3 text-left font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-100">
                    <tr><td className="p-3 font-medium">Pharyngeal Constrictors</td><td className="p-3">Dmean &lt;10 Gy</td><td className="p-3">If within 1cm of target</td></tr>
                    <tr><td className="p-3 font-medium">Temporal Lobe</td><td className="p-3">Dmax &lt;27 Gy; V20 &lt;0.5cc</td><td className="p-3">Contour 3mm from target</td></tr>
                    <tr><td className="p-3 font-medium">Cranial Nerve Avoidance</td><td className="p-3">Dmax &lt;24 Gy</td><td className="p-3">Avoid hotspots if overlapping</td></tr>
                    <tr><td className="p-3 font-medium">Mucosal Avoidance</td><td className="p-3">Dmax &lt;15 Gy</td><td className="p-3">NPX, OPX, oral cavity; 1cm from target</td></tr>
                    <tr><td className="p-3 font-medium">Parotid Gland</td><td className="p-3">Dmax &lt;23 Gy; V15 &lt;1cc</td><td className="p-3"></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Outcomes by Site */}
      {activeSection === 'outcomes' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">2-Year Outcomes by Subsite</h2>
            <p className="text-gray-600 mb-6">MDACC Series - Clinical Outcomes After Reirradiation (Phan et al, Seminars in RO 2025)</p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-3 text-left font-semibold">Site</th>
                    <th className="p-3 text-center font-semibold">N</th>
                    <th className="p-3 text-center font-semibold">LC</th>
                    <th className="p-3 text-center font-semibold">RR</th>
                    <th className="p-3 text-center font-semibold">DM</th>
                    <th className="p-3 text-center font-semibold">OS</th>
                    <th className="p-3 text-center font-semibold">PFS</th>
                    <th className="p-3 text-center font-semibold">G3+ Tox</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr className="bg-amber-50">
                    <td className="p-3 font-medium" colSpan={8}>Mucosal (N=185)</td>
                  </tr>
                  <tr>
                    <td className="p-3 pl-6">Oropharynx</td>
                    <td className="p-3 text-center">-</td>
                    <td className="p-3 text-center">77%</td>
                    <td className="p-3 text-center">13%</td>
                    <td className="p-3 text-center">12%</td>
                    <td className="p-3 text-center text-amber-600 font-medium">51%*</td>
                    <td className="p-3 text-center text-amber-600">38%*</td>
                    <td className="p-3 text-center text-red-600 font-medium">43%</td>
                  </tr>
                  <tr>
                    <td className="p-3 pl-6">Nasopharynx</td>
                    <td className="p-3 text-center">-</td>
                    <td className="p-3 text-center">76%</td>
                    <td className="p-3 text-center">29%</td>
                    <td className="p-3 text-center">12%</td>
                    <td className="p-3 text-center">71%</td>
                    <td className="p-3 text-center">63%</td>
                    <td className="p-3 text-center text-red-600 font-medium">43%</td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="p-3 font-medium" colSpan={8}>Neck (N=109)</td>
                  </tr>
                  <tr>
                    <td className="p-3 pl-6">≤3cm</td>
                    <td className="p-3 text-center">-</td>
                    <td className="p-3 text-center text-green-600 font-medium">89%</td>
                    <td className="p-3 text-center">18%</td>
                    <td className="p-3 text-center">18%</td>
                    <td className="p-3 text-center text-green-600">79%</td>
                    <td className="p-3 text-center">57%</td>
                    <td className="p-3 text-center text-green-600">15%</td>
                  </tr>
                  <tr className="bg-red-50">
                    <td className="p-3 pl-6">&gt;3cm</td>
                    <td className="p-3 text-center">-</td>
                    <td className="p-3 text-center">68%</td>
                    <td className="p-3 text-center text-red-600 font-medium">54%**</td>
                    <td className="p-3 text-center text-red-600 font-medium">79%**</td>
                    <td className="p-3 text-center text-red-600 font-medium">36%**</td>
                    <td className="p-3 text-center text-red-600">19%**</td>
                    <td className="p-3 text-center">20%</td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="p-3 font-medium" colSpan={8}>Skull Base (N=132)</td>
                  </tr>
                  <tr>
                    <td className="p-3 pl-6">Skull Base</td>
                    <td className="p-3 text-center">-</td>
                    <td className="p-3 text-center text-green-600 font-medium">86%</td>
                    <td className="p-3 text-center text-green-600">8%</td>
                    <td className="p-3 text-center">26%</td>
                    <td className="p-3 text-center text-green-600 font-medium">83%</td>
                    <td className="p-3 text-center text-green-600">67%</td>
                    <td className="p-3 text-center text-green-600 font-medium">11%</td>
                  </tr>
                  <tr>
                    <td className="p-3 pl-6">Paranasal Sinus</td>
                    <td className="p-3 text-center">-</td>
                    <td className="p-3 text-center">73%</td>
                    <td className="p-3 text-center">15%</td>
                    <td className="p-3 text-center">17%</td>
                    <td className="p-3 text-center">72%</td>
                    <td className="p-3 text-center">47%</td>
                    <td className="p-3 text-center text-green-600">11%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-xs text-gray-500 space-y-1">
              <p>* OP/OC associated with poorer survival vs Skull Base/Neck (HR 1.69-2.92; p&lt;0.01)</p>
              <p>** Neck &gt;3cm: poor survival and high OOF recurrence</p>
              <p>OOF recurrence rate was ~25% across all subsites</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Late G3+ Toxicity by Modality (Tumors &lt;60cc)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-3 text-left font-semibold">Toxicity</th>
                    <th className="p-3 text-center font-semibold" colSpan={4}>Mucosal</th>
                    <th className="p-3 text-center font-semibold" colSpan={4}>Skull Base</th>
                  </tr>
                  <tr className="bg-gray-100 text-xs">
                    <th className="p-2"></th>
                    <th className="p-2 text-center">All</th>
                    <th className="p-2 text-center">SBRT</th>
                    <th className="p-2 text-center">IMRT</th>
                    <th className="p-2 text-center">PBT</th>
                    <th className="p-2 text-center">All</th>
                    <th className="p-2 text-center">SBRT</th>
                    <th className="p-2 text-center">IMRT</th>
                    <th className="p-2 text-center">PBT</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="p-3 font-medium">Late G3+</td>
                    <td className="p-3 text-center text-red-600 font-bold">43%</td>
                    <td className="p-3 text-center">21%</td>
                    <td className="p-3 text-center text-red-600">44%</td>
                    <td className="p-3 text-center">23%</td>
                    <td className="p-3 text-center text-green-600 font-bold">11%</td>
                    <td className="p-3 text-center text-green-600">3%</td>
                    <td className="p-3 text-center">13%</td>
                    <td className="p-3 text-center">20%</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">ORN</td>
                    <td className="p-3 text-center">16%</td>
                    <td className="p-3 text-center">7%</td>
                    <td className="p-3 text-center">19%</td>
                    <td className="p-3 text-center">7%</td>
                    <td className="p-3 text-center">8%</td>
                    <td className="p-3 text-center">7%</td>
                    <td className="p-3 text-center">10%</td>
                    <td className="p-3 text-center">7%</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Severe Fibrosis</td>
                    <td className="p-3 text-center">19%</td>
                    <td className="p-3 text-center">13%</td>
                    <td className="p-3 text-center">22%</td>
                    <td className="p-3 text-center">21%</td>
                    <td className="p-3 text-center">5%</td>
                    <td className="p-3 text-center text-green-600">3%</td>
                    <td className="p-3 text-center">7%</td>
                    <td className="p-3 text-center">20%</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Hemorrhage</td>
                    <td className="p-3 text-center">2.2%</td>
                    <td className="p-3 text-center text-red-600">5.5%</td>
                    <td className="p-3 text-center">&lt;2%</td>
                    <td className="p-3 text-center">&lt;2%</td>
                    <td className="p-3 text-center text-green-600">0%</td>
                    <td className="p-3 text-center text-green-600">0%</td>
                    <td className="p-3 text-center text-green-600">0%</td>
                    <td className="p-3 text-center text-green-600">0%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-3">Note: Mucosal sites have 5x higher G3+ toxicity than skull base (43% vs 11%, p=0.001). SBRT mucosal hemorrhage risk 5.5% vs 0% skull base.</p>
          </div>
        </div>
      )}

      {/* CBS/BE Risk */}
      {activeSection === 'cbs' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Carotid Blowout Syndrome (CBS) / Bleeding Event (BE)</h2>
            <p className="text-gray-600 mb-6">Risk assessment and mitigation strategies</p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h3 className="font-bold text-red-800 mb-3">Overall Risk</h3>
                <ul className="space-y-2 text-sm text-red-700">
                  <li><span className="font-semibold">1.5%</span> overall CBS/BE rate</li>
                  <li><span className="font-semibold">3%</span> in mucosal sites</li>
                  <li><span className="font-semibold">0%</span> in skull base (MDACC series)</li>
                </ul>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h3 className="font-bold text-amber-800 mb-3">Traditional Predictors</h3>
                <ul className="space-y-1 text-sm text-amber-700">
                  <li>• Mucosal/skin ulceration</li>
                  <li>• Large tumor volume</li>
                  <li>• Vessel invasion &gt;180°</li>
                  <li>• Prior surgery without flap</li>
                  <li>• Cumulative dose &gt;120 Gy</li>
                  <li>• Short reirradiation interval</li>
                </ul>
              </div>
            </div>

            <h3 className="font-bold text-gray-900 mb-3">CBS/BE Rate by Modality</h3>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-3 text-left font-semibold">Modality</th>
                    <th className="p-3 text-center font-semibold">All</th>
                    <th className="p-3 text-center font-semibold">No Tumor</th>
                    <th className="p-3 text-center font-semibold">Mucosal</th>
                    <th className="p-3 text-center font-semibold">Range</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr><td className="p-3 font-medium">IMRT (4 studies)</td><td className="p-3 text-center">2.3%</td><td className="p-3 text-center">1.3%</td><td className="p-3 text-center">2.8%</td><td className="p-3 text-center">0-7%</td></tr>
                  <tr><td className="p-3 font-medium">PBT (4 studies)</td><td className="p-3 text-center">2.5%</td><td className="p-3 text-center">1.6%</td><td className="p-3 text-center">3.6%</td><td className="p-3 text-center">2-11%</td></tr>
                  <tr><td className="p-3 font-medium">SBRT LINAC (3 studies)</td><td className="p-3 text-center">3.4%</td><td className="p-3 text-center">1.7%</td><td className="p-3 text-center">2.9%</td><td className="p-3 text-center">0-3%</td></tr>
                  <tr className="bg-red-50"><td className="p-3 font-medium">SBRT CK (5 studies)</td><td className="p-3 text-center text-red-600 font-bold">8.5%</td><td className="p-3 text-center">-</td><td className="p-3 text-center">-</td><td className="p-3 text-center text-red-600">2-16%</td></tr>
                </tbody>
              </table>
            </div>

            <h3 className="font-bold text-gray-900 mb-3">MDACC CBS/BE Risk Reduction Strategies</h3>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
              <ul className="grid md:grid-cols-2 gap-2 text-sm text-green-700">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> QOD fractionation (every other day)</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Reirradiation interval &gt;6 months</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Minimize carotid volume receiving 20-30 Gy</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Dmax &lt;30 Gy to carotid</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> D0.5cc &lt;20 Gy (HYTEC)</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Consider carotid stent/endarterectomy</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">HYTEC Data (Grimm J et al, IJROBP 2020)</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li><span className="font-semibold">Without</span> risk reduction: 10% CBS risk when 0.5cc receives &gt;20 Gy</li>
                <li><span className="font-semibold">With</span> risk reduction: 2.2% CBS risk even when 1cc receives &gt;20 Gy</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Toxicity by Subsite: Vessels at Risk</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-3 text-left font-semibold">Subsite</th>
                    <th className="p-3 text-left font-semibold">Expected Complications</th>
                    <th className="p-3 text-center font-semibold">CBS Risk</th>
                    <th className="p-3 text-left font-semibold">Vessels at Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="p-3 font-medium">Nasopharynx</td>
                    <td className="p-3">TLN, Clival ORN, Mucosal Necrosis, Hearing Loss</td>
                    <td className="p-3 text-center"><span className="text-red-600">↑↑↑</span></td>
                    <td className="p-3">Petrous ICA, Cervical ICA</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Oropharynx</td>
                    <td className="p-3">Mandibular ORN, Hyoid ORN, Lower CN palsy</td>
                    <td className="p-3 text-center"><span className="text-amber-600">↑↑</span></td>
                    <td className="p-3">External CA, Lingual Artery (BOT), Ascending Pharyngeal</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Neck</td>
                    <td className="p-3">Lower CNs, Brachial Plexopathy</td>
                    <td className="p-3 text-center"><span className="text-yellow-600">↑</span></td>
                    <td className="p-3">ICA/CCA, Vertebral artery</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* References */}
      {activeSection === 'references' && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Key References</h2>
          <div className="space-y-4 text-sm">
            {[
              { authors: 'Phan J, Spiotto MT, Goodman CD, et al.', title: 'Reirradiation for Locally Recurrent Head and Neck Cancer: State-of-the-Art and Future Directions.', journal: 'Semin Radiat Oncol. 2025;35(2):243-258.', note: 'Primary reference for MDACC pathway' },
              { authors: 'Diao K, Nguyen TP, Moreno AC, et al.', title: 'SBRT for reirradiation of small volume head and neck cancers is associated with prolonged survival.', journal: 'Head Neck. 2021;43(11):3331-3344.', note: 'SBRT outcomes, volume thresholds' },
              { authors: 'Takiar V, Garden AS, Ma D, et al.', title: 'Reirradiation of Head and Neck Cancers With IMRT: Outcomes and Analyses.', journal: 'Int J Radiat Oncol Biol Phys. 2016;95(4):1117-1131.', note: 'IMRT outcomes, volume >50cc toxicity' },
              { authors: 'Bagley AF, Garden AS, Reddy JP, et al.', title: 'Highly conformal reirradiation in patients with prior oropharyngeal radiation.', journal: 'Head Neck. 2020;42(11):3326-3335.', note: 'Prior oropharynx reRT outcomes' },
              { authors: 'Ng SP, Wang H, Pollard C, et al.', title: 'Patient Outcomes after Reirradiation of Small Skull Base Tumors using SBRT, IMRT, or Proton Therapy.', journal: 'J Neurol Surg B Skull Base. 2020;81(6):638-644.', note: 'Skull base <60cc outcomes' },
              { authors: 'Grimm J, et al.', title: 'HYTEC: High-dose hypofractionated radiation therapy for head and neck cancer.', journal: 'IJROBP. 2020.', note: 'CBS/BE risk reduction data' },
              { authors: 'Ward MC, Riaz N, Caudell JJ, et al.', title: 'MIRI Collaborative: Refining Patient Selection for Reirradiation.', journal: 'Int J Radiat Oncol Biol Phys. 2018;100(1):37-43.', note: 'RPA Classification system' },
            ].map((ref, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg border-l-4 border-teal-500">
                <div className="font-medium text-gray-900">{ref.authors}</div>
                <div className="text-gray-700 italic">{ref.title}</div>
                <div className="text-gray-500">{ref.journal}</div>
                {ref.note && <div className="text-teal-600 text-xs mt-1">→ {ref.note}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
