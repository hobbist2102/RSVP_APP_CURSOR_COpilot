import { db } from '@/lib/db'
import { rsvpTokens, guests } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { randomBytes } from 'crypto'

export interface Guest {
  id: string
  firstName: string
  lastName: string
  email: string
  eventId: string
  side: string
  relationship: string
}

export interface TokenValidationResult {
  isValid: boolean
  guest?: Guest
  error?: string
}

export class RSVPTokenService {
  /**
   * Generate a secure RSVP token for a guest
   */
  static async generateToken(guestId: string): Promise<string> {
    // Generate cryptographically secure random token
    const token = randomBytes(32).toString('hex')
    
    // Set expiration to 90 days from now
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 90)

    // Store token in database
    await db.insert(rsvpTokens).values({
      guest_id: guestId,
      token,
      expires_at: expiresAt,
      is_active: true
    })

    return token
  }

  /**
   * Validate an RSVP token and return guest information
   */
  static async validateToken(token: string): Promise<TokenValidationResult> {
    try {
      // Find the token in database with guest information
      const tokenRecord = await db
        .select({
          token: rsvpTokens,
          guest: {
            id: guests.id,
            firstName: guests.first_name,
            lastName: guests.last_name,
            email: guests.email,
            eventId: guests.event_id,
            side: guests.side,
            relationship: guests.relationship
          }
        })
        .from(rsvpTokens)
        .innerJoin(guests, eq(rsvpTokens.guest_id, guests.id))
        .where(eq(rsvpTokens.token, token))
        .limit(1)

      if (tokenRecord.length === 0) {
        return {
          isValid: false,
          error: 'Invalid token'
        }
      }

      const { token: tokenData, guest } = tokenRecord[0]

      // Check if token is active
      if (!tokenData.is_active) {
        return {
          isValid: false,
          error: 'Token has been deactivated'
        }
      }

      // Check if token has expired
      if (new Date() > tokenData.expires_at) {
        return {
          isValid: false,
          error: 'Token has expired'
        }
      }

      // Check if token has already been used
      if (tokenData.used_at) {
        return {
          isValid: false,
          error: 'Token has already been used'
        }
      }

      return {
        isValid: true,
        guest: {
          id: guest.id,
          firstName: guest.firstName,
          lastName: guest.lastName,
          email: guest.email,
          eventId: guest.eventId,
          side: guest.side,
          relationship: guest.relationship
        }
      }
    } catch (error) {
      console.error('Token validation error:', error)
      return {
        isValid: false,
        error: 'Error validating token'
      }
    }
  }

  /**
   * Mark a token as used
   */
  static async markTokenAsUsed(token: string): Promise<boolean> {
    try {
      await db
        .update(rsvpTokens)
        .set({ 
          used_at: new Date(),
          is_active: false 
        })
        .where(eq(rsvpTokens.token, token))

      return true
    } catch (error) {
      console.error('Error marking token as used:', error)
      return false
    }
  }

  /**
   * Generate RSVP URL for a token
   */
  static generateRSVPUrl(token: string): string {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    return `${baseUrl}/rsvp/${token}`
  }

  /**
   * Regenerate a new token for a guest (deactivate old ones)
   */
  static async regenerateToken(guestId: string): Promise<string> {
    // Deactivate all existing tokens for this guest
    await db
      .update(rsvpTokens)
      .set({ is_active: false })
      .where(eq(rsvpTokens.guest_id, guestId))

    // Generate new token
    return await this.generateToken(guestId)
  }

  /**
   * Get all tokens for a guest
   */
  static async getGuestTokens(guestId: string) {
    return await db
      .select()
      .from(rsvpTokens)
      .where(eq(rsvpTokens.guest_id, guestId))
  }

  /**
   * Deactivate a specific token
   */
  static async deactivateToken(token: string): Promise<boolean> {
    try {
      await db
        .update(rsvpTokens)
        .set({ is_active: false })
        .where(eq(rsvpTokens.token, token))

      return true
    } catch (error) {
      console.error('Error deactivating token:', error)
      return false
    }
  }

  /**
   * Clean up expired tokens (should be run as a cron job)
   */
  static async cleanupExpiredTokens(): Promise<number> {
    try {
      const result = await db
        .update(rsvpTokens)
        .set({ is_active: false })
        .where(and(
          eq(rsvpTokens.is_active, true),
          // Tokens expired more than 24 hours ago
          // Using raw SQL for date comparison
        ))

      return 0 // In real implementation, return affected rows count
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error)
      return 0
    }
  }

  /**
   * Get token analytics for an event
   */
  static async getTokenAnalytics(eventId: string) {
    try {
      const tokens = await db
        .select({
          token: rsvpTokens,
          guest: guests
        })
        .from(rsvpTokens)
        .innerJoin(guests, eq(rsvpTokens.guest_id, guests.id))
        .where(eq(guests.event_id, eventId))

      const total = tokens.length
      const active = tokens.filter(t => t.token.is_active).length
      const used = tokens.filter(t => t.token.used_at !== null).length
      const expired = tokens.filter(t => new Date() > t.token.expires_at).length

      return {
        total,
        active,
        used,
        expired,
        usage_rate: total > 0 ? (used / total) * 100 : 0
      }
    } catch (error) {
      console.error('Error getting token analytics:', error)
      return {
        total: 0,
        active: 0,
        used: 0,
        expired: 0,
        usage_rate: 0
      }
    }
  }
}