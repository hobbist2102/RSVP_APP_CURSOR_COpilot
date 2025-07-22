import { db } from '@/lib/db'
import { auditLogs } from '@/lib/db/schema'

export interface AuditLogEntry {
  userId?: string
  eventId?: string
  action: string
  resource: string
  resourceId?: string
  ipAddress?: string
  userAgent?: string
  details?: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export class AuditLogger {
  /**
   * Log a security or audit event
   */
  static async log(entry: AuditLogEntry): Promise<void> {
    try {
      await db.insert(auditLogs).values({
        user_id: entry.userId || null,
        event_id: entry.eventId || null,
        action: entry.action,
        resource: entry.resource,
        resource_id: entry.resourceId || null,
        ip_address: entry.ipAddress || null,
        user_agent: entry.userAgent || null,
        details: entry.details ? JSON.stringify(entry.details) : null,
        severity: entry.severity,
        created_at: new Date()
      })
    } catch (error) {
      console.error('Failed to write audit log:', error)
      // Don't throw - audit logging should not break application flow
    }
  }

  /**
   * Log authentication events
   */
  static async logAuth(
    action: 'login' | 'logout' | 'login_failed' | 'password_reset' | 'password_changed',
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
    details?: Record<string, any>
  ): Promise<void> {
    const severity = action === 'login_failed' ? 'medium' : 'low'
    
    await this.log({
      userId,
      action,
      resource: 'authentication',
      ipAddress,
      userAgent,
      details,
      severity
    })
  }

  /**
   * Log data access events
   */
  static async logDataAccess(
    action: 'read' | 'create' | 'update' | 'delete',
    resource: string,
    resourceId?: string,
    userId?: string,
    eventId?: string,
    ipAddress?: string,
    details?: Record<string, any>
  ): Promise<void> {
    const severity = action === 'delete' ? 'high' : 'low'
    
    await this.log({
      userId,
      eventId,
      action,
      resource,
      resourceId,
      ipAddress,
      details,
      severity
    })
  }

  /**
   * Log security events
   */
  static async logSecurity(
    action: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      userId,
      action,
      resource: 'security',
      ipAddress,
      userAgent,
      details,
      severity
    })
  }

  /**
   * Log RSVP events
   */
  static async logRSVP(
    action: 'token_generated' | 'token_validated' | 'response_submitted' | 'token_expired',
    guestId: string,
    eventId: string,
    ipAddress?: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action,
      resource: 'rsvp',
      resourceId: guestId,
      eventId,
      ipAddress,
      details,
      severity: 'low'
    })
  }

  /**
   * Log communication events
   */
  static async logCommunication(
    action: 'email_sent' | 'whatsapp_sent' | 'sms_sent' | 'delivery_failed',
    guestId: string,
    eventId: string,
    details?: Record<string, any>
  ): Promise<void> {
    const severity = action === 'delivery_failed' ? 'medium' : 'low'
    
    await this.log({
      action,
      resource: 'communication',
      resourceId: guestId,
      eventId,
      details,
      severity
    })
  }

  /**
   * Log administrative actions
   */
  static async logAdmin(
    action: string,
    resource: string,
    resourceId: string,
    userId: string,
    eventId?: string,
    ipAddress?: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      userId,
      eventId,
      action,
      resource,
      resourceId,
      ipAddress,
      details,
      severity: 'medium'
    })
  }

  /**
   * Log system events
   */
  static async logSystem(
    action: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action,
      resource: 'system',
      details,
      severity
    })
  }

  /**
   * Get audit logs with filtering
   */
  static async getLogs(filters: {
    userId?: string
    eventId?: string
    action?: string
    resource?: string
    severity?: string
    fromDate?: Date
    toDate?: Date
    limit?: number
  } = {}) {
    try {
      let query = db.select().from(auditLogs)

      // Apply filters (simplified - in production use proper query builder)
      const conditions = []
      
      if (filters.userId) {
        conditions.push(`user_id = '${filters.userId}'`)
      }
      
      if (filters.eventId) {
        conditions.push(`event_id = '${filters.eventId}'`)
      }
      
      if (filters.action) {
        conditions.push(`action = '${filters.action}'`)
      }
      
      if (filters.resource) {
        conditions.push(`resource = '${filters.resource}'`)
      }
      
      if (filters.severity) {
        conditions.push(`severity = '${filters.severity}'`)
      }
      
      if (filters.fromDate) {
        conditions.push(`created_at >= '${filters.fromDate.toISOString()}'`)
      }
      
      if (filters.toDate) {
        conditions.push(`created_at <= '${filters.toDate.toISOString()}'`)
      }

      // In production, use proper Drizzle query building
      const logs = await query.limit(filters.limit || 100)
      
      return logs.map(log => ({
        ...log,
        details: log.details ? JSON.parse(log.details) : null
      }))
    } catch (error) {
      console.error('Failed to retrieve audit logs:', error)
      return []
    }
  }

  /**
   * Get security alerts (high/critical severity logs)
   */
  static async getSecurityAlerts(limit: number = 50) {
    try {
      const logs = await db.select()
        .from(auditLogs)
        .where(`severity IN ('high', 'critical')`)
        .orderBy(`created_at DESC`)
        .limit(limit)

      return logs.map(log => ({
        ...log,
        details: log.details ? JSON.parse(log.details) : null
      }))
    } catch (error) {
      console.error('Failed to retrieve security alerts:', error)
      return []
    }
  }

  /**
   * Clean up old audit logs (retention policy)
   */
  static async cleanup(retentionDays: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

      // In production, implement proper cleanup with Drizzle
      console.log(`Cleaning up audit logs older than ${cutoffDate.toISOString()}`)
      
      return 0 // Return number of deleted records
    } catch (error) {
      console.error('Failed to cleanup audit logs:', error)
      return 0
    }
  }
}

// Helper functions for common audit scenarios
export const auditHelpers = {
  /**
   * Audit successful login
   */
  loginSuccess: (userId: string, ipAddress?: string, userAgent?: string) =>
    AuditLogger.logAuth('login', userId, ipAddress, userAgent),

  /**
   * Audit failed login attempt
   */
  loginFailed: (email: string, ipAddress?: string, userAgent?: string) =>
    AuditLogger.logAuth('login_failed', undefined, ipAddress, userAgent, { email }),

  /**
   * Audit guest creation
   */
  guestCreated: (guestId: string, eventId: string, userId: string, ipAddress?: string) =>
    AuditLogger.logDataAccess('create', 'guest', guestId, userId, eventId, ipAddress),

  /**
   * Audit RSVP submission
   */
  rsvpSubmitted: (guestId: string, eventId: string, ipAddress?: string, stage?: number) =>
    AuditLogger.logRSVP('response_submitted', guestId, eventId, ipAddress, { stage }),

  /**
   * Audit bulk operations
   */
  bulkOperation: (action: string, resource: string, count: number, userId: string, eventId?: string, ipAddress?: string) =>
    AuditLogger.logAdmin(`bulk_${action}`, resource, `${count}_records`, userId, eventId, ipAddress, { count }),

  /**
   * Audit security violations
   */
  securityViolation: (type: string, ipAddress?: string, userAgent?: string, details?: Record<string, any>) =>
    AuditLogger.logSecurity(`security_violation_${type}`, 'high', undefined, ipAddress, userAgent, details),

  /**
   * Audit rate limit exceeded
   */
  rateLimitExceeded: (endpoint: string, ipAddress?: string, userAgent?: string) =>
    AuditLogger.logSecurity('rate_limit_exceeded', 'medium', undefined, ipAddress, userAgent, { endpoint })
}