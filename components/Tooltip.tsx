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
        className="inline-flex items-center justify-center w-4 h-4 ml-1 text-xs font-medium border border-gray-400 text-gray-600 rounded-full hover:bg-gray-100 hover:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 cursor-help transition-colors"
        aria-label="Help"
        style={{ fontSize: '0.65rem' }}
      >
        {children || 'i'}
      </button>
      
      {isVisible && (
        <div className="absolute z-50 w-72 p-4 text-sm text-gray-700 bg-white border border-gray-400 rounded-md shadow-md bottom-full left-1/2 transform -translate-x-1/2 mb-2">
          <div className="relative leading-relaxed">
            {content}
            {/* Arrow */}
            <div className="absolute -bottom-[17px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white"></div>
            <div className="absolute -bottom-[19px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[9px] border-t-gray-400"></div>
          </div>
        </div>
      )}
    </div>
  );
}
