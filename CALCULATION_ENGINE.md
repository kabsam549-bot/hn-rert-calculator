# H&N Re-RT Calculator - Core Calculation Engine

## ✅ Implementation Complete

This document describes the core calculation engine built for Phase 2 & 3 of the H&N Re-RT Calculator project.

## Modules Created

### 1. BED/EQD2 Calculations (`lib/bedCalculations.ts`)

Implements the Linear-Quadratic (LQ) model for radiation biology calculations.

**Key Functions:**

- `calculateBED(totalDose, fractions, alphaBeta)` - Calculates Biologically Effective Dose
- `calculateEQD2(bed, alphaBeta)` - Converts BED to Equivalent Dose in 2 Gy fractions
- `calculateBEDAndEQD2(totalDose, fractions, alphaBeta)` - Combined convenience function
- `calculateCumulativeDose(...)` - Calculates cumulative BED/EQD2 from prior + planned RT
- `getDosePerFraction(totalDose, fractions)` - Helper for dose per fraction

**Constants:**
- `ALPHA_BETA_RATIOS` - Standard α/β values for different tissues
  - `TUMOR_EARLY: 10` - Tumors and early-responding tissues
  - `CNS_LATE: 2` - CNS structures (brain, spinal cord, optic)
  - `LATE_GENERAL: 3` - General late-responding tissues
  - `LARYNX_PHARYNX: 3`
  - `SALIVARY: 3`

**Validation:**
- All inputs validated (positive doses, integer fractions, valid α/β ratios)
- Comprehensive error messages
- Medical accuracy verified against LQ model

**Example:**
```typescript
import { calculateCumulativeDose } from './lib/bedCalculations';

const result = calculateCumulativeDose(
  70,  // prior dose (Gy)
  35,  // prior fractions
  40,  // planned dose (Gy)
  5,   // planned fractions
  10   // α/β ratio
);

console.log(`Cumulative EQD2: ${result.cumulativeEQD2.toFixed(1)} Gy`);
// Output: Cumulative EQD2: 130.0 Gy
```

---

### 2. OAR Constraint System (`lib/oarConstraints.ts`)

Comprehensive organ-at-risk dose constraint checking system based on MIRI study and HyTEC guidelines.

**OAR Database:** 13 critical structures organized in 3 tiers

**Tier 1 - Life-threatening:**
- Spinal cord (50 Gy) - Myelopathy
- Brainstem (54 Gy) - Necrosis
- Optic chiasm (50 Gy) - Blindness
- Optic nerves (55 Gy) - Blindness

**Tier 2 - Critical:**
- Carotid vessels (120 Gy) - Carotid blowout
- Temporal lobe (60 Gy) - Necrosis
- Mandible (70 Gy) - Osteoradionecrosis
- Brachial plexus (60 Gy) - Plexopathy

**Tier 3 - Quality of Life:**
- Pharyngeal constrictors (55 Gy) - Dysphagia
- Cranial nerves (60 Gy) - Neuropathy
- Parotid gland (26 Gy) - Xerostomia
- Larynx (50 Gy) - Voice changes
- Esophagus (55 Gy) - Stricture

**Key Functions:**

- `checkOARConstraint(oar, priorDose, priorFractions, plannedDose, plannedFractions, intervalMonths)` - Check single OAR
- `checkAllOARConstraints(...)` - Evaluate all OARs at once
- `getOARConstraint(name)` - Retrieve OAR by name
- `getOARsByTier(tier)` - Get all OARs in a tier
- `determineWarningLevel(percentOfLimit)` - Classify dose level
- `getOARSummary(results)` - Summary statistics

**Warning Levels:**
- 🟢 **SAFE** (<80% of limit) - Within acceptable range
- 🟡 **CAUTION** (80-100% of limit) - Approaching threshold
- 🔴 **EXCEEDS** (>100% of limit) - Significantly elevated risk

**Example:**
```typescript
import { checkOARConstraint, getOARConstraint } from './lib/oarConstraints';

const spinalCord = getOARConstraint('Spinal cord');
const result = checkOARConstraint(
  spinalCord,
  50,  // prior dose
  25,  // prior fractions
  20,  // planned dose
  10,  // planned fractions
  12   // interval in months
);

console.log(result.message);
// ⚠️ EXCEEDS LIMIT: Spinal cord dose of 70.0 Gy exceeds the 50 Gy 
// constraint by 40%. Risk of Myelopathy is significantly elevated. [LIFE-THREATENING]

console.log(`Warning level: ${result.warningLevel}`);
// Output: exceeds

console.log(`Prior: ${result.doseBreakdown.priorEQD2.toFixed(1)} Gy`);
console.log(`Planned: ${result.doseBreakdown.plannedEQD2.toFixed(1)} Gy`);
console.log(`Cumulative: ${result.doseBreakdown.cumulativeEQD2.toFixed(1)} Gy`);
```

---

### 3. MIRI RPA Classification (`lib/rpaClassification.ts`)

Recursive Partitioning Analysis model from Phan et al. (2010) for prognostic stratification.

**Classification System:**

**Class I (Best Prognosis)**
- Criteria: ≥2 years interval + salvage surgery
- 2-year survival: 61.9%
- Median survival: 28 months

**Class II (Intermediate)**
- Criteria: (≥2 years unresected) OR (<2 years without dysfunction)
- 2-year survival: 40.0%
- Median survival: 16 months

**Class III (Poor Prognosis)**
- Criteria: <2 years interval + organ dysfunction
- 2-year survival: 16.8%
- Median survival: 9 months

**Key Functions:**

- `classifyRPA(inputs)` - Classify patient into RPA class
- `validateRPAInputs(inputs)` - Validate inputs with warnings
- `getRecommendationsByClass(class)` - Get class-specific recommendations
- `monthsToYears(months)` - Convert time units
- `yearsToMonths(years)` - Convert time units

**Example:**
```typescript
import { classifyRPA, getRecommendationsByClass } from './lib/rpaClassification';

const result = classifyRPA({
  reirradiationIntervalYears: 2.5,
  hadSalvageSurgery: true,
  hasOrganDysfunction: false
});

console.log(`RPA Class: ${result.class}`);
// Output: RPA Class: I

console.log(`2-year survival: ${result.survivalEstimate2Year}%`);
// Output: 2-year survival: 61.9%

console.log(result.interpretation);
// Detailed interpretation with clinical context

const recommendations = getRecommendationsByClass(result.class);
recommendations.forEach(rec => console.log(`- ${rec}`));
// - Patient is in favorable prognostic group - re-irradiation reasonable to pursue
// - Use modern highly conformal techniques (IMRT, VMAT, or proton therapy)
// - Maintain strict OAR dose constraints per HyTEC guidelines
// ...
```

---

### 4. Comprehensive Test Suite (`lib/__tests__/calculations.test.ts`)

**Test Coverage:** 43 unit tests, 100% pass rate

**Test Categories:**
- BED Calculations (6 tests)
- EQD2 Calculations (3 tests)
- Combined BED/EQD2 (2 tests)
- Cumulative Dose Calculations (3 tests)
- OAR Constraint Database (4 tests)
- Warning Level Determination (3 tests)
- OAR Constraint Checking (5 tests)
- Check All OAR Constraints (2 tests)
- RPA Classification (8 tests)
- RPA Input Validation (3 tests)
- RPA Recommendations (2 tests)
- Time Conversion Helpers (2 tests)

**Running Tests:**
```bash
npm test                 # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage report
```

**Test Results:**
```
Test Suites: 1 passed, 1 total
Tests:       43 passed, 43 total
Time:        0.294 s
```

---

## Implementation Details

### Medical Accuracy

All calculations follow established standards:
- **LQ Model:** Fowler JF. Linear-quadratic formula
- **MIRI Study:** Phan et al. (2010) - Multi-institutional data
- **HyTEC Guidelines:** Re-irradiation dose constraints
- **QUANTEC:** Organ dose-volume relationships

### Type Safety

- Full TypeScript strict mode compliance
- Comprehensive interfaces for all data structures
- Type exports for external use
- Runtime validation for all inputs

### Error Handling

- Descriptive error messages for invalid inputs
- Range validation (positive doses, valid fractions)
- Medical plausibility checks (e.g., interval <50 years)
- Helpful warnings for edge cases

### Documentation

Each module includes:
- Function-level JSDoc comments
- Formula documentation with references
- Clinical context and interpretation
- Usage examples
- Parameter descriptions

---

## Usage in Application

### Basic Import Pattern

```typescript
// Import from barrel file
import {
  calculateCumulativeDose,
  checkAllOARConstraints,
  classifyRPA,
  type OARResult,
  type RPAResult
} from './lib';

// Or import from specific modules
import { calculateBED } from './lib/bedCalculations';
import { checkOARConstraint } from './lib/oarConstraints';
import { classifyRPA } from './lib/rpaClassification';
```

### Complete Workflow Example

```typescript
import {
  calculateCumulativeDose,
  checkAllOARConstraints,
  classifyRPA,
  getOARSummary
} from './lib';

// Step 1: Calculate cumulative doses for tumor
const tumorDoses = calculateCumulativeDose(
  70, 35,  // Prior: 70 Gy in 35 fx
  50, 25,  // Planned: 50 Gy in 25 fx
  10       // α/β = 10 for tumor
);

console.log(`Tumor cumulative EQD2: ${tumorDoses.cumulativeEQD2} Gy`);

// Step 2: Check all OAR constraints
const oarResults = checkAllOARConstraints(
  70, 35,  // Prior treatment
  50, 25,  // Planned treatment
  18       // 18 months interval
);

// Step 3: Get summary
const summary = getOARSummary(oarResults);
console.log(`OARs exceeding limits: ${summary.exceeds}`);
console.log(`OARs at caution level: ${summary.caution}`);
console.log(`OARs safe: ${summary.safe}`);

// Step 4: Display critical warnings
oarResults
  .filter(r => r.warningLevel === 'exceeds' && r.oar.tier === 1)
  .forEach(r => console.log(r.message));

// Step 5: RPA classification
const rpaResult = classifyRPA({
  reirradiationIntervalYears: 1.5,
  hadSalvageSurgery: false,
  hasOrganDysfunction: true
});

console.log(`RPA Class: ${rpaResult.class}`);
console.log(`2-year survival: ${rpaResult.survivalEstimate2Year}%`);
console.log(rpaResult.interpretation);
```

---

## Project Structure

```
lib/
├── bedCalculations.ts         # BED/EQD2 formulas
├── oarConstraints.ts          # OAR constraint system
├── rpaClassification.ts       # MIRI RPA classification
├── index.ts                   # Barrel exports
├── calculations.ts            # (Pre-existing risk score)
├── types.ts                   # (Pre-existing types)
├── utils.ts                   # (Pre-existing utilities)
└── __tests__/
    └── calculations.test.ts   # Comprehensive test suite
```

---

## Next Steps (Phase 4 - UI Integration)

The calculation engine is ready for integration into the Next.js UI:

1. **Form Components**
   - Prior RT inputs (dose, fractions)
   - Planned RT inputs
   - Patient characteristics (RPA factors)
   - OAR dose inputs

2. **Results Display**
   - Cumulative dose summary
   - OAR constraint table (color-coded by warning level)
   - RPA classification card
   - Recommendations panel

3. **Visualization**
   - Dose comparison charts
   - Warning level indicators
   - Survival curves by RPA class

4. **Export/Print**
   - PDF report generation
   - Clinical summary format

---

## References

1. Phan J, et al. Retreatment of Head and Neck Cancers With Intensity Modulated Radiation Therapy: Outcomes From a Multi-Institutional Study. Int J Radiat Oncol Biol Phys. 2010.

2. Fowler JF. The linear-quadratic formula and progress in fractionated radiotherapy. Br J Radiol. 1989.

3. Milano MT, et al. Single- and Multi-Fraction Stereotactic Radiosurgery Dose Tolerances of the Optic Pathways. Int J Radiat Oncol Biol Phys. 2011.

4. Marks LB, et al. Use of normal tissue complication probability models in the clinic. Int J Radiat Oncol Biol Phys. 2010.

---

## Summary

✅ **3 core calculation modules** created with full TypeScript support
✅ **43 unit tests** covering all functionality  
✅ **13 OAR constraints** across 3 toxicity tiers
✅ **MIRI RPA classification** with survival estimates
✅ **Comprehensive documentation** with usage examples
✅ **Medical accuracy** validated against published literature
✅ **Production-ready** code with error handling and validation

The core calculation engine is complete and tested. All modules are ready for UI integration.
