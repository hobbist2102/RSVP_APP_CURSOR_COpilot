import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, otpSchema } from '@/lib/validations/auth'
import { z } from 'zod'

// POST /api/auth/login - Login with email/password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { loginType } = body

    if (loginType === 'otp') {
      return await handleOtpLogin(body)
    } else {
      return await handlePasswordLogin(body)
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      },
      { status: 500 }
    )
  }
}

async function handlePasswordLogin(body: any) {
  try {
    // Validate input
    const { email, password } = loginSchema.parse(body)

    const supabase = createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
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

    if (!data.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication failed'
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
      // Don't fail the login if profile fetch fails
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
      }
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

async function handleOtpLogin(body: any) {
  try {
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
          error: error.message
        },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'OTP verification failed'
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
      }
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