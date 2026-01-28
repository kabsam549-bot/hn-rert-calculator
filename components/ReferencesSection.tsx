'use client';

export default function ReferencesSection() {
  return (
    <div className="mt-8 border-t border-divider pt-6">
      <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Evidence Base</h5>
      
      <div className="space-y-4 text-xs text-gray-600">
        <div>
          <p className="font-medium text-primary mb-1">MIRI Protocol & RPA Classification</p>
          <p>
            Phan J, Spiotto MT, Goodman CD, et al. Reirradiation for Locally Recurrent Head and Neck Cancer: State-of-the-Art and Future Directions. 
            <em className="text-secondary"> Semin Radiat Oncol.</em> 2025.
            <a href="https://doi.org/10.1016/j.semradonc.2025.01.001" target="_blank" rel="noopener noreferrer" className="ml-1 text-teal-600 hover:underline">[DOI]</a>
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
