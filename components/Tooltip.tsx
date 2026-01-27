'use client';

import { useState } from 'react';

interface TooltipProps {
  content: string | React.ReactNode;
  children?: React.ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="inline-flex items-center justify-center w-5 h-5 ml-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-help transition-colors"
        aria-label="Help"
      >
        {children || '?'}
      </button>
      
      {isVisible && (
        <div className="absolute z-50 w-72 p-3 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg shadow-lg bottom-full left-1/2 transform -translate-x-1/2 mb-2">
          <div className="relative">
            {content}
            {/* Arrow */}
            <div className="absolute -bottom-[14px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white"></div>
            <div className="absolute -bottom-[16px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[9px] border-t-gray-300"></div>
          </div>
        </div>
      )}
    </div>
  );
}
