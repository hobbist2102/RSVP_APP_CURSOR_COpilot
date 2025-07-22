import { NextRequest, NextResponse } from 'next/server'
import { RSVPTokenService } from '@/lib/services/rsvp-tokens'
import { z } from 'zod'

const ValidateTokenSchema = z.object({
  token: z.string().min(1, 'Token is required')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = ValidateTokenSchema.parse(body)

    const result = await RSVPTokenService.validateToken(token)

    if (!result.isValid) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: {
        guest: result.guest,
        isValid: result.isValid
      }
    })
  } catch (error) {
    console.error('RSVP validation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({
      success: false,
      error: 'Token parameter is required'
    }, { status: 400 })
  }

  try {
    const result = await RSVPTokenService.validateToken(token)

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('RSVP validation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}