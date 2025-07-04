/**
 * COMPREHENSIVE UI AUDIT TOOL
 * 5-Pass Critical Analysis and Violation Detection
 * Catches EVERY amateur UI element and design violation
 */

export interface AuditResult {
  criticalViolations: string[];
  designViolations: string[];
  amateurElements: string[];
  textOverflows: string[];
  colorViolations: string[];
  stepIndicatorIssues: string[];
  gradientViolations: string[];
  spacingIssues: string[];
}

export function conductComprehensiveAudit(): AuditResult {
  const result: AuditResult = {
    criticalViolations: [],
    designViolations: [],
    amateurElements: [],
    textOverflows: [],
    colorViolations: [],
    stepIndicatorIssues: [],
    gradientViolations: [],
    spacingIssues: []
  };

  console.log('🔍 CONDUCTING 5-PASS COMPREHENSIVE UI AUDIT');

  // PASS 1: TEXT OVERFLOW DETECTION
  const allElements = document.querySelectorAll('*');
  allElements.forEach((element, index) => {
    const el = element as HTMLElement;
    if (el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight) {
      result.textOverflows.push(`Element ${index}: Text overflow detected in ${el.tagName.toLowerCase()}${el.className ? '.' + el.className.split(' ')[0] : ''}`);
    }
  });

  // PASS 2: UNAUTHORIZED COLOR DETECTION
  allElements.forEach((element, index) => {
    const el = element as HTMLElement;
    const computedStyle = window.getComputedStyle(el);
    
    // Check for unauthorized colors
    const unauthorizedColors = [
      'rgb(34, 197, 94)', // green
      'rgb(59, 130, 246)', // blue
      'rgb(16, 185, 129)', // emerald
      'rgb(6, 182, 212)', // cyan
      'rgb(245, 158, 11)', // amber (not our gold)
      'rgb(239, 68, 68)', // red variants
      'rgb(168, 85, 247)', // purple variants not in our system
    ];
    
    const bgColor = computedStyle.backgroundColor;
    const textColor = computedStyle.color;
    const borderColor = computedStyle.borderColor;
    
    unauthorizedColors.forEach(color => {
      if (bgColor.includes(color) || textColor.includes(color) || borderColor.includes(color)) {
        result.colorViolations.push(`Element ${index}: Unauthorized color ${color} detected`);
      }
    });

    // Check for gradients (should be none in flat design)
    if (bgColor.includes('gradient') || bgColor.includes('linear-gradient') || bgColor.includes('radial-gradient')) {
      result.gradientViolations.push(`Element ${index}: Unauthorized gradient detected`);
    }
  });

  // PASS 3: STEP INDICATOR CONSISTENCY CHECK
  const stepElements = document.querySelectorAll('[class*="step"], [class*="Step"], .wizard-step, .step-item');
  const stepIndicators: string[] = [];
  stepElements.forEach((element) => {
    const text = element.textContent?.trim() || '';
    const hasNumber = /\d+/.test(text);
    const hasCheckmark = text.includes('✓') || text.includes('✔') || element.querySelector('[class*="check"]');
    stepIndicators.push(`${hasNumber ? 'NUMBER' : ''}${hasCheckmark ? 'CHECK' : ''}${!hasNumber && !hasCheckmark ? 'NONE' : ''}`);
  });
  
  const uniqueIndicators = [...new Set(stepIndicators)];
  if (uniqueIndicators.length > 1) {
    result.stepIndicatorIssues.push(`Inconsistent step indicators: ${uniqueIndicators.join(', ')}`);
  }

  // PASS 4: AMATEUR ELEMENT DETECTION
  allElements.forEach((element, index) => {
    const el = element as HTMLElement;
    const computedStyle = window.getComputedStyle(el);
    
    // Check for amateur spacing
    const padding = computedStyle.padding;
    const margin = computedStyle.margin;
    
    // Non-4px grid spacing is amateur
    if (padding.includes('1px') || padding.includes('3px') || padding.includes('5px') || padding.includes('7px')) {
      result.spacingIssues.push(`Element ${index}: Non-4px grid padding detected`);
    }
    
    // Check for amateur shadows (should be none)
    const boxShadow = computedStyle.boxShadow;
    if (boxShadow && boxShadow !== 'none' && !boxShadow.includes('0px 0px 0px')) {
      result.amateurElements.push(`Element ${index}: Amateur shadow detected: ${boxShadow}`);
    }
    
    // Check for amateur border radius (should be 0px)
    const borderRadius = computedStyle.borderRadius;
    if (borderRadius && borderRadius !== '0px' && borderRadius !== 'none') {
      result.amateurElements.push(`Element ${index}: Amateur border radius detected: ${borderRadius}`);
    }
  });

  // PASS 5: CRITICAL DESIGN SYSTEM VIOLATIONS
  const criticalSelectors = [
    '.event-selector', 
    '[class*="event-select"]',
    '.header-event',
    '.step-indicator',
    '.wizard-steps',
    '.communication-section',
    '.template-card'
  ];

  criticalSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element, index) => {
      const el = element as HTMLElement;
      const computedStyle = window.getComputedStyle(el);
      
      // Check for overflow
      if (el.scrollWidth > el.clientWidth) {
        result.criticalViolations.push(`${selector}[${index}]: CRITICAL - Text overflow detected`);
      }
      
      // Check for non-design-system colors
      const bgColor = computedStyle.backgroundColor;
      if (!bgColor.includes('var(--') && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
        result.criticalViolations.push(`${selector}[${index}]: CRITICAL - Hardcoded background color`);
      }
    });
  });

  // Log comprehensive results
  console.log('🚨 CRITICAL VIOLATIONS:', result.criticalViolations.length);
  console.log('🎨 DESIGN VIOLATIONS:', result.designViolations.length);
  console.log('🤢 AMATEUR ELEMENTS:', result.amateurElements.length);
  console.log('📏 TEXT OVERFLOWS:', result.textOverflows.length);
  console.log('🌈 COLOR VIOLATIONS:', result.colorViolations.length);
  console.log('📊 STEP INDICATOR ISSUES:', result.stepIndicatorIssues.length);
  console.log('🎯 GRADIENT VIOLATIONS:', result.gradientViolations.length);
  console.log('📐 SPACING ISSUES:', result.spacingIssues.length);

  return result;
}

// Auto-run audit on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const audit = conductComprehensiveAudit();
      (window as any).lastAuditResult = audit;
    }, 2000);
  });
}