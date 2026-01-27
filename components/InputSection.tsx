'use client';

import type { PatientData } from '@/lib/types';
import { OAR_CONSTRAINTS } from '@/lib/oarConstraints';
import Tooltip from './Tooltip';
import ExpandableSection from './ExpandableSection';

interface InputSectionProps {
  patientData: PatientData;
  setPatientData: (data: PatientData) => void;
  onReset: () => void;
}

export default function InputSection({
  patientData,
  setPatientData,
  onReset,
}: InputSectionProps) {
  const handleInputChange = (field: keyof PatientData, value: string | number | boolean | string[]) => {
    setPatientData({
      ...patientData,
      [field]: value,
    });
  };

  const handleOARToggle = (oarName: string) => {
    const currentOARs = patientData.selectedOARs || [];
    const newOARs = currentOARs.includes(oarName)
      ? currentOARs.filter(name => name !== oarName)
      : [...currentOARs, oarName];
    
    handleInputChange('selectedOARs', newOARs);
  };

  const renderSectionHeader = (title: string) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-divider">
      <h3 className="text-sm font-bold text-header uppercase tracking-wider">{title}</h3>
    </div>
  );

  const renderInput = (
    label: string,
    field: keyof PatientData,
    placeholder: string,
    unit?: string,
    tooltip?: React.ReactNode
  ) => (
    <div className="mb-4">
      <label className="block text-xs font-bold text-secondary uppercase tracking-wide mb-1.5 flex items-center">
        {label}
        {tooltip && <Tooltip content={tooltip} />}
      </label>
      <div className="relative">
        <input
          type="number"
          value={patientData[field] as number ?? ''}
          onChange={(e) => handleInputChange(field, Number(e.target.value))}
          className="w-full pl-3 pr-8 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-primary focus:ring-1 focus:ring-accent focus:border-accent transition-all"
          placeholder={placeholder}
          min="0"
          step="0.1"
        />
        {unit && (
          <span className="absolute right-3 top-2 text-xs font-medium text-gray-500">
            {unit}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Prior Radiation Section */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 border-l-4 border-l-header shadow-sm">
        {renderSectionHeader("Prior Radiation Therapy")}
        <div className="grid grid-cols-2 gap-4">
          {renderInput("Prior Total Dose", "priorDose", "e.g. 70", "Gy", "Total physical dose delivered in previous course")}
          {renderInput("Prior Fractions", "priorFractions", "e.g. 35", "fx", "Number of fractions in previous course")}
        </div>
      </div>

      {/* Planned Radiation Section */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 border-l-4 border-l-header shadow-sm">
        {renderSectionHeader("Planned Re-Irradiation")}
        <div className="grid grid-cols-2 gap-4">
          {renderInput("Planned Dose", "plannedDose", "e.g. 60", "Gy", "Total physical dose for new plan")}
          {renderInput("Planned Fractions", "plannedFractions", "e.g. 30", "fx", "Number of fractions for new plan")}
        </div>
      </div>

      {/* Interval & Clinical Factors */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 border-l-4 border-l-header shadow-sm">
        {renderSectionHeader("Clinical Factors")}
        <div className="mb-4">
          {renderInput("Interval Since Prior RT", "timeSinceRT", "e.g. 24", "mo", "Months between end of prior RT and start of re-RT")}
        </div>

        <div className="space-y-3 pt-2">
          <label className="flex items-center p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={patientData.hadSalvageSurgery || false}
              onChange={(e) => handleInputChange('hadSalvageSurgery', e.target.checked)}
              className="h-4 w-4 text-accent border-gray-300 rounded focus:ring-accent"
            />
            <span className="ml-3 text-sm font-medium text-primary">Prior Salvage Surgery</span>
          </label>

          <label className="flex items-center p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={patientData.hasOrganDysfunction || false}
              onChange={(e) => handleInputChange('hasOrganDysfunction', e.target.checked)}
              className="h-4 w-4 text-accent border-gray-300 rounded focus:ring-accent"
            />
            <span className="ml-3 text-sm font-medium text-primary">Organ Dysfunction (Feeding Tube/Trach)</span>
          </label>
        </div>
      </div>

      {/* OAR Selection - Checklist Style */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 border-l-4 border-l-header shadow-sm">
        {renderSectionHeader("Organ Evaluation Selection")}
        <p className="text-xs text-secondary mb-4">Select organs to include in dosimetric assessment.</p>
        
        <div className="space-y-4">
          {[1, 2, 3].map(tier => {
            const tierName = tier === 1 ? "Critical Structures" : tier === 2 ? "Severe Toxicity Risk" : "Quality of Life";
            const tierColor = tier === 1 ? "text-status-critical" : tier === 2 ? "text-status-warning" : "text-status-safe";
            
            return (
              <div key={tier}>
                <h4 className={`text-xs font-bold uppercase ${tierColor} mb-2`}>{tierName}</h4>
                <div className="grid grid-cols-1 gap-1">
                  {OAR_CONSTRAINTS.filter(oar => oar.tier === tier).map(oar => (
                    <label key={oar.name} className="flex items-center group cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={patientData.selectedOARs?.includes(oar.name) || false}
                        onChange={() => handleOARToggle(oar.name)}
                        className="h-3.5 w-3.5 text-accent border-gray-300 rounded focus:ring-accent"
                      />
                      <span className="ml-2 text-xs text-gray-700 group-hover:text-primary transition-colors">{oar.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={onReset}
          className="w-full py-2 text-xs font-bold text-secondary uppercase tracking-wider border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          Reset All Data
        </button>
      </div>

      <div className="mt-8">
        <ExpandableSection title="Reference Guide">
          <div className="space-y-4 text-xs text-secondary">
             <p><strong>BED Formula:</strong> n × d × [1 + d/(α/β)]</p>
             <p><strong>EQD2 Formula:</strong> BED / [1 + 2/(α/β)]</p>
             <p>Based on linear-quadratic model parameters.</p>
          </div>
        </ExpandableSection>
      </div>
    </div>
  );
}
