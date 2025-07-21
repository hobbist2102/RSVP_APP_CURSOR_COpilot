import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/utils'
import { eventService } from '@/lib/services/events'
import { eventStatsQuerySchema } from '@/lib/validations/events'

// GET /api/events/[id]/stats - Get event statistics
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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = {
      includeGuests: searchParams.get('includeGuests') === 'true',
      includeRsvp: searchParams.get('includeRsvp') === 'true',
      includeCeremonies: searchParams.get('includeCeremonies') === 'true',
      includeAccommodations: searchParams.get('includeAccommodations') === 'true',
    }

    // Validate query parameters
    const validatedQuery = eventStatsQuerySchema.parse(queryParams)

    const stats = await eventService.getEventStats(eventId)

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error getting event stats:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get event statistics',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}