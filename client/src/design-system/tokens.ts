/**
 * MASTER DESIGN SYSTEM TOKENS - FLAT DESIGN WITH OKLCH
 * Single source of truth for all styling in the application
 * Using OKLCH color space for precise color representation
 */

// ============================================================================
// COLOR PALETTE - Modern Flat Design Theme
// ============================================================================
export const colors = {
  // Primary Brand Colors - OKLCH Purple Theme
  primary: {
    light: 'oklch(0.4664 0.1906 298.6874)',    // Main primary
    dark: 'oklch(0.4145 0.1828 300.3155)',     // Dark mode primary
    foreground: {
      light: 'oklch(1.0000 0 0)',              // White on primary
      dark: 'oklch(0.9940 0 0)',               // White on primary (dark)
    }
  },
  
  // Secondary Brand Colors - OKLCH Gold/Yellow Theme  
  secondary: {
    light: 'oklch(0.7932 0.0782 87.3519)',    // Main secondary
    dark: 'oklch(0.7364 0.0790 87.2521)',     // Dark mode secondary
    foreground: {
      light: 'oklch(1.0000 0 0)',              // White on secondary
      dark: 'oklch(0.1822 0 0)',               // Dark on secondary
    }
  },
  
  // Accent Colors - Purple variants
  accent: {
    light: 'oklch(0.6565 0.1922 293.8621)',   // Main accent
    dark: 'oklch(0.6056 0.2189 292.7172)',    // Dark mode accent
    foreground: {
      light: 'oklch(1.0000 0 0)',              // White on accent
      dark: 'oklch(0.9940 0 0)',               // White on accent (dark)
    }
  },
  
  // Background & Surface Colors
  background: {
    light: 'oklch(1.0000 0 0)',               // Pure white
    dark: 'oklch(0.1822 0 0)',                // Deep charcoal
  },
  
  // Card & Surface Colors
  card: {
    light: 'oklch(0.9851 0 0)',               // Very light gray
    dark: 'oklch(0.2350 0 0)',                // Dark card surface
  },
  
  // Text Colors
  foreground: {
    light: 'oklch(0.3211 0 0)',               // Dark gray text
    dark: 'oklch(0.9370 0 0)',                // Light text for dark mode
  },
  
  // Border & Input Colors
  border: {
    light: 'oklch(0.8975 0 0)',              // Light border
    dark: 'oklch(0.3211 0 0)',               // Dark border
  },
  
  // Input Colors
  input: {
    light: 'oklch(1.0000 0 0)',              // Light input
    dark: 'oklch(0.2350 0 0)',               // Dark input
  },
  
  // Muted Colors
  muted: {
    light: 'oklch(0.5103 0 0)',              // Light muted
    dark: 'oklch(0.5103 0 0)',               // Dark muted
    foreground: {
      light: 'oklch(0.5103 0 0)',            // Light muted text
      dark: 'oklch(0.7380 0 0)',             // Dark muted text
    }
  },
  
  // Status & System Colors
  destructive: {
    light: 'oklch(0.6368 0.2078 25.3313)',   // Light destructive
    dark: 'oklch(0.5771 0.2152 27.3250)',    // Dark destructive
    foreground: {
      light: 'oklch(1.0000 0 0)',            // White on destructive
      dark: 'oklch(0.9940 0 0)',             // White on destructive (dark)
    }
  },
  
  // Chart Colors
  chart: {
    1: 'oklch(0.4145 0.1828 300.3155)',      // Primary purple
    2: 'oklch(0.6056 0.2189 292.7172)',      // Secondary purple
    3: 'oklch(0.7364 0.0790 87.2521)',       // Gold
    4: 'oklch(0.4210 0.0897 57.7077)',       // Green
    5: 'oklch(0.3791 0.1378 265.5222)',      // Blue
  },
} as const;

// ============================================================================
// TYPOGRAPHY SYSTEM
// ============================================================================
export const typography = {
  // Font Families
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],      // Clean, modern UI font
    serif: ['Cormorant Garamond', 'serif'],          // Elegant decorative font
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
  }
} as const;

// ============================================================================
// SPACING SYSTEM (8px grid)
// ============================================================================
export const spacing = {
  0: '0',
  1: '0.25rem',  // 4px
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
// SHADOW SYSTEM
// ============================================================================
export const shadows = {
  // Light Mode Shadows
  light: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
  },
  
  // Dark Mode Shadows
  dark: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.6)',
  }
} as const;

// ============================================================================
// BORDER RADIUS SYSTEM
// ============================================================================
export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px - Standard for cards/buttons
  lg: '0.75rem',   // 12px - Large cards
  xl: '1rem',      // 16px - Hero sections
  full: '9999px',  // Pills and circular elements
} as const;

// ============================================================================
// COMPONENT-SPECIFIC TOKENS
// ============================================================================
export const components = {
  // Button Styles
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
    borderRadius: borderRadius.md,
    fontWeight: typography.fontWeight.medium,
  },
  
  // Card Styles
  card: {
    padding: spacing[6],           // 24px
    borderRadius: borderRadius.lg, // 12px
    borderWidth: '1px',
    shadow: shadows.light.md,
  },
  
  // Input Styles
  input: {
    height: '2.5rem',              // 40px
    padding: '0.5rem 0.75rem',     // 8px 12px
    borderRadius: borderRadius.md,  // 8px
    borderWidth: '1px',
  }
} as const;

// ============================================================================
// ANIMATION & TRANSITIONS
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
  
  // Transform Effects
  transforms: {
    hoverScale: 'scale(1.02)',
    activeScale: 'scale(0.98)',
    hoverTranslate: 'translateY(-1px)',
  },
  
  // Common Hover Effects
  hover: {
    scale: 'scale(1.02)',
    shadow: shadows.light.lg,
    translate: 'translateY(-1px)',
  }
} as const;

// ============================================================================
// FOCUS & INTERACTION STATES
// ============================================================================
export const focusStates = {
  // Focus Ring Configuration - Updated with exact brand colors
  focusRing: {
    width: '2px',
    color: '#7A51E1', // Exact brand purple
    offset: '2px',
    shadow: '0 0 0 3px rgba(122, 81, 225, 0.1)',
    style: 'solid',
  },
  
  // Ring Colors and Thickness
  rings: {
    primary: {
      width: '3px',
      color: '#7A51E1',  // Exact brand purple
      opacity: '0.1',
    },
    secondary: {
      width: '2px', 
      color: '#E3C76F',  // Exact brand gold
      opacity: '0.15',
    },
  },
  
  // Interactive States - iOS 18 inspired
  states: {
    hover: {
      transform: 'scale(1.05)',  // Slightly more pronounced
      transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      shadowStep: 'md-to-lg',
    },
    focus: {
      outline: '2px solid #7A51E1',  // Exact brand purple
      outlineOffset: '2px',
      boxShadow: '0 0 0 3px rgba(122, 81, 225, 0.1)',
      transition: 'all 150ms ease-out',
    },
    active: {
      transform: 'scale(0.98)',
      transition: 'all 150ms cubic-bezier(0.4, 0, 1, 1)',
    },
  }
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get color value by theme and path
 * @param theme - 'light' | 'dark'
 * @param colorPath - Path to color (e.g., 'primary.500', 'neutral.light.background')
 */
export function getColor(theme: 'light' | 'dark', colorPath: string): string {
  const paths = colorPath.split('.');
  let value: any = colors;
  
  for (const path of paths) {
    value = value?.[path];
  }
  
  // Handle neutral colors with theme-specific values
  if (colorPath.startsWith('neutral.') && !colorPath.includes('.light.') && !colorPath.includes('.dark.')) {
    const neutralPath = colorPath.replace('neutral.', '');
    return colors.neutral[theme]?.[neutralPath as keyof typeof colors.neutral.light] || value;
  }
  
  return value || colorPath;
}

/**
 * Generate CSS custom properties for the design system
 */
export function generateCSSCustomProperties(theme: 'light' | 'dark'): Record<string, string> {
  const themeColors = colors.neutral[theme];
  
  return {
    // Color properties
    '--color-background': themeColors.background,
    '--color-foreground': themeColors.foreground,
    '--color-card': themeColors.card,
    '--color-border': themeColors.border,
    '--color-muted': themeColors.muted,
    '--color-muted-foreground': themeColors['muted-foreground'],
    '--color-primary': colors.primary[500],
    '--color-secondary': colors.secondary[500],
    '--color-success': colors.accent.success,
    '--color-warning': colors.accent.warning,
    '--color-error': colors.accent.error,
    '--color-info': colors.accent.info,
    
    // Typography properties
    '--font-family-sans': typography.fontFamily.sans.join(', '),
    '--font-family-serif': typography.fontFamily.serif.join(', '),
    
    // Spacing properties
    '--spacing-unit': '0.25rem', // 4px base unit
    
    // Shadow properties
    '--shadow-sm': shadows[theme].sm,
    '--shadow-md': shadows[theme].md,
    '--shadow-lg': shadows[theme].lg,
    '--shadow-xl': shadows[theme].xl,
    
    // Border radius properties
    '--border-radius-sm': borderRadius.sm,
    '--border-radius-md': borderRadius.md,
    '--border-radius-lg': borderRadius.lg,
    '--border-radius-xl': borderRadius.xl,
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