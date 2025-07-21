import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { forgotPasswordSchema, resetPasswordSchema } from '@/lib/validations/auth'
import { z } from 'zod'

// POST /api/auth/reset-password - Send password reset email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'send') {
      return await handleSendReset(body)
    } else if (action === 'confirm') {
      return await handleConfirmReset(body)
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid action. Use "send" or "confirm"'
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Password reset failed'
      },
      { status: 500 }
    )
  }
}

async function handleSendReset(body: any) {
  try {
    // Validate input
    const { email } = forgotPasswordSchema.parse(body)

    const supabase = createClient()

    // Check if user exists
    const { data: existingUser, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single()

    if (userError && userError.code !== 'PGRST116') {
      console.error('User lookup error:', userError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to verify user'
        },
        { status: 500 }
      )
    }

    if (!existingUser) {
      // Don't reveal that user doesn't exist for security
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.'
      })
    }

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    })

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent! Please check your email.'
    })
  } catch (error) {
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

    throw error
  }
}

async function handleConfirmReset(body: any) {
  try {
    // Validate input
    const { password, confirmPassword } = resetPasswordSchema.parse(body)

    const supabase = createClient()

    // Get the current user (should be authenticated via reset token)
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired reset token'
        },
        { status: 400 }
      )
    }

    // Update password
    const { error } = await supabase.auth.updateUser({
      password
    })

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully! You can now log in with your new password.'
    })
  } catch (error) {
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

    throw error
  }
}