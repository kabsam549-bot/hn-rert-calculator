'use client';

import { useState } from 'react';
import type { CalculationResult } from '@/lib/types';
import ReferencesSection from './ReferencesSection';

interface ResultsSectionProps {
  results: CalculationResult;
}

export default function ResultsSection({ results }: ResultsSectionProps) {
  const [sortField, setSortField] = useState<'tier' | 'name' | 'status'>('tier');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Summary Bar Colors
  const getRiskColor = (risk: 'Low' | 'Moderate' | 'High') => {
    switch (risk) {
      case 'High': return 'bg-status-critical';
      case 'Moderate': return 'bg-status-warning';
      case 'Low': return 'bg-status-safe';
    }
  };

  const getRiskLabel = (risk: 'Low' | 'Moderate' | 'High') => {
    switch (risk) {
      case 'High': return 'HIGH RISK PROFILE';
      case 'Moderate': return 'MODERATE RISK PROFILE';
      case 'Low': return 'FAVORABLE RISK PROFILE';
    }
  };

  // Status Dot & Label Helper
  const getStatusDisplay = (level: 'safe' | 'caution' | 'exceeds') => {
    switch (level) {
      case 'exceeds':
        return (
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-status-critical block shadow-sm"></span>
            <span className="text-status-critical font-bold text-xs uppercase">Exceeds</span>
          </div>
        );
      case 'caution':
        return (
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-status-warning block shadow-sm"></span>
            <span className="text-status-warning font-bold text-xs uppercase">Caution</span>
          </div>
        );
      case 'safe':
        return (
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-status-safe block shadow-sm"></span>
            <span className="text-status-safe font-bold text-xs uppercase">Acceptable</span>
          </div>
        );
    }
  };

  // Sorting Logic
  const sortedOARs = [...results.oarResults].sort((a, b) => {
    let valA: number | string = 0;
    let valB: number | string = 0;
    
    if (sortField === 'tier') {
      valA = a.oar.tier;
      valB = b.oar.tier;
    } else if (sortField === 'name') {
      valA = a.oar.name;
      valB = b.oar.name;
    } else if (sortField === 'status') {
      const order = { exceeds: 0, caution: 1, safe: 2 };
      valA = order[a.warningLevel];
      valB = order[b.warningLevel];
    }

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: 'tier' | 'name' | 'status') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Summary Bar */}
      <div className={`${getRiskColor(results.overallRisk)} text-white px-6 py-4 rounded-lg shadow-md flex items-center justify-between`}>
        <div>
          <h2 className="text-sm font-bold opacity-90 tracking-wider">ASSESSMENT</h2>
          <p className="text-2xl font-bold tracking-tight">{getRiskLabel(results.overallRisk)}</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs font-medium opacity-80">RPA CLASS</p>
          <p className="text-3xl font-serif font-bold leading-none">{results.rpa.class}</p>
        </div>
      </div>

      {/* 2. Prognostic Classification (RPA) */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <h3 className="text-sm font-bold text-header uppercase tracking-wide">MIRI Prognostic Classification</h3>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0 flex flex-col items-center justify-center p-4 bg-gray-50 border border-gray-200 rounded w-full sm:w-32">
              <span className="text-xs font-bold text-secondary uppercase mb-1">Class</span>
              <span className="text-5xl font-serif font-bold text-header">{results.rpa.class}</span>
            </div>
            <div className="flex-grow">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 text-secondary font-medium">Estimated 2-Year Survival</td>
                    <td className="py-2 text-right font-bold text-primary">{results.rpa.survivalEstimate2Year}%</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 text-secondary font-medium">Median Survival</td>
                    <td className="py-2 text-right font-bold text-primary">{results.rpa.medianSurvivalMonths} months</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-secondary font-medium align-top pt-3">Interpretation</td>
                    <td className="py-2 text-right text-gray-700 leading-snug pt-3 max-w-xs ml-auto">
                      {results.rpa.interpretation}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Dosimetric Assessment Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-header px-6 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-sm font-bold text-white uppercase tracking-wide">Organ Dose Assessment (EQD2)</h3>
          <span className="text-xs text-gray-400 font-mono">Sorted by: {sortField.toUpperCase()}</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-secondary uppercase tracking-wider">
                <th 
                  className="px-6 py-3 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  Organ Structure
                </th>
                <th 
                  className="px-6 py-3 cursor-pointer hover:bg-gray-100 text-center"
                  onClick={() => handleSort('tier')}
                >
                  Tier
                </th>
                <th className="px-6 py-3 text-right">Cumulative Dose</th>
                <th className="px-6 py-3 text-right">Limit</th>
                <th 
                  className="px-6 py-3 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  Status
                </th>
                <th className="px-6 py-3 text-right">% of Limit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedOARs.map((result) => (
                <tr key={result.oar.name} className="hover:bg-blue-50 transition-colors zebra-stripe">
                  <td className="px-6 py-3 font-medium text-primary">
                    {result.oar.name}
                    <span className="block text-[10px] text-gray-400 font-normal">{result.oar.complication}</span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      result.oar.tier === 1 ? 'bg-red-100 text-red-800' : 
                      result.oar.tier === 2 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {result.oar.tier}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right font-mono font-medium text-gray-700">
                    {result.doseBreakdown.cumulativeEQD2.toFixed(1)} <span className="text-xs text-gray-400">Gy</span>
                  </td>
                  <td className="px-6 py-3 text-right font-mono text-gray-500">
                    {result.oar.limitEQD2} <span className="text-xs">Gy</span>
                  </td>
                  <td className="px-6 py-3">
                    {getStatusDisplay(result.warningLevel)}
                  </td>
                  <td className="px-6 py-3 text-right font-mono">
                    <span className={`font-bold ${
                      result.percentOfLimit > 100 ? 'text-status-critical' : 'text-primary'
                    }`}>
                      {result.percentOfLimit.toFixed(0)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Recommendations & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h4 className="text-xs font-bold text-secondary uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
            Clinical Recommendations
          </h4>
          <ul className="space-y-2">
            {results.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start text-sm text-gray-700">
                <span className="text-accent mr-2">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
           <h4 className="text-xs font-bold text-secondary uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
            Calculation Breakdown
          </h4>
          <div className="text-xs text-gray-600 space-y-2">
             <p>All doses calculated as EQD2 (Equivalent Dose in 2Gy fractions) using the Linear-Quadratic Model.</p>
             <div className="bg-gray-50 p-2 rounded border border-gray-100">
                <p><strong>Formula:</strong> EQD2 = D × [(d + α/β) / (2 + α/β)]</p>
             </div>
             <p>Tissue-specific α/β ratios applied for each organ structure.</p>
          </div>
        </div>
      </div>

      {/* References Footer Component */}
      <ReferencesSection />
    </div>
  );
}
