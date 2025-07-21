import { NextRequest, NextResponse } from 'next/server'
import { getUser, getUserProfile } from '@/lib/auth/utils'

// GET /api/auth/user - Get current authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await getUser()

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not authenticated'
        },
        { status: 401 }
      )
    }

    // Get user profile
    const profile = await getUserProfile(user.id)

    return NextResponse.json({
      success: true,
      data: {
        user,
        profile
      }
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user'
      },
      { status: 500 }
    )
  }
}