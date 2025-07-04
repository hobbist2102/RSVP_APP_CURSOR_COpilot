/**
 * DEVELOPMENT AUDIT RUNNER
 * Auto-runs comprehensive UI audit and displays results
 */

import React, { useEffect, useState } from 'react';
import designSystem from '@/design-system';

export function AuditRunner() {
  const [auditResult, setAuditResult] = useState<any>(null);

  useEffect(() => {
    // Run audit after component mount and DOM is ready
    const timer = setTimeout(() => {
      
      const result = designSystem.auditDesignCompliance();
      setAuditResult(result);
      
      // Log summary to console
      console.log('🎯 UI AUDIT COMPLETE');
      console.log('Total Elements:', result.summary.total);
      console.log('Violations:', result.summary.violations);
      console.log('Warnings:', result.summary.warnings);
      
      if (result.violations.length > 0) {
        console.error('Design Violations:', result.violations);
      }
      if (result.warnings.length > 0) {
        console.warn('Design Warnings:', result.warnings);
      }
      
      // Store in window for debugging
      (window as any).auditResult = result;
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-card border border-border p-2 text-xs shadow-lg">
      {auditResult ? (
        <div>
          <div className="font-semibold text-foreground">UI Audit</div>
          <div className="text-destructive">Errors: {auditResult.summary.violations}</div>
          <div className="text-muted-foreground">Warnings: {auditResult.summary.warnings}</div>
          <div className="text-xs text-muted-foreground">Total: {auditResult.summary.total}</div>
        </div>
      ) : (
        <div className="text-muted-foreground">Running audit...</div>
      )}
    </div>
  );
}