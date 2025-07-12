// VideoProgressBadge.tsx
"use client";

import React from "react";

interface Props {
  progress: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  theme?: 'default' | 'dark' | 'light';
  animate?: boolean;
}

const VideoProgressBadge: React.FC<Props> = ({ 
  progress, 
  className = '',
  size = 'md',
  showPercentage = true,
  theme = 'default',
  animate = true
}) => {
  // Size mapping
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  // Theme mapping
  const themeClasses = {
    default: {
      bg: 'bg-[#F3E9E8]',
      text: 'text-[#833414]',
      track: 'text-[#ddd]',
      progress: 'text-[#833414]',
      completed: 'bg-green-100 text-green-700'
    },
    dark: {
      bg: 'bg-gray-800',
      text: 'text-white',
      track: 'text-gray-600',
      progress: 'text-[#EF8354]',
      completed: 'bg-gray-800 text-[#EF8354]'
    },
    light: {
      bg: 'bg-white',
      text: 'text-gray-800',
      track: 'text-gray-200',
      progress: 'text-[#4F5D75]',
      completed: 'bg-white text-[#4F5D75]'
    }
  };

  const selectedSize = sizeClasses[size];
  const selectedTheme = themeClasses[theme];

  // Completed video badge (static version)
  if (progress >= 99) {
    return (
      <div
        title="נצפה במלואו"
        className={`${selectedSize} rounded-full ${selectedTheme.completed} flex items-center justify-center font-bold shadow-md hover:shadow-lg transition-all duration-300 ${className}`}
      >
        ✓
      </div>
    );
  }

  // In-progress video badge (static version)
  return (
    <div
      title={`התקדמות: ${progress}%`}
      className={`relative ${selectedSize} rounded-full ${selectedTheme.bg} flex items-center justify-center ${selectedTheme.text} font-semibold shadow-md hover:shadow-lg transition-all duration-300 ${className}`}
    >
      <svg
        viewBox="0 0 36 36"
        className="w-full h-full absolute top-0 left-0 transform -rotate-90"
      >
        <path
          className={selectedTheme.track}
          d="M18 2.0845
             a 15.9155 15.9155 0 0 1 0 31.831
             a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.8"
        />
        <path
          className={selectedTheme.progress}
          d="M18 2.0845
             a 15.9155 15.9155 0 0 1 0 31.831"
          fill="none"
          stroke="currentColor"
          strokeDasharray={`${progress}, 100`}
          strokeWidth="3.8"
        />
      </svg>
      {showPercentage && <span className="z-10">{progress}%</span>}
    </div>
  );
};

export default VideoProgressBadge;
