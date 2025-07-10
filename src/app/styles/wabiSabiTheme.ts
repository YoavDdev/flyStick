/**
 * Wabi-Sabi Theme
 * 
 * A design system inspired by the Japanese aesthetic of Wabi-Sabi,
 * which embraces imperfection, asymmetry, and the beauty of natural aging.
 * 
 * This theme uses:
 * - Earthy, muted color palette
 * - Asymmetrical layouts
 * - Natural textures
 * - Imperfect, organic shapes
 */

export const wabiSabiColors = {
  // Primary earthy tones
  clay: {
    light: '#E6DEDA',
    DEFAULT: '#D5C4B7',
    dark: '#B8A99C',
  },
  stone: {
    light: '#E2E1DD',
    DEFAULT: '#C8C2B7',
    dark: '#A8A295',
  },
  moss: {
    light: '#D1D6C7',
    DEFAULT: '#B3BBA3',
    dark: '#8E9A7C',
  },
  sand: {
    light: '#F2EFE6',
    DEFAULT: '#E5DFD0',
    dark: '#D0C8B0',
  },
  
  // Accent colors - more vibrant but still natural
  rust: {
    light: '#E8B298',
    DEFAULT: '#D9845E',
    dark: '#B56B4A',
  },
  indigo: {
    light: '#A3B1CC',
    DEFAULT: '#7D8FAF',
    dark: '#5C6A85',
  },
  
  // Neutral tones
  charcoal: {
    light: '#5D5D5D',
    DEFAULT: '#3D3D3D',
    dark: '#2A2A2A',
  },
  paper: {
    light: '#FFFCF7',
    DEFAULT: '#F7F3EB',
    dark: '#EAE5D9',
  },
  
  // Functional colors
  success: '#8E9A7C', // moss dark
  error: '#B56B4A', // rust dark
  warning: '#D9845E', // rust default
  info: '#7D8FAF', // indigo default
};

// Border styles for Wabi-Sabi aesthetic
export const wabiSabiBorders = {
  // Slightly uneven borders
  irregular: {
    sm: '0.5px solid rgba(0, 0, 0, 0.1)',
    DEFAULT: '1px solid rgba(0, 0, 0, 0.15)',
    md: '2px solid rgba(0, 0, 0, 0.15)',
    lg: '3px solid rgba(0, 0, 0, 0.15)',
  },
  // Textured borders
  textured: {
    sm: '0.5px dashed rgba(0, 0, 0, 0.15)',
    DEFAULT: '1px dashed rgba(0, 0, 0, 0.2)',
    md: '2px dashed rgba(0, 0, 0, 0.2)',
    lg: '3px dashed rgba(0, 0, 0, 0.2)',
  },
};

// Shadows with natural, soft appearance
export const wabiSabiShadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.04)',
  DEFAULT: '0 2px 4px rgba(0, 0, 0, 0.05), 0 4px 8px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.05), 0 5px 15px rgba(0, 0, 0, 0.05)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.04), 0 15px 30px rgba(0, 0, 0, 0.07)',
};

// Spacing that follows natural, asymmetrical patterns
export const wabiSabiSpacing = {
  xs: '0.375rem', // 6px
  sm: '0.75rem',  // 12px
  md: '1.25rem',  // 20px
  lg: '2.25rem',  // 36px
  xl: '3.75rem',  // 60px
  '2xl': '5rem',  // 80px
};

// Typography styles for Wabi-Sabi aesthetic
export const wabiSabiTypography = {
  fontFamily: {
    // Primary font with organic, handcrafted feel
    primary: '"Noto Serif", "Frank Ruhl Libre", serif',
    // Secondary font for UI elements
    secondary: '"Assistant", "Heebo", sans-serif',
    // Accent font for special elements
    accent: '"Amatic SC", "Rubik", cursive',
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    md: '1.125rem',   // 18px
    lg: '1.25rem',    // 20px
    xl: '1.5rem',     // 24px
    '2xl': '1.875rem', // 30px
    '3xl': '2.25rem',  // 36px
    '4xl': '3rem',     // 48px
    '5xl': '3.75rem',  // 60px
  },
  lineHeight: {
    tight: '1.2',
    normal: '1.5',
    relaxed: '1.75',
    loose: '2',
  },
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
  },
};

// Border radius with slight irregularity
export const wabiSabiRadius = {
  none: '0',
  sm: '0.125rem',
  DEFAULT: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
  // Irregular shapes
  irregular: {
    sm: '0.125rem 0.25rem 0.125rem 0.375rem',
    DEFAULT: '0.25rem 0.5rem 0.25rem 0.375rem',
    md: '0.375rem 0.5rem 0.25rem 0.625rem',
    lg: '0.5rem 0.75rem 0.5rem 0.875rem',
  },
};

// Textures for backgrounds
export const wabiSabiTextures = {
  paper: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 100 100\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.04\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.08\'/%3E%3C/svg%3E")',
  clay: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 100 100\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'turbulence\' baseFrequency=\'0.01\' numOctaves=\'3\' seed=\'2\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.05\'/%3E%3C/svg%3E")',
  stone: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 100 100\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.08\' numOctaves=\'4\' seed=\'5\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.07\'/%3E%3C/svg%3E")',
  wood: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 100 100\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.01 0.15\' numOctaves=\'2\' seed=\'3\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.05\'/%3E%3C/svg%3E")',
};

// Export the complete theme
export const wabiSabiTheme = {
  colors: wabiSabiColors,
  borders: wabiSabiBorders,
  shadows: wabiSabiShadows,
  spacing: wabiSabiSpacing,
  typography: wabiSabiTypography,
  radius: wabiSabiRadius,
  textures: wabiSabiTextures,
};

export default wabiSabiTheme;
