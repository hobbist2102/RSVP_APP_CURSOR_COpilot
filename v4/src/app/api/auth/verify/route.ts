import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { otpSchema } from '@/lib/validations/auth'
import { z } from 'zod'

// POST /api/auth/verify - Verify OTP token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const { email, token } = otpSchema.parse(body)

    const supabase = createClient()

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    })

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: 'OTP_VERIFICATION_FAILED'
        },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'OTP verification failed',
          code: 'INVALID_OTP'
        },
        { status: 400 }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
    }

    // Update last login
    if (profile) {
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id)
    }

    return NextResponse.json({
      success: true,
      data: {
        user: data.user,
        profile,
        session: data.session
      },
      message: 'OTP verified successfully'
    })
  } catch (error) {
    console.error('OTP verification error:', error)
    
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
        error: error instanceof Error ? error.message : 'OTP verification failed',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}