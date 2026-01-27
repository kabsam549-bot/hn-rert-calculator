'use client';

import type { CalculationResult } from '@/lib/types';

interface ResultsSectionProps {
  results: CalculationResult;
}

export default function ResultsSection({ results }: ResultsSectionProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low':
        return 'bg-green-100 border-green-500 text-green-800';
      case 'Moderate':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'High':
        return 'bg-red-100 border-red-500 text-red-800';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  return (
    <div className="mt-8 pt-8 border-t border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Results</h2>
      
      <div className="space-y-6">
        {/* Risk Score */}
        <div className={`p-6 rounded-lg border-l-4 ${getRiskColor(results.riskLevel)}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Overall Risk Assessment</h3>
            <span className="text-2xl font-bold">{results.score}/100</span>
          </div>
          <p className="text-xl font-semibold mb-2">{results.riskLevel} Risk</p>
          <p className="text-sm opacity-90">{results.interpretation}</p>
        </div>

        {/* Risk Factors */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Contributing Factors</h3>
          <ul className="space-y-2">
            {results.factors.map((factor, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span className="text-gray-700">{factor}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Clinical Considerations</h3>
          <ul className="space-y-2">
            {results.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 mr-2">→</span>
                <span className="text-blue-900">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-900">
            <strong>Note:</strong> This calculator provides educational estimates only. 
            Clinical decisions should be made by qualified healthcare professionals considering 
            the complete clinical picture, institutional protocols, and patient preferences.
          </p>
        </div>
      </div>
    </div>
  );
}
