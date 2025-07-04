/**
 * COMPREHENSIVE DESIGN SYSTEM - SINGLE SOURCE OF TRUTH
 * 
 * Complete flat design system for professional wedding RSVP platform
 * Zero tolerance for any styling outside this system
 * 
 * STRUCTURE:
 * - AUTHORIZED_COLORS: Only these colors are allowed in the application
 * - SEMANTIC_MAPPINGS: Theme-aware color assignments
 * - TYPOGRAPHY: Complete typography system (Inter/Cormorant Garamond only)
 * - SPACING: 4px grid system (base unit)
 * - LAYOUT_PATTERNS: Flex/grid layouts and text overflow behaviors
 * - COMPONENT_SPECS: Complete specifications for all UI components
 * - VALIDATION: Functions to ensure design system compliance
 */

// ============================================================================
// AUTHORIZED COLORS - ONLY THESE COLORS ARE ALLOWED
// ============================================================================
export const AUTHORIZED_COLORS = {
  // Brand Colors - Purple (#7A51E1) and Gold (#E3C76F)
  purple: {
    50: 'oklch(0.95 0.02 300)',
    100: 'oklch(0.90 0.04 300)',
    500: 'oklch(0.55 0.18 300)',  // Main purple #7A51E1
    600: 'oklch(0.50 0.20 300)',
    900: 'oklch(0.25 0.15 300)',
  },
  
  gold: {
    50: 'oklch(0.95 0.02 87)',
    100: 'oklch(0.90 0.04 87)',
    500: 'oklch(0.75 0.08 87)',   // Main gold #E3C76F
    600: 'oklch(0.70 0.09 87)',
    900: 'oklch(0.40 0.06 87)',
  },
  
  // Neutral Grayscale - ONLY source for grays
  gray: {
    0: 'oklch(1.0000 0 0)',      // Pure white
    50: 'oklch(0.9851 0 0)',     // Near white
    100: 'oklch(0.9672 0 0)',    // Light gray
    200: 'oklch(0.8975 0 0)',    // Border gray
    300: 'oklch(0.7380 0 0)',    // Muted gray
    500: 'oklch(0.5103 0 0)',    // Mid gray
    700: 'oklch(0.3211 0 0)',    // Text gray
    800: 'oklch(0.2350 0 0)',    // Dark gray
    900: 'oklch(0.1822 0 0)',    // Darkest gray
    1000: 'oklch(0.0000 0 0)',   // Pure black
  },
  
  // Status Colors - Minimal set only
  status: {
    error: 'oklch(0.64 0.21 25)',    // Red for errors
    success: 'oklch(0.65 0.15 145)', // Green for success
    warning: 'oklch(0.75 0.12 85)',  // Amber for warnings
  },
  
  // System Colors
  transparent: 'transparent',
  current: 'currentColor',
  inherit: 'inherit',
} as const;

// ============================================================================
// SEMANTIC COLOR MAPPINGS - THEME AWARE
// ============================================================================
export const SEMANTIC_COLORS = {
  light: {
    // Backgrounds
    background: AUTHORIZED_COLORS.gray[0],       // Pure white
    backgroundMuted: AUTHORIZED_COLORS.gray[50], // Near white
    
    // Surfaces
    card: AUTHORIZED_COLORS.gray[50],            // Light card
    surface: AUTHORIZED_COLORS.gray[100],        // Surface
    
    // Text
    foreground: AUTHORIZED_COLORS.gray[700],     // Main text
    foregroundMuted: AUTHORIZED_COLORS.gray[500], // Secondary text
    foregroundLight: AUTHORIZED_COLORS.gray[300], // Light text
    
    // Borders
    border: AUTHORIZED_COLORS.gray[200],         // Main border
    borderLight: AUTHORIZED_COLORS.gray[100],    // Light border
    
    // Brand
    accent: AUTHORIZED_COLORS.purple[500],       // Purple accent
    accentLight: AUTHORIZED_COLORS.purple[100],  // Light purple
    secondary: AUTHORIZED_COLORS.gold[500],      // Gold accent
    secondaryLight: AUTHORIZED_COLORS.gold[100], // Light gold
    
    // Interactive
    hover: AUTHORIZED_COLORS.gray[100],          // Hover background
    active: AUTHORIZED_COLORS.gray[200],         // Active state
    focus: AUTHORIZED_COLORS.purple[500],        // Focus ring
    
    // Status
    destructive: AUTHORIZED_COLORS.status.error,
    success: AUTHORIZED_COLORS.status.success,
    warning: AUTHORIZED_COLORS.status.warning,
  },
  
  dark: {
    // Backgrounds
    background: AUTHORIZED_COLORS.gray[900],     // Dark background
    backgroundMuted: AUTHORIZED_COLORS.gray[800], // Dark muted
    
    // Surfaces
    card: AUTHORIZED_COLORS.gray[800],           // Dark card
    surface: AUTHORIZED_COLORS.gray[700],        // Dark surface
    
    // Text
    foreground: AUTHORIZED_COLORS.gray[50],      // Light text
    foregroundMuted: AUTHORIZED_COLORS.gray[300], // Muted text
    foregroundLight: AUTHORIZED_COLORS.gray[500], // Darker text
    
    // Borders
    border: AUTHORIZED_COLORS.gray[700],         // Dark border
    borderLight: AUTHORIZED_COLORS.gray[800],    // Darker border
    
    // Brand
    accent: AUTHORIZED_COLORS.purple[500],       // Purple accent
    accentLight: AUTHORIZED_COLORS.purple[900],  // Dark purple
    secondary: AUTHORIZED_COLORS.gold[500],      // Gold accent
    secondaryLight: AUTHORIZED_COLORS.gold[900], // Dark gold
    
    // Interactive
    hover: AUTHORIZED_COLORS.gray[800],          // Dark hover
    active: AUTHORIZED_COLORS.gray[700],         // Dark active
    focus: AUTHORIZED_COLORS.purple[500],        // Focus ring
    
    // Status
    destructive: AUTHORIZED_COLORS.status.error,
    success: AUTHORIZED_COLORS.status.success,
    warning: AUTHORIZED_COLORS.status.warning,
  }
} as const;

// ============================================================================
// TYPOGRAPHY SYSTEM - INTER AND CORMORANT GARAMOND ONLY
// ============================================================================
export const TYPOGRAPHY = {
  // Font Families - ONLY THESE ALLOWED
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],      // Primary font
    serif: ['Cormorant Garamond', 'serif'],          // Decorative font
    mono: ['JetBrains Mono', 'Menlo', 'monospace'],  // Code font
  },
  
  // Font Sizes - 16px base scale
  fontSize: {
    xs: '12px',    // Small text
    sm: '14px',    // UI text
    base: '16px',  // Body text (BASE)
    lg: '18px',    // Large text
    xl: '20px',    // Headings
    '2xl': '24px', // Large headings
    '3xl': '30px', // Hero text
    '4xl': '36px', // Display text
    '5xl': '48px', // Large display
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
    tight: '1.25',   // Headings
    normal: '1.5',   // Body text
    relaxed: '1.75', // Long content
  },
  
  // Letter Spacing
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  }
} as const;

// ============================================================================
// SPACING SYSTEM - 4PX GRID BASE
// ============================================================================
export const SPACING = {
  0: '0px',
  1: '4px',     // Base unit
  2: '8px',     // 2x
  3: '12px',    // 3x
  4: '16px',    // 4x - Standard
  5: '20px',    // 5x
  6: '24px',    // 6x - Card padding
  8: '32px',    // 8x - Section spacing
  10: '40px',   // 10x
  12: '48px',   // 12x - Large spacing
  16: '64px',   // 16x - Page margins
  20: '80px',   // 20x
  24: '96px',   // 24x - Hero spacing
} as const;

// ============================================================================
// LAYOUT PATTERNS - COMPREHENSIVE LAYOUT SYSTEM
// ============================================================================
export const LAYOUT_PATTERNS = {
  // Container Specifications
  containers: {
    maxWidth: {
      sm: '640px',
      md: '768px', 
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      full: '100%'
    },
    padding: {
      xs: SPACING[2],  // 8px
      sm: SPACING[4],  // 16px
      md: SPACING[6],  // 24px
      lg: SPACING[8],  // 32px
      xl: SPACING[12], // 48px
    }
  },
  
  // Text Overflow Behaviors
  text: {
    // Single line truncation with ellipsis
    truncate: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const,
      minWidth: '0', // Critical for flex containers
    },
    
    // Multi-line truncation (2 lines)
    truncate2: {
      display: '-webkit-box',
      WebkitLineClamp: '2',
      WebkitBoxOrient: 'vertical' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    
    // Multi-line truncation (3 lines)
    truncate3: {
      display: '-webkit-box',
      WebkitLineClamp: '3', 
      WebkitBoxOrient: 'vertical' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    
    // Word breaking for long content
    breakWords: {
      wordBreak: 'break-word' as const,
      overflowWrap: 'break-word' as const,
      hyphens: 'auto' as const,
    },
    
    // Prevent wrapping
    noWrap: {
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
    }
  },
  
  // Flex Layout Patterns
  flex: {
    // Center content horizontally and vertically
    center: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    // Center vertically only
    centerY: {
      display: 'flex',
      alignItems: 'center',
    },
    
    // Space between items
    between: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    
    // Column layout
    col: {
      display: 'flex',
      flexDirection: 'column' as const,
    },
    
    // Row with gap function
    rowGap: (gap: keyof typeof SPACING) => ({
      display: 'flex',
      gap: SPACING[gap],
      alignItems: 'center',
    }),
    
    // Column with gap function
    colGap: (gap: keyof typeof SPACING) => ({
      display: 'flex',
      flexDirection: 'column' as const,
      gap: SPACING[gap],
    }),
    
    // Flexible growing item
    grow: {
      flex: '1 1 0%',
      minWidth: '0', // Prevents overflow
    },
    
    // Fixed size item
    fixed: {
      flex: '0 0 auto',
    }
  },
  
  // Grid Layout Patterns
  grid: {
    // Auto-fit columns with minimum width
    autoFit: (minWidth: string, gap: keyof typeof SPACING = 4) => ({
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}, 1fr))`,
      gap: SPACING[gap],
    }),
    
    // Fixed columns
    cols: (count: number, gap: keyof typeof SPACING = 4) => ({
      display: 'grid',
      gridTemplateColumns: `repeat(${count}, 1fr)`,
      gap: SPACING[gap],
    }),
    
    // Dashboard grid pattern
    dashboard: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: SPACING[6],
    }
  }
} as const;

// ============================================================================
// COMPONENT SPECIFICATIONS - COMPLETE UI SYSTEM
// ============================================================================
export const COMPONENT_SPECS = {
  // Button System
  button: {
    base: {
      fontFamily: TYPOGRAPHY.fontFamily.sans,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      fontSize: TYPOGRAPHY.fontSize.sm,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      borderRadius: '0px', // FLAT DESIGN
      border: '1px solid',
      cursor: 'pointer',
      transition: 'all 200ms ease',
      textAlign: 'center' as const,
      minWidth: '0',
    },
    sizes: {
      sm: { height: '32px', padding: '6px 12px', fontSize: TYPOGRAPHY.fontSize.xs },
      md: { height: '40px', padding: '8px 16px', fontSize: TYPOGRAPHY.fontSize.sm },
      lg: { height: '48px', padding: '12px 24px', fontSize: TYPOGRAPHY.fontSize.base }
    }
  },
  
  // Card System
  card: {
    base: {
      borderRadius: '0px', // FLAT DESIGN
      border: '1px solid',
      fontFamily: TYPOGRAPHY.fontFamily.sans,
      ...LAYOUT_PATTERNS.text.breakWords,
      minWidth: '0',
      position: 'relative' as const,
    },
    sizes: {
      sm: { padding: SPACING[4] },
      md: { padding: SPACING[6] },
      lg: { padding: SPACING[8] }
    },
    layouts: {
      default: { ...LAYOUT_PATTERNS.flex.col, gap: SPACING[4] },
      withHeader: {
        header: { 
          padding: `${SPACING[4]} ${SPACING[6]}`, 
          borderBottom: '1px solid',
          ...LAYOUT_PATTERNS.flex.between 
        },
        content: { padding: SPACING[6] }
      }
    }
  },
  
  // Input System
  input: {
    base: {
      height: '40px',
      padding: '8px 12px',
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.sans,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      border: '1px solid',
      borderRadius: '0px', // FLAT DESIGN
      outline: 'none',
      transition: 'border-color 200ms ease',
      minWidth: '0',
    }
  },
  
  // Table System
  table: {
    container: {
      width: '100%',
      overflow: 'auto', // Horizontal scroll if needed
      border: '1px solid',
      borderRadius: '0px', // FLAT DESIGN
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      fontFamily: TYPOGRAPHY.fontFamily.sans,
      fontSize: TYPOGRAPHY.fontSize.sm,
      tableLayout: 'fixed' as const, // Consistent column widths
    },
    header: {
      borderBottom: '2px solid',
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      padding: `${SPACING[3]} ${SPACING[4]}`,
      textAlign: 'left' as const,
      ...LAYOUT_PATTERNS.text.truncate,
    },
    cell: {
      base: {
        padding: `${SPACING[3]} ${SPACING[4]}`,
        borderBottom: '1px solid',
        verticalAlign: 'top' as const,
        ...LAYOUT_PATTERNS.text.truncate,
      },
      widths: {
        xs: '60px',   // Icons, checkboxes
        sm: '100px',  // Status, short text
        md: '150px',  // Names, medium text
        lg: '200px',  // Descriptions
        xl: '300px',  // Long content
        auto: 'auto', // Dynamic width
      }
    },
    row: {
      base: { transition: 'background-color 200ms ease' }
    }
  },
  
  // Form System
  form: {
    container: { ...LAYOUT_PATTERNS.flex.col, gap: SPACING[6], maxWidth: '600px' },
    section: { ...LAYOUT_PATTERNS.flex.col, gap: SPACING[4] },
    fieldGroup: { ...LAYOUT_PATTERNS.flex.col, gap: SPACING[2] },
    fieldGroupInline: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: SPACING[4],
      alignItems: 'end',
    },
    label: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      marginBottom: SPACING[1],
    },
    helpText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      marginTop: SPACING[1],
    },
    actions: {
      ...LAYOUT_PATTERNS.flex.rowGap(3),
      justifyContent: 'flex-end',
      marginTop: SPACING[8],
      paddingTop: SPACING[6],
      borderTop: '1px solid',
    }
  },
  
  // Navigation System
  navigation: {
    sidebar: {
      container: {
        width: '256px',
        height: '100vh',
        borderRight: '1px solid',
        ...LAYOUT_PATTERNS.flex.col,
        overflow: 'hidden',
      },
      header: {
        padding: SPACING[6],
        borderBottom: '1px solid',
        ...LAYOUT_PATTERNS.flex.centerY,
        gap: SPACING[3],
        ...LAYOUT_PATTERNS.text.truncate,
      },
      nav: {
        flex: '1 1 0%',
        padding: SPACING[4],
        overflowY: 'auto' as const,
        ...LAYOUT_PATTERNS.flex.col,
        gap: SPACING[1],
      }
    },
    navItem: {
      base: {
        display: 'flex',
        alignItems: 'center',
        gap: SPACING[3],
        padding: SPACING[3],
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
        transition: 'all 200ms ease',
        borderLeft: '3px solid transparent',
        borderRadius: '0px', // FLAT DESIGN
        textDecoration: 'none',
        minWidth: '0',
      },
      content: {
        ...LAYOUT_PATTERNS.flex.col,
        gap: SPACING[1],
        minWidth: '0',
        flex: '1 1 0%',
      },
      title: { ...LAYOUT_PATTERNS.text.truncate, fontWeight: TYPOGRAPHY.fontWeight.medium },
      description: { ...LAYOUT_PATTERNS.text.truncate, fontSize: TYPOGRAPHY.fontSize.xs }
    },
    topNav: {
      height: '64px',
      borderBottom: '1px solid',
      padding: `0 ${SPACING[6]}`,
      ...LAYOUT_PATTERNS.flex.between,
    }
  }
} as const;

// ============================================================================
// CSS GENERATION FUNCTIONS
// ============================================================================

/**
 * Generate CSS custom properties for themes
 */
export function generateCSSVariables(theme: 'light' | 'dark'): Record<string, string> {
  const vars: Record<string, string> = {};
  
  // Add semantic color variables
  Object.entries(SEMANTIC_COLORS[theme]).forEach(([key, value]) => {
    vars[`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`] = value;
  });
  
  // Add typography variables
  vars['--font-sans'] = TYPOGRAPHY.fontFamily.sans.join(', ');
  vars['--font-serif'] = TYPOGRAPHY.fontFamily.serif.join(', ');
  vars['--font-mono'] = TYPOGRAPHY.fontFamily.mono.join(', ');
  
  // Add spacing variables
  Object.entries(SPACING).forEach(([key, value]) => {
    vars[`--spacing-${key}`] = value;
  });
  
  return vars;
}

/**
 * Get all authorized color values for validation
 */
export function getAllAuthorizedColors(): string[] {
  const colors: string[] = [];
  
  function extractColors(obj: any): void {
    for (const value of Object.values(obj)) {
      if (typeof value === 'string' && (value.startsWith('oklch(') || value === 'transparent' || value === 'currentColor' || value === 'inherit')) {
        colors.push(value);
      } else if (typeof value === 'object' && value !== null) {
        extractColors(value);
      }
    }
  }
  
  extractColors(AUTHORIZED_COLORS);
  extractColors(SEMANTIC_COLORS);
  
  // Add CSS variable patterns
  colors.push('var(--', 'hsl(var(--', 'rgb(var(--');
  
  return colors;
}

/**
 * Check if a color is authorized in the design system
 */
export function isAuthorizedColor(color: string): boolean {
  if (!color) return true;
  
  // Allow CSS variables
  if (color.startsWith('var(--') || color.includes('hsl(var(--') || color.includes('rgb(var(--')) {
    return true;
  }
  
  // Allow system colors
  if (['transparent', 'currentColor', 'inherit', 'initial', 'unset'].includes(color)) {
    return true;
  }
  
  // Check against authorized colors
  const authorizedColors = getAllAuthorizedColors();
  return authorizedColors.some(authorized => color.includes(authorized.replace('oklch(', '').replace(')', '')));
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Comprehensive design system audit
 */
export function auditDesignCompliance(): {
  violations: string[];
  warnings: string[];
  summary: { total: number; violations: number; warnings: number };
} {
  const violations: string[] = [];
  const warnings: string[] = [];
  
  // Get all elements in the DOM
  const allElements = document.querySelectorAll('*');
  
  allElements.forEach((element, index) => {
    const computedStyle = window.getComputedStyle(element);
    
    // Check colors
    const colorProperties = [
      'color', 'backgroundColor', 'borderColor', 'borderTopColor', 
      'borderRightColor', 'borderBottomColor', 'borderLeftColor',
      'fill', 'stroke', 'outlineColor'
    ];
    
    colorProperties.forEach(prop => {
      const value = computedStyle.getPropertyValue(prop);
      if (value && value !== 'none' && !isAuthorizedColor(value)) {
        violations.push(`Element ${index}: ${prop}: "${value}" is not authorized in design system`);
      }
    });
    
    // Check fonts
    const fontFamily = computedStyle.fontFamily;
    if (fontFamily && !fontFamily.includes('Inter') && !fontFamily.includes('Cormorant') && !fontFamily.includes('JetBrains')) {
      violations.push(`Element ${index}: fontFamily "${fontFamily}" is not authorized. Only Inter, Cormorant Garamond, and JetBrains Mono allowed`);
    }
    
    // Check border radius (should be 0 for flat design)
    const borderRadius = computedStyle.borderRadius;
    if (borderRadius && borderRadius !== '0px' && borderRadius !== '0') {
      warnings.push(`Element ${index}: borderRadius "${borderRadius}" violates flat design. Should be 0px`);
    }
    
    // Check box shadows (should be none for flat design)
    const boxShadow = computedStyle.boxShadow;
    if (boxShadow && boxShadow !== 'none') {
      warnings.push(`Element ${index}: boxShadow "${boxShadow}" violates flat design. Should be none`);
    }
  });
  
  return {
    violations,
    warnings,
    summary: {
      total: allElements.length,
      violations: violations.length,
      warnings: warnings.length,
    }
  };
}

// Export everything as the design system
export default {
  AUTHORIZED_COLORS,
  SEMANTIC_COLORS,
  TYPOGRAPHY,
  SPACING,
  LAYOUT_PATTERNS,
  COMPONENT_SPECS,
  generateCSSVariables,
  getAllAuthorizedColors,
  isAuthorizedColor,
  auditDesignCompliance,
} as const;