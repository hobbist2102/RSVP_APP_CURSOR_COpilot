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

// Hardcoded color patterns to detect and flag
const HARDCODED_COLOR_PATTERNS = [
  /rgb\(\d+,\s*\d+,\s*\d+\)/, // rgb(255, 255, 255)
  /rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)/, // rgba(255, 255, 255, 0.5)
  /hsl\(\d+,\s*\d+%,\s*\d+%\)/, // hsl(0, 0%, 100%)
  /hsla\(\d+,\s*\d+%,\s*\d+%,\s*[\d.]+\)/, // hsla(0, 0%, 100%, 0.5)
  /oklch\([\d.]+\s+[\d.]+\s+[\d.]+\)/, // oklch(1 0 0)
  /#[0-9a-fA-F]{3,8}/, // #fff, #ffffff, #ffffff80
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
 * COMPREHENSIVE TYPOGRAPHY VALIDATION
 * Validates font families, weights, and text styling
 */
export function validateTypography(element: HTMLElement): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const computedStyle = window.getComputedStyle(element);

  // Font family validation
  const fontFamily = computedStyle.fontFamily;
  const hasApprovedFont = APPROVED_FONTS.some(font => fontFamily.toLowerCase().includes(font.toLowerCase()));
  
  if (!hasApprovedFont && fontFamily !== 'inherit' && fontFamily !== 'initial') {
    errors.push(`font-family: ${fontFamily}. Should use Inter or Cormorant Garamond.`);
  }

  // Font weight validation
  const fontWeight = computedStyle.fontWeight;
  const numericWeight = parseInt(fontWeight);
  if (numericWeight && (numericWeight < 300 || numericWeight > 700)) {
    warnings.push(`font-weight: ${fontWeight}. Consider using weights between 300-700.`);
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
  validateButtons,
  validateEntireDocument,
  runDesignSystemValidation
};