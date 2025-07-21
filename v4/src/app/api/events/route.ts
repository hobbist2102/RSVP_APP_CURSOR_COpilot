import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/utils'
import { eventService } from '@/lib/services/events'
import { createEventSchema } from '@/lib/validations/events'
import { z } from 'zod'

// GET /api/events - Get all events for current user
export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const events = await eventService.getUserEvents()

    return NextResponse.json({
      success: true,
      data: events
    })
  } catch (error) {
    console.error('Error getting events:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get events',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

// POST /api/events - Create new event
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    const body = await request.json()
    
    // Validate input
    const validatedData = createEventSchema.parse(body)

    const event = await eventService.createEvent(validatedData, user.id)

    return NextResponse.json({
      success: true,
      data: event,
      message: 'Event created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    
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
        error: error instanceof Error ? error.message : 'Failed to create event',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}