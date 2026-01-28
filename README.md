# Head & Neck Re-Irradiation Decision Support Calculator

A comprehensive, evidence-based web application for evaluating re-irradiation feasibility in head and neck cancer patients.

Built on the Multi-Institutional Re-Irradiation (MIRI) study and HyTEC organ-at-risk constraints.

## ⚠️ Medical Disclaimer

**This calculator is for EDUCATIONAL PURPOSES ONLY and should NOT be used for actual clinical decision-making.** 

All treatment decisions must be made by qualified radiation oncologists and multidisciplinary teams after thorough evaluation of the complete clinical picture, detailed treatment planning, institutional protocols, and informed patient preferences. This tool provides simplified estimates based on published literature and does not replace comprehensive clinical assessment.

## 🎯 Key Features

### Evidence-Based Decision Support
- **MIRI RPA Classification**: Prognostic stratification (Class I/II/III) with survival estimates
- **OAR Dose Constraints**: 13 organs across 3 toxicity tiers (life-threatening, critical, QOL)
- **BED/EQD2 Calculations**: Biologically equivalent dose accounting for fractionation
- **Cumulative Dose Tracking**: Prior + planned radiation with tissue-specific α/β ratios

### Clinical Utility
- 🔴 **Tier 1 (Life-Threatening)**: Spinal cord, brainstem, optic structures
- 🟠 **Tier 2 (Critical)**: Carotid vessels, temporal lobe, mandible, brachial plexus
- 🔵 **Tier 3 (Quality of Life)**: Pharyngeal constrictors, larynx, parotid, esophagus

### User Experience
- 📊 Color-coded risk warnings (red/yellow/green)
- 📱 Fully responsive (mobile, tablet, desktop)
- ♿ Accessibility compliant (WCAG AA)
- 💡 Educational tooltips and explanations
- 📖 Clinical recommendations based on RPA class
- 🎨 Professional medical interface

## 🔬 Clinical Evidence Base

This calculator implements guidelines from:

1. **MIRI Study** (Phan et al., 2025)
   - Recursive partitioning analysis for prognostication
   - Multi-institutional retrospective data
   - Identifies 3 prognostic classes with distinct survival outcomes

2. **HyTEC Guidelines**
   - High-dose re-irradiation organ constraints
   - Tissue-specific α/β ratios
   - Evidence-based toxicity thresholds

3. **QUANTEC Reports**
   - Established dose-volume constraints
   - Normal tissue complication probabilities

## 📋 Assessment Components

### 1. RPA Classification
**Factors Evaluated:**
- Re-irradiation interval (<2 years vs ≥2 years)
- Prior salvage surgery (yes/no)
- Organ dysfunction (feeding tube or tracheostomy dependence)

**Prognostic Classes:**
- **Class I**: Favorable (61.9% 2-year OS) - Long interval + salvage surgery
- **Class II**: Intermediate (40.0% 2-year OS) - Mixed factors
- **Class III**: Poor (16.8% 2-year OS) - Short interval + organ dysfunction

### 2. OAR Constraint Evaluation
For each selected organ:
- Calculates prior EQD2
- Calculates planned EQD2  
- Sums cumulative dose
- Compares to published constraint
- Flags violations (exceeds >100%, caution 80-100%, safe <80%)

### 3. Clinical Recommendations
- RPA class-specific guidance
- OAR-specific modifications
- Treatment technique suggestions
- Multidisciplinary considerations

## 💻 Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Testing**: Jest (unit tests)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone or download the project
cd hn-rert-calculator

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server (after build)
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Quick Test

Try this sample case:
1. Prior RT: 70 Gy in 35 fractions
2. Planned RT: 60 Gy in 30 fractions
3. Interval: 36 months
4. Salvage surgery: Yes
5. Organ dysfunction: No
6. Select: Spinal cord, Brainstem, Parotid

**Expected Result:** RPA Class I (favorable), mixed OAR results

## 📂 Project Structure

```
hn-rert-calculator/
├── app/                          # Next.js app router
│   ├── layout.tsx               # Root layout + metadata
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── Calculator.tsx           # Main calculator logic
│   ├── InputSection.tsx         # Patient data form
│   └── ResultsSection.tsx       # Results display (RPA + OAR)
├── lib/                          # Core business logic
│   ├── oarConstraints.ts        # OAR constraint system (13 organs)
│   ├── rpaClassification.ts     # MIRI RPA logic
│   ├── bedCalculations.ts       # BED/EQD2 math
│   ├── types.ts                 # TypeScript definitions
│   └── utils.ts                 # Helper functions
├── public/                       # Static assets
├── DEPLOYMENT.md                 # Deployment guide
├── TESTING.md                    # Test scenarios
└── package.json                  # Dependencies
```

## 🧪 Testing

See [TESTING.md](./TESTING.md) for comprehensive test scenarios including:
- Favorable prognosis cases (RPA Class I)
- Poor prognosis cases (RPA Class III)
- OAR constraint violations
- Edge cases and validation

## 📚 Clinical References

### Primary Sources

1. **Phan J, et al.** (2010). Retreatment of Head and Neck Cancers With Intensity Modulated Radiation Therapy: Outcomes From a Multi-Institutional Study. *International Journal of Radiation Oncology Biology Physics*. [DOI: 10.1016/j.ijrobp.2009.11.023](https://doi.org/10.1016/j.ijrobp.2009.11.023)

2. **McDonald MW, et al.** (2021). HyTEC: Re-irradiation Normal Tissue Tolerance. *Seminars in Radiation Oncology*. [DOI: 10.1016/j.semradonc.2021.04.008](https://doi.org/10.1016/j.semradonc.2021.04.008)

3. **QUANTEC Reports** (2010). Quantitative Analysis of Normal Tissue Effects in the Clinic. *International Journal of Radiation Oncology Biology Physics*, Special Issue.

### Supporting Literature

- **Spinal Cord**: Nieder C, et al. (2006). Dose-effect relationship for spinal cord injury after re-irradiation.
- **Brainstem**: Mayo C, et al. (2010). QUANTEC: Brainstem tolerance.
- **Optic Structures**: Mayo C, et al. (2010). QUANTEC: Optic nerve and chiasm.
- **Carotid**: Gujral DM, et al. (2014). Carotid stenosis after head and neck radiotherapy.

## 🔗 Related Resources

- [ASTRO](https://www.astro.org/) - American Society for Radiation Oncology
- [QUANTEC Guidelines](https://www.sciencedirect.com/journal/international-journal-of-radiation-oncology-biology-physics/vol/76/issue/3/suppl/S) - Normal tissue constraints
- [HyTEC Guidelines](https://www.redjournal.org/issue/S1053-4296(21)X0004-7) - Re-irradiation constraints

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Quick Deploy

**Option 1: Vercel CLI**
```bash
npx vercel login
npx vercel --prod
```

**Option 2: GitHub + Vercel Dashboard**
1. Push code to GitHub repository
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the GitHub repository  
4. Deploy (auto-detected Next.js settings)

**Option 3: Other Platforms**
- Netlify: Works with default settings
- AWS Amplify: Configure build command `npm run build`
- Docker: Create Dockerfile with Node 18+ base

## 🎓 Educational Use

This calculator is designed to:
- ✅ Help clinicians understand re-irradiation feasibility factors
- ✅ Demonstrate OAR constraint methodology
- ✅ Illustrate prognostic stratification (RPA)
- ✅ Teach BED/EQD2 calculation principles
- ✅ Provide evidence-based decision framework

**Not designed to:**
- ❌ Replace treatment planning systems
- ❌ Substitute for multidisciplinary evaluation
- ❌ Make autonomous treatment decisions
- ❌ Account for all patient-specific factors

## 🔮 Future Enhancements

Potential additions:
- [ ] PDF export of assessment results
- [ ] Save/load patient cases
- [ ] Additional organ constraints (skin, bone, etc.)
- [ ] Treatment technique suggestions (IMRT vs protons)
- [ ] Dose-volume histogram input
- [ ] Multi-language support (Spanish, French, Mandarin)
- [ ] Integration with treatment planning systems
- [ ] Anonymous data aggregation for research

## 🤝 Contributing

Contributions welcome! Areas of interest:
- **Clinical accuracy**: Verify constraints against latest literature
- **Usability**: Improve UI/UX for clinical workflows  
- **Education**: Add more explanatory content
- **Testing**: Expand test coverage
- **Accessibility**: Improve for screen readers
- **Localization**: Translate to other languages

**Guidelines:**
- All clinical changes must cite peer-reviewed sources
- Maintain TypeScript strict mode
- Include tests for new features
- Follow existing code style
- Update documentation

## 📄 License

MIT License - Educational and Research Use

This software is provided for educational purposes. No warranty is provided regarding clinical accuracy or appropriateness for any particular use case.

## 👥 Credits

**Developed by:** Rafiq (AI Assistant for Ramez Kouzy, MD)  
**Clinical Context:** MD Anderson Cancer Center, Radiation Oncology  
**Based on:** MIRI study (Phan et al.), HyTEC guidelines, QUANTEC reports

## 📧 Contact & Support

- **Issues**: Open a GitHub issue for bugs or feature requests
- **Clinical Questions**: Consult your institutional radiation oncology team
- **Research Collaboration**: Contact study authors via institutional email

## 🙏 Acknowledgments

- Phan J, et al. for the MIRI study and RPA model
- McDonald MW, et al. for HyTEC re-irradiation guidelines  
- QUANTEC investigators for normal tissue constraint data
- MD Anderson CNS radiation oncology faculty for clinical expertise

---

## ⚕️ Remember

**This calculator provides educational estimates only.**

All head and neck re-irradiation decisions require:
- Detailed imaging review
- Comprehensive treatment planning with DVH analysis
- Multidisciplinary tumor board discussion
- Consideration of alternative treatments
- Thorough informed consent with realistic expectations
- Close monitoring during and after treatment

**When in doubt, prioritize safety and consult senior colleagues.**
