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
// LAYOUT SYSTEM - COMPREHENSIVE CONTAINER BEHAVIORS
// ============================================================================
export const LAYOUT_SYSTEM = {
  // Container Specifications
  containers: {
    // Maximum widths for different container types
    maxWidth: {
      sm: '640px',    // Small screens
      md: '768px',    // Medium screens  
      lg: '1024px',   // Large screens
      xl: '1280px',   // Extra large
      '2xl': '1536px', // 2X large
      full: '100%',   // Full width
    },
    
    // Standard padding for different container sizes
    padding: {
      xs: SPACING[2],  // 8px - Minimal spacing
      sm: SPACING[4],  // 16px - Small containers
      md: SPACING[6],  // 24px - Medium containers (default)
      lg: SPACING[8],  // 32px - Large containers
      xl: SPACING[12], // 48px - Extra large containers
    },
    
    // Gap specifications for grid/flex layouts
    gap: {
      xs: SPACING[1],  // 4px - Tight spacing
      sm: SPACING[2],  // 8px - Small gaps
      md: SPACING[4],  // 16px - Standard gaps
      lg: SPACING[6],  // 24px - Large gaps
      xl: SPACING[8],  // 32px - Extra large gaps
    }
  },
  
  // Text Overflow and Truncation Behaviors
  textBehaviors: {
    // Single line truncation
    truncate: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const,
      minWidth: '0', // Critical for flex children
    },
    
    // Multi-line truncation (2 lines)
    truncateLines2: {
      display: '-webkit-box',
      WebkitLineClamp: '2',
      WebkitBoxOrient: 'vertical' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    
    // Multi-line truncation (3 lines)  
    truncateLines3: {
      display: '-webkit-box',
      WebkitLineClamp: '3',
      WebkitBoxOrient: 'vertical' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    
    // Word break for long content
    breakWords: {
      wordBreak: 'break-word' as const,
      overflowWrap: 'break-word' as const,
      hyphens: 'auto' as const,
    },
    
    // No wrap behavior
    noWrap: {
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
    }
  },
  
  // Flex Layout Patterns
  flexPatterns: {
    // Center content both ways
    centerBoth: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    // Center content vertically
    centerVertical: {
      display: 'flex',
      alignItems: 'center',
    },
    
    // Space between items
    spaceBetween: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    
    // Column layout
    column: {
      display: 'flex',
      flexDirection: 'column' as const,
    },
    
    // Column with gap
    columnGap: (gap: keyof typeof SPACING) => ({
      display: 'flex',
      flexDirection: 'column' as const,
      gap: SPACING[gap],
    }),
    
    // Row with gap
    rowGap: (gap: keyof typeof SPACING) => ({
      display: 'flex',
      gap: SPACING[gap],
      alignItems: 'center',
    }),
    
    // Flexible item that grows
    flexGrow: {
      flex: '1 1 0%',
      minWidth: '0', // Prevents overflow in flex containers
    },
    
    // Flexible item that shrinks
    flexShrink: {
      flex: '0 1 auto',
      minWidth: '0',
    },
    
    // Fixed flex item
    flexFixed: {
      flex: '0 0 auto',
    }
  },
  
  // Grid Layout Patterns
  gridPatterns: {
    // Auto-fit columns with minimum width
    autoFit: (minWidth: string) => ({
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}, 1fr))`,
      gap: SPACING[4],
    }),
    
    // Auto-fill columns
    autoFill: (minWidth: string) => ({
      display: 'grid', 
      gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}, 1fr))`,
      gap: SPACING[4],
    }),
    
    // Fixed columns
    columns: (count: number, gap: keyof typeof SPACING = 4) => ({
      display: 'grid',
      gridTemplateColumns: `repeat(${count}, 1fr)`,
      gap: SPACING[gap],
    }),
    
    // Dashboard grid (responsive)
    dashboard: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: SPACING[6],
      padding: SPACING[6],
    }
  },
  
  // Responsive Breakpoints
  breakpoints: {
    sm: '640px',   // Small devices
    md: '768px',   // Medium devices  
    lg: '1024px',  // Large devices
    xl: '1280px',  // Extra large devices
    '2xl': '1536px', // 2X large devices
  },
  
  // Z-Index Scale
  zIndex: {
    base: '0',
    dropdown: '10',
    sticky: '20', 
    modal: '50',
    popover: '60',
    tooltip: '70',
    overlay: '80',
    max: '9999',
  }
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
  
  // Card Specifications - Complete behavior definitions
  card: {
    base: {
      backgroundColor: (theme: 'light' | 'dark') => SEMANTIC_COLORS[theme].card,
      border: `1px solid`,
      borderColor: (theme: 'light' | 'dark') => SEMANTIC_COLORS[theme].border,
      borderRadius: '0px',  // FLAT DESIGN
      fontFamily: TYPOGRAPHY.fontFamily.sans,
      // Text overflow handling
      ...LAYOUT_SYSTEM.textBehaviors.breakWords,
      // Container behavior
      minWidth: '0', // Prevents flex overflow
      position: 'relative' as const,
    },
    sizes: {
      sm: {
        padding: SPACING[4],  // 16px
        gap: SPACING[3],      // 12px between elements
      },
      md: {
        padding: SPACING[6],  // 24px
        gap: SPACING[4],      // 16px between elements
      },
      lg: {
        padding: SPACING[8],  // 32px
        gap: SPACING[6],      // 24px between elements
      }
    },
    variants: {
      default: {},
      elevated: {
        borderWidth: '2px',
      },
      compact: {
        padding: SPACING[3],  // 12px
      }
    },
    // Content layout patterns
    layouts: {
      // Header + content layout
      withHeader: {
        header: {
          padding: `${SPACING[4]} ${SPACING[6]}`,
          borderBottom: '1px solid',
          borderColor: (theme: 'light' | 'dark') => SEMANTIC_COLORS[theme].border,
          ...LAYOUT_SYSTEM.flexPatterns.spaceBetween,
        },
        content: {
          padding: SPACING[6],
        }
      },
      // Grid content layout
      grid: {
        ...LAYOUT_SYSTEM.gridPatterns.autoFit('200px'),
        padding: SPACING[6],
      },
      // List content layout
      list: {
        ...LAYOUT_SYSTEM.flexPatterns.column,
        gap: SPACING[2],
        padding: SPACING[6],
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
  
  // Table Specifications - Complete data presentation system
  table: {
    base: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      fontFamily: TYPOGRAPHY.fontFamily.sans,
      fontSize: TYPOGRAPHY.fontSize.sm,
      // Text overflow handling for cells
      tableLayout: 'fixed' as const, // Enables consistent column widths
    },
    header: {
      backgroundColor: (theme: 'light' | 'dark') => SEMANTIC_COLORS[theme].backgroundSecondary,
      borderBottom: '2px solid',
      borderColor: (theme: 'light' | 'dark') => SEMANTIC_COLORS[theme].border,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: (theme: 'light' | 'dark') => SEMANTIC_COLORS[theme].foreground,
      padding: `${SPACING[3]} ${SPACING[4]}`,
      textAlign: 'left' as const,
      // Header text behavior
      ...LAYOUT_SYSTEM.textBehaviors.truncate,
    },
    cell: {
      base: {
        padding: `${SPACING[3]} ${SPACING[4]}`,
        borderBottom: '1px solid',
        borderColor: (theme: 'light' | 'dark') => SEMANTIC_COLORS[theme].border,
        color: (theme: 'light' | 'dark') => SEMANTIC_COLORS[theme].foreground,
        verticalAlign: 'top' as const,
        // Cell text behavior - always truncate to prevent overflow
        ...LAYOUT_SYSTEM.textBehaviors.truncate,
        maxWidth: '200px', // Default max width
      },
      // Cell width specifications
      widths: {
        xs: '60px',    // Icon columns
        sm: '100px',   // Status, numbers
        md: '150px',   // Names, short text
        lg: '200px',   // Descriptions
        xl: '300px',   // Long content
        auto: 'auto',  // Dynamic width
      },
      // Cell content types with specific behaviors
      types: {
        text: {
          ...LAYOUT_SYSTEM.textBehaviors.truncate,
        },
        number: {
          textAlign: 'right' as const,
          fontWeight: TYPOGRAPHY.fontWeight.medium,
          fontVariantNumeric: 'tabular-nums' as const,
        },
        status: {
          textAlign: 'center' as const,
          fontWeight: TYPOGRAPHY.fontWeight.medium,
        },
        action: {
          textAlign: 'right' as const,
          width: '100px',
        }
      }
    },
    row: {
      base: {
        transition: 'background-color 200ms ease',
      },
      hover: (theme: 'light' | 'dark') => ({
        backgroundColor: SEMANTIC_COLORS[theme].hover,
      }),
      selected: (theme: 'light' | 'dark') => ({
        backgroundColor: `${SEMANTIC_COLORS[theme].accent}10`,
        borderLeft: '3px solid',
        borderColor: SEMANTIC_COLORS[theme].accent,
      })
    }
  },
  
  // Form Specifications - Complete form system
  form: {
    // Form container
    container: {
      ...LAYOUT_SYSTEM.flexPatterns.column,
      gap: SPACING[6],  // 24px between form sections
      maxWidth: '600px', // Optimal form width
    },
    
    // Form sections
    section: {
      ...LAYOUT_SYSTEM.flexPatterns.column,
      gap: SPACING[4],  // 16px between fields
    },
    
    // Field groups
    fieldGroup: {
      ...LAYOUT_SYSTEM.flexPatterns.column,
      gap: SPACING[2],  // 8px between label and input
    },
    
    // Inline field groups (side by side)
    fieldGroupInline: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: SPACING[4],
      alignItems: 'end', // Align to bottom (input baseline)
    },
    
    // Label specifications
    label: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      color: (theme: 'light' | 'dark') => SEMANTIC_COLORS[theme].foreground,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      marginBottom: SPACING[1], // 4px
    },
    
    // Help text
    helpText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: (theme: 'light' | 'dark') => SEMANTIC_COLORS[theme].foregroundSecondary,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      marginTop: SPACING[1], // 4px
    },
    
    // Error text
    errorText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: (theme: 'light' | 'dark') => SEMANTIC_COLORS[theme].destructive,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      marginTop: SPACING[1], // 4px
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    
    // Form actions (buttons)
    actions: {
      ...LAYOUT_SYSTEM.flexPatterns.rowGap(3),
      justifyContent: 'flex-end',
      marginTop: SPACING[8], // 32px spacing before actions
      paddingTop: SPACING[6], // 24px
      borderTop: '1px solid',
      borderColor: (theme: 'light' | 'dark') => SEMANTIC_COLORS[theme].border,
    }
  },
  
  // Navigation Specifications - Complete navigation system
  navigation: {
    // Sidebar navigation
    sidebar: {
      container: {
        width: '256px',  // 64 * 4px = 256px
        height: '100vh',
        backgroundColor: (theme: 'light' | 'dark') => SEMANTIC_COLORS[theme].card,
        borderRight: '1px solid',
        borderColor: (theme: 'light' | 'dark') => SEMANTIC_COLORS[theme].border,
        ...LAYOUT_SYSTEM.flexPatterns.column,
        overflow: 'hidden', // Prevent sidebar scroll
      },
      
      header: {
        padding: SPACING[6],
        borderBottom: '1px solid',
        borderColor: (theme: 'light' | 'dark') => SEMANTIC_COLORS[theme].border,
        ...LAYOUT_SYSTEM.flexPatterns.centerVertical,
        gap: SPACING[3],
        // Text truncation for long titles
        ...LAYOUT_SYSTEM.textBehaviors.truncate,
      },
      
      navigation: {
        flex: '1 1 0%',
        padding: SPACING[4],
        overflowY: 'auto' as const, // Allow nav scroll if needed
        ...LAYOUT_SYSTEM.flexPatterns.column,
        gap: SPACING[1], // 4px between nav items
      },
      
      footer: {
        padding: SPACING[4],
        borderTop: '1px solid',
        borderColor: (theme: 'light' | 'dark') => SEMANTIC_COLORS[theme].border,
      }
    },
    
    // Navigation items
    navItem: {
      base: {
        display: 'flex',
        alignItems: 'center',
        gap: SPACING[3],  // 12px
        padding: SPACING[3],  // 12px
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
        color: (theme: 'light' | 'dark') => SEMANTIC_COLORS[theme].foregroundSecondary,
        transition: 'all 200ms ease',
        borderLeft: '3px solid transparent',
        borderRadius: '0px', // FLAT DESIGN
        textDecoration: 'none',
        // Text truncation for long labels
        minWidth: '0',
      },
      
      content: {
        ...LAYOUT_SYSTEM.flexPatterns.column,
        gap: SPACING[1], // 4px between title and description
        minWidth: '0', // Critical for text truncation
        flex: '1 1 0%',
      },
      
      title: {
        ...LAYOUT_SYSTEM.textBehaviors.truncate,
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
      },
      
      description: {
        ...LAYOUT_SYSTEM.textBehaviors.truncate,
        fontSize: TYPOGRAPHY.fontSize.xs,
        color: (theme: 'light' | 'dark') => SEMANTIC_COLORS[theme].foregroundMuted,
      },
      
      // Navigation states
      states: {
        active: (theme: 'light' | 'dark') => ({
          color: SEMANTIC_COLORS[theme].foreground,
          backgroundColor: SEMANTIC_COLORS[theme].hover,
          borderLeftColor: SEMANTIC_COLORS[theme].accent,
        }),
        hover: (theme: 'light' | 'dark') => ({
          color: SEMANTIC_COLORS[theme].foreground,
          backgroundColor: SEMANTIC_COLORS[theme].hover,
        }),
        focus: (theme: 'light' | 'dark') => ({
          outline: `2px solid ${SEMANTIC_COLORS[theme].accent}`,
          outlineOffset: '2px',
        })
      }
    },
    
    // Top navigation bar
    topNav: {
      height: '64px', // Standard header height
      backgroundColor: (theme: 'light' | 'dark') => SEMANTIC_COLORS[theme].background,
      borderBottom: '1px solid',
      borderColor: (theme: 'light' | 'dark') => SEMANTIC_COLORS[theme].border,
      padding: `0 ${SPACING[6]}`,
      ...LAYOUT_SYSTEM.flexPatterns.spaceBetween,
    },
    
    // Breadcrumb navigation
    breadcrumb: {
      ...LAYOUT_SYSTEM.flexPatterns.centerVertical,
      gap: SPACING[2], // 8px
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: (theme: 'light' | 'dark') => SEMANTIC_COLORS[theme].foregroundSecondary,
      
      item: {
        ...LAYOUT_SYSTEM.textBehaviors.truncate,
        maxWidth: '200px', // Prevent extremely long breadcrumb items
      },
      
      separator: {
        color: (theme: 'light' | 'dark') => SEMANTIC_COLORS[theme].foregroundMuted,
      },
      
      current: {
        color: (theme: 'light' | 'dark') => SEMANTIC_COLORS[theme].foreground,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
      }
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