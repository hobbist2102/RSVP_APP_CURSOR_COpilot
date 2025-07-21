import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/utils'
import { eventService } from '@/lib/services/events'

// GET /api/events/[id]/guests - Get guests for specific event
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

    // Verify user has access to this event (RLS will handle this)
    const event = await eventService.getEvent(eventId)
    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: 'Event not found or access denied',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      )
    }

    const guests = await eventService.getEventGuests(eventId)

    return NextResponse.json({
      success: true,
      data: guests
    })
  } catch (error) {
    console.error('Error getting event guests:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get event guests',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}