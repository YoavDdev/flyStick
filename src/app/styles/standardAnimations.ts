/**
 * Standard Animation Utilities
 * 
 * Basic animation utilities for the application
 */

import { Easing, cubicBezier } from 'framer-motion';

// Standard easing functions
export const standardEasing: Record<string, Easing> = {
  // Standard ease-in-out
  gentle: [0.4, 0.0, 0.2, 1],
  // Standard ease
  standard: [0.25, 0.1, 0.25, 1],
  // Quick ease-out
  quick: [0.0, 0.0, 0.2, 1],
  // Slow ease-in
  slow: [0.4, 0.0, 1, 1],
};

// Page transition variants
export const pageTransitionVariants = {
  initial: { 
    opacity: 0,
    y: 5,
  },
  animate: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: standardEasing.gentle,
      staggerChildren: 0.1,
    }
  },
  exit: { 
    opacity: 0,
    y: 5,
    transition: {
      duration: 0.4,
      ease: standardEasing.gentle,
    }
  }
};

// Staggered children animation variants
export const staggerChildrenVariants = {
  initial: { 
    opacity: 0,
    y: 15,
  },
  animate: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: standardEasing.standard,
    }
  }
};

export default {
  standardEasing,
  pageTransitionVariants,
  staggerChildrenVariants,
};
