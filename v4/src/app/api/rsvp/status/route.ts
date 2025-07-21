import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/utils'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const rsvpStatusQuerySchema = z.object({
  eventId: z.number().min(1).optional(),
  status: z.enum(['pending', 'confirmed', 'declined']).optional(),
  includeDetails: z.boolean().default(false),
  includeStatistics: z.boolean().default(true),
})

// GET /api/rsvp/status - Get RSVP status tracking for events
export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())

    // Parse parameters
    if (queryParams.eventId) queryParams.eventId = parseInt(queryParams.eventId)
    ['includeDetails', 'includeStatistics'].forEach(field => {
      if (queryParams[field] !== undefined) {
        queryParams[field] = queryParams[field] === 'true'
      }
    })

    const validatedQuery = rsvpStatusQuerySchema.parse(queryParams)

    const supabase = createClient()

    // Build query for RSVP status tracking
    let query = supabase
      .from('guests')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        side,
        relationship,
        rsvp_status,
        rsvp_date,
        plus_one_allowed,
        plus_one_confirmed,
        plus_one_name,
        children_details,
        created_at,
        updated_at,
        wedding_events (
          id,
          title,
          couple_names,
          start_date,
          end_date,
          rsvp_deadline
        )
        ${validatedQuery.includeDetails ? `,
        guest_ceremonies (
          ceremony_id,
          attending,
          ceremonies (
            id,
            name,
            date,
            start_time
          )
        )` : ''}
      `)

    // Apply filters
    if (validatedQuery.eventId) {
      query = query.eq('event_id', validatedQuery.eventId)
    }

    if (validatedQuery.status) {
      query = query.eq('rsvp_status', validatedQuery.status)
    }

    // Order by RSVP date and name
    query = query.order('rsvp_date', { ascending: false, nullsLast: true })
    query = query.order('first_name', { ascending: true })

    const { data: guests, error } = await query

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to get RSVP status: ${error.message}`,
          code: 'QUERY_FAILED'
        },
        { status: 500 }
      )
    }

    // Calculate statistics if requested
    let statistics = null
    if (validatedQuery.includeStatistics && guests) {
      const totalGuests = guests.length
      const confirmedGuests = guests.filter(g => g.rsvp_status === 'confirmed')
      const declinedGuests = guests.filter(g => g.rsvp_status === 'declined')
      const pendingGuests = guests.filter(g => g.rsvp_status === 'pending')

      // Calculate attendance numbers
      const totalAttending = confirmedGuests.length
      const plusOnesAttending = confirmedGuests.filter(g => g.plus_one_confirmed).length
      const childrenAttending = confirmedGuests.reduce((sum, g) => 
        sum + (g.children_details?.length || 0), 0)

      // Response rate calculations
      const responseRate = totalGuests > 0 ? 
        Math.round(((confirmedGuests.length + declinedGuests.length) / totalGuests) * 100) : 0
      const confirmationRate = totalGuests > 0 ? 
        Math.round((confirmedGuests.length / totalGuests) * 100) : 0

      // Timeline analysis
      const now = new Date()
      const recentResponses = guests.filter(g => {
        if (!g.rsvp_date) return false
        const rsvpDate = new Date(g.rsvp_date)
        const daysDiff = (now.getTime() - rsvpDate.getTime()) / (1000 * 60 * 60 * 24)
        return daysDiff <= 7 // Last 7 days
      }).length

      // Event-specific statistics
      const eventStats = guests.reduce((acc, guest) => {
        const eventId = guest.wedding_events?.id
        if (!eventId) return acc

        if (!acc[eventId]) {
          acc[eventId] = {
            eventId,
            eventTitle: guest.wedding_events?.title,
            total: 0,
            confirmed: 0,
            declined: 0,
            pending: 0,
            deadline: guest.wedding_events?.rsvp_deadline
          }
        }

        acc[eventId].total++
        acc[eventId][guest.rsvp_status]++
        return acc
      }, {} as Record<number, any>)

      statistics = {
        overview: {
          totalGuests,
          totalAttending: totalAttending + plusOnesAttending + childrenAttending,
          guestsAttending: totalAttending,
          plusOnesAttending,
          childrenAttending,
          responseRate,
          confirmationRate,
          recentResponses
        },
        breakdown: {
          confirmed: confirmedGuests.length,
          declined: declinedGuests.length,
          pending: pendingGuests.length
        },
        byEvent: Object.values(eventStats),
        lastUpdated: new Date().toISOString()
      }
    }

    // Transform guest data for response
    const transformedGuests = guests?.map(guest => ({
      id: guest.id,
      firstName: guest.first_name,
      lastName: guest.last_name,
      email: guest.email,
      phone: guest.phone,
      side: guest.side,
      relationship: guest.relationship,
      rsvpStatus: guest.rsvp_status,
      rsvpDate: guest.rsvp_date,
      plusOneAllowed: guest.plus_one_allowed,
      plusOneConfirmed: guest.plus_one_confirmed,
      plusOneName: guest.plus_one_name,
      childrenCount: guest.children_details?.length || 0,
      event: guest.wedding_events ? {
        id: guest.wedding_events.id,
        title: guest.wedding_events.title,
        coupleNames: guest.wedding_events.couple_names,
        startDate: guest.wedding_events.start_date,
        rsvpDeadline: guest.wedding_events.rsvp_deadline
      } : null,
      ceremonies: validatedQuery.includeDetails ? guest.guest_ceremonies : undefined,
      createdAt: guest.created_at,
      updatedAt: guest.updated_at
    }))

    return NextResponse.json({
      success: true,
      data: {
        guests: transformedGuests || [],
        statistics,
        filters: validatedQuery
      }
    })

  } catch (error) {
    console.error('Error getting RSVP status:', error)
    
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
        error: error instanceof Error ? error.message : 'Failed to get RSVP status',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}