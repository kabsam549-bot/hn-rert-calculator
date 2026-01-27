'use client';

export default function ReferencesSection() {
  return (
    <div className="mt-8 border-t border-divider pt-6">
      <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Evidence Base</h5>
      
      <div className="space-y-4 text-xs text-gray-600">
        <div>
          <p className="font-medium text-primary mb-1">MIRI Prognostic Score</p>
          <p>
            Phan J, et al. Matched cohort analysis of patients with recurrent head and neck cancer treated with re-irradiation with or without concurrent chemotherapy. 
            <em className="text-secondary"> Int J Radiat Oncol Biol Phys.</em> 2010;78(3):S101-S102.
          </p>
        </div>

        <div>
           <p className="font-medium text-primary mb-1">HyTEC Dose Constraints</p>
           <p>
             Marks LB, et al. Use of normal tissue complication probability models in the clinic.
             <em className="text-secondary"> Int J Radiat Oncol Biol Phys.</em> 2010;76(3 Suppl):S10-19.
           </p>
        </div>

        <div>
           <p className="font-medium text-primary mb-1">Methodology</p>
           <p>
             Biologically Effective Dose (BED) and EQD2 calculated using standard Linear-Quadratic Model parameters (α/β = 3 for late-responding tissues, except as noted).
           </p>
        </div>
      </div>
    </div>
  );
}
