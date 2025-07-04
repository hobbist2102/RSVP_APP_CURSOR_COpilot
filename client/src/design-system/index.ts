/**
 * ENTERPRISE-GRADE DESIGN SYSTEM - UNIFIED EXPORTS
 * 
 * Single source of truth for all design system functionality
 * Tailwind 4 compatible with hex-based color system
 * Implements luxury iOS 18 flat design with zero-tolerance compliance
 */

export { 
  // === CORE TOKENS ===
  colorTokens,
  hexColors,
  typography,
  spacing,
  flatDesign,
  animations,
  componentVariants,
  designSystem,
  
  // === TYPES ===
  type ColorToken,
  type HexColor,
  type Spacing,
  type FontSize,
  type FontWeight,
} from './tokens';

export { 
  // === COMPONENT UTILITIES ===
  getButtonClasses,
  getCardClasses,
  getNavItemClasses,
  getInputClasses,
  getTextClasses,
  getBadgeClasses,
  getContainerClasses,
  createComponentVariant,
  applyDesignTokens,
} from './components';

export { 
  // === AUDIT SYSTEM ===
  default as runComprehensiveAudit,
} from './comprehensive-audit-system';

/**
 * USAGE EXAMPLES:
 * 
 * // Import design tokens
 * import { colorTokens, hexColors, typography } from '@/design-system';
 * 
 * // Import component utilities  
 * import { getButtonClasses, getCardClasses } from '@/design-system';
 * 
 * // Use in components with enterprise-grade styling
 * <button className={getButtonClasses('primary', 'md')}>
 *   Enterprise Button
 * </button>
 * 
 * <div className={getCardClasses('elevated')}>
 *   Professional Card Content
 * </div>
 * 
 * // Access hex colors for Tailwind 4 compatibility
 * backgroundColor: hexColors.light.primary
 * 
 * // Use design tokens for CSS custom properties
 * color: colorTokens.accent
 */

// Default export for convenience - simplified to avoid circular issues
export { designSystem as default } from './tokens';