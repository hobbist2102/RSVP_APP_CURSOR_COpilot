import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Public routes that don't require authentication
    const publicRoutes = [
      '/auth/login',
      '/auth/register', 
      '/auth/error',
      '/rsvp',
      '/api/auth',
      '/api/rsvp',
      '/api/system/health',
      '/',
    ]

    // Check if route is public
    const isPublicRoute = publicRoutes.some(route => 
      pathname.startsWith(route) || pathname === '/'
    )

    // Allow public routes
    if (isPublicRoute) {
      return NextResponse.next()
    }

    // Require authentication for protected routes
    if (!token) {
      const url = new URL('/auth/login', req.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }

    // Role-based access control
    const userRole = token.role as string

    // Admin-only routes
    if (pathname.startsWith('/admin') && userRole !== 'super_admin' && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // API route protection
    if (pathname.startsWith('/api/')) {
      // Admin API routes
      if (pathname.startsWith('/api/admin') && userRole !== 'super_admin' && userRole !== 'admin') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }

      // Event management API - require at least planner role
      if (pathname.startsWith('/api/events') && !['super_admin', 'admin', 'planner', 'couple'].includes(userRole)) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Public routes don't need authentication
        const publicRoutes = [
          '/auth/login',
          '/auth/register',
          '/auth/error',
          '/rsvp',
          '/api/auth',
          '/api/rsvp',
          '/api/system/health',
          '/',
        ]

        if (publicRoutes.some(route => pathname.startsWith(route) || pathname === '/')) {
          return true
        }

        // All other routes require authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}