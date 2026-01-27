'use client';

import { useState } from 'react';

interface ExpandableSectionProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  bgColor?: string;
  borderColor?: string;
  textColor?: string;
}

export default function ExpandableSection({
  title,
  icon = '📖',
  children,
  defaultExpanded = false,
  bgColor = 'bg-blue-50',
  borderColor = 'border-blue-200',
  textColor = 'text-blue-900',
}: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`border ${borderColor} rounded-lg overflow-hidden ${bgColor}`}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full px-4 py-3 flex items-center justify-between ${textColor} font-semibold text-left hover:opacity-80 transition-opacity`}
      >
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span>{title}</span>
        </div>
        <span className="text-lg transform transition-transform" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </button>
      
      {isExpanded && (
        <div className={`px-4 pb-4 ${textColor} text-sm space-y-3 border-t ${borderColor}`}>
          {children}
        </div>
      )}
    </div>
  );
}
