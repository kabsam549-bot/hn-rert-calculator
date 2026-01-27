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
      case 'High': return 'bg-red-600';
      case 'Moderate': return 'bg-amber-500';
      case 'Low': return 'bg-teal-600';
    }
  };

  const getRiskLabel = (risk: 'Low' | 'Moderate' | 'High') => {
    switch (risk) {
      case 'High': return 'HIGH CUMULATIVE DOSE';
      case 'Moderate': return 'MODERATE CUMULATIVE DOSE';
      case 'Low': return 'FAVORABLE DOSE PROFILE';
    }
  };

  // Status Dot & Label Helper
  const getStatusDisplay = (level: 'safe' | 'caution' | 'exceeds') => {
    switch (level) {
      case 'exceeds':
        return (
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-600 block shadow-sm"></span>
            <span className="text-red-700 font-bold text-xs uppercase tracking-wide">Exceeds</span>
          </div>
        );
      case 'caution':
        return (
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 block shadow-sm"></span>
            <span className="text-amber-700 font-bold text-xs uppercase tracking-wide">Caution</span>
          </div>
        );
      case 'safe':
        return (
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-teal-500 block shadow-sm"></span>
            <span className="text-teal-700 font-bold text-xs uppercase tracking-wide">Acceptable</span>
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
      <div className={`${getRiskColor(results.overallRisk)} text-white px-6 py-5 rounded-lg shadow-lg shadow-gray-200/50 flex items-center justify-between transition-colors`}>
        <div>
          <h2 className="text-xs font-bold opacity-90 tracking-widest uppercase mb-1">Assessment Outcome</h2>
          <p className="text-2xl font-bold tracking-tight">{getRiskLabel(results.overallRisk)}</p>
        </div>
        <div className="text-right hidden sm:block pl-6 border-l border-white/20">
          <p className="text-xs font-medium opacity-80 uppercase tracking-wider">RPA Class</p>
          <p className="text-3xl font-serif font-bold leading-none">{results.rpa.class}</p>
        </div>
      </div>

      {/* 2. Prognostic Classification (RPA) */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-teal-50 px-6 py-3 border-b border-teal-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-teal-900 uppercase tracking-wide">MIRI Prognostic Classification</h3>
          <span className="text-[10px] text-teal-700 bg-white px-2 py-0.5 rounded border border-teal-200">Educational Use Only</span>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0 flex flex-col items-center justify-center p-4 bg-gray-50 border border-gray-200 rounded-lg w-full sm:w-32">
              <span className="text-xs font-bold text-gray-500 uppercase mb-1">Class</span>
              <span className="text-5xl font-serif font-bold text-teal-800">{results.rpa.class}</span>
            </div>
            <div className="flex-grow">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2.5 text-gray-500 font-medium">Estimated 2-Year Survival</td>
                    <td className="py-2.5 text-right font-bold text-gray-900">{results.rpa.survivalEstimate2Year}%</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2.5 text-gray-500 font-medium">Median Survival</td>
                    <td className="py-2.5 text-right font-bold text-gray-900">{results.rpa.medianSurvivalMonths} months</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-gray-500 font-medium align-top pt-3">Interpretation</td>
                    <td className="py-2.5 text-right text-gray-700 leading-snug pt-3 max-w-xs ml-auto">
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
        <div className="bg-teal-700 px-6 py-3 border-b border-teal-800 flex justify-between items-center">
          <h3 className="text-sm font-bold text-white uppercase tracking-wide">Organ Dose Assessment (EQD2)</h3>
          <span className="text-xs text-teal-100/70 font-mono hidden sm:inline">Sorted by: {sortField.toUpperCase()}</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th 
                  className="px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  Organ Structure
                </th>
                <th 
                  className="px-6 py-3 cursor-pointer hover:bg-gray-100 text-center transition-colors"
                  onClick={() => handleSort('tier')}
                >
                  Tier
                </th>
                <th className="px-6 py-3 text-right">Cumulative Dose</th>
                <th className="px-6 py-3 text-right">Limit</th>
                <th 
                  className="px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  Status
                </th>
                <th className="px-6 py-3 text-right">% of Limit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedOARs.map((result) => (
                <tr key={result.oar.name} className="hover:bg-teal-50/50 transition-colors zebra-stripe group">
                  <td className="px-6 py-3 font-medium text-gray-900">
                    {result.oar.name}
                    <span className="block text-[10px] text-gray-400 font-normal mt-0.5">{result.oar.complication}</span>
                    
                    {/* Dose Breakdown Detail */}
                    <div className="mt-1 text-[10px] text-gray-500 font-mono hidden group-hover:block transition-all">
                      <div className="flex flex-col gap-0.5">
                        {result.doseBreakdown.priorEQD2s.map((dose, idx) => (
                           <span key={idx}>Prior {idx + 1}: {dose.toFixed(1)} Gy</span>
                        ))}
                        <span>Planned: {result.doseBreakdown.plannedEQD2.toFixed(1)} Gy</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-center align-top">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shadow-sm ${
                      result.oar.tier === 1 ? 'bg-red-50 text-red-700 border border-red-100' : 
                      result.oar.tier === 2 ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-teal-50 text-teal-700 border border-teal-100'
                    }`}>
                      {result.oar.tier}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right font-mono font-medium text-gray-700 align-top">
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
                      result.percentOfLimit > 100 ? 'text-red-600' : 'text-gray-900'
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
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
            Clinical Considerations
          </h4>
          <ul className="space-y-2.5">
            {results.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start text-sm text-gray-700">
                <span className="text-teal-500 mr-2.5 mt-0.5">•</span>
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
           <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
            Calculation Methodology
          </h4>
          <div className="text-xs text-gray-600 space-y-3">
             <p className="leading-relaxed">All doses calculated as EQD2 (Equivalent Dose in 2Gy fractions) using the Linear-Quadratic Model to account for biological effectiveness.</p>
             <div className="bg-teal-50/50 p-3 rounded border border-teal-100/50 text-teal-800 font-mono text-[11px]">
                <p>EQD2 = D × [(d + α/β) / (2 + α/β)]</p>
             </div>
             <p className="text-gray-500 italic">Tissue-specific α/β ratios are applied for each organ structure based on standard radiobiological data.</p>
          </div>
        </div>
      </div>

      {/* References Footer Component */}
      <ReferencesSection />
    </div>
  );
}
