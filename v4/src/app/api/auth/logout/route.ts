import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/auth/logout - Logout user
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: 'LOGOUT_FAILED'
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Logout failed',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}