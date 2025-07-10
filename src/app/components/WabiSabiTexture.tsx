"use client";

import React from 'react';
import { motion, Variants, Easing } from 'framer-motion';

interface WabiSabiTextureProps {
  type?: 'paper' | 'clay' | 'stone' | 'wood';
  opacity?: number;
  className?: string;
  animate?: boolean;
}

/**
 * WabiSabiTexture Component
 * 
 * Adds natural, organic textures to elements following Wabi-Sabi aesthetic principles.
 * Can be used as an overlay or background element.
 */
const WabiSabiTexture: React.FC<WabiSabiTextureProps> = ({
  type = 'paper',
  opacity = 0.08,
  className = '',
  animate = false,
}) => {
  // SVG filters for different texture types
  const filters = {
    paper: (
      <filter id="paperTexture">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" />
      </filter>
    ),
    clay: (
      <filter id="clayTexture">
        <feTurbulence type="turbulence" baseFrequency="0.01" numOctaves="3" seed="2" />
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" />
      </filter>
    ),
    stone: (
      <filter id="stoneTexture">
        <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="4" seed="5" />
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" />
      </filter>
    ),
    wood: (
      <filter id="woodTexture">
        <feTurbulence type="fractalNoise" baseFrequency="0.01 0.15" numOctaves="2" seed="3" />
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" />
      </filter>
    ),
  };

  // Animation variants for subtle movement
  const animationVariants: Variants = {
    initial: { 
      opacity: opacity,
      scale: 1,
    },
    animate: {
      opacity: [opacity, opacity * 1.2, opacity],
      scale: [1, 1.01, 1],
      transition: {
        duration: 8,
        ease: [0.43, 0.13, 0.23, 0.96], // Cubic bezier easing function (similar to easeInOut)
        repeat: Infinity,
        repeatType: "reverse" as const,
      },
    },
  };

  const filterId = `${type}Texture`;

  return (
    <motion.div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      initial="initial"
      animate={animate ? "animate" : "initial"}
      variants={animationVariants}
      aria-hidden="true"
    >
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        preserveAspectRatio="none"
      >
        <defs>{filters[type]}</defs>
        <rect width="100%" height="100%" filter={`url(#${filterId})`} opacity={opacity} />
      </svg>
    </motion.div>
  );
};

export default WabiSabiTexture;
