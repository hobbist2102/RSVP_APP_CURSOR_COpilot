import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { guests, rsvpResponses } from '@/lib/db/schema'
import { RSVPTokenService } from '@/lib/services/rsvp-tokens'
import { RsvpStage1Schema, RsvpStage2Schema } from '@/lib/validations/schemas'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const SubmitRSVPSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  stage: z.number().min(1).max(2),
  data: z.record(z.any())
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, stage, data } = SubmitRSVPSchema.parse(body)

    // Validate token first
    const tokenResult = await RSVPTokenService.validateToken(token)
    if (!tokenResult.isValid || !tokenResult.guest) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired RSVP token'
      }, { status: 400 })
    }

    const guest = tokenResult.guest

    // Validate stage-specific data
    let validatedData
    if (stage === 1) {
      validatedData = RsvpStage1Schema.parse(data)
    } else if (stage === 2) {
      validatedData = RsvpStage2Schema.parse(data)
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid stage number'
      }, { status: 400 })
    }

    // Get client IP and user agent for tracking
    const ip = request.headers.get('x-forwarded-for') || 
      request.headers.get('x-real-ip') || 
      'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Update guest status based on stage 1 response
    if (stage === 1) {
      await db.update(guests)
        .set({
          rsvp_status: (validatedData as any).attending ? 'attending' : 'not_attending',
          updated_at: new Date()
        })
        .where(eq(guests.id, guest.id))
    }

    // Store RSVP response
    await db.insert(rsvpResponses).values({
      guest_id: guest.id,
      event_id: guest.eventId,
      stage,
      response_data: JSON.stringify(validatedData),
      ip_address: ip,
      user_agent: userAgent,
      submitted_at: new Date()
    })

    // Mark token as used if this is the final stage
    if (stage === 2 || (stage === 1 && !(validatedData as any).attending)) {
      await RSVPTokenService.markTokenAsUsed(token)
    }

    // Determine next step
    const nextStep = stage === 1 && (validatedData as any).attending ? 'stage2' : 'complete'

    return NextResponse.json({
      success: true,
      data: {
        message: 'RSVP submitted successfully',
        nextStep,
        guest: {
          id: guest.id,
          firstName: guest.firstName,
          lastName: guest.lastName
        }
      }
    })

  } catch (error) {
    console.error('RSVP submission error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid RSVP data',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to submit RSVP'
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
    // Validate token and get guest info
    const tokenResult = await RSVPTokenService.validateToken(token)
    if (!tokenResult.isValid || !tokenResult.guest) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired RSVP token'
      }, { status: 400 })
    }

    const guest = tokenResult.guest

    // Get existing RSVP responses
    const responses = await db.select()
      .from(rsvpResponses)
      .where(eq(rsvpResponses.guest_id, guest.id))

    const existingResponses = responses.reduce((acc, response) => {
      acc[`stage${response.stage}`] = JSON.parse(response.response_data)
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({
      success: true,
      data: {
        guest,
        existingResponses,
        hasStage1: !!existingResponses.stage1,
        hasStage2: !!existingResponses.stage2
      }
    })

  } catch (error) {
    console.error('RSVP data retrieval error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve RSVP data'
    }, { status: 500 })
  }
}