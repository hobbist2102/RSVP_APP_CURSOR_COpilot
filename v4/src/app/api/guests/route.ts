import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/utils'
import { createClient } from '@/lib/supabase/server'
import { createGuestSchema, guestSearchSchema } from '@/lib/validations/guests'
import { generateRsvpToken } from '@/lib/auth/utils'
import { z } from 'zod'

// GET /api/guests - Get all guests with search/filter
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

    let query = supabase
      .from('guests')
      .select(`
        *,
        guest_ceremonies (
          ceremony_id,
          attending,
          meal_preference,
          ceremonies (
            id,
            name,
            date,
            start_time
          )
        )
      `)

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

    // Text search
    if (validatedQuery.query) {
      query = query.or(`first_name.ilike.%${validatedQuery.query}%,last_name.ilike.%${validatedQuery.query}%,email.ilike.%${validatedQuery.query}%`)
    }

    // Sorting
    const sortColumn = validatedQuery.sortBy === 'firstName' ? 'first_name' : 
                      validatedQuery.sortBy === 'lastName' ? 'last_name' :
                      validatedQuery.sortBy === 'createdAt' ? 'created_at' :
                      validatedQuery.sortBy === 'rsvpDate' ? 'rsvp_date' : 'first_name'

    query = query.order(sortColumn, { ascending: validatedQuery.sortOrder === 'asc' })

    // Pagination
    const offset = (validatedQuery.page - 1) * validatedQuery.limit
    query = query.range(offset, offset + validatedQuery.limit - 1)

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Failed to get guests: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      meta: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / validatedQuery.limit)
      }
    })
  } catch (error) {
    console.error('Error getting guests:', error)
    
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
        error: error instanceof Error ? error.message : 'Failed to get guests',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

// POST /api/guests - Create new guest
export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()
    const validatedData = createGuestSchema.parse(body)

    const supabase = createClient()

    // Generate RSVP token
    const rsvpToken = generateRsvpToken()

    const { data, error } = await supabase
      .from('guests')
      .insert({
        event_id: validatedData.eventId,
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        country_code: validatedData.countryCode,
        side: validatedData.side,
        relationship: validatedData.relationship,
        is_family: validatedData.isFamily,
        is_vip: validatedData.isVip,
        rsvp_status: validatedData.rsvpStatus,
        rsvp_token: rsvpToken,
        plus_one_allowed: validatedData.plusOneAllowed,
        plus_one_name: validatedData.plusOneName,
        plus_one_email: validatedData.plusOneEmail,
        plus_one_phone: validatedData.plusOnePhone,
        plus_one_relationship: validatedData.plusOneRelationship,
        dietary_restrictions: validatedData.dietaryRestrictions,
        allergies: validatedData.allergies,
        special_requests: validatedData.specialRequests,
        children_details: validatedData.childrenDetails,
        needs_accommodation: validatedData.needsAccommodation,
        accommodation_preference: validatedData.accommodationPreference,
        needs_flight_assistance: validatedData.needsFlightAssistance,
        arrival_date: validatedData.arrivalDate,
        departure_date: validatedData.departureDate,
        notes: validatedData.notes,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create guest: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Guest created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating guest:', error)
    
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
        error: error instanceof Error ? error.message : 'Failed to create guest',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}