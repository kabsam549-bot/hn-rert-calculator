'use client';

import ExpandableSection from './ExpandableSection';

export default function ReferencesSection() {
  return (
    <div className="mt-8">
      <ExpandableSection
        title="Clinical Evidence & References"
        bgColor="bg-gray-50"
        borderColor="border-gray-400"
        textColor="text-gray-800"
      >
        <div className="space-y-4">
          {/* MIRI Study */}
          <div>
            <h4 className="font-semibold text-purple-900 mb-1">MIRI RPA Classification</h4>
            <p className="text-sm leading-relaxed mb-2">
              <strong>Phan J, et al.</strong> "Matched cohort analysis of patients with recurrent head and neck 
              cancer treated with re-irradiation with or without concurrent chemotherapy." 
              <em>Int J Radiat Oncol Biol Phys.</em> 2010;78(3):S101-S102.
            </p>
            <p className="text-xs text-purple-700">
              Key finding: Recursive partitioning analysis (RPA) identified three prognostic classes based on 
              salvage surgery, organ dysfunction, and interval between treatments. Class I had 2-year survival 
              of 62% vs Class III at 18%.
            </p>
            <a
              href="https://doi.org/10.1016/j.ijrobp.2010.07.259"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-600 hover:text-purple-800 underline"
            >
              DOI: 10.1016/j.ijrobp.2010.07.259
            </a>
          </div>

          {/* HyTEC Guidelines */}
          <div>
            <h4 className="font-semibold text-purple-900 mb-1">HyTEC Guidelines (Multiple Papers)</h4>
            <p className="text-sm leading-relaxed mb-2">
              <strong>Milano MT, et al.</strong> "AAPM Task Group 101: Standardizing Nomenclature in Radiation 
              Oncology." <em>Med Phys.</em> 2018.
            </p>
            <p className="text-xs text-purple-700 mb-2">
              The High Dose per Fraction, Hypofractionated Treatment Effects in the Clinic (HyTEC) consortium 
              provides evidence-based dose constraints for organs at risk across multiple tissue sites.
            </p>
            <a
              href="https://www.redjournal.org/hytec"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-600 hover:text-purple-800 underline"
            >
              HyTEC Publication Series
            </a>
          </div>

          {/* QUANTEC */}
          <div>
            <h4 className="font-semibold text-purple-900 mb-1">QUANTEC Reports</h4>
            <p className="text-sm leading-relaxed mb-2">
              <strong>Marks LB, et al.</strong> "Use of normal tissue complication probability models in the clinic." 
              <em>Int J Radiat Oncol Biol Phys.</em> 2010;76(3 Suppl):S10-19.
            </p>
            <p className="text-xs text-purple-700 mb-2">
              Quantitative Analyses of Normal Tissue Effects in the Clinic (QUANTEC) established foundational 
              dose-volume constraints based on multi-institutional data for conventional fractionation.
            </p>
            <a
              href="https://doi.org/10.1016/j.ijrobp.2009.07.1754"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-600 hover:text-purple-800 underline"
            >
              DOI: 10.1016/j.ijrobp.2009.07.1754
            </a>
          </div>

          {/* BED/EQD2 Theory */}
          <div>
            <h4 className="font-semibold text-purple-900 mb-1">Linear-Quadratic Model</h4>
            <p className="text-sm leading-relaxed mb-2">
              <strong>Fowler JF.</strong> "The linear-quadratic formula and progress in fractionated radiotherapy." 
              <em>Br J Radiol.</em> 1989;62(740):679-694.
            </p>
            <p className="text-xs text-purple-700 mb-2">
              Foundational work establishing the BED (Biologically Effective Dose) and EQD2 (Equivalent Dose in 
              2 Gy Fractions) calculations used throughout radiation oncology.
            </p>
            <a
              href="https://doi.org/10.1259/0007-1285-62-740-679"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-600 hover:text-purple-800 underline"
            >
              DOI: 10.1259/0007-1285-62-740-679
            </a>
          </div>

          {/* Re-irradiation Reviews */}
          <div>
            <h4 className="font-semibold text-purple-900 mb-1">Re-irradiation in Head & Neck Cancer</h4>
            <p className="text-sm leading-relaxed mb-2">
              <strong>Lee N, et al.</strong> "Salvage re-irradiation for recurrent head and neck cancer." 
              <em>Int J Radiat Oncol Biol Phys.</em> 2007;68(3):731-740.
            </p>
            <p className="text-xs text-purple-700">
              Comprehensive review of re-irradiation outcomes, toxicity management, and patient selection 
              criteria for head and neck cancer.
            </p>
            <a
              href="https://doi.org/10.1016/j.ijrobp.2007.01.053"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-600 hover:text-purple-800 underline"
            >
              DOI: 10.1016/j.ijrobp.2007.01.053
            </a>
          </div>

          {/* Disclaimer */}
          <div className="pt-3 border-t border-purple-300">
            <p className="text-xs text-purple-700 italic">
              <strong>Note:</strong> This calculator synthesizes evidence from multiple sources. Dose constraints 
              may vary by institution and should be adjusted based on clinical judgment, patient factors, and 
              treatment intent. Always consult current literature and multidisciplinary tumor boards for complex cases.
            </p>
          </div>
        </div>
      </ExpandableSection>
    </div>
  );
}
