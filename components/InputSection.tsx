'use client';

import type { PatientData } from '@/lib/types';

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
  const handleInputChange = (field: keyof PatientData, value: string | number) => {
    setPatientData({
      ...patientData,
      [field]: value,
    });
  };

  const isFormValid = () => {
    return (
      patientData.age !== undefined &&
      patientData.priorDose !== undefined &&
      patientData.timeSinceRT !== undefined &&
      patientData.tumorLocation !== '' &&
      patientData.performance !== undefined
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Patient Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Age */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Age (years)
          </label>
          <input
            type="number"
            value={patientData.age || ''}
            onChange={(e) => handleInputChange('age', Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter age"
            min="0"
            max="120"
          />
        </div>

        {/* Prior Radiation Dose */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prior Radiation Dose (Gy)
          </label>
          <input
            type="number"
            value={patientData.priorDose || ''}
            onChange={(e) => handleInputChange('priorDose', Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter dose in Gray"
            min="0"
            step="0.1"
          />
        </div>

        {/* Time Since Prior RT */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Since Prior RT (months)
          </label>
          <input
            type="number"
            value={patientData.timeSinceRT || ''}
            onChange={(e) => handleInputChange('timeSinceRT', Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter months"
            min="0"
          />
        </div>

        {/* Performance Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ECOG Performance Status
          </label>
          <select
            value={patientData.performance || ''}
            onChange={(e) => handleInputChange('performance', Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select status</option>
            <option value="0">0 - Fully active</option>
            <option value="1">1 - Restricted in strenuous activity</option>
            <option value="2">2 - Ambulatory, capable of self-care</option>
            <option value="3">3 - Limited self-care</option>
            <option value="4">4 - Completely disabled</option>
          </select>
        </div>

        {/* Tumor Location */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tumor Location
          </label>
          <select
            value={patientData.tumorLocation}
            onChange={(e) => handleInputChange('tumorLocation', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select location</option>
            <option value="nasopharynx">Nasopharynx</option>
            <option value="oropharynx">Oropharynx</option>
            <option value="larynx">Larynx</option>
            <option value="hypopharynx">Hypopharynx</option>
            <option value="oral_cavity">Oral Cavity</option>
            <option value="salivary">Salivary Glands</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={onCalculate}
          disabled={!isFormValid()}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Calculate Risk
        </button>
        <button
          onClick={onReset}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
