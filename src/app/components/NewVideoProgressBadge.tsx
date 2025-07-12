"use client";

import React from "react";

interface Props {
  progress: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'minimal' | 'standard' | 'fancy';
  showLabel?: boolean;
}

const NewVideoProgressBadge: React.FC<Props> = ({
  progress,
  className = '',
  size = 'md',
  variant = 'standard',
  showLabel = true
}) => {
  // Always use absolute positioning to prevent layout shifts
  const positionClass = 'absolute';
  // Size mapping
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base'
  };

  // Calculate if video is completed
  const isCompleted = progress >= 99;
  
  // Format progress for display
  const displayProgress = Math.min(Math.round(progress), 100);
  
  // Get size class
  const sizeClass = sizeClasses[size];
  
  // Minimal variant - just a simple line
  if (variant === 'minimal') {
    return (
      <div 
        className={`${positionClass} ${sizeClass} ${className}`}
        title={isCompleted ? "נצפה במלואו" : `התקדמות: ${displayProgress}%`}
      >
        <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full h-1 bg-gray-600 rounded-full overflow-hidden">
            <div 
              style={{ width: `${displayProgress}%` }}
              className={`h-full ${isCompleted ? 'bg-green-500' : 'bg-[#EF8354]'}`}
            />
          </div>
          {showLabel && isCompleted && (
            <div 
              className="absolute inset-0 flex items-center justify-center text-white"
            >
              ✓
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Fancy variant - modern design with glow effect
  if (variant === 'fancy') {
    return (
      <div
        className={`${positionClass} ${sizeClass} ${className}`}
        title={isCompleted ? "נצפה במלואו" : `התקדמות: ${displayProgress}%`}
      >
        <div className={`absolute inset-0 rounded-full ${isCompleted ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gradient-to-br from-[#EF8354] to-[#D9713C]'} flex items-center justify-center shadow-lg ${isCompleted ? 'shadow-green-400/30' : 'shadow-[#EF8354]/30'}`}>
          <div className="absolute inset-0.5 rounded-full bg-gray-900 flex items-center justify-center">
            {isCompleted ? (
              <div
                className="text-green-400 font-bold"
              >
                ✓
              </div>
            ) : (
              <>
                <svg className="absolute inset-0" width="100%" height="100%" viewBox="0 0 100 100">
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="46" 
                    fill="none" 
                    stroke="rgba(255,255,255,0.1)" 
                    strokeWidth="8" 
                  />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="46" 
                    fill="none" 
                    stroke="url(#gradient)" 
                    strokeWidth="8" 
                    strokeDasharray={`${displayProgress * 2.89} 289`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#EF8354" />
                      <stop offset="100%" stopColor="#D9713C" />
                    </linearGradient>
                  </defs>
                </svg>
                {showLabel && (
                  <span className="text-white font-bold z-10">{displayProgress}%</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Standard variant (default)
  return (
    <div
      className={`${positionClass} ${sizeClass} ${className}`}
      title={isCompleted ? "נצפה במלואו" : `התקדמות: ${displayProgress}%`}
    >
      <div className={`absolute inset-0 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-gray-200'} flex items-center justify-center shadow-md`}>
        {isCompleted ? (
          <div className="text-white font-bold">✓</div>
        ) : (
          <>
            <svg className="absolute inset-0" width="100%" height="100%" viewBox="0 0 100 100">
              <circle 
                cx="50" 
                cy="50" 
                r="46" 
                fill="none" 
                stroke="#e5e7eb" 
                strokeWidth="8" 
              />
              <circle 
                cx="50" 
                cy="50" 
                r="46" 
                fill="none" 
                stroke="#4F5D75" 
                strokeWidth="8" 
                strokeDasharray={`${displayProgress * 2.89} 289`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            {showLabel && (
              <span className="text-gray-700 font-bold z-10">{displayProgress}%</span>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NewVideoProgressBadge;
