/**
 * DEVELOPMENT AUDIT RUNNER
 * Auto-runs comprehensive UI audit and displays results
 */

import React, { useEffect, useState } from 'react';
import { conductComprehensiveAudit, type AuditResult } from '@/design-system/comprehensive-audit';

export function AuditRunner() {
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  useEffect(() => {
    // Run audit after component mount and DOM is ready
    const timer = setTimeout(() => {
      
      const result = conductComprehensiveAudit();
      setAuditResult(result);
      
      // Log summary to console
      console.log('🎯 UI AUDIT COMPLETE');
      console.log('Critical Violations:', result.criticalViolations.length);
      console.log('Design Violations:', result.designViolations.length);
      console.log('Amateur Elements:', result.amateurElements.length);
      console.log('Text Overflows:', result.textOverflows.length);
      console.log('Color Violations:', result.colorViolations.length);
      
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
    <div className="fixed bottom-4 right-4 z-50 glass border border-border p-2 text-xs">
      {auditResult ? (
        <div>
          <div className="font-semibold text-foreground">UI Audit</div>
          <div className="text-destructive">Errors: {auditResult.criticalViolations.length + auditResult.designViolations.length}</div>
          <div className="text-muted-foreground">Warnings: {auditResult.amateurElements.length + auditResult.textOverflows.length}</div>
        </div>
      ) : (
        <div className="text-muted-foreground">Running audit...</div>
      )}
    </div>
  );
}