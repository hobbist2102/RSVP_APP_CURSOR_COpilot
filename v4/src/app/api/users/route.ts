import { NextRequest, NextResponse } from 'next/server'
import { getUser, requireAdmin } from '@/lib/auth/utils'
import { userManagement } from '@/lib/auth/user-management'
import { registerSchema } from '@/lib/validations/auth'
import { z } from 'zod'

// GET /api/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const users = await userManagement.getAllUsers()

    return NextResponse.json({
      success: true,
      data: users
    })
  } catch (error) {
    console.error('Error getting users:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get users'
      },
      { status: 500 }
    )
  }
}

// POST /api/users - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    
    // Validate input
    const validatedData = registerSchema.parse(body)

    const result = await userManagement.createUser({
      email: validatedData.email,
      password: validatedData.password,
      name: validatedData.name,
      role: validatedData.role,
      phone: validatedData.phone,
      company: validatedData.company,
    })

    return NextResponse.json({
      success: true,
      data: {
        user: result.user,
        profile: result.profile
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    
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
        error: error instanceof Error ? error.message : 'Failed to create user'
      },
      { status: 500 }
    )
  }
}