/**
 * ENTERPRISE-GRADE DESIGN SYSTEM TOKENS
 * Tailwind 4 Compatible with Hex-Based Color System
 * 
 * Implements luxury iOS 18 flat design with enterprise-grade consistency
 * Zero shadows, zero border-radius, beautiful typography, 4px grid system
 * 
 * Architecture:
 * - Hex-based color definitions for precise control
 * - CSS custom properties for seamless theme switching
 * - Professional typography with Inter + Cormorant Garamond
 * - Flat design enforcement (zero radius, zero shadows)
 * - Enterprise-grade spacing system
 */

// =============================================================================
// HEX COLOR SYSTEM - TAILWIND 4 COMPATIBLE
// =============================================================================

export const hexColors = {
  light: {
    // === CORE COLORS ===
    background: '#ffffff',
    foreground: '#333333',
    
    // === SURFACE COLORS ===
    card: '#fafafa',
    cardForeground: '#333333',
    popover: '#ffffff',
    popoverForeground: '#111111',
    
    // === BRAND COLORS ===
    primary: '#6b33b3',
    primaryForeground: '#ffffff',
    secondary: '#d1b981',
    secondaryForeground: '#ffffff',
    
    // === ACCENT SYSTEM ===
    accent: '#9a73f9',
    accentForeground: '#ffffff',
    
    // === STATUS COLORS ===
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
    muted: '#666666',
    mutedForeground: '#666666',
    
    // === INTERFACE COLORS ===
    border: '#dddddd',
    input: '#ffffff',
    ring: '#5e239d',
    
    // === SIDEBAR SYSTEM ===
    sidebar: '#f4f4f4',
    sidebarForeground: '#111111',
    sidebarPrimary: '#5e239d',
    sidebarPrimaryForeground: '#ffffff',
    sidebarAccent: '#6b7280',
    sidebarAccentForeground: '#111111',
    sidebarBorder: '#000000',
    sidebarRing: '#5e239d',
    
    // === CHART COLORS ===
    chart1: '#5e239d',
    chart2: '#8b5cf6',
    chart3: '#bfa76f',
    chart4: '#713f12',
    chart5: '#1e3a8a',
  },
  
  dark: {
    // === CORE COLORS ===
    background: '#121212',
    foreground: '#eaeaea',
    
    // === SURFACE COLORS ===
    card: '#1e1e1e',
    cardForeground: '#eaeaea',
    popover: '#1e1e1e',
    popoverForeground: '#eaeaea',
    
    // === BRAND COLORS ===
    primary: '#5e239d',
    primaryForeground: '#fdfdfd',
    secondary: '#bfa76f',
    secondaryForeground: '#121212',
    
    // === ACCENT SYSTEM ===
    accent: '#8b5cf6',
    accentForeground: '#fdfdfd',
    
    // === STATUS COLORS ===
    destructive: '#dc2626',
    destructiveForeground: '#fdfdfd',
    muted: '#666666',
    mutedForeground: '#aaaaaa',
    
    // === INTERFACE COLORS ===
    border: '#333333',
    input: '#1e1e1e',
    ring: '#5e239d',
    
    // === SIDEBAR SYSTEM ===
    sidebar: '#1e1e1e',
    sidebarForeground: '#fdfdfd',
    sidebarPrimary: '#5e239d',
    sidebarPrimaryForeground: '#fdfdfd',
    sidebarAccent: '#6b7280',
    sidebarAccentForeground: '#fdfdfd',
    sidebarBorder: '#ffffff',
    sidebarRing: '#5e239d',
    
    // === CHART COLORS ===
    chart1: '#5e239d',
    chart2: '#8b5cf6',
    chart3: '#bfa76f',
    chart4: '#713f12',
    chart5: '#1e3a8a',
  }
} as const;

// =============================================================================
// CSS CUSTOM PROPERTIES TOKENS
// =============================================================================

export const colorTokens = {
  // === CORE SEMANTIC COLORS ===
  background: 'var(--background)',
  foreground: 'var(--foreground)',
  
  // === SURFACE COLORS ===
  card: 'var(--card)',
  cardForeground: 'var(--card-foreground)',
  popover: 'var(--popover)',
  popoverForeground: 'var(--popover-foreground)',
  
  // === BRAND COLORS ===
  primary: 'var(--primary)',
  primaryForeground: 'var(--primary-foreground)',
  secondary: 'var(--secondary)',
  secondaryForeground: 'var(--secondary-foreground)',
  
  // === ACCENT SYSTEM ===
  accent: 'var(--accent)',
  accentForeground: 'var(--accent-foreground)',
  
  // === STATUS COLORS ===
  destructive: 'var(--destructive)',
  destructiveForeground: 'var(--destructive-foreground)',
  muted: 'var(--muted)',
  mutedForeground: 'var(--muted-foreground)',
  
  // === INTERFACE COLORS ===
  border: 'var(--border)',
  input: 'var(--input)',
  ring: 'var(--ring)',
  
  // === SIDEBAR SYSTEM ===
  sidebar: 'var(--sidebar)',
  sidebarForeground: 'var(--sidebar-foreground)',
  sidebarPrimary: 'var(--sidebar-primary)',
  sidebarPrimaryForeground: 'var(--sidebar-primary-foreground)',
  sidebarAccent: 'var(--sidebar-accent)',
  sidebarAccentForeground: 'var(--sidebar-accent-foreground)',
  sidebarBorder: 'var(--sidebar-border)',
  sidebarRing: 'var(--sidebar-ring)',
  
  // === CHART COLORS ===
  chart1: 'var(--chart-1)',
  chart2: 'var(--chart-2)',
  chart3: 'var(--chart-3)',
  chart4: 'var(--chart-4)',
  chart5: 'var(--chart-5)',
} as const;

// =============================================================================
// TYPOGRAPHY SYSTEM - ENTERPRISE GRADE
// =============================================================================

export const typography = {
  // === FONT FAMILIES ===
  fontFamilies: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    serif: ['Cormorant Garamond', 'Georgia', 'serif'],
    mono: ['JetBrains Mono', 'Consolas', 'monospace'],
  },
  
  // === FONT SIZES ===
  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
  },
  
  // === FONT WEIGHTS ===
  fontWeights: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  // === LINE HEIGHTS ===
  lineHeights: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  
  // === LETTER SPACING ===
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0.025em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// =============================================================================
// SPACING SYSTEM - 4PX GRID
// =============================================================================

export const spacing = {
  px: '1px',
  0: '0px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px',
} as const;

// =============================================================================
// FLAT DESIGN SYSTEM
// =============================================================================

export const flatDesign = {
  // === RADIUS - ALL ZERO FOR FLAT DESIGN ===
  borderRadius: {
    none: '0px',
    sm: '0px',
    md: '0px',
    lg: '0px',
    xl: '0px',
    '2xl': '0px',
    '3xl': '0px',
    full: '0px',
  },
  
  // === SHADOWS - ALL TRANSPARENT FOR FLAT DESIGN ===
  boxShadow: {
    sm: '0 0 0 0 transparent',
    md: '0 0 0 0 transparent',
    lg: '0 0 0 0 transparent',
    xl: '0 0 0 0 transparent',
    '2xl': '0 0 0 0 transparent',
    inner: '0 0 0 0 transparent',
    none: 'none',
  },
  
  // === BORDERS ===
  borderWidth: {
    0: '0px',
    1: '1px',
    2: '2px',
    3: '3px',
    4: '4px',
  },
} as const;

// =============================================================================
// ANIMATION & TRANSITIONS
// =============================================================================

export const animations = {
  // === TRANSITION DURATIONS ===
  transitionDuration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },
  
  // === TRANSITION TIMING FUNCTIONS ===
  transitionTimingFunction: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // === TRANSFORM SCALES ===
  scale: {
    0: '0',
    50: '.5',
    75: '.75',
    90: '.9',
    95: '.95',
    100: '1',
    105: '1.05',
    110: '1.1',
    125: '1.25',
    150: '1.5',
  },
} as const;

// =============================================================================
// COMPONENT VARIANTS
// =============================================================================

export const componentVariants = {
  // === BUTTON VARIANTS ===
  button: {
    primary: {
      background: colorTokens.primary,
      color: colorTokens.primaryForeground,
      border: `2px solid ${colorTokens.primary}`,
    },
    secondary: {
      background: colorTokens.secondary,
      color: colorTokens.secondaryForeground,
      border: `2px solid ${colorTokens.secondary}`,
    },
    outline: {
      background: 'transparent',
      color: colorTokens.primary,
      border: `2px solid ${colorTokens.border}`,
    },
    ghost: {
      background: 'transparent',
      color: colorTokens.foreground,
      border: '2px solid transparent',
    },
    destructive: {
      background: colorTokens.destructive,
      color: colorTokens.destructiveForeground,
      border: `2px solid ${colorTokens.destructive}`,
    },
  },
  
  // === CARD VARIANTS ===
  card: {
    default: {
      background: colorTokens.card,
      color: colorTokens.cardForeground,
      border: `1px solid ${colorTokens.border}`,
    },
    elevated: {
      background: colorTokens.card,
      color: colorTokens.cardForeground,
      border: `2px solid ${colorTokens.accent}`,
    },
  },
} as const;

// =============================================================================
// EXPORT UNIFIED DESIGN SYSTEM
// =============================================================================

export const designSystem = {
  colors: colorTokens,
  hexColors,
  typography,
  spacing,
  flatDesign,
  animations,
  componentVariants,
} as const;

// Type exports for TypeScript
export type ColorToken = keyof typeof colorTokens;
export type HexColor = keyof typeof hexColors.light;
export type Spacing = keyof typeof spacing;
export type FontSize = keyof typeof typography.fontSizes;
export type FontWeight = keyof typeof typography.fontWeights;