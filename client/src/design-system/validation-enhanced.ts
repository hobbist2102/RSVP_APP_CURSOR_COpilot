/**
 * ULTRA-COMPREHENSIVE DESIGN SYSTEM VALIDATION UTILITY
 * Ensures 100% compliance with Apple iOS 18 luxury minimal design specification
 * Catches EVERY SINGLE UI violation across ALL design aspects
 * NO EXCEPTIONS - EVERY ELEMENT IS VALIDATED
 */

import { colors } from './tokens';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// COMPREHENSIVE UI ELEMENT VALIDATION FRAMEWORK
// Complete list of ALL elements that constitute professional UI design
const UI_VALIDATION_CATEGORIES = {
  // 1. BUTTON ELEMENTS - All interactive buttons must follow design system
  BUTTON_SELECTORS: [
    'button', '.btn', '.button', '[role="button"]', 'input[type="submit"]', 
    'input[type="button"]', 'input[type="reset"]', '.view-all', '.add-task',
    '.connect-button', '.import-guests', '.add-guest', '.create-event'
  ],
  
  // 2. NAVIGATION ELEMENTS - Sidebars, headers, navigation
  NAVIGATION_SELECTORS: [
    'nav', '.nav', '.navbar', '.sidebar', 'header', '.header',
    '.navigation', '.menu', '.nav-item', '.nav-link'
  ],
  
  // 3. CARD ELEMENTS - All card components and containers
  CARD_SELECTORS: [
    '.card', '.panel', '.widget', '.dashboard-card', '.stats-card',
    '.progress-card', '.task-card', '.accommodation-card'
  ],
  
  // 4. FORM ELEMENTS - All input and form components
  FORM_SELECTORS: [
    'input', 'select', 'textarea', '.form-control', '.input',
    '.select', '.checkbox', '.radio', '.form-group', 'label'
  ],
  
  // 5. STATUS INDICATORS - All status and state elements
  STATUS_SELECTORS: [
    '.status', '.badge', '.chip', '.pill', '.tag',
    '.pending', '.confirmed', '.declined', '.success', '.error', '.warning'
  ],
  
  // 6. COMMUNICATION ELEMENTS - Email providers, templates, etc.
  COMMUNICATION_SELECTORS: [
    '.email-provider', '.sms-provider', '.template-card',
    '.provider-card', '.communication-step', '.wizard-step'
  ],
  
  // 7. HOVER STATES - All elements with hover interactions
  HOVER_STATES: [
    ':hover', '.hover\\:', 'button:hover', '.btn:hover',
    '.card:hover', '.nav-item:hover', '.template:hover'
  ]
};

// CRITICAL DESIGN VIOLATIONS TO CATCH
const CRITICAL_VIOLATIONS = {
  // Font violations - Only Inter and Cormorant Garamond allowed
  FORBIDDEN_FONTS: [
    'arial', 'helvetica', 'times', 'georgia', 'verdana', 'courier',
    'tahoma', 'trebuchet', 'impact', 'lucida', 'palatino', 'century',
    'bookman', 'optima', 'futura', 'franklin', 'gill sans'
  ],
  
  // Color violations - Colors not in our design system
  FORBIDDEN_COLORS: {
    'blue': 'Should use var(--primary) or var(--accent)',
    'green': 'Should use var(--success) or approved design tokens',
    'red': 'Should use var(--destructive) or approved design tokens',
    'yellow': 'Should use var(--warning) or approved design tokens',
    'white': 'Should use var(--background) or var(--card)',
    'black': 'Should use var(--foreground) or var(--primary)'
  },
  
  // Button violations - All buttons must follow design system
  BUTTON_VIOLATIONS: [
    'View All', 'Add Task', 'Connect', 'Import Guests', 'Add Guest'
  ]
};

// Hardcoded color patterns to detect and flag
const HARDCODED_COLOR_PATTERNS = [
  /rgb\(\d+,\s*\d+,\s*\d+\)/, // rgb(255, 255, 255)
  /rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)/, // rgba(255, 255, 255, 0.5)
  /hsl\(\d+,\s*\d+%,\s*\d+%\)/, // hsl(0, 0%, 100%)
  /hsla\(\d+,\s*\d+%,\s*\d+%,\s*[\d.]+\)/, // hsla(0, 0%, 100%, 0.5)
  /oklch\([\d.]+\s+[\d.]+\s+[\d.]+\)/, // oklch(1 0 0)
  /#[0-9a-fA-F]{3,8}/, // #fff, #ffffff, #ffffff80
];

// Prohibited Tailwind CSS classes that use hardcoded colors
const PROHIBITED_TAILWIND_CLASSES = [
  // Background colors
  /bg-gray-\d+/, /bg-slate-\d+/, /bg-zinc-\d+/, /bg-neutral-\d+/, /bg-stone-\d+/,
  /bg-red-\d+/, /bg-orange-\d+/, /bg-amber-\d+/, /bg-yellow-\d+/, /bg-lime-\d+/,
  /bg-green-\d+/, /bg-emerald-\d+/, /bg-teal-\d+/, /bg-cyan-\d+/, /bg-sky-\d+/,
  /bg-blue-\d+/, /bg-indigo-\d+/, /bg-violet-\d+/, /bg-purple-\d+/, /bg-fuchsia-\d+/,
  /bg-pink-\d+/, /bg-rose-\d+/, /bg-white/, /bg-black/,
  
  // Hover background colors
  /hover:bg-gray-\d+/, /hover:bg-slate-\d+/, /hover:bg-zinc-\d+/, /hover:bg-neutral-\d+/, /hover:bg-stone-\d+/,
  /hover:bg-red-\d+/, /hover:bg-orange-\d+/, /hover:bg-amber-\d+/, /hover:bg-yellow-\d+/, /hover:bg-lime-\d+/,
  /hover:bg-green-\d+/, /hover:bg-emerald-\d+/, /hover:bg-teal-\d+/, /hover:bg-cyan-\d+/, /hover:bg-sky-\d+/,
  /hover:bg-blue-\d+/, /hover:bg-indigo-\d+/, /hover:bg-violet-\d+/, /hover:bg-purple-\d+/, /hover:bg-fuchsia-\d+/,
  /hover:bg-pink-\d+/, /hover:bg-rose-\d+/, /hover:bg-white/, /hover:bg-black/,
  
  // Text colors
  /text-gray-\d+/, /text-slate-\d+/, /text-zinc-\d+/, /text-neutral-\d+/, /text-stone-\d+/,
  /text-red-\d+/, /text-orange-\d+/, /text-amber-\d+/, /text-yellow-\d+/, /text-lime-\d+/,
  /text-green-\d+/, /text-emerald-\d+/, /text-teal-\d+/, /text-cyan-\d+/, /text-sky-\d+/,
  /text-blue-\d+/, /text-indigo-\d+/, /text-violet-\d+/, /text-purple-\d+/, /text-fuchsia-\d+/,
  /text-pink-\d+/, /text-rose-\d+/, /text-white/, /text-black/,
  
  // Border colors
  /border-gray-\d+/, /border-slate-\d+/, /border-zinc-\d+/, /border-neutral-\d+/, /border-stone-\d+/,
  /border-red-\d+/, /border-orange-\d+/, /border-amber-\d+/, /border-yellow-\d+/, /border-lime-\d+/,
  /border-green-\d+/, /border-emerald-\d+/, /border-teal-\d+/, /border-cyan-\d+/, /border-sky-\d+/,
  /border-blue-\d+/, /border-indigo-\d+/, /border-violet-\d+/, /border-purple-\d+/, /border-fuchsia-\d+/,
  /border-pink-\d+/, /border-rose-\d+/, /border-white/, /border-black/,
];

// Approved fonts according to design system
const APPROVED_FONTS = ['Inter', 'Cormorant Garamond', 'system-ui', '-apple-system'];

// All possible color properties to validate
const ALL_COLOR_PROPERTIES = [
  'color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor', 
  'borderBottomColor', 'borderLeftColor', 'outlineColor', 'textDecorationColor',
  'caretColor', 'columnRuleColor', 'fill', 'stroke', 'accentColor', 'scrollbarColor'
];

/**
 * ULTRA-COMPREHENSIVE COLOR VALIDATION
 * Detects EVERY hardcoded color and enforces design token usage
 */
export function validateColorUsage(element: HTMLElement): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const computedStyle = window.getComputedStyle(element);

  ALL_COLOR_PROPERTIES.forEach(property => {
    const value = computedStyle.getPropertyValue(property);
    if (value && value !== 'initial' && value !== 'inherit' && value !== 'transparent' && value !== 'currentcolor') {
      // Check if it's a hardcoded color
      const isHardcodedColor = HARDCODED_COLOR_PATTERNS.some(pattern => pattern.test(value));
      
      if (isHardcodedColor) {
        errors.push(`${property}: "${value}" should use design tokens (var(--*)).`);
      }
      
      // COMPREHENSIVE UI ELEMENT VALIDATION
      const normalizedValue = value.replace(/\s+/g, ' ').trim().toLowerCase();
      const classList = element.className || '';
      const tagName = element.tagName.toLowerCase();
      const textContent = element.textContent?.trim() || '';
      
      // 1. BUTTON VALIDATION - Check all button elements
      if (tagName === 'button' || classList.includes('btn') || classList.includes('button') || 
          textContent.includes('View All') || textContent.includes('Add Task') || 
          textContent.includes('Connect') || textContent.includes('Import Guests')) {
        
        // Buttons should not use blue, green, or white backgrounds unless design tokens
        if (property === 'backgroundColor') {
          if ((normalizedValue.includes('blue') || normalizedValue.includes('rgb(0, 123, 255)') ||
               normalizedValue.includes('green') || normalizedValue.includes('rgb(40, 167, 69)') ||
               normalizedValue.includes('white') || normalizedValue.includes('rgb(255, 255, 255)')) &&
              !value.includes('var(--')) {
            errors.push(`BUTTON VIOLATION: "${textContent}" button uses unauthorized color "${value}". Should use design tokens like var(--primary) or var(--accent).`);
          }
        }
      }
      
      // 2. COMMUNICATION STEP VALIDATION - Check hover states
      if (classList.includes('communication') || classList.includes('provider') || 
          classList.includes('template') || element.closest('.communication-step')) {
        
        if (property === 'backgroundColor' && normalizedValue.includes('white')) {
          errors.push(`COMMUNICATION HOVER VIOLATION: Communication elements showing white hover colors instead of design system colors. Use var(--accent-hover) or var(--card-hover).`);
        }
      }
      
      // 3. HEADER/EVENT SECTION VALIDATION
      if (tagName === 'header' || classList.includes('header') || 
          classList.includes('event-selector') || element.closest('header')) {
        
        if (property === 'backgroundColor' || property === 'color') {
          // Check for non-design-system colors in header
          if ((normalizedValue.includes('blue') || normalizedValue.includes('green')) && 
              !value.includes('var(--')) {
            errors.push(`HEADER COLOR VIOLATION: Event section uses unauthorized "${value}". Should match UI color scheme with design tokens.`);
          }
        }
      }
      
      // 4. SIDEBAR VALIDATION (Enhanced)
      if (tagName === 'nav' || classList.includes('sidebar') || element.closest('nav')) {
        if (property === 'backgroundColor') {
          const isDarkMode = document.documentElement.classList.contains('dark');
          if (isDarkMode && !value.includes('var(--card)') && !normalizedValue.includes('0.235')) {
            warnings.push(`SIDEBAR: Should use bg-card (oklch(0.235 0 0)) in dark mode, found: ${value}`);
          } else if (!isDarkMode && !value.includes('var(--card)') && !normalizedValue.includes('0.9851')) {
            warnings.push(`SIDEBAR: Should use bg-card (oklch(0.9851 0 0)) in light mode, found: ${value}`);
          }
        }
      }
      
      // 5. FORBIDDEN COLOR DETECTION
      Object.entries(CRITICAL_VIOLATIONS.FORBIDDEN_COLORS).forEach(([color, replacement]) => {
        if (normalizedValue.includes(color) && !value.includes('var(--')) {
          errors.push(`FORBIDDEN COLOR: "${color}" detected in ${property}. ${replacement}`);
        }
      });
      
      // 6. PURE COLOR VIOLATIONS (Black/White)
      const pureColorViolations = [
        { 
          patterns: ['rgba(0, 0, 0', 'rgb(0, 0, 0)', '#000000', '#000'], 
          replacement: 'var(--foreground)',
          description: 'Pure black'
        },
        { 
          patterns: ['rgba(255, 255, 255', 'rgb(255, 255, 255)', '#ffffff', '#fff'], 
          replacement: 'var(--background)',
          description: 'Pure white'
        }
      ];
      
      pureColorViolations.forEach(violation => {
        const hasViolation = violation.patterns.some(pattern => 
          normalizedValue.includes(pattern.toLowerCase())
        );
        
        if (hasViolation) {
          warnings.push(`${violation.description} violation: ${property} should use ${violation.replacement} instead of "${value}"`);
        }
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * COMPREHENSIVE FLAT DESIGN VALIDATION
 * Checks EVERY aspect of flat design compliance
 */
export function validateFlatDesign(element: HTMLElement): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const computedStyle = window.getComputedStyle(element);

  // 1. BORDER RADIUS VALIDATION - Must be 0 for flat design (except glassmorphism)
  const borderRadius = computedStyle.borderRadius;
  if (borderRadius !== '0px' && borderRadius !== 'none' && borderRadius !== '0') {
    // Allow border radius only for glassmorphism elements
    if (!element.classList.contains('glass') && !element.classList.contains('glass-light')) {
      errors.push(`border-radius: ${borderRadius}. Must be 0px for flat design.`);
    }
  }

  // 2. BOX SHADOW VALIDATION - Prohibited in flat design
  const boxShadow = computedStyle.boxShadow;
  if (boxShadow !== 'none') {
    errors.push(`box-shadow: ${boxShadow}. Shadows are prohibited in flat design.`);
  }

  // 3. TEXT SHADOW VALIDATION - Prohibited in flat design
  const textShadow = computedStyle.textShadow;
  if (textShadow !== 'none') {
    errors.push(`text-shadow: ${textShadow}. Text shadows are prohibited in flat design.`);
  }

  // 4. GRADIENT VALIDATION - Only approved glassmorphism gradients allowed
  const backgroundImage = computedStyle.backgroundImage;
  if (backgroundImage !== 'none' && backgroundImage !== 'initial') {
    if (!element.classList.contains('glass') && !element.classList.contains('glass-light')) {
      warnings.push(`background-image: ${backgroundImage}. Only glassmorphism gradients allowed.`);
    }
  }

  // 5. TRANSFORM VALIDATION - Only approved transforms allowed
  const transform = computedStyle.transform;
  if (transform !== 'none' && transform !== 'initial') {
    if (transform.includes('rotateX') || transform.includes('rotateY') || transform.includes('perspective')) {
      errors.push(`3D transform: ${transform}. Only 2D transforms allowed in flat design.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * ULTRA-COMPREHENSIVE TYPOGRAPHY VALIDATION
 * Validates font families with ZERO TOLERANCE for violations
 */
export function validateTypography(element: HTMLElement): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const computedStyle = window.getComputedStyle(element);

  // STRICT Font family validation - ONLY Inter and Cormorant Garamond allowed
  const fontFamily = computedStyle.fontFamily.toLowerCase();
  const isSystemFont = fontFamily.includes('inherit') || fontFamily.includes('initial') || fontFamily.includes('unset');
  
  if (!isSystemFont) {
    const hasInter = fontFamily.includes('inter');
    const hasCormorant = fontFamily.includes('cormorant') || fontFamily.includes('garamond');
    
    if (!hasInter && !hasCormorant) {
      errors.push(`FONT VIOLATION: font-family "${computedStyle.fontFamily}" detected. ONLY Inter and Cormorant Garamond are allowed in our design system.`);
    }
    
    // Check for common font violations
    const forbiddenFonts = [
      'arial', 'helvetica', 'times', 'georgia', 'verdana', 'courier', 'comic sans', 
      'tahoma', 'trebuchet', 'impact', 'lucida', 'palatino', 'garamond', 'century',
      'bookman', 'avant garde', 'optima', 'futura', 'franklin', 'gill sans'
    ];
    
    forbiddenFonts.forEach(forbidden => {
      if (fontFamily.includes(forbidden) && !fontFamily.includes('cormorant')) {
        errors.push(`FORBIDDEN FONT: "${forbidden}" detected in font-family. Use Inter for UI text or Cormorant Garamond for decorative text.`);
      }
    });
  }

  // Font weight validation
  const fontWeight = computedStyle.fontWeight;
  const numericWeight = parseInt(fontWeight);
  if (numericWeight && (numericWeight < 300 || numericWeight > 700)) {
    warnings.push(`font-weight: ${fontWeight}. Should use weights between 300-700 for optimal readability.`);
  }

  // Text decoration validation
  const textDecoration = computedStyle.textDecoration;
  if (textDecoration.includes('underline') && !textDecoration.includes('var(--')) {
    warnings.push(`text-decoration: ${textDecoration}. Use design tokens for decoration colors.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * COMPREHENSIVE SPACING VALIDATION
 * Validates margins, padding, and spacing consistency
 */
export function validateSpacing(element: HTMLElement): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const computedStyle = window.getComputedStyle(element);

  const spacingProperties = [
    'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
    'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'gap', 'rowGap', 'columnGap', 'top', 'right', 'bottom', 'left'
  ];
  
  spacingProperties.forEach(property => {
    const value = computedStyle.getPropertyValue(property);
    if (value && value !== '0px' && value !== 'auto' && value !== 'initial' && value !== 'inherit') {
      // Check for inconsistent units
      if (value.includes('px') && parseFloat(value) % 4 !== 0) {
        warnings.push(`${property}: ${value}. Consider using 4px grid system (4, 8, 12, 16, etc.).`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * COMPREHENSIVE GLASSMORPHISM VALIDATION
 * Ensures proper implementation of glass effects
 */
export function validateGlassmorphism(element: HTMLElement): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const computedStyle = window.getComputedStyle(element);

  if (element.classList.contains('glass') || element.classList.contains('glass-light')) {
    // Check for backdrop-blur
    const backdropFilter = computedStyle.backdropFilter;
    if (!backdropFilter.includes('blur')) {
      errors.push(`Glass element missing backdrop-blur effect.`);
    }

    // Check for semi-transparent background
    const backgroundColor = computedStyle.backgroundColor;
    if (!backgroundColor.includes('rgba') && !backgroundColor.includes('hsla') && !backgroundColor.includes('var(--')) {
      warnings.push(`Glass element should have semi-transparent background or use design tokens.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * COMPREHENSIVE TAILWIND CLASS VALIDATION
 * Validates that no prohibited hardcoded color classes are used
 */
export function validateTailwindClasses(element: HTMLElement): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const classList = element.className;
  
  if (classList) {
    // Check for prohibited Tailwind classes
    PROHIBITED_TAILWIND_CLASSES.forEach(pattern => {
      const matches = classList.match(pattern);
      if (matches) {
        errors.push(`Prohibited Tailwind class: "${matches[0]}". Use design tokens instead (bg-card, hover:glass-light, etc.).`);
      }
    });
    
    // Special check for rounded corners in flat design
    if (classList.includes('rounded') && !element.classList.contains('glass')) {
      errors.push(`Class "rounded" violates flat design. Remove border-radius or use glassmorphism.`);
    }
    
    // Check for shadow classes
    if (classList.match(/shadow-\w+/)) {
      errors.push(`Shadow classes violate flat design. Remove all shadow utilities.`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * HYBRID APPROACH ARCHITECTURE VALIDATION
 * Ensures components follow the hybrid design system approach:
 * Design Tokens → CSS Variables → Component Utilities
 * 
 * Focuses on real violations developers might introduce
 */
export function validateHybridApproach(element: HTMLElement): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 1. CHECK FOR INLINE STYLES (Major violation of hybrid approach)
  if (element.style.length > 0) {
    const inlineStyleViolations = [];
    for (let i = 0; i < element.style.length; i++) {
      const property = element.style[i];
      const value = element.style.getPropertyValue(property);
      
      // Only flag problematic inline styles
      if (property === 'color' || property === 'background-color' || 
          property === 'border-color' || property === 'font-size' ||
          property === 'font-family' || property === 'margin' || property === 'padding') {
        inlineStyleViolations.push(`${property}: ${value}`);
      }
    }
    
    if (inlineStyleViolations.length > 0) {
      errors.push(`Inline styles violate hybrid approach: ${inlineStyleViolations.join(', ')}. Use design system classes instead.`);
    }
  }
  
  // 2. CHECK FOR DIRECT CSS CUSTOM PROPERTY USAGE IN CLASSES
  const classList = element.className;
  if (classList && classList.includes('var(--')) {
    errors.push(`Direct CSS variable usage in className violates hybrid approach. Use design token classes instead.`);
  }
  
  // 3. CHECK FOR NON-APPROVED STYLE ATTRIBUTES
  const styleAttr = element.getAttribute('style');
  if (styleAttr) {
    // Check for hardcoded colors in style attribute
    const colorPatterns = [/#[0-9a-fA-F]{3,8}/, /rgb\([^)]+\)/, /rgba\([^)]+\)/, /hsl\([^)]+\)/, /oklch\([^)]+\)/];
    const hasHardcodedColor = colorPatterns.some(pattern => pattern.test(styleAttr));
    
    if (hasHardcodedColor) {
      errors.push(`Hardcoded colors in style attribute violate hybrid approach. Use design system CSS variables.`);
    }
    
    // Check for custom CSS properties that bypass design system
    const customVarMatches = styleAttr.match(/--[a-zA-Z0-9-]+\s*:\s*[^;]+/g);
    if (customVarMatches) {
      const unauthorizedVars = customVarMatches.filter(varDef => {
        const varName = varDef.split(':')[0].trim();
        return !varName.startsWith('--background') && 
               !varName.startsWith('--primary') && 
               !varName.startsWith('--secondary') &&
               !varName.startsWith('--accent') &&
               !varName.startsWith('--muted') &&
               !varName.startsWith('--card') &&
               !varName.startsWith('--tw-') &&
               !varName.startsWith('--font-') &&
               !varName.startsWith('--shadow-') &&
               !varName.startsWith('--color-') &&
               !varName.startsWith('--sidebar-');
      });
      
      if (unauthorizedVars.length > 0) {
        warnings.push(`Custom CSS variables bypass design system: ${unauthorizedVars.join(', ')}. Use approved design tokens.`);
      }
    }
  }
  
  // 4. CHECK FOR COMPONENT UTILITY VIOLATIONS
  if (classList) {
    // Check for mixing of design approaches
    const hasUtilityClasses = classList.match(/bg-|text-|border-|p-|m-|flex|grid/);
    const hasArbitraryValues = classList.includes('[') && classList.includes(']');
    
    if (hasUtilityClasses && hasArbitraryValues) {
      warnings.push(`Mixing utility classes with arbitrary values may violate design consistency. Prefer design tokens.`);
    }
  }
  
  // 5. CHECK FOR MISSING DESIGN SYSTEM COMPLIANCE ON INTERACTIVE ELEMENTS
  const interactiveElements = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
  const hasInteractiveRole = element.getAttribute('role') === 'button' || 
                            element.getAttribute('role') === 'link' ||
                            interactiveElements.includes(element.tagName);
  
  if (hasInteractiveRole && classList) {
    const hasDesignSystemClasses = classList.includes('bg-') || classList.includes('text-') || 
                                  classList.includes('border-') || classList.includes('glass') ||
                                  classList.includes('flat') || classList.includes('hover:');
    
    if (!hasDesignSystemClasses) {
      warnings.push(`Interactive element lacks design system styling. Use component utilities or design token classes.`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * COMPREHENSIVE BUTTON VALIDATION
 * Validates button styling and interactions
 */
export function validateButtons(element: HTMLElement): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const computedStyle = window.getComputedStyle(element);

  if (element.tagName === 'BUTTON' || element.getAttribute('role') === 'button') {
    // Check cursor
    const cursor = computedStyle.cursor;
    if (cursor !== 'pointer') {
      warnings.push(`Button should have cursor: pointer.`);
    }

    // Check transition
    const transition = computedStyle.transition;
    if (transition === 'none' || transition === 'all 0s ease 0s') {
      warnings.push(`Button should have smooth transitions for better UX.`);
    }

    // Check for proper focus styles
    const outline = computedStyle.outline;
    const outlineOffset = computedStyle.outlineOffset;
    if (outline === 'none' && !element.classList.contains('focus:ring')) {
      warnings.push(`Button should have visible focus indicators for accessibility.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * RUNS ULTRA-COMPREHENSIVE VALIDATION ON ALL ELEMENTS
 * NO ELEMENT IS SPARED - EVERY SINGLE ONE IS CHECKED
 */
export function validateEntireDocument(): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  const allElements = document.querySelectorAll('*');
  
  allElements.forEach((element, index) => {
    if (element instanceof HTMLElement) {
      // Skip script and style elements
      if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') {
        return;
      }

      const validations = [
        validateFlatDesign(element),
        validateColorUsage(element),
        validateTypography(element),
        validateSpacing(element),
        validateGlassmorphism(element),
        validateTailwindClasses(element),
        validateHybridApproach(element),
        validateButtons(element)
      ];

      validations.forEach(result => {
        result.errors.forEach(error => {
          allErrors.push(`Element ${index}: ${error}`);
        });

        result.warnings.forEach(warning => {
          allWarnings.push(`Element ${index}: ${warning}`);
        });
      });
    }
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
}

/**
 * ENHANCED VALIDATION RUNNER WITH DETAILED REPORTING
 */
export function runDesignSystemValidation(): void {
  if (typeof window === 'undefined') return;

  const result = validateEntireDocument();
  
  if (result.errors.length > 0) {
    console.group('🚨 CRITICAL Design System Violations');
    result.errors.slice(0, 20).forEach(error => console.error(error)); // Show first 20 errors
    if (result.errors.length > 20) {
      console.error(`... and ${result.errors.length - 20} more errors`);
    }
    console.groupEnd();
  }

  if (result.warnings.length > 0) {
    console.group('⚠️ Design System Validation Warnings');
    result.warnings.slice(0, 20).forEach(warning => console.warn(warning)); // Show first 20 warnings
    if (result.warnings.length > 20) {
      console.warn(`... and ${result.warnings.length - 20} more warnings`);
    }
    console.groupEnd();
  }

  if (result.isValid) {
    console.log('✅ Design system validation passed');
  } else {
    console.log(`❌ Found ${result.errors.length} errors and ${result.warnings.length} warnings`);
  }
}

// Auto-run enhanced validation in development
if (typeof window !== 'undefined') {
  // Run validation after DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(runDesignSystemValidation, 1000);
    });
  } else {
    setTimeout(runDesignSystemValidation, 1000);
  }
}

export default {
  validateFlatDesign,
  validateColorUsage,
  validateTypography,
  validateSpacing,
  validateGlassmorphism,
  validateTailwindClasses,
  validateHybridApproach,
  validateButtons,
  validateEntireDocument,
  runDesignSystemValidation
};