# Head & Neck Re-Irradiation Calculator

An educational web application for assessing re-irradiation decision support in head and neck cancer patients.

## ⚠️ Medical Disclaimer

**This calculator is for educational purposes only and should NOT be used for actual clinical decision-making.** 

All treatment decisions should be made by qualified healthcare professionals after thorough evaluation of the complete clinical picture, institutional protocols, and patient preferences. This tool provides simplified estimates and does not replace comprehensive clinical assessment.

## Features

- 📊 Risk score calculation based on multiple patient factors
- 🎯 Clear risk stratification (Low, Moderate, High)
- 💡 Clinical considerations and recommendations
- 📱 Responsive design for mobile and desktop
- 🎨 Clean, professional medical interface
- ♿ Accessible form inputs with validation

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Patient Factors Considered

1. **Age** - Older patients may have increased toxicity risk
2. **Prior Radiation Dose** - Higher doses increase cumulative toxicity
3. **Time Since Prior RT** - Shorter intervals carry higher risk
4. **ECOG Performance Status** - Functional status affects tolerance
5. **Tumor Location** - Different sites have varying risk profiles

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
hn-rert-calculator/
├── app/                    # Next.js app router pages
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Calculator.tsx     # Main calculator component
│   ├── InputSection.tsx   # Patient data input form
│   └── ResultsSection.tsx # Results display
├── lib/                   # Utilities and business logic
│   ├── calculations.ts    # Risk scoring algorithms
│   └── types.ts          # TypeScript type definitions
├── public/               # Static assets
└── package.json         # Dependencies and scripts
```

## Deployment

This application is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Deploy (no configuration needed)

Or use the Vercel CLI:

```bash
npm install -g vercel
vercel
```

## Development Roadmap

- [ ] Add references to clinical studies
- [ ] Implement print functionality for results
- [ ] Add dose constraint calculator
- [ ] Include treatment technique recommendations
- [ ] Multi-language support
- [ ] Export results as PDF

## Contributing

This is an educational tool. Contributions to improve accuracy, usability, or educational value are welcome. Please ensure any clinical calculations are well-documented and evidence-based.

## License

MIT License - Educational Use

## Contact

For questions or suggestions about this educational tool, please open an issue on GitHub.

---

**Remember**: Always consult with qualified radiation oncologists and multidisciplinary teams for actual patient care decisions.
