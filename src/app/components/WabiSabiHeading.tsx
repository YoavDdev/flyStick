"use client";

import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { standardEasing } from "../styles/standardAnimations";

interface WabiSabiHeadingProps {
  children: ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  align?: "right" | "left" | "center";
  color?: string;
  className?: string;
  withAccent?: boolean;
  accentColor?: string;
  animate?: boolean;
  delay?: number;
}

const WabiSabiHeading: React.FC<WabiSabiHeadingProps> = ({
  children,
  level = 2,
  align = "right",
  color = "#2D3142",
  className = "",
  withAccent = false,
  accentColor = "#B56B4A",
  animate = true,
  delay = 0,
}) => {
  // Define text alignment classes
  const alignmentClasses = {
    right: "text-right",
    left: "text-left",
    center: "text-center",
  };

  // Define font sizes based on heading level
  const fontSizeClasses = {
    1: "text-4xl md:text-5xl lg:text-6xl",
    2: "text-3xl md:text-4xl lg:text-5xl",
    3: "text-2xl md:text-3xl",
    4: "text-xl md:text-2xl",
    5: "text-lg md:text-xl",
    6: "text-base md:text-lg",
  };

  // Define font weights based on heading level
  const fontWeightClasses = {
    1: "font-bold",
    2: "font-bold",
    3: "font-semibold",
    4: "font-medium",
    5: "font-medium",
    6: "font-normal",
  };

  // Define letter spacing for Hebrew text
  const letterSpacingClass = "tracking-wide";

  // Animation variants
  const headingVariants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: standardEasing.slow,
        delay: delay,
      }
    }
  };

  // Create accent element if requested
  const accentElement = withAccent && (
    <motion.span
      className="block h-[3px] rounded-full mt-2 mb-4"
      style={{ 
        background: accentColor,
        width: level <= 2 ? '60px' : '40px',
        marginRight: align === "right" ? '0' : 'auto',
        marginLeft: align === "left" ? '0' : (align === "center" ? 'auto' : 'auto'),
      }}
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: level <= 2 ? '60px' : '40px', opacity: 1 }}
      transition={{ 
        duration: 0.6, 
        delay: delay + 0.3,
        ease: standardEasing.slow 
      }}
    />
  );

  // Combine all classes
  const combinedClasses = `
    ${fontSizeClasses[level]} 
    ${fontWeightClasses[level]} 
    ${alignmentClasses[align]} 
    ${letterSpacingClass} 
    ${className}
    font-serif
  `;

  // Render the appropriate heading element based on level
  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <motion.div
      initial={animate ? "hidden" : "visible"}
      animate="visible"
      variants={headingVariants}
      className="overflow-hidden"
    >
      <HeadingTag 
        className={combinedClasses} 
        style={{ color }}
      >
        {children}
      </HeadingTag>
      {accentElement}
    </motion.div>
  );
};

export default WabiSabiHeading;
