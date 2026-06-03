export type ConstraintEvidenceType =
  | 'Cumulative re-irradiation'
  | 'Single-course tolerance'
  | 'Single-course QUANTEC';

export interface ConstraintReference {
  id: string;
  oarNames: string[];
  structure: string;
  limitEQD2: number;
  alphaBeta: number;
  constraint: string;
  metric: string;
  evidenceType: ConstraintEvidenceType;
  sourceLabel: string;
  citation: string;
  url: string;
  note: string;
}

export const VERIFIED_CONSTRAINT_REFERENCES: ConstraintReference[] = [
  {
    id: 'spinal-cord-sahgal-doi-70',
    oarNames: ['Spinal cord'],
    structure: 'Spinal cord',
    limitEQD2: 70,
    alphaBeta: 2,
    constraint: '<=70 Gy EQD2',
    metric: 'Cumulative thecal sac / cord Dmax',
    evidenceType: 'Cumulative re-irradiation',
    sourceLabel: 'Sahgal / Doi 2021',
    citation:
      'Sahgal et al. IJROBP 2012; Doi et al. Strahlenther Onkol. 2021;197:569-574.',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8154818/',
    note:
      'Doi/Nieder 2021 summarizes the Sahgal SBRT re-irradiation recommendation that cumulative thecal sac EQD2 Dmax should not exceed 70 Gy, with updated clinical tolerance data.',
  },
  {
    id: 'brainstem-stiefel-100',
    oarNames: ['Brainstem'],
    structure: 'Brainstem',
    limitEQD2: 100,
    alphaBeta: 2,
    constraint: '<=100 Gy EQD2',
    metric: 'Cumulative Dmax / near-maximum dose',
    evidenceType: 'Cumulative re-irradiation',
    sourceLabel: 'Stiefel 2021',
    citation:
      'Stiefel et al. Clin Transl Radiat Oncol. 2021;27:112-119.',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7890358/',
    note:
      'The Zurich intracranial re-irradiation series reports cumulative EQD2 up to about 100 Gy to brainstem as feasible in selected patients.',
  },
  {
    id: 'optic-apparatus-mayo-55',
    oarNames: ['Optic chiasm', 'Optic nerves'],
    structure: 'Optic chiasm / optic nerves',
    limitEQD2: 55,
    alphaBeta: 2,
    constraint: '<=55 Gy EQD2',
    metric: 'Single-course optic apparatus maximum dose',
    evidenceType: 'Single-course QUANTEC',
    sourceLabel: 'Mayo QUANTEC 2010',
    citation:
      'Mayo et al. Int J Radiat Oncol Biol Phys. 2010;76(3 Suppl):S28-S35.',
    url: 'https://doi.org/10.1016/j.ijrobp.2009.07.1753',
    note:
      'Single-course fractionated RT tolerance support for the optic apparatus; this is not a validated cumulative re-irradiation NTCP threshold.',
  },
  {
    id: 'cochlea-bhandare-45',
    oarNames: ['Cochlea'],
    structure: 'Cochlea',
    limitEQD2: 45,
    alphaBeta: 3,
    constraint: '<=45 Gy mean dose',
    metric: 'Single-course mean cochlear dose',
    evidenceType: 'Single-course QUANTEC',
    sourceLabel: 'Bhandare QUANTEC 2010',
    citation:
      'Bhandare et al. Int J Radiat Oncol Biol Phys. 2010;76(3 Suppl):S50-S57.',
    url: 'https://doi.org/10.1016/j.ijrobp.2009.04.096',
    note:
      'QUANTEC ear/temporal bone review and related head and neck data support avoiding cochlear mean doses in the roughly 45-50 Gy range.',
  },
  {
    id: 'mandible-embring-120',
    oarNames: ['Mandible'],
    structure: 'Mandible / head and neck bone',
    limitEQD2: 120,
    alphaBeta: 3,
    constraint: '<=120 Gy EQD2',
    metric: 'Cumulative high-dose cutoff for osteoradionecrosis',
    evidenceType: 'Cumulative re-irradiation',
    sourceLabel: 'Embring 2021',
    citation:
      'Embring et al. Cancers (Basel). 2021;13(13):3173.',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8269009/',
    note:
      'The head and neck re-irradiation dose accumulation study reports a 119 Gy EQD2 cutoff for bone osteoradionecrosis; the app rounds this to 120 Gy.',
  },
  {
    id: 'temporal-lobe-stiefel-120',
    oarNames: ['Temporal lobe'],
    structure: 'Temporal lobe / brain tissue',
    limitEQD2: 120,
    alphaBeta: 2,
    constraint: '<=120 Gy EQD2',
    metric: 'Cumulative brain tissue dose',
    evidenceType: 'Cumulative re-irradiation',
    sourceLabel: 'Stiefel 2021',
    citation:
      'Stiefel et al. Clin Transl Radiat Oncol. 2021;27:112-119.',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7890358/',
    note:
      'Published cumulative brain tissue tolerance support; used here as brain/temporal-lobe support, with limited head-and-neck-specific temporal lobe NTCP data.',
  },
  {
    id: 'carotid-embring-120',
    oarNames: ['Carotid vessels'],
    structure: 'Carotid vessels',
    limitEQD2: 120,
    alphaBeta: 3,
    constraint: '<=120 Gy EQD2',
    metric: 'Cumulative high-dose cutoff for carotid blowout',
    evidenceType: 'Cumulative re-irradiation',
    sourceLabel: 'Embring 2021',
    citation:
      'Embring et al. Cancers (Basel). 2021;13(13):3173.',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8269009/',
    note:
      'The head and neck re-irradiation dose accumulation study reports a 119 Gy EQD2 carotid blowout cutoff; the app rounds this to 120 Gy.',
  },
  {
    id: 'pharyngeal-constrictors-quantec-50',
    oarNames: ['Pharyngeal constrictors'],
    structure: 'Pharyngeal constrictors',
    limitEQD2: 50,
    alphaBeta: 3,
    constraint: '<=50 Gy mean dose',
    metric: 'Single-course mean pharyngeal constrictor dose',
    evidenceType: 'Single-course QUANTEC',
    sourceLabel: 'Rancati QUANTEC 2010',
    citation:
      'Rancati et al. Int J Radiat Oncol Biol Phys. 2010;76(3 Suppl):S64-S69.',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2833104/',
    note:
      'Single-course QUANTEC-style dysphagia constraint support; this is not a validated cumulative re-irradiation NTCP threshold.',
  },
];

const normalizeOARName = (name: string) => name.trim().toLowerCase();

export function getConstraintReference(
  oarName: string,
  limitEQD2?: number,
  alphaBeta?: number
): ConstraintReference | undefined {
  const normalizedName = normalizeOARName(oarName);
  const reference = VERIFIED_CONSTRAINT_REFERENCES.find((item) =>
    item.oarNames.some((name) => normalizeOARName(name) === normalizedName)
  );

  if (!reference) {
    return undefined;
  }

  if (limitEQD2 !== undefined && reference.limitEQD2 !== limitEQD2) {
    return undefined;
  }

  if (alphaBeta !== undefined && reference.alphaBeta !== alphaBeta) {
    return undefined;
  }

  return reference;
}
