import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { registerSchema } from '@/lib/validations/auth'
import { z } from 'zod'

// POST /api/auth/register - Register new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = registerSchema.parse(body)

    const supabase = createClient()

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          name: validatedData.name,
          role: validatedData.role,
          phone: validatedData.phone,
          company: validatedData.company,
        }
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

    if (!data.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Registration failed'
        },
        { status: 400 }
      )
    }

    // Check if profile was created by trigger
    let profile = null
    if (data.user.id) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile fetch error:', profileError)
      } else {
        profile = profileData
      }

      // If profile wasn't created by trigger, create it manually
      if (!profile) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name: validatedData.name,
            email: validatedData.email,
            role: validatedData.role || 'staff',
            phone: validatedData.phone,
            company: validatedData.company,
          })
          .select()
          .single()

        if (createError) {
          console.error('Manual profile creation error:', createError)
          // Don't fail registration if profile creation fails
        } else {
          profile = newProfile
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        user: data.user,
        profile,
        session: data.session,
        message: data.user.email_confirmed_at 
          ? 'Registration successful! You can now log in.'
          : 'Registration successful! Please check your email to confirm your account.'
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    
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
        error: error instanceof Error ? error.message : 'Registration failed'
      },
      { status: 500 }
    )
  }
}