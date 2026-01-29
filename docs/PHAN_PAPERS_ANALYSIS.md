# Phan Re-RT Papers Analysis

## Papers Found

### 1. Bagley + Phan (2020)
**Title:** Highly conformal reirradiation in patients with prior oropharyngeal radiation: Clinical efficacy and toxicity outcomes  
**Journal:** Head Neck. 2020 Nov;42(11):3326-3335  
**PMID:** 32776401  
**DOI:** 10.1002/hed.26384  
**Full Text:** https://pmc.ncbi.nlm.nih.gov/articles/PMC7722120/

**Key Findings:**
- N=69 patients with prior oropharyngeal RT
- 2-year LC: 77%
- 2-year PFS: 35%
- 2-year OS: 51%
- G3+ late toxicity: 46%
- Feeding tube: 41%
- Techniques: IMRT, SBRT, Proton

---

### 2. Diao + Phan (2021)
**Title:** Stereotactic body ablative radiotherapy for reirradiation of small volume head and neck cancers is associated with prolonged survival  
**Journal:** Head Neck. 2021 Nov;43(11):3331-3344  
**PMID:** 34269492  
**DOI:** 10.1002/hed.26820  
**Full Text:** https://pmc.ncbi.nlm.nih.gov/articles/PMC8511054/

**Key Findings:**
- N=137 patients, SBRT reRT
- Median OS: 44.3 months (impressive!)
- Median SBRT dose: 45 Gy
- Median target volume: 16.9 cc
- 1-year LC: 78%
- 1-year RC: 66%
- 1-year DC: 83%
- Systemic therapy improved regional (p=0.004) and distant control (p=0.04)
- G3+ toxicity higher at mucosal sites (p=0.001) and with concurrent systemic therapy (p=0.02)

---

### 3. Sweet Ping (Ng SP) + Phan - Multiple Papers

**3a. PMID 33381367** - Patient Outcomes after Reirradiation of Small Skull Base Tumors  
- Compared SBRT vs IMRT vs Proton for skull base tumors <60cc
- Median retreatment volume: 28 cc
- Median reRT dose: 66 Gy/33 fx

**3b. PMID 38058404** - Patterns of failure for recurrent HNSCC treated with salvage surgery + post-op IMRT reRT
- N=55 patients, post-op IMRT reRT to ≥60 Gy
- 42% had LRR after reRT
- Lymphatic vs mucosal: 67% salvage vs 33% salvage (p=0.037)
- In-field failures: 44-61% depending on method
- 56% failures near surgical flap

---

### 4. Takiar + Phan (2016)
**Title:** Reirradiation of Head and Neck Cancers With Intensity Modulated Radiation Therapy: Outcomes and Analyses  
**Journal:** Int J Radiat Oncol Biol Phys. 2016 Jul;95(4):1117-31  
**PMID:** 27354127  
**DOI:** 10.1016/j.ijrobp.2016.03.015

**Key Findings:**
- N=227 patients (206 curative intent), 15-year experience
- HNSCC 5-year outcomes:
  - LRC: 53%
  - PFS: 22%
  - OS: 32%
- Non-HNSCC 5-year outcomes:
  - LRC: 74%
  - PFS: 59%
  - OS: 79%
- G3+ toxicity: 32% at 2y, 48% at 5y
- **Toxicity predictors:**
  - Volume >50 cc associated with increased G3+ toxicity
  - Concurrent chemo associated with increased toxicity
- **Tumor control predictors:**
  - Concurrent chemo improved control
  - Retreatment site matters
- **Survival predictors:**
  - Performance status

---

### 5. Phan + Frank
Frank SJ appears as co-author on most of these papers. Key standalone paper:

**PMID 29701557** - Stereotactic radiosurgery for trigeminal pain secondary to recurrent malignant skull base tumors
- Gamma Knife for trigeminal pain palliation
- N=26 patients (2009-2016)

---

### 6. Phan Seminars Review (2025) - **THE KEY PAPER**
**Title:** Reirradiation for Locally Recurrent Head and Neck Cancer: State-of-the-Art and Future Directions  
**Journal:** Semin Radiat Oncol. 2025 Apr;35(2):243-258  
**PMID:** 40090750  
**DOI:** 10.1016/j.semradonc.2025.02.009

**Key Concepts:**
- Focus on balancing **TCP (Tumor Control Probability)** vs **NTCP (Normal Tissue Complication Probability)**
- Reviews modern techniques: IMRT, PBT, SBRT
- Patient selection criteria
- Toxicity/risk management
- Integration with systemic therapy

---

## Key Metrics to Extract for Calculator

### From Takiar/Bagley (TCP):
1. **Volume thresholds:** <50cc favorable, >50cc higher toxicity
2. **Dose-response:** Dose escalation improves TCP but increases NTCP
3. **Time interval:** Longer DFI = better outcomes (RPA already captures this)

### From Diao (SBRT-specific):
1. **Small volume SBRT:** Median 16.9cc, excellent outcomes (44.3mo OS)
2. **SBRT doses:** 40-45 Gy typical

### From Ng SP (Skull base):
1. **Volume threshold:** <60cc for skull base
2. **Modality comparison:** SBRT vs IMRT vs Proton

### NTCP Considerations:
1. **G3+ toxicity predictors:**
   - Volume (critical threshold ~50cc)
   - Concurrent chemo
   - Mucosal sites higher risk than non-mucosal
   - Proximity to carotid (carotid blowout risk)
2. **Specific toxicities:**
   - Dysphagia/odynophagia most common
   - Feeding tube dependence
   - Osteoradionecrosis

---

---

## Site-Specific TCP Stratification

### By Primary Site (from Diao 2021, N=137 SBRT)

| Site | N (%) | 1yr LC | Notes |
|------|-------|--------|-------|
| **Oropharynx** | 37 (27%) | - | 6 lingual artery bleeds (16%) - all OPX! |
| **Larynx** | 18 (13%) | - | SCC only |
| **Skull Base** | 39 (29%) | Higher | Better outcomes, fewer toxicities |
| **Sinonasal** | 19 (14%) | - | Mixed histology |
| **Nasopharynx** | 12 (9%) | - | Often non-SCC (WHO types) |
| **Oral Cavity** | 16 (12%) | - | - |

### By SBRT Treatment Site (from Diao 2021)

| Site | N (%) | G2+ Tox | G3+ Tox | Feeding Tube |
|------|-------|---------|---------|--------------|
| **Mucosa** | 55 (40%) | **49%** | **29%** | **38%** |
| **Neck** | 43 (31%) | 18%* | 6%* | 8%* |
| **Skull Base** | 39 (29%) | 18%* | 6%* | 8%* |

*Combined non-mucosal sites

**Key finding:** Mucosal sites have **5x higher G3+ toxicity** than non-mucosal (29% vs 6%, p=0.001)

### By Histology (from Diao 2021)

| Histology | N (%) | Median OS | 2yr OS | HR (MVA) |
|-----------|-------|-----------|--------|----------|
| **SCC** | 98 (72%) | 32.2 mo | 56% | **4.20** (p=0.01) |
| **Non-SCC** | 39 (28%) | NR | Higher | Ref |

Non-SCC includes: Adenoid cystic (8%), SNUC (4%), NPC (4%), Other (12%)

---

## Skull Base Specific (from Ng SP 2020, N=75)

### By Modality

| Modality | N (%) | Median Vol | Dose | 2yr LC | 2yr OS |
|----------|-------|------------|------|--------|--------|
| **SBRT** | 30 (40%) | - | 45 Gy/5fx | Similar | Similar |
| **IMRT** | 30 (40%) | - | 66 Gy/33fx | Similar | Similar |
| **Proton** | 15 (20%) | - | 66 Gy/33fx | Similar | Similar |

**No difference in OS between modalities** for skull base tumors <60cc

### Skull Base Outcomes
- Median volume: **28 cc**
- Median time to reRT: 41 months
- 1yr/2yr LC: 84% / 75%
- 1yr/2yr OS: 87% / 74%
- **G3+ late tox: only 3% at 1yr, 11% at 2yr** (much lower than mucosal)

---

## Carotid Blowout Risk

### From ISBRTC Survey (Karam/Phan 2017)
- **Quoted risk: 3-20%** in re-irradiation setting
- Highly variable across institutions

### From Diao 2021 (SBRT cohort)
- **6 lingual artery bleeds** out of 137 patients
- **ALL 6 occurred in oropharynx SBRT**
- 5/6 confirmed with angiography or endoscopy
- 4/6 required lingual artery embolization
- Median SBRT dose: 45 Gy (range 40-45)
- Median prior RT dose: 70 Gy
- 5/6 received concurrent chemo

### From Bagley 2020 (Prior OPX cohort)
- 3 oropharyngeal hemorrhages requiring **lingual artery embolization**
- 1 IMRT, 1 PBT, 1 SBRT patient
- Median time to hemorrhage: **8 months** (range 2-9)
- 1 patient required **awake tracheostomy** at 15 months

### Carotid Sparing Techniques (from Bagley)
- Sublingual vessel avoidance structure delineated
- Carotid stenting: 2/69 (3%) pre-reRT
- Carotid endarterectomy: 5/69 (7%) pre-reRT

---

## Volume Thresholds Summary

| Source | Threshold | Significance |
|--------|-----------|--------------|
| Diao SBRT | **>20 cc** | HR 3.09 for worse OS (p=0.001), 1yr LC 61% vs 85% |
| Takiar IMRT | **>50 cc** | Increased G3+ toxicity |
| Ng Skull Base | **<60 cc** | Eligibility criterion for skull base reRT |
| ISBRTC Survey | **25-30 cc** | Common constraint for primary disease |

---

## Next Steps for Calculator Enhancement

### Phase 1: Site & Histology Stratification
1. Add **primary site selection** (OPX, Larynx, Skull Base, Sinonasal, NPC, Oral Cavity)
2. Add **histology selection** (SCC vs Non-SCC subtypes)
3. Display site-specific expected outcomes from literature

### Phase 2: Volume-Based Risk
1. Add **GTV volume input** (cc)
2. Volume risk tiers:
   - <20cc: Favorable (SBRT candidate)
   - 20-50cc: Intermediate
   - >50cc: High risk
3. Volume-adjusted OS/LC estimates

### Phase 3: Modality Selection & Outcomes
1. Add **modality selection** (IMRT vs SBRT vs Proton)
2. SBRT eligibility check:
   - Volume <60cc (preferably <30cc)
   - No skin invasion
   - ReRT interval ≥6 months
3. Modality-specific expected outcomes display

### Phase 4: TCP/NTCP Framework
1. **TCP factors:**
   - Dose (higher = better TCP)
   - Volume (smaller = better TCP)
   - Concurrent systemic therapy (improves regional/distant control)
   - Histology (Non-SCC better than SCC)
2. **NTCP factors:**
   - Site (Mucosal 5x higher tox than non-mucosal)
   - Volume (>20cc = HR 3.09)
   - Concurrent chemo (increases toxicity)
   - Prior dose to carotid

### Phase 5: Carotid Blowout Risk Calculator
1. Add **carotid proximity assessment**
2. Risk factors:
   - Oropharynx site (all 6 bleeds were OPX)
   - Prior high-dose RT (≥70 Gy)
   - Concurrent chemo
3. Recommend carotid evaluation (stent/endarterectomy) if high risk

### Phase 6: Outcome Prediction Display
1. **Expected outcomes by scenario:**
   - Favorable: Small volume skull base, non-SCC → 2yr OS ~74%
   - Intermediate: Moderate volume, SCC, good PS → 2yr OS ~56%
   - Poor: Large volume mucosal SCC → 2yr OS ~30%
2. **Toxicity prediction:**
   - G3+ risk estimate based on site/volume/chemo
   - Feeding tube probability
   - Carotid blowout risk category

---

## References (BibTeX)

```bibtex
@article{bagley2020,
  author = {Bagley, Alexander F and Garden, Adam S and others},
  title = {Highly conformal reirradiation in patients with prior oropharyngeal radiation},
  journal = {Head Neck},
  year = {2020},
  volume = {42},
  pages = {3326-3335},
  pmid = {32776401}
}

@article{diao2021,
  author = {Diao, Kevin and Nguyen, Theresa P and others},
  title = {SBRT for reirradiation of small volume head and neck cancers},
  journal = {Head Neck},
  year = {2021},
  volume = {43},
  pages = {3331-3344},
  pmid = {34269492}
}

@article{takiar2016,
  author = {Takiar, Vinita and Garden, Adam S and others},
  title = {Reirradiation of Head and Neck Cancers With IMRT},
  journal = {Int J Radiat Oncol Biol Phys},
  year = {2016},
  volume = {95},
  pages = {1117-1131},
  pmid = {27354127}
}

@article{phan2025,
  author = {Phan, Jack and others},
  title = {Reirradiation for Locally Recurrent Head and Neck Cancer: State-of-the-Art},
  journal = {Semin Radiat Oncol},
  year = {2025},
  volume = {35},
  pages = {243-258},
  pmid = {40090750}
}
```
