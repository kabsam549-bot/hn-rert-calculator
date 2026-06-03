'use client';

import { useState } from 'react';
import { VERIFIED_CONSTRAINT_REFERENCES } from '@/lib/constraintReferences';
import { useEditableContent } from '@/lib/hooks/useEditableContent';

type Section = 'overview' | 'constraints' | 'constraintSources' | 'outcomes' | 'cbs' | 'references';

const KEY_REFERENCES = [
  {
    authors: 'Phan J, Spiotto MT, Goodman CD, et al.',
    title: 'Reirradiation for Locally Recurrent Head and Neck Cancer: State-of-the-Art and Future Directions.',
    journal: 'Semin Radiat Oncol. 2025;35(2):243-258.',
    note: 'Primary reference for MDACC pathway',
    url: 'https://doi.org/10.1016/j.semradonc.2025.02.009',
  },
  {
    authors: 'Diao K, Nguyen TP, Moreno AC, et al.',
    title: 'Stereotactic Body Ablative Radiotherapy for Reirradiation of Small Volume Head and Neck Cancers is Associated with Prolonged Survival.',
    journal: 'Head Neck. 2021;43(11):3331-3344.',
    note: 'SBRT outcomes, volume thresholds',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8511054/',
  },
  {
    authors: 'Takiar V, Garden AS, Ma D, et al.',
    title: 'Reirradiation of Head and Neck Cancers With IMRT: Outcomes and Analyses.',
    journal: 'Int J Radiat Oncol Biol Phys. 2016;95(4):1117-1131.',
    note: 'IMRT outcomes, volume >50cc toxicity',
    url: 'https://doi.org/10.1016/j.ijrobp.2016.03.015',
  },
  {
    authors: 'Bagley AF, Garden AS, Reddy JP, et al.',
    title: 'Highly conformal reirradiation in patients with prior oropharyngeal radiation: Clinical efficacy and toxicity outcomes.',
    journal: 'Head Neck. 2020;42(11):3326-3335.',
    note: 'Prior oropharynx reRT outcomes',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7722120/',
  },
  {
    authors: 'Ng SP, Wang H, Pollard C, et al.',
    title: 'Patient Outcomes after Reirradiation of Small Skull Base Tumors using Stereotactic Body Radiotherapy, Intensity Modulated Radiotherapy, or Proton Therapy.',
    journal: 'J Neurol Surg B Skull Base. 2020;81(6):638-644.',
    note: 'Skull base <60cc outcomes',
    url: 'https://doi.org/10.1055/s-0039-1694052',
  },
  {
    authors: 'Grimm J, Vargo JA, Mavroidis P, et al.',
    title: 'Initial Data Pooling for Radiation Dose-Volume Tolerance for Carotid Artery Blowout and Other Bleeding Events in Hypofractionated Head and Neck Retreatments.',
    journal: 'Int J Radiat Oncol Biol Phys. 2021;110(1):147-159.',
    note: 'CBS/BE risk reduction data',
    url: 'https://doi.org/10.1016/j.ijrobp.2020.12.037',
  },
  {
    authors: 'Ward MC, Riaz N, Caudell JJ, et al.',
    title: 'Refining Patient Selection for Reirradiation of Head and Neck Squamous Carcinoma in the IMRT Era: A Multi-institution Cohort Study by the MIRI Collaborative.',
    journal: 'Int J Radiat Oncol Biol Phys. 2018;100(3):586-594.',
    note: 'RPA classification system',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9131594/',
  },
];

export default function GuidelinesTab() {
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const { content } = useEditableContent();
  const adminGuidelines = content?.guidelines ?? [];

  const sections: { id: Section; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'constraints', label: 'OAR Constraints' },
    { id: 'constraintSources', label: 'Constraint Sources' },
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
          {adminGuidelines.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Clinical Guidelines</h2>
              <div className="space-y-3">
                {adminGuidelines.map((guideline) => (
                  <div key={guideline.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="font-semibold text-gray-900">{guideline.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{guideline.content}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
            <h2 className="text-xl font-bold text-gray-900 mb-2">Master OAR Dose Constraint Table</h2>
            <p className="text-gray-600 mb-2">SBRT dose constraints for head and neck reirradiation by fractionation scheme</p>
            <p className="text-xs text-gray-500 mb-6">Sources: [Diao] = Diao et al, Head &amp; Neck 2022;44:289-291 | [Phan 5fx/3fx] = Phan institutional planning directives | [RTOG] = RTOG trial protocols | [NCIC] = NCIC SC.24</p>

            {/* Tier 1 */}
            <div className="mb-8">
              <h3 className="font-bold text-red-700 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">1</span>
                Tier 1: Critical Structures (Go/No-Go Decision)
              </h3>
              <div className="bg-red-50 rounded-lg overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-red-100">
                      <th className="p-2 text-left font-semibold min-w-[140px]">Structure</th>
                      <th className="p-2 text-left font-semibold min-w-[160px]">1 fx</th>
                      <th className="p-2 text-left font-semibold min-w-[160px]">2 fx</th>
                      <th className="p-2 text-left font-semibold min-w-[200px]">3 fx</th>
                      <th className="p-2 text-left font-semibold min-w-[200px]">5 fx</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-100">
                    <tr>
                      <td className="p-2 font-medium">Brainstem</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2">Dmax &lt;15 Gy &lt;0.5cc; if in target &lt;17 Gy &lt;0.5cc &amp; &lt;22 Gy point <span className="text-gray-500">[Phan 3fx]</span></td>
                      <td className="p-2">Dmax &lt;13 Gy <span className="text-gray-500">[Diao]</span>; &lt;8 Gy <span className="text-gray-500">[Phan 5fx]</span>; skull base: &lt;21 Gy &lt;0.5cc, max 23 Gy <span className="text-gray-500">[Phan 5fx SB]</span></td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Spinal Cord / Medulla</td>
                      <td className="p-2">Dmax 14 Gy, D0.35cc &le; 10 Gy, D1.2cc &le; 7 Gy <span className="text-gray-500">[RTOG 0631]</span></td>
                      <td className="p-2">PRV (1.5-2mm) Dmax 17 Gy <span className="text-gray-500">[NCIC SC.24]</span></td>
                      <td className="p-2">Dmax &lt;6 Gy <span className="text-gray-500">[Phan 3fx SB]</span></td>
                      <td className="p-2">Dmax &lt;12 Gy, 2mm PRV <span className="text-gray-500">[Diao]</span>; &lt;10 Gy, V8 &lt;0.25cc <span className="text-gray-500">[Phan 5fx]</span></td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Optic Chiasm / Apparatus</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2">Dmax &lt;4 Gy; allow &lt;12 Gy; limit 18 Gy <span className="text-gray-500">[Phan 3fx SB]</span></td>
                      <td className="p-2">Dmax &lt;12 Gy, 1mm PRV <span className="text-gray-500">[Diao]</span>; &lt;4 Gy; allow &lt;12 Gy, limit 15 Gy, max 18 Gy <span className="text-gray-500">[Phan 5fx]</span></td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Optic Nerve (ipsi)</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2">Dmax &lt;12 Gy; allow &lt;15 Gy; limit 18 Gy <span className="text-gray-500">[Phan 3fx]</span></td>
                      <td className="p-2 text-gray-400">--</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Optic Nerve (contra)</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2">Dmax &lt;4 Gy <span className="text-gray-500">[Phan 3fx]</span></td>
                      <td className="p-2 text-gray-400">--</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tier 2 */}
            <div className="mb-8">
              <h3 className="font-bold text-amber-700 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs">2</span>
                Tier 2: Critical Structures with Less Established Constraints
              </h3>
              <div className="bg-amber-50 rounded-lg overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-amber-100">
                      <th className="p-2 text-left font-semibold min-w-[140px]">Structure</th>
                      <th className="p-2 text-left font-semibold min-w-[160px]">1 fx</th>
                      <th className="p-2 text-left font-semibold min-w-[160px]">2 fx</th>
                      <th className="p-2 text-left font-semibold min-w-[200px]">3 fx</th>
                      <th className="p-2 text-left font-semibold min-w-[200px]">5 fx</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100">
                    <tr>
                      <td className="p-2 font-medium">Carotid (ipsi)</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2">Dmax &lt;27 Gy &lt;0.1cc <span className="text-gray-500">[Phan 3fx PG]</span>; in target: avoid hotspot &gt;27 Gy; &gt;1cm: &lt;13 Gy <span className="text-gray-500">[Phan 3fx OPX]</span></td>
                      <td className="p-2">&lt;1cm: Dmax &lt;30 Gy, V27 &lt;0.5cc <span className="text-gray-500">[Diao]</span>; &gt;1cm: &lt;20 Gy <span className="text-gray-500">[Diao]</span>; in target: V30 &lt;1cc <span className="text-gray-500">[Phan 5fx]</span></td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Lingual Vessel</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2">&lt;5mm: no hotspot; &gt;5mm: Dmax &lt;18 Gy <span className="text-gray-500">[Phan 3fx]</span></td>
                      <td className="p-2">&lt;5mm: &lt;30 Gy, no hotspot; &gt;5mm: &lt;20 Gy <span className="text-gray-500">[Phan 5fx]</span>; V27 &lt;0.5cc <span className="text-gray-500">[Diao]</span></td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Cochlea / IAC</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2">Dmax &lt;13-15 Gy; allow 17 Gy; &lt;22 Gy if in target <span className="text-gray-500">[Phan 3fx]</span>; acoustic: &lt;18 Gy, V21 &lt;0.5cc <span className="text-gray-500">[Phan 3fx]</span></td>
                      <td className="p-2">Dmax &lt;18 Gy <span className="text-gray-500">[Diao]</span>; ipsi &lt;15 Gy, allow &lt;18 Gy, limit 23 Gy; contra &lt;10 Gy <span className="text-gray-500">[Phan 5fx]</span></td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Temporal Lobe / Brain</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2">Dmax &lt;23 Gy, V15 &lt;2.0cc <span className="text-gray-500">[Phan 3fx]</span>; dural mets: &lt;27 Gy, &lt;20 Gy &lt;7.5cc <span className="text-gray-500">[Phan 3fx]</span></td>
                      <td className="p-2">Dmax &lt;27 Gy, V20 &lt;0.5cc <span className="text-gray-500">[Diao]</span>; V25 &lt;1cc, V18 &lt;3cc <span className="text-gray-500">[Phan 5fx]</span></td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">CN Avoidance</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2">Dmax &lt;22 Gy &lt;0.1cc, no hotspot <span className="text-gray-500">[Phan 3fx PG]</span></td>
                      <td className="p-2">Dmax &lt;26 Gy <span className="text-gray-500">[Diao]</span></td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Larynx</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2">ALARA; Dmax &lt;9 Gy <span className="text-gray-500">[Phan 3fx OPX]</span></td>
                      <td className="p-2">Non-laryngeal: Dmax &lt;12 Gy; Laryngeal: Dmean &lt;10 Gy <span className="text-gray-500">[Diao]</span>; ALARA <span className="text-gray-500">[Phan 5fx]</span></td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Mandible / Hyoid</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2">Avoid hotspot; V15 &lt;3cc <span className="text-gray-500">[Phan 3fx OPX]</span></td>
                      <td className="p-2">V25 &lt;3cc, 1cm from target <span className="text-gray-500">[Diao]</span>; V20 &lt;3cc <span className="text-gray-500">[Phan 5fx]</span></td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Pharyngeal Constrictors</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2">Dmean &lt;10 Gy if &lt;1cm <span className="text-gray-500">[Diao]</span></td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Brachial Plexus</td>
                      <td className="p-2">Dmax 17.5 Gy, D3cc &le; 14 Gy <span className="text-gray-500">[RTOG 0631]</span></td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2">Dmax 24 Gy, D3cc &lt;20.4 Gy <span className="text-gray-500">[RTOG 1021]</span>; &lt;14 Gy &lt;0.1cc, &lt;11 Gy &lt;3cc <span className="text-gray-500">[Phan 3fx]</span></td>
                      <td className="p-2">Dmax 32 Gy, D3cc &lt;30 Gy <span className="text-gray-500">[RTOG 0813]</span>; &lt;22 Gy &lt;0.1cc, &lt;18 Gy &lt;3cc <span className="text-gray-500">[Phan 5fx]</span></td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Pituitary</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2">Mean &lt;9 Gy; Max &lt;30 Gy point <span className="text-gray-500">[Phan 3fx]</span></td>
                      <td className="p-2">Mean &lt;12 Gy; Max &lt;45 Gy point <span className="text-gray-500">[Phan 5fx]</span></td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Retina</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2">Dmax &lt;10 Gy <span className="text-gray-500">[Phan 3fx]</span></td>
                      <td className="p-2">Dmax &lt;15 Gy <span className="text-gray-500">[Phan 5fx]</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tier 3 */}
            <div className="mb-8">
              <h3 className="font-bold text-blue-700 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">3</span>
                Tier 3: Quality of Life Structures
              </h3>
              <div className="bg-blue-50 rounded-lg overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="p-2 text-left font-semibold min-w-[140px]">Structure</th>
                      <th className="p-2 text-left font-semibold min-w-[160px]">1 fx</th>
                      <th className="p-2 text-left font-semibold min-w-[160px]">2 fx</th>
                      <th className="p-2 text-left font-semibold min-w-[200px]">3 fx</th>
                      <th className="p-2 text-left font-semibold min-w-[200px]">5 fx</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-100">
                    <tr>
                      <td className="p-2 font-medium">Parotid</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2">Mean &lt;6 Gy <span className="text-gray-500">[Phan 3fx]</span>; critical: &lt;6 Gy max <span className="text-gray-500">[Phan 3fx midline]</span></td>
                      <td className="p-2">Dmax &lt;25 Gy, V15 &lt;1cc <span className="text-gray-500">[Diao]</span>; ipsi &lt;14 Gy mean; contra: avoid <span className="text-gray-500">[Phan 5fx]</span></td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Mucosal / Oral</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2">Dmax &lt;15 Gy, Mean &lt;8 Gy <span className="text-gray-500">[Phan 3fx OPX]</span>; ALARA <span className="text-gray-500">[Phan 3fx PG]</span></td>
                      <td className="p-2">Dmax &lt;15 Gy, 1cm from target <span className="text-gray-500">[Diao]</span>; &lt;20 Gy, Mean &lt;10 Gy <span className="text-gray-500">[Phan 5fx]</span></td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Mastoid / EAC</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2">ALARA (&lt;18 Gy ideal), no hotspot if in target <span className="text-gray-500">[Phan 3fx]</span></td>
                      <td className="p-2">ALARA <span className="text-gray-500">[Diao]</span></td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Esophagus / Neopharynx</td>
                      <td className="p-2">Dmax 16 Gy, D5cc &le; 11.9 Gy <span className="text-gray-500">[RTOG 0631]</span></td>
                      <td className="p-2">Dmax 20 Gy <span className="text-gray-500">[NCIC SC.24]</span></td>
                      <td className="p-2">Dmax 27 Gy <span className="text-gray-500">[RTOG 0236]</span>; &lt;15 Gy <span className="text-gray-500">[Phan 3fx]</span></td>
                      <td className="p-2">Dmax 105% Rx, D5cc &lt;27.5 Gy <span className="text-gray-500">[RTOG 0813]</span>; sharp drop off <span className="text-gray-500">[Phan 5fx]</span></td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Tracheo-esophageal</td>
                      <td className="p-2">Dmax 20.2 Gy, D4cc &le; 10.5 Gy <span className="text-gray-500">[RTOG 0631]</span></td>
                      <td className="p-2">Dmax 20 Gy <span className="text-gray-500">[NCIC SC.24]</span></td>
                      <td className="p-2">Dmax 30 Gy, D4cc &le; 15 Gy <span className="text-gray-500">[RTOG 1021]</span>; &lt;15 Gy <span className="text-gray-500">[Phan 3fx]</span></td>
                      <td className="p-2">105% Rx, D4cc &le; 18 Gy <span className="text-gray-500">[RTOG 0813]</span></td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Heart &amp; Pericardium</td>
                      <td className="p-2">Dmax 22 Gy, D15cc &le; 16 Gy <span className="text-gray-500">[RTOG 0631]</span></td>
                      <td className="p-2 text-gray-400">--</td>
                      <td className="p-2">Dmax 30 Gy, D15cc &le; 24 Gy <span className="text-gray-500">[RTOG 1021]</span>; &lt;10 Gy <span className="text-gray-500">[Phan 3fx]</span></td>
                      <td className="p-2">Dmax 105% Rx, D15cc &le; 32 Gy <span className="text-gray-500">[RTOG 0813]</span></td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Lung</td>
                      <td className="p-2">7.4 Gy (1000cc) <span className="text-gray-500">[RTOG 0631]</span></td>
                      <td className="p-2">V10 &lt;10%, V5 &lt;35%, Mean &le; 5 Gy <span className="text-gray-500">[NCIC SC.24]</span></td>
                      <td className="p-2">V20 &lt;10% <span className="text-gray-500">[RTOG 0236]</span>; &lt;12 Gy &lt;500cc <span className="text-gray-500">[Phan 3fx]</span></td>
                      <td className="p-2">12.5 Gy (1500cc), 13.5 Gy (1000cc) <span className="text-gray-500">[RTOG 0813]</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Composite Constraints */}
            <div>
              <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-gray-500 text-white rounded-full flex items-center justify-center text-xs">+</span>
                Reirradiation Composite Constraints (Cumulative Dose)
              </h3>
              <div className="bg-gray-50 rounded-lg overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-2 text-left font-semibold min-w-[180px]">Structure</th>
                      <th className="p-2 text-left font-semibold">Constraint</th>
                      <th className="p-2 text-left font-semibold">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr><td className="p-2 font-medium">Mandible (ideal)</td><td className="p-2">V40 &lt;40% and V50 &lt;25%</td><td className="p-2 text-gray-500">[Phan 5fx]</td></tr>
                    <tr><td className="p-2 font-medium">Mandible (target nearby)</td><td className="p-2">&lt;90 Gy max, V70 &lt;10%, V60 &lt;30%</td><td className="p-2 text-gray-500">[Phan 5fx]</td></tr>
                    <tr><td className="p-2 font-medium">Carotid Sheath (ideal, &gt;1cm)</td><td className="p-2">&lt;65 Gy</td><td className="p-2 text-gray-500">[Phan 5fx]</td></tr>
                    <tr><td className="p-2 font-medium">Carotid Sheath (&lt;1cm)</td><td className="p-2">V90 &lt;0.5cc</td><td className="p-2 text-gray-500">[Phan 5fx]</td></tr>
                    <tr><td className="p-2 font-medium">IAC / Cochlea</td><td className="p-2">&lt;40-45 Gy max</td><td className="p-2 text-gray-500">[Phan 5fx]</td></tr>
                    <tr><td className="p-2 font-medium">EAC / Mastoid</td><td className="p-2">D1 &lt;60-70 Gy, V60 &lt;10%, avoid hotspots</td><td className="p-2 text-gray-500">[Phan 5fx]</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Constraint Sources */}
      {activeSection === 'constraintSources' && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verified Constraint Sources</h2>
            <p className="text-sm text-gray-600">
              Source links are shown only for calculator thresholds that match a published value closely enough. Estimated, institutional, or surrogate-only cumulative limits remain unlinked until reviewed.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3 text-left font-semibold min-w-[180px]">Structure</th>
                  <th className="p-3 text-left font-semibold min-w-[140px]">Constraint</th>
                  <th className="p-3 text-left font-semibold min-w-[210px]">Evidence</th>
                  <th className="p-3 text-left font-semibold min-w-[260px]">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {VERIFIED_CONSTRAINT_REFERENCES.map((reference) => (
                  <tr key={reference.id} className="align-top">
                    <td className="p-3">
                      <div className="font-semibold text-gray-900">{reference.structure}</div>
                      <div className="text-xs text-gray-500 mt-1">{reference.metric}</div>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex rounded-md bg-teal-50 px-2 py-1 text-xs font-bold text-teal-800 ring-1 ring-teal-200">
                        {reference.constraint}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ring-1 ${
                        reference.evidenceType === 'Cumulative re-irradiation'
                          ? 'bg-green-50 text-green-800 ring-green-200'
                          : 'bg-amber-50 text-amber-800 ring-amber-200'
                      }`}>
                        {reference.evidenceType}
                      </div>
                      <div className="text-xs text-gray-600 mt-2">{reference.note}</div>
                    </td>
                    <td className="p-3">
                      <a
                        href={reference.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-blue-700 underline decoration-blue-300 underline-offset-2 hover:text-blue-900"
                      >
                        {reference.sourceLabel}
                      </a>
                      <div className="text-xs text-gray-500 mt-1">{reference.citation}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            {KEY_REFERENCES.map((ref) => (
              <a
                key={ref.url}
                href={ref.url}
                target="_blank"
                rel="noreferrer"
                className="group block p-4 bg-gray-50 rounded-lg border-l-4 border-teal-500 transition-colors hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                <div className="font-medium text-gray-900">{ref.authors}</div>
                <div className="text-gray-700 italic group-hover:text-teal-800">{ref.title}</div>
                <div className="text-gray-500">{ref.journal}</div>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  {ref.note && <div className="text-teal-600 text-xs">{ref.note}</div>}
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 group-hover:text-blue-900">
                    Open paper
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h4m0 0v4m0-4L10 14m-3 3h10a2 2 0 002-2v-3M5 19h10a2 2 0 002-2V7" />
                    </svg>
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
