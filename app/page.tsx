import Calculator from '@/components/Calculator';

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Institutional Header Bar */}
      <header className="bg-header text-white shadow-md z-50">
        <div className="max-w-[1600px] mx-auto px-4 py-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight leading-tight text-white">
                HEAD & NECK RE-IRRADIATION <span className="font-light opacity-80">DECISION SUPPORT</span>
              </h1>
              <p className="text-sm text-gray-300 mt-1 font-light tracking-wide">
                Dosimetric Assessment & Prognostic Classification Tool
              </p>
            </div>
            <div className="text-xs text-gray-400 font-mono tracking-wide md:text-right hidden md:block">
              <p>MIRI PROTOCOL (PHAN ET AL.)</p>
              <p>HYTEC GUIDELINES</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-grow">
        <Calculator />
      </div>

      {/* Professional Footer */}
      <footer className="bg-white border-t border-divider mt-auto">
        <div className="max-w-[1600px] mx-auto px-6 py-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-secondary max-w-2xl">
              <strong>DISCLAIMER:</strong> For educational and research purposes only. Not for clinical decision-making. 
              This tool aids in risk stratification but does not replace multidisciplinary review.
            </p>
            <div className="text-xs text-gray-400">
              v2.0.0 (Clinical Release)
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
