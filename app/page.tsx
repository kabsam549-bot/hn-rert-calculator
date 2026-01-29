'use client';

import { useState, useEffect } from 'react';
import MDACCPathway from '@/components/MDACCPathway';
import Calculator from '@/components/Calculator';
import GuidelinesTab from '@/components/GuidelinesTab';

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
            v2.3.0 - Educational Release
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'pathway' | 'calculator' | 'guidelines'>('pathway');
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

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Disclaimer Modal */}
      {showDisclaimer && <DisclaimerModal onAccept={handleAcceptDisclaimer} />}

      {/* Institutional Header Bar */}
      <header className="bg-header text-white shadow-md z-50 transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto px-4 py-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight leading-tight text-white">
                HEAD & NECK RE-IRRADIATION <span className="font-light opacity-80">TOOL</span>
              </h1>
              <p className="text-sm text-teal-100 mt-1 font-light tracking-wide">
                Educational Decision Support & Dosimetric Assessment
              </p>
            </div>
            <div className="text-xs text-teal-100/80 font-mono tracking-wide md:text-right hidden md:block">
              <p>PHAN ET AL. 2025 (MIRI)</p>
              <p>HYTEC GUIDELINES</p>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6">
          <nav className="flex gap-1 overflow-x-auto" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('pathway')}
              className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'pathway'
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
              onClick={() => setActiveTab('calculator')}
              className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'calculator'
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
              onClick={() => setActiveTab('guidelines')}
              className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'guidelines'
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

      {/* Main Content Area */}
      <div className="flex-grow">
        {activeTab === 'pathway' ? (
          <div className="bg-gray-50 min-h-full py-6">
            <MDACCPathway />
          </div>
        ) : activeTab === 'calculator' ? (
          <Calculator />
        ) : (
          <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
            <GuidelinesTab />
          </div>
        )}
      </div>

      {/* Professional Footer */}
      <footer className="bg-white border-t border-divider mt-auto">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 sm:py-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-secondary max-w-2xl">
              <strong>DISCLAIMER:</strong> For educational and research purposes only. Not validated for clinical use. 
              This tool aids in risk assessment but does not replace multidisciplinary review.
            </p>
            <div className="text-xs text-gray-400 flex items-center gap-3">
              <span>v2.3.0</span>
              <a 
                href="/admin" 
                className="text-gray-300 hover:text-teal-600 transition-colors"
                title="Admin Panel"
              >
                Admin
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
