# Testing Guide

## H&N Re-Irradiation Calculator - Test Scenarios

### Manual Test Cases

Run these scenarios to verify calculator functionality:

---

### Test Case 1: Favorable Prognosis (RPA Class I)
**Scenario:** Long interval, salvage surgery, no dysfunction

**Inputs:**
- Prior RT: 70 Gy in 35 fractions
- Planned RT: 60 Gy in 30 fractions
- Interval: 36 months (3 years)
- Salvage surgery: ✓ Yes
- Organ dysfunction: ☐ No
- Selected OARs: Spinal cord, Brainstem, Parotid gland

**Expected Results:**
- RPA Class: I
- 2-year survival: ~62%
- Spinal cord: Should show caution or safe (depending on overlap)
- Brainstem: Similar assessment
- Recommendations: Favorable for re-RT

---

### Test Case 2: Poor Prognosis (RPA Class III)
**Scenario:** Short interval, organ dysfunction

**Inputs:**
- Prior RT: 70 Gy in 35 fractions  
- Planned RT: 66 Gy in 33 fractions
- Interval: 18 months (<2 years)
- Salvage surgery: ☐ No
- Organ dysfunction: ✓ Yes
- Selected OARs: Spinal cord, Carotid vessels, Mandible

**Expected Results:**
- RPA Class: III
- 2-year survival: ~17%
- High cumulative doses flagged
- Recommendations: Consider alternatives to re-RT

---

### Test Case 3: OAR Constraint Violations
**Scenario:** High cumulative doses exceeding limits

**Inputs:**
- Prior RT: 70 Gy in 35 fractions (to cord max)
- Planned RT: 50 Gy in 25 fractions (overlapping cord)
- Interval: 24 months
- Salvage surgery: ☐ No
- Organ dysfunction: ☐ No
- Selected OARs: Spinal cord

**Expected Results:**
- Spinal cord EQD2: Should approach or exceed 50 Gy limit
- Warning level: Caution or Exceeds
- Red/yellow flagging on UI
- Specific recommendation about spinal cord risk

---

### Test Case 4: Multiple OAR Assessment
**Scenario:** Comprehensive evaluation across all tiers

**Inputs:**
- Prior RT: 66 Gy in 33 fractions
- Planned RT: 54 Gy in 27 fractions
- Interval: 30 months
- Salvage surgery: ✓ Yes
- Organ dysfunction: ☐ No
- Selected OARs: 
  - Tier 1: Spinal cord, Brainstem
  - Tier 2: Carotid vessels, Mandible
  - Tier 3: Pharyngeal constrictors, Parotid

**Expected Results:**
- RPA Class: I
- Mixed OAR results (some safe, some caution)
- Results organized by tier
- Comprehensive recommendations

---

### Edge Cases to Test

#### Minimum Values
- Prior RT: 10 Gy in 1 fraction
- Planned RT: 10 Gy in 1 fraction
- Interval: 1 month

**Expected:** Should calculate without errors, all OARs likely safe

#### Very Long Interval
- Prior RT: 70 Gy in 35 fractions
- Planned RT: 70 Gy in 35 fractions  
- Interval: 120 months (10 years)

**Expected:** RPA Class I, note about tissue recovery

#### High Dose Per Fraction
- Prior RT: 50 Gy in 10 fractions (5 Gy/fx)
- Planned RT: 40 Gy in 8 fractions (5 Gy/fx)

**Expected:** Higher BED values due to large fraction size

#### All OARs Selected
- Select all 13 available OARs

**Expected:** Should display all organized by tier without UI breaking

---

### Validation Tests

#### Required Field Validation
- Try calculating without filling all fields
- **Expected:** Error message about required fields

#### Numeric Range Validation
- Enter negative numbers
- Enter unrealistic values (e.g., 1000 Gy)
- **Expected:** Appropriate error messages or warnings

#### OAR Selection
- Try calculating without selecting any OARs
- **Expected:** Error about needing at least one OAR

---

### Browser/Device Testing

#### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

#### Mobile Devices
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] Tablet (iPad/Android)

**Check for:**
- Responsive layout
- Readable fonts
- Touch-friendly inputs
- Proper form submission
- Results display correctly

---

### Performance Testing

#### Build Time
```bash
npm run build
```
**Expected:** <30 seconds for full build

#### Page Load
- Measure time to interactive
- **Target:** <2 seconds on good connection

#### Calculation Speed
- Click "Calculate" with all OARs selected
- **Expected:** Results appear instantly (<100ms)

---

### Accessibility Testing

- [ ] Tab navigation works through all form fields
- [ ] ARIA labels present on form elements
- [ ] Color contrast sufficient (WCAG AA)
- [ ] Tooltips accessible via keyboard
- [ ] Error messages announced to screen readers

---

### Data Validation Testing

#### Mathematical Accuracy

Test BED/EQD2 calculations manually:

**Example:**
- Dose: 70 Gy
- Fractions: 35 (2 Gy/fx)
- α/β = 2 Gy (spinal cord)

**Calculate:**
- BED = 70 × [1 + 2/2] = 70 × 2 = 140 Gy₂
- EQD2 = 140 / [1 + 2/2] = 140 / 2 = 70 Gy

**Verify:** Calculator shows 70 Gy EQD2 ✓

#### OAR Constraint Accuracy
Cross-reference displayed constraints with:
- HyTEC guidelines
- QUANTEC reports
- MIRI study data

---

### Regression Testing

After any code changes:
1. Run Test Cases 1-4 above
2. Verify no UI regressions
3. Confirm build still succeeds
4. Check mobile responsiveness

---

## Automated Testing (Future)

Consider adding:
- Jest unit tests for calculation functions
- Playwright E2E tests for user flows
- Visual regression tests for UI changes
- Performance benchmarks

---

## Bug Reporting Template

When issues are found:

```markdown
**Environment:** Browser, OS, Device
**Steps to Reproduce:**
1. 
2.
3.

**Expected Result:**
**Actual Result:**
**Screenshots:** (if applicable)
**Console Errors:** (if any)
```

---

## Test Completion Checklist

Before declaring calculator production-ready:
- [ ] All 4 main test cases pass
- [ ] Edge cases handled gracefully
- [ ] All validation working
- [ ] Mobile responsive confirmed
- [ ] Accessibility basics met
- [ ] Math verified against reference
- [ ] Documentation complete
