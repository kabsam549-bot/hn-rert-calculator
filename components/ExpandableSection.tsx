'use client';

import { useState } from 'react';

interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  bgColor?: string;
  borderColor?: string;
  textColor?: string;
}

export default function ExpandableSection({
  title,
  children,
  defaultExpanded = false,
  bgColor = 'bg-gray-50',
  borderColor = 'border-gray-400',
  textColor = 'text-gray-800',
}: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`border ${borderColor} rounded-md overflow-hidden ${bgColor}`}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full px-4 py-3 flex items-center justify-between ${textColor} font-medium text-left hover:bg-opacity-80 transition-all`}
      >
        <span className="text-sm uppercase tracking-wide">{title}</span>
        <span className="text-sm transform transition-transform" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
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
