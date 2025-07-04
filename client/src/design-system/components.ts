/**
 * ENTERPRISE-GRADE COMPONENT UTILITIES
 * 
 * Reusable component style generators using design tokens
 * Implements luxury iOS 18 flat design with zero-tolerance compliance
 * Tailwind 4 compatible with hex-based color system
 */

import { colorTokens } from './tokens';

// =============================================================================
// BUTTON COMPONENTS
// =============================================================================

export function getButtonClasses(
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' = 'primary',
  size: 'sm' | 'md' | 'lg' = 'md'
): string {
  const baseClasses = [
    'inline-flex items-center justify-center',
    'font-medium transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'disabled:opacity-50 disabled:pointer-events-none',
    'flat', // Zero border-radius, zero shadows
  ];

  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  const variantClasses = {
    primary: 'bg-primary text-primary-foreground border-2 border-primary hover:bg-primary/90 hover:scale-105',
    secondary: 'bg-secondary text-secondary-foreground border-2 border-secondary hover:bg-secondary/90 hover:scale-105',
    outline: 'border-2 border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground hover:scale-105',
    ghost: 'border-2 border-transparent text-foreground hover:bg-accent hover:text-accent-foreground hover:scale-105',
    destructive: 'bg-destructive text-destructive-foreground border-2 border-destructive hover:bg-destructive/90 hover:scale-105',
  };

  return [
    ...baseClasses,
    sizeClasses[size],
    variantClasses[variant],
  ].join(' ');
}

// =============================================================================
// CARD COMPONENTS
// =============================================================================

export function getCardClasses(
  variant: 'default' | 'elevated' | 'interactive' = 'default'
): string {
  const baseClasses = [
    'bg-card text-card-foreground',
    'border border-border',
    'flat', // Zero border-radius, zero shadows
  ];

  const variantClasses = {
    default: '',
    elevated: 'border-2 border-accent',
    interactive: 'transition-all duration-200 hover:border-accent hover:scale-102 cursor-pointer',
  };

  return [
    ...baseClasses,
    variantClasses[variant],
  ].join(' ');
}

// =============================================================================
// NAVIGATION COMPONENTS
// =============================================================================

export function getNavItemClasses(
  isActive: boolean = false,
  variant: 'sidebar' | 'header' | 'tab' = 'sidebar'
): string {
  const baseClasses = [
    'flex items-center gap-3 px-3 py-2',
    'text-sm font-medium transition-all duration-200',
    'flat', // Zero border-radius, zero shadows
  ];

  const variantClasses = {
    sidebar: [
      'text-sidebar-foreground',
      isActive 
        ? 'bg-sidebar-accent text-sidebar-accent-foreground border-l-3 border-sidebar-primary' 
        : 'hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
    ],
    header: [
      'text-foreground',
      isActive 
        ? 'bg-accent text-accent-foreground border-b-3 border-accent' 
        : 'hover:bg-accent/10 hover:text-accent',
    ],
    tab: [
      'text-muted-foreground',
      isActive 
        ? 'text-foreground border-b-3 border-accent' 
        : 'hover:text-foreground hover:border-b-3 hover:border-border',
    ],
  };

  return [
    ...baseClasses,
    ...variantClasses[variant],
  ].join(' ');
}

// =============================================================================
// INPUT COMPONENTS
// =============================================================================

export function getInputClasses(
  variant: 'default' | 'error' | 'success' = 'default',
  size: 'sm' | 'md' | 'lg' = 'md'
): string {
  const baseClasses = [
    'flex w-full bg-input text-foreground',
    'border border-border px-3 py-2',
    'transition-colors duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'placeholder:text-muted-foreground',
    'flat', // Zero border-radius, zero shadows
  ];

  const sizeClasses = {
    sm: 'h-8 px-2 text-sm',
    md: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-base',
  };

  const variantClasses = {
    default: 'border-border focus-visible:border-ring',
    error: 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive',
    success: 'border-accent focus-visible:border-accent focus-visible:ring-accent',
  };

  return [
    ...baseClasses,
    sizeClasses[size],
    variantClasses[variant],
  ].join(' ');
}

// =============================================================================
// TEXT COMPONENTS
// =============================================================================

export function getTextClasses(
  variant: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'label' = 'body',
  weight: 'normal' | 'medium' | 'semibold' | 'bold' = 'normal'
): string {
  const fontFamilyClasses = {
    h1: 'font-serif',
    h2: 'font-serif', 
    h3: 'font-serif',
    h4: 'font-serif',
    body: 'font-sans',
    caption: 'font-sans',
    label: 'font-sans',
  };

  const sizeClasses = {
    h1: 'text-4xl lg:text-5xl',
    h2: 'text-3xl lg:text-4xl',
    h3: 'text-2xl lg:text-3xl',
    h4: 'text-xl lg:text-2xl',
    body: 'text-base',
    caption: 'text-sm',
    label: 'text-sm',
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  return [
    fontFamilyClasses[variant],
    sizeClasses[variant],
    weightClasses[weight],
    'text-foreground',
  ].join(' ');
}

// =============================================================================
// BADGE COMPONENTS
// =============================================================================

export function getBadgeClasses(
  variant: 'default' | 'secondary' | 'accent' | 'destructive' | 'outline' = 'default',
  size: 'sm' | 'md' = 'md'
): string {
  const baseClasses = [
    'inline-flex items-center font-medium',
    'border transition-colors',
    'flat', // Zero border-radius, zero shadows
  ];

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  const variantClasses = {
    default: 'bg-primary text-primary-foreground border-primary',
    secondary: 'bg-secondary text-secondary-foreground border-secondary',
    accent: 'bg-accent text-accent-foreground border-accent',
    destructive: 'bg-destructive text-destructive-foreground border-destructive',
    outline: 'bg-transparent text-foreground border-border',
  };

  return [
    ...baseClasses,
    sizeClasses[size],
    variantClasses[variant],
  ].join(' ');
}

// =============================================================================
// CONTAINER COMPONENTS
// =============================================================================

export function getContainerClasses(
  variant: 'page' | 'section' | 'content' = 'content',
  spacing: 'none' | 'sm' | 'md' | 'lg' = 'md'
): string {
  const baseClasses = ['w-full'];

  const variantClasses = {
    page: 'min-h-screen bg-background',
    section: 'bg-card border border-border',
    content: 'bg-transparent',
  };

  const spacingClasses = {
    none: '',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  };

  return [
    ...baseClasses,
    variantClasses[variant],
    spacingClasses[spacing],
    'flat', // Zero border-radius, zero shadows
  ].join(' ');
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function createComponentVariant(
  baseClasses: string[],
  variantClasses: Record<string, string>,
  variant: string
): string {
  return [
    ...baseClasses,
    variantClasses[variant] || variantClasses.default || '',
  ].join(' ');
}

export function applyDesignTokens(
  element: HTMLElement,
  tokenMap: Record<string, string>
): void {
  Object.entries(tokenMap).forEach(([property, token]) => {
    element.style.setProperty(property, `var(--${token})`);
  });
}

// =============================================================================
// RESPONSIVE UTILITIES
// =============================================================================

export function getResponsiveClasses(
  mobile: string,
  tablet?: string,
  desktop?: string
): string {
  const classes = [mobile];
  
  if (tablet) {
    classes.push(`md:${tablet}`);
  }
  
  if (desktop) {
    classes.push(`lg:${desktop}`);
  }
  
  return classes.join(' ');
}

// =============================================================================
// ANIMATION UTILITIES
// =============================================================================

export function getAnimationClasses(
  type: 'fade' | 'slide' | 'scale' | 'bounce' = 'fade',
  duration: 'fast' | 'normal' | 'slow' = 'normal'
): string {
  const durationClasses = {
    fast: 'duration-150',
    normal: 'duration-200',
    slow: 'duration-300',
  };

  const typeClasses = {
    fade: 'transition-opacity',
    slide: 'transition-transform',
    scale: 'transition-transform',
    bounce: 'transition-transform',
  };

  return [
    typeClasses[type],
    durationClasses[duration],
    'ease-in-out',
  ].join(' ');
}

// =============================================================================
// FOCUS & ACCESSIBILITY UTILITIES
// =============================================================================

export function getFocusClasses(): string {
  return [
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-ring',
    'focus-visible:ring-offset-2',
    'focus-visible:ring-offset-background',
  ].join(' ');
}

export function getAccessibilityClasses(): string {
  return [
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-ring',
    'disabled:pointer-events-none',
    'disabled:opacity-50',
    'aria-disabled:pointer-events-none',
    'aria-disabled:opacity-50',
  ].join(' ');
}