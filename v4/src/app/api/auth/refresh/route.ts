import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/auth/refresh - Refresh JWT token
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      return NextResponse.json(
        {
          success: false,
          error: sessionError.message,
          code: 'SESSION_ERROR'
        },
        { status: 400 }
      )
    }

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'No active session found',
          code: 'NO_SESSION'
        },
        { status: 401 }
      )
    }

    // Refresh the session
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: session.refresh_token
    })

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: 'REFRESH_FAILED'
        },
        { status: 400 }
      )
    }

    if (!data.session || !data.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token refresh failed',
          code: 'REFRESH_FAILED'
        },
        { status: 400 }
      )
    }

    // Get updated user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
    }

    return NextResponse.json({
      success: true,
      data: {
        user: data.user,
        profile,
        session: data.session
      },
      message: 'Token refreshed successfully'
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Token refresh failed',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}