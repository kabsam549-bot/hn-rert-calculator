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
        className="flex items-center justify-center w-3.5 h-3.5 rounded-full border border-gray-400 text-gray-500 hover:text-accent hover:border-accent bg-transparent transition-colors focus:outline-none"
        aria-label="More information"
      >
        <span className="text-[9px] font-serif font-bold italic">i</span>
      </button>
      
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 z-50">
          <div className="bg-header text-white text-xs p-3 rounded shadow-lg leading-relaxed border border-gray-700">
            {content}
            {/* Tiny pointer */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-header"></div>
          </div>
        </div>
      )}
    </div>
  );
}
