import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const sendOtpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

// POST /api/auth/send-otp - Send OTP to email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const { email } = sendOtpSchema.parse(body)

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
      return NextResponse.json(
        {
          success: false,
          error: 'No account found with this email address'
        },
        { status: 404 }
      )
    }

    // Send OTP
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      }
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
      message: 'OTP sent successfully! Please check your email.'
    })
  } catch (error) {
    console.error('Send OTP error:', error)
    
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
        error: error instanceof Error ? error.message : 'Failed to send OTP'
      },
      { status: 500 }
    )
  }
}