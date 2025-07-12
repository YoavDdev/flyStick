"use client";

import React, { ReactNode } from 'react';

// All animations have been completely removed to improve performance

// Static version of ParallaxLayer (no animation)
export const ParallaxLayer = ({ 
  children, 
  className = "",
  speed, // Kept for backward compatibility
  direction, // Kept for backward compatibility
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
  direction?: "vertical" | "horizontal";
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

// Static version of BrushStrokeReveal (no animation)
export const BrushStrokeReveal = ({ 
  children, 
  delay, // Kept for backward compatibility
  duration, // Kept for backward compatibility
  direction, // Kept for backward compatibility
  className = ""
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: "rtl" | "ltr";
  className?: string;
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

// FloatingElement component removed

// Static version of CursorResponsiveElement (no animation)
export const CursorResponsiveElement = ({ 
  children, 
  sensitivity, // Kept for backward compatibility
  className = "",
  perspective, // Kept for backward compatibility
  resetOnLeave // Kept for backward compatibility
}: {
  children: ReactNode;
  sensitivity?: number;
  className?: string;
  perspective?: number;
  resetOnLeave?: boolean;
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

// Static version of InkFlowBorder (no animation)
export const InkFlowBorder = ({ 
  children, 
  color = "#D5C4B7", 
  thickness, // Kept for backward compatibility
  duration, // Kept for backward compatibility
  delay, // Kept for backward compatibility
  className = ""
}: {
  children: ReactNode;
  color?: string;
  thickness?: number;
  duration?: number;
  delay?: number;
  className?: string;
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 pointer-events-none">
        <svg
          className="w-full h-full"
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'visible'
          }}
        >
          <rect
            x={thickness ? thickness/2 : 1}
            y={thickness ? thickness/2 : 1}
            width={`calc(100% - ${thickness || 2}px)`}
            height={`calc(100% - ${thickness || 2}px)`}
            rx="8"
            ry="8"
            fill="transparent"
            stroke={color}
            strokeWidth={thickness || 2}
            strokeLinecap="round"
          />
        </svg>
      </div>
      {children}
    </div>
  );
};

// Static version of BreathingElement (no animation)
export const BreathingElement = ({ 
  children, 
  scale, // Kept for backward compatibility
  duration, // Kept for backward compatibility
  className = ""
}: {
  children: ReactNode;
  scale?: number;
  duration?: number;
  className?: string;
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

// Static version of SectionTransition (no animation)
export const SectionTransition = ({ 
  children, 
  staggerChildren, // Kept for backward compatibility
  duration, // Kept for backward compatibility
  distance, // Kept for backward compatibility
  direction, // Kept for backward compatibility
  className = ""
}: {
  children: ReactNode;
  staggerChildren?: number;
  duration?: number;
  distance?: number;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, child => (
        <div>{child}</div>
      ))}
    </div>
  );
};

// Basic easing functions without dependencies
export const extendedWabiSabiEasing = {
  gentle: [0.4, 0.0, 0.2, 1],
  brush: [0.25, 0.1, 0.25, 1], // Custom easing for brush stroke effects
  water: [0, 0.65, 0.35, 1], // Water-like motion
  bamboo: [0.37, 0, 0.63, 1], // Bamboo swaying motion
  clay: [0.68, -0.6, 0.32, 1.6] // Clay-like organic movement
};
