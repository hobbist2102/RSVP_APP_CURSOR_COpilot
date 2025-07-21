import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/utils'
import { createClient } from '@/lib/supabase/server'
import { guestSearchSchema } from '@/lib/validations/guests'
import { z } from 'zod'

// GET /api/guests/search - Advanced guest search with comprehensive filters
export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    // Parse numeric fields
    if (queryParams.eventId) queryParams.eventId = parseInt(queryParams.eventId)
    if (queryParams.page) queryParams.page = parseInt(queryParams.page)
    if (queryParams.limit) queryParams.limit = parseInt(queryParams.limit)
    
    // Parse boolean fields
    ['isFamily', 'isVip', 'needsAccommodation', 'needsFlightAssistance', 'hasEmail', 'hasPhone', 'plusOneAllowed', 'plusOneConfirmed'].forEach(field => {
      if (queryParams[field] !== undefined) {
        queryParams[field] = queryParams[field] === 'true'
      }
    })

    const validatedQuery = guestSearchSchema.parse(queryParams)

    const supabase = createClient()

    // Build comprehensive query with relationships
    let query = supabase
      .from('guests')
      .select(`
        *,
        guest_ceremonies (
          ceremony_id,
          attending,
          meal_preference,
          special_dietary_needs,
          ceremonies (
            id,
            name,
            date,
            start_time,
            location
          )
        ),
        family_relationships_primary:family_relationships!family_relationships_primary_guest_id_fkey (
          id,
          relationship,
          description,
          related_guest:guests!family_relationships_related_guest_id_fkey (
            id,
            first_name,
            last_name
          )
        ),
        family_relationships_related:family_relationships!family_relationships_related_guest_id_fkey (
          id,
          relationship,
          description,
          primary_guest:guests!family_relationships_primary_guest_id_fkey (
            id,
            first_name,
            last_name
          )
        )
      `, { count: 'exact' })

    // Apply filters
    if (validatedQuery.eventId) {
      query = query.eq('event_id', validatedQuery.eventId)
    }
    
    if (validatedQuery.side) {
      query = query.eq('side', validatedQuery.side)
    }
    
    if (validatedQuery.rsvpStatus) {
      query = query.eq('rsvp_status', validatedQuery.rsvpStatus)
    }
    
    if (validatedQuery.isFamily !== undefined) {
      query = query.eq('is_family', validatedQuery.isFamily)
    }
    
    if (validatedQuery.isVip !== undefined) {
      query = query.eq('is_vip', validatedQuery.isVip)
    }
    
    if (validatedQuery.needsAccommodation !== undefined) {
      query = query.eq('needs_accommodation', validatedQuery.needsAccommodation)
    }
    
    if (validatedQuery.needsFlightAssistance !== undefined) {
      query = query.eq('needs_flight_assistance', validatedQuery.needsFlightAssistance)
    }
    
    if (validatedQuery.hasEmail !== undefined) {
      if (validatedQuery.hasEmail) {
        query = query.not('email', 'is', null)
      } else {
        query = query.is('email', null)
      }
    }
    
    if (validatedQuery.hasPhone !== undefined) {
      if (validatedQuery.hasPhone) {
        query = query.not('phone', 'is', null)
      } else {
        query = query.is('phone', null)
      }
    }
    
    if (validatedQuery.plusOneAllowed !== undefined) {
      query = query.eq('plus_one_allowed', validatedQuery.plusOneAllowed)
    }
    
    if (validatedQuery.plusOneConfirmed !== undefined) {
      query = query.eq('plus_one_confirmed', validatedQuery.plusOneConfirmed)
    }

    // Advanced text search across multiple fields
    if (validatedQuery.query) {
      const searchTerm = validatedQuery.query.trim()
      query = query.or(`
        first_name.ilike.%${searchTerm}%,
        last_name.ilike.%${searchTerm}%,
        email.ilike.%${searchTerm}%,
        phone.ilike.%${searchTerm}%,
        relationship.ilike.%${searchTerm}%,
        plus_one_name.ilike.%${searchTerm}%,
        plus_one_email.ilike.%${searchTerm}%,
        notes.ilike.%${searchTerm}%
      `)
    }

    // Sorting
    const sortColumn = validatedQuery.sortBy === 'firstName' ? 'first_name' : 
                      validatedQuery.sortBy === 'lastName' ? 'last_name' :
                      validatedQuery.sortBy === 'createdAt' ? 'created_at' :
                      validatedQuery.sortBy === 'rsvpDate' ? 'rsvp_date' : 'first_name'

    query = query.order(sortColumn, { ascending: validatedQuery.sortOrder === 'asc' })

    // Add secondary sort by last name if not already sorting by it
    if (validatedQuery.sortBy !== 'lastName') {
      query = query.order('last_name', { ascending: true })
    }

    // Pagination
    const offset = (validatedQuery.page - 1) * validatedQuery.limit
    query = query.range(offset, offset + validatedQuery.limit - 1)

    const { data: guests, error, count } = await query

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to search guests: ${error.message}`,
          code: 'SEARCH_FAILED'
        },
        { status: 500 }
      )
    }

    // Transform data to include aggregated family relationships
    const enrichedGuests = (guests || []).map(guest => {
      // Combine family relationships from both directions
      const familyRelationships = [
        ...(guest.family_relationships_primary || []).map((rel: any) => ({
          id: rel.id,
          relationship: rel.relationship,
          description: rel.description,
          relatedGuest: rel.related_guest,
          isPrimary: true
        })),
        ...(guest.family_relationships_related || []).map((rel: any) => ({
          id: rel.id,
          relationship: rel.relationship,
          description: rel.description,
          relatedGuest: rel.primary_guest,
          isPrimary: false
        }))
      ]

      // Calculate RSVP summary
      const ceremonyCount = guest.guest_ceremonies?.length || 0
      const attendingCeremonies = guest.guest_ceremonies?.filter((gc: any) => gc.attending).length || 0
      
      return {
        ...guest,
        familyRelationships,
        familyMemberCount: familyRelationships.length,
        rsvpSummary: {
          status: guest.rsvp_status,
          ceremonyCount,
          attendingCeremonies,
          hasPlusOne: guest.plus_one_allowed,
          plusOneConfirmed: guest.plus_one_confirmed,
          childrenCount: guest.children_details?.length || 0
        },
        // Remove the raw relationship data to keep response clean
        family_relationships_primary: undefined,
        family_relationships_related: undefined
      }
    })

    // Calculate search statistics
    const stats = {
      total: count || 0,
      returned: enrichedGuests.length,
      page: validatedQuery.page,
      limit: validatedQuery.limit,
      totalPages: Math.ceil((count || 0) / validatedQuery.limit),
      rsvpBreakdown: {
        confirmed: enrichedGuests.filter(g => g.rsvp_status === 'confirmed').length,
        pending: enrichedGuests.filter(g => g.rsvp_status === 'pending').length,
        declined: enrichedGuests.filter(g => g.rsvp_status === 'declined').length
      },
      familyMembers: enrichedGuests.filter(g => g.is_family).length,
      vipGuests: enrichedGuests.filter(g => g.is_vip).length,
      withEmail: enrichedGuests.filter(g => g.email).length,
      withPhone: enrichedGuests.filter(g => g.phone).length,
      needAccommodation: enrichedGuests.filter(g => g.needs_accommodation).length
    }

    return NextResponse.json({
      success: true,
      data: enrichedGuests,
      meta: stats,
      searchQuery: validatedQuery
    })

  } catch (error) {
    console.error('Error searching guests:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Search validation failed',
          code: 'VALIDATION_ERROR',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search guests',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}