
/**
 * COMPONENT STYLE DEFINITIONS - FLAT DESIGN SPECIFICATION
 * Production-quality component styling based on design tokens
 * All components must reference these styles for consistency
 * UPDATED FOR COMPLETELY FLAT DESIGN
 */

import { designSystem } from './tokens';

const { colors, typography, spacing, shadows, borderRadius, components, animations } = designSystem;

// ============================================================================
// BUTTON COMPONENT STYLES - COMPLETELY FLAT
// ============================================================================
export const buttonStyles = {
  base: {
    fontFamily: typography.fontFamily.sans.join(', '),
    fontWeight: typography.fontWeight.medium,
    borderRadius: '0px',  // FLAT DESIGN
    transition: `color ${animations.duration.hover} ${animations.easing.easeOut}, background-color ${animations.duration.hover} ${animations.easing.easeOut}`,
    cursor: 'pointer',
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    boxShadow: 'none',  // NO SHADOW
    '&:focus': {
      outline: '2px solid oklch(0.4145 0.1828 300.3155)',  // Exact brand purple
      outlineOffset: '2px',
      boxShadow: 'none',  // NO SHADOW
    },
    '&:active': {
      transform: 'none',  // NO TRANSFORM
      transition: 'color 150ms ease, background-color 150ms ease',
    },
  },
  
  variants: {
    primary: {
      light: {
        backgroundColor: colors.primary.light,
        color: colors.primary.foreground.light,
        boxShadow: 'none',  // NO SHADOW
        '&:hover': {
          backgroundColor: colors.primary.light,
          opacity: '0.9',
          boxShadow: 'none',  // NO SHADOW
          transform: 'none',  // NO TRANSFORM
        }
      },
      dark: {
        backgroundColor: colors.primary.dark,
        color: colors.primary.foreground.dark,
        boxShadow: 'none',  // NO SHADOW
        '&:hover': {
          backgroundColor: colors.primary.dark,
          opacity: '0.9',
          boxShadow: 'none',  // NO SHADOW
          transform: 'none',  // NO TRANSFORM
        }
      }
    },
    
    outline: {
      light: {
        backgroundColor: 'transparent',
        color: colors.primary.light,
        border: `1px solid ${colors.primary.light}`,
        '&:hover': {
          backgroundColor: colors.primary.light,
          color: colors.primary.foreground.light,
          transform: 'none',  // NO TRANSFORM
        }
      },
      dark: {
        backgroundColor: 'transparent',
        color: colors.primary.dark,
        border: `1px solid ${colors.primary.dark}`,
        '&:hover': {
          backgroundColor: colors.primary.dark,
          color: colors.primary.foreground.dark,
          transform: 'none',  // NO TRANSFORM
        }
      }
    },
    
    ghost: {
      light: {
        backgroundColor: 'transparent',
        color: colors.foreground.light,
        '&:hover': {
          backgroundColor: colors.muted.light,
          transform: 'none',  // NO TRANSFORM
        }
      },
      dark: {
        backgroundColor: 'transparent',
        color: colors.foreground.dark,
        '&:hover': {
          backgroundColor: colors.muted.dark,
          transform: 'none',  // NO TRANSFORM
        }
      }
    }
  },
  
  sizes: {
    sm: {
      height: components.button.height.sm,
      padding: components.button.padding.sm,
      fontSize: typography.fontSize.sm,
    },
    md: {
      height: components.button.height.md,
      padding: components.button.padding.md,
      fontSize: typography.fontSize.base,
    },
    lg: {
      height: components.button.height.lg,
      padding: components.button.padding.lg,
      fontSize: typography.fontSize.lg,
    }
  }
} as const;

// ============================================================================
// CARD COMPONENT STYLES - COMPLETELY FLAT
// ============================================================================
export const cardStyles = {
  base: {
    borderRadius: '0px',  // FLAT DESIGN
    border: '1px solid',
    padding: spacing[6],
    transition: 'none',  // NO TRANSITIONS
    boxShadow: 'none',  // NO SHADOW
  },
  
  variants: {
    default: {
      light: {
        backgroundColor: colors.card.light,
        borderColor: colors.border.light,
        color: colors.foreground.light,
        boxShadow: 'none',  // NO SHADOW
        '&:hover': {
          boxShadow: 'none',  // NO SHADOW
          transform: 'none',  // NO TRANSFORM
        }
      },
      dark: {
        backgroundColor: colors.card.dark,
        borderColor: colors.border.dark,
        color: colors.foreground.dark,
        boxShadow: 'none',  // NO SHADOW
        '&:hover': {
          boxShadow: 'none',  // NO SHADOW
          transform: 'none',  // NO TRANSFORM
        }
      }
    },
    
    elevated: {
      light: {
        backgroundColor: colors.card.light,
        borderColor: colors.border.light,
        color: colors.foreground.light,
        boxShadow: 'none',  // NO SHADOW
      },
      dark: {
        backgroundColor: colors.card.dark,
        borderColor: colors.border.dark,
        color: colors.foreground.dark,
        boxShadow: 'none',  // NO SHADOW
      }
    }
  }
} as const;

// ============================================================================
// INPUT COMPONENT STYLES - COMPLETELY FLAT
// ============================================================================
export const inputStyles = {
  base: {
    fontFamily: typography.fontFamily.sans.join(', '),
    fontSize: typography.fontSize.base,
    height: components.input.height,
    padding: components.input.padding,
    borderRadius: '0px',  // FLAT DESIGN
    border: '1px solid',
    transition: 'border-color 150ms ease',
    outline: 'none',
    boxShadow: 'none',  // NO SHADOW
  },
  
  states: {
    default: {
      light: {
        backgroundColor: colors.background.light,
        borderColor: colors.border.light,
        color: colors.foreground.light,
        '&:focus': {
          borderColor: colors.primary.light,
          outline: `2px solid ${colors.primary.light}`,
          outlineOffset: '2px',
          boxShadow: 'none',  // NO SHADOW
        }
      },
      dark: {
        backgroundColor: colors.input.dark,
        borderColor: colors.border.dark,
        color: colors.foreground.dark,
        '&:focus': {
          borderColor: colors.primary.dark,
          outline: `2px solid ${colors.primary.dark}`,
          outlineOffset: '2px',
          boxShadow: 'none',  // NO SHADOW
        }
      }
    },
    
    error: {
      light: {
        borderColor: colors.destructive.light,
        '&:focus': {
          borderColor: colors.destructive.light,
          outline: `2px solid ${colors.destructive.light}`,
          outlineOffset: '2px',
          boxShadow: 'none',  // NO SHADOW
        }
      },
      dark: {
        borderColor: colors.destructive.dark,
        '&:focus': {
          borderColor: colors.destructive.dark,
          outline: `2px solid ${colors.destructive.dark}`,
          outlineOffset: '2px',
          boxShadow: 'none',  // NO SHADOW
        }
      }
    }
  }
} as const;

// ============================================================================
// NAVIGATION COMPONENT STYLES - COMPLETELY FLAT
// ============================================================================
export const navigationStyles = {
  sidebar: {
    base: {
      width: '256px', // 16rem
      height: '100vh',
      borderRight: '1px solid',
      padding: spacing[4],
      fontFamily: typography.fontFamily.sans.join(', '),
      borderRadius: '0px',  // FLAT DESIGN
      boxShadow: 'none',  // NO SHADOW
    },
    
    theme: {
      light: {
        backgroundColor: colors.background.light,
        borderColor: colors.border.light,
        color: colors.foreground.light,
      },
      dark: {
        backgroundColor: colors.background.dark,
        borderColor: colors.border.dark,
        color: colors.foreground.dark,
      }
    }
  },
  
  navItem: {
    base: {
      display: 'flex',
      alignItems: 'center',
      padding: `${spacing[2]} ${spacing[3]}`,
      borderRadius: '0px',  // FLAT DESIGN
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      textDecoration: 'none',
      transition: 'background-color 150ms ease, color 150ms ease',
      cursor: 'pointer',
    },
    
    states: {
      default: {
        light: {
          color: colors.muted.foreground.light,
          '&:hover': {
            backgroundColor: colors.muted.light,
            color: colors.foreground.light,
          }
        },
        dark: {
          color: colors.muted.foreground.dark,
          '&:hover': {
            backgroundColor: colors.muted.dark,
            color: colors.foreground.dark,
          }
        }
      },
      
      active: {
        light: {
          backgroundColor: colors.muted.light,
          color: colors.primary.light,
          borderLeft: `3px solid ${colors.primary.light}`,
          fontWeight: typography.fontWeight.semibold,
        },
        dark: {
          backgroundColor: colors.muted.dark,
          color: colors.primary.dark,
          borderLeft: `3px solid ${colors.primary.dark}`,
          fontWeight: typography.fontWeight.semibold,
        }
      }
    }
  }
} as const;

// ============================================================================
// TABLE COMPONENT STYLES - COMPLETELY FLAT
// ============================================================================
export const tableStyles = {
  container: {
    borderRadius: '0px',  // FLAT DESIGN
    border: '1px solid',
    overflow: 'hidden',
    boxShadow: 'none',  // NO SHADOW
  },
  
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontFamily: typography.fontFamily.sans.join(', '),
    fontSize: typography.fontSize.sm,
  },
  
  header: {
    base: {
      fontWeight: typography.fontWeight.semibold,
      textAlign: 'left' as const,
      padding: spacing[3],
      borderBottom: '1px solid',
    },
    
    theme: {
      light: {
        backgroundColor: colors.muted.light,
        color: colors.foreground.light,
        borderColor: colors.border.light,
      },
      dark: {
        backgroundColor: colors.muted.dark,
        color: colors.foreground.dark,
        borderColor: colors.border.dark,
      }
    }
  },
  
  cell: {
    base: {
      padding: spacing[3],
      borderBottom: '1px solid',
    },
    
    theme: {
      light: {
        color: colors.foreground.light,
        borderColor: colors.border.light,
        '&:hover': {
          backgroundColor: colors.muted.light,
        }
      },
      dark: {
        color: colors.foreground.dark,
        borderColor: colors.border.dark,
        '&:hover': {
          backgroundColor: colors.muted.dark,
        }
      }
    }
  }
} as const;

// ============================================================================
// UTILITY FUNCTIONS FOR STYLE GENERATION - FLAT DESIGN
// ============================================================================

/**
 * Generate Tailwind classes for button variants - FLAT DESIGN
 */
export function getButtonClasses(variant: 'primary' | 'outline' | 'ghost', size: 'sm' | 'md' | 'lg' = 'md'): string {
  const baseClasses = [
    'inline-flex', 'items-center', 'justify-center',
    'font-medium', 'transition-colors', 'duration-200',
    'cursor-pointer', 'border-0', 'no-underline',
    'flat', 'no-hover-transform'  // FLAT DESIGN CLASSES
  ];
  
  const sizeClasses = {
    sm: ['h-8', 'px-3', 'text-sm'],
    md: ['h-10', 'px-4', 'text-base'],
    lg: ['h-12', 'px-6', 'text-lg']
  };
  
  const variantClasses = {
    primary: [
      'bg-primary', 'text-primary-foreground',
      'hover:opacity-90'  // SIMPLE OPACITY CHANGE
    ],
    outline: [
      'bg-transparent', 'text-primary',
      'border', 'border-primary',
      'hover:bg-primary', 'hover:text-primary-foreground'
    ],
    ghost: [
      'bg-transparent', 'text-foreground',
      'hover:bg-muted'
    ]
  };
  
  return [
    ...baseClasses,
    ...sizeClasses[size],
    ...variantClasses[variant]
  ].join(' ');
}

/**
 * Generate Tailwind classes for card variants - FLAT DESIGN
 */
export function getCardClasses(variant: 'default' | 'elevated' = 'default'): string {
  const baseClasses = [
    'border', 'p-6',
    'flat', 'no-hover-transform'  // FLAT DESIGN CLASSES
  ];
  
  const variantClasses = {
    default: [
      'bg-card', 'border-border', 'text-card-foreground'
    ],
    elevated: [
      'bg-card', 'border-border', 'text-card-foreground'
    ]
  };
  
  return [
    ...baseClasses,
    ...variantClasses[variant]
  ].join(' ');
}

/**
 * Generate Tailwind classes for navigation items - FLAT DESIGN
 */
export function getNavItemClasses(isActive: boolean = false): string {
  const baseClasses = [
    'flex', 'items-center', 'px-3', 'py-2',
    'text-sm', 'font-medium',
    'no-underline', 'transition-colors', 'duration-150',
    'cursor-pointer', 'flat'  // FLAT DESIGN CLASS
  ];
  
  const stateClasses = isActive ? [
    'bg-muted', 'text-primary', 'border-l-3', 'border-primary',
    'font-semibold'
  ] : [
    'text-muted-foreground', 'hover:bg-muted', 'hover:text-foreground'
  ];
  
  return [
    ...baseClasses,
    ...stateClasses
  ].join(' ');
}

// Export all component styles
export const componentStyles = {
  button: buttonStyles,
  card: cardStyles,
  input: inputStyles,
  navigation: navigationStyles,
  table: tableStyles,
  getButtonClasses,
  getCardClasses,
  getNavItemClasses,
} as const;

export default componentStyles;
