'use client';

import { useState, useEffect } from 'react';
import MDACCPathway from '@/components/MDACCPathway';
import Calculator from '@/components/Calculator';
import GuidelinesTab from '@/components/GuidelinesTab';
import SalvagePathway from '@/components/SalvagePathway';
import OARDoseBudget from '@/components/OARDoseBudget';

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

function HowToUseModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">How to Use This Tool</h2>
              <p className="text-sm text-gray-600 mt-1">A quick walkthrough with an example case</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Overview */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <h3 className="font-bold text-teal-800 mb-2">3-Step Evaluation Process</h3>
              <div className="space-y-2 text-sm text-teal-700">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                  <span><strong>TCP (Tumor Control):</strong> Assess tumor factors affecting local control probability</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                  <span><strong>NTCP (Normal Tissue):</strong> Evaluate toxicity risks to critical structures</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                  <span><strong>Technical Feasibility:</strong> Determine achievable dose and modality selection</span>
                </div>
              </div>
            </div>

            {/* Example Case */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Example Case</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700">
                  <strong>55-year-old</strong> with <strong>recurrent squamous cell carcinoma of the oropharynx</strong>
                  <br />
                  Prior treatment: <strong>70 Gy in 35 fractions, 18 months ago</strong>
                  <br />
                  Current tumor volume: <strong>12 cc</strong>
                  <br />
                  Carotid involvement: <strong>None</strong>
                </p>
              </div>

              {/* Step-by-step selections */}
              <div className="space-y-4">
                <div className="border-l-4 border-teal-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Step 1: TCP Factors</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Histology: <strong>SCC</strong></li>
                    <li>• Recurrence Type: <strong>Recurrent tumor</strong></li>
                    <li>• Field Relationship: <strong>In-field</strong> (full overlap with prior RT)</li>
                    <li>• Disease Status: <strong>Gross disease (intact)</strong></li>
                    <li>• Recurrence Site: <strong>Oropharynx</strong></li>
                    <li>• Tumor Volume: <strong>12 cc</strong> (favorable, &lt;15cc)</li>
                  </ul>
                </div>

                <div className="border-l-4 border-amber-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Step 2: NTCP Factors</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Re-irradiation Interval: <strong>18 months</strong> (acceptable, 12-24mo)</li>
                    <li>• Prior Dose: <strong>70 Gy in 35 fractions</strong></li>
                    <li>• Carotid Involvement: <strong>No involvement</strong></li>
                    <li>• Critical OARs: <em>Select as appropriate based on anatomy</em></li>
                  </ul>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Step 3: Technical Feasibility</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Planned Modality: <strong>SBRT</strong> (volume &lt;25cc)</li>
                    <li>• Planned Dose: <strong>36 Gy in 4 fractions</strong> (gross disease)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Expected Output */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Expected Assessment</h3>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">+</div>
                  <div>
                    <div className="font-bold text-green-800 text-lg">FAVORABLE</div>
                    <div className="text-xs text-green-600">Re-irradiation is a reasonable option</div>
                  </div>
                </div>
                <div className="text-sm text-green-700 mt-3">
                  <strong>Favorable factors:</strong> Small volume (&lt;15cc), acceptable interval (12-24mo), no carotid involvement
                  <br />
                  <strong>Expected outcomes:</strong> Based on MDACC data for oropharynx — 77% 2-year local control, 51% 2-year OS
                </div>
              </div>
            </div>

            {/* Close button */}
            <div className="pt-4">
              <button
                onClick={onClose}
                className="w-full py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors shadow-lg"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type ViewMode = 'landing' | 'radonc' | 'salvage';
type RadOncTab = 'pathway' | 'calculator' | 'dosebudget' | 'guidelines';
type LandingTab = 'home' | 'about' | 'dosebudget' | 'guidelines';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [radOncTab, setRadOncTab] = useState<RadOncTab>('pathway');
  const [landingTab, setLandingTab] = useState<LandingTab>('home');
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [showHowToUse, setShowHowToUse] = useState(false);

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
      <main className="min-h-screen bg-background flex flex-col">
        {showDisclaimer && <DisclaimerModal onAccept={handleAcceptDisclaimer} />}
        {showHowToUse && <HowToUseModal onClose={() => setShowHowToUse(false)} />}

        {/* Header */}
        <header className="bg-header text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-6 md:px-6">
            <div className="text-center relative">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-white">
                HEAD & NECK RE-IRRADIATION <span className="font-light opacity-80">TOOL</span>
              </h1>
              <p className="text-sm md:text-base text-teal-100 mt-2 font-light tracking-wide">
                Evidence-Based Decision Support for Recurrent Head & Neck Cancer
              </p>
              {/* Help Button */}
              <button
                onClick={() => setShowHowToUse(true)}
                className="absolute top-0 right-0 w-10 h-10 bg-teal-700/50 hover:bg-teal-700 rounded-full flex items-center justify-center transition-colors group"
                title="How to use this tool"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Subtle Tab Navigation */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
            <nav className="flex justify-center gap-6" aria-label="Landing tabs">
              <button
                onClick={() => setLandingTab('home')}
                className={`text-sm transition-colors ${
                  landingTab === 'home'
                    ? 'text-teal-700 font-medium border-b-2 border-teal-600 pb-1'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setLandingTab('about')}
                className={`text-sm transition-colors ${
                  landingTab === 'about'
                    ? 'text-teal-700 font-medium border-b-2 border-teal-600 pb-1'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                About
              </button>
              <button
                onClick={() => setLandingTab('dosebudget')}
                className={`text-sm transition-colors ${
                  landingTab === 'dosebudget'
                    ? 'text-teal-700 font-medium border-b-2 border-teal-600 pb-1'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Dose Budget
              </button>
              <button
                onClick={() => setLandingTab('guidelines')}
                className={`text-sm transition-colors ${
                  landingTab === 'guidelines'
                    ? 'text-teal-700 font-medium border-b-2 border-teal-600 pb-1'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Guidelines
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow">
          {landingTab === 'home' ? (
            <div className="max-w-7xl mx-auto px-4 py-12 md:px-6">
              {/* Pathway Cards */}
              <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {/* Radiation Oncology Card */}
                <button
                  onClick={() => setViewMode('radonc')}
                  className="bg-white border-2 border-gray-200 hover:border-teal-500 rounded-xl p-8 text-left transition-all group shadow-sm hover:shadow-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-600 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                      </svg>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-teal-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-700 transition-colors">
                    MDACC Pathway
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    Comprehensive evaluation for radiation oncologists
                  </p>
                  
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>3-Step Clinical Evaluation</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>MIRI Risk Calculator</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Evidence-based constraints</span>
                    </li>
                  </ul>
                </button>

                {/* OAR Dose Budget Card */}
                <button
                  onClick={() => setLandingTab('dosebudget')}
                  className="bg-white border-2 border-gray-200 hover:border-teal-500 rounded-xl p-8 text-left transition-all group shadow-sm hover:shadow-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                      </svg>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">
                    OAR Dose Budget
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    Quick organ-at-risk constraint calculator
                  </p>
                  
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>SBRT dose constraints</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>3-tier toxicity classification</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Print-ready summary</span>
                    </li>
                  </ul>
                </button>

                {/* Re-Irradiation Decisions Card */}
                <button
                  onClick={() => setViewMode('salvage')}
                  className="bg-white border-2 border-gray-200 hover:border-teal-500 rounded-xl p-8 text-left transition-all group shadow-sm hover:shadow-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
                    Re-Irradiation Decisions
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    Quick assessment for referring physicians
                  </p>
                  
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Quick 2-step assessment</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Visual decision pathway</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Traffic-light risk output</span>
                    </li>
                  </ul>
                </button>
              </div>
            </div>
          ) : landingTab === 'dosebudget' ? (
            /* Dose Budget Section */
            <div className="max-w-7xl mx-auto px-4 py-12 md:px-6">
              <OARDoseBudget />
            </div>
          ) : landingTab === 'about' ? (
            /* About Section */
            <div className="max-w-5xl mx-auto px-4 py-12 md:px-6">
              <div className="prose prose-lg max-w-none">
                {/* About This Tool */}
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Tool</h2>
                  <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <p className="text-gray-700">
                      This re-irradiation decision support tool is <strong>based on clinical experience and published data from 
                      The University of Texas MD Anderson Cancer Center</strong>, Department of Radiation Oncology.
                    </p>
                    
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-amber-800 font-semibold mb-2">Important Notice</p>
                      <p className="text-amber-700 text-sm">
                        This is <strong>NOT an official MD Anderson Cancer Center product</strong>. It is an independent educational tool 
                        developed to share evidence-based practices from the MD Anderson Head & Neck SBRT Program.
                      </p>
                    </div>

                    <p className="text-gray-700">
                      The tool implements the MD Anderson re-irradiation evaluation framework for head and neck cancer, 
                      providing evidence-based decision support for evaluating re-irradiation candidacy in patients 
                      with recurrent disease.
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 font-semibold mb-2">Development & Contact</p>
                      <p className="text-blue-700 text-sm mb-3">
                        <strong>Primary Developer:</strong> Ramez Kouzy, MD<br />
                        Department of Radiation Oncology<br />
                        The University of Texas MD Anderson Cancer Center<br />
                        <a href="mailto:RKouzy@mdanderson.org" className="text-blue-600 hover:underline">RKouzy@mdanderson.org</a>
                      </p>
                      <p className="text-blue-700 text-sm">
                        <strong>Developed in collaboration with:</strong> Jack Phan, MD, PhD<br />
                        Director of Head & Neck Stereotactic Radiotherapy, MD Anderson Cancer Center
                      </p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-800 font-semibold mb-2">Key References & Guidelines</p>
                      <ul className="text-gray-700 text-sm space-y-1 ml-4">
                        <li>• Diao et al. <em>Head & Neck</em> 2022 — MD Anderson SBRT outcomes and dose constraints</li>
                        <li>• MIRI (Mortality Index for Re-Irradiation) study — Risk stratification model</li>
                        <li>• QUANTEC guidelines — Normal tissue dose-volume constraints</li>
                        <li>• HyTEC guidelines — High-dose re-irradiation constraints</li>
                        <li>• Phan et al. 2025 — State-of-the-art review of H&N re-irradiation</li>
                      </ul>
                    </div>

                    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                      <p className="text-red-800 font-bold mb-2">Clinical Decision Support Only</p>
                      <p className="text-red-700 text-sm">
                        This tool is intended for <strong>educational purposes and clinical decision support only</strong>. 
                        It does not replace comprehensive patient evaluation, multidisciplinary tumor board discussion, 
                        or individualized treatment planning. All treatment decisions must be made by qualified physicians 
                        based on complete clinical assessment.
                      </p>
                    </div>
                  </div>
                </div>

                {/* The SBRT Program */}
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">The MD Anderson H&N SBRT Program</h2>
                  <div className="bg-teal-50 rounded-xl border border-teal-200 p-6 space-y-4">
                    <p className="text-gray-700">
                      The <strong>Head & Neck Stereotactic Body Radiotherapy (SBRT) Program</strong> at MD Anderson 
                      is one of the largest and most comprehensive programs of its kind, with over <strong>500 patients 
                      treated</strong> since program inception.
                    </p>
                    <p className="text-gray-700">
                      The program provides specialized care for patients with recurrent head and neck and skull base 
                      malignancies, integrating cutting-edge treatment techniques with prospective clinical research.
                    </p>
                    <div className="bg-white rounded-lg p-4 space-y-2">
                      <p className="text-gray-800 font-semibold mb-3">Active Clinical Research</p>
                      <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                        <li>
                          <strong>HYDRA Trial</strong> — CPRIT-funded study of stereotactic ablative radiotherapy 
                          for larynx-preserving treatment
                        </li>
                        <li>
                          <strong>SOAR Trial</strong> — Phase 2 randomized controlled trial comparing SBRT versus 
                          conventionally fractionated radiotherapy for unresectable head and neck recurrence
                        </li>
                        <li>
                          <strong>Prospective Registry</strong> — Long-term outcomes database for head and neck 
                          re-irradiation, funded by the MD Anderson Clinical Innovator Award
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Program Leadership */}
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Program Leadership</h2>
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <ul className="space-y-2 text-gray-700">
                      <li>
                        <strong>Dr. Jack Phan</strong> — Director of Head & Neck Stereotactic Radiotherapy; 
                        Director of Head & Neck Clinical Research
                      </li>
                      <li><strong>Dr. Michael Spiotto</strong> — Faculty, Head & Neck Radiation Oncology</li>
                      <li><strong>Dr. Anna Lee</strong> — Faculty, Head & Neck Radiation Oncology</li>
                      <li><strong>Dr. Adam Garden</strong> — Faculty, Head & Neck Radiation Oncology</li>
                      <li><strong>Dr. Jay Reddy</strong> — Faculty, Head & Neck Radiation Oncology</li>
                    </ul>
                  </div>
                </div>

                {/* Key Publications */}
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Publications</h2>
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <p className="text-sm text-teal-700 font-semibold mb-2">PMID: 40090750</p>
                      <p className="text-gray-800 mb-2">
                        Phan J, Spiotto MT, Goodman CD, Reddy J, Newcomm P, Garden AS, Lee A.
                      </p>
                      <p className="text-gray-700 italic mb-1">
                        "Reirradiation for Locally Recurrent Head and Neck Cancer: State-of-the-Art and Future Directions."
                      </p>
                      <p className="text-gray-500 text-sm">2025</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <p className="text-sm text-teal-700 font-semibold mb-2">PMID: 34269492 · 27 citations</p>
                      <p className="text-gray-800 mb-2">
                        Diao K, Nguyen TP, Moreno AC, Reddy JP, Garden AS, Wang CH, Tung S, Wang C, Wang XA, 
                        Rosenthal DI, Fuller CD, Gunn GB, Frank SJ, Morrison WH, Shah SJ, Lee A, Spiotto MT, 
                        Su SY, Ferrarotto R, Phan J.
                      </p>
                      <p className="text-gray-700 italic mb-1">
                        "Stereotactic body ablative radiotherapy for reirradiation of small volume head and neck 
                        cancers is associated with prolonged survival."
                      </p>
                      <p className="text-gray-500 text-sm">Head Neck. 2021.</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <p className="text-sm text-teal-700 font-semibold mb-2">PMID: 29684256 · 44 citations</p>
                      <p className="text-gray-800 mb-2">
                        Ho JC, Phan J.
                      </p>
                      <p className="text-gray-700 italic mb-1">
                        "Reirradiation of head and neck cancer using modern highly conformal techniques."
                      </p>
                      <p className="text-gray-500 text-sm">Head Neck. 2018;40(9):2078-2093.</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <p className="text-sm text-teal-700 font-semibold mb-2">PMID: 31552172 · 22 citations</p>
                      <p className="text-gray-800 mb-2">
                        Gogineni E, Rana Z, Vempati P, Kabolizadeh P, Chera B, Suen A, Weiss J, Grilley-Olson J, 
                        Patel S, Zanation A, Hackman T, Senior B, Thorp B, Mendenhall W, Phan J.
                      </p>
                      <p className="text-gray-700 italic mb-1">
                        "Quality of Life Outcomes Following Organ-Sparing SBRT in Previously Irradiated Recurrent 
                        Head and Neck Cancer."
                      </p>
                      <p className="text-gray-500 text-sm">Front Oncol. 2019.</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <p className="text-sm text-teal-700 font-semibold mb-2">PMID: 34701302</p>
                      <p className="text-gray-800 mb-2">
                        Moreno AC, Oladeru OT, Frank SJ, Phan J.
                      </p>
                      <p className="text-gray-700 italic mb-1">
                        "Patterns of Failure After SBRT Reirradiation for Recurrent Head and Neck Cancer."
                      </p>
                      <p className="text-gray-500 text-sm">Int J Radiat Oncol Biol Phys. 2021.</p>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <p className="text-gray-700 mb-2">
                      <strong>MD Anderson Cancer Center</strong><br />
                      Department of Radiation Oncology<br />
                      Houston, Texas
                    </p>
                    <p className="text-gray-600 text-sm mt-4">
                      For clinical consultations or research inquiries regarding head and neck re-irradiation, 
                      please contact the MD Anderson Head & Neck SBRT program.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Guidelines Section */
            <div className="max-w-7xl mx-auto px-4 py-12 md:px-6">
              <GuidelinesTab />
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-gray-50 mt-auto">
          <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 relative">
            <p className="text-xs text-gray-600 text-center max-w-3xl mx-auto">
              <strong>DISCLAIMER:</strong> For educational and research purposes only. Not validated for clinical use. 
              This tool aids in risk assessment but does not replace multidisciplinary review.
            </p>
            <p className="text-xs text-gray-400 text-center mt-2">v2.4.0</p>
            <a href="/admin" className="absolute bottom-2 right-4 text-[10px] text-gray-300 hover:text-gray-400 transition-colors">admin</a>
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
                onClick={() => setRadOncTab('dosebudget')}
                className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  radOncTab === 'dosebudget'
                    ? 'border-teal-600 text-teal-700 bg-teal-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                  <span className="hidden sm:inline">OAR</span> Dose Budget
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
          ) : radOncTab === 'dosebudget' ? (
            <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
              <OARDoseBudget />
            </div>
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
                <a href="/admin" className="text-[10px] text-gray-300 hover:text-gray-400 transition-colors ml-2">admin</a>
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
                RE-IRRADIATION DECISIONS
              </h1>
              <p className="text-sm text-purple-100 mt-1 font-light tracking-wide">
                Quick Assessment for Referring Physicians
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
              <a href="/admin" className="text-[10px] text-gray-300 hover:text-gray-400 transition-colors ml-2">admin</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
