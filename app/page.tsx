'use client';

import { useState, useEffect } from 'react';
import MDACCPathway from '@/components/MDACCPathway';
import Calculator from '@/components/Calculator';
import GuidelinesTab from '@/components/GuidelinesTab';
import SalvagePathway from '@/components/SalvagePathway';

function DisclaimerModal({ onAccept }: { onAccept: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Important Disclaimer</h2>
          </div>

          {/* Content */}
          <div className="space-y-4 text-sm sm:text-base text-gray-700">
            <p>
              This Head & Neck Re-Irradiation Tool is provided for <strong>educational and research purposes only</strong>.
            </p>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>This tool has <strong>not been validated for clinical use</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>It does not replace clinical judgment or multidisciplinary review</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Treatment decisions should always involve evaluation by qualified physicians</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>The authors assume no liability for clinical decisions based on this tool</span>
                </li>
              </ul>
            </div>

            <p className="text-gray-600">
              By continuing, you acknowledge that you understand and accept these limitations.
            </p>
          </div>

          {/* Action */}
          <div className="mt-8">
            <button
              onClick={onAccept}
              className="w-full py-4 px-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors shadow-lg text-base"
            >
              I Understand and Accept
            </button>
          </div>

          {/* Footer */}
          <p className="text-xs text-gray-400 text-center mt-4">
            v2.4.0 - Educational Release
          </p>
        </div>
      </div>
    </div>
  );
}

type ViewMode = 'landing' | 'radonc' | 'salvage';
type RadOncTab = 'pathway' | 'calculator' | 'guidelines';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [radOncTab, setRadOncTab] = useState<RadOncTab>('pathway');
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  // Check if user has previously accepted disclaimer (session-based)
  useEffect(() => {
    const accepted = sessionStorage.getItem('hn-rert-disclaimer-accepted');
    if (accepted === 'true') {
      setShowDisclaimer(false);
    }
  }, []);

  const handleAcceptDisclaimer = () => {
    sessionStorage.setItem('hn-rert-disclaimer-accepted', 'true');
    setShowDisclaimer(false);
  };

  // Landing Page View
  if (viewMode === 'landing') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900 flex flex-col">
        {showDisclaimer && <DisclaimerModal onAccept={handleAcceptDisclaimer} />}

        {/* Header */}
        <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Head & Neck Re-Irradiation Tool
            </h1>
            <p className="text-teal-200 mt-2 text-sm md:text-base">
              Evidence-Based Decision Support for Recurrent Head & Neck Cancer
            </p>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-grow flex items-center justify-center p-6">
          <div className="max-w-5xl w-full">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Choose Your Pathway
              </h2>
              <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto">
                Select the appropriate tool based on your specialty and clinical needs
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {/* Radiation Oncology Pathway */}
              <button
                onClick={() => setViewMode('radonc')}
                className="group bg-white/95 hover:bg-white rounded-2xl shadow-2xl p-8 text-left transition-all transform hover:scale-105 hover:shadow-teal-500/20"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                      Radiation Oncology Pathway
                    </h3>
                    <p className="text-sm text-teal-600 font-medium uppercase tracking-wide">
                      For Radiation Oncologists
                    </p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Comprehensive 4-step evaluation framework with MDACC pathway, MIRI calculator, 
                  and dosimetric constraints for radiation oncology specialists.
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>TCP/NTCP Assessment</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>MIRI Risk Calculator</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>OAR Dose Constraints</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Clinical Guidelines</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <span className="text-teal-600 font-semibold group-hover:gap-3 flex items-center gap-2 transition-all">
                    Access Pathway
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </div>
              </button>

              {/* Salvage Decision Support */}
              <button
                onClick={() => setViewMode('salvage')}
                className="group bg-white/95 hover:bg-white rounded-2xl shadow-2xl p-8 text-left transition-all transform hover:scale-105 hover:shadow-purple-500/20"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                      Salvage Decision Support
                    </h3>
                    <p className="text-sm text-purple-600 font-medium uppercase tracking-wide">
                      For Surgeons & Medical Oncologists
                    </p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Guided assessment tool for non-radiation oncologists to evaluate re-irradiation 
                  candidacy and identify referral appropriateness.
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Step-by-Step Questionnaire</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Feasibility Assessment</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Decision Tree Visualization</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Referral Guidance</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <span className="text-purple-600 font-semibold group-hover:gap-3 flex items-center gap-2 transition-all">
                    Start Assessment
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </div>
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-12 text-center">
              <p className="text-gray-400 text-sm max-w-2xl mx-auto">
                Both pathways are based on published evidence including MIRI data (Phan et al. 2025), 
                MDACC outcomes, and HYTEC guidelines. For educational and research purposes only.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-gray-400 max-w-2xl">
                <strong>DISCLAIMER:</strong> For educational and research purposes only. Not validated for clinical use. 
                This tool aids in risk assessment but does not replace multidisciplinary review.
              </p>
              <div className="text-xs text-gray-500 flex items-center gap-3">
                <span>v2.4.0</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    );
  }

  // Radiation Oncology Pathway View
  if (viewMode === 'radonc') {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        {showDisclaimer && <DisclaimerModal onAccept={handleAcceptDisclaimer} />}

        {/* Header */}
        <header className="bg-header text-white shadow-md z-50">
          <div className="max-w-[1600px] mx-auto px-4 py-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight leading-tight text-white">
                  HEAD & NECK RE-IRRADIATION <span className="font-light opacity-80">TOOL</span>
                </h1>
                <p className="text-sm text-teal-100 mt-1 font-light tracking-wide">
                  Radiation Oncology Decision Support & Dosimetric Assessment
                </p>
              </div>
              <button
                onClick={() => setViewMode('landing')}
                className="text-xs text-teal-100 hover:text-white transition-colors flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </button>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-[1600px] mx-auto px-4 md:px-6">
            <nav className="flex gap-1 overflow-x-auto" aria-label="Tabs">
              <button
                onClick={() => setRadOncTab('pathway')}
                className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  radOncTab === 'pathway'
                    ? 'border-teal-600 text-teal-700 bg-teal-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                  <span className="hidden sm:inline">MDACC</span> Pathway
                </span>
              </button>
              <button
                onClick={() => setRadOncTab('calculator')}
                className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  radOncTab === 'calculator'
                    ? 'border-teal-600 text-teal-700 bg-teal-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="hidden sm:inline">MIRI</span> Calculator
                </span>
              </button>
              <button
                onClick={() => setRadOncTab('guidelines')}
                className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  radOncTab === 'guidelines'
                    ? 'border-teal-600 text-teal-700 bg-teal-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Guidelines
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow">
          {radOncTab === 'pathway' ? (
            <div className="bg-gray-50 min-h-full py-6">
              <MDACCPathway />
            </div>
          ) : radOncTab === 'calculator' ? (
            <Calculator />
          ) : (
            <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
              <GuidelinesTab />
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-divider mt-auto">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 sm:py-6 text-center md:text-left">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-secondary max-w-2xl">
                <strong>DISCLAIMER:</strong> For educational and research purposes only. Not validated for clinical use. 
                This tool aids in risk assessment but does not replace multidisciplinary review.
              </p>
              <div className="text-xs text-gray-400 flex items-center gap-3">
                <span>v2.4.0</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    );
  }

  // Salvage Decision Support View
  return (
    <main className="min-h-screen bg-background flex flex-col">
      {showDisclaimer && <DisclaimerModal onAccept={handleAcceptDisclaimer} />}

      {/* Header */}
      <header className="bg-gradient-to-r from-purple-800 to-indigo-800 text-white shadow-md z-50">
        <div className="max-w-[1600px] mx-auto px-4 py-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight leading-tight text-white">
                SALVAGE DECISION SUPPORT <span className="font-light opacity-80">TOOL</span>
              </h1>
              <p className="text-sm text-purple-100 mt-1 font-light tracking-wide">
                Re-Irradiation Candidacy Assessment for Non-Radiation Oncologists
              </p>
            </div>
            <button
              onClick={() => setViewMode('landing')}
              className="text-xs text-purple-100 hover:text-white transition-colors flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </button>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-grow bg-gray-50">
        <SalvagePathway />
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-divider mt-auto">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 sm:py-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-secondary max-w-2xl">
              <strong>DISCLAIMER:</strong> For educational and research purposes only. Not validated for clinical use. 
              This tool aids in risk assessment but does not replace multidisciplinary review.
            </p>
            <div className="text-xs text-gray-400 flex items-center gap-3">
              <span>v2.4.0</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
