import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/utils'
import { eventService } from '@/lib/services/events'
import { updateEventSchema } from '@/lib/validations/events'
import { z } from 'zod'

// GET /api/events/[id] - Get individual event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    
    const eventId = parseInt(params.id)
    if (isNaN(eventId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid event ID',
          code: 'INVALID_INPUT'
        },
        { status: 400 }
      )
    }

    const event = await eventService.getEvent(eventId)

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: 'Event not found',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: event
    })
  } catch (error) {
    console.error('Error getting event:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get event',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

// PUT /api/events/[id] - Update individual event
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    
    const eventId = parseInt(params.id)
    if (isNaN(eventId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid event ID',
          code: 'INVALID_INPUT'
        },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = updateEventSchema.parse(body)

    const updatedEvent = await eventService.updateEvent(eventId, validatedData)

    return NextResponse.json({
      success: true,
      data: updatedEvent,
      message: 'Event updated successfully'
    })
  } catch (error) {
    console.error('Error updating event:', error)
    
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
        error: error instanceof Error ? error.message : 'Failed to update event',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/events/[id] - Delete individual event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    
    const eventId = parseInt(params.id)
    if (isNaN(eventId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid event ID',
          code: 'INVALID_INPUT'
        },
        { status: 400 }
      )
    }

    await eventService.deleteEvent(eventId)

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete event',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}