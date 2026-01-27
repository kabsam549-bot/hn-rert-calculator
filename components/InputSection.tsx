'use client';

import type { PatientData } from '@/lib/types';
import { OAR_CONSTRAINTS } from '@/lib/oarConstraints';

interface InputSectionProps {
  patientData: PatientData;
  setPatientData: (data: PatientData) => void;
  onCalculate: () => void;
  onReset: () => void;
}

export default function InputSection({
  patientData,
  setPatientData,
  onCalculate,
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

  const isFormValid = () => {
    return (
      patientData.priorDose !== undefined &&
      patientData.priorFractions !== undefined &&
      patientData.plannedDose !== undefined &&
      patientData.plannedFractions !== undefined &&
      patientData.timeSinceRT !== undefined &&
      (patientData.selectedOARs?.length ?? 0) > 0
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">H&N Re-Irradiation Calculator</h2>
        <p className="text-sm text-gray-600">Based on MIRI study (Phan et al., 2010) and HyTEC guidelines</p>
      </div>
      
      {/* Prior Radiation */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Prior Radiation Therapy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prior Dose (Gy) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={patientData.priorDose ?? ''}
              onChange={(e) => handleInputChange('priorDose', Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 70"
              min="0"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prior Fractions <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={patientData.priorFractions ?? ''}
              onChange={(e) => handleInputChange('priorFractions', Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 35"
              min="1"
              step="1"
            />
          </div>
        </div>
      </div>

      {/* Planned Radiation */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Planned Re-Irradiation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Planned Dose (Gy) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={patientData.plannedDose ?? ''}
              onChange={(e) => handleInputChange('plannedDose', Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 60"
              min="0"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Planned Fractions <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={patientData.plannedFractions ?? ''}
              onChange={(e) => handleInputChange('plannedFractions', Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 30"
              min="1"
              step="1"
            />
          </div>
        </div>
      </div>

      {/* Time Interval */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Treatment Interval</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Since Prior RT (months) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={patientData.timeSinceRT ?? ''}
              onChange={(e) => handleInputChange('timeSinceRT', Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 18"
              min="0"
              step="1"
            />
            {patientData.timeSinceRT !== undefined && (
              <p className="text-xs text-gray-500 mt-1">
                ≈ {(patientData.timeSinceRT / 12).toFixed(1)} years
              </p>
            )}
          </div>
        </div>
      </div>

      {/* RPA Factors */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Prognostic Factors (RPA)</h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="salvageSurgery"
              checked={patientData.hadSalvageSurgery || false}
              onChange={(e) => handleInputChange('hadSalvageSurgery', e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="salvageSurgery" className="ml-3">
              <span className="block text-sm font-medium text-gray-700">
                Prior Salvage Surgery
              </span>
              <span className="block text-xs text-gray-500">
                Resection of recurrent tumor between RT courses
              </span>
            </label>
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="organDysfunction"
              checked={patientData.hasOrganDysfunction || false}
              onChange={(e) => handleInputChange('hasOrganDysfunction', e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="organDysfunction" className="ml-3">
              <span className="block text-sm font-medium text-gray-700">
                Organ Dysfunction
              </span>
              <span className="block text-xs text-gray-500">
                Feeding tube or tracheostomy dependent
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* OAR Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Organs at Risk <span className="text-red-500">*</span>
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Select organs to evaluate for dose constraints (select at least one)
        </p>
        
        {/* Tier 1: Life-threatening */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-red-700 mb-3 flex items-center">
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded mr-2">TIER 1</span>
            Life-Threatening Toxicities
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {OAR_CONSTRAINTS.filter(oar => oar.tier === 1).map(oar => (
              <label
                key={oar.name}
                className="flex items-start p-3 border border-red-200 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={patientData.selectedOARs?.includes(oar.name) || false}
                  onChange={() => handleOARToggle(oar.name)}
                  className="mt-1 h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <div className="ml-3 flex-1">
                  <span className="block text-sm font-medium text-gray-900">{oar.name}</span>
                  <span className="block text-xs text-gray-600">{oar.complication}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Tier 2: Critical */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-orange-700 mb-3 flex items-center">
            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded mr-2">TIER 2</span>
            Critical Toxicities
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {OAR_CONSTRAINTS.filter(oar => oar.tier === 2).map(oar => (
              <label
                key={oar.name}
                className="flex items-start p-3 border border-orange-200 rounded-lg hover:bg-orange-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={patientData.selectedOARs?.includes(oar.name) || false}
                  onChange={() => handleOARToggle(oar.name)}
                  className="mt-1 h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <div className="ml-3 flex-1">
                  <span className="block text-sm font-medium text-gray-900">{oar.name}</span>
                  <span className="block text-xs text-gray-600">{oar.complication}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Tier 3: Quality of Life */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-blue-700 mb-3 flex items-center">
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">TIER 3</span>
            Quality of Life Toxicities
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {OAR_CONSTRAINTS.filter(oar => oar.tier === 3).map(oar => (
              <label
                key={oar.name}
                className="flex items-start p-3 border border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={patientData.selectedOARs?.includes(oar.name) || false}
                  onChange={() => handleOARToggle(oar.name)}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="ml-3 flex-1">
                  <span className="block text-sm font-medium text-gray-900">{oar.name}</span>
                  <span className="block text-xs text-gray-600">{oar.complication}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6">
        <button
          onClick={onCalculate}
          disabled={!isFormValid()}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Calculate Assessment
        </button>
        <button
          onClick={onReset}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>
      </div>

      {!isFormValid() && (
        <p className="text-sm text-red-600 text-center">
          * Please fill in all required fields and select at least one organ at risk
        </p>
      )}
    </div>
  );
}
