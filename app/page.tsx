'use client';

import { useState } from 'react';
import Calculator from '@/components/Calculator';
import GuidelinesTab from '@/components/GuidelinesTab';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'guidelines'>('calculator');

  return (
    <main className="min-h-screen bg-background flex flex-col">
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
          <nav className="flex gap-1" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'calculator'
                  ? 'border-teal-600 text-teal-700 bg-teal-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Dose Calculator
              </span>
            </button>
            <button
              onClick={() => setActiveTab('guidelines')}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'guidelines'
                  ? 'border-teal-600 text-teal-700 bg-teal-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Re-RT Guidelines
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow">
        {activeTab === 'calculator' ? (
          <Calculator />
        ) : (
          <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
            <GuidelinesTab />
          </div>
        )}
      </div>

      {/* Professional Footer */}
      <footer className="bg-white border-t border-divider mt-auto">
        <div className="max-w-[1600px] mx-auto px-6 py-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-secondary max-w-2xl">
              <strong>DISCLAIMER:</strong> For educational and research purposes only. Not validated for clinical use. 
              This tool aids in risk assessment but does not replace multidisciplinary review.
            </p>
            <div className="text-xs text-gray-400 flex items-center gap-3">
              <span>v2.2.0 (Educational Release)</span>
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
