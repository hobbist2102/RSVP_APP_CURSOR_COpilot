/**
 * COMPREHENSIVE DESIGN SYSTEM TOKENS - ABSOLUTE SINGLE SOURCE OF TRUTH
 * Zero tolerance for any colors outside this system
 * Complete flat design system with professional enterprise standards
 */

// ============================================================================
// COMPLETE COLOR SYSTEM - ONLY THESE COLORS ARE ALLOWED
// ============================================================================
export const AUTHORIZED_COLORS = {
  // Brand Colors (Purple/Gold from specification)
  primary: {
    50: 'oklch(0.95 0.02 300)',
    100: 'oklch(0.90 0.04 300)', 
    500: 'oklch(0.55 0.18 300)',  // Main purple
    600: 'oklch(0.50 0.20 300)',
    900: 'oklch(0.25 0.15 300)',
  },
  
  gold: {
    50: 'oklch(0.95 0.02 87)',
    100: 'oklch(0.90 0.04 87)',
    500: 'oklch(0.75 0.08 87)',   // Main gold
    600: 'oklch(0.70 0.09 87)',
    900: 'oklch(0.40 0.06 87)',
  },
  
  // Neutral Colors (Grayscale only)
  neutral: {
    0: 'oklch(1.0000 0 0)',      // Pure white
    50: 'oklch(0.9851 0 0)',     // Lightest gray
    100: 'oklch(0.9672 0 0)',    // Light gray
    200: 'oklch(0.8975 0 0)',    // Border gray
    300: 'oklch(0.7380 0 0)',    // Muted gray
    500: 'oklch(0.5103 0 0)',    // Mid gray
    700: 'oklch(0.3211 0 0)',    // Text gray
    800: 'oklch(0.2350 0 0)',    // Dark gray
    900: 'oklch(0.1822 0 0)',    // Darkest gray
    1000: 'oklch(0.0000 0 0)',   // Pure black
  },
  
  // Status Colors (Minimal set)
  status: {
    error: 'oklch(0.64 0.21 25)',     // Red for errors only
    success: 'oklch(0.65 0.15 145)',  // Green for success only  
    warning: 'oklch(0.75 0.12 85)',   // Amber for warnings only
  }
} as const;

// ============================================================================
// SEMANTIC COLOR MAPPINGS - SINGLE SOURCE OF TRUTH
// ============================================================================
export const SEMANTIC_COLORS = {
  light: {
    // Background Colors
    background: AUTHORIZED_COLORS.neutral[0],       // Pure white
    backgroundSecondary: AUTHORIZED_COLORS.neutral[50], // Light gray
    
    // Surface Colors
    card: AUTHORIZED_COLORS.neutral[50],            // Light card
    surface: AUTHORIZED_COLORS.neutral[100],        // Surface
    
    // Text Colors
    foreground: AUTHORIZED_COLORS.neutral[700],     // Main text
    foregroundSecondary: AUTHORIZED_COLORS.neutral[500], // Secondary text
    foregroundMuted: AUTHORIZED_COLORS.neutral[300], // Muted text
    
    // Border Colors
    border: AUTHORIZED_COLORS.neutral[200],         // Main border
    borderSecondary: AUTHORIZED_COLORS.neutral[100], // Light border
    
    // Brand Colors
    accent: AUTHORIZED_COLORS.primary[500],         // Purple accent
    accentSecondary: AUTHORIZED_COLORS.gold[500],   // Gold accent
    
    // Interactive Colors
    hover: AUTHORIZED_COLORS.neutral[100],          // Hover background
    focus: AUTHORIZED_COLORS.primary[500],          // Focus ring
    
    // Status Colors
    destructive: AUTHORIZED_COLORS.status.error,   // Error states
    success: AUTHORIZED_COLORS.status.success,     // Success states
    warning: AUTHORIZED_COLORS.status.warning,     // Warning states
  },
  
  dark: {
    // Background Colors  
    background: AUTHORIZED_COLORS.neutral[900],     // Dark background
    backgroundSecondary: AUTHORIZED_COLORS.neutral[800], // Secondary dark
    
    // Surface Colors
    card: AUTHORIZED_COLORS.neutral[800],           // Dark card
    surface: AUTHORIZED_COLORS.neutral[700],        // Dark surface
    
    // Text Colors
    foreground: AUTHORIZED_COLORS.neutral[50],      // Light text
    foregroundSecondary: AUTHORIZED_COLORS.neutral[300], // Secondary text
    foregroundMuted: AUTHORIZED_COLORS.neutral[500], // Muted text
    
    // Border Colors
    border: AUTHORIZED_COLORS.neutral[700],         // Dark border
    borderSecondary: AUTHORIZED_COLORS.neutral[800], // Darker border
    
    // Brand Colors
    accent: AUTHORIZED_COLORS.primary[500],         // Purple accent
    accentSecondary: AUTHORIZED_COLORS.gold[500],   // Gold accent
    
    // Interactive Colors
    hover: AUTHORIZED_COLORS.neutral[800],          // Dark hover
    focus: AUTHORIZED_COLORS.primary[500],          // Focus ring
    
    // Status Colors
    destructive: AUTHORIZED_COLORS.status.error,   // Error states
    success: AUTHORIZED_COLORS.status.success,     // Success states
    warning: AUTHORIZED_COLORS.status.warning,     // Warning states
  }
} as const;

// ============================================================================
// TYPOGRAPHY SYSTEM - COMPLETE SPECIFICATIONS
// ============================================================================
export const TYPOGRAPHY = {
  // Font Families - ONLY THESE ARE ALLOWED
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    serif: ['Cormorant Garamond', 'serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
  
  // Font Sizes - 16px base scale
  fontSize: {
    xs: '12px',     // 0.75rem
    sm: '14px',     // 0.875rem  
    base: '16px',   // 1rem - BASE SIZE
    lg: '18px',     // 1.125rem
    xl: '20px',     // 1.25rem
    '2xl': '24px',  // 1.5rem
    '3xl': '30px',  // 1.875rem
    '4xl': '36px',  // 2.25rem
    '5xl': '48px',  // 3rem
  },
  
  // Font Weights - Limited professional set
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Line Heights - Professional ratios
  lineHeight: {
    tight: '1.25',   // Headings
    normal: '1.5',   // Body text
    relaxed: '1.75', // Long form content
  },
  
  // Letter Spacing - Minimal professional adjustments
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  }
} as const;

// ============================================================================
// SPACING SYSTEM - 4px BASE GRID
// ============================================================================
export const SPACING = {
  0: '0px',
  1: '4px',     // Base unit
  2: '8px',     // 2x base
  3: '12px',    // 3x base
  4: '16px',    // 4x base - Standard padding
  5: '20px',    // 5x base
  6: '24px',    // 6x base - Card padding
  8: '32px',    // 8x base - Section spacing
  10: '40px',   // 10x base
  12: '48px',   // 12x base - Large spacing
  16: '64px',   // 16x base - Page margins
  20: '80px',   // 20x base
  24: '96px',   // 24x base - Hero spacing
} as const;

// ============================================================================
// COMPONENT SPECIFICATIONS - COMPLETE DEFINITIONS
// ============================================================================
export const COMPONENT_SPECS = {
  // Button Specifications
  button: {
    base: {
      fontFamily: TYPOGRAPHY.fontFamily.sans,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      fontSize: TYPOGRAPHY.fontSize.sm,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      borderRadius: '0px',  // FLAT DESIGN
      border: '1px solid',
      cursor: 'pointer',
      transition: 'all 200ms ease',
      textAlign: 'center' as const,
    },
    sizes: {
      sm: {
        height: '32px',
        padding: '6px 12px',
        fontSize: TYPOGRAPHY.fontSize.xs,
      },
      md: {
        height: '40px', 
        padding: '8px 16px',
        fontSize: TYPOGRAPHY.fontSize.sm,
      },
      lg: {
        height: '48px',
        padding: '12px 24px', 
        fontSize: TYPOGRAPHY.fontSize.base,
      }
    },
    variants: {
      primary: (theme: 'light' | 'dark') => ({
        backgroundColor: SEMANTIC_COLORS[theme].accent,
        color: AUTHORIZED_COLORS.neutral[0],
        borderColor: SEMANTIC_COLORS[theme].accent,
        hoverBackgroundColor: AUTHORIZED_COLORS.primary[600],
      }),
      secondary: (theme: 'light' | 'dark') => ({
        backgroundColor: SEMANTIC_COLORS[theme].card,
        color: SEMANTIC_COLORS[theme].foreground,
        borderColor: SEMANTIC_COLORS[theme].border,
        hoverBackgroundColor: SEMANTIC_COLORS[theme].hover,
      }),
      outline: (theme: 'light' | 'dark') => ({
        backgroundColor: 'transparent',
        color: SEMANTIC_COLORS[theme].foreground,
        borderColor: SEMANTIC_COLORS[theme].border,
        hoverBackgroundColor: SEMANTIC_COLORS[theme].hover,
      }),
      ghost: (theme: 'light' | 'dark') => ({
        backgroundColor: 'transparent',
        color: SEMANTIC_COLORS[theme].foreground,
        border: 'none',
        hoverBackgroundColor: SEMANTIC_COLORS[theme].hover,
      })
    }
  },
  
  // Card Specifications
  card: {
    base: {
      backgroundColor: (theme: 'light' | 'dark') => SEMANTIC_COLORS[theme].card,
      border: `1px solid`,
      borderColor: (theme: 'light' | 'dark') => SEMANTIC_COLORS[theme].border,
      borderRadius: '0px',  // FLAT DESIGN
      padding: SPACING[6],   // 24px
      fontFamily: TYPOGRAPHY.fontFamily.sans,
    },
    variants: {
      default: {},
      elevated: {
        borderWidth: '2px',
      }
    }
  },
  
  // Input Specifications
  input: {
    base: {
      height: '40px',
      padding: '8px 12px',
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.sans,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      backgroundColor: (theme: 'light' | 'dark') => SEMANTIC_COLORS[theme].background,
      color: (theme: 'light' | 'dark') => SEMANTIC_COLORS[theme].foreground,
      border: '1px solid',
      borderColor: (theme: 'light' | 'dark') => SEMANTIC_COLORS[theme].border,
      borderRadius: '0px',  // FLAT DESIGN
      outline: 'none',
      transition: 'border-color 200ms ease',
    },
    states: {
      focus: (theme: 'light' | 'dark') => ({
        borderColor: SEMANTIC_COLORS[theme].accent,
        outline: `2px solid ${SEMANTIC_COLORS[theme].accent}20`,
      }),
      error: (theme: 'light' | 'dark') => ({
        borderColor: SEMANTIC_COLORS[theme].destructive,
      })
    }
  },
  
  // Navigation Specifications
  navigation: {
    sidebar: {
      width: '256px',  // 64 * 4px = 256px
      backgroundColor: (theme: 'light' | 'dark') => SEMANTIC_COLORS[theme].card,
      borderRight: '1px solid',
      borderColor: (theme: 'light' | 'dark') => SEMANTIC_COLORS[theme].border,
    },
    navItem: {
      base: {
        padding: SPACING[3],  // 12px
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
        color: (theme: 'light' | 'dark') => SEMANTIC_COLORS[theme].foregroundSecondary,
        transition: 'all 200ms ease',
        borderLeft: '3px solid transparent',
      },
      active: (theme: 'light' | 'dark') => ({
        color: SEMANTIC_COLORS[theme].foreground,
        backgroundColor: SEMANTIC_COLORS[theme].hover,
        borderLeftColor: SEMANTIC_COLORS[theme].accent,
      }),
      hover: (theme: 'light' | 'dark') => ({
        color: SEMANTIC_COLORS[theme].foreground,
        backgroundColor: SEMANTIC_COLORS[theme].hover,
      })
    }
  }
} as const;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Get all authorized color values for validation
 */
export function getAllAuthorizedColors(): string[] {
  const colors: string[] = [];
  
  // Extract all color values from AUTHORIZED_COLORS
  function extractColors(obj: any): void {
    for (const value of Object.values(obj)) {
      if (typeof value === 'string' && value.startsWith('oklch(')) {
        colors.push(value);
      } else if (typeof value === 'object' && value !== null) {
        extractColors(value);
      }
    }
  }
  
  extractColors(AUTHORIZED_COLORS);
  extractColors(SEMANTIC_COLORS);
  
  // Add transparent and current
  colors.push('transparent', 'currentColor', 'inherit', 'initial', 'unset');
  
  return colors;
}

/**
 * Check if a color is authorized
 */
export function isAuthorizedColor(color: string): boolean {
  const authorizedColors = getAllAuthorizedColors();
  
  // Check exact match
  if (authorizedColors.includes(color)) return true;
  
  // Check CSS variable references (var(--*))
  if (color.startsWith('var(--')) return true;
  
  // Check if it's a reference to our design tokens
  if (color.includes('hsl(var(--')) return true;
  
  return false;
}

/**
 * Generate CSS custom properties
 */
export function generateCSSVariables(theme: 'light' | 'dark'): Record<string, string> {
  const vars: Record<string, string> = {};
  
  // Color variables
  Object.entries(SEMANTIC_COLORS[theme]).forEach(([key, value]) => {
    vars[`--${key}`] = value;
  });
  
  // Typography variables
  vars['--font-sans'] = TYPOGRAPHY.fontFamily.sans.join(', ');
  vars['--font-serif'] = TYPOGRAPHY.fontFamily.serif.join(', ');
  vars['--font-mono'] = TYPOGRAPHY.fontFamily.mono.join(', ');
  
  // Spacing variables
  Object.entries(SPACING).forEach(([key, value]) => {
    vars[`--spacing-${key}`] = value;
  });
  
  return vars;
}

export default {
  AUTHORIZED_COLORS,
  SEMANTIC_COLORS,
  TYPOGRAPHY,
  SPACING,
  COMPONENT_SPECS,
  getAllAuthorizedColors,
  isAuthorizedColor,
  generateCSSVariables,
};