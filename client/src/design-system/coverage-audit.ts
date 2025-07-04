/**
 * COMPREHENSIVE DESIGN SYSTEM COVERAGE AUDIT
 * Validates that the hybrid design system covers ALL UI elements
 * Ensures NO fallbacks to browser defaults anywhere in the application
 */

export interface CoverageResult {
  category: string;
  covered: boolean;
  gaps: string[];
  fallbackRisk: 'none' | 'low' | 'medium' | 'high';
  recommendations: string[];
}

export interface DesignSystemCoverage {
  overallCoverage: number;
  categories: CoverageResult[];
  criticalGaps: string[];
  browserFallbacks: string[];
  recommendations: string[];
}

/**
 * COMPREHENSIVE UI ELEMENT CATEGORIES
 * Every possible UI element that needs design system coverage
 */
const UI_ELEMENT_CATEGORIES = {
  // 1. LAYOUT & STRUCTURE
  LAYOUT: {
    elements: ['html', 'body', 'main', 'section', 'article', 'aside', 'header', 'footer', 'nav'],
    properties: ['margin', 'padding', 'background-color', 'color', 'font-family', 'line-height'],
    designTokens: ['--background', '--foreground', '--font-sans', '--spacing'],
    fallbackRisk: 'high'
  },

  // 2. TYPOGRAPHY
  TYPOGRAPHY: {
    elements: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'strong', 'em', 'small', 'code', 'pre'],
    properties: ['font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'color'],
    designTokens: ['--font-sans', '--font-serif', '--font-mono', '--foreground', '--tracking-normal'],
    fallbackRisk: 'high'
  },

  // 3. FORM ELEMENTS
  FORMS: {
    elements: ['input', 'textarea', 'select', 'option', 'button', 'fieldset', 'legend', 'label'],
    properties: ['background-color', 'border', 'border-radius', 'color', 'padding', 'font-family', 'font-size'],
    designTokens: ['--input', '--border', '--foreground', '--primary', '--radius'],
    fallbackRisk: 'high'
  },

  // 4. INTERACTIVE ELEMENTS
  INTERACTIVE: {
    elements: ['a', 'button', '[role="button"]', '[tabindex]', '[onclick]'],
    properties: ['color', 'text-decoration', 'cursor', 'outline', 'transition'],
    designTokens: ['--primary', '--accent', '--ring'],
    fallbackRisk: 'medium'
  },

  // 5. CONTAINERS & CARDS
  CONTAINERS: {
    elements: ['.card', '.panel', '.container', '.wrapper', 'div[class*="card"]', 'div[class*="panel"]'],
    properties: ['background-color', 'border', 'border-radius', 'padding', 'margin', 'box-shadow'],
    designTokens: ['--card', '--card-foreground', '--border', '--radius', '--shadow'],
    fallbackRisk: 'medium'
  },

  // 6. NAVIGATION
  NAVIGATION: {
    elements: ['nav', '.nav', '.navbar', '.sidebar', '.menu', '[role="navigation"]'],
    properties: ['background-color', 'border', 'color', 'padding'],
    designTokens: ['--sidebar', '--sidebar-foreground', '--sidebar-border'],
    fallbackRisk: 'medium'
  },

  // 7. DATA DISPLAY
  DATA_DISPLAY: {
    elements: ['table', 'thead', 'tbody', 'tr', 'td', 'th', 'dl', 'dt', 'dd', 'ul', 'ol', 'li'],
    properties: ['border', 'background-color', 'padding', 'color'],
    designTokens: ['--border', '--background', '--foreground', '--muted'],
    fallbackRisk: 'low'
  },

  // 8. STATUS & FEEDBACK
  STATUS: {
    elements: ['.badge', '.chip', '.tag', '.status', '.alert', '.toast', '.notification'],
    properties: ['background-color', 'color', 'border', 'border-radius'],
    designTokens: ['--destructive', '--accent', '--muted', '--border'],
    fallbackRisk: 'medium'
  },

  // 9. MODALS & OVERLAYS
  MODALS: {
    elements: ['.modal', '.dialog', '.overlay', '.backdrop', '[role="dialog"]', '[role="alertdialog"]'],
    properties: ['background-color', 'border', 'border-radius', 'box-shadow'],
    designTokens: ['--card', '--border', '--radius', '--shadow'],
    fallbackRisk: 'high'
  },

  // 10. MEDIA ELEMENTS
  MEDIA: {
    elements: ['img', 'video', 'audio', 'iframe', 'canvas', 'svg'],
    properties: ['border', 'border-radius', 'background-color'],
    designTokens: ['--border', '--radius', '--background'],
    fallbackRisk: 'low'
  },

  // 11. PSEUDO-ELEMENTS & STATES
  PSEUDO_ELEMENTS: {
    elements: ['::before', '::after', '::placeholder', ':hover', ':focus', ':active', ':disabled'],
    properties: ['color', 'background-color', 'border-color', 'outline'],
    designTokens: ['--primary', '--muted-foreground', '--destructive', '--ring'],
    fallbackRisk: 'high'
  },

  // 12. CHART & VISUALIZATION
  CHARTS: {
    elements: ['.recharts-*', '.chart-*', '.graph-*', 'svg path', 'svg rect', 'svg circle'],
    properties: ['fill', 'stroke', 'color'],
    designTokens: ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5'],
    fallbackRisk: 'medium'
  }
};

/**
 * DESIGN SYSTEM TOKEN COVERAGE VALIDATION
 * Checks if design system tokens cover all necessary UI properties
 */
export function validateTokenCoverage(): CoverageResult[] {
  const results: CoverageResult[] = [];

  Object.entries(UI_ELEMENT_CATEGORIES).forEach(([category, config]) => {
    const gaps: string[] = [];
    const recommendations: string[] = [];
    
    // Check if design tokens exist for this category
    config.designTokens.forEach(token => {
      const cssVar = getComputedStyle(document.documentElement).getPropertyValue(token);
      if (!cssVar || cssVar.trim() === '') {
        gaps.push(`Missing design token: ${token}`);
      }
    });

    // Check if CSS rules exist for elements
    config.elements.forEach(element => {
      const testElement = document.querySelector(element);
      if (testElement) {
        const computedStyle = window.getComputedStyle(testElement);
        
        config.properties.forEach(property => {
          const value = computedStyle.getPropertyValue(property);
          
          // Check for browser defaults that indicate missing design system coverage
          if (isBrowserDefault(property, value)) {
            gaps.push(`Element ${element} using browser default for ${property}: ${value}`);
            recommendations.push(`Add design system rule for ${element} ${property}`);
          }
        });
      }
    });

    results.push({
      category,
      covered: gaps.length === 0,
      gaps,
      fallbackRisk: config.fallbackRisk,
      recommendations
    });
  });

  return results;
}

/**
 * BROWSER DEFAULT DETECTION
 * Identifies values that are likely browser defaults rather than design system values
 */
function isBrowserDefault(property: string, value: string): boolean {
  const browserDefaults = {
    'font-family': ['serif', 'Times', 'Times New Roman', 'Georgia'],
    'color': ['rgb(0, 0, 0)', '#000000', '#000', 'black'],
    'background-color': ['rgba(0, 0, 0, 0)', 'transparent', 'initial'],
    'border': ['none', '0px', 'initial'],
    'border-radius': ['0px'],
    'padding': ['0px'],
    'margin': ['0px', '16px', '8px'], // Common browser defaults
    'font-size': ['16px', '14px', '12px'], // Without design system scaling
    'line-height': ['normal', '1.2', '1.15'], // Browser defaults
    'letter-spacing': ['normal', '0px'],
    'outline': ['none', 'initial'],
    'box-shadow': ['none', 'initial'],
    'cursor': ['auto', 'default']
  };

  const defaults = browserDefaults[property as keyof typeof browserDefaults];
  if (!defaults) return false;

  return defaults.some(defaultValue => value.includes(defaultValue));
}

/**
 * CSS CUSTOM PROPERTY VALIDATION
 * Ensures all CSS custom properties are properly defined
 */
export function validateCSSCustomProperties(): CoverageResult {
  const gaps: string[] = [];
  const recommendations: string[] = [];
  
  const requiredTokens = [
    '--background', '--foreground', '--card', '--card-foreground',
    '--primary', '--primary-foreground', '--secondary', '--secondary-foreground',
    '--muted', '--muted-foreground', '--accent', '--accent-foreground',
    '--destructive', '--destructive-foreground', '--border', '--input', '--ring',
    '--sidebar', '--sidebar-foreground', '--sidebar-border',
    '--font-sans', '--font-serif', '--font-mono',
    '--radius', '--shadow', '--tracking-normal', '--spacing'
  ];

  const rootStyle = getComputedStyle(document.documentElement);
  
  requiredTokens.forEach(token => {
    const value = rootStyle.getPropertyValue(token);
    if (!value || value.trim() === '') {
      gaps.push(`Missing CSS custom property: ${token}`);
      recommendations.push(`Define ${token} in :root and .dark selectors`);
    }
  });

  return {
    category: 'CSS_CUSTOM_PROPERTIES',
    covered: gaps.length === 0,
    gaps,
    fallbackRisk: gaps.length > 5 ? 'high' : gaps.length > 2 ? 'medium' : 'low',
    recommendations
  };
}

/**
 * COMPONENT-SPECIFIC COVERAGE VALIDATION
 * Checks coverage for specific component types
 */
export function validateComponentCoverage(): CoverageResult[] {
  const componentSelectors = [
    // Buttons
    'button', '.btn', '.btn-primary', '.btn-secondary', '.btn-ghost',
    // Cards
    '.card', '.card-glass', '.card-solid',
    // Navigation
    '.nav-item', '.nav-item-active', '.sidebar',
    // Forms
    '.form-input', 'input[type="text"]', 'input[type="email"]', 'select', 'textarea',
    // Status
    '.status-badge', '.status-confirmed', '.status-pending', '.status-declined',
    // Tables
    '.table-container', '.table-header', '.table-cell'
  ];

  const results: CoverageResult[] = [];
  
  componentSelectors.forEach(selector => {
    const gaps: string[] = [];
    const recommendations: string[] = [];
    
    try {
      const elements = document.querySelectorAll(selector);
      
      if (elements.length === 0) {
        // Component doesn't exist in DOM, check if CSS rule exists
        if (!hasCSSRule(selector)) {
          gaps.push(`No CSS rule found for component: ${selector}`);
          recommendations.push(`Add CSS rule for ${selector} component`);
        }
      } else {
        // Check each element for design system compliance
        elements.forEach((element, index) => {
          const computedStyle = window.getComputedStyle(element);
          
          // Check for browser defaults in critical properties
          const criticalProperties = ['color', 'background-color', 'font-family', 'border'];
          criticalProperties.forEach(property => {
            const value = computedStyle.getPropertyValue(property);
            if (isBrowserDefault(property, value)) {
              gaps.push(`${selector}[${index}] using browser default for ${property}`);
            }
          });
        });
      }
    } catch (error) {
      gaps.push(`Error checking selector ${selector}: ${error}`);
    }

    if (gaps.length > 0 || recommendations.length > 0) {
      results.push({
        category: `COMPONENT_${selector.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`,
        covered: gaps.length === 0,
        gaps,
        fallbackRisk: gaps.length > 3 ? 'high' : gaps.length > 1 ? 'medium' : 'low',
        recommendations
      });
    }
  });

  return results;
}

/**
 * CSS RULE EXISTENCE CHECK
 * Checks if a CSS rule exists for a given selector
 */
function hasCSSRule(selector: string): boolean {
  const sheets = Array.from(document.styleSheets);
  
  for (const sheet of sheets) {
    try {
      const rules = Array.from(sheet.cssRules || sheet.rules || []);
      const hasRule = rules.some(rule => {
        if (rule instanceof CSSStyleRule) {
          return rule.selectorText && rule.selectorText.includes(selector);
        }
        return false;
      });
      
      if (hasRule) return true;
    } catch (error) {
      // Skip sheets we can't access due to CORS
      continue;
    }
  }
  
  return false;
}

/**
 * COMPREHENSIVE DESIGN SYSTEM COVERAGE AUDIT
 * Main function that runs all coverage validations
 */
export function auditDesignSystemCoverage(): DesignSystemCoverage {
  console.group('🔍 DESIGN SYSTEM COVERAGE AUDIT');
  
  const tokenCoverage = validateTokenCoverage();
  const customPropertiesCoverage = validateCSSCustomProperties();
  const componentCoverage = validateComponentCoverage();
  
  const allCategories = [...tokenCoverage, customPropertiesCoverage, ...componentCoverage];
  
  const coveredCategories = allCategories.filter(cat => cat.covered).length;
  const overallCoverage = (coveredCategories / allCategories.length) * 100;
  
  const criticalGaps = allCategories
    .filter(cat => cat.fallbackRisk === 'high' && !cat.covered)
    .flatMap(cat => cat.gaps);
  
  const browserFallbacks = allCategories
    .flatMap(cat => cat.gaps)
    .filter(gap => gap.includes('browser default'));
  
  const recommendations = allCategories
    .flatMap(cat => cat.recommendations)
    .filter((rec, index, arr) => arr.indexOf(rec) === index); // Remove duplicates
  
  console.log(`📊 Overall Coverage: ${overallCoverage.toFixed(1)}%`);
  console.log(`⚠️ Critical Gaps: ${criticalGaps.length}`);
  console.log(`🔄 Browser Fallbacks: ${browserFallbacks.length}`);
  
  allCategories.forEach(category => {
    if (!category.covered) {
      console.group(`❌ ${category.category} (Risk: ${category.fallbackRisk})`);
      category.gaps.forEach(gap => console.warn(gap));
      console.groupEnd();
    } else {
      console.log(`✅ ${category.category}: Fully covered`);
    }
  });
  
  if (recommendations.length > 0) {
    console.group('💡 Recommendations');
    recommendations.forEach(rec => console.log(`• ${rec}`));
    console.groupEnd();
  }
  
  console.groupEnd();
  
  return {
    overallCoverage,
    categories: allCategories,
    criticalGaps,
    browserFallbacks,
    recommendations
  };
}

/**
 * AUTO-RUN COVERAGE AUDIT
 * Automatically runs coverage audit when DOM is ready
 */
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => auditDesignSystemCoverage(), 2000);
    });
  } else {
    setTimeout(() => auditDesignSystemCoverage(), 2000);
  }
}

export default {
  auditDesignSystemCoverage,
  validateTokenCoverage,
  validateCSSCustomProperties,
  validateComponentCoverage
};