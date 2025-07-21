import { NextRequest, NextResponse } from 'next/server'
import { getUser, getUserProfile } from '@/lib/auth/utils'
import { userManagement } from '@/lib/auth/user-management'
import { profileUpdateSchema } from '@/lib/validations/auth'
import { z } from 'zod'

// GET /api/auth/profile - Get current authenticated user profile
export async function GET(request: NextRequest) {
  try {
    const user = await getUser()

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not authenticated',
          code: 'UNAUTHORIZED'
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
        error: error instanceof Error ? error.message : 'Failed to get user profile',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

// PUT /api/auth/profile - Update current user profile
export async function PUT(request: NextRequest) {
  try {
    const user = await getUser()

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not authenticated',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = profileUpdateSchema.parse(body)

    // Update profile using user management service
    const updatedProfile = await userManagement.updateUserProfile(user.id, validatedData)

    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully'
    })
  } catch (error) {
    console.error('Update profile error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}