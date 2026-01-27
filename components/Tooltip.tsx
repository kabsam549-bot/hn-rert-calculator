'use client';

import { useState } from 'react';

interface TooltipProps {
  content: string | React.ReactNode;
}

export default function Tooltip({ content }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block ml-1 align-middle">
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="flex items-center justify-center w-4 h-4 rounded-full border border-gray-300 text-gray-400 hover:text-teal-600 hover:border-teal-600 hover:bg-teal-50 bg-transparent transition-all focus:outline-none"
        aria-label="More information"
      >
        <span className="text-[10px] font-bold">i</span>
      </button>
      
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 z-50">
          <div className="bg-gray-800 text-white text-xs p-3 rounded shadow-xl leading-relaxed">
            {content}
            {/* Tiny pointer */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-800"></div>
          </div>
        </div>
      )}
    </div>
  );
}
