/**
 * Standard Animation Utilities (Static Version)
 * 
 * Static replacements for animation utilities - all animations removed
 */

// Type definitions to maintain compatibility
type Easing = number[];

// Static easing functions (no actual animation effect)
export const standardEasing: Record<string, Easing> = {
  // Kept for compatibility but no animation effect
  gentle: [0.4, 0.0, 0.2, 1],
  standard: [0.25, 0.1, 0.25, 1],
  quick: [0.0, 0.0, 0.2, 1],
  slow: [0.4, 0.0, 1, 1],
};

// Static page transition variants (no actual animation effect)
export const pageTransitionVariants = {
  // All states render the same way - no transitions
  initial: { 
    opacity: 1,
    y: 0,
  },
  animate: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0,
      ease: standardEasing.gentle,
      staggerChildren: 0,
    }
  },
  exit: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0,
      ease: standardEasing.gentle,
    }
  }
};

// Static staggered children variants (no actual animation effect)
export const staggerChildrenVariants = {
  // All states render the same way - no transitions
  initial: { 
    opacity: 1,
    y: 0,
  },
  animate: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0,
      ease: standardEasing.standard,
    }
  }
};

export default {
  standardEasing,
  pageTransitionVariants,
  staggerChildrenVariants,
};
