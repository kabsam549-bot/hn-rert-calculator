# Head & Neck Reirradiation App - Feedback Tasks
**From meeting:** Ramez Kouzy, Jack Phan, Ana Lawless  
**Date:** Feb 7, 2026

---

## 🎯 NAVIGATION & STRUCTURE

### Landing Page Redesign
- [ ] **Two-button fork:** "MDACC Pathway (RadOnc/Treatment Planning)" vs "General Salvage Decision-Making"
- [ ] MDACC pathway = current 4-step technical evaluation (for radiation oncologists)
- [ ] General pathway = multidisciplinary (for surgeons, med onc, referring physicians)

### General Pathway Flow (New)
- [ ] Step 1: Prior treatment history (radiation + surgical + systemic as one group)
- [ ] Step 2: Planned interventions (surgery, reirradiation, systemic/IO)
- [ ] Step 3: Clinical factors
- [ ] Step 4: Organ evaluation
- [ ] Output: MIRI calculator-style RPA class with PFS/OS/survival data
- [ ] Remove dosimetric details from this pathway (move to MDACC pathway only)

---

## 🔬 CLINICAL PARAMETERS

### Add New Fields
- [ ] **Disease-free interval (DFI):** Critical prognostic factor (literature: <2yr = poor prognosis)
  - Located in: Prior radiation history section
  - Reference: Zafereo laryngectomy paper, MIRI data
- [ ] **Flap reconstruction status:** Yes/No (when salvage surgery selected)
  - Major impact on toxicity outcomes
- [ ] **Recurrence vs second primary:** Clarify if within high-dose field, marginal, or distant
- [ ] **Baseline organ dysfunction:** Pre-treatment PEG dependence, fibrosis grade, ORN status
  - Add to organ evaluation section
  - Note: Helps contextualize post-treatment toxicity

### Histology Updates
- [ ] **Separate melanoma/sarcoma** from other non-squamous (they "bottom out" - very poor outcomes)
- [ ] **Group nasopharynx with squamous** for mucosal carcinomas
  - Exception: adenoid cystic/salivary gland in nasopharynx = different category
- [ ] Rename "post-op" → **"Salvage post-op"** (clearer terminology)
- [ ] Add hover/info icon explaining salvage surgery (first vs second surgery, with/without flap)

---

## 📊 TUMOR VOLUME THRESHOLDS

### GTV Volume Risk Stratification
Current thresholds need adjustment:
- [ ] **<15cc = Favorable**
- [ ] **15-25cc = Acceptable** 
- [ ] **25-50cc = Moderately Elevated**
- [ ] **>50cc = High Risk**

Rationale: Large tumors (>50-60cc) may warrant induction chemo to reduce volume before RT.

### Terminology Fix
- [ ] Change "CTV" and "GTV" → **"Plan Target Volume (PTV)"**
- [ ] Add info icon linking to references/guidelines for PTV definition

---

## ⚡ DOSE CALCULATIONS & EQD2

### EQD2 Calculator Integration (Critical Feature)
- [ ] **For each organ:** Calculate EQD2 from prior dose + fractionation
- [ ] **Show "room left":** Max tolerable dose - (current EQD2 adjusted for recovery)
- [ ] **Tissue recovery adjustment:**
  - 6 months: subtract 25% from prior EQD2
  - 12+ months: subtract 50% from prior EQD2
- [ ] **Input fields:** Prior dose, fractionation, reirradiation fractionation (2/3/4/5fx)
- [ ] **Example (Brachial Plexus):**
  - Max tolerable: 66 Gy EQD2 (120 BED) → <5% plexopathy
  - High risk: >150 BED → 10% plexopathy
  - If prior 50Gy/33fx = 87.9 EQD2, 2 years out → 50% recovery → 44 EQD2 remaining room
  - Constraint: keep plexus <22 Gy in 5fx to stay under cumulative limit

### Organ Constraints
- [ ] **Pull from Jack's planning directives:** Iris stereoJP 3fx and 5fx working copies
- [ ] Integrate constraints for:
  - Brainstem (Dmax 13 Gy/3fx, 18 Gy/5fx)
  - Brachial plexus (<22 Gy/5fx)
  - Carotid artery
  - Constrictors
  - Spinal cord
  - Temporal lobe
  - **Lingual arteries** (new - use same constraints as carotid until NTCP data available)
- [ ] Add disclaimer/info icon: "Constraints are institution-specific; consult your physicist"

### TCP Adjustments
- [ ] **Gross disease vs post-op dosing:**
  - Gross disease: 36 Gy/4fx for control
  - Post-op: 32 Gy/4fx for control
- [ ] TCP calculation should adjust based on disease status selection
- [ ] Add disclaimer: "TCP estimates are general; NTCP provides site-specific toxicity predictions"

---

## 🩸 BLEEDING RISK & IR REFERRAL

### Automated IR Recommendations
- [ ] **If bleeding risk >5%:** Display recommendation for IR consult (coiling/stenting)
- [ ] **High-risk locations automatically trigger >5%:**
  - Petrous ICA (nasopharynx cases)
  - Cervical ICA
  - Proximity of high-dose region to these vessels

### Anatomical Diagrams (Generate Custom)
- [ ] **Nasopharynx:** Petrous ICA (at the kink), clival ORN, soft tissue necrosis
- [ ] **Oropharynx:** Lingual artery, ascending pharyngeal (thin tonsillar wall)
- [ ] **Neck:** ICA, CCA, facial artery branches (submandibular region)
- [ ] Use AI generator to create original anatomy diagrams (don't use web images)
- [ ] Add diagrams to Guidelines section with references to Jack's slide deck

---

## 📈 DATA INTEGRATION

### Ana Lawless 27Gy/3fx SBRT Data
- [ ] **Add abstract data** once available (mucosal sites, lower-dose SBRT)
- [ ] **Key variables to capture:**
  - Pre-existing toxicity (PEG dependence, fibrosis grade, ORN)
  - New toxicity (bleeding, ORN, fibrosis)
  - Baseline organ dysfunction
  - Recurrent vs second primary
  - Overlap location (within high-dose field, marginal, distant)
- [ ] **Toxicity granularity challenge:** Note difficulty grading when baseline dysfunction exists
  - Example: PEG from surgery vs radiation, timing of reinsertion
- [ ] Add Ana to project collaboration (awaiting abstract completion)

### Historic & Comparative Data (Guidelines Section)
- [ ] **Table:** Outcomes by treatment era
  - Supportive care only
  - First-line chemo
  - Keynote (immunotherapy)
  - Pre-IMRT reirradiation (3D era, RTOG0421)
  - IMRT era (Anderson 226 patients, 50% had surgery)
  - Proton era
- [ ] **Dose stratification by sub-site** (reference Kevin Diao's paper)
- [ ] **Anderson IMRT/Proton data:**
  - 226 IMRT patients, half with surgery
  - Recurrence site: mucosal vs skull base
  - Non-squam vs squam outcomes
  - Chemo response impact

### Outcomes by Site (Verify with Jack)
- [ ] **Skull base:** Best outcomes (11% grade 3 toxicity)
- [ ] **Paranasal sinus:** Second best
- [ ] **Neck:** Worse (but surgery + flap changes outcomes dramatically)
- [ ] **Larynx/Oral cavity:** Similar (worse than skull base/sinus)
- [ ] **Nasopharynx:** Better local control than larynx/oral, but high toxicity

---

## 💊 SYSTEMIC THERAPY RECOMMENDATIONS

- [ ] **If combined regional + distant metastasis risk >20%:** Consider maintenance systemic therapy
- [ ] **If >30-40%:** Recommend systemic therapy
- [ ] Add this logic to treatment recommendations output

---

## 🎨 UI/UX IMPROVEMENTS

### Navigation & Interactivity
- [ ] **Add BACK button:** Allow users to change one parameter without refreshing entire workflow
- [ ] **Hover/info icons:**
  - Explain "salvage post-op" (first vs second surgery, flap status)
  - PTV definition
  - Organ-specific constraints
  - Bleeding risk thresholds
- [ ] **Link volume threshold references** to Guidelines section (not inline in TCP)

### Data Presentation
- [ ] **Remove dosimetric clutter from TCP section:** Move to MDACC pathway only
- [ ] **MIRI calculator output:** Confirm format matches old RPA class display
- [ ] **Make references clickable:** Link all citations to PubMed/journal

---

## ✅ DATA VALIDATION

### Jack to Review
- [ ] **Generate all possible input combinations** and their predicted outcomes
- [ ] **Verify TCP outcomes** are driven primarily by recurrence location (not histology/volume in current model)
- [ ] **Confirm melanoma/sarcoma data** shows significantly worse outcomes (justifies separate category)
- [ ] **Review gross disease vs post-op dosing differences** in TCP calculations
- [ ] **Validate neck + surgery outcomes** show dramatic improvement vs no surgery

---

## 🔮 FUTURE FEATURES (Not Immediate)

- [ ] **Forum for complex cases:** Experts can log in and provide advice
- [ ] **About section:** Jack's CV, biosketch, publications
- [ ] **Personal website for Jack:** Separate project after this tool is complete
- [ ] **Track talks/presentations:** Auto-populate faculty appraisal/NIH biosketch data

---

## 🚧 UNCLEAR / NEEDS CLARIFICATION

These items were discussed but need more detail:

1. **Recurrence location granularity:** How to capture "within high-dose field" vs "marginal" vs "distant overlap"?
   - Ana noted this affects whether it's truly "reirradiation" or more like de novo treatment
   - → **Escalate to Opus:** Design UI for this distinction

2. **Pre-existing toxicity capture:** How to display baseline dysfunction in NTCP predictions?
   - Example: Patient already has PEG from surgery, then gets ORN from reirradiation
   - → **Escalate to Opus:** Design toxicity attribution framework

3. **Lingual artery contouring:** Jack contours them, but no established dose constraints yet
   - Using carotid constraints as placeholder until NTCP data available
   - → **Note for future update** when Ana's data is published

---

## 📋 SUMMARY STATS

- **Navigation:** 2 major items (two-pathway split)
- **Clinical parameters:** 8 new fields/updates
- **Dosimetry:** 15+ tasks (EQD2 calculator, constraints, TCP adjustments)
- **Bleeding risk:** 5 tasks (IR logic + anatomical diagrams)
- **Data integration:** 10+ tasks (Ana's data + historic references)
- **UI/UX:** 6 improvements
- **Validation:** 5 review items for Jack
- **Unclear:** 3 items need Opus judgment

**Total actionable tasks:** ~50+  
**Blockers:** Ana's abstract data (timeline TBD), Jack's validation of all outcomes

---

## 🎯 NEXT STEPS (Recommended Order)

1. **UI Quick Wins:**
   - Add back button
   - Rename "post-op" → "salvage post-op"
   - Change CTV → PTV
   - Add info icons

2. **Critical Clinical Fields:**
   - Disease-free interval
   - Flap reconstruction status
   - Separate melanoma/sarcoma

3. **GTV Volume Thresholds:**
   - Update to 4-tier system (<15/15-25/25-50/>50)

4. **EQD2 Calculator (Big Lift):**
   - Pull Jack's planning directives
   - Build organ-by-organ calculator
   - Integrate tissue recovery logic
   - Show "room left" for each organ

5. **Bleeding Risk Logic:**
   - Add IR referral trigger (>5%)
   - Generate anatomical diagrams

6. **General Pathway (New Flow):**
   - Build multidisciplinary decision tree
   - MIRI calculator-style output
   - Remove dosimetry from this path

7. **Data Validation:**
   - Generate all outcome combinations
   - Send to Jack for review

8. **Ana's Data Integration:**
   - Wait for abstract
   - Add 27Gy/3fx outcomes
   - Refine toxicity capture

---

**Last updated:** Feb 8, 2026  
**Meeting attendees:** Ramez Kouzy, Jack Phan, Ana Lawless  
**Website:** [beta URL from meeting]
