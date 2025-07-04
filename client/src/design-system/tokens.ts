
/**
 * MASTER DESIGN SYSTEM TOKENS - FLAT DESIGN WITH OKLCH
 * Single source of truth for all styling in the application
 * Using OKLCH color space for precise color representation
 * UPDATED TO MATCH EXACT SPECIFICATION - COMPLETELY FLAT DESIGN
 */

// ============================================================================
// COLOR PALETTE - Exact Specification Match
// ============================================================================
export const colors = {
  // Primary Brand Colors - EXACT OKLCH VALUES FROM SPEC
  primary: {
    light: 'oklch(0.4664 0.1906 298.6874)',    // Exact match
    dark: 'oklch(0.4145 0.1828 300.3155)',     // Exact match
    foreground: {
      light: 'oklch(1.0000 0 0)',              // Pure white
      dark: 'oklch(0.9940 0 0)',               // Near white for dark
    }
  },
  
  // Secondary Brand Colors - EXACT OKLCH VALUES FROM SPEC
  secondary: {
    light: 'oklch(0.7932 0.0782 87.3519)',    // Exact match
    dark: 'oklch(0.7364 0.0790 87.2521)',     // Exact match
    foreground: {
      light: 'oklch(1.0000 0 0)',              // White on secondary
      dark: 'oklch(0.1822 0 0)',               // Dark on secondary
    }
  },
  
  // Accent Colors - EXACT OKLCH VALUES FROM SPEC
  accent: {
    light: 'oklch(0.6565 0.1922 293.8621)',   // Exact match
    dark: 'oklch(0.6056 0.2189 292.7172)',    // Exact match
    foreground: {
      light: 'oklch(1.0000 0 0)',              // White on accent
      dark: 'oklch(0.9940 0 0)',               // Near white on accent
    }
  },
  
  // Background & Surface Colors - EXACT MATCH
  background: {
    light: 'oklch(1.0000 0 0)',               // Pure white
    dark: 'oklch(0.1822 0 0)',                // Exact dark background
  },
  
  // Card & Surface Colors - EXACT MATCH
  card: {
    light: 'oklch(0.9851 0 0)',               // Exact light card
    dark: 'oklch(0.2350 0 0)',                // Exact dark card
  },
  
  // Text Colors - EXACT MATCH
  foreground: {
    light: 'oklch(0.3211 0 0)',               // Exact text color
    dark: 'oklch(0.9370 0 0)',                // Exact dark text
  },
  
  // Border & Input Colors - EXACT MATCH
  border: {
    light: 'oklch(0.8975 0 0)',              // Exact border
    dark: 'oklch(0.3211 0 0)',               // Exact dark border
  },
  
  // Input Colors - EXACT MATCH
  input: {
    light: 'oklch(1.0000 0 0)',              // Pure white input
    dark: 'oklch(0.2350 0 0)',               // Exact dark input
  },
  
  // Muted Colors - EXACT MATCH
  muted: {
    light: 'oklch(0.5103 0 0)',              // Exact muted
    dark: 'oklch(0.5103 0 0)',               // Same for both
    foreground: {
      light: 'oklch(0.5103 0 0)',            // Exact muted text
      dark: 'oklch(0.7380 0 0)',             // Exact dark muted text
    }
  },
  
  // Status & System Colors - EXACT MATCH
  destructive: {
    light: 'oklch(0.6368 0.2078 25.3313)',   // Exact destructive
    dark: 'oklch(0.5771 0.2152 27.3250)',    // Exact dark destructive
    foreground: {
      light: 'oklch(1.0000 0 0)',            // White on destructive
      dark: 'oklch(0.9940 0 0)',             // Near white on destructive
    }
  },
  
  // Chart Colors - EXACT MATCH
  chart: {
    1: 'oklch(0.4145 0.1828 300.3155)',      // Exact chart-1
    2: 'oklch(0.6056 0.2189 292.7172)',      // Exact chart-2
    3: 'oklch(0.7364 0.0790 87.2521)',       // Exact chart-3
    4: 'oklch(0.4210 0.0897 57.7077)',       // Exact chart-4
    5: 'oklch(0.3791 0.1378 265.5222)',      // Exact chart-5
  },
  
  // Sidebar Colors - EXACT MATCH FROM SPEC
  sidebar: {
    light: 'oklch(0.9672 0 0)',              // Exact sidebar background
    dark: 'oklch(0.2350 0 0)',               // Exact dark sidebar
    foreground: {
      light: 'oklch(0.1776 0 0)',            // Exact sidebar text
      dark: 'oklch(0.9940 0 0)',             // Exact dark sidebar text
    },
    primary: 'oklch(0.4145 0.1828 300.3155)', // Exact sidebar primary
    accent: 'oklch(0.5510 0.0234 264.3637)',  // Exact sidebar accent
    border: {
      light: 'oklch(0 0 0)',                 // Black border light
      dark: 'oklch(1.0000 0 0)',             // White border dark
    }
  },
} as const;

// ============================================================================
// TYPOGRAPHY SYSTEM - EXACT SPECIFICATION
// ============================================================================
export const typography = {
  // Font Families - EXACT MATCH
  fontFamily: {
    sans: ['Inter UI', 'sans-serif'],              // Exact match
    serif: ['Cormorant', 'serif'],                 // Exact match
    mono: ['Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
  },
  
  // Font Sizes (rem units for scalability)
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },
  
  // Font Weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Line Heights
  lineHeight: {
    tight: '1.1',
    normal: '1.5',
    relaxed: '1.75',
  },
  
  // Letter Spacing - EXACT MATCH
  letterSpacing: {
    tighter: 'calc(0.025em - 0.05em)',
    tight: 'calc(0.025em - 0.025em)',
    normal: '0.025em',                  // EXACT MATCH FROM SPEC
    wide: 'calc(0.025em + 0.025em)',
    wider: 'calc(0.025em + 0.05em)',
    widest: 'calc(0.025em + 0.1em)',
  }
} as const;

// ============================================================================
// SPACING SYSTEM (0.25rem base unit)
// ============================================================================
export const spacing = {
  0: '0',
  1: '0.25rem',  // 4px - EXACT BASE UNIT FROM SPEC
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
} as const;

// ============================================================================
// SHADOW SYSTEM - COMPLETELY FLAT (ALL ZEROS)
// ============================================================================
export const shadows = {
  // ALL SHADOWS ARE 0px - COMPLETELY FLAT DESIGN
  light: {
    sm: '0px 0px 0px 0px hsl(0 0% 0% / 0.00)',
    md: '0px 0px 0px 0px hsl(0 0% 0% / 0.00)',
    lg: '0px 0px 0px 0px hsl(0 0% 0% / 0.00)',
    xl: '0px 0px 0px 0px hsl(0 0% 0% / 0.00)',
  },
  
  // ALL SHADOWS ARE 0px - COMPLETELY FLAT DESIGN
  dark: {
    sm: '0px 0px 0px 0px hsl(0 0% 100% / 0.00)',
    md: '0px 0px 0px 0px hsl(0 0% 100% / 0.00)',
    lg: '0px 0px 0px 0px hsl(0 0% 100% / 0.00)',
    xl: '0px 0px 0px 0px hsl(0 0% 100% / 0.00)',
  }
} as const;

// ============================================================================
// BORDER RADIUS SYSTEM - COMPLETELY FLAT (ALL ZEROS)
// ============================================================================
export const borderRadius = {
  none: '0px',      // EXACT MATCH - NO RADIUS
  sm: '0px',        // EXACT MATCH - NO RADIUS
  md: '0px',        // EXACT MATCH - NO RADIUS
  lg: '0px',        // EXACT MATCH - NO RADIUS
  xl: '0px',        // EXACT MATCH - NO RADIUS
  full: '0px',      // EXACT MATCH - NO RADIUS (FLAT DESIGN)
} as const;

// ============================================================================
// COMPONENT-SPECIFIC TOKENS - FLAT DESIGN
// ============================================================================
export const components = {
  // Button Styles - FLAT DESIGN
  button: {
    height: {
      sm: '2rem',      // 32px
      md: '2.5rem',    // 40px
      lg: '3rem',      // 48px
    },
    padding: {
      sm: '0.5rem 0.75rem',
      md: '0.75rem 1rem',
      lg: '1rem 1.5rem',
    },
    borderRadius: '0px',           // FLAT - NO RADIUS
    fontWeight: typography.fontWeight.medium,
    shadow: '0px 0px 0px 0px hsl(0 0% 0% / 0.00)', // NO SHADOW
  },
  
  // Card Styles - FLAT DESIGN
  card: {
    padding: spacing[6],           // 24px
    borderRadius: '0px',           // FLAT - NO RADIUS
    borderWidth: '1px',
    shadow: '0px 0px 0px 0px hsl(0 0% 0% / 0.00)', // NO SHADOW
  },
  
  // Input Styles - FLAT DESIGN
  input: {
    height: '2.5rem',              // 40px
    padding: '0.5rem 0.75rem',     // 8px 12px
    borderRadius: '0px',           // FLAT - NO RADIUS
    borderWidth: '1px',
  }
} as const;

// ============================================================================
// ANIMATION & TRANSITIONS - MINIMAL FOR FLAT DESIGN
// ============================================================================
export const animations = {
  // Transition Durations
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    hover: '200ms',
    modal: '300ms',
    focus: '150ms',
  },
  
  // Easing Functions
  easing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    easeOut: 'ease-out',
  },
  
  // NO TRANSFORM EFFECTS FOR FLAT DESIGN
  transforms: {
    hoverScale: 'scale(1)',        // NO SCALE
    activeScale: 'scale(1)',       // NO SCALE
    hoverTranslate: 'translateY(0)', // NO TRANSLATE
  },
  
  // NO HOVER EFFECTS FOR FLAT DESIGN
  hover: {
    scale: 'scale(1)',             // NO SCALE
    shadow: '0px 0px 0px 0px hsl(0 0% 0% / 0.00)', // NO SHADOW
    translate: 'translateY(0)',    // NO TRANSLATE
  }
} as const;

// ============================================================================
// FOCUS & INTERACTION STATES - FLAT DESIGN
// ============================================================================
export const focusStates = {
  // Focus Ring Configuration - EXACT BRAND COLORS, NO SHADOWS
  focusRing: {
    width: '2px',
    color: 'oklch(0.4145 0.1828 300.3155)', // Exact primary color
    offset: '2px',
    shadow: 'none',                          // NO SHADOW
    style: 'solid',
  },
  
  // Ring Colors and Thickness - NO SHADOWS
  rings: {
    primary: {
      width: '2px',
      color: 'oklch(0.4145 0.1828 300.3155)',  // Exact primary
      opacity: '1',                            // Full opacity, no blur
    },
    secondary: {
      width: '2px', 
      color: 'oklch(0.7364 0.0790 87.2521)',   // Exact secondary
      opacity: '1',                            // Full opacity, no blur
    },
  },
  
  // Interactive States - FLAT DESIGN (NO TRANSFORMS/SHADOWS)
  states: {
    hover: {
      transform: 'none',                      // NO TRANSFORM
      transition: 'all 200ms ease',
      shadowStep: 'none',                     // NO SHADOW
    },
    focus: {
      outline: '2px solid var(--primary)', // Use design token
      outlineOffset: '2px',
      boxShadow: 'none',                      // NO SHADOW
      transition: 'all 150ms ease-out',
    },
    active: {
      transform: 'none',                      // NO TRANSFORM
      transition: 'all 150ms ease',
    },
  }
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get color value by theme and path
 */
export function getColor(theme: 'light' | 'dark', colorPath: string): string {
  const paths = colorPath.split('.');
  let value: any = colors;
  
  for (const path of paths) {
    value = value?.[path];
  }
  
  return value || colorPath;
}

/**
 * Generate CSS custom properties for the design system
 */
export function generateCSSCustomProperties(theme: 'light' | 'dark'): Record<string, string> {
  return {
    // Color properties - EXACT OKLCH VALUES
    '--color-background': colors.background[theme],
    '--color-foreground': colors.foreground[theme],
    '--color-card': colors.card[theme],
    '--color-border': colors.border[theme],
    '--color-muted': colors.muted[theme],
    '--color-muted-foreground': colors.muted.foreground[theme],
    '--color-primary': colors.primary[theme],
    '--color-secondary': colors.secondary[theme],
    '--color-accent': colors.accent[theme],
    '--color-destructive': colors.destructive[theme],
    
    // Typography properties - EXACT MATCH
    '--font-family-sans': typography.fontFamily.sans.join(', '),
    '--font-family-serif': typography.fontFamily.serif.join(', '),
    '--font-family-mono': typography.fontFamily.mono.join(', '),
    
    // Spacing properties
    '--spacing-unit': '0.25rem', // EXACT BASE UNIT
    
    // Shadow properties - ALL ZERO
    '--shadow-sm': shadows[theme].sm,
    '--shadow-md': shadows[theme].md,
    '--shadow-lg': shadows[theme].lg,
    '--shadow-xl': shadows[theme].xl,
    
    // Border radius properties - ALL ZERO
    '--border-radius-sm': borderRadius.sm,
    '--border-radius-md': borderRadius.md,
    '--border-radius-lg': borderRadius.lg,
    '--border-radius-xl': borderRadius.xl,
    
    // Letter spacing - EXACT MATCH
    '--letter-spacing-normal': typography.letterSpacing.normal,
  };
}

// Export design system as default
export const designSystem = {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  components,
  animations,
  focusStates,
  getColor,
  generateCSSCustomProperties,
} as const;

export default designSystem;
