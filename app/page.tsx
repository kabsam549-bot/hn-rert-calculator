import Calculator from '@/components/Calculator';

export default function Home() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        <Calculator />
        
        <footer className="mt-12 pt-8 border-t border-gray-300 text-center text-xs text-gray-600">
          <p className="mb-2">
            <strong>DISCLAIMER:</strong> This calculator is for educational purposes only and should not replace clinical judgment.
            Always consult with qualified healthcare professionals for treatment decisions.
          </p>
          <p className="text-gray-500">
            © 2024 | Based on MIRI Study (Phan et al., 2010) and HyTEC Guidelines
          </p>
        </footer>
      </div>
    </main>
  );
}
