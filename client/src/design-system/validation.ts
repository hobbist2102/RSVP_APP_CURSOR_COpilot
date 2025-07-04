
/**
 * DESIGN SYSTEM VALIDATION UTILITY
 * Ensures 100% compliance with flat design specification
 */

import { colors } from './tokens';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates that an element follows flat design principles
 */
export function validateFlatDesign(element: HTMLElement): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const computedStyle = window.getComputedStyle(element);

  // Check border radius
  const borderRadius = computedStyle.borderRadius;
  if (borderRadius !== '0px' && borderRadius !== 'none') {
    errors.push(`Element has border-radius: ${borderRadius}. Should be 0px.`);
  }

  // Check box shadow
  const boxShadow = computedStyle.boxShadow;
  if (boxShadow !== 'none') {
    errors.push(`Element has box-shadow: ${boxShadow}. Should be none.`);
  }

  // Check backdrop filter
  const backdropFilter = computedStyle.backdropFilter;
  if (backdropFilter !== 'none') {
    warnings.push(`Element has backdrop-filter: ${backdropFilter}. Consider removing for flat design.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates color usage against design tokens
 */
export function validateColorUsage(element: HTMLElement): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const computedStyle = window.getComputedStyle(element);
  
  // Get all CSS custom properties
  const validColors = [
    'var(--background)', 'var(--foreground)', 'var(--card)',
    'var(--primary)', 'var(--secondary)', 'var(--accent)',
    'var(--muted)', 'var(--border)', 'var(--destructive)'
  ];

  const backgroundColor = computedStyle.backgroundColor;
  const color = computedStyle.color;
  const borderColor = computedStyle.borderColor;

  // Check if colors are using CSS variables
  if (backgroundColor && !backgroundColor.includes('var(--') && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
    warnings.push(`Background color "${backgroundColor}" should use design tokens (var(--*)).`);
  }

  if (color && !color.includes('var(--')) {
    warnings.push(`Text color "${color}" should use design tokens (var(--*)).`);
  }

  if (borderColor && !borderColor.includes('var(--')) {
    warnings.push(`Border color "${borderColor}" should use design tokens (var(--*)).`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Runs comprehensive validation on all elements in the document
 */
export function validateEntireDocument(): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  const allElements = document.querySelectorAll('*');
  
  allElements.forEach((element, index) => {
    if (element instanceof HTMLElement) {
      const flatDesignResult = validateFlatDesign(element);
      const colorResult = validateColorUsage(element);

      flatDesignResult.errors.forEach(error => {
        allErrors.push(`Element ${index}: ${error}`);
      });

      flatDesignResult.warnings.forEach(warning => {
        allWarnings.push(`Element ${index}: ${warning}`);
      });

      colorResult.warnings.forEach(warning => {
        allWarnings.push(`Element ${index}: ${warning}`);
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
 * Applies flat design fixes to all elements
 */
export function enforceFlatDesign(): void {
  const allElements = document.querySelectorAll('*');
  
  allElements.forEach(element => {
    if (element instanceof HTMLElement) {
      // Force flat design
      element.style.borderRadius = '0px';
      element.style.boxShadow = 'none';
      element.style.backdropFilter = 'none';
      
      // Add flat design class
      element.classList.add('flat');
    }
  });

  console.log('✅ Flat design enforced on all elements');
}

/**
 * Development helper to validate design system compliance
 */
export function runDesignSystemValidation(): void {
  if (process.env.NODE_ENV !== 'development') return;

  const result = validateEntireDocument();
  
  if (result.errors.length > 0) {
    console.group('🚨 Design System Validation Errors');
    result.errors.forEach(error => console.error(error));
    console.groupEnd();
  }

  if (result.warnings.length > 0) {
    console.group('⚠️ Design System Validation Warnings');
    result.warnings.forEach(warning => console.warn(warning));
    console.groupEnd();
  }

  if (result.isValid) {
    console.log('✅ Design system validation passed');
  }
}

// Auto-run validation in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
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
  validateEntireDocument,
  enforceFlatDesign,
  runDesignSystemValidation
};
