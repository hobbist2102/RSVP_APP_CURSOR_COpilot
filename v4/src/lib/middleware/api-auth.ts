import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { User } from '@supabase/supabase-js'

export interface AuthenticatedRequest extends NextRequest {
  user?: User
  userId?: string
  rateLimitKey?: string
}

export interface ApiResponse {
  success: boolean
  data?: any
  error?: string
  code?: string
  message?: string
  details?: any
}

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export class ApiAuthMiddleware {
  private static readonly RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
  private static readonly DEFAULT_RATE_LIMIT = 100 // requests per minute
  
  // Rate limits by endpoint pattern
  private static readonly RATE_LIMITS = {
    '/api/auth/login': 5,
    '/api/auth/register': 3,
    '/api/auth/send-otp': 3,
    '/api/guests/import': 10,
    '/api/guests/export': 20,
    '/api/rsvp/reminders': 5,
    'default': 100
  }

  /**
   * Main authentication middleware
   */
  static async authenticate(
    request: NextRequest,
    options: {
      requireAuth?: boolean
      allowPublic?: boolean
      skipRateLimit?: boolean
    } = {}
  ): Promise<{ 
    user: User | null; 
    error: NextResponse | null; 
    rateLimitKey: string 
  }> {
    const { requireAuth = true, allowPublic = false, skipRateLimit = false } = options

    try {
      // Extract JWT token from request
      const authHeader = request.headers.get('authorization')
      const token = authHeader?.replace('Bearer ', '')

      // For public endpoints (like RSVP), token is optional
      if (!token && allowPublic) {
        const rateLimitKey = this.getRateLimitKey(request, null)
        const rateLimitError = skipRateLimit ? null : await this.checkRateLimit(request, rateLimitKey)
        return { user: null, error: rateLimitError, rateLimitKey }
      }

      // Require token for protected endpoints
      if (!token && requireAuth) {
        return {
          user: null,
          error: this.createErrorResponse(
            'Authentication required',
            'UNAUTHORIZED',
            401
          ),
          rateLimitKey: ''
        }
      }

      let user: User | null = null

      // Validate token if provided
      if (token) {
        const supabase = createClient()
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !authUser) {
          return {
            user: null,
            error: this.createErrorResponse(
              'Invalid or expired token',
              'TOKEN_INVALID',
              401
            ),
            rateLimitKey: ''
          }
        }

        user = authUser
      }

      // Rate limiting
      const rateLimitKey = this.getRateLimitKey(request, user)
      const rateLimitError = skipRateLimit ? null : await this.checkRateLimit(request, rateLimitKey)

      if (rateLimitError) {
        return { user, error: rateLimitError, rateLimitKey }
      }

      return { user, error: null, rateLimitKey }

    } catch (error) {
      console.error('Authentication middleware error:', error)
      return {
        user: null,
        error: this.createErrorResponse(
          'Authentication failed',
          'AUTH_ERROR',
          500
        ),
        rateLimitKey: ''
      }
    }
  }

  /**
   * Rate limiting check
   */
  private static async checkRateLimit(
    request: NextRequest,
    rateLimitKey: string
  ): Promise<NextResponse | null> {
    const now = Date.now()
    const windowStart = now - this.RATE_LIMIT_WINDOW

    // Clean expired entries
    for (const [key, data] of rateLimitStore.entries()) {
      if (data.resetTime < windowStart) {
        rateLimitStore.delete(key)
      }
    }

    // Get current count
    const current = rateLimitStore.get(rateLimitKey) || { count: 0, resetTime: now + this.RATE_LIMIT_WINDOW }

    // Determine rate limit for this endpoint
    const pathname = new URL(request.url).pathname
    const limit = this.getRateLimit(pathname)

    // Check if limit exceeded
    if (current.count >= limit) {
      const resetInSeconds = Math.ceil((current.resetTime - now) / 1000)
      
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
          details: {
            limit,
            remaining: 0,
            resetInSeconds
          }
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': current.resetTime.toString(),
            'Retry-After': resetInSeconds.toString()
          }
        }
      )
    }

    // Update count
    current.count++
    rateLimitStore.set(rateLimitKey, current)

    return null
  }

  /**
   * Get rate limit for specific endpoint
   */
  private static getRateLimit(pathname: string): number {
    for (const [pattern, limit] of Object.entries(this.RATE_LIMITS)) {
      if (pattern !== 'default' && pathname.includes(pattern)) {
        return limit
      }
    }
    return this.RATE_LIMITS.default
  }

  /**
   * Generate rate limit key
   */
  private static getRateLimitKey(request: NextRequest, user: User | null): string {
    // Use user ID if authenticated, otherwise use IP
    const identifier = user?.id || request.ip || 'unknown'
    const pathname = new URL(request.url).pathname
    return `${identifier}:${pathname}`
  }

  /**
   * Create standardized error response
   */
  private static createErrorResponse(
    error: string,
    code: string,
    status: number,
    details?: any
  ): NextResponse {
    const response: ApiResponse = {
      success: false,
      error,
      code,
      details
    }

    return NextResponse.json(response, { status })
  }

  /**
   * Create standardized success response
   */
  static createSuccessResponse(
    data: any,
    message?: string,
    status: number = 200
  ): NextResponse {
    const response: ApiResponse = {
      success: true,
      data,
      message
    }

    return NextResponse.json(response, { status })
  }

  /**
   * Wrapper for protected API routes
   */
  static withAuth(
    handler: (request: AuthenticatedRequest, context?: any) => Promise<NextResponse>,
    options: {
      requireAuth?: boolean
      allowPublic?: boolean
      skipRateLimit?: boolean
    } = {}
  ) {
    return async (request: NextRequest, context?: any): Promise<NextResponse> => {
      const { user, error, rateLimitKey } = await this.authenticate(request, options)

      if (error) {
        return error
      }

      // Extend request with auth info
      const authenticatedRequest = request as AuthenticatedRequest
      authenticatedRequest.user = user
      authenticatedRequest.userId = user?.id
      authenticatedRequest.rateLimitKey = rateLimitKey

      try {
        return await handler(authenticatedRequest, context)
      } catch (handlerError) {
        console.error('API handler error:', handlerError)
        return this.createErrorResponse(
          'Internal server error',
          'INTERNAL_ERROR',
          500
        )
      }
    }
  }

  /**
   * Add rate limit headers to response
   */
  static addRateLimitHeaders(
    response: NextResponse,
    rateLimitKey: string,
    pathname: string
  ): NextResponse {
    const limit = this.getRateLimit(pathname)
    const current = rateLimitStore.get(rateLimitKey)
    
    if (current) {
      response.headers.set('X-RateLimit-Limit', limit.toString())
      response.headers.set('X-RateLimit-Remaining', Math.max(0, limit - current.count).toString())
      response.headers.set('X-RateLimit-Reset', current.resetTime.toString())
    }

    return response
  }
}

// Helper function for existing code compatibility
export async function requireAuth(request?: NextRequest): Promise<User> {
  if (!request) {
    // Fallback to original implementation for server components
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      throw new Error('Authentication required')
    }

    return user
  }

  const { user, error } = await ApiAuthMiddleware.authenticate(request, { requireAuth: true })
  
  if (error || !user) {
    throw new Error('Authentication required')
  }

  return user
}

export type { ApiResponse, AuthenticatedRequest }