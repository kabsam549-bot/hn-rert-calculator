/**
 * Unit tests for core calculation modules
 * 
 * Tests cover:
 * 1. BED/EQD2 calculations
 * 2. OAR constraint checking
 * 3. RPA classification
 */

import {
  calculateBED,
  calculateEQD2,
  calculateBEDAndEQD2,
  calculateCumulativeDose,
  getDosePerFraction,
  ALPHA_BETA_RATIOS,
} from '../bedCalculations';

import {
  checkOARConstraint,
  checkAllOARConstraints,
  getOARConstraint,
  getOARsByTier,
  determineWarningLevel,
  getOARSummary,
  OAR_CONSTRAINTS,
} from '../oarConstraints';

import {
  classifyRPA,
  validateRPAInputs,
  getRecommendationsByClass,
  monthsToYears,
  yearsToMonths,
} from '../rpaClassification';

// ============================================================================
// BED/EQD2 CALCULATION TESTS
// ============================================================================

describe('BED Calculations', () => {
  test('calculates BED correctly for standard fractionation', () => {
    // 70 Gy in 35 fractions (2 Gy/fx) with α/β = 10
    // BED = 35 * 2 * (1 + 2/10) = 70 * 1.2 = 84 Gy
    const bed = calculateBED(70, 35, 10);
    expect(bed).toBeCloseTo(84, 1);
  });

  test('calculates BED correctly for hypofractionation', () => {
    // 40 Gy in 5 fractions (8 Gy/fx) with α/β = 10
    // BED = 5 * 8 * (1 + 8/10) = 40 * 1.8 = 72 Gy
    const bed = calculateBED(40, 5, 10);
    expect(bed).toBeCloseTo(72, 1);
  });

  test('calculates BED for late-responding tissue', () => {
    // 50 Gy in 25 fractions with α/β = 2 (spinal cord)
    // BED = 25 * 2 * (1 + 2/2) = 50 * 2 = 100 Gy
    const bed = calculateBED(50, 25, 2);
    expect(bed).toBeCloseTo(100, 1);
  });

  test('throws error for negative dose', () => {
    expect(() => calculateBED(-70, 35, 10)).toThrow('Total dose must be positive');
  });

  test('throws error for non-integer fractions', () => {
    expect(() => calculateBED(70, 35.5, 10)).toThrow('Number of fractions must be a positive integer');
  });

  test('throws error for negative alpha/beta', () => {
    expect(() => calculateBED(70, 35, -10)).toThrow('Alpha/beta ratio must be positive');
  });
});

describe('EQD2 Calculations', () => {
  test('calculates EQD2 correctly from BED', () => {
    // BED = 84 Gy with α/β = 10
    // EQD2 = 84 / (1 + 2/10) = 84 / 1.2 = 70 Gy
    const eqd2 = calculateEQD2(84, 10);
    expect(eqd2).toBeCloseTo(70, 1);
  });

  test('calculates EQD2 for hypofractionated BED', () => {
    // BED = 72 Gy with α/β = 10
    // EQD2 = 72 / 1.2 = 60 Gy
    const eqd2 = calculateEQD2(72, 10);
    expect(eqd2).toBeCloseTo(60, 1);
  });

  test('throws error for negative BED', () => {
    expect(() => calculateEQD2(-84, 10)).toThrow('BED must be positive');
  });
});

describe('Combined BED and EQD2', () => {
  test('calculates both BED and EQD2 together', () => {
    const result = calculateBEDAndEQD2(70, 35, 10);
    expect(result.bed).toBeCloseTo(84, 1);
    expect(result.eqd2).toBeCloseTo(70, 1);
  });

  test('round-trip calculation preserves original dose for standard fractionation', () => {
    // Standard 2 Gy fractions should give EQD2 = original dose
    const result = calculateBEDAndEQD2(60, 30, 10);
    expect(result.eqd2).toBeCloseTo(60, 1);
  });
});

describe('Cumulative Dose Calculations', () => {
  test('calculates cumulative dose from prior and planned RT', () => {
    // Prior: 70 Gy in 35 fx (α/β = 10)
    // Planned: 40 Gy in 5 fx (α/β = 10)
    const result = calculateCumulativeDose(70, 35, 40, 5, 10);
    
    expect(result.priorEQD2).toBeCloseTo(70, 1);
    expect(result.plannedEQD2).toBeCloseTo(60, 1);
    expect(result.cumulativeEQD2).toBeCloseTo(130, 1);
  });

  test('calculates cumulative dose for spinal cord (α/β = 2)', () => {
    // Prior: 50 Gy in 25 fx
    // Planned: 30 Gy in 15 fx
    // α/β = 2 (late-responding tissue)
    const result = calculateCumulativeDose(50, 25, 30, 15, 2);
    
    // Prior BED = 25 * 2 * (1 + 2/2) = 100 Gy
    // Prior EQD2 = 100 / (1 + 2/2) = 50 Gy
    expect(result.priorEQD2).toBeCloseTo(50, 1);
    
    // Planned BED = 15 * 2 * (1 + 2/2) = 60 Gy
    // Planned EQD2 = 60 / 2 = 30 Gy
    expect(result.plannedEQD2).toBeCloseTo(30, 1);
    
    // Cumulative = 50 + 30 = 80 Gy
    expect(result.cumulativeEQD2).toBeCloseTo(80, 1);
  });

  test('throws error for invalid inputs', () => {
    expect(() => calculateCumulativeDose(-70, 35, 40, 5, 10)).toThrow();
    expect(() => calculateCumulativeDose(70, 35, -40, 5, 10)).toThrow();
    expect(() => calculateCumulativeDose(70, 0, 40, 5, 10)).toThrow();
  });
});

describe('Dose Per Fraction Helper', () => {
  test('calculates dose per fraction correctly', () => {
    expect(getDosePerFraction(70, 35)).toBeCloseTo(2, 2);
    expect(getDosePerFraction(40, 5)).toBeCloseTo(8, 2);
  });
});

describe('Alpha/Beta Constants', () => {
  test('provides standard alpha/beta ratios', () => {
    expect(ALPHA_BETA_RATIOS.TUMOR_EARLY).toBe(10);
    expect(ALPHA_BETA_RATIOS.CNS_LATE).toBe(2);
    expect(ALPHA_BETA_RATIOS.LATE_GENERAL).toBe(3);
  });
});

// ============================================================================
// OAR CONSTRAINT TESTS
// ============================================================================

describe('OAR Constraint Database', () => {
  test('has all required Tier 1 structures', () => {
    const tier1 = getOARsByTier(1);
    const tier1Names = tier1.map(oar => oar.name);
    
    expect(tier1Names).toContain('Spinal cord');
    expect(tier1Names).toContain('Brainstem');
    expect(tier1Names).toContain('Optic chiasm');
    expect(tier1Names).toContain('Optic nerves');
  });

  test('has correct constraints for spinal cord', () => {
    const spinalCord = getOARConstraint('Spinal cord');
    
    expect(spinalCord).toBeDefined();
    expect(spinalCord?.limitEQD2).toBe(50);
    expect(spinalCord?.alphaBeta).toBe(2);
    expect(spinalCord?.tier).toBe(1);
  });

  test('has correct constraints for parotid', () => {
    const parotid = getOARConstraint('Parotid gland');
    
    expect(parotid).toBeDefined();
    expect(parotid?.limitEQD2).toBe(26);
    expect(parotid?.alphaBeta).toBe(3);
    expect(parotid?.tier).toBe(3);
  });

  test('retrieves OAR by name case-insensitively', () => {
    expect(getOARConstraint('spinal cord')).toBeDefined();
    expect(getOARConstraint('SPINAL CORD')).toBeDefined();
    expect(getOARConstraint('Spinal Cord')).toBeDefined();
  });
});

describe('Warning Level Determination', () => {
  test('classifies as safe when <80% of limit', () => {
    expect(determineWarningLevel(50)).toBe('safe');
    expect(determineWarningLevel(79.9)).toBe('safe');
  });

  test('classifies as caution when 80-100% of limit', () => {
    expect(determineWarningLevel(80)).toBe('caution');
    expect(determineWarningLevel(90)).toBe('caution');
    expect(determineWarningLevel(100)).toBe('caution');
  });

  test('classifies as exceeds when >100% of limit', () => {
    expect(determineWarningLevel(100.1)).toBe('exceeds');
    expect(determineWarningLevel(150)).toBe('exceeds');
  });
});

describe('OAR Constraint Checking', () => {
  test('flags spinal cord exceeding limit', () => {
    const spinalCord = getOARConstraint('Spinal cord');
    if (!spinalCord) throw new Error('Spinal cord not found');

    // Prior: 50 Gy in 25 fx, Planned: 20 Gy in 10 fx (α/β = 2)
    // Prior EQD2 = 50 Gy, Planned EQD2 = 20 Gy, Total = 70 Gy
    // Limit is 50 Gy → exceeds
    const result = checkOARConstraint(spinalCord, 50, 25, 20, 10, 12);
    
    expect(result.cumulativeEQD2).toBeCloseTo(70, 1);
    expect(result.percentOfLimit).toBeCloseTo(140, 1);
    expect(result.warningLevel).toBe('exceeds');
    expect(result.message).toContain('EXCEEDS');
  });

  test('shows caution for spinal cord at 80-100%', () => {
    const spinalCord = getOARConstraint('Spinal cord');
    if (!spinalCord) throw new Error('Spinal cord not found');

    // Prior: 30 Gy in 15 fx, Planned: 15 Gy in 15 fx
    // Total EQD2 ≈ 45 Gy (90% of 50 Gy limit)
    const result = checkOARConstraint(spinalCord, 30, 15, 15, 15, 24);
    
    expect(result.percentOfLimit).toBeGreaterThan(80);
    expect(result.percentOfLimit).toBeLessThanOrEqual(100);
    expect(result.warningLevel).toBe('caution');
  });

  test('shows safe for spinal cord well below limit', () => {
    const spinalCord = getOARConstraint('Spinal cord');
    if (!spinalCord) throw new Error('Spinal cord not found');

    // Prior: 20 Gy in 10 fx, Planned: 10 Gy in 5 fx
    // Total EQD2 = 30 Gy (60% of limit)
    const result = checkOARConstraint(spinalCord, 20, 10, 10, 5, 12);
    
    expect(result.cumulativeEQD2).toBeCloseTo(30, 1);
    expect(result.percentOfLimit).toBeCloseTo(60, 1);
    expect(result.warningLevel).toBe('safe');
    expect(result.message).toContain('SAFE');
  });

  test('provides detailed dose breakdown', () => {
    const brainstem = getOARConstraint('Brainstem');
    if (!brainstem) throw new Error('Brainstem not found');

    const result = checkOARConstraint(brainstem, 50, 25, 20, 10, 12);
    
    expect(result.doseBreakdown).toBeDefined();
    expect(result.doseBreakdown.priorEQD2).toBeCloseTo(50, 1);
    expect(result.doseBreakdown.plannedEQD2).toBeCloseTo(20, 1);
    expect(result.doseBreakdown.cumulativeEQD2).toBeCloseTo(70, 1);
  });
});

describe('Check All OAR Constraints', () => {
  test('evaluates all OARs and returns sorted results', () => {
    // Scenario: Prior 60 Gy/30fx, Planned 40 Gy/10fx, 18 months interval
    const results = checkAllOARConstraints(60, 30, 40, 10, 18);
    
    expect(results.length).toBe(OAR_CONSTRAINTS.length);
    
    // Results should be sorted by tier first
    expect(results[0].oar.tier).toBe(1);
    
    // Check that at least some structures have different warning levels
    const warningLevels = results.map(r => r.warningLevel);
    expect(new Set(warningLevels).size).toBeGreaterThan(1);
  });

  test('OAR summary provides correct counts', () => {
    const results = checkAllOARConstraints(30, 15, 20, 10, 24);
    const summary = getOARSummary(results);
    
    expect(summary.total).toBe(results.length);
    expect(summary.safe + summary.caution + summary.exceeds).toBe(summary.total);
    
    // Verify tier breakdown sums correctly
    const tier1Total = summary.byTier.tier1.safe + summary.byTier.tier1.caution + summary.byTier.tier1.exceeds;
    const tier2Total = summary.byTier.tier2.safe + summary.byTier.tier2.caution + summary.byTier.tier2.exceeds;
    const tier3Total = summary.byTier.tier3.safe + summary.byTier.tier3.caution + summary.byTier.tier3.exceeds;
    
    expect(tier1Total + tier2Total + tier3Total).toBe(summary.total);
  });
});

// ============================================================================
// RPA CLASSIFICATION TESTS
// ============================================================================

describe('RPA Classification', () => {
  test('classifies as Class I for ≥2 years + surgery', () => {
    const result = classifyRPA({
      reirradiationIntervalYears: 2.5,
      hadSalvageSurgery: true,
      hasOrganDysfunction: false,
    });
    
    expect(result.class).toBe('I');
    expect(result.survivalEstimate2Year).toBeCloseTo(61.9, 1);
    expect(result.medianSurvivalMonths).toBe(28);
    expect(result.description).toContain('Favorable');
  });

  test('classifies as Class III for <2 years + dysfunction', () => {
    const result = classifyRPA({
      reirradiationIntervalYears: 1.5,
      hadSalvageSurgery: false,
      hasOrganDysfunction: true,
    });
    
    expect(result.class).toBe('III');
    expect(result.survivalEstimate2Year).toBeCloseTo(16.8, 1);
    expect(result.medianSurvivalMonths).toBe(9);
    expect(result.description).toContain('Poor');
  });

  test('classifies as Class II for ≥2 years without surgery', () => {
    const result = classifyRPA({
      reirradiationIntervalYears: 3,
      hadSalvageSurgery: false,
      hasOrganDysfunction: false,
    });
    
    expect(result.class).toBe('II');
    expect(result.survivalEstimate2Year).toBeCloseTo(40.0, 1);
    expect(result.medianSurvivalMonths).toBe(16);
  });

  test('classifies as Class II for <2 years without dysfunction', () => {
    const result = classifyRPA({
      reirradiationIntervalYears: 1,
      hadSalvageSurgery: false,
      hasOrganDysfunction: false,
    });
    
    expect(result.class).toBe('II');
    expect(result.survivalEstimate2Year).toBeCloseTo(40.0, 1);
  });

  test('provides classification factors', () => {
    const result = classifyRPA({
      reirradiationIntervalYears: 2.5,
      hadSalvageSurgery: true,
      hasOrganDysfunction: false,
    });
    
    expect(result.classificationFactors.length).toBeGreaterThan(0);
    expect(result.classificationFactors.some(f => f.includes('2.5 years'))).toBe(true);
    expect(result.classificationFactors.some(f => f.includes('surgery'))).toBe(true);
  });

  test('throws error for negative interval', () => {
    expect(() => classifyRPA({
      reirradiationIntervalYears: -1,
      hadSalvageSurgery: false,
      hasOrganDysfunction: false,
    })).toThrow('cannot be negative');
  });

  test('throws error for unrealistic interval', () => {
    expect(() => classifyRPA({
      reirradiationIntervalYears: 100,
      hadSalvageSurgery: false,
      hasOrganDysfunction: false,
    })).toThrow('unrealistic');
  });
});

describe('RPA Input Validation', () => {
  test('validates correct inputs', () => {
    const validation = validateRPAInputs({
      reirradiationIntervalYears: 2,
      hadSalvageSurgery: true,
      hasOrganDysfunction: false,
    });
    
    expect(validation.valid).toBe(true);
    expect(validation.errors.length).toBe(0);
  });

  test('warns for very short interval', () => {
    const validation = validateRPAInputs({
      reirradiationIntervalYears: 0.3,
      hadSalvageSurgery: false,
      hasOrganDysfunction: false,
    });
    
    expect(validation.warnings.length).toBeGreaterThan(0);
    expect(validation.warnings.some(w => w.includes('Very short interval'))).toBe(true);
  });

  test('warns for very long interval', () => {
    const validation = validateRPAInputs({
      reirradiationIntervalYears: 15,
      hadSalvageSurgery: false,
      hasOrganDysfunction: false,
    });
    
    expect(validation.warnings.some(w => w.includes('Long interval'))).toBe(true);
  });
});

describe('RPA Recommendations', () => {
  test('provides Class I recommendations', () => {
    const recommendations = getRecommendationsByClass('I');
    
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations.some(r => r.includes('favorable'))).toBe(true);
  });

  test('provides Class III recommendations', () => {
    const recommendations = getRecommendationsByClass('III');
    
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations.some(r => r.includes('alternative') || r.includes('palliative'))).toBe(true);
  });
});

describe('Time Conversion Helpers', () => {
  test('converts months to years', () => {
    expect(monthsToYears(24)).toBeCloseTo(2, 2);
    expect(monthsToYears(18)).toBeCloseTo(1.5, 2);
  });

  test('converts years to months', () => {
    expect(yearsToMonths(2)).toBeCloseTo(24, 2);
    expect(yearsToMonths(1.5)).toBeCloseTo(18, 2);
  });
});
