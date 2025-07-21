import { NextRequest } from 'next/server'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string // Custom key generator
}

interface RateLimitRecord {
  count: number
  resetTime: number
}

// In-memory store (in production, use Redis)
const store = new Map<string, RateLimitRecord>()

export class RateLimiter {
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  /**
   * Check if request is within rate limit
   */
  async checkLimit(req: NextRequest): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
    total: number
  }> {
    const key = this.generateKey(req)
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    // Get or create record
    let record = store.get(key)
    
    if (!record || record.resetTime <= now) {
      // Create new window
      record = {
        count: 1,
        resetTime: now + this.config.windowMs
      }
      store.set(key, record)
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: record.resetTime,
        total: this.config.maxRequests
      }
    }

    // Increment counter
    record.count++
    store.set(key, record)

    const allowed = record.count <= this.config.maxRequests
    const remaining = Math.max(0, this.config.maxRequests - record.count)

    return {
      allowed,
      remaining,
      resetTime: record.resetTime,
      total: this.config.maxRequests
    }
  }

  /**
   * Generate rate limit key
   */
  private generateKey(req: NextRequest): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(req)
    }

    // Default: use IP address
    const ip = this.getClientIP(req)
    return `rate_limit:${ip}`
  }

  /**
   * Get client IP address
   */
  private getClientIP(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for')
    const realIp = req.headers.get('x-real-ip')
    
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    
    if (realIp) {
      return realIp.trim()
    }

    return req.ip || 'unknown'
  }

  /**
   * Clean up expired records
   */
  static cleanup(): void {
    const now = Date.now()
    for (const [key, record] of store.entries()) {
      if (record.resetTime <= now) {
        store.delete(key)
      }
    }
  }
}

// Predefined rate limiters for different scenarios
export const rateLimiters = {
  // General API rate limit
  api: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100
  }),

  // Authentication endpoints (stricter)
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5
  }),

  // RSVP submissions (moderate)
  rsvp: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 3
  }),

  // Guest imports (very strict)
  import: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10
  }),

  // Password reset (strict)
  passwordReset: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    keyGenerator: (req) => {
      // Rate limit by email if provided in body
      const email = req.body?.email || req.url
      return `password_reset:${email}`
    }
  })
}

// Cleanup interval (run every 5 minutes)
if (typeof window === 'undefined') {
  setInterval(() => {
    RateLimiter.cleanup()
  }, 5 * 60 * 1000)
}