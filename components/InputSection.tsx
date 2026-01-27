'use client';

import type { PatientData } from '@/lib/types';
import { OAR_CONSTRAINTS } from '@/lib/oarConstraints';
import Tooltip from './Tooltip';
import ExpandableSection from './ExpandableSection';

interface InputSectionProps {
  patientData: PatientData;
  setPatientData: (data: PatientData) => void;
  onCalculate: () => void;
  onReset: () => void;
}

export default function InputSection({
  patientData,
  setPatientData,
  onCalculate,
  onReset,
}: InputSectionProps) {
  const handleInputChange = (field: keyof PatientData, value: string | number | boolean | string[]) => {
    setPatientData({
      ...patientData,
      [field]: value,
    });
  };

  const handleOARToggle = (oarName: string) => {
    const currentOARs = patientData.selectedOARs || [];
    const newOARs = currentOARs.includes(oarName)
      ? currentOARs.filter(name => name !== oarName)
      : [...currentOARs, oarName];
    
    handleInputChange('selectedOARs', newOARs);
  };

  const isFormValid = () => {
    return (
      patientData.priorDose !== undefined &&
      patientData.priorFractions !== undefined &&
      patientData.plannedDose !== undefined &&
      patientData.plannedFractions !== undefined &&
      patientData.timeSinceRT !== undefined &&
      (patientData.selectedOARs?.length ?? 0) > 0
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">H&N Re-Irradiation Calculator</h2>
        <p className="text-sm text-gray-600">Based on MIRI study (Phan et al., 2010) and HyTEC guidelines</p>
      </div>

      {/* Educational Sections */}
      <div className="space-y-4">
        <ExpandableSection
          title="Understanding BED & EQD2 Calculations"
          icon="🧮"
          bgColor="bg-indigo-50"
          borderColor="border-indigo-200"
          textColor="text-indigo-900"
        >
          <div>
            <h4 className="font-semibold mb-2">What is BED (Biologically Effective Dose)?</h4>
            <p className="mb-3">
              BED accounts for the biological effect of different fractionation schedules. The same physical 
              dose delivered in different fraction sizes has different biological effects on tissues.
            </p>
            
            <div className="bg-white p-3 rounded border border-indigo-300 mb-3">
              <p className="font-mono text-sm mb-1">
                BED = n × d × [1 + d/(α/β)]
              </p>
              <p className="text-xs">
                where: n = number of fractions, d = dose per fraction, α/β = tissue-specific ratio
              </p>
            </div>

            <h4 className="font-semibold mb-2 mt-3">What is EQD2 (Equivalent Dose in 2 Gy Fractions)?</h4>
            <p className="mb-3">
              EQD2 normalizes different fractionation schedules to an equivalent dose delivered at 2 Gy per fraction 
              (the standard in radiation oncology). This allows comparison across different treatment regimens.
            </p>
            
            <div className="bg-white p-3 rounded border border-indigo-300 mb-3">
              <p className="font-mono text-sm mb-1">
                EQD2 = BED / [1 + 2/(α/β)]
              </p>
              <p className="text-xs">
                This formula converts any fractionation schedule to its 2 Gy/fraction equivalent
              </p>
            </div>

            <h4 className="font-semibold mb-2">Example Calculation:</h4>
            <div className="bg-white p-3 rounded border border-indigo-300">
              <p className="text-sm mb-1">
                <strong>Scenario:</strong> 70 Gy in 35 fractions (2 Gy/fx) to tumor (α/β = 10)
              </p>
              <p className="text-sm mb-1">
                <strong>BED:</strong> 35 × 2 × [1 + 2/10] = 84 Gy₁₀
              </p>
              <p className="text-sm">
                <strong>EQD2:</strong> 84 / [1 + 2/10] = 70 Gy (as expected, since already 2 Gy/fx)
              </p>
            </div>
          </div>
        </ExpandableSection>

        <ExpandableSection
          title="Understanding α/β Ratios"
          icon="⚛️"
          bgColor="bg-green-50"
          borderColor="border-green-200"
          textColor="text-green-900"
        >
          <div>
            <p className="mb-3">
              The α/β ratio describes how sensitive different tissues are to changes in fraction size. 
              It's a key parameter in the linear-quadratic model of radiation biology.
            </p>

            <h4 className="font-semibold mb-2">Typical α/β Values:</h4>
            <div className="space-y-2">
              <div className="bg-white p-2 rounded border border-green-300">
                <p className="font-semibold text-sm">Tumor tissue (α/β = 10 Gy)</p>
                <p className="text-xs">
                  High α/β = less sensitive to fraction size. Benefits from standard fractionation.
                </p>
              </div>
              
              <div className="bg-white p-2 rounded border border-green-300">
                <p className="font-semibold text-sm">Late-responding normal tissues (α/β = 2-3 Gy)</p>
                <p className="text-xs">
                  Low α/β = very sensitive to fraction size. Risk increases dramatically with larger fractions. 
                  Examples: spinal cord, brain, optic structures.
                </p>
              </div>
              
              <div className="bg-white p-2 rounded border border-green-300">
                <p className="font-semibold text-sm">Intermediate tissues (α/β = 4-6 Gy)</p>
                <p className="text-xs">
                  Moderate sensitivity. Examples: larynx, esophagus, some mucosal structures.
                </p>
              </div>
            </div>

            <p className="mt-3 text-sm italic">
              <strong>Clinical implication:</strong> When re-irradiating, cumulative EQD2 to late-responding 
              tissues must be carefully monitored because they have "long memories" and limited repair capacity.
            </p>
          </div>
        </ExpandableSection>

        <ExpandableSection
          title="About the MIRI RPA Study"
          icon="📊"
          bgColor="bg-yellow-50"
          borderColor="border-yellow-200"
          textColor="text-yellow-900"
        >
          <div>
            <p className="mb-3">
              The <strong>MIRI (MD Anderson) Recursive Partitioning Analysis</strong> study by Phan et al. (2010) 
              analyzed outcomes of head and neck cancer patients undergoing re-irradiation and identified three 
              prognostic classes.
            </p>

            <h4 className="font-semibold mb-2">RPA Classification:</h4>
            <div className="space-y-2">
              <div className="bg-white p-3 rounded border border-green-400 border-l-4">
                <p className="font-semibold text-sm text-green-800">Class I (Best Prognosis)</p>
                <p className="text-xs mb-1">
                  ✓ Prior salvage surgery AND no organ dysfunction<br/>
                  ✓ 2-year survival: ~62%<br/>
                  ✓ Median survival: ~24 months
                </p>
              </div>
              
              <div className="bg-white p-3 rounded border border-yellow-400 border-l-4">
                <p className="font-semibold text-sm text-yellow-800">Class II (Intermediate)</p>
                <p className="text-xs mb-1">
                  • Interval ≥18 months OR no organ dysfunction (but not both Class I criteria)<br/>
                  • 2-year survival: ~41%<br/>
                  • Median survival: ~13 months
                </p>
              </div>
              
              <div className="bg-white p-3 rounded border border-red-400 border-l-4">
                <p className="font-semibold text-sm text-red-800">Class III (Poor Prognosis)</p>
                <p className="text-xs mb-1">
                  ✗ Interval &lt;18 months AND organ dysfunction<br/>
                  ✗ 2-year survival: ~18%<br/>
                  ✗ Median survival: ~6 months
                </p>
              </div>
            </div>

            <p className="mt-3 text-sm italic">
              <strong>Clinical use:</strong> RPA classification helps with treatment decision-making, patient 
              counseling, and risk stratification for clinical trials.
            </p>
          </div>
        </ExpandableSection>

        <ExpandableSection
          title="Why Organ-at-Risk Tiers?"
          icon="🎯"
          bgColor="bg-rose-50"
          borderColor="border-rose-200"
          textColor="text-rose-900"
        >
          <div>
            <p className="mb-3">
              OARs are categorized into three tiers based on the <strong>severity and type of potential toxicity</strong>. 
              This helps clinicians prioritize constraints during treatment planning.
            </p>

            <div className="space-y-3">
              <div className="bg-white p-3 rounded border-l-4 border-red-500">
                <h4 className="font-semibold text-red-800 mb-1">Tier 1: Life-Threatening Toxicities</h4>
                <p className="text-sm mb-2">
                  Complications that can cause death or require immediate medical intervention.
                </p>
                <ul className="text-xs space-y-1 list-disc list-inside">
                  <li><strong>Carotid artery:</strong> Rupture (carotid blowout syndrome) - mortality up to 60%</li>
                  <li><strong>Brainstem:</strong> Necrosis - respiratory failure, death</li>
                  <li><strong>Spinal cord:</strong> Myelitis/myelopathy - paralysis, respiratory failure</li>
                </ul>
              </div>

              <div className="bg-white p-3 rounded border-l-4 border-orange-500">
                <h4 className="font-semibold text-orange-800 mb-1">Tier 2: Critical Toxicities</h4>
                <p className="text-sm mb-2">
                  Severe complications that significantly impact function but are not immediately life-threatening.
                </p>
                <ul className="text-xs space-y-1 list-disc list-inside">
                  <li><strong>Optic structures:</strong> Blindness - irreversible vision loss</li>
                  <li><strong>Mandible:</strong> Osteoradionecrosis - pain, infection, pathologic fracture</li>
                  <li><strong>Brachial plexus:</strong> Plexopathy - arm weakness, neuropathic pain</li>
                </ul>
              </div>

              <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                <h4 className="font-semibold text-blue-800 mb-1">Tier 3: Quality of Life Toxicities</h4>
                <p className="text-sm mb-2">
                  Complications that significantly affect daily function and quality of life.
                </p>
                <ul className="text-xs space-y-1 list-disc list-inside">
                  <li><strong>Larynx:</strong> Chronic edema, stenosis - voice changes, dyspnea</li>
                  <li><strong>Esophagus:</strong> Stricture - dysphagia, aspiration risk</li>
                  <li><strong>Parotid glands:</strong> Xerostomia - dry mouth, dental decay, dysphagia</li>
                </ul>
              </div>
            </div>

            <p className="mt-3 text-sm italic">
              <strong>Planning strategy:</strong> Tier 1 constraints are inviolable. Tier 2 should be met if at all 
              possible. Tier 3 may be compromised if necessary for tumor coverage, with patient counseling.
            </p>
          </div>
        </ExpandableSection>
      </div>
      
      {/* Prior Radiation */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Prior Radiation Therapy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prior Dose (Gy) <span className="text-red-500">*</span>
              <Tooltip content={
                <div>
                  <p className="font-semibold mb-1">Total Physical Dose Previously Delivered</p>
                  <p className="mb-2">Enter the total dose (in Gray) from the patient's previous radiation treatment.</p>
                  <p className="text-xs">
                    <strong>Example:</strong> If the patient received 70 Gy to the primary tumor, 
                    enter 70. This will be converted to EQD2 based on the fractionation schedule.
                  </p>
                </div>
              } />
            </label>
            <input
              type="number"
              value={patientData.priorDose ?? ''}
              onChange={(e) => handleInputChange('priorDose', Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 70"
              min="0"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prior Fractions <span className="text-red-500">*</span>
              <Tooltip content={
                <div>
                  <p className="font-semibold mb-1">What are Fractions?</p>
                  <p className="mb-2">
                    Radiation treatment is divided into multiple smaller doses (fractions) rather than 
                    one large dose. This allows normal tissues to repair between treatments while 
                    maintaining tumor cell kill.
                  </p>
                  <p className="text-xs">
                    <strong>Standard:</strong> 2 Gy per fraction, 35 fractions = 70 Gy total<br/>
                    <strong>Hypofractionation:</strong> Larger doses per fraction, fewer fractions
                  </p>
                </div>
              } />
            </label>
            <input
              type="number"
              value={patientData.priorFractions ?? ''}
              onChange={(e) => handleInputChange('priorFractions', Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 35"
              min="1"
              step="1"
            />
          </div>
        </div>
      </div>

      {/* Planned Radiation */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Planned Re-Irradiation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Planned Dose (Gy) <span className="text-red-500">*</span>
              <Tooltip content={
                <div>
                  <p className="font-semibold mb-1">Re-irradiation Dose</p>
                  <p className="mb-2">
                    Enter the total dose planned for the re-irradiation treatment. 
                    This is typically lower than initial treatment (often 50-66 Gy) due to 
                    cumulative normal tissue tolerance.
                  </p>
                  <p className="text-xs">
                    The calculator will add this to the prior dose in EQD2 terms to assess 
                    cumulative organ-at-risk exposure.
                  </p>
                </div>
              } />
            </label>
            <input
              type="number"
              value={patientData.plannedDose ?? ''}
              onChange={(e) => handleInputChange('plannedDose', Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 60"
              min="0"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Planned Fractions <span className="text-red-500">*</span>
              <Tooltip content={
                <div>
                  <p className="font-semibold mb-1">Re-irradiation Fractionation</p>
                  <p className="mb-2">
                    Number of treatments for the planned re-irradiation. May differ from 
                    initial treatment schedule.
                  </p>
                  <p className="text-xs">
                    <strong>Common schemes:</strong><br/>
                    • Standard: 2 Gy × 30-33 fx = 60-66 Gy<br/>
                    • Hypofractionated: 2.4 Gy × 25 fx = 60 Gy<br/>
                    • SBRT: 5-10 Gy × 5 fx (highly selected cases)
                  </p>
                </div>
              } />
            </label>
            <input
              type="number"
              value={patientData.plannedFractions ?? ''}
              onChange={(e) => handleInputChange('plannedFractions', Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 30"
              min="1"
              step="1"
            />
          </div>
        </div>
      </div>

      {/* Time Interval */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Treatment Interval</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Since Prior RT (months) <span className="text-red-500">*</span>
              <Tooltip content={
                <div>
                  <p className="font-semibold mb-1">Why Does Interval Matter?</p>
                  <p className="mb-2">
                    Normal tissues have some capacity to recover from radiation damage over time. 
                    Longer intervals between treatments allow for:
                  </p>
                  <ul className="text-xs space-y-1 mb-2 list-disc list-inside">
                    <li><strong>Cellular repair:</strong> DNA repair mechanisms fix sublethal damage</li>
                    <li><strong>Vascular recovery:</strong> Microvasculature can regenerate</li>
                    <li><strong>Fibrosis stabilization:</strong> Late effects plateau</li>
                  </ul>
                  <p className="text-xs">
                    <strong>Key threshold:</strong> The MIRI study found 18 months is a critical 
                    prognostic cutoff. Intervals &lt;18 months predict worse outcomes (RPA Class III risk).
                  </p>
                </div>
              } />
            </label>
            <input
              type="number"
              value={patientData.timeSinceRT ?? ''}
              onChange={(e) => handleInputChange('timeSinceRT', Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 18"
              min="0"
              step="1"
            />
            {patientData.timeSinceRT !== undefined && (
              <p className="text-xs text-gray-500 mt-1">
                ≈ {(patientData.timeSinceRT / 12).toFixed(1)} years
              </p>
            )}
          </div>
        </div>
        
        {/* Inline callout about interval significance */}
        {patientData.timeSinceRT !== undefined && (
          <div className={`mt-3 p-3 rounded-lg border-l-4 ${
            patientData.timeSinceRT >= 18 
              ? 'bg-green-50 border-green-400 text-green-800' 
              : 'bg-yellow-50 border-yellow-400 text-yellow-800'
          }`}>
            <p className="text-sm">
              {patientData.timeSinceRT >= 18 
                ? '✓ Interval ≥18 months is associated with better outcomes (MIRI RPA favorable factor)'
                : '⚠️ Interval <18 months is associated with poorer prognosis (MIRI RPA risk factor)'}
            </p>
          </div>
        )}
      </div>

      {/* RPA Factors */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Prognostic Factors (RPA)
          <Tooltip content={
            <div>
              <p className="font-semibold mb-1">RPA Classification from MIRI Study</p>
              <p className="mb-2">
                These two factors (salvage surgery and organ dysfunction) are key determinants 
                of survival in head and neck re-irradiation patients.
              </p>
              <p className="text-xs">
                The calculator uses these factors + treatment interval to assign an RPA class 
                (I, II, or III) with corresponding survival estimates.
              </p>
            </div>
          } />
        </h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="salvageSurgery"
              checked={patientData.hadSalvageSurgery || false}
              onChange={(e) => handleInputChange('hadSalvageSurgery', e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="salvageSurgery" className="ml-3 flex-1">
              <div className="flex items-center">
                <span className="block text-sm font-medium text-gray-700">
                  Prior Salvage Surgery
                </span>
                <Tooltip content={
                  <div>
                    <p className="font-semibold mb-1">What is Salvage Surgery?</p>
                    <p className="mb-2">
                      Surgical resection of recurrent tumor performed <strong>between</strong> the 
                      initial radiation and the planned re-irradiation.
                    </p>
                    <p className="text-xs mb-2">
                      <strong>Why it matters:</strong> Salvage surgery is a <em>favorable</em> prognostic 
                      factor. It reduces tumor burden before re-RT and demonstrates:
                    </p>
                    <ul className="text-xs space-y-1 list-disc list-inside">
                      <li>Patient is healthy enough for surgery (better performance status)</li>
                      <li>Recurrence may be more localized (resectable)</li>
                      <li>Lower disease burden for re-RT to control</li>
                    </ul>
                    <p className="text-xs mt-2 italic">
                      Patients with salvage surgery have significantly better 2-year survival in the MIRI study.
                    </p>
                  </div>
                } />
              </div>
              <span className="block text-xs text-gray-500">
                Resection of recurrent tumor between RT courses
              </span>
            </label>
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="organDysfunction"
              checked={patientData.hasOrganDysfunction || false}
              onChange={(e) => handleInputChange('hasOrganDysfunction', e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="organDysfunction" className="ml-3 flex-1">
              <div className="flex items-center">
                <span className="block text-sm font-medium text-gray-700">
                  Organ Dysfunction
                </span>
                <Tooltip content={
                  <div>
                    <p className="font-semibold mb-1">What is Organ Dysfunction?</p>
                    <p className="mb-2">
                      Patient requires feeding tube (G-tube, PEG) or tracheostomy for basic functions 
                      at the time of re-irradiation evaluation.
                    </p>
                    <p className="text-xs mb-2">
                      <strong>Why it matters:</strong> This is an <em>unfavorable</em> prognostic factor indicating:
                    </p>
                    <ul className="text-xs space-y-1 list-disc list-inside mb-2">
                      <li><strong>Feeding tube:</strong> Severe dysphagia from prior treatment or tumor burden</li>
                      <li><strong>Tracheostomy:</strong> Airway compromise from tumor or RT damage</li>
                      <li>Reflects both tumor extent and baseline toxicity burden</li>
                      <li>Less physiologic reserve to tolerate further treatment</li>
                    </ul>
                    <p className="text-xs italic">
                      Patients with organ dysfunction have worse survival and higher treatment-related morbidity.
                    </p>
                  </div>
                } />
              </div>
              <span className="block text-xs text-gray-500">
                Feeding tube or tracheostomy dependent
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* OAR Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Organs at Risk <span className="text-red-500">*</span>
          <Tooltip content={
            <div>
              <p className="font-semibold mb-1">Selecting Organs at Risk (OARs)</p>
              <p className="mb-2">
                Choose which critical structures are near the planned treatment volume. 
                The calculator will assess cumulative dose to each OAR.
              </p>
              <p className="text-xs">
                <strong>Tip:</strong> Select all OARs within ~2-3 cm of the target volume. 
                The calculator will identify which ones exceed tolerance thresholds.
              </p>
            </div>
          } />
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Select organs to evaluate for dose constraints (select at least one)
        </p>
        
        {/* Tier 1: Life-threatening */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-red-700 mb-3 flex items-center">
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded mr-2">TIER 1</span>
            Life-Threatening Toxicities
            <Tooltip content={
              <div>
                <p className="font-semibold mb-1">Why Tier 1?</p>
                <p className="mb-2">
                  These structures cause <strong>life-threatening</strong> complications if dose 
                  limits are exceeded. Constraints are <em>inviolable</em> in treatment planning.
                </p>
                <ul className="text-xs space-y-1 list-disc list-inside">
                  <li><strong>Carotid:</strong> Rupture → exsanguination, death</li>
                  <li><strong>Brainstem:</strong> Necrosis → coma, respiratory arrest</li>
                  <li><strong>Spinal cord:</strong> Myelopathy → paralysis, death</li>
                </ul>
                <p className="text-xs mt-2 italic">
                  If Tier 1 constraints cannot be met, consider alternative strategies or palliation.
                </p>
              </div>
            } />
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {OAR_CONSTRAINTS.filter(oar => oar.tier === 1).map(oar => (
              <label
                key={oar.name}
                className="flex items-start p-3 border border-red-200 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={patientData.selectedOARs?.includes(oar.name) || false}
                  onChange={() => handleOARToggle(oar.name)}
                  className="mt-1 h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <div className="ml-3 flex-1">
                  <span className="block text-sm font-medium text-gray-900">{oar.name}</span>
                  <span className="block text-xs text-gray-600">{oar.complication}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Tier 2: Critical */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-orange-700 mb-3 flex items-center">
            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded mr-2">TIER 2</span>
            Critical Toxicities
            <Tooltip content={
              <div>
                <p className="font-semibold mb-1">Why Tier 2?</p>
                <p className="mb-2">
                  These cause <strong>severe, function-limiting</strong> complications but are not 
                  immediately life-threatening. Should be met whenever possible.
                </p>
                <ul className="text-xs space-y-1 list-disc list-inside">
                  <li><strong>Optic structures:</strong> Irreversible blindness</li>
                  <li><strong>Mandible:</strong> Osteoradionecrosis requiring surgery</li>
                  <li><strong>Brachial plexus:</strong> Arm paralysis and pain</li>
                </ul>
                <p className="text-xs mt-2 italic">
                  May occasionally compromise if necessary for tumor coverage, but requires careful 
                  patient counseling and informed consent.
                </p>
              </div>
            } />
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {OAR_CONSTRAINTS.filter(oar => oar.tier === 2).map(oar => (
              <label
                key={oar.name}
                className="flex items-start p-3 border border-orange-200 rounded-lg hover:bg-orange-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={patientData.selectedOARs?.includes(oar.name) || false}
                  onChange={() => handleOARToggle(oar.name)}
                  className="mt-1 h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <div className="ml-3 flex-1">
                  <span className="block text-sm font-medium text-gray-900">{oar.name}</span>
                  <span className="block text-xs text-gray-600">{oar.complication}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Tier 3: Quality of Life */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-blue-700 mb-3 flex items-center">
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">TIER 3</span>
            Quality of Life Toxicities
            <Tooltip content={
              <div>
                <p className="font-semibold mb-1">Why Tier 3?</p>
                <p className="mb-2">
                  These significantly impact <strong>quality of life and function</strong> but are 
                  not life-threatening. Often must be balanced against tumor control.
                </p>
                <ul className="text-xs space-y-1 list-disc list-inside">
                  <li><strong>Larynx:</strong> Voice loss, chronic hoarseness</li>
                  <li><strong>Esophagus:</strong> Swallowing difficulty, strictures</li>
                  <li><strong>Parotids:</strong> Dry mouth, dental problems</li>
                </ul>
                <p className="text-xs mt-2 italic">
                  May be exceeded if required for adequate tumor coverage. Patients should understand 
                  the risk-benefit trade-off before treatment.
                </p>
              </div>
            } />
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {OAR_CONSTRAINTS.filter(oar => oar.tier === 3).map(oar => (
              <label
                key={oar.name}
                className="flex items-start p-3 border border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={patientData.selectedOARs?.includes(oar.name) || false}
                  onChange={() => handleOARToggle(oar.name)}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="ml-3 flex-1">
                  <span className="block text-sm font-medium text-gray-900">{oar.name}</span>
                  <span className="block text-xs text-gray-600">{oar.complication}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6">
        <button
          onClick={onCalculate}
          disabled={!isFormValid()}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Calculate Assessment
        </button>
        <button
          onClick={onReset}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>
      </div>

      {!isFormValid() && (
        <p className="text-sm text-red-600 text-center">
          * Please fill in all required fields and select at least one organ at risk
        </p>
      )}
    </div>
  );
}
