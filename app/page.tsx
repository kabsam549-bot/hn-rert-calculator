import Calculator from '@/components/Calculator';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Head & Neck Re-Irradiation Calculator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Educational tool for assessing re-irradiation decision support in head and neck cancer patients
          </p>
        </header>
        
        <Calculator />
        
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p className="mb-2">
            <strong>Disclaimer:</strong> This calculator is for educational purposes only and should not replace clinical judgment.
          </p>
          <p>
            Always consult with qualified healthcare professionals for treatment decisions.
          </p>
        </footer>
      </div>
    </main>
  );
}
