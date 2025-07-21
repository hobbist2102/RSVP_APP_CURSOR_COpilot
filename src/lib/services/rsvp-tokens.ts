import { randomBytes } from 'crypto'
import { db } from '@/lib/db'
import { guests, rsvpTokens } from '@/lib/db/schema'
import { eq, and, lt } from 'drizzle-orm'

export interface RSVPToken {
  id: string
  guestId: string
  token: string
  expiresAt: Date
  usedAt?: Date
  isActive: boolean
  createdAt: Date
}

export interface TokenValidationResult {
  isValid: boolean
  guest?: {
    id: string
    firstName: string
    lastName: string
    email: string
    eventId: string
    side: string
    relationship: string
    plusOnesAllowed: number
  }
  error?: string
}

export class RSVPTokenService {
  /**
   * Generate a secure RSVP token for a guest
   */
  static async generateToken(guestId: string, expirationDays: number = 30): Promise<string> {
    try {
      // Generate a cryptographically secure random token
      const tokenBytes = randomBytes(32)
      const token = tokenBytes.toString('base64url')

      // Calculate expiration date
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expirationDays)

      // Check if guest exists
      const guest = await db.select().from(guests).where(eq(guests.id, guestId)).limit(1)
      if (guest.length === 0) {
        throw new Error('Guest not found')
      }

      // Deactivate any existing tokens for this guest
      await db.update(rsvpTokens)
        .set({ is_active: false })
        .where(eq(rsvpTokens.guest_id, guestId))

      // Create new token record
      await db.insert(rsvpTokens).values({
        guest_id: guestId,
        token,
        expires_at: expiresAt,
        is_active: true,
        created_at: new Date()
      })

      return token
    } catch (error) {
      console.error('Error generating RSVP token:', error)
      throw new Error('Failed to generate RSVP token')
    }
  }

  /**
   * Validate and retrieve guest information by token
   */
  static async validateToken(token: string): Promise<TokenValidationResult> {
    try {
      // Find the token record with guest information
      const result = await db
        .select({
          tokenId: rsvpTokens.id,
          guestId: rsvpTokens.guestId,
          token: rsvpTokens.token,
          expiresAt: rsvpTokens.expiresAt,
          usedAt: rsvpTokens.usedAt,
          isActive: rsvpTokens.isActive,
          guest: {
            id: guests.id,
            firstName: guests.firstName,
            lastName: guests.lastName,
            email: guests.email,
            eventId: guests.eventId,
            side: guests.side,
            relationship: guests.relationship,
            plusOnesAllowed: guests.plusOnesAllowed
          }
        })
        .from(rsvpTokens)
        .innerJoin(guests, eq(rsvpTokens.guestId, guests.id))
        .where(eq(rsvpTokens.token, token))
        .limit(1)

      if (result.length === 0) {
        return {
          isValid: false,
          error: 'Invalid token'
        }
      }

      const tokenRecord = result[0]

      // Check if token is active
      if (!tokenRecord.isActive) {
        return {
          isValid: false,
          error: 'Token has been deactivated'
        }
      }

      // Check if token has expired
      if (new Date() > tokenRecord.expiresAt) {
        // Automatically deactivate expired token
        await db.update(rsvpTokens)
          .set({ isActive: false })
          .where(eq(rsvpTokens.token, token))

        return {
          isValid: false,
          error: 'Token has expired'
        }
      }

      return {
        isValid: true,
        guest: tokenRecord.guest
      }
    } catch (error) {
      console.error('Error validating RSVP token:', error)
      return {
        isValid: false,
        error: 'Failed to validate token'
      }
    }
  }

  /**
   * Mark token as used after successful RSVP submission
   */
  static async markTokenAsUsed(token: string): Promise<boolean> {
    try {
      const result = await db.update(rsvpTokens)
        .set({ usedAt: new Date() })
        .where(and(
          eq(rsvpTokens.token, token),
          eq(rsvpTokens.isActive, true)
        ))

      return true
    } catch (error) {
      console.error('Error marking token as used:', error)
      return false
    }
  }

  /**
   * Generate RSVP URL for a guest
   */
  static generateRSVPUrl(token: string, baseUrl?: string): string {
    const domain = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return `${domain}/rsvp/${token}`
  }

  /**
   * Generate tokens for multiple guests in batch
   */
  static async generateBatchTokens(
    guestIds: string[], 
    expirationDays: number = 30
  ): Promise<{ guestId: string; token: string; rsvpUrl: string }[]> {
    const results = []

    for (const guestId of guestIds) {
      try {
        const token = await this.generateToken(guestId, expirationDays)
        const rsvpUrl = this.generateRSVPUrl(token)
        
        results.push({
          guestId,
          token,
          rsvpUrl
        })
      } catch (error) {
        console.error(`Failed to generate token for guest ${guestId}:`, error)
      }
    }

    return results
  }

  /**
   * Regenerate token for a guest (useful for resending invitations)
   */
  static async regenerateToken(guestId: string, expirationDays: number = 30): Promise<string> {
    // This will automatically deactivate old tokens and create a new one
    return this.generateToken(guestId, expirationDays)
  }

  /**
   * Get token statistics for analytics
   */
  static async getTokenStats(eventId?: string) {
    try {
      // Base query for token statistics
      let query = db
        .select({
          total: rsvpTokens.id,
          isActive: rsvpTokens.isActive,
          usedAt: rsvpTokens.usedAt,
          expiresAt: rsvpTokens.expiresAt
        })
        .from(rsvpTokens)

      // If eventId is provided, join with guests to filter by event
      if (eventId) {
        query = query.innerJoin(guests, 
          and(
            eq(rsvpTokens.guestId, guests.id),
            eq(guests.eventId, eventId)
          )
        ) as any
      }

      const tokens = await query

      const stats = {
        total: tokens.length,
        active: tokens.filter(t => t.isActive).length,
        used: tokens.filter(t => t.usedAt !== null).length,
        expired: tokens.filter(t => new Date() > t.expiresAt && t.isActive).length,
        unused: tokens.filter(t => t.usedAt === null && t.isActive && new Date() <= t.expiresAt).length
      }

      return {
        ...stats,
        usageRate: stats.total > 0 ? (stats.used / stats.total) * 100 : 0
      }
    } catch (error) {
      console.error('Error getting token statistics:', error)
      throw new Error('Failed to retrieve token statistics')
    }
  }

  /**
   * Clean up expired tokens (deactivate them)
   */
  static async cleanupExpiredTokens(): Promise<number> {
    try {
      const result = await db.update(rsvpTokens)
        .set({ isActive: false })
        .where(and(
          eq(rsvpTokens.isActive, true),
          gt(new Date(), rsvpTokens.expiresAt)
        ))

      return result.rowCount || 0
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error)
      return 0
    }
  }

  /**
   * Revoke a specific token
   */
  static async revokeToken(token: string): Promise<boolean> {
    try {
      await db.update(rsvpTokens)
        .set({ isActive: false })
        .where(eq(rsvpTokens.token, token))

      return true
    } catch (error) {
      console.error('Error revoking token:', error)
      return false
    }
  }

  /**
   * Get all active tokens for an event
   */
  static async getEventTokens(eventId: string) {
    try {
      const result = await db
        .select({
          token: rsvpTokens.token,
          guestId: rsvpTokens.guestId,
          expiresAt: rsvpTokens.expiresAt,
          usedAt: rsvpTokens.usedAt,
          createdAt: rsvpTokens.createdAt,
          guest: {
            firstName: guests.firstName,
            lastName: guests.lastName,
            email: guests.email,
            side: guests.side
          }
        })
        .from(rsvpTokens)
        .innerJoin(guests, eq(rsvpTokens.guestId, guests.id))
        .where(and(
          eq(guests.eventId, eventId),
          eq(rsvpTokens.isActive, true)
        ))

      return result.map(r => ({
        ...r,
        rsvpUrl: this.generateRSVPUrl(r.token),
        isExpired: new Date() > r.expiresAt,
        isUsed: r.usedAt !== null
      }))
    } catch (error) {
      console.error('Error getting event tokens:', error)
      throw new Error('Failed to retrieve event tokens')
    }
  }
}

export default RSVPTokenService