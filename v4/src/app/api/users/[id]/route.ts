import { NextRequest, NextResponse } from 'next/server'
import { getUser, requireAuth, requireAdmin } from '@/lib/auth/utils'
import { userManagement } from '@/lib/auth/user-management'
import { profileUpdateSchema } from '@/lib/validations/auth'
import { z } from 'zod'

// GET /api/users/[id] - Get user profile
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await requireAuth()
    const { id: userId } = params

    // Users can view their own profile, admins can view any profile
    if (currentUser.id !== userId) {
      await requireAdmin()
    }

    const profile = await userManagement.getUserProfile(userId)

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: profile
    })
  } catch (error) {
    console.error('Error getting user profile:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user profile'
      },
      { status: 500 }
    )
  }
}

// PATCH /api/users/[id] - Update user profile
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await requireAuth()
    const { id: userId } = params

    // Users can update their own profile, admins can update any profile
    if (currentUser.id !== userId) {
      await requireAdmin()
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = profileUpdateSchema.parse(body)

    const updatedProfile = await userManagement.updateUserProfile(userId, validatedData)

    return NextResponse.json({
      success: true,
      data: updatedProfile
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user profile'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - Delete user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const { id: userId } = params

    await userManagement.deleteUser(userId)

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete user'
      },
      { status: 500 }
    )
  }
}