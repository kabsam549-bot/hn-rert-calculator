/**
 * Editable Content Store
 * 
 * This module manages content that can be edited by admins.
 * In production, this could be backed by a database or CMS.
 * For now, we use a JSON file for simplicity.
 */

export interface EditableOARConstraint {
  name: string;
  tier: 1 | 2 | 3;
  limitEQD2: number;
  alphaBeta: number;
  complication: string;
  description: string;
}

export interface EditableDoseRegimen {
  name: string;
  dose: number;
  fractions: number;
  intent: 'curative' | 'palliative' | 'hypofractionated';
  description: string;
}

export interface EditableGuideline {
  id: string;
  title: string;
  content: string;
  category: 'rpa' | 'technical' | 'general';
}

export interface EditableReference {
  id: string;
  citation: string;
  doi?: string;
  category: 'primary' | 'supporting';
}

export interface EditableContent {
  oarConstraints: EditableOARConstraint[];
  doseRegimens: EditableDoseRegimen[];
  guidelines: EditableGuideline[];
  references: EditableReference[];
  lastUpdated: string;
  updatedBy: string;
}

// Default content - matches current implementation
export const defaultContent: EditableContent = {
  oarConstraints: [
    // Tier 1: Life-threatening (CNS: α/β = 2)
    { name: "Spinal cord", tier: 1, limitEQD2: 70, alphaBeta: 2, complication: "Myelopathy", description: "Sahgal HyTEC: cumulative thecal sac EQD2₂ Dmax ≤70 Gy" },
    { name: "Brainstem", tier: 1, limitEQD2: 100, alphaBeta: 2, complication: "Brainstem necrosis", description: "Zurich 2021: <100 Gy₂ safe (Rades 2024 confirms)" },
    { name: "Optic chiasm", tier: 1, limitEQD2: 55, alphaBeta: 2, complication: "Blindness", description: "Single-course QUANTEC 55 Gy; 5 fx limit typically ~25 Gy" },
    { name: "Optic nerves", tier: 1, limitEQD2: 55, alphaBeta: 2, complication: "Blindness", description: "Single-course QUANTEC 55 Gy; 5 fx limit typically ~25 Gy" },
    // Tier 2: Critical
    { name: "Carotid vessels", tier: 2, limitEQD2: 120, alphaBeta: 3, complication: "Carotid blowout", description: "Lindvall 2021: D1cc cutoff 119 Gy (AUC 0.92)" },
    { name: "Temporal lobe", tier: 2, limitEQD2: 120, alphaBeta: 2, complication: "Temporal lobe necrosis", description: "Zurich 2021: brain up to 120 Gy₂ tolerated" },
    { name: "Mandible", tier: 2, limitEQD2: 120, alphaBeta: 3, complication: "Osteoradionecrosis", description: "Lindvall 2021: D1cc cutoff 119 Gy for ORN (AUC 0.74)" },
    { name: "Brachial plexus", tier: 2, limitEQD2: 75, alphaBeta: 3, complication: "Brachial plexopathy", description: "QUANTEC + recovery estimate" },
    // Tier 3: Quality of Life
    { name: "Pharyngeal constrictors", tier: 3, limitEQD2: 50, alphaBeta: 3, complication: "Dysphagia", description: "QUANTEC: Dmean <50 Gy for G2+ dysphagia" },
    { name: "Cranial nerves (IX, X, XI, XII)", tier: 3, limitEQD2: 60, alphaBeta: 3, complication: "Neuropathy", description: "Max dose" },
    { name: "Parotid gland", tier: 3, limitEQD2: 46, alphaBeta: 3, complication: "Xerostomia", description: "QUANTEC cumulative ~46 Gy mean" },
    { name: "Larynx", tier: 3, limitEQD2: 70, alphaBeta: 3, complication: "Voice changes, aspiration, chondronecrosis", description: "Risk of chondronecrosis at high cumulative doses" },
    { name: "Esophagus", tier: 3, limitEQD2: 68, alphaBeta: 3, complication: "Stricture, perforation", description: "QUANTEC + RTOG" },
  ],
  doseRegimens: [
    { name: "Full dose", dose: 66, fractions: 33, intent: "curative", description: "Standard definitive re-RT" },
    { name: "Moderate hypofractionation", dose: 60, fractions: 30, intent: "curative", description: "Commonly used re-RT regimen" },
    { name: "SBRT 40/5", dose: 40, fractions: 5, intent: "hypofractionated", description: "Stereotactic re-RT" },
    { name: "SBRT 32/4", dose: 32, fractions: 4, intent: "hypofractionated", description: "Stereotactic re-RT" },
    { name: "Palliative 27/3", dose: 27, fractions: 3, intent: "palliative", description: "Short course palliative" },
    { name: "Palliative 20/5", dose: 20, fractions: 5, intent: "palliative", description: "Palliative regimen" },
  ],
  guidelines: [
    {
      id: "rpa-class-1",
      title: "RPA Class I Management",
      content: "Favorable prognosis with 61.9% 2-year OS. Full-dose re-RT reasonable with modern techniques.",
      category: "rpa"
    },
    {
      id: "rpa-class-2", 
      title: "RPA Class II Management",
      content: "Intermediate prognosis with 40% 2-year OS. Consider dose de-escalation and MDT discussion.",
      category: "rpa"
    },
    {
      id: "rpa-class-3",
      title: "RPA Class III Management", 
      content: "Poor prognosis with 16.8% 2-year OS. Consider alternatives to re-RT, palliative care consult.",
      category: "rpa"
    },
  ],
  references: [
    {
      id: "phan-2025",
      citation: "Phan J, Spiotto MT, Goodman CD, et al. Reirradiation for Locally Recurrent Head and Neck Cancer: State-of-the-Art and Future Directions. Semin Radiat Oncol. 2025.",
      doi: "10.1016/j.semradonc.2025.01.001",
      category: "primary"
    },
    {
      id: "hytec",
      citation: "Marks LB, et al. Use of normal tissue complication probability models in the clinic. Int J Radiat Oncol Biol Phys. 2010;76(3 Suppl):S10-19.",
      category: "supporting"
    },
  ],
  lastUpdated: new Date().toISOString(),
  updatedBy: "system"
};

// In a real app, this would read/write to a database or file
let currentContent: EditableContent = { ...defaultContent };

export function getContent(): EditableContent {
  return currentContent;
}

export function updateContent(newContent: Partial<EditableContent>, updatedBy: string): EditableContent {
  currentContent = {
    ...currentContent,
    ...newContent,
    lastUpdated: new Date().toISOString(),
    updatedBy
  };
  return currentContent;
}

export function resetContent(): EditableContent {
  currentContent = { ...defaultContent };
  return currentContent;
}
