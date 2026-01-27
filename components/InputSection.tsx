'use client';

import type { PatientData, RTCourse } from '@/lib/types';
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
  const handleInputChange = (field: keyof PatientData, value: string | number | boolean | string[] | RTCourse[]) => {
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

  const toggleTier = (tier: number) => {
    const tierOars = OAR_CONSTRAINTS.filter(o => o.tier === tier).map(o => o.name);
    const current = patientData.selectedOARs || [];
    const allSelected = tierOars.every(name => current.includes(name));
    
    let newOARs;
    if (allSelected) {
        newOARs = current.filter(name => !tierOars.includes(name));
    } else {
        newOARs = Array.from(new Set([...current, ...tierOars]));
    }
    handleInputChange('selectedOARs', newOARs);
  };

  const isTierAllSelected = (tier: number) => {
    const tierOars = OAR_CONSTRAINTS.filter(o => o.tier === tier).map(o => o.name);
    const current = patientData.selectedOARs || [];
    return tierOars.length > 0 && tierOars.every(name => current.includes(name));
  };

  // --- Multi-course Logic ---

  const addPriorCourse = () => {
    const currentCourses = patientData.priorCourses || [];
    if (currentCourses.length >= 5) return;
    // Add new empty course
    const newCourses = [...currentCourses, { dose: undefined, fractions: undefined }];
    handleInputChange('priorCourses', newCourses);
  };

  const removePriorCourse = (index: number) => {
    const currentCourses = patientData.priorCourses || [];
    if (index === 0) return; // Cannot remove first course
    const newCourses = currentCourses.filter((_, i) => i !== index);
    handleInputChange('priorCourses', newCourses);
  };

  const updatePriorCourse = (index: number, field: keyof RTCourse, value: number) => {
    const currentCourses = [...(patientData.priorCourses || [])];
    if (!currentCourses[index]) return;
    
    // Create a new object for the course to ensure immutability
    currentCourses[index] = { ...currentCourses[index], [field]: value };
    handleInputChange('priorCourses', currentCourses);
  };

  const renderSectionHeader = (step: number, title: string, description: string) => (
    <div className="mb-4 pb-2 border-b border-teal-100">
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
          {step}
        </span>
        <h3 className="text-sm font-bold text-teal-900 uppercase tracking-wider">{title}</h3>
      </div>
      <p className="text-xs text-gray-500 mt-1 ml-8">{description}</p>
    </div>
  );

  const renderSimpleInput = (
    label: string,
    value: number | undefined,
    onChange: (val: number) => void,
    placeholder: string,
    unit?: string,
    tooltip?: React.ReactNode
  ) => {
    const hasValue = value !== undefined && value !== null && value.toString() !== '';
    return (
      <div className="mb-4 group">
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 flex items-center">
          {label}
          {tooltip && <Tooltip content={tooltip} />}
          {hasValue && (
            <span className="ml-auto text-teal-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
          )}
        </label>
        <div className="relative">
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full pl-3 pr-8 py-2.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-900 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all outline-none"
            placeholder={placeholder}
            min="0"
            step="0.1"
          />
          {unit && (
            <span className="absolute right-3 top-2.5 text-xs font-medium text-gray-400">
              {unit}
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderPriorCourseCard = (course: RTCourse, index: number) => (
    <div key={index} className="relative bg-gray-50 rounded-md p-4 mb-4 border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wide">
          Prior Course {index + 1}
        </h4>
        {index > 0 && (
          <button
            onClick={() => removePriorCourse(index)}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50"
          >
            <span>Remove</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {renderSimpleInput(
          "Dose",
          course.dose,
          (val) => updatePriorCourse(index, 'dose', val),
          "e.g. 70",
          "Gy"
        )}
        {renderSimpleInput(
          "Fractions",
          course.fractions,
          (val) => updatePriorCourse(index, 'fractions', val),
          "e.g. 35",
          "fx"
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Prior Radiation Section */}
      <div className="bg-white p-5 rounded-lg border border-teal-100 border-l-4 border-l-teal-600 shadow-sm transition-shadow hover:shadow-md">
        {renderSectionHeader(1, "Prior Radiation History", "Enter details for all previous treatment courses")}
        
        {/* List of Prior Courses */}
        <div>
          {patientData.priorCourses?.map((course, index) => renderPriorCourseCard(course, index))}
        </div>

        {/* Add Course Button */}
        {(patientData.priorCourses?.length || 0) < 5 && (
          <button
            onClick={addPriorCourse}
            className="w-full py-2 border-2 border-dashed border-teal-200 text-teal-600 rounded-md text-sm font-bold hover:bg-teal-50 hover:border-teal-400 transition-all flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Prior Course
          </button>
        )}
      </div>

      {/* Planned Radiation Section */}
      <div className="bg-white p-5 rounded-lg border border-teal-100 border-l-4 border-l-teal-600 shadow-sm transition-shadow hover:shadow-md">
        {renderSectionHeader(2, "Planned Re-Irradiation", "Enter proposed dose for the new course")}
        <div className="grid grid-cols-2 gap-4">
          {renderSimpleInput(
            "Planned Dose", 
            patientData.plannedDose,
            (val) => handleInputChange('plannedDose', val),
            "e.g. 60", 
            "Gy", 
            "Total physical dose for new plan"
          )}
          {renderSimpleInput(
            "Planned Fractions", 
            patientData.plannedFractions,
            (val) => handleInputChange('plannedFractions', val),
            "e.g. 30", 
            "fx", 
            "Number of fractions for new plan"
          )}
        </div>
      </div>

      {/* Interval & Clinical Factors */}
      <div className="bg-white p-5 rounded-lg border border-teal-100 border-l-4 border-l-teal-600 shadow-sm transition-shadow hover:shadow-md">
        {renderSectionHeader(3, "Clinical Factors", "Time interval and patient factors")}
        <div className="mb-4">
          {renderSimpleInput(
            "Time since most recent prior RT", 
            patientData.timeSinceRT,
            (val) => handleInputChange('timeSinceRT', val),
            "e.g. 24", 
            "mo", 
            "Months between end of most recent prior RT and start of re-RT"
          )}
        </div>

        <div className="space-y-3 pt-2">
          <label className="flex items-center p-3 border border-gray-200 rounded hover:bg-teal-50 transition-colors cursor-pointer group">
            <input
              type="checkbox"
              checked={patientData.hadSalvageSurgery || false}
              onChange={(e) => handleInputChange('hadSalvageSurgery', e.target.checked)}
              className="h-5 w-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 transition-all"
            />
            <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-teal-900">Prior Salvage Surgery</span>
          </label>

          <label className="flex items-center p-3 border border-gray-200 rounded hover:bg-teal-50 transition-colors cursor-pointer group">
            <input
              type="checkbox"
              checked={patientData.hasOrganDysfunction || false}
              onChange={(e) => handleInputChange('hasOrganDysfunction', e.target.checked)}
              className="h-5 w-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 transition-all"
            />
            <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-teal-900">Organ Dysfunction (Feeding Tube/Trach)</span>
          </label>
        </div>
      </div>

      {/* OAR Selection - Checklist Style */}
      <div className="bg-white p-5 rounded-lg border border-teal-100 border-l-4 border-l-teal-600 shadow-sm transition-shadow hover:shadow-md">
        {renderSectionHeader(4, "Organ Evaluation", "Select all organs that received significant dose")}
        
        <div className="space-y-6">
          {[1, 2, 3].map(tier => {
            const tierName = tier === 1 ? "Critical Structures" : tier === 2 ? "Severe Toxicity Risk" : "Quality of Life";
            const tierColor = tier === 1 ? "text-status-critical" : tier === 2 ? "text-status-warning" : "text-status-safe";
            const bgClass = tier === 1 ? "bg-red-50" : tier === 2 ? "bg-amber-50" : "bg-teal-50";
            
            return (
              <div key={tier} className={`rounded-md p-3 ${bgClass}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`text-xs font-bold uppercase ${tierColor}`}>{tierName}</h4>
                  <button 
                    onClick={() => toggleTier(tier)}
                    className="text-[10px] uppercase font-bold text-gray-500 hover:text-teal-600 tracking-wider"
                  >
                    {isTierAllSelected(tier) ? "Deselect All" : "Select All"}
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {OAR_CONSTRAINTS.filter(oar => oar.tier === tier).map(oar => (
                    <label key={oar.name} className="flex items-center group cursor-pointer py-1.5">
                      <input
                        type="checkbox"
                        checked={patientData.selectedOARs?.includes(oar.name) || false}
                        onChange={() => handleOARToggle(oar.name)}
                        className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 transition-all"
                      />
                      <span className="ml-2 text-xs md:text-sm text-gray-700 group-hover:text-teal-900 transition-colors font-medium">{oar.name}</span>
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
          className="w-full py-3 text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          Reset All Data
        </button>
      </div>

      <div className="mt-8">
        <ExpandableSection title="Reference Guide">
          <div className="space-y-4 text-xs text-gray-600">
             <p><strong>BED Formula:</strong> n × d × [1 + d/(α/β)]</p>
             <p><strong>EQD2 Formula:</strong> BED / [1 + 2/(α/β)]</p>
             <p>Based on linear-quadratic model parameters.</p>
          </div>
        </ExpandableSection>
      </div>
    </div>
  );
}
