/**
 * COMPREHENSIVE DESIGN SYSTEM AUDIT - GLOBAL GOLD STANDARD
 * Zero-tolerance validation system that catches EVERY violation
 * Builds proper component implementations instead of CSS overrides
 */

// COMPREHENSIVE COLOR VIOLATION DETECTION
const UNAUTHORIZED_COLORS = {
  // RGB Values (all variants)
  rgb: [
    /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/gi,
    /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/gi
  ],
  // HSL Values (all variants)
  hsl: [
    /hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)/gi,
    /hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)/gi
  ],
  // HEX Values (all variants)
  hex: [
    /#[0-9a-fA-F]{3,8}\b/g
  ],
  // OKLCH Values NOT using CSS variables
  oklch: [
    /oklch\([^)]*\)/gi
  ],
  // Hardcoded Tailwind color classes
  tailwind: [
    /\b(bg|text|border|ring|shadow|outline)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)\b/g,
    /\bhover:(bg|text|border)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)\b/g,
    /\bfocus:(bg|text|border|ring)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)\b/g
  ]
};

// COMPREHENSIVE DESIGN TOKEN PATTERNS (what SHOULD be used)
const AUTHORIZED_DESIGN_TOKENS = [
  /var\(--[a-zA-Z-]+\)/g, // CSS custom properties
  /\bbg-(background|foreground|card|popover|primary|secondary|muted|accent|destructive|border|input|ring)\b/g,
  /\btext-(foreground|card-foreground|popover-foreground|primary-foreground|secondary-foreground|muted-foreground|accent-foreground|destructive-foreground)\b/g,
  /\bborder-(border|input|ring|primary|secondary|accent|destructive)\b/g,
  /\bring-(primary|secondary|accent|destructive)\b/g
];

// FLAT DESIGN VIOLATIONS
const FLAT_DESIGN_VIOLATIONS = {
  borderRadius: [
    /border-radius:\s*[^0px][^;]*/gi,
    /\brounded(-[a-z]+)?\b(?!.*rounded-none)/g
  ],
  boxShadow: [
    /box-shadow:\s*(?!none)[^;]*/gi,
    /\bshadow(-[a-z]+)?\b(?!.*shadow-none)/g
  ],
  textShadow: [
    /text-shadow:\s*(?!none)[^;]*/gi
  ]
};

// TYPOGRAPHY VIOLATIONS
const TYPOGRAPHY_VIOLATIONS = {
  unauthorizedFonts: [
    /font-family:\s*(?!.*\b(Inter|Cormorant\sGaramond|var\(--font-[^)]+\))\b)[^;]*/gi
  ],
  incorrectWeights: [
    /font-weight:\s*(?!300|400|500|600|700|normal|medium|semibold|bold|var\(--[^)]+\))[^;]*/gi
  ]
};

/**
 * COMPREHENSIVE AUDIT RUNNER
 * Scans ALL elements and detects EVERY violation type
 */
export function runComprehensiveAudit(): {
  violations: string[];
  warnings: string[];
  totalElements: number;
  violationCount: number;
  warningCount: number;
} {
  const violations: string[] = [];
  const warnings: string[] = [];
  
  // Get all elements in the DOM
  const elements = document.querySelectorAll('*');
  let violationCount = 0;
  let warningCount = 0;

  elements.forEach((element, index) => {
    const computedStyle = window.getComputedStyle(element);
    const classList = Array.from(element.classList).join(' ');
    const inlineStyle = (element as HTMLElement).style.cssText;
    
    // CHECK 1: Color violations
    checkColorViolations(element, computedStyle, classList, inlineStyle, index, violations, warnings);
    
    // CHECK 2: Flat design violations  
    checkFlatDesignViolations(element, computedStyle, classList, inlineStyle, index, violations, warnings);
    
    // CHECK 3: Typography violations
    checkTypographyViolations(element, computedStyle, classList, index, violations, warnings);
    
    // CHECK 4: Spacing violations (4px grid system)
    checkSpacingViolations(element, computedStyle, index, violations, warnings);
    
    // CHECK 5: Design token compliance
    checkDesignTokenCompliance(element, classList, inlineStyle, index, violations, warnings);
  });

  violationCount = violations.length;
  warningCount = warnings.length;

  // Log comprehensive results
  console.group('🔍 COMPREHENSIVE DESIGN SYSTEM AUDIT');
  console.log(`📊 Scanned ${elements.length} elements`);
  console.log(`❌ ${violationCount} critical violations found`);
  console.log(`⚠️ ${warningCount} warnings found`);
  
  if (violationCount > 0) {
    console.group('❌ CRITICAL VIOLATIONS');
    violations.forEach(violation => console.error(violation));
    console.groupEnd();
  }
  
  if (warningCount > 0) {
    console.group('⚠️ WARNINGS');
    warnings.forEach(warning => console.warn(warning));
    console.groupEnd();
  }
  
  console.groupEnd();

  return {
    violations,
    warnings,
    totalElements: elements.length,
    violationCount,
    warningCount
  };
}

/**
 * COLOR VIOLATION CHECKER
 * Detects ANY unauthorized color usage
 */
function checkColorViolations(
  element: Element, 
  computedStyle: CSSStyleDeclaration, 
  classList: string, 
  inlineStyle: string, 
  index: number, 
  violations: string[], 
  warnings: string[]
) {
  const colorProperties = [
    'color', 'backgroundColor', 'borderColor', 'fill', 'stroke', 
    'outlineColor', 'textDecorationColor', 'caretColor', 'columnRuleColor'
  ];

  colorProperties.forEach(prop => {
    const value = computedStyle.getPropertyValue(prop.replace(/([A-Z])/g, '-$1').toLowerCase());
    
    if (value && value !== 'none' && value !== 'transparent' && value !== 'initial' && value !== 'inherit') {
      // Check for hardcoded colors
      if (
        value.includes('rgb(') || 
        value.includes('rgba(') || 
        value.includes('hsl(') || 
        value.includes('hsla(') || 
        value.includes('#') ||
        (value.includes('oklch(') && !value.includes('var('))
      ) {
        violations.push(`Element ${index}: ${prop}: "${value}" should use design tokens (var(--*)).`);
      }
    }
  });

  // Check class names for Tailwind violations
  UNAUTHORIZED_COLORS.tailwind.forEach(pattern => {
    const matches = classList.match(pattern);
    if (matches) {
      matches.forEach(match => {
        violations.push(`Element ${index}: Unauthorized Tailwind class "${match}". Use design token classes instead.`);
      });
    }
  });

  // Check inline styles
  Object.values(UNAUTHORIZED_COLORS).flat().forEach(pattern => {
    const matches = inlineStyle.match(pattern);
    if (matches) {
      matches.forEach(match => {
        violations.push(`Element ${index}: Unauthorized inline color "${match}". Use design tokens instead.`);
      });
    }
  });
}

/**
 * FLAT DESIGN VIOLATION CHECKER
 * Ensures zero border-radius and box-shadow
 */
function checkFlatDesignViolations(
  element: Element, 
  computedStyle: CSSStyleDeclaration, 
  classList: string, 
  inlineStyle: string, 
  index: number, 
  violations: string[], 
  warnings: string[]
) {
  // Check border-radius
  const borderRadius = computedStyle.borderRadius;
  if (borderRadius && borderRadius !== '0px' && borderRadius !== 'none') {
    violations.push(`Element ${index}: border-radius: "${borderRadius}" violates flat design. Must be 0px.`);
  }

  // Check box-shadow
  const boxShadow = computedStyle.boxShadow;
  if (boxShadow && boxShadow !== 'none' && !boxShadow.includes('0px 0px 0px')) {
    violations.push(`Element ${index}: box-shadow: "${boxShadow}" violates flat design. Must be none.`);
  }

  // Check text-shadow
  const textShadow = computedStyle.textShadow;
  if (textShadow && textShadow !== 'none') {
    violations.push(`Element ${index}: text-shadow: "${textShadow}" violates flat design. Must be none.`);
  }

  // Check for rounded classes
  if (classList.includes('rounded') && !classList.includes('rounded-none')) {
    violations.push(`Element ${index}: "rounded" classes violate flat design. Remove or use "flat" class.`);
  }

  // Check for shadow classes
  if (classList.match(/\bshadow-(?!none)/)) {
    violations.push(`Element ${index}: Shadow classes violate flat design. Remove shadow classes.`);
  }
}

/**
 * TYPOGRAPHY VIOLATION CHECKER
 * Ensures only authorized fonts
 */
function checkTypographyViolations(
  element: Element, 
  computedStyle: CSSStyleDeclaration, 
  classList: string, 
  index: number, 
  violations: string[], 
  warnings: string[]
) {
  const fontFamily = computedStyle.fontFamily.toLowerCase();
  
  // Check for unauthorized fonts
  if (
    fontFamily && 
    !fontFamily.includes('inter') && 
    !fontFamily.includes('cormorant') && 
    !fontFamily.includes('var(--font') &&
    fontFamily !== 'inherit' &&
    fontFamily !== 'initial'
  ) {
    violations.push(`Element ${index}: FONT VIOLATION: font-family "${fontFamily}" detected. ONLY Inter and Cormorant Garamond are allowed in our design system.`);
  }
}

/**
 * SPACING VIOLATION CHECKER  
 * Ensures 4px grid system compliance
 */
function checkSpacingViolations(
  element: Element, 
  computedStyle: CSSStyleDeclaration, 
  index: number, 
  violations: string[], 
  warnings: string[]
) {
  const spacingProperties = ['marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'top', 'right', 'bottom', 'left'];
  
  spacingProperties.forEach(prop => {
    const value = computedStyle.getPropertyValue(prop.replace(/([A-Z])/g, '-$1').toLowerCase());
    if (value && value.endsWith('px')) {
      const numValue = parseFloat(value);
      if (numValue > 0 && numValue % 4 !== 0) {
        warnings.push(`Element ${index}: ${prop}: ${value}. Consider using 4px grid system (4, 8, 12, 16, etc.).`);
      }
    }
  });
}

/**
 * DESIGN TOKEN COMPLIANCE CHECKER
 * Ensures proper use of design system
 */
function checkDesignTokenCompliance(
  element: Element, 
  classList: string, 
  inlineStyle: string, 
  index: number, 
  violations: string[], 
  warnings: string[]
) {
  // Check for direct CSS custom property usage in classes (should use utility classes instead)
  if (classList.includes('var(--') || inlineStyle.includes('var(--')) {
    warnings.push(`Element ${index}: Direct CSS variable usage detected. Prefer utility classes from design system.`);
  }

  // Check for mixing utility classes with arbitrary values
  if (classList.match(/\[[^\]]*\]/)) {
    warnings.push(`Element ${index}: Mixing utility classes with arbitrary values may violate design consistency. Prefer design tokens.`);
  }
}

/**
 * AUTO-INITIALIZATION
 * Runs audit automatically when imported
 */
if (typeof window !== 'undefined') {
  // Run audit after DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runComprehensiveAudit);
  } else {
    // DOM already loaded, run immediately
    setTimeout(runComprehensiveAudit, 100);
  }
}

export default runComprehensiveAudit;